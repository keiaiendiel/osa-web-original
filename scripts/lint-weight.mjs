#!/usr/bin/env node
/*
 * lint-weight.mjs
 *
 * Hard performance budget check on the built `dist/` tree.
 * Plan section 7 targets:
 *   - total transfer per page < 400 KB
 *   - JS transfer           <  10 KB
 *   - CSS transfer          <  40 KB
 *   - font transfer (total) < 120 KB per page, 160 KB across site
 *
 * Measures raw size (not gzip), which is a conservative bound.
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, join, relative } from 'node:path';

const DIST = resolve(process.cwd(), 'dist');
const BUDGETS = {
  pageTotalKB: 400,
  jsPerPageKB:  10,
  cssPerPageKB: 40,
  fontSiteKB:  160,
};

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

async function measure(path) {
  const { size } = await stat(path);
  return size;
}

async function measureHtmlPage(htmlPath) {
  const html = await readFile(htmlPath, 'utf8');
  const assetRefs = new Set();
  for (const m of html.matchAll(/(?:href|src)=['"]([^'"]+)['"]/g)) {
    const u = m[1];
    if (/^https?:/.test(u)) continue;
    if (u.startsWith('#')) continue;
    assetRefs.add(u);
  }
  // Infer any inline @font-face url() references to /fonts/…
  for (const m of html.matchAll(/url\(['"]?([^)]+)['"]?\)/g)) {
    const u = m[1];
    if (/^https?:/.test(u)) continue;
    assetRefs.add(u);
  }

  let totalKB = (await measure(htmlPath)) / 1024;
  let jsKB = 0, cssKB = 0, fontKB = 0, imgKB = 0;

  for (const ref of assetRefs) {
    const assetPath = resolve(DIST, '.' + ref);
    try {
      const size = await measure(assetPath);
      const kb = size / 1024;
      totalKB += kb;
      if (/\.js$/.test(ref))               jsKB   += kb;
      else if (/\.css$/.test(ref))         cssKB  += kb;
      else if (/\.(woff2?|ttf|otf)$/.test(ref)) fontKB += kb;
      else if (/\.(png|jpg|jpeg|webp|avif|svg|gif|ico)$/.test(ref)) imgKB += kb;
    } catch {
      // missing asset; ignore (e.g. mailto:, tel:)
    }
  }

  return {
    page: relative(DIST, htmlPath).replace(/index\.html$/, '') || '/',
    totalKB, jsKB, cssKB, fontKB, imgKB,
  };
}

// collect pages
const htmlPages = [];
for await (const f of walk(DIST)) {
  if (f.endsWith('.html')) htmlPages.push(f);
}

const rows = [];
let failed = 0;
for (const page of htmlPages) {
  const r = await measureHtmlPage(page);
  rows.push(r);
  const problems = [];
  if (r.totalKB > BUDGETS.pageTotalKB) problems.push(`total ${r.totalKB.toFixed(1)}KB > ${BUDGETS.pageTotalKB}`);
  if (r.jsKB    > BUDGETS.jsPerPageKB) problems.push(`js ${r.jsKB.toFixed(1)}KB > ${BUDGETS.jsPerPageKB}`);
  if (r.cssKB   > BUDGETS.cssPerPageKB) problems.push(`css ${r.cssKB.toFixed(1)}KB > ${BUDGETS.cssPerPageKB}`);
  if (problems.length) {
    failed += 1;
    console.log(`\u001b[31m✗\u001b[0m ${r.page}  ${problems.join(', ')}`);
  } else {
    console.log(`\u001b[32m✓\u001b[0m ${r.page}  total=${r.totalKB.toFixed(1)}  js=${r.jsKB.toFixed(1)}  css=${r.cssKB.toFixed(1)}  fonts=${r.fontKB.toFixed(1)}`);
  }
}

// site-wide font check
let fontTotal = 0;
for await (const f of walk(resolve(DIST, 'fonts').replace(/\\/g, '/'))) {
  if (/\.woff2?$/.test(f)) fontTotal += (await measure(f));
}
const fontTotalKB = fontTotal / 1024;
if (fontTotalKB > BUDGETS.fontSiteKB) {
  console.log(`\u001b[31m✗\u001b[0m total fonts in dist: ${fontTotalKB.toFixed(1)}KB > ${BUDGETS.fontSiteKB}KB`);
  failed += 1;
} else {
  console.log(`\u001b[32m✓\u001b[0m total fonts in dist: ${fontTotalKB.toFixed(1)}KB`);
}

console.log(`\nChecked ${rows.length} pages, ${failed} budget violation(s).`);
process.exit(failed > 0 ? 1 : 0);
