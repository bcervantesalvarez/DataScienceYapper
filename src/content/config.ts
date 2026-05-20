// src/content/config.ts
// Typed content collections. Frontmatter is validated at build time —
// a missing or malformed field fails the build instead of producing a
// broken card or rendering blank metadata.
import { defineCollection, z } from 'astro:content';

const baseFrontmatter = ({ image }: { image: () => z.ZodType }) =>
  z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    image: image().optional(),
    tag: z.string().optional(),
    status: z.enum(['active', 'archived']).default('active'),
    draft: z.boolean().default(false),
  });

const projects = defineCollection({
  type: 'content',
  schema: ({ image }) => baseFrontmatter({ image }).extend({
    /* Allow an external link (e.g. shinyapps.io) instead of a content body */
    external: z.string().url().optional(),
  }),
});

const blog = defineCollection({
  type: 'content',
  schema: ({ image }) => baseFrontmatter({ image }).extend({
    readingTime: z.number().optional(),
  }),
});

const talks = defineCollection({
  type: 'content',
  schema: ({ image }) => baseFrontmatter({ image }).extend({
    venue: z.string().optional(),
    slidesUrl: z.string().url().optional(),
  }),
});

export const collections = { projects, blog, talks };
