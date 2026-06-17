"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getImageUrl } from "../lib/api";
import { useLocale } from "@/lib/localeContext";
import * as THREE from "three";

interface HeroProps {
  profile: {
    fullName: string;
    headline: string;
    about: string;
    profileImageUrl?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    resumeUrl?: string;
  };
}

export default function Hero({ profile }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { t } = useLocale();
  const [imageError, setImageError] = useState(false);

  const getFallbackAvatar = () => {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect width="100%" height="100%" fill="%230a0a0a"/><circle cx="75" cy="75" r="70" fill="none" stroke="%2306b6d4" stroke-width="2"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="44" font-weight="900" fill="%2306b6d4">JP</text></svg>`;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Set up vanilla Three.js scene
    const container = containerRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create interactive particle field
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const initialPositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      // Circle layout with random distance offsets
      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 25;
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = (Math.random() - 0.5) * 15;

      positions[i] = x;
      positions[i + 1] = y;
      positions[i + 2] = z;

      initialPositions[i] = x;
      initialPositions[i + 1] = y;
      initialPositions[i + 2] = z;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Glow material
    const material = new THREE.PointsMaterial({
      color: 0x06b6d4,
      size: 0.15,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    camera.position.z = 22;

    // Listen to mouse coordinate updates
    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Resize listener
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      const posArray = geometry.attributes.position.array as Float32Array;

      // Slow orbital rotate
      particles.rotation.y = elapsedTime * 0.05;
      particles.rotation.x = elapsedTime * 0.02;

      // React to mouse coordinates
      for (let i = 0; i < particleCount * 3; i += 3) {
        const initX = initialPositions[i];
        const initY = initialPositions[i + 1];

        // Hover offset distortion
        const dx = initX - mouseRef.current.x * 10;
        const dy = initY - mouseRef.current.y * 10;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 8) {
          const force = (8 - dist) / 8;
          posArray[i] += (initX + (dx / dist) * force * 3 - posArray[i]) * 0.1;
          posArray[i + 1] += (initY + (dy / dist) * force * 3 - posArray[i + 1]) * 0.1;
        } else {
          posArray[i] += (initX - posArray[i]) * 0.1;
          posArray[i + 1] += (initY - posArray[i + 1]) * 0.1;
        }
      }

      geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <section
      id="home"
      className="relative flex items-center justify-center min-h-screen pt-28 pb-16 md:pt-36 md:pb-24 text-white overflow-hidden"
    >
      {/* Interactive Three.js Container */}
      <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none opacity-60" />

      {/* Decorative gradient rings and blobs */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center px-6"
      >
        {profile.profileImageUrl && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative w-36 h-36 md:w-48 md:h-48 rounded-full p-[3px] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 shadow-2xl mb-8"
          >
            <img
              src={imageError || !profile.profileImageUrl ? getFallbackAvatar() : getImageUrl(profile.profileImageUrl)}
              onError={() => setImageError(true)}
              alt={profile.fullName}
              className="w-full h-full object-cover rounded-full bg-slate-950"
            />
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-5xl md:text-8xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent tracking-tight leading-none"
        >
          {profile.fullName}
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-2xl md:text-4.5xl font-extrabold text-cyan-300 mb-6"
        >
          {profile.headline}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-slate-400 text-base md:text-xl max-w-3xl leading-relaxed mb-10"
        >
          {profile.about}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-5 justify-center items-center"
        >
          <a
            href="#projects"
            className="px-8 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-cyan-500/20"
          >
            {t("hero.cta.view", "View Projects")}
          </a>

          <a
            href="#contact"
            className="px-8 py-4 rounded-2xl border border-cyan-400/30 hover:border-cyan-400 text-cyan-300 hover:bg-cyan-500/10 font-bold transition-all duration-300 transform hover:-translate-y-1"
          >
            {t("hero.cta.contact", "Contact Me")}
          </a>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="mt-12 flex flex-wrap justify-center gap-8 text-sm font-semibold"
        >
          {profile.githubUrl && (
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-cyan-400 transition-colors duration-200"
            >
              GitHub
            </a>
          )}

          {profile.linkedinUrl && (
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-cyan-400 transition-colors duration-200"
            >
              LinkedIn
            </a>
          )}

          {profile.resumeUrl && (
            <a
              href={getImageUrl(profile.resumeUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-cyan-400 transition-colors duration-200"
            >
              Resume
            </a>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}