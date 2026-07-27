"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { easeOut } from "@/lib/motion/adminMotion";
import { cn } from "@/lib/utils";

interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  align?: "center" | "top";
  /** Optional structured title — renders a sticky header with a close button. */
  title?: ReactNode;
  /** Optional structured footer (e.g. Cancel/Save buttons) — stays pinned at the bottom regardless of scroll. */
  footer?: ReactNode;
}

/**
 * Every popup in the admin panel routes through this component. The card is
 * always height-capped and scrollable (mouse wheel + touch, since that's
 * just native overflow-y-auto) so long forms never hide their lower fields.
 * `className` is merged (not replaced) via `cn`, so a caller narrowing the
 * width can't accidentally drop the max-height/scroll/flex layout that
 * scrollability depends on.
 */
export default function AnimatedModal({
  isOpen,
  onClose,
  children,
  className,
  align = "center",
  title,
  footer,
}: AnimatedModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className={cn(
            "fixed inset-0 z-50 flex justify-center bg-[var(--noir-bg)]/60 p-4 backdrop-blur-sm",
            align === "top" ? "items-start overflow-y-auto" : "items-center"
          )}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: easeOut }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            className={cn(
              "flex w-full max-w-2xl max-h-[90vh] flex-col overflow-y-auto overscroll-contain rounded-2xl border border-[var(--noir-border)] bg-[var(--noir-bg-elevated)]",
              className
            )}
          >
            {title !== undefined && (
              <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[var(--noir-border)] bg-[var(--noir-bg-elevated)] px-6 py-4">
                <h2 className="text-2xl font-bold">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="rounded-lg p-2 text-[var(--noir-fg-muted)] transition-colors hover:bg-[var(--noir-bg-surface-2)] hover:text-[var(--noir-fg)]"
                >
                  <X size={20} />
                </button>
              </div>
            )}

            <div className={cn("flex-1", title !== undefined || footer !== undefined ? "px-6 py-5" : "p-6")}>
              {children}
            </div>

            {footer !== undefined && (
              <div className="sticky bottom-0 z-10 flex justify-end gap-3 border-t border-[var(--noir-border)] bg-[var(--noir-bg-elevated)] px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
