// src/App.jsx
import React, { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, useGLTF, ContactShadows, Sky, Text, Sparkles, Float, useTexture } from '@react-three/drei'
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
  streetLightsOn: false,
  setStreetLightsOn: (s) => set({ streetLightsOn: s })
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

/* ----- Custom Orbit Controls ----- */
function CustomOrbitControls() {
  const { camera, gl } = useThree()
  const controlsRef = useRef()

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={true}
      enableRotate={true}
      enableZoom={true}
      minDistance={3}
      maxDistance={50}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
      panSpeed={0.5}
      screenSpacePanning={true}
    />
  )
}

/* ----- Road System ----- */
function RoadSystem() {
  const roadTexture = useTexture({
    map: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMzMzMzMzIi8+CjxwYXRoIGQ9Ik0yNSA1TDI1IDQ1IiBzdHJva2U9IiNmZmZmMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWRhc2hhcnJheT0iNCA0Ii8+Cjwvc3ZnPg=='
  })

  const mainRoads = [
    { start: [-40, 0, 0], end: [40, 0, 0], width: 4 },
    { start: [0, 0, -40], end: [0, 0, 40], width: 4 },
    { start: [-30, 0, -20], end: [30, 0, -20], width: 3 },
    { start: [-20, 0, 30], end: [20, 0, 30], width: 3 }
  ]

  return (
    <group>
      {mainRoads.map((road, index) => {
        const length = Math.sqrt(
          Math.pow(road.end[0] - road.start[0], 2) +
          Math.pow(road.end[2] - road.start[2], 2)
        )
        const center = [
          (road.start[0] + road.end[0]) / 2,
          0.01,
          (road.start[2] + road.end[2]) / 2
        ]
        const angle = Math.atan2(road.end[2] - road.start[2], road.end[0] - road.start[0])

        return (
          <mesh key={index} position={center} rotation={[-Math.PI / 2, 0, angle]}>
            <planeGeometry args={[length, road.width]} />
            <meshStandardMaterial 
              map={roadTexture.map}
              color="#333333"
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>
        )
      })}

      {/* Road markings */}
      {mainRoads.map((road, index) => {
        const segments = Math.floor(Math.sqrt(
          Math.pow(road.end[0] - road.start[0], 2) +
          Math.pow(road.end[2] - road.start[2], 2)
        ) / 4)
        
        return Array.from({ length: segments }).map((_, segIndex) => {
          const t = (segIndex + 0.5) / segments
          const pos = [
            road.start[0] + (road.end[0] - road.start[0]) * t,
            0.02,
            road.start[2] + (road.end[2] - road.start[2]) * t
          ]
          
          return (
            <mesh key={`${index}-${segIndex}`} position={pos} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2, 0.3]} />
              <meshStandardMaterial color="#ffff00" />
            </mesh>
          )
        })
      })}
    </group>
  )
}

