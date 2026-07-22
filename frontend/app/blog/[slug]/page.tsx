import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";

import { getBlogPostBySlug } from "@/services/blogService";
import { getImageUrl } from "@/lib/api";
import { BlogPost } from "@/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function loadPost(slug: string): Promise<BlogPost | null> {
  if (!slug) return null;
  return getBlogPostBySlug(slug).catch(() => null);
}

function formatDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: `${post.title} | Jaimin Panchal`,
    description: post.excerpt?.slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt?.slice(0, 160),
      type: "article",
      images: post.coverImageUrl ? [getImageUrl(post.coverImageUrl)] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) notFound();

  const tags = post.tags
    ? post.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <main className="relative z-10 min-h-screen" style={{ background: "var(--noir-bg)" }}>
      <article className="max-w-3xl mx-auto px-6 md:px-10 py-16 md:py-24">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: "var(--noir-fg-muted)" }}
        >
          <ArrowLeft size={15} />
          All posts
        </Link>

        {post.published === false && (
          <div
            className="mt-8 rounded-2xl border px-5 py-3 text-sm font-semibold"
            style={{
              borderColor: "rgba(234,179,8,0.35)",
              background: "rgba(234,179,8,0.08)",
              color: "#eab308",
            }}
          >
            Draft preview — this post is not listed publicly yet.
          </div>
        )}

        <header className="mt-10">
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
          <h1
            className="font-[family-name:var(--font-serif)] italic mt-4 text-4xl md:text-5xl leading-[1.05] tracking-tight"
            style={{ color: "var(--noir-fg)" }}
          >
            {post.title}
          </h1>
          {post.excerpt && (
            <p
              className="mt-5 text-lg leading-relaxed"
              style={{ color: "var(--noir-fg-muted)" }}
            >
              {post.excerpt}
            </p>
          )}
          {tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border px-3 py-1 text-xs font-medium"
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

        {post.coverImageUrl && (
          <div
            className="relative mt-10 aspect-video w-full overflow-hidden rounded-3xl border"
            style={{ borderColor: "var(--noir-border)" }}
          >
            <Image
              src={getImageUrl(post.coverImageUrl)}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {post.content && (
          <div
            className="mt-12 text-base leading-[1.8] whitespace-pre-line"
            style={{ color: "var(--noir-fg-muted)" }}
          >
            {post.content}
          </div>
        )}
      </article>
    </main>
  );
}
