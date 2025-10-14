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
  wasteLevel: 0,
  setWasteLevel: (w) => set({ wasteLevel: w })
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

/* ----- Wind Turbine Component ----- */
function WindTurbine({ position = [0, 0, 0], buildingHeight = 8 }) {
  const turbineRef = useRef()
  const bladesRef = useRef()
  
  useFrame((_, delta) => {
    if (bladesRef.current) {
      bladesRef.current.rotation.y += delta * 2 // Rotate blades
    }
  })

  const baseHeight = buildingHeight + 2;

  return (
    <group ref={turbineRef} position={position}>
      {/* Tower */}
      <mesh position={[0, baseHeight + 2, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 4, 8]} />
        <meshStandardMaterial color="#708090" metalness={0.7} />
      </mesh>
      
      {/* Nacelle */}
      <mesh position={[0, baseHeight + 4, 0]} castShadow>
        <boxGeometry args={[0.8, 0.6, 0.8]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.8} />
      </mesh>
      
      {/* Rotating Blades */}
      <group ref={bladesRef} position={[0, baseHeight + 4, 0]}>
        {/* Main blade */}
        <mesh position={[2, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <boxGeometry args={[4, 0.1, 0.3]} />
          <meshStandardMaterial color="#ecf0f1" />
        </mesh>
        {/* Second blade */}
        <mesh position={[-2, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <boxGeometry args={[4, 0.1, 0.3]} />
          <meshStandardMaterial color="#ecf0f1" />
        </mesh>
        {/* Third blade */}
        <mesh position={[0, 0, 2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <boxGeometry args={[4, 0.1, 0.3]} />
          <meshStandardMaterial color="#ecf0f1" />
        </mesh>
      </group>
    </group>
  )
}

/* ----- Solar Panel Component ----- */
function SolarPanel({ position = [0, 0, 0], rotation = 0 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Panel base */}
      <mesh castShadow>
        <boxGeometry args={[1.5, 0.02, 1]} />
        <meshStandardMaterial color="#1e3a8a" metalness={0.9} roughness={0.05} />
      </mesh>
      {/* Panel frame */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <boxGeometry args={[1.6, 0.04, 1.1]} />
        <meshStandardMaterial color="#374151" metalness={0.5} />
      </mesh>
      {/* Support structure */}
      <mesh position={[0, -0.3, 0.4]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      <mesh position={[0, -0.3, -0.4]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
    </group>
  )
}

/* ----- Enhanced Waste Management System ----- */
function WasteManagementSystem({ position = [15, 0, 25] }) {
  const [wasteLevel, setWasteLevel] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [showProcess, setShowProcess] = useState(false)
  const setAlert = useStore((s) => s.setAlert)

  useEffect(() => {
    // Simulate waste accumulation
    const interval = setInterval(() => {
      setWasteLevel(prev => Math.min(100, prev + Math.random() * 5))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleProcessWaste = () => {
    if (wasteLevel < 20) {
      setAlert({ type: 'warning', message: '⚠️ Not enough waste to process' })
      return
    }

    setProcessing(true)
    setShowProcess(true)
    setAlert({ type: 'info', message: '🔄 Processing waste...' })

    // Simulate 4-hour processing
    setTimeout(() => {
      setProcessing(false)
      setWasteLevel(0)
      setAlert({ type: 'success', message: '✅ Waste processed successfully! Converted to energy' })
      
      setTimeout(() => {
        setShowProcess(false)
        setAlert(null)
      }, 3000)
    }, 4000) // 4 seconds for demo (represents 4 hours)
  }

  return (
    <group position={position}>
      {/* Main facility building */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[6, 4, 6]} />
        <meshStandardMaterial color="#4b5563" roughness={0.7} />
      </mesh>

      {/* Waste storage area */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[2, 2, 3, 16]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>

      {/* Waste level indicator */}
      <mesh position={[0, 1 + (wasteLevel / 100) * 1.5, 0]} castShadow>
        <cylinderGeometry args={[1.8, 1.8, (wasteLevel / 100) * 3, 16]} />
        <meshStandardMaterial color="#dc2626" transparent opacity={0.8} />
      </mesh>

      {/* Control room */}
      <mesh position={[0, 2, 3.5]} castShadow>
        <boxGeometry args={[2, 1, 0.5]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>

      {/* Processing animation */}
      {showProcess && (
        <group>
          <Sparkles count={50} scale={[5, 3, 5]} size={3} speed={0.5} color="#10b981" />
          <pointLight position={[0, 3, 0]} intensity={2} color="#10b981" distance={8} />
        </group>
      )}

      {/* Interactive control panel */}
      <Html position={[0, 5, 0]} transform>
        <div style={{ 
          background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)', 
          padding: '16px', 
          borderRadius: '12px', 
          color: 'white', 
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          minWidth: '250px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 12px 0' }}>🗑️ Waste Management</h3>
          <div style={{ marginBottom: '12px' }}>
            <div>Waste Level: {Math.round(wasteLevel)}%</div>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              background: '#4b5563', 
              borderRadius: '4px',
              margin: '8px 0'
            }}>
              <div style={{ 
                width: `${wasteLevel}%`, 
                height: '100%', 
                background: wasteLevel > 80 ? '#dc2626' : '#f59e0b', 
                borderRadius: '4px',
                transition: 'width 0.3s'
              }}></div>
            </div>
          </div>
          <button 
            onClick={handleProcessWaste}
            disabled={processing || wasteLevel < 20}
            style={{ 
              background: processing ? '#6b7280' : wasteLevel >= 20 ? '#10b981' : '#9ca3af',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: wasteLevel >= 20 && !processing ? 'pointer' : 'not-allowed',
              width: '100%',
              fontWeight: 'bold'
            }}
          >
            {processing ? '🔄 Processing...' : '♻️ Process Waste (4hrs)'}
          </button>
          {processing && (
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#d1d5db' }}>
              ⏳ Processing via WiFi connection...
            </div>
          )}
        </div>
      </Html>

      {/* Waste collection points around town */}
      {Array.from({ length: 5 }).map((_, i) => (
        <WasteBin key={i} position={[
          Math.random() * 60 - 30,
          0,
          Math.random() * 60 - 30
        ]} />
      ))}
    </group>
  )
}

/* ----- Waste Bin Component ----- */
function WasteBin({ position = [0, 0, 0] }) {
  const [fullness, setFullness] = useState(0)
  const setAlert = useStore((s) => s.setAlert)

  useEffect(() => {
    const interval = setInterval(() => {
      setFullness(prev => Math.min(1, prev + Math.random() * 0.1))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleEmpty = () => {
    setFullness(0)
    setAlert({ type: 'info', message: '🗑️ Waste collected and sent to management system' })
    setTimeout(() => setAlert(null), 3000)
  }

  return (
    <group position={position}>
      {/* Bin body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.4, 0.5, 1, 8]} />
        <meshStandardMaterial color="#4b5563" />
      </mesh>
      
      {/* Waste inside */}
      {fullness > 0 && (
        <mesh position={[0, fullness * 0.4 - 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, fullness * 0.8, 8]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
      )}

      {/* Lid */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.52, 0.52, 0.05, 8]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>

      <Html position={[0, 1.2, 0]} transform>
        <div style={{ 
          background: 'rgba(255,255,255,0.95)', 
          padding: '8px', 
          borderRadius: '6px', 
          fontSize: '10px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          <div>🗑️ {Math.round(fullness * 100)}% full</div>
          {fullness > 0.7 && (
            <button 
              onClick={handleEmpty}
              style={{ 
                background: '#dc2626', 
                color: 'white', 
                border: 'none', 
                padding: '2px 6px', 
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '8px',
                marginTop: '4px'
              }}
            >
              Empty
            </button>
          )}
        </div>
      </Html>
    </group>
  )
}

/* ----- Cultural Center Component ----- */
function CulturalCenter({ position = [-15, 0, -10] }) {
  const [activeCulture, setActiveCulture] = useState('Sindhi')
  const setAlert = useStore((s) => s.setAlert)

  const cultures = {
    Sindhi: { color: '#dc2626', pattern: '🎵', description: 'Sindhi Music & Dance' },
    Balochi: { color: '#059669', pattern: '🏔️', description: 'Balochi Traditions' },
    Pashto: { color: '#7c3aed', pattern: '💃', description: 'Pashto Attan Dance' },
    Punjabi: { color: '#d97706', pattern: '🥁', description: 'Punjabi Bhangra' }
  }

  const showCulture = (culture) => {
    setActiveCulture(culture)
    setAlert({ 
      type: 'info', 
      message: `${cultures[culture].pattern} Now showing: ${culture} Culture - ${cultures[culture].description}` 
    })
    setTimeout(() => setAlert(null), 4000)
  }

  return (
    <group position={position}>
      {/* Main cultural center building - light brown */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[8, 6, 8]} />
        <meshStandardMaterial color="#d2b48c" roughness={0.8} />
      </mesh>

      {/* Decorative elements */}
      <mesh position={[0, 3.5, 4]} castShadow>
        <boxGeometry args={[6, 2, 0.3]} />
        <meshStandardMaterial color="#b45309" />
      </mesh>

      {/* Cultural displays */}
      <group position={[0, 3, 0]}>
        {Object.entries(cultures).map(([culture, info], index) => {
          const angle = (index / Object.keys(cultures).length) * Math.PI * 2
          const x = Math.cos(angle) * 3
          const z = Math.sin(angle) * 3
          
          return (
            <group key={culture} position={[x, 0, z]}>
              <mesh 
                castShadow 
                onClick={() => showCulture(culture)}
                rotation={[0, -angle, 0]}
              >
                <cylinderGeometry args={[0.8, 0.8, 0.1, 6]} />
                <meshStandardMaterial color={info.color} />
              </mesh>
              
              <Text
                position={[0, 0.8, 0]}
                fontSize={0.3}
                color={info.color}
                anchorX="center"
                anchorY="middle"
                rotation={[0, -angle, 0]}
              >
                {info.pattern}
              </Text>

              <Html position={[0, 1.5, 0]} transform>
                <div style={{ 
                  background: 'rgba(255,255,255,0.95)', 
                  padding: '8px', 
                  borderRadius: '6px', 
                  fontSize: '10px',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  cursor: 'pointer'
                }}>
                  {culture}
                </div>
              </Html>
            </group>
          )
        })}
      </group>

      {/* Main display area */}
      <Html position={[0, 4, 0]} transform>
        <div style={{ 
          background: 'linear-gradient(135deg, #fef3c7 0%, #f59e0b 100%)', 
          padding: '20px', 
          borderRadius: '12px', 
          color: '#78350f',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          minWidth: '300px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 12px 0' }}>🏛️ Cultural Center</h3>
          <div style={{ 
            fontSize: '24px', 
            marginBottom: '8px',
            background: cultures[activeCulture].color,
            color: 'white',
            padding: '8px',
            borderRadius: '8px'
          }}>
            {cultures[activeCulture].pattern}
          </div>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
            {activeCulture} Culture
          </div>
          <div style={{ fontSize: '12px', marginTop: '8px' }}>
            {cultures[activeCulture].description}
          </div>
          <div style={{ fontSize: '10px', marginTop: '12px', opacity: 0.7 }}>
            Click around displays to explore different cultures!
          </div>
        </div>
      </Html>

      {/* People enjoying culture */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const x = Math.cos(angle) * 5
        const z = Math.sin(angle) * 5
        return (
          <mesh key={i} position={[x, 0.5, z]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 1, 8]} />
            <meshStandardMaterial color="#f59e0b" />
          </mesh>
        )
      })}
    </group>
  )
}

/* ----- Enhanced Smart Building with Solar Panels and Turbines ----- */
function SmartBuilding({ 
  position = [0, 0, 0], 
  height = 8, 
  color = "#a67c52", 
  windows = true,
  name = "Building",
  hasSolar = true,
  hasTurbine = false
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
      {/* Main structure */}
      <mesh castShadow receiveShadow onClick={handleClick}>
        <boxGeometry args={[3, height, 3]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
      </mesh>
      
      {/* Windows */}
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
                <mesh position={[1.5, (floor * 2) - height/2 + 2, side * 0.8]} castShadow>
                  <boxGeometry args={[0.04, 1.3, 0.85]} />
                  <meshStandardMaterial color="#8b4513" />
                </mesh>
              </group>
            ))
          )}
        </group>
      )}
      
      {/* Rooftop solar panels */}
      {hasSolar && (
        <group position={[0, height/2 + 0.1, 0]}>
          <SolarPanel position={[0, 0.2, -0.8]} rotation={Math.PI / 4} />
          <SolarPanel position={[0, 0.2, 0.8]} rotation={-Math.PI / 4} />
          <SolarPanel position={[-0.8, 0.2, 0]} rotation={Math.PI} />
          <SolarPanel position={[0.8, 0.2, 0]} rotation={0} />
        </group>
      )}

      {/* Wind turbine */}
      {hasTurbine && (
        <WindTurbine position={[0, 0, 0]} buildingHeight={height} />
      )}

      {/* Rooftop */}
      <mesh position={[0, height/2 + 0.2, 0]} castShadow>
        <boxGeometry args={[3.2, 0.4, 3.2]} />
        <meshStandardMaterial color="#8b4513" />
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

/* ----- Updated City Layout ----- */
function CityLayout() {
  const buildings = [
    // Residential area with turbines and solar
    { position: [-25, 0, 15], height: 6, color: "#a67c52", name: "Oasis A", hasSolar: true, hasTurbine: true },
    { position: [-20, 0, 18], height: 8, color: "#b5651d", name: "Desert View", hasSolar: true, hasTurbine: false },
    { position: [-30, 0, 20], height: 7, color: "#c19a6b", name: "Mirage Res", hasSolar: true, hasTurbine: true },
    
    // Commercial area with solar
    { position: [20, 0, -15], height: 12, color: "#8b4513", name: "Dunes Tower", hasSolar: true, hasTurbine: false },
    { position: [25, 0, -18], height: 10, color: "#a0522d", name: "Sahara Plaza", hasSolar: true, hasTurbine: true },
    { position: [15, 0, -20], height: 14, color: "#cd853f", name: "Oasis Tower", hasSolar: true, hasTurbine: false },
    
    // Mixed use
    { position: [-15, 0, -10], height: 9, color: "#deb887", name: "Sunset A", hasSolar: true, hasTurbine: true },
    { position: [10, 0, 12], height: 11, color: "#d2b48c", name: "Palm Court", hasSolar: true, hasTurbine: false },
    { position: [-5, 0, -15], height: 8, color: "#f4a460", name: "Desert Bloom", hasSolar: true, hasTurbine: true },
    
    // More buildings
    { position: [30, 0, 5], height: 13, color: "#8b4513", name: "Plaza Tower", hasSolar: true, hasTurbine: false },
    { position: [-28, 0, -5], height: 7, color: "#a67c52", name: "Garden View", hasSolar: true, hasTurbine: true },
    { position: [8, 0, -25], height: 10, color: "#b8860b", name: "Golden Sands", hasSolar: true, hasTurbine: false },
    { position: [-12, 0, 25], height: 9, color: "#daa520", name: "Sun Valley", hasSolar: true, hasTurbine: true },
    { position: [22, 0, 22], height: 15, color: "#8b4513", name: "Central Oasis", hasSolar: true, hasTurbine: false }
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
          hasSolar={building.hasSolar}
          hasTurbine={building.hasTurbine}
        />
      ))}
      
      {/* Add palm trees */}
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

// ... (keep the existing Ground, PalmTree, PeopleSystem, EcoBench, HubFallback, SolarBus, GardenFallback components as they are)

/* ----- Enhanced HUD ----- */
function HUD() {
  const alert = useStore((s) => s.alert)
  const timeOfDay = useStore((s) => s.timeOfDay)
  const wasteLevel = useStore((s) => s.wasteLevel)
  
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
          🏜️ Desert Smart City • Time: {timeOfDay} • Waste: {Math.round(wasteLevel)}% • Systems: ✅ Nominal
        </div>
      )}
    </div>
  )
}

/* ----- Enhanced Control Panel ----- */
function ControlPanel() {
  const setTimeOfDay = useStore((s) => s.setTimeOfDay)
  const setTrafficDensity = useStore((s) => s.setTrafficDensity)
  const setFocus = useStore((s) => s.setFocus)

  const locations = {
    '🚌 Transportation Hub': { x: -8, y: 5, z: -2, lookAt: { x: -8, y: 0, z: -2 } },
    '🌿 Community Garden': { x: 8, y: 5, z: -6, lookAt: { x: 8, y: 0, z: -6 } },
    '🏛️ Cultural Center': { x: -15, y: 5, z: -10, lookAt: { x: -15, y: 0, z: -10 } },
    '🗑️ Waste Management': { x: 15, y: 5, z: 25, lookAt: { x: 15, y: 0, z: 25 } },
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
  const setWasteLevel = useStore((s) => s.setWasteLevel)
  
  const skyConfig = {
    day: { sunPosition: [100, 20, 100], inclination: 0, azimuth: 0.25 },
    evening: { sunPosition: [10, 5, 100], inclination: 0, azimuth: 0.25 },
    night: { sunPosition: [-100, -20, 100], inclination: 0, azimuth: 0.25 }
  }

  // Global waste level simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setWasteLevel(prev => Math.min(100, prev + Math.random() * 0.5))
    }, 5000)
    return () => clearInterval(interval)
  }, [setWasteLevel])

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
          
          {/* Complete City Layout with solar panels and turbines */}
          <CityLayout />
          
          {/* Animated People */}
          <PeopleSystem />
          
          {/* Main Features */}
          <HubFallback position={[-8, 0, -2]} />
          <SolarBus />
          <GardenFallback position={[8, 0, -6]} />
          
          {/* NEW: Cultural Center and Waste Management */}
          <CulturalCenter position={[-15, 0, -10]} />
          <WasteManagementSystem position={[15, 0, 25]} />
          
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
