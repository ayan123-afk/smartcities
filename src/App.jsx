// src/App.jsx
// Smart City — Integrated realistic modules (Transportation Hub, Community Garden, Public Plaza)
// Paste this entire file into src/App.jsx of a Vite React app.
// Dependencies: three, @react-three/fiber, @react-three/drei, zustand
// Run: npm run dev

import React, { useRef, useState, useEffect, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Text, Sky, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import create from "zustand";

/* ---------------------------
  Simple global store for alerts and camera focus
---------------------------- */
const useStore = create((set) => ({
  alert: null,
  setAlert: (a) => set({ alert: a }),
  focus: null,
  setFocus: (f) => set({ focus: f }),
}));

/* ---------------------------
  CameraController: smooth camera movement to focus target
---------------------------- */
function CameraController() {
  const { camera } = useThree();
  const focus = useStore((s) => s.focus);
  useFrame(() => {
    if (!focus) return;
    const target = new THREE.Vector3(focus.x, focus.y, focus.z);
    camera.position.lerp(target, 0.06);
    camera.lookAt(focus.lookAt.x, focus.lookAt.y, focus.lookAt.z);
  });
  return null;
}

/* ---------------------------
  Reusable Ground / Tiles / Paving helper
---------------------------- */
function GroundTiles({ size = 80 }) {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#dfeadf" />
      </mesh>
      {/* subtle shadows */}
      <ContactShadows position={[0, -0.01, 0]} opacity={0.4} width={40} blur={2} far={10} />
    </>
  );
}

/* ---------------------------
  Parametric Eco Bench (procedural)
  Creates a curved bench by sweeping a profile along an arc
---------------------------- */
function EcoBench({ radius = 2.4, arc = Math.PI * 0.8, height = 0.45, thickness = 0.18, pos = [0, 0, 0] }) {
  // build simple curved bench geometry
  const geomRef = useRef();
  useEffect(() => {
    const profile = [];
    // profile shape (cross-section)
    profile.push(new THREE.Vector2(0, 0));
    profile.push(new THREE.Vector2(thickness, 0));
    profile.push(new THREE.Vector2(thickness, height));
    profile.push(new THREE.Vector2(0, height));
    // extrude by lathe-like rotation along arc: sample points along arc and place profile
    const segments = 40;
    const positions = [];
    const indices = [];
    const normals = [];
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * arc - arc / 2;
      const cx = Math.cos(a) * radius;
      const cz = Math.sin(a) * radius;
      for (let j = 0; j < profile.length; j++) {
        positions.push(cx + profile[j].x * Math.cos(a + Math.PI / 2)); // slight twist
        positions.push(profile[j].y);
        positions.push(cz + profile[j].x * Math.sin(a + Math.PI / 2));
      }
    }
    const cols = segments + 1;
    const rows = profile.length;
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < rows - 1; j++) {
        const a = i * rows + j;
        indices.push(a, a + rows, a + rows + 1);
        indices.push(a, a + rows + 1, a + 1);
      }
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    geomRef.current.geometry = geom;
  }, [radius, arc, height, thickness]);
  return (
    <group position={pos}>
      <mesh ref={geomRef} castShadow receiveShadow>
        <bufferGeometry />
        <meshStandardMaterial color="#6b8f65" metalness={0.12} roughness={0.6} />
      </mesh>
      {/* legs */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color="#444" />
      </mesh>
    </group>
  );
}

