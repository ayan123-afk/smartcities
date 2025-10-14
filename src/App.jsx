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
  currentHouseView: null,
  setCurrentHouseView: (house) => set({ currentHouseView: house })
}))

/* ----- Enhanced Camera Controller ----- */
function CameraController() {
  const { camera } = useThree()
  const focus = useStore((s) => s.focus)
  const currentHouseView = useStore((s) => s.currentHouseView)
  
  useFrame(() => {
    if (currentHouseView) {
      // If viewing inside house, use fixed camera
      camera.position.lerp(currentHouseView.cameraPosition, 0.1)
      camera.lookAt(currentHouseView.lookAt)
      return
    }
    
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
  const currentHouseView = useStore((s) => s.currentHouseView)

  if (currentHouseView) {
    return null // Disable controls when inside house
  }

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

/* ----- Wheelchair User ----- */
function WheelchairUser({ position = [0, 0, 0], color = "#8b4513", speed = 1, path = [] }) {
  const wheelchairRef = useRef()
  const [t, setT] = useState(Math.random() * 10)

  useFrame((_, dt) => {
    setT(prev => prev + dt * speed)
    
    if (wheelchairRef.current && path.length > 0) {
      const tt = t % path.length
      const i = Math.floor(tt) % path.length
      const a = new THREE.Vector3(...path[i])
      const b = new THREE.Vector3(...path[(i + 1) % path.length])
      const f = tt % 1
      const pos = a.clone().lerp(b, f)
      
      wheelchairRef.current.position.lerp(pos, 0.1)
      if (b) wheelchairRef.current.lookAt(b)
    }
  })

  return (
    <group ref={wheelchairRef} position={position}>
      {/* Wheelchair base */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.6, 0.1, 0.8]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      {/* Back support */}
      <mesh position={[0, 0.6, -0.3]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.05]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      
      {/* Person body */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.6, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      
      {/* Wheels */}
      <mesh position={[-0.25, 0.1, 0.3]} castShadow rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0.25, 0.1, 0.3]} castShadow rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[-0.25, 0.1, -0.3]} castShadow rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0.25, 0.1, -0.3]} castShadow rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
  )
}

