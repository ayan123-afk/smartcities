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

/* ----- School Building with Vertical Gardens ----- */
function SchoolBuilding({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)
  const [classrooms, setClassrooms] = useState([
    { id: 1, students: 25, subject: 'Math', active: true },
    { id: 2, students: 30, subject: 'Science', active: true },
    { id: 3, students: 20, subject: 'Art', active: false },
    { id: 4, students: 28, subject: 'History', active: true },
    { id: 5, students: 22, subject: 'Computer', active: true },
    { id: 6, students: 18, subject: 'Music', active: false }
  ])

  const [offices, setOffices] = useState([
    { id: 1, type: 'Principal', occupied: true },
    { id: 2, type: 'Teachers', occupied: true },
    { id: 3, type: 'Admin', occupied: true },
    { id: 4, type: 'Staff', occupied: false }
  ])

  return (
    <group position={position}>
      {/* Main School Structure - Glass Building */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[25, 12, 18]} />
        <meshStandardMaterial 
          color="#e3f2fd" 
          transparent 
          opacity={0.3}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>

      {/* Building Frame */}
      <mesh castShadow>
        <boxGeometry args={[25.2, 12.2, 18.2]} />
        <meshStandardMaterial color="#37474f" wireframe />
      </mesh>

      {/* Vertical Gardens on sides */}
      <group position={[0, 0, 9.1]}>
        <VerticalGardenWall width={25} height={12} />
      </group>
      <group position={[0, 0, -9.1]} rotation={[0, Math.PI, 0]}>
        <VerticalGardenWall width={25} height={12} />
      </group>

      {/* Floors */}
      {[0, 1, 2].map(floor => (
        <group key={floor} position={[0, -4 + floor * 4, 0]}>
          {/* Floor separator */}
          <mesh position={[0, -1.9, 0]} receiveShadow>
            <boxGeometry args={[25, 0.1, 18]} />
            <meshStandardMaterial color="#78909c" />
          </mesh>

          {/* Classrooms and Offices */}
          {floor === 0 && (
            <group>
              {/* Ground Floor - Reception and Offices */}
              <OfficeFloor offices={offices} />
            </group>
          )}

          {floor === 1 && (
            <group>
              {/* First Floor - Classrooms 1-3 */}
              <ClassroomFloor classrooms={classrooms.slice(0, 3)} floor={1} />
            </group>
          )}

          {floor === 2 && (
            <group>
              {/* Second Floor - Classrooms 4-6 */}
              <ClassroomFloor classrooms={classrooms.slice(3, 6)} floor={2} />
            </group>
          )}
        </group>
      ))}

      {/* Rooftop Garden */}
      <mesh position={[0, 6.2, 0]} receiveShadow>
        <boxGeometry args={[25, 0.2, 18]} />
        <meshStandardMaterial color="#2e7d32" />
      </mesh>

      {/* Rooftop Solar Panels */}
      <group position={[0, 6.5, 0]}>
        {Array.from({ length: 12 }).map((_, i) => (
          <SolarPanel 
            key={i}
            position={[-10 + i * 1.8, 0, 0]} 
            rotation={[0, 0, 0]} 
          />
        ))}
      </group>

      {/* School Entrance */}
      <mesh position={[0, 2, 9.2]} castShadow>
        <boxGeometry args={[6, 4, 0.2]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>

      {/* School Label */}
      <Text
        position={[0, 8, 9.3]}
        fontSize={0.6}
        color="#1a237e"
        anchorX="center"
        anchorY="middle"
      >
        🏫 Green Valley School
      </Text>

      {/* School Information */}
      <Html position={[0, 13, 0]} transform>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '15px',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          minWidth: '300px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#1a237e' }}>🏫 Green Valley School</h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '10px',
            marginBottom: '12px'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div>📚 Total Classrooms: 6</div>
              <div>👨‍🏫 Active Classes: {classrooms.filter(c => c.active).length}</div>
              <div>👥 Total Students: {classrooms.reduce((sum, c) => sum + c.students, 0)}</div>
              <div>🏢 Offices: {offices.length}</div>
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <div>🌿 Vertical Gardens</div>
              <div>☀️ Solar Powered</div>
              <div>🏛️ Glass Architecture</div>
              <div>🌱 Rooftop Garden</div>
            </div>
          </div>

          <div style={{ 
            background: '#e8f5e8', 
            padding: '8px', 
            borderRadius: '6px',
            fontSize: '12px'
          }}>
            <div>✅ Eco-Friendly Design</div>
            <div>✅ Modern Classrooms</div>
            <div>✅ Sustainable Energy</div>
            <div>✅ Green Environment</div>
          </div>
        </div>
      </Html>

      {/* School Parking */}
      <SchoolParking position={[0, 0, -25]} />
    </group>
  )
}

