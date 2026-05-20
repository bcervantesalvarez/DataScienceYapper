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
├── src/
│   ├── pages/              # Each file = a route (about.astro -> /about)
│   │   ├── projects/       # Listing + dynamic [slug].astro
│   │   ├── blog/
│   │   ├── talks/
│   │   └── forms/
│   ├── layouts/
│   │   └── BaseLayout.astro    # <html> shell + navbar + footer + theme bootstrap
│   ├── components/         # Reusable: Navbar, Footer, Section, Card, Button, StatusBanner
│   ├── content/
│   │   ├── config.ts       # Zod schemas for projects/blog/talks
│   │   ├── projects/       # *.mdx — typed frontmatter, validated at build
│   │   ├── blog/
│   │   └── talks/
│   └── styles/
│       └── global.css      # Design tokens + Tailwind layers (single source of truth)
├── astro.config.ts
├── tailwind.config.ts      # Exposes the CSS variables as Tailwind utilities
├── tsconfig.json
└── package.json
```

## Design tokens

All colors, fonts, and spacing live as CSS custom properties in
[`src/styles/global.css`](src/styles/global.css). Tailwind utilities
(`bg-bg`, `text-ink`, `border-rule`, etc.) read from those tokens, and
the dark theme just swaps the values under `[data-theme="dark"]`.

To re-tune the palette: edit `:root { ... }` in `global.css`. No rebuild
of Tailwind config required.

## Adding content

Drop a `.mdx` file into the matching `src/content/<collection>/`
directory. Frontmatter is validated by Zod ([config.ts](src/content/config.ts))
— a missing field or wrong type fails the build with a helpful error.

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

- **Hosting:** Cloudflare Pages (build command `npm run build`, output dir `dist`)
- **Custom domain:** `epsilon-labs.org` (the `CNAME` in `public/` carries over)
- **Form backend:** Google Apps Script (the contact form on `/privacy` posts there). To enable Cloudflare Turnstile server-side verification, see `archive/chatbot/...` for the snippet — wait, that lives on the old `claude/review-codebase-8KnDb` branch.

## Why Astro

- Ships **zero JS by default**. The site loads as static HTML + CSS.
- **TypeScript everywhere**, including content frontmatter (Zod schemas).
- **MDX** for posts: Markdown with optional component embeds.
- **Build in seconds**, not minutes (no R/Python at render time).
- **Tailwind** for utility-first styling — design tokens scale cleanly.

See [`AGENTS.md`](AGENTS.md) for the layout an agent (or future-you)
should follow when editing this repo.
