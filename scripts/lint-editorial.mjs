#!/usr/bin/env node
/*
 * lint-editorial.mjs
 *
 * Editorial rulebook from Plan section 4. Grep for banned characters and
 * phrases in markdown, mdx, and .astro sources. Exit 1 with file:line report
 * on any violation.
 *
 * Exceptions:
 *   - `…` is allowed only inside the Hero motto "Pomáháme tvořit…" and the
 *     Kreditní systém paragraph; allowlist is literal-match.
 *   - `!` is allowed in HTML attributes (alt="...", aria-label="..."),
 *     inside <script> / <style> blocks, and inside MDX frontmatter dates.
 */
import { readFile, readdir } from 'node:fs/promises';
import { resolve, relative, join } from 'node:path';

const ROOT = resolve(process.cwd());
const SCAN = [
  'src/pages',
  'src/components',
  'src/layouts',
  'src/content',
];

const rules = [
  {
    id: 'em-dash',
    pattern: /—/g,
    msg: 'Em dash (—) is banned. Use " - " (hyphen spaces) or a comma.',
  },
  {
    id: 'en-dash',
    pattern: /–/g,
    msg: 'En dash (–) is banned. Use " - " (hyphen spaces) or a comma.',
    exempt: /unicode-range:\s*U\+/,
  },
  {
    id: 'exclamation',
    pattern: /!/g,
    msg: 'Exclamation mark is banned in body copy. Allowed only in HTML attrs and code.',
    exempt: /(alt=|aria-label=|title=|<!--|<!DOCTYPE|<\/?script|<\/?style|important|\.important|content=|placeholder=|!\s*important|condition!|exception!)/i,
    // also skip lines that contain JS operators like !x, !!x, !=
    lineExempt: (line) => /!=|![a-zA-Z_$]|![ ]?\(/.test(line),
  },
  {
    id: 'ellipsis-outside-motto',
    pattern: /…/g,
    msg: 'Ellipsis (…) is reserved for the "Pomáháme tvořit…" motto.',
    lineExempt: (line) =>
      /Pomáháme tvořit/.test(line) ||
      /přípravě/.test(line),
  },
  {
    id: 'passive-voice',
    pattern: /\b(?:je realizováno|je zajišťováno|je prováděno|snaha o)\b/gi,
    msg: 'Passive voice. Prefer active verbs.',
  },
  {
    id: 'legalistic-ve-smyslu',
    pattern: /\bve smyslu §/gi,
    msg: 'Legalistic "ve smyslu §". Drop it; just state the fact.',
  },
  {
    id: 'marketing-hype',
    pattern: /\b(úžasný|úžasná|úžasné|neuvěřitelný|neuvěřitelná|zásadní význam|revoluční|klíčový moment)\b/gi,
    msg: 'Marketing hype adjective. Replace with a concrete fact.',
  },
];

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(astro|md|mdx|ts|tsx|js|mjs|json)$/.test(e.name)) yield p;
  }
}

let violations = 0;
const allowExtRule = (path) =>
  // skip the rulebook itself, it contains its own forbidden patterns as examples
  /scripts\/lint-editorial\.mjs$/.test(path);

for (const root of SCAN) {
  const full = resolve(ROOT, root);
  try {
    for await (const file of walk(full)) {
      if (allowExtRule(file)) continue;
      const content = await readFile(file, 'utf8');
      const lines = content.split('\n');
      for (const rule of rules) {
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          // skip lines matching global exempt regex
          if (rule.exempt && rule.exempt.test(line)) continue;
          // skip lines matching per-line function exempt
          if (rule.lineExempt && rule.lineExempt(line)) continue;
          const matches = [...line.matchAll(rule.pattern)];
          if (matches.length === 0) continue;
          const snippet = line.trim().slice(0, 120);
          const rel = relative(ROOT, file);
          console.log(`\u001b[31m✗\u001b[0m ${rel}:${i + 1}  [${rule.id}]`);
          console.log(`    ${snippet}`);
          console.log(`    ${rule.msg}`);
          violations += matches.length;
        }
      }
    }
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
}

if (violations === 0) {
  console.log('\u001b[32m✓\u001b[0m editorial: no violations');
  process.exit(0);
} else {
  console.log(`\nEditorial lint failed with ${violations} violation(s).`);
  process.exit(1);
}
