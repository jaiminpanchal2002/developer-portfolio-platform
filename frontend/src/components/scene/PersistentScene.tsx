"use client";

import { Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, ContactShadows, Line } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { heroSceneProgress } from "@/lib/motion/scrollProgress";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Ambient particle field — a quiet constellation drifting behind the main
// composition. Deterministic positions (mulberry32) so SSR/CSR and every
// visit render the same sky; one draw call, no per-frame allocations.
const PARTICLE_COUNT = 320;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PARTICLE_POSITIONS = (() => {
  const rand = mulberry32(20260722);
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] = (rand() - 0.5) * 16;
    positions[i * 3 + 1] = (rand() - 0.5) * 10;
    positions[i * 3 + 2] = -2 - rand() * 6;
  }
  return positions;
})();

function ParticleField() {
  const points = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    if (!points.current) return;
    const settle = 1 - heroSceneProgress.value;
    points.current.rotation.y += delta * 0.012 * (0.4 + settle * 0.6);
    points.current.position.x = state.pointer.x * 0.15 * settle;
    points.current.position.y = state.pointer.y * 0.1 * settle;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[PARTICLE_POSITIONS, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#c9a876"
        size={0.02}
        sizeAttenuation
        transparent
        opacity={0.55}
        depthWrite={false}
      />
    </points>
  );
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
      <Float speed={1.2} rotationIntensity={0.35} floatIntensity={0.7}>
        <GitGraph />
      </Float>
    </group>
  );
}

// ─── Git-graph composition ────────────────────────────────────────────
// A stylized commit graph: a trunk of commits with two feature branches
// that fold back toward the trunk as the visitor scrolls (progress → 1),
// like branches merging. Reads as "software engineer" at a glance while
// staying abstract enough to stay elegant.

const TRUNK: [number, number, number][] = [
  [0, -1.5, 0],
  [0, -0.5, 0],
  [0, 0.5, 0],
  [0, 1.5, 0],
];

const BRANCH_A: [number, number, number][] = [
  [0.85, 0.35, 0.2],
  [1.35, 1.05, 0.35],
];

const BRANCH_B: [number, number, number][] = [
  [-0.8, -0.15, -0.25],
  [-1.25, 0.55, -0.4],
  [-1.5, 1.3, -0.5],
];

function edgePoints(points: [number, number, number][], from: [number, number, number]) {
  const result: [number, number, number][][] = [];
  let prev = from;
  for (const p of points) {
    result.push([prev, p]);
    prev = p;
  }
  return result;
}

function CommitNode({
  position,
  main,
  radius = 0.16,
}: {
  position: [number, number, number];
  main?: boolean;
  radius?: number;
}) {
  return (
    <mesh position={position} castShadow>
      <sphereGeometry args={[main ? radius * 1.35 : radius, 32, 32]} />
      <meshStandardMaterial
        color={main ? "#c9a876" : "#f3f1ed"}
        roughness={0.3}
        metalness={0.25}
        emissive={main ? "#c9a876" : "#8a8270"}
        emissiveIntensity={main ? 0.55 : 0.3}
      />
    </mesh>
  );
}

function BranchLines({
  segments,
  color,
}: {
  segments: [number, number, number][][];
  color: string;
}) {
  return (
    <>
      {segments.map((seg, i) => (
        <Line
          key={i}
          points={seg}
          color={color}
          lineWidth={1.4}
          transparent
          opacity={0.55}
        />
      ))}
    </>
  );
}

function GitGraph() {
  const branchA = useRef<THREE.Group>(null);
  const branchB = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    // Branches fold toward the trunk as the scene settles — a merge.
    const progress = heroSceneProgress.value;
    const foldA = THREE.MathUtils.lerp(0, -0.9, progress);
    const foldB = THREE.MathUtils.lerp(0, 0.9, progress);
    if (branchA.current) {
      branchA.current.rotation.z = THREE.MathUtils.damp(
        branchA.current.rotation.z, foldA, 4, delta);
    }
    if (branchB.current) {
      branchB.current.rotation.z = THREE.MathUtils.damp(
        branchB.current.rotation.z, foldB, 4, delta);
    }
  });

  return (
    <group scale={1.05}>
      {/* Trunk */}
      <BranchLines segments={edgePoints(TRUNK.slice(1), TRUNK[0])} color="#c9a876" />
      {TRUNK.map((p, i) => (
        <CommitNode key={`t${i}`} position={p} main />
      ))}

      {/* Feature branch A — pivots at trunk commit 2 */}
      <group ref={branchA} position={TRUNK[2]}>
        <BranchLines
          segments={edgePoints(
            BRANCH_A.map((p) => [p[0], p[1] - TRUNK[2][1], p[2]] as [number, number, number]),
            [0, 0, 0]
          )}
          color="#f3f1ed"
        />
        {BRANCH_A.map((p, i) => (
          <CommitNode
            key={`a${i}`}
            position={[p[0], p[1] - TRUNK[2][1], p[2]]}
          />
        ))}
      </group>

      {/* Feature branch B — pivots at trunk commit 1 */}
      <group ref={branchB} position={TRUNK[1]}>
        <BranchLines
          segments={edgePoints(
            BRANCH_B.map((p) => [p[0], p[1] - TRUNK[1][1], p[2]] as [number, number, number]),
            [0, 0, 0]
          )}
          color="#f3f1ed"
        />
        {BRANCH_B.map((p, i) => (
          <CommitNode
            key={`b${i}`}
            position={[p[0], p[1] - TRUNK[1][1], p[2]]}
          />
        ))}
      </group>

      {/* Orbit ring hinting at CI/automation around the graph */}
      <mesh rotation={[Math.PI / 2.15, 0.3, 0]}>
        <torusGeometry args={[2.05, 0.012, 12, 128]} />
        <meshStandardMaterial
          color="#c9a876"
          roughness={0.6}
          metalness={0.1}
          emissive="#c9a876"
          emissiveIntensity={0.25}
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  );
}

