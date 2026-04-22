# Admin UX Improvements + Templatability

**Date:** 2026-04-22
**Status:** Brainstorm complete — ready for planning

---

## What We're Building

Improve the Decap CMS admin experience for Allen Blackman's portfolio site. The current admin has grown to 20+ sidebar entries organized by file structure rather than by user mental model. Allen finds it hard to (a) locate the right setting for a given edit and (b) see what his change will look like on the actual site before publishing.

## Primary Pain Points Identified

1. **Cognitive mapping gap** — Admin is organized around file structure (Page Content, Site Settings, Taxonomies) but Allen thinks in terms of pages ("I want to change the About page"). Content for a single page is split across multiple admin entries (e.g., the homepage is influenced by "Home Page," "Identity & SEO," and "Social Profiles").

2. **Broken preview button** — The native Decap "Check for Preview" toggle does nothing because Decap requires custom React preview templates which aren't built. The broken button creates false expectations.

3. **No way to verify changes before publish** — Allen saves a draft, publishes it, waits 60 seconds, hard-refreshes, then sees the result. No pre-publish verification.

---

## Chosen Approach: A + B Combined

### Approach A — Page-centric navigation + "View page" links

Reorganize the Decap CMS sidebar around **pages** (what Allen wants to edit) rather than **file types** (how the code is organized). Add a direct "View current version on site" link on every page-specific entry.

**Sidebar reorganization proposal:**

```
📝 Pages          — edit what's shown on each page
📚 Content        — add/edit publications, posts, projects, tools, links
⚙️ Settings       — site-wide identity, appearance, social
🏷️ Taxonomies    — categories used by Content collections
```

Each page entry under "Pages" gets a **"→ View on site"** link in its description, pointing to the live URL. Allen can open the live page in another tab while editing — clear context for what he's changing.

### Approach B — Netlify deploy previews surfaced in Decap

Every draft edit in Decap creates a PR on GitHub. **Netlify already auto-builds a unique deploy preview URL for each PR.** Surface that URL prominently in the Decap editorial workflow view:

- On each draft card in the Workflow kanban, add a **"🔍 Preview draft →"** button
- Clicking opens `https://deploy-preview-N--allenblackman.netlify.app/page` in a new tab
- Allen sees his actual draft rendered on the real site (not a mock)
- When it looks right, click Publish

---

## Why This Approach

- **Matches Allen's mental model** (A) — reduces the "where do I go to edit X" friction
- **True visual verification** (B) — no fake preview, the real site
- **Leverages existing infrastructure** (B) — Netlify deploy previews already exist; we just surface them
- **Low maintenance** — no custom React preview components to keep in sync with Astro
- **Incremental** — A can ship first (~1 hour) for immediate relief; B follows (~2-3 hours)

### Rejected alternatives

- **Approach C: Custom Decap preview templates** — rejected due to maintenance burden. Would require rebuilding every Astro component as a React preview template and keeping them in sync forever.
- **Leave admin as-is** — rejected because the user explicitly asked for improvements.

---

## Key Decisions

1. **Reorganize sidebar around pages, not files.** The technical file structure stays the same; only the CMS config labels/grouping change.

2. **Add a "View on site" link on every page-specific entry.** Implementation: via the collection/entry description text or custom hint fields. URLs are hardcoded (e.g., `/about`, `/cv`) since page paths don't change often.

3. **Remove or hide the `Check for Preview` toggle.** Decap's preview requires custom templates we don't have. Exposing it creates false expectations. Either hide the button or document that it's intentionally disabled.

4. **Add "Preview draft" links using Netlify deploy previews.** Each Decap draft = 1 GitHub PR = 1 Netlify deploy preview URL. Surface that URL as a link on the draft card.

5. **Keep the existing field-level SEO hints.** Those were added for education; they don't need to change.

6. **No changes to the content model.** This is purely an admin UX refactor — no schema or template changes.

---

## Open Questions

1. **How exactly to surface the "Preview draft" button in Decap?** Options:
   - Custom React component overriding Decap's default workflow card (requires custom Decap CMS build)
   - A simple README note in the admin explaining how to construct the preview URL from the PR number
   - Adding a "Draft preview" link to the collection description (simpler but less visible)

2. **Should "Content" collections (Publications, Blog, Projects) also get `→ View listing` links?** Probably yes, consistent with Pages.

3. **Is the "Footer" really a page?** It's rendered on every page. Currently under Page Content. Could move to Site Settings since it's site-wide.

4. **Do we rename "Page Content" to "Pages"?** Less technical, clearer.

