"use client";

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
  Sparkles,
  LogOut,
  FileText,
  MessageSquare,
  ClipboardList,
  Gauge,
  Mail,
} from "lucide-react";

const menu = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Profile",
    href: "/admin/profile",
    icon: User,
  },
  {
    name: "Projects",
    href: "/admin/projects",
    icon: FolderKanban,
  },
  {
    name: "Skills",
    href: "/admin/skills",
    icon: Code2,
  },
  {
    name: "Experience",
    href: "/admin/experience",
    icon: Briefcase,
  },
  {
    name: "Education",
    href: "/admin/education",
    icon: GraduationCap,
  },
  {
    name: "Certificates",
    href: "/admin/certificates",
    icon: Award,
  },
  {
    name: "Resume AI",
    href: "/admin/resume",
    icon: FileText,
  },
  {
    name: "Interview AI",
    href: "/admin/interview",
    icon: MessageSquare,
  },
  {
    name: "Applications",
    href: "/admin/applications",
    icon: ClipboardList,
  },
  {
    name: "Inquiries",
    href: "/admin/inquiries",
    icon: Mail,
  },
  {
    name: "Profile Score",
    href: "/admin/profile-score",
    icon: Gauge,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <aside
      className="
      hidden lg:flex
      flex-col
      w-72
      min-h-screen
      bg-slate-950/70
      backdrop-blur-2xl
      border-r
      border-white/10
      sticky
      top-0
      "
    >
      {/* Logo */}
      <div className="p-8 border-b border-white/10">
        <h1
          className="
          text-3xl
          font-black
          bg-gradient-to-r
          from-cyan-400
          via-blue-500
          to-purple-500
          bg-clip-text
          text-transparent
          "
        >
          Portfolio AI
        </h1>

        <p className="text-sm text-gray-400 mt-2">
          Admin Dashboard
        </p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group
                flex
                items-center
                gap-4
                px-4
                py-4
                rounded-2xl
                mb-2
                transition-all
                duration-300
                ${active
                  ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-400"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
                }
              `}
            >
              <Icon
                size={20}
                className={`${active
                  ? "text-cyan-400"
                  : "group-hover:text-cyan-400"
                  }`}
              />

              <span className="font-medium">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="
          w-full
          flex
          items-center
          justify-center
          gap-3
          px-4
          py-4
          rounded-2xl
          bg-red-500/10
          border
          border-red-500/20
          text-red-400
          hover:bg-red-500/20
          transition-all
          "
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}