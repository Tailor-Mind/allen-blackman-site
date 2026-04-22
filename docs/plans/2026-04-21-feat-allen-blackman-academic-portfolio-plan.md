---
title: "feat: Allen Blackman Academic Portfolio Website"
type: feat
date: 2026-04-21
---

# Allen Blackman Academic Portfolio Website

## Overview

Build a production-ready academic portfolio website for Allen Blackman, Lead Economist at the Inter-American Development Bank (IDB). The site replaces an existing Google Sites page that suffers from zero search engine indexing and no LLM discoverability. The new site must be SEO-optimized for Google, Google Scholar, and LLM crawlers, with a CMS admin panel that allows a non-technical user to manage all content independently.

**Stack:** Astro 5 + Decap CMS 3.x + Netlify (free tier)

**Brainstorm:** `docs/brainstorms/2026-04-21-allen-blackman-portfolio-brainstorm.md`

---

## Problem Statement

Allen Blackman's current Google Sites page (`sites.google.com/view/allenblackman8`) has:
- No Google indexing (not discoverable via search)
- No LLM discoverability (never surfaced by ChatGPT, Claude, Perplexity)
- No meta description, no structured data, no sitemap, no OG tags
- Page title is just "AllenBlackman8" with no keywords
- Broken C.V. page (404)
- No admin panel — content changes require editing Google Sites directly
- No publication list with citations, DOIs, or PDFs

The site serves two audiences equally: **academic peers** (researchers, journal editors, co-authors) and **policy makers/institutions** (IDB colleagues, government officials, NGOs).

---

## Proposed Solution

A static site built with Astro, managed via Decap CMS, hosted free on Netlify. This gives:
- Pure HTML output (fastest possible page loads, perfect crawlability)
- Full SEO control (meta tags, JSON-LD, Highwire Press tags, sitemap, robots.txt, llms.txt)
- Visual admin panel at `/admin` for all content management
- Free hosting with custom domain, SSL, and auto-deploy on content changes
- Content stored as Markdown/JSON in a Git repo (no vendor lock-in)

---

## Technical Approach

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        NETLIFY                               │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │  CDN/SSL   │  │   Identity   │  │    Git Gateway       │ │
│  │  (hosting) │  │   (auth)     │  │  (CMS → Git commits) │ │
│  └─────┬──────┘  └──────┬───────┘  └──────────┬──────────┘ │
└────────┼────────────────┼──────────────────────┼────────────┘
         │                │                      │
         ▼                ▼                      ▼
┌─────────────┐   ┌──────────────┐      ┌──────────────┐
│  Static HTML │   │  /admin UI   │      │  GitHub Repo │
│  (Astro SSG) │   │  (Decap CMS) │◄────►│  (content)   │
└─────────────┘   └──────────────┘      └──────────────┘
         ▲                                       │
         │          ┌────────────────┐           │
         └──────────┤  Astro Build   │◄──────────┘
                    │  (on push)     │
                    └────────────────┘
