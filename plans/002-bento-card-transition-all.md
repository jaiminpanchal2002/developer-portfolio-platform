# 002 — Replace `.bento-card`'s `transition: all` with an explicit property list

- **Status**: TODO
- **Commit**: d0a18b9
- **Severity**: HIGH
- **Category**: Performance (5)
- **Estimated scope**: 1 file, 1 line change

## Problem

`.bento-card` is the sitewide "glass card" component — used across About,
Skills, Testimonials, Contact, and Projects (`className="bento-card"` on the
project cards, testimonial cards, skill cards, etc.). Its `transition`
declaration animates `all`, meaning the browser must watch and interpolate
*every* animatable CSS property on the element (including layout-triggering
ones like `width`/`height`/`padding`/`border-radius` if they ever change,
plus non-GPU properties) on every hover, on a component that renders many
times per page and is hovered constantly while browsing the site.

Current code, `frontend/app/globals.css:123-139`:

```css
/* Premium Bento Grid and Glassmorphism */
.bento-card {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.bento-card:hover {
  border-color: rgba(201, 168, 118, 0.35);
  box-shadow: 0 10px 30px -10px var(--glass-glow);
  transform: translateY(-4px);
}
```

The only properties that actually change on `:hover` are `border-color`,
`box-shadow`, and `transform` — confirmed by reading the full `:hover` rule
above. `transition: all` is therefore animating three properties' worth of
intent while paying the browser's cost of watching every property.

## Target

Replace the single `all` transition with an explicit, comma-separated list
covering exactly the three properties that change on hover, keeping the
existing duration and easing curve unchanged (this codebase's standard
strong-decel curve, matching `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`'s
intent — the file already uses its own `cubic-bezier(0.16, 1, 0.3, 1)`
variant here, which this plan does not change, since retuning the curve
itself is out of scope):

```css
/* target, frontend/app/globals.css:124-133 */
.bento-card {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  transition: border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}
```

`.bento-card:hover` (lines 135-139) and `.bento-card::after` (lines 141-152)
need no changes — `::after`'s glow tracks `--mouse-x`/`--mouse-y` custom
properties directly with no transition of its own, so it isn't affected by
this fix either way.

## Repo conventions to follow

- The exact easing value `cubic-bezier(0.16, 1, 0.3, 1)` is already used consistently as this file's "strong decelerate" curve — e.g. the same array `[0.16, 1, 0.3, 1]` appears as the `easeOut` const in numerous `.tsx` files (`Projects.tsx:17`, `ChatWidget.tsx:16`, etc.) and in `.aurora-glow`'s neighbor rules. Reuse this literal value verbatim per property — do not introduce a CSS variable for it as part of this plan (that would be a separate token-consolidation change, out of scope here).
- Multi-property explicit `transition` lists (rather than `all`) don't yet have a repo exemplar in this CSS file — this plan establishes the pattern for `.bento-card` only.

## Steps

1. In `frontend/app/globals.css`, locate line 130: `transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);` inside the `.bento-card` rule (lines 124-133).
2. Replace that single line with the three-property explicit list shown in the Target section above, keeping the same `0.4s cubic-bezier(0.16, 1, 0.3, 1)` timing per property.
3. Do not change `background`, `backdrop-filter`, `-webkit-backdrop-filter`, `border`, `border-radius`, `position`, or `overflow` in the same rule.
4. Do not change `.bento-card:hover` or `.bento-card::after`.

## Boundaries

- Do NOT touch any file other than `frontend/app/globals.css`.
- Do NOT touch any other CSS rule in this file (`.aurora-bg`, `.aurora-glow`, `@keyframes float`, `.custom-cursor`, etc.) — this plan is scoped to the single `.bento-card` transition line.
- Do NOT introduce a new CSS custom property/token for the easing curve — reuse the literal `cubic-bezier(0.16, 1, 0.3, 1)` value exactly as it already appears on this line.
- Do NOT change the `0.4s` duration or the curve values — only the property list changes, from `all` to the three explicit properties.
- If line 130 doesn't match the current-code excerpt above, or if `.bento-card:hover` (lines 135-139) lists different properties than `border-color`/`box-shadow`/`transform` (drift since commit `d0a18b9`), STOP and report — the explicit property list must match whatever `:hover` actually animates at execution time, not just what's written in this plan.

## Verification

- **Mechanical**: no build step is strictly required for a CSS-only change, but run `npm run build` from `frontend/` to confirm no CSS syntax errors — expect a clean build.
- **Feel check**:
  - Load any page with bento cards (`/`, scrolled to About/Skills/Testimonials, or `/#projects`) in a browser.
  - Hover a card and confirm it still lifts (`translateY(-4px)`), gains the gold border-color, and gains the drop shadow — with the exact same 0.4s feel as before (no visible change in speed or smoothness).
  - In DevTools → Elements → Styles, confirm the computed `transition` property lists exactly `border-color`, `box-shadow`, `transform` (not `all`) after hovering.
  - In DevTools → Performance panel, record a hover interaction before and after the fix — confirm the "Recalculate Style" / "Composite Layers" cost for the hover frame is equal or lower, and no unrelated properties (e.g. `background`, `backdrop-filter`) show up as animated in the Layers/Animations panel.
- **Done when**: the `.bento-card` hover transition lists exactly three properties, the visual hover effect is pixel- and timing-identical to before, and `npm run build` succeeds.
