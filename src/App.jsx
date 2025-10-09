// src/App.jsx
import React, { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, useGLTF, ContactShadows, Sky, Text } from '@react-three/drei'
import * as THREE from 'three'
import create from 'zustand'

/* ----- simple store ----- */
const useStore = create((set) => ({
  alert: null,
  setAlert: (a) => set({ alert: a }),
  focus: null,
  setFocus: (f) => set({ focus: f }),
}))

/* ----- Camera controller for \"enter\" actions ----- */
function CameraController() {
  const { camera } = useThree()
  const focus = useStore((s) => s.focus)
  useFrame(() => {
    if (!focus) return
    const tgt = new THREE.Vector3(focus.x, focus.y, focus.z)
    camera.position.lerp(tgt, 0.06)
    camera.lookAt(focus.lookAt.x, focus.lookAt.y, focus.lookAt.z)
  })
  return null
}

/* ----- ModelLoader: tries to load a glb, fallback to provided component ----- */
function ModelLoader({ src, fallback: Fallback, ...props }) {
  if (!src) return Fallback ? <Fallback {...props} /> : null
  try {
    const gltf = useGLTF(src)
    return <primitive object={gltf.scene.clone()} {...props} dispose={null} />
  } catch (e) {
    // if loading fails, return fallback
    return Fallback ? <Fallback {...props} /> : null
  }
}

/* ----- Ground tiles and subtle shadows ----- */
function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color={"#dcdad1"} />
      </mesh>
      <ContactShadows position={[0, -0.03, 0]} opacity={0.25} width={50} blur={3} far={20} />
    </>
  )
}

/* ----- Parametric bench (procedural) ----- */
function EcoBench({ position = [0, 0, 0] }) {
  // simple procedural bench made from curved boxes
  return (
    <group position={position}>
      <mesh position={[0, 0.38, 0]}>
        <boxGeometry args={[1.6, 0.12, 0.4]} />
        <meshStandardMaterial color={"#6b8f65"} />
      </mesh>
      <mesh position={[-0.6, 0.12, 0]}>
        <boxGeometry args={[0.12, 0.24, 0.12]} />
        <meshStandardMaterial color={"#4a4a4a"} />
      </mesh>
      <mesh position={[0.6, 0.12, 0]}>
        <boxGeometry args={[0.12, 0.24, 0.12]} />
        <meshStandardMaterial color={"#4a4a4a"} />
      </mesh>
    </group>
  )
}

/* =========================
   1) Transportation Hub
   - rooftop solar panels (flat shapes)
   - ramps (wheelchair) + tactile paving
   - sheltered seating with space for mobility devices
   - bus stop marker
   ========================= */
function HubFallback({ position = [-8, 0, -2] }) {
  return (
    <group position={position}>
      {/* platform */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[8, 0.04, 8]} />
        <meshStandardMaterial color={"#f6f4f1"} />
      </mesh>
      {/* solar roof frame */}
      <mesh position={[0, 2.2, -2]}>
        <boxGeometry args={[6.2, 0.12, 3.2]} />
        <meshStandardMaterial color={"#2d2d2d"} metalness={0.7} roughness={0.2} />
      </mesh>
      {/* panels */}
      {[-1.8, 0, 1.8].map((x, i) => (
        <mesh key={i} position={[x, 2.25, -2]}>
          <boxGeometry args={[1.4, 0.02, 2.6]} />
          <meshStandardMaterial color={"#083451"} metalness={0.8} roughness={0.15} />
        </mesh>
      ))}
      {/* ramps */}
      <mesh position={[-3.6, 0.03, -1]} rotation={[0, 0.12, 0]}>
        <boxGeometry args={[2.2, 0.04, 1.2]} />
        <meshStandardMaterial color={"#d3d3d3"} />
      </mesh>
      <mesh position={[3.6, 0.03, -1]} rotation={[0, -0.12, 0]}>
        <boxGeometry args={[2.2, 0.04, 1.2]} />
        <meshStandardMaterial color={"#d3d3d3"} />
      </mesh>
      {/* tactile paving */}
      <group position={[0, 0.06, 2.6]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[-3 + i * 0.9, 0, 0]}>
            <boxGeometry args={[0.7, 0.02, 0.4]} />
            <meshStandardMaterial color={"#f0c000"} />
          </mesh>
        ))}
      </group>

      {/* sheltered seating / wheelchair space */}
      <mesh position={[0, 0.6, 1.6]}>
        <boxGeometry args={[4, 0.06, 1.2]} />
        <meshStandardMaterial color={"#e9eef0"} />
      </mesh>
    </group>
  )
}

