"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const menu = [
  {
    name: "Dashboard",
    href: "/admin",
  },
  {
    name: "Profile",
    href: "/admin/profile",
  },
  {
    name: "Projects",
    href: "/admin/projects",
  },
  {
    name: "Skills",
    href: "/admin/skills",
  },
  {
    name: "Experience",
    href: "/admin/experience",
  },
  {
    name: "Education",
    href: "/admin/education",
  },
  {
    name: "Certificates",
    href: "/admin/certificates",
  },
  {
    name: "AI Jobs",
    href: "/admin/jobs",
  },
  {
    name: "Resume AI",
    href: "/admin/resume",
  },
  {
    name: "Interview AI",
    href: "/admin/interview",
  },
  {
    name: "Applications",
    href: "/admin/applications",
  },
  {
    name: "Profile Score",
    href: "/admin/profile-score",
  },
];

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Toggle Button for Mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-99 flex items-center justify-center p-2.5 bg-slate-950/80 border border-cyan-500/30 rounded-xl text-cyan-400 hover:text-cyan-300 md:hidden shadow-lg backdrop-blur-md cursor-pointer"
        title="Toggle Menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop Dimmer for Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-90 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-95 w-72 h-screen flex flex-col border-r border-white/10 bg-slate-950 backdrop-blur-xl transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:flex md:w-72 md:bg-slate-950/60
        `}
      >
        <div className="p-8 pt-20 md:pt-8 flex justify-between items-center">
          <h2 className="text-2.5xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Admin Panel
          </h2>
        </div>

        <nav className="flex-1 px-4 overflow-y-auto pb-8">
          {menu.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-xl text-gray-305 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all mb-2 font-medium"
            >
              {item.name}
            </Link>
          ))}
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="w-full text-left block px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all mt-6 font-semibold border border-red-500/20 cursor-pointer"
          >
            Logout
          </button>
        </nav>
      </aside>
    </>
  );
}