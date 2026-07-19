"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <button
            onClick={() =>
                setTheme(theme === "dark" ? "light" : "dark")
            }
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="
        p-3
        rounded-xl
        bg-white/10
        border border-white/10
        hover:bg-white/20
        transition
      "
        >
            {theme === "dark" ? (
                <Sun size={20} />
            ) : (
                <Moon size={20} />
            )}
        </button>
    );
}