/* Solar bus with stop behavior */
function SolarBus({ path = [[-14, 0, 8], [-9, 0, 0], [-8, 0, -2], [-6, 0, 6]] }) {
  const ref = useRef()
  const doorRef = useRef()
  const [t, setT] = useState(0)
  const [stopped, setStopped] = useState(false)
  const setAlert = useStore((s) => s.setAlert)

  useFrame((_, dt) => {
    setT((cur) => {
      let nt = cur
      if (!stopped) nt = cur + dt * 0.05
      // loop
      if (nt > path.length) nt = 0
      // check approaching hub stop (index 2)
      const idx = Math.floor(nt) % path.length
      if (idx === 2 && (nt % 1) > 0.8 && !stopped) {
        setStopped(true)
        // open door and alert
        if (doorRef.current) doorRef.current.scale.x = 0.02
        setAlert({ type: "info", message: "Bus arrived — doors opening" })
        setTimeout(() => {
          if (doorRef.current) doorRef.current.scale.x = 1
          setTimeout(() => {
            setStopped(false)
            setAlert(null)
          }, 700)
        }, 1200)
      }
      return nt
    })

    // update position
    if (ref.current) {
      const tt = t
      const l = path.length
      const i = Math.floor(tt) % l
      const a = new THREE.Vector3(...path[i])
      const b = new THREE.Vector3(...path[(i + 1) % l])
      const f = tt % 1
      const pos = a.clone().lerp(b, f)
      ref.current.position.lerp(pos, 0.6)
      ref.current.lookAt(b)
    }
  })

  return (
    <group ref={ref}>
      <mesh castShadow>
        <boxGeometry args={[2.2, 1.0, 0.9]} />
        <meshStandardMaterial color={"#e9f3f7"} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[2.0, 0.36, 0.4]} />
        <meshStandardMaterial color={"#2d6b85"} transparent opacity={0.9} />
      </mesh>
      <mesh ref={doorRef} position={[0.9, -0.1, 0.2]}>
        <boxGeometry args={[0.9, 0.9, 0.02]} />
        <meshStandardMaterial color={"#5b5b5b"} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.5, 0.06, 0.7]} />
        <meshStandardMaterial color={"#062a3a"} />
      </mesh>
    </group>
  )
}

/* =========================
   2) Community Garden
   - multi-level raised beds (wheelchair height)
   - rain barrels, compost
   - big emergency button & RGB LED
   ========================= */
