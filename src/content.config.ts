/*
 * Astro 6 Content Collections for OSA.
 * One source of truth per collection; MDX for narrative, JSON for structured data.
 */
import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const accentEnum = z.enum([
  'red', 'coral', 'mustard', 'olive', 'forest', 'teal', 'blue', 'plum',
]);

const statusEnum = z.enum([
  'realizovany',
  'pripravovany',
  've-spanku',
  'draft',
]);

const relationshipEnum = z.enum([
  'autonomni',
  'pilotni',
  've-spanku',
]);

const topicEnum = z.enum([
  'urbanismus',
  'kultura',
  'sport',
  'media',
  'vzdelavani',
  'tvorba',
  'komunita',
  'larp',
]);

const subProjects = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/sub_projects' }),
  schema: z.object({
    name: z.string(),
    description: z.string().min(30).max(160),
    accent: accentEnum,
    year_from: z.number().int().min(1990).max(2050).optional(),
    status: statusEnum,
    relationship: relationshipEnum,
    topic: topicEnum,
    external_url: z.string().url().optional(),
    featured: z.boolean().optional().default(false),
    order: z.number().optional(),
  }),
});

const values = defineCollection({
  loader: file('./src/content/values/axioms.json'),
  schema: z.object({
    name: z.string(),
    gloss: z.string(),
    order: z.number().int(),
  }),
});

const pillars = defineCollection({
  loader: file('./src/content/pillars/index.json'),
  schema: z.object({
    n: z.string().regex(/^\d{2}$/),
    title: z.string(),
    body: z.string(),
  }),
});

const org = defineCollection({
  loader: file('./src/content/org/identity.json'),
  schema: z.object({
    name: z.string(),
    abbreviations: z.array(z.string()),
    ico: z.string(),
    dic: z.string(),
    datova_schranka: z.string(),
    spisova_znacka: z.string(),
    founded: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    seat_address: z.string(),
    office_address: z.string(),
    email: z.string().email(),
    phone: z.string(),
    bank_transparent: z.string(),
    bank_other: z.string(),
    predseda: z.object({ name: z.string(), email: z.string().email(), phone: z.string() }),
    mistopredseda: z.object({ name: z.string(), email: z.string().email(), phone: z.string() }),
  }),
});

const dokumenty = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/dokumenty' }),
  schema: z.object({
    title: z.string(),
    file_path: z.string(),
    size_kb: z.number().optional(),
    year: z.number().int().optional(),
    type: z.enum(['stanovy', 'vyrocni-zprava', 'sablona', 'ostatni']),
    order: z.number().optional(),
  }),
});

const goals = defineCollection({
  loader: file('./src/content/goals/index.json'),
  schema: z.object({
    horizon: z.enum(['short', 'medium', 'long']),
    label: z.string(),
    items: z.array(z.string()).min(3).max(8),
    order: z.number().int(),
  }),
});

/*
 * Aktuality: self-service editorial channel.
 * Placeholder MDX lives in src/content/aktuality/ during the pre-launch phase;
 * the Google Drive sync pipeline (see docs/APPS_SCRIPT.md, scripts/sync-drive-aktuality.mjs)
 * writes new entries here and opens PRs via GitHub repository_dispatch.
 */
const aktuality = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/aktuality' }),
  schema: z.object({
    title: z.string().min(10).max(120),
    lead: z.string().min(40).max(240),
    date: z.coerce.date(),
    hero: z.string().startsWith('/'),
    hero_alt: z.string().min(3).max(180).optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional().default(false),
    // Optional inline gallery: additional images from the Google Doc body
    // (every image after the first). Rendered at the bottom of the article
    // using the Gallery component. Populated automatically by the Drive sync.
    gallery: z.array(z.string().startsWith('/')).optional(),
  }),
});

export const collections = { subProjects, values, pillars, org, dokumenty, aktuality, goals };
