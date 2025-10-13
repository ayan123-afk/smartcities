// src/App.jsx
import React, { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, useGLTF, ContactShadows, Sky, Text, Environment } from '@react-three/drei'
import * as THREE from 'three'
import create from 'zustand'

/* ----- Simple store ----- */
const useStore = create((set) => ({
  alert: null,
  setAlert: (a) => set({ alert: a }),
  focus: null,
  setFocus: (f) => set({ focus: f }),
}))

/* ----- Camera controller ----- */
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

/* ----- ModelLoader ----- */
function ModelLoader({ src, fallback: Fallback, ...props }) {
  if (!src) return Fallback ? <Fallback {...props} /> : null
  try {
    const gltf = useGLTF(src)
    return <primitive object={gltf.scene.clone()} {...props} dispose={null} />
  } catch (e) {
    return Fallback ? <Fallback {...props} /> : null
  }
}

/* ----- Ground ----- */
function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color={"#2d5016"} />
      </mesh>
      <ContactShadows position={[0, -0.03, 0]} opacity={0.3} width={50} blur={2} far={20} />
    </>
  )
}

/* ----- Simple Building ----- */
function SmartBuilding({ position = [0, 0, 0], height = 8, color = "#4a6572" }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3, height, 3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Simple windows */}
      {Array.from({ length: Math.floor(height / 2) }).map((_, floor) => 
        [-1, 1].map((side, i) => (
          <mesh 
            key={`${floor}-${side}`} 
            position={[1.51, (floor * 2) - height/2 + 2, side * 0.8]} 
            castShadow
          >
            <boxGeometry args={[0.02, 1.2, 0.8]} />
            <meshStandardMaterial color={"#2c3e50"} />
          </mesh>
        ))
      )}
    </group>
  )
}

/* ----- Bench ----- */
function EcoBench({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.38, 0]} castShadow>
        <boxGeometry args={[1.6, 0.12, 0.4]} />
        <meshStandardMaterial color={"#6b8f65"} />
      </mesh>
      <mesh position={[-0.6, 0.12, 0]} castShadow>
        <boxGeometry args={[0.12, 0.24, 0.12]} />
        <meshStandardMaterial color={"#4a4a4a"} />
      </mesh>
      <mesh position={[0.6, 0.12, 0]} castShadow>
        <boxGeometry args={[0.12, 0.24, 0.12]} />
        <meshStandardMaterial color={"#4a4a4a"} />
      </mesh>
    </group>
  )
}

