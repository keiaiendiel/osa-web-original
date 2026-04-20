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

export const collections = { subProjects, values, pillars, org, dokumenty };
