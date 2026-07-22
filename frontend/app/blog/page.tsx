import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Clock } from "lucide-react";

import { getBlogPosts } from "@/services/blogService";
import { getImageUrl } from "@/lib/api";
import { BlogPost } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Writing | Jaimin Panchal",
  description:
    "Notes on engineering, AI, and building production software — by Jaimin Panchal.",
};

function formatDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function BlogIndexPage() {
  const posts: BlogPost[] = await getBlogPosts().catch(() => []);

  return (
    <main className="relative z-10 min-h-screen" style={{ background: "var(--noir-bg)" }}>
      <div className="max-w-4xl mx-auto px-6 md:px-10 py-16 md:py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: "var(--noir-fg-muted)" }}
        >
          <ArrowLeft size={15} />
          Home
        </Link>

        <header className="mt-10">
          <p
            className="text-xs uppercase tracking-[0.2em] font-semibold"
            style={{ color: "var(--noir-accent)" }}
          >
            Writing
          </p>
          <h1
            className="font-[family-name:var(--font-serif)] italic mt-3 text-4xl md:text-6xl leading-[1.02] tracking-tight"
            style={{ color: "var(--noir-fg)" }}
          >
            Notes & essays
          </h1>
          <p
            className="mt-5 text-base md:text-lg leading-relaxed max-w-2xl"
            style={{ color: "var(--noir-fg-muted)" }}
          >
            Thoughts on engineering, AI, and shipping production software.
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="mt-16 text-sm" style={{ color: "var(--noir-fg-subtle)" }}>
            No posts published yet — check back soon.
          </p>
        ) : (
          <div className="mt-14 space-y-6">
            {posts.map((post) => {
              const tags = post.tags
                ? post.tags.split(",").map((t) => t.trim()).filter(Boolean)
                : [];
              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="bento-card group flex flex-col gap-5 p-6 sm:flex-row sm:items-center"
                >
                  {post.coverImageUrl && (
                    <div
                      className="relative aspect-video w-full shrink-0 overflow-hidden rounded-2xl border sm:w-56"
                      style={{ borderColor: "var(--noir-border)" }}
                    >
                      <Image
                        src={getImageUrl(post.coverImageUrl)}
                        alt={post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 224px"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div
                      className="flex items-center gap-3 text-xs"
                      style={{ color: "var(--noir-fg-subtle)" }}
                    >
                      <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                      {post.readMinutes ? (
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} /> {post.readMinutes} min read
                        </span>
                      ) : null}
                    </div>
                    <h2
                      className="mt-2 text-xl font-semibold tracking-tight"
                      style={{ color: "var(--noir-fg)" }}
                    >
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p
                        className="mt-2 line-clamp-2 text-sm leading-relaxed"
                        style={{ color: "var(--noir-fg-muted)" }}
                      >
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
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
                      <ArrowUpRight
                        size={16}
                        className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        style={{ color: "var(--noir-accent)" }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
