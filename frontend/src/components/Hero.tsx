"use client";

import { motion } from "framer-motion";
import { getImageUrl } from "../lib/api";

interface HeroProps {
  profile: {
    fullName: string;
    headline: string;
    about: string;
    profileImageUrl?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    resumeUrl?: string;
  };
}

export default function Hero({ profile }: HeroProps) {
  return (
    <section
      id="home"
      className="
      relative
      flex
      items-center
      justify-center
      min-h-[85vh]
      md:min-h-screen
      text-white
      overflow-hidden
      "
    >
      {/* Background Decorative Rings */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Retro scanline overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none opacity-40 z-20" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="
        relative
        z-10
        max-w-5xl
        mx-auto
        text-center
        flex
        flex-col
        items-center
        "
      >
        <img
          src={getImageUrl(profile.profileImageUrl) || "/profile.jpg"}
          alt={profile.fullName}
          className="
          w-40
          h-40
          md:w-52
          md:h-52
          rounded-full
          object-cover
          border-4
          border-cyan-500
          shadow-2xl
          shadow-cyan-500/30
          mb-8
          "
        />

        <h1
          className="
          text-5xl
          md:text-7xl
          lg:text-8xl
          font-extrabold
          mb-4
          bg-gradient-to-r
          from-cyan-400
          via-blue-400
          to-purple-500
          bg-clip-text
          text-transparent
          "
        >
          {profile.fullName}
        </h1>

        <h2
          className="
          text-2xl
          md:text-4xl
          font-semibold
          text-cyan-300
          mb-6
          "
        >
          {profile.headline}
        </h2>

        <p
          className="
          text-gray-300
          text-base
          md:text-xl
          max-w-3xl
          leading-relaxed
          mb-10
          "
        >
          {profile.about}
        </p>

        <div
          className="
          flex
          flex-col
          sm:flex-row
          gap-5
          justify-center
          items-center
          "
        >
          <a
            href="#projects"
            className="
            px-8
            py-4
            rounded-2xl
            bg-cyan-500
            text-black
            font-bold
            hover:scale-105
            transition-all
            "
          >
            View Projects
          </a>

          <a
            href="#contact"
            className="
            px-8
            py-4
            rounded-2xl
            border
            border-cyan-400
            text-cyan-300
            hover:bg-cyan-500
            hover:text-black
            transition-all
            "
          >
            Contact Me
          </a>
        </div>

        {/* Social Links */}

        <div className="mt-10 flex flex-wrap justify-center gap-6">
          {profile.githubUrl && (
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              GitHub
            </a>
          )}

          {profile.linkedinUrl && (
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              LinkedIn
            </a>
          )}

          {profile.resumeUrl && (
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Resume
            </a>
          )}
        </div>
      </motion.div>
    </section>
  );
}