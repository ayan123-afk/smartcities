// src/App.jsx
import React, { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, useGLTF, ContactShadows, Sky, Text, Sparkles, Float } from '@react-three/drei'
import * as THREE from 'three'
import create from 'zustand'

/* ----- Enhanced store with more states ----- */
const useStore = create((set) => ({
  alert: null,
  setAlert: (a) => set({ alert: a }),
  focus: null,
  setFocus: (f) => set({ focus: f }),
  timeOfDay: 'day',
  setTimeOfDay: (t) => set({ timeOfDay: t }),
  trafficDensity: 'medium',
  setTrafficDensity: (d) => set({ trafficDensity: d })
}))

/* ----- Enhanced Camera Controller ----- */
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

/* ----- Simple ModelLoader with better error handling ----- */
function ModelLoader({ src, fallback: Fallback, ...props }) {
  const [error, setError] = useState(false)
  
  if (!src || error) {
    return Fallback ? <Fallback {...props} /> : null
  }
  
  try {
    const gltf = useGLTF(src)
    return <primitive object={gltf.scene} {...props} />
  } catch (e) {
    console.warn(`Failed to load ${src}, using fallback`)
    setError(true)
    return Fallback ? <Fallback {...props} /> : null
  }
}

/* ----- Desert-themed Ground with sand texture ----- */
function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color={"#d2b48c"} roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Sand dunes */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} position={[
          Math.random() * 180 - 90,
          Math.random() * 0.5,
          Math.random() * 180 - 90
        ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <sphereGeometry args={[Math.random() * 3 + 1, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.3]} />
          <meshStandardMaterial color={"#c19a6b"} roughness={0.9} />
        </mesh>
      ))}
      <gridHelper args={[200, 200, '#8b7355', '#8b7355']} position={[0, 0.01, 0]} />
      <ContactShadows position={[0, -0.03, 0]} opacity={0.3} width={50} blur={2} far={20} />
    </>
  )
}

