# Academic Portfolio — Allen Blackman

Static academic portfolio site for Allen Blackman, Lead Economist at the Inter-American Development Bank.

**Live site:** https://allenblackman.netlify.app
**Repository:** https://github.com/Tailor-Mind/allen-blackman-site

## Stack

- **Astro 6** — static site generator
- **Decap CMS 3** — git-based admin panel at `/admin`
- **Netlify** — hosting with deploy previews, Identity for CMS auth, Git Gateway

## Local development

```bash
npm install
npm run dev        # dev server at http://localhost:4321
npm run build      # production build to ./dist/
npm run preview    # serve the production build locally
```

Dev mode skips some build-only integrations (sitemap, RSS). Use `preview` to verify those.

## Admin panel

Production: https://allenblackman.netlify.app/admin/ — login with Netlify Identity.

For local CMS work, use `npx decap-server` alongside `npm run dev` and add `local_backend: true` to `public/admin/config.yml`. Not required for everyday content edits, which happen in production.

## Project structure

```
/
├── public/
│   ├── admin/           # Decap CMS config + entry point
│   ├── uploads/         # CMS-uploaded media (images, PDFs)
│   └── favicon.svg
├── src/
│   ├── components/      # Astro components (Header, Footer, cards, etc.)
│   ├── content.config.ts  # Content collection schemas
│   ├── data/            # Deployed content (authoritative)
│   │   ├── settings/    # Per-page + site-wide JSON settings
│   │   ├── blog/        # Blog posts (markdown)
│   │   ├── publications/
│   │   ├── projects/
│   │   ├── webtools/
│   │   ├── links/
│   │   ├── project-categories/
│   │   ├── publication-types/
│   │   └── link-categories/
│   ├── data-template/   # Generic John Doe defaults for template reuse
│   ├── layouts/
│   ├── lib/             # Shared utilities
│   ├── pages/           # File-based routes
│   └── styles/
├── scripts/
│   └── reset-to-template.mjs   # Reset instance content to template
├── docs/
│   ├── brainstorms/     # Design decisions as they evolve
│   └── plans/           # Implementation plans
├── astro.config.mjs
└── netlify.toml
```

## SEO features

Every page is built for maximum search engine and LLM discoverability:

- **JSON-LD structured data** (`Person` + `ProfilePage` on home, `ScholarlyArticle` on publications, `BlogPosting` on blog)
- **Highwire Press citation meta tags** for Google Scholar indexing
- **Auto-generated sitemap** at `/sitemap-index.xml`
- **`robots.txt`** explicitly allowing GPTBot, ClaudeBot, PerplexityBot
- **`llms.txt`** and **`llms-full.txt`** for LLM crawlers
- **RSS feed** at `/rss.xml`
- **Open Graph + Twitter Card** tags per page
- **`rel="me"`** links to academic profiles (Google Scholar, ORCID, etc.)

## Previewing draft changes

Each save in the CMS creates a pull request on GitHub, and Netlify auto-builds a deploy preview for every PR. To preview a draft before publishing:

1. Save your edit in the CMS (creates a draft)
2. Open https://github.com/Tailor-Mind/allen-blackman-site/pulls
3. Find the PR for your draft (title matches the entry you edited)
4. Click the "**Netlify — Preview deploy**" check to open the preview URL

The preview URL follows the pattern:
`https://deploy-preview-{PR_NUMBER}--allenblackman.netlify.app/`

When the preview looks right, go back to the CMS → Workflow tab → click **Publish now** on the draft card. The PR merges, Netlify rebuilds, and the change is live in ~60 seconds.

## Reusing this template for another researcher

This repo is structured as a template. Every piece of content lives in either `src/data/` (Allen's actual content) or `src/data-template/` (generic "Dr. Jane Doe" defaults). To spin up a new site for a different researcher:

### 1. Fork or clone

```bash
git clone https://github.com/Tailor-Mind/allen-blackman-site.git new-researcher-site
cd new-researcher-site
rm -rf .git && git init   # start a fresh git history
npm install
```

### 2. Reset instance content to template

```bash
npm run reset-to-template
```

The script:
- Refuses to run if the git working directory is dirty (safety)
- Prompts for confirmation (type `yes` to proceed, or set `CONFIRM_RESET=yes` to skip)
- Backs up existing `src/data/` to `src/data.backup-{timestamp}/`
- Copies everything from `src/data-template/` into `src/data/`

After running, `src/data/` contains generic placeholder content — Dr. Jane Doe as the site owner, sample projects/publications, blank social profile URLs, etc.

### 3. Commit the reset

```bash
git add -A
git commit -m "reset: scaffold with template content"
```

### 4. Deploy + customize

Follow the Netlify setup steps (see below), then log in to `/admin/` and personalize every field through the CMS. Each field has an SEO-focused hint explaining its purpose.

### Keeping the template in sync

If the schema evolves (new fields added to page JSONs, new content types, etc.), update `src/data-template/` alongside the change. Use `grep -ri "allen\|iadb\|blackman" src/data-template/` to verify the template stays researcher-agnostic.

## Netlify setup

For a new deployment:

1. Connect the GitHub repo to Netlify (auto-detects Astro)
2. Site configuration → **Identity** → Enable
3. Registration preferences → **Invite only**
4. Services → **Enable Git Gateway**
5. Identity → **Invite users** → add the researcher's email
6. Trigger a fresh deploy after enabling Identity (internal routing is baked in at build time)

For org-owned repos with GitHub OAuth restrictions, use a Personal Access Token in Git Gateway settings with `repo`, `user`, and `workflow` scopes — SSO-authorized for the org if applicable.

## Plans & decisions

See `docs/plans/` and `docs/brainstorms/` for the design history and planned improvements.
