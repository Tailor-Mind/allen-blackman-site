import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

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
    sortOrder: z.number().optional(),
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
    sortOrder: z.number().optional(),
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
    relatedPublications: z.array(z.string()).default([]),
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
    sortOrder: z.number().optional(),
  }),
});

const links = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/links' }),
  schema: z.object({
    title: z.string(),
    url: z.string(),
    category: z.string().default('organizations'),
    description: z.string().optional(),
    sortOrder: z.number().optional(),
  }),
});

// Category collections — editable from CMS
const projectCategories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/project-categories' }),
  schema: z.object({
    label: z.string(),
    order: z.number().default(99),
    description: z.string().optional(),
  }),
});

const publicationTypes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/publication-types' }),
  schema: z.object({
    label: z.string(),
    singular: z.string().optional(),
    order: z.number().default(99),
  }),
});

const linkCategories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/link-categories' }),
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
