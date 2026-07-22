import { MetadataRoute } from "next";

import { getBlogPosts } from "@/services/blogService";
import { getProjects } from "@/services/projectService";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://jaiminpanchal.com";

  const [posts, projects] = await Promise.all([
    getBlogPosts().catch(() => []),
    getProjects().catch(() => []),
  ]);

  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];

  if (posts.length > 0) {
    entries.push({
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    });
    for (const post of posts) {
      entries.push({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  for (const project of projects) {
    entries.push({
      url: `${baseUrl}/projects/${project.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
