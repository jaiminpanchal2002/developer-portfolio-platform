# 007 — Stop `SectionWrapper` from double-animating every section's reveal

- **Status**: TODO
- **Commit**: d0a18b9
- **Severity**: MEDIUM
- **Category**: Cohesion & tokens (7) / Purpose & frequency (1)
- **Estimated scope**: 1 file, ~25 line simplification

## Problem

`SectionWrapper` wraps every single section on the homepage (`frontend/app/page.tsx:113-165` — About, Skills, Projects, GitHubShowcase, Experience, Education, Certificates, Testimonials, AtsMatcher, Contact, Appointment — 11 sections total) and gives each one a whole-section spring entrance: fade + rise + scale + 3D tilt.

At the same time, 9 of those 11 section components already implement their **own** independent `whileInView` fade/stagger for their inner cards/content, triggered by the same scroll-into-view moment (confirmed via grep for `whileInView`: `About.tsx`, `Certificates.tsx`, `Education.tsx`, `Experience.tsx`, `Testimonials.tsx`, `GitHubShowcase.tsx`, `Skills.tsx`, `Projects.tsx`, `AtsMatcher.tsx`). That means most sections currently play **two competing animation systems at once** on every reveal: the wrapper tilts/scales the whole section in while the content inside re-fades/staggers itself independently — redundant motion, not "why does this animate?"

Current code, `frontend/src/components/SectionWrapper.tsx` (full file):

```tsx
"use client";

import { motion, useReducedMotion, Variants } from "framer-motion";

export default function SectionWrapper({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  // If prefers-reduced-motion is true, display a simple fade reveal.
  const variants: Variants = shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.6 } },
      }
    : {
        hidden: { 
          opacity: 0, 
          y: 60,
          scale: 0.95,
          rotateX: 10
        },
        visible: { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          rotateX: 0,
          transition: { 
            type: "spring",
            stiffness: 70,
            damping: 15,
            mass: 0.8
          } 
        },
      };

  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={variants}
      style={{ perspective: 1000 }}
      className="max-w-7xl mx-auto px-6 py-24 relative"
    >
      {children}
    </motion.section>
  );
}
```

**Important constraint discovered while vetting this finding**: `style={{ perspective: 1000 }}` on this `<motion.section>` is not incidental — `frontend/src/components/Projects.tsx`'s `ProjectCard` (wrapped by this `SectionWrapper` via the `id="projects"` section) applies `rotateX`/`rotateY` motion values and `transformStyle: "preserve-3d"` with child `translateZ(30px)`/`translateZ(40px)` layers directly on its own card (`Projects.tsx:72,76,104`) for its mouse-tracked 3D tilt effect, and does **not** set its own `perspective` anywhere. CSS 3D transforms need a `perspective` on an ancestor to render with real depth rather than looking flat/distorted — `SectionWrapper`'s `perspective: 1000` is that ancestor today. **This must be kept even though the wrapper's own `rotateX` animation is being removed.**

Two of the eleven wrapped sections — `Contact.tsx` and `AppointmentBooking.tsx` — have **no motion of their own at all** (confirmed: `Contact.tsx` has zero `motion.`/`initial=`/`animate=` usage; `AppointmentBooking.tsx` has only a `motion.button` for its submit button, no section-level reveal). These two sections rely entirely on `SectionWrapper` for their entrance animation — so `SectionWrapper` cannot simply become a non-animating plain container, or those two sections would regress to popping in with zero reveal.

## Target

