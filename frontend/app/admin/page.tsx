"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  FolderKanban,
  Code2,
  Briefcase,
  Award,
  GraduationCap,
  FileText,
  ClipboardList,
  Gauge,
  Rocket,
  MessageSquareQuote,
  Newspaper,
  Mail,
  Bot,
  Eye,
  Users,
  Plus,
  ArrowRight,
  Inbox,
  CalendarClock,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

import { getDashboardStats, DashboardStats } from "@/services/dashboardService";
import { getAnalyticsSummary, AnalyticsSummary } from "@/services/analyticsService";
import { getInquiries } from "@/services/contactService";
import { getAdminAppointments } from "@/services/appointmentService";
import { Appointment, ContactInquiry } from "@/types";
import { easeOut, staggerContainer, staggerItem } from "@/lib/motion/adminMotion";

function AnimatedCounter({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (!inView || value <= 0) return;
    let start = 0;
    const totalMs = duration * 1000;
    const increment = Math.max(Math.floor(totalMs / value), 20);
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= value) clearInterval(timer);
    }, increment);
    return () => clearInterval(timer);
  }, [inView, value, duration]);

  return <span ref={ref}>{inView ? count : 0}</span>;
}

const EMPTY_STATS: DashboardStats = {
  projects: 0,
  skills: 0,
  experiences: 0,
  educations: 0,
  certificates: 0,
  applications: 0,
  profileScore: 0,
  atsScore: 0,
  testimonials: 0,
  blogPosts: 0,
  unreadMessages: 0,
  chatbotInteractions30d: 0,
  pendingAppointments: 0,
};

const QUICK_ACTIONS = [
  { label: "New Project", href: "/admin/projects", icon: FolderKanban },
  { label: "New Blog Post", href: "/admin/blog", icon: Newspaper },
  { label: "New Testimonial", href: "/admin/testimonials", icon: MessageSquareQuote },
  { label: "View Messages", href: "/admin/inquiries", icon: Inbox },
];

