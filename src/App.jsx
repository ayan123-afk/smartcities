import React, { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, useGLTF, ContactShadows, Sky, Text, Sparkles, Float, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { create } from 'zustand'

// Enhanced Zustand store with better state management
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
  showCityControl: false,
  setShowCityControl: (show) => set({ showCityControl: show }),
  truckStatus: 'idle',
  setTruckStatus: (status) => set({ truckStatus: status }),
  currentBinTarget: null,
  setCurrentBinTarget: (target) => set({ currentBinTarget: target }),
  collectedWaste: 0,
  setCollectedWaste: (waste) => set({ collectedWaste: waste }),
  weather: 'clear',
  setWeather: (weather) => set({ weather: weather }),
  cityEvents: [],
  addCityEvent: (event) => set((state) => ({ cityEvents: [...state.cityEvents, event] })),
  removeCityEvent: (id) => set((state) => ({ 
    cityEvents: state.cityEvents.filter(e => e.id !== id) 
  })),
  // New states for enhanced features
  parkingLots: {},
  updateParkingLot: (id, vehicles) => set((state) => ({
    parkingLots: { ...state.parkingLots, [id]: vehicles }
  })),
  networkStatus: 'active',
  setNetworkStatus: (status) => set({ networkStatus: status }),
  waterQuality: 95,
  setWaterQuality: (quality) => set({ waterQuality: quality })
}))

/* ----- MODERN RESIDENTIAL BUILDINGS ----- */
function ModernResidentialBuilding({ position = [0, 0, 0], floors = 8, color = "#4a6572", name = "Residence" }) {
  const setFocus = useStore((s) => s.setFocus)

  return (
    <group position={position}>
      {/* Main Building Structure */}
      <mesh castShadow receiveShadow onClick={() => setFocus({
        x: position[0], y: floors + 5, z: position[2],
        lookAt: { x: position[0], y: 0, z: position[2] }
      })}>
        <boxGeometry args={[6, floors * 3, 6]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Modern Glass Facade */}
      <mesh position={[0, 0, 3.01]} castShadow>
        <boxGeometry args={[5.8, floors * 3 - 0.5, 0.1]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} metalness={0.8} />
      </mesh>

      {/* Balconies */}
      {Array.from({ length: floors }).map((_, floor) => (
        <group key={floor} position={[0, (floor * 3) - (floors * 1.5) + 1.5, 3.2]}>
          <mesh castShadow>
            <boxGeometry args={[5.5, 0.1, 1.2]} />
            <meshStandardMaterial color="#34495e" metalness={0.5} />
          </mesh>
          <mesh position={[0, -0.6, 0.5]} castShadow>
            <boxGeometry args={[5.5, 1, 0.05]} />
            <meshStandardMaterial color="#87CEEB" transparent opacity={0.8} />
          </mesh>
        </group>
      ))}

      {/* Rooftop Garden */}
      <group position={[0, floors * 1.5, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[6.2, 0.5, 6.2]} />
          <meshStandardMaterial color="#27ae60" />
        </mesh>
        <SolarPanel position={[2, 0.3, 2]} rotation={[0, Math.PI/4, 0]} />
        <SolarPanel position={[-2, 0.3, 2]} rotation={[0, -Math.PI/4, 0]} />
        
        {/* Rooftop Trees */}
        {[-1.5, 0, 1.5].map((x) => 
          [-1.5, 0, 1.5].map((z) => (
            <group key={`${x}-${z}`} position={[x, 0.5, z]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.2, 0.2, 2, 8]} />
                <meshStandardMaterial color="#8b4513" />
              </mesh>
              <mesh position={[0, 1.5, 0]} castShadow>
                <sphereGeometry args={[0.8, 8, 8]} />
                <meshStandardMaterial color="#27ae60" />
              </mesh>
            </group>
          ))
        )}
      </group>

      <Text
        position={[0, floors * 1.5 + 2, 0]}
        fontSize={0.4}
        color="#2c3e50"
        anchorX="center"
        anchorY="middle"
      >
        🏠 {name}
      </Text>

      <Sparkles count={10} scale={[7, floors * 3, 7]} size={1} speed={0.1} color="#3498db" />
    </group>
  )
}