```

**Data flow:**
1. Allen edits content in Decap CMS at `/admin`
2. Decap CMS commits changes to GitHub repo via Git Gateway
3. Netlify detects the push and triggers an Astro build
4. Astro generates static HTML with all SEO metadata
5. Netlify deploys the new HTML to its CDN

### Project Structure

```
allenbs/
├── public/
│   ├── admin/
│   │   ├── index.html          # Decap CMS admin interface
│   │   └── config.yml          # Decap CMS configuration
│   ├── uploads/                # CMS-uploaded media (images, PDFs)
│   ├── favicon.ico
│   └── og-default.jpg          # Default Open Graph image
├── src/
│   ├── components/
│   │   ├── BaseHead.astro      # Meta tags, OG, JSON-LD, citation tags
│   │   ├── Header.astro        # Site header + dynamic navigation
│   │   ├── Footer.astro        # Site footer
│   │   ├── JsonLd.astro        # JSON-LD structured data helper
│   │   ├── CitationMeta.astro  # Highwire Press citation meta tags
│   │   ├── PublicationCard.astro
│   │   ├── ProjectCard.astro
│   │   ├── BlogPostCard.astro
│   │   ├── WebtoolCard.astro
│   │   └── LinkCard.astro
│   ├── content.config.ts       # Astro Content Collections schemas
│   ├── data/
│   │   ├── blog/               # Markdown blog posts
│   │   ├── publications/       # Markdown publication entries
│   │   ├── projects/           # Markdown research projects
│   │   ├── webtools/           # Markdown webtool entries
│   │   ├── links/              # Markdown external link entries
│   │   └── settings/
│   │       ├── general.json    # Site title, description, author info, colors
│   │       ├── sections.json   # Section visibility toggles + nav order
│   │       └── social.json     # Google Scholar, ORCID, LinkedIn, etc.
│   ├── layouts/
│   │   └── BaseLayout.astro    # Main layout with header, footer, theme CSS vars
│   ├── pages/
│   │   ├── index.astro         # Home page
│   │   ├── about.astro         # About / Bio page
│   │   ├── publications/
│   │   │   ├── index.astro     # Publications listing (grouped by type)
│   │   │   └── [...slug].astro # Individual publication pages
│   │   ├── research/
│   │   │   ├── index.astro     # Research projects listing
│   │   │   └── [...slug].astro # Individual project pages
│   │   ├── blog/
│   │   │   ├── index.astro     # Blog listing
│   │   │   └── [...slug].astro # Individual blog posts
│   │   ├── webtools.astro      # Webtools page
│   │   ├── links.astro         # External links page
│   │   ├── contact.astro       # Contact page
│   │   ├── 404.astro           # Custom 404 page
│   │   ├── robots.txt.ts       # Dynamic robots.txt
│   │   ├── llms.txt.ts         # Auto-generated llms.txt
│   │   ├── llms-full.txt.ts    # Auto-generated full content for LLMs
│   │   └── rss.xml.ts          # RSS feed for blog
│   └── styles/
│       └── global.css          # Global styles with CSS custom properties
├── astro.config.mjs
├── netlify.toml
├── package.json
└── tsconfig.json
```

### Implementation Phases

---

#### Phase 1: Project Scaffolding & Core Layout

**Tasks:**
- [ ] Initialize Astro 5 project with TypeScript
- [ ] Configure `astro.config.mjs` with sitemap integration and site URL placeholder
- [ ] Create `netlify.toml` with build command (`astro build`), publish dir (`dist`), Node version (`20`)
- [ ] Create `BaseLayout.astro` with CSS custom properties for theme colors (read from `general.json`)
- [ ] Create `Header.astro` with dynamic navigation (reads `sections.json` for toggle state and order)
- [ ] Create `Footer.astro` with copyright, contact link, social icons
- [ ] Create `BaseHead.astro` with meta tags, OG tags, canonical URL, favicon
- [ ] Create `global.css` with clean academic minimal design system (typography, spacing, responsive grid)
- [ ] Create `404.astro` custom error page with navigation to active sections
- [ ] Initialize Git repo, `.gitignore`, and push to GitHub

**Key design decisions:**
- CSS custom properties for theme colors: `--color-primary`, `--color-accent`, `--color-bg`, `--color-text`
- `BaseLayout.astro` reads `general.json` at build time and injects CSS variables into `:root`
- Navigation dynamically reads `sections.json` and only renders links for enabled sections
- Mobile-responsive with hamburger menu at small breakpoints
- Typography: system font stack for performance, clean serif for headings, sans-serif for body
- Target WCAG 2.1 AA: skip-to-content link, proper focus states, semantic HTML, color contrast

**Files:**
- `astro.config.mjs`
- `netlify.toml`
- `package.json`
- `tsconfig.json`
- `src/layouts/BaseLayout.astro`
- `src/components/BaseHead.astro`
- `src/components/Header.astro`
- `src/components/Footer.astro`
- `src/pages/404.astro`
- `src/styles/global.css`

---

#### Phase 2: Content Collections & CMS Configuration

**Tasks:**
- [ ] Define all Content Collections in `src/content.config.ts`
- [ ] Create initial data files for settings (`general.json`, `sections.json`, `social.json`)
- [ ] Create `public/admin/index.html` (Decap CMS entry point with Netlify Identity widget)
- [ ] Create `public/admin/config.yml` with all collection definitions
- [ ] Add Netlify Identity widget script to `BaseLayout.astro` for login redirect

**Content Collection Schemas:**

**Publications** (`src/data/publications/*.md`):
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | Yes | Paper title |
| authors | list of strings | Yes | All co-authors |
| year | number | Yes | Publication year |
| type | select | Yes | "journal-article", "working-paper", "book-chapter", "policy-report" |
| status | select | Yes | "published", "forthcoming", "under-review" |
| journal | string | No | Journal or publisher name |
| volume | string | No | Volume number |
| issue | string | No | Issue number |
| pages | string | No | Page range (e.g., "102-135") |
| doi | string | No | DOI identifier |
| abstract | text | No | Paper abstract |
| pdfUrl | file | No | Uploaded PDF or external URL |
| externalUrl | string | No | Publisher or SSRN link |
| tags | list | No | Topic tags |
| sortOrder | number | No | Manual sort override within type/year |
| body | markdown | No | Additional notes or extended abstract |

**Blog Posts** (`src/data/blog/*.md`):
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | Yes | Post title |
| description | text | Yes | Short summary (used in OG description) |
| pubDate | datetime | Yes | Publish date |
| updatedDate | datetime | No | Last updated |
| heroImage | image | No | Featured image |
| tags | list | No | Topic tags |
| draft | boolean | No | Default true (hides from listing) |
| body | markdown | Yes | Post content |

**Research Projects** (`src/data/projects/*.md`):
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | Yes | Project name |
| description | text | Yes | Short summary |
| category | select | Yes | "pollution", "land-use", "climate", "land-tenure", "other" |
| status | select | Yes | "active", "completed" |
| collaborators | list of objects | No | Name + institution |
| funding | string | No | Funding source |
| image | image | No | Project image |
| sortOrder | number | No | Display order within category |
| body | markdown | Yes | Full project description |

**Webtools** (`src/data/webtools/*.md`):
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | Yes | Tool name |
| description | text | Yes | What the tool does |
| url | string | Yes | External link to the tool |
| image | image | No | Screenshot or logo |
| funding | string | No | Funding source |
| sortOrder | number | No | Display order |
| body | markdown | No | Extended description |

**Links** (`src/data/links/*.md`):
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | Yes | Link name |
| url | string | Yes | External URL |
| category | select | Yes | "organizations", "research-networks", "institutions", "academic" |
| description | text | No | Brief description |
| sortOrder | number | No | Display order within category |

**Site Settings** (JSON file collections — singleton pattern):

`general.json`:
```json
{
  "siteTitle": "Allen Blackman",
  "siteDescription": "Environmental economist at the Inter-American Development Bank specializing in pollution, land use, agricultural supply chains, and climate change in developing countries.",
  "authorName": "Allen Blackman",
  "authorTitle": "Lead Economist",
  "authorAffiliation": "Inter-American Development Bank",
  "authorEmail": "allenb@iadb.org",
  "authorPhoto": "/uploads/allen-blackman.jpg",
  "primaryColor": "#1a365d",
  "accentColor": "#2b6cb0",
  "googleAnalyticsId": ""
}
```

`sections.json`:
```json
{
  "sections": [
    { "id": "home", "label": "Home", "path": "/", "enabled": true, "order": 1 },
    { "id": "about", "label": "About", "path": "/about", "enabled": true, "order": 2 },
    { "id": "research", "label": "Research", "path": "/research", "enabled": true, "order": 3 },
    { "id": "publications", "label": "Publications", "path": "/publications", "enabled": true, "order": 4 },
    { "id": "blog", "label": "Blog", "path": "/blog", "enabled": true, "order": 5 },
    { "id": "webtools", "label": "Webtools", "path": "/webtools", "enabled": true, "order": 6 },
    { "id": "links", "label": "Links", "path": "/links", "enabled": true, "order": 7 },
    { "id": "contact", "label": "Contact", "path": "/contact", "enabled": true, "order": 8 }
  ],
  "showCvDownload": true,
  "cvFile": "/uploads/allen-blackman-cv.pdf"
}
```

`social.json`:
```json
{
  "googleScholar": "",
  "orcid": "",
  "researchGate": "",
  "academiaEdu": "",
  "linkedin": "",
  "twitter": "",
  "github": ""
}
```

**Decap CMS `config.yml`:**
Defines backend (git-gateway), media folder (public/uploads), and all collections matching the schemas above. Uses `publish_mode: editorial_workflow` for draft/review/publish flow. File collections for settings (singleton pattern). Folder collections for blog, publications, projects, webtools, links.

**Files:**
- `src/content.config.ts`
- `src/data/settings/general.json`
- `src/data/settings/sections.json`
- `src/data/settings/social.json`
- `public/admin/index.html`
- `public/admin/config.yml`

---

#### Phase 3: Pages & Components

**Tasks:**
- [ ] Build Home page (`src/pages/index.astro`) — hero section with photo, intro text, featured research areas, quick links to key sections
- [ ] Build About page (`src/pages/about.astro`) — extended bio, education, career, affiliations, CV download button (reads `sections.json` for CV toggle)
- [ ] Build Publications listing (`src/pages/publications/index.astro`) — grouped by type (journal articles, working papers, book chapters, policy reports), sorted by year descending within each group
- [ ] Build individual Publication page (`src/pages/publications/[...slug].astro`) — full citation, abstract, PDF download, DOI link, Highwire Press meta tags, ScholarlyArticle JSON-LD
- [ ] Build Research listing (`src/pages/research/index.astro`) — grouped by category, with project cards
- [ ] Build individual Research page (`src/pages/research/[...slug].astro`) — full description, collaborators, funding, linked publications
- [ ] Build Blog listing (`src/pages/blog/index.astro`) — reverse chronological, with post cards
- [ ] Build individual Blog post (`src/pages/blog/[...slug].astro`) — full content, tags, date, OG tags
- [ ] Build Webtools page (`src/pages/webtools.astro`) — tool cards with descriptions and external links
- [ ] Build Links page (`src/pages/links.astro`) — grouped by category
- [ ] Build Contact page (`src/pages/contact.astro`) — address, phone, email, institutional affiliation, map embed (optional)
- [ ] Create `PublicationCard.astro` — citation-formatted card with APA-style formatting
- [ ] Create `ProjectCard.astro`, `BlogPostCard.astro`, `WebtoolCard.astro`, `LinkCard.astro`

**Section toggle behavior:**
- Each page checks `sections.json` at build time. If the section is disabled, the page renders a redirect to `/` or a 404 depending on approach.
- The simpler approach: pages always exist in the build but the navigation hides disabled sections. A disabled section's URL still works but is not linked from anywhere. This avoids broken URLs and is SEO-safe.
- Home page is always enabled (cannot be toggled off — it's the root route).

**Publication page SEO (critical):**
Each individual publication page includes in `<head>`:
1. Standard meta tags (title, description)
2. Open Graph tags (og:type="article")
3. Twitter Card tags
4. Canonical URL
5. Highwire Press citation meta tags:
   ```html
   <meta name="citation_title" content="Paper Title">
   <meta name="citation_author" content="Smith, Allen B.">
   <meta name="citation_publication_date" content="2024/06/15">
   <meta name="citation_journal_title" content="Journal Name">
   <meta name="citation_volume" content="118">
   <meta name="citation_firstpage" content="102">
   <meta name="citation_lastpage" content="135">
   <meta name="citation_doi" content="10.1016/j.jeem.2024.102935">
   <meta name="citation_pdf_url" content="https://domain.com/uploads/paper.pdf">
   ```
6. JSON-LD ScholarlyArticle structured data

**Component:** `src/components/CitationMeta.astro`
Takes publication data as props, renders all Highwire Press tags. Conditionally omits tags for empty fields.

**Files:**
- `src/pages/index.astro`
- `src/pages/about.astro`
- `src/pages/publications/index.astro`
- `src/pages/publications/[...slug].astro`
- `src/pages/research/index.astro`
- `src/pages/research/[...slug].astro`
- `src/pages/blog/index.astro`
- `src/pages/blog/[...slug].astro`
- `src/pages/webtools.astro`
- `src/pages/links.astro`
- `src/pages/contact.astro`
- `src/components/CitationMeta.astro`
- `src/components/PublicationCard.astro`
- `src/components/ProjectCard.astro`
- `src/components/BlogPostCard.astro`
- `src/components/WebtoolCard.astro`
- `src/components/LinkCard.astro`

---

#### Phase 4: SEO & LLM Discoverability

**Tasks:**
- [ ] Create `JsonLd.astro` component — renders `<script type="application/ld+json">` with `set:html={JSON.stringify(data)}`
- [ ] Add Person + ProfilePage JSON-LD to homepage (reads from `general.json` and `social.json`)
- [ ] Add ScholarlyArticle JSON-LD to each publication page
- [ ] Add BlogPosting JSON-LD to each blog post
- [ ] Create `src/pages/robots.txt.ts` — dynamic robots.txt allowing all crawlers including GPTBot, ClaudeBot, PerplexityBot, with sitemap reference
- [ ] Create `src/pages/llms.txt.ts` — auto-generated from settings + content collections at build time
- [ ] Create `src/pages/llms-full.txt.ts` — concatenated Markdown of all site content for LLM ingestion
- [ ] Create `src/pages/rss.xml.ts` — RSS feed for blog posts using `@astrojs/rss`
- [ ] Verify sitemap.xml generation via `@astrojs/sitemap` integration
- [ ] Add `<link rel="alternate" type="application/rss+xml">` to BaseHead for blog
- [ ] Ensure all pages have unique, descriptive `<title>` tags and meta descriptions

**robots.txt content:**
```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Disallow: /admin/

Sitemap: https://DOMAIN/sitemap-index.xml
```

**llms.txt** — Auto-generated at build time from content collections:
```markdown
# Allen Blackman — Environmental Economist

> Lead Economist at the Inter-American Development Bank. Research focuses on
> air and water pollution, land use change, agricultural supply chains, and
> climate change in developing countries.

## Pages
- [About](https://DOMAIN/about): Academic background, research interests, CV
- [Publications](https://DOMAIN/publications): Peer-reviewed articles, working papers
- [Research](https://DOMAIN/research): Active and completed research projects
- [Blog](https://DOMAIN/blog): News, commentary, and updates
- [Webtools](https://DOMAIN/webtools): Forest conservation targeting and evaluation tools
- [Contact](https://DOMAIN/contact): IDB address and email

## Key Publications
- [Title 1](https://DOMAIN/publications/slug-1): Brief description
- [Title 2](https://DOMAIN/publications/slug-2): Brief description
...
```

**Files:**
- `src/components/JsonLd.astro`
- `src/pages/robots.txt.ts`
- `src/pages/llms.txt.ts`
- `src/pages/llms-full.txt.ts`
- `src/pages/rss.xml.ts`

---

#### Phase 5: Content Migration

**Tasks:**
- [ ] Scrape existing content from `sites.google.com/view/allenblackman8` (home, research, webtools, links, contact)
- [ ] Create Markdown files for each research project (from Research page content)
- [ ] Create Markdown files for each webtool (FCTT, FCET)
- [ ] Create Markdown files for external links (grouped by category)
- [ ] Populate `general.json` with Allen's info (name, title, affiliation, email, bio)
- [ ] Populate `social.json` with Google Scholar, ResearchGate, Academia.edu URLs
- [ ] Download and optimize Allen's profile photo
- [ ] Create initial publication entries from Google Scholar profile (if accessible)
- [ ] Create a sample blog post as template
- [ ] Populate About page content from homepage intro + expanded bio
- [ ] Populate Contact page with IDB address, phone, email
- [ ] Verify all migrated content against the original site (checklist)

**Migration validation checklist:**
- [ ] Home page intro text matches
- [ ] All research projects from all categories migrated
- [ ] FCTT and FCET webtools with correct descriptions and links
- [ ] All external links with correct URLs and categories
- [ ] Contact information accurate (address, phone, email)
- [ ] Social/academic profile links working
- [ ] Profile photo present and sized correctly

**Files:**
- `src/data/projects/*.md` (one per research project)
- `src/data/webtools/*.md` (FCTT, FCET)
- `src/data/links/*.md` (all external links)
- `src/data/publications/*.md` (initial entries)
- `src/data/blog/*.md` (sample post)
- `src/data/settings/general.json` (populated)
- `src/data/settings/social.json` (populated)
- `public/uploads/allen-blackman.jpg`

---

#### Phase 6: Deployment & CMS Auth Setup

**Tasks:**
- [ ] Push repo to GitHub
- [ ] Connect GitHub repo to Netlify ("Import existing project")
- [ ] Configure build settings: command `astro build`, publish dir `dist`, Node 20
- [ ] Enable Netlify Identity (set to Invite Only)
- [ ] Enable Git Gateway (under Identity > Services)
- [ ] Invite Allen as a CMS user via email
- [ ] Configure custom domain DNS (CNAME or Netlify DNS)
- [ ] Verify SSL certificate auto-provisioning
- [ ] Test CMS login flow at `/admin`
- [ ] Test content editing + publish + auto-deploy cycle
- [ ] Submit sitemap to Google Search Console
- [ ] Submit site to Bing Webmaster Tools
- [ ] Update Allen's Google Scholar profile URL to new domain
- [ ] Add "This site has moved" notice to old Google Sites page

**Files:**
- `netlify.toml` (already created in Phase 1)

---

## Section Toggle Design

**How it works:**
- `sections.json` contains an array of section objects with `id`, `label`, `path`, `enabled`, and `order` fields
- `Header.astro` reads this at build time, filters to `enabled: true`, sorts by `order`, renders nav links
- All pages are always built (URLs always exist) — toggling only controls navigation visibility
- This means a direct URL still works even if the section is hidden from nav (no broken links, no SEO damage)
- Home (`/`) is always rendered regardless of toggle state — it's the root route

**Why not 404 toggled-off sections:**
- Avoids broken bookmarks and inbound links
- Avoids SEO penalties from pages disappearing and reappearing
- Simpler implementation — no conditional build logic
- The section is simply "unlisted" from navigation, not deleted

**In the CMS admin panel:**
Allen sees a "Section Toggles" settings page with boolean checkboxes for each section and number fields for ordering.

---

## Theme Customization Design

**What's configurable from admin:**
| Setting | CSS Variable | Affects |
|---------|-------------|---------|
| Primary Color | `--color-primary` | Headings, nav links, buttons |
| Accent Color | `--color-accent` | Hover states, borders, highlights |

**How it works:**
1. Allen changes colors in CMS Settings > General
2. CMS commits updated `general.json` to Git
3. Netlify rebuilds
4. `BaseLayout.astro` reads `general.json` and injects CSS custom properties into a `<style>` tag in `<head>`:
   ```html
   <style>:root { --color-primary: #1a365d; --color-accent: #2b6cb0; }</style>
   ```
5. All CSS references these variables

**What's NOT configurable (requires developer):**
- Typography / fonts
- Layout structure
- Spacing scale
- Component structure

This is intentional — keeps the admin simple and prevents Allen from accidentally breaking the layout.

---

## URL Scheme

| Page | URL | Notes |
|------|-----|-------|
| Home | `/` | Always exists |
| About | `/about` | |
| Publications listing | `/publications` | Grouped by type |
| Individual publication | `/publications/{slug}` | Slug from filename |
| Research listing | `/research` | Grouped by category |
| Individual project | `/research/{slug}` | |
| Blog listing | `/blog` | Reverse chronological |
| Individual post | `/blog/{slug}` | |
| Webtools | `/webtools` | Single page |
| Links | `/links` | Single page |
| Contact | `/contact` | Single page |
| RSS feed | `/rss.xml` | Blog feed |
| Sitemap | `/sitemap-index.xml` | Auto-generated |
| Robots | `/robots.txt` | Dynamic |
| LLM summary | `/llms.txt` | Auto-generated |
| LLM full content | `/llms-full.txt` | Auto-generated |
| CMS admin | `/admin` | Decap CMS |

---

## Acceptance Criteria

### Functional Requirements

- [ ] All 8 sections render with migrated content from Google Sites
- [ ] Allen can log into `/admin` and edit any content (text, images, PDFs) via visual forms
- [ ] Allen can toggle any section on/off from the admin panel — toggled-off sections disappear from navigation
- [ ] Allen can change primary and accent colors from the admin panel
- [ ] Allen can add/edit/delete publications with all fields (title, authors, year, journal, DOI, PDF, abstract)
- [ ] Allen can create and publish blog posts with rich text and images
- [ ] Allen can upload a CV PDF and control its visibility
- [ ] Publishing content triggers automatic site rebuild and deploy
- [ ] Individual publication pages render Highwire Press citation meta tags
- [ ] Custom 404 page renders for non-existent URLs

### SEO Requirements

- [ ] Every page has a unique, descriptive `<title>` tag
- [ ] Every page has a meta description
- [ ] Every page has Open Graph and Twitter Card tags
- [ ] Homepage has Person + ProfilePage JSON-LD structured data
- [ ] Publication pages have ScholarlyArticle JSON-LD
- [ ] Blog posts have BlogPosting JSON-LD
- [ ] `sitemap-index.xml` auto-generated with all pages
- [ ] `robots.txt` allows all crawlers including GPTBot, ClaudeBot, PerplexityBot
- [ ] `llms.txt` auto-generated with site summary and key pages
- [ ] `llms-full.txt` auto-generated with full content in Markdown
- [ ] RSS feed at `/rss.xml` for blog posts
- [ ] Canonical URLs on all pages
- [ ] Publication pages include Highwire Press `citation_*` meta tags for Google Scholar

### Non-Functional Requirements

- [ ] Lighthouse Performance score > 95
- [ ] Lighthouse Accessibility score > 95
- [ ] All Core Web Vitals passing (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- [ ] WCAG 2.1 AA compliance (skip links, focus states, contrast, semantic HTML)
- [ ] Mobile responsive (works on phone, tablet, desktop)
- [ ] Site builds in under 60 seconds
- [ ] Hosted entirely on Netlify free tier
- [ ] No JavaScript required for content viewing (progressive enhancement only)

---

## Dependencies & Prerequisites

**Before starting:**
- [ ] GitHub account for repo hosting
- [ ] Netlify account (free)
- [ ] Allen's custom domain name (or decision to use netlify.app subdomain initially)

**Before deployment (Phase 6):**
- [ ] Custom domain registered and accessible
- [ ] Allen's email address for Netlify Identity invitation
- [ ] Allen's Google Scholar profile URL
- [ ] High-resolution profile photo

**Nice to have (can be added post-launch):**
- [ ] ORCID ID
- [ ] Complete publication list (BibTeX or structured format)
- [ ] CV PDF file

---

## Risk Analysis & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Netlify free tier bandwidth exceeded | Low | Site goes offline temporarily | Academic sites rarely exceed 100GB/mo. Monitor in Netlify dashboard. Upgrade to Pro ($19/mo) if needed. |
| PDF storage bloats Git repo | Medium | Slow clones, slow builds | Keep PDFs under 5MB each. Link to external sources (publisher, SSRN) when possible. Consider Git LFS if >50 PDFs. |
| Allen confused by CMS | Low | Content not updated | Create a 1-page CMS user guide. Decap CMS is simple — forms with Save/Publish buttons. |
| Google Scholar doesn't index | Medium | Main SEO goal partially missed | Highwire Press tags are the standard. Ensure PDF formatting follows Scholar guidelines. Manual submission via Scholar inclusion form. |
| Old Google Sites URL continues ranking | Low | Traffic split | Add "moved" notice to old site. Update all external profile links. Google will eventually de-prioritize the stale page. |
| Decap CMS discontinued | Very Low | Need to migrate CMS | Sveltia CMS is a drop-in replacement using the same config.yml. Content is plain Markdown — portable to any system. |

---

## Post-Launch Checklist

- [ ] Verify Google Search Console shows pages indexed (allow 1-2 weeks)
- [ ] Verify Google Scholar indexes publications (allow 2-6 weeks)
- [ ] Test LLM discoverability: ask ChatGPT/Claude about Allen Blackman (allow 4-8 weeks for crawl)
- [ ] Update old Google Sites with redirect notice
- [ ] Update Allen's profiles: Google Scholar, ResearchGate, Academia.edu, LinkedIn, ORCID
- [ ] Create CMS user guide for Allen (1-page PDF or markdown)
- [ ] Schedule 3-month check-in to verify indexing and add more publications

---

## References & Research

### Internal
- Brainstorm: `docs/brainstorms/2026-04-21-allen-blackman-portfolio-brainstorm.md`
- Existing site: `https://sites.google.com/view/allenblackman8/home`

### Framework Documentation
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro Sitemap Integration](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
- [Decap CMS Configuration](https://decapcms.org/docs/configuration-options/)
- [Decap CMS Widgets](https://decapcms.org/docs/widgets/)
- [Astro + Decap CMS Guide](https://docs.astro.build/en/guides/cms/decap-cms/)
- [Netlify Identity](https://docs.netlify.com/manage/security/secure-access-to-sites/identity/overview/)
- [Netlify Git Gateway](https://docs.netlify.com/manage/security/secure-access-to-sites/git-gateway/)

### SEO & Discoverability
- [Google Scholar Inclusion Guidelines](https://scholar.google.com/intl/en/scholar/inclusion.html)
- [Google ProfilePage Structured Data](https://developers.google.com/search/docs/appearance/structured-data/profile-page)
- [Schema.org ScholarlyArticle](https://schema.org/ScholarlyArticle)
- [Evil Martians: Making Your Site Visible to LLMs](https://evilmartians.com/chronicles/how-to-make-your-website-visible-to-llms)
- [GEO: Generative Engine Optimization (Princeton)](https://arxiv.org/html/2311.09735v3)
- [Highwire Press Meta Tags for Scholar](https://scholar.google.com/intl/en/scholar/publishers.html)
