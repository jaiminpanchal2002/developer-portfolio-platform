"use client";

import { useEffect, useRef, useState } from "react";
import api from "../lib/api";
import Swal from "sweetalert2";
import {
  Mail,
  MapPin,
  Send,
} from "lucide-react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import { Profile } from "@/types";
import { useLocale } from "@/lib/localeContext";
import SectionHeading from "@/components/ui/SectionHeading";

interface ContactProps {
  profile: Profile;
}

export default function Contact({ profile }: ContactProps) {
  const { t } = useLocale();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
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
      setFormData({ name: "", email: "", message: "" });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Swal.fire({
        title: "Validation Error",
        text: "Please enter a valid email address.",
        icon: "warning",
        background: "var(--noir-bg-elevated)",
        color: "var(--noir-fg)",
        confirmButtonColor: "var(--noir-accent)",
      });
      return;
    }

    if (!formData.name || !formData.email || !formData.message) {
      Swal.fire({
        title: "Validation Error",
        text: "Please fill in all the contact form fields.",
        icon: "warning",
        background: "var(--noir-bg-elevated)",
        color: "var(--noir-fg)",
        confirmButtonColor: "var(--noir-accent)",
      });
      return;
    }

    setSending(true);
    try {
      await api.post("/public/contact", formData);

      Swal.fire({
        title: "Message Sent!",
        text: "Thank you for reaching out. I'll get back to you shortly.",
        icon: "success",
        background: "var(--noir-bg-elevated)",
        color: "var(--noir-fg)",
        confirmButtonColor: "var(--noir-accent)",
      });

      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error!",
        text: "Could not send your message. Please try again later.",
        icon: "error",
        background: "var(--noir-bg-elevated)",
        color: "var(--noir-fg)",
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
                  className="flex items-center justify-center gap-2.5 p-4 rounded-2xl border transition-all duration-200 font-semibold text-sm cursor-pointer hover:-translate-y-0.5 hover:border-[var(--noir-accent)]/50 hover:shadow-[0_0_24px_-8px_var(--noir-accent)]"
                  style={{ background: "rgba(0,0,0,0.2)", borderColor: "var(--noir-border)", color: "var(--noir-fg)" }}
                >
                  <FaGithub size={18} style={{ color: "var(--noir-accent)" }} />
                  GitHub
                </a>
              )}

              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl.startsWith("http") ? profile.linkedinUrl : `https://${profile.linkedinUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 p-4 rounded-2xl border transition-all duration-200 font-semibold text-sm cursor-pointer hover:-translate-y-0.5 hover:border-[var(--noir-accent)]/50 hover:shadow-[0_0_24px_-8px_var(--noir-accent)]"
                  style={{ background: "rgba(0,0,0,0.2)", borderColor: "var(--noir-border)", color: "var(--noir-fg)" }}
                >
                  <FaLinkedinIn size={18} style={{ color: "var(--noir-accent)" }} />
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
                className="w-full rounded-xl px-4 py-3 transition-colors text-sm border"
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
                className="w-full rounded-xl px-4 py-3 transition-colors text-sm border"
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
                className="w-full rounded-xl p-4 transition-colors text-sm resize-none border"
                style={{ background: "rgba(0,0,0,0.2)", borderColor: "var(--noir-border)", color: "var(--noir-fg)" }}
              />
            </div>

            <p className="text-xs" style={{ color: "var(--noir-fg-subtle)" }}>
              {t("contact.form.scheduleHint", "Prefer a call? ")}
              <a href="#appointment" className="underline decoration-dotted hover:opacity-80" style={{ color: "var(--noir-accent)" }}>
                {t("contact.form.scheduleLink", "Book a meeting instead →")}
              </a>
            </p>

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