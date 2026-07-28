"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight, ArrowDown, Download } from "lucide-react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import { getImageUrl } from "../lib/api";
import { useLocale } from "@/lib/localeContext";
import { Profile } from "@/types";
import MagneticButton from "@/components/ui/MagneticButton";
import RotatingRoles from "@/components/ui/RotatingRoles";

interface HeroProps {
  profile: Profile;
}

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function Hero({ profile }: HeroProps) {
  const shouldReduceMotion = useReducedMotion();
  const [imageError, setImageError] = useState(false);
  const { t } = useLocale();

  const getFallbackAvatar = () => {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect width="100%25" height="100%25" fill="%230a0a0b"/><circle cx="75" cy="75" r="70" fill="none" stroke="%23c9a876" stroke-width="2"/><text x="50%25" y="55%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="44" font-weight="700" fill="%23c9a876">JP</text></svg>`;
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-32 pb-20 md:pt-40 md:pb-24 overflow-hidden"
    >
      {/* Ambient backdrop glow — present on every device; the persistent
          3D scene (mounted once in ClientLayout) layers on top of this
          on capable, motion-allowed viewports. */}
      <div
        className="absolute top-1/3 right-0 w-[600px] h-[600px] rounded-full pointer-events-none blur-[160px] opacity-[0.15]"
        style={{ background: "radial-gradient(circle, #c9a876, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeOut }}
          className="max-w-2xl flex flex-col"
        >
          {/* Availability badge */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
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
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: easeOut }}
            className="font-[family-name:var(--font-serif)] italic font-normal text-[clamp(2.75rem,7vw,6rem)] leading-[0.98] tracking-tight"
            style={{ color: "var(--noir-fg)" }}
          >
            {profile.fullName}
          </motion.h1>

          {/* Headline — rotates through roles, starting with the live one */}
          <motion.p
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.7, ease: easeOut }}
            className="font-[family-name:var(--font-sans)] mt-5 text-lg md:text-xl font-medium max-w-xl"
            style={{ color: "var(--noir-accent)" }}
          >
            <RotatingRoles
              roles={[
                profile.headline,
                t("hero.role.fullstack", "Full Stack Engineer"),
                t("hero.role.ai", "AI & LLM Integration Specialist"),
                t("hero.role.backend", "Spring Boot & Cloud Architect"),
              ].filter((r, i, arr) => Boolean(r) && arr.indexOf(r) === i)}
            />
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.7, ease: easeOut }}
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

            {profile.resumeUrl && (
              <a
                href={getImageUrl(profile.resumeUrl)}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="font-[family-name:var(--font-sans)] inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-opacity hover:opacity-70"
                style={{ color: "var(--noir-fg-muted)" }}
              >
                <Download size={15} />
                {t("hero.cta.resume", "Resume")}
              </a>
            )}

          </motion.div>

          {/* Social row — always visible when a URL is set, not gated
              behind the profile photo. Prominent circular icon buttons
              with a hover glow instead of the old buried text links. */}
          {(profile.githubUrl || profile.linkedinUrl || profile.profileImageUrl) && (
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.62, duration: 0.7, ease: easeOut }}
              className="mt-8 flex items-center gap-4"
            >
              {profile.profileImageUrl && (
                <div
                  className="relative w-11 h-11 rounded-full overflow-hidden border shrink-0"
                  style={{ borderColor: "var(--noir-border)" }}
                >
                  <Image
                    src={imageError ? getFallbackAvatar() : getImageUrl(profile.profileImageUrl)}
                    onError={() => setImageError(true)}
                    alt={profile.fullName}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
              )}

              <div className="flex items-center gap-3">
                {profile.githubUrl && (
                  <MagneticButton
                    href={profile.githubUrl.startsWith("http") ? profile.githubUrl : `https://${profile.githubUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub profile"
                    className="group relative w-12 h-12 rounded-full border border-[var(--noir-border)] cursor-pointer overflow-hidden transition-colors duration-200 hover:border-[var(--noir-accent)]/50"
                  >
                    <span
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: "radial-gradient(circle, rgba(201,168,118,0.35), transparent 70%)" }}
                    />
                    <FaGithub
                      size={18}
                      className="relative text-[var(--noir-fg-muted)] transition-colors duration-200 group-hover:text-[var(--noir-accent)]"
                    />
                  </MagneticButton>
                )}

                {profile.linkedinUrl && (
                  <MagneticButton
                    href={profile.linkedinUrl.startsWith("http") ? profile.linkedinUrl : `https://${profile.linkedinUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn profile"
                    className="group relative w-12 h-12 rounded-full border border-[var(--noir-border)] cursor-pointer overflow-hidden transition-colors duration-200 hover:border-[var(--noir-accent)]/50"
                  >
                    <span
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: "radial-gradient(circle, rgba(201,168,118,0.35), transparent 70%)" }}
                    />
                    <FaLinkedinIn
                      size={18}
                      className="relative text-[var(--noir-fg-muted)] transition-colors duration-200 group-hover:text-[var(--noir-accent)]"
                    />
                  </MagneticButton>
                )}
              </div>
            </motion.div>
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
