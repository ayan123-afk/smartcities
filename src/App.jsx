import React, { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, useGLTF, ContactShadows, Sky, Text, Sparkles, Float, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { create } from 'zustand'

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
  setCollectedWaste: (waste) => set({ collectedWaste: waste })
}))

/* ----- ENHANCED ROAD SYSTEM ----- */
function RoadSystem() {
  const roadTexture = useTexture({
    map: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMzMzMzMzIi8+CjxwYXRoIGQ9Ik0yNSA1TDI1IDQ1IiBzdHJva2U9IiNmZmZmMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWRhc2hhcnJheT0iNCA0Ii8+Cjwvc3ZnPg=='
  })

  const mainRoads = [
    { start: [-50, 0, 0], end: [50, 0, 0], width: 6, isMain: true },
    { start: [0, 0, -50], end: [0, 0, 50], width: 6, isMain: true },
    { start: [-35, 0, -25], end: [35, 0, -25], width: 4, isMain: false },
    { start: [-25, 0, 35], end: [25, 0, 35], width: 4, isMain: false },
    { start: [-40, 0, 15], end: [40, 0, 15], width: 4, isMain: false }
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
          <group key={index}>
            {/* Road Surface */}
            <mesh position={center} rotation={[-Math.PI / 2, 0, angle]}>
              <planeGeometry args={[length, road.width]} />
              <meshStandardMaterial 
                color={road.isMain ? "#2c3e50" : "#34495e"}
                roughness={0.8}
                metalness={0.1}
              />
            </mesh>

            {/* Road Markings */}
            {Array.from({ length: Math.floor(length / 8) }).map((_, segIndex) => {
              const t = (segIndex + 0.5) / Math.floor(length / 8)
              const pos = [
                road.start[0] + (road.end[0] - road.start[0]) * t,
                0.02,
                road.start[2] + (road.end[2] - road.start[2]) * t
              ]
              
              return (
                <mesh key={segIndex} position={pos} rotation={[-Math.PI / 2, 0, angle]}>
                  <planeGeometry args={[4, 0.4]} />
                  <meshStandardMaterial color="#ffff00" />
                </mesh>
              )
            })}

            {/* Side Lines */}
            <mesh position={center} rotation={[-Math.PI / 2, 0, angle]}>
              <planeGeometry args={[length, 0.2]} />
              <meshStandardMaterial color="#ffff00" />
            </mesh>
            <mesh position={center} rotation={[-Math.PI / 2, 0, angle]}>
              <planeGeometry args={[length, 0.2]} />
              <meshStandardMaterial color="#ffff00" />
            </mesh>
          </group>
        )
      })}

      {/* Intersections */}
      {[[0,0], [-35,-25], [35,-25], [-25,35], [25,35]].map(([x,z], i) => (
        <mesh key={i} position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[3, 16]} />
          <meshStandardMaterial color="#34495e" />
        </mesh>
      ))}
    </group>
  )
}

/* ----- ENHANCED CAR SYSTEM ----- */
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
      
      // Proper rotation based on road direction
      const direction = new THREE.Vector3().subVectors(b, a).normalize()
      carRef.current.lookAt(carRef.current.position.clone().add(direction))
    }
  })

  return (
    <group ref={carRef} position={position}>
      {/* Car Body - Modern Design */}
      <mesh castShadow>
        <boxGeometry args={[1.8, 0.5, 0.8]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Car Roof */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[1.6, 0.3, 0.7]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Windows */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.5, 0.2, 0.6]} />
        <meshStandardMaterial color="#2c3e50" transparent opacity={0.7} />
      </mesh>
      
      {/* Headlights */}
      <mesh position={[0, 0.2, 0.41]} castShadow>
        <boxGeometry args={[0.6, 0.1, 0.1]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffff99" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Wheels */}
      {[-0.5, 0.5].map((x, i) => (
        <group key={i}>
          <mesh position={[x, -0.15, 0.25]} castShadow rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.12, 12]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
          <mesh position={[x, -0.15, -0.25]} castShadow rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.12, 12]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
        </group>
      ))}

      {/* Spoiler */}
      <mesh position={[0, 0.4, -0.41]} castShadow>
        <boxGeometry args={[1.2, 0.05, 0.1]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
    </group>
  )
}