/* ---------------------------
  Transportation Hub
  - platform with solar roof (flat panels)
  - ramps and tactile paving
  - sheltered seating + wheelchair area
  - bus stop marker
---------------------------- */
function TransportationHub({ pos = [-6, 0, -2] }) {
  const setFocus = useStore((s) => s.setFocus);
  return (
    <group position={pos}>
      {/* platform */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[8, 0.04, 8]} />
        <meshStandardMaterial color="#f5f3f2" />
      </mesh>

      {/* solar rooftop structure */}
      <group position={[0, 2.2, -2]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[6, 0.12, 3.2]} />
          <meshStandardMaterial color="#222" metalness={0.7} roughness={0.2} />
        </mesh>
        {/* solar panels as flat rectangles (blue-ish) */}
        {[-1.6, 0, 1.6].map((x, i) => (
          <mesh key={i} position={[x, 0.07, 0]} rotation={[-0.15, 0, 0]}>
            <boxGeometry args={[1.4, 0.02, 2.6]} />
            <meshStandardMaterial color="#0b3b66" metalness={0.8} roughness={0.15} />
          </mesh>
        ))}
        <Html position={[0, -0.8, 0]} center>
          <div style={{ background: "rgba(255,255,255,0.9)", padding: 8, borderRadius: 6 }}>
            <strong>Solar Transport Hub</strong>
            <div style={{ fontSize: 12 }}>Rooftop PV panels — accessible design</div>
          </div>
        </Html>
      </group>

      {/* ramps and tactile paving */}
      <mesh position={[-3.5, 0.03, -1]} rotation={[0, 0.1, 0]}>
        <boxGeometry args={[2.2, 0.04, 1.2]} />
        <meshStandardMaterial color="#d3d3d3" />
      </mesh>
      <mesh position={[3.5, 0.03, -1]} rotation={[0, -0.1, 0]}>
        <boxGeometry args={[2.2, 0.04, 1.2]} />
        <meshStandardMaterial color="#d3d3d3" />
      </mesh>

      {/* tactile paving - yellow small tiles near ramp */}
      <group position={[0, 0.06, 2.6]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[-3 + i * 0.9, 0, 0]}>
            <boxGeometry args={[0.7, 0.02, 0.4]} />
            <meshStandardMaterial color="#f0c000" />
          </mesh>
        ))}
      </group>

      {/* sheltered seating area with space for mobility devices */}
      <group position={[0, 0.6, 1.6]}>
        <mesh position={[0, 0.36, 0]}>
          <boxGeometry args={[4, 0.06, 1.2]} />
          <meshStandardMaterial color="#e9eef0" />
        </mesh>
        {/* seats */}
        {[-1.2, 0, 1.2].map((x, i) => (
          <mesh key={i} position={[x, 0.15, 0]}>
            <boxGeometry args={[1, 0.26, 0.44]} />
            <meshStandardMaterial color="#7b8d8f" />
          </mesh>
        ))}
        <Html position={[0, 1.1, 0]} center>
          <div style={{ background: "rgba(255,255,255,0.9)", padding: 6, borderRadius: 6 }}>
            <div>Accessible seating area — space for mobility devices</div>
            <button
              style={{ marginTop: 6 }}
              onClick={() =>
                setFocus({
                  x: -6,
                  y: 2.2,
                  z: -1,
                  lookAt: { x: -6, y: 0.7, z: -1 },
                })
              }
            >
              Focus Hub
            </button>
          </div>
        </Html>
      </group>

      {/* bus stop sign */}
      <mesh position={[0, 1.1, -3.6]}>
        <cylinderGeometry args={[0.06, 0.06, 2.2, 12]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0, 2.3, -3.6]}>
        <circleGeometry args={[0.45, 24]} />
        <meshStandardMaterial color="#1976d2" />
      </mesh>
      <Text position={[0, 2.28, -3.55]} fontSize={0.18} color="#fff">
        BUS
      </Text>
    </group>
  );
}

