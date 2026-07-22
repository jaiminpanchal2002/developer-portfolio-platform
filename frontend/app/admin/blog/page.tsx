"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, ExternalLink } from "lucide-react";
import Swal from "sweetalert2";

import {
  getAdminBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from "@/services/blogService";
import { BlogPost } from "@/types";

const EMPTY_FORM = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  tags: "",
  published: true,
};

type FormState = typeof EMPTY_FORM;

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const data = await getAdminBlogPosts();
      setPosts(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getAdminBlogPosts();
        if (!cancelled) setPosts(data);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setForm({
      title: post.title || "",
      slug: post.slug || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      coverImageUrl: post.coverImageUrl || "",
      tags: post.tags || "",
      published: post.published !== false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      Swal.fire({
        title: "Missing fields",
        text: "Title and content are required.",
        icon: "warning",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }
    setSaving(true);
    try {
      if (editingId !== null) {
        await updateBlogPost(editingId, form);
      } else {
        await createBlogPost(form);
      }
      setModalOpen(false);
      await load();
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Save failed",
        icon: "error",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (post: BlogPost) => {
    const result = await Swal.fire({
      title: "Delete post?",
      text: post.title,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#ef4444",
      background: "#0f172a",
      color: "#ffffff",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteBlogPost(post.id);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Blog</h1>
          <p className="text-gray-400 mt-1">Write and publish posts</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-black"
        >
          <Plus size={18} /> New post
        </button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-cyan-500" />
        </div>
      ) : posts.length === 0 ? (
        <p className="text-sm text-slate-500">No posts yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-800">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-5 text-left">Title</th>
                <th className="p-5 text-left">Slug</th>
                <th className="p-5 text-left">Status</th>
                <th className="p-5 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-t border-slate-800/60">
                  <td className="p-5">
                    <div className="font-semibold">{post.title}</div>
                    {post.readMinutes ? (
                      <div className="text-xs text-slate-400">
                        {post.readMinutes} min read
                      </div>
                    ) : null}
                  </td>
                  <td className="p-5 text-sm text-slate-400">/{post.slug}</td>
                  <td className="p-5">
                    {post.published === false ? (
                      <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-400">
                        Draft
                      </span>
                    ) : (
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                        Published
                      </span>
                    )}
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Preview ${post.title}`}
                        title="Preview"
                      >
                        <ExternalLink size={17} className="text-slate-400" />
                      </a>
                      <button onClick={() => openEdit(post)} aria-label={`Edit ${post.title}`}>
                        <Pencil size={17} className="text-cyan-400" />
                      </button>
                      <button onClick={() => handleDelete(post)} aria-label={`Delete ${post.title}`}>
                        <Trash2 size={17} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-slate-900 p-6">
            <h2 className="mb-6 text-2xl font-bold">
              {editingId !== null ? "Edit" : "New"} Post
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Title *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
              />
              <input
                type="text"
                placeholder="Slug (auto-generated from title if left blank)"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
              />
              <textarea
                placeholder="Excerpt — short summary shown in the list"
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
              />
              <textarea
                placeholder="Content * — blank lines separate paragraphs"
                rows={12}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 font-mono text-sm"
              />
              <input
                type="text"
                placeholder="Cover image URL (optional — from Media library)"
                value={form.coverImageUrl}
                onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
              />
              <input
                type="text"
                placeholder="Tags, comma-separated (e.g. AI, Spring Boot)"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                />
                Published
                <span className="text-xs text-slate-400">
                  (uncheck to save as a draft — previewable by direct link)
                </span>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg bg-gray-600 px-5 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-cyan-500 px-5 py-2 font-semibold text-black disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
