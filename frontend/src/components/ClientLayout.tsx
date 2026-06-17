"use client";

import React, { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { ThemeProvider } from "next-themes";
import { LocaleProvider } from "@/lib/localeContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [toasts, setToasts] = useState<{ id: string; title: string; desc: string }[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Synthesize Web Audio feedback to avoid loading asset files
  const playSoundEffect = (freq = 800, type: OscillatorType = "sine", duration = 0.08) => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio context bypass:", e);
    }
  };

  const addToast = (title: string, desc: string) => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, title, desc }]);
    playSoundEffect(900, "triangle", 0.15);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    // Detect touch interface
    const checkTouch = () => {
      setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();

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

    // Track scroll height for XP progress bar
    let milestoneReached = false;
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const pct = Math.round((window.scrollY / totalHeight) * 100);
        setScrollPercent(pct);

        if (pct >= 85 && !milestoneReached) {
          milestoneReached = true;
          addToast("🎉 Level Complete!", "You scrolled and explored all portfolio dimensions (+100 XP)");
        }
      }
    };
    window.addEventListener("scroll", handleScroll);

    // Custom Cursor follower logic (only bind if not touch)
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
      const clickable =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("button") ||
        target.closest("a") ||
        target.classList.contains("clickable");

      if (clickable) {
        setIsHovering(true);
        // Play very quiet hover tick
        playSoundEffect(600, "sine", 0.02);
      } else {
        setIsHovering(false);
      }
    };

    if (!("ontouchstart" in window || navigator.maxTouchPoints > 0)) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseover", handleMouseOver);
    }

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

    // Konami code implementation (Up Up Down Down Left Right Left Right B A)
    const konamiSequence = [
      "ArrowUp", "ArrowUp",
      "ArrowDown", "ArrowDown",
      "ArrowLeft", "ArrowRight",
      "ArrowLeft", "ArrowRight",
      "b", "a"
    ];
    let userKeyIndex = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const targetKey = konamiSequence[userKeyIndex].toLowerCase();

      if (key === targetKey) {
        userKeyIndex++;
        if (userKeyIndex === konamiSequence.length) {
          addToast("👾 Cheat Code Enabled!", "Konami Code active. Welcome to retro mode (+300 XP)");
          userKeyIndex = 0;
        }
      } else {
        userKeyIndex = 0;
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      lenis.destroy();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousemove", handleBentoGridGlow);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [soundEnabled]);

  return (
    <LocaleProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        {/* Fixed Scroll XP Progress Bar */}
        <div className="fixed top-0 left-0 right-0 h-1 z-[110] bg-white/5">
          <div className="xp-progress-bar h-full" style={{ width: `${scrollPercent}%` }} />
        </div>

        {/* Floating XP Score badge */}
        <div className="fixed top-24 right-6 md:right-8 z-40 bg-black/60 border border-white/10 hover:border-cyan-400/50 backdrop-blur-md rounded-2xl px-3.5 py-1.5 flex items-center gap-2 text-xxs font-mono font-bold transition-all shadow-xl">
          <span className="text-cyan-400">XP</span>
          <span className="text-white">{scrollPercent * 10}</span>
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="ml-2 pl-2 border-l border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? "Mute audio" : "Enable sound cues"}
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>
        </div>

        {/* Toast Achievements Container */}
        <div className="fixed bottom-6 right-6 z-[120] flex flex-col gap-3 max-w-sm pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className="toast-notification pointer-events-auto bg-[#0a0a0a]/95 border border-cyan-500/20 rounded-2xl p-4 flex flex-col gap-1 w-80 text-left"
            >
              <span className="text-xs font-black text-cyan-400 tracking-wide uppercase">{t.title}</span>
              <span className="text-slate-350 text-xxs leading-relaxed font-semibold">{t.desc}</span>
            </div>
          ))}
        </div>

        {/* Custom cursor elements (only on desktop/mouse devices) */}
        {!isTouch && (
          <>
            <div ref={cursorRef} className="custom-cursor hidden md:block" />
            <div
              ref={followerRef}
              className={`custom-cursor-follower hidden md:block ${isHovering ? "hovering" : ""}`}
            />
          </>
        )}
        
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
