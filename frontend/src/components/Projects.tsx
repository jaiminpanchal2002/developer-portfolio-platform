"use client";

import {
  motion,
  useMotionValue,
  useTransform,
  useScroll,
  useReducedMotion,
} from "framer-motion";
import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, ArrowUpRight } from "lucide-react";
import { useLocale } from "@/lib/localeContext";
import { getImageUrl } from "../lib/api";

import ImageLightbox from "./ImageLightbox";
import { Project } from "@/types";
import SectionHeading from "@/components/ui/SectionHeading";
import MagneticButton from "@/components/ui/MagneticButton";

// Deterministic hue per project so each card owns a consistent colour
// identity across renders without persisting anything — same title in,
// same hue out. Warm-biased range to sit beside the gold noir accent.
function hashHue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return ((h % 360) + 360) % 360;
}

function ProjectCard({
  project,
  index = 0,
  onImageClick,
}: {
  project: Project;
  index?: number;
  onImageClick: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [imgError, setImgError] = useState(false);

  const caseStudyHref = `/projects/${project.id}`;
  const goToCaseStudy = () => router.push(caseStudyHref);

  const hue = hashHue(project.title || String(project.id));
  const cardNumber = String(index + 1).padStart(2, "0");

  // Image-less projects get a distinct procedural gradient + monogram
  // instead of a generic placeholder, so each still reads as its own thing.
  // %23/%25 encoding matches the app's existing data-URI convention.
  const getFallbackBanner = () => {
    const mono = (project.title || "P").trim().charAt(0).toUpperCase();
    const c1 = `hsl(${hue},58%25,24%25)`;
    const c2 = `hsl(${(hue + 42) % 360},48%25,9%25)`;
    return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${c1}'/><stop offset='1' stop-color='${c2}'/></linearGradient></defs><rect width='400' height='200' fill='url(%23g)'/><text x='200' y='150' text-anchor='middle' font-family='sans-serif' font-size='120' font-weight='800' fill='rgba(255,255,255,0.10)'>${mono}</text></svg>`;
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
      onClick={goToCaseStudy}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToCaseStudy();
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`Open case study: ${project.title}`}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="bento-card group relative flex flex-col justify-between h-full min-h-[460px] cursor-pointer shadow-2xl p-6 overflow-hidden"
    >
      {/* Per-project accent glow — blooms in on hover, tinted by the card's
          own hue, sitting a touch behind the content in 3D space. */}
      <div
        aria-hidden
        style={{
          transform: "translateZ(-20px)",
          background: `radial-gradient(120% 80% at 80% 0%, hsl(${hue} 70% 45% / 0.22), transparent 60%)`,
        }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      {/* Floating index — pops forward on the z-axis so the tilt parallaxes
          it against the card face. */}
      <span
        aria-hidden
        style={{ transform: "translateZ(70px)", color: `hsl(${hue} 60% 72%)` }}
        className="pointer-events-none absolute top-5 right-6 font-[family-name:var(--font-serif)] text-3xl md:text-4xl font-normal tabular-nums opacity-40 transition-opacity duration-500 group-hover:opacity-90"
      >
        {cardNumber}
      </span>

      <div
        style={{ transform: "translateZ(45px)", borderColor: "var(--noir-border)" }}
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

      <div style={{ transform: "translateZ(55px)" }} className="relative flex-1 flex flex-col justify-between">
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
                onClick={(e) => e.stopPropagation()}
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
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
                style={{ color: "var(--noir-accent)" }}
              >
                <ArrowUpRight size={14} />
                Live Demo
              </a>
            )}

            <Link
              href={caseStudyHref}
              onClick={(e) => e.stopPropagation()}
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

/**
 * One card in the sticky stack. The card pins near the top of the viewport
 * and scales down a touch as the next card scrolls up over it, so the set
 * collapses into a tidy deck instead of scrolling past as a flat list. Each
 * card's own scroll progress drives its scale, and later cards settle
 * slightly smaller (targetScale) so the depth ordering reads correctly.
 */
function StackCard({
  index,
  total,
  children,
}: {
  index: number;
  total: number;
  children: React.ReactNode;
}) {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "start start"],
  });
  const targetScale = 1 - (total - 1 - index) * 0.045;
  const scale = useTransform(scrollYProgress, [0, 1], [1, targetScale]);

  return (
    <div
      ref={container}
      className="sticky flex justify-center"
      style={{ top: `calc(7rem + ${index * 1.85}rem)`, marginBottom: "2.75rem" }}
    >
      <motion.div style={{ scale }} className="w-full origin-top will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}

export default function Projects({ projects }: { projects: Project[] }) {
  const shouldReduceMotion = useReducedMotion();
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

      {shouldReduceMotion ? (
        // Reduced-motion: no pinning or scaling — a calm two-column grid.
        <div className="grid md:grid-cols-2 gap-8">
          {displayedProjects.map((project, idx) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={idx}
              onImageClick={() => project.imageUrl && handleImageClick(project.imageUrl)}
            />
          ))}
        </div>
      ) : (
        // Sticky-stacking deck — cards pin and shrink as the next slides over.
        <div className="relative mx-auto max-w-4xl">
          {displayedProjects.map((project, idx) => (
            <StackCard key={project.id} index={idx} total={displayedProjects.length}>
              <ProjectCard
                project={project}
                index={idx}
                onImageClick={() => project.imageUrl && handleImageClick(project.imageUrl)}
              />
            </StackCard>
          ))}
        </div>
      )}

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
