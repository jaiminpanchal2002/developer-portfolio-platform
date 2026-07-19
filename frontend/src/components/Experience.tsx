"use client";

import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import { useLocale } from "@/lib/localeContext";
import { Experience as ExperienceType } from "@/types";

export default function Experience({
    experiences,
}: {
    experiences: ExperienceType[];
}) {
    const { t } = useLocale();

    if (experiences.length === 0) return null;

    return (
        <div>
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent tracking-tight">
                    {t("experience.title", "Experience")}
                </h2>
            </div>

            <div className="space-y-6">
                {experiences.map((exp, idx) => (
                    <motion.div
                        key={exp.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                        className="bento-card p-6 md:p-8"
                    >
                        <div className="flex flex-wrap items-start gap-4">
                            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                                <Briefcase size={22} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                    <h3 className="text-xl font-bold text-white tracking-tight">
                                        {exp.position}
                                    </h3>
                                    <p className="text-slate-500 text-xs font-bold tracking-wide whitespace-nowrap">
                                        {exp.startDate} — {exp.currentlyWorking ? t("experience.present", "Present") : exp.endDate}
                                    </p>
                                </div>

                                <p className="text-cyan-400 font-semibold text-sm mt-1">
                                    {exp.company}
                                </p>

                                <p className="text-slate-400 text-sm leading-relaxed mt-3">
                                    {exp.description}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
