"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { Code2, Server, Database, Cloud, Star, Cpu } from "lucide-react";
import { useLocale } from "@/lib/localeContext";
import { Skill } from "@/types";
import SectionHeading from "@/components/ui/SectionHeading";
import SceneErrorBoundary from "@/components/scene/SceneErrorBoundary";

// Three.js/R3F/drei are heavy — keep them out of every route's initial
// bundle and only fetch when a visitor actually scrolls to this section.
// WebGL has no server-side equivalent, so this is also never SSR'd.
const SkillGalaxy = dynamic(() => import("@/components/ui/skills3d/SkillGalaxy"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm" style={{ color: "var(--noir-fg-subtle)" }}>
      Loading galaxy…
    </div>
  ),
});

const easeOut = [0.16, 1, 0.3, 1] as const;

const FALLBACK_SKILLS: Skill[] = [
  { id: 1, name: "Java", category: "Backend", proficiency: 90 },
  { id: 2, name: "Spring Boot", category: "Backend", proficiency: 85 },
  { id: 3, name: "React", category: "Frontend", proficiency: 88 },
  { id: 4, name: "Next.js", category: "Frontend", proficiency: 80 },
  { id: 5, name: "PostgreSQL", category: "Database", proficiency: 82 },
  { id: 6, name: "Docker", category: "DevOps", proficiency: 75 },
  { id: 7, name: "AWS", category: "DevOps", proficiency: 70 },
];

const RING_COLORS = ["#c9a876", "#8b7fd6", "#4fb8a8", "#d68f6b", "#6f9fd6", "#d66f9f"];

function getCategoryIcon(category: string) {
  switch (category.toLowerCase()) {
    case "frontend":
      return <Code2 size={16} />;
    case "backend":
      return <Server size={16} />;
    case "database":
      return <Database size={16} />;
    case "devops":
    case "cloud":
      return <Cloud size={16} />;
    case "ai":
    case "artificial intelligence":
      return <Cpu size={16} />;
    default:
      return <Star size={16} />;
  }
}

export default function Skills({ skills }: { skills: Skill[] }) {
  const { t } = useLocale();
  const shouldReduceMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<Skill | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const displaySkills = skills.length > 0 ? skills : FALLBACK_SKILLS;

  const categories = useMemo(() => {
    const map = new Map<string, Skill[]>();
    for (const skill of displaySkills) {
      const cat = skill.category || "General";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(skill);
    }
    return [...map.entries()];
  }, [displaySkills]);

  const focusedSkill = hoveredSkill ?? selectedSkill;

  return (
    <div>
      <SectionHeading
        kicker={t("skills.kicker", "Capabilities")}
        title={t("skills.title", "Skills & Expertise")}
        align="center"
        className="mb-12 mx-auto max-w-xl"
      />

      {/* Category filter chips — hover/press to spotlight a cluster */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: easeOut }}
        className="flex flex-wrap justify-center gap-3 mb-10"
      >
        {categories.map(([category, catSkills], i) => {
          const active = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              onMouseEnter={() => setActiveCategory(category)}
              onMouseLeave={() => setActiveCategory(null)}
              onFocus={() => setActiveCategory(category)}
              onBlur={() => setActiveCategory(null)}
              onClick={() => setActiveCategory(active ? null : category)}
              aria-pressed={active}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold transition-colors duration-300 cursor-pointer"
              style={{
                borderColor: active ? RING_COLORS[i % RING_COLORS.length] : "var(--noir-border)",
                background: active ? `${RING_COLORS[i % RING_COLORS.length]}22` : "transparent",
                color: active ? RING_COLORS[i % RING_COLORS.length] : "var(--noir-fg-muted)",
              }}
            >
              <span style={{ color: RING_COLORS[i % RING_COLORS.length] }}>{getCategoryIcon(category)}</span>
              {category}
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                style={{ background: "var(--noir-accent-soft)", color: "var(--noir-accent)" }}
              >
                {catSkills.length}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* The galaxy itself */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="bento-card relative p-2 md:p-4 shadow-2xl overflow-hidden"
      >
        <div className="relative h-[380px] md:h-[520px] rounded-2xl overflow-hidden" style={{ background: "radial-gradient(ellipse at center, rgba(201,168,118,0.06), transparent 70%)" }}>
          <SceneErrorBoundary>
            <SkillGalaxy
              skills={displaySkills}
              activeCategory={activeCategory}
              onSkillHover={setHoveredSkill}
              onSkillSelect={setSelectedSkill}
              reduceMotion={Boolean(shouldReduceMotion)}
            />
          </SceneErrorBoundary>

          {/* Live readout — the one place text is guaranteed not to overlap
              or clutter, since the 3D scene itself never renders labels. */}
          <div
            className="pointer-events-none absolute bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-xs rounded-2xl border px-4 py-3 backdrop-blur-xl transition-opacity duration-200"
            style={{
              background: "var(--noir-bg-elevated)cc",
              borderColor: "var(--noir-border)",
              opacity: focusedSkill ? 1 : 0.75,
            }}
          >
            {focusedSkill ? (
              <>
                <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--noir-accent)" }}>
                  {focusedSkill.category}
                </p>
                <p className="text-lg font-bold mt-0.5" style={{ color: "var(--noir-fg)" }}>
                  {focusedSkill.name}
                </p>
                <div className="mt-2 h-1.5 w-full rounded-full overflow-hidden" style={{ background: "var(--noir-bg-surface-3)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${focusedSkill.proficiency}%`, background: "var(--noir-accent)" }}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--noir-fg-subtle)" }}>
                  {focusedSkill.proficiency}% proficiency
                </p>
              </>
            ) : (
              <p className="text-sm" style={{ color: "var(--noir-fg-subtle)" }}>
                {t("skills.galaxy.hint", "Hover or tap a node to explore — drag to rotate")}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Full categorized list — the reliable, always-readable source of
          truth (also what screen readers see; the canvas above is
          aria-hidden by nature of WebGL). */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {categories.map(([category, catSkills], i) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: easeOut }}
            className="rounded-2xl border p-5"
            style={{
              borderColor: activeCategory === category ? RING_COLORS[i % RING_COLORS.length] : "var(--noir-border)",
              background: "var(--noir-bg-elevated)",
            }}
            onMouseEnter={() => setActiveCategory(category)}
            onMouseLeave={() => setActiveCategory(null)}
          >
            <h3 className="text-sm font-bold uppercase tracking-wide flex items-center gap-2 mb-3" style={{ color: RING_COLORS[i % RING_COLORS.length] }}>
              {getCategoryIcon(category)}
              {category}
            </h3>
            <ul className="space-y-2">
              {catSkills.map((skill) => (
                <li key={skill.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setHoveredSkill(skill)}
                    onMouseLeave={() => setHoveredSkill(null)}
                    onClick={() => setSelectedSkill(skill)}
                    className="w-full flex items-center justify-between gap-3 text-left cursor-pointer group"
                  >
                    <span className="text-sm font-medium transition-colors group-hover:text-[var(--noir-accent)]" style={{ color: "var(--noir-fg)" }}>
                      {skill.name}
                    </span>
                    <span className="text-xs font-mono shrink-0" style={{ color: "var(--noir-fg-subtle)" }}>
                      {skill.proficiency}%
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
