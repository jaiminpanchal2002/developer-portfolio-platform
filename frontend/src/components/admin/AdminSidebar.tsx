"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  FolderKanban,
  Code2,
  Briefcase,
  GraduationCap,
  Award,
  LogOut,
  FileText,
  MessageSquare,
  ClipboardList,
  Gauge,
  Mail,
  Quote,
  PenLine,
  ShieldCheck,
  CalendarClock,
  Menu,
  X,
} from "lucide-react";

// Single source of truth for the admin nav. There used to be a second,
// stale copy of this component at app/admin/AdminSidebar.tsx that nothing
// imported — edits made there (icons, Appointments, active-state styling)
// silently never reached the real sidebar, which is this file, imported by
// app/admin/layout.tsx via the "@/components/admin/AdminSidebar" alias.
// That duplicate has been deleted.
const menu = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Analytics", href: "/admin/analytics", icon: Gauge },
  { name: "Media", href: "/admin/media", icon: FileText },
  { name: "Profile", href: "/admin/profile", icon: User },
  { name: "Projects", href: "/admin/projects", icon: FolderKanban },
  { name: "Skills", href: "/admin/skills", icon: Code2 },
  { name: "Experience", href: "/admin/experience", icon: Briefcase },
  { name: "Education", href: "/admin/education", icon: GraduationCap },
  { name: "Certificates", href: "/admin/certificates", icon: Award },
  { name: "Testimonials", href: "/admin/testimonials", icon: Quote },
  { name: "Blog", href: "/admin/blog", icon: PenLine },
  { name: "AI Jobs", href: "/admin/jobs", icon: ClipboardList },
  { name: "Resume AI", href: "/admin/resume", icon: FileText },
  { name: "Interview AI", href: "/admin/interview", icon: MessageSquare },
  { name: "Applications", href: "/admin/applications", icon: ClipboardList },
  { name: "Inquiries", href: "/admin/inquiries", icon: Mail },
  { name: "Appointments", href: "/admin/appointments", icon: CalendarClock },
  { name: "Profile Score", href: "/admin/profile-score", icon: Gauge },
  { name: "Security", href: "/admin/security", icon: ShieldCheck },
];

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed top-4 left-4 z-[99] flex items-center justify-center p-2.5 rounded-xl border backdrop-blur-md shadow-lg md:hidden cursor-pointer"
        style={{ background: "rgba(10,10,11,0.8)", borderColor: "var(--noir-accent)", color: "var(--noir-accent)" }}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[90] backdrop-blur-sm md:hidden"
          style={{ background: "rgba(10,10,11,0.6)" }}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-[95] flex h-screen w-72 flex-col border-r backdrop-blur-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:sticky md:top-0 md:translate-x-0 md:flex md:h-screen`}
        style={{ background: "var(--noir-bg)", borderColor: "var(--noir-border)" }}
      >
        <div className="p-8 pt-20 md:pt-8 border-b" style={{ borderColor: "var(--noir-border)" }}>
          <h1 className="text-2xl font-black bg-gradient-to-r from-[var(--noir-accent)] to-blue-500 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--noir-fg-subtle)" }}>
            Portfolio Control Hub
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="group mb-1.5 flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all duration-200"
                style={
                  active
                    ? { background: "var(--noir-accent-soft)", border: "1px solid rgba(201,168,118,0.3)", color: "var(--noir-accent)" }
                    : { color: "var(--noir-fg-muted)", border: "1px solid transparent" }
                }
              >
                <Icon
                  size={19}
                  className={active ? "" : "transition-colors group-hover:text-[var(--noir-accent)]"}
                  style={active ? { color: "var(--noir-accent)" } : undefined}
                />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4" style={{ borderColor: "var(--noir-border)" }}>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 font-semibold text-red-400 transition-colors hover:bg-red-500/10 cursor-pointer"
            style={{ borderColor: "rgba(248,113,113,0.2)", background: "rgba(248,113,113,0.1)" }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
