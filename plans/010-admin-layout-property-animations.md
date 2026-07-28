# 010 — Replace admin `width`/`height` layout-property animations

- **Status**: TODO
- **Commit**: d0a18b9
- **Severity**: MEDIUM
- **Category**: Performance (5)
- **Estimated scope**: 3 files, 3 small edits (different fix shape per file — see below)

## Problem

Three admin locations animate `width` or `height` directly — a
layout-triggering property (per this audit's own Performance rule: "Animate
`transform` and `opacity` only. `width`/`height`/`margin`/`padding`/`top`/`left`
trigger layout + paint + composite").

**1. Progress bars — `frontend/app/admin/page.tsx:547-555`** (dashboard
stat bars, re-triggered on every dashboard view):

```tsx
<div className="h-3 bg-[var(--noir-bg-surface-3)] rounded-full overflow-hidden">
  <motion.div
    className={`h-3 ${row.barColor} rounded-full`}
    initial={{ width: 0 }}
    whileInView={{ width: `${Math.min(row.value * 10, 100)}%` }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, ease: easeOut }}
  />
</div>
```

**2. Progress bar — `frontend/app/admin/jobs/page.tsx:270-277`** (per-job
match-score bar, one per row in a list):

```tsx
<div className="h-2 w-full bg-[var(--noir-bg-surface-2)] rounded-full overflow-hidden">
  <motion.div
    className={`h-2 rounded-full ${getProgressColor(job.matchScore ?? 0)}`}
    initial={{ width: 0 }}
    animate={{ width: `${job.matchScore}%` }}
    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
  />
</div>
```

Both of these are pure decorative fill bars — the bar exists only to
visually represent a percentage, so representing that percentage as a
`scaleX` transform (with `transform-origin: left`) instead of an actual
`width` change produces an identical visual result at zero layout cost.

**3. Bulk-action bar expand/collapse — `frontend/src/components/admin/BulkActionBar.tsx:29-34`**
(mounts/unmounts on every selection-count change across every admin table):

```tsx
<motion.div
  initial={{ opacity: 0, y: -8, height: 0 }}
  animate={{ opacity: 1, y: 0, height: "auto" }}
  exit={{ opacity: 0, y: -8, height: 0 }}
  transition={{ duration: 0.18 }}
  className="sticky top-0 z-20 mb-4 overflow-hidden"
>
```

This one is different in kind: it animates to `height: "auto"`, and Framer
Motion has no transform-based equivalent for "unknown/variable auto height"
— a `scaleY` transform would visually squash the row's own text/buttons
during the animation (since `scaleY` scales the box's content, not just its
box), and a `clip-path` reveal would clip the *visual* box while the DOM
element still occupies its full final height in layout from frame one,
desyncing the "table rows push down as the bar grows" effect this component
currently relies on. The correct fix here isn't a different property to
animate — it's to stop animating size at all: this bar's content
(`count selected` + action buttons) doesn't need to visually "grow"; it can
simply fade and slide in at its natural, already-full height.

## Target

**File 1 — `frontend/app/admin/page.tsx:547-555`**, `scaleX` on a
fixed-width bar instead of animating `width`:

```tsx
/* target */
<div className="h-3 bg-[var(--noir-bg-surface-3)] rounded-full overflow-hidden">
  <motion.div
    className={`h-3 w-full origin-left ${row.barColor} rounded-full`}
    initial={{ scaleX: 0 }}
    whileInView={{ scaleX: Math.min(row.value * 10, 100) / 100 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, ease: easeOut }}
  />
</div>
```

**File 2 — `frontend/app/admin/jobs/page.tsx:270-277`**, same technique:

```tsx
/* target */
<div className="h-2 w-full bg-[var(--noir-bg-surface-2)] rounded-full overflow-hidden">
  <motion.div
    className={`h-2 w-full origin-left rounded-full ${getProgressColor(job.matchScore ?? 0)}`}
    initial={{ scaleX: 0 }}
    animate={{ scaleX: job.matchScore / 100 }}
    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
  />
</div>
```

**File 3 — `frontend/src/components/admin/BulkActionBar.tsx:29-34`**, drop
the `height` keyframe entirely; keep only the transform/opacity motion that
was already there alongside it:

```tsx
/* target */
<motion.div
  initial={{ opacity: 0, y: -8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -8 }}
  transition={{ duration: 0.18 }}
  className="sticky top-0 z-20 mb-4 overflow-hidden"
>
```

## Repo conventions to follow

- `transform: scaleX()` with a `transform-origin: left` anchor for a percentage/progress fill is the same technique specified for the Navbar hover underline in plan 003 (`003-navbar-underline-scalex.md`) — Tailwind's `origin-left` utility class sets `transform-origin: left` declaratively, matching the class-based approach used there.
- `AnimatePresence` + `motion.div` with only `opacity`/`y` for mount/unmount reveals (no `height`) is already the exact pattern used by `AnimatedModal.tsx` and the admin page-transition block in `app/admin/layout.tsx` (`pageTransition` in `adminMotion.ts`) — neither animates `height`; both rely on the element's natural layout height being correct from the first frame.

## Steps

1. In `frontend/app/admin/page.tsx`, replace lines 547-555 exactly as shown in "File 1" above: add `w-full origin-left` to the inner bar's `className`, change `initial`/`whileInView` from `width`-based to `scaleX`-based (dividing the existing `Math.min(row.value * 10, 100)` percentage expression by 100 to get a 0-1 scale fraction). Do not change the outer track `<div>`'s className, the `transition`, or anything in the `.map()` callback outside this block.
2. In `frontend/app/admin/jobs/page.tsx`, replace lines 270-277 exactly as shown in "File 2" above: add `w-full origin-left` to the inner bar's `className`, change `initial`/`animate` from `width`-based to `scaleX`-based (`job.matchScore / 100`, preserving the exact same unguarded `job.matchScore` expression already used in the current `width` template — do not add a `?? 0` fallback that wasn't there before). Do not change the outer track `<div>`'s className, `getProgressColor(...)` call, or the `transition`.
3. In `frontend/src/components/admin/BulkActionBar.tsx`, remove `height: 0` from both `initial` and `exit`, and remove `height: "auto"` from `animate` (lines 30-32), leaving only `opacity`/`y` in each, exactly as shown in "File 3" above. Do not change the `transition`, `className`, or anything below line 34.

