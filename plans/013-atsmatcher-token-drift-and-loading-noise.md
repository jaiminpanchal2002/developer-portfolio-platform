# 013 — Fix `AtsMatcher.tsx` easing/token drift and its triple-loop loading state

- **Status**: TODO
- **Commit**: d0a18b9
- **Severity**: LOW
- **Category**: Cohesion & tokens (7)
- **Estimated scope**: 1 file, 6 small edits

## Problem

`AtsMatcher.tsx` is the one public-site component that doesn't follow this
codebase's near-universal `const easeOut = [0.16, 1, 0.3, 1] as const;`
convention (every sibling section — `Projects.tsx`, `Skills.tsx`,
`Certificates.tsx`, `Education.tsx`, `Experience.tsx`, `Testimonials.tsx`,
`GitHubShowcase.tsx` — defines this exact constant). Instead:

- Its three `AnimatePresence`-switched result panels specify no `transition` at all (lines 110-114, 126-129, 150-153), silently falling back to Framer Motion's default spring.
- Its one explicit easing uses Framer's built-in `"easeOut"` string keyword instead of the shared cubic-bezier array (line 172).

Current code, `frontend/src/components/AtsMatcher.tsx:1-9` (imports):

```tsx
"use client";

import { useState } from "react";
import api from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, FileSearch, Sparkles, ArrowRight } from "lucide-react";
import { useLocale } from "@/lib/localeContext";
import SectionHeading from "@/components/ui/SectionHeading";
```

Current code, the three untransitioned panels and the one bare-string easing,
`frontend/src/components/AtsMatcher.tsx:108-153,160-173`:

```tsx
<AnimatePresence mode="wait">
  {!result && !loading && (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex-1 flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-dashed min-h-[280px] md:min-h-[360px]"
      style={{ borderColor: "var(--noir-border)" }}
    >
```

```tsx
  {loading && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center text-center p-8 rounded-3xl border min-h-[280px] md:min-h-[360px] space-y-4"
      style={{ borderColor: "var(--noir-border)" }}
    >
```

```tsx
  {result && !loading && (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex-1 bento-card p-6 md:p-8 shadow-xl space-y-6"
    >
```

```tsx
<svg className="w-full h-full transform -rotate-90">
  <circle cx="56" cy="56" r="48" fill="transparent" stroke="rgba(243,241,237,0.08)" strokeWidth="8" />
  <motion.circle
    cx="56"
    cy="56"
    r="48"
    fill="transparent"
    stroke="#c9a876"
    strokeWidth="8"
    strokeDasharray={2 * Math.PI * 48}
    initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
    animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - result.matchPercentage / 100) }}
    transition={{ duration: 1, ease: "easeOut" }}
  />
</svg>
```

Separately, the loading panel itself stacks three independent infinite loops
at once — a ring spin, an icon bounce, and a text pulse — which reads as
noisy against this file's own restrained result-card design and the rest of
the noir-themed public site:

```tsx
/* current, lines 133-145 */
<div className="relative w-24 h-24 flex items-center justify-center">
  <div
    className="absolute inset-0 rounded-full border-4 animate-spin"
    style={{ borderColor: "var(--noir-accent-soft)", borderTopColor: "var(--noir-accent)" }}
  />
  <FileSearch size={32} className="animate-bounce" style={{ color: "var(--noir-accent)" }} />
</div>
<h4 className="font-semibold tracking-wider font-mono" style={{ color: "var(--noir-fg)" }}>
  {t("ats.parsing", "PARSING JOB DETAILS")}
</h4>
<p className="text-xs max-w-xs animate-pulse" style={{ color: "var(--noir-fg-muted)" }}>
  {t("ats.parsing.subtitle", "Checking skills inventory, project experiences, and certificates alignment...")}
</p>
```

## Target

Add the shared `easeOut` constant (matching every sibling file), give all
three `AnimatePresence` panels an explicit transition using it, replace the
bare `"easeOut"` string on the radial gauge, and drop the redundant
bounce/pulse loops from the loading state — keeping only the ring spin as
the single loading signal:

```tsx
/* target, add after imports, before the component */
const easeOut = [0.16, 1, 0.3, 1] as const;
```

```tsx
/* target, waiting panel, lines 110-114 */
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  transition={{ duration: 0.4, ease: easeOut }}
  className="flex-1 flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-dashed min-h-[280px] md:min-h-[360px]"
  style={{ borderColor: "var(--noir-border)" }}
>
```

```tsx
/* target, loading panel wrapper, lines 126-145 */
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3, ease: easeOut }}
  className="flex-1 flex flex-col items-center justify-center text-center p-8 rounded-3xl border min-h-[280px] md:min-h-[360px] space-y-4"
  style={{ borderColor: "var(--noir-border)" }}
>
  <div className="relative w-24 h-24 flex items-center justify-center">
    <div
      className="absolute inset-0 rounded-full border-4 animate-spin"
      style={{ borderColor: "var(--noir-accent-soft)", borderTopColor: "var(--noir-accent)" }}
    />
    <FileSearch size={32} style={{ color: "var(--noir-accent)" }} />
  </div>
  <h4 className="font-semibold tracking-wider font-mono" style={{ color: "var(--noir-fg)" }}>
    {t("ats.parsing", "PARSING JOB DETAILS")}
  </h4>
  <p className="text-xs max-w-xs" style={{ color: "var(--noir-fg-muted)" }}>
    {t("ats.parsing.subtitle", "Checking skills inventory, project experiences, and certificates alignment...")}
  </p>
</motion.div>
```

