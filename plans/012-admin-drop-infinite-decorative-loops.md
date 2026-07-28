# 012 — Drop permanent decorative `animate-bounce`/`-ping`/`-pulse` flourishes in admin

- **Status**: TODO
- **Commit**: d0a18b9
- **Severity**: LOW
- **Category**: Cohesion & tokens (7)
- **Estimated scope**: 2 files, 3 small edits

## Problem

Three admin locations use Tailwind's default infinite keyframe utilities
(`animate-bounce`, `animate-ping`, `animate-pulse`) as purely decorative
flourishes that loop forever for as long as the page is open. These read as
marketing-site touches dropped into an otherwise crisp, restrained CRUD
dashboard (every other admin motion — page transitions, stagger entrances,
modals — is a one-shot reveal, not an infinite loop), and in the unread-dot
case, potentially many instances animate at once (one per unread row).

**1. Empty-state icon, `frontend/app/admin/inquiries/page.tsx:177-182`** —
a permanent bounce on an icon that only appears when there's nothing to show:

```tsx
<div className="bg-[var(--noir-bg-elevated)]/50 border border-[var(--noir-border)] rounded-3xl p-12 text-center text-[var(--noir-fg-muted)]">
  <Inbox className="mx-auto text-[var(--noir-fg-subtle)] mb-4 animate-bounce" size={48} />
  <p className="text-lg font-medium">No inquiries found</p>
  <p className="text-sm text-[var(--noir-fg-subtle)] mt-1">When visitors fill out your contact form, they will appear here.</p>
</div>
```

**2. Unread-message dot, `frontend/app/admin/inquiries/page.tsx:213-216`** —
one `animate-ping` per unread inquiry row; with several unread messages in
the list, several of these animate simultaneously, forever:

```tsx
<div className="absolute top-4 right-4 flex items-center gap-3">
  {!inq.isRead && (
    <div className="w-3 h-3 bg-[var(--noir-accent)] rounded-full animate-ping" />
  )}
  <SelectCheckbox
    checked={selection.isSelected(inq.id)}
    onChange={() => selection.toggle(inq.id)}
    label={`Select message from ${inq.name}`}
  />
</div>
```

**3. Header icon, `frontend/app/admin/profile-score/page.tsx:165-168`** —
an icon pulsing forever next to a completely static heading:

```tsx
<h3 className="font-bold text-xl mb-6 flex items-center gap-2">
  <Sparkles className="text-[var(--noir-accent)] animate-pulse" size={20} />
  Completeness
</h3>
```

## Target

**1. Empty state** — replace the infinite bounce with a single one-shot
entrance for the whole empty-state block (a real state transition — "no
results" appearing — is worth a brief, deliberate reveal; a decorative icon
bouncing forever is not). This file already imports `motion` from
`framer-motion` (line 4) and `staggerContainer`/`staggerItem` from
`adminMotion` (line 24) — add `easeOut` to that same import:

```tsx
/* import, line 24 */
import { easeOut, staggerContainer, staggerItem } from "@/lib/motion/adminMotion";
```

```tsx
/* target, lines 177-182 */
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.4, ease: easeOut }}
  className="bg-[var(--noir-bg-elevated)]/50 border border-[var(--noir-border)] rounded-3xl p-12 text-center text-[var(--noir-fg-muted)]"
>
  <Inbox className="mx-auto text-[var(--noir-fg-subtle)] mb-4" size={48} />
  <p className="text-lg font-medium">No inquiries found</p>
  <p className="text-sm text-[var(--noir-fg-subtle)] mt-1">When visitors fill out your contact form, they will appear here.</p>
</motion.div>
```

**2. Unread dot** — drop the animation, keep the dot itself as a static
accent (it still fully communicates "unread" at a glance without moving):

```tsx
/* target, lines 213-216 */
<div className="absolute top-4 right-4 flex items-center gap-3">
  {!inq.isRead && (
    <div className="w-3 h-3 bg-[var(--noir-accent)] rounded-full" />
  )}
  <SelectCheckbox
    checked={selection.isSelected(inq.id)}
    onChange={() => selection.toggle(inq.id)}
    label={`Select message from ${inq.name}`}
  />
</div>
```

