"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Pencil, Trash2, Plus, ExternalLink, XCircle } from "lucide-react";

import {
  getAdminBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  bulkDeleteBlogPosts,
  bulkPublishBlogPosts,
  bulkUnpublishBlogPosts,
} from "@/services/blogService";
import AnimatedModal from "@/components/admin/AnimatedModal";
import BulkActionBar from "@/components/admin/BulkActionBar";
import SelectCheckbox from "@/components/admin/SelectCheckbox";
import ImageDropzone from "@/components/admin/form/ImageDropzone";
import { useBulkSelection } from "@/lib/hooks/useBulkSelection";
import { uploadImage } from "@/services/uploadService";
import { confirmBulkAction, confirmDelete, toastError, toastSuccess } from "@/lib/toast";
import { stickyFooterClass, stickyHeaderClass } from "@/components/admin/form/formStyles";
import { staggerContainer, staggerItem } from "@/lib/motion/adminMotion";
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
  const [bulkBusy, setBulkBusy] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const selection = useBulkSelection(posts);

  const handleCoverUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toastError("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toastError("Image must be smaller than 5MB");
      return;
    }
    setCoverUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, coverImageUrl: url }));
    } catch (error) {
      console.error(error);
      toastError("Image upload failed");
    } finally {
      setCoverUploading(false);
    }
  };

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
      toastError("Title and content are required");
      return;
    }
    setSaving(true);
    try {
      if (editingId !== null) {
        await updateBlogPost(editingId, form);
        toastSuccess("Post updated successfully");
      } else {
        await createBlogPost(form);
        toastSuccess("Post published successfully");
      }
      setModalOpen(false);
      await load();
    } catch (error) {
      console.error(error);
      toastError("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (post: BlogPost) => {
    const confirmed = await confirmDelete(post.title);
    if (!confirmed) return;

    try {
      await deleteBlogPost(post.id);
      toastSuccess("Post deleted successfully");
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch (error) {
      console.error(error);
      toastError("Failed to delete post");
    }
  };

  const runBulk = async (
    label: string,
    action: (ids: number[]) => Promise<unknown>,
    danger = false
  ) => {
    const ids = selection.selectedIdsArray as number[];
    const confirmed = await confirmBulkAction(label, ids.length, danger);
    if (!confirmed) return;

    setBulkBusy(true);
    try {
      await action(ids);
      toastSuccess(`${label} completed for ${ids.length} post${ids.length === 1 ? "" : "s"}`);
      selection.clear();
      await load();
    } catch (error) {
      console.error(error);
      toastError(`Bulk ${label.toLowerCase()} failed`);
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Blog</h1>
          <p className="text-[var(--noir-fg-muted)] mt-1">Write and publish posts</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--noir-accent)] px-5 py-3 font-semibold text-[var(--noir-bg)]"
        >
          <Plus size={18} /> New post
        </button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[var(--noir-accent)]" />
        </div>
      ) : posts.length === 0 ? (
        <p className="text-sm text-[var(--noir-fg-subtle)]">No posts yet.</p>
      ) : (
        <div>
          <BulkActionBar
            count={selection.count}
            onClear={selection.clear}
            busy={bulkBusy}
            actions={[
              {
                label: "Publish",
                icon: <CheckCircle2 size={16} />,
                onClick: () => runBulk("Publish", (ids) => bulkPublishBlogPosts(ids)),
              },
              {
                label: "Unpublish",
                icon: <XCircle size={16} />,
                onClick: () => runBulk("Unpublish", (ids) => bulkUnpublishBlogPosts(ids)),
              },
              {
                label: "Delete",
                icon: <Trash2 size={16} />,
                danger: true,
                onClick: () => runBulk("Delete", (ids) => bulkDeleteBlogPosts(ids), true),
              },
            ]}
          />
        <div className="overflow-x-auto rounded-3xl border border-[var(--noir-border)]">
          <table className="w-full">
            <thead>
              <tr>
                <th className="w-10">
                  <SelectCheckbox
                    checked={selection.allSelected}
                    indeterminate={selection.someSelected}
                    onChange={selection.toggleAll}
                    label="Select all posts"
                  />
                </th>
                <th className="p-5 text-left">Title</th>
                <th className="p-5 text-left">Slug</th>
                <th className="p-5 text-left">Status</th>
                <th className="p-5 text-left">Actions</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
              {posts.map((post) => (
                <motion.tr
                  key={post.id}
                  variants={staggerItem}
                  className={`border-t border-[var(--noir-border)]/60 transition-colors hover:bg-[var(--noir-bg-surface-2)]/60 ${
                    selection.isSelected(post.id) ? "bg-[var(--noir-accent-soft)]" : ""
                  }`}
                >
                  <td>
                    <SelectCheckbox
                      checked={selection.isSelected(post.id)}
                      onChange={() => selection.toggle(post.id)}
                      label={`Select ${post.title}`}
                    />
                  </td>
                  <td className="p-5">
                    <div className="font-semibold">{post.title}</div>
                    {post.readMinutes ? (
                      <div className="text-xs text-[var(--noir-fg-muted)]">
                        {post.readMinutes} min read
                      </div>
                    ) : null}
                  </td>
                  <td className="p-5 text-sm text-[var(--noir-fg-muted)]">/{post.slug}</td>
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
                        <ExternalLink size={17} className="text-[var(--noir-fg-muted)]" />
                      </a>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openEdit(post)}
                        aria-label={`Edit ${post.title}`}
                      >
                        <Pencil size={17} className="text-[var(--noir-accent)]" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(post)}
                        aria-label={`Delete ${post.title}`}
                      >
                        <Trash2 size={17} className="text-red-500" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
        </div>
      )}

      <AnimatedModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        align="top"
        className="my-8 max-w-2xl"
      >
        <h2 className={stickyHeaderClass}>
          {editingId !== null ? "Edit" : "New"} Post
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Title *"
                aria-label="Post title (required)"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-[var(--noir-border-strong)] bg-[var(--noir-bg-surface-2)] p-3"
              />
              <input
                type="text"
                placeholder="Slug (auto-generated from title if left blank)"
                aria-label="URL slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full rounded-lg border border-[var(--noir-border-strong)] bg-[var(--noir-bg-surface-2)] p-3"
              />
              <textarea
                placeholder="Excerpt — short summary shown in the list"
                aria-label="Excerpt"
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                className="w-full rounded-lg border border-[var(--noir-border-strong)] bg-[var(--noir-bg-surface-2)] p-3"
              />
              <textarea
                placeholder="Content * — blank lines separate paragraphs"
                aria-label="Post content (required)"
                rows={12}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full rounded-lg border border-[var(--noir-border-strong)] bg-[var(--noir-bg-surface-2)] p-3 font-mono text-sm"
              />
              <ImageDropzone
                label="Cover Image"
                previewUrl={form.coverImageUrl || null}
                uploading={coverUploading}
                onFileSelected={handleCoverUpload}
                onClear={() => setForm((prev) => ({ ...prev, coverImageUrl: "" }))}
                hint="Drag & drop, or paste a URL below (e.g. from the Media library)"
              />
              <input
                type="text"
                placeholder="Cover image URL (optional)"
                aria-label="Cover image URL"
                value={form.coverImageUrl}
                onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
                className="w-full rounded-lg border border-[var(--noir-border-strong)] bg-[var(--noir-bg-surface-2)] p-3 text-sm"
              />
              <input
                type="text"
                placeholder="Tags, comma-separated (e.g. AI, Spring Boot)"
                aria-label="Tags, comma-separated"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full rounded-lg border border-[var(--noir-border-strong)] bg-[var(--noir-bg-surface-2)] p-3"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                />
                Published
                <span className="text-xs text-[var(--noir-fg-muted)]">
                  (uncheck to save as a draft — previewable by direct link)
                </span>
              </label>

              <div className={stickyFooterClass}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg bg-[var(--noir-bg-surface-3)] px-5 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[var(--noir-accent)] px-5 py-2 font-semibold text-[var(--noir-bg)] disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
      </AnimatedModal>
    </div>
  );
}