```tsx
/* target, result panel, lines 150-153 */
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.4, ease: easeOut }}
  className="flex-1 bento-card p-6 md:p-8 shadow-xl space-y-6"
>
```

```tsx
/* target, radial gauge transition, line 172 */
transition={{ duration: 1, ease: easeOut }}
```

## Repo conventions to follow

- `const easeOut = [0.16, 1, 0.3, 1] as const;` declared at module scope, right after imports and before the component, is the exact placement and value used in `frontend/src/components/Projects.tsx:17`, `frontend/src/components/Skills.tsx:24`, `frontend/src/components/Certificates.tsx:9`, `frontend/src/components/Education.tsx:9`, `frontend/src/components/Experience.tsx:9`, `frontend/src/components/Testimonials.tsx:11`, `frontend/src/components/GitHubShowcase.tsx:9` — this plan brings `AtsMatcher.tsx` in line with all seven.
- A single infinite loop as the sole "in progress" signal (not stacked with others) is how loading/busy states are handled elsewhere in this codebase — e.g. the plain `animate-spin` ring used alone in `AtsMatcher.tsx`'s own submit button (line 93) and in admin loading spinners; this plan makes the result panel's loading state consistent with that same "one spinner, nothing else looping" convention.

## Steps

1. In `frontend/src/components/AtsMatcher.tsx`, add `const easeOut = [0.16, 1, 0.3, 1] as const;` on its own line immediately after the imports (after line 8, before `export default function AtsMatcher() {`).
2. Add `transition={{ duration: 0.4, ease: easeOut }}` to the waiting-state `motion.div` (lines 110-114), positioned after `exit` and before `className`, matching the Target section.
3. Add `transition={{ duration: 0.3, ease: easeOut }}` to the loading-state `motion.div` (lines 126-129), same positioning.
4. Add `transition={{ duration: 0.4, ease: easeOut }}` to the result-state `motion.div` (lines 150-153), same positioning.
5. Remove `animate-bounce` from the `FileSearch` icon's className at line 138 (leaving no `className` string content beyond removing that one token — the icon has no other classes, so the `className` prop can be removed entirely if it becomes empty, or left as `className=""`; prefer removing the prop entirely since `size={32}` and `style={{ color: "var(--noir-accent)" }}` remain).
6. Remove `animate-pulse` from the caption `<p>`'s className at line 143 (leaving `className="text-xs max-w-xs"`).
7. Change `transition={{ duration: 1, ease: "easeOut" }}` to `transition={{ duration: 1, ease: easeOut }}` on the `motion.circle` radial gauge at line 172.

## Boundaries

- Do NOT touch any file other than `frontend/src/components/AtsMatcher.tsx`.
- Do NOT remove `animate-spin` from the ring (line 135) or the submit button's spinner (line 93) — per the fix, the ring spin is the one loading signal that should remain; only the redundant bounce/pulse are dropped.
- Do NOT change any `AnimatePresence`'s `mode` prop, any `initial`/`animate`/`exit` position/opacity/scale values, or any non-motion markup/copy — every edit is either adding a `transition` object, swapping an easing value, or removing one Tailwind animation class.
- Do NOT change the radial gauge's `strokeDasharray`/`strokeDashoffset` math or duration (`1`) — only its `ease` value changes.
- If any of the cited line ranges don't match the current-code excerpts above (drift since commit `d0a18b9`), STOP and report instead of improvising.

## Verification

- **Mechanical**: run `npx tsc --noEmit` from `frontend/` — expect no new errors (adding a typed `const` and `transition` objects, and removing Tailwind classes, are all type-safe). Run `npm run build` to confirm the build succeeds.
- **Feel check**:
  - Load the home page, scroll to the ATS Matcher section, and submit a job description.
  - Confirm the waiting → loading → result panel swap now has a consistent, deliberate feel across all three states (same strong-decelerate curve), rather than the loading/result transitions feeling different from the rest of the site's motion.
  - During the loading state, confirm only the ring visibly spins — the `FileSearch` icon in the center and the caption text below should now sit still (no bounce, no pulse).
  - Confirm the radial score gauge on the result panel still fills smoothly to the correct percentage over ~1 second; the curve should now feel slightly snappier/stronger at the end than Framer's generic `"easeOut"` did before — this is the intended, correct outcome of matching the repo's own curve, not a regression.
  - In DevTools → Rendering panel, set `prefers-reduced-motion` to `reduce` and repeat — note this file has no reduced-motion handling before or after this plan (a separate, not-yet-selected finding), so no behavior change is expected from that toggle here.
- **Done when**: all three result panels use the shared `easeOut` token, the radial gauge uses the token instead of a bare string, only the ring spin animates during loading (icon and caption are static), and `npx tsc --noEmit` / `npm run build` are clean.