/* ----- Desert-style Smart Buildings ----- */
function SmartBuilding({ 
  position = [0, 0, 0], 
  height = 8, 
  color = "#a67c52", 
  windows = true,
  name = "Building"
}) {
  const buildingRef = useRef()
  const [lightsOn, setLightsOn] = useState(false)
  const setFocus = useStore((s) => s.setFocus)

  useEffect(() => {
    const interval = setInterval(() => {
      setLightsOn(prev => Math.random() > 0.7 ? !prev : prev)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleClick = () => {
    setFocus({
      x: position[0],
      y: position[1] + height/2,
      z: position[2],
      lookAt: { x: position[0], y: position[1], z: position[2] }
    })
  }

  return (
    <group ref={buildingRef} position={position}>
      {/* Main structure with desert architecture */}
      <mesh castShadow receiveShadow onClick={handleClick}>
        <boxGeometry args={[3, height, 3]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
      </mesh>
      
      {/* Enhanced windows with shutters */}
      {windows && (
        <group>
          {Array.from({ length: Math.floor(height / 2) }).map((_, floor) => 
            [-1, 1].map((side, i) => (
              <group key={`${floor}-${side}`}>
                <mesh 
                  position={[1.51, (floor * 2) - height/2 + 2, side * 0.8]} 
                  castShadow
                >
                  <boxGeometry args={[0.02, 1.2, 0.8]} />
                  <meshStandardMaterial 
                    color={lightsOn ? "#fff9c4" : "#8b7355"} 
                    emissive={lightsOn ? "#fff9c4" : "#000000"} 
                    emissiveIntensity={lightsOn ? 0.8 : 0} 
                  />
                </mesh>
                {/* Window frames */}
                <mesh position={[1.5, (floor * 2) - height/2 + 2, side * 0.8]} castShadow>
                  <boxGeometry args={[0.04, 1.3, 0.85]} />
                  <meshStandardMaterial color="#8b4513" />
                </mesh>
              </group>
            ))
          )}
        </group>
      )}
      
      {/* Enhanced rooftop with desert style */}
      <mesh position={[0, height/2 + 0.2, 0]} castShadow>
        <boxGeometry args={[3.2, 0.4, 3.2]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* Decorative elements - desert architecture */}
      <mesh position={[0, height/2 - 0.5, 1.51]} castShadow>
        <boxGeometry args={[2, 0.5, 0.1]} />
        <meshStandardMaterial color="#cd853f" />
      </mesh>

      {/* Building label */}
      <Text
        position={[0, height/2 + 1, 0]}
        fontSize={0.3}
        color="#8b4513"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </group>
  )
}

/* ----- Palm Tree for desert environment ----- */
function PalmTree({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 4, 8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      {/* Leaves */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, 4, 0]} rotation={[0, (i * Math.PI) / 2, 0.7]} castShadow>
          <coneGeometry args={[1.5, 3, 4]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
      ))}
    </group>
  )
}

/* ----- City Layout with Desert Color Scheme ----- */
function CityLayout() {
  const buildings = [
    // Residential area - light brown colors
    { position: [-25, 0, 15], height: 6, color: "#a67c52", name: "Oasis A" },
    { position: [-20, 0, 18], height: 8, color: "#b5651d", name: "Desert View" },
    { position: [-30, 0, 20], height: 7, color: "#c19a6b", name: "Mirage Res" },
    
    // Commercial area - earth tones
    { position: [20, 0, -15], height: 12, color: "#8b4513", name: "Dunes Tower" },
    { position: [25, 0, -18], height: 10, color: "#a0522d", name: "Sahara Plaza" },
    { position: [15, 0, -20], height: 14, color: "#cd853f", name: "Oasis Tower" },
    
    // Mixed use - warm desert colors
    { position: [-15, 0, -10], height: 9, color: "#deb887", name: "Sunset A" },
    { position: [10, 0, 12], height: 11, color: "#d2b48c", name: "Palm Court" },
    { position: [-5, 0, -15], height: 8, color: "#f4a460", name: "Desert Bloom" },
    
    // More buildings for dense city feel
    { position: [30, 0, 5], height: 13, color: "#8b4513", name: "Plaza Tower" },
    { position: [-28, 0, -5], height: 7, color: "#a67c52", name: "Garden View" },
    { position: [8, 0, -25], height: 10, color: "#b8860b", name: "Golden Sands" },
    { position: [-12, 0, 25], height: 9, color: "#daa520", name: "Sun Valley" },
    { position: [22, 0, 22], height: 15, color: "#8b4513", name: "Central Oasis" }
  ]

  return (
    <group>
      {buildings.map((building, index) => (
        <SmartBuilding
          key={index}
          position={building.position}
          height={building.height}
          color={building.color}
          name={building.name}
        />
      ))}
      
      {/* Add some palm trees for desert feel */}
      {Array.from({ length: 15 }).map((_, i) => (
        <PalmTree 
          key={i}
          position={[
            Math.random() * 80 - 40,
            0,
            Math.random() * 80 - 40
          ]}
        />
      ))}
    </group>
  )
}

/* ----- Animated People ----- */
function Person({ position = [0, 0, 0], speed = 1, path = [] }) {
  const personRef = useRef()
  const [t, setT] = useState(Math.random() * 10)

  useFrame((_, dt) => {
    setT(prev => prev + dt * speed)
    
    if (personRef.current && path.length > 0) {
      const tt = t % path.length
      const i = Math.floor(tt) % path.length
      const a = new THREE.Vector3(...path[i])
      const b = new THREE.Vector3(...path[(i + 1) % path.length])
      const f = tt % 1
      const pos = a.clone().lerp(b, f)
      
      personRef.current.position.lerp(pos, 0.1)
      personRef.current.lookAt(b)
    }
  })

  return (
    <group ref={personRef} position={position}>
      {/* Body with desert clothing colors */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.8, 8]} />
        <meshStandardMaterial color="#d2691e" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#f1c40f" />
      </mesh>
    </group>
  )
}

/* ----- People System ----- */
function PeopleSystem() {
  const peoplePaths = [
    // Paths around the city
    [[-8, 0, -2], [-5, 0, 0], [-2, 0, -2], [-5, 0, -4]],
    [[8, 0, -6], [10, 0, -4], [12, 0, -6], [10, 0, -8]],
    [[0, 0, 8], [3, 0, 10], [6, 0, 8], [3, 0, 6]],
    [[-20, 0, 10], [-18, 0, 12], [-16, 0, 10], [-18, 0, 8]],
    [[20, 0, -15], [22, 0, -13], [24, 0, -15], [22, 0, -17]]
  ]

  return (
    <group>
      {Array.from({ length: 10 }).map((_, i) => (
        <Person
          key={i}
          position={[
            Math.random() * 40 - 20,
            0,
            Math.random() * 40 - 20
          ]}
          speed={0.5 + Math.random() * 0.5}
          path={peoplePaths[i % peoplePaths.length]}
        />
      ))}
    </group>
  )
}

/* ----- Enhanced Parametric Bench ----- */
function EcoBench({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.38, 0]} castShadow>
        <boxGeometry args={[1.6, 0.12, 0.4]} />
        <meshStandardMaterial color={"#8b4513"} roughness={0.8} />
      </mesh>
      <mesh position={[-0.6, 0.12, 0]} castShadow>
        <boxGeometry args={[0.12, 0.24, 0.12]} />
        <meshStandardMaterial color={"#654321"} metalness={0.5} />
      </mesh>
      <mesh position={[0.6, 0.12, 0]} castShadow>
        <boxGeometry args={[0.12, 0.24, 0.12]} />
        <meshStandardMaterial color={"#654321"} metalness={0.5} />
      </mesh>
    </group>
  )
}

