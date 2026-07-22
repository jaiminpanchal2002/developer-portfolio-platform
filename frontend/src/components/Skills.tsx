"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Code2, Server, Database, Cloud, Star, Cpu } from "lucide-react";
import { useLocale } from "@/lib/localeContext";
import { Skill } from "@/types";
import SectionHeading from "@/components/ui/SectionHeading";
import SkillConstellation from "@/components/ui/SkillConstellation";

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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const displaySkills = skills.length > 0 ? skills : FALLBACK_SKILLS;

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    for (const skill of displaySkills) {
      const cat = skill.category || "General";
      map.set(cat, (map.get(cat) ?? 0) + 1);
    }
    return [...map.entries()];
  }, [displaySkills]);

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
        {categories.map(([category, count]) => {
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
                borderColor: active ? "var(--noir-accent)" : "var(--noir-border)",
                background: active ? "var(--noir-accent-soft)" : "transparent",
                color: active ? "var(--noir-accent)" : "var(--noir-fg-muted)",
              }}
            >
              <span style={{ color: "var(--noir-accent)" }}>{getCategoryIcon(category)}</span>
              {category}
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                style={{ background: "var(--noir-accent-soft)", color: "var(--noir-accent)" }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* The constellation itself */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="bento-card p-4 md:p-8 shadow-2xl"
      >
        <SkillConstellation
          skills={displaySkills}
          activeCategory={activeCategory}
          onCategoryHover={setActiveCategory}
        />
        <p
          className="text-xs text-center mt-2 font-medium"
          style={{ color: "var(--noir-fg-subtle)" }}
        >
          {t(
            "skills.constellation.caption",
            "Each orbit is a discipline — node size reflects depth of experience"
          )}
        </p>
      </motion.div>
    </div>
  );
}
