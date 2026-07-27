import { cn } from "@/lib/utils";

export function inputClass(hasError?: boolean) {
  return cn(
    "w-full p-3 rounded-lg bg-[var(--noir-bg-surface-2)] border outline-none transition-colors",
    hasError
      ? "border-red-500/60 focus:border-red-500"
      : "border-[var(--noir-border-strong)] focus:border-[var(--noir-accent)]"
  );
}

/** Sticky action row pinned to the bottom of a scrollable modal card. */
export const stickyFooterClass =
  "sticky bottom-0 z-10 -mx-6 -mb-6 mt-6 flex justify-end gap-3 border-t border-[var(--noir-border)] bg-[var(--noir-bg-elevated)] px-6 py-4";

/** Sticky title pinned to the top of a scrollable modal card. */
export const stickyHeaderClass =
  "sticky top-0 z-10 -mx-6 -mt-6 mb-6 border-b border-[var(--noir-border)] bg-[var(--noir-bg-elevated)] px-6 py-4 text-2xl font-bold";

export const secondaryButtonClass =
  "px-5 py-2 rounded-lg bg-[var(--noir-bg-surface-3)] font-medium transition-colors hover:bg-[var(--noir-bg-surface-2)]";

export const primaryButtonClass =
  "px-5 py-2 rounded-lg bg-[var(--noir-accent)] text-[var(--noir-bg)] font-semibold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed";
