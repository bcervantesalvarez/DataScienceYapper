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
  build: {
    assets: '_assets',
    inlineStylesheets: 'auto',
  },
  integrations: [
    mdx(),
    sitemap({
      // /forms/thank-you is noindex — keep it out of the sitemap too.
      filter: (page) => !page.includes('/forms/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()] as AstroVitePlugins,
  },
});
