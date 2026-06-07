"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

interface NavbarProps {
    profile?: {
        fullName?: string;
    };
}

export default function Navbar({ profile }: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { label: "About", href: "#about" },
        { label: "Skills", href: "#skills" },
        { label: "Projects", href: "#projects" },
        { label: "Experience", href: "#experience" },
        { label: "Contact", href: "#contact" },
    ];

    return (
        <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">

                <h1 className="font-bold text-xl md:text-3xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                    {profile?.fullName || "Portfolio"}
                </h1>

                {/* Desktop Navigation */}
                <ul className="hidden md:flex gap-8 text-lg font-medium text-gray-300">
                    {navItems.map((item) => (
                        <li key={item.href}>
                            <a href={item.href} className="hover:text-cyan-400 transition-colors">
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>

                {/* Mobile Menu Toggle Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-2 text-cyan-400 hover:text-cyan-300 focus:outline-none cursor-pointer"
                    title="Toggle navigation menu"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

            </div>

            {/* Mobile Navigation Panel */}
            {isOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-slate-950/95 backdrop-blur-2xl border-b border-white/10 py-6 px-4 flex flex-col gap-4">
                    {navItems.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="text-lg font-semibold text-gray-200 hover:text-cyan-400 py-2 border-b border-white/5 transition-all duration-200"
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
            )}
        </nav>
    );
}