function GardenFallback({ position = [8, 0, -6] }) {
  const [water, setWater] = useState(0.8)
  const [compost, setCompost] = useState(0.4)
  const [status, setStatus] = useState('green')
  const setAlert = useStore((s) => s.setAlert)

  useEffect(() => {
    const id = setInterval(() => {
      setWater((w) => Math.max(0, w - Math.random() * 0.03))
      setCompost((c) => Math.min(1, c + Math.random() * 0.02))
    }, 1800)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (water < 0.25) setStatus('red')
    else if (water < 0.5) setStatus('yellow')
    else setStatus('green')
  }, [water])

  function emergency() {
    setAlert({ type: 'emergency', message: 'Emergency: manager alerted' })
    setTimeout(() => setAlert(null), 4200)
  }
  function rainCollect() {
    setWater((w) => Math.min(1, w + 0.4))
  }

  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[8, 0.04, 6]} />
        <meshStandardMaterial color={"#f3f8f2"} />
      </mesh>

      {/* raised beds at accessible height */}
      {[-2.5, 0, 2.5].map((x, i) => (
        <group key={i} position={[x, 0.6, 0]}>
          <mesh>
            <boxGeometry args={[2.2, 0.6, 2.8]} />
            <meshStandardMaterial color={"#8b6a46"} />
          </mesh>
          <group position={[0, 0.28, 0]}>
            {Array.from({ length: 6 }).map((_, k) => (
              <mesh key={k} position={[(-0.9 + (k % 3) * 0.9), 0, -0.75 + Math.floor(k / 3) * 1.5]}>
                <boxGeometry args={[0.6, 0.4 + 0.1 * Math.sin(k + i), 0.4]} />
                <meshStandardMaterial color={"#2e8b57"} />
              </mesh>
            ))}
          </group>
        </group>
      ))}

      {/* rain barrel */}
      <mesh position={[-3.6, 0.35, -2.25]}>
        <cylinderGeometry args={[0.3, 0.3, 0.7, 12]} />
        <meshStandardMaterial color={"#47685b"} />
      </mesh>
      <Html position={[-3.6, 0.95, -2.25]}>
        <div style={{ background: 'rgba(255,255,255,0.95)', padding: 6, borderRadius: 6 }}>
          Rain barrel: {Math.round(water * 100)}%
          <div style={{ marginTop: 6 }}><button onClick={rainCollect}>Collect Rain</button></div>
        </div>
      </Html>

      {/* compost unit */}
      <mesh position={[3.6, 0.35, -2.25]}>
        <boxGeometry args={[0.8, 0.5, 0.9]} />
        <meshStandardMaterial color={"#6b3f2f"} />
      </mesh>
      <Html position={[3.6, 0.95, -2.25]}>
        <div style={{ background: 'rgba(255,255,255,0.95)', padding: 6, borderRadius: 6 }}>
          Compost: {Math.round(compost * 100)}%
        </div>
      </Html>

      {/* emergency call big button */}
      <mesh onClick={emergency} position={[0, 0.4, 2.5]}>
        <cylinderGeometry args={[0.5, 0.5, 0.12, 32]} />
        <meshStandardMaterial color={"#c62828"} />
      </mesh>
      <Html position={[0, 0.95, 2.5]}>
        <div style={{ background: 'rgba(255,255,255,0.95)', padding: 6, borderRadius: 6 }}>
          <div><strong>Emergency</strong></div>
          <small>Press to alert manager</small>
        </div>
      </Html>

      {/* RGB LED indicator */}
      <group position={[0, 1.4, -2.8]}>
        <mesh>
          <cylinderGeometry args={[0.22, 0.22, 1.0, 16]} />
          <meshStandardMaterial color={"#222"} />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial emissive={status === 'green' ? '#2ecc71' : status === 'yellow' ? '#f1c40f' : '#e74c3c'} color={'#000'} />
        </mesh>
        <Html position={[0, -0.2, 0]}>
          <div style={{ background: 'rgba(255,255,255,0.95)', padding: 6, borderRadius: 6 }}>
            Garden Status: {status}
          </div>
        </Html>
      </group>
    </group>
  )
}

/* =========================
   3) Public Plaza
   - smooth accessible pathways
   - quiet zone bench
   - EV/wheelchair charging hub
   - interactive kiosk with language + TTS
   ========================= */
