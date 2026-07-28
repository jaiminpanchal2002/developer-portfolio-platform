"use client";

import { useState } from "react";
import { getInterviewQuestions } from "@/services/interviewService";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { easeOut, staggerContainer, staggerItem } from "@/lib/motion/adminMotion";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Cpu,
  UserCheck,
  MessageSquare,
  Sparkles,
} from "lucide-react";

interface Question {
  category: string;
  question: string;
  answer: string;
}

const ROLES = [
  "Java Developer",
  "Spring Boot Developer",
  "React Developer",
  "Full Stack Developer",
];

export default function InterviewPage() {
  const [role, setRole] = useState(ROLES[0]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setExpandedIndex(null);
    try {
      const data = await getInterviewQuestions(role);
      setQuestions(data);
      Swal.fire({
        title: "Questions Generated!",
        text: `Technical, HR, and Scenario questions loaded for ${role}.`,
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
        title: "Generation Failed",
        text: "Could not connect to AI endpoint. Please try again.",
        icon: "error",
        background: "var(--noir-bg-elevated)",
        color: "var(--noir-fg)",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "technical":
        return <Cpu className="text-[var(--noir-accent)]" size={18} />;
      case "hr":
        return <UserCheck className="text-pink-400" size={18} />;
      case "scenario":
        return <MessageSquare className="text-yellow-400" size={18} />;
      default:
        return <HelpCircle className="text-purple-400" size={18} />;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category.toLowerCase()) {
      case "technical":
        return "bg-[var(--noir-accent)]/10 text-[var(--noir-accent)] border-[var(--noir-accent)]/20";
      case "hr":
        return "bg-pink-500/10 text-pink-400 border-pink-500/20";
      case "scenario":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      default:
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--noir-accent)] to-blue-500 bg-clip-text text-transparent">
          AI Interview Preparation
        </h1>
        <p className="text-[var(--noir-fg-muted)] mt-2">
          Generate Technical, HR, and Scenario questions customized to your profile
        </p>
      </div>

      {/* Role Selector Card */}
      <div className="bg-[var(--noir-bg-elevated)] border border-[var(--noir-border)] rounded-3xl p-6">
        <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
          <Sparkles className="text-[var(--noir-accent)]" size={20} />
          Select Target Role
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
            className="flex-1 bg-[var(--noir-bg)] border border-[var(--noir-border)] rounded-xl px-4 py-3 text-[var(--noir-fg)] focus:border-[var(--noir-accent)] focus:outline-none transition-colors"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-[var(--noir-accent)] text-[var(--noir-bg)] font-bold hover:scale-105 transition-all shadow-lg shadow-[var(--noir-accent)]/10 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                Generating...
              </>
            ) : (
              "Generate Questions"
            )}
          </button>
        </div>
      </div>

      {/* Questions Listing */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {questions.length === 0 ? (
          !loading && (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[var(--noir-border)] rounded-3xl bg-[var(--noir-bg-elevated)]/10">
              <HelpCircle className="text-[var(--noir-fg-subtle)] mb-4" size={48} />
              <h4 className="text-lg font-semibold text-[var(--noir-fg-muted)]">No Questions Loaded</h4>
              <p className="text-[var(--noir-fg-subtle)] text-sm max-w-xs text-center mt-1">
                Select your target job role above and trigger the AI question generator.
              </p>
            </div>
          )
        ) : (
          questions.map((q, i) => {
            const isExpanded = expandedIndex === i;
            return (
              <motion.div
                key={i}
                variants={staggerItem}
                className="bg-[var(--noir-bg-elevated)] border border-[var(--noir-border)]/80 hover:border-[var(--noir-border)] rounded-2xl overflow-hidden transition-colors"
              >
                {/* Accordion Trigger */}
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : i)}
                  className="w-full text-left p-5 flex justify-between items-start gap-4 cursor-pointer hover:bg-[var(--noir-bg-elevated)]/50"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold uppercase ${getCategoryBadge(
                          q.category
                        )}`}
                      >
                        {getCategoryIcon(q.category)}
                        {q.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-[var(--noir-fg)] text-lg md:text-xl pr-6 leading-snug">
                      {q.question}
                    </h3>
                  </div>

                  <div className="text-[var(--noir-fg-subtle)] mt-1">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                {/* Collapsible Content */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2, ease: easeOut }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-2 border-t border-[var(--noir-border)]/50 bg-[var(--noir-bg)]/40">
                        <div className="rounded-xl bg-[var(--noir-bg)]/60 border border-[var(--noir-border)]/60 p-4 leading-relaxed text-[var(--noir-fg)] text-sm md:text-base">
                          <p className="font-bold text-[var(--noir-accent)] mb-2">Suggested Answer/Hint:</p>
                          <p className="whitespace-pre-line">{q.answer}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </div>
  );
}