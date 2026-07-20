"use client";

import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import { useLocale } from "@/lib/localeContext";
import { Experience as ExperienceType } from "@/types";
import SectionHeading from "@/components/ui/SectionHeading";

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function Experience({
    experiences,
}: {
    experiences: ExperienceType[];
}) {
    const { t } = useLocale();

    if (experiences.length === 0) return null;

    return (
        <div>
            <SectionHeading
                kicker={t("experience.kicker", "Track Record")}
                title={t("experience.title", "Experience")}
                align="center"
                className="mb-16 mx-auto max-w-xl"
            />

            <div className="space-y-6">
                {experiences.map((exp, idx) => (
                    <motion.div
                        key={exp.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.08, ease: easeOut }}
                        className="bento-card p-6 md:p-8"
                    >
                        <div className="flex flex-wrap items-start gap-4">
                            <div
                                className="p-3 rounded-xl border shrink-0"
                                style={{ background: "var(--noir-accent-soft)", borderColor: "var(--noir-border)", color: "var(--noir-accent)" }}
                            >
                                <Briefcase size={22} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                    <h3 className="text-xl font-semibold tracking-tight" style={{ color: "var(--noir-fg)" }}>
                                        {exp.position}
                                    </h3>
                                    <p className="text-xs font-semibold tracking-wide whitespace-nowrap" style={{ color: "var(--noir-fg-subtle)" }}>
                                        {exp.startDate} — {exp.currentlyWorking ? t("experience.present", "Present") : exp.endDate}
                                    </p>
                                </div>

                                <p className="font-semibold text-sm mt-1" style={{ color: "var(--noir-accent)" }}>
                                    {exp.company}
                                </p>

                                <p className="text-sm leading-relaxed mt-3" style={{ color: "var(--noir-fg-muted)" }}>
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
