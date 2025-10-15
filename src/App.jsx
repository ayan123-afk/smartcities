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

/* ----- SCHOOL BUILDING COMPONENTS ----- */

function SchoolBuilding({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)
  const [classrooms, setClassrooms] = useState([
    { id: 1, students: 25, subject: 'Mathematics', active: true, floor: 1 },
    { id: 2, students: 30, subject: 'Science', active: true, floor: 1 },
    { id: 3, students: 20, subject: 'Art', active: false, floor: 1 },
    { id: 4, students: 28, subject: 'History', active: true, floor: 2 },
    { id: 5, students: 22, subject: 'Computer Lab', active: true, floor: 2 },
    { id: 6, students: 18, subject: 'Music', active: false, floor: 2 }
  ])

  const [offices, setOffices] = useState([
    { id: 1, type: "Principal's Office", occupied: true },
    { id: 2, type: "Teachers Room", occupied: true },
    { id: 3, type: 'Administration', occupied: true },
    { id: 4, type: 'Staff Room', occupied: false }
  ])

  return (
    <group position={position}>
      {/* Main School Structure - GLASS BUILDING */}
      <mesh 
        castShadow 
        receiveShadow 
        onClick={() => setFocus({
          x: position[0],
          y: 8,
          z: position[2],
          lookAt: { x: position[0], y: 0, z: position[2] }
        })}
      >
        <boxGeometry args={[20, 10, 15]} />
        <meshStandardMaterial 
          color="#e3f2fd" 
          transparent 
          opacity={0.2}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Building Structural Frame */}
      <mesh castShadow>
        <boxGeometry args={[20.2, 10.2, 15.2]} />
        <meshStandardMaterial color="#37474f" wireframe />
      </mesh>

      {/* VERTICAL GARDENS on East and West sides */}
      <VerticalGardenWall position={[0, 0, 7.6]} width={20} height={10} />
      <VerticalGardenWall position={[0, 0, -7.6]} width={20} height={10} rotation={[0, Math.PI, 0]} />

      {/* Floors */}
      {[0, 1].map(floor => (
        <group key={floor} position={[0, -3 + floor * 5, 0]}>
          {/* Floor separator */}
          <mesh position={[0, -2.4, 0]} receiveShadow>
            <boxGeometry args={[20, 0.1, 15]} />
            <meshStandardMaterial color="#78909c" />
          </mesh>

          {/* Classrooms and Offices */}
          {floor === 0 ? (
            <GroundFloor offices={offices} />
          ) : (
            <ClassroomFloor classrooms={classrooms.filter(c => c.floor === 2)} />
          )}
        </group>
      ))}

      {/* Rooftop Garden */}
      <mesh position={[0, 5.2, 0]} receiveShadow>
        <boxGeometry args={[20, 0.2, 15]} />
        <meshStandardMaterial color="#2e7d32" />
      </mesh>

      {/* Rooftop Solar Panels */}
      <group position={[0, 5.5, 0]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <SolarPanel 
            key={i}
            position={[-7.5 + i * 2, 0, 0]} 
            rotation={[0, 0, 0]} 
          />
        ))}
      </group>

      {/* Main Entrance */}
      <mesh position={[0, 1.5, 7.6]} castShadow>
        <boxGeometry args={[4, 3, 0.2]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>

      {/* School Name */}
      <Text
        position={[0, 6, 7.7]}
        fontSize={0.4}
        color="#1a237e"
        anchorX="center"
        anchorY="middle"
      >
        🏫 Green Valley School
      </Text>

      {/* School Information Display */}
      <Html position={[0, 11, 0]} transform>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '15px',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          minWidth: '280px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#1a237e' }}>🏫 Green Valley School</h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '8px',
            marginBottom: '12px',
            fontSize: '12px'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div>📚 Classrooms: 6</div>
              <div>👨‍🏫 Active: {classrooms.filter(c => c.active).length}</div>
              <div>👥 Students: {classrooms.reduce((sum, c) => sum + c.students, 0)}</div>
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <div>🏢 Offices: 4</div>
              <div>🌿 Vertical Gardens</div>
              <div>☀️ Solar Powered</div>
            </div>
          </div>

          <div style={{ 
            background: '#e8f5e8', 
            padding: '8px', 
            borderRadius: '6px',
            fontSize: '11px'
          }}>
            <div>✅ Glass Architecture</div>
            <div>✅ Sustainable Design</div>
            <div>✅ Modern Facilities</div>
          </div>
        </div>
      </Html>

      {/* School Parking Area */}
      <SchoolParking position={[0, 0, -20]} />
    </group>
  )
}

