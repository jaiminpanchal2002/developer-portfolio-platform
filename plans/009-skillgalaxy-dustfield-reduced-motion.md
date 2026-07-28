# 009 — Gate `SkillGalaxy`'s `DustField` rotation on `reduceMotion`

- **Status**: TODO
- **Commit**: d0a18b9
- **Severity**: MEDIUM
- **Category**: Accessibility (6)
- **Estimated scope**: 1 file, 2 line change

## Problem

`SkillGalaxy.tsx` already threads a `reduceMotion` boolean prop through the
whole component tree and correctly gates every other continuous motion with
it — `OrbitRing`'s ring spin (`if (spinRef.current && !reduceMotion) { ... }`,
lines 178-182), `SkillNode`'s scale/emissive damping (`const damp =
reduceMotion ? 1 : Math.min(1, delta * 8);`, line 100), and
`OrbitControls`'s `autoRotate={!reduceMotion}` (line 262). `DustField` is the
one exception: its per-frame rotation increment has no `reduceMotion` check
at all, so the background dust field keeps spinning even when the visitor's
OS has reduced motion turned on and every other element in this same scene
has correctly stopped moving.

Current code, `frontend/src/components/ui/skills3d/SkillGalaxy.tsx:39-67`:

```tsx
function DustField({ count = 140 }: { count?: number }) {
  const positions = useMemo(() => {
    const rand = mulberry32(20260727);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2 + rand() * 4;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.4;
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  const points = useRef<THREE.Points>(null);
  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y += delta * 0.015;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#c9a876" size={0.015} sizeAttenuation transparent opacity={0.4} depthWrite={false} />
    </points>
  );
}
```

Call site, `frontend/src/components/ui/skills3d/SkillGalaxy.tsx:235-236`
(inside the `<Suspense>` block of the default-exported `SkillGalaxy`
component, which already receives `reduceMotion` as a prop — see the
`SkillGalaxyProps` interface at lines 205-211 and the destructured parameter
at line 213):

```tsx
<Suspense fallback={null}>
  <DustField />
```

## Target

Accept `reduceMotion` as a prop on `DustField`, exactly mirroring
`OrbitRing`'s existing pattern in this same file, and pass it from the
parent at the call site:

```tsx
/* target, frontend/src/components/ui/skills3d/SkillGalaxy.tsx:39-67 */
function DustField({ count = 140, reduceMotion }: { count?: number; reduceMotion: boolean }) {
  const positions = useMemo(() => {
    const rand = mulberry32(20260727);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2 + rand() * 4;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.4;
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  const points = useRef<THREE.Points>(null);
  useFrame((_, delta) => {
    if (points.current && !reduceMotion) points.current.rotation.y += delta * 0.015;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#c9a876" size={0.015} sizeAttenuation transparent opacity={0.4} depthWrite={false} />
    </points>
  );
}
```

```tsx
/* target, frontend/src/components/ui/skills3d/SkillGalaxy.tsx:235-236 */
<Suspense fallback={null}>
  <DustField reduceMotion={reduceMotion} />
```

## Repo conventions to follow

- The exact guard pattern `if (ref.current && !reduceMotion) { ref.current.rotation.y += delta * speed; }` already exists in this same file on `OrbitRing`'s `useFrame` (`frontend/src/components/ui/skills3d/SkillGalaxy.tsx:178-182`) — imitate it verbatim, just applied to `points.current` instead of `spinRef.current` and the fixed `0.015` rate instead of a variable `speed`.
- `reduceMotion` is passed down as an explicit prop through every child component in this file (`OrbitRing`, `SkillNode`) rather than re-read via a hook in each child — `DustField` should follow the same prop-drilling convention, not call `useReducedMotion()` itself (this component has no such import today, and the parent `SkillGalaxy` already receives the correct boolean from `Skills.tsx:142`, `reduceMotion={Boolean(shouldReduceMotion)}`).

## Steps

1. In `frontend/src/components/ui/skills3d/SkillGalaxy.tsx`, change `DustField`'s function signature (line 39) from `function DustField({ count = 140 }: { count?: number }) {` to `function DustField({ count = 140, reduceMotion }: { count?: number; reduceMotion: boolean }) {`.
2. Change the `useFrame` body (line 56) from `if (points.current) points.current.rotation.y += delta * 0.015;` to `if (points.current && !reduceMotion) points.current.rotation.y += delta * 0.015;`.
3. Change the call site (line 236) from `<DustField />` to `<DustField reduceMotion={reduceMotion} />` — `reduceMotion` is already in scope at this point, destructured from `SkillGalaxyProps` in the enclosing `SkillGalaxy` component (line 213).
4. Do not change `count`, the `positions` memo, the geometry/material JSX, or anything else in this file.

## Boundaries

- Do NOT touch any file other than `frontend/src/components/ui/skills3d/SkillGalaxy.tsx`.
- Do NOT touch `Skills.tsx` — it already passes `reduceMotion={Boolean(shouldReduceMotion)}` into `<SkillGalaxy />` (line 142), which is exactly what this plan needs; no change required there.
- Do NOT change `OrbitRing`, `SkillNode`, `OrbitControls`, or any other already-correctly-gated motion in this file — this plan's scope is strictly `DustField`.
- Do NOT convert this to a `useReducedMotion()` hook call inside `DustField` itself — follow the file's existing prop-drilling convention instead (see Repo conventions).
- If lines 39 or 56 or 236 don't match the current-code excerpts above (drift since commit `d0a18b9`), STOP and report instead of improvising.

## Verification

- **Mechanical**: run `npx tsc --noEmit` from `frontend/` — expect no new errors (adding a required `reduceMotion: boolean` prop and passing it at the one call site is fully typed). Run `npm run build` to confirm the build succeeds.
- **Feel check**:
  - With reduced motion OFF, load the home page, scroll to Skills, and confirm the background dust field still slowly drifts/rotates exactly as before, alongside the orbit rings.
  - In DevTools → Rendering panel, set `prefers-reduced-motion` to `reduce`, reload, and scroll to Skills — confirm the orbit rings and dust field are now both fully static (previously only the rings stopped; the dust field kept spinning). Skill nodes should still respond to hover/click (damping under reduced motion collapses instantly per the existing `damp = reduceMotion ? 1 : ...` logic, unaffected by this plan).
  - Confirm no console errors/warnings about a missing or `undefined` `reduceMotion` prop on `DustField`.
- **Done when**: with `prefers-reduced-motion: reduce` emulated, the dust field no longer rotates (matching every other motion in this scene), normal-motion behavior is unchanged, and `npx tsc --noEmit` / `npm run build` are clean.
