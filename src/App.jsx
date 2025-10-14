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
  setCurrentHouseView: (house) => set({ currentHouseView: house }),
  energyProduction: 0,
  setEnergyProduction: (energy) => set({ energyProduction: energy }),
  waterLevel: 100,
  setWaterLevel: (water) => set({ waterLevel: water })
}))

/* ----- Enhanced Camera Controller ----- */
function CameraController() {
  const { camera } = useThree()
  const focus = useStore((s) => s.focus)
  const currentHouseView = useStore((s) => s.currentHouseView)
  
  useFrame(() => {
    if (currentHouseView) {
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
    return null
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

/* ----- Enhanced Wheelchair User ----- */
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
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.6, 0.1, 0.8]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      <mesh position={[0, 0.6, -0.3]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.05]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.6, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      <mesh position={[0, 1.3, 0]} castShadow>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      
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

/* ----- Enhanced Energy Efficient House ----- */
function EnergyEfficientHouse({ position = [0, 0, 0], isFeatured = false, name = "Eco Home" }) {
  const setFocus = useStore((s) => s.setFocus)
  const setCurrentHouseView = useStore((s) => s.setCurrentHouseView)

  const enterHouse = () => {
    setCurrentHouseView({
      cameraPosition: [position[0], position[1] + 3, position[2] + 8],
      lookAt: [position[0], position[1] + 2, position[2]]
    })
  }

  return (
    <group position={position}>
      <mesh castShadow receiveShadow onClick={() => setFocus({
        x: position[0],
        y: 8,
        z: position[2],
        lookAt: { x: position[0], y: 0, z: position[2] }
      })}>
        <boxGeometry args={[6, 5, 8]} />
        <meshStandardMaterial color={isFeatured ? "#27ae60" : "#a67c52"} roughness={0.7} />
      </mesh>

      <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[7, 0.5, 9]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      <group position={[0, 4, 0]}>
        <SolarPanel position={[-2, 0, 0]} rotation={[0, 0, 0]} />
        <SolarPanel position={[0, 0, 0]} rotation={[0, 0, 0]} />
        <SolarPanel position={[2, 0, 0]} rotation={[0, 0, 0]} />
      </group>

      <group>
        {[-1.5, 1.5].map((x, i) => (
          <group key={i}>
            <mesh position={[x, 1.5, 4.1]} castShadow>
              <boxGeometry args={[1, 1.2, 0.1]} />
              <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
            </mesh>
            <mesh position={[x, 3.5, 4.1]} castShadow>
              <boxGeometry args={[1, 1.2, 0.1]} />
              <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
            </mesh>
          </group>
        ))}
      </group>

      <group position={[0, 0, -4]}>
        <mesh position={[0, 1.5, 0.1]} castShadow>
          <boxGeometry args={[1.2, 2.5, 0.2]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        
        <mesh position={[0, -0.2, -1.5]} rotation={[0.2, 0, 0]} receiveShadow>
          <boxGeometry args={[2, 0.1, 3]} />
          <meshStandardMaterial color="#7f8c8d" />
        </mesh>
        
        <mesh position={[-1, 0.3, -1.5]} castShadow>
          <boxGeometry args={[0.05, 0.6, 3]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        <mesh position={[1, 0.3, -1.5]} castShadow>
          <boxGeometry args={[0.05, 0.6, 3]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
      </group>

      <HouseInterior position={[0, 0, 0]} isVisible={useStore(s => s.currentHouseView)} />

      {isFeatured && (
        <>
          <Text position={[0, 6, 0]} fontSize={0.4} color="#27ae60" anchorX="center">
            {name}
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
              <h4 style={{ margin: '0 0 8px 0' }}>🏠 Smart Home</h4>
              <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
                <div>✅ Solar Powered</div>
                <div>✅ Wheelchair Accessible</div>
                <div>✅ Energy Efficient</div>
                <div>✅ Smart Waste Management</div>
              </div>
              <button onClick={enterHouse} style={{
                background: '#2ecc71', color: 'white', border: 'none',
                padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
                marginTop: '8px', width: '100%'
              }}>
                🏠 Enter House
              </button>
            </div>
          </Html>
        </>
      )}

      {!isFeatured && (
        <Text position={[0, 6, 0]} fontSize={0.3} color="#8b4513" anchorX="center">
          {name}
        </Text>
      )}
    </group>
  )
}

/* ----- Enhanced House Interior ----- */
function HouseInterior({ position = [0, 0, 0], isVisible = false }) {
  const currentHouseView = useStore((s) => s.currentHouseView)
  const setCurrentHouseView = useStore((s) => s.setCurrentHouseView)
  
  if (!currentHouseView || !isVisible) return null

  const exitHouse = () => {
    setCurrentHouseView(null)
  }

  return (
    <group position={position}>
      <Html position={[0, 5, 0]} transform>
        <button onClick={exitHouse} style={{
          background: '#e74c3c', color: 'white', border: 'none',
          padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
          fontSize: '14px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
        }}>
          🚪 Exit House
        </button>
      </Html>

      <mesh position={[0, 2.5, 0]} receiveShadow>
        <boxGeometry args={[5.8, 5, 7.8]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>

      <group>
        <mesh position={[-1.5, 0.1, 2]} receiveShadow>
          <boxGeometry args={[2, 0.1, 3]} />
          <meshStandardMaterial color="#d2b48c" />
        </mesh>
        
        <mesh position={[1.5, 0.1, 2]} receiveShadow>
          <boxGeometry args={[2, 0.1, 3]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>

        <mesh position={[1.5, 0.5, 3.5]} castShadow>
          <boxGeometry args={[1.8, 1, 0.5]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
      </group>

      <group position={[0, 3, 0]}>
        <mesh position={[0, -1.4, 0]} receiveShadow>
          <boxGeometry args={[5.6, 0.1, 7.6]} />
          <meshStandardMaterial color="#e8e8e8" />
        </mesh>

        <mesh position={[-1.5, -1, 2]} receiveShadow>
          <boxGeometry args={[2, 0.1, 3]} />
          <meshStandardMaterial color="#87CEEB" />
        </mesh>

        <mesh position={[1.5, -1, 2]} receiveShadow>
          <boxGeometry args={[2, 0.1, 3]} />
          <meshStandardMaterial color="#98fb98" />
        </mesh>
      </group>

      <group position={[0, 1.5, -2]}>
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[0.8, i * 0.3, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.8, 0.3, 0.4]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
        ))}
        
        <mesh position={[-0.8, 0.9, 0]} rotation={[0, 0, -0.3]} receiveShadow>
          <boxGeometry args={[0.8, 0.1, 3]} />
          <meshStandardMaterial color="#7f8c8d" />
        </mesh>
        
        <mesh position={[-1.2, 1.2, 0]} castShadow>
          <boxGeometry args={[0.05, 0.6, 3]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        <mesh position={[-0.4, 1.2, 0]} castShadow>
          <boxGeometry args={[0.05, 0.6, 3]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
      </group>

      <WheelchairUser position={[-1, 0.5, 1]} color="#8b4513" speed={0.2} path={[
        [-1, 0.5, 1], [-2, 0.5, 1], [-2, 0.5, 3], [-1, 0.5, 3], [-1, 0.5, 1]
      ]} />
      
      <WheelchairUser position={[-1, 2.8, -1.5]} color="#2c3e50" speed={0.1} path={[
        [-1, 2.8, -1.5], [-1, 2.5, -1], [-1, 2.2, -0.5], [-1, 1.9, 0], [-1, 1.6, 0.5], [-1, 0.5, 1]
      ]} />

      <mesh position={[1.5, 1, 3]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1.6, 8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[1.5, 1.8, 3]} castShadow>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>

      <group>
        <mesh position={[-1.5, 0.5, 1]} castShadow>
          <boxGeometry args={[1.5, 0.5, 0.8]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        
        <mesh position={[-1.5, 0.8, 2.5]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.1, 8]} />
          <meshStandardMaterial color="#d2691e" />
        </mesh>
        <mesh position={[-1.5, 0.4, 2.5]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
      </group>

      <Html position={[0, 4, 0]} transform>
        <div style={{
          background: 'rgba(255,255,255,0.95)', padding: '15px', borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)', minWidth: '280px', textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#27ae60' }}>🏠 Smart Home Features</h3>
          <div style={{ textAlign: 'left', fontSize: '12px' }}>
            <div>🌞 Solar Power Generation</div>
            <div>💧 Water Recycling System</div>
            <div>🌡️ Smart Temperature Control</div>
            <div>💡 Energy Efficient Lighting</div>
            <div>🗑️ Smart Waste Sorting</div>
            <div>♿ Wheelchair Accessible</div>
          </div>
        </div>
      </Html>
    </group>
  )
}

/* ----- Enhanced Housing Society ----- */
function HousingSociety() {
  const houses = [
    { position: [-20, 0, -10], isFeatured: false, name: "Eco Home 1" },
    { position: [-10, 0, -10], isFeatured: false, name: "Eco Home 2" },
    { position: [0, 0, -10], isFeatured: true, name: "Smart Home" },
    { position: [10, 0, -10], isFeatured: false, name: "Eco Home 3" },
    { position: [20, 0, -10], isFeatured: false, name: "Eco Home 4" },
    { position: [-15, 0, -20], isFeatured: false, name: "Green Home 1" },
    { position: [-5, 0, -20], isFeatured: false, name: "Green Home 2" },
    { position: [5, 0, -20], isFeatured: false, name: "Green Home 3" },
    { position: [15, 0, -20], isFeatured: false, name: "Green Home 4" },
  ]

  return (
    <group>
      {houses.map((house, index) => (
        <EnergyEfficientHouse key={index} {...house} />
      ))}
      
      <mesh position={[0, 0.1, -15]} receiveShadow>
        <circleGeometry args={[8, 32]} />
        <meshStandardMaterial color="#2ecc71" />
      </mesh>
      
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
      
      <WheelchairUser position={[-3, 0.5, -12]} color="#8b4513" speed={0.2} path={[
        [-3, 0.5, -12], [-1, 0.5, -14], [1, 0.5, -16], [3, 0.5, -14], [1, 0.5, -12], [-3, 0.5, -12]
      ]} />

      {/* Society Waste Bins */}
      <WasteBin position={[-18, 0, -8]} id="society_bin1" />
      <WasteBin position={[-8, 0, -8]} id="society_bin2" />
      <WasteBin position={[2, 0, -8]} id="society_bin3" />
      <WasteBin position={[12, 0, -8]} id="society_bin4" />
      <WasteBin position={[22, 0, -8]} id="society_bin5" />
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
  const setEnergyProduction = useStore((s) => s.setEnergyProduction)
  
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
    const anyBinFull = Object.values(wasteBins).some(level => level >= 1)
    if (anyBinFull && alertWasteManagement && !isTruckCollecting) {
      setIsTruckCollecting(true)
    }

    if (wasteProcessing.isProcessing) {
      const newTime = wasteProcessing.processTime + dt
      
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
        
        setWasteDistribution({
          recycle: recycled,
          reduce: reduced,
          reuse: reused
        })
        
        // Generate energy from waste processing
        setEnergyProduction(prev => prev + Math.floor(wasteCollected * 0.1))
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
    setWasteCollected(prev => prev + 8)
    Object.keys(wasteBins).forEach(id => {
      useStore.getState().updateWasteBin(id, 0)
    })
  }

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[10, 8, 10]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.7} />
      </mesh>

      <group position={[0, 4.5, 3]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.8, 0.8, 3, 16]} />
          <meshStandardMaterial color="#34495e" />
        </mesh>
      </group>

      {/* Enhanced Recycling Bins with Real-time Levels */}
      <group position={[4, 1.5, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.6, 0.6, 1.5, 16]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
        <mesh position={[0, (wasteDistribution.recycle/15 - 0.75) * 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.55, Math.min(1.5, wasteDistribution.recycle/15) * 1.2, 16]} />
          <meshStandardMaterial color="#2980b9" />
        </mesh>
        <Text position={[0, 1.8, 0]} fontSize={0.25} color="white" anchorX="center">
          ♻️ {wasteDistribution.recycle} units
        </Text>
      </group>

      <group position={[0, 1.5, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.6, 0.6, 1.5, 16]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        <mesh position={[0, (wasteDistribution.reduce/15 - 0.75) * 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.55, Math.min(1.5, wasteDistribution.reduce/15) * 1.2, 16]} />
          <meshStandardMaterial color="#c0392b" />
        </mesh>
        <Text position={[0, 1.8, 0]} fontSize={0.25} color="white" anchorX="center">
          📉 {wasteDistribution.reduce} units
        </Text>
      </group>

      <group position={[-4, 1.5, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.6, 0.6, 1.5, 16]} />
          <meshStandardMaterial color="#f39c12" />
        </mesh>
        <mesh position={[0, (wasteDistribution.reuse/15 - 0.75) * 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.55, Math.min(1.5, wasteDistribution.reuse/15) * 1.2, 16]} />
          <meshStandardMaterial color="#d35400" />
        </mesh>
        <Text position={[0, 1.8, 0]} fontSize={0.25} color="white" anchorX="center">
          🔄 {wasteDistribution.reuse} units
        </Text>
      </group>

      {/* Enhanced Solar Array */}
      <group position={[0, 5, 0]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <SolarPanel key={i} position={[-4 + i * 1.2, 0.8, 4]} rotation={[0, Math.PI/2, 0]} />
        ))}
      </group>

      <WindTurbine position={[6, 0, 6]} />
      <WindTurbine position={[-6, 0, 6]} />

      <WasteTruck position={[-12, 0, 8]} isCollecting={isTruckCollecting} onCollectionComplete={handleCollectionComplete} />

      <Html position={[0, 6, 0]} transform>
        <div style={{
          background: 'rgba(255,255,255,0.95)', padding: '15px', borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)', minWidth: '320px', textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>🔄 Advanced Waste Management</h3>
          
          <div style={{ marginBottom: '10px' }}>
            <div>🗑️ Total Collected: {wasteCollected} units</div>
            <div>⏱️ Process: {Math.min(4, wasteProcessing.processTime).toFixed(1)}/4 hrs</div>
            <div>🚛 Status: {isTruckCollecting ? '🔄 COLLECTING' : '✅ READY'}</div>
            <div>⚡ Energy Generated: {Math.floor(wasteCollected * 0.1)} kWh</div>
            
            {wasteProcessing.processTime >= 4 && (
              <div style={{ marginTop: '8px', padding: '8px', background: '#ecf0f1', borderRadius: '6px' }}>
                <div style={{ color: '#3498db' }}>♻️ Recycled: {wasteProcessing.recycledWaste} units</div>
                <div style={{ color: '#e74c3c' }}>📉 Reduced: {wasteProcessing.reducedWaste} units</div>
                <div style={{ color: '#f39c12' }}>🔄 Reused: {wasteProcessing.reusedWaste} units</div>
              </div>
            )}
            
            {alertWasteManagement && (
              <div style={{ color: '#e74c3c', fontWeight: 'bold', marginTop: '5px' }}>
                ⚠️ ALERT: Bins Full! Collection Active
              </div>
            )}
          </div>

          <button onClick={startProcessing} disabled={wasteProcessing.isProcessing || wasteCollected === 0}
            style={{
              background: wasteProcessing.isProcessing ? '#95a5a6' : wasteCollected === 0 ? '#95a5a6' : '#27ae60',
              color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px',
              cursor: wasteCollected > 0 && !wasteProcessing.isProcessing ? 'pointer' : 'not-allowed',
              marginTop: '5px', width: '100%', fontSize: '14px'
            }}>
            {wasteProcessing.isProcessing ? '🔄 Processing Waste...' : 'Start 4H Waste Processing'}
          </button>
        </div>
      </Html>

      <Text position={[0, 9, 0]} fontSize={0.5} color="#2c3e50" anchorX="center">
        Waste Management Center
      </Text>
    </group>
  )
}

/* ----- Water Treatment Plant ----- */
function WaterTreatmentPlant({ position = [-15, 0, 15] }) {
  const [waterLevel, setWaterLevel] = useState(100)
  const [isProcessing, setIsProcessing] = useState(false)

  useFrame((_, dt) => {
    if (isProcessing && waterLevel > 0) {
      setWaterLevel(prev => Math.max(0, prev - dt * 10))
    } else if (!isProcessing && waterLevel < 100) {
      setWaterLevel(prev => Math.min(100, prev + dt * 5))
    }
  })

  const startProcessing = () => {
    setIsProcessing(true)
    setTimeout(() => setIsProcessing(false), 5000)
  }

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[8, 6, 8]} />
        <meshStandardMaterial color="#3498db" roughness={0.7} />
      </mesh>

      <mesh position={[0, 4, 0]} castShadow>
        <cylinderGeometry args={[1.5, 1.5, 2, 16]} />
        <meshStandardMaterial color="#2980b9" transparent opacity={0.8} />
      </mesh>

      <mesh position={[0, 3 + (waterLevel/100) * 1.5, 0]} castShadow>
        <cylinderGeometry args={[1.4, 1.4, (waterLevel/100) * 1.8, 16]} />
        <meshStandardMaterial color="#1e90ff" transparent opacity={0.6} />
      </mesh>

      <Html position={[0, 5, 0]} transform>
        <div style={{
          background: 'rgba(255,255,255,0.95)', padding: '15px', borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)', minWidth: '250px', textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#3498db' }}>💧 Water Treatment</h3>
          <div>Water Level: {Math.round(waterLevel)}%</div>
          <div>Status: {isProcessing ? '🔄 Processing' : '✅ Ready'}</div>
          <button onClick={startProcessing} disabled={isProcessing}
            style={{
              background: isProcessing ? '#95a5a6' : '#3498db', color: 'white',
              border: 'none', padding: '8px 16px', borderRadius: '6px',
              cursor: isProcessing ? 'not-allowed' : 'pointer', marginTop: '8px', width: '100%'
            }}>
            {isProcessing ? 'Processing...' : 'Start Treatment'}
          </button>
        </div>
      </Html>

      <Text position={[0, 7, 0]} fontSize={0.4} color="#3498db" anchorX="center">
        Water Treatment
      </Text>
    </group>
  )
}

/* ----- Enhanced Waste Bin ----- */
function WasteBin({ position = [0, 0, 0], id = "bin1" }) {
  const [fillLevel, setFillLevel] = useState(0)
  const updateWasteBin = useStore((s) => s.updateWasteBin)
  const setAlertWasteManagement = useStore((s) => s.setAlertWasteManagement)

  const handleClick = () => {
    if (fillLevel < 1) {
      const newLevel = Math.min(1, fillLevel + 0.2)
      setFillLevel(newLevel)
      updateWasteBin(id, newLevel)
      
      if (newLevel >= 0.8) {
        setAlertWasteManagement(true)
      }
    }
  }

  return (
    <group position={position}>
      <mesh castShadow onClick={handleClick}>
        <cylinderGeometry args={[0.4, 0.5, 1, 16]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>
      
      <mesh position={[0, (fillLevel - 0.5) * 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.45, fillLevel * 0.8, 16]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.52, 0.52, 0.05, 16]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>

      <Html position={[0, 1.2, 0]}>
        <div style={{
          background: fillLevel >= 0.8 ? '#e74c3c' : fillLevel >= 0.5 ? '#f39c12' : '#27ae60',
          color: 'white', padding: '4px 8px', borderRadius: '6px',
          fontSize: '10px', fontWeight: 'bold'
        }}>
          🗑️ {Math.round(fillLevel * 100)}% {fillLevel >= 0.8 ? 'NEEDS EMPTYING!' : ''}
        </div>
      </Html>
    </group>
  )
}

/* ----- Enhanced Waste Truck ----- */
function WasteTruck({ position = [0, 0, 0], isCollecting = false, onCollectionComplete }) {
  const truckRef = useRef()
  const [positionState, setPositionState] = useState(position)
  const [collectionProgress, setCollectionProgress] = useState(0)

  useFrame((_, dt) => {
    if (truckRef.current && isCollecting) {
      const progress = collectionProgress + dt * 0.3
      setCollectionProgress(progress)
      
      if (progress < 1) {
        truckRef.current.position.x = position[0] + progress * 25
        setPositionState([truckRef.current.position.x, position[1], position[2]])
      } else if (progress >= 1 && onCollectionComplete) {
        onCollectionComplete()
        setCollectionProgress(0)
      }
    }
  })

  return (
    <group ref={truckRef} position={positionState}>
      <mesh castShadow>
        <boxGeometry args={[2.5, 1.2, 1.5]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>
      
      <mesh position={[0.8, 0.9, 0]} castShadow>
        <boxGeometry args={[1.2, 0.8, 1.2]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      <mesh position={[-0.6, 1.1, 0]} castShadow>
        <boxGeometry args={[1.8, 1, 1.2]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      
      {[-0.8, 0.8].map((x, i) => (
        <group key={i} position={[x, -0.4, 0]}>
          <mesh castShadow rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        </group>
      ))}

      <Text position={[0, 2, 0]} fontSize={0.2} color="white" anchorX="center">
        WASTE TRUCK
      </Text>

      {isCollecting && (
        <Html position={[0, 2.8, 0]}>
          <div style={{
            background: '#e74c3c', color: 'white', padding: '4px 8px',
            borderRadius: '6px', fontSize: '10px', fontWeight: 'bold'
          }}>
            🚛 COLLECTING: {Math.round(collectionProgress * 100)}%
          </div>
        </Html>
      )}
    </group>
  )
}

/* ----- Solar Panel Component ----- */
function SolarPanel({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[1.5, 0.02, 1]} />
        <meshStandardMaterial color="#1e3a8a" metalness={0.9} roughness={0.05} />
      </mesh>
      <mesh position={[0, -0.1, 0]} castShadow>
        <boxGeometry args={[1.6, 0.08, 1.1]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
    </group>
  )
}

/* ----- Wind Turbine Component ----- */
function WindTurbine({ position = [0, 0, 0] }) {
  const turbineRef = useRef()
  
  useFrame(() => {
    if (turbineRef.current) {
      turbineRef.current.rotation.y += 0.02
    }
  })

  return (
    <group position={position}>
      <mesh position={[0, 8, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 12, 8]} />
        <meshStandardMaterial color="#708090" />
      </mesh>
      
      <group ref={turbineRef} position={[0, 13, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.6, 8, 8]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI * 2) / 3]} position={[4, 0, 0]} castShadow>
            <boxGeometry args={[8, 0.2, 0.6]} />
            <meshStandardMaterial color="#ecf0f1" />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/* ----- Enhanced Ground ----- */
function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#d2b48c" roughness={0.9} metalness={0.1} />
      </mesh>
      <gridHelper args={[200, 200, '#8b7355', '#8b7355']} position={[0, 0.01, 0]} />
      <ContactShadows position={[0, -0.03, 0]} opacity={0.3} width={50} blur={2} far={20} />
    </>
  )
}

/* ----- Enhanced City Layout ----- */
function CityLayout() {
  return (
    <group>
      <HousingSociety />
      <WasteManagementSystem position={[15, 0, 15]} />
      <WaterTreatmentPlant position={[-15, 0, 15]} />
      
      {/* Additional city waste bins */}
      <WasteBin position={[-25, 0, 5]} id="city_bin1" />
      <WasteBin position={[0, 0, 0]} id="city_bin2" />
      <WasteBin position={[25, 0, -5]} id="city_bin3" />
      <WasteBin position={[-20, 0, -25]} id="city_bin4" />
      <WasteBin position={[20, 0, -25]} id="city_bin5" />
    </group>
  )
}

/* ----- Enhanced HUD ----- */
function HUD() {
  const alert = useStore((s) => s.alert)
  const timeOfDay = useStore((s) => s.timeOfDay)
  const alertWasteManagement = useStore((s) => s.alertWasteManagement)
  const emergencyAlarm = useStore((s) => s.emergencyAlarm)
  const energyProduction = useStore((s) => s.energyProduction)
  const waterLevel = useStore((s) => s.waterLevel)
  
  return (
    <div style={{ position: 'absolute', left: 12, top: 12, zIndex: 50 }}>
      {emergencyAlarm ? (
        <div style={{ 
          background: 'linear-gradient(135deg, #e74c3c, #c0392b)', 
          color: 'white', padding: '12px 16px', borderRadius: '12px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)', minWidth: '280px',
          fontSize: '14px', fontWeight: 'bold', animation: 'pulse 0.5s infinite'
        }}>
          🚨 EMERGENCY ALARM ACTIVATED! 🚨
        </div>
      ) : alertWasteManagement ? (
        <div style={{ 
          background: 'linear-gradient(135deg, #e74c3c, #c0392b)', 
          color: 'white', padding: '12px 16px', borderRadius: '12px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)', minWidth: '280px',
          fontSize: '14px', fontWeight: 'bold'
        }}>
          🚨 ALERT: Waste bins need emptying! Collection started...
        </div>
      ) : alert ? (
        <div style={{ 
          background: 'linear-gradient(135deg, #d2691e, #8b4513)', 
          color: 'white', padding: '12px 16px', borderRadius: '12px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)', minWidth: '280px',
          fontSize: '14px', fontWeight: 'bold'
        }}>
          {alert.message}
        </div>
      ) : (
        <div style={{ 
          background: 'rgba(255,255,255,0.95)', padding: '12px 16px', 
          borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          fontSize: '13px', fontWeight: 'bold', color: '#8b4513'
        }}>
          🏙️ Smart Sustainable City • Time: {timeOfDay} • ⚡{energyProduction}kWh • 💧{waterLevel}%
        </div>
      )}
    </div>
  )
}

/* ----- Enhanced Control Panel ----- */
function ControlPanel() {
  const setTimeOfDay = useStore((s) => s.setTimeOfDay)
  const setTrafficDensity = useStore((s) => s.setTrafficDensity)
  const setStreetLightsOn = useStore((s) => s.setStreetLightsOn)
  const setFocus = useStore((s) => s.setFocus)
  const timeOfDay = useStore((s) => s.timeOfDay)
  const setEmergencyAlarm = useStore((s) => s.setEmergencyAlarm)

  useEffect(() => {
    if (timeOfDay === 'night') {
      setStreetLightsOn(true)
    }
  }, [timeOfDay, setStreetLightsOn])

  const locations = {
    '🏠 Housing Society': { x: 0, y: 15, z: -15, lookAt: { x: 0, y: 0, z: -15 } },
    '🗑️ Waste Management': { x: 15, y: 12, z: 15, lookAt: { x: 15, y: 0, z: 15 } },
    '💧 Water Treatment': { x: -15, y: 12, z: 15, lookAt: { x: -15, y: 0, z: 15 } },
    '🌳 Central Park': { x: 0, y: 8, z: -15, lookAt: { x: 0, y: 0, z: -15 } }
  }

  return (
    <div style={{ 
      position: 'absolute', right: 12, top: 12, zIndex: 50, 
      background: 'rgba(255,255,255,0.95)', padding: 16, borderRadius: 12, 
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)', minWidth: '220px'
    }}>
      <h3 style={{ margin: '0 0 12px 0', color: '#8b4513' }}>City Controls</h3>
      
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4, fontSize: '12px', fontWeight: 'bold' }}>
          Time of Day:
        </label>
        <select value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)}
          style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #d2b48c' }}>
          <option value="day">☀️ Day</option>
          <option value="evening">🌆 Evening</option>
          <option value="night">🌙 Night</option>
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4, fontSize: '12px', fontWeight: 'bold' }}>
          Quick Navigation:
        </label>
        {Object.entries(locations).map(([name, pos]) => (
          <button key={name} onClick={() => setFocus(pos)}
            style={{ 
              width: '100%', background: '#d2691e', color: 'white', border: 'none', 
              padding: '6px 8px', borderRadius: '6px', cursor: 'pointer',
              marginBottom: '4px', fontSize: '11px'
            }}>
            {name}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4, fontSize: '12px', fontWeight: 'bold' }}>
          Emergency:
        </label>
        <button onClick={() => setEmergencyAlarm(true)}
          style={{ 
            width: '100%', background: '#e74c3c', color: 'white', border: 'none', 
            padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
          }}>
          🚨 Trigger Alarm
        </button>
      </div>
    </div>
  )
}