function timeAgo(iso?: string): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [recentMessages, setRecentMessages] = useState<ContactInquiry[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);

  const loadAll = async () => {
    try {
      const [statsData, analyticsData, inquiriesData, appointmentsData] = await Promise.all([
        getDashboardStats(),
        getAnalyticsSummary().catch(() => null),
        getInquiries().catch(() => []),
        getAdminAppointments().catch(() => []),
      ]);
      setStats(statsData);
      setAnalytics(analyticsData);
      setRecentAppointments((appointmentsData as Appointment[]).slice(0, 5));
      setRecentMessages((inquiriesData as ContactInquiry[]).slice(0, 5));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await loadAll();
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    { title: "Projects", value: stats.projects, icon: FolderKanban, color: "from-cyan-500 to-blue-500" },
    { title: "Skills", value: stats.skills, icon: Code2, color: "from-purple-500 to-pink-500" },
    { title: "Experience", value: stats.experiences, icon: Briefcase, color: "from-green-500 to-emerald-500" },
    { title: "Education", value: stats.educations, icon: GraduationCap, color: "from-yellow-500 to-orange-500" },
    { title: "Certificates", value: stats.certificates, icon: Award, color: "from-red-500 to-pink-500" },
    { title: "Testimonials", value: stats.testimonials, icon: MessageSquareQuote, color: "from-fuchsia-500 to-purple-500" },
    { title: "Blog Posts", value: stats.blogPosts, icon: Newspaper, color: "from-sky-500 to-cyan-500" },
    { title: "Unread Messages", value: stats.unreadMessages, icon: Mail, color: "from-rose-500 to-red-500" },
    { title: "Pending Appointments", value: stats.pendingAppointments, icon: CalendarClock, color: "from-amber-500 to-orange-500" },
    { title: "Chatbot Chats (30d)", value: stats.chatbotInteractions30d, icon: Bot, color: "from-violet-500 to-indigo-500" },
    { title: "Applications", value: stats.applications, icon: ClipboardList, color: "from-indigo-500 to-purple-500" },
    { title: "Profile Score", value: stats.profileScore, suffix: "%", icon: Gauge, color: "from-teal-500 to-emerald-500" },
    { title: "ATS Score", value: stats.atsScore, suffix: "%", icon: FileText, color: "from-blue-500 to-cyan-500" },
  ];

  const chartData = [
    { name: "Projects", value: stats.projects },
    { name: "Skills", value: stats.skills },
    { name: "Experience", value: stats.experiences },
    { name: "Education", value: stats.educations },
    { name: "Certificates", value: stats.certificates },
    { name: "Applications", value: stats.applications },
  ];

  const COLORS = [
    "var(--noir-accent)",
    "#8b5cf6",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#6366f1",
  ];

  const visitorSeries = analytics
    ? Object.entries(analytics.dailyViews14d).map(([date, views]) => ({ day: date.slice(5), views }))
    : [];

  return (
    <div className="space-y-8 text-[var(--noir-fg)]">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--noir-border)]">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[var(--noir-accent)] via-blue-500 to-indigo-500 bg-clip-text text-transparent tracking-tight">
            Dashboard
          </h1>
          <p className="text-[var(--noir-fg-muted)] mt-2 text-sm font-semibold">
            Portfolio Analytics & Recruiting Control Hub
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadAll}
            className="px-4 py-2 bg-[var(--noir-bg-elevated)] border border-[var(--noir-border)] hover:border-[var(--noir-accent)]/50 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Refresh Stats
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <motion.div key={action.label} variants={staggerItem}>
              <Link
                href={action.href}
                className="group flex items-center gap-3 rounded-2xl border border-[var(--noir-border)] bg-[var(--noir-bg-elevated)]/50 p-4 transition-colors hover:border-[var(--noir-accent)]/40 hover:bg-[var(--noir-accent-soft)]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--noir-accent-soft)] text-[var(--noir-accent)]">
                  <Icon size={18} />
                </div>
                <span className="flex-1 text-sm font-semibold">{action.label}</span>
                <Plus size={16} className="text-[var(--noir-fg-subtle)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--noir-accent)]" />
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Stats Cards Section */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {cards.map((item) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.title}
              variants={staggerItem}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2, ease: easeOut }}
              className="group relative rounded-3xl bg-[var(--noir-bg-elevated)]/50 border border-[var(--noir-border)] p-6 flex flex-col justify-between hover:border-[var(--noir-accent)]/30 transition-colors duration-300 backdrop-blur-xl shadow-xl overflow-hidden"
            >
              {/* Card border glow decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--noir-accent)]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[var(--noir-accent)]/10 transition-colors" />

              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[var(--noir-fg-subtle)] text-xs font-extrabold uppercase tracking-widest font-mono">
                    {item.title}
                  </p>
                  <h2 className="text-3.5xl font-black mt-2 text-[var(--noir-fg)] font-mono">
                    <AnimatedCounter value={item.value} />
                    {item.suffix ?? ""}
                  </h2>
                </div>
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${item.color}
                  flex items-center justify-center text-[var(--noir-bg)] font-bold shadow-lg shadow-black/30`}
                >
                  <Icon size={20} className="text-[var(--noir-fg)]" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Visitor Analytics + Recent Messages */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Visitor Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="bg-[var(--noir-bg-elevated)]/40 rounded-3xl p-6 border border-[var(--noir-border)] backdrop-blur-xl shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Eye size={18} className="text-[var(--noir-accent)]" />
              Visitor Analytics
            </h2>
            <Link
              href="/admin/analytics"
              className="flex items-center gap-1 text-xs font-semibold text-[var(--noir-accent)] hover:underline"
            >
              Full report <ArrowRight size={12} />
            </Link>
          </div>

          {analytics ? (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-2xl bg-[var(--noir-bg)]/60 border border-[var(--noir-border)] p-4">
                  <p className="text-xs text-[var(--noir-fg-subtle)] font-semibold uppercase flex items-center gap-1.5">
                    <Eye size={12} /> Views (7d)
                  </p>
                  <p className="text-2xl font-black mt-1 font-mono">{analytics.views7d}</p>
                </div>
                <div className="rounded-2xl bg-[var(--noir-bg)]/60 border border-[var(--noir-border)] p-4">
                  <p className="text-xs text-[var(--noir-fg-subtle)] font-semibold uppercase flex items-center gap-1.5">
                    <Users size={12} /> Visitors (30d)
                  </p>
                  <p className="text-2xl font-black mt-1 font-mono">{analytics.uniqueVisitors30d}</p>
                </div>
              </div>

              <div className="h-[140px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={visitorSeries} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#030303",
                        borderColor: "rgba(255,255,255,0.08)",
                        borderRadius: "16px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="var(--noir-accent)"
                      fill="var(--noir-accent)"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <p className="text-sm text-[var(--noir-fg-subtle)]">Analytics unavailable.</p>
          )}
        </motion.div>

        {/* Recent Messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1, ease: easeOut }}
          className="bg-[var(--noir-bg-elevated)]/40 rounded-3xl p-6 border border-[var(--noir-border)] backdrop-blur-xl shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Mail size={18} className="text-[var(--noir-accent)]" />
              Recent Messages
            </h2>
            <Link
              href="/admin/inquiries"
              className="flex items-center gap-1 text-xs font-semibold text-[var(--noir-accent)] hover:underline"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {recentMessages.length === 0 ? (
            <p className="text-sm text-[var(--noir-fg-subtle)]">No messages yet.</p>
          ) : (
            <div className="space-y-3">
              {recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-start gap-3 rounded-2xl bg-[var(--noir-bg)]/50 border border-[var(--noir-border)] p-3"
                >
                  {!msg.isRead && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--noir-accent)]" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold truncate">{msg.name}</p>
                      <span className="shrink-0 text-[10px] text-[var(--noir-fg-subtle)]">{timeAgo(msg.createdAt)}</span>
                    </div>
                    <p className="text-xs text-[var(--noir-fg-muted)] line-clamp-1 mt-0.5">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.15, ease: easeOut }}
          className="bg-[var(--noir-bg-elevated)]/40 rounded-3xl p-6 border border-[var(--noir-border)] backdrop-blur-xl shadow-xl lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CalendarClock size={18} className="text-[var(--noir-accent)]" />
              Recent Appointments
            </h2>
            <Link
              href="/admin/appointments"
              className="flex items-center gap-1 text-xs font-semibold text-[var(--noir-accent)] hover:underline"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {recentAppointments.length === 0 ? (
            <p className="text-sm text-[var(--noir-fg-subtle)]">No appointment requests yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="rounded-2xl bg-[var(--noir-bg)]/50 border border-[var(--noir-border)] p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold truncate">{appt.name}</p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        appt.status === "PENDING"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : appt.status === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : appt.status === "REJECTED"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-blue-500/10 text-blue-400"
                      }`}
                    >
                      {appt.status}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--noir-fg-muted)] mt-1">
                    {appt.appointmentDate} · {appt.appointmentTime}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Chart panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="bg-[var(--noir-bg-elevated)]/40 rounded-3xl p-6 border border-[var(--noir-border)] backdrop-blur-xl shadow-xl">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--noir-accent)]" />
            Portfolio Metrics distribution
          </h2>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#030303",
                    borderColor: "rgba(255,255,255,0.08)",
                    borderRadius: "16px",
                  }}
                  labelStyle={{ color: "#fff", fontWeight: "bold" }}
                />
                <Bar dataKey="value" fill="var(--noir-accent)" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Right Distribution Chart panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1, ease: easeOut }}
          className="bg-[var(--noir-bg-elevated)]/40 rounded-3xl p-6 border border-[var(--noir-border)] backdrop-blur-xl shadow-xl"
        >
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            Inventory Allocation
          </h2>

          <div className="h-[350px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  outerRadius={105}
                  innerRadius={65}
                  paddingAngle={3}
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#030303",
                    borderColor: "rgba(255,255,255,0.08)",
                    borderRadius: "16px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Portfolio Health & Summary */}

      <div className="grid lg:grid-cols-2 gap-8">

        {/* Portfolio Health */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="bg-[var(--noir-bg-elevated)] rounded-3xl p-6 border border-[var(--noir-border)]"
        >
          <h2 className="text-2xl font-bold mb-6">
            Portfolio Health
          </h2>

          <div className="space-y-6">
            {[
              { label: "Projects", value: stats.projects, barColor: "bg-[var(--noir-accent)]" },
              { label: "Skills", value: stats.skills, barColor: "bg-purple-500" },
              { label: "Certificates", value: stats.certificates, barColor: "bg-pink-500" },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between mb-2">
                  <span>{row.label}</span>
                  <span>{row.value}</span>
                </div>

                <div className="h-3 bg-[var(--noir-bg-surface-3)] rounded-full overflow-hidden">
                  <motion.div
                    className={`h-3 w-full origin-left ${row.barColor} rounded-full`}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: Math.min(row.value * 10, 100) / 100 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: easeOut }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Summary */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1, ease: easeOut }}
          className="bg-[var(--noir-bg-elevated)] rounded-3xl p-6 border border-[var(--noir-border)]"
        >
          <h2 className="text-2xl font-bold mb-6">
            Quick Summary
          </h2>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-4"
          >
            {[
              { icon: Rocket, label: "Active Projects", value: stats.projects },
              { icon: Code2, label: "Skills Added", value: stats.skills },
              { icon: GraduationCap, label: "Education Records", value: stats.educations },
              { icon: Award, label: "Certificates", value: stats.certificates },
              { icon: Briefcase, label: "Experience Records", value: stats.experiences },
            ].map((row) => {
              const RowIcon = row.icon;
              return (
                <motion.div
                  key={row.label}
                  variants={staggerItem}
                  className="p-4 rounded-xl bg-[var(--noir-bg-surface-2)] flex items-center gap-3"
                >
                  <RowIcon size={16} className="text-[var(--noir-accent)] shrink-0" />
                  <span>
                    {row.label}: {row.value}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