function PlazaFallback({ position = [0, 0, 8] }) {
  const [lang, setLang] = useState('EN')
  function speak(text) {
    if (!("speechSynthesis" in window)) return
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang === 'EN' ? 'en-US' : 'es-ES'
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  }

  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[14, 0.04, 14]} />
        <meshStandardMaterial color={"#efe9e0"} />
      </mesh>

      {/* accessible paths */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[12, 0.02, 3.5]} />
        <meshStandardMaterial color={"#ddd"} />
      </mesh>

      {/* quiet zone & bench */}
      <group position={[-4.5, 0.25, 2]}>
        <Text position={[0, 0.4, 0]} fontSize={0.16}>Quiet Zone</Text>
        <EcoBench position={[0, 0, 0]} />
      </group>

      {/* charger unit */}
      <group position={[4, 0.4, 1.6]}>
        <mesh>
          <boxGeometry args={[0.9, 0.9, 0.4]} />
          <meshStandardMaterial color={"#2a2f36"} />
        </mesh>
        <Html position={[0, 0.95, 0]}>
          <div style={{ background: 'rgba(255,255,255,0.95)', padding: 6, borderRadius: 6 }}>
            EV/Chair Charger (2 ports)
          </div>
        </Html>
      </group>

      {/* info kiosk */}
      <group position={[0, 1.05, -3.8]}>
        <mesh>
          <boxGeometry args={[0.6, 1.2, 0.22]} />
          <meshStandardMaterial color={"#1f2933"} />
        </mesh>
        <Html position={[0, 0.8, 0.18]}>
          <div style={{ width: 160, background: 'rgba(255,255,255,0.95)', padding: 8, borderRadius: 6 }}>
            <div style={{ fontWeight: 'bold' }}>Info Kiosk</div>
            <div style={{ marginTop: 6 }}>
              <button onClick={() => { setLang('EN'); speak('Welcome. Use this kiosk for information.'); }}>English</button>
              <button style={{ marginLeft: 6 }} onClick={() => { setLang('ES'); speak('Bienvenido. Use este kiosco para información.'); }}>Español</button>
            </div>
            <div style={{ marginTop: 8, fontSize: 12 }}>Audio reader available.</div>
          </div>
        </Html>
      </group>
    </group>
  )
}

/* ----- HUD overlay ----- */
function HUD() {
  const alert = useStore((s) => s.alert)
  return (
    <div style={{ position: 'absolute', left: 12, top: 12, zIndex: 50 }}>
      {alert ? (
        <div style={{ background: 'rgba(220,50,50,0.95)', padding: '8px 12px', color: '#fff', borderRadius: 6 }}>
          <strong>{alert.message}</strong>
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.95)', padding: '6px 10px', borderRadius: 6 }}>
          Smart City — systems nominal
        </div>
      )}
    </div>
  )
}

/* ===== Main App: assemble everything. ===== */
export default function App() {
  // If you exported a full city glb from Tinkercad as /models/smartcity.glb it will be loaded; otherwise fallbacks render.
  const hasSmartCity = true // keep true so we use individual model loaders; if you want to load a single big glb, set src below
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <HUD />
      <Canvas shadows camera={{ position: [24, 18, 24], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={1.0} castShadow />
        <Suspense fallback={null}>
          <Sky sunPosition={[100, 20, 100]} />
          <Ground />

          {/* Transportation Hub: try to load /models/hub.glb else fallback */}
          <ModelLoader src="/models/hub.glb" fallback={HubFallback} position={[-8, 0, -2]} />

          {/* Bus (fallback) */}
          <SolarBus />

          {/* Community Garden */}
          <ModelLoader src="/models/garden.glb" fallback={GardenFallback} position={[8, 0, -6]} />

          {/* Public Plaza */}
          <ModelLoader src="/models/plaza.glb" fallback={PlazaFallback} position={[0, 0, 8]} />

          <ContactShadows position={[0, -0.1, 0]} opacity={0.35} width={40} blur={2} far={10} />
        </Suspense>

        <OrbitControls makeDefault enablePan enableRotate enableZoom />
        <CameraController />
      </Canvas>

      <div style={{ position: 'absolute', right: 12, bottom: 12, zIndex: 50, background: 'rgba(255,255,255,0.95)', padding: 10, borderRadius: 8 }}>
        <div style={{ fontSize: 13 }}>Controls: drag rotate • scroll zoom • click scene buttons</div>
      </div>
    </div>
  )
}
