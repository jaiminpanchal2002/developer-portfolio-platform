"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Skill } from "@/types";

const RING_COLORS = [
  "#c9a876", // accent gold — matches site theme
  "#8b7fd6", // violet
  "#4fb8a8", // teal
  "#d68f6b", // copper
  "#6f9fd6", // blue
  "#d66f9f", // rose
];

const BASE_RADIUS = 1.5;
const RADIUS_STEP = 0.95;
const RING_SPEED_BASE = 0.05;

interface Placed {
  skill: Skill;
  angle: number;
  radius: number;
}

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

function DustField({ count = 140 }: { count?: number }) {
  const positions = useMemo(() => {
    const rand = mulberry32(20260727);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2 + rand() * 4;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.4;
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  const points = useRef<THREE.Points>(null);
  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y += delta * 0.015;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#c9a876" size={0.015} sizeAttenuation transparent opacity={0.4} depthWrite={false} />
    </points>
  );
}

function SkillNode({
  placed,
  color,
  dimmed,
  active,
  reduceMotion,
  onHover,
  onSelect,
}: {
  placed: Placed;
  color: string;
  dimmed: boolean;
  active: boolean;
  reduceMotion: boolean;
  onHover: (skill: Skill | null) => void;
  onSelect: (skill: Skill) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const baseScale = 0.16 + (placed.skill.proficiency / 100) * 0.2;
  const position: [number, number, number] = [
    Math.cos(placed.angle) * placed.radius,
    0,
    Math.sin(placed.angle) * placed.radius,
  ];

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const highlighted = hovered || active;
    const targetScale = (highlighted ? 1.4 : 1) * baseScale;
    const damp = reduceMotion ? 1 : Math.min(1, delta * 8);
    mesh.scale.setScalar(THREE.MathUtils.lerp(mesh.scale.x, targetScale, damp));

    const mat = mesh.material as THREE.MeshStandardMaterial;
    const targetEmissive = highlighted ? 1.5 : dimmed ? 0.12 : 0.55;
    mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, targetEmissive, damp);
    const targetOpacity = dimmed && !highlighted ? 0.25 : 1;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, damp);
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover(placed.skill);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        onHover(null);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(placed.skill);
      }}
    >
      <sphereGeometry args={[1, 20, 20]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} roughness={0.35} metalness={0.35} transparent opacity={1} />
    </mesh>
  );
}

function OrbitRing({
  category,
  skills,
  radius,
  color,
  tilt,
  speed,
  dimmedRing,
  activeCategory,
  reduceMotion,
  onHover,
  onSelect,
}: {
  category: string;
  skills: Skill[];
  radius: number;
  color: string;
  tilt: number;
  speed: number;
  dimmedRing: boolean;
  activeCategory: string | null;
  reduceMotion: boolean;
  onHover: (skill: Skill | null) => void;
  onSelect: (skill: Skill) => void;
}) {
  const spinRef = useRef<THREE.Group>(null);
  const placed = useMemo<Placed[]>(() => {
    const n = skills.length;
    return skills.map((skill, i) => ({ skill, angle: (i / n) * Math.PI * 2, radius }));
  }, [skills, radius]);

  const ringPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    const SEGMENTS = 96;
    for (let i = 0; i <= SEGMENTS; i++) {
      const a = (i / SEGMENTS) * Math.PI * 2;
      pts.push([Math.cos(a) * radius, 0, Math.sin(a) * radius]);
    }
    return pts;
  }, [radius]);

  useFrame((_, delta) => {
    if (spinRef.current && !reduceMotion) {
      spinRef.current.rotation.y += delta * speed;
    }
  });

  return (
    <group rotation={[tilt, 0, 0]}>
      <Line points={ringPoints} color={color} lineWidth={1} transparent opacity={dimmedRing ? 0.08 : 0.3} />
      <group ref={spinRef}>
        {placed.map((p) => (
          <SkillNode
            key={p.skill.id}
            placed={p}
            color={color}
            dimmed={dimmedRing}
            active={activeCategory === category}
            reduceMotion={reduceMotion}
            onHover={onHover}
            onSelect={onSelect}
          />
        ))}
      </group>
    </group>
  );
}

interface SkillGalaxyProps {
  skills: Skill[];
  activeCategory: string | null;
  onSkillHover: (skill: Skill | null) => void;
  onSkillSelect: (skill: Skill) => void;
  reduceMotion: boolean;
}

export default function SkillGalaxy({ skills, activeCategory, onSkillHover, onSkillSelect, reduceMotion }: SkillGalaxyProps) {
  const categories = useMemo(() => {
    const map = new Map<string, Skill[]>();
    for (const skill of skills) {
      const cat = skill.category || "General";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(skill);
    }
    return [...map.entries()];
  }, [skills]);

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 3.2, 6.4], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: "pan-y" }}
    >
      <ambientLight intensity={0.55} />
      <pointLight position={[3, 4, 3]} intensity={1.1} color="#ffffff" />
      <pointLight position={[-3, -2, -3]} intensity={0.5} color="#c9a876" />

      <Suspense fallback={null}>
        <DustField />
        {categories.map(([category, catSkills], i) => (
          <OrbitRing
            key={category}
            category={category}
            skills={catSkills}
            radius={BASE_RADIUS + i * RADIUS_STEP}
            color={RING_COLORS[i % RING_COLORS.length]}
            tilt={i % 2 === 0 ? 0.35 : -0.35}
            speed={RING_SPEED_BASE * (i % 2 === 0 ? 1 : -1) * (1 - i * 0.08)}
            dimmedRing={activeCategory !== null && activeCategory !== category}
            activeCategory={activeCategory}
            reduceMotion={reduceMotion}
            onHover={onSkillHover}
            onSelect={onSkillSelect}
          />
        ))}
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={4}
        maxDistance={11}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.7}
        autoRotate={!reduceMotion}
        autoRotateSpeed={0.4}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
