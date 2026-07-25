"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Video,
  Calendar,
  Clock,
  Trash2,
  Check,
  MessageSquare,
  User,
  ExternalLink,
  Inbox
} from "lucide-react";
import Swal from "sweetalert2";
import { getInquiries, markInquiryAsRead, deleteInquiry } from "@/services/contactService";
import { staggerContainer, staggerItem } from "@/lib/motion/adminMotion";
import { ContactInquiry } from "@/types";

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "counselling" | "messages">("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getInquiries();
        if (!cancelled) setInquiries(data);
      } catch (error) {
        console.error("Error fetching inquiries:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markInquiryAsRead(id);
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, isRead: true } : inq));
      Swal.fire({
        title: "Success",
        text: "Inquiry marked as read.",
        icon: "success",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        background: "var(--noir-bg-elevated)",
        color: "var(--noir-fg)"
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error",
        text: "Failed to mark inquiry as read.",
        icon: "error",
        background: "var(--noir-bg-elevated)",
        color: "var(--noir-fg)"
      });
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This inquiry will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "var(--noir-bg-surface-3)",
      confirmButtonText: "Yes, delete it",
      background: "var(--noir-bg-elevated)",
      color: "var(--noir-fg)"
    });

    if (result.isConfirmed) {
      try {
        await deleteInquiry(id);
        setInquiries(prev => prev.filter(inq => inq.id !== id));
        Swal.fire({
          title: "Deleted",
          text: "Inquiry has been deleted.",
          icon: "success",
          background: "var(--noir-bg-elevated)",
          color: "var(--noir-fg)"
        });
      } catch (error) {
        console.error(error);
        Swal.fire({
          title: "Error",
          text: "Failed to delete inquiry.",
          icon: "error",
          background: "var(--noir-bg-elevated)",
          color: "var(--noir-fg)"
        });
      }
    }
  };

  const filteredInquiries = inquiries.filter(inq => {
    if (activeTab === "counselling") return inq.scheduleMeeting === true;
    if (activeTab === "messages") return !inq.scheduleMeeting;
    return true;
  });

  const unreadCount = inquiries.filter(inq => !inq.isRead).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[var(--noir-accent)] to-blue-500 bg-clip-text text-transparent">
            Contact & Counselling Inquiries
          </h1>
          <p className="text-[var(--noir-fg-muted)] mt-2">
            View messages from your visitors and join scheduled virtual consulting sessions.
          </p>
        </div>

        {unreadCount > 0 && (
          <div className="bg-[var(--noir-accent)]/10 border border-[var(--noir-accent)]/30 text-[var(--noir-accent)] px-4 py-2 rounded-2xl text-sm font-bold flex items-center gap-2 self-start md:self-auto">
            <Inbox size={18} />
            <span>{unreadCount} Unread Inquiries</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--noir-border)] pb-1">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-5 py-2.5 rounded-t-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "all"
              ? "border-b-2 border-[var(--noir-accent)] text-[var(--noir-accent)] bg-[var(--noir-bg-elevated)]/50"
              : "text-[var(--noir-fg-muted)] hover:text-[var(--noir-fg)]"
          }`}
        >
          All ({inquiries.length})
        </button>
        <button
          onClick={() => setActiveTab("counselling")}
          className={`px-5 py-2.5 rounded-t-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "counselling"
              ? "border-b-2 border-[var(--noir-accent)] text-[var(--noir-accent)] bg-[var(--noir-bg-elevated)]/50"
              : "text-[var(--noir-fg-muted)] hover:text-[var(--noir-fg)]"
          }`}
        >
          Counselling Sessions ({inquiries.filter(i => i.scheduleMeeting).length})
        </button>
        <button
          onClick={() => setActiveTab("messages")}
          className={`px-5 py-2.5 rounded-t-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "messages"
              ? "border-b-2 border-[var(--noir-accent)] text-[var(--noir-accent)] bg-[var(--noir-bg-elevated)]/50"
              : "text-[var(--noir-fg-muted)] hover:text-[var(--noir-fg)]"
          }`}
        >
          Messages ({inquiries.filter(i => !i.scheduleMeeting).length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--noir-accent)]" />
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="bg-[var(--noir-bg-elevated)]/50 border border-[var(--noir-border)] rounded-3xl p-12 text-center text-[var(--noir-fg-muted)]">
          <Inbox className="mx-auto text-[var(--noir-fg-subtle)] mb-4 animate-bounce" size={48} />
          <p className="text-lg font-medium">No inquiries found</p>
          <p className="text-sm text-[var(--noir-fg-subtle)] mt-1">When visitors fill out your contact form, they will appear here.</p>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-6">
          {filteredInquiries.map((inq) => (
            <motion.div
              key={inq.id}
              variants={staggerItem}
              className={`rounded-3xl border p-6 md:p-8 transition-all flex flex-col gap-6 bg-[var(--noir-bg-elevated)]/70 backdrop-blur-md relative ${
                inq.isRead ? "border-[var(--noir-border)]/80" : "border-[var(--noir-accent)]/35 shadow-lg shadow-black/20"
              }`}
            >
              {/* Unread dot */}
              {!inq.isRead && (
                <div className="absolute top-6 right-6 w-3 h-3 bg-[var(--noir-accent)] rounded-full animate-ping" />
              )}

              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="space-y-2">
                  {/* Category badge */}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    inq.scheduleMeeting 
                      ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
                      : "bg-[var(--noir-accent)]/10 text-[var(--noir-accent)] border border-[var(--noir-accent)]/20"
                  }`}>
                    {inq.scheduleMeeting ? <Video size={12} /> : <Mail size={12} />}
                    {inq.scheduleMeeting ? "Counselling Booking" : "General Message"}
                  </span>

                  {/* Visitor details */}
                  <h3 className="text-xl font-bold flex items-center gap-2 text-[var(--noir-fg)] pt-1">
                    <User size={18} className="text-[var(--noir-fg-subtle)]" />
                    {inq.name}
                  </h3>
                  <p className="text-sm text-[var(--noir-fg-muted)] font-mono">{inq.email}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--noir-fg-subtle)]">
                    Received: {inq.createdAt ? new Date(inq.createdAt).toLocaleString() : "—"}
                  </span>
                </div>
              </div>

              {/* Booking Info if meeting is scheduled */}
              {inq.scheduleMeeting && (
                <div className="bg-[var(--noir-bg)]/80 border border-[var(--noir-border)] rounded-2xl p-4 grid sm:grid-cols-2 md:grid-cols-3 gap-4 items-center">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-purple-400" size={20} />
                    <div>
                      <p className="text-xs text-[var(--noir-fg-subtle)] font-medium">DATE</p>
                      <p className="text-sm text-[var(--noir-fg)] font-semibold">{inq.meetingDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="text-purple-400" size={20} />
                    <div>
                      <p className="text-xs text-[var(--noir-fg-subtle)] font-medium">TIME</p>
                      <p className="text-sm text-[var(--noir-fg)] font-semibold">{inq.meetingTime}</p>
                    </div>
                  </div>

                  <div className="sm:col-span-2 md:col-span-1">
                    {inq.meetingLink ? (
                      <a
                        href={inq.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:scale-[1.02] text-[var(--noir-fg)] px-5 py-3 rounded-xl font-bold transition-all text-sm shadow-md"
                      >
                        <Video size={16} />
                        Join Jitsi Room
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      <span className="text-xs text-[var(--noir-fg-subtle)] italic">No link generated</span>
                    )}
                  </div>
                </div>
              )}

              {/* Message text */}
              <div className="bg-[var(--noir-bg)]/40 border border-[var(--noir-border)] rounded-2xl p-4 md:p-6">
                <div className="flex items-start gap-3">
                  <MessageSquare className="text-[var(--noir-fg-subtle)] shrink-0 mt-1" size={18} />
                  <p className="text-[var(--noir-fg)] leading-relaxed whitespace-pre-line text-sm md:text-base">
                    {inq.message}
                  </p>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="flex flex-wrap gap-3 justify-end border-t border-[var(--noir-border)]/60 pt-4">
                {!inq.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(inq.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--noir-accent)]/10 hover:bg-[var(--noir-accent)]/20 border border-[var(--noir-accent)]/30 text-[var(--noir-accent)] text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    <Check size={16} />
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(inq.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
