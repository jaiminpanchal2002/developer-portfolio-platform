# Noir/Champagne Design System

The portfolio's visual language: cinematic, dark, restrained — one warm champagne accent
against a near-black stage. No gradients-of-many-colors, no neon. Every surface earns its
elevation; every animation has a reason.

## Color tokens (`app/globals.css`)

| Token | Value | Use |
|---|---|---|
| `--noir-bg` | `#0a0a0b` | Page background base |
| `--noir-bg-elevated` | `#131315` | Cards, popovers, tooltips |
| `--noir-fg` | `#f3f1ed` | Primary text (warm off-white) |
| `--noir-fg-muted` | `#a3a09a` | Secondary text |
| `--noir-fg-subtle` | `#83807a` | Captions, kickers (≥5.2:1 on bg — WCAG AA) |
| `--noir-accent` | `#c9a876` | Champagne gold — CTAs, highlights, focus rings |
| `--noir-accent-soft` | `rgba(201,168,118,.14)` | Accent-tinted fills, badges |
| `--noir-border` | `rgba(243,241,237,.08)` | Hairline borders |
| `--glass-bg/-border/-glow` | see globals.css | `.bento-card` glass surfaces |

Rules: accent is for *one* emphasis per view region. Text on accent uses `#0a0a0b`.
Never introduce a second hue; states derive from opacity/lightness of existing tokens.

## Typography

- **Display / serif:** Fraunces (`--font-serif`), italic for the hero name and section
  display moments. Weights 300–600.
- **Body / UI:** Plus Jakarta Sans (`--font-sans`), the `body` default. Weights 300–700.

Scale (fluid, Tailwind utilities):

| Role | Spec |
|---|---|
| Hero display | `clamp(2.75rem, 7vw, 6rem)`, serif italic, leading 0.98, tracking tight |
| Section title | `text-4xl md:text-5xl`, serif, leading 1.05 |
| Kicker | `text-xs uppercase tracking-[0.2em]`, `--noir-fg-subtle` |
| Card heading | `text-lg font-semibold` |
| Body | `text-base leading-relaxed`, `--noir-fg-muted` |
| Caption | `text-xs`, `--noir-fg-subtle` |

## Spacing & layout

- Container: `max-w-7xl mx-auto px-6 md:px-10`
- Section rhythm: `py-24 md:py-32` between major sections (SectionWrapper)
- Card padding: `p-6` (dense) / `p-8` (feature)
- Radius: `rounded-full` pills/CTAs, `rounded-2xl` media, `rounded-3xl`/24px cards
- Grid: 12-col via Tailwind `grid-cols-12`; bento layouts pair 7/5 or 8/4 splits

## Motion guidelines

- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (`easeOut` const) for entrances;
  spring/damp (`THREE.MathUtils.damp`, lerp 0.18) for continuous follows.
- **Durations:** micro (hover) 150–300ms · entrances 500–800ms · scene morphs scroll-scrubbed.
- **Entrances:** `opacity 0→1` + `y 16–24px→0`, staggered 60–120ms, `viewport={{ once: true }}`.
- **Scroll:** Lenis smooth scroll drives GSAP ScrollTrigger via gsap.ticker (single rAF).
- **3D:** one persistent Canvas (desktop, motion-allowed only), scroll-scrubbed via
  `heroSceneProgress`; pauses (`frameloop="never"`) and fades out beyond its range.
- **Reduced motion:** every animated component checks `useReducedMotion()` /
  `prefers-reduced-motion`; decorative motion (ping dots, scroll cue, 3D scene,
  aurora) is disabled, content remains fully visible.
- **Cursor:** custom dot+follower, compositor-only transforms, hover state via classList.

## Components

- **MagneticButton** — primary CTA (accent fill) and ghost (border) variants.
- **SectionHeading** — kicker + serif title, `align` prop.
- **.bento-card** — glass surface + pointer-tracked radial glow (`--mouse-x/y`),
  hover lift `-4px` and accent border.
- Focus: `*:focus-visible` → 2px accent outline, 4px offset. Never remove without replacement.

## Voice

Copy is quiet and confident ("Available for select opportunities"), no exclamation
marks, no buzzword stacking. Numbers over adjectives.
