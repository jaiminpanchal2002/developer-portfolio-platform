"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";

/**
 * Scroll-driven, word-by-word reveal. Each word eases from a dimmed rest
 * state up to full opacity as the paragraph passes through the viewport —
 * the "text writes itself in as you read" effect. Word-based (not
 * character-based) so a long bio stays cheap: ~50 subscriptions instead of
 * ~350. Honors reduced-motion by rendering plain, fully-legible text.
 */

interface AnimatedTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  /** Opacity of a not-yet-revealed word. */
  dim?: number;
}

function Word({
  children,
  progress,
  range,
  dim,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  dim: number;
}) {
  const opacity = useTransform(progress, range, [dim, 1]);
  return (
    <span className="relative mr-[0.28em] inline-block">
      <motion.span style={{ opacity }}>{children}</motion.span>
    </span>
  );
}

export default function AnimatedText({
  text,
  className,
  style,
  dim = 0.18,
}: AnimatedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.55"],
  });

  const words = text.split(" ");

  if (shouldReduceMotion) {
    return (
      <p ref={ref} className={className} style={style}>
        {text}
      </p>
    );
  }

  return (
    <p ref={ref} className={className} style={style} aria-label={text}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return (
          <Word key={i} progress={scrollYProgress} range={[start, end]} dim={dim}>
            {word}
          </Word>
        );
      })}
    </p>
  );
}