/* ----- Energy Efficient House with Interior ----- */
function EnergyEfficientHouse({ position = [0, 0, 0], isFeatured = false }) {
  const setFocus = useStore((s) => s.setFocus)
  const setCurrentHouseView = useStore((s) => s.setCurrentHouseView)

  const enterHouse = () => {
    setCurrentHouseView({
      cameraPosition: [position[0], position[1] + 3, position[2] + 8],
      lookAt: [position[0], position[1] + 2, position[2]]
    })
  }

  const exitHouse = () => {
    setCurrentHouseView(null)
  }

  return (
    <group position={position}>
      {/* Main House Structure */}
      <mesh castShadow receiveShadow onClick={() => setFocus({
        x: position[0],
        y: 8,
        z: position[2],
        lookAt: { x: position[0], y: 0, z: position[2] }
      })}>
        <boxGeometry args={[6, 5, 8]} />
        <meshStandardMaterial color={isFeatured ? "#27ae60" : "#a67c52"} roughness={0.7} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[7, 0.5, 9]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* Solar Panels on Roof */}
      <group position={[0, 4, 0]}>
        <SolarPanel position={[-2, 0, 0]} rotation={[0, 0, 0]} />
        <SolarPanel position={[0, 0, 0]} rotation={[0, 0, 0]} />
        <SolarPanel position={[2, 0, 0]} rotation={[0, 0, 0]} />
      </group>

      {/* Windows with efficient framing */}
      <group>
        {[-1.5, 1.5].map((x, i) => (
          <group key={i}>
            {/* Ground floor windows */}
            <mesh position={[x, 1.5, 4.1]} castShadow>
              <boxGeometry args={[1, 1.2, 0.1]} />
              <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
            </mesh>
            {/* First floor windows */}
            <mesh position={[x, 3.5, 4.1]} castShadow>
              <boxGeometry args={[1, 1.2, 0.1]} />
              <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Entrance with ramp */}
      <group position={[0, 0, -4]}>
        {/* Door */}
        <mesh position={[0, 1.5, 0.1]} castShadow>
          <boxGeometry args={[1.2, 2.5, 0.2]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        
        {/* Wheelchair Ramp */}
        <mesh position={[0, -0.2, -1.5]} rotation={[0.2, 0, 0]} receiveShadow>
          <boxGeometry args={[2, 0.1, 3]} />
          <meshStandardMaterial color="#7f8c8d" />
        </mesh>
        
        {/* Ramp railings */}
        <mesh position={[-1, 0.3, -1.5]} castShadow>
          <boxGeometry args={[0.05, 0.6, 3]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        <mesh position={[1, 0.3, -1.5]} castShadow>
          <boxGeometry args={[0.05, 0.6, 3]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
      </group>

      {/* Interior (visible when camera is inside) */}
      <HouseInterior position={[0, 0, 0]} isVisible={useStore(s => s.currentHouseView)} />

      {/* Energy Efficiency Features Label */}
      {isFeatured && (
        <>
          <Text
            position={[0, 6, 0]}
            fontSize={0.4}
            color="#27ae60"
            anchorX="center"
            anchorY="middle"
          >
            IDEAS 4 HOMES
          </Text>

          <Html position={[0, 5, 0]} transform>
            <div style={{
              background: 'rgba(39, 174, 96, 0.95)',
              color: 'white',
              padding: '12px',
              borderRadius: '8px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              minWidth: '250px',
              textAlign: 'center'
            }}>
              <h4 style={{ margin: '0 0 8px 0' }}>🏠 Energy Efficient Home</h4>
              <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
                <div>✅ Improved Insulation</div>
                <div>✅ Pressure Balanced Air Circulation</div>
                <div>✅ Sealed Ducts</div>
                <div>✅ Tight Construction</div>
                <div>✅ Fresh Air Ventilation</div>
                <div>✅ Efficient Windows</div>
                <div>✅ Properly Sized HVAC</div>
              </div>
              <button 
                onClick={enterHouse}
                style={{
                  background: '#2ecc71',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginTop: '8px',
                  width: '100%'
                }}
              >
                🏠 Enter House
              </button>
            </div>
          </Html>
        </>
      )}

      {/* Regular house info */}
      {!isFeatured && (
        <Text
          position={[0, 6, 0]}
          fontSize={0.3}
          color="#8b4513"
          anchorX="center"
          anchorY="middle"
        >
          Eco Home
        </Text>
      )}
    </group>
  )
}

/* ----- House Interior ----- */
function HouseInterior({ position = [0, 0, 0], isVisible = false }) {
  const currentHouseView = useStore((s) => s.currentHouseView)
  const setCurrentHouseView = useStore((s) => s.setCurrentHouseView)
  
  if (!currentHouseView || !isVisible) return null

  const exitHouse = () => {
    setCurrentHouseView(null)
  }

  return (
    <group position={position}>
      {/* Exit button */}
      <Html position={[0, 5, 0]} transform>
        <button 
          onClick={exitHouse}
          style={{
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
          }}
        >
          🚪 Exit House
        </button>
      </Html>

      {/* Interior Walls */}
      <mesh position={[0, 2.5, 0]} receiveShadow>
        <boxGeometry args={[5.8, 5, 7.8]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>

      {/* Ground Floor */}
      <group>
        {/* Living Room */}
        <mesh position={[-1.5, 0.1, 2]} receiveShadow>
          <boxGeometry args={[2, 0.1, 3]} />
          <meshStandardMaterial color="#d2b48c" />
        </mesh>
        
        {/* Kitchen */}
        <mesh position={[1.5, 0.1, 2]} receiveShadow>
          <boxGeometry args={[2, 0.1, 3]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>

        {/* Kitchen Counter */}
        <mesh position={[1.5, 0.5, 3.5]} castShadow>
          <boxGeometry args={[1.8, 1, 0.5]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
      </group>

      {/* First Floor */}
      <group position={[0, 3, 0]}>
        {/* Floor */}
        <mesh position={[0, -1.4, 0]} receiveShadow>
          <boxGeometry args={[5.6, 0.1, 7.6]} />
          <meshStandardMaterial color="#e8e8e8" />
        </mesh>

        {/* Bedrooms */}
        <mesh position={[-1.5, -1, 2]} receiveShadow>
          <boxGeometry args={[2, 0.1, 3]} />
          <meshStandardMaterial color="#87CEEB" />
        </mesh>

        <mesh position={[1.5, -1, 2]} receiveShadow>
          <boxGeometry args={[2, 0.1, 3]} />
          <meshStandardMaterial color="#98fb98" />
        </mesh>
      </group>

      {/* Stairs with Wheelchair Ramp beside */}
      <group position={[0, 1.5, -2]}>
        {/* Stairs */}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[0.8, i * 0.3, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.8, 0.3, 0.4]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
        ))}
        
        {/* Wheelchair Ramp */}
        <mesh position={[-0.8, 0.9, 0]} rotation={[0, 0, -0.3]} receiveShadow>
          <boxGeometry args={[0.8, 0.1, 3]} />
          <meshStandardMaterial color="#7f8c8d" />
        </mesh>
        
        {/* Ramp Railings */}
        <mesh position={[-1.2, 1.2, 0]} castShadow>
          <boxGeometry args={[0.05, 0.6, 3]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        <mesh position={[-0.4, 1.2, 0]} castShadow>
          <boxGeometry args={[0.05, 0.6, 3]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
      </group>

      {/* Wheelchair Users Inside */}
      <WheelchairUser 
        position={[-1, 0.5, 1]} 
        color="#8b4513" 
        speed={0.2} 
        path={[
          [-1, 0.5, 1], [-2, 0.5, 1], [-2, 0.5, 3], [-1, 0.5, 3], [-1, 0.5, 1]
        ]} 
      />
      
      {/* Person coming down ramp */}
      <WheelchairUser 
        position={[-1, 2.8, -1.5]} 
        color="#2c3e50" 
        speed={0.1} 
        path={[
          [-1, 2.8, -1.5], [-1, 2.5, -1], [-1, 2.2, -0.5], [-1, 1.9, 0], [-1, 1.6, 0.5], [-1, 0.5, 1]
        ]} 
      />

      {/* Person in kitchen */}
      <mesh position={[1.5, 1, 3]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1.6, 8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[1.5, 1.8, 3]} castShadow>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>

      {/* Furniture */}
      <group>
        {/* Living room sofa */}
        <mesh position={[-1.5, 0.5, 1]} castShadow>
          <boxGeometry args={[1.5, 0.5, 0.8]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        
        {/* Table */}
        <mesh position={[-1.5, 0.8, 2.5]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.1, 8]} />
          <meshStandardMaterial color="#d2691e" />
        </mesh>
        <mesh position={[-1.5, 0.4, 2.5]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
      </group>

      {/* Energy Efficiency Features Display */}
      <Html position={[0, 4, 0]} transform>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '15px',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          minWidth: '280px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#27ae60' }}>🏠 Home Features</h3>
          <div style={{ textAlign: 'left', fontSize: '12px' }}>
            <div>🌡️ Moisture Managed</div>
            <div>🧊 Improved Insulation</div>
            <div>💨 Pressure Balanced Ventilation</div>
            <div>🔒 Sealed Ducts</div>
            <div>🏗️ Tight Construction</div>
            <div>🌬️ Fresh Air System</div>
            <div>🪟 Efficient Windows</div>
            <div>❄️ Proper HVAC</div>
            <div>♿ Wheelchair Accessible</div>
            <div>🔄 Internal Ramp System</div>
          </div>
        </div>
      </Html>
    </group>
  )
}

/* ----- Housing Society ----- */
function HousingSociety() {
  const houses = [
    { position: [-20, 0, -10], isFeatured: false },
    { position: [-10, 0, -10], isFeatured: false },
    { position: [0, 0, -10], isFeatured: true }, // Featured house
    { position: [10, 0, -10], isFeatured: false },
    { position: [20, 0, -10], isFeatured: false },
    { position: [-15, 0, -20], isFeatured: false },
    { position: [-5, 0, -20], isFeatured: false },
    { position: [5, 0, -20], isFeatured: false },
    { position: [15, 0, -20], isFeatured: false },
  ]

  return (
    <group>
      {houses.map((house, index) => (
        <EnergyEfficientHouse
          key={index}
          position={house.position}
          isFeatured={house.isFeatured}
        />
      ))}
      
      {/* Society Park */}
      <mesh position={[0, 0.1, -15]} receiveShadow>
        <circleGeometry args={[8, 32]} />
        <meshStandardMaterial color="#2ecc71" />
      </mesh>
      
      {/* Park benches */}
      {[-5, 5].map((x, i) => (
        <group key={i} position={[x, 0.5, -15]}>
          <mesh castShadow>
            <boxGeometry args={[2, 0.1, 0.5]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
          <mesh position={[0.8, 0.3, 0]} castShadow>
            <boxGeometry args={[0.1, 0.6, 0.5]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
          <mesh position={[-0.8, 0.3, 0]} castShadow>
            <boxGeometry args={[0.1, 0.6, 0.5]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
        </group>
      ))}
      
      {/* People in society */}
      <WheelchairUser 
        position={[-3, 0.5, -12]} 
        color="#8b4513" 
        speed={0.2} 
        path={[
          [-3, 0.5, -12], [-1, 0.5, -14], [1, 0.5, -16], [3, 0.5, -14], [1, 0.5, -12], [-3, 0.5, -12]
        ]} 
      />
    </group>
  )
}

/* ----- Enhanced Waste Management System ----- */
function WasteManagementSystem({ position = [15, 0, 15] }) {
  const [isTruckCollecting, setIsTruckCollecting] = useState(false)
  const [wasteCollected, setWasteCollected] = useState(0)
  const [wasteDistribution, setWasteDistribution] = useState({ recycle: 0, reduce: 0, reuse: 0 })
  const alertWasteManagement = useStore((s) => s.alertWasteManagement)
  const wasteBins = useStore((s) => s.wasteBins)
  const wasteProcessing = useStore((s) => s.wasteProcessing)
  const setWasteProcessing = useStore((s) => s.setWasteProcessing)
  
  const startProcessing = () => {
    if (wasteCollected > 0 && !wasteProcessing.isProcessing) {
      setWasteProcessing({
        isProcessing: true,
        processTime: 0,
        recycledWaste: 0,
        reducedWaste: 0,
        reusedWaste: 0
      })
    }
  }

  useFrame((_, dt) => {
    // Check if any bin is full and send truck
    const anyBinFull = Object.values(wasteBins).some(level => level >= 1)
    if (anyBinFull && alertWasteManagement && !isTruckCollecting) {
      setIsTruckCollecting(true)
    }

    // Waste processing simulation
    if (wasteProcessing.isProcessing) {
      const newTime = wasteProcessing.processTime + dt
      
      // Simulate 4-hour processing (4 seconds in simulation)
      if (newTime >= 4) {
        const recycled = Math.floor(wasteCollected * 0.6)
        const reduced = Math.floor(wasteCollected * 0.2)
        const reused = Math.floor(wasteCollected * 0.15)
        
        setWasteProcessing({
          isProcessing: false,
          processTime: 4,
          recycledWaste: recycled,
          reducedWaste: reduced,
          reusedWaste: reused
        })
        
        // Distribute waste to bins
        setWasteDistribution({
          recycle: recycled,
          reduce: reduced,
          reuse: reused
        })
        
        setWasteCollected(0)
      } else {
        setWasteProcessing({
          ...wasteProcessing,
          processTime: newTime
        })
      }
    }
  })

  const handleCollectionComplete = () => {
    setIsTruckCollecting(false)
    setWasteCollected(prev => prev + 5) // Add collected waste
    // Reset all bins after collection
    Object.keys(wasteBins).forEach(id => {
      useStore.getState().updateWasteBin(id, 0)
    })
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

      {/* Recycling bins with actual waste distribution */}
      <group position={[3, 1, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.5, 0.5, 1, 16]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
        {/* Waste level in recycle bin */}
        <mesh position={[0, (wasteDistribution.recycle/10 - 0.5) * 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.45, 0.45, Math.min(1, wasteDistribution.recycle/10) * 0.8, 16]} />
          <meshStandardMaterial color="#2980b9" />
        </mesh>
        <Text position={[0, 1.2, 0]} fontSize={0.2} color="white" anchorX="center">
          ♻️ Recycle: {wasteDistribution.recycle}
        </Text>
      </group>

      <group position={[0, 1, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.5, 0.5, 1, 16]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        {/* Waste level in reduce bin */}
        <mesh position={[0, (wasteDistribution.reduce/10 - 0.5) * 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.45, 0.45, Math.min(1, wasteDistribution.reduce/10) * 0.8, 16]} />
          <meshStandardMaterial color="#c0392b" />
        </mesh>
        <Text position={[0, 1.2, 0]} fontSize={0.2} color="white" anchorX="center">
          📉 Reduce: {wasteDistribution.reduce}
        </Text>
      </group>

      <group position={[-3, 1, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.5, 0.5, 1, 16]} />
          <meshStandardMaterial color="#f39c12" />
        </mesh>
        {/* Waste level in reuse bin */}
        <mesh position={[0, (wasteDistribution.reuse/10 - 0.5) * 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.45, 0.45, Math.min(1, wasteDistribution.reuse/10) * 0.8, 16]} />
          <meshStandardMaterial color="#d35400" />
        </mesh>
        <Text position={[0, 1.2, 0]} fontSize={0.2} color="white" anchorX="center">
          🔄 Reuse: {wasteDistribution.reuse}
        </Text>
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

      {/* Waste Collection Truck */}
      <WasteTruck 
        position={[-10, 0, 5]} 
        isCollecting={isTruckCollecting}
        onCollectionComplete={handleCollectionComplete}
      />

      {/* Information display */}
      <Html position={[0, 5, 0]} transform>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '15px',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          minWidth: '300px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>🔄 Waste Management</h3>
          
          <div style={{ marginBottom: '10px' }}>
            <div>🗑️ Waste Collected: {wasteCollected} units</div>
            <div>⏱️ Process Time: {Math.min(4, wasteProcessing.processTime).toFixed(1)}/4 hrs</div>
            <div>🚛 Truck Status: {isTruckCollecting ? 'COLLECTING' : 'READY'}</div>
            
            {wasteProcessing.processTime >= 4 && (
              <div style={{ marginTop: '8px', padding: '8px', background: '#ecf0f1', borderRadius: '6px' }}>
                <div style={{ color: '#3498db' }}>♻️ Recycled: {wasteProcessing.recycledWaste} units</div>
                <div style={{ color: '#e74c3c' }}>📉 Reduced: {wasteProcessing.reducedWaste} units</div>
                <div style={{ color: '#f39c12' }}>🔄 Reused: {wasteProcessing.reusedWaste} units</div>
              </div>
            )}
            
            {alertWasteManagement && (
              <div style={{ color: '#e74c3c', fontWeight: 'bold', marginTop: '5px' }}>
                ⚠️ ALERT: Bin Full! Collection started
              </div>
            )}
          </div>

          <button 
            onClick={startProcessing}
            disabled={wasteProcessing.isProcessing || wasteCollected === 0}
            style={{
              background: wasteProcessing.isProcessing ? '#95a5a6' : wasteCollected === 0 ? '#95a5a6' : '#27ae60',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: wasteCollected > 0 && !wasteProcessing.isProcessing ? 'pointer' : 'not-allowed',
              marginTop: '5px',
              width: '100%'
            }}
          >
            {wasteProcessing.isProcessing ? '🔄 Processing...' : 'Start 4H Process'}
          </button>
        </div>
      </Html>

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
  return (
    <group>
      {/* Housing Society */}
      <HousingSociety />
      
      {/* Waste Management System */}
      <WasteManagementSystem position={[15, 0, 15]} />
      
      {/* Additional waste bins around society */}
      <WasteBin position={[-15, 0, -5]} id="society_bin1" />
      <WasteBin position={[0, 0, -5]} id="society_bin2" />
      <WasteBin position={[15, 0, -5]} id="society_bin3" />
      <WasteBin position={[-10, 0, -25]} id="society_bin4" />
      <WasteBin position={[10, 0, -25]} id="society_bin5" />
    </group>
  )
}

// ... (Keep all the existing components like WasteBin, WasteTruck, SolarPanel, WindTurbine, etc.)
// ... (Keep the existing HUD, ControlPanel, and App components)

export default function App() {
  const timeOfDay = useStore((s) => s.timeOfDay)
  const emergencyAlarm = useStore((s) => s.emergencyAlarm)
  const currentHouseView = useStore((s) => s.currentHouseView)
  
  const skyConfig = {
    day: { sunPosition: [100, 20, 100], inclination: 0, azimuth: 0.25 },
    evening: { sunPosition: [10, 5, 100], inclination: 0, azimuth: 0.25 },
    night: { sunPosition: [-100, -20, 100], inclination: 0, azimuth: 0.25 }
  }

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: currentHouseView ? '#87CEEB' : 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
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
      {!currentHouseView && <ControlPanel />}
      
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
          🏠 Click "Enter House" to view interior with wheelchair accessibility
        </div>
        <div style={{ fontSize: 11, color: '#27ae60', marginTop: 2 }}>
          🗑️ Click waste bins to fill them • Automatic collection when full!
        </div>
      </div>
    </div>
  )
}
