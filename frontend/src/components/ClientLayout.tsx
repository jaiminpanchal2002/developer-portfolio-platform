"use client";

import React, { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { ThemeProvider } from "next-themes";
import { LocaleProvider } from "@/lib/localeContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Custom Cursor follower logic
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current && followerRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;

        followerRef.current.style.left = `${e.clientX}px`;
        followerRef.current.style.top = `${e.clientY}px`;
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("button") ||
        target.closest("a") ||
        target.classList.contains("clickable")
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);

    // Track cursor-following spotlight on Bento grid elements
    const handleBentoGridGlow = (e: MouseEvent) => {
      const cards = document.querySelectorAll(".bento-card");
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty("--mouse-x", `${x}px`);
        (card as HTMLElement).style.setProperty("--mouse-y", `${y}px`);
      });
    };
    window.addEventListener("mousemove", handleBentoGridGlow);

    return () => {
      lenis.destroy();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousemove", handleBentoGridGlow);
    };
  }, []);

  return (
    <LocaleProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        {/* Custom cursor elements */}
        <div ref={cursorRef} className="custom-cursor hidden md:block" />
        <div
          ref={followerRef}
          className={`custom-cursor-follower hidden md:block ${isHovering ? "hovering" : ""}`}
        />
        
        {/* Animated Aurora Background Blobs */}
        <div className="aurora-bg">
          <div className="aurora-glow glow-1" />
          <div className="aurora-glow glow-2" />
          <div className="aurora-glow glow-3" />
        </div>

        {children}
      </ThemeProvider>
    </LocaleProvider>
  );
}