/* ========================= Enhanced Transportation Hub ========================= */
function HubFallback({ position = [-8, 0, -2] }) {
  const [peopleWaiting, setPeopleWaiting] = useState(3)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPeopleWaiting(prev => Math.max(0, prev + Math.floor(Math.random() * 3) - 1))
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  return (
    <group position={position}>
      {/* Main platform with desert stone */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[12, 0.04, 10]} />
        <meshStandardMaterial color={"#d2b48c"} roughness={0.9} />
      </mesh>

      {/* Enhanced solar roof structure */}
      <mesh position={[0, 3.5, -2]} castShadow>
        <boxGeometry args={[8, 0.15, 4]} />
        <meshStandardMaterial color={"#2d2d2d"} metalness={0.8} roughness={0.1} />
      </mesh>

      {/* Solar panels with floating animation */}
      {[-2.5, 0, 2.5].map((x, i) => (
        <Float key={i} speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
          <mesh position={[x, 3.6, -2]} castShadow>
            <boxGeometry args={[2, 0.02, 3]} />
            <meshStandardMaterial color={"#1e3a8a"} metalness={0.9} roughness={0.05} />
          </mesh>
        </Float>
      ))}

      {/* Enhanced ramps with handrails */}
      {[-5, 5].map((x, i) => (
        <group key={i} position={[x, 0, -1]}>
          <mesh rotation={[0, i === 0 ? 0.2 : -0.2, 0]} receiveShadow>
            <boxGeometry args={[2.5, 0.04, 1.5]} />
            <meshStandardMaterial color={"#a67c52"} />
          </mesh>
          {/* Handrails */}
          <mesh position={[0, 0.8, -0.8]}>
            <cylinderGeometry args={[0.03, 0.03, 1.6, 8]} />
            <meshStandardMaterial color={"#8b4513"} />
          </mesh>
        </group>
      ))}

      {/* Digital display */}
      <Html position={[0, 2.5, 4]} transform>
        <div style={{ 
          background: 'linear-gradient(135deg, #d2691e 0%, #8b4513 100%)', 
          padding: '12px 20px', 
          borderRadius: '12px', 
          color: 'white', 
          fontSize: '14px', 
          fontWeight: 'bold', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          minWidth: '200px',
          textAlign: 'center'
        }}>
          <div>🚌 Next Bus: 5 min</div>
          <div>👥 Waiting: {peopleWaiting}</div>
        </div>
      </Html>

      {/* Waiting area with interactive seats */}
      <group position={[0, 0.6, 2]}>
        <mesh receiveShadow>
          <boxGeometry args={[6, 0.06, 2]} />
          <meshStandardMaterial color={"#f5deb3"} />
        </mesh>
        {[-2, 0, 2].map((x, i) => (
          <EcoBench key={i} position={[x, 0.3, 0]} />
        ))}
      </group>

      {/* Smart lighting */}
      <pointLight position={[0, 3, 0]} intensity={0.8} color="#fff9c4" distance={10} />
      
      {/* Enhanced 3D gateway */}
      <mesh position={[0, 2, 5]} castShadow>
        <boxGeometry args={[6, 4, 0.3]} />
        <meshStandardMaterial color="#8b4513" metalness={0.3} />
      </mesh>
    </group>
  )
}