/* ----- MODERN SCHOOL BUILDING ----- */
function ModernSchool({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)

  return (
    <group position={position}>
      {/* Main School Building */}
      <mesh castShadow receiveShadow onClick={() => setFocus({
        x: position[0], y: 12, z: position[2],
        lookAt: { x: position[0], y: 0, z: position[2] }
      })}>
        <boxGeometry args={[15, 8, 12]} />
        <meshStandardMaterial color="#3498db" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* School Windows */}
      {Array.from({ length: 3 }).map((_, floor) => 
        Array.from({ length: 5 }).map((_, window) => (
          <group key={`${floor}-${window}`}>
            <mesh position={[ -6 + window * 3, (floor * 2.5) - 2.5, 6.01]} castShadow>
              <boxGeometry args={[1.5, 1.2, 0.1]} />
              <meshStandardMaterial color="#f1c40f" metalness={0.5} />
            </mesh>
          </group>
        ))
      )}

      {/* School Entrance */}
      <mesh position={[0, -2, 6.01]} castShadow>
        <boxGeometry args={[3, 4, 0.2]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>

      {/* Playground */}
      <group position={[8, 0, 0]}>
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
          <circleGeometry args={[5, 32]} />
          <meshStandardMaterial color="#27ae60" />
        </mesh>
        
        {/* Playground Equipment */}
        <group position={[2, 0, 2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.3, 0.3, 3, 8]} />
            <meshStandardMaterial color="#e74c3c" />
          </mesh>
          <mesh position={[0, 2, 0]} castShadow>
            <boxGeometry args={[2, 0.1, 0.1]} />
            <meshStandardMaterial color="#f39c12" />
          </mesh>
        </group>

        <group position={[-2, 0, -2]}>
          <mesh castShadow>
            <sphereGeometry args={[1.2, 8, 8]} />
            <meshStandardMaterial color="#9b59b6" />
          </mesh>
        </group>
      </group>

      {/* School Sign */}
      <Text
        position={[0, 5, 6.1]}
        fontSize={0.5}
        color="#2c3e50"
        anchorX="center"
        anchorY="middle"
      >
        🏫 Smart School
      </Text>

      <Html position={[0, 10, 0]} transform>
        <div style={{
          background: 'rgba(52, 152, 219, 0.95)',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          minWidth: '300px',
          textAlign: 'center',
          color: 'white',
          border: '2px solid #2980b9',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: 'white' }}>🏫 Modern Smart School</h3>
          <div>📚 Digital Classrooms: 25</div>
          <div>👨‍🏫 Teachers: 45</div>
          <div>👨‍🎓 Students: 600</div>
          <div>💻 Tech Labs: 3</div>
          <div>🌱 Green Campus</div>
          <div>☀️ Solar Powered</div>
        </div>
      </Html>

      {/* Students */}
      <Person position={[3, 0, 8]} color="#3498db" speed={0.2} path={[
        [3, 0.5, 8], [1, 0.5, 6], [-1, 0.5, 8], [1, 0.5, 10], [3, 0.5, 8]
      ]} />

      <Sparkles count={30} scale={[18, 10, 15]} size={2} speed={0.1} color="#3498db" />
    </group>
  )
}

/* ----- MODERN HOSPITAL ----- */
function ModernHospital({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)

  return (
    <group position={position}>
      {/* Main Hospital Building */}
      <mesh castShadow receiveShadow onClick={() => setFocus({
        x: position[0], y: 15, z: position[2],
        lookAt: { x: position[0], y: 0, z: position[2] }
      })}>
        <boxGeometry args={[18, 12, 15]} />
        <meshStandardMaterial color="#ffffff" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Hospital Wings */}
      <mesh position={[8, 3, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 8, 10]} />
        <meshStandardMaterial color="#ecf0f1" metalness={0.3} />
      </mesh>

      <mesh position={[-8, 3, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 8, 10]} />
        <meshStandardMaterial color="#ecf0f1" metalness={0.3} />
      </mesh>

      {/* Hospital Windows */}
      {Array.from({ length: 4 }).map((_, floor) => 
        Array.from({ length: 6 }).map((_, window) => (
          <group key={`${floor}-${window}`}>
            <mesh position={[ -7.5 + window * 3, (floor * 2.5) - 3, 7.51]} castShadow>
              <boxGeometry args={[1.8, 1.5, 0.1]} />
              <meshStandardMaterial color="#87CEEB" transparent opacity={0.8} />
            </mesh>
          </group>
        ))
      )}

      {/* Red Cross Sign */}
      <group position={[0, 7, 7.6]}>
        <mesh castShadow>
          <boxGeometry args={[3, 0.5, 0.2]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        <mesh castShadow>
          <boxGeometry args={[0.5, 3, 0.2]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
      </group>

      {/* Helipad */}
      <group position={[0, 6.5, 0]}>
        <mesh rotation={[-Math.PI/2, 0, 0]} receiveShadow>
          <circleGeometry args={[3, 32]} />
          <meshStandardMaterial color="#34495e" />
        </mesh>
        <Text position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]} fontSize={0.3} color="white" anchorX="center">
          H
        </Text>
      </group>

      {/* Emergency Entrance */}
      <mesh position={[0, -3, 7.51]} castShadow>
        <boxGeometry args={[4, 5, 0.2]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>

      <Text
        position={[0, 7, 0]}
        fontSize={0.6}
        color="#e74c3c"
        anchorX="center"
        anchorY="middle"
      >
        🏥 City Hospital
      </Text>

      <Html position={[0, 16, 0]} transform>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          minWidth: '320px',
          textAlign: 'center',
          color: '#2c3e50',
          border: '2px solid #e74c3c',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#e74c3c' }}>🏥 Modern City Hospital</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ textAlign: 'left' }}>
              <div>🩺 Doctors: 120</div>
              <div>💊 Beds: 300</div>
              <div>🚑 Emergency: 24/7</div>
              <div>🧬 Surgery Rooms: 8</div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div>🔬 Labs: 5</div>
              <div>📱 Telemedicine</div>
              <div>🤖 AI Diagnostics</div>
              <div>✅ Green Building</div>
            </div>
          </div>
        </div>
      </Html>

      {/* Ambulance */}
      <Ambulance position={[5, 0, 10]} />

      <Sparkles count={25} scale={[20, 14, 18]} size={2} speed={0.1} color="#e74c3c" />
    </group>
  )
}

