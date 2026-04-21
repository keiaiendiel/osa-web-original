#!/usr/bin/env node
/*
 * sync-drive-aktuality.mjs
 *
 * Pulls Google Docs from a shared Drive folder and writes them into
 * src/content/aktuality/<slug>.mdx so the OSA editorial pipeline stays
 * "client writes a doc → site rebuilds" without ever touching git directly.
 *
 * Run from GitHub Action, not locally (requires service account credentials).
 *
 * Required environment variables:
 *   GOOGLE_SERVICE_ACCOUNT   stringified JSON for the service account key
 *   DRIVE_FOLDER_ID          ID of the shared "OSA Aktuality" folder
 *
 * Per-doc metadata is read from Google Docs properties (File → Document details):
 *   Title        →  frontmatter `title`
 *   Description  →  key: value lines, one per line. Recognized keys:
 *                     lead, date (YYYY-MM-DD), author, tags (comma-separated),
 *                     hero_alt, draft (true/false), slug
 *                   Lines starting with "#" are ignored (comments).
 *
 * The script:
 *   1. Lists Google Docs in the folder (mime = application/vnd.google-apps.document).
 *   2. Exports each as Markdown via Drive API.
 *   3. Parses frontmatter keys from the Doc description.
 *   4. Downloads the first inline image as /public/images/aktuality/<slug>.jpg
 *      (sharp resizes to 1600px wide, quality 82).
 *   5. Normalizes smart characters so the editorial linter stays green.
 *   6. Writes src/content/aktuality/<slug>.mdx.
 *
 * Docs marked `draft: true` in the description produce MDX with `draft: true`
 * in frontmatter, which the index page filters out.
 */

import { google } from 'googleapis';
import sharp from 'sharp';
import { mkdir, writeFile, readFile, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CONTENT_DIR = resolve(ROOT, 'src/content/aktuality');
const IMAGES_DIR = resolve(ROOT, 'public/images/aktuality');

// --- Auth ---------------------------------------------------------------

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT env var (service account JSON).');
  }
  let creds;
  try {
    creds = JSON.parse(raw);
  } catch (err) {
    throw new Error(`GOOGLE_SERVICE_ACCOUNT is not valid JSON: ${err.message}`);
  }
  return new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
}

// --- Editorial normalization -------------------------------------------

/**
 * Editorial normalization for Google Docs → MDX.
 *
 * Goal: every article reads as if it came off the same typewriter. Docs
 * users inevitably produce inconsistent input (random font runs, double
 * spaces, five-enter paragraph breaks, smart quotes, stray HTML spans,
 * mixed heading levels). This function is intentionally opinionated:
 * sanitize first, ask later.
 *
 * Order matters. Entity decoding runs before character normalization so
 * `&mdash;` becomes `—` becomes `, ` (not `&mdash;` → `, ` via one
 * fragile rule). Code-fence content is preserved by a line-aware pass.
 *
 * The lint rulebook (scripts/lint-editorial.mjs) forbids:
 *   - em-dash (—) and en-dash (–)
 *   - smart quotes of all flavours
 *   - ellipsis (…) outside the hero motto
 *   - `!` in body copy
 *   - passive voice, legalese, marketing hype (not auto-fixable)
 *
 * We auto-fix the first three. `!` in body triggers draft:true via
 * bodyContainsBang() so the article lands in the PR but is hidden from
 * the index page until a human opens the MDX and replaces the `!`.
 */
