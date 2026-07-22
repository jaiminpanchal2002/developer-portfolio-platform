"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Eye, Users, TrendingUp, Globe2 } from "lucide-react";

import {
  getAnalyticsSummary,
  AnalyticsSummary,
} from "@/services/analyticsService";

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getAnalyticsSummary();
        if (!cancelled) setSummary(data);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-slate-400">
        Analytics unavailable — is the backend running?
      </div>
    );
  }

  const chartData = Object.entries(summary.dailyViews14d).map(
    ([date, views]) => ({
      day: date.slice(5), // MM-DD
      views,
    })
  );

  const cards = [
    { label: "Views (7 days)", value: summary.views7d, icon: TrendingUp },
    { label: "Views (30 days)", value: summary.views30d, icon: Eye },
    { label: "Unique visitors (30d)", value: summary.uniqueVisitors30d, icon: Users },
    { label: "All-time views", value: summary.totalViews, icon: Globe2 },
  ];

  const deviceTotal = Object.values(summary.deviceBreakdown).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Analytics</h1>
        <p className="text-gray-400 mt-1">
          Privacy-friendly visitor insight — no cookies, hashed visitors, admin
          pages never tracked
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6"
          >
            <card.icon size={18} className="text-cyan-400" />
            <div className="mt-3 text-3xl font-bold tabular-nums">
              {card.value}
            </div>
            <div className="mt-1 text-xs text-slate-400">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Daily views */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <h2 className="font-semibold mb-4">Views — last 14 days</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: "12px",
                }}
              />
              <Bar dataKey="views" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Devices */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <h2 className="font-semibold mb-4">Devices (30d)</h2>
          <div className="space-y-3">
            {Object.entries(summary.deviceBreakdown).map(([device, count]) => (
              <div key={device}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">{device}</span>
                  <span className="text-slate-400 tabular-nums">{count}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-cyan-500"
                    style={{
                      width: `${deviceTotal ? (count / deviceTotal) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {deviceTotal === 0 && (
              <p className="text-sm text-slate-500">No data yet.</p>
            )}
          </div>
        </div>

        {/* Top pages */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <h2 className="font-semibold mb-4">Top pages (30d)</h2>
          <ul className="space-y-2">
            {Object.entries(summary.topPages).map(([path, count]) => (
              <li key={path} className="flex justify-between gap-3 text-sm">
                <span className="text-slate-300 truncate">{path}</span>
                <span className="text-slate-400 tabular-nums shrink-0">{count}</span>
              </li>
            ))}
            {Object.keys(summary.topPages).length === 0 && (
              <p className="text-sm text-slate-500">No data yet.</p>
            )}
          </ul>
        </div>

        {/* Top referrers */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <h2 className="font-semibold mb-4">Top referrers (30d)</h2>
          <ul className="space-y-2">
            {Object.entries(summary.topReferrers).map(([ref, count]) => (
              <li key={ref} className="flex justify-between gap-3 text-sm">
                <span className="text-slate-300 truncate">{ref}</span>
                <span className="text-slate-400 tabular-nums shrink-0">{count}</span>
              </li>
            ))}
            {Object.keys(summary.topReferrers).length === 0 && (
              <p className="text-sm text-slate-500">
                No referrer data yet — direct visits don&apos;t send one.
              </p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
