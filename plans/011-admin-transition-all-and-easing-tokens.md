# 011 — Replace admin `transition-all` and hand-rolled easings with explicit properties / shared tokens

- **Status**: TODO
- **Commit**: d0a18b9
- **Severity**: MEDIUM
- **Category**: Cohesion & tokens (7)
- **Estimated scope**: 6 files, 6 one-line edits

## Problem

This is one consolidated finding covering two related but distinct symptoms
of the same root cause — admin files not consistently reusing the tokens
`adminMotion.ts` already exports.

**A. `transition-all` on hover-scale/hover-color buttons** — animates every
animatable property instead of just the one or two that actually change on
hover:

1. `frontend/app/admin/applications/page.tsx:155-161` — only `transform` (scale) changes on hover:
   ```tsx
   <button
     onClick={handleOpenAdd}
     className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[var(--noir-accent)] text-[var(--noir-bg)] font-bold hover:scale-105 transition-all shadow-lg shadow-[var(--noir-accent)]/20 cursor-pointer"
   >
   ```
2. `frontend/app/admin/jobs/page.tsx:186-191` — same shape, only `transform` changes:
   ```tsx
   <button
     type="submit"
     className="px-6 py-3 rounded-xl bg-[var(--noir-accent)] text-[var(--noir-bg)] font-bold hover:scale-105 transition-all cursor-pointer"
   >
   ```
3. `frontend/app/admin/resume/page.tsx:256-262` — no scale here; only `background-color` and `color` change on hover:
   ```tsx
   <button
     onClick={handleDeleteResume}
     className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-[var(--noir-fg)] rounded-xl transition-all cursor-pointer"
     title="Delete Resume"
   >
   ```

**B. Hand-rolled duration/easing instead of the shared `easeOut` token** —
`adminMotion.ts` exports `easeOut = [0.16, 1, 0.3, 1] as const`, already
imported and used correctly in each of these files' *other* animations, but
missed on one specific transition each:

4. `frontend/src/components/admin/AnimatedModal.tsx:41-45` — the backdrop has no easing at all, while the card 8 lines below (line 56) correctly uses `easeOut`:
   ```tsx
   <motion.div
     initial={{ opacity: 0 }}
     animate={{ opacity: 1 }}
     exit={{ opacity: 0 }}
     transition={{ duration: 0.2 }}
   ```
5. `frontend/app/admin/interview/page.tsx:200-206` — the accordion transition has no easing, despite this file already importing `staggerContainer`/`staggerItem` from `adminMotion` at line 7:
   ```tsx
   <motion.div
     initial={{ height: 0 }}
     animate={{ height: "auto" }}
     exit={{ height: 0 }}
     transition={{ duration: 0.2 }}
     className="overflow-hidden"
   >
   ```
6. `frontend/app/admin/security/page.tsx:212-217` — uses Framer's bare `"easeOut"` string instead of the repo's cubic-bezier token:
   ```tsx
   <motion.div
     initial={{ opacity: 0, height: 0 }}
     animate={{ opacity: 1, height: "auto" }}
     exit={{ opacity: 0, height: 0 }}
     transition={{ duration: 0.3, ease: "easeOut" }}
     className="mt-6 overflow-hidden border-t border-[var(--noir-border)] pt-6"
   >
   ```

## Target

**A. Explicit transition properties, matching what each button's `hover:` classes actually change:**

1. `frontend/app/admin/applications/page.tsx:157` — `hover:scale-105 transition-all` → `hover:scale-105 transition-transform`:
   ```tsx
   className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[var(--noir-accent)] text-[var(--noir-bg)] font-bold hover:scale-105 transition-transform shadow-lg shadow-[var(--noir-accent)]/20 cursor-pointer"
   ```
2. `frontend/app/admin/jobs/page.tsx:188` — same substitution:
   ```tsx
   className="px-6 py-3 rounded-xl bg-[var(--noir-accent)] text-[var(--noir-bg)] font-bold hover:scale-105 transition-transform cursor-pointer"
   ```
3. `frontend/app/admin/resume/page.tsx:258` — `transition-all` → `transition-colors` (this button has no scale, only color changes):
   ```tsx
   className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-[var(--noir-fg)] rounded-xl transition-colors cursor-pointer"
   ```

**B. Reuse the shared `easeOut` token:**

4. `frontend/src/components/admin/AnimatedModal.tsx:45` — add the missing easing (import already present at line 6):
   ```tsx
   transition={{ duration: 0.2, ease: easeOut }}
   ```
5. `frontend/app/admin/interview/page.tsx:204` — add `easeOut` to the existing `adminMotion` import and to this transition:
   ```tsx
   /* import, line 7 */
   import { easeOut, staggerContainer, staggerItem } from "@/lib/motion/adminMotion";
   /* transition, line 204 */
   transition={{ duration: 0.2, ease: easeOut }}
   ```
6. `frontend/app/admin/security/page.tsx:216` — add a new `adminMotion` import and swap the string literal for the token:
   ```tsx
   /* new import, near the top with the other imports */
   import { easeOut } from "@/lib/motion/adminMotion";
   /* transition, line 216 */
   transition={{ duration: 0.3, ease: easeOut }}
   ```

