"use client";

import { useEffect, useState } from "react";
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from "@/services/jobApplicationService";
import Swal from "sweetalert2";
import {
  Plus,
  Calendar,
  FileText,
  Trash2,
  Edit2,
  ExternalLink,
} from "lucide-react";

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
      Swal.fire({
        title: "Error!",
        text: "Failed to load applications. Please verify backend connection.",
        icon: "error",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#06b6d4",
      });
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
      Swal.fire({
        title: "Validation Error",
        text: "Job Title and Company are required.",
        icon: "warning",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    try {
      if (currentApp?.id) {
        await updateApplication(currentApp.id, formData);
        Swal.fire({
          title: "Updated!",
          text: "Application details have been updated successfully.",
          icon: "success",
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#06b6d4",
        });
      } else {
        await createApplication(formData);
        Swal.fire({
          title: "Created!",
          text: "New job application has been tracked.",
          icon: "success",
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#06b6d4",
        });
      }
      setModalOpen(false);
      loadApplications();
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error!",
        text: "Failed to save application.",
        icon: "error",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this application!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
      background: "#0f172a",
      color: "#ffffff",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteApplication(id);
          Swal.fire({
            title: "Deleted!",
            text: "Your application has been deleted.",
            icon: "success",
            background: "#0f172a",
            color: "#ffffff",
            confirmButtonColor: "#06b6d4",
          });
          loadApplications();
        } catch (error) {
          console.error(error);
          Swal.fire({
            title: "Error!",
            text: "Failed to delete application.",
            icon: "error",
            background: "#0f172a",
            color: "#ffffff",
            confirmButtonColor: "#ef4444",
          });
        }
      }
    });
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Applications Tracker
          </h1>
          <p className="text-slate-400 mt-2">
            Organize and follow your job search process
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-cyan-500 text-black font-bold hover:scale-105 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
        >
          <Plus size={20} />
          Add Application
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        /* Kanban Board */
        <div className="grid gap-6 lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
          {STATUSES.map((status) => {
            const list = groupedApps[status] || [];
            return (
              <div
                key={status}
                className="flex flex-col rounded-3xl bg-slate-900/50 border border-slate-800/80 p-4 min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    <h3 className="font-bold text-lg">{status}</h3>
                  </div>
                  <span className="text-xs bg-slate-800 px-2 py-1 rounded-full text-slate-400">
                    {list.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="flex-1 space-y-4 overflow-y-auto">
                  {list.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 border border-dashed border-slate-800 rounded-2xl text-slate-600 text-sm">
                      No jobs
                    </div>
                  ) : (
                    list.map((app) => (
                      <div
                        key={app.id}
                        className="group relative rounded-2xl bg-slate-900 border border-slate-800 p-4 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/5 transition-all"
                      >
                        {/* Quick action bar */}
                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEdit(app)}
                            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(app.id!)}
                            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Card Info */}
                        <h4 className="font-bold text-white pr-12 text-lg truncate">
                          {app.jobTitle}
                        </h4>
                        <p className="text-cyan-400 font-medium text-sm truncate mt-1">
                          {app.company}
                        </p>

                        <div className="mt-4 space-y-2 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                          <div className="flex items-center gap-2">
                            <Calendar size={12} className="text-slate-500" />
                            <span>Applied: {app.appliedDate}</span>
                          </div>

                          {app.status === "Interview" && app.interviewDate && (
                            <div className="flex items-center gap-2 text-yellow-400 font-medium">
                              <Calendar size={12} />
                              <span>Interview: {app.interviewDate}</span>
                            </div>
                          )}

                          {app.notes && (
                            <div className="flex gap-2 text-slate-400 border-t border-slate-800/50 pt-2 mt-2">
                              <FileText size={12} className="text-slate-500 shrink-0 mt-0.5" />
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
                              className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              Job Post <ExternalLink size={10} />
                            </a>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold mb-6">
              {currentApp ? "Edit Application" : "Track New Application"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Applied Date
                  </label>
                  <input
                    type="date"
                    value={formData.appliedDate}
                    onChange={(e) =>
                      setFormData({ ...formData, appliedDate: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Job Posting URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.jobUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, jobUrl: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste details, hiring managers, or log interview questions..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex gap-4 justify-end pt-4 border-t border-slate-800/80 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-3 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-cyan-500 text-black font-bold hover:scale-105 transition-all cursor-pointer"
                >
                  {currentApp ? "Save Changes" : "Create Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}