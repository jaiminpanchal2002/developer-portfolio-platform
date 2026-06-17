"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useState, useRef } from "react";
import { Code } from "lucide-react";
import { useLocale } from "@/lib/localeContext";
import { getImageUrl } from "../lib/api";

import ImageLightbox from "./ImageLightbox";

interface Project {
  id: number;
  title: string;
  description: string;
  githubUrl: string;
  liveUrl: string;
  imageUrl?: string;
  technologies?: string;
  featured?: boolean;
}

function ProjectCard({ project, onImageClick }: { project: Project; onImageClick: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [imgError, setImgError] = useState(false);

  const getFallbackBanner = () => {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="100%" height="100%" fill="%230a0a0a"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%2306b6d4">&lt;Code /&gt;</text></svg>`;
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
        style={{ transform: "translateZ(30px)" }} 
        className="relative w-full h-48 rounded-2xl overflow-hidden mb-6 bg-slate-900 border border-white/5 cursor-zoom-in"
        onClick={(e) => {
          e.stopPropagation();
          onImageClick();
        }}
      >
        {project.imageUrl && !imgError ? (
          <img
            src={getImageUrl(project.imageUrl)}
            onError={() => setImgError(true)}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <img
            src={getFallbackBanner()}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent opacity-80" />
      </div>

      <div style={{ transform: "translateZ(40px)" }} className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-cyan-400 transition-colors tracking-tight">
            {project.title}
          </h3>

          <p className="text-slate-400 text-sm leading-relaxed mt-3 line-clamp-3">
            {project.description}
          </p>
        </div>

        <div>
          {/* Tech Tags */}
          <div className="flex flex-wrap gap-1.5 mt-6 mb-6">
            {techTags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Links */}
          <div className="flex gap-4 border-t border-white/5 pt-4">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-cyan-400 transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
                GitHub
              </a>
            )}

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-cyan-400 transition-colors"
              >
                <svg className="w-3.5 h-3.5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                Live Demo
              </a>
            )}
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
    <section id="projects" className="max-w-7xl mx-auto px-6 py-32">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent tracking-tight">
            {t("projects.title", "Featured Projects")}
          </h2>
          <p className="text-slate-400 mt-4 max-w-lg text-sm font-semibold">
            Explore a selection of systems and applications engineered using advanced Spring Boot, AI, and SaaS patterns
          </p>
        </div>

        {projects.length > 4 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-cyan-500/20"
          >
            {showAll ? "Show Less" : "View More Projects"}
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {displayedProjects.map((project, idx) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
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
    </section>
  );
}
