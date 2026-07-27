"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Pencil, Trash2, Plus, XCircle } from "lucide-react";

import {
  getAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  bulkDeleteTestimonials,
  bulkPublishTestimonials,
  bulkUnpublishTestimonials,
} from "@/services/testimonialService";
import AnimatedModal from "@/components/admin/AnimatedModal";
import BulkActionBar from "@/components/admin/BulkActionBar";
import SelectCheckbox from "@/components/admin/SelectCheckbox";
import { useBulkSelection } from "@/lib/hooks/useBulkSelection";
import { confirmBulkAction, confirmDelete, toastError, toastSuccess } from "@/lib/toast";
import { stickyFooterClass, stickyHeaderClass } from "@/components/admin/form/formStyles";
import { staggerContainer, staggerItem } from "@/lib/motion/adminMotion";
import { Testimonial } from "@/types";

const EMPTY_FORM = {
  authorName: "",
  authorRole: "",
  quote: "",
  avatarUrl: "",
  linkUrl: "",
  displayOrder: undefined as number | undefined,
  published: true,
};

type FormState = typeof EMPTY_FORM;

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const selection = useBulkSelection(testimonials);

  const load = async () => {
    try {
      const data = await getAdminTestimonials();
      setTestimonials(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getAdminTestimonials();
        if (!cancelled) setTestimonials(data);
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

  const openEdit = (item: Testimonial) => {
    setEditingId(item.id);
    setForm({
      authorName: item.authorName || "",
      authorRole: item.authorRole || "",
      quote: item.quote || "",
      avatarUrl: item.avatarUrl || "",
      linkUrl: item.linkUrl || "",
      displayOrder: item.displayOrder,
      published: item.published !== false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.authorName.trim() || !form.quote.trim()) {
      toastError("Author name and quote are required");
      return;
    }
    setSaving(true);
    try {
      if (editingId !== null) {
        await updateTestimonial(editingId, form);
        toastSuccess("Testimonial updated successfully");
      } else {
        await createTestimonial(form);
        toastSuccess("Testimonial added successfully");
      }
      setModalOpen(false);
      await load();
    } catch (error) {
      console.error(error);
      toastError("Failed to save testimonial");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: Testimonial) => {
    const confirmed = await confirmDelete(`Testimonial from ${item.authorName}`);
    if (!confirmed) return;

    try {
      await deleteTestimonial(item.id);
      toastSuccess("Testimonial deleted successfully");
      setTestimonials((prev) => prev.filter((t) => t.id !== item.id));
    } catch (error) {
      console.error(error);
      toastError("Failed to delete testimonial");
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
      toastSuccess(`${label} completed for ${ids.length} testimonial${ids.length === 1 ? "" : "s"}`);
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
          <h1 className="text-4xl font-bold">Testimonials</h1>
          <p className="text-[var(--noir-fg-muted)] mt-1">
            Social proof shown on the public site
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--noir-accent)] px-5 py-3 font-semibold text-[var(--noir-bg)]"
        >
          <Plus size={18} /> Add
        </button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[var(--noir-accent)]" />
        </div>
      ) : testimonials.length === 0 ? (
        <p className="text-sm text-[var(--noir-fg-subtle)]">No testimonials yet.</p>
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
                onClick: () => runBulk("Publish", (ids) => bulkPublishTestimonials(ids)),
              },
              {
                label: "Unpublish",
                icon: <XCircle size={16} />,
                onClick: () => runBulk("Unpublish", (ids) => bulkUnpublishTestimonials(ids)),
              },
              {
                label: "Delete",
                icon: <Trash2 size={16} />,
                danger: true,
                onClick: () => runBulk("Delete", (ids) => bulkDeleteTestimonials(ids), true),
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
                    label="Select all testimonials"
                  />
                </th>
                <th className="p-5 text-left">Author</th>
                <th className="p-5 text-left">Quote</th>
                <th className="p-5 text-left">Order</th>
                <th className="p-5 text-left">Status</th>
                <th className="p-5 text-left">Actions</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
              {testimonials.map((item) => (
                <motion.tr
                  key={item.id}
                  variants={staggerItem}
                  className={`border-t border-[var(--noir-border)]/60 transition-colors hover:bg-[var(--noir-bg-surface-2)]/60 ${
                    selection.isSelected(item.id) ? "bg-[var(--noir-accent-soft)]" : ""
                  }`}
                >
                  <td>
                    <SelectCheckbox
                      checked={selection.isSelected(item.id)}
                      onChange={() => selection.toggle(item.id)}
                      label={`Select testimonial from ${item.authorName}`}
                    />
                  </td>
                  <td className="p-5">
                    <div className="font-semibold">{item.authorName}</div>
                    {item.authorRole && (
                      <div className="text-xs text-[var(--noir-fg-muted)]">{item.authorRole}</div>
                    )}
                  </td>
                  <td className="max-w-md p-5 text-sm text-[var(--noir-fg)]">
                    <span className="line-clamp-2">{item.quote}</span>
                  </td>
                  <td className="p-5 text-[var(--noir-fg-muted)]">{item.displayOrder ?? "—"}</td>
                  <td className="p-5">
                    {item.published === false ? (
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
                    <div className="flex gap-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openEdit(item)}
                        aria-label={`Edit testimonial from ${item.authorName}`}
                      >
                        <Pencil size={18} className="text-[var(--noir-accent)]" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(item)}
                        aria-label={`Delete testimonial from ${item.authorName}`}
                      >
                        <Trash2 size={18} className="text-red-500" />
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
        className="max-w-lg"
      >
        <h2 className={stickyHeaderClass}>
          {editingId !== null ? "Edit" : "Add"} Testimonial
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Author name *"
                value={form.authorName}
                onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                className="w-full rounded-lg border border-[var(--noir-border-strong)] bg-[var(--noir-bg-surface-2)] p-3"
              />
              <input
                type="text"
                placeholder="Role & company, e.g. Engineering Manager, Acme"
                value={form.authorRole}
                onChange={(e) => setForm({ ...form, authorRole: e.target.value })}
                className="w-full rounded-lg border border-[var(--noir-border-strong)] bg-[var(--noir-bg-surface-2)] p-3"
              />
              <textarea
                placeholder="Quote *"
                rows={4}
                value={form.quote}
                onChange={(e) => setForm({ ...form, quote: e.target.value })}
                className="w-full rounded-lg border border-[var(--noir-border-strong)] bg-[var(--noir-bg-surface-2)] p-3"
              />
              <input
                type="text"
                placeholder="Avatar URL (optional — from Media library)"
                value={form.avatarUrl}
                onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                className="w-full rounded-lg border border-[var(--noir-border-strong)] bg-[var(--noir-bg-surface-2)] p-3"
              />
              <input
                type="text"
                placeholder="Profile link, e.g. LinkedIn (optional)"
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                className="w-full rounded-lg border border-[var(--noir-border-strong)] bg-[var(--noir-bg-surface-2)] p-3"
              />
              <input
                type="number"
                placeholder="Display order (lower shows first)"
                value={form.displayOrder ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    displayOrder:
                      e.target.value === "" ? undefined : Number(e.target.value),
                  })
                }
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
                  (uncheck to keep as a hidden draft)
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
