// astro.config.ts
// Project: Epsilon Labs · statistical consulting practice
// Docs: https://docs.astro.build/en/reference/configuration-reference/
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// @tailwindcss/vite types against its own copy of vite, which can skew
// from the vite bundled inside astro. Deriving the plugin type from
// Astro's own config signature keeps `astro check` green regardless.
type AstroVitePlugins = NonNullable<
  NonNullable<Parameters<typeof defineConfig>[0]['vite']>['plugins']
>;

export default defineConfig({
  // Single source of truth for the canonical domain. Everything under
  // src/ derives absolute URLs from this value (via Astro.site /
  // import.meta.env.SITE — see src/lib/site.ts). Changing domains means
  // editing this line and re-attaching the custom domain in Cloudflare,
  // nothing else.
  site: 'https://epsilon-labs.org',
  output: 'static',
  trailingSlash: 'ignore',
  // The ML/Statistics write-ups moved from /projects to /blog — keep
  // old inbound links alive with static meta-refresh redirect pages.
  redirects: {
    '/projects/predicting-customer-returns-machine-learning': '/blog/predicting-customer-returns-machine-learning',
    '/projects/predicting-patient-severity-machine-learning': '/blog/predicting-patient-severity-machine-learning',
    '/projects/predicting-salaries-machine-learning': '/blog/predicting-salaries-machine-learning',
    '/projects/predicting-wine-province-machine-learning': '/blog/predicting-wine-province-machine-learning',
    '/projects/united-states-healthcare-spending-statistical-analysis': '/blog/united-states-healthcare-spending-statistical-analysis',
  },
  build: {
    assets: '_assets',
    inlineStylesheets: 'auto',
  },
  integrations: [
    mdx(),
    sitemap({
      // /forms/thank-you is noindex; /single is a hidden easter egg.
      // Neither belongs in the sitemap.
      filter: (page) => !page.includes('/forms/') && !page.includes('/single'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()] as AstroVitePlugins,
  },
});