/* ----- WATER FILTRATION PLANT ----- */
function WaterFiltrationPlant({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)
  const waterQuality = useStore((s) => s.waterQuality)

  return (
    <group position={position}>
      {/* Main Plant Building */}
      <mesh castShadow receiveShadow onClick={() => setFocus({
        x: position[0], y: 10, z: position[2],
        lookAt: { x: position[0], y: 0, z: position[2] }
      })}>
        <boxGeometry args={[12, 6, 10]} />
        <meshStandardMaterial color="#3498db" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Water Tanks */}
      <group position={[-4, 4, -2]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.5, 1.5, 4, 16]} />
          <meshStandardMaterial color="#2980b9" metalness={0.5} />
        </mesh>
        <mesh position={[0, 2.5, 0]} castShadow>
          <cylinderGeometry args={[1.6, 1.6, 0.3, 16]} />
          <meshStandardMaterial color="#34495e" />
        </mesh>
      </group>

      <group position={[4, 4, -2]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.5, 1.5, 4, 16]} />
          <meshStandardMaterial color="#2980b9" metalness={0.5} />
        </mesh>
        <mesh position={[0, 2.5, 0]} castShadow>
          <cylinderGeometry args={[1.6, 1.6, 0.3, 16]} />
          <meshStandardMaterial color="#34495e" />
        </mesh>
      </group>

      {/* Filtration System */}
      <group position={[0, 2, 3]}>
        {Array.from({ length: 3 }).map((_, i) => (
          <mesh key={i} position={[-2 + i * 2, 0, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.8, 0.8, 2, 16]} />
            <meshStandardMaterial color="#27ae60" metalness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Water Pipes */}
      <group>
        <mesh position={[0, 1, -1]} rotation={[0, 0, Math.PI/2]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 10, 8]} />
          <meshStandardMaterial color="#95a5a6" metalness={0.5} />
        </mesh>
        <mesh position={[-5, 3, -2]} rotation={[0, Math.PI/2, Math.PI/2]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 6, 8]} />
          <meshStandardMaterial color="#3498db" metalness={0.4} />
        </mesh>
      </group>

      {/* Clean Water Reservoir */}
      <mesh position={[0, 0.5, -6]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[3, 3, 0.2, 32]} />
        <meshStandardMaterial color="#3498db" transparent opacity={0.8} />
      </mesh>

      <Text
        position={[0, 4, 0]}
        fontSize={0.5}
        color="#2980b9"
        anchorX="center"
        anchorY="middle"
      >
        💧 Water Plant
      </Text>

      <Html position={[0, 8, 0]} transform>
        <div style={{
          background: 'rgba(52, 152, 219, 0.95)',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          minWidth: '300px',
          textAlign: 'center',
          color: 'white',
          border: '2px solid #2980b9',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: 'white' }}>💧 Advanced Water Filtration</h3>
          <div>🌊 Water Quality: {waterQuality}%</div>
          <div>💦 Daily Capacity: 2M Liters</div>
          <div>🔬 Filtration Stages: 5</div>
          <div>✅ UV Treatment</div>
          <div>🔄 Recycling: 85%</div>
          <div>🌱 Eco-Friendly</div>
        </div>
      </Html>

      <Sparkles count={20} scale={[14, 8, 12]} size={2} speed={0.1} color="#3498db" />
    </group>
  )
}

