import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import general from '../data/settings/general.json';
import social from '../data/settings/social.json';

export const GET: APIRoute = async ({ site }) => {
  const pubs = await getCollection('publications');
  const projects = await getCollection('projects');
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const tools = await getCollection('webtools');

  const baseUrl = site?.href.replace(/\/$/, '') || '';

  let content = `# ${general.authorName}

**${general.authorTitle}**, ${general.authorAffiliation}

${general.siteDescription}

**Email:** ${general.authorEmail}
`;

  const socialLinks = [
    social.googleScholar ? `- [Google Scholar](${social.googleScholar})` : '',
    social.orcid ? `- [ORCID](${social.orcid})` : '',
    social.researchGate ? `- [ResearchGate](${social.researchGate})` : '',
  ].filter(Boolean);

  if (socialLinks.length > 0) {
    content += `\n## Academic Profiles\n${socialLinks.join('\n')}\n`;
  }

  // Publications
  if (pubs.length > 0) {
    const sortedPubs = pubs.sort((a, b) => b.data.year - a.data.year);
    content += `\n## Publications\n\n`;
    for (const pub of sortedPubs) {
      content += `### ${pub.data.title}\n`;
      content += `${pub.data.authors.join(', ')} (${pub.data.year})`;
      if (pub.data.journal) content += `. ${pub.data.journal}`;
      if (pub.data.volume) content += `, ${pub.data.volume}`;
      if (pub.data.pages) content += `, ${pub.data.pages}`;
      content += '.\n';
      if (pub.data.doi) content += `DOI: ${pub.data.doi}\n`;
      if (pub.data.abstract) content += `\n${pub.data.abstract}\n`;
      content += `\nURL: ${baseUrl}/publications/${pub.id}\n\n`;
    }
  }

  // Research Projects
  if (projects.length > 0) {
    content += `\n## Research Projects\n\n`;
    for (const project of projects) {
      content += `### ${project.data.title}\n`;
      content += `${project.data.description}\n`;
      if (project.data.collaborators?.length) {
        content += `Collaborators: ${project.data.collaborators.map((c) => c.name).join(', ')}\n`;
      }
      content += `\nURL: ${baseUrl}/research/${project.id}\n\n`;
    }
  }

  // Blog posts
  if (posts.length > 0) {
    const sortedPosts = posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
    content += `\n## Blog\n\n`;
    for (const post of sortedPosts) {
      content += `### ${post.data.title}\n`;
      content += `${post.data.pubDate.toISOString().split('T')[0]}\n`;
      content += `${post.data.description}\n`;
      content += `\nURL: ${baseUrl}/blog/${post.id}\n\n`;
    }
  }

  // Webtools
  if (tools.length > 0) {
    content += `\n## Webtools\n\n`;
    for (const tool of tools) {
      content += `### ${tool.data.title}\n`;
      content += `${tool.data.description}\n`;
      content += `URL: ${tool.data.url}\n\n`;
    }
  }

  return new Response(content, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
