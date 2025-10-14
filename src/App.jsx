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
  setStreetLightsOn: (s) => set({ streetLightsOn: s }),
  wasteBins: {},
  updateWasteBin: (id, level) => set((state) => ({ 
    wasteBins: { ...state.wasteBins, [id]: level } 
  })),
  alertWasteManagement: false,
  setAlertWasteManagement: (alert) => set({ alertWasteManagement: alert }),
  emergencyAlarm: false,
  setEmergencyAlarm: (alarm) => set({ emergencyAlarm: alarm }),
  wasteProcessing: {
    isProcessing: false,
    processTime: 0,
    recycledWaste: 0,
    reducedWaste: 0,
    reusedWaste: 0
  },
  setWasteProcessing: (processing) => set({ wasteProcessing: processing }),
  currentView: 'exterior',
  setCurrentView: (view) => set({ currentView: view }),
  selectedHouse: null,
  setSelectedHouse: (house) => set({ selectedHouse: house })
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
  const currentView = useStore((s) => s.currentView)

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={currentView === 'exterior'}
      enableRotate={currentView === 'exterior'}
      enableZoom={true}
      minDistance={currentView === 'interior' ? 2 : 3}
      maxDistance={currentView === 'interior' ? 10 : 50}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
      panSpeed={0.5}
      screenSpacePanning={true}
    />
  )
}

/* ----- Wheelchair User ----- */
function WheelchairUser({ position = [0, 0, 0], color = "#8b4513", speed = 1, path = [] }) {
  const userRef = useRef()
  const [t, setT] = useState(Math.random() * 10)

  useFrame((_, dt) => {
    setT(prev => prev + dt * speed)
    
    if (userRef.current && path.length > 0) {
      const tt = t % path.length
      const i = Math.floor(tt) % path.length
      const a = new THREE.Vector3(...path[i])
      const b = new THREE.Vector3(...path[(i + 1) % path.length])
      const f = tt % 1
      const pos = a.clone().lerp(b, f)
      
      userRef.current.position.lerp(pos, 0.1)
      if (b) userRef.current.lookAt(b)
    }
  })

  return (
    <group ref={userRef} position={position}>
      {/* Wheelchair base */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.8, 0.1, 0.6]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      {/* Wheels */}
      <mesh position={[-0.3, 0.2, 0.3]} castShadow rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0.3, 0.2, 0.3]} castShadow rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[-0.3, 0.2, -0.3]} castShadow rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0.3, 0.2, -0.3]} castShadow rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Person body */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.6, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      
      {/* Arms on wheelchair */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[0.6, 0.1, 0.1]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
    </group>
  )
}