/* ----- ENHANCED PARKING SYSTEM ----- */
function ParkingLot({ position = [0, 0, 0], id = "parking1", capacity = 20 }) {
  const [parkedVehicles, setParkedVehicles] = useState([])
  const updateParkingLot = useStore((s) => s.updateParkingLot)

  useEffect(() => {
    // Initialize random parked vehicles
    const vehicles = Array.from({ length: Math.floor(capacity * 0.7) }, (_, i) => ({
      id: i,
      position: [
        -4.5 + Math.floor(i % 5) * 2.2,
        0.3,
        -3 + Math.floor(i / 5) * 2.5
      ],
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    }))
    setParkedVehicles(vehicles)
    updateParkingLot(id, vehicles.length)
  }, [capacity, id, updateParkingLot])

  return (
    <group position={position}>
      {/* Parking Lot Ground */}
      <mesh rotation={[-Math.PI/2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>

      {/* Parking Lines */}
      {Array.from({ length: 5 }).map((_, row) => 
        Array.from({ length: 4 }).map((_, col) => (
          <mesh key={`${row}-${col}`} 
            position={[-4 + col * 2.5, 0.01, -3 + row * 2]} 
            rotation={[-Math.PI/2, 0, 0]}
          >
            <planeGeometry args={[2, 1.5]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        ))
      )}

      {/* Parked Vehicles */}
      {parkedVehicles.map(vehicle => (
        <group key={vehicle.id} position={vehicle.position}>
          <mesh castShadow>
            <boxGeometry args={[1.5, 0.4, 0.8]} />
            <meshStandardMaterial color={vehicle.color} metalness={0.3} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Parking Sign */}
      <Text
        position={[0, 2, -4.5]}
        fontSize={0.3}
        color="#e74c3c"
        anchorX="center"
        anchorY="middle"
      >
        🅿️ Parking
      </Text>

      <Html position={[0, 3, 0]}>
        <div style={{
          background: 'rgba(52, 73, 94, 0.9)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '11px',
          fontWeight: 'bold',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}>
          🅿️ {parkedVehicles.length}/{capacity} spots
        </div>
      </Html>
    </group>
  )
}

/* ----- ENHANCED MODERN CAR ----- */
function ModernCar({ position = [0, 0, 0], color = "#ff4444", speed = 1, path = [], isParking = false }) {
  const carRef = useRef()
  const [t, setT] = useState(Math.random() * 10)

  useFrame((_, dt) => {
    if (!isParking) {
      setT(prev => prev + dt * speed)
      
      if (carRef.current && path.length > 0) {
        const tt = t % path.length
        const i = Math.floor(tt) % path.length
        const a = new THREE.Vector3(...path[i])
        const b = new THREE.Vector3(...path[(i + 1) % path.length])
        const f = tt % 1
        const pos = a.clone().lerp(b, f)
        
        carRef.current.position.lerp(pos, 0.1)
        
        const direction = new THREE.Vector3().subVectors(b, a).normalize()
        carRef.current.lookAt(carRef.current.position.clone().add(direction))
      }
    }
  })

  return (
    <group ref={carRef} position={position}>
      {/* Car Body */}
      <mesh castShadow>
        <boxGeometry args={[1.8, 0.5, 0.8]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.3} />
      </mesh>
      
      {/* Windshield */}
      <mesh position={[0, 0.4, 0.1]} castShadow>
        <boxGeometry args={[1.6, 0.3, 0.6]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
      </mesh>
      
      {/* Windows */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.7, 0.35, 0.7]} />
        <meshStandardMaterial color="#1e3a8a" metalness={0.9} roughness={0.05} />
      </mesh>

      {/* Headlights */}
      <mesh position={[0.7, 0.2, 0.4]} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffff99" emissiveIntensity={1} />
      </mesh>
      <mesh position={[0.7, 0.2, -0.4]} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffff99" emissiveIntensity={1} />
      </mesh>

      {/* Wheels */}
      {[[0.5, 0.3], [-0.5, 0.3], [0.5, -0.3], [-0.5, -0.3]].map(([x, z], i) => (
        <group key={i} position={[x, -0.2, z]}>
          <mesh castShadow rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.15, 16]} />
            <meshStandardMaterial color="#333333" metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Brake Lights */}
      <mesh position={[-0.8, 0.2, 0.3]} castShadow>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-0.8, 0.2, -0.3]} castShadow>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

/* ----- ENHANCED MODERN BUS ----- */
function ModernBus({ position = [0, 0, 0], path = [], stopAtStation = false }) {
  const busRef = useRef()
  const [t, setT] = useState(Math.random() * 10)
  const [isStopped, setIsStopped] = useState(false)
  const [stopTimer, setStopTimer] = useState(0)

  useFrame((_, dt) => {
    if (isStopped) {
      setStopTimer(prev => {
        if (prev >= 3) {
          setIsStopped(false)
          return 0
        }
        return prev + dt
      })
      return
    }

    setT(prev => prev + dt * 0.3)
    
    if (busRef.current && path.length > 0) {
      const tt = t % path.length
      const i = Math.floor(tt) % path.length
      const a = new THREE.Vector3(...path[i])
      const b = new THREE.Vector3(...path[(i + 1) % path.length])
      const f = tt % 1
      const pos = a.clone().lerp(b, f)
      
      if (stopAtStation && !isStopped && pos.distanceTo(new THREE.Vector3(15, 0.4, 25)) < 2) {
        setIsStopped(true)
      }
      
      if (!isStopped) {
        busRef.current.position.lerp(pos, 0.1)
        
        const direction = new THREE.Vector3().subVectors(b, a).normalize()
        busRef.current.lookAt(busRef.current.position.clone().add(direction))
      }
    }
  })

  return (
    <group ref={busRef} position={position}>
      {/* Bus Body */}
      <mesh castShadow>
        <boxGeometry args={[3.5, 1.5, 1.5]} />
        <meshStandardMaterial color="#FFD700" metalness={0.4} roughness={0.3} />
      </mesh>

      {/* Windows */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[3.4, 0.6, 1.4]} />
        <meshStandardMaterial color="#2c3e50" transparent opacity={0.7} />
      </mesh>

      {/* Headlights */}
      <mesh position={[1.6, 0.5, 0.5]} castShadow>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffff99" emissiveIntensity={1} />
      </mesh>
      <mesh position={[1.6, 0.5, -0.5]} castShadow>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffff99" emissiveIntensity={1} />
      </mesh>

      {/* Wheels */}
      {[[1, 0.6], [-1, 0.6], [1, -0.6], [-1, -0.6]].map(([x, z], i) => (
        <group key={i} position={[x, -0.4, z]}>
          <mesh castShadow rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
            <meshStandardMaterial color="#333333" metalness={0.8} />
          </mesh>
        </group>
      ))}

      <Text
        position={[0, 1.2, 0.76]}
        fontSize={0.2}
        color="#2c3e50"
        anchorX="center"
        anchorY="middle"
      >
        {isStopped ? "🛑 CITY BUS" : "CITY BUS"}
      </Text>

      {isStopped && (
        <Html position={[0, 2.5, 0]}>
          <div style={{
            background: '#e74c3c',
            color: 'white',
            padding: '6px 10px',
            borderRadius: '8px',
            fontSize: '10px',
            fontWeight: 'bold',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}>
            🚌 STOPPED
          </div>
        </Html>
      )}
    </group>
  )
}

/* ----- AMBULANCE VEHICLE ----- */
function Ambulance({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Ambulance Body */}
      <mesh castShadow>
        <boxGeometry args={[2.2, 0.6, 1]} />
        <meshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Red Cross */}
      <mesh position={[0, 0.5, 0.51]} castShadow>
        <boxGeometry args={[1, 0.1, 0.1]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      <mesh position={[0, 0.5, 0.51]} castShadow>
        <boxGeometry args={[0.1, 1, 0.1]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>

      {/* Emergency Lights */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[0.3, 0.2, 0.3]} />
        <meshStandardMaterial color="#e74c3c" emissive="#e74c3c" emissiveIntensity={1} />
      </mesh>

      {/* Wheels */}
      {[[0.6, 0.4], [-0.6, 0.4], [0.6, -0.4], [-0.6, -0.4]].map(([x, z], i) => (
        <group key={i} position={[x, -0.2, z]}>
          <mesh castShadow rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.15, 16]} />
            <meshStandardMaterial color="#333333" metalness={0.8} />
          </mesh>
        </group>
      ))}

      <Text
        position={[0, 0.4, 0.51]}
        fontSize={0.15}
        color="#e74c3c"
        anchorX="center"
        anchorY="middle"
      >
        AMBULANCE
      </Text>
    </group>
  )
}

/* ----- ENHANCED CLOUD DATA CENTER WITH NETWORK ----- */
function EnhancedDataCenter({ position = [0, 0, 0] }) {
  const [serverActivity, setServerActivity] = useState([0.6, 0.8, 0.4, 0.7, 0.9, 0.5])
  const [networkActivity, setNetworkActivity] = useState(0.8)
  const [dataFlows, setDataFlows] = useState([])
  const networkStatus = useStore((s) => s.networkStatus)

  // Generate random data flows
  useEffect(() => {
    const flows = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      start: [Math.random() * 10 - 5, Math.random() * 4 + 1, Math.random() * 6 - 3],
      end: [Math.random() * 10 - 5, Math.random() * 4 + 1, Math.random() * 6 - 3],
      progress: Math.random(),
      speed: 0.1 + Math.random() * 0.3
    }))
    setDataFlows(flows)
  }, [])

  useFrame((_, dt) => {
    setServerActivity(prev =>
      prev.map(activity => Math.max(0.3, Math.min(1, activity + (Math.random() - 0.5) * 0.1)))
    )
    
    setNetworkActivity(prev => Math.max(0.2, Math.min(0.95, prev + (Math.random() - 0.5) * 0.02)))
    
    setDataFlows(prev => 
      prev.map(flow => ({
        ...flow,
        progress: (flow.progress + dt * flow.speed) % 1
      }))
    )
  })

  return (
    <group position={position}>
      {/* Main Data Center Building */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[20, 8, 12]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Glass Front */}
      <mesh position={[0, 0, 6.01]} castShadow>
        <boxGeometry args={[18, 7, 0.1]} />
        <meshStandardMaterial color="#001122" transparent opacity={0.9} />
      </mesh>

      {/* Server Rooms */}
      {[0, 1].map(level => (
        <group key={level} position={[0, -2 + level * 3, 0]}>
          <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[16, 0.1, 5]} />
            <meshStandardMaterial color="#2c3e50" metalness={0.7} roughness={0.3} />
          </mesh>
          
          {/* Server Racks */}
          {[-6, -3, 0, 3, 6].map((x, i) => (
            <ServerRack 
              key={i} 
              position={[x, 1.8, -1]} 
              activityLevel={serverActivity[i]} 
            />
          ))}
        </group>
      ))}

      {/* Network Operations Center */}
      <group position={[0, 2, -3]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[8, 2, 4]} />
          <meshStandardMaterial color="#34495e" metalness={0.6} />
        </mesh>
        
        {/* Monitoring Screens */}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[-3 + i * 1.2, 1.2, 2.01]} castShadow>
            <boxGeometry args={[1, 0.6, 0.1]} />
            <meshStandardMaterial 
              color={networkStatus === 'active' ? "#00ff00" : "#ff4444"}
              emissive={networkStatus === 'active' ? "#00ff00" : "#ff4444"}
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}

        {/* Network Operators */}
        {Array.from({ length: 3 }).map((_, i) => (
          <group key={i} position={[-2 + i * 2, 0.5, 1.5]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.8, 8]} />
              <meshStandardMaterial color="#8b4513" />
            </mesh>
            <mesh position={[0, 0.9, 0]} castShadow>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial color="#ffdbac" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Data Flow Visualization */}
      {dataFlows.map(flow => {
        const currentPos = new THREE.Vector3()
          .lerpVectors(
            new THREE.Vector3(...flow.start),
            new THREE.Vector3(...flow.end),
            flow.progress
          )
        
        return (
          <mesh key={flow.id} position={currentPos} castShadow>
            <sphereGeometry args={[0.05, 4, 4]} />
            <meshStandardMaterial 
              color="#00ffff" 
              emissive="#00ffff"
              emissiveIntensity={1}
            />
          </mesh>
        )
      })}

      {/* Network Cables */}
      <group>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[-8 + i * 2, 1, 5.9]} rotation={[0, Math.PI/2, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
            <meshStandardMaterial color="#3498db" />
          </mesh>
        ))}
      </group>

      <Text
        position={[0, 5, 0]}
        fontSize={0.6}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
      >
        🤖 Cloud Data Center
      </Text>

      <Html position={[0, 10, 0]} transform>
        <div style={{
          background: 'rgba(0,0,0,0.95)',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '0 8px 25px rgba(0,255,255,0.3)',
          minWidth: '350px',
          textAlign: 'center',
          color: '#00ffff',
          border: '2px solid #00ffff',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#00ffff' }}>🌐 Cloud Data Center & Network</h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '15px',
            marginBottom: '15px'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div>🖥️ Server Load: {Math.round(serverActivity.reduce((a, b) => a + b, 0) / serverActivity.length * 100)}%</div>
              <div>🌐 Network: {Math.round(networkActivity * 100)}%</div>
              <div>📊 Data Flow: {dataFlows.length} streams</div>
              <div>🔒 Security: {networkStatus === 'active' ? '🟢 SECURE' : '🔴 ALERT'}</div>
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <div>💾 Storage: 2.5PB/3PB</div>
              <div>⚡ Power: 85%</div>
              <div>❄️ Cooling: 72%</div>
              <div>👥 Operators: 6 online</div>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(0,255,255,0.1)', 
            padding: '12px', 
            borderRadius: '8px',
            fontSize: '12px',
            border: '1px solid #00ffff'
          }}>
            <div><strong>Network Operations:</strong></div>
            <div>✅ Real-time Monitoring</div>
            <div>✅ AI Threat Detection</div>
            <div>✅ Data Analytics</div>
            <div>✅ 24/7 Security</div>
          </div>
        </div>
      </Html>

      <Sparkles count={100} scale={[21, 9, 13]} size={2} speed={0.3} color="#00ffff" />
    </group>
  )
}

