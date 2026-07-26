"use client";

import { motion, useReducedMotion, Variants } from "framer-motion";

export default function SectionWrapper({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  // If prefers-reduced-motion is true, display a simple fade reveal.
  const variants: Variants = shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.6 } },
      }
    : {
        hidden: { 
          opacity: 0, 
          y: 60,
          scale: 0.95,
          rotateX: 10
        },
        visible: { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          rotateX: 0,
          transition: { 
            type: "spring",
            stiffness: 70,
            damping: 15,
            mass: 0.8
          } 
        },
      };

  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={variants}
      style={{ perspective: 1000 }}
      className="max-w-7xl mx-auto px-6 py-24 relative"
    >
      {children}
    </motion.section>
  );
}