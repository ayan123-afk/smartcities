import React, { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, useGLTF, ContactShadows, Sky, Text, Sparkles, Float, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { create } from 'zustand'

// Enhanced Zustand store for state management
const useStore = create((set) => ({
  // City state
  alert: null,
  setAlert: (alert) => set({ alert }),
  
  focus: null,
  setFocus: (focus) => set({ focus }),
  
  timeOfDay: 'day',
  setTimeOfDay: (time) => set({ timeOfDay: time }),
  
  trafficDensity: 'medium',
  setTrafficDensity: (density) => set({ trafficDensity: density }),
  
  streetLightsOn: false,
  setStreetLightsOn: (lights) => set({ streetLightsOn: lights }),
  
  // Enhanced School state
  schoolData: {
    students: 1250,
    teachers: 68,
    classes: 42,
    activities: ['Robotics', 'AI Lab', 'Sports', 'Arts', 'Music'],
    performance: 94,
    energyUsage: 'Solar Powered',
    status: 'Active'
  },
  setSchoolData: (data) => set({ schoolData: data }),
  
  // Waste management
  wasteBins: {},
  updateWasteBin: (id, level) => set((state) => ({ 
    wasteBins: { ...state.wasteBins, [id]: level } 
  })),
  
  alertWasteManagement: false,
  setAlertWasteManagement: (alert) => set({ alertWasteManagement: alert }),
  
  emergencyAlarm: false,
  setEmergencyAlarm: (alarm) => set({ emergencyAlarm: alarm }),
  
  // Enhanced features
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
  
  // Enhanced garden sensors
  gardenSensors: {
    soilMoisture: 65,
    temperature: 24,
    humidity: 45,
    waterLevel: 80,
    isWatering: false
  },
  setGardenSensors: (sensors) => set({ gardenSensors: sensors }),
  
  // Enhanced monitoring
  monitoringDrones: {
    active: true,
    wasteDetected: false,
    currentPosition: [0, 0, 0]
  },
  setMonitoringDrones: (drones) => set({ monitoringDrones: drones }),
  
  // Enhanced water plant
  waterPlant: {
    isProcessing: false,
    processTime: 0,
    waterQuality: 95,
    filteredWater: 0,
    efficiency: 85
  },
  setWaterPlant: (plant) => set({ waterPlant: plant }),
  
  // School-specific enhancements
  schoolEvents: [
    { id: 1, name: 'Science Fair', date: '2024-03-15', participants: 120 },
    { id: 2, name: 'Sports Day', date: '2024-04-10', participants: 450 },
    { id: 3, name: 'AI Workshop', date: '2024-05-20', participants: 80 }
  ],
  setSchoolEvents: (events) => set({ schoolEvents: events }),
  
  // Enhanced UI state
  activeBuilding: null,
  setActiveBuilding: (building) => set({ activeBuilding: building }),
  
  weather: 'sunny',
  setWeather: (weather) => set({ weather: weather }),
  
  // Power management
  powerGrid: {
    solar: 85,
    wind: 45,
    total: 130,
    consumption: 95
  },
  setPowerGrid: (grid) => set({ powerGrid: grid })
}))

/* ===== ENHANCED SCHOOL BUILDING ===== */
function EnhancedSchool({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)
  const timeOfDay = useStore((s) => s.timeOfDay)
  const schoolData = useStore((s) => s.schoolData)
  const setActiveBuilding = useStore((s) => s.setActiveBuilding)
  
  const [studentsMoving, setStudentsMoving] = useState(true)
  const [lightsOn, setLightsOn] = useState(false)

  // Auto light control based on time
  useEffect(() => {
    setLightsOn(timeOfDay === 'night')
  }, [timeOfDay])

  const handleClick = () => {
    setFocus({
      x: position[0],
      y: 15,
      z: position[2],
      lookAt: { x: position[0], y: 0, z: position[2] }
    })
    setActiveBuilding('school')
  }

  // Student component for animation
  function Student({ position = [0, 0, 0], color = "#3498db", speed = 1, path = [] }) {
    const studentRef = useRef()
    const [t, setT] = useState(Math.random() * 10)

    useFrame((_, dt) => {
      if (!studentsMoving) return
      
      setT(prev => prev + dt * speed)
      
      if (studentRef.current && path.length > 0) {
        const tt = t % path.length
        const i = Math.floor(tt) % path.length
        const a = new THREE.Vector3(...path[i])
        const b = new THREE.Vector3(...path[(i + 1) % path.length])
        const f = tt % 1
        const pos = a.clone().lerp(b, f)
        
        studentRef.current.position.lerp(pos, 0.1)
        if (b) studentRef.current.lookAt(b)
      }
    })

    return (
      <group ref={studentRef} position={position}>
        <mesh castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.6, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        
        <mesh position={[0, 0.5, 0]} castShadow>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
        
        {/* Backpack */}
        <mesh position={[0, 0.2, -0.1]} castShadow>
          <boxGeometry args={[0.2, 0.3, 0.1]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
      </group>
    )
  }

  // School bus component
  function SchoolBus({ position = [0, 0, 0] }) {
    const busRef = useRef()
    const [t, setT] = useState(0)

    useFrame((_, dt) => {
      setT(prev => prev + dt * 0.2)
      if (busRef.current) {
        busRef.current.position.x = position[0] + Math.sin(t) * 10
      }
    })

    return (
      <group ref={busRef} position={position}>
        <mesh castShadow>
          <boxGeometry args={[2.5, 1.2, 1.2]} />
          <meshStandardMaterial color="#FFD700" metalness={0.3} roughness={0.4} />
        </mesh>

        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[2.4, 0.5, 1.1]} />
          <meshStandardMaterial color="#2c3e50" transparent opacity={0.7} />
        </mesh>

        <Text
          position={[0, 0.8, 0.61]}
          fontSize={0.15}
          color="#e74c3c"
          anchorX="center"
          anchorY="middle"
        >
          SCHOOL BUS
        </Text>
      </group>
    )
  }

  return (
    <group position={position}>
      {/* Main School Building - Modern Design */}
      <mesh 
        castShadow 
        receiveShadow 
        onClick={handleClick}
      >
        <boxGeometry args={[25, 12, 18]} />
        <meshStandardMaterial 
          color="#3498db" 
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Enhanced School Windows with Dynamic Lighting */}
      {Array.from({ length: 4 }).map((_, floor) =>
        Array.from({ length: 8 }).map((_, window) => (
          <group key={`${floor}-${window}`}>
            <mesh
              position={[-11.5, -4 + floor * 3, -8 + window * 2.2]}
              castShadow
            >
              <boxGeometry args={[0.1, 1.8, 1.8]} />
              <meshStandardMaterial 
                color={lightsOn ? "#ffffcc" : "#87CEEB"} 
                transparent 
                opacity={lightsOn ? 0.9 : 0.8}
                emissive={lightsOn ? "#ffff99" : "#000000"}
                emissiveIntensity={lightsOn ? 0.7 : 0}
              />
            </mesh>
          </group>
        ))
      )}

      {/* School Entrance with Modern Design */}
      <mesh position={[0, -2, 9.1]} castShadow receiveShadow>
        <boxGeometry args={[8, 5, 0.2]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* School Name Sign */}
      <Text
        position={[0, 4, 9.2]}
        fontSize={0.8}
        color="#e74c3c"
        anchorX="center"
        anchorY="middle"
      >
        BRIGHT FUTURE ACADEMY
      </Text>

      {/* Solar Panels on Roof */}
      <group position={[0, 6.5, 0]}>
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[-10 + i * 4, 0.3, -7]} castShadow>
            <boxGeometry args={[3, 0.05, 2]} />
            <meshStandardMaterial color="#1e3a8a" metalness={0.9} roughness={0.05} />
          </mesh>
        ))}
      </group>

      {/* Playground Area */}
      <mesh position={[18, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 15]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>

      {/* Playground Equipment */}
      <group position={[18, 0, 0]}>
        {/* Basketball Court */}
        <mesh position={[0, 0.1, 5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[6, 8]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        
        {/* Basketball Hoop */}
        <mesh position={[0, 3, 9]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        
        <mesh position={[0, 4.5, 9]} castShadow>
          <boxGeometry args={[1.5, 0.1, 0.8]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>

        {/* Swings */}
        <mesh position={[4, 2, -4]} castShadow>
          <boxGeometry args={[4, 0.1, 0.1]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        
        {[-1.5, 1.5].map((x, i) => (
          <group key={i} position={[x, 1, -4]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
              <meshStandardMaterial color="#8b4513" />
            </mesh>
            
            <mesh position={[0, -0.8, 0]} castShadow>
              <boxGeometry args={[0.3, 0.05, 0.8]} />
              <meshStandardMaterial color="#3498db" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Students */}
      <Student 
        position={[5, 0.5, 5]} 
        color="#3498db" 
        speed={0.3} 
        path={[
          [5, 0.5, 5], [3, 0.5, 3], [1, 0.5, 5], [3, 0.5, 7], [5, 0.5, 5]
        ]} 
      />
      
      <Student 
        position={[-3, 0.5, 2]} 
        color="#e74c3c" 
        speed={0.4} 
        path={[
          [-3, 0.5, 2], [-5, 0.5, 4], [-7, 0.5, 2], [-5, 0.5, 0], [-3, 0.5, 2]
        ]} 
      />

      {/* School Bus */}
      <SchoolBus position={[15, 0.5, -10]} />

      {/* Enhanced School Info Panel */}
      <Html position={[0, 16, 0]} transform>
        <div style={{
          background: 'rgba(255,255,255,0.97)',
          padding: '25px',
          borderRadius: '20px',
          boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
          minWidth: '380px',
          textAlign: 'center',
          color: '#2c3e50',
          border: '3px solid #3498db',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            color: '#3498db', 
            fontSize: '24px',
            fontWeight: '700',
            textShadow: '1px 1px 3px rgba(0,0,0,0.1)'
          }}>
            🏫 Bright Future Academy
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div style={infoItemStyle}>👨‍🎓 Students: <strong>{schoolData.students}</strong></div>
              <div style={infoItemStyle}>👩‍🏫 Teachers: <strong>{schoolData.teachers}</strong></div>
              <div style={infoItemStyle}>🏫 Classes: <strong>{schoolData.classes}</strong></div>
              <div style={infoItemStyle}>📊 Performance: <strong>{schoolData.performance}%</strong></div>
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <div style={infoItemStyle}>⚡ Energy: <strong>{schoolData.energyUsage}</strong></div>
              <div style={infoItemStyle}>🔧 Status: <strong>{schoolData.status}</strong></div>
              <div style={infoItemStyle}>🌞 Time: <strong>{timeOfDay.toUpperCase()}</strong></div>
              <div style={infoItemStyle}>💡 Lights: <strong>{lightsOn ? 'ON' : 'OFF'}</strong></div>
            </div>
          </div>

          {/* Activities Section */}
          <div style={{ 
            background: 'linear-gradient(135deg, #3498db, #2980b9)',
            padding: '15px',
            borderRadius: '12px',
            marginBottom: '15px',
            color: 'white'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'white' }}>🎯 School Activities</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {schoolData.activities.map((activity, index) => (
                <span key={index} style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '5px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}>
                  {activity}
                </span>
              ))}
            </div>
          </div>

          {/* Control Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button 
              onClick={() => setStudentsMoving(!studentsMoving)}
              style={{
                background: studentsMoving ? '#e74c3c' : '#27ae60',
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '8px',
                cursor: 'pointer',
                flex: 1,
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              {studentsMoving ? '❌ Stop Students' : '▶️ Start Students'}
            </button>
            
            <button 
              onClick={() => setLightsOn(!lightsOn)}
              style={{
                background: lightsOn ? '#f39c12' : '#2c3e50',
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '8px',
                cursor: 'pointer',
                flex: 1,
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              {lightsOn ? '💡 Lights ON' : '🌙 Lights OFF'}
            </button>
          </div>

          {/* Stats Grid */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            background: 'rgba(52, 152, 219, 0.1)',
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid rgba(52, 152, 219, 0.2)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3498db' }}>🎓</div>
              <div style={{ fontSize: '11px', color: '#2c3e50' }}>Education</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e74c3c' }}>🔬</div>
              <div style={{ fontSize: '11px', color: '#2c3e50' }}>Science</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#27ae60' }}>🏆</div>
              <div style={{ fontSize: '11px', color: '#2c3e50' }}>Sports</div>
            </div>
          </div>
        </div>
      </Html>

      {/* Floating school logo */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text
          position={[0, 8, 0]}
          fontSize={1.2}
          color="#e74c3c"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          🏫
        </Text>
      </Float>
    </group>
  )
}

// Enhanced info item style
const infoItemStyle = {
  padding: '6px 0',
  borderBottom: '1px solid rgba(52, 152, 219, 0.1)',
  fontSize: '14px',
  display: 'flex',
  justifyContent: 'space-between'
}

/* ===== ENHANCED SMART CITY COMPONENTS ===== */

// Enhanced Building Component
function EnhancedBuilding({ 
  position = [0, 0, 0], 
  height = 8, 
  color = "#a67c52", 
  name = "Building",
  hasTurbine = false,
  hasSolar = true,
  windows = true,
  type = "residential"
}) {
  const setFocus = useStore((s) => s.setFocus)
  const timeOfDay = useStore((s) => s.timeOfDay)
  const setActiveBuilding = useStore((s) => s.setActiveBuilding)

  const handleClick = () => {
    setFocus({
      x: position[0],
      y: position[1] + height/2,
      z: position[2],
      lookAt: { x: position[0], y: position[1], z: position[2] }
    })
    setActiveBuilding(name)
  }

  const getBuildingColor = () => {
    const colors = {
      residential: "#a67c52",
      commercial: "#3498db",
      industrial: "#7f8c8d",
      hospital: "#e74c3c",
      school: "#3498db"
    }
    return colors[type] || color
  }

  return (
    <group position={position}>
      <mesh castShadow receiveShadow onClick={handleClick}>
        <boxGeometry args={[3, height, 3]} />
        <meshStandardMaterial color={getBuildingColor()} roughness={0.8} metalness={0.1} />
      </mesh>
      
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
                    color={timeOfDay === 'night' ? "#ffffcc" : "#87CEEB"} 
                    transparent 
                    opacity={timeOfDay === 'night' ? 0.9 : 0.7}
                    emissive={timeOfDay === 'night' ? "#ffff99" : "#000000"}
                    emissiveIntensity={timeOfDay === 'night' ? 0.5 : 0}
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
      
      <mesh position={[0, height/2 + 0.2, 0]} castShadow>
        <boxGeometry args={[3.2, 0.4, 3.2]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {hasSolar && (
        <group position={[0, height/2 + 0.3, 0]}>
          <SolarPanel position={[0, 0, 0]} rotation={[0, 0, 0]} />
        </group>
      )}

      {hasTurbine && (
        <WindTurbine position={[0, height/2, 0]} />
      )}

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

// Solar Panel Component
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

// Wind Turbine Component
function WindTurbine({ position = [0, 0, 0] }) {
  const turbineRef = useRef()
  
  useFrame(() => {
    if (turbineRef.current) {
      turbineRef.current.rotation.y += 0.05
    }
  })

  return (
    <group position={position} scale={[0.7, 0.7, 0.7]}>
      <mesh position={[0, 5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 8, 8]} />
        <meshStandardMaterial color="#708090" />
      </mesh>
      
      <group ref={turbineRef} position={[0, 8, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        
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

// Enhanced Street Light System
function StreetLight({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const timeOfDay = useStore((s) => s.timeOfDay)
  const streetLightsOn = useStore((s) => s.streetLightsOn)
  
  const isOn = streetLightsOn || timeOfDay === 'night'

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 3, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 6, 8]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      
      <mesh position={[0, 6, 0.5]} castShadow>
        <boxGeometry args={[0.4, 0.2, 0.6]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      
      <mesh position={[0, 6, 0.8]} castShadow>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial 
          color={isOn ? "#ffffcc" : "#666666"}
          emissive={isOn ? "#ffff99" : "#000000"}
          emissiveIntensity={isOn ? 1 : 0}
        />
      </mesh>
      
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

// Street Light System
function StreetLightSystem() {
  const lightPositions = [
    ...Array.from({ length: 16 }).map((_, i) => [-35 + i * 5, 0, 0]),
    ...Array.from({ length: 16 }).map((_, i) => [0, 0, -35 + i * 5]),
    ...Array.from({ length: 12 }).map((_, i) => [-25 + i * 5, 0, -20]),
    ...Array.from({ length: 10 }).map((_, i) => [-15 + i * 5, 0, 30]),
  ]

  return (
    <group>
      {lightPositions.map((pos, index) => (
        <StreetLight key={index} position={pos} />
      ))}
    </group>
  )
}

// Enhanced Road System
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
    </group>
  )
}

// Enhanced Ground Component
function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color={"#d2b48c"} roughness={0.9} metalness={0.1} />
      </mesh>
      
      <RoadSystem />
      
      <StreetLightSystem />
      
      <gridHelper args={[200, 200, '#8b7355', '#8b7355']} position={[0, 0.01, 0]} />
      <ContactShadows position={[0, -0.03, 0]} opacity={0.3} width={50} blur={2} far={20} />
    </>
  )
}

// Enhanced Camera Controller
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

// Enhanced Orbit Controls
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
      maxDistance={100}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
      panSpeed={0.5}
      screenSpacePanning={true}
    />
  )
}

// Enhanced HUD Component
function HUD() {
  const alert = useStore((s) => s.alert)
  const timeOfDay = useStore((s) => s.timeOfDay)
  const alertWasteManagement = useStore((s) => s.alertWasteManagement)
  const emergencyAlarm = useStore((s) => s.emergencyAlarm)
  const activeBuilding = useStore((s) => s.activeBuilding)
  
  const alertStyles = {
    info: { background: 'linear-gradient(135deg, #d2691e, #8b4513)', color: 'white' },
    emergency: { background: 'linear-gradient(135deg, #e74c3c, #c0392b)', color: 'white' },
    success: { background: 'linear-gradient(135deg, #27ae60, #229954)', color: 'white' }
  }

  return (
    <div style={{ position: 'absolute', left: 12, top: 12, zIndex: 50 }}>
      {emergencyAlarm ? (
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
          🏙️ Smart City • Time: {timeOfDay} • Active: {activeBuilding || 'None'}
        </div>
      )}
    </div>
  )
}

// Enhanced Control Panel
function ControlPanel() {
  const setTimeOfDay = useStore((s) => s.setTimeOfDay)
  const setTrafficDensity = useStore((s) => s.setTrafficDensity)
  const setStreetLightsOn = useStore((s) => s.setStreetLightsOn)
  const setFocus = useStore((s) => s.setFocus)
  const timeOfDay = useStore((s) => s.timeOfDay)
  const showCityControl = useStore((s) => s.showCityControl)
  const setShowCityControl = useStore((s) => s.setShowCityControl)
  const schoolData = useStore((s) => s.schoolData)

  // Auto light control based on time
  useEffect(() => {
    if (timeOfDay === 'night') {
      setStreetLightsOn(true)
    }
  }, [timeOfDay, setStreetLightsOn])

  const locations = {
    '🏫 Enhanced School': { x: -25, y: 15, z: 15, lookAt: { x: -25, y: 0, z: 15 } },
    '🏢 Business District': { x: 20, y: 10, z: -15, lookAt: { x: 20, y: 0, z: -15 } },
    '🏠 Residential Area': { x: -15, y: 8, z: -25, lookAt: { x: -15, y: 0, z: -25 } },
    '🌳 Central Park': { x: 0, y: 5, z: 0, lookAt: { x: 0, y: 0, z: 0 } }
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
      minWidth: '220px',
      maxWidth: '240px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, color: '#8b4513', fontSize: '16px' }}>Smart City Controls</h3>
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
      
      {/* School Quick Stats */}
      <div style={{ 
        background: 'rgba(52, 152, 219, 0.1)', 
        padding: '8px', 
        borderRadius: '6px',
        marginBottom: '10px',
        border: '1px solid #3498db'
      }}>
        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#3498db', marginBottom: '4px' }}>
          🏫 School Status
        </div>
        <div style={{ fontSize: '10px' }}>
          <div>Students: {schoolData.students}</div>
          <div>Performance: {schoolData.performance}%</div>
          <div>Status: {schoolData.status}</div>
        </div>
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
          Quick Navigation:
        </label>
        <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
          {Object.entries(locations).map(([name, pos]) => (
            <button 
              key={name}
              onClick={() => setFocus(pos)}
              style={{ 
                width: '100%', 
                background: name.includes('School') ? '#3498db' : 
                           name.includes('Business') ? '#2c3e50' :
                           name.includes('Residential') ? '#a67c52' : '#27ae60', 
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

// Settings Icon Component
function SettingsIcon() {
  const setShowCityControl = useStore((s) => s.setShowCityControl)
  const showCityControl = useStore((s) => s.showCityControl)

  return (
    <div 
      style={{
        position: 'absolute',
        right: 20,
        top: 20,
        zIndex: 100,
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        fontSize: '24px',
        transition: 'all 0.3s ease',
        transform: showCityControl ? 'rotate(90deg)' : 'rotate(0deg)'
      }}
      onClick={() => setShowCityControl(!showCityControl)}
    >
      ⚙️
    </div>
  )
}

// Enhanced City Layout
function CityLayout() {
  const buildings = [
    // Residential buildings
    { position: [-15, 0, -25], height: 6, name: "Residence A", type: "residential" },
    { position: [-20, 0, -28], height: 8, name: "Residence B", type: "residential" },
    { position: [-10, 0, -22], height: 7, name: "Residence C", type: "residential" },
    
    // Commercial buildings
    { position: [15, 0, -18], height: 12, name: "Office A", type: "commercial" },
    { position: [20, 0, -22], height: 10, name: "Office B", type: "commercial" },
    { position: [25, 0, -15], height: 14, name: "Office C", type: "commercial" },
    
    // Industrial buildings
    { position: [30, 0, 25], height: 8, name: "Factory A", type: "industrial" },
    { position: [35, 0, 20], height: 10, name: "Factory B", type: "industrial" },
  ]

  return (
    <group>
      {/* Enhanced School */}
      <EnhancedSchool position={[-25, 0, 15]} />
      
      {/* Regular buildings */}
      {buildings.map((building, index) => (
        <EnhancedBuilding
          key={index}
          position={building.position}
          height={building.height}
          name={building.name}
          type={building.type}
          hasSolar={true}
          windows={true}
        />
      ))}
      
      {/* Central Park */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[15, 32]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>
      
      {/* Park trees */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 12
        return (
          <group key={i} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
            <mesh position={[0, 2, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.4, 4, 8]} />
              <meshStandardMaterial color="#8b4513" />
            </mesh>
            <mesh position={[0, 5, 0]} castShadow>
              <coneGeometry args={[2, 4, 8]} />
              <meshStandardMaterial color="#27ae60" />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

// Enhanced Main App Component
export default function SmartCityApp() {
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
      
      <Canvas shadows camera={{ position: [40, 25, 40], fov: 50 }}>
        <color attach="background" args={['#87CEEB']} />
        <ambientLight intensity={timeOfDay === 'night' ? 0.3 : 0.6} />
        <directionalLight 
          position={timeOfDay === 'night' ? [-10, 10, 10] : [10, 20, 10]} 
          intensity={timeOfDay === 'night' ? 0.5 : 1.0}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
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
          🏫 Enhanced School with students, activities, and real-time data
        </div>
        <div style={{ fontSize: 11, color: '#3498db', marginTop: 2, fontWeight: 'bold' }}>
          🌟 NEW: Dynamic lighting, solar panels, and interactive controls!
        </div>
      </div>
    </div>
  )
}