function normalize(input) {
  let out = String(input ?? '');

  // ---- Entities → characters -------------------------------------------
  // Drive's markdown export rarely emits HTML entities, but the HTML
  // intermediate pass can leak them. Decode first so downstream rules
  // catch the resulting character.
  out = out
    .replaceAll('&nbsp;', '\u00A0')
    .replaceAll('&mdash;', '—')
    .replaceAll('&ndash;', '–')
    .replaceAll('&hellip;', '…')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&#39;', "'");

  // ---- Invisible / exotic whitespace -----------------------------------
  // Zero-width codepoints never belong in prose; strip outright.
  // Narrow / thin / em spaces collapse to a single regular space.
  // U+00A0 (non-breaking space) is PRESERVED: Czech typography uses it
  //   after single-letter prepositions ("v našich", "k dispozici") and
  //   between number + unit. The lint rulebook does not ban it.
  out = out
    .replaceAll('\u200B', '')   // zero-width space
    .replaceAll('\u200C', '')   // zero-width non-joiner
    .replaceAll('\u200D', '')   // zero-width joiner
    .replaceAll('\uFEFF', '')   // byte order mark / zero-width no-break
    .replaceAll('\u202F', ' ')  // narrow no-break space
    .replaceAll('\u2009', ' ')  // thin space
    .replaceAll('\u2003', ' ')  // em space
    .replaceAll('\u2002', ' '); // en space

  // ---- Inline image payloads -------------------------------------------
  // Docs markdown export emits inline images as reference-style
  //    ![alt][image1]
  // with a matching `[image1]: data:image/jpeg;base64,...` definition at
  // the bottom. The base64 payload can be hundreds of KB per image and
  // gets rendered into the final HTML, blowing the page weight budget.
  //
  // The first inline image is already saved separately as the hero file
  // via the Docs API (see firstInlineImage + downloadAndResizeImage), so
  // strip both the body references AND the trailing data-URL definitions.
  // Also handle direct-style images with data URLs; regular external
  // http(s) image URLs pass through untouched.
  out = out
    .replace(/!\[[^\]]*\]\[[^\]]*\]/g, '')                    // ref-style refs
    .replace(/^\[[^\]]+\]:\s*<?data:[^\n>]*>?\n?/gim, '')     // data: URL defs (with optional <> autolink wrapper)
    .replace(/!\[[^\]]*\]\(<?data:[^)>]*>?\)/g, '');          // inline data-URL imgs

  // ---- Inline HTML wrappers --------------------------------------------
  // Docs markdown export sometimes wraps coloured, custom-font, or
  // underlined runs in HTML tags the editorial layout cannot read.
  // Unwrap them, keep the text inside.
  out = out.replace(/<span\b[^>]*>([\s\S]*?)<\/span>/gi, '$1');
  out = out.replace(/<font\b[^>]*>([\s\S]*?)<\/font>/gi, '$1');
  out = out.replace(/<u\b[^>]*>([\s\S]*?)<\/u>/gi, '$1');
  // Empty block-level placeholders left behind by paste from Word.
  out = out.replace(/<(p|div)\b[^>]*>\s*<\/\1>/gi, '');

  // ---- Punctuation: dashes, quotes, ellipsis ---------------------------
  out = out
    .replaceAll('—', ', ')
    .replaceAll('–', ' - ')
    .replaceAll('\u201C', '"')  // left double quote
    .replaceAll('\u201D', '"')  // right double quote
    .replaceAll('\u201E', '"')  // double low-9 (Czech opening)
    .replaceAll('\u201F', '"')  // double high-reversed-9
    .replaceAll('\u00AB', '"')  // « guillemet
    .replaceAll('\u00BB', '"')  // » guillemet
    .replaceAll('\u2018', "'")  // left single quote
    .replaceAll('\u2019', "'")  // right single quote
    .replaceAll('\u201A', "'")  // single low-9 (Czech opening)
    .replaceAll('\u201B', "'")  // single high-reversed-9
    .replaceAll('\u2039', "'")  // ‹ single guillemet
    .replaceAll('\u203A', "'")  // › single guillemet
    .replaceAll('…', '...')
    .replaceAll('\u2026', '...'); // defensive duplicate

  // ---- Tabs → single space ---------------------------------------------
  out = out.replace(/\t+/g, ' ');

  // ---- Heading level hygiene -------------------------------------------
  // Frontmatter `title` renders as the page H1, so body headings must
  // start at H2. Docs' first heading is often "Heading 1" (markdown `#`);
  // demote it. Headings at H4 or deeper flatten to H3 so the outline
  // stays legible in a 500-word article.
  out = out
    .replace(/^# (?=\S)/gm, '## ')        // H1 → H2
    .replace(/^#{4,} (?=\S)/gm, '### ');  // H4..H6 → H3

  // ---- Horizontal whitespace collapse (line-aware) ---------------------
  // Don't touch content inside fenced code blocks: alignment there may
  // be intentional. Elsewhere, collapse 2+ internal spaces, preserve
  // leading indentation (list items, blockquotes), strip trailing.
  const lines = out.split('\n');
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^```/.test(lines[i])) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const leading = lines[i].match(/^([ ]*)/)[1];
    const rest = lines[i].slice(leading.length).replace(/ {2,}/g, ' ');
    lines[i] = (leading + rest).replace(/[ \t]+$/, '');
  }
  out = lines.join('\n');

  // ---- Emphasis hygiene ------------------------------------------------
  // Fix `** word **` → `**word**` and `* word *` → `*word*` that Docs
  // markdown export emits around formatted runs, so the rendered output
  // doesn't show stray spaces inside bold/italic.
  out = out
    .replace(/\*\*\s+([^*\n]+?)\s+\*\*/g, '**$1**')
    .replace(/(?<!\*)\*\s+([^*\n]+?)\s+\*(?!\*)/g, '*$1*');

  // ---- Vertical whitespace collapse ------------------------------------
  // Markdown's paragraph separator is exactly one blank line. Three or
  // more blank lines collapse to a single separator. This kills the
  // common "I pressed Enter five times between sections" anti-pattern.
  out = out.replace(/\n{3,}/g, '\n\n');

  // ---- File edges ------------------------------------------------------
  // Leading blank lines are always wrong (frontmatter owns the top of
  // the file). Trailing whitespace collapses to exactly one newline.
  out = out.replace(/^[\s\n]+/, '').replace(/[\s\n]+$/, '') + '\n';

  return out;
}

/**
 * Check whether body copy still contains `!` after normalization.
 * Returns true if body has a bang (i.e. is NOT clean).
 * Headings with ! are fine in the rulebook; lint only bans `!` in prose.
 * We use a conservative heuristic: any `!` that is not part of a JS-ish
 * operator (!=, !x) counts. If it matches, caller flips draft:true.
 */
function bodyContainsBang(body) {
  // Strip Markdown image syntax ![alt](url) and ![alt][ref] before checking;
  // those `!` are syntactic, not prose. Also strip fenced code blocks.
  const stripped = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/!\[[^\]]*\]\[[^\]]*\]/g, '');
  return /[^`<>]![^=]/.test(stripped);
}

