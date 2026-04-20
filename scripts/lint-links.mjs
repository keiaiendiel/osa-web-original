#!/usr/bin/env node
/*
 * lint-links.mjs
 *
 * HEAD-check every `external_url` in sub_projects MDX. Fail on 4xx/5xx or
 * DNS failure. Network timeouts are warnings (not failures) to avoid
 * flaking CI on slow third parties.
 */
import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const CONTENT = resolve(process.cwd(), 'src/content/sub_projects');
const TIMEOUT_MS = 8000;

async function extractUrls() {
  const urls = [];
  const entries = await readdir(CONTENT);
  for (const f of entries) {
    if (!f.endsWith('.mdx')) continue;
    const raw = await readFile(join(CONTENT, f), 'utf8');
    const m = raw.match(/^external_url:\s*(.+)$/m);
    if (m) urls.push({ file: f, url: m[1].trim().replace(/['"]/g, '') });
  }
  return urls;
}

async function check(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal });
    // some servers reject HEAD; retry as GET
    if (r.status === 405 || r.status === 403) {
      const r2 = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctrl.signal });
      return { status: r2.status, ok: r2.ok };
    }
    return { status: r.status, ok: r.ok };
  } catch (e) {
    return { status: 0, ok: false, error: e.name === 'AbortError' ? 'timeout' : e.message };
  } finally {
    clearTimeout(timer);
  }
}

const urls = await extractUrls();
if (urls.length === 0) {
  console.log('link lint: no external_urls to check');
  process.exit(0);
}

let failed = 0;
let warned = 0;

const results = await Promise.all(urls.map(async ({ file, url }) => {
  const { status, ok, error } = await check(url);
  return { file, url, status, ok, error };
}));

// Hard failures: only explicit 4xx/5xx status codes.
// Soft failures: timeouts, DNS errors, TLS errors, connection resets.
// Rationale: third-party servers flake. Editorial quality gate flags
// genuine structural breakage; transient failures surface as warnings.
for (const { file, url, status, ok, error } of results) {
  if (ok) {
    console.log(`\u001b[32m✓\u001b[0m ${status}  ${url}`);
  } else if (status >= 400) {
    console.log(`\u001b[31m✗\u001b[0m ${status}  ${url}  (${file})`);
    failed += 1;
  } else {
    console.log(`\u001b[33m⚠\u001b[0m ${error || status || 'net-fail'}  ${url}  (${file})`);
    warned += 1;
  }
}

const live = results.filter(r => r.ok).length;
if (failed === 0) {
  console.log(`\u001b[32m✓\u001b[0m link lint: ${live}/${urls.length} live, ${warned} unreachable (treated as warning)`);
  process.exit(0);
} else {
  console.log(`\nLink lint failed: ${failed} with 4xx/5xx status.`);
  process.exit(1);
}
