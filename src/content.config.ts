import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob, file } from 'astro/loaders';

/**
 * Parser for the taxonomy JSON files. Each file has shape:
 *   { "items": [ { "id": "...", "label": "...", ... }, ... ] }
 * Returns the items array so Astro treats each item as a collection entry.
 * Each item's `id` field becomes the entry's id.
 */
const taxonomyParser = (text: string) => {
  const parsed = JSON.parse(text);
  return Array.isArray(parsed?.items) ? parsed.items : [];
};

/**
 * Optional number that tolerates the empty string "" that Decap CMS
 * sometimes writes when a user clears an optional number input.
 * Treats "" and null as undefined; coerces real strings/numbers normally.
 */
const optionalNumber = z.preprocess(
  (val) => {
    if (val === '' || val === null || val === undefined) return undefined;
    if (typeof val === 'string') {
      const n = Number(val);
      return Number.isFinite(n) ? n : undefined;
    }
    return val;
  },
  z.number().optional()
);

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    archived: z.boolean().default(false),
    // Cross-collection relationships (one-directional; edit the reverse manually if needed)
    relatedResearch: z.array(z.string()).default([]),
    relatedPublications: z.array(z.string()).default([]),
    relatedWebtools: z.array(z.string()).default([]),
    showLinkedResearch: z.boolean().default(true),
    showLinkedPublications: z.boolean().default(true),
    showLinkedWebtools: z.boolean().default(true),
  }),
});

const publications = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/publications' }),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()),
    year: z.number(),
    type: z.string().default('journal-article'),
    status: z.enum(['published', 'forthcoming', 'under-review']).default('published'),
    journal: z.string().optional(),
    volume: z.string().optional(),
    issue: z.string().optional(),
    pages: z.string().optional(),
    doi: z.string().optional(),
    abstract: z.string().optional(),
    pdfUrl: z.string().optional(),
    externalUrl: z.string().optional(),
    tags: z.array(z.string()).default([]),
    sortOrder: optionalNumber,
    language: z.string().default('en'),
    issn: z.string().optional(),
    publicationDate: z.coerce.date().optional(),
    attachments: z
      .array(
        z.object({
          label: z.string(),
          file: z.string().optional(),
          externalUrl: z.string().optional(),
        })
      )
      .default([]),
    archived: z.boolean().default(false),
    // Cross-collection relationships
    relatedResearch: z.array(z.string()).default([]),
    relatedWebtools: z.array(z.string()).default([]),
    relatedBlog: z.array(z.string()).default([]),
    showLinkedResearch: z.boolean().default(true),
    showLinkedWebtools: z.boolean().default(true),
    showLinkedBlog: z.boolean().default(true),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string().default('other'),
    status: z.enum(['active', 'completed']).default('active'),
    collaborators: z
      .array(
        z.object({
          name: z.string(),
          institution: z.string().optional(),
        })
      )
      .default([]),
    funding: z.string().optional(),
    image: z.string().optional(),
    sortOrder: optionalNumber,
    featuredDocument: z.string().optional(),
    featuredDocumentLabel: z.string().optional(),
    featuredDocumentDescription: z.string().optional(),
    attachments: z
      .array(
        z.object({
          label: z.string(),
          file: z.string().optional(),
          externalUrl: z.string().optional(),
        })
      )
      .default([]),
    archived: z.boolean().default(false),
    // Cross-collection relationships
    relatedPublications: z.array(z.string()).default([]),
    relatedWebtools: z.array(z.string()).default([]),
    relatedBlog: z.array(z.string()).default([]),
    showLinkedPublications: z.boolean().default(true),
    showLinkedWebtools: z.boolean().default(true),
    showLinkedBlog: z.boolean().default(true),
  }),
});

const webtools = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/webtools' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    url: z.string(),
    image: z.string().optional(),
    funding: z.string().optional(),
    sortOrder: optionalNumber,
    archived: z.boolean().default(false),
    // Cross-collection relationships
    relatedResearch: z.array(z.string()).default([]),
    relatedPublications: z.array(z.string()).default([]),
    relatedBlog: z.array(z.string()).default([]),
    showLinkedResearch: z.boolean().default(true),
    showLinkedPublications: z.boolean().default(true),
    showLinkedBlog: z.boolean().default(true),
  }),
});

const links = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/links' }),
  schema: z.object({
    title: z.string(),
    url: z.string(),
    category: z.string().default('organizations'),
    description: z.string().optional(),
    sortOrder: optionalNumber,
    archived: z.boolean().default(false),
  }),
});

// Category collections — editable from CMS as a single "Types & Categories"
// file collection backed by three JSON files. Each entry's `id` comes from
// the array item's `id` field via the custom parser.
const projectCategories = defineCollection({
  loader: file('src/data/settings/project-categories.json', { parser: taxonomyParser }),
  schema: z.object({
    label: z.string(),
    order: z.number().default(99),
    description: z.string().optional(),
  }),
});

const publicationTypes = defineCollection({
  loader: file('src/data/settings/publication-types.json', { parser: taxonomyParser }),
  schema: z.object({
    label: z.string(),
    singular: z.string().optional(),
    order: z.number().default(99),
  }),
});

const linkCategories = defineCollection({
  loader: file('src/data/settings/link-categories.json', { parser: taxonomyParser }),
  schema: z.object({
    label: z.string(),
    order: z.number().default(99),
  }),
});

export const collections = {
  blog,
  publications,
  projects,
  webtools,
  links,
  projectCategories,
  publicationTypes,
  linkCategories,
};
