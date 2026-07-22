"use client";

import { useEffect, useRef, useState } from "react";
import api from "../lib/api";
import Swal from "sweetalert2";
import {
  Mail,
  MapPin,
  Globe,
  Link as LinkIcon,
  Send,
  Calendar,
  Clock,
  Video,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Profile } from "@/types";
import { useLocale } from "@/lib/localeContext";
import SectionHeading from "@/components/ui/SectionHeading";

interface ContactProps {
  profile: Profile;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export default function Contact({ profile }: ContactProps) {
  const { t } = useLocale();
  const todayStr = new Date().toLocaleDateString('en-CA');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    scheduleMeeting: false,
    meetingDate: "",
    meetingTime: "",
  });
  const [sending, setSending] = useState(false);
  // Spam protection: a honeypot field bots auto-fill plus a minimum
  // time-to-submit — humans don't complete a contact form in under 2.5s.
  const [honeypot, setHoneypot] = useState("");
  const mountedAtRef = useRef<number | null>(null);
  useEffect(() => {
    if (mountedAtRef.current === null) mountedAtRef.current = Date.now();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (honeypot || Date.now() - (mountedAtRef.current ?? Date.now()) < 2500) {
      // Pretend success so bots learn nothing.
      setFormData({ name: "", email: "", message: "", scheduleMeeting: false, meetingDate: "", meetingTime: "" });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Swal.fire({
        title: "Validation Error",
        text: "Please enter a valid email address.",
        icon: "warning",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    if (!formData.name || !formData.email || !formData.message) {
      Swal.fire({
        title: "Validation Error",
        text: "Please fill in all the contact form fields.",
        icon: "warning",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    if (formData.scheduleMeeting) {
      if (!formData.meetingDate || !formData.meetingTime) {
        Swal.fire({
          title: "Validation Error",
          text: "Please select a date and time for the meeting.",
          icon: "warning",
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#f59e0b",
        });
        return;
      }

      // Check for past date/time
      const now = new Date();
      const selectedDateTime = new Date(`${formData.meetingDate}T${formData.meetingTime}`);
      if (selectedDateTime < now) {
        Swal.fire({
          title: "Invalid Time",
          text: "You cannot schedule a meeting in the past. Please choose a future date and time.",
          icon: "warning",
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#f59e0b",
        });
        return;
      }
    }

    setSending(true);
    try {
      const response = await api.post("/public/contact", formData);
      const data = response.data;


      if (data.googleMeetLink) {
        const safeMeetLink = escapeHtml(String(data.googleMeetLink));
        const safeUserEmail = escapeHtml(formData.email);
        const safeOwnerEmail = escapeHtml(profile.email);
        const safeDate = escapeHtml(formData.meetingDate);
        const safeTime = escapeHtml(formData.meetingTime);

        Swal.fire({
          title: "Meeting Scheduled!",
          html: `
            <div style="text-align: left; font-family: sans-serif; margin-top: 12px;">
              <p style="color: #cbd5e1; font-size: 14px; margin-bottom: 16px;">Successfully confirmed your inquiry and scheduled a video counselling session!</p>
              <div style="padding: 16px; background-color: #020617; border: 1px solid #1e293b; border-radius: 16px; margin-bottom: 16px;">
                <p style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em; font-family: monospace; margin: 0 0 10px 0; display: flex; align-items: center; gap: 6px;">
                  🎥 Jitsi Meet Invitation
                </p>
                <div style="height: 1px; background-color: #1e293b; margin-bottom: 12px; width: 100%;"></div>
                <p style="font-size: 14px; color: #e2e8f0; margin: 6px 0;">📅 <b>Date:</b> ${safeDate}</p>
                <p style="font-size: 14px; color: #e2e8f0; margin: 6px 0;">⏰ <b>Time:</b> ${safeTime}</p>
                <div style="margin-top: 12px; padding-top: 8px; border-top: 1px dashed #1e293b;">
                  <span style="font-size: 11px; color: #64748b; font-weight: bold; font-family: monospace; display: block; margin-bottom: 4px;">MEETING LINK:</span>
                  <a href="${safeMeetLink}" target="_blank" style="color: #22d3ee; font-weight: 600; font-size: 13px; word-break: break-all; text-decoration: underline;">
                    ${safeMeetLink}
                  </a>
                </div>
              </div>
              <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 0;">
                Confirmation invites containing this direct meeting link have been dispatched to <b>${safeUserEmail}</b> and <b>${safeOwnerEmail}</b>.
              </p>
            </div>
          `,
          icon: "success",
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#06b6d4",
          confirmButtonText: "Done",
        });
      } else {
        Swal.fire({
          title: "Message Sent!",
          text: "Thank you for reaching out. I'll get back to you shortly.",
          icon: "success",
          background: "#0f172a",
          color: "#ffffff",
          confirmButtonColor: "#06b6d4",
        });
      }

      setFormData({
        name: "",
        email: "",
        message: "",
        scheduleMeeting: false,
        meetingDate: "",
        meetingTime: "",
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error!",
        text: "Could not send your message. Please try again later.",
        icon: "error",
        background: "#0f172a",
        color: "#ffffff",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="bento-card p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(201,168,118,0.06)" }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(243,241,237,0.03)" }} />

        <SectionHeading kicker={t("contact.kicker", "Get In Touch")} title={t("contact.title", "Let's Connect")} className="mb-12" />

        <div className="grid md:grid-cols-2 gap-12 relative z-10">
          {/* LEFT COLUMN: CONTACT DETAILS */}
          <div className="space-y-8 flex flex-col justify-between">
            <div className="space-y-6">
              <p className="leading-relaxed text-base md:text-lg" style={{ color: "var(--noir-fg-muted)" }}>
                {t("contact.intro", "I'm open to new developer roles, freelance opportunities, and technology collaborations. Drop me a line, and let's build something great together!")}
              </p>

              <div className="flex items-center gap-4 max-w-full overflow-hidden">
                <div className="p-4 rounded-2xl border shrink-0" style={{ background: "var(--noir-accent-soft)", borderColor: "var(--noir-border)" }}>
                  <Mail style={{ color: "var(--noir-accent)" }} size={24} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase font-semibold tracking-wider" style={{ color: "var(--noir-fg-subtle)" }}>{t("contact.email", "Email")}</p>
                  <a href={`mailto:${profile.email}`} className="transition-opacity hover:opacity-70 font-semibold text-base md:text-lg block break-all" style={{ color: "var(--noir-fg)" }}>
                    {profile.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl border" style={{ background: "var(--noir-accent-soft)", borderColor: "var(--noir-border)" }}>
                  <MapPin style={{ color: "var(--noir-accent)" }} size={24} />
                </div>
                <div>
                  <p className="text-xs uppercase font-semibold tracking-wider" style={{ color: "var(--noir-fg-subtle)" }}>{t("contact.location", "Location")}</p>
                  <p className="font-semibold text-lg" style={{ color: "var(--noir-fg)" }}>{profile.location}</p>
                </div>
              </div>
            </div>

            {/* Social Profile Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t" style={{ borderColor: "var(--noir-border)" }}>
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl.startsWith("http") ? profile.githubUrl : `https://${profile.githubUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 p-4 rounded-2xl border transition font-semibold text-sm cursor-pointer hover:opacity-80"
                  style={{ background: "rgba(0,0,0,0.2)", borderColor: "var(--noir-border)", color: "var(--noir-fg)" }}
                >
                  <Globe size={18} style={{ color: "var(--noir-accent)" }} />
                  GitHub
                </a>
              )}

              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl.startsWith("http") ? profile.linkedinUrl : `https://${profile.linkedinUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 p-4 rounded-2xl border transition font-semibold text-sm cursor-pointer hover:opacity-80"
                  style={{ background: "rgba(0,0,0,0.2)", borderColor: "var(--noir-border)", color: "var(--noir-fg)" }}
                >
                  <LinkIcon size={18} style={{ color: "var(--noir-accent)" }} />
                  LinkedIn
                </a>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: CONTACT FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Honeypot — visually hidden and skipped by keyboard/screen
                readers; only bots that blindly fill every field hit it. */}
            <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
              <label htmlFor="contact-website">Website</label>
              <input
                id="contact-website"
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="contact-name" className="block text-sm font-semibold mb-1" style={{ color: "var(--noir-fg-muted)" }}>
                {t("contact.form.name", "Your Name")}
              </label>
              <input
                id="contact-name"
                type="text"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl px-4 py-3 focus:outline-none transition-colors text-sm border"
                style={{ background: "rgba(0,0,0,0.2)", borderColor: "var(--noir-border)", color: "var(--noir-fg)" }}
              />
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-sm font-semibold mb-1" style={{ color: "var(--noir-fg-muted)" }}>
                {t("contact.form.email", "Your Email")}
              </label>
              <input
                id="contact-email"
                type="email"
                placeholder="e.g. john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl px-4 py-3 focus:outline-none transition-colors text-sm border"
                style={{ background: "rgba(0,0,0,0.2)", borderColor: "var(--noir-border)", color: "var(--noir-fg)" }}
              />
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-sm font-semibold mb-1" style={{ color: "var(--noir-fg-muted)" }}>
                {t("contact.form.message", "Your Message")}
              </label>
              <textarea
                id="contact-message"
                rows={4}
                placeholder="Type your message here..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full rounded-xl p-4 focus:outline-none transition-colors text-sm resize-none border"
                style={{ background: "rgba(0,0,0,0.2)", borderColor: "var(--noir-border)", color: "var(--noir-fg)" }}
              />
            </div>

            {/* Google Meet Toggle */}
            <div className="flex items-center gap-3 p-4 rounded-2xl mt-2 select-none transition-colors border" style={{ background: "rgba(0,0,0,0.2)", borderColor: "var(--noir-border)" }}>
              <input
                type="checkbox"
                id="scheduleMeeting"
                checked={formData.scheduleMeeting}
                onChange={(e) => setFormData({ ...formData, scheduleMeeting: e.target.checked })}
                className="w-4 h-4 rounded cursor-pointer"
                style={{ accentColor: "var(--noir-accent)" }}
              />
              <label htmlFor="scheduleMeeting" className="text-xs font-semibold cursor-pointer flex items-center gap-1.5" style={{ color: "var(--noir-fg-muted)" }}>
                <Video size={14} style={{ color: "var(--noir-accent)" }} />
                {t("contact.form.schedule", "Schedule a 1-on-1 Counselling & Tech Consulting Session")}
              </label>
            </div>

            {/* Date and Time selectors inside expandable framer motion animation */}
            <AnimatePresence>
              {formData.scheduleMeeting && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-2 gap-4 pt-2"
                >
                  <div>
                    <label htmlFor="contact-meeting-date" className="text-xs font-semibold mb-1 flex items-center gap-1" style={{ color: "var(--noir-fg-muted)" }}>
                      <Calendar size={12} style={{ color: "var(--noir-accent)" }} />
                      {t("contact.form.date", "Select Date")}
                    </label>
                    <input
                      id="contact-meeting-date"
                      type="date"
                      value={formData.meetingDate}
                      min={todayStr}
                      onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                      className="w-full rounded-xl px-4 py-2 focus:outline-none transition-colors text-xs border"
                      style={{ background: "rgba(0,0,0,0.2)", borderColor: "var(--noir-border)", color: "var(--noir-fg)" }}
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-meeting-time" className="text-xs font-semibold mb-1 flex items-center gap-1" style={{ color: "var(--noir-fg-muted)" }}>
                      <Clock size={12} style={{ color: "var(--noir-accent)" }} />
                      {t("contact.form.time", "Select Time")}
                    </label>
                    <input
                      id="contact-meeting-time"
                      type="time"
                      value={formData.meetingTime}
                      onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                      className="w-full rounded-xl px-4 py-2 focus:outline-none transition-colors text-xs border"
                      style={{ background: "rgba(0,0,0,0.2)", borderColor: "var(--noir-border)", color: "var(--noir-fg)" }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-3.5 rounded-xl font-semibold hover:scale-[1.01] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              style={{ background: "var(--noir-accent)", color: "#0a0a0b" }}
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  {t("contact.form.sending", "Sending...")}
                </>
              ) : (
                <>
                  {t("contact.form.submit", "Send Message")}
                  <Send size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}