## Repo conventions to follow

- `easeOut` from `frontend/src/lib/motion/adminMotion.ts` is the established shared token for every admin easing curve — already correctly used in the same file for a sibling animation in both `AnimatedModal.tsx` (its own card transition, line 56) and dozens of other admin pages (e.g. `admin/page.tsx` imports it at line 47 and uses it 8+ times). This plan makes the six cited transitions consistent with that existing, already-dominant convention rather than introducing anything new.
- Tailwind's single-property `transition-transform`/`transition-colors` utilities (rather than `transition-all`) are the correct scoped alternative when only one CSS property category changes on hover — no new class or token needs to be invented, these are standard Tailwind utilities.

## Steps

1. In `frontend/app/admin/applications/page.tsx`, change `hover:scale-105 transition-all` to `hover:scale-105 transition-transform` on the button at line 157 (part of the className string spanning lines 155-161). Do not change any other class or the `onClick` handler.
2. In `frontend/app/admin/jobs/page.tsx`, change `hover:scale-105 transition-all` to `hover:scale-105 transition-transform` on the button at line 188. Do not change any other class.
3. In `frontend/app/admin/resume/page.tsx`, change `transition-all` to `transition-colors` on the button at line 258. Do not change any other class or the `onClick` handler.
4. In `frontend/src/components/admin/AnimatedModal.tsx`, change `transition={{ duration: 0.2 }}` to `transition={{ duration: 0.2, ease: easeOut }}` on the backdrop `motion.div` at line 45. `easeOut` is already imported at line 6 — do not add a duplicate import.
5. In `frontend/app/admin/interview/page.tsx`, add `easeOut` to the existing import at line 7 (`import { staggerContainer, staggerItem } from "@/lib/motion/adminMotion";` → `import { easeOut, staggerContainer, staggerItem } from "@/lib/motion/adminMotion";`), then change `transition={{ duration: 0.2 }}` to `transition={{ duration: 0.2, ease: easeOut }}` on the accordion `motion.div` at line 204.
6. In `frontend/app/admin/security/page.tsx`, add a new import line `import { easeOut } from "@/lib/motion/adminMotion";` near the file's other imports (this file has no existing `adminMotion` import to merge into), then change `transition={{ duration: 0.3, ease: "easeOut" }}` to `transition={{ duration: 0.3, ease: easeOut }}` on the setup-phase `motion.div` at line 216.

## Boundaries

- Do NOT touch any file other than the six named above.
- Do NOT change the `height: 0 → "auto"` animations in `admin/interview/page.tsx` (lines 201-203) or `admin/security/page.tsx` (lines 213-215) — those are a separate, already-identified Performance finding (layout-property animation) covered by a different plan's scope (010 covers only `BulkActionBar.tsx`, `admin/page.tsx`, and `admin/jobs/page.tsx`'s progress bars specifically, not these two accordions); this plan is scoped strictly to the missing/wrong easing token, not the animated property itself.
- Do NOT change `duration` values anywhere — only the `ease` value and the `transition-*` Tailwind utility class change.
- Do NOT add `easeOut` to any file's import that doesn't already need it for one of these six specific edits.
- If any of the six cited code blocks doesn't match the excerpts above (drift since commit `d0a18b9`), STOP and report on that specific file — the other five are independent and can still proceed.

## Verification

- **Mechanical**: run `npx tsc --noEmit` from `frontend/` — expect no new errors (all six edits are either a Tailwind class string change or adding an already-typed constant to a `transition` object). Run `npm run build` to confirm the build succeeds.
- **Feel check**:
  - `/admin/applications`: hover the "Add Application" button — confirm it still scales up smoothly on hover with no visible change in feel.
  - `/admin/jobs`: hover the "Find Jobs" button — same check.
  - `/admin/resume`: hover the delete-resume icon button — confirm the background/text color transition still plays smoothly (no more, no less than before).
  - Open any admin modal (`AnimatedModal`) — confirm the backdrop fade now uses the same eased curve as the card (both should feel identical in deceleration character, not just duration).
  - `/admin/interview`: expand/collapse a question's answer — confirm the accordion now eases with the same curve as the rest of the admin panel's motion rather than Framer's default linear-ish fallback.
  - `/admin/security`: open 2FA setup — confirm the setup panel's reveal easing is unchanged in feel (the token and the string `"easeOut"` are different curves, so double-check this one specifically: Framer's built-in `"easeOut"` keyword is a generic ease-out, while the repo's `[0.16, 1, 0.3, 1]` is a stronger, snappier decelerate — a *slight* feel change here is expected and correct, since the fix's whole point is consistency with the rest of the app).
  - In DevTools → Elements, confirm the three buttons from Part A show `transition-property: transform` or `transition-property: background-color, color` (not `all`) in their computed styles.
- **Done when**: all three buttons show a scoped `transition-property` (not `all`), all three motion transitions use the shared `easeOut` token (not a bare string or missing easing), and `npx tsc --noEmit` / `npm run build` are clean.
