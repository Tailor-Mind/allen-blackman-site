---
title: "feat: Admin UX Improvements + Templatability"
type: feat
date: 2026-04-22
---

# Admin UX Improvements + Templatability

## Overview

Refactor the Decap CMS admin experience to reduce cognitive load, surface context about where edits land on the live site, and make the repo reusable as a template for future researchers. Three interrelated workstreams:

1. **Admin UX polish** — reorganize sidebar, add "View on site" context, surface deploy previews, remove broken UI
2. **Per-page visibility toggles** — move the nav hide/show toggle onto each page entry where Allen naturally edits
3. **Templatability** — add `src/data-template/` with generic "Dr. Jane Doe" defaults + a `npm run reset-to-template` script, so the repo can be forked for any academic

**Brainstorm:** `docs/brainstorms/2026-04-22-admin-ux-improvements-brainstorm.md`

---

## Problem Statement

After building out the CMS admin, three pain points have emerged:

1. **Navigation is difficult.** The sidebar has ~18 entries organized around file structure (Page Content, Site Settings, Taxonomies, collections) rather than around what Allen wants to edit ("the About page"). Content for a single page is split across multiple admin entries (homepage content draws from "Home Page" + "Identity & SEO" + "Social Profiles"). Allen hunts for the right entry each time.

2. **No preview of draft changes.** The native Decap "Check for Preview" toggle does nothing because we haven't built React preview templates. Allen saves → publishes → waits 60s → hard-refreshes to see his edit. This creates a slow, uncertain feedback loop. False expectation is worse than no feature.

3. **Repo is Allen-coupled.** All defaults in `src/data/*.json` are Allen's actual content. Reusing this as a template for another researcher currently means manually overwriting 20+ files. We want a clean template-first architecture where Allen's content is "instance data" and generic placeholders are the default.

## Proposed Solution

Ship in four phases, each independently deployable, ordered from safest-first to additive-last:

| Phase | Scope | Risk | Independently Shippable |
|---|---|---|---|
| 1 | Admin UX polish (CMS config + CSS only) | None (no data changes) | Yes |
| 2 | Per-page visibility toggles (data migration) | Low (idempotent migration) | Yes |
| 3 | Templatability (`data-template/` + reset script) | None (additive only) | Yes |
| 4 | Deploy preview docs (description text) | None | Yes |

Each phase is a distinct commit. Allen's live site remains functional throughout.

---

## Technical Approach

### Architecture

No fundamental architecture changes. All work happens in existing directories:

- `public/admin/config.yml` — CMS structure and labels
- `public/admin/index.html` — CSS injection point for hiding broken UI
- `src/data/settings/*.json` — per-page JSON files gain `navVisible`, `navOrder` fields
- `src/lib/utils.ts` — `getEnabledSections()` updated to read from per-page data
- `src/components/Header.astro` — consumes updated utils (no change needed if utils stable)
- `src/data-template/` — NEW parallel directory with generic defaults
- `scripts/reset-to-template.mjs` — NEW Node.js script
- `package.json` — NEW npm script entry
- `README.md` — NEW section on fork-and-customize flow

### Data Architecture Decisions

**Single source of truth for navigation visibility:**
Move `enabled` and `order` FROM `sections.json[N]` TO each page's JSON as `navVisible` and `navOrder`. `sections.json` is simplified to structural metadata (`id`, `label`, `path`) that rarely changes. Astro utils merge both sources at build time.

**Why this way?**
- Allen edits the About page → the visibility toggle is right there in the About page entry
- Bulk reorder/toggle still possible via Site Settings → Navigation (but that entry becomes smaller — just the structural metadata)
- No data duplication (single authoritative field per page)
- Migration is straightforward: one-time copy of `enabled`/`order` values into per-page JSONs

**Alternative rejected:** Duplicating visibility data in both sections.json and per-page JSON, with merge logic. Too error-prone; conflicts between the two are guaranteed.

---

### Implementation Phases

---

