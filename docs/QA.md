# QA — Reports & Release Checklist

**Updated:** 2026-07-22 (Phases C1–C8)

## Status of quality gates

| Gate | Status |
|---|---|
| `npx tsc --noEmit` | ✅ zero errors |
| `npx eslint .` | ✅ zero errors, zero warnings (was 55 errors / 11 warnings) |
| `npm run build` (Next 16, Turbopack) | ✅ passes, 20 routes |
| `./mvnw compile` | ✅ passes |
| Lighthouse | ⏳ requires the full stack running with data — see "How to run" below |

## Performance report

Implemented:

- Single persistent WebGL canvas (never one per section); `dpr` capped at 1.5;
  `frameloop="never"` + fade-out beyond the Hero→Skills range; desktop + motion-allowed only
- recharts removed from the public bundle (admin-only route chunks now)
- `next/image` everywhere on the public site (`sizes` provided); GitHub data server-fetched
  with `revalidate: 3600` — zero client JS for it beyond rendering
- Compositor-only custom cursor (single `transform` write per frame, no layout reads);
  bento-card glow batched to one rAF; Lenis driven from GSAP's ticker (one rAF loop total)
- All entrance animations are `transform`/`opacity` only

To verify: run both servers, `npm run build && npm start`, then Lighthouse against
`http://localhost:3000` (mobile + desktop). Expected risks worth checking: aurora blur
paint cost on low-end devices, hero image priority.

## Accessibility report

Implemented:

- `useReducedMotion` / `prefers-reduced-motion` respected in every animated component
  (hero, section wrappers, rotating roles, constellation, 3D scene, aurora, scroll cue)
- Rotating roles: `aria-live="polite"`, static under reduced motion, width reserved to
  prevent layout shift
- Skills constellation: `role="img"` + per-node `role="graphics-symbol"` with
  `aria-label`, keyboard-focusable nodes, live readout region
- Honeypot field is `aria-hidden` + `tabIndex={-1}` (invisible to AT and keyboard)
- Focus: global `:focus-visible` 2px accent outline; icon buttons in admin tables have
  `aria-label`s; form inputs have associated `<label>`s
- Muted text colors verified ≥ WCAG AA contrast on the noir background
- Semantic structure: single `<h1>` per page, sections with ids, JSON-LD Person schema

To verify: axe DevTools pass + full keyboard walkthrough (tab order through nav → hero
CTAs → constellation → forms), NVDA/VoiceOver spot-check of the rotating headline.

## SEO report

- `metadataBase` from `NEXT_PUBLIC_SITE_URL`; title/description/keywords/authors set
- OpenGraph + Twitter card metadata; generated 1200×630 `opengraph-image` (noir-branded)
- Per-case-study `generateMetadata` on `/projects/[id]`
- `robots.ts` + `sitemap.ts` routes; JSON-LD `Person` structured data on the home page
- Home degrades gracefully (renders fallback profile) instead of 404ing — crawlers never
  see a dead page when the backend hiccups

Remaining ideas: add case-study URLs to the sitemap dynamically; `BreadcrumbList`
schema on case studies.

## Security notes

- All secrets are env-only. **The previously committed Gmail app password and Adzuna key
  remain in git history — rotate both.** (Flagged 2026-07-22.)
- Contact form: honeypot + minimum-time trap client-side; consider a backend rate limit
  (e.g. bucket per IP on `/api/public/contact`) as follow-up hardening.
- JWT-guarded admin routes (Spring Security); public GETs are read-only.

## Release checklist

Before shipping any change:

1. `npx tsc --noEmit` && `npx eslint .` — must be clean
2. `npm run build` — must pass
3. Backend `./mvnw compile` (or `test` when tests exist)
4. Manual pass with both servers running:
   - [ ] Hero: entrance, rotating roles, magnetic CTAs, resume download, scroll cue
   - [ ] 3D scene: morphs Hero→Skills, fades after, absent on mobile/reduced-motion
   - [ ] Skills constellation: hover/focus spotlight, category chips, readout
   - [ ] Projects: cards tilt, lightbox, Case Study links; `/projects/[id]` renders
   - [ ] GitHub section: stats/languages/repos (needs network)
   - [ ] Contact: validation errors, success path, meeting scheduling, spam trap no-ops
   - [ ] Admin: login/logout, CRUD on every entity, project drag-reorder persists,
         case-study fields round-trip
   - [ ] `prefers-reduced-motion`: content readable, no motion
   - [ ] Mobile (375px), tablet (768px), desktop (1280px), ultrawide
   - [ ] Zero console errors on every page

## Known follow-ups

- Admin live preview (draft state before publishing) — needs draft/published flags on
  entities; currently edits publish immediately
- Backend rate limiting on the public contact endpoint
- Case-study URLs in the dynamic sitemap
- Backend test package still `com.purvisha.*` (name mismatch, cosmetic)
