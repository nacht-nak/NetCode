import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Edges } from "@react-three/drei";
import { MathUtils } from "three";

function CodingCube({ scroll }) {
  const group = useRef();
  const orbit = useRef();
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    if (!group.current) return;
    group.current.rotation.x = MathUtils.damp(
      group.current.rotation.x,
      0.37 + state.pointer.y * 0.1,
      3,
      delta,
    );
    group.current.rotation.y = MathUtils.damp(
      group.current.rotation.y,
      -0.55 + time * 0.09 + state.pointer.x * 0.16 + scroll.current * 0.3,
      3,
      delta,
    );
    group.current.position.y = Math.sin(time * 0.7) * 0.09;
    orbit.current.rotation.z = time * 0.045;
  });
  const pieces = [];
  for (let x = -1; x <= 1; x++)
    for (let y = -1; y <= 1; y++)
      for (let z = -1; z <= 1; z++) {
        const core = x === 0 && y === 0 && z === 0;
        pieces.push(
          <RoundedBox
            key={`${x}${y}${z}`}
            args={[0.67, 0.67, 0.67]}
            radius={0.055}
            smoothness={3}
            position={[x * 0.75, y * 0.75, z * 0.75]}
          >
            <meshStandardMaterial
              color={
                core ? "#b9f0ff" : (x + y + z) % 2 === 0 ? "#0088ff" : "#034788"
              }
              metalness={0.65}
              roughness={0.24}
              emissive={core ? "#00bfff" : "#003b80"}
              emissiveIntensity={core ? 3 : 0.22}
            />
            <Edges color="#7cddff" threshold={25} />
          </RoundedBox>,
        );
      }
  return (
    <>
      <group ref={group} rotation={[0.37, -0.55, 0.13]}>
        {pieces}
        <pointLight color="#00bfff" intensity={10} distance={5} />
      </group>
      <group ref={orbit} position={[0, -1.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <torusGeometry args={[2.1, 0.008, 8, 96]} />
          <meshBasicMaterial color="#0088ff" transparent opacity={0.65} />
        </mesh>
        <mesh>
          <torusGeometry args={[2.6, 0.004, 8, 96]} />
          <meshBasicMaterial color="#0088ff" transparent opacity={0.28} />
        </mesh>
      </group>
      {Array.from({ length: 18 }, (_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 3.1) * 3,
            Math.cos(i * 2.4) * 2.3,
            -1.5 + Math.sin(i) * 1.5,
          ]}
        >
          <sphereGeometry args={[i % 3 === 0 ? 0.025 : 0.012, 6, 6]} />
          <meshBasicMaterial color="#7cddff" />
        </mesh>
      ))}
    </>
  );
}

export default function ThreeDScene({ onReady }) {
  const scroll = useRef(0);
  const container = useRef(null);
  const [visible, setVisible] = useState(true);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const onScroll = () => {
      scroll.current = Math.min(window.scrollY / window.innerHeight, 2);
    };
    const onVisibility = () => setVisible(!document.hidden);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) =>
      setInView(entry.isIntersecting),
    );
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="scene-canvas" ref={container}>
      <Canvas
        aria-hidden="true"
        camera={{ position: [0, 0.6, 6.8], fov: 42 }}
        dpr={[1, 1.5]}
        frameloop={visible && inView ? "always" : "never"}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        onCreated={onReady}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[3, 5, 4]} intensity={4} color="#d3f5ff" />
        <directionalLight position={[-4, 1, 1]} intensity={5} color="#0088ff" />
        <pointLight position={[2, -2, 3]} intensity={18} color="#00bfff" />
        <CodingCube scroll={scroll} />
      </Canvas>
    </div>
  );
}
