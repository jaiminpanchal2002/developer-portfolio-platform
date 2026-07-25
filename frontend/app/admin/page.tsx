"use client";

import { useEffect, useRef, useState } from "react";
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
} from "recharts";

import { getDashboardStats } from "@/services/dashboardService";
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

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    experiences: 0,
    educations: 0,
    certificates: 0,
    applications: 0,
    profileScore: 0,
    atsScore: 0,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getDashboardStats();
        if (!cancelled) setStats(data);
      } catch (error) {
        console.error(error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error(error);
    }
  };

  const cards = [
    {
      title: "Projects",
      value: stats.projects,
      icon: FolderKanban,
      color: "from-cyan-500 to-blue-500",
    },
    {
      title: "Skills",
      value: stats.skills,
      icon: Code2,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Experience",
      value: stats.experiences,
      icon: Briefcase,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Education",
      value: stats.educations,
      icon: GraduationCap,
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Certificates",
      value: stats.certificates,
      icon: Award,
      color: "from-red-500 to-pink-500",
    },
    {
      title: "Applications",
      value: stats.applications,
      icon: ClipboardList,
      color: "from-indigo-500 to-purple-500",
    },
    {
      title: "Profile Score",
      value: stats.profileScore,
      suffix: "%",
      icon: Gauge,
      color: "from-teal-500 to-emerald-500",
    },
    {
      title: "ATS Score",
      value: stats.atsScore,
      suffix: "%",
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
    },
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
            onClick={loadStats}
            className="px-4 py-2 bg-[var(--noir-bg-elevated)] border border-[var(--noir-border)] hover:border-[var(--noir-accent)]/50 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Refresh Stats
          </button>
        </div>
      </div>

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
                    className={`h-3 ${row.barColor} rounded-full`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.min(row.value * 10, 100)}%` }}
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