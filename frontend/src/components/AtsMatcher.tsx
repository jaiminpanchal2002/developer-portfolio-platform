"use client";

import { useState } from "react";
import api from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, FileSearch, Sparkles, ArrowRight } from "lucide-react";
import { useLocale } from "@/lib/localeContext";
import SectionHeading from "@/components/ui/SectionHeading";

export default function AtsMatcher() {
  const { t } = useLocale();
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    matchPercentage: number;
    matchedSkills: string[];
    missingSkills: string[];
    analysisReport: string;
  } | null>(null);

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jd.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await api.post("/public/ats-match", {
        jobDescription: jd,
      });
      setResult(response.data);
    } catch (error) {
      console.error("ATS Match Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Decorative Glows */}
      <div
        className="absolute top-1/2 left-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none -translate-y-1/2"
        style={{ background: "rgba(201,168,118,0.05)" }}
      />
      <div
        className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none -translate-y-1/2"
        style={{ background: "rgba(243,241,237,0.03)" }}
      />

      <SectionHeading
        kicker={t("ats.kicker", "For Recruiters")}
        title={t("ats.title", "ATS Job Match Scanner")}
        align="center"
        className="mb-16 mx-auto max-w-xl"
      />
      <p className="text-center -mt-14 mb-16 max-w-xl mx-auto text-base" style={{ color: "var(--noir-fg-muted)" }}>
        {t("ats.subtitle", "Paste a job description to see how well my profile, projects, and experience match your requirements.")}
      </p>

      <div className="grid lg:grid-cols-12 gap-8 items-start relative z-10">
        {/* INPUT FORM: LEFT 6 COLUMNS */}
        <div className="lg:col-span-6">
          <form
            onSubmit={handleMatch}
            className="bento-card p-6 md:p-8 shadow-xl space-y-6"
          >
            <div>
              <label htmlFor="ats-jd" className="block text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--noir-fg)" }}>
                <FileSearch size={18} style={{ color: "var(--noir-accent)" }} />
                {t("ats.label", "Paste Job Description")}
              </label>
              <textarea
                id="ats-jd"
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder={t("ats.placeholder", "Paste the details, roles, and skills required for the job here...")}
                rows={8}
                className="w-full rounded-2xl p-4 text-sm focus:outline-none transition-colors resize-none border"
                style={{ background: "rgba(0,0,0,0.2)", borderColor: "var(--noir-border)", color: "var(--noir-fg)" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !jd.trim()}
              className="w-full py-4 rounded-2xl font-semibold hover:scale-[1.01] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--noir-accent)", color: "#0a0a0b" }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  {t("ats.scanning", "Scanning Fit Compatibility...")}
                </>
              ) : (
                <>
                  {t("ats.submit", "Calculate Match Score")}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* RESULTS METRICS: RIGHT 6 COLUMNS */}
        <div className="lg:col-span-6 h-full flex flex-col justify-stretch">
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-dashed min-h-[280px] md:min-h-[360px]"
                style={{ borderColor: "var(--noir-border)" }}
              >
                <Sparkles className="mb-4 animate-pulse" size={40} style={{ color: "var(--noir-fg-subtle)" }} />
                <h4 className="font-semibold mb-1" style={{ color: "var(--noir-fg-muted)" }}>{t("ats.waiting.title", "Waiting for Scan")}</h4>
                <p className="text-xs max-w-xs" style={{ color: "var(--noir-fg-subtle)" }}>
                  {t("ats.waiting.subtitle", "Fill in the job description details on the left and scan to see matching parameters.")}
                </p>
              </motion.div>
            )}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center p-8 rounded-3xl border min-h-[280px] md:min-h-[360px] space-y-4"
                style={{ borderColor: "var(--noir-border)" }}
              >
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full border-4 animate-spin"
                    style={{ borderColor: "var(--noir-accent-soft)", borderTopColor: "var(--noir-accent)" }}
                  />
                  <FileSearch size={32} className="animate-bounce" style={{ color: "var(--noir-accent)" }} />
                </div>
                <h4 className="font-semibold tracking-wider font-mono" style={{ color: "var(--noir-fg)" }}>
                  {t("ats.parsing", "PARSING JOB DETAILS")}
                </h4>
                <p className="text-xs max-w-xs animate-pulse" style={{ color: "var(--noir-fg-muted)" }}>
                  {t("ats.parsing.subtitle", "Checking skills inventory, project experiences, and certificates alignment...")}
                </p>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 bento-card p-6 md:p-8 shadow-xl space-y-6"
              >
                {/* Score Header */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b" style={{ borderColor: "var(--noir-border)" }}>
                  {/* Visual Radial Gauge */}
                  <div className="relative w-28 h-28 flex items-center justify-center select-none flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="56" cy="56" r="48" fill="transparent" stroke="rgba(243,241,237,0.08)" strokeWidth="8" />
                      <motion.circle
                        cx="56"
                        cy="56"
                        r="48"
                        fill="transparent"
                        stroke="#c9a876"
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 48}
                        initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - result.matchPercentage / 100) }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </svg>
                    <span className="absolute text-2.5xl font-semibold font-mono" style={{ color: "var(--noir-fg)" }}>
                      {result.matchPercentage}%
                    </span>
                  </div>

                  <div className="text-center sm:text-left space-y-2">
                    <h3 className="text-xl font-semibold" style={{ color: "var(--noir-fg)" }}>{t("ats.score.title", "ATS Fit Score")}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--noir-fg-muted)" }}>
                      {result.analysisReport}
                    </p>
                  </div>
                </div>

                {/* Tech breakdown */}
                <div className="grid sm:grid-cols-2 gap-6 pt-2">
                  {/* Matched Stack */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-widest font-mono flex items-center gap-1.5" style={{ color: "var(--noir-accent)" }}>
                      <CheckCircle2 size={14} />
                      {t("ats.matched", "Matched Skills")} ({result.matchedSkills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {result.matchedSkills.length > 0 ? (
                        result.matchedSkills.map((tech) => (
                          <span
                            key={tech}
                            className="text-xs px-2.5 py-1 rounded-lg font-medium border"
                            style={{ background: "var(--noir-accent-soft)", borderColor: "rgba(201,168,118,0.25)", color: "var(--noir-accent)" }}
                          >
                            {tech}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs font-mono italic" style={{ color: "var(--noir-fg-subtle)" }}>{t("ats.matched.empty", "None detected")}</span>
                      )}
                    </div>
                  </div>

                  {/* Missing Stack */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-widest font-mono flex items-center gap-1.5" style={{ color: "var(--noir-fg-muted)" }}>
                      <AlertCircle size={14} />
                      {t("ats.missing", "Missing Skills")} ({result.missingSkills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {result.missingSkills.length > 0 ? (
                        result.missingSkills.map((tech) => (
                          <span
                            key={tech}
                            className="text-xs px-2.5 py-1 rounded-lg font-medium border"
                            style={{ background: "rgba(243,241,237,0.05)", borderColor: "var(--noir-border)", color: "var(--noir-fg-muted)" }}
                          >
                            {tech}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs font-mono italic" style={{ color: "var(--noir-fg-subtle)" }}>{t("ats.missing.empty", "No critical gaps")}</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
