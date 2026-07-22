# Portfolio Platform — Repository Audit

**Date:** 2026-07-22 · **Scope:** full repo (`frontend/` Next.js 16 + `backend/portfolio-backend/` Spring Boot)

## Executive summary

The platform is a mid-flight premium redesign, not a greenfield. Phases A/B of a "noir/champagne" design system are already committed: every public section consumes `--noir-*` tokens, the Hero is rebuilt (Fraunces serif display, magnetic CTAs, reduced-motion-aware), and a single persistent R3F scene morphs across Hero→Skills via a shared `heroSceneProgress` value driven by GSAP ScrollTrigger synced to Lenis. Foundation quality is high: compositor-only custom cursor, batched per-frame glow updates, `tsc --noEmit` passes clean.

The gap to the brief is concentrated in: (1) content depth (projects are flat cards, no case studies), (2) missing GitHub integration, (3) Skills still uses forbidden progress bars, (4) 55 ESLint errors, (5) **committed credentials in the backend**, and (6) admin panel lacks drag-drop ordering and live preview.

## Architecture

```
frontend/  Next.js 16.2.6, React 19, TS, Tailwind v4, framer-motion 12, GSAP+ScrollTrigger, Lenis, R3F+drei, recharts
  app/            App Router: public page (force-dynamic), /admin/* (13 pages), /login, /register, robots.ts, sitemap.ts
  src/components/ public sections + admin/* forms/tables + scene/ + ui/
  src/services/   16 fetch-based service modules → Spring API
backend/portfolio-backend/  Spring Boot, JWT auth, JPA entities (Profile, Project, Skill, Experience, Education,
                 Certificate, ContactInquiry, JobApplication, User/Role), AI job-match + resume services, uploads
```

Server component `app/page.tsx` fetches all content via `Promise.all` with per-call `.catch` fallbacks, renders JSON-LD Person schema. Sound structure; no need to replace the architecture.

## Critical issues

1. **Committed secrets (backend `application.properties`)** — Gmail app-password fallback (`spring.mail.password=${SPRING_MAIL_PASSWORD:usto movs oiqo ggvg}`), hardcoded Adzuna API key, DB password default `12345`. These are in git history. **Action: strip defaults, load from env only; rotate the Gmail app password and Adzuna key (user action).**
2. **55 ESLint errors / 11 warnings** — mostly `@typescript-eslint/no-explicit-any` in `src/services/*`, plus `react-hooks/set-state-in-effect` in `localeContext.tsx`. Brief requires zero.
3. **`notFound()` when backend is down** — `app/page.tsx` 404s the entire portfolio if `getProfile()` fails. A portfolio must degrade gracefully (static fallback content).

## Brief gaps (feature-level)

| Brief requirement | Current state |
|---|---|
| Rotating roles in hero | Missing — static headline |
| Resume download CTA | Missing from hero (backend has ResumeController) |
| Skills: "no boring progress bars" | **Progress bars present** + recharts radar; needs interactive viz (constellation/orbit) |
| GitHub integration (repos, languages, stars, activity) | Missing entirely — no service, no section |
| Project case studies (problem/solution/architecture/metrics) | Flat cards only; `Project` entity lacks fields |
| Admin drag-drop ordering | Missing (no `displayOrder` handling in UI) |
| Admin live preview | Missing |
| Contact spam protection | None (no honeypot/rate-limit) |
| OG/Twitter image | No `opengraph-image`; `public/` still has Next template SVGs (dead assets) |
| Page transitions | None |
| Testimonials | Not present (optional per brief) |

## Design system state

- Tokens: `--noir-bg/-elevated/-fg/-fg-muted/-fg-subtle/-accent/-accent-soft/-border` (contrast-checked); legacy `--accent-cyan/blue/purple` tokens still declared in `:root` but no component references remain → remove.
- Type: Fraunces (display/serif) + Plus Jakarta Sans (body) + Outfit (legacy, still the `body` default via `--font-display`) → consolidate; no formal type scale documented.
- Spacing/grid: Tailwind defaults + `max-w-7xl px-6 md:px-10` convention; consistent but implicit.
- Motion: shared `easeOut [0.16,1,0.3,1]` cubic-bezier, staggered entrances, `useReducedMotion` respected in Hero/SectionWrapper/scene. No documented motion guidelines; durations vary per file.

## Performance & a11y observations

- Good: persistent single WebGL context (desktop + motion-allowed only), dynamic import w/ `ssr:false`, error boundary, `next/image` everywhere sampled, compositor-only cursor, batched glow rAF, focus-visible outlines, WCAG-checked muted colors.
- Risks: `force-dynamic` home = no static caching (acceptable, admin-driven content; consider `revalidate` later); aurora blobs 800px blur-140px ×3 can cost paint on low-end; recharts (~100KB) used only for a radar chart that will be replaced; `body::before` noise overlay `z-index:9999` above everything incl. lightbox controls (verify); `tsconfig.tsbuildinfo` committed.
- Backend: `entity/.LCKRole.java~` stale editor lock file committed; `target/` build output committed (should be git-ignored); test package name mismatch (`com.purvisha` vs `com.jaimin`).

## Dead code / cleanup

- `src/components/Stats.tsx`, `ThemeToggle.tsx` (already deleted in working tree, uncommitted)
- Legacy `--accent-*`/`--glass-*` tokens (glass still used by `.bento-card` — migrate values into noir set)
- `public/{file,globe,next,vercel,window}.svg` Next template leftovers
- `backend/**/target/`, `.LCKRole.java~`, `frontend/tsconfig.tsbuildinfo`

## Recommended plan

- **C1 — Hygiene (this phase):** commit in-flight cleanup; strip backend secrets → env-only; delete dead assets; fix all 66 lint problems; graceful home fallback instead of `notFound()`.
- **C2 — Design system doc + tokens:** consolidate fonts (drop Outfit), formalize scale in `docs/DESIGN.md`, migrate glass tokens into noir.
- **C3 — Hero completion:** rotating roles, resume download, GitHub/LinkedIn icon row.
- **C4 — Skills constellation:** replace bars+radar with interactive orbital/constellation viz (R3F or SVG), drop recharts if unused elsewhere (admin uses it? verify).
- **C5 — Projects → case studies:** extend entity+DTO+admin form (problem, solution, architecture, metrics, challenges, learnings), project detail route `/projects/[slug]`, animated preview cards.
- **C6 — GitHub section:** server-side fetch w/ revalidate; repos, languages, stars; no default heatmap.
- **C7 — Admin: drag-drop ordering + live preview; contact honeypot + rate limit.**
- **C8 — SEO/a11y/perf pass:** OG image route, metadataBase, page transitions w/ reduced-motion, Lighthouse run, bundle check.
- **C9 — Final QA + reports + deployment docs.**
