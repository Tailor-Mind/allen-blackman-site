# Allen Blackman Academic Portfolio Website

**Date:** 2026-04-21
**Status:** Brainstorm complete — ready for planning

---

## What We're Building

A professional academic portfolio website for **Allen Blackman**, a Lead Economist at the Inter-American Development Bank (IDB), specializing in environmental economics and natural resource policy in developing countries.

The site replaces an existing Google Sites page (`sites.google.com/view/allenblackman8`) that suffers from poor SEO, no indexing, and no discoverability by LLMs or Google search.

### Primary Goals
1. **SEO-optimized and discoverable** — indexed by Google, surfaced by LLMs, proper structured data
2. **Admin panel for non-technical user** — Allen can manage all content (publications, bio, photos, links) via a visual CMS without coding
3. **Free hosting** with custom domain support
4. **All sections toggleable** from the admin panel — Allen can show/hide any section independently

### Target Audience
- Academic peers & collaborators (researchers, journal editors, co-authors)
- Policy makers & institutions (IDB colleagues, government officials, NGOs)
- Both audiences served equally

---

## Tech Stack Decision

**Astro + Decap CMS + Netlify**

| Component | Role |
|-----------|------|
| **Astro** | Static site generator — outputs pure HTML, full SEO control, component-based templates |
| **Decap CMS** | Git-based admin panel at `/admin` — visual forms for all content, no code needed |
| **Netlify** | Free hosting — auto-deploys, SSL, custom domain, Netlify Identity for CMS auth |

### Why this stack
- **SEO:** Static HTML is the fastest and most crawlable format. Full control over meta tags, sitemap.xml, robots.txt, JSON-LD structured data, Open Graph tags
- **Admin UX:** Decap CMS provides form-based editing for all content types — text, images, PDFs, toggles
- **Cost:** Completely free (Netlify free tier + Decap is open source)
- **Maintainability:** Astro's HTML-like component syntax is easy for any developer to modify
- **No vendor lock-in:** Content stored as Markdown files in a Git repo

### Rejected alternatives
- **Next.js + Keystatic + Vercel** — heavier than needed, more JS shipped to browser
- **Hugo + Decap CMS + Netlify** — Go templating harder to customize
- **WordPress** — bloated, ads on free tier, limited SEO control
- **Wix/Squarespace** — not free, limited SEO, JS-heavy rendering

---

## Key Decisions

### Site Sections
All sections toggleable from the admin panel:

| Section | Description | Toggle |
|---------|-------------|--------|
| **Home** | Landing page with hero, intro text, photo | Yes |
| **About** | Extended bio, education, career, affiliations | Yes |
| **Research** | Categorized research projects with co-authors | Yes |
| **Publications** | Journal articles, working papers, book chapters with PDF uploads | Yes |
| **Blog / News** | Posts about new papers, talks, media, commentary | Yes |
| **Webtools** | FCTT, FCET, and other tools with descriptions and links | Yes |
| **Links** | Curated external resources and organizations | Yes |
| **Contact** | Address, phone, email, institutional affiliation | Yes |

### Visual Style
- **Clean academic minimal** by default — white background, clean typography, no flashy elements
- **Theme customizable from admin panel** — primary colors, accent colors configurable via CMS settings
- Inspired by: Resources for the Future, NBER, clean institutional profiles

### Admin Panel Capabilities
Allen can manage from `/admin`:
- All content (text, images, PDFs) via visual forms
- Site settings: colors, section visibility toggles, site title/description
- Publications: add/edit/delete with fields for title, journal, year, co-authors, PDF, DOI
- Blog posts: rich text editor with image uploads
- Research projects: categorized entries with descriptions and collaborator info

### Content Strategy
- **Migrate all existing content** from the Google Sites page for launch
- Publications and Blog sections start with migrated + placeholder content
- Allen fills in additional content post-launch via the admin panel

### Domain & Hosting
- Allen has a **custom domain** — DNS will point to Netlify
- Netlify provides free SSL via Let's Encrypt
- Auto-deploys from Git on content changes via CMS

### SEO Strategy
- Semantic HTML5 structure
- JSON-LD structured data (Person schema, ScholarlyArticle for publications)
- Auto-generated sitemap.xml and robots.txt
- Open Graph + Twitter Card meta tags on every page
- Descriptive page titles and meta descriptions (editable from CMS)
- Alt text on all images
- Internal linking between pages

---

## Open Questions

1. **Which custom domain?** — Need the actual domain name to configure DNS
2. **Google Scholar profile URL** — To link and cross-reference
3. **ORCID ID** — For structured data and academic discoverability
4. **Profile photo** — Need a high-resolution version for the new site
5. **Publication list** — Does Allen have a structured list (BibTeX, CSV) or do we scrape from Google Scholar?
6. **Blog frequency** — How often will Allen post? (Affects whether we need RSS, email subscriptions, etc.)

---

## Next Steps

Run `/workflows:plan` to create the implementation plan.
