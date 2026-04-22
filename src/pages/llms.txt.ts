import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import general from '../data/settings/general.json';

export const GET: APIRoute = async ({ site }) => {
  const pubs = await getCollection('publications');
  const sortedPubs = pubs
    .sort((a, b) => b.data.year - a.data.year)
    .slice(0, 10);

  const baseUrl = site?.href.replace(/\/$/, '') || '';

  let content = `# ${general.authorName} — ${general.authorTitle}

> ${general.siteDescription}

## Pages
- [About](${baseUrl}/about): Academic background, education, research interests, and CV
- [Publications](${baseUrl}/publications): Peer-reviewed journal articles, working papers, and book chapters
- [Research](${baseUrl}/research): Active and completed research projects on environmental economics
- [Blog](${baseUrl}/blog): News, commentary, and updates on environmental policy
- [Webtools](${baseUrl}/webtools): Forest conservation targeting and evaluation tools
- [Links](${baseUrl}/links): Professional resources and organizations
- [Contact](${baseUrl}/contact): ${general.authorAffiliation} address and email
`;

  if (sortedPubs.length > 0) {
    content += `\n## Key Publications\n`;
    for (const pub of sortedPubs) {
      content += `- [${pub.data.title}](${baseUrl}/publications/${pub.id}): ${pub.data.authors.join(', ')} (${pub.data.year})${pub.data.journal ? `. ${pub.data.journal}` : ''}\n`;
    }
  }

  return new Response(content, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
