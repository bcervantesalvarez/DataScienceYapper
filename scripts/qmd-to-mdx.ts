#!/usr/bin/env tsx
/**
 * scripts/qmd-to-mdx.ts
 *
 * Convert a single Quarto `.qmd` file into an Astro MDX entry that
 * lands in `src/content/<collection>/<slug>.mdx`.
 *
 * Usage:
 *   npm run port -- path/to/some-post/index.qmd
 *   npm run port -- path/to/some-post/index.qmd projects my-custom-slug
 *
 * What it does
 *   - Reads YAML frontmatter (gray-matter)
 *   - Normalizes the date to YYYY-MM-DD
 *   - Maps known frontmatter fields onto our Astro content schema:
 *       title, description, date, image, tag, status, external
 *   - Drops noisy Quarto-only fields (format, execute, filters, …)
 *   - Converts Quarto-specific body syntax to MDX-safe Markdown:
 *       ```{r} / ```{python} / ```{webr-r}   →  ```r / ```python / ```r
 *       ::: {.column-page} … :::              →  unwrapped
 *       ::: {.callout-note} … :::             →  >  blockquote
 *       ```{=html}<raw>``` blocks              →  inline raw HTML
 *   - Writes to `src/content/<collection>/<slug>.mdx`
 *
 * It does NOT try to be perfect. After running, hand-polish:
 *   - Add an <Overview> block at the top.
 *   - Decide which images / iframes still apply.
 *   - Re-check the tag against the new taxonomy
 *     ("Dashboard", "Statistics", "ML", "Statistics Lab", "Data viz",
 *      "Data engineering", "Quarto", "Teaching", "Survival analysis").
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

type Collection = 'projects' | 'blog' | 'talks';

const ROOT = process.cwd();

function inferCollection(qmdPath: string): Collection {
  const p = qmdPath.replace(/\\/g, '/').toLowerCase();
  if (p.includes('/talks/')) return 'talks';
  if (p.includes('/projects/')) return 'projects';
  return 'blog';
}

function inferSlug(qmdPath: string): string {
  // Quarto convention: <slug>/index.qmd
  const dir = path.basename(path.dirname(path.resolve(qmdPath)));
  if (dir && dir !== '.' && dir !== '/' && path.basename(qmdPath) === 'index.qmd') {
    return dir;
  }
  // Otherwise: foo.qmd -> foo
  return path.basename(qmdPath, '.qmd');
}

function normalizeDate(raw: unknown): string {
  if (raw instanceof Date) return raw.toISOString().slice(0, 10);
  if (typeof raw !== 'string') return new Date().toISOString().slice(0, 10);

  // MM-DD-YYYY -> YYYY-MM-DD (Quarto's common format)
  const us = raw.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (us) {
    const [, m, d, y] = us;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // Already ISO-ish?
  const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    const [, y, m, d] = iso;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // Last resort: try Date parsing
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.valueOf())) return parsed.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

function transformBody(src: string): string {
  let out = src;

  // ```{r}, ```{r, opts}, ```{python}, ```{webr-r ...} → ```r / ```python / ```r
  out = out.replace(/```\{r[^}]*\}/g, '```r');
  out = out.replace(/```\{python[^}]*\}/g, '```python');
  out = out.replace(/```\{webr-r[^}]*\}/g, '```r');

  // Strip the wrapper for raw-html blocks: ```{=html} ... ``` -> ... (raw HTML)
  out = out.replace(/```\{=html\}\s*\n([\s\S]*?)\n```/g, (_m, inner) => inner);

  // Open of a Quarto fenced div  ::: { .foo .bar } or ::: foo  -> drop
  out = out.replace(/^:::+\s*\{?\.?[^}\n]*\}?\s*$/gm, '');

  // Close of a fenced div ":::"  -> drop
  out = out.replace(/^:::\s*$/gm, '');

  // Quarto callouts that survived can become blockquotes
  out = out.replace(
    /^::: \{\.callout-(note|warning|tip|important|caution)[^}]*\}([\s\S]*?):::/gm,
    (_m, _kind, inner) => inner.split('\n').map((l: string) => `> ${l}`).join('\n')
  );

  // Collapse 3+ blank lines into 2
  out = out.replace(/\n{3,}/g, '\n\n');

  return out.trim() + '\n';
}

const KEEP_FRONTMATTER = new Set([
  'title', 'description', 'date', 'image', 'tag', 'status', 'external',
  'venue', 'slidesUrl', 'readingTime',
]);

function trimFrontmatter(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(input)) {
    if (KEEP_FRONTMATTER.has(k)) out[k] = input[k];
  }
  // Default status if not given
  if (!('status' in out)) out.status = 'active';
  return out;
}

function main(): void {
  const [, , inputArg, collArg, slugArg] = process.argv;
  if (!inputArg) {
    console.error('Usage: npm run port -- <path/to/file.qmd> [collection] [slug]');
    process.exit(1);
  }
  const inputPath = path.resolve(inputArg);
  if (!fs.existsSync(inputPath)) {
    console.error(`Not found: ${inputPath}`);
    process.exit(1);
  }
  const collection = (collArg as Collection) ?? inferCollection(inputArg);
  const slug = slugArg ?? inferSlug(inputArg);

  const raw = fs.readFileSync(inputPath, 'utf-8');
  const parsed = matter(raw);

  const fm = trimFrontmatter(parsed.data);
  fm.date = normalizeDate(parsed.data.date);

  const body = transformBody(parsed.content);

  const outDir = path.join(ROOT, 'src', 'content', collection);
  const outPath = path.join(outDir, `${slug}.mdx`);
  fs.mkdirSync(outDir, { recursive: true });

  const stringified = matter.stringify(body, fm);
  fs.writeFileSync(outPath, stringified, 'utf-8');

  console.log(`Wrote ${path.relative(ROOT, outPath)}`);
  console.log(`Frontmatter: ${JSON.stringify(fm)}`);
  console.log('Next: add an <Overview> block at the top and check tag + voice.');
}

main();
