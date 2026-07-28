"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getDashboardStats } from "@/services/dashboardService";
import { staggerContainer, staggerItem } from "@/lib/motion/adminMotion";
import { Profile } from "@/types";
import { getProfile } from "@/services/profileService";
import { getResumeDetails } from "@/services/resumeService";
import {
  CheckCircle,
  AlertCircle,
  FileText,
  User,
  Code2,
  Briefcase,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

interface Stats {
  projects: number;
  skills: number;
  experiences: number;
  educations: number;
  certificates: number;
  applications: number;
  profileScore: number;
  atsScore: number;
}

interface ResumeInfo {
  hasResume?: boolean;
}

export default function ProfileScorePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [resume, setResume] = useState<ResumeInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const statsData = await getDashboardStats();
      const profileData = await getProfile();
      const resumeData = await getResumeDetails();
      
      setStats(statsData);
      setProfile(profileData);
      setResume(resumeData);
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error!",
        text: "Could not retrieve completeness stats.",
        icon: "error",
        background: "var(--noir-bg-elevated)",
        color: "var(--noir-fg)",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await loadData();
    })();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--noir-accent)]"></div>
      </div>
    );
  }

  // Define checklist items based on profile data
  const checklist = [
    {
      id: "bio",
      title: "Complete Basic Info & Summary",
      desc: "Provide full name, headline, location, and bio in Profile Management.",
      checked: profile && profile.fullName && profile.headline && profile.about,
      link: "/admin/profile",
      points: 15,
      icon: User,
    },
    {
      id: "contact",
      title: "Add Contact Details",
      desc: "Fill in your email and phone number.",
      checked: profile && profile.email && profile.phone,
      link: "/admin/profile",
      points: 10,
      icon: User,
    },
    {
      id: "resume",
      title: "Upload Resume PDF",
      desc: "Upload your official resume for job matching and ATS analyzer.",
      checked: resume && resume.hasResume,
      link: "/admin/resume",
      points: 20,
      icon: FileText,
    },
    {
      id: "skills",
      title: "Add Technical Skills (min. 5)",
      desc: "Add frontend, backend, or cloud skills to your portfolio.",
      checked: stats.skills >= 5,
      link: "/admin/skills",
      points: 15,
      icon: Code2,
    },
    {
      id: "projects",
      title: "Showcase Projects (min. 3)",
      desc: "Show details, source codes, and hosting URLs of your applications.",
      checked: stats.projects >= 3,
      link: "/admin/projects",
      points: 15,
      icon: Briefcase,
    },
    {
      id: "experience",
      title: "Provide Experience (min. 2)",
      desc: "List your past positions and software roles.",
      checked: stats.experiences >= 2,
      link: "/admin/experience",
      points: 10,
      icon: Briefcase,
    },
    {
      id: "education",
      title: "List Education & Certifications",
      desc: "Include degree programs or tech certificates.",
      checked: stats.educations > 0 || stats.certificates > 0,
      link: "/admin/education",
      points: 15,
      icon: GraduationCap,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--noir-accent)] to-blue-500 bg-clip-text text-transparent">
          Profile Score
        </h1>
        <p className="text-[var(--noir-fg-muted)] mt-2">
          Calculate portfolio completeness and view recommendations to hit 100%
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Score Gauge Card */}
        <div className="lg:col-span-1 bg-[var(--noir-bg-elevated)] border border-[var(--noir-border)] rounded-3xl p-6 flex flex-col items-center justify-center text-center">
          <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
            <Sparkles className="text-[var(--noir-accent)]" size={20} />
            Completeness
          </h3>

          {/* Radial Progress */}
          <div className="relative w-44 h-44 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="74"
                strokeWidth="12"
                stroke="var(--noir-border-strong)"
                fill="transparent"
              />
              <motion.circle
                cx="88"
                cy="88"
                r="74"
                strokeWidth="12"
                stroke="url(#cyanGradient)"
                strokeDasharray={2 * Math.PI * 74}
                initial={{ strokeDashoffset: 2 * Math.PI * 74 }}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 74 * (1 - stats.profileScore / 100),
                }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
                fill="transparent"
              />
              <defs>
                <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--noir-accent)" />
                  <stop offset="100%" stopColor="var(--noir-accent-dark)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-5xl font-extrabold text-[var(--noir-fg)]">
                {stats.profileScore}%
              </span>
              <span className="text-xs text-[var(--noir-fg-muted)] font-semibold mt-1">
                COMPLETE
              </span>
            </div>
          </div>

          <p className="text-[var(--noir-fg)] leading-relaxed text-sm">
            {stats.profileScore >= 90
              ? "Awesome! Your developer profile is outstanding. It is ready for public recruitment."
              : stats.profileScore >= 70
              ? "Good progress! Complete the remaining checklist items to unlock the full potential of AI recommendations."
              : "Your portfolio is in early stages. Follow the checklist on the right to complete it."}
          </p>
        </div>

        {/* Checklist & Recommendations */}
        <div className="lg:col-span-2 bg-[var(--noir-bg-elevated)] border border-[var(--noir-border)] rounded-3xl p-6 space-y-6">
          <div>
            <h3 className="font-bold text-xl">Completeness Checklist</h3>
            <p className="text-[var(--noir-fg-muted)] text-sm mt-1">
              Add details to increase your score and get accurate job matches
            </p>
          </div>

          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
            {checklist.map((item) => {
              return (
                <motion.div
                  key={item.id}
                  variants={staggerItem}
                  className={`flex items-start justify-between gap-4 p-4 rounded-2xl border transition-colors ${
                    item.checked
                      ? "bg-emerald-500/5 border-emerald-500/10"
                      : "bg-[var(--noir-bg)]/40 border-[var(--noir-border)]/80 hover:border-[var(--noir-border)]"
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    <div className="mt-1">
                      {item.checked ? (
                        <CheckCircle className="text-emerald-500 shrink-0" size={20} />
                      ) : (
                        <AlertCircle className="text-[var(--noir-fg-subtle)] shrink-0" size={20} />
                      )}
                    </div>

                    <div>
                      <h4
                        className={`font-bold text-base ${
                          item.checked ? "text-[var(--noir-fg)] line-through" : "text-[var(--noir-fg)]"
                        }`}
                      >
                        {item.title}
                      </h4>
                      <p className="text-[var(--noir-fg-muted)] text-xs mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-2">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                        item.checked
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-[var(--noir-accent)]/10 text-[var(--noir-accent)]"
                      }`}
                    >
                      +{item.points} pts
                    </span>
                    {!item.checked && (
                      <Link
                        href={item.link}
                        className="text-xs text-[var(--noir-accent)] hover:text-[var(--noir-accent)] font-bold hover:underline flex items-center cursor-pointer"
                      >
                        Action
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}