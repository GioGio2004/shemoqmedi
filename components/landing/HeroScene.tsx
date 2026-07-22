"use client";

// components/landing/HeroScene.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Subtle 3D accent for the hero: a slowly rotating wireframe icosahedron that
// drifts toward the cursor, rendered in the same black & white language as
// the rest of the page. Purely decorative (pointer-events disabled on the
// canvas itself) and respects prefers-reduced-motion by freezing rotation.
// Loaded client-side only via next/dynamic({ ssr: false }) from MotionLanding.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Icosahedron } from "@react-three/drei";
import * as THREE from "three";

function RotatingShape() {
  const meshRef = useRef<THREE.Mesh>(null);
  const target = useRef({ x: 0, y: 0 });
  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    if (!reducedMotion) {
      mesh.rotation.x += delta * 0.1;
      mesh.rotation.y += delta * 0.16;
    }

    // Gentle drift toward the pointer position (normalized -1..1 from r3f).
    target.current.x = state.pointer.x * 0.4;
    target.current.y = state.pointer.y * 0.3;
    mesh.position.x += (target.current.x - mesh.position.x) * 0.04;
    mesh.position.y += (target.current.y - mesh.position.y) * 0.04;
  });

  return (
    <Icosahedron ref={meshRef} args={[1.7, 1]} onPointerOver={(e: ThreeEvent<PointerEvent>) => e.stopPropagation()}>
      <meshStandardMaterial color="#ffffff" wireframe transparent opacity={0.32} />
    </Icosahedron>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 3, 4]} intensity={0.7} />
      <RotatingShape />
    </Canvas>
  );
}