/* ----- ENHANCED SCHOOL BUILDING ----- */
function SchoolBuilding({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)

  return (
    <group position={position}>
      {/* Main School Building - Larger and Better Styled */}
      <mesh 
        castShadow 
        receiveShadow 
        onClick={() => setFocus({
          x: position[0],
          y: 15,
          z: position[2],
          lookAt: { x: position[0], y: 0, z: position[2] }
        })}
      >
        <boxGeometry args={[35, 20, 25]} />
        <meshStandardMaterial 
          color="#e3f2fd" 
          transparent 
          opacity={0.15}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Building Frame - Modern Architecture */}
      <mesh castShadow>
        <boxGeometry args={[35.2, 20.2, 25.2]} />
        <meshStandardMaterial color="#1565c0" />
      </mesh>

      {/* Vertical Gardens on Front and Back */}
      <VerticalGardenWall position={[0, 0, 12.6]} width={35} height={20} />
      <VerticalGardenWall position={[0, 0, -12.6]} width={35} height={20} rotation={[0, Math.PI, 0]} />

      {/* Floors with Windows */}
      {[0, 1, 2].map(floor => (
        <group key={floor} position={[0, -7 + floor * 7, 0]}>
          {/* Floor Windows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[-12 + i * 3.5, 2, 12.7]} castShadow>
              <boxGeometry args={[2, 3, 0.1]} />
              <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Main Entrance - Grand Design */}
      <mesh position={[0, 4, 12.7]} castShadow>
        <boxGeometry args={[6, 8, 0.2]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>

      {/* Entrance Canopy */}
      <mesh position={[0, 8, 11]} castShadow>
        <boxGeometry args={[8, 0.5, 2]} />
        <meshStandardMaterial color="#1565c0" />
      </mesh>

      {/* School Name - Prominent Display */}
      <Text
        position={[0, 12, 12.8]}
        fontSize={0.8}
        color="#1565c0"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        🏫 Green Valley International School
      </Text>

      {/* School Information */}
      <Html position={[0, 22, 0]} transform>
        <div style={{
          background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          minWidth: '320px',
          textAlign: 'center',
          border: '3px solid #1565c0'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#1565c0', fontSize: '18px' }}>
            🏫 Green Valley International School
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '12px',
            marginBottom: '15px'
          }}>
            <div style={{ textAlign: 'left', fontSize: '13px' }}>
              <div>📚 24 Classrooms</div>
              <div>👨‍🏫 45 Teachers</div>
              <div>👥 800 Students</div>
              <div>🏢 3 Floors</div>
            </div>
            
            <div style={{ textAlign: 'left', fontSize: '13px' }}>
              <div>🌿 Vertical Gardens</div>
              <div>☀️ Solar Powered</div>
              <div>🏛️ Modern Design</div>
              <div>🎓 Est. 1995</div>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(21, 101, 192, 0.1)', 
            padding: '10px', 
            borderRadius: '8px',
            fontSize: '12px',
            border: '1px solid #1565c0'
          }}>
            <div>✅ International Curriculum</div>
            <div>✅ Sports Facilities</div>
            <div>✅ Science Labs</div>
            <div>✅ Library & Arts</div>
          </div>
        </div>
      </Html>

      {/* School Parking */}
      <SchoolParking position={[0, 0, -35]} />
    </group>
  )
}

/* ----- ENHANCED HOSPITAL BUILDING ----- */
function HospitalBuilding({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)

  return (
    <group position={position}>
      {/* Main Hospital Building */}
      <mesh 
        castShadow 
        receiveShadow 
        onClick={() => setFocus({
          x: position[0],
          y: 18,
          z: position[2],
          lookAt: { x: position[0], y: 0, z: position[2] }
        })}
      >
        <boxGeometry args={[30, 25, 20]} />
        <meshStandardMaterial 
          color="#fce4ec" 
          transparent 
          opacity={0.15}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Hospital Frame - Medical Theme */}
      <mesh castShadow>
        <boxGeometry args={[30.2, 25.2, 20.2]} />
        <meshStandardMaterial color="#d81b60" />
      </mesh>

      {/* Red Cross Symbol */}
      <group position={[0, 12, 10.2]}>
        <mesh rotation={[0, 0, 0]} castShadow>
          <boxGeometry args={[8, 2, 0.3]} />
          <meshStandardMaterial color="#d32f2f" />
        </mesh>
        <mesh rotation={[0, 0, Math.PI/2]} castShadow>
          <boxGeometry args={[8, 2, 0.3]} />
          <meshStandardMaterial color="#d32f2f" />
        </mesh>
      </group>

      {/* Floors with Medical Windows */}
      {[0, 1, 2, 3].map(floor => (
        <group key={floor} position={[0, -9 + floor * 6, 0]}>
          {/* Floor Windows */}
          {Array.from({ length: 6 }).map((_, i) => (
            <mesh key={i} position={[-10 + i * 4, 2, 10.2]} castShadow>
              <boxGeometry args={[2, 3, 0.1]} />
              <meshStandardMaterial color="#bbdefb" transparent opacity={0.7} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Emergency Entrance */}
      <mesh position={[-8, 3, 10.2]} castShadow>
        <boxGeometry args={[4, 6, 0.2]} />
        <meshStandardMaterial color="#d32f2f" />
      </mesh>

      {/* Main Entrance */}
      <mesh position={[8, 3, 10.2]} castShadow>
        <boxGeometry args={[4, 6, 0.2]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>

      {/* Helipad on Roof */}
      <mesh position={[0, 13, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <circleGeometry args={[4, 16]} />
        <meshStandardMaterial color="#37474f" />
      </mesh>
      <Text position={[0, 13.1, 0]} fontSize={0.3} color="white" anchorX="center">
        H
      </Text>

      {/* Hospital Name */}
      <Text
        position={[0, 15, 10.3]}
        fontSize={0.6}
        color="#d81b60"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        🏥 City General Hospital
      </Text>

      {/* Hospital Information */}
      <Html position={[0, 28, 0]} transform>
        <div style={{
          background: 'linear-gradient(135deg, #fce4ec, #f8bbd9)',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          minWidth: '320px',
          textAlign: 'center',
          border: '3px solid #d81b60'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#d81b60', fontSize: '18px' }}>
            🏥 City General Hospital
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '12px',
            marginBottom: '15px'
          }}>
            <div style={{ textAlign: 'left', fontSize: '13px' }}>
              <div>🛏️ 150 Beds</div>
              <div>👨‍⚕️ 75 Doctors</div>
              <div>👩‍⚕️ 120 Nurses</div>
              <div>🏢 4 Floors</div>
            </div>
            
            <div style={{ textAlign: 'left', fontSize: '13px' }}>
              <div>🚑 Emergency Dept</div>
              <div>💊 Pharmacy</div>
              <div>🔄 24/7 Service</div>
              <div>🚁 Helipad</div>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(216, 27, 96, 0.1)', 
            padding: '10px', 
            borderRadius: '8px',
            fontSize: '12px',
            border: '1px solid #d81b60'
          }}>
            <div>✅ Emergency Care</div>
            <div>✅ Surgery Units</div>
            <div>✅ ICU Facilities</div>
            <div>✅ Medical Research</div>
          </div>
        </div>
      </Html>

      {/* Hospital Parking */}
      <HospitalParking position={[0, 0, -25]} />
    </group>
  )
}

/* ----- ENHANCED PARKING SYSTEMS ----- */
function SchoolParking({ position = [0, 0, 0] }) {
  const [parkedCars, setParkedCars] = useState(12)
  const totalSpots = 30

  useFrame(() => {
    if (Math.random() < 0.008) {
      setParkedCars(prev => {
        const change = Math.random() < 0.5 ? 1 : -1
        return Math.max(5, Math.min(totalSpots, prev + change))
      })
    }
  })

  return (
    <group position={position}>
      {/* Parking Lot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 25]} />
        <meshStandardMaterial color="#455a64" />
      </mesh>

      {/* Parking Grid */}
      {Array.from({ length: totalSpots }).map((_, i) => {
        const row = Math.floor(i / 6)
        const col = i % 6
        const occupied = i < parkedCars
        const x = -15 + col * 5
        const z = -8 + row * 8

        return (
          <group key={i} position={[x, 0.1, z]}>
            {/* Parking Spot */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[4, 6} />
              <meshStandardMaterial color={occupied ? "#e57373" : "#81c784"} transparent opacity={0.7} />
            </mesh>

            {/* Enhanced Parked Car */}
            {occupied && (
              <Car 
                position={[0, 0.4, 0]} 
                color={getRandomCarColor()}
                speed={0}
              />
            )}

            {/* Spot Number */}
            <Text
              position={[0, 0.2, 2.5]}
              fontSize={0.2}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              {i + 1}
            </Text>
          </group>
        )
      })}

      <Text
        position={[0, 2, 0]}
        fontSize={0.4}
        color="#1565c0"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        🅿️ School Parking
      </Text>
    </group>
  )
}

function HospitalParking({ position = [0, 0, 0] }) {
  const [parkedCars, setParkedCars] = useState(8)
  const totalSpots = 20

  useFrame(() => {
    if (Math.random() < 0.01) {
      setParkedCars(prev => {
        const change = Math.random() < 0.5 ? 1 : -1
        return Math.max(3, Math.min(totalSpots, prev + change))
      })
    }
  })

  return (
    <group position={position}>
      {/* Parking Lot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[35, 20]} />
        <meshStandardMaterial color="#455a64" />
      </mesh>

      {/* Emergency Parking Spots */}
      <mesh position={[-12, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 6} />
        <meshStandardMaterial color="#d32f2f" transparent opacity={0.7} />
      </mesh>
      <Text position={[-12, 0.2, 2.5]} fontSize={0.2} color="white" anchorX="center">
        EMERGENCY
      </Text>

      {/* Regular Parking Spots */}
      {Array.from({ length: totalSpots }).map((_, i) => {
        const row = Math.floor(i / 5)
        const col = i % 5
        const occupied = i < parkedCars
        const x = -5 + col * 4
        const z = -6 + row * 6

        return (
          <group key={i} position={[x, 0.1, z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[3, 5} />
              <meshStandardMaterial color={occupied ? "#e57373" : "#81c784"} transparent opacity={0.7} />
            </mesh>

            {occupied && (
              <Car 
                position={[0, 0.4, 0]} 
                color={getRandomCarColor()}
                speed={0}
              />
            )}

            <Text position={[0, 0.2, 2]} fontSize={0.15} color="white" anchorX="center">
              {i + 1}
            </Text>
          </group>
        )
      })}

      <Text
        position={[0, 2, 0]}
        fontSize={0.4}
        color="#d81b60"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        🅿️ Hospital Parking
      </Text>
    </group>
  )
}

/* ----- UPDATED CITY LAYOUT ----- */
function CityLayout() {
  return (
    <group>
      {/* SEPARATED SCHOOL in Empty Area */}
      <SchoolBuilding position={[-40, 0, 30]} />
      
      {/* SEPARATED HOSPITAL in Empty Area */}
      <HospitalBuilding position={[40, 0, 30]} />
      
      {/* Cultural Center */}
      <CulturalCenter position={[0, 0, -20]} />
      
      {/* Bus Station */}
      <BusStation position={[15, 0, -20]} />
      
      {/* Vertical Farm */}
      <VerticalFarm position={[30, 0, -35]} />
      
      {/* Energy Efficient Society */}
      <EnergyEfficientSociety position={[0, 0, -50]} />
      
      {/* Waste Management System */}
      <WasteManagementSystem position={[15, 0, -5]} />
      
      {/* Regular buildings scattered around */}
      <SmartBuilding position={[-25, 0, -5]} height={8} color="#a67c52" name="Office A" hasTurbine={true} />
      <SmartBuilding position={[25, 0, -5]} height={10} color="#8b4513" name="Office B" hasTurbine={false} />
      <SmartBuilding position={[-20, 0, 10]} height={12} color="#b5651d" name="Residence A" hasTurbine={true} />
      <SmartBuilding position={[20, 0, 10]} height={9} color="#c19a6b" name="Residence B" hasTurbine={true} />

      {/* Waste bins */}
      <WasteBin position={[-10, 0, 8]} id="bin1" />
      <WasteBin position={[12, 0, -5]} id="bin2" />
      <WasteBin position={[-5, 0, -12]} id="bin3" />
      <WasteBin position={[18, 0, 10]} id="bin4" />

      {/* People walking */}
      <Person position={[5, 0, -22]} color="#8b4513" speed={0.3} />
      <Person position={[-3, 0, -27]} color="#2c3e50" speed={0.4} />
      
      {/* Students near school */}
      <Person position={[-35, 0, 25]} color="#1565c0" speed={0.3} />
      <Person position={[-45, 0, 28]} color="#1976d2" speed={0.4} />
      
      {/* People near hospital */}
      <Person position={[35, 0, 25]} color="#d81b60" speed={0.2} />
      <Person position={[45, 0, 28]} color="#c2185b" speed={0.3} />
    </group>
  )
}

/* ----- ENHANCED GROUND WITH BETTER ROADS ----- */
function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#27ae60" roughness={0.8} metalness={0.1} />
      </mesh>
      
      {/* Enhanced Road System */}
      <RoadSystem />
      
      {/* Street Light System */}
      <StreetLightSystem />
      
      <gridHelper args={[200, 200, '#8b7355', '#8b7355']} position={[0, 0.01, 0]} />
      <ContactShadows position={[0, -0.03, 0]} opacity={0.3} width={50} blur={2} far={20} />
    </>
  )
}

/* ----- UPDATED CONTROL PANEL WITH ROAD NAVIGATION ----- */
function ControlPanel() {
  const setTimeOfDay = useStore((s) => s.setTimeOfDay)
  const setTrafficDensity = useStore((s) => s.setTrafficDensity)
  const setStreetLightsOn = useStore((s) => s.setStreetLightsOn)
  const setFocus = useStore((s) => s.setFocus)
  const timeOfDay = useStore((s) => s.timeOfDay)
  const showCityControl = useStore((s) => s.showCityControl)
  const setShowCityControl = useStore((s) => s.setShowCityControl)

  useEffect(() => {
    if (timeOfDay === 'night') {
      setStreetLightsOn(true)
    }
  }, [timeOfDay, setStreetLightsOn])

  const locations = {
    '🛣️ Main Road View': { x: 0, y: 25, z: 0, lookAt: { x: 0, y: 0, z: 0 } },
    '🛣️ North Road': { x: 0, y: 15, z: 40, lookAt: { x: 0, y: 0, z: 0 } },
    '🛣️ South Road': { x: 0, y: 15, z: -40, lookAt: { x: 0, y: 0, z: 0 } },
    '🛣️ East Road': { x: 40, y: 15, z: 0, lookAt: { x: 0, y: 0, z: 0 } },
    '🛣️ West Road': { x: -40, y: 15, z: 0, lookAt: { x: 0, y: 0, z: 0 } },
    '🏫 School': { x: -40, y: 20, z: 30, lookAt: { x: -40, y: 0, z: 30 } },
    '🏥 Hospital': { x: 40, y: 20, z: 30, lookAt: { x: 40, y: 0, z: 30 } },
    '🎪 Cultural Center': { x: 0, y: 15, z: -20, lookAt: { x: 0, y: 0, z: -20 } },
    '🏢 Vertical Farm': { x: 30, y: 15, z: -35, lookAt: { x: 30, y: 0, z: -35 } },
    '🏠 Energy Society': { x: 0, y: 20, z: -50, lookAt: { x: 0, y: 0, z: -50 } }
  }

  if (!showCityControl) return null

  return (
    <div style={{ 
      position: 'absolute', 
      right: 80, 
      top: 12, 
      zIndex: 50, 
      background: 'rgba(255,255,255,0.98)', 
      padding: 20, 
      borderRadius: 15, 
      boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
      minWidth: '220px',
      maxWidth: '240px',
      border: '2px solid #8b4513'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, color: '#8b4513', fontSize: '18px' }}>🏙️ City Navigation</h3>
        <button 
          onClick={() => setShowCityControl(false)}
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '20px', 
            cursor: 'pointer',
            color: '#8b4513',
            fontWeight: 'bold'
          }}
        >
          ✕
        </button>
      </div>
      
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 6, fontSize: '12px', fontWeight: 'bold', color: '#8b4513' }}>
          🕐 Time of Day:
        </label>
        <select 
          value={timeOfDay}
          onChange={(e) => {
            setTimeOfDay(e.target.value)
            setStreetLightsOn(e.target.value === 'night')
          }}
          style={{ 
            width: '100%', 
            padding: '6px', 
            borderRadius: '8px', 
            border: '2px solid #d2b48c', 
            fontSize: '12px',
            background: '#fffaf0'
          }}
        >
          <option value="day">☀️ Day Time</option>
          <option value="evening">🌆 Evening</option>
          <option value="night">🌙 Night</option>
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 6, fontSize: '12px', fontWeight: 'bold', color: '#8b4513' }}>
          🚗 Traffic Density:
        </label>
        <select 
          onChange={(e) => setTrafficDensity(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '6px', 
            borderRadius: '8px', 
            border: '2px solid #d2b48c', 
            fontSize: '12px',
            background: '#fffaf0'
          }}
        >
          <option value="low">🟢 Light Traffic</option>
          <option value="medium">🟡 Medium Traffic</option>
          <option value="high">🔴 Heavy Traffic</option>
        </select>
      </div>

      <div style={{ marginBottom: 15 }}>
        <label style={{ display: 'block', marginBottom: 6, fontSize: '12px', fontWeight: 'bold', color: '#8b4513' }}>
          💡 Street Lights:
        </label>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            onClick={() => setStreetLightsOn(true)}
            style={{ 
              flex: 1, 
              background: '#27ae60', 
              color: 'white', 
              border: 'none', 
              padding: '6px', 
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
          >
            💡 TURN ON
          </button>
          <button 
            onClick={() => setStreetLightsOn(false)}
            style={{ 
              flex: 1, 
              background: '#e74c3c', 
              color: 'white', 
              border: 'none', 
              padding: '6px', 
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
          >
            🔌 TURN OFF
          </button>
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 6, fontSize: '12px', fontWeight: 'bold', color: '#8b4513' }}>
          🧭 Quick Navigation:
        </label>
        <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '5px' }}>
          {Object.entries(locations).map(([name, pos]) => (
            <button 
              key={name}
              onClick={() => setFocus(pos)}
              style={{ 
                width: '100%', 
                background: 'linear-gradient(135deg, #d2691e, #8b4513)', 
                color: 'white', 
                border: 'none', 
                padding: '8px 10px', 
                borderRadius: '8px',
                cursor: 'pointer',
                marginBottom: '5px',
                fontSize: '11px',
                fontWeight: 'bold',
                textAlign: 'left'
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ----- HELPER FUNCTIONS ----- */
function getRandomCarColor() {
  const colors = [
    "#ff4444", "#44ff44", "#4444ff", "#ffff44", 
    "#ff44ff", "#44ffff", "#ff8844", "#8844ff",
    "#ff6666", "#66ff66", "#6666ff", "#ffcc66"
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

function VerticalGardenWall({ position = [0, 0, 0], width = 10, height = 8, rotation = [0, 0, 0] }) {
  const plantsPerRow = Math.floor(width / 1.2)
  const rows = Math.floor(height / 1)

  return (
    <group position={position} rotation={rotation}>
      <mesh receiveShadow>
        <boxGeometry args={[width, height, 0.2]} />
        <meshStandardMaterial color="#2e7d32" />
      </mesh>

      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: plantsPerRow }).map((_, col) => {
          const x = -width/2 + (col + 0.5) * (width / plantsPerRow)
          const y = -height/2 + (row + 0.5) * (height / rows)
          const plantSize = 0.2 + Math.random() * 0.1
          
          return (
            <mesh key={`${row}-${col}`} position={[x, y, 0.15]} castShadow>
              <sphereGeometry args={[plantSize, 6, 6]} />
              <meshStandardMaterial color={row % 2 === 0 ? "#4caf50" : "#388e3c"} />
            </mesh>
          )
        })
      )}
    </group>
  )
}

// ... (Keep all other existing components like CameraController, CustomOrbitControls, Person, etc.)

export default function App() {
  const timeOfDay = useStore((s) => s.timeOfDay)
  const emergencyAlarm = useStore((s) => s.emergencyAlarm)
  
  const skyConfig = {
    day: { sunPosition: [100, 20, 100], inclination: 0, azimuth: 0.25 },
    evening: { sunPosition: [10, 5, 100], inclination: 0, azimuth: 0.25 },
    night: { sunPosition: [-100, -20, 100], inclination: 0, azimuth: 0.25 }
  }

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
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
      <SettingsIcon />
      <ControlPanel />
      
      <Canvas shadows camera={{ position: [0, 30, 50], fov: 50 }}>
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
              Loading Enhanced Smart City...
            </div>
          </Html>
        }>
          <Sky {...skyConfig[timeOfDay]} />
          <Ground />
          <CityLayout />
          <TrafficSystem />
          <ContactShadows position={[0, -0.1, 0]} opacity={0.4} width={50} blur={2} far={20} />
        </Suspense>
        
        <CustomOrbitControls />
        <CameraController />
      </Canvas>

      <div style={{ 
        position: 'absolute', 
        left: 12, 
        bottom: 12, 
        zIndex: 50, 
        background: 'rgba(255,255,255,0.95)', 
        padding: 15, 
        borderRadius: 12, 
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        border: '2px solid #8b4513'
      }}>
        <div style={{ fontSize: 14, fontWeight: 'bold', color: '#8b4513', marginBottom: '5px' }}>
          🎮 CITY EXPLORER CONTROLS
        </div>
        <div style={{ fontSize: 11, color: '#a67c52', marginBottom: '3px' }}>
          🖱️ Drag to Rotate • 🔍 Scroll to Zoom • 🏢 Click Buildings to View
        </div>
        <div style={{ fontSize: 11, color: '#1565c0', marginBottom: '3px', fontWeight: 'bold' }}>
          🏫 Enhanced School & Hospital with Parking
        </div>
        <div style={{ fontSize: 11, color: '#d81b60', fontWeight: 'bold' }}>
          🛣️ New Road Navigation • 🚗 Better Car Designs
        </div>
      </div>
    </div>
  )
}
