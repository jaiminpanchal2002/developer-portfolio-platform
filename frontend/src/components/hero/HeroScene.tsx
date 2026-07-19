"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

function FloatingComposition() {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const target = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    if (!group.current) return;
    target.current.x += (pointer.x * 0.25 - target.current.x) * Math.min(1, delta * 2);
    target.current.y += (pointer.y * 0.15 - target.current.y) * Math.min(1, delta * 2);
    group.current.rotation.y = target.current.x;
    group.current.rotation.x = -target.current.y;
  });

  return (
    <group ref={group}>
      <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.9}>
        <mesh position={[0, 0, 0]} castShadow>
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
        <mesh position={[2.1, 0.9, -1.2]} rotation={[0.4, 0.2, 0]} castShadow>
          <torusGeometry args={[0.55, 0.16, 32, 96]} />
          <meshPhysicalMaterial
            color="#3a3833"
            roughness={0.35}
            metalness={0.4}
            clearcoat={0.3}
          />
        </mesh>
      </Float>

      <Float speed={1.8} rotationIntensity={0.4} floatIntensity={1.6}>
        <mesh position={[-2, -0.6, -0.6]} castShadow>
          <sphereGeometry args={[0.4, 48, 48]} />
          <meshPhysicalMaterial
            color="#f3f1ed"
            roughness={0.1}
            metalness={0.1}
            clearcoat={0.8}
          />
        </mesh>
      </Float>
    </group>
  );
}

// Only ever rendered client-side (dynamically imported with ssr: false
// by Hero.tsx), so no server/client mount-gate is needed here.
export default function HeroScene({ active }: { active: boolean }) {
  return (
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
      <ContactShadows
        position={[0, -1.6, 0]}
        opacity={0.45}
        scale={10}
        blur={2.4}
        far={3}
      />
    </Canvas>
  );
}
