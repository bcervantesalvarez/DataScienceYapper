// src/pages/blog/rss.xml.ts
// Auto-generated RSS feed for the blog collection. Aggregators
// (r-bloggers, feed readers, etc.) can subscribe to /blog/rss.xml.
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) =>
    !data.draft && data.status === 'active'
  );

  return rss({
    title: 'Epsilon Labs — Insights',
    description:
      'Notes on statistical practice, predictive modeling, dashboards, ' +
      'and the craft of analytical work — by Brian Cervantes Alvarez.',
    site: context.site!,
    items: posts
      .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.date,
        link: `/blog/${post.id}/`,
        categories: post.data.tag ? [post.data.tag] : undefined,
      })),
    customData: '<language>en-us</language>',
    stylesheet: false,
  });
}