/* ----- Street Lights ----- */
function StreetLight({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const timeOfDay = useStore((s) => s.timeOfDay)
  const streetLightsOn = useStore((s) => s.streetLightsOn)
  
  const isOn = streetLightsOn || timeOfDay === 'night'

  return (
    <group position={position} rotation={rotation}>
      {/* Pole */}
      <mesh position={[0, 3, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 6, 8]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      
      {/* Light fixture */}
      <mesh position={[0, 6, 0.5]} castShadow>
        <boxGeometry args={[0.4, 0.2, 0.6]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      
      {/* Light bulb */}
      <mesh position={[0, 6, 0.8]} castShadow>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial 
          color={isOn ? "#ffffcc" : "#666666"}
          emissive={isOn ? "#ffff99" : "#000000"}
          emissiveIntensity={isOn ? 1 : 0}
        />
      </mesh>
      
      {/* Light glow */}
      {isOn && (
        <pointLight
          position={[0, 6, 0.8]}
          intensity={0.8}
          distance={15}
          color="#ffffcc"
          castShadow
        />
      )}
    </group>
  )
}

/* ----- Street Light System ----- */
function StreetLightSystem() {
  const lightPositions = [
    // Main roads
    ...Array.from({ length: 16 }).map((_, i) => [-35 + i * 5, 0, 0]),
    ...Array.from({ length: 16 }).map((_, i) => [0, 0, -35 + i * 5]),
    ...Array.from({ length: 12 }).map((_, i) => [-25 + i * 5, 0, -20]),
    ...Array.from({ length: 10 }).map((_, i) => [-15 + i * 5, 0, 30]),
    
    // Around important buildings
    [15, 0, 15], [-15, 0, 15], [0, 0, 0], [-8, 0, -2], [8, 0, -6]
  ]

  return (
    <group>
      {lightPositions.map((pos, index) => (
        <StreetLight key={index} position={pos} />
      ))}
    </group>
  )
}

/* ----- Enhanced Vehicle System ----- */
function Car({ position = [0, 0, 0], color = "#ff4444", speed = 1, path = [] }) {
  const carRef = useRef()
  const [t, setT] = useState(Math.random() * 10)

  useFrame((_, dt) => {
    setT(prev => prev + dt * speed)
    
    if (carRef.current && path.length > 0) {
      const tt = t % path.length
      const i = Math.floor(tt) % path.length
      const a = new THREE.Vector3(...path[i])
      const b = new THREE.Vector3(...path[(i + 1) % path.length])
      const f = tt % 1
      const pos = a.clone().lerp(b, f)
      
      carRef.current.position.lerp(pos, 0.1)
      carRef.current.lookAt(b)
    }
  })

  return (
    <group ref={carRef} position={position}>
      {/* Car body */}
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.4, 0.6]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
      </mesh>
      
      {/* Windows */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[1.1, 0.2, 0.5]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
      </mesh>
      
      {/* Wheels */}
      {[-0.4, 0.4].map((x, i) => (
        <group key={i} position={[x, -0.2, 0.3]}>
          <mesh castShadow rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.15, 0.15, 0.1, 8]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Bus({ position = [0, 0, 0], path = [] }) {
  const busRef = useRef()
  const [t, setT] = useState(Math.random() * 10)

  useFrame((_, dt) => {
    setT(prev => prev + dt * 0.5)
    
    if (busRef.current && path.length > 0) {
      const tt = t % path.length
      const i = Math.floor(tt) % path.length
      const a = new THREE.Vector3(...path[i])
      const b = new THREE.Vector3(...path[(i + 1) % path.length])
      const f = tt % 1
      const pos = a.clone().lerp(b, f)
      
      busRef.current.position.lerp(pos, 0.1)
      busRef.current.lookAt(b)
    }
  })

  return (
    <group ref={busRef} position={position}>
      {/* Bus body - YELLOW */}
      <mesh castShadow>
        <boxGeometry args={[2.5, 1.2, 1.2]} />
        <meshStandardMaterial color={"#FFD700"} metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Windows */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[2.4, 0.5, 1.1]} />
        <meshStandardMaterial color={"#2c3e50"} transparent opacity={0.7} />
      </mesh>

      {/* Wheels */}
      {[-0.8, 0.8].map((x, i) => (
        <group key={i} position={[x, -0.3, 0]}>
          <mesh castShadow rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.15, 8]} />
            <meshStandardMaterial color={"#333333"} />
          </mesh>
        </group>
      ))}

      {/* Bus sign */}
      <Text
        position={[0, 0.8, 0.61]}
        fontSize={0.2}
        color="#ff4444"
        anchorX="center"
        anchorY="middle"
      >
        CITY BUS
      </Text>
    </group>
  )
}

/* ----- Traffic System ----- */
function TrafficSystem() {
  const trafficDensity = useStore((s) => s.trafficDensity)
  
  const carPaths = [
    // Horizontal routes
    [[-35, 0.3, 0], [-25, 0.3, 0], [-15, 0.3, 0], [-5, 0.3, 0], [5, 0.3, 0], [15, 0.3, 0], [25, 0.3, 0], [35, 0.3, 0]],
    [[-35, 0.3, -20], [-25, 0.3, -20], [-15, 0.3, -20], [-5, 0.3, -20], [5, 0.3, -20], [15, 0.3, -20], [25, 0.3, -20], [35, 0.3, -20]],
    
    // Vertical routes
    [[0, 0.3, -35], [0, 0.3, -25], [0, 0.3, -15], [0, 0.3, -5], [0, 0.3, 5], [0, 0.3, 15], [0, 0.3, 25], [0, 0.3, 35]],
    [[20, 0.3, -35], [20, 0.3, -25], [20, 0.3, -15], [20, 0.3, -5], [20, 0.3, 5], [20, 0.3, 15], [20, 0.3, 25], [20, 0.3, 35]]
  ]

  const busPaths = [
    [[-35, 0.4, 0], [-15, 0.4, 0], [0, 0.4, 0], [15, 0.4, 0], [35, 0.4, 0]],
    [[0, 0.4, -35], [0, 0.4, -15], [0, 0.4, 0], [0, 0.4, 15], [0, 0.4, 35]]
  ]

  const carColors = ["#ff4444", "#44ff44", "#4444ff", "#ffff44", "#ff44ff", "#44ffff"]
  const carCount = trafficDensity === 'low' ? 8 : trafficDensity === 'medium' ? 15 : 25
  const busCount = trafficDensity === 'low' ? 1 : trafficDensity === 'medium' ? 2 : 4

  return (
    <group>
      {/* Cars */}
      {Array.from({ length: carCount }).map((_, i) => (
        <Car
          key={`car-${i}`}
          color={carColors[i % carColors.length]}
          speed={0.5 + Math.random() * 0.5}
          path={carPaths[i % carPaths.length]}
        />
      ))}
      
      {/* Buses */}
      {Array.from({ length: busCount }).map((_, i) => (
        <Bus
          key={`bus-${i}`}
          path={busPaths[i % busPaths.length]}
        />
      ))}
    </group>
  )
}

/* ----- Enhanced Ground with Roads ----- */
function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color={"#d2b48c"} roughness={0.9} metalness={0.1} />
      </mesh>
      
      {/* Road System */}
      <RoadSystem />
      
      {/* Street Light System */}
      <StreetLightSystem />
      
      <gridHelper args={[200, 200, '#8b7355', '#8b7355']} position={[0, 0.01, 0]} />
      <ContactShadows position={[0, -0.03, 0]} opacity={0.3} width={50} blur={2} far={20} />
    </>
  )
}

/* ----- SMALLER Wind Turbine Component ----- */
function WindTurbine({ position = [0, 0, 0] }) {
  const turbineRef = useRef()
  
  useFrame(() => {
    if (turbineRef.current) {
      turbineRef.current.rotation.y += 0.05
    }
  })

  return (
    <group position={position} scale={[0.7, 0.7, 0.7]}>
      {/* Tower */}
      <mesh position={[0, 5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 8, 8]} />
        <meshStandardMaterial color="#708090" />
      </mesh>
      
      {/* Rotating blades */}
      <group ref={turbineRef} position={[0, 8, 0]}>
        {/* Hub */}
        <mesh castShadow>
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        
        {/* Blades - Smaller */}
        {[0, 1, 2].map((i) => (
          <mesh 
            key={i} 
            rotation={[0, 0, (i * Math.PI * 2) / 3]} 
            position={[1.5, 0, 0]}
            castShadow
          >
            <boxGeometry args={[3, 0.15, 0.4]} />
            <meshStandardMaterial color="#ecf0f1" />
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
      <mesh castShadow>
        <boxGeometry args={[1.5, 0.02, 1]} />
        <meshStandardMaterial color={"#1e3a8a"} metalness={0.9} roughness={0.05} />
      </mesh>
      <mesh position={[0, -0.1, 0]} castShadow>
        <boxGeometry args={[1.6, 0.08, 1.1]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
    </group>
  )
}

/* ----- Smart Buildings with Solar and Turbines ----- */
function SmartBuilding({ 
  position = [0, 0, 0], 
  height = 8, 
  color = "#a67c52", 
  name = "Building",
  hasTurbine = false,
  hasSolar = true
}) {
  const setFocus = useStore((s) => s.setFocus)

  const handleClick = () => {
    setFocus({
      x: position[0],
      y: position[1] + height/2,
      z: position[2],
      lookAt: { x: position[0], y: position[1], z: position[2] }
    })
  }

  return (
    <group position={position}>
      {/* Main structure */}
      <mesh castShadow receiveShadow onClick={handleClick}>
        <boxGeometry args={[3, height, 3]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
      </mesh>
      
      {/* Windows */}
      <group>
        {Array.from({ length: Math.floor(height / 2) }).map((_, floor) =>
          [-1, 1].map((side, i) => (
            <group key={`${floor}-${side}`}>
              <mesh
                position={[1.51, (floor * 2) - height/2 + 2, side * 0.8]}
                castShadow
              >
                <boxGeometry args={[0.02, 1.2, 0.8]} />
                <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
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
      
      {/* Rooftop */}
      <mesh position={[0, height/2 + 0.2, 0]} castShadow>
        <boxGeometry args={[3.2, 0.4, 3.2]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* Solar Panels on roof */}
      {hasSolar && (
        <group position={[0, height/2 + 0.3, 0]}>
          <SolarPanel position={[0, 0, 0]} rotation={[0, 0, 0]} />
          <SolarPanel position={[1.8, 0, 0]} rotation={[0, Math.PI/4, 0]} />
          <SolarPanel position={[-1.8, 0, 0]} rotation={[0, -Math.PI/4, 0]} />
        </group>
      )}

      {/* SMALLER Wind Turbine on roof */}
      {hasTurbine && (
        <WindTurbine position={[0, height/2, 0]} />
      )}

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

/* ----- Waste Bin Component ----- */
function WasteBin({ position = [0, 0, 0], onWasteThrow }) {
  const [fillLevel, setFillLevel] = useState(0)

  const handleClick = () => {
    if (fillLevel < 1) {
      setFillLevel(prev => Math.min(1, prev + 0.25))
      if (onWasteThrow) {
        onWasteThrow()
      }
    }
  }

  return (
    <group position={position}>
      {/* Bin body - GREEN */}
      <mesh castShadow onClick={handleClick}>
        <cylinderGeometry args={[0.4, 0.5, 1, 16]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>
      
      {/* Waste level indicator */}
      <mesh position={[0, (fillLevel - 0.5) * 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.45, fillLevel * 0.8, 16]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* Lid */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.52, 0.52, 0.05, 16]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>

      <Html position={[0, 1.2, 0]}>
        <div style={{
          background: '#27ae60',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '10px',
          fontWeight: 'bold'
        }}>
          🗑️ {Math.round(fillLevel * 100)}%
        </div>
      </Html>
    </group>
  )
}

/* ----- Enhanced Waste Management System ----- */
function WasteManagementSystem({ position = [15, 0, 15] }) {
  const [processTime, setProcessTime] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [wasteCollected, setWasteCollected] = useState(0)
  
  const startProcessing = () => {
    if (wasteCollected > 0 && !isProcessing) {
      setIsProcessing(true)
      setProcessTime(0)
    }
  }

  useFrame((_, dt) => {
    if (isProcessing) {
      setProcessTime(prev => {
        const newTime = prev + dt
        if (newTime >= 4) { // 4 seconds process
          setIsProcessing(false)
          setWasteCollected(0)
        }
        return newTime
      })
    }
  })

  const handleWasteThrow = () => {
    setWasteCollected(prev => prev + 1)
  }

  return (
    <group position={position}>
      {/* Main waste management building */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[8, 6, 8]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.7} />
      </mesh>

      {/* Processing tanks */}
      <group position={[0, 3.5, 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.6, 0.6, 2, 16]} />
          <meshStandardMaterial color="#34495e" />
        </mesh>
      </group>

      {/* Solar panels */}
      <group position={[0, 3.5, 0]}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SolarPanel 
            key={i}
            position={[-3 + i * 1.2, 0.5, 3.5]} 
            rotation={[0, Math.PI/2, 0]} 
          />
        ))}
      </group>

      {/* SMALLER Wind turbine */}
      <WindTurbine position={[0, 3, 0]} />

      {/* Information display */}
      <Html position={[0, 5, 0]} transform>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '15px',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          minWidth: '250px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>🔄 Waste Management</h3>
          
          <div style={{ marginBottom: '10px' }}>
            <div>🗑️ Waste Collected: {wasteCollected}</div>
            <div>⏱️ Process Time: {Math.min(4, processTime).toFixed(1)}/4 hrs</div>
          </div>

          <button 
            onClick={startProcessing}
            disabled={isProcessing || wasteCollected === 0}
            style={{
              background: isProcessing ? '#95a5a6' : wasteCollected === 0 ? '#95a5a6' : '#27ae60',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: wasteCollected > 0 && !isProcessing ? 'pointer' : 'not-allowed',
              marginTop: '5px',
              width: '100%'
            }}
          >
            {isProcessing ? '🔄 Processing...' : wasteCollected === 0 ? 'No Waste' : 'Start Processing'}
          </button>
        </div>
      </Html>

      {/* GREEN Waste bins around the facility */}
      <WasteBin position={[4, 0, 2]} onWasteThrow={handleWasteThrow} />
      <WasteBin position={[4, 0, -2]} onWasteThrow={handleWasteThrow} />
      <WasteBin position={[-4, 0, 2]} onWasteThrow={handleWasteThrow} />
      <WasteBin position={[-4, 0, -2]} onWasteThrow={handleWasteThrow} />

      <Text
        position={[0, 7, 0]}
        fontSize={0.4}
        color="#2c3e50"
        anchorX="center"
        anchorY="middle"
      >
        Waste Management
      </Text>
    </group>
  )
}

/* ----- City Layout ----- */
function CityLayout() {
  const buildings = [
    // Residential area
    { position: [-25, 0, 15], height: 6, color: "#a67c52", name: "Residence A", hasTurbine: true },
    { position: [-20, 0, 18], height: 8, color: "#b5651d", name: "Residence B", hasTurbine: false },
    { position: [-30, 0, 20], height: 7, color: "#c19a6b", name: "Residence C", hasTurbine: true },
    
    // Commercial area
    { position: [20, 0, -15], height: 12, color: "#8b4513", name: "Office A", hasTurbine: true },
    { position: [25, 0, -18], height: 10, color: "#a0522d", name: "Office B", hasTurbine: false },
    { position: [15, 0, -20], height: 14, color: "#cd853f", name: "Office C", hasTurbine: true },
    
    // Mixed use
    { position: [-15, 0, -10], height: 9, color: "#deb887", name: "Mixed A", hasTurbine: true },
    { position: [10, 0, 12], height: 11, color: "#d2b48c", name: "Mixed B", hasTurbine: false },
    { position: [-5, 0, -15], height: 8, color: "#f4a460", name: "Mixed C", hasTurbine: true }
  ]

  return (
    <group>
      {/* Regular buildings */}
      {buildings.map((building, index) => (
        <SmartBuilding
          key={index}
          position={building.position}
          height={building.height}
          color={building.color}
          name={building.name}
          hasTurbine={building.hasTurbine}
          hasSolar={true}
        />
      ))}
      
      {/* Waste Management System */}
      <WasteManagementSystem position={[15, 0, 15]} />
      
      {/* Additional GREEN waste bins around town */}
      <WasteBin position={[-10, 0, 8]} />
      <WasteBin position={[12, 0, -5]} />
      <WasteBin position={[-5, 0, -12]} />
      <WasteBin position={[18, 0, 10]} />
      <WasteBin position={[-15, 0, -18]} />
    </group>
  )
}

/* ----- Enhanced HUD ----- */
function HUD() {
  const alert = useStore((s) => s.alert)
  const timeOfDay = useStore((s) => s.timeOfDay)
  
  const alertStyles = {
    info: { background: 'linear-gradient(135deg, #d2691e, #8b4513)', color: 'white' },
    emergency: { background: 'linear-gradient(135deg, #e74c3c, #c0392b)', color: 'white' },
    success: { background: 'linear-gradient(135deg, #27ae60, #229954)', color: 'white' }
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
          🏙️ Smart City • Time: {timeOfDay} • Traffic: 🟢 Flowing
        </div>
      )}
    </div>
  )
}

/* ----- Control Panel ----- */
function ControlPanel() {
  const setTimeOfDay = useStore((s) => s.setTimeOfDay)
  const setTrafficDensity = useStore((s) => s.setTrafficDensity)
  const setStreetLightsOn = useStore((s) => s.setStreetLightsOn)
  const setFocus = useStore((s) => s.setFocus)

  const locations = {
    '🏙️ City Center': { x: 0, y: 15, z: 0, lookAt: { x: 0, y: 0, z: 0 } },
    '🗑️ Waste Management': { x: 15, y: 10, z: 15, lookAt: { x: 15, y: 0, z: 15 } },
    '🛣️ Main Road': { x: 0, y: 8, z: 20, lookAt: { x: 0, y: 0, z: 0 } }
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
      <h3 style={{ margin: '0 0 12px 0', color: '#8b4513' }}>City Controls</h3>
      
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4, fontSize: '12px', fontWeight: 'bold' }}>
          Time of Day:
        </label>
        <select 
          onChange={(e) => {
            setTimeOfDay(e.target.value)
            setStreetLightsOn(e.target.value === 'night')
          }}
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

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4, fontSize: '12px', fontWeight: 'bold' }}>
          Street Lights:
        </label>
        <button 
          onClick={() => setStreetLightsOn(true)}
          style={{ 
            width: '48%', 
            background: '#27ae60', 
            color: 'white', 
            border: 'none', 
            padding: '6px', 
            borderRadius: '6px',
            cursor: 'pointer',
            marginRight: '2%'
          }}
        >
          ON
        </button>
        <button 
          onClick={() => setStreetLightsOn(false)}
          style={{ 
            width: '48%', 
            background: '#e74c3c', 
            color: 'white', 
            border: 'none', 
            padding: '6px', 
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          OFF
        </button>
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

/* ----- Main App Component ----- */
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
      
      <Canvas shadows camera={{ position: [30, 20, 30], fov: 50 }}>
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
              Loading Smart City...
            </div>
          </Html>
        }>
          <Sky {...skyConfig[timeOfDay]} />
          
          <Ground />
          
          {/* Complete City Layout */}
          <CityLayout />
          
          {/* Traffic System */}
          <TrafficSystem />
          
          <ContactShadows position={[0, -0.1, 0]} opacity={0.4} width={40} blur={2} far={10} />
        </Suspense>
        
        {/* Custom Controls */}
        <CustomOrbitControls />
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
          🎮 Controls: Drag to rotate • Scroll to zoom • Click buildings to focus
        </div>
        <div style={{ fontSize: 11, color: '#a67c52', marginTop: 4 }}>
          Smart City with Roads, Traffic, Solar Panels, Wind Turbines & Waste Management
        </div>
      </div>
    </div>
  )
}
