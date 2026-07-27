"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Check,
  CheckCircle2,
  ExternalLink,
  Trash2,
  X,
} from "lucide-react";

import {
  getAdminAppointments,
  updateAppointmentStatus,
  deleteAppointment,
  bulkDeleteAppointments,
  bulkUpdateAppointmentStatus,
} from "@/services/appointmentService";
import { Appointment, AppointmentStatus } from "@/types";
import { staggerContainer, staggerItem } from "@/lib/motion/adminMotion";
import { useBulkSelection } from "@/lib/hooks/useBulkSelection";
import BulkActionBar from "@/components/admin/BulkActionBar";
import SelectCheckbox from "@/components/admin/SelectCheckbox";
import { confirmBulkAction, confirmDelete, toastError, toastSuccess } from "@/lib/toast";

const TABS: { label: string; value: AppointmentStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Completed", value: "COMPLETED" },
];

const STATUS_STYLE: Record<AppointmentStatus, string> = {
  PENDING: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  APPROVED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  REJECTED: "border-red-500/30 bg-red-500/10 text-red-400",
  COMPLETED: "border-blue-500/30 bg-blue-500/10 text-blue-400",
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AppointmentStatus | "ALL">("ALL");
  const [bulkBusy, setBulkBusy] = useState(false);

  const load = async () => {
    try {
      const data = await getAdminAppointments();
      setAppointments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getAdminAppointments();
        if (!cancelled) setAppointments(data);
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

  const filtered = appointments.filter((a) => activeTab === "ALL" || a.status === activeTab);
  const selection = useBulkSelection(filtered);

  const handleStatus = async (appointment: Appointment, status: AppointmentStatus) => {
    try {
      await updateAppointmentStatus(appointment.id, status);
      toastSuccess(`Appointment ${status.toLowerCase()}`);
      load();
    } catch (error) {
      console.error(error);
      toastError("Failed to update appointment status");
    }
  };

  const handleDelete = async (appointment: Appointment) => {
    const confirmed = await confirmDelete(`Appointment with ${appointment.name}`);
    if (!confirmed) return;

    try {
      await deleteAppointment(appointment.id);
      toastSuccess("Appointment deleted successfully");
      load();
    } catch (error) {
      console.error(error);
      toastError("Failed to delete appointment");
    }
  };

  const runBulkStatus = async (label: string, status: AppointmentStatus) => {
    const ids = selection.selectedIdsArray as number[];
    const confirmed = await confirmBulkAction(label, ids.length);
    if (!confirmed) return;

    setBulkBusy(true);
    try {
      await bulkUpdateAppointmentStatus(ids, status);
      toastSuccess(`${label} completed for ${ids.length} appointment${ids.length === 1 ? "" : "s"}`);
      selection.clear();
      load();
    } catch (error) {
      console.error(error);
      toastError(`Bulk ${label.toLowerCase()} failed`);
    } finally {
      setBulkBusy(false);
    }
  };

  const runBulkDelete = async () => {
    const ids = selection.selectedIdsArray as number[];
    const confirmed = await confirmBulkAction("Delete", ids.length, true);
    if (!confirmed) return;

    setBulkBusy(true);
    try {
      await bulkDeleteAppointments(ids);
      toastSuccess(`Deleted ${ids.length} appointment${ids.length === 1 ? "" : "s"}`);
      selection.clear();
      load();
    } catch (error) {
      console.error(error);
      toastError("Bulk delete failed");
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--noir-accent)] to-blue-500 bg-clip-text text-transparent">
          Appointments
        </h1>
        <p className="text-[var(--noir-fg-muted)] mt-2">
          Review and manage meeting requests
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--noir-border)] pb-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-5 py-2.5 rounded-t-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.value
                ? "border-b-2 border-[var(--noir-accent)] text-[var(--noir-accent)] bg-[var(--noir-bg-elevated)]/50"
                : "text-[var(--noir-fg-muted)] hover:text-[var(--noir-fg)]"
            }`}
          >
            {tab.label} ({tab.value === "ALL" ? appointments.length : appointments.filter((a) => a.status === tab.value).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--noir-accent)]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[var(--noir-border)] rounded-3xl text-[var(--noir-fg-subtle)]">
          <Calendar size={48} className="mb-4" />
          <p className="text-lg font-medium">No appointments here</p>
        </div>
      ) : (
        <div>
          <BulkActionBar
            count={selection.count}
            onClear={selection.clear}
            busy={bulkBusy}
            actions={[
              { label: "Approve", icon: <CheckCircle2 size={16} />, onClick: () => runBulkStatus("Approve", "APPROVED") },
              { label: "Reject", icon: <X size={16} />, onClick: () => runBulkStatus("Reject", "REJECTED") },
              { label: "Complete", icon: <Check size={16} />, onClick: () => runBulkStatus("Complete", "COMPLETED") },
              { label: "Delete", icon: <Trash2 size={16} />, danger: true, onClick: runBulkDelete },
            ]}
          />

          <div className="rounded-3xl border border-[var(--noir-border)] overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="w-10">
                    <SelectCheckbox
                      checked={selection.allSelected}
                      indeterminate={selection.someSelected}
                      onChange={selection.toggleAll}
                      label="Select all appointments"
                    />
                  </th>
                  <th className="p-5 text-left">Requester</th>
                  <th className="p-5 text-left">Date & Time</th>
                  <th className="p-5 text-left">Purpose</th>
                  <th className="p-5 text-left">Status</th>
                  <th className="p-5 text-left">Actions</th>
                </tr>
              </thead>

              <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
                {filtered.map((appt) => (
                  <motion.tr
                    key={appt.id}
                    variants={staggerItem}
                    className={`border-t border-[var(--noir-border)]/60 transition-colors hover:bg-[var(--noir-bg-surface-2)]/60 ${
                      selection.isSelected(appt.id) ? "bg-[var(--noir-accent-soft)]" : ""
                    }`}
                  >
                    <td>
                      <SelectCheckbox
                        checked={selection.isSelected(appt.id)}
                        onChange={() => selection.toggle(appt.id)}
                        label={`Select appointment with ${appt.name}`}
                      />
                    </td>

                    <td className="p-5">
                      <div className="font-semibold">{appt.name}</div>
                      <div className="text-xs text-[var(--noir-fg-muted)]">{appt.email}</div>
                      {appt.company && (
                        <div className="text-xs text-[var(--noir-fg-subtle)]">{appt.company}</div>
                      )}
                    </td>

                    <td className="p-5 text-sm">
                      <div>{appt.appointmentDate}</div>
                      <div className="text-[var(--noir-fg-muted)]">{appt.appointmentTime}</div>
                      {appt.meetingLink && (
                        <a
                          href={appt.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--noir-accent)] hover:underline"
                        >
                          Join <ExternalLink size={10} />
                        </a>
                      )}
                    </td>

                    <td className="p-5 text-sm text-[var(--noir-fg-muted)]">
                      {appt.purpose || "—"}
                    </td>

                    <td className="p-5">
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLE[appt.status]}`}>
                        {appt.status}
                      </span>
                    </td>

                    <td className="p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        {appt.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleStatus(appt, "APPROVED")}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors cursor-pointer"
                            >
                              <Check size={13} /> Approve
                            </button>
                            <button
                              onClick={() => handleStatus(appt, "REJECTED")}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors cursor-pointer"
                            >
                              <X size={13} /> Reject
                            </button>
                          </>
                        )}
                        {appt.status === "APPROVED" && (
                          <button
                            onClick={() => handleStatus(appt, "COMPLETED")}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold hover:bg-blue-500/20 transition-colors cursor-pointer"
                          >
                            <Check size={13} /> Mark Complete
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(appt)}
                          aria-label={`Delete appointment with ${appt.name}`}
                          className="p-1.5 rounded-lg text-[var(--noir-fg-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
