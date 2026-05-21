// astro.config.ts
// Project: Epsilon Labs · statistical consulting practice
// Docs: https://docs.astro.build/en/reference/configuration-reference/
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://epsilon-labs.org',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    assets: '_assets',
    inlineStylesheets: 'auto',
  },
  integrations: [
    mdx(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
