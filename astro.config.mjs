// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';

// NOTE: @astrojs/react was scaffolded but removed here to keep dist clean.
// Add back with `pnpm astro add react` if we need a client island that
// truly requires React components (e.g., a complex form).
export default defineConfig({
  site: 'https://osa2.cz',
  trailingSlash: 'always',
  output: 'static',
  compressHTML: true,
  integrations: [mdx()],
});