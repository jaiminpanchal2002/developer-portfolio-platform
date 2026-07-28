"use client";

import { motion, Variants } from "framer-motion";

const easeOut = [0.16, 1, 0.3, 1] as const;

const variants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: easeOut } },
};

export default function SectionWrapper({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: string;
}) {
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
