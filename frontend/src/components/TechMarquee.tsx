"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { IconType } from "react-icons";
import {
  SiLaravel,
  SiPhp,
  SiPython,
  SiFastapi,
  SiNodedotjs,
  SiNestjs,
  SiTypescript,
  SiSpring,
  SiReact,
  SiNextdotjs,
  SiVuedotjs,
  SiTailwindcss,
  SiPostgresql,
  SiMysql,
  SiMongodb,
  SiRedis,
  SiDocker,
  SiGithubactions,
  SiLangchain,
  SiOpenai,
  SiStripe,
} from "react-icons/si";
import { FaAws } from "react-icons/fa";

/**
 * Two rows of the real stack, scrolling in opposite directions — the
 * reference design's marquee, re-cast for a backend/AI engineer. No
 * hotlinked third-party demo GIFs: every mark is a vector icon bundled via
 * react-icons, so nothing depends on someone else's CDN staying up. Muted
 * noir chips with a soft gold hover keep it on-brand rather than rainbow.
 */

type Tech = { name: string; Icon: IconType };

const ROW_A: Tech[] = [
  { name: "Laravel", Icon: SiLaravel },
  { name: "PHP", Icon: SiPhp },
  { name: "Python", Icon: SiPython },
  { name: "FastAPI", Icon: SiFastapi },
  { name: "Node.js", Icon: SiNodedotjs },
  { name: "NestJS", Icon: SiNestjs },
  { name: "TypeScript", Icon: SiTypescript },
  { name: "Spring Boot", Icon: SiSpring },
  { name: "React", Icon: SiReact },
  { name: "Next.js", Icon: SiNextdotjs },
  { name: "Vue.js", Icon: SiVuedotjs },
  { name: "Tailwind", Icon: SiTailwindcss },
];

const ROW_B: Tech[] = [
  { name: "PostgreSQL", Icon: SiPostgresql },
  { name: "MySQL", Icon: SiMysql },
  { name: "MongoDB", Icon: SiMongodb },
  { name: "Redis", Icon: SiRedis },
  { name: "Docker", Icon: SiDocker },
  { name: "AWS", Icon: FaAws },
  { name: "GitHub Actions", Icon: SiGithubactions },
  { name: "LangChain", Icon: SiLangchain },
  { name: "OpenAI", Icon: SiOpenai },
  { name: "Stripe", Icon: SiStripe },
];

function Chip({ name, Icon }: Tech) {
  return (
    <span
      className="group inline-flex shrink-0 items-center gap-2.5 rounded-full border px-5 py-2.5 transition-colors duration-300"
      style={{
        borderColor: "var(--noir-border)",
        background: "var(--noir-bg-elevated)",
      }}
    >
      <Icon
        size={18}
        className="shrink-0 transition-colors duration-300 group-hover:text-[var(--noir-accent)]"
        style={{ color: "var(--noir-fg-subtle)" }}
      />
      <span
        className="text-sm font-semibold tracking-tight whitespace-nowrap transition-colors duration-300 group-hover:text-[var(--noir-fg)]"
        style={{ color: "var(--noir-fg-muted)" }}
      >
        {name}
      </span>
    </span>
  );
}

function Row({
  items,
  direction,
  duration,
  reduce,
}: {
  items: Tech[];
  direction: "left" | "right";
  duration: number;
  reduce: boolean;
}) {
  // Duplicate the set so the -50% translate lands exactly one copy over,
  // giving a seamless loop with no visible seam or snap.
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden">
      <motion.div
        className="flex w-max gap-3"
        animate={
          reduce
            ? undefined
            : { x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"] }
        }
        transition={
          reduce
            ? undefined
            : { duration, ease: "linear", repeat: Infinity }
        }
      >
        {doubled.map((tech, i) => (
          <Chip key={`${tech.name}-${i}`} {...tech} />
        ))}
      </motion.div>
    </div>
  );
}

export default function TechMarquee() {
  const shouldReduceMotion = useReducedMotion();
  const reduce = Boolean(shouldReduceMotion);

  return (
    <section
      aria-label="Technology stack"
      className="relative w-full overflow-hidden py-6"
    >
      {/* Edge fades so chips dissolve into the page rather than hard-cutting
          at the viewport border. */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 md:w-40"
        style={{
          background:
            "linear-gradient(to right, var(--noir-bg), transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 md:w-40"
        style={{
          background: "linear-gradient(to left, var(--noir-bg), transparent)",
        }}
      />

      <div className="flex flex-col gap-3">
        <Row items={ROW_A} direction="left" duration={48} reduce={reduce} />
        <Row items={ROW_B} direction="right" duration={42} reduce={reduce} />
      </div>
    </section>
  );
}
