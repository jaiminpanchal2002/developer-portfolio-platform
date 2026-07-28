"use client";

import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BulkAction {
  label: string;
  onClick: () => void;
  danger?: boolean;
  icon?: ReactNode;
}

interface Props {
  count: number;
  onClear: () => void;
  actions: BulkAction[];
  busy?: boolean;
}

/** Appears above a table whenever rows are selected. Shared across every
 *  admin module so bulk delete/publish/unpublish/archive look and behave
 *  identically everywhere. */
export default function BulkActionBar({ count, onClear, actions, busy }: Props) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="sticky top-0 z-20 mb-4 overflow-hidden"
        >
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--noir-accent)]/30 bg-[var(--noir-bg-elevated)] px-4 py-3 shadow-lg">
            <span className="text-sm font-semibold text-[var(--noir-fg)]">
              {count} selected
            </span>
            <div className="h-4 w-px bg-[var(--noir-border)]" />
            <div className="flex flex-wrap items-center gap-2">
              {actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  disabled={busy}
                  onClick={action.onClick}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                    action.danger
                      ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      : "bg-[var(--noir-accent-soft)] text-[var(--noir-accent)] hover:bg-[var(--noir-accent)]/25"
                  )}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear selection"
              className="ml-auto rounded-lg p-1.5 text-[var(--noir-fg-muted)] transition-colors hover:bg-[var(--noir-bg-surface-2)] hover:text-[var(--noir-fg)]"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
