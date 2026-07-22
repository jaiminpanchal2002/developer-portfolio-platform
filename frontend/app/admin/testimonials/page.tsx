"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import Swal from "sweetalert2";

import {
  getAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "@/services/testimonialService";
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
      Swal.fire({
        title: "Missing fields",
        text: "Author name and quote are required.",
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
        await updateTestimonial(editingId, form);
      } else {
        await createTestimonial(form);
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

  const handleDelete = async (item: Testimonial) => {
    const result = await Swal.fire({
      title: "Delete testimonial?",
      text: `From ${item.authorName}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#ef4444",
      background: "#0f172a",
      color: "#ffffff",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteTestimonial(item.id);
      setTestimonials((prev) => prev.filter((t) => t.id !== item.id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Testimonials</h1>
          <p className="text-gray-400 mt-1">
            Social proof shown on the public site
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-black"
        >
          <Plus size={18} /> Add
        </button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-cyan-500" />
        </div>
      ) : testimonials.length === 0 ? (
        <p className="text-sm text-slate-500">No testimonials yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-800">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-5 text-left">Author</th>
                <th className="p-5 text-left">Quote</th>
                <th className="p-5 text-left">Order</th>
                <th className="p-5 text-left">Status</th>
                <th className="p-5 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map((item) => (
                <tr key={item.id} className="border-t border-slate-800/60">
                  <td className="p-5">
                    <div className="font-semibold">{item.authorName}</div>
                    {item.authorRole && (
                      <div className="text-xs text-slate-400">{item.authorRole}</div>
                    )}
                  </td>
                  <td className="max-w-md p-5 text-sm text-slate-300">
                    <span className="line-clamp-2">{item.quote}</span>
                  </td>
                  <td className="p-5 text-slate-400">{item.displayOrder ?? "—"}</td>
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
                      <button
                        onClick={() => openEdit(item)}
                        aria-label={`Edit testimonial from ${item.authorName}`}
                      >
                        <Pencil size={18} className="text-cyan-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        aria-label={`Delete testimonial from ${item.authorName}`}
                      >
                        <Trash2 size={18} className="text-red-500" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 p-6">
            <h2 className="mb-6 text-2xl font-bold">
              {editingId !== null ? "Edit" : "Add"} Testimonial
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Author name *"
                value={form.authorName}
                onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
              />
              <input
                type="text"
                placeholder="Role & company, e.g. Engineering Manager, Acme"
                value={form.authorRole}
                onChange={(e) => setForm({ ...form, authorRole: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
              />
              <textarea
                placeholder="Quote *"
                rows={4}
                value={form.quote}
                onChange={(e) => setForm({ ...form, quote: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
              />
              <input
                type="text"
                placeholder="Avatar URL (optional — from Media library)"
                value={form.avatarUrl}
                onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
              />
              <input
                type="text"
                placeholder="Profile link, e.g. LinkedIn (optional)"
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
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
                  (uncheck to keep as a hidden draft)
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
