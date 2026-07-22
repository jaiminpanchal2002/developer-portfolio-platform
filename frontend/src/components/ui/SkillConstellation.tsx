"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Skill } from "@/types";

const easeOut = [0.16, 1, 0.3, 1] as const;

const VIEW_W = 820;
const VIEW_H = 620;
const CX = VIEW_W / 2;
const CY = VIEW_H / 2;
const CATEGORY_RING = 175;
const SKILL_ORBIT_MIN = 68;
const SKILL_ORBIT_STEP = 26;

interface PlacedSkill extends Skill {
  x: number;
  y: number;
  r: number;
}

interface Cluster {
  category: string;
  x: number;
  y: number;
  skills: PlacedSkill[];
}

/** Deterministic pseudo-random in [0,1) from a string — stable across SSR/CSR. */
function hash01(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

function buildClusters(skills: Skill[]): Cluster[] {
  const grouped = new Map<string, Skill[]>();
  for (const skill of skills) {
    const cat = skill.category || "General";
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(skill);
  }

  const categories = [...grouped.keys()];
  return categories.map((category, ci) => {
    // Categories sit on a ring around the hub; slight per-category radius
    // jitter keeps the layout organic instead of mechanical.
    const angle = (ci / categories.length) * Math.PI * 2 - Math.PI / 2;
    const ringR = CATEGORY_RING * (0.9 + hash01(category) * 0.25);
    const cx = CX + Math.cos(angle) * ringR * 1.18; // wider than tall canvas
    const cy = CY + Math.sin(angle) * ringR * 0.86;

    const list = grouped.get(category)!;
    const skillsPlaced = list.map((skill, si) => {
      // Skills fan out around their category on expanding orbits, biased
      // away from the hub so clusters don't collapse into the center.
      const base = Math.atan2(cy - CY, cx - CX);
      const spread = Math.PI * 1.25;
      const t = list.length === 1 ? 0.5 : si / (list.length - 1);
      const a = base - spread / 2 + t * spread + (hash01(skill.name) - 0.5) * 0.35;
      const orbit =
        SKILL_ORBIT_MIN + (si % 3) * SKILL_ORBIT_STEP + hash01(skill.name + "r") * 14;
      return {
        ...skill,
        x: cx + Math.cos(a) * orbit,
        y: cy + Math.sin(a) * orbit * 0.9,
        r: 4 + (skill.proficiency / 100) * 7,
      };
    });

    return { category, x: cx, y: cy, skills: skillsPlaced };
  });
}

interface SkillConstellationProps {
  skills: Skill[];
  activeCategory: string | null;
  onCategoryHover?: (category: string | null) => void;
}

/**
 * The skills universe: categories orbit a central hub, individual skills
 * orbit their category. Node size encodes proficiency — no progress bars.
 * Fully deterministic layout (SSR-safe), keyboard focusable, and static
 * under prefers-reduced-motion.
 */
export default function SkillConstellation({
  skills,
  activeCategory,
  onCategoryHover,
}: SkillConstellationProps) {
  const shouldReduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState<PlacedSkill | null>(null);

  const clusters = useMemo(() => buildClusters(skills), [skills]);

  const dimmed = (category: string) =>
    activeCategory !== null && activeCategory !== category;

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full h-auto select-none"
        role="img"
        aria-label="Interactive constellation of skills grouped by category; node size reflects proficiency"
      >
        {/* Hub */}
        <circle cx={CX} cy={CY} r={5} fill="var(--noir-accent)" opacity={0.9} />
        <circle cx={CX} cy={CY} r={14} fill="none" stroke="var(--noir-accent)" strokeOpacity={0.25} />

        {clusters.map((cluster, ci) => {
          const isDim = dimmed(cluster.category);
          return (
            <motion.g
              key={cluster.category}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: isDim ? 0.25 : 1 }}
              viewport={{ once: true }}
              animate={{ opacity: isDim ? 0.25 : 1 }}
              transition={{ duration: 0.5, delay: ci * 0.08, ease: easeOut }}
              onMouseEnter={() => onCategoryHover?.(cluster.category)}
              onMouseLeave={() => onCategoryHover?.(null)}
            >
              {/* Hub → category spine */}
              <line
                x1={CX}
                y1={CY}
                x2={cluster.x}
                y2={cluster.y}
                stroke="var(--noir-fg)"
                strokeOpacity={0.08}
              />

              {/* Category node */}
              <motion.g
                animate={
                  shouldReduceMotion
                    ? undefined
                    : { y: [0, -5 - hash01(cluster.category) * 4, 0] }
                }
                transition={{
                  duration: 7 + hash01(cluster.category) * 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <circle
                  cx={cluster.x}
                  cy={cluster.y}
                  r={7}
                  fill="var(--noir-accent)"
                  opacity={0.9}
                />
                <text
                  x={cluster.x}
                  y={cluster.y - 16}
                  textAnchor="middle"
                  className="font-[family-name:var(--font-sans)]"
                  fontSize={13}
                  fontWeight={700}
                  fill="var(--noir-fg)"
                >
                  {cluster.category}
                </text>

                {/* Skill nodes */}
                {cluster.skills.map((skill) => (
                  <g key={skill.id}>
                    <line
                      x1={cluster.x}
                      y1={cluster.y}
                      x2={skill.x}
                      y2={skill.y}
                      stroke="var(--noir-fg)"
                      strokeOpacity={0.06}
                    />
                    <motion.circle
                      cx={skill.x}
                      cy={skill.y}
                      r={skill.r}
                      fill={
                        hovered?.id === skill.id
                          ? "var(--noir-accent)"
                          : "var(--noir-fg-muted)"
                      }
                      fillOpacity={hovered?.id === skill.id ? 1 : 0.55}
                      stroke="var(--noir-accent)"
                      strokeOpacity={hovered?.id === skill.id ? 0.9 : 0}
                      style={{ cursor: "pointer" }}
                      whileHover={{ scale: 1.35 }}
                      transition={{ duration: 0.25, ease: easeOut }}
                      tabIndex={0}
                      role="graphics-symbol"
                      aria-label={`${skill.name}: ${skill.proficiency}% proficiency`}
                      onMouseEnter={() => setHovered(skill)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(skill)}
                      onBlur={() => setHovered(null)}
                    />
                    <text
                      x={skill.x}
                      y={skill.y + skill.r + 13}
                      textAnchor="middle"
                      fontSize={10.5}
                      fontWeight={500}
                      fill="var(--noir-fg-muted)"
                      opacity={hovered?.id === skill.id ? 1 : 0.75}
                      pointerEvents="none"
                    >
                      {skill.name}
                    </text>
                  </g>
                ))}
              </motion.g>
            </motion.g>
          );
        })}
      </svg>

      {/* Proficiency readout for the hovered/focused node */}
      <div
        aria-live="polite"
        className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full border px-4 py-1.5 text-xs font-semibold transition-opacity duration-300"
        style={{
          background: "var(--noir-bg-elevated)",
          borderColor: "var(--noir-border)",
          color: "var(--noir-accent)",
          opacity: hovered ? 1 : 0,
        }}
      >
        {hovered ? `${hovered.name} — ${hovered.proficiency}%` : ""}
      </div>
    </div>
  );
}
