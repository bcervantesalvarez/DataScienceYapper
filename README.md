# Epsilon Labs

Personal site for **Brian Cervantes Alvarez** — statistical consulting,
predictive modeling, and decision-grade analytics. Lives at
[epsilon-labs.org](https://epsilon-labs.org).

Built with **Astro** + **TypeScript** + **MDX** + **Tailwind CSS**.

## Quick start

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output to ./dist
npm run preview  # serve the build locally
npm run check    # type-check + content-collection schema check
```

Requires Node 20+.

## Repo layout

```
/
├── public/                 # Static assets served as-is (/images, /documents, CNAME, favicon.svg)
├── scripts/
│   └── qmd-to-mdx.ts       # Quarto → MDX port helper (npm run port)
├── src/
│   ├── pages/              # Each file = a route (about.astro -> /about)
│   │   ├── projects/       # Listing + dynamic [...slug].astro
│   │   ├── blog/
│   │   ├── talks/
│   │   ├── og/             # Build-time OG card PNGs (Satori + resvg)
│   │   └── forms/
│   ├── layouts/
│   │   └── BaseLayout.astro    # <html> shell + navbar + footer + theme bootstrap
│   ├── components/         # Reusable: Navbar, Footer, Section, Card, Button, StatusBanner
│   ├── content/            # *.mdx (+ *.body.html Quarto exports) per collection
│   │   ├── projects/       # Typed frontmatter, validated at build
│   │   ├── blog/
│   │   └── talks/
│   ├── content.config.ts   # Zod schemas for projects/blog/talks
│   ├── lib/
│   │   └── site.ts         # Site identity constants; URLs derive from astro.config.ts `site`
│   └── styles/
│       └── global.css      # Design tokens (@theme) + Tailwind v4 layers — single source of truth
├── astro.config.ts         # `site` here is the single source of truth for the domain
├── tsconfig.json
└── package.json
```

## Design tokens

All colors, fonts, and spacing live as CSS custom properties in the
`@theme` block of [`src/styles/global.css`](src/styles/global.css).
This is Tailwind v4: there is no `tailwind.config.ts` — utilities
(`bg-bg`, `text-ink`, `border-rule`, etc.) are generated straight from
`@theme`, and the dark theme just swaps the values under
`[data-theme="dark"]`.

To re-tune the palette: edit `@theme { ... }` (and the dark overrides)
in `global.css`. Tokens are complete color values — consume them with
`var(--color-x)`, or `color-mix(in srgb, var(--color-x) N%, transparent)`
when you need alpha. Never wrap a token in `rgb(...)`.

## Adding content

Drop a `.mdx` file into the matching `src/content/<collection>/`
directory. Frontmatter is validated by Zod
([content.config.ts](src/content.config.ts)) — a missing field or wrong
type fails the build with a helpful error.

Minimal project frontmatter:

```mdx
---
title: "Project title"
description: "One-line summary that shows under the title."
tag: "Statistical modeling"
date: 2026-04-01
status: active           # or "archived"
image: ../../../public/images/project-cover.jpg   # optional
---

# Body in MDX (Markdown + optional JSX)
```

## Deployment

- **Hosting:** Cloudflare Workers static assets — the `epsilon-labs`
  Worker builds with `npm run build` and deploys `dist/` via
  `npx wrangler deploy`. [`wrangler.jsonc`](wrangler.jsonc) keeps the
  deploy assets-only: do **not** add the Cloudflare SSR adapter — the
  OG image route needs Node + native resvg at build time and cannot run
  inside a Worker.
- **Custom domain:** `epsilon-labs.org`, attached to the Worker in the
  Cloudflare dashboard (the canonical origin lives in `astro.config.ts`)
- **Form backend:** Google Apps Script (the contact form on `/privacy` posts there). Cloudflare Turnstile is wired client-side; set the real sitekey on the `.cf-turnstile` div in `src/pages/privacy.astro` and add the matching secret check in the Apps Script to enable it end to end.

## Why Astro

- Ships **zero JS by default**. The site loads as static HTML + CSS.
- **TypeScript everywhere**, including content frontmatter (Zod schemas).
- **MDX** for posts: Markdown with optional component embeds.
- **Build in seconds**, not minutes (no R/Python at render time).
- **Tailwind** for utility-first styling — design tokens scale cleanly.

See [`AGENTS.md`](AGENTS.md) for the layout an agent (or future-you)
should follow when editing this repo.

---

*Transparency note: this Astro rewrite was built by **Claude** —
Anthropic's Claude Code agent, running its latest-generation frontier
model with extended thinking mode enabled.*