// Mounted once, fixed behind the whole page. Its composition morphs (via
// heroSceneProgress, driven by a ScrollTrigger spanning Hero -> Skills) as
// the user scrolls, instead of each section owning its own WebGL context.
const emptySubscribe = () => () => {};
const enabledSnapshot = () =>
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
  window.matchMedia("(min-width: 768px)").matches;

export default function PersistentScene() {
  // Media-query gate lives outside React state: the server snapshot is
  // false (never render WebGL during SSR) and the client snapshot decides
  // once at hydration — same behavior as the old setEnabled-in-effect,
  // without a cascading render.
  const enabled = useSyncExternalStore(emptySubscribe, enabledSnapshot, () => false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!enabled) return;

    let trigger: ScrollTrigger | undefined;
    let attempts = 0;
    let frameId: number;

    const setup = () => {
      const heroEl = document.getElementById("home");
      // The object's journey now spans Hero through the end of Skills —
      // it settles gradually across both sections instead of finishing at
      // the end of About — then recedes for Projects onward, where the
      // project showcase itself should be the visual focus.
      const endEl = document.getElementById("skills");

      if (!heroEl || !endEl) {
        if (attempts++ < 30) frameId = requestAnimationFrame(setup);
        return;
      }

      trigger = ScrollTrigger.create({
        trigger: heroEl,
        start: "top top",
        endTrigger: endEl,
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
  }, [enabled]);

  if (!enabled) return null;

  return (
    // Confirmed by the front-of-everything diagnostic pass: the scene was
    // never a rendering/positioning problem, it was pure stacking — a
    // negative z-index on a `position: fixed` element didn't reliably
    // paint above the page's content in this stack. Using a low *positive*
    // z-index here instead, with page.tsx's <main>/<Footer> wrappers given
    // an explicit `relative z-10` so real content deterministically stacks
    // above this rather than depending on default/negative z-index rules.
    // Also fades out once scrolled past the Hero->Skills range instead of
    // freezing visible (frameloop paused) for the rest of the page.
    <div
      className="fixed inset-0 z-[1] pointer-events-none transition-opacity duration-700"
      // visibility:hidden (after the fade) fully removes the canvas from
      // painting/compositing beyond its Hero->Skills range — opacity alone
      // kept a live fixed layer that could still surface in screenshots,
      // print, and some compositor edge cases.
      style={{
        opacity: active ? 1 : 0,
        visibility: active ? "visible" : "hidden",
        transitionProperty: "opacity, visibility",
      }}
      aria-hidden="true"
    >
      <Canvas
        dpr={[1, 1.5]}
        shadows
        frameloop={active ? "always" : "never"}
        camera={{ position: [0, 0, 6.5], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Self-contained 3-point studio lighting — deliberately not using
            drei's <Environment>, which fetches an HDR map from a remote
            CDN and requires a Suspense boundary; that external dependency
            is exactly the kind of thing that can silently fail to render
            in production with no visible error. */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 5, 3]} intensity={1.4} castShadow />
        <directionalLight position={[-4, -1, 2]} intensity={0.4} color="#8fa3b3" />
        <pointLight position={[-2, 3, -3]} intensity={0.3} color="#c9a876" />
        <Suspense fallback={null}>
          <ParticleField />
          <FloatingComposition />
          <ContactShadows position={[0, -1.6, 0]} opacity={0.4} scale={10} blur={2.4} far={3} />
        </Suspense>
      </Canvas>
    </div>
  );
}
