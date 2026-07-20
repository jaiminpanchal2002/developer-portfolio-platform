"use client";

import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { useLocale } from "@/lib/localeContext";
import { Education as EducationType } from "@/types";
import SectionHeading from "@/components/ui/SectionHeading";

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function Education({
    educations,
}: {
    educations: EducationType[];
}) {
    const { t } = useLocale();

    if (educations.length === 0) return null;

    return (
        <div>
            <SectionHeading
                kicker={t("education.kicker", "Foundation")}
                title={t("education.title", "Education")}
                align="center"
                className="mb-16 mx-auto max-w-xl"
            />

            <div className="space-y-6">
                {educations.map((edu, idx) => (
                    <motion.div
                        key={edu.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.08, ease: easeOut }}
                        className="bento-card flex flex-col sm:flex-row sm:items-center gap-6 p-6 md:p-8"
                    >
                        <div
                            className="p-3.5 rounded-2xl border shrink-0 w-fit"
                            style={{ background: "var(--noir-accent-soft)", borderColor: "var(--noir-border)", color: "var(--noir-accent)" }}
                        >
                            <GraduationCap size={24} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                <h3 className="text-xl font-semibold tracking-tight" style={{ color: "var(--noir-fg)" }}>
                                    {edu.degree}
                                </h3>
                                <p className="text-xs font-semibold tracking-wide" style={{ color: "var(--noir-fg-subtle)" }}>
                                    {edu.startYear} — {edu.endYear}
                                </p>
                            </div>

                            <p className="font-semibold text-sm mt-1" style={{ color: "var(--noir-accent)" }}>
                                {edu.institution}
                            </p>

                            {edu.fieldOfStudy && (
                                <p className="text-sm mt-2" style={{ color: "var(--noir-fg-muted)" }}>
                                    {edu.fieldOfStudy}
                                </p>
                            )}

                            {edu.grade && (
                                <span
                                    className="inline-block text-xs font-semibold rounded-full px-3 py-1 mt-3 border"
                                    style={{ color: "var(--noir-fg)", background: "rgba(243,241,237,0.05)", borderColor: "var(--noir-border)" }}
                                >
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
