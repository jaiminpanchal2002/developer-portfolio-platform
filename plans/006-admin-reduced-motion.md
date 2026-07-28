# 006 — Respect `prefers-reduced-motion` across the entire admin panel

- **Status**: TODO
- **Commit**: d0a18b9
- **Severity**: HIGH
- **Category**: Accessibility (6)
- **Estimated scope**: 1 file, 1 wrapping component added

## Problem

A repo-wide grep for `useReducedMotion|prefers-reduced-motion` returns 8
hits, and every one of them is on the public site (`Hero.tsx`, `Skills.tsx`,
`ChatWidget.tsx`, `template.tsx`, `SectionWrapper.tsx`, `RotatingRoles.tsx`,
`PersistentScene.tsx`, `app/page.tsx`). None exist in `app/admin/**` or
`src/components/admin/**`. Every page transition, stagger entrance, modal
open/close, and hover/tap scale in the admin panel moves unconditionally,
regardless of the OS-level reduced-motion setting — a real accessibility gap
in a part of the product you (the admin) spend the most repeated,
session-long time in.

The shared admin motion tokens live in one file, consumed by 18 files across
the admin panel:

`frontend/src/lib/motion/adminMotion.ts` (current, full file):

```ts
export const easeOut = [0.16, 1, 0.3, 1] as const;

export const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeOut },
  },
};

export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: easeOut },
};
```

These four exports are plain static objects, not hooks — `useReducedMotion()`
is a React hook and can't be called at module scope inside them. Rewriting
all four as functions of `reduceMotion: boolean` would require updating
every one of the 18 consuming files (`app/admin/page.tsx`,
`app/admin/blog/page.tsx`, `app/admin/jobs/page.tsx`,
`app/admin/applications/page.tsx`, `app/admin/inquiries/page.tsx`,
`app/admin/testimonials/page.tsx`, `app/admin/appointments/page.tsx`,
`app/admin/profile-score/page.tsx`, `app/admin/resume/page.tsx`,
`app/admin/interview/page.tsx`, `app/admin/media/page.tsx`,
`app/admin/layout.tsx`, `src/components/admin/AnimatedModal.tsx`,
`src/components/admin/ProjectTable.tsx`, `src/components/admin/CertificateTable.tsx`,
`src/components/admin/EducationTable.tsx`, `src/components/admin/ExperienceTable.tsx`,
`src/components/admin/SkillTable.tsx`) — a huge, error-prone fan-out for one
accessibility fix.

## Target

Instead of touching `adminMotion.ts` or any of its 18 consumers, wrap the
**one root layout** every admin page already renders inside —
`frontend/app/admin/layout.tsx` — in Framer Motion's own built-in
`<MotionConfig reducedMotion="user">` provider. This is Framer Motion's
purpose-built mechanism for exactly this: when the OS `prefers-reduced-motion`
setting is on, every descendant `motion.*` component in the tree
automatically disables its transform- and layout-driven animation (position,
scale, rotate — including `whileHover`/`whileTap` scale effects) while
still allowing opacity transitions to play, with no code changes required in
any consuming file. Since `app/admin/layout.tsx` is the single ancestor of
every admin page, sidebar, modal, and table, one provider here covers all of
it.

Current code, `frontend/app/admin/layout.tsx` (full file):

```tsx
"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AuthGuard from "./AuthGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";
import { pageTransition } from "@/lib/motion/adminMotion";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--noir-bg)] text-[var(--noir-fg)]">
        <div className="flex">
          <AdminSidebar />

          <div className="flex-1 min-w-0">
            <AdminNavbar />

            <main className="p-4 md:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={pageTransition.initial}
                  animate={pageTransition.animate}
                  exit={pageTransition.exit}
                  transition={pageTransition.transition}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
```

Target code:

```tsx
/* target, frontend/app/admin/layout.tsx */
"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import AuthGuard from "./AuthGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";
import { pageTransition } from "@/lib/motion/adminMotion";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    // Covers every admin page, modal, table, and sidebar animation from one
    // place: when the OS prefers-reduced-motion setting is on, Framer Motion
    // automatically drops transform/layout animation for every motion.*
    // descendant here while still allowing opacity to transition.
    <MotionConfig reducedMotion="user">
      <AuthGuard>
        <div className="min-h-screen bg-[var(--noir-bg)] text-[var(--noir-fg)]">
          <div className="flex">
            <AdminSidebar />

            <div className="flex-1 min-w-0">
              <AdminNavbar />

              <main className="p-4 md:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pathname}
                    initial={pageTransition.initial}
                    animate={pageTransition.animate}
                    exit={pageTransition.exit}
                    transition={pageTransition.transition}
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </main>
            </div>
          </div>
        </div>
      </AuthGuard>
    </MotionConfig>
  );
}
```

## Repo conventions to follow

