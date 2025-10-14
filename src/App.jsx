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
  setTrafficDensity: (d) => set({ trafficDensity: d }),
  wasteLevels: { organic: 40, plastic: 30, paper: 25, metal: 20 },
  setWasteLevels: (w) => set({ wasteLevels: w })
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

/* ----- Wind Turbine Component ----- */
function WindTurbine({ position = [0, 0, 0], height = 6 }) {
  const turbineRef = useRef()
  const bladesRef = useRef()
  
  useFrame((_, delta) => {
    if (bladesRef.current) {
      bladesRef.current.rotation.y += delta * 2 // Rotate blades
    }
  })

  return (
    <group ref={turbineRef} position={position}>
      {/* Tower */}
      <mesh position={[0, height/2, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, height, 8]} />
        <meshStandardMaterial color="#708090" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Nacelle */}
      <mesh position={[0, height, 0]} castShadow>
        <boxGeometry args={[0.8, 0.6, 0.8]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.8} />
      </mesh>
      
      {/* Blades */}
      <group ref={bladesRef} position={[0, height, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh 
            key={i} 
            rotation={[0, (i * Math.PI * 2) / 3, 0]}
            castShadow
          >
            <boxGeometry args={[4, 0.1, 0.3]} />
            <meshStandardMaterial color="#ecf0f1" metalness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/* ----- Solar Panel Component ----- */
function SolarPanel({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Panel frame */}
      <mesh castShadow>
        <boxGeometry args={[1.5, 0.05, 1]} />
        <meshStandardMaterial color="#2d2d2d" metalness={0.8} roughness={0.1} />
      </mesh>
      
      {/* Solar cells */}
      <mesh position={[0, 0.03, 0]} castShadow>
        <boxGeometry args={[1.4, 0.02, 0.9]} />
        <meshStandardMaterial color="#1e40af" metalness={0.9} roughness={0.05} />
      </mesh>
      
      {/* Support structure */}
      <mesh position={[0, -0.3, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
        <meshStandardMaterial color="#666666" metalness={0.6} />
      </mesh>
    </group>
  )
}

/* ----- Enhanced Smart Buildings with Turbines and Solar Panels ----- */
function SmartBuilding({ 
  position = [0, 0, 0], 
  height = 8, 
  color = "#a67c52", 
  windows = true,
  name = "Building",
  hasTurbine = false,
  hasSolar = false
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

      {/* Wind Turbine on top if specified */}
      {hasTurbine && (
        <WindTurbine position={[0, height/2 + 3, 0]} height={4} />
      )}

      {/* Solar panels on roof if specified */}
      {hasSolar && (
        <group position={[0, height/2 + 0.3, 0]}>
          <SolarPanel position={[0.8, 0, 0.8]} rotation={[Math.PI/6, Math.PI/4, 0]} />
          <SolarPanel position={[-0.8, 0, 0.8]} rotation={[Math.PI/6, -Math.PI/4, 0]} />
          <SolarPanel position={[0.8, 0, -0.8]} rotation={[Math.PI/6, 3*Math.PI/4, 0]} />
          <SolarPanel position={[-0.8, 0, -0.8]} rotation={[Math.PI/6, -3*Math.PI/4, 0]} />
        </group>
      )}

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

/* ----- Cultural Center (Light Brown Dome) ----- */
function CulturalCenter({ position = [0, 0, 0] }) {
  const [currentCulture, setCurrentCulture] = useState('Sindhi')
  const cultures = [
    { name: 'Sindhi', color: '#FF6B35', description: 'Rich heritage of Sindh with Ajrak and traditional music' },
    { name: 'Balochi', color: '#2E86AB', description: 'Beautiful embroidery and folk dances' },
    { name: 'Pashto', color: '#A23B72', description: 'Traditional Attan dance and hospitality' },
    { name: 'Punjabi', color: '#F18F01', description: 'Bhangra dance and vibrant festivals' }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCulture(prev => {
        const currentIndex = cultures.findIndex(c => c.name === prev)
        return cultures[(currentIndex + 1) % cultures.length].name
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const currentCultureData = cultures.find(c => c.name === currentCulture)

  return (
    <group position={position}>
      {/* Main Dome Structure - Light Brown */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[5, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#d2b48c" roughness={0.7} metalness={0.1} />
      </mesh>
      
      {/* Base structure */}
      <mesh position={[0, -2.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[6, 6, 5, 32]} />
        <meshStandardMaterial color="#a67c52" roughness={0.8} />
      </mesh>
      
      {/* Entrance */}
      <mesh position={[0, -1.5, 5.5]} castShadow receiveShadow>
        <boxGeometry args={[3, 3, 1]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* Cultural display area */}
      <group position={[0, 2, 0]}>
        {/* Rotating cultural symbol */}
        <mesh castShadow>
          <torusGeometry args={[2, 0.3, 16, 32]} />
          <meshStandardMaterial color={currentCultureData.color} emissive={currentCultureData.color} emissiveIntensity={0.3} />
        </mesh>
        
        {/* Floating cultural elements */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <group>
            {[-1, 1].map((x, i) => (
              <mesh key={i} position={[x * 1.5, 0, 0]} castShadow>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshStandardMaterial color={currentCultureData.color} transparent opacity={0.8} />
              </mesh>
            ))}
          </group>
        </Float>
      </group>

      {/* Information display */}
      <Html position={[0, 6, 0]} transform>
        <div style={{
          background: 'linear-gradient(135deg, rgba(210, 180, 140, 0.95), rgba(139, 69, 19, 0.95))',
          padding: '20px',
          borderRadius: '15px',
          color: 'white',
          textAlign: 'center',
          minWidth: '300px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          border: '2px solid #8b4513'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>🎪 Cultural Center</h3>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: currentCultureData.color, marginBottom: '8px' }}>
            {currentCulture} Culture
          </div>
          <div style={{ fontSize: '12px', marginBottom: '10px' }}>
            {currentCultureData.description}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
            {cultures.map(culture => (
              <div 
                key={culture.name}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: culture.color,
                  opacity: currentCulture === culture.name ? 1 : 0.3
                }}
              />
            ))}
          </div>
        </div>
      </Html>

      {/* Decorative flags around the dome */}
      {cultures.map((culture, index) => (
        <mesh key={index} position={[
          Math.cos((index * Math.PI) / 2) * 6,
          1,
          Math.sin((index * Math.PI) / 2) * 6
        ]} castShadow>
          <planeGeometry args={[1, 1.5]} />
          <meshStandardMaterial color={culture.color} />
        </mesh>
      ))}

      {/* Ambient cultural music particles */}
      <Sparkles 
        count={30} 
        scale={[12, 8, 12]} 
        size={2} 
        speed={0.3} 
        color={currentCultureData.color}
      />
    </group>
  )
}

/* ----- Waste Management System ----- */
function WasteManagementSystem({ position = [0, 0, 0] }) {
  const [wasteLevels, setWasteLevels] = useState({
    organic: 40,
    plastic: 30,
    paper: 25,
    metal: 20
  })
  const [processing, setProcessing] = useState(false)
  const [wasteInSystem, setWasteInSystem] = useState(0)
  const setAlert = useStore((s) => s.setAlert)

  // Simulate waste processing
  useEffect(() => {
    const interval = setInterval(() => {
      if (processing && wasteInSystem > 0) {
        setWasteInSystem(prev => Math.max(0, prev - 5))
        setWasteLevels(prev => ({
          organic: Math.max(0, prev.organic - 1),
          plastic: Math.max(0, prev.plastic - 1),
          paper: Math.max(0, prev.paper - 1),
          metal: Math.max(0, prev.metal - 1)
        }))
        
        if (wasteInSystem <= 5) {
          setProcessing(false)
          setAlert({ type: 'success', message: '✅ Waste processing completed!' })
          setTimeout(() => setAlert(null), 3000)
        }
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [processing, wasteInSystem])

  const startProcessing = () => {
    if (wasteInSystem === 0) {
      setWasteInSystem(100)
      setProcessing(true)
      setAlert({ type: 'info', message: '🔄 Waste processing started via WiFi...' })
    }
  }

  const addWaste = (type) => {
    setWasteLevels(prev => ({
      ...prev,
      [type]: Math.min(100, prev[type] + 10)
    }))
    setAlert({ type: 'warning', message: `🗑️ ${type.charAt(0).toUpperCase() + type.slice(1)} waste added` })
    setTimeout(() => setAlert(null), 2000)
  }

  return (
    <group position={position}>
      {/* Main waste management building */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[8, 4, 6]} />
        <meshStandardMaterial color="#34495e" metalness={0.3} roughness={0.6} />
      </mesh>
      
      {/* Roof */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[8.2, 0.3, 6.2]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* Waste processing tanks */}
      {[
        { type: 'organic', color: '#8b4513', position: [-2.5, 1, 1.5] },
        { type: 'plastic', color: '#e74c3c', position: [-0.8, 1, 1.5] },
        { type: 'paper', color: '#f39c12', position: [0.8, 1, 1.5] },
        { type: 'metal', color: '#95a5a6', position: [2.5, 1, 1.5] }
      ].map((tank, index) => (
        <group key={tank.type} position={tank.position}>
          {/* Tank */}
          <mesh castShadow>
            <cylinderGeometry args={[0.6, 0.6, 2, 16]} />
            <meshStandardMaterial color={tank.color} transparent opacity={0.8} />
          </mesh>
          
          {/* Waste level */}
          <mesh position={[0, (wasteLevels[tank.type] / 100) - 1, 0]} castShadow>
            <cylinderGeometry args={[0.55, 0.55, (wasteLevels[tank.type] / 100) * 2, 16]} />
            <meshStandardMaterial color={tank.color} />
          </mesh>
          
          {/* Level indicator */}
          <Html position={[0, 1.5, 0]}>
            <div style={{
              background: 'rgba(255,255,255,0.9)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              {wasteLevels[tank.type]}%
            </div>
          </Html>
        </group>
      ))}

      {/* Control panel */}
      <Html position={[0, 3, -2]} transform>
        <div style={{
          background: 'linear-gradient(135deg, #2c3e50, #34495e)',
          padding: '15px',
          borderRadius: '10px',
          color: 'white',
          minWidth: '250px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
        }}>
          <h4 style={{ margin: '0 0 10px 0', textAlign: 'center' }}>🗑️ Waste Management</h4>
          
          {/* Processing status */}
          <div style={{ marginBottom: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', marginBottom: '5px' }}>System Status:</div>
            <div style={{ 
              padding: '5px 10px', 
              borderRadius: '5px', 
              background: processing ? '#27ae60' : '#e74c3c',
              fontWeight: 'bold'
            }}>
              {processing ? `🔄 Processing... ${wasteInSystem}%` : '⏸️ Ready'}
            </div>
          </div>

          {/* WiFi connection indicator */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '10px',
            fontSize: '12px'
          }}>
            <div style={{ marginRight: '5px' }}>📶 WiFi:</div>
            <div style={{ color: '#27ae60', fontWeight: 'bold' }}>Connected</div>
          </div>

          {/* Control buttons */}
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            <button 
              onClick={startProcessing}
              disabled={processing}
              style={{
                flex: 1,
                background: processing ? '#7f8c8d' : '#27ae60',
                color: 'white',
                border: 'none',
                padding: '8px',
                borderRadius: '5px',
                cursor: processing ? 'not-allowed' : 'pointer'
              }}
            >
              Start Process
            </button>
          </div>

          {/* Add waste buttons */}
          <div style={{ fontSize: '11px', marginBottom: '5px' }}>Add Waste:</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
            {['organic', 'plastic', 'paper', 'metal'].map(type => (
              <button
                key={type}
                onClick={() => addWaste(type)}
                style={{
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  padding: '4px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '10px'
                }}
              >
                + {type}
              </button>
            ))}
          </div>
        </div>
      </Html>

      {/* Conveyor belt system */}
      <mesh position={[0, 0.2, -2.5]} castShadow>
        <boxGeometry args={[6, 0.1, 1]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>

      {/* Processing animation */}
      {processing && (
        <Sparkles 
          count={20} 
          scale={[8, 4, 6]} 
          size={3} 
          speed={0.5} 
          color="#27ae60"
        />
      )}
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

/* ----- Enhanced City Layout with Turbines, Solar Panels, and Cultural Center ----- */
function CityLayout() {
  const buildings = [
    // Residential area - with turbines and solar
    { position: [-25, 0, 15], height: 6, color: "#a67c52", name: "Oasis A", hasTurbine: true, hasSolar: true },
    { position: [-20, 0, 18], height: 8, color: "#b5651d", name: "Desert View", hasTurbine: false, hasSolar: true },
    { position: [-30, 0, 20], height: 7, color: "#c19a6b", name: "Mirage Res", hasTurbine: true, hasSolar: false },
    
    // Commercial area - with energy features
    { position: [20, 0, -15], height: 12, color: "#8b4513", name: "Dunes Tower", hasTurbine: true, hasSolar: true },
    { position: [25, 0, -18], height: 10, color: "#a0522d", name: "Sahara Plaza", hasTurbine: false, hasSolar: true },
    { position: [15, 0, -20], height: 14, color: "#cd853f", name: "Oasis Tower", hasTurbine: true, hasSolar: true },
    
    // Mixed use - with renewable energy
    { position: [-15, 0, -10], height: 9, color: "#deb887", name: "Sunset A", hasTurbine: true, hasSolar: false },
    { position: [10, 0, 12], height: 11, color: "#d2b48c", name: "Palm Court", hasTurbine: false, hasSolar: true },
    { position: [-5, 0, -15], height: 8, color: "#f4a460", name: "Desert Bloom", hasTurbine: true, hasSolar: true },
    
    // More buildings
    { position: [30, 0, 5], height: 13, color: "#8b4513", name: "Plaza Tower", hasTurbine: true, hasSolar: true },
    { position: [-28, 0, -5], height: 7, color: "#a67c52", name: "Garden View", hasTurbine: false, hasSolar: true },
    { position: [8, 0, -25], height: 10, color: "#b8860b", name: "Golden Sands", hasTurbine: true, hasSolar: false },
    { position: [-12, 0, 25], height: 9, color: "#daa520", name: "Sun Valley", hasTurbine: false, hasSolar: true },
    { position: [22, 0, 22], height: 15, color: "#8b4513", name: "Central Oasis", hasTurbine: true, hasSolar: true }
  ]

  return (
    <group>
      {/* Cultural Center - Light Brown Dome */}
      <CulturalCenter position={[0, 0, 0]} />
      
      {/* Waste Management System */}
      <WasteManagementSystem position={[20, 0, 10]} />
      
      {/* Regular buildings */}
      {buildings.map((building, index) => (
        <SmartBuilding
          key={index}
          position={building.position}
          height={building.height}
          color={building.color}
          name={building.name}
          hasTurbine={building.hasTurbine}
          hasSolar={building.hasSolar}
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
    // Paths around the city including cultural center
    [[-8, 0, -2], [-5, 0, 0], [-2, 0, -2], [-5, 0, -4]],
    [[8, 0, -6], [10, 0, -4], [12, 0, -6], [10, 0, -8]],
    [[0, 0, 8], [3, 0, 10], [6, 0, 8], [3, 0, 6]],
    [[-20, 0, 10], [-18, 0, 12], [-16, 0, 10], [-18, 0, 8]],
    [[20, 0, -15], [22, 0, -13], [24, 0, -15], [22, 0, -17]],
    // Paths around cultural center
    [[-3, 0, 3], [0, 0, 5], [3, 0, 3], [0, 0, 1]],
    [[-4, 0, -2], [-2, 0, 0], [0, 0, -2], [-2, 0, -4]]
  ]

  return (
    <group>
      {Array.from({ length: 15 }).map((_, i) => (
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
    '🎪 Cultural Center': { x: 0, y: 8, z: 0, lookAt: { x: 0, y: 0, z: 0 } },
    '🗑️ Waste Management': { x: 20, y: 6, z: 10, lookAt: { x: 20, y: 0, z: 10 } },
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
          Explore the desert smart city with wind turbines, solar panels, cultural center, and waste management
        </div>
      </div>
    </div>
  )
}
