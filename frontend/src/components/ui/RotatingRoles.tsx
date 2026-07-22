"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const easeOut = [0.16, 1, 0.3, 1] as const;
const ROTATE_INTERVAL_MS = 3200;

interface RotatingRolesProps {
  roles: string[];
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Cycles through role titles with a vertical reveal. With reduced motion
 * (or a single role) it renders the first role statically — the content is
 * never withheld from anyone.
 */
export default function RotatingRoles({ roles, className, style }: RotatingRolesProps) {
  const shouldReduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  const rotate = !shouldReduceMotion && roles.length > 1;

  useEffect(() => {
    if (!rotate) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % roles.length),
      ROTATE_INTERVAL_MS
    );
    return () => clearInterval(id);
  }, [rotate, roles.length]);

  if (!rotate) {
    return (
      <span className={className} style={style}>
        {roles[0] ?? ""}
      </span>
    );
  }

  return (
    <span
      className={`relative inline-grid overflow-hidden align-bottom ${className ?? ""}`}
      style={style}
      aria-live="polite"
    >
      {/* Invisible longest role reserves the width so the layout never shifts */}
      <span className="invisible col-start-1 row-start-1 whitespace-nowrap" aria-hidden="true">
        {roles.reduce((a, b) => (b.length > a.length ? b : a), "")}
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={roles[index]}
          initial={{ y: "110%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-110%", opacity: 0 }}
          transition={{ duration: 0.55, ease: easeOut }}
          className="col-start-1 row-start-1 whitespace-nowrap"
        >
          {roles[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
