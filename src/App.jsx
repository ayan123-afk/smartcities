// SmartCity.jsx
// Single-file React + react-three-fiber demo of an interactive smart-city model.
// Features implemented (simulated):
// - Buildings (glass-like)
// - Greenhouse with simulated CO2 sensor, automatic vent and particle emission when CO2 high
// - Crop growth animation inside greenhouse
// - Solar bus moving along a path
// - Trash bins that send trash to a recycling plant where a 4-stage process is visualized
// - Ability to "enter" a house (camera moves inside)
// - Zoom in/out, orbit controls, click-to-focus
// - HUD overlay showing alerts and key stats
// How to run (use Vite + React):
// 1) npm create vite@latest my-smartcity -- --template react
// 2) cd my-smartcity
// 3) npm install three @react-three/fiber @react-three/drei zustand
// 4) Replace src/App.jsx with this file content and ensure index.css exists
// 5) npm run dev

import React, { useRef, useState, useEffect, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, Stars, Text } from '@react-three/drei'
import * as THREE from 'three'
import create from 'zustand'

// --- Simple global store for selections and alerts ---
const useStore = create((set) => ({
  alert: null,
  setAlert: (a) => set({ alert: a }),
  focusPos: null,
  setFocus: (p) => set({ focusPos: p }),
}))

// --- Camera helper to smoothly move to focus position ---
function CameraController() {
  const { camera } = useThree()
  const focusPos = useStore((s) => s.focusPos)
  useFrame((_, dt) => {
    if (focusPos) {
      camera.position.lerp(new THREE.Vector3(focusPos.x, focusPos.y, focusPos.z), 0.06)
      camera.lookAt(focusPos.lookAt.x, focusPos.lookAt.y, focusPos.lookAt.z)
    }
  })
  return null
}

// --- Simple building component (with glass material) ---
function Building({ pos = [0, 0, 0], size = [4, 8, 4], glass = true, name }) {
  return (
    <group position={pos}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshPhysicalMaterial
          transparent={true}
          opacity={glass ? 0.25 : 1}
          metalness={0.5}
          roughness={0.2}
          clearcoat={0.3}
        />
      </mesh>
      {name && (
        <Text position={[0, size[1] / 2 + 0.5, 0]} fontSize={0.4} anchorX="center">
          {name}
        </Text>
      )}
    </group>
  )
}