## Boundaries

- Do NOT touch any file other than the three named above.
- Do NOT change `getProgressColor(...)`, `row.barColor`, or any color/threshold logic in either progress-bar file — only the animated property changes, not what determines the bar's color.
- Do NOT add a `?? 0` fallback to `job.matchScore` in `admin/jobs/page.tsx` — replicate its current (unguarded) behavior exactly; fixing that potential edge case is out of scope for this plan.
- Do NOT attempt to preserve `BulkActionBar`'s "growing" visual effect via `scaleY` or `clip-path` — per the Problem section, both have real functional downsides here (content squashing / layout-desync respectively); dropping the height keyframe entirely is the deliberate, correct fix for this specific component.
- Do NOT touch `AnimatedModal.tsx`, `app/admin/layout.tsx`, or any other file cited only as a convention exemplar.
- If any of the three cited code blocks doesn't match the excerpts above (drift since commit `d0a18b9`), STOP and report on that specific file — the other two files in this plan can still proceed independently.

## Verification

- **Mechanical**: run `npx tsc --noEmit` from `frontend/` — expect no new errors. Run `npm run build` to confirm the build succeeds.
- **Feel check**:
  - Load `/admin` (Dashboard) and confirm the Projects/Skills/Certificates stat bars still fill in from empty to their correct proportional width over ~0.8s, at the same visual length as before (a bar representing e.g. 40% should still visually stop at 40% of the track).
  - Load `/admin/jobs` and confirm each job's match-score bar still fills to its correct percentage on load, in the correct color per `getProgressColor`.
  - In DevTools → Elements, inspect a filled bar in both pages and confirm the computed style shows `transform: scaleX(...)` and a static `width: 100%` (or equivalent), not an animated `width` percentage.
  - Select rows in any admin table (e.g. `/admin/blog`) to trigger `BulkActionBar` — confirm it still fades and slides in from slightly above (`y: -8 → 0`) when the first row is selected, and fades/slides out the same way when the selection is cleared. The bar should now appear at its full height immediately (no visible "growing" animation) while the fade/slide still plays.
  - In DevTools → Performance panel, record the dashboard load and a bulk-selection toggle before and after this change — confirm no "Recalculate Style"/layout entries are attributed to the three edited elements (only compositor/paint work for the scaleX/opacity/y changes).
- **Done when**: both progress bars visually fill to the correct proportional length via `scaleX` (not `width`), the bulk-action bar still fades/slides on mount/unmount with no height animation, and `npx tsc --noEmit` / `npm run build` are clean.