/* ----- Enhanced Solar Bus with yellow body and blue solar panels ----- */
function SolarBus({ path = [[-20, 0, 12], [-12, 0, 5], [-8, 0, -2], [-4, 0, 8], [-15, 0, 15]] }) {
  const busRef = useRef()
  const doorRef = useRef()
  const [t, setT] = useState(0)
  const [stopped, setStopped] = useState(false)
  const [passengers, setPassengers] = useState(8)
  const setAlert = useStore((s) => s.setAlert)

  useFrame((_, dt) => {
    setT((cur) => {
      let nt = cur
      if (!stopped) nt = cur + dt * 0.04
      if (nt > path.length) nt = 0

      // Stop at hub (index 2)
      const idx = Math.floor(nt) % path.length
      if (idx === 2 && (nt % 1) > 0.85 && !stopped) {
        setStopped(true)
        if (doorRef.current) doorRef.current.rotation.y = Math.PI / 2
        setAlert({ type: "info", message: "🚌 Solar Bus arrived at Transportation Hub" })
        
        setTimeout(() => {
          // Simulate passengers boarding
          const boarding = Math.floor(Math.random() * 3) + 1
          setPassengers(prev => Math.min(20, prev + boarding))
          
          setTimeout(() => {
            if (doorRef.current) doorRef.current.rotation.y = 0
            setTimeout(() => {
              setStopped(false)
              setAlert(null)
            }, 500)
          }, 2000)
        }, 1000)
      }
      
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
      {/* Bus body - YELLOW */}
      <mesh castShadow>
        <boxGeometry args={[3, 1.2, 1.5]} />
        <meshStandardMaterial color={"#FFD700"} metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Enhanced windows with frames */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[2.8, 0.5, 1.3]} />
        <meshStandardMaterial color={"#2c3e50"} transparent opacity={0.7} />
      </mesh>

      {/* Solar panel roof - BLUE */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[2.5, 0.05, 1.4]} />
        <meshStandardMaterial color={"#1e40af"} metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Enhanced doors with 3D details */}
      <group ref={doorRef} position={[0.8, -0.1, 0.3]}>
        <mesh castShadow>
          <boxGeometry args={[0.4, 0.8, 0.05]} />
          <meshStandardMaterial color={"#c0392b"} />
        </mesh>
      </group>

      {/* Enhanced wheels */}
      {[-1, 1].map((side, i) => (
        <group key={i} position={[side * 0.8, -0.4, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} rotation={[0, 0, Math.PI/2]} />
            <meshStandardMaterial color={"#2c3e50"} />
          </mesh>
        </group>
      ))}

      {/* Passenger counter display */}
      <Html position={[0, 1.3, 0]} transform>
        <div style={{ 
          background: '#27ae60', 
          color: 'white', 
          padding: '2px 6px', 
          borderRadius: '4px', 
          fontSize: '10px', 
          fontWeight: 'bold' 
        }}>
          👥 {passengers}/20
        </div>
      </Html>
    </group>
  )
}

/* ========================= Enhanced Community Garden ========================= */
function GardenFallback({ position = [8, 0, -6] }) {
  const [water, setWater] = useState(0.8)
  const [compost, setCompost] = useState(0.4)
  const [status, setStatus] = useState('green')
  const [plants, setPlants] = useState(Array(9).fill(0).map(() => 0.3 + Math.random() * 0.7))
  const setAlert = useStore((s) => s.setAlert)

  useEffect(() => {
    const id = setInterval(() => {
      setWater((w) => Math.max(0, w - Math.random() * 0.02))
      setCompost((c) => Math.min(1, c + Math.random() * 0.015))
      setPlants(prev => prev.map(growth => Math.min(1, growth + (Math.random() * 0.01)) ))
    }, 2000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (water < 0.2) setStatus('red')
    else if (water < 0.4) setStatus('yellow')
    else setStatus('green')
  }, [water])

  function emergency() {
    setAlert({ type: 'emergency', message: '🚨 Emergency: Garden manager alerted!' })
    setTimeout(() => setAlert(null), 4200)
  }

  function rainCollect() {
    setWater((w) => Math.min(1, w + 0.5))
    setAlert({ type: 'success', message: '💧 Rain collected successfully!' })
    setTimeout(() => setAlert(null), 3000)
  }

  return (
    <group position={position}>
      {/* Garden base with desert soil */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[12, 0.04, 8]} />
        <meshStandardMaterial color={"#a67c52"} roughness={0.9} />
      </mesh>

      {/* Enhanced raised beds */}
      {[-3, 0, 3].map((x, i) => (
        <group key={i} position={[x, 0.6, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.5, 0.6, 2.8]} />
            <meshStandardMaterial color={"#8b4513"} roughness={0.8} />
          </mesh>
          
          {/* Growing plants */}
          <group position={[0, 0.35, 0]}>
            {Array.from({ length: 6 }).map((_, k) => {
              const plantHeight = plants[i * 3 + (k % 3)] * 0.8
              return (
                <mesh 
                  key={k} 
                  position={[(-0.9 + (k % 3) * 0.9), plantHeight/2, -0.75 + Math.floor(k / 3) * 1.5]} 
                  castShadow
                >
                  <cylinderGeometry args={[0.1, 0.2, plantHeight, 8]} />
                  <meshStandardMaterial color={"#2e8b57"} />
                </mesh>
              )
            })}
          </group>
        </group>
      ))}

      {/* Enhanced rain barrel */}
      <group position={[-4.5, 0.35, -2.5]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.8, 16]} />
          <meshStandardMaterial color={"#2980b9"} />
        </mesh>
        
        {/* Water level indicator */}
        <mesh position={[0, (water - 0.5) * 0.8, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, water * 0.7, 16]} />
          <meshStandardMaterial color={"#3498db"} transparent opacity={0.8} />
        </mesh>
        
        <Html position={[0, 1.2, 0]}>
          <div style={{ 
            background: 'rgba(255,255,255,0.95)', 
            padding: 8, 
            borderRadius: 8, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            textAlign: 'center'
          }}>
            <div>💧 Rain Barrel</div>
            <div style={{fontSize: '12px', margin: '4px 0'}}>{Math.round(water * 100)}% full</div>
            <button 
              onClick={rainCollect}
              style={{ 
                background: '#27ae60', 
                color: 'white', 
                border: 'none', 
                padding: '4px 8px', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Collect Rain
            </button>
          </div>
        </Html>
      </group>

      {/* Enhanced compost unit */}
      <group position={[4.5, 0.35, -2.5]}>
        <mesh castShadow>
          <boxGeometry args={[1, 0.6, 1]} />
          <meshStandardMaterial color={"#8b4513"} />
        </mesh>
        
        <Html position={[0, 1.1, 0]}>
          <div style={{ 
            background: 'rgba(255,255,255,0.95)', 
            padding: 8, 
            borderRadius: 8,
            textAlign: 'center'
          }}>
            <div>♻️ Compost</div>
            <div style={{fontSize: '12px'}}>{Math.round(compost * 100)}% ready</div>
          </div>
        </Html>
      </group>

      {/* Emergency button with better visuals */}
      <group position={[0, 0.4, 3]}>
        <mesh onClick={emergency} castShadow>
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
            <small>Press to alert manager</small>
          </div>
        </Html>
      </group>

      {/* Enhanced status indicator */}
      <group position={[0, 1.8, -3]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.25, 0.25, 1.2, 16]} />
          <meshStandardMaterial color={"#8b4513"} />
        </mesh>
        <mesh position={[0, 0.7, 0]} castShadow>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial 
            emissive={status === 'green' ? '#2ecc71' : status === 'yellow' ? '#f39c12' : '#e74c3c'}
            color={status === 'green' ? '#27ae60' : status === 'yellow' ? '#f39c12' : '#e74c3c'}
            emissiveIntensity={0.8}
          />
        </mesh>
        <Sparkles count={20} scale={[1, 1, 1]} size={2} speed={0.1} />
        <Html position={[0, -0.6, 0]}>
          <div style={{ 
            background: 'rgba(255,255,255,0.95)', 
            padding: 8, 
            borderRadius: 8,
            textAlign: 'center'
          }}>
            Garden Status: <strong>{status.toUpperCase()}</strong>
          </div>
        </Html>
      </group>
    </group>
  )
}

/* ========================= Enhanced Public Plaza ========================= */
function PlazaFallback({ position = [0, 0, 8] }) {
  const [lang, setLang] = useState('EN')
  const [charging, setCharging] = useState(false)
  const [chargeLevel, setChargeLevel] = useState(0)

  function speak(text) {
    if (!("speechSynthesis" in window)) return
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang === 'EN' ? 'en-US' : 'es-ES'
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  }

  function startCharging() {
    if (charging) return
    setCharging(true)
    setChargeLevel(0)
    const interval = setInterval(() => {
      setChargeLevel(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setCharging(false)
          return 100
        }
        return prev + 2
      })
    }, 200)
  }

  return (
    <group position={position}>
      {/* Main plaza with desert stone */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[18, 0.04, 18]} />
        <meshStandardMaterial color={"#f5f5dc"} roughness={0.8} />
      </mesh>

      {/* Enhanced decorative pathways with geometric patterns */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <ringGeometry args={[0, 8, 32, 6, 0, Math.PI * 2]} />
        <meshStandardMaterial color={"#d2b48c"} />
      </mesh>

      {/* Enhanced quiet zone with decorative elements */}
      <group position={[-6, 0.25, 3]}>
        <Text 
          position={[0, 1.2, 0]} 
          fontSize={0.2} 
          color="#8b4513"
          anchorX="center" 
          anchorY="middle"
        >
          Quiet Zone
        </Text>
        <EcoBench position={[0, 0, 0]} />
        
        <Sparkles count={15} scale={[4, 2, 3]} size={1} speed={0.05} />
      </group>

      {/* Enhanced EV/Wheelchair Charger with modern design */}
      <group position={[6, 0.4, 2]}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 1.2, 0.6]} />
          <meshStandardMaterial color={"#2c3e50"} metalness={0.3} />
        </mesh>
        
        {/* Charging status light */}
        <mesh position={[0, 0.8, 0.31]} castShadow>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial 
            emissive={charging ? '#2ecc71' : '#e74c3c'} 
            color={charging ? '#27ae60' : '#c0392b'} 
            emissiveIntensity={0.8} 
          />
        </mesh>
        
        <Html position={[0, 1.6, 0]}>
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            padding: 12, 
            borderRadius: 12, 
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            textAlign: 'center',
            minWidth: '180px'
          }}>
            <div style={{fontWeight: 'bold', marginBottom: 8}}>⚡ Smart Charger</div>
            {charging ? (
              <div>
                <div>Charging: {chargeLevel}%</div>
                <div style={{ 
                  width: '100%', 
                  height: '8px', 
                  background: '#ecf0f1', 
                  borderRadius: '4px',
                  margin: '8px 0'
                }}>
                  <div style={{ 
                    width: `${chargeLevel}%`, 
                    height: '100%', 
                    background: '#27ae60', 
                    borderRadius: '4px',
                    transition: 'width 0.3s'
                  }}></div>
                </div>
              </div>
            ) : (
              <button 
                onClick={startCharging}
                style={{ 
                  background: '#3498db', 
                  color: 'white', 
                  border: 'none', 
                  padding: '8px 16px', 
                  borderRadius: '6px',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Start Charging
              </button>
            )}
          </div>
        </Html>
      </group>

      {/* Enhanced Interactive Kiosk with modern design */}
      <group position={[0, 1.05, -5]}>
        <mesh castShadow>
          <boxGeometry args={[0.8, 1.5, 0.3]} />
          <meshStandardMaterial color={"#34495e"} metalness={0.2} roughness={0.6} />
        </mesh>
        
        {/* Enhanced screen with frame */}
        <mesh position={[0, 0.3, 0.16]} castShadow>
          <boxGeometry args={[0.6, 0.8, 0.05]} />
          <meshStandardMaterial color={"#1a1a1a"} />
        </mesh>
        
        <Html position={[0, 1.1, 0.18]}>
          <div style={{ 
            width: 200, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            padding: 16, 
            borderRadius: 12,
            color: 'white',
            boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: 12 }}>🏙️ Smart City Info</div>
            <div style={{ marginBottom: 12 }}>
              <button 
                onClick={() => { 
                  setLang('EN'); 
                  speak('Welcome to Smart City. Use this kiosk for navigation and information.'); 
                }}
                style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  color: 'white', 
                  border: '1px solid rgba(255,255,255,0.3)', 
                  padding: '6px 12px', 
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginRight: 8
                }}
              >
                English
              </button>
              <button 
                onClick={() => { 
                  setLang('ES'); 
                  speak('Bienvenido a Ciudad Inteligente. Use este kiosco para navegación e información.'); 
                }}
                style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  color: 'white', 
                  border: '1px solid rgba(255,255,255,0.3)', 
                  padding: '6px 12px', 
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Español
              </button>
            </div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              🔊 Audio guide available<br/>
              ♿ Fully accessible<br/>
              🌐 Free WiFi
            </div>
          </div>
        </Html>
      </group>

      {/* Enhanced decorative gateway/arch */}
      <group position={[0, 3, 8]}>
        <mesh castShadow>
          <torusGeometry args={[4, 0.3, 16, 32, Math.PI]} />
          <meshStandardMaterial color="#8b4513" metalness={0.4} />
        </mesh>
        <mesh position={[-4, 1.5, 0]} castShadow>
          <boxGeometry args={[0.5, 3, 0.5]} />
          <meshStandardMaterial color="#a67c52" />
        </mesh>
        <mesh position={[4, 1.5, 0]} castShadow>
          <boxGeometry args={[0.5, 3, 0.5]} />
          <meshStandardMaterial color="#a67c52" />
        </mesh>
      </group>

      {/* Enhanced lighting and decorative elements */}
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#fff9c4" distance={15} />
      <Sparkles count={40} scale={[16, 3, 16]} size={1.5} speed={0.1} color="#FFD700" />
    </group>
  )
}

