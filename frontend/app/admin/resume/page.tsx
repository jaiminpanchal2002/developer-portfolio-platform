"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  analyzeResume,
  uploadResumePDF,
  getResumeDetails,
  deleteResume,
} from "@/services/resumeService";
import Swal from "sweetalert2";
import { staggerContainer, staggerItem } from "@/lib/motion/adminMotion";
import {
  FileText,
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Trash2,
  FileCheck,
} from "lucide-react";

interface ResumeAnalysis {
  score?: number;
  atsScore?: number;
  isConfirmed?: boolean;
  missingKeywords?: string[];
  recommendation?: string;
  strengths?: string[];
  weaknesses?: string[];
}

interface ResumeDetails {
  hasResume?: boolean;
  resumeText?: string;
  fileName?: string;
  fileUrl?: string;
}

export default function ResumePage() {
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeAnalysis | null>(null);
  const [resumeDetails, setResumeDetails] = useState<ResumeDetails | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadResumeDetails = async () => {
    try {
      const details = await getResumeDetails();
      setResumeDetails(details);
      if (details.hasResume && details.resumeText) {
        // Run analysis on existing resume text
        const analysis = await analyzeResume(details.resumeText);
        setResult(analysis);
      }
    } catch (error) {
      console.error("Failed to load resume details:", error);
    }
  };

  useEffect(() => {
    (async () => {
      await loadResumeDetails();
    })();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await processUploadedFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await processUploadedFile(file);
    }
  };

  const processUploadedFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      Swal.fire({
        title: "Invalid File Type",
        text: "Please upload a PDF file.",
        icon: "warning",
        background: "var(--noir-bg-elevated)",
        color: "var(--noir-fg)",
        confirmButtonColor: "var(--noir-accent)",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await uploadResumePDF(file);
      setResult(response.analysis);
      
      Swal.fire({
        title: "Successfully Uploaded!",
        text: "Resume uploaded, parsed, and analyzed.",
        icon: "success",
        background: "var(--noir-bg-elevated)",
        color: "var(--noir-fg)",
        confirmButtonColor: "var(--noir-accent)",
      });

      loadResumeDetails();
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Upload Failed",
        text: "Error uploading and parsing PDF resume. Verify file syntax.",
        icon: "error",
        background: "var(--noir-bg-elevated)",
        color: "var(--noir-fg)",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasteAnalyze = async () => {
    if (!resumeText.trim()) {
      Swal.fire({
        title: "Text Empty",
        text: "Please paste your resume text before analyzing.",
        icon: "warning",
        background: "var(--noir-bg-elevated)",
        color: "var(--noir-fg)",
        confirmButtonColor: "var(--noir-accent)",
      });
      return;
    }

    setLoading(true);
    try {
      const data = await analyzeResume(resumeText);
      setResult(data);
      Swal.fire({
        title: "Analyzed!",
        text: "Pasted resume text has been analyzed successfully.",
        icon: "success",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        background: "var(--noir-bg-elevated)",
        color: "var(--noir-fg)",
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error!",
        text: "Could not analyze resume text.",
        icon: "error",
        background: "var(--noir-bg-elevated)",
        color: "var(--noir-fg)",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResume = async () => {
    Swal.fire({
      title: "Remove Resume?",
      text: "This will delete your uploaded resume from your profile.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      background: "var(--noir-bg-elevated)",
      color: "var(--noir-fg)",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "var(--noir-bg-surface-3)",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteResume();
          setResult(null);
          setResumeDetails({ hasResume: false });
          setResumeText("");
          Swal.fire({
            title: "Deleted!",
            text: "Resume has been deleted from your profile.",
            icon: "success",
            background: "var(--noir-bg-elevated)",
            color: "var(--noir-fg)",
            confirmButtonColor: "var(--noir-accent)",
          });
        } catch (error) {
          console.error(error);
        }
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--noir-accent)] to-blue-500 bg-clip-text text-transparent">
          AI Resume Analyzer
        </h1>
        <p className="text-[var(--noir-fg-muted)] mt-2">
          Verify ATS compliance, check keyword matching, and find strengths or weaknesses
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Upload & Parse Panel */}
        <div className="space-y-6">
          <div className="bg-[var(--noir-bg-elevated)] border border-[var(--noir-border)] rounded-3xl p-6">
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
              <FileText className="text-[var(--noir-accent)]" size={20} />
              Upload PDF Resume
            </h3>

            {resumeDetails?.hasResume ? (
              <div className="flex items-center justify-between p-4 bg-[var(--noir-bg)]/60 border border-[var(--noir-border)] rounded-2xl">
                <div className="flex items-center gap-3">
                  <FileCheck className="text-green-400" size={32} />
                  <div>
                    <p className="font-bold text-[var(--noir-fg)] max-w-[180px] sm:max-w-[280px] truncate text-sm">
                      {resumeDetails.fileName}
                    </p>
                    <a
                      href={resumeDetails.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[var(--noir-accent)] hover:underline cursor-pointer"
                    >
                      Download Resume
                    </a>
                  </div>
                </div>

                <button
                  onClick={handleDeleteResume}
                  className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-[var(--noir-fg)] rounded-xl transition-all cursor-pointer"
                  title="Delete Resume"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ) : (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-12 px-6 text-center cursor-pointer transition-all ${
                  dragActive
                    ? "border-[var(--noir-accent)] bg-[var(--noir-accent)]/5"
                    : "border-[var(--noir-border)] hover:border-[var(--noir-border-strong)] hover:bg-[var(--noir-bg)]/30"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="application/pdf"
                  className="hidden"
                />
                <UploadCloud
                  size={48}
                  className={dragActive ? "text-[var(--noir-accent)] animate-bounce" : "text-[var(--noir-fg-subtle)]"}
                />
                <h4 className="font-bold mt-4 text-[var(--noir-fg)] text-base">
                  Drag and drop your PDF resume here
                </h4>
                <p className="text-xs text-[var(--noir-fg-subtle)] mt-2">
                  or click to browse from files (Only PDF supported)
                </p>
              </div>
            )}
          </div>

          {/* Paste Section Fallback */}
          {!resumeDetails?.hasResume && (
            <div className="bg-[var(--noir-bg-elevated)] border border-[var(--noir-border)] rounded-3xl p-6 space-y-4">
              <h3 className="font-bold text-xl flex items-center gap-2">
                Alternative: Paste Resume Text
              </h3>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={8}
                placeholder="Paste the plain text of your resume here..."
                className="w-full bg-[var(--noir-bg)] border border-[var(--noir-border)] rounded-2xl p-4 text-[var(--noir-fg)] focus:border-[var(--noir-accent)] focus:outline-none transition-colors text-sm resize-none"
              />
              <button
                onClick={handlePasteAnalyze}
                disabled={loading}
                className="w-full bg-[var(--noir-bg-surface-2)] text-[var(--noir-accent)] border border-[var(--noir-accent)]/30 hover:border-[var(--noir-accent)] hover:bg-[var(--noir-bg-surface-3)] py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--noir-accent)]"></div>
                    Analyzing...
                  </>
                ) : (
                  "Analyze Paste Text"
                )}
              </button>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 bg-[var(--noir-bg-elevated)] border border-[var(--noir-border)] rounded-3xl p-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--noir-accent)] mb-4"></div>
              <p className="text-[var(--noir-fg-muted)]">AI parsing and scoring your resume content...</p>
            </div>
          ) : result ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Scores Card */}
              <div className="bg-[var(--noir-bg-elevated)] border border-[var(--noir-border)] rounded-3xl p-6">
                <h3 className="font-bold text-xl mb-6">Analysis Scores</h3>

                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Resume Score */}
                  <div className="flex items-center gap-4 bg-[var(--noir-bg)]/40 border border-[var(--noir-border)]/60 p-4 rounded-2xl">
                    <div className="w-20 h-20 relative flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="40" cy="40" r="32" strokeWidth="6" stroke="var(--noir-border-strong)" fill="transparent" />
                        <motion.circle
                          cx="40"
                          cy="40"
                          r="32"
                          strokeWidth="6"
                          stroke="var(--noir-accent)"
                          strokeDasharray={2 * Math.PI * 32}
                          initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                          animate={{
                            strokeDashoffset: 2 * Math.PI * 32 * (1 - (result.score ?? 0) / 100),
                          }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                      <span className="absolute font-extrabold text-[var(--noir-fg)] text-lg">{result.score}%</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--noir-fg)] text-sm">Resume Score</h4>
                      <p className="text-[var(--noir-fg-muted)] text-xs mt-1">Completeness and quality of layout details</p>
                    </div>
                  </div>

                  {/* ATS Score */}
                  <div className="flex items-center gap-4 bg-[var(--noir-bg)]/40 border border-[var(--noir-border)]/60 p-4 rounded-2xl">
                    <div className="w-20 h-20 relative flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="40" cy="40" r="32" strokeWidth="6" stroke="var(--noir-border-strong)" fill="transparent" />
                        <motion.circle
                          cx="40"
                          cy="40"
                          r="32"
                          strokeWidth="6"
                          stroke="#10b981"
                          strokeDasharray={2 * Math.PI * 32}
                          initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                          animate={{
                            strokeDashoffset: 2 * Math.PI * 32 * (1 - (result.atsScore ?? 0) / 100),
                          }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                      <span className="absolute font-extrabold text-[var(--noir-fg)] text-lg">{result.atsScore}%</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--noir-fg)] text-sm">ATS Score</h4>
                      <p className="text-[var(--noir-fg-muted)] text-xs mt-1">Compliance with parsing bots and formats</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="bg-[var(--noir-bg-elevated)] border border-[var(--noir-border)] rounded-3xl p-6 space-y-6">
                <div>
                  <h3 className="font-bold text-xl mb-4 text-emerald-400 flex items-center gap-2">
                    <CheckCircle size={20} />
                    Strengths
                  </h3>
                  <motion.ul variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
                    {result.strengths?.map((item: string, i: number) => (
                      <motion.li
                        key={i}
                        variants={staggerItem}
                        className="flex gap-2 items-start text-[var(--noir-fg-muted)] text-sm leading-relaxed"
                      >
                        <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                        {item}
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>

                <div>
                  <h3 className="font-bold text-xl mb-4 text-rose-400 flex items-center gap-2 border-t border-[var(--noir-border)] pt-6">
                    <AlertTriangle size={20} />
                    Areas to Improve
                  </h3>
                  <motion.ul variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
                    {result.weaknesses?.map((item: string, i: number) => (
                      <motion.li
                        key={i}
                        variants={staggerItem}
                        className="flex gap-2 items-start text-[var(--noir-fg-muted)] text-sm leading-relaxed"
                      >
                        <span className="text-rose-500 shrink-0 mt-0.5">✗</span>
                        {item}
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
              </div>

              {/* Missing Keywords */}
              {(result.missingKeywords?.length ?? 0) > 0 && (
                <div className="bg-[var(--noir-bg-elevated)] border border-[var(--noir-border)] rounded-3xl p-6">
                  <h3 className="font-bold text-xl mb-4 text-yellow-400 flex items-center gap-2">
                    <AlertTriangle size={20} />
                    Missing Keywords
                  </h3>
                  <p className="text-xs text-[var(--noir-fg-muted)] mb-4">
                    Incorporate these terms into your resume to increase keyword match:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords?.map((item: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs font-semibold"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Recommendations */}
              <div className="bg-[var(--noir-bg-elevated)] border border-[var(--noir-border)] rounded-3xl p-6">
                <h3 className="font-bold text-xl mb-4 text-[var(--noir-accent)] flex items-center gap-2">
                  <Lightbulb size={20} />
                  AI Optimization Tips
                </h3>
                <div className="rounded-xl bg-[var(--noir-bg)] border border-[var(--noir-border)] p-4 text-[var(--noir-fg)] text-sm leading-relaxed">
                  {result.recommendation}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-[var(--noir-border)] rounded-3xl bg-[var(--noir-bg-elevated)]/10 text-center">
              <FileText className="text-[var(--noir-fg-subtle)] mb-4" size={48} />
              <h4 className="text-lg font-semibold text-[var(--noir-fg-muted)]">Analysis Awaiting</h4>
              <p className="text-[var(--noir-fg-subtle)] text-sm max-w-xs mt-1">
                Upload your resume PDF in the left panel to trigger the AI parser and ATS diagnostic review.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}