"use client";

import { motion, useReducedMotion } from "framer-motion";

const easeOut = [0.16, 1, 0.3, 1] as const;

/**
 * Route transition: every navigation (home <-> case studies, admin pages)
 * enters with a soft rise-and-fade. Next remounts templates per route, so
 * this animates exactly once per navigation. Disabled under reduced motion.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}