- `useReducedMotion()` is already this codebase's established way of respecting the OS setting on the public site (8 existing usages, e.g. `frontend/src/components/Hero.tsx`, `frontend/src/components/Skills.tsx`). `MotionConfig`'s `reducedMotion="user"` achieves the same end-user outcome as those per-component hook checks, but scoped once at the admin root instead of requiring 18 files to each adopt the hook individually — appropriate here specifically because every admin animation already flows through the same single root layout, which the public site's page structure does not have.
- `frontend/app/admin/layout.tsx` is already a `"use client"` component importing from `"framer-motion"`, so `MotionConfig` is simply one more named import from a package already in use here.

## Steps

1. In `frontend/app/admin/layout.tsx`, add `MotionConfig` to the existing `framer-motion` import on line 4: `import { motion, AnimatePresence, MotionConfig } from "framer-motion";`.
2. Wrap the entire existing JSX returned by the component (the `<AuthGuard>...</AuthGuard>` tree, currently lines 18-42) in `<MotionConfig reducedMotion="user">...</MotionConfig>`, exactly as shown in the Target section. Do not change anything inside `<AuthGuard>` — `AdminSidebar`, `AdminNavbar`, the `AnimatePresence`/`motion.div` page-transition block, and all props stay identical.
3. Do not modify `frontend/src/lib/motion/adminMotion.ts` — its four exports stay exactly as they are; `MotionConfig` works transparently regardless of how the consumed variant objects are shaped.
4. Do not modify any of the other 17 files that import from `adminMotion.ts` — none of them need any change for this fix to take effect.

## Boundaries

- Do NOT touch `frontend/src/lib/motion/adminMotion.ts` or any of its 17 other consumers (`app/admin/page.tsx`, `app/admin/blog/page.tsx`, `app/admin/jobs/page.tsx`, `app/admin/applications/page.tsx`, `app/admin/inquiries/page.tsx`, `app/admin/testimonials/page.tsx`, `app/admin/appointments/page.tsx`, `app/admin/profile-score/page.tsx`, `app/admin/resume/page.tsx`, `app/admin/interview/page.tsx`, `app/admin/media/page.tsx`, `src/components/admin/AnimatedModal.tsx`, `src/components/admin/ProjectTable.tsx`, `src/components/admin/CertificateTable.tsx`, `src/components/admin/EducationTable.tsx`, `src/components/admin/ExperienceTable.tsx`, `src/components/admin/SkillTable.tsx`) — the whole point of this plan is that `MotionConfig` makes changing them unnecessary.
- Do NOT touch the public site's `ClientLayout.tsx`, its own `useReducedMotion()` usages, or any public-facing component — this plan is scoped to the admin panel only.
- Do NOT add a second `MotionConfig` anywhere else in the admin tree — one instance at the layout root is sufficient and correct; nesting another would be redundant.
- Do NOT attempt to also gate the Tailwind `animate-bounce`/`animate-ping`/`animate-pulse` utility classes seen in `app/admin/inquiries/page.tsx` or `app/admin/profile-score/page.tsx` — those are raw CSS keyframe animations, entirely unaffected by `MotionConfig` (which only governs Framer Motion's own `motion.*` components), and are a separate, already-identified LOW-severity finding out of scope here.
- If `frontend/app/admin/layout.tsx`'s current content doesn't match the excerpt above (drift since commit `d0a18b9`), STOP and report instead of improvising.

## Verification

- **Mechanical**: run `npx tsc --noEmit` from `frontend/` — expect no new errors (`MotionConfig` is a standard exported component from the already-installed `framer-motion` package). Run `npm run build` to confirm the build still succeeds.
- **Feel check**:
  - With the OS/browser reduced-motion setting OFF (default), click through several admin pages (e.g. Dashboard → Blog → Jobs), open any modal (e.g. via `AnimatedModal`), and select rows to trigger `BulkActionBar` — confirm every animation looks and feels completely unchanged from before this fix (page transitions slide/fade, modals scale in, stagger entrances stagger, hover/tap scale still respond).
  - In Chrome DevTools → Rendering panel, set "Emulate CSS media feature prefers-reduced-motion" to `reduce`, then repeat the same navigation: page transitions between admin routes, opening a modal, triggering the bulk-action bar, hovering a scale-on-hover button.
    - Confirm position/scale/rotate motion is now suppressed or drastically reduced (elements should appear in their final position without sliding/scaling in) while opacity fades may still play.
    - Confirm nothing is broken or invisible — content must still appear, just without the transform motion.
  - Turn the emulation back off and confirm normal motion returns immediately (no stuck/cached reduced-motion state).
- **Done when**: with `prefers-reduced-motion: reduce` emulated, no admin page transition, modal, stagger entrance, or hover/tap interaction produces transform/position/scale motion; with it off, all admin motion is pixel- and timing-identical to before this change; and `npx tsc --noEmit` / `npm run build` are clean.
