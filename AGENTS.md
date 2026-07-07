# Working on this repo

Quick reference for any agent (or future-you) editing Epsilon Labs.
Goal: predictable file locations + typed contracts so changes land
cleanly with zero out-of-band coordination.

## Mental model

- **Static-first.** This is an Astro SSG project. No server. Every page
  is HTML at the end.
- **One source of truth per concern.** Design tokens, content schemas,
  navbar links, etc. each live in exactly one place.
- **Components are small and composable.** When in doubt, build a new
  component rather than nesting markup inside a page.

## Where to change what

| Concern                    | File                                              |
| -------------------------- | ------------------------------------------------- |
| Design tokens (colors)     | `src/styles/global.css` (`@theme` + `[data-theme="dark"]`) |
| Tailwind utility names     | `src/styles/global.css` — Tailwind v4 generates utilities from `@theme`; there is **no** `tailwind.config.ts` |
| Site identity (name, socials, absolute URLs) | `src/lib/site.ts` (origin derives from `site` in `astro.config.ts`) |
| Site-wide HTML / `<head>`  | `src/layouts/BaseLayout.astro`                    |
| Navbar links               | `src/components/Navbar.astro` (`links` array)     |
| Footer copy / links        | `src/components/Footer.astro`                     |
| ODE / status banner copy   | passed as props from each page that uses `<StatusBanner>` |
| Buttons / CTAs             | `src/components/Button.astro` (variants: `primary`, `ghost`) |
| Card UI                    | `src/components/Card.astro`                       |
| Section heading + container| `src/components/Section.astro`                    |
| Landing-page chapters      | `src/pages/index.astro` via `LandingSection.astro` — tones `light`/`tint`/`dark` map to `.tone-*` classes in `global.css`; the dark tone is a fixed deep band that contrasts in both themes |
| Page bodies                | `src/pages/<route>.astro`                         |
| Project/post/talk content  | `src/content/<collection>/<slug>.mdx`             |
| Content schemas            | `src/content.config.ts` (Zod, validated at build) |
| Static files (img, pdf)    | `public/` (served at the root URL)                |
| Site URL, integrations     | `astro.config.ts` (`site` is the single source of truth for the domain) |
| Spam-defense JS for form   | inline `<script>` at the bottom of `src/pages/privacy.astro` |

## Conventions

- **TypeScript everywhere.** Component props get an `interface Props { ... }`
  at the top of the `---` frontmatter block.
- **Tailwind for styling.** Avoid one-off `<style>` blocks unless a
  pattern can't be expressed in utilities.
- **No magic strings.** Re-use the tokens (`bg-bg`, `text-ink`, …) so a
  palette change in `global.css` propagates everywhere.
- **Animations** use Tailwind's `animate-el-rise`, `animate-el-fade`,
  `animate-el-ping` — defined in `global.css` (`--animate-*` tokens in
  `@theme` + the matching `@keyframes`).
- **Respect `prefers-reduced-motion`.** A global
  `@media (prefers-reduced-motion: reduce)` block in `global.css`
  already neutralizes the `animate-el-*` entrance animations and the
  scroll reveal; still prefer the `motion-safe:` variant for any new
  non-essential motion.
- **Scroll reveal.** `<Section>` fades in on first scroll into view
  (IntersectionObserver, zero dependencies) — on by default, pass
  `reveal={false}` to opt a section out. No-JS safe (content stays
  visible without JS) and disabled automatically under reduced motion.
- **Color tokens are complete colors,** not bare channel triplets.
  Solid: `var(--color-x)`. Alpha:
  `color-mix(in srgb, var(--color-x) N%, transparent)`.
  Never `rgb(var(--color-x))` — `rgb(rgb(...))` is invalid CSS and the
  browser drops the whole declaration.

## Adding a new page

1. Drop `src/pages/<route>.astro`.
2. Import `BaseLayout` and any components.
3. Wrap content in `<div class="ed">` if you want the editorial system
   (eyebrow + serif headlines + section primitives). Skip the wrapper
   for utility pages (e.g. 404).
4. Use `<Section>`, `<Card>`, `<Button>` rather than re-implementing.

## Adding a content item

```bash
# Project
src/content/projects/<slug>.mdx
# Blog post
src/content/blog/<slug>.mdx
# Talk
src/content/talks/<slug>.mdx
```

Frontmatter contract in `src/content.config.ts`. If the build fails
with a Zod error, the message names the missing/wrong field.

