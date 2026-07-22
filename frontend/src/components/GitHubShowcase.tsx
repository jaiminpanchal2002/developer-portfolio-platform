"use client";

import { motion } from "framer-motion";
import { Star, GitFork, ArrowUpRight, BookMarked, Users } from "lucide-react";
import { useLocale } from "@/lib/localeContext";
import { GitHubShowcaseData } from "@/services/githubService";
import SectionHeading from "@/components/ui/SectionHeading";

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function GitHubShowcase({ data }: { data: GitHubShowcaseData }) {
  const { t } = useLocale();

  const totalLangRepos = data.languages.reduce((sum, [, count]) => sum + count, 0);

  const stats = [
    { label: t("github.repos", "Public Repos"), value: data.publicRepos, icon: BookMarked },
    { label: t("github.stars", "Stars Earned"), value: data.totalStars, icon: Star },
    { label: t("github.forks", "Forks"), value: data.totalForks, icon: GitFork },
    { label: t("github.followers", "Followers"), value: data.followers, icon: Users },
  ];

  return (
    <div>
      <SectionHeading
        kicker={t("github.kicker", "Open Source")}
        title={t("github.title", "Live from GitHub")}
        align="center"
        className="mb-12 mx-auto max-w-xl"
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.07, ease: easeOut }}
            className="bento-card p-5 flex flex-col items-center text-center"
          >
            <stat.icon size={18} style={{ color: "var(--noir-accent)" }} />
            <span
              className="mt-2 text-3xl font-bold tabular-nums"
              style={{ color: "var(--noir-fg)" }}
            >
              {stat.value}
            </span>
            <span className="mt-1 text-xs font-medium" style={{ color: "var(--noir-fg-subtle)" }}>
              {stat.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Language distribution — proportional bar, not a heatmap */}
      {totalLangRepos > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="mb-10"
        >
          <div
            className="flex h-2.5 w-full overflow-hidden rounded-full border"
            style={{ borderColor: "var(--noir-border)" }}
            role="img"
            aria-label={`Language distribution: ${data.languages
              .map(([lang, count]) => `${lang} ${count} repos`)
              .join(", ")}`}
          >
            {data.languages.map(([lang, count], i) => (
              <div
                key={lang}
                style={{
                  width: `${(count / totalLangRepos) * 100}%`,
                  background: "var(--noir-accent)",
                  opacity: 1 - i * 0.14,
                }}
                title={`${lang}: ${count}`}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
            {data.languages.map(([lang, count], i) => (
              <span
                key={lang}
                className="inline-flex items-center gap-1.5 text-xs font-medium"
                style={{ color: "var(--noir-fg-muted)" }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: "var(--noir-accent)", opacity: 1 - i * 0.14 }}
                />
                {lang}
                <span style={{ color: "var(--noir-fg-subtle)" }}>({count})</span>
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Top repositories */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {data.topRepos.map((repo, i) => (
          <motion.a
            key={repo.name}
            href={repo.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: easeOut }}
            className="bento-card group p-6 flex flex-col justify-between min-h-[150px]"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <h3
                  className="font-semibold text-base break-all"
                  style={{ color: "var(--noir-fg)" }}
                >
                  {repo.name}
                </h3>
                <ArrowUpRight
                  size={16}
                  className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  style={{ color: "var(--noir-accent)" }}
                />
              </div>
              {repo.description && (
                <p
                  className="mt-2 text-sm leading-relaxed line-clamp-2"
                  style={{ color: "var(--noir-fg-muted)" }}
                >
                  {repo.description}
                </p>
              )}
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs font-medium" style={{ color: "var(--noir-fg-subtle)" }}>
              {repo.language && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: "var(--noir-accent)" }} />
                  {repo.language}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Star size={12} /> {repo.stars}
              </span>
              <span className="inline-flex items-center gap-1">
                <GitFork size={12} /> {repo.forks}
              </span>
            </div>
          </motion.a>
        ))}
      </div>

      <div className="mt-8 text-center">
        <a
          href={data.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: "var(--noir-accent)" }}
        >
          {t("github.viewAll", `See all work @${data.username}`)}
          <ArrowUpRight size={15} />
        </a>
      </div>
    </div>
  );
}