/* ----- ENHANCED CITY LAYOUT WITH ALL NEW FEATURES ----- */
function EnhancedCityLayout() {
  return (
    <group>
      {/* Existing Features */}
      <CulturalCenter position={[-15, 0, 35]} />
      <VerticalGardenBuilding position={[-35, 0, -15]} />
      <BusStation position={[15, 0, 25]} />
      <EnhancedDataCenter position={[45, 0, -35]} />
      <EnergyEfficientSociety position={[0, 0, -45]} />
      <WasteManagementSystem position={[25, 0, 25]} />
      
      {/* NEW: Modern Residential Areas */}
      <ModernResidentialBuilding position={[-30, 0, 10]} floors={12} name="Sky Tower" />
      <ModernResidentialBuilding position={[-25, 0, 15]} floors={8} color="#e74c3c" name="Red Residence" />
      <ModernResidentialBuilding position={[-20, 0, 5]} floors={10} color="#27ae60" name="Green Apartments" />
      
      {/* NEW: School */}
      <ModernSchool position={[-40, 0, 25]} />
      
      {/* NEW: Hospital */}
      <ModernHospital position={[30, 0, 35]} />
      
      {/* NEW: Water Filtration Plant */}
      <WaterFiltrationPlant position={[40, 0, 15]} />
      
      {/* NEW: Parking Lots */}
      <ParkingLot position={[10, 0, 30]} id="parking1" capacity={20} />
      <ParkingLot position={[-5, 0, 30]} id="parking2" capacity={15} />
      <ParkingLot position={[35, 0, 30]} id="parking3" capacity={25} />
      <ParkingLot position={[-35, 0, 20]} id="parking4" capacity={18} />
      
      {/* Enhanced Traffic with Modern Vehicles */}
      <EnhancedTrafficSystem />
      
      {/* Waste bins */}
      <WasteBin position={[-10, 0, 8]} id="bin1" />
      <WasteBin position={[12, 0, -5]} id="bin2" />
      <WasteBin position={[-5, 0, -12]} id="bin3" />
      <WasteBin position={[18, 0, 10]} id="bin4" />
      
      {/* City population */}
      <Person position={[5, 0, 22]} color="#8b4513" speed={0.3} path={[
        [5, 0.5, 22], [3, 0.5, 24], [1, 0.5, 22], [3, 0.5, 20], [5, 0.5, 22]
      ]} />
      
      <Person position={[-3, 0, 27]} color="#2c3e50" speed={0.4} path={[
        [-3, 0.5, 27], [-5, 0.5, 25], [-7, 0.5, 27], [-5, 0.5, 29], [-3, 0.5, 27]
      ]} />

      <Sparkles count={150} scale={[100, 20, 100]} size={3} speed={0.1} color="#ffffff" />
    </group>
  )
}