// --- Slug + date helpers ------------------------------------------------

function slugify(input) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')      // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function parseDescription(description) {
  const out = {};
  if (!description) return out;
  for (const raw of description.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const val = line.slice(idx + 1).trim();
    if (!key || !val) continue;
    out[key] = val;
  }
  return out;
}

// --- Drive / Docs operations -------------------------------------------

async function listDocs(drive, folderId) {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.document' and trashed = false`,
    fields: 'files(id, name, description, modifiedTime)',
    pageSize: 200,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  return res.data.files ?? [];
}

async function exportMarkdown(drive, fileId) {
  const res = await drive.files.export(
    { fileId, mimeType: 'text/markdown' },
    { responseType: 'text' },
  );
  return res.data;
}

/**
 * Find the first inline image referenced in a Doc's Markdown export and
 * download it. Drive doesn't expose the raw image URL from `files.export`
 * for markdown, so we use the Docs API to walk the body.
 */
async function firstInlineImage(docs, fileId) {
  const res = await docs.documents.get({ documentId: fileId });
  const body = res.data.body?.content ?? [];
  for (const block of body) {
    const elems = block.paragraph?.elements ?? [];
    for (const el of elems) {
      const embed = el.inlineObjectElement;
      if (!embed) continue;
      const objId = embed.inlineObjectId;
      const obj = res.data.inlineObjects?.[objId];
      const contentUri = obj?.inlineObjectProperties?.embeddedObject?.imageProperties?.contentUri;
      if (contentUri) return contentUri;
    }
  }
  return null;
}

