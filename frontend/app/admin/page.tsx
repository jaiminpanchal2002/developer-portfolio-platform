"use client";

import { useEffect, useState } from "react";
import {
  FolderKanban,
  Code2,
  Briefcase,
  Award,
  GraduationCap,
  FileText,
  MessageSquare,
  ClipboardList,
  Gauge,
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
    loadStats();
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
      value: stats.profileScore + "%",
      icon: Gauge,
      color: "from-teal-500 to-emerald-500",
    },
    {
      title: "ATS Score",
      value: stats.atsScore + "%",
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
    "#06b6d4",
    "#8b5cf6",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#6366f1",
  ];

  return (
    <div className="space-y-8 text-white">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-semibold">
            Portfolio Analytics & Recruiting Control Hub
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadStats}
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Refresh Stats
          </button>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="group relative rounded-3xl bg-slate-900/50 border border-slate-850 p-6 flex flex-col justify-between hover:border-cyan-500/30 transition-all duration-300 backdrop-blur-xl shadow-xl overflow-hidden"
            >
              {/* Card border glow decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
              
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-450 text-xs font-extrabold uppercase tracking-widest font-mono">
                    {item.title}
                  </p>
                  <h2 className="text-3.5xl font-black mt-2 text-white font-mono">
                    {item.value}
                  </h2>
                </div>
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${item.color}
                  flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-black/30`}
                >
                  <Icon size={20} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Chart panel */}
        <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-850 backdrop-blur-xl shadow-xl">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
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
                <Bar dataKey="value" fill="#06b6d4" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Distribution Chart panel */}
        <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-850 backdrop-blur-xl shadow-xl">
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
        </div>
      </div>

      {/* Portfolio Health & Summary */}

      <div className="grid lg:grid-cols-2 gap-8">

        {/* Portfolio Health */}

        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800">
          <h2 className="text-2xl font-bold mb-6">
            Portfolio Health
          </h2>

          <div className="space-y-6">

            <div>
              <div className="flex justify-between mb-2">
                <span>Projects</span>
                <span>{stats.projects}</span>
              </div>

              <div className="h-3 bg-slate-700 rounded-full">
                <div
                  className="h-3 bg-cyan-500 rounded-full"
                  style={{
                    width: `${Math.min(stats.projects * 10, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span>Skills</span>
                <span>{stats.skills}</span>
              </div>

              <div className="h-3 bg-slate-700 rounded-full">
                <div
                  className="h-3 bg-purple-500 rounded-full"
                  style={{
                    width: `${Math.min(stats.skills * 10, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span>Certificates</span>
                <span>{stats.certificates}</span>
              </div>

              <div className="h-3 bg-slate-700 rounded-full">
                <div
                  className="h-3 bg-pink-500 rounded-full"
                  style={{
                    width: `${Math.min(stats.certificates * 10, 100)}%`,
                  }}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Quick Summary */}

        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800">
          <h2 className="text-2xl font-bold mb-6">
            Quick Summary
          </h2>

          <div className="space-y-4">

            <div className="p-4 rounded-xl bg-slate-800">
              🚀 Active Projects: {stats.projects}
            </div>

            <div className="p-4 rounded-xl bg-slate-800">
              💻 Skills Added: {stats.skills}
            </div>

            <div className="p-4 rounded-xl bg-slate-800">
              🎓 Education Records: {stats.educations}
            </div>

            <div className="p-4 rounded-xl bg-slate-800">
              🏆 Certificates: {stats.certificates}
            </div>

            <div className="p-4 rounded-xl bg-slate-800">
              💼 Experience Records: {stats.experiences}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}