/* ----- Energy Efficient House with Interior ----- */
function EnergyEfficientHouse({ 
  position = [0, 0, 0], 
  isSpecial = false,
  label = "Eco Home"
}) {
  const setFocus = useStore((s) => s.setFocus)
  const setCurrentView = useStore((s) => s.setCurrentView)
  const setSelectedHouse = useStore((s) => s.setSelectedHouse)

  const handleClick = () => {
    if (isSpecial) {
      setSelectedHouse(label)
      setCurrentView('interior')
      setFocus({
        x: position[0],
        y: 3,
        z: position[2] + 2,
        lookAt: { x: position[0], y: 2, z: position[2] }
      })
    } else {
      setFocus({
        x: position[0],
        y: 8,
        z: position[2],
        lookAt: { x: position[0], y: 0, z: position[2] }
      })
    }
  }

  return (
    <group position={position}>
      {/* Main house structure */}
      <mesh castShadow receiveShadow onClick={handleClick}>
        <boxGeometry args={[5, 4, 5]} />
        <meshStandardMaterial color={isSpecial ? "#4ecdc4" : "#a67c52"} roughness={0.7} />
      </mesh>
      
      {/* Roof */}
      <mesh position={[0, 3, 0]} castShadow>
        <coneGeometry args={[4, 2, 4]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Windows */}
      <group>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[2.51, 1, side * 1.5]} castShadow>
            <boxGeometry args={[0.02, 1, 0.8]} />
            <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
          </mesh>
        ))}
      </group>
      
      {/* Front door */}
      <mesh position={[0, 1.5, 2.51]} castShadow>
        <boxGeometry args={[1, 2, 0.1]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Ramp for wheelchair access */}
      {isSpecial && (
        <mesh position={[1.5, 0.2, 2.6]} rotation={[0, 0, -Math.PI/8]} castShadow>
          <boxGeometry args={[2, 0.1, 1]} />
          <meshStandardMaterial color="#7f8c8d" />
        </mesh>
      )}
      
      {/* Solar panels */}
      <group position={[0, 3.5, 0]}>
        <mesh rotation={[Math.PI/4, 0, 0]} castShadow>
          <boxGeometry args={[3, 0.02, 2]} />
          <meshStandardMaterial color="#1e3a8a" metalness={0.9} roughness={0.05} />
        </mesh>
      </group>
      
      {/* Special label for the featured house */}
      {isSpecial && (
        <>
          <Text
            position={[0, 5, 0]}
            fontSize={0.4}
            color="#e74c3c"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {label}
          </Text>
          
          <Html position={[0, 6, 0]}>
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              padding: '10px',
              borderRadius: '8px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              minWidth: '200px',
              textAlign: 'center'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#27ae60' }}>🏠 Energy Efficient Home</h4>
              <div>✅ Moisture Managed</div>
              <div>✅ Improved Insulation</div>
              <div>✅ Pressure Balanced</div>
              <div>✅ Sealed Ducts</div>
              <div>✅ Tight Construction</div>
              <div>✅ Fresh Air Ventilation</div>
              <div>✅ Efficient Windows</div>
              <div>✅ Proper HVAC</div>
              <div>♿ Wheelchair Accessible</div>
              <div style={{ marginTop: '8px', fontWeight: 'bold', color: '#e74c3c' }}>
                Click to view interior
              </div>
            </div>
          </Html>
        </>
      )}
    </group>
  )
}

/* ----- House Interior ----- */
function HouseInterior({ position = [0, 0, 0] }) {
  const setCurrentView = useStore((s) => s.setCurrentView)
  const selectedHouse = useStore((s) => s.selectedHouse)

  return (
    <group position={position}>
      {/* Interior walls */}
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.8, 3.8, 4.8]} />
        <meshStandardMaterial color="#f5f5dc" />
      </mesh>
      
      {/* Floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
        <planeGeometry args={[4.5, 4.5]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>
      
      {/* Ceiling */}
      <mesh position={[0, 4, 0]} rotation={[Math.PI/2, 0, 0]} receiveShadow>
        <planeGeometry args={[4.5, 4.5]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      
      {/* Interior walls separation */}
      <mesh position={[0, 2, -1]} castShadow>
        <boxGeometry args={[4.8, 3.8, 0.1]} />
        <meshStandardMaterial color="#d2b48c" />
      </mesh>
      
      {/* Furniture - Living room */}
      <mesh position={[-1, 0.4, 1.5]} castShadow>
        <boxGeometry args={[1.5, 0.8, 0.8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Table */}
      <mesh position={[1, 0.3, 1]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.6, 8]} />
        <meshStandardMaterial color="#a67c52" />
      </mesh>
      
      {/* Stairs */}
      <mesh position={[1.5, 1, -1.5]} castShadow>
        <boxGeometry args={[0.8, 2, 1]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Interior ramp beside stairs */}
      <mesh position={[-1.5, 0.2, -1.5]} rotation={[0, 0, -Math.PI/8]} castShadow>
        <boxGeometry args={[1, 0.1, 2]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>
      
      {/* Wheelchair users inside */}
      <WheelchairUser 
        position={[0, 0.5, 0.5]} 
        color="#8b4513" 
        speed={0.1} 
        path={[
          [0, 0.5, 0.5], [-1, 0.5, 1], [1, 0.5, 1], [0, 0.5, 0.5]
        ]} 
      />
      
      {/* Person coming down ramp */}
      <WheelchairUser 
        position={[-1, 0.5, -1]} 
        color="#2c3e50" 
        speed={0.05} 
        path={[
          [-1, 0.5, -1], [-1, 0.3, 0], [-1, 0.5, 1]
        ]} 
      />
      
      {/* Energy efficiency features display */}
      <Html position={[0, 3, 0]} transform>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '15px',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          minWidth: '300px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#27ae60' }}>🏠 {selectedHouse} - Interior View</h3>
          <div style={{ textAlign: 'left', marginBottom: '10px' }}>
            <h4 style={{ color: '#8b4513', margin: '8px 0' }}>Energy Efficient Features:</h4>
            <div>🌬️ Moisture Managed Construction</div>
            <div>🧱 Improved Insulation</div>
            <div>⚖️ Pressure Balanced Air Circulation</div>
            <div>🔧 Sealed Ducts</div>
            <div>🏗️ Tight Construction</div>
            <div>💨 Fresh Air Ventilation</div>
            <div>🪟 Efficient Windows</div>
            <div>❄️ Properly Sized HVAC</div>
            <div>♿ Wheelchair Accessible Design</div>
          </div>
          
          <button 
            onClick={() => {
              setCurrentView('exterior')
              setSelectedHouse(null)
            }}
            style={{
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Exit Interior View
          </button>
        </div>
      </Html>
    </group>
  )
}

