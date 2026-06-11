"use client";

import { useState } from "react";
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

interface ContactProps {
  profile: {
    email: string;
    location: string;
    githubUrl: string;
    linkedinUrl: string;
  };
}

export default function Contact({ profile }: ContactProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
                <p style="font-size: 14px; color: #e2e8f0; margin: 6px 0;">📅 <b>Date:</b> ${formData.meetingDate}</p>
                <p style="font-size: 14px; color: #e2e8f0; margin: 6px 0;">⏰ <b>Time:</b> ${formData.meetingTime}</p>
                <div style="margin-top: 12px; padding-top: 8px; border-top: 1px dashed #1e293b;">
                  <span style="font-size: 11px; color: #64748b; font-weight: bold; font-family: monospace; display: block; margin-bottom: 4px;">MEETING LINK:</span>
                  <a href="${data.googleMeetLink}" target="_blank" style="color: #22d3ee; font-weight: 600; font-size: 13px; word-break: break-all; text-decoration: underline;">
                    ${data.googleMeetLink}
                  </a>
                </div>
              </div>
              <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 0;">
                Confirmation invites containing this direct meeting link have been dispatched to <b>${formData.email}</b> and <b>${profile.email}</b>.
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
    <section id="contact" className="max-w-7xl mx-auto px-6 py-24">
      <div className="rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-cyan-500/10 p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-12 text-center md:text-left bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Let's Connect
        </h2>

        <div className="grid md:grid-cols-2 gap-12 relative z-10">
          {/* LEFT COLUMN: CONTACT DETAILS */}
          <div className="space-y-8 flex flex-col justify-between">
            <div className="space-y-6">
              <p className="text-slate-400 leading-relaxed text-base md:text-lg">
                I'm open to new developer roles, freelance opportunities, and technology collaborations. Drop me a line, and let's build something awesome together!
              </p>

              <div className="flex items-center gap-4 max-w-full overflow-hidden">
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shrink-0">
                  <Mail className="text-cyan-400" size={24} />
                </div>
                <div className="min-w-0">
                  <p className="text-slate-450 text-xs uppercase font-bold tracking-wider">Email</p>
                  <a href={`mailto:${profile.email}`} className="text-white hover:text-cyan-400 transition-colors font-semibold text-base md:text-lg block break-all">
                    {profile.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20">
                  <MapPin className="text-pink-400" size={24} />
                </div>
                <div>
                  <p className="text-slate-450 text-xs uppercase font-bold tracking-wider">Location</p>
                  <p className="text-white font-semibold text-lg">{profile.location}</p>
                </div>
              </div>
            </div>

            {/* Social Profile Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-800">
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-900 transition-all font-semibold text-sm cursor-pointer"
                >
                  <Globe size={18} className="text-cyan-400" />
                  GitHub
                </a>
              )}

              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-900 transition-all font-semibold text-sm cursor-pointer"
                >
                  <LinkIcon size={18} className="text-cyan-400" />
                  LinkedIn
                </a>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: CONTACT FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:border-cyan-500 focus:outline-none transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">
                Your Email
              </label>
              <input
                type="email"
                placeholder="e.g. john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:border-cyan-500 focus:outline-none transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">
                Your Message
              </label>
              <textarea
                rows={4}
                placeholder="Type your message here..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:border-cyan-500 focus:outline-none transition-colors text-sm resize-none"
              />
            </div>

            {/* Google Meet Toggle */}
            <div className="flex items-center gap-3 p-4 bg-slate-950 border border-slate-850 rounded-2xl mt-2 select-none hover:border-slate-800 transition-colors">
              <input
                type="checkbox"
                id="scheduleMeeting"
                checked={formData.scheduleMeeting}
                onChange={(e) => setFormData({ ...formData, scheduleMeeting: e.target.checked })}
                className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 border-slate-700 bg-slate-950 cursor-pointer"
              />
              <label htmlFor="scheduleMeeting" className="text-xs font-semibold text-slate-300 cursor-pointer flex items-center gap-1.5">
                <Video size={14} className="text-cyan-400 animate-pulse" />
                Schedule a 1-on-1 Counselling & Tech Consulting Session
              </label>
            </div>

            {/* Date and Time selectors inside expandable framer motion animation */}
            <AnimatePresence>
              {formData.scheduleMeeting && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-2 gap-4 overflow-hidden pt-2"
                >
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                      <Calendar size={12} className="text-cyan-400" />
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={formData.meetingDate}
                      min={todayStr}
                      onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none transition-colors text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                      <Clock size={12} className="text-cyan-400" />
                      Select Time
                    </label>
                    <input
                      type="time"
                      value={formData.meetingTime}
                      onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none transition-colors text-xs"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-cyan-500 text-black py-3.5 rounded-xl font-bold hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/10 disabled:opacity-50"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  Sending...
                </>
              ) : (
                <>
                  Send Message
                  <Send size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}