/* ----- Vertical Garden Wall ----- */
function VerticalGardenWall({ position = [0, 0, 0], width = 10, height = 8, rotation = [0, 0, 0] }) {
  const plantsPerRow = Math.floor(width / 1.2)
  const rows = Math.floor(height / 1)

  return (
    <group position={position} rotation={rotation}>
      {/* Green wall background */}
      <mesh receiveShadow>
        <boxGeometry args={[width, height, 0.2]} />
        <meshStandardMaterial color="#2e7d32" />
      </mesh>

      {/* Plants arrangement */}
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

/* ----- Ground Floor with Offices ----- */
function GroundFloor({ offices = [] }) {
  return (
    <group>
      {/* Main Corridor */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[16, 0.1, 4]} />
        <meshStandardMaterial color="#cfd8dc" />
      </mesh>

      {/* Reception Area */}
      <mesh position={[0, 0.5, -4]} castShadow>
        <boxGeometry args={[3, 1, 1]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>

      {/* Offices */}
      {offices.map((office, index) => {
        const positionX = -6 + index * 4
        return (
          <Office
            key={office.id}
            position={[positionX, 0, -5]}
            office={office}
          />
        )
      })}
    </group>
  )
}

/* ----- Classroom Floor ----- */
function ClassroomFloor({ classrooms = [] }) {
  return (
    <group>
      {/* Corridor */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[16, 0.1, 4]} />
        <meshStandardMaterial color="#cfd8dc" />
      </mesh>

      {/* Classrooms on both sides */}
      {classrooms.map((classroom, index) => {
        const side = index % 2 === 0 ? 1 : -1
        const positionX = -6 + Math.floor(index / 2) * 6
        const positionZ = side * 5

        return (
          <Classroom
            key={classroom.id}
            position={[positionX, 0, positionZ]}
            classroom={classroom}
          />
        )
      })}
    </group>
  )
}

/* ----- Individual Classroom ----- */
function Classroom({ position = [0, 0, 0], classroom }) {
  return (
    <group position={position}>
      {/* Classroom Structure */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[5, 4, 6]} />
        <meshStandardMaterial 
          color="#fafafa" 
          transparent 
          opacity={0.9}
        />
      </mesh>

      {/* Classroom Frame */}
      <mesh castShadow>
        <boxGeometry args={[5.1, 4.1, 6.1]} />
        <meshStandardMaterial color="#37474f" wireframe />
      </mesh>

      {/* Door */}
      <mesh position={[1.5, 1.5, 3.1]} castShadow>
        <boxGeometry args={[0.8, 2, 0.1]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>

      {/* Windows */}
      <mesh position={[-1, 1.5, 3.1]} castShadow>
        <boxGeometry args={[2, 1.5, 0.05]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
      </mesh>

      {/* Interior */}
      <group position={[0, -1.8, -1]}>
        {/* Teacher's desk */}
        <mesh position={[0, 0.6, 2]} castShadow>
          <boxGeometry args={[1.2, 0.8, 0.6]} />
          <meshStandardMaterial color="#8d6e63" />
        </mesh>

        {/* Student desks */}
        {Array.from({ length: Math.min(classroom.students, 16) }).map((_, i) => {
          const row = Math.floor(i / 4)
          const col = i % 4
          return (
            <group key={i} position={[-1.5 + col * 1, 0.3, -1 + row * 1]}>
              <mesh castShadow>
                <boxGeometry args={[0.6, 0.5, 0.6]} />
                <meshStandardMaterial color="#78909c" />
              </mesh>
            </group>
          )
        })}

        {/* Blackboard */}
        <mesh position={[0, 1.5, 2.8]} castShadow>
          <boxGeometry args={[2.5, 1.2, 0.1]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      </group>

      {/* Classroom Label */}
      <Text
        position={[0, 2.5, 3.2]}
        fontSize={0.15}
        color="#1a237e"
        anchorX="center"
        anchorY="middle"
      >
        {classroom.subject}
      </Text>

      {/* Classroom Status */}
      <Html position={[0, 3, 0]} transform>
        <div style={{
          background: classroom.active ? 'rgba(76, 175, 80, 0.9)' : 'rgba(158, 158, 158, 0.9)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '10px',
          fontWeight: 'bold'
        }}>
          {classroom.active ? '🟢 IN SESSION' : '🔴 NO CLASS'}
        </div>
      </Html>
    </group>
  )
}

/* ----- Individual Office ----- */
function Office({ position = [0, 0, 0], office }) {
  return (
    <group position={position}>
      {/* Office Structure */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3, 4, 4]} />
        <meshStandardMaterial 
          color="#f5f5f5" 
          transparent 
          opacity={0.9}
        />
      </mesh>

      {/* Office Frame */}
      <mesh castShadow>
        <boxGeometry args={[3.1, 4.1, 4.1]} />
        <meshStandardMaterial color="#37474f" wireframe />
      </mesh>

      {/* Door */}
      <mesh position={[0.8, 1.5, 2.1]} castShadow>
        <boxGeometry args={[0.6, 2, 0.1]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>

      {/* Window */}
      <mesh position={[-0.8, 1.5, 2.1]} castShadow>
        <boxGeometry args={[1, 1.5, 0.05]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
      </mesh>

      {/* Interior */}
      <group position={[0, -1.8, 0]}>
        {/* Desk */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[1, 0.8, 0.6]} />
          <meshStandardMaterial color="#8d6e63" />
        </mesh>

        {/* Chair */}
        <mesh position={[0, 0.3, -0.8]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#78909c" />
        </mesh>
      </group>

      {/* Office Label */}
      <Text
        position={[0, 2.5, 2.2]}
        fontSize={0.12}
        color="#1a237e"
        anchorX="center"
        anchorY="middle"
      >
        {office.type}
      </Text>

      {/* Office Status */}
      <Html position={[0, 3, 0]} transform>
        <div style={{
          background: office.occupied ? 'rgba(76, 175, 80, 0.9)' : 'rgba(158, 158, 158, 0.9)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '10px',
          fontWeight: 'bold'
        }}>
          {office.occupied ? '🟢 OCCUPIED' : '🔴 VACANT'}
        </div>
      </Html>
    </group>
  )
}

/* ----- School Parking Area ----- */
function SchoolParking({ position = [0, 0, 0] }) {
  const [parkedCars, setParkedCars] = useState(8)
  const totalSpots = 20

  // Simulate random car movements
  useFrame(() => {
    if (Math.random() < 0.005) { // Random car movements
      setParkedCars(prev => {
        const change = Math.random() < 0.5 ? 1 : -1
        return Math.max(2, Math.min(totalSpots, prev + change))
      })
    }
  })

  return (
    <group position={position}>
      {/* Parking Lot Surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[25, 12]} />
        <meshStandardMaterial color="#546e7a" />
      </mesh>

      {/* Parking Grid Lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[24, 11]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>

      {/* Parking Spots */}
      {Array.from({ length: totalSpots }).map((_, i) => {
        const row = Math.floor(i / 5)
        const col = i % 5
        const occupied = i < parkedCars
        const x = -10 + col * 4
        const z = -4 + row * 4

        return (
          <group key={i} position={[x, 0.1, z]}>
            {/* Parking Spot */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[3, 3} />
              <meshStandardMaterial color={occupied ? "#e57373" : "#81c784"} transparent opacity={0.6} />
            </mesh>

            {/* Parked Car */}
            {occupied && (
              <mesh position={[0, 0.3, 0]} castShadow>
                <boxGeometry args={[1.5, 0.3, 0.8]} />
                <meshStandardMaterial color={getRandomCarColor()} />
              </mesh>
            )}

            {/* Spot Number */}
            <Text
              position={[0, 0.2, 1.2]}
              fontSize={0.15}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {i + 1}
            </Text>
          </group>
        )
      })}

      {/* Parking Lot Label */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.3}
        color="#1a237e"
        anchorX="center"
        anchorY="middle"
      >
        🅿️ School Parking
      </Text>

      {/* Parking Information */}
      <Html position={[0, 3, 0]} transform>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          textAlign: 'center',
          minWidth: '180px'
        }}>
          <h4 style={{ margin: '0 0 6px 0', color: '#1a237e', fontSize: '14px' }}>🅿️ School Parking</h4>
          <div style={{ fontSize: '12px' }}>
            <div>🚗 Available: {totalSpots - parkedCars}</div>
            <div>🚙 Occupied: {parkedCars}</div>
            <div style={{ 
              marginTop: '4px', 
              padding: '3px', 
              background: '#e8f5e8', 
              borderRadius: '4px',
              fontSize: '10px'
            }}>
              Cars arrive/depart randomly
            </div>
          </div>
        </div>
      </Html>
    </group>
  )
}

/* ----- Helper function for random car colors ----- */
function getRandomCarColor() {
  const colors = ["#ff4444", "#44ff44", "#4444ff", "#ffff44", "#ff44ff", "#44ffff", "#ff8844"]
  return colors[Math.floor(Math.random() * colors.length)]
}

/* ----- Updated CityLayout to include School ----- */
function CityLayout() {
  const buildings = [
    // Residential area
    { position: [-25, 0, 15], height: 6, color: "#a67c52", name: "Residence A", hasTurbine: true },
    { position: [-20, 0, 18], height: 8, color: "#b5651d", name: "Residence B", hasTurbine: false },
    { position: [-30, 0, 20], height: 7, color: "#c19a6b", name: "Residence C", hasTurbine: true },
    
    // Commercial area
    { position: [20, 0, -15], height: 12, color: "#8b4513", name: "Office A", hasTurbine: true },
    { position: [25, 0, -18], height: 10, color: "#a0522d", name: "Office B", hasTurbine: false },
    { position: [15, 0, -20], height: 14, color: "#cd853f", name: "Office C", hasTurbine: true }
  ]

  return (
    <group>
      {/* NEW SCHOOL BUILDING */}
      <SchoolBuilding position={[-25, 0, -10]} />
      
      {/* Cultural Center */}
      <CulturalCenter position={[0, 0, 25]} />
      
      {/* Bus Station */}
      <BusStation position={[15, 0, 25]} />
      
      {/* Vertical Farm */}
      <VerticalFarm position={[30, 0, -10]} />
      
      {/* Energy Efficient Society */}
      <EnergyEfficientSociety position={[0, 0, 0]} />
      
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
      
      {/* Waste bins */}
      <WasteBin position={[-10, 0, 8]} id="bin1" />
      <WasteBin position={[12, 0, -5]} id="bin2" />
      <WasteBin position={[-5, 0, -12]} id="bin3" />
      <WasteBin position={[18, 0, 10]} id="bin4" />
      <WasteBin position={[-15, 0, -18]} id="bin5" />
      <WasteBin position={[5, 0, 20]} id="bin6" />
      
      {/* Walking people - including students */}
      <Person position={[5, 0, 22]} color="#8b4513" speed={0.3} />
      <Person position={[-3, 0, 27]} color="#2c3e50" speed={0.4} />
      <Person position={[8, 0, 28]} color="#8b4513" speed={0.2} />

      {/* Students walking to school */}
      <Person position={[-20, 0, -5]} color="#1a237e" speed={0.3} />
      <Person position={[-15, 0, 0]} color="#4a148c" speed={0.4} />
    </group>
  )
}

/* ----- Updated Control Panel with School Location ----- */
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
    '🏫 School': { x: -25, y: 8, z: -10, lookAt: { x: -25, y: 0, z: -10 } },
    '🅿️ School Parking': { x: -25, y: 5, z: -30, lookAt: { x: -25, y: 0, z: -30 } },
    '🎪 Cultural Center': { x: 0, y: 15, z: 25, lookAt: { x: 0, y: 0, z: 25 } },
    '🚏 Bus Station': { x: 15, y: 10, z: 25, lookAt: { x: 15, y: 0, z: 25 } },
    '🗑️ Waste Management': { x: 15, y: 10, z: 15, lookAt: { x: 15, y: 0, z: 15 } },
    '🏢 Vertical Farm': { x: 30, y: 10, z: -10, lookAt: { x: 30, y: 0, z: -10 } },
    '🏠 Energy Society': { x: 0, y: 15, z: -28, lookAt: { x: 0, y: 0, z: -28 } }
  }

  if (!showCityControl) return null

  return (
    <div style={{ 
      position: 'absolute', 
      right: 80, 
      top: 12, 
      zIndex: 50, 
      background: 'rgba(255,255,255,0.95)', 
      padding: 16, 
      borderRadius: 12, 
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      minWidth: '180px',
      maxWidth: '200px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, color: '#8b4513', fontSize: '16px' }}>City Controls</h3>
        <button 
          onClick={() => setShowCityControl(false)}
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '18px', 
            cursor: 'pointer',
            color: '#8b4513',
            fontWeight: 'bold'
          }}
        >
          ✕
        </button>
      </div>
      
      <div style={{ marginBottom: 10 }}>
        <label style={{ display: 'block', marginBottom: 4, fontSize: '11px', fontWeight: 'bold' }}>
          Time of Day:
        </label>
        <select 
          value={timeOfDay}
          onChange={(e) => {
            setTimeOfDay(e.target.value)
            setStreetLightsOn(e.target.value === 'night')
          }}
          style={{ width: '100%', padding: '4px', borderRadius: '6px', border: '1px solid #d2b48c', fontSize: '11px' }}
        >
          <option value="day">☀️ Day</option>
          <option value="evening">🌆 Evening</option>
          <option value="night">🌙 Night</option>
        </select>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label style={{ display: 'block', marginBottom: 4, fontSize: '11px', fontWeight: 'bold' }}>
          Traffic Density:
        </label>
        <select 
          onChange={(e) => setTrafficDensity(e.target.value)}
          style={{ width: '100%', padding: '4px', borderRadius: '6px', border: '1px solid #d2b48c', fontSize: '11px' }}
        >
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High</option>
        </select>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label style={{ display: 'block', marginBottom: 4, fontSize: '11px', fontWeight: 'bold' }}>
          Street Lights:
        </label>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            onClick={() => setStreetLightsOn(true)}
            style={{ 
              flex: 1, 
              background: '#27ae60', 
              color: 'white', 
              border: 'none', 
              padding: '4px', 
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            ON
          </button>
          <button 
            onClick={() => setStreetLightsOn(false)}
            style={{ 
              flex: 1, 
              background: '#e74c3c', 
              color: 'white', 
              border: 'none', 
              padding: '4px', 
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            OFF
          </button>
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: '11px', fontWeight: 'bold' }}>
          Quick Nav:
        </label>
        <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
          {Object.entries(locations).map(([name, pos]) => (
            <button 
              key={name}
              onClick={() => setFocus(pos)}
              style={{ 
                width: '100%', 
                background: '#d2691e', 
                color: 'white', 
                border: 'none', 
                padding: '4px 6px', 
                borderRadius: '6px',
                cursor: 'pointer',
                marginBottom: '3px',
                fontSize: '10px'
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

// ... (ALL OTHER EXISTING COMPONENTS REMAIN THE SAME - VerticalFarm, CulturalCenter, Person, etc.)

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
      
      <Canvas shadows camera={{ position: [30, 20, 30], fov: 50 }}>
        <color attach="background" args={['#87CEEB']} />
        <ambientLight intensity={timeOfDay === 'night' ? 0.3 : 0.6} />
        <directionalLight 
          position={timeOfDay === 'night' ? [-10, 10, 10] : [10, 20, 10]} 
          intensity={timeOfDay === 'night' ? 0.5 : 1.0}
          castShadow
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
          <CityLayout />
          <TrafficSystem />
          <ContactShadows position={[0, -0.1, 0]} opacity={0.4} />
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
        padding: 12, 
        borderRadius: 12, 
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)' 
      }}>
        <div style={{ fontSize: 13, fontWeight: 'bold', color: '#8b4513' }}>
          🎮 Controls: Drag to rotate • Scroll to zoom • Click buildings to focus
        </div>
        <div style={{ fontSize: 11, color: '#a67c52', marginTop: 4 }}>
          🌟 NEW: School with Vertical Gardens • Glass Architecture • Classrooms • Parking
        </div>
        <div style={{ fontSize: 11, color: '#1a237e', marginTop: 2, fontWeight: 'bold' }}>
          🏫 Click the school building to explore classrooms and offices!
        </div>
      </div>
    </div>
  )
}