// --- Greenhouse with CO2 sensor and vent animation ---
function Greenhouse({ pos = [10, 0, -6] }) {
  const [co2, setCo2] = useState(350) // ppm base
  const ventRef = useRef()
  const particles = useRef()
  const setAlert = useStore((s) => s.setAlert)

  // simulate CO2 variations
  useFrame((_, dt) => {
    // slight random walk
    setCo2((c) => Math.max(300, c + (Math.random() - 0.5) * 10))
  })

  // check threshold every second
  useEffect(() => {
    const id = setInterval(() => {
      setCo2((c) => {
        const next = c + (Math.random() * 40 - 10)
        if (next > 1000) {
          setAlert({ type: 'CO2', message: 'High CO2 in greenhouse: ' + Math.round(next) + ' ppm' })
        } else if (next > 700) {
          setAlert({ type: 'CO2-warn', message: 'CO2 rising: ' + Math.round(next) + ' ppm' })
        } else {
          setAlert(null)
        }
        return Math.round(next)
      })
    }, 1200)
    return () => clearInterval(id)
  }, [])

  // vent animation reacts to co2
  useFrame(() => {
    if (ventRef.current) {
      const target = co2 > 800 ? Math.PI / 3 : co2 > 500 ? Math.PI / 8 : 0.01
      ventRef.current.rotation.x = THREE.MathUtils.lerp(ventRef.current.rotation.x, target, 0.03)
    }
    // simple particle scale to indicate outflow
    if (particles.current) {
      const scale = THREE.MathUtils.mapLinear(co2, 300, 1200, 0.1, 2)
      particles.current.scale.setScalar(scale)
      particles.current.material.opacity = THREE.MathUtils.clamp((co2 - 300) / 900, 0.02, 0.9)
    }
  })

  return (
    <group position={pos}>
      {/* glass dome */}
      <mesh>
        <sphereGeometry args={[3.2, 32, 32, Math.PI]} />
        <meshPhysicalMaterial transparent opacity={0.18} metalness={0.6} roughness={0.05} />
      </mesh>
      {/* base */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[3.2, 3.2, 0.6, 32]} />
        <meshStandardMaterial />
      </mesh>

      {/* vent (a flap) */}
      <group ref={ventRef} position={[0, 3.2, 0]}>
        <mesh>
          <boxGeometry args={[1.8, 0.1, 2]} />
          <meshStandardMaterial emissive={co2 > 800 ? 'orange' : 'white'} />
        </mesh>
      </group>

      {/* crop inside (simple green boxes that grow) */}
      <Crops />

      {/* particle that shows CO2 coming out */}
      <mesh ref={particles} position={[0, 4.2, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial transparent opacity={0.1} />
      </mesh>

      {/* HUD label */}
      <Html position={[0, 3.6, 0]} center>
        <div style={{ background: 'rgba(255,255,255,0.75)', padding: '6px 8px', borderRadius: 6 }}>
          <strong>Greenhouse</strong>
          <div>CO2: {co2} ppm</div>
        </div>
      </Html>
    </group>
  )
}

function Crops() {
  const group = useRef()
  useFrame((state, dt) => {
    if (group.current) {
      const t = state.clock.getElapsedTime()
      for (let i = 0; i < group.current.children.length; i++) {
        const m = group.current.children[i]
        m.scale.y = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(t * 0.6 + i))
      }
    }
  })
  return (
    <group ref={group} position={[0, 0.5, 0]}>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[(i % 4) - 1.5, 0, Math.floor(i / 4) - 0.5]}>
          <boxGeometry args={[0.6, 0.6, 0.2]} />
          <meshStandardMaterial color={'green'} />
        </mesh>
      ))}
    </group>
  )
}

// --- Bus that moves along a path ---
function SolarBus({ pathPoints = [[-12, 0, 8], [-6, 0, 12], [2, 0, 10], [10, 0, 12]] }) {
  const ref = useRef()
  let t = 0
  useFrame((_, dt) => {
    t += dt * 0.08
    const l = pathPoints.length
    const idx = Math.floor(t % l)
    const p0 = new THREE.Vector3(...pathPoints[idx])
    const p1 = new THREE.Vector3(...pathPoints[(idx + 1) % l])
    const f = t % 1
    const pos = p0.clone().lerp(p1, f)
    ref.current.position.copy(pos)
    // yaw
    ref.current.lookAt(p1)
  })
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[1.6, 0.8, 0.8]} />
        <meshStandardMaterial metalness={0.3} roughness={0.6} />
      </mesh>
      {/* small solar panel */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[1.2, 0.05, 0.6]} />
        <meshStandardMaterial emissive={'#223344'} metalness={0.7} />
      </mesh>
    </group>
  )
}