/* ----- Vertical Garden Wall ----- */
function VerticalGardenWall({ width = 10, height = 8 }) {
  const plantsPerRow = Math.floor(width / 1.5)
  const rows = Math.floor(height / 1.2)

  return (
    <group>
      {/* Green wall structure */}
      <mesh receiveShadow>
        <boxGeometry args={[width, height, 0.3]} />
        <meshStandardMaterial color="#2e7d32" />
      </mesh>

      {/* Plants grid */}
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: plantsPerRow }).map((_, col) => {
          const x = -width/2 + (col + 0.5) * (width / plantsPerRow)
          const y = -height/2 + (row + 0.5) * (height / rows)
          
          return (
            <mesh key={`${row}-${col}`} position={[x, y, 0.2]} castShadow>
              <sphereGeometry args={[0.3, 6, 6]} />
              <meshStandardMaterial color={row % 2 === 0 ? "#4caf50" : "#388e3c"} />
            </mesh>
          )
        })
      )}
    </group>
  )
}

/* ----- Classroom Floor ----- */
function ClassroomFloor({ classrooms = [], floor = 1 }) {
  return (
    <group>
      {/* Corridor */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[20, 0.1, 4]} />
        <meshStandardMaterial color="#cfd8dc" />
      </mesh>

      {/* Classrooms on both sides */}
      {classrooms.map((classroom, index) => {
        const side = index % 2 === 0 ? 1 : -1
        const positionX = -7 + (Math.floor(index / 2)) * 7
        const positionZ = side * 6

        return (
          <Classroom
            key={classroom.id}
            position={[positionX, 0, positionZ]}
            classroom={classroom}
            floor={floor}
          />
        )
      })}
    </group>
  )
}

