# 008 — Respect `prefers-reduced-motion` in entrance animations across 8 public-site files

- **Status**: TODO
- **Commit**: d0a18b9
- **Severity**: MEDIUM
- **Category**: Accessibility (6)
- **Estimated scope**: 8 files, ~17 small edits (one per animated element), fully mechanical

## Problem

`Hero.tsx` already imports and calls `useReducedMotion()` (for its scroll-cue
bounce and the availability-badge `animate-ping`), but its five main
entrance animations (name, badge, headline, CTAs, social row) still always
animate a `y` offset regardless of the OS setting. The other seven files
listed below don't call `useReducedMotion()` at all — every one of their
`initial={{ opacity: 0, y: N }}` → `whileInView={{ opacity: 1, y: 0 }}`
reveals always plays the `y` motion, with no reduced-motion branch.

In every single case below, the **visible/animate state's `y` is already
`0`** — only the **hidden/initial state's `y` offset** needs to become
conditional. This makes the fix a strict, repeatable one-line-per-element
pattern: `y: N` → `y: shouldReduceMotion ? 0 : N` in the `initial` (or
`exit`, for `ImageLightbox`) object only. Nothing about duration, easing,
delay, opacity, or trigger logic changes anywhere.

### File 1 — `frontend/src/components/Hero.tsx` (already has `shouldReduceMotion`, no new import needed)

`useReducedMotion()` is already imported and called at lines 4 and 21:
`const shouldReduceMotion = useReducedMotion();` — reuse this existing
variable for all five edits below; do not add a second declaration.

Current → target for each of the five entrance elements:

1. Lines 43-48 (outer content wrapper):
   ```tsx
   /* current */
   initial={{ opacity: 0, y: 24 }}
   /* target */
   initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
   ```
2. Lines 50-56 (availability badge):
   ```tsx
   /* current */
   initial={{ opacity: 0, y: 12 }}
   /* target */
   initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
   ```
3. Lines 72-80 (name `motion.h1`):
   ```tsx
   /* current */
   initial={{ opacity: 0, y: 20 }}
   /* target */
   initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
   ```
4. Lines 83-98 (headline `motion.p` wrapping `RotatingRoles`):
   ```tsx
   /* current */
   initial={{ opacity: 0, y: 16 }}
   /* target */
   initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
   ```
5. Lines 101-138 (CTAs row):
   ```tsx
   /* current */
   initial={{ opacity: 0, y: 16 }}
   /* target */
   initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
   ```
6. Lines 144-206 (social row, inside the `{(profile.githubUrl || ...) && (...)}` conditional):
   ```tsx
   /* current */
   initial={{ opacity: 0, y: 16 }}
   /* target */
   initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
   ```

Do not touch the scroll-cue block (lines 210-228) or the `animate-ping` span
(lines 57-63) — both already correctly check `!shouldReduceMotion`.

### File 2 — `frontend/src/components/About.tsx` (needs new import + hook call)

Current imports, line 1-9:
```tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";
import { Code, GraduationCap, Briefcase, Award, MapPin, Mail, Phone, ArrowUpRight } from "lucide-react";
import { useLocale } from "@/lib/localeContext";
import { Profile } from "@/types";
import SectionHeading from "@/components/ui/SectionHeading";
```

Target: merge `useReducedMotion` into the existing `framer-motion` imports
(this file already has two separate `framer-motion` import lines — line 3
and line 5 — merge all three named imports into one line to avoid a third):
```tsx
"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Code, GraduationCap, Briefcase, Award, MapPin, Mail, Phone, ArrowUpRight } from "lucide-react";
import { useLocale } from "@/lib/localeContext";
import { Profile } from "@/types";
import SectionHeading from "@/components/ui/SectionHeading";
```

Inside `export default function About({ ... }) {`, immediately after
`const { t } = useLocale();` (line 64), add:
```tsx
const shouldReduceMotion = useReducedMotion();
```

Then three elements need the same `y` edit:

1. Lines 79-85 (bio bento card):
   ```tsx
   /* current */
   initial={{ opacity: 0, y: 30 }}
   /* target */
   initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
   ```
2. Lines 134-141 (stats grid item, inside `stats.map(...)`):
   ```tsx
   /* current */
   initial={{ opacity: 0, y: 30 }}
   /* target */
   initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
   ```
3. Lines 162-168 (`motion.a` "Let's build something" CTA):
   ```tsx
   /* current */
   initial={{ opacity: 0, y: 30 }}
   /* target */
   initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
   ```

### Files 3-6 — one element each, identical recipe