// --- Trash bin and moving trash simulation ---
function TrashBin({ pos = [-6, 0, -4], plantPos = [14, 0, -10], id = 0 }) {
  const [trash, setTrash] = useState([])
  useEffect(() => {
    // periodically create trash items (as spheres)
    const idt = setInterval(() => {
      setTrash((t) => [...t, { id: Date.now(), progress: 0 }])
    }, 3500 + Math.random() * 3000)
    return () => clearInterval(idt)
  }, [])

  useFrame((_, dt) => {
    setTrash((items) =>
      items
        .map((it) => ({ ...it, progress: Math.min(1, it.progress + dt * 0.2) }))
        .filter((it) => it.progress < 1.001)
    )
  })

  return (
    <group position={pos}>
      <mesh>
        <cylinderGeometry args={[0.6, 0.6, 0.8, 12]} />
        <meshStandardMaterial color={'#555'} />
      </mesh>
      {trash.map((it, idx) => {
        // simple linear path to plantPos
        const p0 = new THREE.Vector3(...pos)
        const p1 = new THREE.Vector3(...plantPos)
        const p = p0.lerp(p1, it.progress)
        return (
          <mesh key={it.id} position={[p.x, 0.25, p.z]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color={'#7f7f7f'} />
          </mesh>
        )
      })}
    </group>
  )
}

// --- Recycling plant showing 4R stages ---
function RecyclingPlant({ pos = [14, 0, -10] }) {
  return (
    <group position={pos}>
      <Building pos={[0, 0, 0]} size={[6, 4, 6]} glass={false} name={'Recycling Plant'} />
      {/* conveyor and 4R labels */}
      <Html position={[0, 2.6, 3]}>
        <div style={{ background: 'rgba(255,255,255,0.9)', padding: 8, borderRadius: 6 }}>
          <strong>4R Process</strong>
          <ol style={{ margin: 6 }}>
            <li>Reduce</li>
            <li>Reuse</li>
            <li>Recycle</li>
            <li>Recover</li>
          </ol>
        </div>
      </Html>
    </group>
  )
}

// --- Small house you can "enter" ---
function SmartHouse({ pos = [0, 0, -10] }) {
  const setFocus = useStore((s) => s.setFocus)
  return (
    <group position={pos}>
      <mesh castShadow>
        <boxGeometry args={[4, 3, 4]} />
        <meshStandardMaterial color={'#ddeeff'} />
      </mesh>
      <mesh position={[0, 1.7, -1.9]}>
        <boxGeometry args={[1.2, 2, 0.1]} />
        <meshStandardMaterial color={'#333'} />
      </mesh>
      <Html position={[0, 2.4, 0]}>
        <div style={{ background: 'rgba(255,255,255,0.9)', padding: 6, borderRadius: 6 }}>
          <div>Smart House</div>
          <button
            onClick={() =>
              setFocus({ x: pos[0], y: 1.5, z: pos[2] + 0.1, lookAt: { x: pos[0], y: 1.5, z: pos[2] } })
            }
            style={{ marginTop: 6 }}
          >
            Enter House
          </button>
        </div>
      </Html>
    </group>
  )
}

// --- HUD overlay in DOM ---
function HUD() {
  const alert = useStore((s) => s.alert)
  return (
    <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10 }}>
      {alert ? (
        <div style={{ background: 'rgba(255,80,80,0.95)', color: 'white', padding: '8px 10px', borderRadius: 6 }}>
          <strong>{alert.message}</strong>
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.9)', padding: '6px 8px', borderRadius: 6 }}>
          Smart City: All systems nominal
        </div>
      )}
    </div>
  )
}

export default function SmartCityScene() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <HUD />
      <Canvas shadows camera={{ position: [20, 12, 20], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={0.8} castShadow />
        <Suspense fallback={null}>
          <Stars />
          <group>
            {/* ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[200, 200]} />
              <meshStandardMaterial color={'#cce8c6'} />
            </mesh>

            {/* some buildings */}
            <Building pos={[-8, 0, 6]} size={[6, 10, 6]} name={'Office'} />
            <Building pos={[-2, 0, 6]} size={[5, 7, 5]} name={'Mall'} />
            <SmartHouse pos={[0, 0, -10]} />
            <Greenhouse pos={[10, 0, -6]} />
            <RecyclingPlant pos={[14, 0, -10]} />

            {/* trash bins */}
            <TrashBin pos={[-6, 0, -4]} plantPos={[14, 0, -10]} />
            <TrashBin pos={[-4, 0, 2]} plantPos={[14, 0, -10]} />

            {/* bus */}
            <SolarBus />
          </group>
        </Suspense>

        <OrbitControls />
        <CameraController />
      </Canvas>

      {/* little instructions */}
      <div style={{ position: 'absolute', right: 12, bottom: 12, zIndex: 10, background: 'rgba(255,255,255,0.9)', padding: 8, borderRadius: 6 }}>
        Controls: Drag to rotate, scroll to zoom. Click "Enter House" above to move camera inside.
      </div>
    </div>
  )
}

// If the user wants to run this file directly (standalone for testing), we expose a small bootstrapping
if (typeof document !== 'undefined') {
  try {
    const container = document.getElementById('root')
    if (container) {
      const root = createRoot(container)
      root.render(<SmartCityScene />)
    }
  } catch (e) {
    // running inside a module environment where root is handled elsewhere
  }
}