/* ----- Society of Energy Efficient Houses ----- */
function EnergyEfficientSociety() {
  const currentView = useStore((s) => s.currentView)
  const selectedHouse = useStore((s) => s.selectedHouse)

  // Positions for the society houses
  const housePositions = [
    [-15, 0, 15], [-5, 0, 15], [5, 0, 15], [15, 0, 15],
    [-15, 0, 5], [-5, 0, 5], [5, 0, 5], [15, 0, 5],
    [-15, 0, -5], [-5, 0, -5], [5, 0, -5], [15, 0, -5],
    [-15, 0, -15], [-5, 0, -15], [5, 0, -15], [15, 0, -15]
  ]

  return (
    <group>
      {/* Regular energy efficient houses */}
      {housePositions.map((pos, index) => (
        <EnergyEfficientHouse
          key={index}
          position={pos}
          isSpecial={index === 7} // One special house in the middle-right
          label="Featured Eco Home"
        />
      ))}
      
      {/* Show interior when selected */}
      {currentView === 'interior' && selectedHouse && (
        <HouseInterior position={[5, 0, 5]} />
      )}
      
      {/* Walking paths between houses */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#d2b48c" roughness={0.9} />
      </mesh>
      
      {/* Green spaces */}
      {[[-10, 0, 10], [10, 0, 10], [-10, 0, -10], [10, 0, -10]].map((pos, index) => (
        <mesh key={index} position={pos} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
          <circleGeometry args={[3, 8]} />
          <meshStandardMaterial color="#27ae60" />
        </mesh>
      ))}
      
      {/* Community solar panels */}
      <group position={[0, 0.5, 0]}>
        <mesh rotation={[Math.PI/4, 0, 0]} castShadow>
          <boxGeometry args={[8, 0.02, 4]} />
          <meshStandardMaterial color="#1e3a8a" metalness={0.9} roughness={0.05} />
        </mesh>
      </group>
      
      {/* Walking residents */}
      <WheelchairUser 
        position={[-10, 0.5, 8]} 
        color="#8b4513" 
        speed={0.2} 
        path={[
          [-10, 0.5, 8], [-5, 0.5, 8], [0, 0.5, 8], [5, 0.5, 8], [10, 0.5, 8]
        ]} 
      />
      
      <WheelchairUser 
        position={[8, 0.5, -10]} 
        color="#2c3e50" 
        speed={0.15} 
        path={[
          [8, 0.5, -10], [8, 0.5, -5], [8, 0.5, 0], [8, 0.5, 5], [8, 0.5, 10]
        ]} 
      />
    </group>
  )
}

/* ----- Keep existing components (Walking People, Cultural Center, RoadSystem, etc.) ----- */
// [All your existing components remain the same...]
function Person({ position = [0, 0, 0], color = "#8b4513", speed = 1, path = [] }) {
  // ... (keep existing Person component)
}

function CulturalCenter({ position = [0, 0, 0] }) {
  // ... (keep existing CulturalCenter component)
}

function RoadSystem() {
  // ... (keep existing RoadSystem component)
}

function BusStation({ position = [0, 0, 0] }) {
  // ... (keep existing BusStation component)
}

function StreetLight({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  // ... (keep existing StreetLight component)
}

function StreetLightSystem() {
  // ... (keep existing StreetLightSystem component)
}

function Car({ position = [0, 0, 0], color = "#ff4444", speed = 1, path = [] }) {
  // ... (keep existing Car component)
}

function Bus({ position = [0, 0, 0], path = [], stopAtStation = false }) {
  // ... (keep existing Bus component)
}

function TrafficSystem() {
  // ... (keep existing TrafficSystem component)
}

function Ground() {
  // ... (keep existing Ground component)
}

function WindTurbine({ position = [0, 0, 0] }) {
  // ... (keep existing WindTurbine component)
}

function SolarPanel({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  // ... (keep existing SolarPanel component)
}

function VerticalGarden({ position = [0, 0, 0] }) {
  // ... (keep existing VerticalGarden component)
}

function SmartBuilding({ 
  position = [0, 0, 0], 
  height = 8, 
  color = "#a67c52", 
  name = "Building",
  hasTurbine = false,
  hasSolar = true
}) {
  // ... (keep existing SmartBuilding component)
}

function WasteBin({ position = [0, 0, 0], id = "bin1" }) {
  // ... (keep existing WasteBin component)
}

function WasteTruck({ position = [0, 0, 0], isCollecting = false, onCollectionComplete }) {
  // ... (keep existing WasteTruck component)
}

function WasteManagementSystem({ position = [15, 0, 15] }) {
  // ... (keep existing WasteManagementSystem component)
}

function CityLayout() {
  const currentView = useStore((s) => s.currentView)
  
  if (currentView === 'interior') {
    return (
      <group>
        <EnergyEfficientSociety />
      </group>
    )
  }

  return (
    <group>
      {/* Energy Efficient Society */}
      <EnergyEfficientSociety />
      
      {/* Keep other city elements but position them away from the society */}
      <CulturalCenter position={[0, 0, 40]} />
      <BusStation position={[15, 0, 40]} />
      <VerticalGarden position={[-15, 0, 40]} />
      <WasteManagementSystem position={[30, 0, 30]} />
      
      {/* Additional buildings around */}
      <SmartBuilding position={[25, 0, -10]} height={10} color="#8b4513" name="Office A" hasTurbine={true} />
      <SmartBuilding position={[-25, 0, -10]} height={8} color="#a67c52" name="Residence A" hasTurbine={false} />
      
      {/* Waste bins */}
      <WasteBin position={[20, 0, 35]} id="bin1" />
      <WasteBin position={[-20, 0, 35]} id="bin2" />
      
      {/* Walking people */}
      <Person position={[0, 0, 35]} color="#8b4513" speed={0.3} path={[
        [0, 0.5, 35], [5, 0.5, 35], [10, 0.5, 35], [5, 0.5, 35], [0, 0.5, 35]
      ]} />
    </group>
  )
}

/* ----- Enhanced HUD ----- */
function HUD() {
  const alert = useStore((s) => s.alert)
  const timeOfDay = useStore((s) => s.timeOfDay)
  const alertWasteManagement = useStore((s) => s.alertWasteManagement)
  const emergencyAlarm = useStore((s) => s.emergencyAlarm)
  const currentView = useStore((s) => s.currentView)
  const selectedHouse = useStore((s) => s.selectedHouse)
  
  const alertStyles = {
    info: { background: 'linear-gradient(135deg, #d2691e, #8b4513)', color: 'white' },
    emergency: { background: 'linear-gradient(135deg, #e74c3c, #c0392b)', color: 'white' },
    success: { background: 'linear-gradient(135deg, #27ae60, #229954)', color: 'white' }
  }

  return (
    <div style={{ position: 'absolute', left: 12, top: 12, zIndex: 50 }}>
      {currentView === 'interior' ? (
        <div style={{ 
          background: 'linear-gradient(135deg, #27ae60, #229954)', 
          color: 'white',
          padding: '12px 16px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          minWidth: '280px',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          🏠 Viewing Interior: {selectedHouse}
        </div>
      ) : emergencyAlarm ? (
        <div style={{ 
          background: 'linear-gradient(135deg, #e74c3c, #c0392b)', 
          color: 'white',
          padding: '12px 16px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          minWidth: '280px',
          fontSize: '14px',
          fontWeight: 'bold',
          animation: 'pulse 0.5s infinite'
        }}>
          🚨 EMERGENCY ALARM ACTIVATED! 🚨
        </div>
      ) : alertWasteManagement ? (
        <div style={{ 
          background: 'linear-gradient(135deg, #e74c3c, #c0392b)', 
          color: 'white',
          padding: '12px 16px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          minWidth: '280px',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          🚨 ALERT: Waste bin full! Sending collection truck...
        </div>
      ) : alert ? (
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
          🏘️ Energy Efficient Society • Time: {timeOfDay}
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
  const setCurrentView = useStore((s) => s.setCurrentView)
  const setSelectedHouse = useStore((s) => s.setSelectedHouse)
  const timeOfDay = useStore((s) => s.timeOfDay)
  const currentView = useStore((s) => s.currentView)

  // Auto street lights at night
  useEffect(() => {
    if (timeOfDay === 'night') {
      setStreetLightsOn(true)
    }
  }, [timeOfDay, setStreetLightsOn])

  const locations = {
    '🏘️ Energy Society': { x: 0, y: 15, z: 0, lookAt: { x: 0, y: 0, z: 0 } },
    '🎪 Cultural Center': { x: 0, y: 15, z: 40, lookAt: { x: 0, y: 0, z: 40 } },
    '🚏 Bus Station': { x: 15, y: 10, z: 40, lookAt: { x: 15, y: 0, z: 40 } },
    '🗑️ Waste Management': { x: 30, y: 10, z: 30, lookAt: { x: 30, y: 0, z: 30 } },
    '🌱 Vertical Garden': { x: -15, y: 10, z: 40, lookAt: { x: -15, y: 0, z: 40 } }
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
      
      {currentView === 'interior' ? (
        <button 
          onClick={() => {
            setCurrentView('exterior')
            setSelectedHouse(null)
          }}
          style={{ 
            width: '100%', 
            background: '#e74c3c', 
            color: 'white', 
            border: 'none', 
            padding: '10px', 
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginBottom: '12px'
          }}
        >
          Exit Interior View
        </button>
      ) : (
        <>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: '12px', fontWeight: 'bold' }}>
              Time of Day:
            </label>
            <select 
              value={timeOfDay}
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
        </>
      )}
    </div>
  )
}

/* ----- Main App Component ----- */
export default function App() {
  const timeOfDay = useStore((s) => s.timeOfDay)
  const emergencyAlarm = useStore((s) => s.emergencyAlarm)
  const currentView = useStore((s) => s.currentView)
  
  const skyConfig = {
    day: { sunPosition: [100, 20, 100], inclination: 0, azimuth: 0.25 },
    evening: { sunPosition: [10, 5, 100], inclination: 0, azimuth: 0.25 },
    night: { sunPosition: [-100, -20, 100], inclination: 0, azimuth: 0.25 }
  }

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: currentView === 'interior' ? '#87CEEB' : 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      animation: emergencyAlarm ? 'emergencyFlash 0.5s infinite' : 'none'
    }}>
      <style>
        {`
          @keyframes emergencyFlash {
            0%, 100% { background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); }
            50% { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}
      </style>
      
      <HUD />
      <ControlPanel />
      
      <Canvas shadows camera={{ position: [25, 15, 25], fov: 50 }}>
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
              Loading Energy Efficient Society...
            </div>
          </Html>
        }>
          {currentView === 'exterior' && <Sky {...skyConfig[timeOfDay]} />}
          
          {currentView === 'exterior' && <Ground />}
          
          {/* City Layout */}
          <CityLayout />
          
          {currentView === 'exterior' && <TrafficSystem />}
          
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
          {currentView === 'interior' ? 
            '🏠 Interior View: Use mouse to look around • Click Exit to return' : 
            '🎮 Controls: Drag to rotate • Scroll to zoom • Click the labeled house to view interior'}
        </div>
        <div style={{ fontSize: 11, color: '#27ae60', marginTop: 4 }}>
          🌟 Featured: Energy Efficient Houses • Wheelchair Accessibility • Solar Panels
        </div>
        <div style={{ fontSize: 11, color: '#e74c3c', marginTop: 2 }}>
          🏠 Click the "Featured Eco Home" to see interior with wheelchair users!
        </div>
      </div>
    </div>
  )
}