Each of these five files needs the same two additions — (a) add
`useReducedMotion` to the existing `"framer-motion"` import, currently
`import { motion } from "framer-motion";` in every one of them, becoming
`import { motion, useReducedMotion } from "framer-motion";`; and (b) add
`const shouldReduceMotion = useReducedMotion();` as the first line inside
the component body (right after the `const { t } = useLocale();` line in
each) — then apply the one `y` edit below.

| File | Component line | Current `initial` | Target `initial` |
|---|---|---|---|
| `frontend/src/components/Certificates.tsx:31-40` | `export default function Certificates` | `initial={{ opacity: 0, y: 20 }}` | `initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}` |
| `frontend/src/components/Education.tsx:31-38` | `export default function Education` | `initial={{ opacity: 0, y: 20 }}` | `initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}` |
| `frontend/src/components/Experience.tsx:31-38` | `export default function Experience` | `initial={{ opacity: 0, y: 20 }}` | `initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}` |
| `frontend/src/components/Testimonials.tsx:43-49` | `export default function Testimonials` | `initial={{ opacity: 0, y: 24 }}` | `initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}` |

For `Certificates.tsx`, `Education.tsx`, and `Experience.tsx`, add the
`shouldReduceMotion` line after `const { t } = useLocale();` inside their
respective component functions (each file's structure is otherwise
identical — a single `.map()` over one array producing one `motion.a` or
`motion.div` per item). For `Testimonials.tsx`, add it after
`const { t } = useLocale();` as well (line 28).

### File 7 — `frontend/src/components/GitHubShowcase.tsx` (three elements)

Add `useReducedMotion` to the import (line 3: `import { motion } from
"framer-motion";` → `import { motion, useReducedMotion } from
"framer-motion";`), and add `const shouldReduceMotion = useReducedMotion();`
after `const { t } = useLocale();` (line 12). Then:

1. Lines 35-41 (stats row item, inside `stats.map(...)`):
   ```tsx
   /* current */
   initial={{ opacity: 0, y: 16 }}
   /* target */
   initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
   ```
2. Lines 59-64 (language distribution bar, inside `{totalLangRepos > 0 && (...)}`):
   ```tsx
   /* current */
   initial={{ opacity: 0, y: 16 }}
   /* target */
   initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
   ```
3. Lines 108-117 (top repos card, inside `data.topRepos.map(...)`):
   ```tsx
   /* current */
   initial={{ opacity: 0, y: 20 }}
   /* target */
   initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
   ```

### File 8 — `frontend/src/components/ImageLightbox.tsx` (spring scale/y, both `initial` and `exit`)

This file has no `useLocale()` call to anchor on, so add the hook
declaration as the first line inside the component body instead. Add
`useReducedMotion` to the import (line 4: `import { motion, AnimatePresence
} from "framer-motion";` → `import { motion, AnimatePresence,
useReducedMotion } from "framer-motion";`), and inside
`export default function ImageLightbox({ ... }) {`, add
`const shouldReduceMotion = useReducedMotion();` as the first line (before
`const dialogRef = useRef...`, i.e. before line 22).

The outer backdrop (lines 77-87, `initial={{ opacity: 0 }}` /
`animate={{ opacity: 1 }}` / `exit={{ opacity: 0 }}`) is opacity-only
already and needs no change. Only the inner "Image preview frame" (lines
126-133) needs editing — both its `initial` and `exit` carry the same
`scale`/`y` values:

```tsx
/* current, lines 126-133 */
<motion.div
  initial={{ scale: 0.95, y: 10 }}
  animate={{ scale: 1, y: 0 }}
  exit={{ scale: 0.95, y: 10 }}
  transition={{ type: "spring", damping: 25, stiffness: 300 }}
  onClick={(e) => e.stopPropagation()}
  className="relative max-w-5xl max-h-[85vh] flex flex-col items-center select-none"
>
```

```tsx
/* target */
<motion.div
  initial={{ scale: shouldReduceMotion ? 1 : 0.95, y: shouldReduceMotion ? 0 : 10 }}
  animate={{ scale: 1, y: 0 }}
  exit={{ scale: shouldReduceMotion ? 1 : 0.95, y: shouldReduceMotion ? 0 : 10 }}
  transition={{ type: "spring", damping: 25, stiffness: 300 }}
  onClick={(e) => e.stopPropagation()}
  className="relative max-w-5xl max-h-[85vh] flex flex-col items-center select-none"
>
```

## Repo conventions to follow

