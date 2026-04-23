import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import general from '../data/settings/general.json';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => !data.draft && !data.archived);
  const sorted = posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: `${general.authorName} — Blog`,
    description: general.siteDescription,
    site: context.site!,
    items: sorted.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id}/`,
    })),
  });
}
