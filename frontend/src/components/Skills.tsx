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
        return <Code2 className="text-cyan-400" size={20} />;
      case "backend":
        return <Server className="text-purple-400" size={20} />;
      case "database":
        return <Database className="text-pink-400" size={20} />;
      case "devops":
      case "cloud":
        return <Cloud className="text-yellow-400" size={20} />;
      case "ai":
      case "artificial intelligence":
        return <Cpu className="text-emerald-400" size={20} />;
      default:
        return <Star className="text-blue-400" size={20} />;
    }
  };

  return (
    <div>
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent tracking-tight">
          {t("skills.title", "Skills & Expertise")}
        </h2>
        <p className="text-slate-400 mt-4 max-w-xl mx-auto text-sm font-semibold">
          Deep dive into my tech stack and proficiency ratings across frontend, backend, database, devops, and AI engineering layers
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Bento Grid: Skill categories list */}
        <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
          {Object.keys(groupedSkills).map((category, idx) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="bento-card p-6 shadow-xl flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2.5 mb-6">
                  <span className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    {getCategoryIcon(category)}
                  </span>
                  {category}
                </h3>

                <div className="space-y-4">
                  {groupedSkills[category].map((skill) => (
                    <div key={skill.id} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-300">{skill.name}</span>
                        <span className="text-cyan-450">{skill.proficiency}%</span>
                      </div>

                      <div className="w-full bg-white/5 border border-white/5 h-2 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: skill.proficiency / 100 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                          style={{ transformOrigin: "left" }}
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full w-full rounded-full"
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
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bento-card p-6 md:p-8 shadow-2xl flex flex-col justify-between"
          >
            <h3 className="text-lg font-bold text-white mb-6 tracking-tight">
              {t("skills.radar", "Skill Alignment")}
            </h3>

            <div className="h-[350px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                {chartData.length >= 3 ? (
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis dataKey="category" stroke="#94a3b8" fontSize={11} fontWeight={600} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.1)" tick={{ fontSize: 9 }} />
                    <Radar
                      name="Proficiency"
                      dataKey="Proficiency"
                      stroke="#06b6d4"
                      fill="url(#radarGlow)"
                      fillOpacity={0.4}
                    />
                    <defs>
                      <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.1} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.5} />
                      </radialGradient>
                    </defs>
                  </RadarChart>
                ) : (
                  <BarChart data={chartData}>
                    <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0a0a0a", borderColor: "rgba(255,255,255,0.1)", borderRadius: "16px" }}
                      itemStyle={{ color: "#06b6d4", fontSize: 12 }}
                    />
                    <Bar dataKey="Proficiency" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
            
            <p className="text-xxs text-slate-500 text-center mt-6 font-semibold">
              Category indicators demonstrate composite engineering focus
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}