"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";
import { Code, GraduationCap, Briefcase, Award, MapPin, Mail, Phone, ArrowUpRight } from "lucide-react";
import { useLocale } from "@/lib/localeContext";
import { Profile } from "@/types";
import SectionHeading from "@/components/ui/SectionHeading";

interface AboutProps {
  profile: Profile;
  projectsCount: number;
  experiencesCount: number;
  certificatesCount: number;
  educationsCount: number;
}

const easeOut = [0.16, 1, 0.3, 1] as const;

const STAT_TONES = [
  { fg: "var(--noir-accent)", bg: "var(--noir-accent-soft)", border: "rgba(201,168,118,0.25)" },
  { fg: "var(--noir-fg)", bg: "rgba(243,241,237,0.06)", border: "var(--noir-border)" },
  { fg: "var(--noir-accent)", bg: "var(--noir-accent-soft)", border: "rgba(201,168,118,0.25)" },
  { fg: "var(--noir-fg)", bg: "rgba(243,241,237,0.06)", border: "var(--noir-border)" },
];

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
    { label: t("about.stats.projects", "Projects Built"), value: projectsCount, icon: Code },
    { label: t("about.stats.experience", "Years Experience"), value: experiencesCount || 3, icon: Briefcase },
    { label: t("about.stats.certificates", "Certifications"), value: certificatesCount, icon: Award },
    { label: t("about.stats.education", "Completed Degrees"), value: educationsCount || 1, icon: GraduationCap },
  ];

  return (
    <div>
      <SectionHeading kicker={t("about.kicker", "About")} title={t("about.title", "About Me")} className="mb-12" />

      <div className="grid lg:grid-cols-12 gap-8 items-stretch">
        {/* Bio Bento Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="lg:col-span-7 flex flex-col justify-between bento-card p-8 md:p-10 shadow-2xl"
        >
          <p
            className="font-[family-name:var(--font-sans)] text-base md:text-lg leading-relaxed"
            style={{ color: "var(--noir-fg-muted)" }}
          >
            {profile.about}
          </p>

          {/* Quick Details Table */}
          <div className="flex flex-wrap justify-between gap-6 mt-12 pt-8 border-t text-sm" style={{ borderColor: "var(--noir-border)" }}>
            <div className="flex items-center gap-3 min-w-[150px]">
              <div className="p-2.5 rounded-xl border" style={{ background: "var(--noir-accent-soft)", borderColor: "var(--noir-border)", color: "var(--noir-accent)" }}>
                <MapPin size={16} />
              </div>
              <div>
                <span className="text-xxs uppercase font-bold tracking-wider block" style={{ color: "var(--noir-fg-subtle)" }}>Location</span>
                <span className="font-semibold" style={{ color: "var(--noir-fg)" }}>{profile.location || "Gujarat, India"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 min-w-[200px]">
              <div className="p-2.5 rounded-xl border" style={{ background: "var(--noir-accent-soft)", borderColor: "var(--noir-border)", color: "var(--noir-accent)" }}>
                <Mail size={16} />
              </div>
              <div className="break-all max-w-[220px]">
                <span className="text-xxs uppercase font-bold tracking-wider block" style={{ color: "var(--noir-fg-subtle)" }}>Email</span>
                <span className="font-semibold" style={{ color: "var(--noir-fg)" }}>{profile.email || "jaimin@example.com"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 min-w-[150px]">
              <div className="p-2.5 rounded-xl border" style={{ background: "var(--noir-accent-soft)", borderColor: "var(--noir-border)", color: "var(--noir-accent)" }}>
                <Phone size={16} />
              </div>
              <div>
                <span className="text-xxs uppercase font-bold tracking-wider block" style={{ color: "var(--noir-fg-subtle)" }}>Contact</span>
                <span className="font-semibold" style={{ color: "var(--noir-fg)" }}>{profile.phone || "+91 90000 00000"}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistics Grid & Contact CTA */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-6">
            {stats.map((item, index) => {
              const Icon = item.icon;
              const tone = STAT_TONES[index];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: easeOut }}
                  className="flex flex-col justify-between bento-card p-6 md:p-8"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center border"
                    style={{ background: tone.bg, borderColor: tone.border, color: tone.fg }}
                  >
                    <Icon size={22} />
                  </div>

                  <div className="mt-10">
                    <h3 className="font-[family-name:var(--font-serif)] text-5xl font-normal tracking-tight" style={{ color: "var(--noir-fg)" }}>
                      <Counter value={item.value} />+
                    </h3>
                    <p className="text-xs font-semibold tracking-wide mt-2" style={{ color: "var(--noir-fg-muted)" }}>
                      {item.label}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.a
            href="#contact"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.32, ease: easeOut }}
            className="bento-card flex-1 p-6 md:p-8 flex items-center justify-between gap-4 group"
          >
            <div>
              <p className="font-[family-name:var(--font-serif)] italic text-xl" style={{ color: "var(--noir-fg)" }}>
                {t("about.cta.title", "Let's build something")}
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--noir-fg-muted)" }}>
                {t("about.cta.subtitle", "Open to new roles & collaborations")}
              </p>
            </div>
            <span
              className="shrink-0 w-11 h-11 rounded-full border flex items-center justify-center transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
              style={{ borderColor: "var(--noir-border)", color: "var(--noir-accent)" }}
            >
              <ArrowUpRight size={18} />
            </span>
          </motion.a>
        </div>
      </div>
    </div>
  );
}