/* ----- Enhanced HUD with desert theme ----- */
function HUD() {
  const alert = useStore((s) => s.alert)
  const timeOfDay = useStore((s) => s.timeOfDay)
  
  const alertStyles = {
    info: { background: 'linear-gradient(135deg, #d2691e, #8b4513)', color: 'white' },
    emergency: { background: 'linear-gradient(135deg, #e74c3c, #c0392b)', color: 'white' },
    success: { background: 'linear-gradient(135deg, #27ae60, #229954)', color: 'white' },
    warning: { background: 'linear-gradient(135deg, #f39c12, #e67e22)', color: 'white' }
  }

  return (
    <div style={{ position: 'absolute', left: 12, top: 12, zIndex: 50 }}>
      {alert ? (
        <div style={{ 
          ...alertStyles[alert.type] || alertStyles.info, 
          padding: '12px 16px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          minWidth: '280px',
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
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          fontSize: '13px',
          fontWeight: 'bold',
          color: '#8b4513'
        }}>
          🏜️ Desert Smart City • Time: {timeOfDay} • Systems: ✅ Nominal
        </div>
      )}
    </div>
  )
}

/* ----- Control Panel ----- */
function ControlPanel() {
  const setTimeOfDay = useStore((s) => s.setTimeOfDay)
  const setTrafficDensity = useStore((s) => s.setTrafficDensity)
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
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      minWidth: '200px'
    }}>
      <h3 style={{ margin: '0 0 12px 0', color: '#8b4513' }}>Desert City Controls</h3>
      
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4, fontSize: '12px', fontWeight: 'bold' }}>
          Time of Day:
        </label>
        <select 
          onChange={(e) => setTimeOfDay(e.target.value)}
          style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #d2b48c' }}
        >
          <option value="day">☀️ Day</option>
          <option value="evening">🌆 Evening</option>
          <option value="night">🌙 Night</option>
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4, fontSize: '12px', fontWeight: 'bold' }}>
          Traffic Density:
        </label>
        <select 
          onChange={(e) => setTrafficDensity(e.target.value)}
          style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #d2b48c' }}
        >
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High</option>
        </select>
      </div>

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
              background: '#d2691e', 
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

