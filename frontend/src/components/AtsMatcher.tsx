"use client";

import { useState } from "react";
import api from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, FileSearch, Sparkles, ArrowRight } from "lucide-react";

export default function AtsMatcher() {
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
    <section id="ats-matcher" className="max-w-7xl mx-auto px-6 py-24 relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          ATS Job Match Scanner
        </h2>
        <p className="text-slate-400 mt-4 max-w-xl mx-auto text-base">
          Recruiters! Paste your job description here to check how well my profile, projects, and experiences match your requirements.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start relative z-10">
        {/* INPUT FORM: LEFT 6 COLUMNS */}
        <div className="lg:col-span-6">
          <form onSubmit={handleMatch} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <FileSearch size={18} className="text-cyan-400" />
                Paste Job Description
              </label>
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the details, roles, and skills required for the job here..."
                rows={8}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-200 text-sm focus:border-cyan-500 focus:outline-none transition-colors resize-none placeholder-slate-650"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !jd.trim()}
              className="w-full bg-cyan-500 text-black py-4 rounded-2xl font-extrabold hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  Scanning Fit Compatibility...
                </>
              ) : (
                <>
                  Calculate Match Score
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
                className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl min-h-[360px]"
              >
                <Sparkles className="text-slate-600 mb-4 animate-pulse" size={40} />
                <h4 className="text-slate-400 font-bold mb-1">Waiting for Scan</h4>
                <p className="text-slate-500 text-xs max-w-xs">
                  Fill in the job description details on the left and scan to see matching parameters.
                </p>
              </motion.div>
            )}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-900/40 border border-slate-800 rounded-3xl min-h-[360px] space-y-4"
              >
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
                  <FileSearch size={32} className="text-cyan-400 animate-bounce" />
                </div>
                <h4 className="text-white font-extrabold tracking-wider font-mono">PARSING JOB DETAILS</h4>
                <p className="text-slate-400 text-xs max-w-xs animate-pulse">
                  Checking skills inventory, project experiences, and certificates alignment...
                </p>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 bg-slate-900/50 backdrop-blur-xl border border-slate-850 rounded-3xl p-6 md:p-8 shadow-xl space-y-6"
              >
                {/* Score Header */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-800">
                  {/* Visual Radial Gauge */}
                  <div className="relative w-28 h-28 flex items-center justify-center select-none flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="56" cy="56" r="48" fill="transparent" stroke="#0f172a" strokeWidth="8" />
                      <motion.circle
                        cx="56"
                        cy="56"
                        r="48"
                        fill="transparent"
                        stroke="#06b6d4"
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 48}
                        initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - result.matchPercentage / 100) }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </svg>
                    <span className="absolute text-2.5xl font-extrabold text-white font-mono">
                      {result.matchPercentage}%
                    </span>
                  </div>

                  <div className="text-center sm:text-left space-y-2">
                    <h3 className="text-xl font-bold text-white">ATS Fit Score</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {result.analysisReport}
                    </p>
                  </div>
                </div>

                {/* Tech breakdown */}
                <div className="grid sm:grid-cols-2 gap-6 pt-2">
                  {/* Matched Stack */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                      <CheckCircle2 size={14} />
                      Matched Skills ({result.matchedSkills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {result.matchedSkills.length > 0 ? (
                        result.matchedSkills.map((tech) => (
                          <span
                            key={tech}
                            className="text-xs px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg font-medium"
                          >
                            {tech}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 font-mono italic">None detected</span>
                      )}
                    </div>
                  </div>

                  {/* Missing Stack */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-amber-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
                      <AlertCircle size={14} />
                      Missing Skills ({result.missingSkills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {result.missingSkills.length > 0 ? (
                        result.missingSkills.map((tech) => (
                          <span
                            key={tech}
                            className="text-xs px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg font-medium"
                          >
                            {tech}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 font-mono italic">No critical gaps</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
