// src/lib/site.ts
// Single source of truth for site identity: name, principal, socials.
// The canonical origin comes from `site` in astro.config.ts (exposed as
// import.meta.env.SITE), so a future domain change is a one-line edit
// there — nothing under src/ hardcodes the domain.

const site = import.meta.env.SITE;
if (!site) {
  throw new Error('`site` must be set in astro.config.ts — it is the single source of truth for the canonical domain.');
}

/** Canonical origin without trailing slash, e.g. "https://epsilon-labs.org". */
export const SITE_URL = site.replace(/\/$/, '');

/** Bare host, e.g. "epsilon-labs.org" — for prose and OG bylines. */
export const SITE_HOST = new URL(SITE_URL).host;

export const SITE_NAME = 'Epsilon Labs';
export const SITE_DESCRIPTION =
  'Statistical consulting, predictive modeling, and decision-grade analytics.';

export const AUTHOR = {
  name: 'Brian Cervantes Alvarez',
  email: 'briancervantesalvarez@gmail.com',
  jobTitle: 'Business Intelligence Analyst',
  linkedin: 'https://linkedin.com/in/bcervantesalvarez',
  github: 'https://github.com/bcervantesalvarez',
} as const;

/** Absolute URL on the canonical origin for a site-relative path. */
export const absoluteUrl = (path: string): string =>
  new URL(path, `${SITE_URL}/`).href;