/* ===== Enhanced Main App ===== */
export default function App() {
  const timeOfDay = useStore((s) => s.timeOfDay)
  
  const skyConfig = {
    day: { sunPosition: [100, 20, 100], inclination: 0, azimuth: 0.25 },
    evening: { sunPosition: [10, 5, 100], inclination: 0, azimuth: 0.25 },
    night: { sunPosition: [-100, -20, 100], inclination: 0, azimuth: 0.25 }
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' }}>
      <HUD />
      <ControlPanel />
      
      <Canvas shadows camera={{ position: [24, 18, 24], fov: 50 }}>
        <color attach="background" args={['#87CEEB']} />
        <ambientLight intensity={timeOfDay === 'night' ? 0.3 : 0.6} />
        <directionalLight 
          position={timeOfDay === 'night' ? [-10, 10, 10] : [10, 20, 10]} 
          intensity={timeOfDay === 'night' ? 0.5 : 1.0}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        <Suspense fallback={
          <Html center>
            <div style={{ color: 'white', fontSize: '18px', background: 'rgba(139, 69, 19, 0.8)', padding: '20px', borderRadius: '10px' }}>
              Loading Desert Smart City...
            </div>
          </Html>
        }>
          <Sky {...skyConfig[timeOfDay]} />
          
          <Ground />
          
          {/* Complete City Layout */}
          <CityLayout />
          
          {/* Animated People */}
          <PeopleSystem />
          
          {/* Main Features */}
          <HubFallback position={[-8, 0, -2]} />
          <SolarBus />
          <GardenFallback position={[8, 0, -6]} />
          <PlazaFallback position={[0, 0, 8]} />
          
          <ContactShadows position={[0, -0.1, 0]} opacity={0.4} width={40} blur={2} far={10} />
        </Suspense>
        
        <OrbitControls 
          makeDefault 
          enablePan 
          enableRotate 
          enableZoom 
          minDistance={5} 
          maxDistance={100} 
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
        borderRadius: 12, 
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)' 
      }}>
        <div style={{ fontSize: 13, fontWeight: 'bold', color: '#8b4513' }}>
          🎮 Controls: Drag to rotate • Scroll to zoom • Click interactive elements
        </div>
        <div style={{ fontSize: 11, color: '#a67c52', marginTop: 4 }}>
          Explore the desert smart city with solar transportation and sustainable features
        </div>
      </div>
    </div>
  )
}
