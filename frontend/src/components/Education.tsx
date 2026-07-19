"use client";

import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { useLocale } from "@/lib/localeContext";
import { Education as EducationType } from "@/types";

export default function Education({
    educations,
}: {
    educations: EducationType[];
}) {
    const { t } = useLocale();

    if (educations.length === 0) return null;

    return (
        <div>
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent tracking-tight">
                    {t("education.title", "Education")}
                </h2>
            </div>

            <div className="space-y-6">
                {educations.map((edu, idx) => (
                    <motion.div
                        key={edu.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                        className="bento-card flex flex-col sm:flex-row sm:items-center gap-6 p-6 md:p-8"
                    >
                        <div className="p-3.5 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 shrink-0 w-fit">
                            <GraduationCap size={24} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                <h3 className="text-xl font-bold text-white tracking-tight">
                                    {edu.degree}
                                </h3>
                                <p className="text-slate-500 text-xs font-bold tracking-wide">
                                    {edu.startYear} — {edu.endYear}
                                </p>
                            </div>

                            <p className="text-cyan-400 font-semibold text-sm mt-1">
                                {edu.institution}
                            </p>

                            {edu.fieldOfStudy && (
                                <p className="text-slate-400 text-sm mt-2">
                                    {edu.fieldOfStudy}
                                </p>
                            )}

                            {edu.grade && (
                                <span className="inline-block text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 mt-3">
                                    {t("education.grade", "Grade")}: {edu.grade}
                                </span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
