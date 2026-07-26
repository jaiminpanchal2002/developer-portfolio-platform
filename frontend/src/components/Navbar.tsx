"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { useLocale } from "@/lib/localeContext";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
    profile?: {
        fullName?: string;
    };
    /** Show the Writing link only when at least one post is published. */
    showBlog?: boolean;
}

export default function Navbar({ profile, showBlog }: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("home");
    const { t } = useLocale();

    const navItems = [
        { label: t("nav.home", "Home"), href: "#home" },
        { label: t("nav.about", "About"), href: "#about" },
        { label: t("nav.skills", "Skills"), href: "#skills" },
        { label: t("nav.projects", "Projects"), href: "#projects" },
        { label: t("nav.experience", "Experience"), href: "#experience" },
        ...(showBlog ? [{ label: t("nav.blog", "Writing"), href: "/blog" }] : []),
        { label: t("nav.contact", "Contact"), href: "#contact" },
    ];

    // Scroll-spy: track which section is currently under the viewport's
    // upper band and reflect it in the nav so the current location is
    // always visible, not just inferred from scroll position.
    const sectionIds = useRef(
        navItems.filter((item) => item.href.startsWith("#")).map((item) => item.href.slice(1))
    );

    useEffect(() => {
        const ids = sectionIds.current;
        const sections = ids
            .map((id) => document.getElementById(id))
            .filter((el): el is HTMLElement => el !== null);

        if (sections.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

                if (visible.length > 0) {
                    setActiveSection(visible[0].target.id);
                }
            },
            {
                // A band starting just below the fixed navbar; a section
                // "becomes current" once its top crosses into the upper
                // third of the viewport.
                rootMargin: "-80px 0px -65% 0px",
                threshold: 0,
            }
        );

        sections.forEach((section) => observer.observe(section));
        return () => observer.disconnect();
    }, []);

    return (
        <nav
            className="fixed top-0 w-full z-50 backdrop-blur-xl border-b"
            style={{ background: "rgba(10,10,11,0.7)", borderColor: "var(--noir-border)" }}
            role="navigation"
            aria-label="Main Navigation"
        >
            <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">

                <a
                    href="#home"
                    className="font-[family-name:var(--font-serif)] italic text-xl md:text-2xl tracking-tight"
                    style={{ color: "var(--noir-fg)" }}
                    aria-label="Jaimin Panchal Portfolio Home"
                >
                    {profile?.fullName || "Jaimin Panchal"}
                </a>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <ul className="flex gap-8 text-sm font-medium font-[family-name:var(--font-sans)]" style={{ color: "var(--noir-fg-muted)" }}>
                        {navItems.map((item) => {
                            const isActive = item.href === `#${activeSection}`;
                            return (
                                <li key={item.href}>
                                    <a
                                        href={item.href}
                                        aria-current={isActive ? "page" : undefined}
                                        className="relative group py-2 transition-colors hover:opacity-80"
                                        style={{ color: isActive ? "var(--noir-accent)" : undefined }}
                                    >
                                        {item.label}
                                        <span
                                            className="absolute bottom-0 left-0 h-px transition-all duration-300 group-hover:w-full"
                                            style={{
                                                background: "var(--noir-accent)",
                                                width: isActive ? "100%" : "0%",
                                            }}
                                        />
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex items-center gap-4 md:hidden">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 cursor-pointer"
                        style={{ color: "var(--noir-accent)" }}
                        title="Toggle navigation menu"
                        aria-label="Toggle navigation menu"
                        aria-expanded={isOpen}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="md:hidden absolute top-20 left-0 w-full backdrop-blur-2xl border-b py-6 px-6 flex flex-col gap-3"
                        style={{ background: "rgba(10,10,11,0.95)", borderColor: "var(--noir-border)" }}
                        role="menu"
                        aria-label="Mobile Navigation menu"
                    >
                        {navItems.map((item) => {
                            const isActive = item.href === `#${activeSection}`;
                            return (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    aria-current={isActive ? "page" : undefined}
                                    className="text-base font-medium py-2 border-b font-[family-name:var(--font-sans)] transition-colors"
                                    style={{
                                        color: isActive ? "var(--noir-accent)" : "var(--noir-fg-muted)",
                                        borderColor: "var(--noir-border)",
                                    }}
                                    role="menuitem"
                                >
                                    {item.label}
                                </a>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
