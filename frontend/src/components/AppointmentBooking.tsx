"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { CalendarDays, Clock, Loader2 } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { useLocale } from "@/lib/localeContext";
import { getAvailability, bookAppointment } from "@/services/appointmentService";

const ALL_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

const PURPOSES = [
  "Job Opportunity",
  "Freelance Project",
  "Consulting",
  "Technical Discussion",
  "Other",
];

function formatSlot(slot: string): string {
  const [h, m] = slot.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

const inputClass =
  "w-full rounded-xl px-4 py-3 transition-colors text-sm border";
const inputStyle = { background: "rgba(0,0,0,0.2)", borderColor: "var(--noir-border)", color: "var(--noir-fg)" };

export default function AppointmentBooking() {
  const { t } = useLocale();
  const todayStr = new Date().toLocaleDateString("en-CA");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    purpose: PURPOSES[0],
    message: "",
  });
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Spam protection, same technique as the contact form.
  const [honeypot, setHoneypot] = useState("");
  const mountedAtRef = useRef<number | null>(null);
  useEffect(() => {
    if (mountedAtRef.current === null) mountedAtRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!date) {
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingSlots(true);
      setTime("");
      try {
        const slots = await getAvailability(date);
        if (!cancelled) setAvailableSlots(slots);
      } catch (error) {
        console.error(error);
        if (!cancelled) setAvailableSlots([]);
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (honeypot || Date.now() - (mountedAtRef.current ?? Date.now()) < 2500) {
      setForm({ name: "", email: "", phone: "", company: "", purpose: PURPOSES[0], message: "" });
      setDate("");
      setTime("");
      return;
    }

    if (!form.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      Swal.fire({
        title: "Validation Error",
        text: "Please enter your name and a valid email address.",
        icon: "warning",
        background: "var(--noir-bg-elevated)",
        color: "var(--noir-fg)",
        confirmButtonColor: "var(--noir-accent)",
      });
      return;
    }
    if (!date || !time) {
      Swal.fire({
        title: "Validation Error",
        text: "Please select a date and an available time slot.",
        icon: "warning",
        background: "var(--noir-bg-elevated)",
        color: "var(--noir-fg)",
        confirmButtonColor: "var(--noir-accent)",
      });
      return;
    }

    setSubmitting(true);
    try {
      await bookAppointment({ ...form, appointmentDate: date, appointmentTime: time });
      Swal.fire({
        title: "Request Sent!",
        text: "Your appointment request is pending approval — you'll get an email once it's confirmed.",
        icon: "success",
        background: "var(--noir-bg-elevated)",
        color: "var(--noir-fg)",
        confirmButtonColor: "var(--noir-accent)",
      });
      setForm({ name: "", email: "", phone: "", company: "", purpose: PURPOSES[0], message: "" });
      setDate("");
      setTime("");
      setAvailableSlots(null);
    } catch (error) {
      console.error(error);
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Could not submit your request. Please try again later.";
      Swal.fire({
        title: "Error!",
        text: message,
        icon: "error",
        background: "var(--noir-bg-elevated)",
        color: "var(--noir-fg)",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="bento-card p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div
          className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(201,168,118,0.06)" }}
        />

        <SectionHeading
          kicker={t("appointment.kicker", "Book a Meeting")}
          title={t("appointment.title", "Schedule a Call")}
          className="mb-10"
        />

        <p className="text-sm md:text-base leading-relaxed max-w-2xl mb-8" style={{ color: "var(--noir-fg-muted)" }}>
          {t(
            "appointment.intro",
            "Prefer to talk it through? Pick a time that works for you — requests are reviewed and confirmed by email, usually within a day."
          )}
        </p>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6 relative z-10">
          {/* Honeypot */}
          <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
            <label htmlFor="appt-website">Website</label>
            <input
              id="appt-website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="appt-name" className="block text-sm font-semibold mb-1" style={{ color: "var(--noir-fg-muted)" }}>
              {t("appointment.form.name", "Your Name")} *
            </label>
            <input
              id="appt-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="appt-email" className="block text-sm font-semibold mb-1" style={{ color: "var(--noir-fg-muted)" }}>
              {t("appointment.form.email", "Your Email")} *
            </label>
            <input
              id="appt-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="appt-phone" className="block text-sm font-semibold mb-1" style={{ color: "var(--noir-fg-muted)" }}>
              {t("appointment.form.phone", "Phone")}
            </label>
            <input
              id="appt-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="appt-company" className="block text-sm font-semibold mb-1" style={{ color: "var(--noir-fg-muted)" }}>
              {t("appointment.form.company", "Company")}
            </label>
            <input
              id="appt-company"
              type="text"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="appt-purpose" className="block text-sm font-semibold mb-1" style={{ color: "var(--noir-fg-muted)" }}>
              {t("appointment.form.purpose", "Purpose")}
            </label>
            <select
              id="appt-purpose"
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              className={inputClass}
              style={inputStyle}
            >
              {PURPOSES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="appt-message" className="block text-sm font-semibold mb-1" style={{ color: "var(--noir-fg-muted)" }}>
              {t("appointment.form.message", "Message")}
            </label>
            <textarea
              id="appt-message"
              rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className={`${inputClass} resize-none`}
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="appt-date" className="text-sm font-semibold mb-1 flex items-center gap-1.5" style={{ color: "var(--noir-fg-muted)" }}>
              <CalendarDays size={14} style={{ color: "var(--noir-accent)" }} />
              {t("appointment.form.date", "Select Date")} *
            </label>
            <input
              id="appt-date"
              type="date"
              required
              min={todayStr}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          <div>
            <span className="text-sm font-semibold mb-1 flex items-center gap-1.5" style={{ color: "var(--noir-fg-muted)" }}>
              <Clock size={14} style={{ color: "var(--noir-accent)" }} />
              {t("appointment.form.time", "Select Time")} *
            </span>
            {!date ? (
              <p className="text-xs mt-2" style={{ color: "var(--noir-fg-subtle)" }}>
                {t("appointment.form.pickDateFirst", "Pick a date to see open times")}
              </p>
            ) : loadingSlots ? (
              <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: "var(--noir-fg-subtle)" }}>
                <Loader2 size={14} className="animate-spin" />
                {t("appointment.form.loadingSlots", "Loading availability…")}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 mt-1">
                {ALL_SLOTS.map((slot) => {
                  const isAvailable = availableSlots?.includes(slot) ?? false;
                  const isSelected = time === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setTime(slot)}
                      className="rounded-lg py-2 text-xs font-semibold border transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
                      style={{
                        borderColor: isSelected ? "var(--noir-accent)" : "var(--noir-border)",
                        background: isSelected ? "var(--noir-accent-soft)" : "transparent",
                        color: isSelected ? "var(--noir-accent)" : "var(--noir-fg-muted)",
                      }}
                    >
                      {formatSlot(slot)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={submitting}
            whileTap={{ scale: 0.98 }}
            className="md:col-span-2 w-full py-3.5 rounded-xl font-semibold hover:scale-[1.01] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            style={{ background: "var(--noir-accent)", color: "#0a0a0b" }}
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black" />
                {t("appointment.form.sending", "Sending…")}
              </>
            ) : (
              t("appointment.form.submit", "Request Appointment")
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
