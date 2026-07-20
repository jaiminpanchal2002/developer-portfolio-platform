"use client";

import { motion } from "framer-motion";
import { Award, ExternalLink } from "lucide-react";
import { useLocale } from "@/lib/localeContext";
import { Certificate } from "@/types";
import SectionHeading from "@/components/ui/SectionHeading";

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function Certificates({
    certificates,
}: {
    certificates: Certificate[];
}) {
    const { t } = useLocale();

    if (certificates.length === 0) return null;

    return (
        <div>
            <SectionHeading
                kicker={t("certificates.kicker", "Credentials")}
                title={t("certificates.title", "Certifications")}
                align="center"
                className="mb-16 mx-auto max-w-xl"
            />

            <div className="grid md:grid-cols-2 gap-6">
                {certificates.map((cert, idx) => (
                    <motion.a
                        key={cert.id}
                        href={cert.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.06, ease: easeOut }}
                        className="bento-card group flex items-start gap-4 p-6"
                    >
                        <div
                            className="p-3 rounded-xl border shrink-0"
                            style={{ background: "var(--noir-accent-soft)", borderColor: "var(--noir-border)", color: "var(--noir-accent)" }}
                        >
                            <Award size={22} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-semibold transition-opacity group-hover:opacity-80" style={{ color: "var(--noir-fg)" }}>
                                {cert.title}
                            </h3>
                            <p className="text-sm mt-1 font-semibold" style={{ color: "var(--noir-accent)" }}>
                                {cert.issuer}
                            </p>
                            <span
                                className="inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity group-hover:opacity-70 mt-4"
                                style={{ color: "var(--noir-fg-muted)" }}
                            >
                                {t("certificates.view", "View Certificate")}
                                <ExternalLink size={12} />
                            </span>
                        </div>
                    </motion.a>
                ))}
            </div>
        </div>
    );
}
