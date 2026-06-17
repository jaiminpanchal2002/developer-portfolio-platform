"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";
import {
  Code,
  GraduationCap,
  Briefcase,
  Award,
  Terminal,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import { useLocale } from "@/lib/localeContext";

import DeveloperTerminal from "./DeveloperTerminal";

interface AboutProps {
  profile: {
    fullName: string;
    headline: string;
    about: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  projectsCount: number;
  experiencesCount: number;
  certificatesCount: number;
  educationsCount: number;
}

function Counter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const end = value;
      if (end <= 0) return;

      const totalMiliseconds = duration * 1000;
      const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 20);

      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start >= end) {
          clearInterval(timer);
        }
      }, incrementTime);

      return () => clearInterval(timer);
    }
  }, [inView, value, duration]);

  return <span ref={ref}>{count}</span>;
}

export default function About({
  profile,
  projectsCount,
  experiencesCount,
  certificatesCount,
  educationsCount,
}: AboutProps) {
  const { t } = useLocale();

  const stats = [
    { label: t("about.stats.projects", "Projects Built"), value: projectsCount, icon: Code, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
    { label: t("about.stats.experience", "Years Experience"), value: experiencesCount || 3, icon: Briefcase, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
    { label: t("about.stats.certificates", "Certifications"), value: certificatesCount, icon: Award, color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
    { label: t("about.stats.education", "Completed Degrees"), value: educationsCount || 1, icon: GraduationCap, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  ];

  return (
    <section id="about" className="max-w-7xl mx-auto px-6 py-32">
      <div className="grid lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Bio Bento Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 flex flex-col justify-between bento-card p-8 md:p-10 shadow-2xl"
        >
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
              <Terminal size={28} className="text-cyan-400" />
              {t("about.title", "About Me")}
            </h2>
            
            <p className="text-base md:text-lg leading-relaxed text-slate-300">
              {profile.about}
            </p>
          </div>

          {/* Quick Details Table */}
          <div className="grid sm:grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/5 text-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-cyan-400">
                <MapPin size={16} />
              </div>
              <div>
                <span className="text-slate-500 text-xxs uppercase font-bold tracking-wider block">Location</span>
                <span className="text-slate-200 font-semibold">{profile.location || "Gujarat, India"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-purple-400">
                <Mail size={16} />
              </div>
              <div>
                <span className="text-slate-500 text-xxs uppercase font-bold tracking-wider block">Email</span>
                <span className="text-slate-200 font-semibold">{profile.email || "jaimin@example.com"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-pink-400">
                <Phone size={16} />
              </div>
              <div>
                <span className="text-slate-500 text-xxs uppercase font-bold tracking-wider block">Contact</span>
                <span className="text-slate-200 font-semibold">{profile.phone || "+91 90000 00000"}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistics Grid & Terminal Bento Cells */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-6">
            {stats.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col justify-between bento-card p-6 md:p-8"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${item.color}`}>
                    <Icon size={22} />
                  </div>
                  
                  <div className="mt-10">
                    <h3 className="text-5xl font-black text-white tracking-tight">
                      <Counter value={item.value} />+
                    </h3>
                    <p className="text-slate-400 text-xs font-semibold tracking-wide mt-2">
                      {item.label}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <DeveloperTerminal />
          </motion.div>
        </div>

      </div>
    </section>
  );
}