/* ---------------------------
  Solar Bus — moves along a predefined route, stops at hub, doors open
---------------------------- */
function SolarBus({ path = [[-12, 0, 8], [-8, 0, 0], [-6, 0, -2], [-4, 0, 6]] }) {
  const ref = useRef();
  const doorRef = useRef();
  const hornRef = useRef();
  const [progress, setProgress] = useState(0);
  const [stopped, setStopped] = useState(false);
  const hubStopIndex = 2;
  const setAlert = useStore((s) => s.setAlert);

  useFrame((_, dt) => {
    // movement
    setProgress((p) => {
      if (stopped) return p;
      let np = p + dt * 0.05; // speed
      if (np > path.length) np = 0;
      // if approaching hubStop, decelerate and stop
      const idx = Math.floor(np) % path.length;
      if (idx === hubStopIndex && np % 1 > 0.85 && !stopped) {
        // stop
        setStopped(true);
        setTimeout(() => {
          // open doors and alert
          if (doorRef.current) {
            doorRef.current.scale.x = 0.02; // visualize open (thin door slides)
          }
          setAlert({ type: "info", message: "Bus arrived — doors opening" });
          setTimeout(() => {
            // close doors & resume
            if (doorRef.current) doorRef.current.scale.x = 1;
            setTimeout(() => {
              setStopped(false);
              setAlert(null);
            }, 800);
          }, 1400);
        }, 350);
      }
      return np;
    });

    // update position
    const t = progress;
    const l = path.length;
    const i = Math.floor(t) % l;
    const a = new THREE.Vector3(...path[i]);
    const b = new THREE.Vector3(...path[(i + 1) % l]);
    const f = t % 1;
    const pos = a.clone().lerp(b, f);
    if (ref.current) {
      ref.current.position.lerp(pos, 0.6); // smoother transform
      ref.current.lookAt(b);
    }
  });

  return (
    <group ref={ref}>
      {/* body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.0, 0.9]} />
        <meshStandardMaterial color="#d9eef7" metalness={0.2} roughness={0.4} />
      </mesh>
      {/* windows */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[2.0, 0.4, 0.4]} />
        <meshStandardMaterial color="#2b6a8a" transparent opacity={0.9} />
      </mesh>
      {/* door - represented as thin panel that scales to 'open' */}
      <mesh ref={doorRef} position={[0.9, -0.1, 0.2]}>
        <boxGeometry args={[0.9, 0.9, 0.02]} />
        <meshStandardMaterial color="#5b5b5b" />
      </mesh>
      {/* roof solar plate */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.5, 0.06, 0.7]} />
        <meshStandardMaterial color="#092a40" metalness={0.8} />
      </mesh>
    </group>
  );
}

