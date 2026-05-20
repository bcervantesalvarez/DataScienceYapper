# Working on this repo

Quick reference for Claude (or any agent / future-you) editing Epsilon
Labs. Goal: predictable file locations + typed contracts so changes
land cleanly with zero out-of-band coordination.

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
| Design tokens (colors)     | `src/styles/global.css` (`:root` + `[data-theme="dark"]`) |
| Tailwind utility names     | `tailwind.config.ts` (reads from the CSS vars)    |
| Site-wide HTML / `<head>`  | `src/layouts/BaseLayout.astro`                    |
| Navbar links               | `src/components/Navbar.astro` (`links` array)     |
| Footer copy / links        | `src/components/Footer.astro`                     |
| ODE / status banner copy   | passed as props from each page that uses `<StatusBanner>` |
| Buttons / CTAs             | `src/components/Button.astro` (variants: `primary`, `ghost`) |
| Card UI                    | `src/components/Card.astro`                       |
| Section heading + container| `src/components/Section.astro`                    |
| Page bodies                | `src/pages/<route>.astro`                         |
| Project/post/talk content  | `src/content/<collection>/<slug>.mdx`             |
| Content schemas            | `src/content/config.ts` (Zod, validated at build) |
| Static files (img, pdf)    | `public/` (served at the root URL)                |
| Site URL, integrations     | `astro.config.ts`                                 |
| Spam-defense JS for form   | inline `<script>` at the bottom of `src/pages/privacy.astro` |

## Conventions

- **TypeScript everywhere.** Component props get an `interface Props { ... }`
  at the top of the `---` frontmatter block.
- **Tailwind for styling.** Avoid one-off `<style>` blocks unless a
  pattern can't be expressed in utilities.
- **No magic strings.** Re-use the tokens (`bg-bg`, `text-ink`, …) so a
  palette change in `global.css` propagates everywhere.
- **Animations** use Tailwind's `animate-el-rise`, `animate-el-fade`,
  `animate-el-ping` — defined in `tailwind.config.ts → keyframes`.
- **Respect `prefers-reduced-motion`.** Use `motion-safe:` Tailwind
  variant for any non-essential motion.

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

Frontmatter contract in `src/content/config.ts`. If the build fails
with a Zod error, the message names the missing/wrong field.

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
`src/pages/index.astro` (search "StatusBanner"). To swap the inline
SVG placeholder for the real ODE logo:

1. Save the logo to `public/images/ode-logo.png`.
2. In `src/components/StatusBanner.astro`, replace the inline `<svg>`
   block with `<img src="/images/ode-logo.png" alt="..." />`.

## Don't

- Don't add R / Python execution at render time. This site is static.
- Don't introduce a CMS. The MDX + Zod loop is the CMS.
- Don't reach for a React component when a plain Astro one will do.
- Don't add a third theme layer. One `global.css` for tokens, Tailwind
  for utilities, components for composition. That's it.

## Deploy

Cloudflare Pages:

- Build command: `npm run build`
- Output dir:    `dist`
- Custom domain: `epsilon-labs.org`
