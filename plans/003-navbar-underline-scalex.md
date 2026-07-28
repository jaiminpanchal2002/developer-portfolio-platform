# 003 — Fix Navbar hover underline: `width` → `transform: scaleX()`

- **Status**: TODO
- **Commit**: d0a18b9
- **Severity**: HIGH
- **Category**: Performance (5) — plus a correctness bug found while vetting (see Problem)
- **Estimated scope**: 1 file, 1 element's markup + one small class-logic change

## Problem

The desktop nav-link hover underline animates `width` (a layout-triggering
property) via Tailwind's `transition-all duration-300 group-hover:w-full`.
This fires on every nav-link hover — a high-frequency interaction — and
`transition-all` compounds the cost by watching every animatable property,
not just `width`.

Current code, `frontend/src/components/Navbar.tsx:93-109`:

```tsx
<li key={item.href}>
    <a
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        className="relative group py-2 transition-colors hover:opacity-80"
        style={{ color: isActive ? "var(--noir-accent)" : undefined }}
    >
        {item.label}
        <span
            className="absolute bottom-0 left-0 h-px transition-all duration-300 group-hover:w-full"
            style={{
                background: "var(--noir-accent)",
                width: isActive ? "100%" : "0%",
            }}
        />
    </a>
</li>
```

**A second, more important bug surfaced while vetting this finding**: the
`width` on this `<span>` is set two different ways at once — an **inline**
`style={{ width: isActive ? "100%" : "0%" }}` and a **class-based**
`group-hover:w-full`. Inline styles always win over class-based rules
regardless of pseudo-class state (`:hover` specificity cannot beat an inline
`style` attribute short of `!important`). This means **`group-hover:w-full`
never visually applies** for inactive links — hovering a non-active nav item
currently shows no underline animation at all; only the active item's
permanent 100% underline is ever visible. The fix must not reintroduce this
by driving the new `transform` via inline `style` either — it has to move to
class-based conditional logic so the CSS cascade (and `:hover`) can actually
apply.

## Target

Drive both the "active" (permanent full underline) and "hover" (reveal on
inactive items) states through Tailwind classes only — no inline `width` or
`transform` — using `scaleX()` with `transform-origin: left` so the
underline still grows from the left edge exactly as the current `width`
version visually does:

```tsx
/* target, frontend/src/components/Navbar.tsx:93-109 */
<li key={item.href}>
    <a
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        className="relative group py-2 transition-colors hover:opacity-80"
        style={{ color: isActive ? "var(--noir-accent)" : undefined }}
    >
        {item.label}
        <span
            className={`absolute bottom-0 left-0 h-px w-full origin-left transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
            }`}
            style={{ background: "var(--noir-accent)" }}
        />
    </a>
</li>
```

Note the span is now always `w-full` in the DOM (fixed width, no longer
animated) — it's the `scaleX()` transform that grows/shrinks it visually,
which is what makes this GPU-composited instead of layout-triggering.
`ease-[cubic-bezier(0.16,1,0.3,1)]` reuses this repo's existing strong-decel
curve (the same `[0.16, 1, 0.3, 1]` array used as `easeOut` throughout the
`.tsx` files in this codebase) rather than Tailwind's default `ease` timing
function, so the feel doesn't regress from what `transition-all duration-300`
currently produces (which inherits Tailwind's default `ease` — actually
worth preserving as `duration-300` with the repo's curve is at minimum no
worse and is more consistent with the rest of the codebase's motion).

## Repo conventions to follow

- The cubic-bezier value `[0.16, 1, 0.3, 1]` is this codebase's standard "strong decelerate" curve, used as `const easeOut = [0.16, 1, 0.3, 1] as const;` in numerous files, e.g. `frontend/src/components/Projects.tsx:17`, `frontend/src/components/ChatWidget.tsx:16`, and inline at `frontend/src/components/Navbar.tsx:137` (`ease: [0.16, 1, 0.3, 1]` on the mobile menu, in this same file). This plan is CSS/Tailwind, not Framer Motion, so it's expressed as an arbitrary-value Tailwind class `ease-[cubic-bezier(0.16,1,0.3,1)]` rather than importing the JS constant.
- Conditional Tailwind class strings (template literals switching classes based on a boolean) are already the pattern used for `aria-current`/`isActive` styling elsewhere in this same component (e.g. the inline `style={{ color: isActive ? ... : undefined }}` a few lines above) — this plan follows the same `isActive`-driven branching, just for classes instead of inline style.

## Steps

1. In `frontend/src/components/Navbar.tsx`, locate the desktop nav `<span>` at lines 101-107 (inside the `.map((item) => {...})` block starting at line 90).
2. Replace the `<span>`'s `className` and `style` exactly as shown in the Target section: remove `transition-all duration-300 group-hover:w-full` and the inline `width` from `style`; add `w-full origin-left transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]` plus the conditional `scale-x-100` / `scale-x-0 group-hover:scale-x-100` classes; keep `style={{ background: "var(--noir-accent)" }}` (background stays inline since it uses a CSS custom property, not a static Tailwind color).
3. Do not touch the mobile navigation panel (lines 130-164) — it has no underline element and uses a different, already-correct `opacity`/`y` transition via Framer Motion.
4. Do not touch the `<a>` element's own `className`/`style` (lines 94-99) — only the child `<span>` changes.

## Boundaries

- Do NOT touch any file other than `frontend/src/components/Navbar.tsx`.
- Do NOT touch the mobile nav panel, the scroll-spy `IntersectionObserver` logic, or the logo/hamburger markup — this plan is scoped to the desktop underline `<span>` only.
- Do NOT reintroduce any inline `style` for `width` or `transform` on this span — the whole point of this fix is that the hover state must be expressible through the CSS cascade (`group-hover:`), which inline styles defeat. Every part of the width/scale logic must live in the `className` string.
- Do NOT change `duration-300` to a different duration — only the animated property (`width` → `transform`) and the easing curve change.
- If lines 93-109 don't match the current-code excerpt above (drift since commit `d0a18b9`), STOP and report instead of improvising.

## Verification

- **Mechanical**: run `npx tsc --noEmit` from `frontend/` — expect no new errors (Tailwind class-string changes have no type implications). Run `npm run build` to confirm no build-time issues.
- **Feel check**:
  - Load the home page, and with the nav bar visible, hover each **inactive** nav link (any link other than whichever section is currently in view) — confirm an underline now visibly grows in from the left edge over ~300ms and retracts on mouse-leave. **This is the actual bug fix**: before this change, hovering an inactive link showed no underline animation at all.
  - Confirm the **active** section's nav link still shows a permanent full-width underline with no flicker.
  - In DevTools → Elements, inspect the span on an inactive link before hover and confirm no `width` property is present at all (only `transform: scaleX(...)`).
  - In DevTools → Rendering panel, enable "Paint flashing" and hover a nav link — confirm no green paint flash appears on the underline row (transform-only changes should be composite-only, not paint-triggering).
  - Toggle `prefers-reduced-motion` (Rendering panel) — this element has no explicit reduced-motion handling before or after this fix, so no change in behavior is expected here; this is out of scope for this plan.
- **Done when**: hovering any inactive nav link visibly animates the underline via `scaleX`, the active link's underline is unaffected, no `width` is set anywhere on the span (inline or class), and `npx tsc --noEmit` / `npm run build` are clean.