/**
 * Download the hero image and re-encode it so it fits into a predictable
 * size envelope regardless of what the author uploaded.
 *
 * Strategy (fail-open at every step):
 *   1. Resize longest edge to MAX_WIDTH, never upscale.
 *   2. Encode JPEG with progressively lower quality until the output is
 *      under MAX_BYTES. Starts at Q80; walks down by 7 each pass.
 *   3. If even Q45 is still over budget, drop the width by 20 % and try
 *      again from Q80 (covers 4000px+ camera shots).
 *   4. Give up after WIDTH_FLOOR px; write whatever we have and log a
 *      warning so the reviewer can manually optimize.
 *
 * The page weight budget for the site is 400 KB eager including CSS and
 * HTML, so we target a hero image under ~700 KB (with some head-room).
 */
const MAX_BYTES = 700 * 1024;
const MAX_WIDTH = 1400;
const WIDTH_FLOOR = 900;

async function downloadAndResizeImage(uri, outPath) {
  const res = await fetch(uri);
  if (!res.ok) {
    throw new Error(`Image fetch failed: ${res.status} ${res.statusText}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());

  let width = MAX_WIDTH;
  let bytes = null;

  while (width >= WIDTH_FLOOR) {
    for (const quality of [80, 73, 66, 59, 52, 45]) {
      const encoded = await sharp(buf)
        .resize({ width, withoutEnlargement: true })
        .jpeg({ quality, mozjpeg: true, progressive: true })
        .toBuffer();
      if (encoded.length <= MAX_BYTES) {
        await writeFile(outPath, encoded);
        console.log(
          `image: ${(encoded.length / 1024).toFixed(0)} KB at ${width}px q${quality}`,
        );
        return;
      }
      bytes = encoded.length;
    }
    width = Math.round(width * 0.8);
  }

  // Fallback: write whatever the last pass produced and warn.
  const fallback = await sharp(buf)
    .resize({ width: WIDTH_FLOOR, withoutEnlargement: true })
    .jpeg({ quality: 45, mozjpeg: true, progressive: true })
    .toBuffer();
  await writeFile(outPath, fallback);
  console.warn(
    `image: could not fit within ${MAX_BYTES / 1024} KB; wrote ${(fallback.length / 1024).toFixed(0)} KB at ${WIDTH_FLOOR}px q45 (last attempt ${bytes ? (bytes / 1024).toFixed(0) : '?'} KB). Reviewer should re-optimize.`,
  );
}

// --- MDX emission -------------------------------------------------------

function buildFrontmatter(fields) {
  const lines = ['---'];
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v)) {
      lines.push(`${k}: [${v.map((x) => JSON.stringify(x)).join(', ')}]`);
    } else if (typeof v === 'boolean') {
      lines.push(`${k}: ${v}`);
    } else if (k === 'date') {
      lines.push(`${k}: ${v}`);
    } else {
      lines.push(`${k}: ${JSON.stringify(v)}`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}

// --- Main ---------------------------------------------------------------

async function main() {
  const folderId = process.env.DRIVE_FOLDER_ID;
  if (!folderId) throw new Error('Missing DRIVE_FOLDER_ID env var.');

  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });
  const docs = google.docs({ version: 'v1', auth });

  await mkdir(CONTENT_DIR, { recursive: true });
  await mkdir(IMAGES_DIR, { recursive: true });

  const files = await listDocs(drive, folderId);
  if (files.length === 0) {
    // Diagnostic: if SA filter returned no Docs, we want to know why. Three
    // likely causes: folder ACL denies SA, folder ID points somewhere wrong,
    // or the folder is genuinely empty. Fetch folder metadata + list of ALL
    // children (any mimeType) so the log shows which case we hit.
    try {
      const meta = await drive.files.get({
        fileId: folderId,
        fields: 'id, name, mimeType, owners(emailAddress, displayName)',
        supportsAllDrives: true,
      });
      console.log(`Folder metadata: ${JSON.stringify(meta.data)}`);
    } catch (err) {
      console.log(`Cannot read folder metadata: ${err.message}. SA likely has no access.`);
    }
    const all = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType)',
      pageSize: 50,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    const children = all.data.files ?? [];
    console.log(`All children (any mimeType): ${children.length}`);
    for (const c of children) console.log(`  - ${c.name} [${c.mimeType}]`);
    console.log('Drive folder is empty (no Google Docs with matching filter); nothing to sync.');
    return;
  }

  console.log(`Found ${files.length} Doc(s) in folder ${folderId}.`);

  const results = [];

  for (const file of files) {
    try {
      const meta = parseDescription(file.description ?? '');
      const slug = meta.slug ? slugify(meta.slug) : slugify(file.name);
      if (!slug) {
        console.warn(`Skipping "${file.name}": empty slug after normalization.`);
        continue;
      }

      const rawMd = await exportMarkdown(drive, file.id);
      const body = normalize(rawMd);

      // Exclamation marks used to auto-flip the doc to draft:true. The
      // lint rule was lifted (client's call), so we also drop the auto-
      // draft here - an `!` in the Doc ships straight through.

      let heroRelative = meta.hero ?? `/images/aktuality/${slug}.jpg`;
      if (!meta.hero) {
        try {
          const imageUri = await firstInlineImage(docs, file.id);
          if (imageUri) {
            const outPath = resolve(IMAGES_DIR, `${slug}.jpg`);
            await downloadAndResizeImage(imageUri, outPath);
            heroRelative = `/images/aktuality/${slug}.jpg`;
          } else {
            console.warn(`"${file.name}": no inline image found, keeping placeholder path.`);
          }
        } catch (err) {
          console.warn(`"${file.name}": image download failed: ${err.message}`);
        }
      }

      // Content validation. Matches the Zod schema in src/content.config.ts:
      //   title 10-120 chars, lead 40-240, date YYYY-MM-DD.
      // Rather than failing the whole sync when one Doc has bad metadata,
      // we fix what's auto-fixable and flip draft:true for the rest so the
      // article still lands in the PR for a human to correct.
      const validationIssues = [];
      let title = (meta.title ?? file.name).trim().slice(0, 120);
      if (title.length < 10) {
        validationIssues.push(`title too short (${title.length} chars, need >= 10)`);
      }
      let lead = (meta.lead ?? '').trim();
      if (lead.length > 240) {
        validationIssues.push(`lead too long (${lead.length} chars, trimmed to 240)`);
        lead = lead.slice(0, 240);
      }
      if (lead.length < 40) {
        validationIssues.push(`lead too short (${lead.length} chars, need >= 40)`);
      }
      let date = meta.date ?? file.modifiedTime.slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        validationIssues.push(`date "${date}" is not YYYY-MM-DD; falling back to file modified time`);
        date = file.modifiedTime.slice(0, 10);
      }
      const forceDraft = validationIssues.length > 0;
      if (forceDraft) {
        console.warn(`"${file.name}" has ${validationIssues.length} validation issue(s); marking as draft:`);
        for (const msg of validationIssues) console.warn(`   - ${msg}`);
      }

      const fm = buildFrontmatter({
        title,
        lead,
        date,
        hero: heroRelative,
        hero_alt: meta.hero_alt,
        author: meta.author,
        tags: meta.tags
          ? meta.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : undefined,
        draft: forceDraft || meta.draft === 'true',
      });

      const mdx = `${fm}\n\n${body.trim()}\n`;
      const outPath = resolve(CONTENT_DIR, `${slug}.mdx`);

      // Skip rewrite if content has not changed, so git stays clean.
      let existing = '';
      try {
        existing = await readFile(outPath, 'utf8');
      } catch {}
      if (existing === mdx) {
        console.log(`= ${slug}.mdx unchanged`);
        results.push({ slug, status: 'unchanged' });
        continue;
      }

      await writeFile(outPath, mdx, 'utf8');
      console.log(`${existing ? '~' : '+'} ${slug}.mdx`);
      results.push({ slug, status: existing ? 'updated' : 'created' });
    } catch (err) {
      console.error(`!! ${file.name}: ${err.message}`);
      results.push({ slug: file.name, status: 'error', error: err.message });
    }
  }

  const changes = results.filter((r) => r.status === 'created' || r.status === 'updated');
  console.log(`\nDone. ${changes.length} change(s), ${results.length - changes.length} unchanged / errored.`);

  // Write a summary file that the GH Action reads to decide whether to open a PR.
  await writeFile(resolve(ROOT, '.sync-summary.json'), JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