#### Phase 1: Admin UX Polish (No Data Changes)

**Goal:** Make the CMS sidebar and entry descriptions more scannable and purposeful. Remove the broken Preview checkbox.

**Tasks:**
- [ ] Reorganize `public/admin/config.yml` collection order and labels:
  - Group 1: **📝 Pages** — file collection with ALL page-content entries (home, about, contact, cv, research listing, publications listing, blog listing, webtools listing, links listing, 404, footer)
  - Group 2: Individual **content** collections (Publications, Blog Posts, Research Projects, Webtools, External Links)
  - Group 3: **🏷️ Taxonomies** — three category collections
  - Group 4: **⚙️ Site Settings** — identity, navigation (bird's-eye view only), social
- [ ] Rewrite collection and file descriptions to explicitly mention the live page URL
  - Example: *"The homepage — edit what's shown at https://allenblackman.netlify.app/"*
- [ ] Add plain-text URLs to every page entry description so Allen can copy-paste to see the live version
- [ ] Hide the non-functional "Check for Preview when saving a change" checkbox via CSS injected into `public/admin/index.html`:
  ```css
  /* Hide the broken native preview toggle — we use deploy previews instead */
  [class*="PreviewToggle"] { display: none !important; }
  ```
- [ ] Verify Decap collection label Unicode/emoji rendering across browsers
- [ ] Build locally, confirm all existing CMS routes still work

**Acceptance criteria for Phase 1:**
- [ ] Every Page entry includes the live URL in its description
- [ ] Broken Preview checkbox is no longer visible in the editor UI
- [ ] All existing collections still appear and are editable
- [ ] No changes to `src/data/` (CMS config only)
- [ ] `npm run build` produces identical output to pre-Phase-1 (content unchanged)

**Files modified in Phase 1:**
- `public/admin/config.yml`
- `public/admin/index.html`

**Estimated effort:** ~1 hour

---

#### Phase 2: Per-Page Visibility Toggles (Data Migration)

**Goal:** Move the "show in nav" toggle from Site Settings onto each page entry, where Allen naturally edits. Preserve the bird's-eye view as a bulk-management fallback.

**Current state:**
```json
// src/data/settings/sections.json (canonical)
{
  "sections": [
    { "id": "home",  "label": "Home",  "path": "/",       "enabled": true,  "order": 1 },
    { "id": "about", "label": "About", "path": "/about",  "enabled": true,  "order": 2 },
    { "id": "cv",    "label": "CV",    "path": "/cv",     "enabled": true,  "order": 3 },
    ...
  ]
}
```

**Target state:**
```json
// src/data/settings/home.json
{
  "navVisible": true,
  "navOrder": 1,
  "pageTitle": "",
  "metaDescription": "",
  "heroTagline": "...",
  ...
}
```
```json
// src/data/settings/sections.json (simplified)
{
  "sections": [
    { "id": "home",  "label": "Home",  "path": "/" },
    { "id": "about", "label": "About", "path": "/about" },
    ...
  ],
  "showCvDownload": true,
  "cvFile": "/uploads/allen-blackman-cv.pdf"
}
```

**Tasks:**

Data migration:
- [ ] Add `navVisible: boolean` and `navOrder: number` fields to each of 9 page JSONs (home, about, cv-page, research-page, publications-page, blog-page, webtools-page, links-page, contact)
  - **Important:** Preserve current values from `sections.json` so Allen's nav doesn't visually change after deploy
- [ ] Simplify `sections.json` to just `{id, label, path}` per section (remove `enabled`, `order`)

Astro code changes:
- [ ] Update `src/lib/utils.ts` → `getEnabledSections()`:
  - Read `sections.json` for structural metadata (id, label, path)
  - For each section, look up the corresponding page JSON for `navVisible` and `navOrder`
  - Return sections with `enabled: true` (i.e. `navVisible: true`), sorted by `navOrder`
  - Fallback: if a page JSON doesn't exist or lacks the fields, assume visible + default order
- [ ] Verify `src/components/Header.astro` still works without changes (it consumes `getEnabledSections()` output)

CMS updates:
- [ ] Add `navVisible` and `navOrder` fields to each Page entry in `public/admin/config.yml`:
  ```yaml
  - label: "👁️ Show in navigation"
    name: "navVisible"
    widget: "boolean"
    default: true
    hint: "Uncheck to hide this page from the site's navigation menu. The page URL still works — it's just not linked from the main menu. Useful for drafts or pages you want to hide temporarily."
  - label: "Navigation order"
    name: "navOrder"
    widget: "number"
    value_type: "int"
    hint: "Lower numbers appear first in the nav menu. Example: Home=1, About=2, etc."
  ```
- [ ] Update Site Settings → Navigation entry description to say it's now a "bird's-eye view" and that visibility is managed per-page
- [ ] Remove the `enabled` and `order` fields from the sections list widget in Site Settings

Special case — Home page:
- [ ] Document that toggling Home's `navVisible` off only hides it from the nav menu — the root URL `/` always renders. Include this in the field hint on Home's page entry.

Testing:
- [ ] Toggle a page off in CMS → verify nav link disappears after build
- [ ] Toggle it back on → verify link reappears
- [ ] Change `navOrder` → verify nav reorders
- [ ] Verify direct URL still works even when section is hidden from nav

**Acceptance criteria for Phase 2:**
- [ ] Every Page entry has a visible "👁️ Show in navigation" toggle at the top of the form
- [ ] Toggling the checkbox updates the live navigation after rebuild
- [ ] `getEnabledSections()` correctly merges data from page JSONs and sections.json
- [ ] Bird's-eye view in Site Settings → Navigation still works for bulk management (now showing just metadata + visibility)
- [ ] Direct URLs still resolve for hidden sections (no 404s)
- [ ] Allen's current nav state (all 9 enabled, current order) is preserved by the migration

**Files modified in Phase 2:**
- `src/data/settings/home.json` (+ navVisible, navOrder)
- `src/data/settings/about.json` (+ navVisible, navOrder)
- `src/data/settings/cv-page.json` (+ navVisible, navOrder)
- `src/data/settings/research-page.json` (+ navVisible, navOrder)
- `src/data/settings/publications-page.json` (+ navVisible, navOrder)
- `src/data/settings/blog-page.json` (+ navVisible, navOrder)
- `src/data/settings/webtools-page.json` (+ navVisible, navOrder)
- `src/data/settings/links-page.json` (+ navVisible, navOrder)
- `src/data/settings/contact.json` (+ navVisible, navOrder)
- `src/data/settings/sections.json` (simplified)
- `src/lib/utils.ts` (updated `getEnabledSections()`)
- `public/admin/config.yml` (add per-page fields, update Navigation settings)

**Estimated effort:** ~2 hours

---

#### Phase 3: Templatability (`data-template/` + Reset Script)

**Goal:** Make the repo reusable for any researcher. Create generic "Dr. Jane Doe" defaults in a parallel directory, plus a safe reset script.

**Tasks:**

Create template directory with generic content:
- [ ] `mkdir src/data-template/` mirroring the structure of `src/data/`
- [ ] Settings files with placeholders (`src/data-template/settings/*.json`):
  - **general.json**: `{ authorName: "Dr. Jane Doe", authorTitle: "Associate Professor", authorAffiliation: "Placeholder University", authorEmail: "jane.doe@example.edu", ... }`
  - **home.json**: generic hero tagline, generic research areas (e.g., "Research Area 1", "Research Area 2")
  - **about.json**: generic biography (3 placeholder paragraphs), generic education ("Ph.D. in [Field], [Institution]"), generic affiliations
  - **contact.json**: generic address placeholders
  - **social.json**: all empty strings (no profile URLs)
  - **cv-page.json, research-page.json, publications-page.json, blog-page.json, webtools-page.json, links-page.json**: generic meta descriptions, intro text, empty states
  - **sections.json**: same structural definitions (id, label, path) — pages are universal
  - **footer.json, not-found.json**: already generic, copy as-is
- [ ] Sample content entries (`src/data-template/{collection}/`):
  - **projects/**: 2 sample project markdowns ("Sample Research Project 1", "Sample Research Project 2")
  - **publications/**: 1 sample publication ("Sample Journal Article")
  - **blog/**: 1 sample blog post ("Welcome to Your New Site")
  - **webtools/**: 1 sample webtool
  - **links/**: 2 sample external links
- [ ] Taxonomy files (`src/data-template/project-categories/*`, etc.):
  - Generic categories like "Category 1", "Category 2" — or keep Allen's categories as sensible defaults since environmental economics topics are broadly applicable

Create reset script (`scripts/reset-to-template.mjs`):
- [ ] Safety check 1: Verify git working directory is clean (no uncommitted changes). Fail loudly if not.
- [ ] Safety check 2: Require explicit confirmation — either interactive prompt (`yes`) or env flag (`CONFIRM_RESET=yes`).
- [ ] Backup: Copy `src/data/` → `src/data.backup-{YYYY-MM-DD-HHmm}/` before overwriting.
- [ ] Reset: Delete `src/data/`, copy `src/data-template/` → `src/data/`.
- [ ] Commit hint: Print next-steps message ("Review the changes with `git diff`, then commit and deploy.").

Pseudo-code:
```js
// scripts/reset-to-template.mjs
import { execSync } from 'child_process';
import { rm, cp, stat } from 'fs/promises';
import readline from 'readline/promises';

async function main() {
  // Safety 1: git clean
  const gitStatus = execSync('git status --porcelain').toString().trim();
  if (gitStatus) {
    console.error('❌ Working directory has uncommitted changes. Commit or stash first.');
    process.exit(1);
  }

  // Safety 2: confirmation
  if (process.env.CONFIRM_RESET !== 'yes') {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question(
      '⚠️  This will replace all content in src/data/ with generic template content.\n' +
      '   Type "yes" to continue: '
    );
    rl.close();
    if (answer.trim().toLowerCase() !== 'yes') {
      console.log('Aborted.');
      process.exit(0);
    }
  }

  // Backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
  const backup = `src/data.backup-${timestamp}`;
  await cp('src/data', backup, { recursive: true });
  console.log(`📦 Backed up src/data → ${backup}`);

  // Reset
  await rm('src/data', { recursive: true, force: true });
  await cp('src/data-template', 'src/data', { recursive: true });
  console.log('✅ src/data has been reset to template content.');
  console.log('');
  console.log('Next steps:');
  console.log('  1. git status   # see what changed');
  console.log('  2. git diff     # review the new generic content');
  console.log('  3. npm run build   # verify the site still builds');
  console.log('  4. git add -A && git commit -m "reset: scaffold with template content"');
}

main().catch(e => { console.error(e); process.exit(1); });
```

Wire up package.json:
- [ ] Add `"reset-to-template": "node scripts/reset-to-template.mjs"` to scripts

Update README:
- [ ] Add a "Reusing this template" section explaining:
  1. Fork or clone the repo
  2. Run `npm run reset-to-template`
  3. Review and commit the reset
  4. Follow the setup instructions for Netlify + Decap CMS
  5. Customize via `/admin` as the new researcher

Test in an isolated worktree:
- [ ] Create a git worktree outside the main working tree
- [ ] Run the reset script
- [ ] Verify `npm run build` still succeeds with template content
- [ ] Verify pages render with generic content
- [ ] Clean up the worktree (don't pollute Allen's site)

**Acceptance criteria for Phase 3:**
- [ ] `src/data-template/` exists with full generic content mirroring `src/data/` structure
- [ ] `npm run reset-to-template` exists, requires confirmation, creates backup, replaces content
- [ ] Script fails cleanly if git is dirty
- [ ] README has a "Reusing this template" section
- [ ] Running reset + build produces a functional generic site (no broken references)
- [ ] Allen's `src/data/` is unmodified after merging this phase

**Files added in Phase 3:**
- `src/data-template/` (entire directory with all mirrored files)
- `scripts/reset-to-template.mjs`
- `package.json` (new npm script)
- `README.md` (new section)

**Estimated effort:** ~2-3 hours

---

#### Phase 4: Deploy Preview Documentation

**Goal:** Enable Allen to preview draft changes before publishing, without building a custom Decap UI.

Netlify already auto-generates a preview URL for every PR that Decap creates. The challenge is surfacing that URL inside the CMS without building custom Decap infrastructure.

**Tasks:**

Document the URL pattern:
- [ ] Add a prominent admin description at the top of the Decap interface (via the first file in config.yml or a dedicated "Help" collection):
  ```
  💡 Preview your draft changes:
  After saving a draft, Netlify builds a preview. The URL pattern is:
  https://deploy-preview-{PR_NUMBER}--allenblackman.netlify.app/

  Find the PR number at https://github.com/Tailor-Mind/allen-blackman-site/pulls
  ```
- [ ] Add similar hint text to each collection's description field
- [ ] Update the CMS `editor:preview` option in config.yml — it's already `false`, but add a comment explaining why

Link from drafts to GitHub:
- [ ] (Optional, if Decap exposes current entry's branch) Add a hint that tells Allen where to find the PR for his current draft
- [ ] For each collection, add a footer hint: *"To preview this draft change: Workflow tab → click the draft → visit [your GitHub PRs](https://github.com/Tailor-Mind/allen-blackman-site/pulls) → open the PR → click the 'Netlify — Preview deploy' check."*

Documentation:
- [ ] Add a "Previewing draft changes" section to README
- [ ] Include a diagram or numbered steps:
  1. Save draft in CMS
  2. Open Workflow tab, confirm draft is listed
  3. Open GitHub PRs for the repo
  4. Find the PR for your draft (titled like the entry)
  5. Click the "Netlify — Preview deploy" check
  6. Review the preview URL

**Acceptance criteria for Phase 4:**
- [ ] Every CMS collection has a description mentioning the preview flow
- [ ] README explains how to preview drafts
- [ ] Allen has a clear path from "I saved a draft" to "I can see the draft on the real site"

**Files modified in Phase 4:**
- `public/admin/config.yml` (add preview URL hints)
- `README.md` (preview flow documentation)

**Estimated effort:** ~30 minutes

---

## Alternative Approaches Considered

### For Admin UX

- **Custom Decap CMS build with proper preview** (rejected)
  - Requires forking Decap, writing React preview templates matching every Astro component, hosting our own Decap bundle. 6-10+ hours initial + ongoing maintenance every time we change an Astro component. Not worth it for a static academic site.

- **Do nothing; leave admin as-is** (rejected)
  - User has explicitly flagged navigation as painful. Ignoring user feedback is never the right call.

### For Per-Page Visibility

- **Duplicate data in sections.json AND per-page JSON with merge logic** (rejected)
  - Two sources of truth always diverge over time. Sync bugs guaranteed. Prefer one source.

- **Keep sections.json as sole source, just add a "go to Settings → Navigation" link on each page entry** (rejected as insufficient)
  - Doesn't actually solve the discoverability problem. Allen still has to navigate to Settings. If we're going to do the work, do it right.

### For Templatability

- **Branch-based approach: `template` branch vs. `main`** (rejected)
  - More Git ceremony. Decap CMS only commits to `main`, so `template` would need manual sync. Painful maintenance.

- **Replace Allen's content now, have him re-enter via CMS** (rejected)
  - Zero technical benefit over the parallel-directory approach. Pure migration friction for Allen with no upside.

### For Deploy Previews

- **Build custom UI component in Decap showing preview URL** (rejected for now, deferred)
  - Requires custom Decap CMS build. Significant upfront work. We can revisit if Phase 4 documentation proves insufficient in practice.

---

## Acceptance Criteria

### Functional Requirements

- [ ] **Admin sidebar:** Grouped logically by emoji prefix (📝 Pages / 🏷️ Taxonomies / ⚙️ Settings / content collections). Allen can scan and find any editable entry in under 5 seconds.
- [ ] **Context links:** Every Page entry in the CMS includes the live site URL in its description text.
- [ ] **Preview checkbox:** Hidden via CSS — no longer visible in the Decap UI.
- [ ] **Per-page visibility:** Every Page entry has a "👁️ Show in navigation" toggle at the top. Toggling updates the nav after rebuild.
- [ ] **Per-page order:** Every Page entry has a "Navigation order" number field. Changing it reorders the nav after rebuild.
- [ ] **Direct URL still works:** Hidden pages remain reachable via their URL (no 404s from toggling off).
- [ ] **Bird's-eye view:** Site Settings → Navigation still shows all sections' metadata for bulk reference (but visibility/order now lives per-page).
- [ ] **Template directory:** `src/data-template/` exists with a full set of generic "Dr. Jane Doe" content — no references to Allen, IDB, or any specific institution.
- [ ] **Reset script:** `npm run reset-to-template` works. Requires confirmation, backs up existing data, fails safely on dirty git state.
- [ ] **README documentation:** Clear section on "Reusing this template" and "Previewing draft changes."
- [ ] **Deploy preview flow:** Allen can follow a documented path from Decap draft → GitHub PR → Netlify preview URL in fewer than 5 clicks.

### Non-Functional Requirements

- [ ] **Build time:** No noticeable regression in `npm run build` duration.
- [ ] **No new dependencies:** All changes use existing Astro / Decap / Node features.
- [ ] **Allen's live site:** Remains functional and unchanged throughout all 4 phases. No content loss, no visible differences beyond the CMS UX.
- [ ] **Backward-compatible migration:** Phase 2 migration preserves all current visibility states.
- [ ] **Type-safety:** Updated schemas in `src/content.config.ts` (if needed) compile without TypeScript errors.

### Quality Gates

- [ ] **Manual smoke test after each phase:** edit something in CMS, publish, verify it appears on live site.
- [ ] **Nav visibility test:** toggle at least 2 pages off, verify nav updates, toggle back on.
- [ ] **Reset script test:** run in a temporary worktree (never on main working tree), verify it produces a functional generic site.
- [ ] **Git log clarity:** Each phase is a separate commit with a descriptive conventional-commits-style message.

---

## Success Metrics

| Metric | Target |
|---|---|
| Sidebar discovery time (Allen finds any entry) | < 5 seconds |
| Edits per publish (multiple edits batched) | No change (unchanged workflow) |
| Time from CMS save to verified preview | < 2 minutes (deploy preview wait) |
| Template reuse setup time (new researcher) | < 10 minutes to first local build |
| Broken UI elements visible in admin | 0 |

Qualitative: Allen reports the admin feels less cluttered and he can find what he wants faster.

---

## Dependencies & Prerequisites

**Before Phase 1:** None. CMS config is independently editable.

**Before Phase 2:**
- All currently-open Decap drafts should be published or discarded, to avoid merge conflicts with the data migration. Check: `gh pr list --repo Tailor-Mind/allen-blackman-site`.

**Before Phase 3:** None. New directory is additive.

**Before Phase 4:** None. Documentation only.

**Netlify configuration:**
- Deploy previews must be enabled on the Netlify site (default behavior — verify at Site Settings → Build & deploy → Deploy contexts).

---

## Risk Analysis & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Data migration in Phase 2 drops current visibility state | Medium | Allen's nav breaks | Migration explicitly copies current values. Add unit-level verification that pre/post values match. |
| Reset script run accidentally on Allen's data | Low | Catastrophic (content loss) | Three safety layers: git clean check, confirmation prompt, automatic backup to `src/data.backup-*`. |
| CSS hiding Preview checkbox breaks with Decap upgrade | Low | Broken button reappears | Use specific attribute selector (`[class*="PreviewToggle"]`). Revisit during Decap upgrades. |
| Deploy preview URL format changes | Very Low | Docs become stale | Netlify's URL pattern is stable. Monitor if Netlify ever changes it. |
| Sidebar emoji labels don't render in all browsers | Very Low | Cosmetic degradation | Emojis are ancient Unicode — universal support. |
| Duplicate navigation state (Site Settings + per-page) | Medium | User confusion | Site Settings → Navigation entry becomes explicitly labeled as "bird's-eye view of structural definitions only" — visibility/order removed from its fields. |
| Reset script works on Windows too | Low | CI/CD issues | Use Node.js built-ins (`fs.promises`) instead of shell commands. `cp -r` not used. |
| Template content references Allen accidentally | Medium (human error) | Confusing for reusers | Lint check: run `grep -ri "allen\|iadb\|blackman" src/data-template/` in CI or pre-commit, should return nothing. |

---

## Resource Requirements

- **Time:** ~5-6 hours total across 4 phases
- **Infrastructure:** No new services. Uses existing Netlify, GitHub, Decap CMS.
- **Team:** One developer. No coordination needed beyond confirming with you (the user) at phase boundaries if issues arise.

---

## Future Considerations

Out of scope for this plan but worth noting:

- **Custom Decap CMS build with true inline preview** — if Phase 4 documentation proves insufficient, revisit the custom build. 6-10 hours plus maintenance.
- **Multi-researcher SaaS offering** — if Tailor-Mind wants to offer academic portfolios as a service, this templatability work is the foundation. Future: admin to create new sites from the template automatically.
- **Schema validation between `src/data/` and `src/data-template/`** — a CI check that ensures both directories have matching field shapes, preventing schema drift.
- **Migrate to Sveltia CMS** — Decap's spiritual successor, same config.yml format, better UX. When Sveltia hits 1.0, consider swapping.
- **Public-facing repo description change** — eventually rename repo or add description that positions it as "Academic Portfolio Template (Allen Blackman edition)."

---

## Documentation Plan

- `README.md`:
  - Add "Reusing this template" section
  - Add "Previewing draft changes" section
  - Add npm scripts reference (`reset-to-template`)
- `docs/brainstorms/2026-04-22-admin-ux-improvements-brainstorm.md` — already exists, will remain as decision record
- CMS admin inline docs — updated collection descriptions serve as embedded documentation for Allen

---

## Implementation Order

Ship sequentially as 4 PRs (or 4 commits on main, depending on preference):

1. **feat: reorganize admin sidebar and hide broken preview** (Phase 1)
2. **feat: per-page navigation visibility toggles** (Phase 2)
3. **feat: template directory and reset-to-template script** (Phase 3)
4. **docs: deploy preview workflow** (Phase 4)

Each should pass CI (build + lint) and be individually revertable.

---

## References & Research

### Internal References

- Brainstorm: `docs/brainstorms/2026-04-22-admin-ux-improvements-brainstorm.md`
- Existing admin config: `public/admin/config.yml`
- Existing sections logic: `src/lib/utils.ts` (`getEnabledSections()`)
- Existing Header component: `src/components/Header.astro`
- Existing page JSON files: `src/data/settings/*.json`

### External References

- [Decap CMS configuration](https://decapcms.org/docs/configuration-options/)
- [Decap CMS file collections](https://decapcms.org/docs/collection-file/)
- [Decap CMS widgets](https://decapcms.org/docs/widgets/)
- [Netlify Deploy Previews](https://docs.netlify.com/site-deploys/deploy-previews/)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)

### Related Work

- Original project plan: `docs/plans/2026-04-21-feat-allen-blackman-academic-portfolio-plan.md`
- Live site: https://allenblackman.netlify.app
- GitHub repo: https://github.com/Tailor-Mind/allen-blackman-site