/* ----- ENHANCED TRAFFIC SYSTEM WITH MODERN VEHICLES ----- */
function EnhancedTrafficSystem() {
  const trafficDensity = useStore((s) => s.trafficDensity)
  
  const carPaths = [
    [[-35, 0.3, 0], [-25, 0.3, 0], [-15, 0.3, 0], [-5, 0.3, 0], [5, 0.3, 0], [15, 0.3, 0], [25, 0.3, 0], [35, 0.3, 0]],
    [[-35, 0.3, -20], [-25, 0.3, -20], [-15, 0.3, -20], [-5, 0.3, -20], [5, 0.3, -20], [15, 0.3, -20], [25, 0.3, -20], [35, 0.3, -20]],
    [[0, 0.3, -35], [0, 0.3, -25], [0, 0.3, -15], [0, 0.3, -5], [0, 0.3, 5], [0, 0.3, 15], [0, 0.3, 25], [0, 0.3, 35]]
  ]

  const busPaths = [
    [[-35, 0.4, 0], [-15, 0.4, 0], [0, 0.4, 0], [15, 0.4, 0], [35, 0.4, 0]],
    [[0, 0.4, -35], [0, 0.4, -15], [0, 0.4, 0], [0, 0.4, 15], [0, 0.4, 35]]
  ]

  const carColors = ["#ff4444", "#44ff44", "#4444ff", "#ffff44", "#ff44ff", "#44ffff", "#ff8c00", "#8a2be2"]
  const carCount = trafficDensity === 'low' ? 12 : trafficDensity === 'medium' ? 20 : 30
  const busCount = trafficDensity === 'low' ? 2 : trafficDensity === 'medium' ? 3 : 5

  return (
    <group>
      {/* Modern Cars */}
      {Array.from({ length: carCount }).map((_, i) => (
        <ModernCar
          key={`car-${i}`}
          color={carColors[i % carColors.length]}
          speed={0.3 + Math.random() * 0.3}
          path={carPaths[i % carPaths.length]}
        />
      ))}
      
      {/* Modern Buses */}
      {Array.from({ length: busCount }).map((_, i) => (
        <ModernBus
          key={`bus-${i}`}
          path={busPaths[i % busPaths.length]}
          stopAtStation={i === 0}
        />
      ))}
    </group>
  )
}

