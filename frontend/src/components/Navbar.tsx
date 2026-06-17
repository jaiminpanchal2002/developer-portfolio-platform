"use client";

import { useState } from "react";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { useLocale, Locale } from "@/lib/localeContext";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
    profile?: {
        fullName?: string;
    };
}

export default function Navbar({ profile }: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const { locale, setLocale, t } = useLocale();

    const navItems = [
        { label: t("nav.home", "Home"), href: "#home" },
        { label: t("nav.about", "About"), href: "#about" },
        { label: t("nav.skills", "Skills"), href: "#skills" },
        { label: t("nav.projects", "Projects"), href: "#projects" },
        { label: t("nav.arcade", "Arcade"), href: "#arcade" },
        { label: t("nav.experience", "Experience"), href: "#experience" },
        { label: t("nav.contact", "Contact"), href: "#contact" },
    ];

    const languages: { code: Locale; label: string }[] = [
        { code: "en", label: "English" },
        { code: "hi", label: "हिन्दी" },
        { code: "gu", label: "ગુજરાતી" },
        { code: "de", label: "Deutsch" },
        { code: "es", label: "Español" },
        { code: "fr", label: "Français" },
    ];

    return (
        <nav className="fixed top-0 w-full z-50 bg-[#030303]/70 backdrop-blur-xl border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
                
                <a href="#home" className="font-black text-xl md:text-3xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent tracking-tight">
                    {profile?.fullName || "Jaimin Panchal"}
                </a>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <ul className="flex gap-8 text-sm font-semibold text-gray-300">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <a href={item.href} className="hover:text-cyan-400 transition-colors duration-250 relative group py-2">
                                    {item.label}
                                    <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-cyan-400 transition-all duration-300 group-hover:w-full" />
                                </a>
                            </li>
                        ))}
                    </ul>

                    {/* Language Switcher */}
                    <div className="relative">
                        <button
                            onClick={() => setLangOpen(!langOpen)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:border-cyan-400/50 bg-white/5 hover:bg-white/10 text-sm font-medium text-gray-300 transition-all cursor-pointer"
                        >
                            <Globe size={14} className="text-cyan-400" />
                            <span className="uppercase">{locale}</span>
                            <ChevronDown size={12} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {langOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 mt-2 w-36 rounded-2xl bg-[#0a0a0a] border border-white/10 p-1.5 shadow-2xl z-50"
                                >
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                setLocale(lang.code);
                                                setLangOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                                                locale === lang.code
                                                    ? "bg-cyan-500/15 text-cyan-400"
                                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                                            }`}
                                        >
                                            {lang.label}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Mobile Menu Toggle & Lang switcher */}
                <div className="flex items-center gap-4 md:hidden">
                    <button
                        onClick={() => {
                            const nextLangIdx = (languages.findIndex(l => l.code === locale) + 1) % languages.length;
                            setLocale(languages[nextLangIdx].code);
                        }}
                        className="p-2 text-cyan-400 border border-white/10 rounded-full bg-white/5"
                        title="Change Language"
                    >
                        <Globe size={18} />
                    </button>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 text-cyan-400 hover:text-cyan-300 focus:outline-none cursor-pointer"
                        title="Toggle navigation menu"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden absolute top-20 left-0 w-full bg-[#030303]/95 backdrop-blur-2xl border-b border-white/5 py-6 px-6 flex flex-col gap-3"
                    >
                        {navItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className="text-base font-semibold text-gray-200 hover:text-cyan-400 py-2 border-b border-white/5 transition-all duration-200"
                            >
                                {item.label}
                            </a>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}