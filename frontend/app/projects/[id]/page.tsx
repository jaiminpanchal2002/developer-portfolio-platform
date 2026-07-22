import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Code2 } from "lucide-react";

import { getProjectById } from "@/services/projectService";
import { getImageUrl } from "@/lib/api";
import { Project } from "@/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function loadProject(idParam: string): Promise<Project | null> {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) return null;
  return getProjectById(id).catch(() => null);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const project = await loadProject(id);
  if (!project) return { title: "Project not found" };
  return {
    title: `${project.title} — Case Study | Jaimin Panchal`,
    description: project.description?.slice(0, 160),
    openGraph: {
      title: `${project.title} — Case Study`,
      description: project.description?.slice(0, 160),
    },
  };
}

interface NarrativeBlock {
  key: string;
  label: string;
  body: string;
}

export default async function ProjectCaseStudyPage({ params }: PageProps) {
  const { id } = await params;
  const project = await loadProject(id);
  if (!project) notFound();

  const techTags = project.technologies
    ? project.technologies.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const metrics = project.metrics
    ? project.metrics.split("\n").map((m) => m.trim()).filter(Boolean)
    : [];

  const candidates: Array<{ key: string; label: string; body?: string }> = [
    { key: "problem", label: "The Problem", body: project.problemStatement },
    { key: "solution", label: "The Solution", body: project.solution },
    { key: "architecture", label: "Architecture", body: project.architecture },
    { key: "challenges", label: "Challenges", body: project.challenges },
    { key: "learnings", label: "Learnings", body: project.learnings },
  ];
  const narrative: NarrativeBlock[] = candidates.filter(
    (block): block is NarrativeBlock => Boolean(block.body)
  );

  return (
    <main
      className="relative z-10 min-h-screen"
      style={{ background: "var(--noir-bg)" }}
    >
      <div className="max-w-4xl mx-auto px-6 md:px-10 py-16 md:py-24">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: "var(--noir-fg-muted)" }}
        >
          <ArrowLeft size={15} />
          All projects
        </Link>

        {/* Draft preview notice — the public showcase hides drafts, but the
            direct link stays viewable so work-in-progress can be reviewed. */}
        {project.published === false && (
          <div
            className="mt-8 rounded-2xl border px-5 py-3 text-sm font-semibold"
            style={{
              borderColor: "rgba(234,179,8,0.35)",
              background: "rgba(234,179,8,0.08)",
              color: "#eab308",
            }}
          >
            Draft preview — this case study is not listed on the public site yet.
          </div>
        )}

        {/* Header */}
        <header className="mt-10">
          <p
            className="text-xs uppercase tracking-[0.2em] font-semibold"
            style={{ color: "var(--noir-fg-subtle)" }}
          >
            Case Study
          </p>
          <h1
            className="font-[family-name:var(--font-serif)] italic mt-3 text-4xl md:text-6xl leading-[1.02] tracking-tight"
            style={{ color: "var(--noir-fg)" }}
          >
            {project.title}
          </h1>
          <p
            className="mt-6 text-base md:text-lg leading-relaxed max-w-2xl"
            style={{ color: "var(--noir-fg-muted)" }}
          >
            {project.description}
          </p>

          {/* Links + stack */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-transform hover:-translate-y-0.5"
                style={{ background: "var(--noir-accent)", color: "#0a0a0b" }}
              >
                Live Demo
                <ArrowUpRight size={15} />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm border transition-opacity hover:opacity-70"
                style={{ borderColor: "var(--noir-border)", color: "var(--noir-fg)" }}
              >
                <Code2 size={15} />
                Source
              </a>
            )}
          </div>

          {techTags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {techTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full border text-xs font-medium"
                  style={{
                    borderColor: "var(--noir-border)",
                    background: "var(--noir-accent-soft)",
                    color: "var(--noir-fg-muted)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Hero image */}
        {project.imageUrl && (
          <div
            className="relative mt-12 aspect-video w-full overflow-hidden rounded-3xl border"
            style={{ borderColor: "var(--noir-border)" }}
          >
            <Image
              src={getImageUrl(project.imageUrl)}
              alt={project.title}
              fill
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Outcome metrics */}
        {metrics.length > 0 && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric) => (
              <div
                key={metric}
                className="rounded-3xl border p-6 text-center"
                style={{
                  borderColor: "var(--noir-border)",
                  background: "var(--noir-bg-elevated)",
                }}
              >
                <span
                  className="text-sm font-semibold leading-snug"
                  style={{ color: "var(--noir-accent)" }}
                >
                  {metric}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Narrative sections */}
        <div className="mt-16 space-y-14">
          {narrative.map((block, i) => (
            <section key={block.key}>
              <div className="flex items-baseline gap-4">
                <span
                  className="text-xs font-bold tabular-nums"
                  style={{ color: "var(--noir-accent)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2
                  className="font-[family-name:var(--font-serif)] text-2xl md:text-3xl"
                  style={{ color: "var(--noir-fg)" }}
                >
                  {block.label}
                </h2>
              </div>
              <p
                className="mt-4 pl-9 text-base leading-relaxed whitespace-pre-line"
                style={{ color: "var(--noir-fg-muted)" }}
              >
                {block.body}
              </p>
            </section>
          ))}
        </div>

        {narrative.length === 0 && metrics.length === 0 && (
          <p className="mt-16 text-sm" style={{ color: "var(--noir-fg-subtle)" }}>
            Full case study coming soon.
          </p>
        )}
      </div>
    </main>
  );
}