// Update the main App component to use EnhancedCityLayout
export default function App() {
  const timeOfDay = useStore((s) => s.timeOfDay)
  const emergencyAlarm = useStore((s) => s.emergencyAlarm)
  
  const skyConfig = {
    day: { sunPosition: [100, 20, 100], inclination: 0, azimuth: 0.25 },
    evening: { sunPosition: [10, 5, 100], inclination: 0, azimuth: 0.25 },
    night: { sunPosition: [-100, -20, 100], inclination: 0, azimuth: 0.25 }
  }

  const fogConfig = {
    day: { color: '#87CEEB', near: 10, far: 80 },
    evening: { color: '#ff7f50', near: 5, far: 60 },
    night: { color: '#191970', near: 1, far: 40 }
  }

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      animation: emergencyAlarm ? 'emergencyFlash 0.5s infinite' : 'none',
      fontFamily: 'Arial, sans-serif'
    }}>
      <style>
        {`
          @keyframes emergencyFlash {
            0%, 100% { background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); }
            50% { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }
          * {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
        `}
      </style>
      
      <HUD />
      <SettingsIcon />
      <ControlPanel />
      
      <Canvas 
        shadows 
        camera={{ position: [50, 30, 50], fov: 50 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={[fogConfig[timeOfDay].color]} />
        <fog 
          attach="fog" 
          args={[fogConfig[timeOfDay].color, fogConfig[timeOfDay].near, fogConfig[timeOfDay].far]} 
        />
        
        <ambientLight intensity={timeOfDay === 'night' ? 0.3 : 0.6} />
        <directionalLight 
          position={timeOfDay === 'night' ? [-10, 10, 10] : [10, 20, 10]} 
          intensity={timeOfDay === 'night' ? 0.5 : 1.0}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        
        <Suspense fallback={
          <Html center>
            <div style={{ 
              color: 'white', 
              fontSize: '20px', 
              background: 'rgba(139, 69, 19, 0.9)', 
              padding: '25px', 
              borderRadius: '15px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
              fontWeight: 'bold'
            }}>
              🏙️ Loading Enhanced Smart City...
            </div>
          </Html>
        }>
          <Sky {...skyConfig[timeOfDay]} />
          
          <Ground />
          
          {/* Enhanced City Layout with all new features */}
          <EnhancedCityLayout />
          
          {/* Enhanced Traffic System */}
          <EnhancedTrafficSystem />
          
          <ContactShadows 
            position={[0, -0.1, 0]} 
            opacity={0.5} 
            width={50} 
            height={50}
            blur={2} 
            far={10} 
          />
        </Suspense>
        
        {/* Custom Controls */}
        <CustomOrbitControls />
        <CameraController />
      </Canvas>

      {/* Enhanced Info Panel */}
      <div style={{ 
        position: 'absolute', 
        left: 20, 
        bottom: 20, 
        zIndex: 1000, 
        background: 'rgba(255,255,255,0.95)', 
        padding: '20px', 
        borderRadius: '15px', 
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
        border: '2px solid #d2b48c',
        backdropFilter: 'blur(10px)',
        maxWidth: '450px'
      }}>
        <div style={{ fontSize: 14, fontWeight: 'bold', color: '#8b4513', marginBottom: '10px' }}>
          🎮 Controls: Drag to rotate • Scroll to zoom • Click buildings to focus
        </div>
        <div style={{ fontSize: 12, color: '#a67c52', marginBottom: '6px' }}>
          🌟 ENHANCED FEATURES:
        </div>
        <div style={{ fontSize: 11, color: '#3498db', marginBottom: '4px' }}>
          • 🏠 Modern Residential Buildings • 🏫 Smart School • 🏥 Modern Hospital
        </div>
        <div style={{ fontSize: 11, color: '#27ae60', marginBottom: '4px' }}>
          • 💧 Water Filtration Plant • 🅿️ Smart Parking System • 🚗 Modern Vehicles
        </div>
        <div style={{ fontSize: 11, color: '#e74c3c', marginBottom: '4px' }}>
          • 🌐 Enhanced Cloud Data Center with Network Monitoring
        </div>
        <div style={{ fontSize: 11, color: '#d4af37', marginBottom: '6px' }}>
          • 🎪 Cultural Center • 🌿 Vertical Garden • ♻️ Waste Management
        </div>
        <div style={{ fontSize: 11, color: '#8b4513', fontWeight: 'bold' }}>
          ⚙️ Click settings icon (top-right) for city controls and navigation
        </div>
      </div>
    </div>
  )
}

// Keep all your existing components (Person, SolarPanel, WasteBin, WasteTruck, etc.)
// They will work with the enhanced system