/* ---------------------------
  Community Garden — raised beds, rain barrels, compost, emergency button, RGB LED
---------------------------- */
function CommunityGarden({ pos = [8, 0, -6] }) {
  const [gardenStatus, setGardenStatus] = useState("green"); // green / yellow / red
  const [waterLevel, setWaterLevel] = useState(0.8); // 0..1
  const [compostLevel, setCompostLevel] = useState(0.6);
  const setAlert = useStore((s) => s.setAlert);

  // periodic water evaporation (simulate)
  useEffect(() => {
    const id = setInterval(() => {
      setWaterLevel((w) => Math.max(0, w - Math.random() * 0.03));
      setCompostLevel((c) => Math.min(1, c + Math.random() * 0.02));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  // set gardenStatus based on waterLevel
  useEffect(() => {
    if (waterLevel < 0.25) setGardenStatus("red");
    else if (waterLevel < 0.5) setGardenStatus("yellow");
    else setGardenStatus("green");
  }, [waterLevel]);

  // emergency call handler
  function emergencyCall() {
    setAlert({ type: "emergency", message: "Emergency call: community manager alerted" });
    // clear alert after a while
    setTimeout(() => setAlert(null), 4500);
  }

  // simulate rain collection (click to add water)
  function collectRain() {
    setWaterLevel((w) => Math.min(1, w + 0.35));
  }

  return (
    <group position={pos}>
      {/* base platform */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[8, 0.04, 6]} />
        <meshStandardMaterial color="#f4f8f4" />
      </mesh>

      {/* raised beds (wheelchair height) */}
      {[-2.5, 0, 2.5].map((x, i) => (
        <group key={i} position={[x, 0.6, 0]}>
          <mesh>
            <boxGeometry args={[2.2, 0.6, 2.8]} />
            <meshStandardMaterial color="#8b6a46" />
          </mesh>
          {/* plants as green boxes that scale */}
          <group position={[0, 0.3, 0]}>
            {Array.from({ length: 6 }).map((_, k) => (
              <mesh key={k} position={[(-0.9 + (k % 3) * 0.9), 0, -0.75 + Math.floor(k / 3) * 1.5]}>
                <boxGeometry args={[0.6, 0.4 + 0.2 * Math.sin(k + i), 0.4]} />
                <meshStandardMaterial color="#2e8b57" />
              </mesh>
            ))}
          </group>
        </group>
      ))}

      {/* rain barrels */}
      <mesh position={[-3.6, 0.3, -2.2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.7, 12]} />
        <meshStandardMaterial color="#4f6d5a" />
      </mesh>
      <Html position={[-3.6, 0.9, -2.2]}>
        <div style={{ background: "rgba(255,255,255,0.9)", padding: 6, borderRadius: 6 }}>
          <div>Rain barrel: {Math.round(waterLevel * 100)}%</div>
          <button onClick={collectRain} style={{ marginTop: 6 }}>
            Collect Rain
          </button>
        </div>
      </Html>

      {/* composting container */}
      <mesh position={[3.6, 0.3, -2.2]}>
        <boxGeometry args={[0.8, 0.5, 0.9]} />
        <meshStandardMaterial color="#6b3f2f" />
      </mesh>
      <Html position={[3.6, 0.95, -2.2]}>
        <div style={{ background: "rgba(255,255,255,0.9)", padding: 6, borderRadius: 6 }}>
          <div>Compost: {Math.round(compostLevel * 100)}%</div>
        </div>
      </Html>

      {/* emergency call large button */}
      <group position={[0, 0.4, 2.5]}>
        <mesh onClick={emergencyCall} position={[0, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.12, 32]} />
          <meshStandardMaterial color="#d32f2f" metalness={0.1} />
        </mesh>
        <Html position={[0, 0.7, 0]}>
          <div style={{ background: "rgba(255,255,255,0.95)", padding: 6, borderRadius: 6 }}>
            <div style={{ fontWeight: "bold" }}>Emergency</div>
            <div style={{ fontSize: 12 }}>Press to alert manager</div>
          </div>
        </Html>
      </group>

      {/* RGB LED indicator tower */}
      <group position={[0, 1.4, -2.8]}>
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 1.0, 16]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial emissive={gardenStatus === "green" ? "#2ecc71" : gardenStatus === "yellow" ? "#f1c40f" : "#e74c3c"} color="#222" />
        </mesh>
        <Html position={[0, -0.2, 0]}>
          <div style={{ background: "rgba(255,255,255,0.95)", padding: 6, borderRadius: 6 }}>
            <div>Garden Status: {gardenStatus}</div>
          </div>
        </Html>
      </group>
    </group>
  );
}

/* ---------------------------
  Public Plaza — accessible paths, quiet zone, charging stations, interactive kiosk
---------------------------- */
function PublicPlaza({ pos = [0, 0, 6] }) {
  const setFocus = useStore((s) => s.setFocus);
  const [lang, setLang] = useState("EN"); // kiosk language
  // kiosk speak function using built-in speechSynthesis
  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "EN" ? "en-US" : "es-ES";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }
  return (
    <group position={pos}>
      {/* plaza platform */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[14, 0.04, 14]} />
        <meshStandardMaterial color="#efe9e0" />
      </mesh>

      {/* smooth accessible paths (simple raised strips) */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[12, 0.02, 3.5]} />
        <meshStandardMaterial color="#ddd" />
      </mesh>
      <mesh position={[0, 0.05, -2.0]} rotation={[0, Math.PI / 6, 0]}>
        <boxGeometry args={[9, 0.02, 3]} />
        <meshStandardMaterial color="#ddd" />
      </mesh>

      {/* quiet zone (benches + trees icon) */}
      <group position={[-4.5, 0.25, 2]}>
        <Text position={[0, 0.4, 0]} fontSize={0.2} color="#333">Quiet Zone</Text>
        <EcoBench pos={[0, 0, 0]} />
      </group>

      {/* charging station hub */}
      <group position={[4, 0.4, 1.6]}>
        <mesh>
          <boxGeometry args={[0.9, 0.9, 0.4]} />
          <meshStandardMaterial color="#2a2f36" />
        </mesh>
        <Html position={[0, 0.9, 0]}>
          <div style={{ background: "rgba(255,255,255,0.9)", padding: 6, borderRadius: 6 }}>
            <div>EV/Chair Charger</div>
            <div style={{ fontSize: 12 }}>2 ports</div>
            <button style={{ marginTop: 6 }} onClick={() => setFocus({ x: 0, y: 3.5, z: 6, lookAt: { x: 0, y: 0.5, z: 6 } })}>
              Focus Plaza
            </button>
          </div>
        </Html>
      </group>

      {/* interactive kiosk */}
      <group position={[0, 0.9, -3.8]}>
        <mesh>
          <boxGeometry args={[0.6, 1.2, 0.2]} />
          <meshStandardMaterial color="#1f2933" />
        </mesh>
        <Html position={[0, 0.8, 0.15]}>
          <div style={{ width: 160, background: "rgba(255,255,255,0.95)", padding: 8, borderRadius: 6 }}>
            <div style={{ fontWeight: "bold" }}>Info Kiosk</div>
            <div style={{ marginTop: 6 }}>
              <button onClick={() => { setLang("EN"); speak("Welcome. Use this kiosk for information."); }} style={{ marginRight: 6 }}>
                English
              </button>
              <button onClick={() => { setLang("ES"); speak("Bienvenido. Use este kiosco para información."); }}>
                Español
              </button>
            </div>
            <div style={{ marginTop: 8, fontSize: 12 }}>
              Audio reader available — choose language to listen.
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}

/* ---------------------------
  HUD (top-left) and controls instructions
---------------------------- */
function HUD() {
  const alert = useStore((s) => s.alert);
  return (
    <div style={{ position: "absolute", left: 14, top: 12, zIndex: 50 }}>
      {alert ? (
        <div style={{ background: "rgba(220,50,50,0.95)", padding: "8px 12px", color: "#fff", borderRadius: 6 }}>
          <strong>{alert.message}</strong>
        </div>
      ) : (
        <div style={{ background: "rgba(255,255,255,0.95)", padding: "6px 10px", borderRadius: 6 }}>
          Smart City — systems nominal
        </div>
      )}
    </div>
  );
}

/* ---------------------------
  Main Scene — assemble modules
---------------------------- */
export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <HUD />
      <Canvas shadows camera={{ position: [18, 14, 18], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={0.9} castShadow />
        <Suspense fallback={null}>
          <Sky sunPosition={[100, 20, 100]} />
          <GroundTiles />
          {/* modules */}
          <TransportationHub />
          <SolarBus />
          <CommunityGarden />
          <PublicPlaza />
          <ContactShadows position={[0, -0.1, 0]} opacity={0.4} width={36} blur={2} far={10} />
        </Suspense>

        <OrbitControls makeDefault enablePan enableRotate enableZoom />
        <CameraController />
      </Canvas>

      {/* bottom-right instructions */}
      <div style={{ position: "absolute", right: 14, bottom: 14, zIndex: 50, background: "rgba(255,255,255,0.95)", padding: 10, borderRadius: 8 }}>
        <div style={{ fontSize: 13 }}>Controls: Drag to rotate, scroll to zoom.</div>
        <div style={{ fontSize: 13, marginTop: 6 }}>Click buttons in scene to interact (kiosk, emergency, hub focus, etc.)</div>
      </div>
    </div>
  );
}

/* bootstrap for testing if included directly */
if (typeof document !== "undefined") {
  try {
    const el = document.getElementById("root");
    if (el) {
      const root = createRoot(el);
      root.render(<App />);
    }
  } catch (e) {}
}
