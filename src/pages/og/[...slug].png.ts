// src/pages/og/[...slug].png.ts
// Build-time OG image generator. Renders a 1200×630 PNG per content
// entry plus a /og/default.png shared by static pages.
//
// The endpoint is prerendered, so each path is written to disk during
// `astro build` and served as a static PNG.
import type { APIContext, GetStaticPathsResult } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { SITE_NAME, SITE_HOST, AUTHOR } from '@lib/site';

export const prerender = true;

const BYLINE = `${SITE_NAME} · ${AUTHOR.name}`;

const require = createRequire(import.meta.url);

// Load fonts once at module init.
const interBold = readFileSync(
  require.resolve('@fontsource/inter/files/inter-latin-700-normal.woff')
);
const interMedium = readFileSync(
  require.resolve('@fontsource/inter/files/inter-latin-500-normal.woff')
);
const newsreaderSerif = readFileSync(
  require.resolve('@fontsource/newsreader/files/newsreader-latin-600-normal.woff')
);

interface OGProps {
  title: string;
  tag?: string;
  kind?: string;
  byline?: string;
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const items: GetStaticPathsResult = [
    {
      params: { slug: 'default' },
      props: {
        title: SITE_NAME,
        kind: 'Statistical consulting',
        byline: AUTHOR.name,
      } satisfies OGProps,
    },
  ];

  for (const e of await getCollection('projects')) {
    items.push({
      params: { slug: `projects/${e.id}` },
      props: {
        title: e.data.title,
        tag: e.data.tag,
        kind: 'Project',
        byline: BYLINE,
      } satisfies OGProps,
    });
  }
  for (const e of await getCollection('blog')) {
    items.push({
      params: { slug: `blog/${e.id}` },
      props: {
        title: e.data.title,
        tag: e.data.tag,
        kind: 'Insight',
        byline: BYLINE,
      } satisfies OGProps,
    });
  }
  for (const e of await getCollection('talks')) {
    items.push({
      params: { slug: `talks/${e.id}` },
      props: {
        title: e.data.title,
        tag: e.data.tag,
        kind: 'Talk',
        byline: BYLINE,
      } satisfies OGProps,
    });
  }

  return items;
}

// Satori works with React-like node trees. We build them as plain
// objects to avoid a JSX dependency in a .ts file.
function makeNode(p: OGProps) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        background: '#0f1115',
        color: '#fbfaf7',
        padding: '60px 70px',
        fontFamily: 'Inter',
      },
      children: [
        // --- Top: brand mark ---
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', gap: 16 },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    width: 56, height: 56, borderRadius: 14,
                    background: '#fbfaf7', color: '#0f1115',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 38, fontFamily: 'Newsreader', fontWeight: 600,
                  },
                  children: 'ε',
                },
              },
              {
                type: 'span',
                props: {
                  style: { fontSize: 26, fontWeight: 600, letterSpacing: '-0.01em' },
                  children: SITE_NAME,
                },
              },
            ],
          },
        },

        // --- Middle: tag + title ---
        {
          type: 'div',
          props: {
            style: {
              display: 'flex', flexDirection: 'column', gap: 22,
              maxWidth: 1000,
            },
            children: [
              p.tag
                ? {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex', alignSelf: 'flex-start',
                        fontSize: 18, fontWeight: 700,
                        letterSpacing: '0.18em', textTransform: 'uppercase',
                        color: '#7aa5d6',
                        padding: '8px 14px',
                        borderRadius: 999,
                        background: 'rgba(122, 165, 214, 0.12)',
                        border: '1px solid rgba(122, 165, 214, 0.35)',
                      },
                      children: p.tag,
                    },
                  }
                : null,
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 72, lineHeight: 1.08,
                    fontFamily: 'Newsreader', fontWeight: 600,
                    letterSpacing: '-0.02em',
                  },
                  children: p.title,
                },
              },
            ].filter(Boolean),
          },
        },

        // --- Bottom: kind + byline ---
        {
          type: 'div',
          props: {
            style: {
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
              fontSize: 20, color: '#9da0a8', fontWeight: 500,
            },
            children: [
              { type: 'span', props: { children: p.kind ?? '' } },
              { type: 'span', props: { children: p.byline ?? SITE_HOST } },
            ],
          },
        },
      ],
    },
  } as unknown as Parameters<typeof satori>[0];
}

export async function GET({ props }: APIContext): Promise<Response> {
  const p = props as OGProps;

  const svg = await satori(makeNode(p), {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Inter',      data: interMedium,      weight: 500, style: 'normal' },
      { name: 'Inter',      data: interBold,        weight: 700, style: 'normal' },
      { name: 'Newsreader', data: newsreaderSerif,  weight: 600, style: 'normal' },
    ],
  });

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
    .render()
    .asPng();

  // Copy into a fresh Uint8Array<ArrayBuffer> — newer @types/node Buffer
  // generics (ArrayBufferLike) no longer satisfy BodyInit directly.
  const body = new Uint8Array(png);

  return new Response(body, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
