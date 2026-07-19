"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import { getImageUrl } from "../lib/api";
import { useLocale } from "@/lib/localeContext";
import { Profile } from "@/types";
import MagneticButton from "@/components/ui/MagneticButton";

const HeroScene = dynamic(() => import("./hero/HeroScene"), {
  ssr: false,
  loading: () => null,
});

interface HeroProps {
  profile: Profile;
}

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function Hero({ profile }: HeroProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [imageError, setImageError] = useState(false);
  const [sceneEnabled, setSceneEnabled] = useState(false);
  const [sceneActive, setSceneActive] = useState(true);
  const { t } = useLocale();

  const getFallbackAvatar = () => {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect width="100%25" height="100%25" fill="%230a0a0b"/><circle cx="75" cy="75" r="70" fill="none" stroke="%23c9a876" stroke-width="2"/><text x="50%25" y="55%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="44" font-weight="700" fill="%23c9a876">JP</text></svg>`;
  };

  // Only mount the 3D scene on hover-capable / larger viewports and when
  // motion is allowed — mobile and reduced-motion visitors get a static
  // gradient centerpiece instead.
  useEffect(() => {
    if (shouldReduceMotion) return;
    const query = window.matchMedia("(min-width: 768px)");
    setSceneEnabled(query.matches);
    const handler = (e: MediaQueryListEvent) => setSceneEnabled(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, [shouldReduceMotion]);

  // Pause the 3D render loop once the hero scrolls out of view.
  useEffect(() => {
    if (!sectionRef.current || !sceneEnabled) return;
    const observer = new IntersectionObserver(
      ([entry]) => setSceneActive(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [sceneEnabled]);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative min-h-screen flex items-center pt-32 pb-20 md:pt-40 md:pb-24 overflow-hidden"
    >
      {/* Subtle static backdrop glow — present even without the 3D scene */}
      <div
        className="absolute top-1/3 right-0 w-[600px] h-[600px] rounded-full pointer-events-none blur-[160px] opacity-[0.15]"
        style={{ background: "radial-gradient(circle, #c9a876, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 grid lg:grid-cols-12 gap-16 items-center w-full">
        {/* Text column */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeOut }}
          className="lg:col-span-7 flex flex-col"
        >
          {/* Availability badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: easeOut }}
            className="inline-flex items-center gap-2.5 w-fit px-3.5 py-1.5 rounded-full border mb-8"
            style={{ borderColor: "var(--noir-border)", background: "var(--noir-accent-soft)" }}
          >
            <span className="relative flex h-1.5 w-1.5">
              {!shouldReduceMotion && (
                <span
                  className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping"
                  style={{ background: "var(--noir-accent)" }}
                />
              )}
              <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "var(--noir-accent)" }} />
            </span>
            <span className="text-xs font-medium tracking-wide" style={{ color: "var(--noir-fg-muted)" }}>
              {t("hero.available", "Available for select opportunities")}
            </span>
          </motion.div>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: easeOut }}
            className="font-[family-name:var(--font-serif)] italic font-normal text-[clamp(2.75rem,7vw,6rem)] leading-[0.98] tracking-tight"
            style={{ color: "var(--noir-fg)" }}
          >
            {profile.fullName}
          </motion.h1>

          {/* Headline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.7, ease: easeOut }}
            className="font-[family-name:var(--font-sans)] mt-5 text-lg md:text-xl font-medium max-w-xl"
            style={{ color: "var(--noir-accent)" }}
          >
            {profile.headline}
          </motion.p>

          {/* About */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.7, ease: easeOut }}
            className="font-[family-name:var(--font-sans)] mt-6 text-base leading-relaxed max-w-lg"
            style={{ color: "var(--noir-fg-muted)" }}
          >
            {profile.about}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52, duration: 0.7, ease: easeOut }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <MagneticButton
              href="#projects"
              className="font-[family-name:var(--font-sans)] gap-2 px-7 py-3.5 rounded-full font-semibold text-sm cursor-pointer"
              style={{ background: "var(--noir-accent)", color: "#0a0a0b" }}
            >
              {t("hero.cta.view", "View Projects")}
              <ArrowUpRight size={16} />
            </MagneticButton>

            <MagneticButton
              href="#contact"
              className="font-[family-name:var(--font-sans)] px-7 py-3.5 rounded-full font-semibold text-sm border cursor-pointer"
              style={{ borderColor: "var(--noir-border)", color: "var(--noir-fg)" }}
            >
              {t("hero.cta.contact", "Contact Me")}
            </MagneticButton>

            {profile.profileImageUrl && (
              <div className="flex items-center gap-3 ml-2">
                <div className="relative w-11 h-11 rounded-full overflow-hidden border" style={{ borderColor: "var(--noir-border)" }}>
                  <Image
                    src={imageError ? getFallbackAvatar() : getImageUrl(profile.profileImageUrl)}
                    onError={() => setImageError(true)}
                    alt={profile.fullName}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col text-xs">
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl.startsWith("http") ? profile.githubUrl : `https://${profile.githubUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:opacity-70 transition-opacity"
                      style={{ color: "var(--noir-fg-muted)" }}
                    >
                      GitHub
                    </a>
                  )}
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl.startsWith("http") ? profile.linkedinUrl : `https://${profile.linkedinUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:opacity-70 transition-opacity"
                      style={{ color: "var(--noir-fg-muted)" }}
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* 3D centerpiece column */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.9, ease: easeOut }}
          className="lg:col-span-5 relative h-[280px] md:h-[440px] lg:h-[560px]"
        >
          {sceneEnabled ? (
            <HeroScene active={sceneActive} />
          ) : (
            <div
              className="absolute inset-0 rounded-full blur-[80px] opacity-40"
              style={{ background: "radial-gradient(circle, #c9a876, transparent 65%)" }}
            />
          )}
        </motion.div>
      </div>

      {/* Scroll cue */}
      {!shouldReduceMotion && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--noir-fg-subtle)" }}>
            {t("hero.scroll", "Scroll")}
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown size={14} style={{ color: "var(--noir-fg-subtle)" }} />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
