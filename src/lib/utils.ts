import general from '../data/settings/general.json';
import sections from '../data/settings/sections.json';
import social from '../data/settings/social.json';
import home from '../data/settings/home.json';
import about from '../data/settings/about.json';
import contact from '../data/settings/contact.json';
import researchPage from '../data/settings/research-page.json';
import publicationsPage from '../data/settings/publications-page.json';
import blogPage from '../data/settings/blog-page.json';
import webtoolsPage from '../data/settings/webtools-page.json';
import linksPage from '../data/settings/links-page.json';
import cvPage from '../data/settings/cv-page.json';
import footer from '../data/settings/footer.json';
import notFound from '../data/settings/not-found.json';

export function getSettings() {
  return {
    general,
    sections,
    social,
    home,
    about,
    contact,
    researchPage,
    publicationsPage,
    blogPage,
    webtoolsPage,
    linksPage,
    cvPage,
    footer,
    notFound,
  };
}

export function getEnabledSections() {
  return sections.sections
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);
}

export function isSectionEnabled(id: string): boolean {
  const section = sections.sections.find((s) => s.id === id);
  return section?.enabled ?? false;
}

/** Format a publication in APA-like style */
export function formatCitation(pub: {
  authors: string[];
  year: number;
  title: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
}): string {
  const authors = pub.authors.join(', ');
  let citation = `${authors} (${pub.year}). ${pub.title}.`;
  if (pub.journal) {
    citation += ` *${pub.journal}*`;
    if (pub.volume) citation += `, ${pub.volume}`;
    if (pub.issue) citation += `(${pub.issue})`;
    if (pub.pages) citation += `, ${pub.pages}`;
    citation += '.';
  }
  if (pub.doi) {
    citation += ` https://doi.org/${pub.doi}`;
  }
  return citation;
}

/** Parse "102-135" into { first: "102", last: "135" } */
export function parsePages(pages: string | undefined): { first?: string; last?: string } {
  if (!pages) return {};
  const parts = pages.split(/[-–]/);
  return {
    first: parts[0]?.trim(),
    last: parts[1]?.trim(),
  };
}

/**
 * Map a photoFocus setting to a CSS object-position value.
 * Controls where faces/subjects are when the photo is cropped to a square.
 */
export function photoFocusToCss(focus?: string): string {
  switch (focus) {
    case 'top':
      return 'center top';
    case 'upper':
      return 'center 25%';
    case 'center':
      return 'center center';
    case 'lower':
      return 'center 75%';
    case 'bottom':
      return 'center bottom';
    default:
      return 'center 25%'; // safe default for portraits
  }
}

/** Format a date as YYYY/MM/DD for Highwire Press tags */
export function formatCitationDate(year: number, publicationDate?: Date): string {
  if (publicationDate) {
    const d = new Date(publicationDate);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  }
  return `${year}/01/01`;
}

/**
 * Validate that every entry references a category that exists.
 * Fails the build with a clear error message if a broken reference is found.
 * This is how we enforce referential integrity — if Allen deletes a category
 * that's still used, the Netlify deploy fails and he sees the error.
 */
export function validateCategoryReferences<
  Entry extends { id: string; data: Record<string, unknown> }
>(
  entries: Entry[],
  categories: { id: string }[],
  fieldName: string,
  collectionName: string,
  categoryCollectionName: string
): void {
  const validIds = new Set(categories.map((c) => c.id));
  const missing: { entry: string; category: string }[] = [];

  for (const entry of entries) {
    const categoryId = entry.data[fieldName] as string | undefined;
    if (categoryId && !validIds.has(categoryId)) {
      missing.push({ entry: entry.id, category: categoryId });
    }
  }

  if (missing.length > 0) {
    const msg = missing
      .map((m) => `  • ${collectionName} "${m.entry}" references missing ${fieldName} "${m.category}"`)
      .join('\n');
    throw new Error(
      `\n\n❌ Referential integrity error in ${categoryCollectionName}:\n${msg}\n\n` +
        `Fix: Either restore the missing ${fieldName} in the CMS, or update the affected ${collectionName} to use a different one.\n`
    );
  }
}