**3. Header icon** — drop the pulse, keep the icon static:

```tsx
/* target, lines 165-168 */
<h3 className="font-bold text-xl mb-6 flex items-center gap-2">
  <Sparkles className="text-[var(--noir-accent)]" size={20} />
  Completeness
</h3>
```

## Repo conventions to follow

- One-shot `initial`/`animate` fades with `transition: { duration, ease: easeOut }` are the standard reveal pattern used throughout the admin panel (e.g. `AnimatedModal.tsx`, every admin page's top-level entrance) — the empty-state fix follows this exact shape rather than inventing a new one.
- `easeOut` from `frontend/src/lib/motion/adminMotion.ts` is the shared curve token, already imported in this same file for `staggerContainer`/`staggerItem` — add to the same import line rather than a new one.

## Steps

1. In `frontend/app/admin/inquiries/page.tsx`, add `easeOut` to the existing import at line 24: `import { staggerContainer, staggerItem } from "@/lib/motion/adminMotion";` → `import { easeOut, staggerContainer, staggerItem } from "@/lib/motion/adminMotion";`.
2. In the same file, replace the empty-state block (lines 177-182) exactly as shown in the Target section: change the outer `<div>` to `<motion.div>` with the `initial`/`animate`/`transition` shown, and remove `animate-bounce` from the `Inbox` icon's className (leaving `"mx-auto text-[var(--noir-fg-subtle)] mb-4"`).
3. In the same file, remove `animate-ping` from the unread-dot `<div>`'s className at line 215 (leaving `"w-3 h-3 bg-[var(--noir-accent)] rounded-full"`). Do not change the surrounding conditional, `SelectCheckbox`, or anything else in this block.
4. In `frontend/app/admin/profile-score/page.tsx`, remove `animate-pulse` from the `Sparkles` icon's className at line 166 (leaving `"text-[var(--noir-accent)]"`). Do not change the heading text or layout.

## Boundaries

- Do NOT touch any file other than `frontend/app/admin/inquiries/page.tsx` and `frontend/app/admin/profile-score/page.tsx`.
- Do NOT touch the `animate-spin` loading spinner at `admin/inquiries/page.tsx:175` — a spinning loader during an active async wait is a correct, conventional use of an infinite loop (it communicates "still working," unlike the three decorative cases here) and is not part of this finding.
- Do NOT change `BulkActionBar`, `SelectCheckbox`, the stagger container/item variants, or the radial progress SVG in `profile-score/page.tsx` — this plan touches only the three named decorative animations.
- Do NOT add a one-shot entrance to the unread dot or the Sparkles icon as a "compromise" — per the finding, these should become static accents, not softer animations; only the empty-state block gets a one-shot entrance, since it's the one genuine state-transition moment among the three.
- If any of the three cited code blocks doesn't match the excerpts above (drift since commit `d0a18b9`), STOP and report on that specific file — the two files in this plan are independent and can proceed separately.

## Verification

- **Mechanical**: run `npx tsc --noEmit` from `frontend/` — expect no new errors. Run `npm run build` to confirm the build succeeds.
- **Feel check**:
  - `/admin/inquiries` with zero inquiries (or filter to an empty result): confirm the empty state now fades and scales in once when it first appears, and the `Inbox` icon sits still afterward (no more bouncing).
  - `/admin/inquiries` with at least one unread message: confirm the accent-colored dot next to the checkbox is still clearly visible as a static, non-animated indicator.
  - `/admin/profile-score`: confirm the `Sparkles` icon next to "Completeness" is now static.
  - Leave each page open for 10+ seconds and confirm none of the three elements move on their own anymore.
- **Done when**: none of the three elements loop indefinitely, the empty state still gets a clear one-time entrance, the unread dot and Sparkles icon remain visually present as static accents, and `npx tsc --noEmit` / `npm run build` are clean.
