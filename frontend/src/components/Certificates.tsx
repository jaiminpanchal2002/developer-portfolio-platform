"use client";

import { motion } from "framer-motion";
import { Award, ExternalLink } from "lucide-react";
import { useLocale } from "@/lib/localeContext";
import { Certificate } from "@/types";

export default function Certificates({
    certificates,
}: {
    certificates: Certificate[];
}) {
    const { t } = useLocale();

    if (certificates.length === 0) return null;

    return (
        <div>
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent tracking-tight">
                    {t("certificates.title", "Certifications")}
                </h2>
                <p className="text-slate-400 mt-4 max-w-xl mx-auto text-sm font-semibold">
                    {t("certificates.subtitle", "Credentials validating hands-on expertise across the stack")}
                </p>
            </div>

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
                        transition={{ duration: 0.5, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
                        className="bento-card group flex items-start gap-4 p-6"
                    >
                        <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 shrink-0">
                            <Award size={22} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                                {cert.title}
                            </h3>
                            <p className="text-cyan-400 text-sm mt-1 font-semibold">
                                {cert.issuer}
                            </p>
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 group-hover:text-cyan-300 transition-colors mt-4">
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
