import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import * as THREE from "three";

function FloatingOrbs() {
  const groupRef = useRef<THREE.Group>(null);
  const count = 40;
  const positions = useMemo(() => {
    const pos: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 4 + Math.random() * 3;
      pos.push([
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      ]);
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.03;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {positions.map((pos, i) => (
        <Float key={i} speed={0.5 + Math.random() * 0.5} rotationIntensity={0.2} floatIntensity={0.3}>
          <mesh position={pos}>
            <sphereGeometry args={[0.04 + Math.random() * 0.06, 8, 8]} />
            <meshBasicMaterial
              color={i % 3 === 0 ? "#00d4ff" : i % 3 === 1 ? "#a855f7" : "#06b6d4"}
              transparent
              opacity={0.4 + Math.random() * 0.4}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function CentralOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      meshRef.current.rotation.y += 0.003;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.03;
      meshRef.current.scale.setScalar(scale);
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2.5;
      ringRef.current.rotation.z += 0.005;
    }
  });

  return (
    <group>
      <Sphere ref={meshRef} args={[1.2, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={0.15}
          distort={0.25}
          speed={1.5}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
      <mesh ref={ringRef}>
        <torusGeometry args={[2, 0.015, 16, 100]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.4} />
      </mesh>
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.2, 0.01, 16, 100]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.2} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <Float key={i} speed={1 + i * 0.3} floatIntensity={0.5}>
          <mesh position={[1.8, i * 0.5 - 0.5, 0]}>
            <octahedronGeometry args={[0.12, 0]} />
            <meshBasicMaterial color="#a855f7" transparent opacity={0.6} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function GridPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
      <planeGeometry args={[30, 30]} />
      <meshBasicMaterial color="#00d4ff" transparent opacity={0.03} wireframe />
    </mesh>
  );
}

function MouseTracker() {
  const groupRef = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    if (groupRef.current) {
      target.current.x += (state.pointer.x * 0.3 - target.current.x) * 0.05;
      target.current.y += (-state.pointer.y * 0.3 - target.current.y) * 0.05;
      groupRef.current.position.x = target.current.x;
      groupRef.current.position.y = target.current.y;
    }
  });

  return <group ref={groupRef} />;
}

export function ThreeScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, -5, -5]} color="#a855f7" intensity={0.4} />
        <MouseTracker />
        <FloatingOrbs />
        <CentralOrb />
        <GridPlane />
      </Canvas>
    </div>
  );
}