/* ----- Transportation Hub ----- */
function HubFallback({ position = [-8, 0, -2] }) {
  return (
    <group position={position}>
      {/* Platform */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[12, 0.04, 10]} />
        <meshStandardMaterial color={"#f6f4f1"} />
      </mesh>
      
      {/* Solar roof */}
      <mesh position={[0, 3.5, -2]} castShadow>
        <boxGeometry args={[8, 0.15, 4]} />
        <meshStandardMaterial color={"#2d2d2d"} />
      </mesh>
      
      {/* Solar panels */}
      {[-2.5, 0, 2.5].map((x, i) => (
        <mesh key={i} position={[x, 3.6, -2]} castShadow>
          <boxGeometry args={[2, 0.02, 3]} />
          <meshStandardMaterial color={"#083451"} />
        </mesh>
      ))}
      
      {/* Digital display */}
      <Html position={[0, 2.5, 4]} transform>
        <div style={{
          background: '#3498db',
          padding: '12px 20px',
          borderRadius: '12px',
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          <div>🚌 Next Bus: 5 min</div>
          <div>👥 Waiting: 3</div>
        </div>
      </Html>

      {/* Waiting area */}
      <group position={[0, 0.6, 2]}>
        <mesh receiveShadow>
          <boxGeometry args={[6, 0.06, 2]} />
          <meshStandardMaterial color={"#e9eef0"} />
        </mesh>
        {[-2, 0, 2].map((x, i) => (
          <EcoBench key={i} position={[x, 0.3, 0]} />
        ))}
      </group>
    </group>
  )
}

/* ----- Solar Bus ----- */
function SolarBus({ path = [[-20, 0, 12], [-12, 0, 5], [-8, 0, -2], [-4, 0, 8], [-15, 0, 15]] }) {
  const busRef = useRef()
  const [t, setT] = useState(0)

  useFrame((_, dt) => {
    setT((cur) => {
      let nt = cur + dt * 0.04
      if (nt > path.length) nt = 0
      return nt
    })

    if (busRef.current) {
      const tt = t
      const l = path.length
      const i = Math.floor(tt) % l
      const a = new THREE.Vector3(...path[i])
      const b = new THREE.Vector3(...path[(i + 1) % l])
      const f = tt % 1
      const pos = a.clone().lerp(b, f)
      busRef.current.position.lerp(pos, 0.8)
      busRef.current.lookAt(b)
    }
  })

  return (
    <group ref={busRef}>
      {/* Bus body */}
      <mesh castShadow>
        <boxGeometry args={[3, 1.2, 1.5]} />
        <meshStandardMaterial color={"#3498db"} />
      </mesh>
      
      {/* Windows */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[2.8, 0.5, 1.3]} />
        <meshStandardMaterial color={"#2c3e50"} transparent opacity={0.7} />
      </mesh>
      
      {/* Wheels */}
      {[-1, 1].map((side, i) => (
        <mesh key={i} position={[side * 0.8, -0.4, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} rotation={[0, 0, Math.PI/2]} />
          <meshStandardMaterial color={"#2c3e50"} />
        </mesh>
      ))}
    </group>
  )
}

/* ----- Community Garden ----- */
function GardenFallback({ position = [8, 0, -6] }) {
  const [water, setWater] = useState(0.8)

  return (
    <group position={position}>
      {/* Garden base */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[12, 0.04, 8]} />
        <meshStandardMaterial color={"#27ae60"} />
      </mesh>

      {/* Raised beds */}
      {[-3, 0, 3].map((x, i) => (
        <group key={i} position={[x, 0.6, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.5, 0.6, 2.8]} />
            <meshStandardMaterial color={"#8b4513"} />
          </mesh>
          
          {/* Plants */}
          <group position={[0, 0.35, 0]}>
            {Array.from({ length: 6 }).map((_, k) => (
              <mesh 
                key={k} 
                position={[(-0.9 + (k % 3) * 0.9), 0.3, -0.75 + Math.floor(k / 3) * 1.5]} 
                castShadow
              >
                <boxGeometry args={[0.6, 0.6, 0.4]} />
                <meshStandardMaterial color={"#2ecc71"} />
              </mesh>
            ))}
          </group>
        </group>
      ))}

      {/* Rain barrel */}
      <group position={[-4.5, 0.35, -2.5]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.8, 16]} />
          <meshStandardMaterial color={"#2980b9"} />
        </mesh>
        <Html position={[0, 1.2, 0]}>
          <div style={{ 
            background: 'rgba(255,255,255,0.95)', 
            padding: 8, 
            borderRadius: 8,
            textAlign: 'center'
          }}>
            <div>💧 Rain Barrel</div>
            <div style={{fontSize: '12px'}}>{Math.round(water * 100)}% full</div>
          </div>
        </Html>
      </group>

      {/* Emergency button */}
      <group position={[0, 0.4, 3]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.6, 0.6, 0.15, 32]} />
          <meshStandardMaterial color={"#e74c3c"} />
        </mesh>
        <Html position={[0, 0.9, 0]}>
          <div style={{ 
            background: 'rgba(255,255,255,0.95)', 
            padding: 8, 
            borderRadius: 8,
            textAlign: 'center'
          }}>
            <div><strong>🚨 Emergency</strong></div>
          </div>
        </Html>
      </group>
    </group>
  )
}

/* ----- Public Plaza ----- */
function PlazaFallback({ position = [0, 0, 8] }) {
  const [charging, setCharging] = useState(false)

  return (
    <group position={position}>
      {/* Main plaza */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[18, 0.04, 18]} />
        <meshStandardMaterial color={"#ecf0f1"} />
      </mesh>

      {/* Quiet zone */}
      <group position={[-6, 0.25, 3]}>
        <Text 
          position={[0, 1.2, 0]} 
          fontSize={0.2}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          Quiet Zone
        </Text>
        <EcoBench position={[0, 0, 0]} />
      </group>

      {/* Charging Station */}
      <group position={[6, 0.4, 2]}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 1.2, 0.6]} />
          <meshStandardMaterial color={"#2c3e50"} />
        </mesh>

        <Html position={[0, 1.6, 0]}>
          <div style={{ 
            background: 'rgba(255,255,255,0.95)', 
            padding: 12, 
            borderRadius: 12,
            textAlign: 'center'
          }}>
            <div style={{fontWeight: 'bold', marginBottom: 8}}>⚡ Charging Station</div>
            <button 
              onClick={() => setCharging(!charging)}
              style={{
                background: charging ? '#27ae60' : '#3498db',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              {charging ? 'Charging...' : 'Start Charging'}
            </button>
          </div>
        </Html>
      </group>

      {/* Info Kiosk */}
      <group position={[0, 1.05, -5]}>
        <mesh castShadow>
          <boxGeometry args={[0.8, 1.5, 0.3]} />
          <meshStandardMaterial color={"#34495e"} />
        </mesh>

        <Html position={[0, 1.1, 0.18]}>
          <div style={{ 
            width: 200, 
            background: '#3498db',
            padding: 16, 
            borderRadius: 12,
            color: 'white'
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: 12 }}>🏙️ Smart City Info</div>
            <div style={{ fontSize: '12px' }}>
              🔊 Audio guide available<br/>
              ♿ Fully accessible<br/>
              🌐 Free WiFi
            </div>
          </div>
        </Html>
      </group>
    </group>
  )
}

/* ----- Simple HUD ----- */
function HUD() {
  const alert = useStore((s) => s.alert)
  
  return (
    <div style={{ position: 'absolute', left: 12, top: 12, zIndex: 50 }}>
      {alert ? (
        <div style={{
          background: '#e74c3c',
          padding: '12px 16px',
          borderRadius: '12px',
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          {alert.message}
        </div>
      ) : (
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '10px 16px',
          borderRadius: '12px',
          fontSize: '13px',
          fontWeight: 'bold',
          color: '#2c3e50'
        }}>
          🏙️ Smart City Dashboard
        </div>
      )}
    </div>
  )
}

/* ----- Control Panel ----- */
function ControlPanel() {
  const setFocus = useStore((s) => s.setFocus)

  const locations = {
    '🚌 Transportation Hub': { x: -8, y: 5, z: -2, lookAt: { x: -8, y: 0, z: -2 } },
    '🌿 Community Garden': { x: 8, y: 5, z: -6, lookAt: { x: 8, y: 0, z: -6 } },
    '🏛️ Public Plaza': { x: 0, y: 5, z: 8, lookAt: { x: 0, y: 0, z: 8 } },
    '🔭 Overview': { x: 24, y: 18, z: 24, lookAt: { x: 0, y: 0, z: 0 } }
  }

  return (
    <div style={{
      position: 'absolute',
      right: 12,
      top: 12,
      zIndex: 50,
      background: 'rgba(255,255,255,0.95)',
      padding: 16,
      borderRadius: 12,
      minWidth: '200px'
    }}>
      <h3 style={{ margin: '0 0 12px 0', color: '#2c3e50' }}>City Controls</h3>
      
      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: '12px', fontWeight: 'bold' }}>
          Quick Navigation:
        </label>
        {Object.entries(locations).map(([name, pos]) => (
          <button
            key={name}
            onClick={() => setFocus(pos)}
            style={{
              width: '100%',
              background: '#3498db',
              color: 'white',
              border: 'none',
              padding: '6px 8px',
              borderRadius: '6px',
              cursor: 'pointer',
              marginBottom: '4px',
              fontSize: '11px'
            }}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ===== Main App ===== */
export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#87CEEB' }}>
      <HUD />
      <ControlPanel />
      
      <Canvas shadows camera={{ position: [24, 18, 24], fov: 50 }}>
        <color attach="background" args={['#87CEEB']} />
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[10, 20, 10]} 
          intensity={1.0} 
          castShadow 
        />
        
        <Suspense fallback={
          <Html center>
            <div style={{ color: 'white', fontSize: '18px' }}>Loading Smart City...</div>
          </Html>
        }>
          <Sky sunPosition={[100, 20, 100]} />
          <Ground />

          {/* Smart Buildings */}
          <SmartBuilding position={[-15, 0, 5]} height={12} />
          <SmartBuilding position={[-20, 0, 10]} height={8} />
          <SmartBuilding position={[15, 0, -8]} height={10} />
          <SmartBuilding position={[18, 0, 12]} height={14} />

          {/* Main Features */}
          <HubFallback position={[-8, 0, -2]} />
          <SolarBus />
          <GardenFallback position={[8, 0, -6]} />
          <PlazaFallback position={[0, 0, 8]} />

          <ContactShadows position={[0, -0.1, 0]} opacity={0.3} />
        </Suspense>

        <OrbitControls 
          makeDefault 
          enablePan 
          enableRotate 
          enableZoom 
        />
        <CameraController />
      </Canvas>

      <div style={{ 
        position: 'absolute', 
        left: 12, 
        bottom: 12, 
        zIndex: 50, 
        background: 'rgba(255,255,255,0.95)', 
        padding: 12, 
        borderRadius: 12
      }}>
        <div style={{ fontSize: 13, fontWeight: 'bold', color: '#2c3e50' }}>
          🎮 Controls: Drag to rotate • Scroll to zoom • Click to interact
        </div>
      </div>
    </div>
  )
}
