"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Environment, ContactShadows } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { heroSceneProgress } from "@/lib/motion/scrollProgress";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const REST_X = 1.6;
const SETTLE_X = 2.6;
const SETTLE_Y = -1.4;
const SETTLE_SCALE = 0.5;

function FloatingComposition() {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const parallax = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    if (!group.current) return;
    const progress = heroSceneProgress.value;
    const settle = 1 - progress;

    parallax.current.x += (pointer.x * 0.25 * settle - parallax.current.x) * Math.min(1, delta * 2);
    parallax.current.y += (pointer.y * 0.15 * settle - parallax.current.y) * Math.min(1, delta * 2);

    group.current.rotation.y = parallax.current.x + progress * 0.7;
    group.current.rotation.x = -parallax.current.y;

    const targetX = THREE.MathUtils.lerp(REST_X, SETTLE_X, progress);
    const targetY = THREE.MathUtils.lerp(0, SETTLE_Y, progress);
    const targetScale = THREE.MathUtils.lerp(1, SETTLE_SCALE, progress);

    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, targetX, 4, delta);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, targetY, 4, delta);
    group.current.scale.setScalar(
      THREE.MathUtils.damp(group.current.scale.x, targetScale, 4, delta)
    );
  });

  return (
    <group ref={group} position={[REST_X, 0, 0]}>
      <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.9}>
        <mesh castShadow>
          <icosahedronGeometry args={[1.35, 0]} />
          <meshPhysicalMaterial
            color="#c9a876"
            roughness={0.2}
            metalness={0.6}
            clearcoat={0.5}
            clearcoatRoughness={0.3}
          />
        </mesh>
      </Float>

      <Float speed={1.1} rotationIntensity={0.7} floatIntensity={1.3}>
        <mesh position={[1.1, 0.9, -1.2]} rotation={[0.4, 0.2, 0]} castShadow>
          <torusGeometry args={[0.55, 0.16, 32, 96]} />
          <meshPhysicalMaterial color="#3a3833" roughness={0.35} metalness={0.4} clearcoat={0.3} />
        </mesh>
      </Float>

      <Float speed={1.8} rotationIntensity={0.4} floatIntensity={1.6}>
        <mesh position={[-1, -0.6, -0.6]} castShadow>
          <sphereGeometry args={[0.4, 48, 48]} />
          <meshPhysicalMaterial color="#f3f1ed" roughness={0.1} metalness={0.1} clearcoat={0.8} />
        </mesh>
      </Float>
    </group>
  );
}

// Mounted once, fixed behind the whole page. Its composition morphs (via
// heroSceneProgress, driven by a ScrollTrigger spanning Hero -> About) as
// the user scrolls, instead of each section owning its own WebGL context.
export default function PersistentScene() {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    if (prefersReducedMotion || !isDesktop) return;

    setEnabled(true);

    let trigger: ScrollTrigger | undefined;
    let attempts = 0;
    let frameId: number;

    const setup = () => {
      const heroEl = document.getElementById("home");
      const aboutEl = document.getElementById("about");

      if (!heroEl || !aboutEl) {
        if (attempts++ < 30) frameId = requestAnimationFrame(setup);
        return;
      }

      trigger = ScrollTrigger.create({
        trigger: heroEl,
        start: "top top",
        endTrigger: aboutEl,
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          heroSceneProgress.value = self.progress;
        },
        onToggle: (self) => {
          heroSceneProgress.active = self.isActive;
          setActive(self.isActive);
        },
      });
    };

    frameId = requestAnimationFrame(setup);

    return () => {
      cancelAnimationFrame(frameId);
      trigger?.kill();
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        shadows
        frameloop={active ? "always" : "never"}
        camera={{ position: [0, 0, 6.5], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[4, 5, 3]} intensity={1.2} castShadow />
        <FloatingComposition />
        <Environment preset="studio" />
        <ContactShadows position={[0, -1.6, 0]} opacity={0.45} scale={10} blur={2.4} far={3} />
      </Canvas>
    </div>
  );
}
