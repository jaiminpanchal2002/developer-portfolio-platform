import { motion, useReducedMotion } from "framer-motion";

export default function SectionWrapper({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  // If prefers-reduced-motion is true, display a simple fade reveal.
  const variants: any = shouldReduceMotion
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
      {/* Decorative Grid Foundation Blueprint Lines */}
      {!shouldReduceMotion && (
        <div className="absolute inset-0 pointer-events-none -z-10 opacity-[0.03] select-none">
          <div className="w-full h-full bg-[linear-gradient(to_right,#06b6d4_1px,transparent_1px),linear-gradient(to_bottom,#06b6d4_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        </div>
      )}
      {children}
    </motion.section>
  );
}