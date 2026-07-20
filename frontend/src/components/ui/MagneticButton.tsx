"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type MagneticButtonProps =
  | ({ href: string; strength?: number } & Omit<HTMLMotionProps<"a">, "href">)
  | ({ href?: undefined; strength?: number } & HTMLMotionProps<"button">);

// A gentle magnetic-hover wrapper: the element eases toward the cursor
// within its own bounds, then springs back on leave. Gated to
// hover-capable pointers so it never fights touch scrolling. Renders as
// an <a> when given `href` (navigation) or a <button> otherwise (actions)
// — never a link without href, which breaks keyboard/AT semantics.
export default function MagneticButton({ children, className, strength = 0.35, style, ...props }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.4 });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (!ref.current || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const mergedClassName = cn("inline-flex items-center justify-center", className);
  const mergedStyle = { ...style, x: springX, y: springY };

  if (props.href) {
    return (
      <motion.a
        ref={ref as React.Ref<HTMLAnchorElement>}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={mergedStyle}
        className={mergedClassName}
        {...(props as Omit<HTMLMotionProps<"a">, "href">)}
        href={props.href}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={mergedStyle}
      className={mergedClassName}
      {...(props as HTMLMotionProps<"button">)}
    >
      {children}
    </motion.button>
  );
}
