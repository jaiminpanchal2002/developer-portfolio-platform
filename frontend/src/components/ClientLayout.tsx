"use client";

import React, { useEffect, useRef, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ThemeProvider } from "next-themes";
import { LocaleProvider } from "@/lib/localeContext";

import SceneErrorBoundary from "@/components/scene/SceneErrorBoundary";
import AnalyticsBeacon from "@/components/AnalyticsBeacon";

const PersistentScene = dynamic(() => import("@/components/scene/PersistentScene"), {
  ssr: false,
  loading: () => null,
});

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const emptySubscribe = () => () => {};
const isTouchSnapshot = () =>
  "ontouchstart" in window || navigator.maxTouchPoints > 0;

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  // Server snapshot assumes touch so the custom cursor never flashes
  // during SSR/hydration; the client snapshot corrects it immediately.
  const isTouch = useSyncExternalStore(emptySubscribe, isTouchSnapshot, () => true);

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
    });

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    lenis.scrollTo(0, { immediate: true });

    // Drive Lenis from GSAP's own ticker (instead of a separate raw rAF
    // loop) so ScrollTrigger — used for the persistent 3D scene's scroll
    // sync — stays perfectly in step with the smooth-scroll position.
    const tick = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const isHoverCapable = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    // Custom cursor: a continuous rAF loop lerps the follower toward the
    // raw pointer position and writes a single `transform` (GPU/compositor
    // only — never left/top, which forces layout on every frame). Hover
    // state is toggled imperatively via classList, not React state, so
    // hovering interactive elements never triggers a re-render.
    let cursorRafId: number | undefined;
    const pointer = { x: 0, y: 0 };
    const followerPos = { x: 0, y: 0 };

    // Bento-card glow: batched to at most once per frame.
    let glowRafPending = false;
    const applyGlow = () => {
      glowRafPending = false;
      document.querySelectorAll<HTMLElement>(".bento-card").forEach((card) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mouse-x", `${pointer.x - rect.left}px`);
        card.style.setProperty("--mouse-y", `${pointer.y - rect.top}px`);
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (!glowRafPending) {
        glowRafPending = true;
        requestAnimationFrame(applyGlow);
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

      followerRef.current?.classList.toggle("hovering", Boolean(clickable));
    };

    if (isHoverCapable && !isTouchDevice) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseover", handleMouseOver);

      const cursorTick = () => {
        followerPos.x += (pointer.x - followerPos.x) * 0.18;
        followerPos.y += (pointer.y - followerPos.y) * 0.18;

        if (cursorRef.current) {
          cursorRef.current.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`;
        }
        if (followerRef.current) {
          followerRef.current.style.transform = `translate3d(${followerPos.x}px, ${followerPos.y}px, 0) translate(-50%, -50%)`;
        }
        cursorRafId = requestAnimationFrame(cursorTick);
      };
      cursorRafId = requestAnimationFrame(cursorTick);
    }

    return () => {
      gsap.ticker.remove(tick);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
      if (cursorRafId !== undefined) cancelAnimationFrame(cursorRafId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  return (
    <LocaleProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        {/* Custom cursor elements (only on desktop/mouse devices) */}
        {!isTouch && (
          <>
            <div ref={cursorRef} className="custom-cursor hidden md:block" />
            <div ref={followerRef} className="custom-cursor-follower hidden md:block" />
          </>
        )}

        {/* Animated Aurora Background Blobs */}
        <div className="aurora-bg">
          <div className="aurora-glow glow-1" />
          <div className="aurora-glow glow-2" />
          <div className="aurora-glow glow-3" />
        </div>

        {children}

        {/* Mounted after children so its effect runs once Hero/About
            already exist in the DOM; the wrapper's explicit z-index keeps
            it visually behind everything regardless of mount order. */}
        <SceneErrorBoundary>
          <PersistentScene />
        </SceneErrorBoundary>

        <AnalyticsBeacon />
      </ThemeProvider>
    </LocaleProvider>
  );
}