- `const shouldReduceMotion = useReducedMotion();` called once near the top of the component, then referenced inline in `initial`/`exit` objects, is the exact existing pattern in `Hero.tsx:21` and `SectionWrapper.tsx` (pre-simplification) — this plan extends that established pattern to the remaining files rather than inventing a new one (e.g. no wrapping `<MotionConfig>` — that pattern is reserved for the admin panel per plan 006, where a single shared root layout made it the practical choice; these are separate public-site components each already following the per-component hook convention).
- Only the offset value branches (`y`/`scale` → `0`/`1` under reduced motion) — opacity animations are always kept, per this codebase's own established reduced-motion philosophy (see `Hero.tsx`'s scroll-cue and `SectionWrapper.tsx`'s reduced-motion variant, both of which keep an opacity fade and only drop the positional motion).

## Steps

1. Edit `frontend/src/components/Hero.tsx`: apply the six `y` edits listed under "File 1" above. Do not add any new import or hook call — `shouldReduceMotion` already exists at line 21.
2. Edit `frontend/src/components/About.tsx`: merge the `framer-motion` imports as shown, add the `shouldReduceMotion` declaration, apply the three `y` edits listed under "File 2".
3. Edit `frontend/src/components/Certificates.tsx`, `Education.tsx`, `Experience.tsx`, `Testimonials.tsx`: for each, add `useReducedMotion` to its `framer-motion` import, add `const shouldReduceMotion = useReducedMotion();` after its `useLocale()` call, and apply the one `y` edit from the "Files 3-6" table.
4. Edit `frontend/src/components/GitHubShowcase.tsx`: add the import and hook declaration as described, apply the three `y` edits listed under "File 7".
5. Edit `frontend/src/components/ImageLightbox.tsx`: add the import and hook declaration as described (anchored at the top of the component body, not after a `useLocale()` call since this file has none), apply the `scale`/`y` edit to both `initial` and `exit` on the inner frame only, as shown under "File 8". Leave the outer backdrop's opacity-only animation untouched.

## Boundaries

- Do NOT touch any file not explicitly named above (8 files total: `Hero.tsx`, `About.tsx`, `Certificates.tsx`, `Education.tsx`, `Experience.tsx`, `Testimonials.tsx`, `GitHubShowcase.tsx`, `ImageLightbox.tsx`).
- Do NOT change any `transition` (duration/delay/ease/spring config), any `opacity` value, any `whileInView`/`animate`/`viewport` prop, or any non-motion JSX/markup — every edit is scoped strictly to the numeric `y` (or `scale`) value inside `initial`/`exit` objects, replacing a literal number with a ternary against `shouldReduceMotion`.
- Do NOT modify `SectionWrapper.tsx` as part of this plan — its reduced-motion handling was already addressed by plan 007 (separately) and needs no further change here.
- Do NOT touch `Skills.tsx`, `Projects.tsx`, or `AtsMatcher.tsx` — those files' entrance animations are a separate, not-yet-selected finding from the same audit category and are out of scope for this plan.
- If any cited file's current content doesn't match the excerpts above (drift since commit `d0a18b9`), STOP and report on that specific file instead of improvising — the other files in this plan can still proceed independently since each file's edit is self-contained.

## Verification

- **Mechanical**: run `npx tsc --noEmit` from `frontend/` — expect no new errors across all 9 files. Run `npm run build` to confirm the build succeeds.
- **Feel check**:
  - With reduced motion OFF (default), load the home page and scroll through Hero, About, Certificates, Education, Experience, Testimonials, GitHubShowcase — confirm every entrance animation looks and feels completely unchanged (same `y` distances, same stagger delays, same easing).
  - Open the project image lightbox (click any project thumbnail) with reduced motion OFF — confirm the preview frame still does its spring scale-and-rise-in exactly as before.
  - In DevTools → Rendering panel, set `prefers-reduced-motion` to `reduce`, reload, and repeat: scroll through all seven sections and confirm every element now fades in with **no** vertical movement (elements should already be at their final `y` position, only opacity animating in).
  - With reduced motion still set to `reduce`, open the image lightbox again — confirm the preview frame now fades in at its final scale/position with no scale-up or rise motion, while the backdrop still fades as before.
  - Turn the emulation back off and confirm all motion returns to normal immediately.
- **Done when**: with `prefers-reduced-motion: reduce` emulated, none of the 17 edited elements across these 8 files show any `y`/`scale` motion (opacity-only reveals remain), with reduced motion off everything is pixel- and timing-identical to before, and `npx tsc --noEmit` / `npm run build` are clean.