Keep `SectionWrapper` as the one place that gives every section a reveal (so `Contact`/`AppointmentBooking` don't lose their only animation), but reduce it to a single, always-applied **opacity-only fade** — dropping the `y`/`scale`/`rotateX` spring entirely. This removes the competing transform-heavy animation from the 9 sections that already animate their own content (their inner stagger becomes the sole positional motion, with the wrapper doing nothing but a light fade), while `Contact`/`AppointmentBooking` still get a clean, deliberate reveal instead of nothing. This is also exactly what the existing `prefers-reduced-motion` branch already did — so this change makes the reduced-motion and normal-motion paths converge on the same (already-audit-approved) design, letting the whole conditional be removed:

```tsx
/* target, frontend/src/components/SectionWrapper.tsx — full file */
"use client";

import { motion, Variants } from "framer-motion";

const easeOut = [0.16, 1, 0.3, 1] as const;

const variants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: easeOut } },
};

export default function SectionWrapper({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={variants}
      style={{ perspective: 1000 }}
      className="max-w-7xl mx-auto px-6 py-24 relative"
    >
      {children}
    </motion.section>
  );
}
```

Note `style={{ perspective: 1000 }}` is kept verbatim — it's load-bearing for `Projects.tsx`'s 3D tilt cards, not part of the animation being simplified.

## Repo conventions to follow

- `const easeOut = [0.16, 1, 0.3, 1] as const;` is this codebase's standard strong-decelerate curve, defined identically in `frontend/src/components/Projects.tsx:17`, `frontend/src/components/ChatWidget.tsx:16`, and `frontend/src/components/Skills.tsx:24` — reuse the exact same array, don't approximate.
- Module-scope `variants`/easing constants (rather than recomputed per-render) are the pattern already used in every sibling section file (`Skills.tsx`, `Projects.tsx`) — moving `variants` outside the component here follows that same convention, and is now valid since it no longer depends on a per-render hook value.

## Steps

1. In `frontend/src/components/SectionWrapper.tsx`, remove the `useReducedMotion` import (no longer used) from the `framer-motion` import on line 3, keeping `motion` and `Variants`.
2. Add a module-scope `const easeOut = [0.16, 1, 0.3, 1] as const;` below the imports.
3. Replace the entire `shouldReduceMotion`/ternary `variants` block (current lines 12-39, inside the component) with a single module-scope `const variants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6, ease: easeOut } } };` declared above the component (matching the Target code exactly).
4. In the component body, remove the now-deleted `shouldReduceMotion` line; the `return` block's JSX stays identical (`motion.section` with the same `id`, `initial`, `whileInView`, `viewport`, `variants`, `style={{ perspective: 1000 }}`, and `className`).
5. Do not remove or change `style={{ perspective: 1000 }}` — see the Problem section for why.

## Boundaries

- Do NOT touch any file other than `frontend/src/components/SectionWrapper.tsx`. In particular, do NOT touch `About.tsx`, `Certificates.tsx`, `Education.tsx`, `Experience.tsx`, `Testimonials.tsx`, `GitHubShowcase.tsx`, `Skills.tsx`, `Projects.tsx`, `AtsMatcher.tsx`, `Contact.tsx`, `AppointmentBooking.tsx`, or `app/page.tsx` — their own inner animations (or lack thereof, for Contact/AppointmentBooking) are exactly what this fix is designed to work correctly alongside without any changes on their end.
- Do NOT remove or alter `style={{ perspective: 1000 }}` — required by `Projects.tsx`'s 3D tilt cards (see Problem section). Removing it would visibly break that unrelated feature.
- Do NOT change `viewport={{ once: true, amount: 0.15 }}` — the trigger point/one-shot behavior is unrelated to this fix.
- Do NOT add a `y` offset back "just a little" as a compromise — the point of this plan is that positional motion belongs to the per-card stagger inside each section (where it already exists for 9 of 11), not to the wrapper; a wrapper-level `y` would reintroduce the exact double-animation this plan removes.
- If `frontend/src/components/SectionWrapper.tsx`'s current content doesn't match the excerpt above (drift since commit `d0a18b9`), STOP and report instead of improvising.

## Verification

- **Mechanical**: run `npx tsc --noEmit` from `frontend/` — expect no new errors (removing an unused hook import and simplifying a `Variants` object are type-safe). Run `npm run build` to confirm the build succeeds.
- **Feel check**:
  - Load the home page and scroll slowly through every section in order (About → Skills → Projects → GitHubShowcase → Experience → Education → Certificates → Testimonials → AtsMatcher → Contact → Appointment).
  - For the 9 sections with their own inner stagger (About, Certificates, Education, Experience, Testimonials, GitHubShowcase, Skills, Projects, AtsMatcher): confirm each section's content still animates in via its own per-card/per-item stagger exactly as before, and that the whole section no longer visibly tilts, scales, or rises as one block on top of that — it should now just be quietly present, with only its inner content animating.
  - For Contact and Appointment: confirm each section still fades in on scroll (a clean opacity reveal) rather than popping in with no animation at all.
  - Specifically re-verify Projects: hover a project card and confirm the mouse-tracked 3D tilt (`rotateX`/`rotateY` with visible depth via `translateZ` layers) still looks fully three-dimensional, not flattened — this depends on the `perspective: 1000` kept on `SectionWrapper`.
  - In DevTools → Rendering panel, toggle `prefers-reduced-motion` to `reduce` and reload — confirm every section still fades in (opacity only), identical to the non-reduced path now that both converge on the same variant.
- **Done when**: no section shows a whole-section tilt/scale/rise on reveal, every section still animates in some way (opacity fade at minimum), Projects' 3D card tilt still renders with correct depth, and `npx tsc --noEmit` / `npm run build` are clean.