/* ----- Individual Classroom ----- */
function Classroom({ position = [0, 0, 0], classroom, floor }) {
  return (
    <group position={position}>
      {/* Classroom Structure */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[6, 3.5, 8]} />
        <meshStandardMaterial 
          color="#f5f5f5" 
          transparent 
          opacity={0.8}
        />
      </mesh>

      {/* Classroom Frame */}
      <mesh castShadow>
        <boxGeometry args={[6.1, 3.6, 8.1]} />
        <meshStandardMaterial color="#37474f" wireframe />
      </mesh>

      {/* Door */}
      <mesh position={[2.5, 1, 4.1]} castShadow>
        <boxGeometry args={[1, 2, 0.1]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>

      {/* Windows */}
      <mesh position={[-1.5, 1.5, 4.1]} castShadow>
        <boxGeometry args={[2, 1.5, 0.05]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
      </mesh>

      {/* Interior - Desks and Chairs */}
      <group position={[0, -1.2, -1]}>
        {/* Teacher's desk */}
        <mesh position={[0, 0.5, 2]} castShadow>
          <boxGeometry args={[1.5, 0.8, 0.8]} />
          <meshStandardMaterial color="#8d6e63" />
        </mesh>

        {/* Student desks in grid */}
        {Array.from({ length: Math.min(classroom.students, 20) }).map((_, i) => {
          const row = Math.floor(i / 4)
          const col = i % 4
          return (
            <group key={i} position={[-2 + col * 1.2, 0.3, -1 + row * 1.2]}>
              <mesh castShadow>
                <boxGeometry args={[0.8, 0.6, 0.8]} />
                <meshStandardMaterial color="#78909c" />
              </mesh>
              <mesh position={[0, 0.5, 0.4]} castShadow>
                <boxGeometry args={[0.8, 0.05, 0.1]} />
                <meshStandardMaterial color="#8d6e63" />
              </mesh>
            </group>
          )
        })}

        {/* Blackboard */}
        <mesh position={[0, 1.5, 3.8]} castShadow>
          <boxGeometry args={[3, 1.5, 0.1]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      </group>

      {/* Classroom Label */}
      <Text
        position={[0, 2.2, 4.2]}
        fontSize={0.15}
        color="#1a237e"
        anchorX="center"
        anchorY="middle"
      >
        {classroom.subject} - Floor {floor}
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
          {classroom.active ? '🟢 IN SESSION' : '🔴 NO CLASS'} - {classroom.students} students
        </div>
      </Html>
    </group>
  )
}

/* ----- Office Floor ----- */
function OfficeFloor({ offices = [] }) {
  return (
    <group>
      {/* Reception Area */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[8, 0.1, 6]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>

      {/* Reception Desk */}
      <mesh position={[0, 1, 2]} castShadow>
        <boxGeometry args={[4, 1, 1]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>

      {/* Offices on sides */}
      {offices.map((office, index) => {
        const positionX = -10 + index * 6.5
        return (
          <Office
            key={office.id}
            position={[positionX, 0, 0]}
            office={office}
          />
        )
      })}
    </group>
  )
}

/* ----- Individual Office ----- */
function Office({ position = [0, 0, 0], office }) {
  return (
    <group position={position}>
      {/* Office Structure */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[5, 3.5, 6]} />
        <meshStandardMaterial 
          color="#fafafa" 
          transparent 
          opacity={0.8}
        />
      </mesh>

      {/* Office Frame */}
      <mesh castShadow>
        <boxGeometry args={[5.1, 3.6, 6.1]} />
        <meshStandardMaterial color="#37474f" wireframe />
      </mesh>

      {/* Door */}
      <mesh position={[1.5, 1, 3.1]} castShadow>
        <boxGeometry args={[1, 2, 0.1]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>

      {/* Window */}
      <mesh position={[-1, 1.5, 3.1]} castShadow>
        <boxGeometry args={[2, 1.5, 0.05]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
      </mesh>

      {/* Interior */}
      <group position={[0, -1.2, -1]}>
        {/* Desk */}
        <mesh position={[0, 0.5, 1]} castShadow>
          <boxGeometry args={[1.5, 0.8, 0.8]} />
          <meshStandardMaterial color="#8d6e63" />
        </mesh>

        {/* Chair */}
        <mesh position={[0, 0.3, -0.5]} castShadow>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial color="#78909c" />
        </mesh>

        {/* Bookshelf */}
        <mesh position={[-1.5, 1, 1]} castShadow>
          <boxGeometry args={[0.3, 1.5, 1.5]} />
          <meshStandardMaterial color="#5d4037" />
        </mesh>
      </group>

      {/* Office Label */}
      <Text
        position={[0, 2.2, 3.2]}
        fontSize={0.15}
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
  const [parkedCars, setParkedCars] = useState(15)
  const parkingSpots = 30

  // Simulate random car movements
  useFrame(() => {
    if (Math.random() < 0.01) { // 1% chance per frame to change
      setParkedCars(prev => {
        const change = Math.random() < 0.5 ? 1 : -1
        return Math.max(5, Math.min(parkingSpots, prev + change))
      })
    }
  })

  return (
    <group position={position}>
      {/* Parking Lot Surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[35, 20]} />
        <meshStandardMaterial color="#546e7a" />
      </mesh>

      {/* Parking Grid Lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[34, 19]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>

      {/* Parking Spots */}
      {Array.from({ length: parkingSpots }).map((_, i) => {
        const row = Math.floor(i / 10)
        const col = i % 10
        const occupied = i < parkedCars
        const x = -15 + col * 3
        const z = -8 + row * 8

        return (
          <group key={i} position={[x, 0.1, z]}>
            {/* Parking Spot Markings */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2.5, 5} />
              <meshStandardMaterial color={occupied ? "#e57373" : "#81c784"} transparent opacity={0.5} />
            </mesh>

            {/* Parked Car */}
            {occupied && (
              <mesh position={[0, 0.3, 0]} castShadow>
                <boxGeometry args={[2, 0.4, 1]} />
                <meshStandardMaterial color={getRandomCarColor()} />
              </mesh>
            )}

            {/* Spot Number */}
            <Text
              position={[0, 0.2, 2.5]}
              fontSize={0.2}
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
        position={[0, 2, 0]}
        fontSize={0.5}
        color="#1a237e"
        anchorX="center"
        anchorY="middle"
      >
        🅿️ School Parking
      </Text>

      {/* Parking Information */}
      <Html position={[0, 4, 0]} transform>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          textAlign: 'center',
          minWidth: '200px'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#1a237e' }}>🅿️ School Parking</h4>
          <div>🚗 Available: {parkingSpots - parkedCars}</div>
          <div>🚙 Occupied: {parkedCars}</div>
          <div>📊 Capacity: {Math.round((parkedCars / parkingSpots) * 100)}% full</div>
          <div style={{ 
            marginTop: '6px', 
            padding: '4px', 
            background: '#e8f5e8', 
            borderRadius: '4px',
            fontSize: '11px'
          }}>
            Cars arrive/depart randomly
          </div>
        </div>
      </Html>
    </group>
  )
}

/* ----- Helper function for random car colors ----- */
function getRandomCarColor() {
  const colors = [
    "#ff4444", "#44ff44", "#4444ff", "#ffff44", 
    "#ff44ff", "#44ffff", "#ff8844", "#8844ff"
  ]
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
      {/* School Building */}
      <SchoolBuilding position={[-30, 0, -15]} />
      
      {/* Cultural Center */}
      <CulturalCenter position={[0, 0, 25]} />
      
      {/* Bus Station near Cultural Center */}
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
      
      {/* Enhanced Waste Management System */}
      <WasteManagementSystem position={[15, 0, 15]} />
      
      {/* Waste bins around town */}
      <WasteBin position={[-10, 0, 8]} id="bin1" />
      <WasteBin position={[12, 0, -5]} id="bin2" />
      <WasteBin position={[-5, 0, -12]} id="bin3" />
      <WasteBin position={[18, 0, 10]} id="bin4" />
      <WasteBin position={[-15, 0, -18]} id="bin5" />
      <WasteBin position={[5, 0, 20]} id="bin6" />
      
      {/* Walking people */}
      <Person position={[5, 0, 22]} color="#8b4513" speed={0.3} path={[
        [5, 0.5, 22], [3, 0.5, 24], [1, 0.5, 22], [3, 0.5, 20], [5, 0.5, 22]
      ]} />
      
      <Person position={[-3, 0, 27]} color="#2c3e50" speed={0.4} path={[
        [-3, 0.5, 27], [-5, 0.5, 25], [-7, 0.5, 27], [-5, 0.5, 29], [-3, 0.5, 27]
      ]} />
      
      <Person position={[8, 0, 28]} color="#8b4513" speed={0.2} path={[
        [8, 0.5, 28], [10, 0.5, 26], [12, 0.5, 28], [10, 0.5, 30], [8, 0.5, 28]
      ]} />

      {/* People walking on roads */}
      <Person position={[-10, 0, 5]} color="#8b4513" speed={0.3} path={[
        [-10, 0.5, 5], [-5, 0.5, 5], [0, 0.5, 5], [5, 0.5, 5], [10, 0.5, 5]
      ]} />
      
      <Person position={[5, 0, -10]} color="#2c3e50" speed={0.4} path={[
        [5, 0.5, -10], [5, 0.5, -5], [5, 0.5, 0], [5, 0.5, 5], [5, 0.5, 10]
      ]} />

      <Person position={[-20, 0, -15]} color="#8b4513" speed={0.2} path={[
        [-20, 0.5, -15], [-15, 0.5, -15], [-10, 0.5, -15], [-15, 0.5, -20], [-20, 0.5, -15]
      ]} />

      {/* Students walking to school */}
      <Person position={[-25, 0, -10]} color="#1a237e" speed={0.3} path={[
        [-25, 0.5, -10], [-28, 0.5, -12], [-30, 0.5, -14], [-32, 0.5, -16]
      ]} />
      
      <Person position={[-35, 0, -5]} color="#4a148c" speed={0.4} path={[
        [-35, 0.5, -5], [-33, 0.5, -8], [-31, 0.5, -11], [-30, 0.5, -14]
      ]} />
    </group>
  )
}

// ... (rest of the existing components remain the same - CameraController, CustomOrbitControls, Person, WheelchairUser, etc.)
// ... (all other existing components like VerticalFarm, CulturalCenter, RoadSystem, etc. remain unchanged)

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
    '🎪 Cultural Center': { x: 0, y: 15, z: 25, lookAt: { x: 0, y: 0, z: 25 } },
    '🏫 School': { x: -30, y: 10, z: -15, lookAt: { x: -30, y: 0, z: -15 } },
    '🅿️ School Parking': { x: -30, y: 8, z: -40, lookAt: { x: -30, y: 0, z: -40 } },
    '🚏 Bus Station': { x: 15, y: 10, z: 25, lookAt: { x: 15, y: 0, z: 25 } },
    '🗑️ Waste Management': { x: 15, y: 10, z: 15, lookAt: { x: 15, y: 0, z: 15 } },
    '🏢 Vertical Farm': { x: 30, y: 10, z: -10, lookAt: { x: 30, y: 0, z: -10 } },
    '🏠 Energy Society': { x: 0, y: 15, z: -28, lookAt: { x: 0, y: 0, z: -28 } },
    '🔵 Accessible Home': { x: 0, y: 8, z: -28, lookAt: { x: 0, y: 0, z: -28 } },
    '🛣️ Main Road': { x: 0, y: 8, z: 20, lookAt: { x: 0, y: 0, z: 0 } }
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

// ... (rest of the existing code remains the same - HUD, SettingsIcon, Ground, WindTurbine, SolarPanel, etc.)
// ... (all other components remain unchanged)

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
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
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
          🌟 Features: School • Cultural Center • Vertical Farming • Energy Society
        </div>
        <div style={{ fontSize: 11, color: '#1a237e', marginTop: 2, fontWeight: 'bold' }}>
          🏫 NEW: School with vertical gardens, glass architecture, classrooms & parking!
        </div>
        <div style={{ fontSize: 11, color: '#27ae60', marginTop: 2 }}>
          ⚙️ Click settings icon (top-right) for city controls
        </div>
      </div>
    </div>
  )
}
