// src/content.config.ts
// Astro 5 content collections with the glob loader API.
// Frontmatter is validated at build time via Zod schemas — a missing
// or malformed field fails the build instead of producing a broken
// card or rendering blank metadata.
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// All images live under public/images/ and are referenced by string
// path (e.g. "/images/wine.jpeg"). Using a string field keeps the
// schema simple and lets us use plain <img src={data.image}/>.
const baseFrontmatter = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  image: z.string().optional(),
  tag: z.string().optional(),
  status: z.enum(['active', 'archived']).default('active'),
  draft: z.boolean().default(false),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: baseFrontmatter.extend({
    /* Allow an external link (e.g. shinyapps.io) instead of a content body */
    external: z.string().url().optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: baseFrontmatter.extend({
    readingTime: z.number().optional(),
  }),
});

const talks = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/talks' }),
  schema: baseFrontmatter.extend({
    venue: z.string().optional(),
    slidesUrl: z.string().url().optional(),
  }),
});

export const collections = { projects, blog, talks };
