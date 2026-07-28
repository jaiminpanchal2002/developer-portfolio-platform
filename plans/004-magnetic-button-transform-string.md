# 004 — Drive `MagneticButton` via a `transform` string instead of the `x`/`y` shorthand

- **Status**: TODO
- **Commit**: d0a18b9
- **Severity**: HIGH
- **Category**: Performance (5)
- **Estimated scope**: 1 file, ~6 line change

## Problem

`MagneticButton` wraps the Hero and Projects primary CTAs and continuously
updates its position on every `mousemove` while hovered, via Framer Motion's
`x`/`y` style shorthand fed by a spring:

Current code, `frontend/src/components/ui/MagneticButton.tsx:1-67` (full file
for context; the lines that need to change are 20-21 and 36):

```tsx
"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type MagneticButtonProps =
  | ({ href: string; strength?: number } & Omit<HTMLMotionProps<"a">, "href">)
  | ({ href?: undefined; strength?: number } & HTMLMotionProps<"button">);

export default function MagneticButton({ children, className, strength = 0.35, style, ...props }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.4 });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (!ref.current || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const mergedClassName = cn("inline-flex items-center justify-center", className);
  const mergedStyle = { ...style, x: springX, y: springY };

  // ...rest of file renders <motion.a> or <motion.button> with mergedStyle
```

Per this audit's own rule catalog (`AUDIT.md`, Performance section): "Framer
Motion `x`/`y`/`scale` shorthands are not hardware-accelerated — they run on
the main thread and drop frames under load. Target: the full transform
string." This component is exactly that case: `springX`/`springY` recompute
every animation frame while the cursor moves over the button, and the `x`/`y`
style shorthand keys mean Framer Motion resolves them on the main thread
instead of writing a precomposed `transform` string straight to the element.

## Target

Compose `springX`/`springY` into a single `transform: translate3d(...)`
string with `useMotionTemplate`, and bind that string directly to
`style.transform` instead of using the `x`/`y` shorthand keys:

```tsx
/* target, frontend/src/components/ui/MagneticButton.tsx */
"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type MagneticButtonProps =
  | ({ href: string; strength?: number } & Omit<HTMLMotionProps<"a">, "href">)
  | ({ href?: undefined; strength?: number } & HTMLMotionProps<"button">);

export default function MagneticButton({ children, className, strength = 0.35, style, ...props }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.4 });
  const transform = useMotionTemplate`translate3d(${springX}px, ${springY}px, 0)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (!ref.current || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const mergedClassName = cn("inline-flex items-center justify-center", className);
  const mergedStyle = { ...style, transform, willChange: "transform" };

  // ...rest of file unchanged
```

`willChange: "transform"` mirrors this repo's own existing convention on the
custom cursor (see Repo conventions below) and is a defensive addition since
the value is now a plain template string rather than Framer's recognized
`x`/`y` keys, which Framer otherwise manages `will-change` for automatically.

## Repo conventions to follow

- `useMotionTemplate` is the correct Framer Motion primitive for composing multiple motion values into one CSS value string while keeping them independently spring-animated — no new dependency is needed, it's exported from the `framer-motion` package already imported in this file.
- `will-change: transform` is already an established convention in this codebase for JS-driven, per-frame `transform` updates: `frontend/app/globals.css:169`, on `.custom-cursor` — "position is written entirely via JS `transform` ... every frame" (see the comment at `globals.css:154-157`). This plan applies the same reasoning to `MagneticButton`.
- The `strength`-scaled offset math in `handleMouseMove` (lines 23-28) and the hover-capable gating via `window.matchMedia("(hover: hover) and (pointer: fine)")` are unaffected by this change and must be preserved exactly.

## Steps

1. In `frontend/src/components/ui/MagneticButton.tsx`, add `useMotionTemplate` to the named imports from `"framer-motion"` on line 4.
2. After the `springY` declaration (line 21), add the `transform` line exactly as written in the Target section's code block above — a `useMotionTemplate` tagged-template call interpolating `springX` and `springY` into a `translate3d(...)` string.
3. Replace line 36, `const mergedStyle = { ...style, x: springX, y: springY };`, with `const mergedStyle = { ...style, transform, willChange: "transform" };`.
4. Do not change `handleMouseMove`, `handleMouseLeave`, the `strength` prop, the `matchMedia` gate, or either of the two `motion.a`/`motion.button` JSX return blocks (lines 38-66) — they consume `mergedStyle` exactly as before and need no changes.

## Boundaries

- Do NOT touch any file other than `frontend/src/components/ui/MagneticButton.tsx`.
- Do NOT change `stiffness`, `damping`, or `mass` in the `useSpring` configs — the spring feel must stay identical; only how the resulting values reach the DOM changes.
- Do NOT change the `strength` default (`0.35`) or the offset calculation.
- Do NOT add a new dependency — `useMotionTemplate` is already available from the `framer-motion` package already imported in this file.
- If the file's current content doesn't match the excerpt above (drift since commit `d0a18b9`), STOP and report instead of improvising.

## Verification

- **Mechanical**: run `npx tsc --noEmit` from `frontend/` — expect no new errors (this is a like-for-like `CSSProperties`-compatible value: `transform` accepts a `MotionValue<string>` just as `x`/`y` accepted `MotionValue<number>`). Run `npm run build` to confirm the client bundle still builds.
- **Feel check**:
  - Load the home page on a desktop browser (hover-capable pointer) and move the cursor across the Hero CTA and any Projects section button wrapped in `MagneticButton` — confirm the button still visibly "follows" the cursor within its bounds with the same springy, slightly-lagging feel as before, and springs back to center on mouse-leave.
  - In DevTools → Elements, inspect the button while hovering and confirm the computed `style` shows a single `transform: translate3d(...)` value (not separate `x`/`y`/`translate` properties Framer might otherwise apply).
  - In DevTools → Performance panel, record a slow mouse sweep across the button before and after the change — confirm the per-frame cost attributed to this element drops (fewer/no "Recalculate Style" entries tied to it; the frame should show as compositor-only work).
  - Test on a touch device (or DevTools device emulation with touch) — confirm the button does not attempt to follow a touch drag (the existing `matchMedia("(hover: hover) and (pointer: fine)")` gate in `handleMouseMove` is unchanged and should still prevent this).
- **Done when**: the button's magnetic-hover feel is unchanged, `style.transform` is the single value driving position (no `x`/`y` motion-value keys remain in the component), and `npx tsc --noEmit` / `npm run build` are clean.
