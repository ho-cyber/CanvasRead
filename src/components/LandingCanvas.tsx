'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Icosahedron, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

function useScrollProgress(maxPx: number) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      setProgress(Math.max(0, Math.min(1, y / maxPx)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [maxPx]);

  return progress;
}

function Scene({ progress }: { progress: number }) {
  const group = useRef<THREE.Group>(null);
  const frame = useRef<THREE.Mesh>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);

  const accent = useMemo(() => new THREE.Color('#4f8cff'), []);
  const accent2 = useMemo(() => new THREE.Color('#1d4ed8'), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const p = progress;

    // Gentle camera motion on scroll (professional, not "demo-y")
    state.camera.position.z = THREE.MathUtils.lerp(6.2, 9.4, p);
    state.camera.position.y = THREE.MathUtils.lerp(0.2, 1.2, p);
    state.camera.lookAt(0, 0, 0);

    if (group.current) {
      group.current.rotation.y = t * 0.15 + p * 0.6;
      group.current.rotation.x = Math.sin(t * 0.2) * 0.08 + p * 0.15;
    }

    if (frame.current) frame.current.rotation.y = -t * 0.18;
    if (ringA.current) ringA.current.rotation.z = t * 0.25;
    if (ringB.current) ringB.current.rotation.x = -t * 0.22;

    // Subtle color shift with scroll
    const mix = new THREE.Color().copy(accent).lerp(accent2, p * 0.8);
    if (frame.current?.material) {
      const mat = frame.current.material as unknown as { color?: THREE.Color };
      mat.color?.copy(mix);
    }
    if (ringA.current?.material) {
      const mat = ringA.current.material as unknown as { color?: THREE.Color };
      mat.color?.copy(mix);
    }
  });

  return (
    <>
      <ambientLight intensity={0.28} />
      <directionalLight position={[-4, 5, 5]} intensity={1.2} color="#9cc3ff" />
      <directionalLight position={[4, -2, 6]} intensity={0.8} color="#7ea6ff" />
      <Environment preset="city" />

      {/* Shift motif to the right so it doesn't compete with headline copy */}
      <group ref={group} position={[2.1, 0.1, 0]} scale={0.95}>
        <Float speed={1.0} rotationIntensity={0.5} floatIntensity={0.7}>
          <mesh ref={ringA}>
            <torusGeometry args={[2.15, 0.045, 16, 200]} />
            <meshStandardMaterial color={accent} metalness={0.9} roughness={0.25} opacity={0.18} transparent />
          </mesh>
        </Float>

        <Float speed={1.15} rotationIntensity={0.7} floatIntensity={0.9}>
          <mesh ref={ringB}>
            <torusGeometry args={[1.55, 0.03, 16, 180]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.35} opacity={0.12} transparent />
          </mesh>
        </Float>

        <Float speed={1.2} rotationIntensity={0.8} floatIntensity={1.0}>
          <Icosahedron ref={frame} args={[1.15, 1]}>
            <meshStandardMaterial color={accent} wireframe transparent opacity={0.16} />
          </Icosahedron>
        </Float>
      </group>

      <Sparkles count={70} size={1.4} speed={0.28} opacity={0.28} scale={[12, 7, 7]} color="#ffffff" />
    </>
  );
}

export default function LandingCanvas({ progress }: { progress?: number }) {
  const fallbackProgress = useScrollProgress(900);
  const p = typeof progress === 'number' ? progress : fallbackProgress;

  return (
    <Canvas
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.2, 6.2], fov: 45, near: 0.1, far: 60 }}
    >
      <Scene progress={p} />
    </Canvas>
  );
}