**Why `.mdx` + `.body.html` pairs?** Entries ported from the old Quarto
site keep their original rendered HTML in a sibling `<slug>.body.html`,
which the `.mdx` imports and injects (the `.article-body` styles in
`global.css` re-skin it). This preserves years of rendered R output
without re-executing anything at build time. New, non-ported entries
are plain `.mdx` and don't need a `.body.html`.

Every public-facing entry should open with an `<Overview>` block —
plain-language, ~80 words, 8th-grade reading level — then the
technical body below.

```mdx
---
title: 'Project Title'
description: 'One-line summary that appears under the card title.'
date: 2026-04-01
tag: 'Dashboard'
image: '/images/project-cover.jpg'
status: active            # or 'archived'
external: 'https://...'   # optional, projects only — opens live app
---

import Overview from "@components/Overview.astro";

<Overview>
  Plain-language summary here. Avoid jargon. Aim for ~80 words and an
  8th-grade reading level so a non-specialist can grok the project.
</Overview>

## Technical details

Full content, code samples, embedded iframes, etc.
```

## Tag taxonomy

Use one of these — keeps the listings consistent. Add new ones only when
you actually mean it.

| Tag                | Use for                                                       |
| ------------------ | -------------------------------------------------------------- |
| Dashboard          | R Shiny / Quarto dashboards, interactive web tools             |
| Statistics         | Classical statistical analysis, regression, hypothesis testing |
| Statistics Lab     | Teaching material, webR labs, interactive R curricula          |
| ML                 | Predictive modeling, classification, forecasting, deep learning |
| Survival analysis  | Time-to-event modeling                                         |
| Data viz           | Visualization-craft posts, Plotly walkthroughs, table design   |
| Data engineering   | ETL pipelines, schema design, DB work                          |
| Quarto             | Publishing, workshops, portfolio infrastructure                |
| Teaching           | Non-Stats-Lab teaching content                                 |

## Porting from Quarto

When you have a `.qmd` you want to bring over, run the port helper:

```bash
npm run port -- path/to/your-post/index.qmd
# Optional explicit collection + slug:
npm run port -- path/to/post.qmd projects custom-slug
```

The script (`scripts/qmd-to-mdx.ts`) reads the qmd, normalizes the
frontmatter to our schema, strips Quarto-only syntax (`{r}` chunks,
`:::` fence divs, `{=html}` blocks), and writes the result to
`src/content/<collection>/<slug>.mdx`.

After running, hand-polish:

- Add an `<Overview>` block at the top.
- Check the tag against the taxonomy above.
- Confirm the voice matches the rest of the site (first person,
  confident, no "this project demonstrates my ability to…").

## Tone of voice

- First person. Brian runs Epsilon Labs solo; "I" is more honest than "we".
- Confident, not boastful. Statements of capability, not aspirations.
- Short sentences over long ones. Comma splices acceptable when they
  carry rhythm.
- Avoid: "we believe", "passionate", "leverage", "synergy", emoji.
- Prefer: "I help", "I built", "Decision-grade", "Documented".

## Status banner

The pulsing pill at the top of the landing hero is `<StatusBanner>`.
Currently shows the principal's day-job at Oregon Department of
Education. If the day-job changes, edit the props on
`src/pages/index.astro` (search "StatusBanner"). The employer mark is
an `<img>` whose default `logoSrc` hot-links the ODE logo from
oregon.gov — to self-host it instead:

1. Save the logo to `public/images/ode-logo.png`.
2. Pass `logoSrc="/images/ode-logo.png"` from the page (or change the
   default in `src/components/StatusBanner.astro`).

## Don't

- Don't add R / Python execution at render time. This site is static.
- Don't introduce a CMS. The MDX + Zod loop is the CMS.
- Don't reach for a React component when a plain Astro one will do.
- Don't add a third theme layer. One `global.css` for tokens, Tailwind
  for utilities, components for composition. That's it.

## Deploy

Cloudflare Workers (static assets):

- Build command:  `npm run build` (prerenders everything into `dist/`)
- Deploy command: `npx wrangler deploy` — assets-only per
  `wrangler.jsonc`. Never add `@astrojs/cloudflare` / SSR: the OG route
  runs Node APIs + a native resvg binary at build time and cannot
  execute inside a Worker.
- Custom domain:  `epsilon-labs.org` (attached to the Worker in the
  Cloudflare dashboard)
