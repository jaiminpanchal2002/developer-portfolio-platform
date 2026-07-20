"use client";

import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Code2, Server, Database, Cloud, Star, Cpu } from "lucide-react";
import { useLocale } from "@/lib/localeContext";
import { Skill } from "@/types";
import SectionHeading from "@/components/ui/SectionHeading";

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function Skills({ skills }: { skills: Skill[] }) {
  const { t } = useLocale();

  const displaySkills = skills.length > 0 ? skills : [
    { id: 1, name: "Java", category: "Backend", proficiency: 90 },
    { id: 2, name: "Spring Boot", category: "Backend", proficiency: 85 },
    { id: 3, name: "React", category: "Frontend", proficiency: 88 },
    { id: 4, name: "Next.js", category: "Frontend", proficiency: 80 },
    { id: 5, name: "PostgreSQL", category: "Database", proficiency: 82 },
    { id: 6, name: "Docker", category: "DevOps", proficiency: 75 },
    { id: 7, name: "AWS", category: "DevOps", proficiency: 70 },
  ];

  // Group skills by category
  const groupedSkills = displaySkills.reduce((acc, skill) => {
    const cat = skill.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  // Compute category averages for the chart
  const chartData = Object.keys(groupedSkills).map((cat) => {
    const list = groupedSkills[cat];
    const avg = list.reduce((sum, item) => sum + item.proficiency, 0) / list.length;
    return {
      category: cat,
      Proficiency: Math.round(avg),
    };
  });

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "frontend":
        return <Code2 size={20} />;
      case "backend":
        return <Server size={20} />;
      case "database":
        return <Database size={20} />;
      case "devops":
      case "cloud":
        return <Cloud size={20} />;
      case "ai":
      case "artificial intelligence":
        return <Cpu size={20} />;
      default:
        return <Star size={20} />;
    }
  };

  return (
    <div>
      <SectionHeading
        kicker={t("skills.kicker", "Capabilities")}
        title={t("skills.title", "Skills & Expertise")}
        align="center"
        className="mb-16 mx-auto max-w-xl"
      />

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Bento Grid: Skill categories list */}
        <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
          {Object.keys(groupedSkills).map((category, idx) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.06, ease: easeOut }}
              className="bento-card p-6 shadow-xl flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2.5 mb-6" style={{ color: "var(--noir-fg)" }}>
                  <span
                    className="p-2.5 rounded-xl border flex items-center justify-center"
                    style={{ background: "var(--noir-accent-soft)", borderColor: "var(--noir-border)", color: "var(--noir-accent)" }}
                  >
                    {getCategoryIcon(category)}
                  </span>
                  {category}
                </h3>

                <div className="space-y-4">
                  {groupedSkills[category].map((skill) => (
                    <div key={skill.id} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-medium">
                        <span style={{ color: "var(--noir-fg-muted)" }}>{skill.name}</span>
                        <span style={{ color: "var(--noir-accent)" }}>{skill.proficiency}%</span>
                      </div>

                      <div className="w-full h-1.5 rounded-full overflow-hidden border" style={{ background: "rgba(243,241,237,0.05)", borderColor: "var(--noir-border)" }}>
                        <motion.div
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: skill.proficiency / 100 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: easeOut }}
                          style={{ transformOrigin: "left", background: "var(--noir-accent)" }}
                          className="h-full w-full rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Radar/Bar distribution chart */}
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="bento-card p-6 md:p-8 shadow-2xl flex flex-col justify-between"
          >
            <h3 className="text-lg font-semibold mb-6 tracking-tight" style={{ color: "var(--noir-fg)" }}>
              {t("skills.radar", "Skill Alignment")}
            </h3>

            <div className="h-[350px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                {chartData.length >= 3 ? (
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                    <PolarGrid stroke="rgba(243,241,237,0.08)" />
                    <PolarAngleAxis dataKey="category" stroke="#a3a09a" fontSize={11} fontWeight={600} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(243,241,237,0.1)" tick={{ fontSize: 9 }} />
                    <Radar
                      name="Proficiency"
                      dataKey="Proficiency"
                      stroke="#c9a876"
                      fill="url(#radarGlow)"
                      fillOpacity={0.4}
                    />
                    <defs>
                      <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#c9a876" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#c9a876" stopOpacity={0.05} />
                      </radialGradient>
                    </defs>
                  </RadarChart>
                ) : (
                  <BarChart data={chartData}>
                    <XAxis dataKey="category" stroke="#a3a09a" fontSize={10} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#a3a09a" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#131315", borderColor: "var(--noir-border)", borderRadius: "16px" }}
                      itemStyle={{ color: "#c9a876", fontSize: 12 }}
                    />
                    <Bar dataKey="Proficiency" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c9a876" />
                        <stop offset="100%" stopColor="#8a7550" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            <p className="text-xxs text-center mt-6 font-medium" style={{ color: "var(--noir-fg-subtle)" }}>
              {t("skills.radar.caption", "Category indicators demonstrate composite engineering focus")}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