5. **How to handle the "Home" toggle in section visibility** (not directly part of this work but related). The Home section has `"enabled": true` in sections.json but toggling it off doesn't actually hide the home route (it can't — root path must render). Should clean up.

---

## Success Criteria (Admin UX)

- Allen can find the right admin entry for any page edit in under 5 seconds
- Allen can preview any draft change against the real site before publishing
- No broken or misleading UI elements (the Preview button issue)
- Reduced sidebar clutter without losing functionality
- Existing CMS workflow (save → publish) still works unchanged

---

## Additional Dimension: Templatability (John Doe Defaults)

The current repo seeds `src/data/` with Allen-specific content (name, bio, IDB affiliation, research areas, publications). This makes reuse for another researcher require manually deleting Allen's content file-by-file. We want a cleaner separation:

- **Code / template** = generic placeholder content ("Dr. Jane Doe", "Junior Researcher", sample university)
- **Instance data** = the specific researcher's actual content (lives in `src/data/`, committed via CMS)
- **Reuse** = a new researcher clones the repo, runs a reset command, and customizes via the CMS

### Chosen approach — template directory + reset script

Create `src/data-template/` mirroring the structure of `src/data/` but with generic John Doe content:

```
src/
  data/              ← Allen's actual content (deployed on this instance)
  data-template/     ← NEW: generic John Doe defaults
  content.config.ts
```

Add a reset script (`npm run reset-to-template`) that copies `data-template/` → `data/`. Document in README so future researchers know the flow.

**Why this approach:**
- Allen's site keeps working as-is — zero migration pain
- Template content is explicit and easy to maintain alongside the real content
- No branch juggling or CI complexity
- New researcher fork: clone → reset → deploy → customize via CMS

**Rejected alternatives:**
- **Branch-based (template/allen branches)** — too much Git ceremony, Decap CMS only commits to `main`
- **Replace Allen content with placeholders now, have Allen re-enter via CMS** — unnecessary friction for zero technical benefit
- **Environment variables + build-time data injection** — over-engineered for a static portfolio

### What the John Doe defaults should look like

Every field should have a clearly-fake but structurally-correct placeholder:

| File | Allen (current) | John Doe template |
|---|---|---|
| `general.json` authorName | "Allen Blackman" | "Dr. Jane Doe" |
| `general.json` authorTitle | "Lead Economist" | "Junior Researcher" |
| `general.json` authorAffiliation | "Inter-American Development Bank" | "Placeholder University" |
| `about.json` biography | Allen's real bio | "Jane Doe is a placeholder researcher..." |
| `social.json` googleScholar | Allen's Scholar URL | "" (blank) |
| `src/data/projects/*.md` | 12 Allen projects | 2 sample projects |
| `src/data/publications/*.md` | 1 Allen paper | 1 sample paper |

### Success Criteria (Templatability)

- A new researcher can clone the repo, run `npm run reset-to-template`, and deploy a fully functional "blank" portfolio
- After reset, no trace of Allen remains in `src/data/` (except structural scaffolding)
- README documents the fork-and-customize flow clearly
- Allen's site is unaffected during this work

---

## Additional Improvement: Surface per-page visibility toggle

The existing **"Show in navigation"** toggle is currently buried in Site Settings → Navigation. Allen has to mentally context-switch to find it when editing a page. Move the toggle into each Page entry so it's right there in his editing flow.

### How it looks in the CMS (proposed)

Each Page entry under 📝 Pages gets two new fields at the top:

```
🏠 Home Page
  ────────────────────
  Show in navigation:  [✓ Visible]
  Navigation order:    [1]
  → View on site: https://allenblackman.netlify.app/
  ────────────────────
  [Page content fields...]
```

### Behavior (unchanged)

- Unchecked → link removed from nav menu
- Page URL still works (deliberate, for SEO and link-preservation)
- Implementation just moves the existing `sections.json.sections[].enabled` field into the per-page editing surface

### Still kept in Site Settings

The top-level **🧭 Navigation & Section Visibility** entry remains — useful as a "bird's-eye view" to reorder all sections or bulk-toggle. The per-page toggle is a shortcut for single-page edits.

---

## Updated Open Questions

1. **Do the Decap CMS field hints need to be generic too?** Currently several hints reference Allen's situation (e.g., "IDB Senior Fellow"). Should stay educational but become researcher-agnostic.
2. **Do we include any Allen content in the template for demonstration?** Probably not — template should be fully generic so it looks neutral.
3. **Should we also rename the repo?** `allen-blackman-site` is Allen-specific. A future template would want a neutral name like `academic-portfolio-template`. Out of scope for now; the current repo can stay as Allen's instance.

---

## Next Steps

Run `/workflows:plan` to create the detailed implementation plan.
