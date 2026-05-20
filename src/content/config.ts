// src/content/config.ts
// Typed content collections. Frontmatter is validated at build time —
// a missing or malformed field fails the build instead of producing a
// broken card or rendering blank metadata.
import { defineCollection, z } from 'astro:content';

// All images live under public/images/ and are referenced by string path
// (e.g. "/images/wine.jpeg"). Using a string field keeps the schema
// simple and lets us use plain <img src={data.image}/>.
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
  type: 'content',
  schema: baseFrontmatter.extend({
    /* Allow an external link (e.g. shinyapps.io) instead of a content body */
    external: z.string().url().optional(),
  }),
});

const blog = defineCollection({
  type: 'content',
  schema: baseFrontmatter.extend({
    readingTime: z.number().optional(),
  }),
});

const talks = defineCollection({
  type: 'content',
  schema: baseFrontmatter.extend({
    venue: z.string().optional(),
    slidesUrl: z.string().url().optional(),
  }),
});

export const collections = { projects, blog, talks };
