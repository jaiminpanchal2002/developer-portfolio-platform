"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Globe, ArrowUpRight } from "lucide-react";
import { useLocale } from "@/lib/localeContext";
import { getImageUrl } from "../lib/api";

import ImageLightbox from "./ImageLightbox";
import { Project } from "@/types";
import SectionHeading from "@/components/ui/SectionHeading";
import MagneticButton from "@/components/ui/MagneticButton";

const easeOut = [0.16, 1, 0.3, 1] as const;

function ProjectCard({ project, onImageClick }: { project: Project; onImageClick: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [imgError, setImgError] = useState(false);

  const getFallbackBanner = () => {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="100%" height="100%" fill="%230a0a0b"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%23c9a876">&lt;Code /&gt;</text></svg>`;
  };

  // 3D tilt effects using motion values
  const rotateX = useTransform(y, [-150, 150], [10, -10]);
  const rotateY = useTransform(x, [-150, 150], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const techTags = project.technologies
    ? project.technologies.split(",").map((t) => t.trim())
    : [];

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="bento-card group flex flex-col justify-between h-full min-h-[460px] cursor-pointer shadow-2xl p-6 overflow-hidden"
    >
      <div
        style={{ transform: "translateZ(30px)", borderColor: "var(--noir-border)" }}
        className="relative w-full h-48 rounded-2xl overflow-hidden mb-6 cursor-zoom-in border"
        onClick={(e) => {
          e.stopPropagation();
          onImageClick();
        }}
      >
        {project.imageUrl && !imgError ? (
          <Image
            src={getImageUrl(project.imageUrl)}
            onError={() => setImgError(true)}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <Image
            src={getFallbackBanner()}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-transparent opacity-80" />
      </div>

      <div style={{ transform: "translateZ(40px)" }} className="flex-1 flex flex-col justify-between">
        <div>
          <h3
            className="text-xl md:text-2xl font-semibold transition-colors tracking-tight"
            style={{ color: "var(--noir-fg)" }}
          >
            {project.title}
          </h3>

          <p className="text-sm leading-relaxed mt-3 line-clamp-3" style={{ color: "var(--noir-fg-muted)" }}>
            {project.description}
          </p>
        </div>

        <div>
          {/* Tech Tags */}
          <div className="flex flex-wrap gap-1.5 mt-6 mb-6">
            {techTags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border"
                style={{ background: "rgba(243,241,237,0.04)", borderColor: "var(--noir-border)", color: "var(--noir-fg-muted)" }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Links */}
          <div className="flex gap-5 border-t pt-4" style={{ borderColor: "var(--noir-border)" }}>
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
                style={{ color: "var(--noir-fg-muted)" }}
              >
                <Globe size={14} />
                GitHub
              </a>
            )}

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
                style={{ color: "var(--noir-accent)" }}
              >
                <ArrowUpRight size={14} />
                Live Demo
              </a>
            )}

            <Link
              href={`/projects/${project.id}`}
              className="ml-auto flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
              style={{ color: "var(--noir-fg)" }}
            >
              Case Study
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects({ projects }: { projects: Project[] }) {
  const [showAll, setShowAll] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const { t } = useLocale();

  const displayedProjects = showAll ? projects : projects.slice(0, 4);

  // Filter project images
  const projectImages = projects
    .map((p) => (p.imageUrl ? getImageUrl(p.imageUrl) : null))
    .filter(Boolean) as string[];

  const handleImageClick = (imageUrl: string) => {
    const idx = projectImages.indexOf(getImageUrl(imageUrl));
    if (idx !== -1) {
      setCurrentImgIdx(idx);
      setLightboxOpen(true);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
        <SectionHeading
          kicker={t("projects.kicker", "Selected Work")}
          title={t("projects.title", "Featured Projects")}
        />

        {projects.length > 4 && (
          <MagneticButton
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-3 rounded-full font-semibold text-sm cursor-pointer"
            style={{ background: "var(--noir-accent)", color: "#0a0a0b" }}
          >
            {showAll ? t("projects.showLess", "Show Less") : t("projects.showMore", "View More Projects")}
          </MagneticButton>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {displayedProjects.map((project, idx) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.06, ease: easeOut }}
          >
            <ProjectCard
              project={project}
              onImageClick={() => project.imageUrl && handleImageClick(project.imageUrl)}
            />
          </motion.div>
        ))}
      </div>

      {/* Expanded view image lightbox */}
      <ImageLightbox
        images={projectImages}
        currentIndex={currentImgIdx}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={(idx) => setCurrentImgIdx(idx)}
      />
    </div>
  );
}
