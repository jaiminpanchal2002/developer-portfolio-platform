# 005 — Pause `SkillGalaxy`'s WebGL render loop when scrolled out of view

- **Status**: TODO
- **Commit**: d0a18b9
- **Severity**: HIGH
- **Category**: Performance (5)
- **Estimated scope**: 1 file, ~20 line addition

## Problem

`SkillGalaxy` (the Skills section's orbital 3D scene) is lazy-loaded via
`next/dynamic` and mounted once inside the Skills section, but its
`<Canvas>` has no `frameloop` control at all — it defaults to React Three
Fiber's `"always"` mode, which renders every frame, forever, for as long as
the component stays mounted. Because nothing in `Skills.tsx` or
`SkillGalaxy.tsx` ever unmounts or pauses it once mounted, **this WebGL scene
keeps rendering continuously in the background for the rest of the session**
— even minutes after the visitor has scrolled all the way down to Contact or
navigated to the Footer, it is still painting frames no one can see.

This is the same class of problem `PersistentScene.tsx` (the Hero's 3D
scene) already solved correctly — it explicitly toggles `frameloop` between
`"always"` and `"never"` based on scroll-driven visibility. `SkillGalaxy`
never adopted that pattern.

Current code, `frontend/src/components/ui/skills3d/SkillGalaxy.tsx:1-8` (imports)
and `213-269` (component):

```tsx
"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Skill } from "@/types";

// ...

export default function SkillGalaxy({ skills, activeCategory, onSkillHover, onSkillSelect, reduceMotion }: SkillGalaxyProps) {
  const categories = useMemo(() => {
    const map = new Map<string, Skill[]>();
    for (const skill of skills) {
      const cat = skill.category || "General";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(skill);
    }
    return [...map.entries()];
  }, [skills]);

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 3.2, 6.4], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: "pan-y" }}
    >
      {/* ...lights, DustField, OrbitRings, OrbitControls... */}
    </Canvas>
  );
}
```

For reference, the already-correct pattern in the sibling scene,
`frontend/src/components/scene/PersistentScene.tsx:280-330,354-358` (do NOT
edit this file — it needs no changes, it's the exemplar to imitate):

```tsx
export default function PersistentScene() {
  const enabled = useSyncExternalStore(emptySubscribe, enabledSnapshot, () => false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    // ...ScrollTrigger sets up onToggle: (self) => setActive(self.isActive)...
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div /* ... */>
      <Canvas
        dpr={[1, 1.5]}
        shadows
        frameloop={active ? "always" : "never"}
        camera={{ position: [0, 0, 6.5], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* ... */}
      </Canvas>
    </div>
  );
}
```

`SkillGalaxy` doesn't scrub a scroll-linked composition the way
`PersistentScene` does, so it doesn't need GSAP `ScrollTrigger` — a plain
`IntersectionObserver` (already an established pattern in this codebase, see
Repo conventions below) is the right, lighter-weight tool to detect
in-view/out-of-view here.

## Target

Wrap the `<Canvas>` in a container `<div>`, observe that container with an
`IntersectionObserver`, and gate `frameloop` on the resulting `inView` state
— exactly `PersistentScene`'s `active ? "always" : "never"` pattern, driven
by intersection instead of `ScrollTrigger`:

```tsx
/* target, frontend/src/components/ui/skills3d/SkillGalaxy.tsx */
"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Skill } from "@/types";

// ...(unchanged: RING_COLORS, BASE_RADIUS, mulberry32, DustField, SkillNode, OrbitRing, SkillGalaxyProps)...

export default function SkillGalaxy({ skills, activeCategory, onSkillHover, onSkillSelect, reduceMotion }: SkillGalaxyProps) {
  const categories = useMemo(() => {
    const map = new Map<string, Skill[]>();
    for (const skill of skills) {
      const cat = skill.category || "General";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(skill);
    }
    return [...map.entries()];
  }, [skills]);

  // Mounted once inside the Skills section and never unmounted, so without
  // this the Canvas would keep rendering every frame forever, long after
  // the visitor scrolls past — mirrors PersistentScene's active/inactive
  // frameloop toggle, using IntersectionObserver instead of ScrollTrigger
  // since this scene doesn't scrub a scroll-linked composition.
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "200px 0px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <Canvas
        dpr={[1, 1.5]}
        frameloop={inView ? "always" : "never"}
        camera={{ position: [0, 3.2, 6.4], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ touchAction: "pan-y" }}
      >
        {/* ...lights, DustField, OrbitRings, OrbitControls — all unchanged... */}
      </Canvas>
    </div>
  );
}
```

`rootMargin: "200px 0px"` gives a ~200px pre-roll so the scene resumes
rendering slightly before it scrolls into view rather than popping in
already-frozen, matching the feel of `PersistentScene`'s fade transition
without needing to replicate its opacity/visibility fade (this component has
no such fade today and this plan doesn't add one — see Boundaries).

## Repo conventions to follow

- `frameloop={condition ? "always" : "never"}` on a React Three Fiber `<Canvas>` is an established, exact pattern in this codebase: `frontend/src/components/scene/PersistentScene.tsx:357`.
- Plain `IntersectionObserver` (not a library) for visibility-driven state is already used elsewhere in this codebase for the same reason (avoiding unnecessary work off-screen/out-of-range): `frontend/src/components/Navbar.tsx:46-66`, the scroll-spy observer — follow its cleanup pattern (`observer.disconnect()` in the effect's return).
- `useMemo`/`useRef`/`useState` are already imported from `"react"` in this file; only `useEffect` needs to be added to that import list.

## Steps

1. In `frontend/src/components/ui/skills3d/SkillGalaxy.tsx`, add `useEffect` to the React import on line 3: `import { Suspense, useEffect, useMemo, useRef, useState } from "react";`.
2. Inside the `SkillGalaxy` component (starting line 213), after the `categories` memo (after line 222) and before the `return`, add the `containerRef`, `inView` state, and the `IntersectionObserver` effect exactly as shown in the Target section.
3. Change the component's `return` (currently `return (<Canvas ...>...</Canvas>);`, lines 224-268) to wrap the existing `<Canvas>` in `<div ref={containerRef} style={{ width: "100%", height: "100%" }}>...</div>`, with the `<Canvas>`'s children completely unchanged.
4. On the `<Canvas>` element itself, add `frameloop={inView ? "always" : "never"}` as a new prop (position it near `dpr`, matching `PersistentScene`'s prop ordering convention of `dpr` then `frameloop`).
5. Do not change any prop already on `<Canvas>` (`dpr`, `camera`, `gl`, `style`), and do not change anything inside the Canvas's children (lights, `DustField`, `OrbitRing` mapping, `OrbitControls`).

## Boundaries

- Do NOT touch `frontend/src/components/scene/PersistentScene.tsx` — it is the reference exemplar only, it needs no changes.
- Do NOT touch `frontend/src/components/Skills.tsx` — the wrapping `<div className="relative h-[380px] md:h-[520px] ...">` around `<SkillGalaxy />` already gives this component 100% width/height to fill; adding one more `width:100%; height:100%` div inside `SkillGalaxy.tsx` must render identically within that existing layout.
- Do NOT add a GSAP `ScrollTrigger` or import `gsap` into this file — `IntersectionObserver` is sufficient and lighter-weight; this scene has no scroll-scrubbed composition to synchronize (unlike `PersistentScene`'s `heroSceneProgress`).
- Do NOT add an opacity/visibility fade transition to this component as part of this plan — that is a separate, additive visual-polish decision `PersistentScene` made for its own fixed full-viewport overlay; this plan's scope is strictly "stop rendering when off-screen," not "add a fade."
- Do NOT change the `DustField` rotation's `reduceMotion` handling (or lack thereof) — that is a separate finding (`SkillGalaxy.tsx:56` ignoring `reduceMotion`), out of scope for this plan.
- If the file's current content doesn't match the excerpts above (drift since commit `d0a18b9`), STOP and report instead of improvising.

## Verification

- **Mechanical**: run `npx tsc --noEmit` from `frontend/` — expect no new errors. Run `npm run build` to confirm the client bundle still builds (this file is dynamically imported with `ssr: false`, so no SSR-time execution to worry about).
- **Feel check**:
  - Load the home page, scroll down until the Skills galaxy is visible and confirm the orbit rings still auto-rotate, the dust field still drifts, and hover/click interactions on skill nodes still work exactly as before.
  - Scroll further down past Skills (e.g. to Contact or Footer) and wait a few seconds, then open DevTools → Performance → record ~3 seconds — confirm there is **no continuous frame activity** attributed to the Skills canvas while it's off-screen (before this fix, frames would keep firing continuously; after, activity should drop to near-zero once scrolled past).
  - Scroll back up into the Skills section — confirm the galaxy resumes rotating/animating immediately (the `rootMargin: "200px 0px"` pre-roll should mean it's already active slightly before the section is fully in the viewport, so there's no visible "frozen then suddenly moving" pop).
  - Resize the browser / toggle mobile viewport in DevTools and confirm the canvas still fills its container at 100% width/height as before (the new wrapper `div` must not change layout).
- **Done when**: the Skills galaxy visibly pauses (no continuous frame activity in DevTools Performance) once scrolled fully out of view with a margin, resumes seamlessly when scrolled back into range, and `npx tsc --noEmit` / `npm run build` are clean.
