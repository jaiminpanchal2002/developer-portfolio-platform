"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { easeOut } from "@/lib/motion/adminMotion";

interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  align?: "center" | "top";
}

export default function AnimatedModal({
  isOpen,
  onClose,
  children,
  className,
  align = "center",
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
          className={`fixed inset-0 z-50 flex ${
            align === "top" ? "items-start overflow-y-auto" : "items-center"
          } justify-center bg-[var(--noir-bg)]/60 p-4 backdrop-blur-sm`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: easeOut }}
            onClick={(e) => e.stopPropagation()}
            className={
              className ??
              "w-full max-w-2xl bg-[var(--noir-bg-elevated)] border border-[var(--noir-border)] rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            }
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
