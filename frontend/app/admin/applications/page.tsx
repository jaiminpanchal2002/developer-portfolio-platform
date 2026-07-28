"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from "@/services/jobApplicationService";
import {
  Plus,
  Calendar,
  FileText,
  Trash2,
  Edit2,
  ExternalLink,
} from "lucide-react";
import AnimatedModal from "@/components/admin/AnimatedModal";
import { confirmDelete, toastError, toastSuccess } from "@/lib/toast";
import { stickyFooterClass, stickyHeaderClass } from "@/components/admin/form/formStyles";
import { staggerContainer, staggerItem } from "@/lib/motion/adminMotion";

interface JobApplication {
  id?: number;
  jobTitle: string;
  company: string;
  status: string;
  appliedDate: string;
  jobUrl?: string;
  interviewDate?: string;
  notes?: string;
}

const STATUSES = ["Applied", "Interview", "Rejected", "Offer", "Accepted"];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentApp, setCurrentApp] = useState<JobApplication | null>(null);

  const [formData, setFormData] = useState<JobApplication>({
    jobTitle: "",
    company: "",
    status: "Applied",
    appliedDate: new Date().toISOString().split("T")[0],
    jobUrl: "",
    interviewDate: "",
    notes: "",
  });

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await getApplications();
      setApplications(data);
    } catch (error) {
      console.error(error);
      toastError("Failed to load applications. Please verify backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await loadApplications();
    })();
  }, []);

  const handleOpenAdd = () => {
    setCurrentApp(null);
    setFormData({
      jobTitle: "",
      company: "",
      status: "Applied",
      appliedDate: new Date().toISOString().split("T")[0],
      jobUrl: "",
      interviewDate: "",
      notes: "",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (app: JobApplication) => {
    setCurrentApp(app);
    setFormData({
      jobTitle: app.jobTitle,
      company: app.company,
      status: app.status,
      appliedDate: app.appliedDate || "",
      jobUrl: app.jobUrl || "",
      interviewDate: app.interviewDate || "",
      notes: app.notes || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.jobTitle || !formData.company) {
      toastError("Job Title and Company are required");
      return;
    }

    try {
      if (currentApp?.id) {
        await updateApplication(currentApp.id, formData);
        toastSuccess("Application updated successfully");
      } else {
        await createApplication(formData);
        toastSuccess("Application tracked successfully");
      }
      setModalOpen(false);
      loadApplications();
    } catch (error) {
      console.error(error);
      toastError("Failed to save application");
    }
  };

  const handleDelete = async (app: JobApplication) => {
    const confirmed = await confirmDelete(`${app.jobTitle} at ${app.company}`);
    if (!confirmed) return;

    try {
      await deleteApplication(app.id!);
      toastSuccess("Application deleted successfully");
      loadApplications();
    } catch (error) {
      console.error(error);
      toastError("Failed to delete application");
    }
  };

  // Group applications by status
  const groupedApps = STATUSES.reduce((acc, status) => {
    acc[status] = applications.filter((app) => app.status === status);
    return acc;
  }, {} as Record<string, JobApplication[]>);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--noir-accent)] to-blue-500 bg-clip-text text-transparent">
            Applications Tracker
          </h1>
          <p className="text-[var(--noir-fg-muted)] mt-2">
            Organize and follow your job search process
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[var(--noir-accent)] text-[var(--noir-bg)] font-bold hover:scale-105 transition-transform shadow-lg shadow-[var(--noir-accent)]/20 cursor-pointer"
        >
          <Plus size={20} />
          Add Application
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--noir-accent)]"></div>
        </div>
      ) : (
        /* Kanban Board */
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-6 lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 grid-cols-1"
        >
          {STATUSES.map((status) => {
            const list = groupedApps[status] || [];
            return (
              <motion.div
                key={status}
                variants={staggerItem}
                className="flex flex-col rounded-3xl bg-[var(--noir-bg-elevated)]/50 border border-[var(--noir-border)]/80 p-4 min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-[var(--noir-border)]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--noir-accent)]"></span>
                    <h3 className="font-bold text-lg">{status}</h3>
                  </div>
                  <span className="text-xs bg-[var(--noir-bg-surface-2)] px-2 py-1 rounded-full text-[var(--noir-fg-muted)]">
                    {list.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="flex-1 space-y-4 overflow-y-auto">
                  {list.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 border border-dashed border-[var(--noir-border)] rounded-2xl text-[var(--noir-fg-subtle)] text-sm">
                      No jobs
                    </div>
                  ) : (
                    list.map((app) => (
                      <motion.div
                        key={app.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.25 }}
                        className="group relative rounded-2xl bg-[var(--noir-bg-elevated)] border border-[var(--noir-border)] p-4 hover:border-[var(--noir-accent)]/50 hover:shadow-lg hover:shadow-[var(--noir-accent)]/5 transition-colors"
                      >
                        {/* Quick action bar */}
                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEdit(app)}
                            className="p-1 rounded bg-[var(--noir-bg-surface-2)] text-[var(--noir-fg-muted)] hover:text-[var(--noir-accent)] transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(app)}
                            className="p-1 rounded bg-[var(--noir-bg-surface-2)] text-[var(--noir-fg-muted)] hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Card Info */}
                        <h4 className="font-bold text-[var(--noir-fg)] pr-12 text-lg truncate">
                          {app.jobTitle}
                        </h4>
                        <p className="text-[var(--noir-accent)] font-medium text-sm truncate mt-1">
                          {app.company}
                        </p>

                        <div className="mt-4 space-y-2 text-xs text-[var(--noir-fg-muted)] border-t border-[var(--noir-border)]/80 pt-3">
                          <div className="flex items-center gap-2">
                            <Calendar size={12} className="text-[var(--noir-fg-subtle)]" />
                            <span>Applied: {app.appliedDate}</span>
                          </div>

                          {app.status === "Interview" && app.interviewDate && (
                            <div className="flex items-center gap-2 text-yellow-400 font-medium">
                              <Calendar size={12} />
                              <span>Interview: {app.interviewDate}</span>
                            </div>
                          )}

                          {app.notes && (
                            <div className="flex gap-2 text-[var(--noir-fg-muted)] border-t border-[var(--noir-border)]/50 pt-2 mt-2">
                              <FileText size={12} className="text-[var(--noir-fg-subtle)] shrink-0 mt-0.5" />
                              <p className="line-clamp-2 leading-relaxed">{app.notes}</p>
                            </div>
                          )}
                        </div>

                        {app.jobUrl && (
                          <div className="mt-3 flex justify-end">
                            <a
                              href={app.jobUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[var(--noir-accent)] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              Job Post <ExternalLink size={10} />
                            </a>
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Modal */}
      <AnimatedModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        className="max-w-lg"
      >
        <h2 className={stickyHeaderClass}>
          {currentApp ? "Edit Application" : "Track New Application"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--noir-fg)] mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full Stack Developer"
                  value={formData.jobTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, jobTitle: e.target.value })
                  }
                  className="w-full bg-[var(--noir-bg)] border border-[var(--noir-border)] rounded-xl px-4 py-3 text-[var(--noir-fg)] focus:border-[var(--noir-accent)] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--noir-fg)] mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vercel"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  className="w-full bg-[var(--noir-bg)] border border-[var(--noir-border)] rounded-xl px-4 py-3 text-[var(--noir-fg)] focus:border-[var(--noir-accent)] focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--noir-fg)] mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full bg-[var(--noir-bg)] border border-[var(--noir-border)] rounded-xl px-4 py-3 text-[var(--noir-fg)] focus:border-[var(--noir-accent)] focus:outline-none transition-colors"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--noir-fg)] mb-1">
                    Applied Date
                  </label>
                  <input
                    type="date"
                    value={formData.appliedDate}
                    onChange={(e) =>
                      setFormData({ ...formData, appliedDate: e.target.value })
                    }
                    className="w-full bg-[var(--noir-bg)] border border-[var(--noir-border)] rounded-xl px-4 py-3 text-[var(--noir-fg)] focus:border-[var(--noir-accent)] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--noir-fg)] mb-1">
                    Interview Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.interviewDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        interviewDate: e.target.value,
                      })
                    }
                    className="w-full bg-[var(--noir-bg)] border border-[var(--noir-border)] rounded-xl px-4 py-3 text-[var(--noir-fg)] focus:border-[var(--noir-accent)] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--noir-fg)] mb-1">
                    Job Posting URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.jobUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, jobUrl: e.target.value })
                    }
                    className="w-full bg-[var(--noir-bg)] border border-[var(--noir-border)] rounded-xl px-4 py-3 text-[var(--noir-fg)] focus:border-[var(--noir-accent)] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--noir-fg)] mb-1">
                  Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste details, hiring managers, or log interview questions..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full bg-[var(--noir-bg)] border border-[var(--noir-border)] rounded-xl p-4 text-[var(--noir-fg)] focus:border-[var(--noir-accent)] focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className={stickyFooterClass}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-3 rounded-xl bg-[var(--noir-bg-surface-2)] text-[var(--noir-fg)] font-semibold hover:bg-[var(--noir-bg-surface-3)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-[var(--noir-accent)] text-[var(--noir-bg)] font-bold hover:scale-105 transition-all cursor-pointer"
                >
                  {currentApp ? "Save Changes" : "Create Application"}
                </button>
              </div>
            </form>
      </AnimatedModal>
    </div>
  );
}