/* ----- Main App Component ----- */
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
      width: '100vw', height: '100vh', 
      background: currentHouseView ? '#87CEEB' : 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      animation: emergencyAlarm ? 'emergencyFlash 0.5s infinite' : 'none'
    }}>
      <style>
        {`
          @keyframes emergencyFlash {
            0%, 100% { background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); }
            50% { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); }
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
              Loading Smart Sustainable City...
            </div>
          </Html>
        }>
          <Sky {...skyConfig[timeOfDay]} />
          <Ground />
          <CityLayout />
          <ContactShadows position={[0, -0.1, 0]} opacity={0.4} width={40} blur={2} far={10} />
        </Suspense>
        
        <CustomOrbitControls />
        <CameraController />
      </Canvas>

      <div style={{ 
        position: 'absolute', left: 12, bottom: 12, zIndex: 50, 
        background: 'rgba(255,255,255,0.95)', padding: 12, borderRadius: 12, 
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)' 
      }}>
        <div style={{ fontSize: 13, fontWeight: 'bold', color: '#8b4513' }}>
          🎮 Controls: Drag to rotate • Scroll to zoom • Click buildings to focus
        </div>
        <div style={{ fontSize: 11, color: '#a67c52', marginTop: 4 }}>
          🏠 Click "Enter House" to view interior with wheelchair accessibility
        </div>
        <div style={{ fontSize: 11, color: '#27ae60', marginTop: 2 }}>
          🗑️ Click waste bins to fill them • Automatic collection when 80% full!
        </div>
        <div style={{ fontSize: 11, color: '#3498db', marginTop: 2 }}>
          💧 Water treatment plant with real-time monitoring
        </div>
      </div>
    </div>
  )
}
