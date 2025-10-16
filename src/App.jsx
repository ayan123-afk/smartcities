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
  setCollectedWaste: (waste) => set({ collectedWaste: waste }),
  gardenSensors: {
    soilMoisture: 65,
    temperature: 24,
    humidity: 45,
    waterLevel: 80,
    isWatering: false
  },
  setGardenSensors: (sensors) => set({ gardenSensors: sensors }),
  monitoringDrones: {
    active: true,
    wasteDetected: false,
    currentPosition: [0, 0, 0]
  },
  setMonitoringDrones: (drones) => set({ monitoringDrones: drones }),
  // Water Plant State
  waterPlant: {
    isProcessing: false,
    processTime: 0,
    waterQuality: 95,
    filteredWater: 0,
    efficiency: 85
  },
  setWaterPlant: (plant) => set({ waterPlant: plant })
}))

/* ----- ENHANCED STREET LIGHTS ----- */
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

/* ----- ENHANCED STREET LIGHT SYSTEM ----- */
function StreetLightSystem() {
  const lightPositions = [
    // Main roads
    ...Array.from({ length: 20 }).map((_, i) => [-50 + i * 5, 0, 0]),
    ...Array.from({ length: 20 }).map((_, i) => [0, 0, -50 + i * 5]),
    ...Array.from({ length: 16 }).map((_, i) => [-40 + i * 5, 0, -25]),
    ...Array.from({ length: 16 }).map((_, i) => [-40 + i * 5, 0, 25]),
    ...Array.from({ length: 16 }).map((_, i) => [-25, 0, -40 + i * 5]),
    ...Array.from({ length: 16 }).map((_, i) => [25, 0, -40 + i * 5]),
    
    // District lighting
    [15, 0, 15], [-15, 0, 15], [0, 0, 0], [-8, 0, -2], [8, 0, -6],
    [10, 0, 25], [-10, 0, 25], [0, 0, 20],
    [-30, 0, 15], [30, 0, -15], [-25, 0, 25], [25, 0, -25],
    [-20, 0, -30], [20, 0, 30], [-10, 0, -25], [10, 0, 25],
    
    // New areas
    [-35, 0, -35], [35, 0, 35], [-35, 0, 35], [35, 0, -35],
    [0, 0, -45], [0, 0, 45], [-45, 0, 0], [45, 0, 0]
  ]

  return (
    <group>
      {lightPositions.map((pos, index) => (
        <StreetLight key={index} position={pos} />
      ))}
    </group>
  )
}

/* ----- ENHANCED BUILDING WITH NIGHT LIGHTS ----- */
function EnhancedBuilding({ 
  position = [0, 0, 0], 
  height = 8, 
  color = "#a67c52", 
  name = "Building",
  hasTurbine = false,
  hasSolar = true,
  windows = true
}) {
  const setFocus = useStore((s) => s.setFocus)
  const timeOfDay = useStore((s) => s.timeOfDay)

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
      <mesh castShadow receiveShadow onClick={handleClick}>
        <boxGeometry args={[3, height, 3]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
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
          <SolarPanel position={[1.8, 0, 0]} rotation={[0, Math.PI/4, 0]} />
          <SolarPanel position={[-1.8, 0, 0]} rotation={[0, -Math.PI/4, 0]} />
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

/* ----- ENHANCED WATER FILTERING PLANT ----- */
function WaterFilteringPlant({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)
  const waterPlant = useStore((s) => s.waterPlant)
  const setWaterPlant = useStore((s) => s.setWaterPlant)
  const timeOfDay = useStore((s) => s.timeOfDay)
  const [waterParticles, setWaterParticles] = useState([])
  const [filterActive, setFilterActive] = useState(false)

  // Water processing simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setWaterPlant(prev => {
        const shouldProcess = Math.random() > 0.7 && !prev.isProcessing
        const isProcessing = shouldProcess ? true : (prev.isProcessing && prev.processTime < 2)
        
        const newProcessTime = isProcessing ? prev.processTime + 0.5 : 0
        const newFilteredWater = isProcessing ? prev.filteredWater + 10 : prev.filteredWater
        const newWaterQuality = Math.max(80, Math.min(99, prev.waterQuality + (Math.random() - 0.5) * 5))
        
        if (isProcessing && !filterActive) {
          setFilterActive(true)
        } else if (!isProcessing && filterActive) {
          setFilterActive(false)
        }

        if (newProcessTime >= 2) {
          return {
            isProcessing: false,
            processTime: 0,
            waterQuality: newWaterQuality,
            filteredWater: newFilteredWater,
            efficiency: Math.max(75, Math.min(95, prev.efficiency + (Math.random() - 0.5) * 3))
          }
        }

        return {
          ...prev,
          isProcessing,
          processTime: newProcessTime,
          waterQuality: newWaterQuality,
          filteredWater: newFilteredWater
        }
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [setWaterPlant, filterActive])

  // Water particle effects
  useFrame((_, dt) => {
    if (filterActive && Math.random() < 0.3) {
      setWaterParticles(prev => [
        ...prev.slice(-10),
        { 
          id: Math.random(), 
          position: [Math.random() * 6 - 3, 8, Math.random() * 4 - 2],
          progress: 0,
          speed: 0.5 + Math.random() * 0.5
        }
      ])
    }

    setWaterParticles(prev => 
      prev.map(p => ({ 
        ...p, 
        progress: p.progress + dt * p.speed,
        position: [p.position[0], p.position[1] - dt * 2, p.position[2]]
      })).filter(p => p.progress < 3)
    )
  })

  function WaterParticle({ position, progress }) {
    return (
      <mesh position={position} castShadow>
        <sphereGeometry args={[0.05, 4, 4]} />
        <meshStandardMaterial 
          color="#3498db" 
          transparent 
          opacity={1 - progress/3}
          emissive="#3498db"
          emissiveIntensity={0.3}
        />
      </mesh>
    )
  }

  function FilterTank({ position = [0, 0, 0], waterLevel = 0.7, isActive = false, label = "" }) {
    return (
      <group position={position}>
        <mesh castShadow>
          <cylinderGeometry args={[1, 1, 3, 16]} />
          <meshStandardMaterial color="#34495e" transparent opacity={0.8} />
        </mesh>
        
        <mesh position={[0, (waterLevel * 2.8) - 1.4, 0]} castShadow>
          <cylinderGeometry args={[0.95, 0.95, waterLevel * 2.7, 16]} />
          <meshStandardMaterial 
            color={isActive ? "#3498db" : "#2980b9"} 
            transparent 
            opacity={0.7}
            emissive={isActive ? "#3498db" : "#2980b9"}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        <mesh position={[0, 1.6, 0]} castShadow>
          <cylinderGeometry args={[1.05, 1.05, 0.1, 16]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>

        <Text
          position={[0, 2, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>

        {isActive && (
          <pointLight 
            position={[0, 1, 0]} 
            color="#3498db"
            intensity={0.5}
            distance={3}
          />
        )}
      </group>
    )
  }

  function ProcessingPipe({ start, end, isActive = false }) {
    const pipeRef = useRef()
    const [particles, setParticles] = useState([])

    useFrame((_, dt) => {
      if (isActive && Math.random() < 0.4) {
        setParticles(prev => [
          ...prev.slice(-5),
          { id: Math.random(), progress: 0 }
        ])
      }

      setParticles(prev => 
        prev.map(p => ({ ...p, progress: p.progress + dt * 2 }))
          .filter(p => p.progress < 1)
      )
    })

    const direction = new THREE.Vector3().subVectors(end, start).normalize()
    const length = new THREE.Vector3().subVectors(end, start).length()

    return (
      <group>
        <mesh ref={pipeRef} position={start}>
          <cylinderGeometry args={[0.1, 0.1, length, 8]} />
          <meshStandardMaterial 
            color={isActive ? "#3498db" : "#7f8c8d"}
            emissive={isActive ? "#3498db" : "#000000"}
            emissiveIntensity={0.3}
          />
        </mesh>

        {particles.map(particle => {
          const particlePos = new THREE.Vector3().lerpVectors(start, end, particle.progress)
          return (
            <mesh key={particle.id} position={particlePos} castShadow>
              <sphereGeometry args={[0.06, 4, 4]} />
              <meshStandardMaterial 
                color="#3498db" 
                transparent 
                opacity={1 - particle.progress}
                emissive="#3498db"
                emissiveIntensity={0.5}
              />
            </mesh>
          )
        })}
      </group>
    )
  }

  return (
    <group position={position}>
      {/* Main Building */}
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
        <boxGeometry args={[12, 6, 8]} />
        <meshStandardMaterial color="#3498db" roughness={0.6} />
      </mesh>

      {/* Enhanced Windows with Night Lighting */}
      {Array.from({ length: 3 }).map((_, floor) =>
        Array.from({ length: 4 }).map((_, window) => (
          <mesh
            key={`${floor}-${window}`}
            position={[-5, -2 + floor * 2, -3.9 + window * 2]}
            castShadow
          >
            <boxGeometry args={[0.1, 1.2, 1.5]} />
            <meshStandardMaterial 
              color={timeOfDay === 'night' ? "#ffffcc" : "#87CEEB"} 
              transparent 
              opacity={timeOfDay === 'night' ? 0.9 : 0.7}
              emissive={timeOfDay === 'night' ? "#ffff99" : "#000000"}
              emissiveIntensity={timeOfDay === 'night' ? 0.5 : 0}
            />
          </mesh>
        ))
      )}

      {/* Roof */}
      <mesh position={[0, 3.5, 0]} castShadow>
        <boxGeometry args={[12.2, 0.3, 8.2]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* Filter Tanks */}
      <FilterTank 
        position={[-3, 0, -2]} 
        waterLevel={0.8}
        isActive={waterPlant.isProcessing}
        label="INTAKE"
      />
      
      <FilterTank 
        position={[0, 0, 0]} 
        waterLevel={0.6}
        isActive={waterPlant.isProcessing}
        label="FILTER"
      />
      
      <FilterTank 
        position={[3, 0, 2]} 
        waterLevel={0.9}
        isActive={waterPlant.isProcessing}
        label="CLEAN"
      />

      {/* Processing Pipes */}
      <ProcessingPipe 
        start={[-3, 1, -2]}
        end={[0, 1, 0]}
        isActive={waterPlant.isProcessing}
      />
      
      <ProcessingPipe 
        start={[0, 1, 0]}
        end={[3, 1, 2]}
        isActive={waterPlant.isProcessing}
      />

      {/* Control Room */}
      <mesh position={[0, 2, -3.9]} castShadow>
        <boxGeometry args={[4, 2, 0.2]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {[0, 1].map(i => (
        <mesh key={i} position={[-1 + i * 2, 2, -3.89]} castShadow>
          <planeGeometry args={[0.8, 0.6]} />
          <meshStandardMaterial 
            color={waterPlant.isProcessing ? "#00ff00" : "#ff4444"} 
            emissive={waterPlant.isProcessing ? "#00ff00" : "#ff4444"}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {/* Water Particles */}
      {waterParticles.map(particle => (
        <WaterParticle
          key={particle.id}
          position={particle.position}
          progress={particle.progress}
        />
      ))}

      {/* Chimney/Smokestack */}
      <mesh position={[4, 4, -2]} castShadow>
        <cylinderGeometry args={[0.4, 0.5, 4, 8]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>

      {waterPlant.isProcessing && (
        <mesh position={[4, 6.5, -2]} castShadow>
          <sphereGeometry args={[0.8, 8, 8]} />
          <meshStandardMaterial 
            color="#ecf0f1" 
            transparent 
            opacity={0.6}
            emissive="#ecf0f1"
            emissiveIntensity={0.3}
          />
        </mesh>
      )}

      <Text
        position={[0, 4, 0]}
        fontSize={0.4}
        color="#3498db"
        anchorX="center"
        anchorY="middle"
      >
        💧 Water Plant
      </Text>

      <Html position={[0, 8, 0]} transform>
        <div style={{
          background: 'rgba(52, 152, 219, 0.95)',
          padding: '15px',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          minWidth: '300px',
          textAlign: 'center',
          color: 'white',
          border: '2px solid #2980b9'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: 'white' }}>💧 Advanced Water Filtering Plant</h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '10px',
            marginBottom: '12px'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div>🔧 Status: <strong>{waterPlant.isProcessing ? 'PROCESSING' : 'STANDBY'}</strong></div>
              <div>💧 Quality: <strong>{Math.round(waterPlant.waterQuality)}%</strong></div>
              <div>📈 Efficiency: <strong>{Math.round(waterPlant.efficiency)}%</strong></div>
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <div>⏱️ Process: <strong>{Math.min(2, waterPlant.processTime).toFixed(1)}/2s</strong></div>
              <div>💦 Filtered: <strong>{waterPlant.filteredWater}L</strong></div>
              <div>🎯 Performance: <strong>{waterPlant.waterQuality > 90 ? 'EXCELLENT' : 'GOOD'}</strong></div>
            </div>
          </div>

          {waterPlant.isProcessing && (
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              padding: '8px', 
              borderRadius: '6px',
              marginBottom: '10px',
              animation: 'pulse 1s infinite'
            }}>
              <div style={{ fontWeight: 'bold', color: '#00ff00' }}>
                🔄 FILTERING WATER... {Math.round((waterPlant.processTime / 2) * 100)}%
              </div>
            </div>
          )}

          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '8px', 
            borderRadius: '6px',
            fontSize: '12px'
          }}>
            <div><strong>🏭 Process Stages:</strong></div>
            <div>1. Intake → 2. Filtration → 3. Purification</div>
            <div>✅ Multi-stage filtering • ✅ Quality monitoring • ✅ Automated operation</div>
          </div>
        </div>
      </Html>

      {/* Workers */}
      <Person position={[2, 0, -1]} color="#2c3e50" speed={0.2} path={[
        [2, 0.5, -1], [1, 0.5, 0], [0, 0.5, 1], [-1, 0.5, 0], [-2, 0.5, -1]
      ]} />
      
      <group position={[-2, 0.5, 3]}>
        <mesh position={[0, 0.9, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.8, 8]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
        <Text position={[0, 1.5, 0]} fontSize={0.2} color="white" anchorX="center">
          👨‍🔧
        </Text>
      </group>
    </group>
  )
}

/* ----- ENHANCED VERTICAL GARDEN BUILDING ----- */
function VerticalGardenBuilding({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)
  const gardenSensors = useStore((s) => s.gardenSensors)
  const setGardenSensors = useStore((s) => s.setGardenSensors)
  const timeOfDay = useStore((s) => s.timeOfDay)
  
  const [sensorData, setSensorData] = useState({
    soilMoisture: 65,
    temperature: 24,
    humidity: 45,
    waterLevel: 80,
    isWatering: false
  })

  const plantTypes = [
    { name: "🍋 Lemon", color: "#ffd700", height: 0.8, waterNeed: 70 },
    { name: "🍎 Apple", color: "#ff4444", height: 1.2, waterNeed: 65 },
    { name: "🍅 Tomato", color: "#ff6b6b", height: 0.6, waterNeed: 75 },
    { name: "🥕 Carrot", color: "#ff8c00", height: 0.4, waterNeed: 60 },
    { name: "🥬 Lettuce", color: "#90ee90", height: 0.3, waterNeed: 80 },
    { name: "🍓 Strawberry", color: "#ff69b4", height: 0.2, waterNeed: 70 },
    { name: "🌶️ Chili", color: "#ff0000", height: 0.5, waterNeed: 55 },
    { name: "🍇 Grapes", color: "#9370db", height: 1.0, waterNeed: 60 }
  ]

  // Simulate sensor data changes and automatic watering
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prev => {
        const newMoisture = Math.max(20, Math.min(95, prev.soilMoisture - 0.5 + (Math.random() - 0.3)))
        const newTemp = Math.max(18, Math.min(32, prev.temperature + (Math.random() - 0.5)))
        const newHumidity = Math.max(30, Math.min(80, prev.humidity + (Math.random() - 0.4)))
        
        // Auto watering logic
        const shouldWater = newMoisture < 40 && prev.waterLevel > 10 && !prev.isWatering
        const isWatering = shouldWater ? true : (prev.isWatering && prev.waterLevel > 5)
        
        const newWaterLevel = isWatering ? 
          Math.max(0, prev.waterLevel - 0.8) : 
          Math.min(100, prev.waterLevel + 0.1) // Slow refill from rainwater
        
        const newMoistureAfterWatering = isWatering ? 
          Math.min(95, newMoisture + 2) : newMoisture

        const updatedData = {
          soilMoisture: newMoistureAfterWatering,
          temperature: newTemp,
          humidity: newHumidity,
          waterLevel: newWaterLevel,
          isWatering: isWatering
        }

        setGardenSensors(updatedData)
        return updatedData
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [setGardenSensors])

  /* ----- SENSOR COMPONENTS ----- */
  function SoilMoistureSensor({ position = [0, 0, 0], moistureLevel = 65 }) {
    return (
      <group position={position}>
        <mesh castShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.3, 8]} />
          <meshStandardMaterial color={moistureLevel > 60 ? "#27ae60" : moistureLevel > 30 ? "#f39c12" : "#e74c3c"} />
        </mesh>
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.15, 0.05, 0.15]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        <pointLight 
          position={[0, 0.25, 0]} 
          color={moistureLevel > 60 ? "#00ff00" : moistureLevel > 30 ? "#ffff00" : "#ff0000"}
          intensity={0.5}
          distance={0.5}
        />
      </group>
    )
  }

  function TemperatureSensor({ position = [0, 0, 0], temperature = 24 }) {
    const color = temperature > 28 ? "#e74c3c" : temperature > 22 ? "#f39c12" : "#3498db"
    
    return (
      <group position={position}>
        <mesh castShadow>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <pointLight 
          position={[0, 0, 0]} 
          color={color}
          intensity={0.3}
          distance={0.3}
        />
      </group>
    )
  }

  function WaterFlowSensor({ position = [0, 0, 0], isActive = false }) {
    const [flowParticles, setFlowParticles] = useState([])
    
    useEffect(() => {
      if (isActive) {
        const interval = setInterval(() => {
          setFlowParticles(prev => [
            ...prev.slice(-3),
            { id: Math.random(), progress: 0 }
          ])
        }, 300)
        return () => clearInterval(interval)
      }
    }, [isActive])

    useFrame((_, dt) => {
      setFlowParticles(prev => 
        prev.map(p => ({ ...p, progress: p.progress + dt * 2 }))
          .filter(p => p.progress < 1)
      )
    })

    return (
      <group position={position}>
        <mesh castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
          <meshStandardMaterial color={isActive ? "#3498db" : "#95a5a6"} />
        </mesh>
        
        {flowParticles.map(particle => (
          <mesh key={particle.id} position={[0, -0.2 + particle.progress * 0.4, 0]} castShadow>
            <sphereGeometry args={[0.03, 4, 4]} />
            <meshStandardMaterial color="#3498db" transparent opacity={1 - particle.progress} />
          </mesh>
        ))}
      </group>
    )
  }

  function WaterTank({ position = [0, 0, 0], waterLevel = 80 }) {
    return (
      <group position={position}>
        <mesh castShadow>
          <cylinderGeometry args={[0.6, 0.6, 1.5, 16]} />
          <meshStandardMaterial color="#34495e" transparent opacity={0.8} />
        </mesh>
        
        <mesh position={[0, (waterLevel/100 * 1.5) - 0.75, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.55, waterLevel/100 * 1.4, 16]} />
          <meshStandardMaterial color="#3498db" transparent opacity={0.7} />
        </mesh>
        
        <mesh position={[0, 0.76, 0]} castShadow>
          <cylinderGeometry args={[0.62, 0.62, 0.05, 16]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        
        <Text
          position={[0, 0, 0.7]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {Math.round(waterLevel)}%
        </Text>
      </group>
    )
  }

  return (
    <group position={position}>
      <mesh 
        castShadow 
        receiveShadow 
        onClick={() => setFocus({
          x: position[0],
          y: 12,
          z: position[2],
          lookAt: { x: position[0], y: 0, z: position[2] }
        })}
      >
        <boxGeometry args={[8, 20, 8]} />
        <meshStandardMaterial color="#8b4513" roughness={0.7} />
      </mesh>

      {/* Enhanced Windows with Night Lighting */}
      {Array.from({ length: 4 }).map((_, floor) =>
        Array.from({ length: 3 }).map((_, window) => (
          <mesh
            key={`${floor}-${window}`}
            position={[4.01, -8 + floor * 4, -3 + window * 2]}
            castShadow
          >
            <boxGeometry args={[0.02, 2.5, 1.5]} />
            <meshStandardMaterial 
              color={timeOfDay === 'night' ? "#ffffcc" : "#87CEEB"} 
              transparent 
              opacity={timeOfDay === 'night' ? 0.9 : 0.7}
              emissive={timeOfDay === 'night' ? "#ffff99" : "#000000"}
              emissiveIntensity={timeOfDay === 'night' ? 0.5 : 0}
            />
          </mesh>
        ))
      )}

      {[0, 1, 2, 3].map((side) => {
        const angle = (side / 4) * Math.PI * 2
        const offsetX = Math.cos(angle) * 4.1
        const offsetZ = Math.sin(angle) * 4.1
        const rotationY = angle + Math.PI

        return (
          <group key={side} position={[offsetX, 0, offsetZ]} rotation={[0, rotationY, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.2, 18, 7.8]} />
              <meshStandardMaterial color="#27ae60" />
            </mesh>

            {Array.from({ length: 6 }).map((_, level) => (
              <group key={level} position={[0.11, -7 + level * 3, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[0.1, 0.1, 7.6]} />
                  <meshStandardMaterial color="#8b4513" />
                </mesh>

                {Array.from({ length: 8 }).map((_, plantIndex) => {
                  const plant = plantTypes[(level * 8 + plantIndex) % plantTypes.length]
                  const plantX = -3.5 + plantIndex * 1
                  const plantHealth = sensorData.soilMoisture > plant.waterNeed - 10 ? "healthy" : "needsWater"
                  
                  return (
                    <group key={plantIndex} position={[0, 0.2, plantX]}>
                      {/* Soil Moisture Sensor for each plant row */}
                      {plantIndex === 0 && (
                        <SoilMoistureSensor 
                          position={[0.15, -0.1, plantX]} 
                          moistureLevel={sensorData.soilMoisture}
                        />
                      )}
                      
                      {/* Water Flow Pipe */}
                      {plantIndex === 4 && (
                        <WaterFlowSensor 
                          position={[0.1, 0, plantX]}
                          isActive={sensorData.isWatering}
                        />
                      )}

                      <mesh castShadow>
                        <cylinderGeometry args={[0.05, 0.05, plant.height, 8]} />
                        <meshStandardMaterial 
                          color={plantHealth === "healthy" ? "#228b22" : "#e74c3c"} 
                        />
                      </mesh>
                      
                      <mesh position={[0, plant.height/2 + 0.1, 0]} castShadow>
                        <sphereGeometry args={[0.15, 8, 8]} />
                        <meshStandardMaterial color={plant.color} />
                      </mesh>
                      
                      <mesh position={[0, plant.height/2, 0.1]} castShadow rotation={[Math.PI/4, 0, 0]}>
                        <boxGeometry args={[0.2, 0.3, 0.02]} />
                        <meshStandardMaterial color={plantHealth === "healthy" ? "#32cd32" : "#ff6b6b"} />
                      </mesh>

                      {/* Water droplets when watering */}
                      {sensorData.isWatering && plantHealth === "needsWater" && (
                        <mesh position={[0, 0.1, 0]} castShadow>
                          <sphereGeometry args={[0.03, 4, 4]} />
                          <meshStandardMaterial color="#3498db" transparent opacity={0.7} />
                        </mesh>
                      )}
                    </group>
                  )
                })}
              </group>
            ))}

            {/* Temperature Sensors on each side */}
            <TemperatureSensor 
              position={[0.08, 5, 3]}
              temperature={sensorData.temperature}
            />
            <TemperatureSensor 
              position={[0.08, 10, -3]}
              temperature={sensorData.temperature}
            />

            <mesh position={[0.05, 0, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 18, 8]} />
              <meshStandardMaterial color="#3498db" />
            </mesh>

            {Array.from({ length: 6 }).map((_, level) => (
              <mesh key={level} position={[0.08, -8 + level * 3, 3.5]} castShadow>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial color="#2980b9" />
              </mesh>
            ))}
          </group>
        )
      })}

      {/* Water Tank System */}
      <group position={[0, 2, 0]}>
        <WaterTank waterLevel={sensorData.waterLevel} />
        
        {/* Main Water Pipe */}
        <mesh position={[0, 1, 2.5]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 5, 8]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
        
        {/* Water Pump */}
        <mesh position={[0, 1, 4]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.4, 16]} />
          <meshStandardMaterial color={sensorData.isWatering ? "#e74c3c" : "#95a5a6"} />
        </mesh>
        
        {/* Pump Indicator Light */}
        <pointLight 
          position={[0, 1.3, 4]} 
          color={sensorData.isWatering ? "#00ff00" : "#ff0000"}
          intensity={0.5}
          distance={1}
        />
      </group>

      <group position={[0, 10.5, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[8.2, 0.2, 8.2]} />
          <meshStandardMaterial color="#27ae60" />
        </mesh>

        {[-2, 0, 2].map((x) =>
          [-2, 0, 2].map((z) => (
            <group key={`${x}-${z}`} position={[x, 0.3, z]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.8, 0.8, 0.4, 16]} />
                <meshStandardMaterial color="#8b4513" />
              </mesh>
              
              <mesh position={[0, 0.25, 0]} castShadow>
                <cylinderGeometry args={[0.75, 0.75, 0.3, 16]} />
                <meshStandardMaterial color="#a67c52" />
              </mesh>

              <mesh position={[0, 1.2, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
                <meshStandardMaterial color="#228b22" />
              </mesh>
              
              <mesh position={[0, 2.5, 0]} castShadow>
                <sphereGeometry args={[0.8, 8, 8]} />
                <meshStandardMaterial color={plantTypes[(x + z + 4) % plantTypes.length].color} />
              </mesh>
            </group>
          ))
        )}

        <SolarPanel position={[3, 0.3, 3]} rotation={[0, Math.PI/4, 0]} />
        <SolarPanel position={[-3, 0.3, 3]} rotation={[0, -Math.PI/4, 0]} />
        <SolarPanel position={[3, 0.3, -3]} rotation={[0, 3*Math.PI/4, 0]} />
        <SolarPanel position={[-3, 0.3, -3]} rotation={[0, -3*Math.PI/4, 0]} />
      </group>

      <group position={[0, 12, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[1.5, 1.2, 2, 16]} />
          <meshStandardMaterial color="#3498db" transparent opacity={0.8} />
        </mesh>
        
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[1.6, 1.6, 0.2, 16]} />
          <meshStandardMaterial color="#2980b9" />
        </mesh>

        <mesh position={[1.5, 0, 0]} rotation={[0, 0, Math.PI/2]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
          <meshStandardMaterial color="#34495e" />
        </mesh>
      </group>

      <Text
        position={[0, 11, 0]}
        fontSize={0.5}
        color="#27ae60"
        anchorX="center"
        anchorY="middle"
      >
        🏢 Smart Vertical Garden
      </Text>

      <Html position={[0, 15, 0]} transform>
        <div style={{
          background: 'rgba(39, 174, 96, 0.95)',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          minWidth: '350px',
          textAlign: 'center',
          color: 'white',
          border: '2px solid #229954'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: 'white', fontSize: '18px' }}>
            🌿 Smart Vertical Garden Building
          </h3>
          
          {/* Real-time Sensor Data */}
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '15px', 
            borderRadius: '10px',
            marginBottom: '15px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'white' }}>📊 Real-time Sensor Data</h4>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '10px',
              marginBottom: '10px'
            }}>
              <div style={{ textAlign: 'left' }}>
                <div>🌱 Soil Moisture: <strong>{Math.round(sensorData.soilMoisture)}%</strong></div>
                <div style={{ 
                  background: 'rgba(255,255,255,0.3)', 
                  height: '8px', 
                  borderRadius: '4px',
                  marginTop: '2px'
                }}>
                  <div style={{ 
                    width: `${sensorData.soilMoisture}%`, 
                    height: '100%', 
                    background: sensorData.soilMoisture > 60 ? '#27ae60' : sensorData.soilMoisture > 30 ? '#f39c12' : '#e74c3c',
                    borderRadius: '4px',
                    transition: 'all 0.3s ease'
                  }}></div>
                </div>
              </div>
              
              <div style={{ textAlign: 'left' }}>
                <div>🌡️ Temperature: <strong>{Math.round(sensorData.temperature)}°C</strong></div>
                <div style={{ 
                  background: 'rgba(255,255,255,0.3)', 
                  height: '8px', 
                  borderRadius: '4px',
                  marginTop: '2px'
                }}>
                  <div style={{ 
                    width: `${(sensorData.temperature - 18) / 14 * 100}%`, 
                    height: '100%', 
                    background: sensorData.temperature > 28 ? '#e74c3c' : sensorData.temperature > 22 ? '#f39c12' : '#3498db',
                    borderRadius: '4px',
                    transition: 'all 0.3s ease'
                  }}></div>
                </div>
              </div>
              
              <div style={{ textAlign: 'left' }}>
                <div>💧 Water Tank: <strong>{Math.round(sensorData.waterLevel)}%</strong></div>
                <div style={{ 
                  background: 'rgba(255,255,255,0.3)', 
                  height: '8px', 
                  borderRadius: '4px',
                  marginTop: '2px'
                }}>
                  <div style={{ 
                    width: `${sensorData.waterLevel}%`, 
                    height: '100%', 
                    background: sensorData.waterLevel > 30 ? '#3498db' : '#e74c3c',
                    borderRadius: '4px',
                    transition: 'all 0.3s ease'
                  }}></div>
                </div>
              </div>
              
              <div style={{ textAlign: 'left' }}>
                <div>💨 Humidity: <strong>{Math.round(sensorData.humidity)}%</strong></div>
                <div style={{ 
                  background: 'rgba(255,255,255,0.3)', 
                  height: '8px', 
                  borderRadius: '4px',
                  marginTop: '2px'
                }}>
                  <div style={{ 
                    width: `${sensorData.humidity}%`, 
                    height: '100%', 
                    background: '#9b59b6',
                    borderRadius: '4px',
                    transition: 'all 0.3s ease'
                  }}></div>
                </div>
              </div>
            </div>

            {/* Auto Watering Status */}
            <div style={{ 
              background: sensorData.isWatering ? 'rgba(46, 204, 113, 0.3)' : 'rgba(52, 152, 219, 0.3)',
              padding: '8px',
              borderRadius: '6px',
              border: `1px solid ${sensorData.isWatering ? '#27ae60' : '#3498db'}`,
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {sensorData.isWatering ? '💧 AUTO WATERING ACTIVE' : '⏸️ AUTO WATERING STANDBY'}
              {sensorData.isWatering && (
                <div style={{ fontSize: '10px', fontWeight: 'normal', marginTop: '4px' }}>
                  Watering plants due to low soil moisture
                </div>
              )}
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '10px',
            marginBottom: '15px'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div>🍋 Lemons: 32 plants</div>
              <div>🍎 Apples: 28 plants</div>
              <div>🍅 Tomatoes: 45 plants</div>
              <div>🥕 Carrots: 38 plants</div>
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <div>🥬 Lettuce: 52 plants</div>
              <div>🍓 Strawberries: 40 plants</div>
              <div>🌶️ Chilies: 36 plants</div>
              <div>🍇 Grapes: 24 plants</div>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(34, 153, 84, 0.3)', 
            padding: '12px', 
            borderRadius: '8px',
            fontSize: '12px',
            border: '1px solid #229954'
          }}>
            <div><strong>🌱 Smart Features:</strong></div>
            <div>✅ IoT Soil Moisture Sensors</div>
            <div>✅ Automated Watering System</div>
            <div>✅ Real-time Monitoring</div>
            <div>✅ Rainwater Harvesting</div>
            <div>✅ Solar Powered</div>
            <div>✅ Climate Control</div>
          </div>

          <div style={{ 
            marginTop: '10px',
            background: 'rgba(255,255,255,0.2)', 
            padding: '8px', 
            borderRadius: '6px',
            fontSize: '11px'
          }}>
            <div><strong>📊 Production Stats:</strong></div>
            <div>Daily Yield: ~50kg fresh produce</div>
            <div>Water Savings: 85% vs traditional farming</div>
            <div>Energy: 100% solar powered</div>
            <div>Automation: 95% processes automated</div>
          </div>
        </div>
      </Html>

      <Person position={[2, 0, 3]} color="#8b4513" speed={0.2} path={[
        [2, 0.5, 3], [1, 0.5, 2], [0, 0.5, 1], [-1, 0.5, 2], [-2, 0.5, 3]
      ]} />
      
      <Person position={[-3, 0, -2]} color="#2c3e50" speed={0.3} path={[
        [-3, 0.5, -2], [-2, 0.5, -1], [-1, 0.5, -2], [-2, 0.5, -3], [-3, 0.5, -2]
      ]} />

      <group position={[4.2, 5, 0]}>
        <mesh position={[0, 1, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.8, 8]} />
          <meshStandardMaterial color="#ff6b6b" />
        </mesh>
        <Text position={[0, 1.5, 0]} fontSize={0.2} color="white" anchorX="center">
          👨‍🌾
        </Text>
      </group>

      <group position={[-4.2, 8, 0]}>
        <mesh position={[0, 1, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.8, 8]} />
          <meshStandardMaterial color="#4ecdc4" />
        </mesh>
        <Text position={[0, 1.5, 0]} fontSize={0.2} color="white" anchorX="center">
          👩‍🌾
        </Text>
      </group>
    </group>
  )
}

/* ----- ENHANCED MODERN SMART HOSPITAL ----- */
function ModernHospital({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)
  const timeOfDay = useStore((s) => s.timeOfDay)
  const [emergencyLights, setEmergencyLights] = useState(false)
  
  // Emergency lights animation
  useFrame(({ clock }) => {
    setEmergencyLights(Math.sin(clock.getElapsedTime() * 5) > 0)
  })

  return (
    <group position={position}>
      {/* Main Hospital Building - Modern Glass and Steel */}
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
        <boxGeometry args={[25, 16, 18]} />
        <meshStandardMaterial 
          color="#ffffff" 
          roughness={0.2} 
          metalness={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Building Frame Structure */}
      <group>
        {/* Vertical Frames */}
        {[-10, -5, 0, 5, 10].map((x) => (
          <mesh key={`vertical-${x}`} position={[x, 0, 0]} castShadow>
            <boxGeometry args={[0.3, 16, 18.2]} />
            <meshStandardMaterial color="#2c3e50" metalness={0.7} />
          </mesh>
        ))}
        
        {/* Horizontal Frames */}
        {[-6, 0, 6].map((y) => (
          <mesh key={`horizontal-${y}`} position={[0, y, 0]} castShadow>
            <boxGeometry args={[25.2, 0.3, 18.2]} />
            <meshStandardMaterial color="#2c3e50" metalness={0.7} />
          </mesh>
        ))}
      </group>

      {/* Enhanced Hospital Windows with Smart Lighting */}
      {Array.from({ length: 5 }).map((_, floor) =>
        Array.from({ length: 8 }).map((_, window) => (
          <group key={`${floor}-${window}`}>
            <mesh
              position={[-11.01, -6 + floor * 3, -7.5 + window * 2]}
              castShadow
            >
              <boxGeometry args={[0.1, 2, 1.5]} />
              <meshStandardMaterial 
                color={timeOfDay === 'night' ? "#00ff00" : "#87CEEB"} 
                transparent 
                opacity={timeOfDay === 'night' ? 0.9 : 0.8}
                emissive={timeOfDay === 'night' ? "#00ff00" : "#000000"}
                emissiveIntensity={timeOfDay === 'night' ? 0.7 : 0}
              />
            </mesh>
            <mesh
              position={[11.01, -6 + floor * 3, -7.5 + window * 2]}
              castShadow
            >
              <boxGeometry args={[0.1, 2, 1.5]} />
              <meshStandardMaterial 
                color={timeOfDay === 'night' ? "#00ff00" : "#87CEEB"} 
                transparent 
                opacity={timeOfDay === 'night' ? 0.9 : 0.8}
                emissive={timeOfDay === 'night' ? "#00ff00" : "#000000"}
                emissiveIntensity={timeOfDay === 'night' ? 0.7 : 0}
              />
            </mesh>
          </group>
        ))
      )}

      {/* Main Entrance - Modern Design */}
      <group position={[0, -4, 9.1]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[8, 6, 0.2]} />
          <meshStandardMaterial color="#3498db" metalness={0.6} />
        </mesh>
        
        {/* Automatic Glass Doors */}
        <mesh position={[-2, 0, 0.11]} castShadow>
          <boxGeometry args={[1.5, 4, 0.05]} />
          <meshStandardMaterial color="#ecf0f1" transparent opacity={0.8} />
        </mesh>
        <mesh position={[2, 0, 0.11]} castShadow>
          <boxGeometry args={[1.5, 4, 0.05]} />
          <meshStandardMaterial color="#ecf0f1" transparent opacity={0.8} />
        </mesh>

      {/* Emergency Entrance with Red Accents */}
      <group position={[-8, -4, 9.1]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[5, 4, 0.2]} />
          <meshStandardMaterial color={emergencyLights ? "#e74c3c" : "#c0392b"} />
        </mesh>
        
        <Text
          position={[0, 1.5, 0.11]}
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          🚨 EMERGENCY
        </Text>
      </group>

      {/* Helipad on Roof with Rotating Light */}
      <group position={[0, 8.5, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[4, 4, 0.3, 32]} />
          <meshStandardMaterial color="#34495e" metalness={0.7} />
        </mesh>

        <mesh position={[0, 0.16, 0]} castShadow>
          <ringGeometry args={[3, 3.5, 32]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>

        <Text
          position={[0, 0.2, 0]}
          fontSize={0.6}
          color="#e74c3c"
          anchorX="center"
          anchorY="middle"
        >
          🚁
        </Text>

        {/* Rotating Emergency Light */}
        <mesh position={[0, 2, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.5, 16]} />
          <meshStandardMaterial 
            color={emergencyLights ? "#e74c3c" : "#ff4444"}
            emissive={emergencyLights ? "#e74c3c" : "#ff4444"}
            emissiveIntensity={1}
          />
        </mesh>
      </group>

      {/* Medical Wing Extensions */}
      <group position={[15, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[8, 12, 12]} />
          <meshStandardMaterial color="#ecf0f1" roughness={0.3} metalness={0.6} />
        </mesh>
        
        {/* Medical Wing Windows */}
        {Array.from({ length: 4 }).map((_, floor) =>
          Array.from({ length: 4 }).map((_, window) => (
            <mesh
              key={`wing-${floor}-${window}`}
              position={[4.01, -4 + floor * 2.5, -4.5 + window * 3]}
              castShadow
            >
              <boxGeometry args={[0.1, 1.8, 2]} />
              <meshStandardMaterial 
                color={timeOfDay === 'night' ? "#ffffcc" : "#87CEEB"} 
                transparent 
                opacity={0.8}
                emissive={timeOfDay === 'night' ? "#ffff99" : "#000000"}
                emissiveIntensity={timeOfDay === 'night' ? 0.5 : 0}
              />
            </mesh>
          ))
        )}
      </group>

      {/* Solar Panels on Roof */}
      <group position={[0, 8.8, 0]}>
        <SolarPanel position={[-8, 0, -6]} rotation={[0, Math.PI/4, 0]} />
        <SolarPanel position={[-4, 0, -6]} rotation={[0, 0, 0]} />
        <SolarPanel position={[0, 0, -6]} rotation={[0, -Math.PI/4, 0]} />
        <SolarPanel position={[4, 0, -6]} rotation={[0, Math.PI/4, 0]} />
        <SolarPanel position={[8, 0, -6]} rotation={[0, 0, 0]} />
      </group>

      {/* Red Cross Symbol - Modern Design */}
      <group position={[0, 4, 9.2]}>
        <mesh rotation={[0, 0, 0]} castShadow>
          <boxGeometry args={[6, 1, 0.1]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        <mesh rotation={[0, 0, Math.PI/2]} castShadow>
          <boxGeometry args={[6, 1, 0.1]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
      </group>

      {/* Wheelchair Ramp - Modern Design */}
      <group position={[0, -1, 6]}>
        {[0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((y, i) => (
          <mesh key={i} position={[0, y, -i * 0.4]} castShadow receiveShadow>
            <boxGeometry args={[8, 0.1, 0.4]} />
            <meshStandardMaterial color="#7f8c8d" metalness={0.3} />
          </mesh>
        ))}
        
        {/* Modern Handrails */}
        <mesh position={[4.2, 0.5, -1.2]} castShadow>
          <boxGeometry args={[0.1, 1, 2.8]} />
          <meshStandardMaterial color="#3498db" metalness={0.7} />
        </mesh>
        <mesh position={[-4.2, 0.5, -1.2]} castShadow>
          <boxGeometry args={[0.1, 1, 2.8]} />
          <meshStandardMaterial color="#3498db" metalness={0.7} />
        </mesh>
      </group>

      {/* Smart Ambulance */}
      <group position={[-12, 0.8, 8]}>
        <mesh castShadow>
          <boxGeometry args={[4, 1.5, 2]} />
          <meshStandardMaterial color="#e74c3c" metalness={0.4} roughness={0.3} />
        </mesh>
        
        <mesh position={[0.8, 1, 0]} castShadow>
          <boxGeometry args={[2, 1, 1.8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        {/* Emergency Lights */}
        <mesh position={[0, 1.8, 0]} castShadow>
          <boxGeometry args={[0.8, 0.2, 1]} />
          <meshStandardMaterial 
            color={emergencyLights ? "#ff4444" : "#e74c3c"}
            emissive={emergencyLights ? "#ff4444" : "#e74c3c"}
            emissiveIntensity={1}
          />
        </mesh>

        <Text
          position={[0, 1.5, 0]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          SMART AMBULANCE
        </Text>

        {[-1.2, 1.2].map((x, i) => (
          <group key={i} position={[x, -0.4, 0]}>
            <mesh castShadow rotation={[0, 0, Math.PI/2]}>
              <cylinderGeometry args={[0.3, 0.3, 0.25, 16]} />
              <meshStandardMaterial color="#2c3e50" metalness={0.8} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Patients and Medical Staff */}
      <WheelchairUser position={[3, 0, 5]} moving={true} />
      
      <group position={[-2, 0.8, 6]}>
        <mesh position={[0, 1, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 1, 8]} />
          <meshStandardMaterial color="#ffffff" metalness={0.3} />
        </mesh>
        
        <mesh position={[0, 1.6, 0]} castShadow>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
        
        <Text position={[0, 2, 0]} fontSize={0.3} color="white" anchorX="center">
          👨‍⚕️
        </Text>
        
        {/* Medical Tablet */}
        <mesh position={[0.4, 1.2, 0]} castShadow>
          <boxGeometry args={[0.3, 0.4, 0.05]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
      </group>

      {/* Medical Drone */}
      <group position={[5, 4, 8]}>
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.1, 0.6]} />
          <meshStandardMaterial color="#2c3e50" metalness={0.8} />
        </mesh>
        
        <mesh position={[0, 0.1, 0]} castShadow>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        
        <Text position={[0, 0.3, 0]} fontSize={0.2} color="white" anchorX="center">
          🚁
        </Text>
        
        <pointLight 
          position={[0, -0.2, 0]} 
          color="#00ff00"
          intensity={0.5}
          distance={3}
        />
      </group>

      <Html position={[0, 20, 0]} transform>
        <div style={{
          background: 'linear-gradient(135deg, #3498db, #2c3e50)',
          padding: '25px',
          borderRadius: '20px',
          boxShadow: '0 12px 35px rgba(0,0,0,0.4)',
          minWidth: '380px',
          textAlign: 'center',
          color: 'white',
          border: '3px solid #e74c3c',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            color: 'white', 
            fontSize: '22px',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            🏥 Smart City Hospital
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ marginRight: '8px' }}>🚑</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Emergency Services</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>24/7 Available</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ marginRight: '8px' }}>👨‍⚕️</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Medical Staff</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>200+ Professionals</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ marginRight: '8px' }}>🛏️</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Smart Beds</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>500 IoT Enabled</div>
                </div>
              </div>
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ marginRight: '8px' }}>💊</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Pharmacy</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>Automated Dispensing</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ marginRight: '8px' }}>🧬</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Research</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>AI Diagnostics</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ marginRight: '8px' }}>🚁</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Helipad</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>Drone Medical Delivery</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '15px', 
            borderRadius: '12px',
            marginBottom: '15px',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: 'white', fontSize: '16px' }}>🏗️ Smart Facilities</h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '8px',
              fontSize: '12px'
            }}>
              <div>✅ AI Emergency Center</div>
              <div>✅ Robotic Surgery</div>
              <div>✅ Pediatric Care</div>
              <div>✅ Cardiology Unit</div>
              <div>✅ Rehabilitation</div>
              <div>✅ Telemedicine</div>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(231, 76, 60, 0.3)', 
            padding: '12px', 
            borderRadius: '10px',
            fontSize: '13px',
            border: '1px solid #e74c3c'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>♿ Accessibility Features</div>
            <div style={{ fontSize: '11px', opacity: 0.9 }}>
              Smart Wheelchair Ramps • Automatic Doors • Accessible Restrooms • 
              Elevators • Braille Signage • Hearing Assistance • AI Navigation
            </div>
          </div>

          {/* Real-time Status */}
          <div style={{ 
            marginTop: '15px',
            padding: '10px',
            background: 'rgba(46, 204, 113, 0.2)',
            borderRadius: '8px',
            border: '1px solid #27ae60'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>📊 REAL-TIME STATUS</div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '11px',
              marginTop: '5px'
            }}>
              <span>🟢 Operational: 98%</span>
              <span>⚡ Power: Solar</span>
              <span>🏥 Beds: 65%</span>
            </div>
          </div>
        </div>
      </Html>

      <Text
        position={[0, 10, 0]}
        fontSize={0.8}
        color="#3498db"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        🏥 SMART HOSPITAL
      </Text>

      {/* Green Energy Indicator */}
      <group position={[0, 12, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.2, 16]} />
          <meshStandardMaterial color="#27ae60" />
        </mesh>
        <Text
          position={[0, 0.2, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          ☀️
        </Text>
      </group>
    </group>
  )
}

/* ----- ENHANCED MODERN GLASS SCHOOL ----- */
function InclusiveGlassSchool({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)
  const timeOfDay = useStore((s) => s.timeOfDay)
  const [schoolLights, setSchoolLights] = useState(false)
  
  // School lights animation
  useFrame(({ clock }) => {
    setSchoolLights(Math.sin(clock.getElapsedTime() * 3) > 0)
  })

  return (
    <group position={position}>
      {/* Main School Building - Modern Glass Architecture */}
      <mesh 
        castShadow 
        receiveShadow 
        onClick={() => setFocus({
          x: position[0],
          y: 12,
          z: position[2],
          lookAt: { x: position[0], y: 0, z: position[2] }
        })}
      >
        <boxGeometry args={[22, 10, 15]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.4}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Enhanced Modern Frame Structure */}
      <group>
        {/* Vertical Frames - Blue Accent */}
        {[-9, -4.5, 0, 4.5, 9].map((x) => (
          <mesh key={`vertical-${x}`} position={[x, 0, 0]} castShadow>
            <boxGeometry args={[0.4, 10, 15.2]} />
            <meshStandardMaterial color="#3498db" metalness={0.8} />
          </mesh>
        ))}
        
        {/* Horizontal Frames */}
        {[-3.5, 0, 3.5].map((y) => (
          <mesh key={`horizontal-${y}`} position={[0, y, 0]} castShadow>
            <boxGeometry args={[22.2, 0.4, 15.2]} />
            <meshStandardMaterial color="#3498db" metalness={0.8} />
          </mesh>
        ))}

        {/* Enhanced Interior Lighting for Night */}
        {timeOfDay === 'night' && (
          <>
            {Array.from({ length: 3 }).map((_, floor) =>
              Array.from({ length: 8 }).map((_, window) => (
                <pointLight
                  key={`${floor}-${window}`}
                  position={[-9 + window * 2.5, -3 + floor * 3, 7.6]}
                  intensity={0.4}
                  distance={4}
                  color="#ffffcc"
                />
              ))
            )}
          </>
        )}
      </group>

      {/* Colorful Accent Walls */}
      <group>
        {/* Blue Accent Wall */}
        <mesh position={[0, 0, -7.6]} castShadow>
          <boxGeometry args={[22, 10, 0.4]} />
          <meshStandardMaterial color="#3498db" metalness={0.6} />
        </mesh>
        
        {/* Green Accent Strips */}
        {[-8, 8].map((x) => (
          <mesh key={x} position={[x, 3, -7.5]} castShadow>
            <boxGeometry args={[0.3, 6, 0.2]} />
            <meshStandardMaterial color="#27ae60" metalness={0.7} />
          </mesh>
        ))}
      </group>

      {/* Modern School Entrance with Colorful Design */}
      <group position={[0, -2, 7.6]}>
        {/* Main Entrance Structure */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[6, 5, 0.3]} />
          <meshStandardMaterial color="#2c3e50" metalness={0.7} />
        </mesh>

        {/* Colorful Entrance Doors */}
        <mesh position={[-1.8, 0, 0.16]} castShadow>
          <boxGeometry args={[1.2, 3.5, 0.1]} />
          <meshStandardMaterial color="#e74c3c" metalness={0.5} />
        </mesh>
        <mesh position={[1.8, 0, 0.16]} castShadow>
          <boxGeometry args={[1.2, 3.5, 0.1]} />
          <meshStandardMaterial color="#3498db" metalness={0.5} />
        </mesh>

        {/* School Logo */}
        <Text
          position={[0, 2.5, 0.16]}
          fontSize={0.4}
          color="#f39c12"
          anchorX="center"
          anchorY="middle"
        >
          🎓
        </Text>
      </group>

      {/* Modern Wheelchair Ramp with Colorful Design */}
      <group position={[0, -1.5, 5]}>
        {[0, 0.12, 0.24, 0.36, 0.48, 0.6, 0.72].map((y, i) => (
          <mesh key={i} position={[0, y, -i * 0.35]} castShadow receiveShadow>
            <boxGeometry args={[5, 0.1, 0.35]} />
            <meshStandardMaterial 
              color={i % 2 === 0 ? "#3498db" : "#27ae60"} 
              metalness={0.4}
            />
          </mesh>
        ))}

        {/* Modern Handrails */}
        <mesh position={[2.6, 0.4, -1.1]} castShadow>
          <boxGeometry args={[0.1, 0.8, 2.5]} />
          <meshStandardMaterial color="#e74c3c" metalness={0.8} />
        </mesh>
        <mesh position={[-2.6, 0.4, -1.1]} castShadow>
          <boxGeometry args={[0.1, 0.8, 2.5]} />
          <meshStandardMaterial color="#e74c3c" metalness={0.8} />
        </mesh>
      </group>

      {/* Colorful Playground */}
      <mesh position={[15, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>

      {/* Modern Playground Equipment */}
      <group position={[15, 0, 0]}>
        {/* Colorful Swing Set */}
        <mesh position={[0, 2.5, 3]} castShadow>
          <boxGeometry args={[5, 0.1, 0.1]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        
        <mesh position={[-2, 1.2, 3]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 2.5, 16]} />
          <meshStandardMaterial color="#3498db" metalness={0.6} />
        </mesh>
        
        <mesh position={[2, 1.2, 3]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 2.5, 16]} />
          <meshStandardMaterial color="#3498db" metalness={0.6} />
        </mesh>

        {/* Colorful Swings */}
        {[-1.5, 0, 1.5].map((x, i) => (
          <group key={i} position={[x, 1, 3]}>
            <mesh castShadow>
              <boxGeometry args={[0.8, 0.05, 0.4]} />
              <meshStandardMaterial color={i === 0 ? "#e74c3c" : i === 1 ? "#f39c12" : "#3498db"} />
            </mesh>
            <mesh position={[0, -0.3, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
              <meshStandardMaterial color="#2c3e50" />
            </mesh>
          </group>
        ))}

        {/* Modern Slide */}
        <group position={[4, 0, -2]}>
          <mesh rotation={[0, 0, -Math.PI/4]} castShadow receiveShadow>
            <boxGeometry args={[0.4, 5, 1.2]} />
            <meshStandardMaterial color="#9b59b6" metalness={0.5} />
          </mesh>
          
          <mesh position={[2.5, 2.5, 0]} castShadow>
            <boxGeometry args={[1, 0.1, 1.5]} />
            <meshStandardMaterial color="#3498db" />
          </mesh>
        </group>

        {/* Accessible Swing with Colorful Design */}
        <group position={[-4, 0.8, -2]}>
          <mesh castShadow>
            <boxGeometry args={[1.5, 0.1, 1]} />
            <meshStandardMaterial color="#27ae60" />
          </mesh>
          
          <mesh position={[0, 0.6, 0]} castShadow>
            <boxGeometry args={[1.3, 0.8, 0.8]} />
            <meshStandardMaterial color="#3498db" />
          </mesh>
          
          <Text position={[0, 1, 0]} fontSize={0.3} color="white" anchorX="center">
            ♿
          </Text>
          
          <mesh position={[0.8, 0.3, 0]} castShadow rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.15, 0.15, 1.6, 16]} />
            <meshStandardMaterial color="#e74c3c" />
          </mesh>
        </group>
      </group>

      {/* Solar Panels on Roof - Colorful Arrangement */}
      <group position={[0, 5.5, 0]}>
        <SolarPanel position={[-8, 0, -6]} rotation={[0, Math.PI/4, 0]} />
        <SolarPanel position={[-4, 0, -6]} rotation={[0, 0, 0]} />
        <SolarPanel position={[0, 0, -6]} rotation={[0, -Math.PI/4, 0]} />
        <SolarPanel position={[4, 0, -6]} rotation={[0, Math.PI/4, 0]} />
        <SolarPanel position={[8, 0, -6]} rotation={[0, 0, 0]} />
        
        {/* Wind Turbine for Green Energy */}
        <WindTurbine position={[10, 0, 0]} />
      </group>

      {/* Students and Teachers with Colorful Uniforms */}
      <WheelchairUser position={[-3, 0, 4]} moving={true} />
      
      <group position={[4, 0.8, 4]}>
        <mesh position={[0, 1, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 1, 8]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        
        <mesh position={[0, 1.6, 0]} castShadow>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
        
        <Text position={[0, 2, 0]} fontSize={0.3} color="white" anchorX="center">
          👩‍🏫
        </Text>
        
        {/* Teacher's Tablet */}
        <mesh position={[0.4, 1.3, 0]} castShadow>
          <boxGeometry args={[0.4, 0.5, 0.05]} />
          <meshStandardMaterial color="#9b59b6" />
        </mesh>
      </group>

      {/* Group of Students */}
      <group position={[-6, 0, 2]}>
        {[0, 1, 2].map((i) => (
          <group key={i} position={[i * 1.5, 0, 0]}>
            <mesh position={[0, 0.9, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 0.8, 8]} />
              <meshStandardMaterial color={i === 0 ? "#3498db" : i === 1 ? "#e74c3c" : "#27ae60"} />
            </mesh>
            
            <mesh position={[0, 1.5, 0]} castShadow>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial color="#ffdbac" />
            </mesh>
            
            <Text position={[0, 1.8, 0]} fontSize={0.2} color="white" anchorX="center">
              {i === 0 ? "👦" : i === 1 ? "👧" : "🧒"}
            </Text>
          </group>
        ))}
      </group>

      {/* Modern School Bus with Colorful Design */}
      <group position={[-12, 0.8, 0]}>
        <mesh castShadow>
          <boxGeometry args={[4, 1.8, 2]} />
          <meshStandardMaterial color="#FFD700" metalness={0.4} roughness={0.3} />
        </mesh>

        <mesh position={[0.8, 1.2, 0]} castShadow>
          <boxGeometry args={[2, 1, 1.8]} />
          <meshStandardMaterial color="#3498db" transparent opacity={0.8} />
        </mesh>

        {/* Colorful Stripes */}
        <mesh position={[0, 1.9, 0.01]} castShadow>
          <boxGeometry args={[3.8, 0.1, 0.1]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>

        <Text
          position={[0, 2.1, 0]}
          fontSize={0.25}
          color="#e74c3c"
          anchorX="center"
          anchorY="middle"
        >
          SMART SCHOOL
        </Text>

        {[-1.2, 1.2].map((x, i) => (
          <group key={i} position={[x, -0.4, 0]}>
            <mesh castShadow rotation={[0, 0, Math.PI/2]}>
              <cylinderGeometry args={[0.3, 0.3, 0.25, 16]} />
              <meshStandardMaterial color="#2c3e50" metalness={0.8} />
            </mesh>
          </group>
        ))}

        {/* Wheelchair Lift */}
        <mesh position={[-1.5, 0.3, 0]} castShadow>
          <boxGeometry args={[0.4, 0.6, 1.5]} />
          <meshStandardMaterial color="#27ae60" />
        </mesh>
      </group>

      <Html position={[0, 15, 0]} transform>
        <div style={{
          background: 'linear-gradient(135deg, #3498db, #9b59b6)',
          padding: '25px',
          borderRadius: '20px',
          boxShadow: '0 12px 35px rgba(0,0,0,0.4)',
          minWidth: '380px',
          textAlign: 'center',
          color: 'white',
          border: '3px solid #f39c12',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            color: 'white', 
            fontSize: '22px',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            🏫 Modern Glass School
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ marginRight: '8px' }}>👨‍🎓</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Students</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>600+ Enrolled</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ marginRight: '8px' }}>👩‍🏫</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Teachers</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>45 Professionals</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ marginRight: '8px' }}>🏫</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Classrooms</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>30 Smart Rooms</div>
                </div>
              </div>
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ marginRight: '8px' }}>🔬</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Science Labs</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>6 Advanced Labs</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ marginRight: '8px' }}>💻</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Computer Lab</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>60 AI Workstations</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ marginRight: '8px' }}>🎨</span>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Arts Center</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>Creative Space</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '15px', 
            borderRadius: '12px',
            marginBottom: '15px',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: 'white', fontSize: '16px' }}>🏗️ Smart Features</h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '8px',
              fontSize: '12px'
            }}>
              <div>✅ Solar Powered</div>
              <div>✅ IoT Classrooms</div>
              <div>✅ AI Learning</div>
              <div>✅ Green Design</div>
              <div>✅ Tech Labs</div>
              <div>✅ Sports Facility</div>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(243, 156, 18, 0.3)', 
            padding: '12px', 
            borderRadius: '10px',
            fontSize: '13px',
            border: '1px solid #f39c12'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>♿ Inclusive Features</div>
            <div style={{ fontSize: '11px', opacity: 0.9 }}>
              Smart Ramps • Elevators • Accessible Restrooms • Specialized Classrooms • 
              Accessible Playground • Support Staff • Braille Materials • Hearing Assistance
            </div>
          </div>

          {/* Green Energy Status */}
          <div style={{ 
            marginTop: '15px',
            padding: '10px',
            background: 'rgba(39, 174, 96, 0.3)',
            borderRadius: '8px',
            border: '1px solid #27ae60'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>🌱 GREEN ENERGY STATUS</div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '11px',
              marginTop: '5px'
            }}>
              <span>☀️ Solar: 85%</span>
              <span>🌬️ Wind: 15%</span>
              <span>⚡ Net: +200%</span>
            </div>
          </div>
        </div>
      </Html>

      <Text
        position={[0, 6, 0]}
        fontSize={0.8}
        color="#3498db"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        🏫 SMART SCHOOL
      </Text>

      {/* Interactive Learning Indicator */}
      <group position={[0, 8, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.6, 0.6, 0.2, 16]} />
          <meshStandardMaterial 
            color={schoolLights ? "#f39c12" : "#3498db"}
            emissive={schoolLights ? "#f39c12" : "#3498db"}
            emissiveIntensity={0.5}
          />
        </mesh>
        <Text
          position={[0, 0.2, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          📚
        </Text>
      </group>
    </group>
  )
}
/* ----- ENHANCED CULTURAL CENTER ----- */
function CulturalCenter({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)
  const timeOfDay = useStore((s) => s.timeOfDay)

  const culturalStyles = [
    { 
      name: "Sindhi", 
      color: "#ff6b6b", 
      pattern: "🎵",
      image: "🎨",
      description: "Sindhi Culture - Music & Ajrak",
      features: ["Traditional Music", "Ajrak Patterns", "Sufi Heritage"]
    },
    { 
      name: "Punjabi", 
      color: "#4ecdc4", 
      pattern: "💃",
      image: "🌾",
      description: "Punjabi Culture - Bhangra & Agriculture",
      features: ["Bhangra Dance", "Wheat Fields", "Folk Music"]
    },
    { 
      name: "Pashto", 
      color: "#45b7d1", 
      pattern: "⚔️",
      image: "🏔️",
      description: "Pashtun Culture - Mountains & Tradition",
      features: ["Mountain Heritage", "Traditional Dance", "Tribal Arts"]
    },
    { 
      name: "Balochi", 
      color: "#96ceb4", 
      pattern: "🏔️",
      image: "🐫",
      description: "Balochi Culture - Desert & Camel",
      features: ["Desert Life", "Camel Culture", "Embroidery"]
    }
  ]

  return (
    <group position={position}>
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
        <boxGeometry args={[12, 6, 8]} />
        <meshStandardMaterial color="#8b4513" roughness={0.7} />
      </mesh>

      {/* Enhanced Windows with Night Lighting */}
      {Array.from({ length: 2 }).map((_, floor) =>
        Array.from({ length: 3 }).map((_, window) => (
          <mesh
            key={`${floor}-${window}`}
            position={[-5.5, -2 + floor * 2.5, -3.9 + window * 2.5]}
            castShadow
          >
            <boxGeometry args={[0.1, 1.5, 2]} />
            <meshStandardMaterial 
              color={timeOfDay === 'night' ? "#ffffcc" : "#87CEEB"} 
              transparent 
              opacity={timeOfDay === 'night' ? 0.9 : 0.7}
              emissive={timeOfDay === 'night' ? "#ffff99" : "#000000"}
              emissiveIntensity={timeOfDay === 'night' ? 0.5 : 0}
            />
          </mesh>
        ))
      )}

      <mesh position={[0, 3, 4.1]} castShadow>
        <boxGeometry args={[3, 4, 0.2]} />
        <meshStandardMaterial color="#a67c52" />
      </mesh>

      <group position={[0, 4, 0]}>
        {culturalStyles.map((culture, index) => {
          const angle = (index / culturalStyles.length) * Math.PI * 2
          const radius = 8
          const bannerX = Math.cos(angle) * radius
          const bannerZ = Math.sin(angle) * radius
          
          return (
            <group key={culture.name} position={[bannerX, 0, bannerZ]} rotation={[0, -angle, 0]}>
              <mesh position={[0, 4, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 8, 8]} />
                <meshStandardMaterial color="#d4af37" />
              </mesh>
              
              <mesh position={[0, 6, -0.5]} rotation={[0, 0, 0]} castShadow>
                <planeGeometry args={[2, 3]} />
                <meshStandardMaterial color={culture.color} />
              </mesh>
              
              <Text
                position={[0, 6, -0.51]}
                fontSize={0.8}
                color="white"
                anchorX="center"
                anchorY="middle"
              >
                {culture.pattern}
              </Text>
              
              <Text
                position={[0, 4.5, -0.51]}
                fontSize={0.3}
                color="white"
                anchorX="center"
                anchorY="middle"
              >
                {culture.name}
              </Text>

              <mesh position={[0, 1, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[1.5, 1.5, 0.2, 16]} />
                <meshStandardMaterial color={culture.color} transparent opacity={0.8} />
              </mesh>

              <mesh position={[0, 1.5, 0]} castShadow>
                <boxGeometry args={[1, 0.8, 1]} />
                <meshStandardMaterial color={culture.color} />
              </mesh>

              <Text
                position={[0, 1.8, 0]}
                fontSize={0.5}
                color="white"
                anchorX="center"
                anchorY="middle"
              >
                {culture.image}
              </Text>
            </group>
          )
        })}
      </group>

      <mesh position={[0, 9, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 10, 8]} />
        <meshStandardMaterial color="#c9b037" />
      </mesh>

      <Text
        position={[0, 7, 0]}
        fontSize={0.5}
        color="#d4af37"
        anchorX="center"
        anchorY="middle"
      >
        Cultural Center
      </Text>

      <Html position={[0, 12, 0]} transform>
        <div style={{
          background: 'rgba(139, 69, 19, 0.95)',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          minWidth: '350px',
          textAlign: 'center',
          color: 'white',
          border: '2px solid #d4af37'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#d4af37', fontSize: '18px' }}>
            🎪 Cultural Heritage Center
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '15px',
            marginBottom: '15px'
          }}>
            {culturalStyles.map((culture, index) => (
              <div key={culture.name} style={{
                background: culture.color,
                padding: '10px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>{culture.image}</div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{culture.name}</div>
                <div style={{ fontSize: '11px', opacity: 0.9 }}>{culture.description}</div>
              </div>
            ))}
          </div>

          <div style={{ 
            background: 'rgba(212, 175, 55, 0.2)', 
            padding: '12px', 
            borderRadius: '8px',
            fontSize: '12px',
            border: '1px solid #d4af37'
          }}>
            <div><strong>Cultural Features:</strong></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginTop: '5px' }}>
              {culturalStyles.map(culture => (
                <div key={culture.name} style={{ textAlign: 'left' }}>
                  <strong>{culture.name}:</strong> {culture.features.join(', ')}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Html>

      <Person position={[3, 0, 2]} color="#8b4513" speed={0.3} path={[
        [3, 0.5, 2], [2, 0.5, 1], [1, 0.5, 2], [2, 0.5, 3], [3, 0.5, 2]
      ]} />
      
      <Person position={[-2, 0, -1]} color="#2c3e50" speed={0.4} path={[
        [-2, 0.5, -1], [-1, 0.5, -2], [0, 0.5, -1], [-1, 0.5, 0], [-2, 0.5, -1]
      ]} />

      <group position={[2, 0.5, -2]}>
        <mesh position={[0, 1, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.8, 8]} />
          <meshStandardMaterial color="#ff6b6b" />
        </mesh>
        <Text position={[0, 1.5, 0]} fontSize={0.2} color="white" anchorX="center">
          💃
        </Text>
      </group>

      <group position={[-2, 0.5, 2]}>
        <mesh position={[0, 1, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.8, 8]} />
          <meshStandardMaterial color="#4ecdc4" />
        </mesh>
        <Text position={[0, 1.5, 0]} fontSize={0.2} color="white" anchorX="center">
          🎵
        </Text>
      </group>
    </group>
  )
}

/* ----- ENHANCED DATA CENTER ----- */
function DataCenter({ position = [0, 0, 0] }) {
  const [serverActivity, setServerActivity] = useState([0.6, 0.8, 0.4, 0.7])
  const [dronesFlying, setDronesFlying] = useState(false)
  const [dataFlow, setDataFlow] = useState(0.5)
  const timeOfDay = useStore((s) => s.timeOfDay)

  useFrame((_, dt) => {
    setServerActivity(prev =>
      prev.map(activity => Math.max(0.3, Math.min(1, activity + (Math.random() - 0.5) * 0.1)))
    )
    
    setDataFlow(prev => Math.max(0.2, Math.min(0.9, prev + (Math.random() - 0.5) * 0.05)))
    
    if (Math.random() < 0.01) {
      setDronesFlying(!dronesFlying)
    }
  })

  function ServerRack({ position = [0, 0, 0], activityLevel = 0.7 }) {
    return (
      <group position={position}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 2.5, 0.8]} />
          <meshStandardMaterial color="#2c3e50" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[0, -0.8 + i * 0.6, 0.41]} castShadow>
            <boxGeometry args={[1, 0.3, 0.02]} />
            <meshStandardMaterial 
              color={i < Math.floor(activityLevel * 8) ? "#00ff00" : "#34495e"}
              emissive={i < Math.floor(activityLevel * 8) ? "#00ff00" : "#000000"}
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}
        
        <mesh position={[0, 1.2, 0.41]} castShadow>
          <boxGeometry args={[0.8, 0.4, 0.02]} />
          <meshStandardMaterial color="#3498db" emissive="#3498db" emissiveIntensity={0.2} />
        </mesh>
      </group>
    )
  }

  function TechDrone({ position = [0, 0, 0], isFlying = false }) {
    const droneRef = useRef()
    const [hover, setHover] = useState(0)

    useFrame((_, dt) => {
      if (droneRef.current && isFlying) {
        setHover(prev => prev + dt)
        droneRef.current.position.y = position[1] + Math.sin(hover * 2) * 0.5
        droneRef.current.rotation.x = Math.sin(hover * 3) * 0.1
      }
    })

    return (
      <group ref={droneRef} position={position}>
        <mesh castShadow>
          <boxGeometry args={[0.8, 0.1, 0.8]} />
          <meshStandardMaterial color="#e74c3c" metalness={0.7} roughness={0.3} />
        </mesh>
        
        <mesh position={[0, 0.1, 0]} castShadow>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
        
        {[[0.4, 0.4], [0.4, -0.4], [-0.4, 0.4], [-0.4, -0.4]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0, z]} castShadow rotation={[Math.PI/2, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.05, 8]} />
            <meshStandardMaterial color="#95a5a6" />
          </mesh>
        ))}
        
        {isFlying && (
          <pointLight position={[0, -0.3, 0]} color="#00ff00" intensity={0.5} distance={2} />
        )}
      </group>
    )
  }

  function HologramDisplay({ position = [0, 0, 0], dataFlow = 0.5 }) {
    const hologramRef = useRef()
    const [pulse, setPulse] = useState(0)

    useFrame((_, dt) => {
      setPulse(prev => prev + dt)
      if (hologramRef.current) {
        hologramRef.current.rotation.y += dt * 0.5
      }
    })

    return (
      <group position={position}>
        <mesh castShadow>
          <cylinderGeometry args={[0.3, 0.4, 0.2, 16]} />
          <meshStandardMaterial color="#34495e" metalness={0.9} />
        </mesh>
        
        <group ref={hologramRef}>
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.8, 1, 0.02, 32]} />
            <meshStandardMaterial 
              color="#00ffff" 
              transparent 
              opacity={0.6 + Math.sin(pulse * 3) * 0.2}
              emissive="#00ffff"
              emissiveIntensity={0.3}
            />
          </mesh>
          
          <mesh position={[0, 1.5 + dataFlow * 0.8, 0]} rotation={[0, 0, Math.PI/4]}>
            <boxGeometry args={[0.1, dataFlow * 1.5, 0.1]} />
            <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={0.8} />
          </mesh>
        </group>
        
        <mesh position={[0, 0.8, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 1.2, 8]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
      </group>
    )
  }

  function RobotArm({ position = [0, 0, 0], isActive = true }) {
    const armRef = useRef()
    const [animation, setAnimation] = useState(0)

    useFrame((_, dt) => {
      if (armRef.current && isActive) {
        setAnimation(prev => prev + dt)
        armRef.current.rotation.y = Math.sin(animation) * 0.5
        armRef.current.rotation.x = Math.sin(animation * 2) * 0.3
      }
    })

    return (
      <group ref={armRef} position={position}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.3, 1, 8]} />
          <meshStandardMaterial color="#7f8c8d" metalness={0.8} />
        </mesh>
        
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        
        <mesh position={[0.6, 1.2, 0]} rotation={[0, 0, Math.PI/4]} castShadow>
          <boxGeometry args={[0.8, 0.1, 0.1]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
        
        <mesh position={[1, 1.2, 0]} castShadow>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial 
            color={isActive ? "#00ff00" : "#ff4444"}
            emissive={isActive ? "#00ff00" : "#ff4444"}
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
    )
  }

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[15, 6, 8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </mesh>

      <mesh position={[0, 0, 4.01]} castShadow>
        <boxGeometry args={[14.8, 5.8, 0.1]} />
        <meshStandardMaterial color="#001122" transparent opacity={0.9} />
      </mesh>

      {/* Enhanced Windows with Night Lighting */}
      {Array.from({ length: 3 }).map((_, floor) =>
        Array.from({ length: 4 }).map((_, window) => (
          <mesh
            key={`${floor}-${window}`}
            position={[-7, -2 + floor * 2, -3.9 + window * 2]}
            castShadow
          >
            <boxGeometry args={[0.1, 1.2, 1.5]} />
            <meshStandardMaterial 
              color={timeOfDay === 'night' ? "#00ffff" : "#87CEEB"} 
              transparent 
              opacity={timeOfDay === 'night' ? 0.9 : 0.7}
              emissive={timeOfDay === 'night' ? "#00ffff" : "#000000"}
              emissiveIntensity={timeOfDay === 'night' ? 0.5 : 0}
            />
          </mesh>
        ))
      )}

      {[0, 1, 2].map(level => (
        <group key={level} position={[0, -1.5 + level * 2, 0]}>
          <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[12, 0.1, 3]} />
            <meshStandardMaterial color="#2c3e50" metalness={0.7} />
          </mesh>
          
          <group>
            {level === 0 && [-4, -2, 0, 2, 4].map((x, i) => (
              <ServerRack key={i} position={[x, 1, -1]} activityLevel={serverActivity[i]} />
            ))}
            
            {level === 1 && [-3, 0, 3].map((x, i) => (
              <HologramDisplay key={i} position={[x, 1, -1]} dataFlow={dataFlow} />
            ))}
            
            {level === 2 && [-4, -2, 2, 4].map((x, i) => (
              <RobotArm key={i} position={[x, 1, -1]} isActive={serverActivity[i] > 0.5} />
            ))}
          </group>
        </group>
      ))}

      <TechDrone position={[-6, 3, 0]} isFlying={dronesFlying} />
      <TechDrone position={[6, 4, 0]} isFlying={dronesFlying} />

      <mesh position={[5, 2, 3.9]} castShadow>
        <boxGeometry args={[2, 2, 0.2]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {[0, 1].map(i => (
        <mesh key={i} position={[4.5 + i * 1, 2.5, 3.91]} castShadow>
          <planeGeometry args={[0.8, 0.6]} />
          <meshStandardMaterial color={i === 0 ? "#00ff00" : "#0000ff"} emissive={i === 0 ? "#00ff00" : "#0000ff"} />
        </mesh>
      ))}

      <Sparkles count={50} scale={[14, 5, 7]} size={2} speed={0.3} color="#00ffff" />

      <Text
        position={[0, 4.5, 0]}
        fontSize={0.5}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
      >
        🤖 Tech Hub
      </Text>

      <Html position={[0, 7, 0]} transform>
        <div style={{
          background: 'rgba(0,0,0,0.95)',
          padding: '15px',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(0,255,255,0.3)',
          minWidth: '300px',
          textAlign: 'center',
          color: '#00ffff',
          border: '1px solid #00ffff'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#00ffff' }}>🏢 Cloud Data Center</h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '10px',
            marginBottom: '12px'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div>🖥️ Server Activity: {Math.round(serverActivity.reduce((a, b) => a + b, 0) / serverActivity.length * 100)}%</div>
              <div>📊 Data Flow: {Math.round(dataFlow * 100)}%</div>
              <div>🤖 Active Robots: {serverActivity.filter(a => a > 0.5).length}</div>
              <div>🚁 Drones: {dronesFlying ? 'ACTIVE' : 'STANDBY'}</div>
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <div>💾 Storage: 85%</div>
              <div>🌐 Network: 92%</div>
              <div>⚡ Power: 78%</div>
              <div>❄️ Cooling: 65%</div>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(0,255,255,0.1)', 
            padding: '8px', 
            borderRadius: '6px',
            fontSize: '12px',
            border: '1px solid #00ffff'
          }}>
            <div>✅ AI Processing Active</div>
            <div>✅ Real-time Data Analytics</div>
            <div>✅ Automated Systems</div>
            <div>✅ Drone Deployment Ready</div>
          </div>
        </div>
      </Html>
    </group>
  )
}

/* ----- ENHANCED CAMERA CONTROLLER ----- */
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

/* ----- ENHANCED ORBIT CONTROLS ----- */
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

/* ----- WALKING PEOPLE ----- */
function Person({ position = [0, 0, 0], color = "#8b4513", speed = 1, path = [] }) {
  const personRef = useRef()
  const [t, setT] = useState(Math.random() * 10)

  useFrame((_, dt) => {
    setT(prev => prev + dt * speed)
    
    if (personRef.current && path.length > 0) {
      const tt = t % path.length
      const i = Math.floor(tt) % path.length
      const a = new THREE.Vector3(...path[i])
      const b = new THREE.Vector3(...path[(i + 1) % path.length])
      const f = tt % 1
      const pos = a.clone().lerp(b, f)
      
      personRef.current.position.lerp(pos, 0.1)
      if (b) personRef.current.lookAt(b)
    }
  })

  return (
    <group ref={personRef} position={position}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      
      <group>
        <mesh position={[-0.1, 0.4, 0]} rotation={[Math.sin(t * 10) * 0.3, 0, 0]} castShadow>
          <boxGeometry args={[0.08, 0.4, 0.08]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        <mesh position={[0.1, 0.4, 0]} rotation={[Math.sin(t * 10 + Math.PI) * 0.3, 0, 0]} castShadow>
          <boxGeometry args={[0.08, 0.4, 0.08]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
      </group>
    </group>
  )
}

/* ----- WHEELCHAIR USER ----- */
function WheelchairUser({ position = [0, 0, 0], moving = false, onRamp = false, speed = 0.3 }) {
  const wheelchairRef = useRef()
  const [t, setT] = useState(0)

  useFrame((_, dt) => {
    if (moving && wheelchairRef.current) {
      setT(prev => prev + dt)
      
      if (onRamp) {
        const rampProgress = t * speed
        if (rampProgress < 3) {
          wheelchairRef.current.position.x = position[0] + rampProgress
          wheelchairRef.current.position.y = position[1] - (rampProgress / 3) * 2
          wheelchairRef.current.rotation.y = Math.PI / 2
        }
      } else {
        wheelchairRef.current.position.x = position[0] + Math.sin(t) * 2
      }
    }
  })

  return (
    <group ref={wheelchairRef} position={position}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.6, 0.1, 0.8]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      <mesh position={[0, 0.7, -0.1]} castShadow>
        <boxGeometry args={[0.5, 0.4, 0.5]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
      
      <mesh position={[0, 1.1, -0.4]} castShadow>
        <boxGeometry args={[0.5, 0.6, 0.1]} />
        <meshStandardMaterial color="#2980b9" />
      </mesh>
      
      <mesh position={[-0.3, 0.3, 0.2]} castShadow rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.25, 0.25, 0.05, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0.3, 0.3, 0.2]} castShadow rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.25, 0.25, 0.05, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      <mesh position={[-0.2, 0.15, -0.3]} castShadow rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0.2, 0.15, -0.3]} castShadow rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      <mesh position={[0, 1.3, -0.1]} castShadow>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
    </group>
  )
}

/* ----- ENHANCED ROAD SYSTEM ----- */
function RoadSystem() {
  const roadTexture = useTexture({
    map: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMzMzMzMzIi8+CjxwYXRoIGQ9Ik0yNSA1TDI1IDQ1IiBzdHJva2U9IiNmZmZmMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWRhc2hhcnJheT0iNCA0Ii8+Cjwvc3ZnPg=='
  })

  const mainRoads = [
    // Main horizontal roads
    { start: [-50, 0, 0], end: [50, 0, 0], width: 6 },
    { start: [-50, 0, 25], end: [50, 0, 25], width: 6 },
    { start: [-50, 0, -25], end: [50, 0, -25], width: 6 },
    
    // Main vertical roads
    { start: [0, 0, -50], end: [0, 0, 50], width: 6 },
    { start: [25, 0, -50], end: [25, 0, 50], width: 6 },
    { start: [-25, 0, -50], end: [-25, 0, 50], width: 6 },
    
    // District connecting roads
    { start: [-40, 0, -40], end: [40, 0, -40], width: 4 },
    { start: [-40, 0, 40], end: [40, 0, 40], width: 4 }
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
        ) / 8)
        
        return Array.from({ length: segments }).map((_, segIndex) => {
          const t = (segIndex + 0.5) / segments
          const pos = [
            road.start[0] + (road.end[0] - road.start[0]) * t,
            0.02,
            road.start[2] + (road.end[2] - road.start[2]) * t
          ]
          
          return (
            <mesh key={`${index}-${segIndex}`} position={pos} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[4, 0.4]} />
              <meshStandardMaterial color="#ffff00" />
            </mesh>
          )
        })
      })}

      {/* Crosswalks at major intersections */}
      {[
        [0, 0], [0, 25], [0, -25], [25, 0], [-25, 0],
        [25, 25], [25, -25], [-25, 25], [-25, -25]
      ].map(([x, z], index) => (
        <group key={index} position={[x, 0.02, z]}>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[i * 0.6 - 2.1, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.4, 1.5]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

/* ----- ENHANCED BUS STATION ----- */
function BusStation({ position = [0, 0, 0] }) {
  const timeOfDay = useStore((s) => s.timeOfDay)
  
  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[8, 0.2, 3]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>
      
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[7, 0.1, 2]} />
        <meshStandardMaterial color="#34495e" transparent opacity={0.7} />
      </mesh>
      
      {[-3, 3].map((x) => (
        <mesh key={x} position={[x, 1, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 2, 8]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
      ))}
      
      {/* Bus Station Lighting */}
      {timeOfDay === 'night' && (
        <pointLight
          position={[0, 3, 0]}
          intensity={0.5}
          distance={8}
          color="#ffffcc"
        />
      )}
      
      <Text
        position={[0, 1.5, 1.6]}
        fontSize={0.3}
        color="#e74c3c"
        anchorX="center"
        anchorY="middle"
      >
        BUS STOP
      </Text>
      
      <Person position={[-2, 0.5, 0]} color="#8b4513" speed={0} />
      <Person position={[2, 0.5, 0]} color="#2c3e50" speed={0} />
    </group>
  )
}

/* ----- ENHANCED VEHICLE SYSTEM ----- */
function Car({ position = [0, 0, 0], color = "#ff4444", speed = 1, path = [] }) {
  const carRef = useRef()
  const [t, setT] = useState(Math.random() * 10)
  const timeOfDay = useStore((s) => s.timeOfDay)

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
      
      const direction = new THREE.Vector3().subVectors(b, a).normalize()
      carRef.current.lookAt(carRef.current.position.clone().add(direction))
    }
  })

  return (
    <group ref={carRef} position={position}>
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.4, 0.6]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
      </mesh>
      
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[1.1, 0.2, 0.5]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
      </mesh>
      
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1, 0.02, 0.5]} />
        <meshStandardMaterial color="#1e3a8a" metalness={0.9} roughness={0.05} />
      </mesh>
      
      {/* Car Headlights for Night */}
      {timeOfDay === 'night' && (
        <>
          <pointLight
            position={[0, 0.2, 0.4]}
            intensity={0.8}
            distance={10}
            color="#ffffcc"
          />
          <mesh position={[0, 0.2, 0.35]} castShadow>
            <boxGeometry args={[0.8, 0.1, 0.1]} />
            <meshStandardMaterial color="#ffffcc" emissive="#ffff99" emissiveIntensity={0.5} />
          </mesh>
        </>
      )}
      
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

function Bus({ position = [0, 0, 0], path = [], stopAtStation = false }) {
  const busRef = useRef()
  const [t, setT] = useState(Math.random() * 10)
  const [isStopped, setIsStopped] = useState(false)
  const [stopTimer, setStopTimer] = useState(0)
  const timeOfDay = useStore((s) => s.timeOfDay)

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
      <mesh castShadow>
        <boxGeometry args={[2.5, 1.2, 1.2]} />
        <meshStandardMaterial color={"#FFD700"} metalness={0.3} roughness={0.4} />
      </mesh>

      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[2.4, 0.5, 1.1]} />
        <meshStandardMaterial color={"#2c3e50"} transparent opacity={0.7} />
      </mesh>

      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[2.2, 0.02, 1]} />
        <meshStandardMaterial color="#1e3a8a" metalness={0.9} roughness={0.05} />
      </mesh>

      {/* Bus Headlights for Night */}
      {timeOfDay === 'night' && (
        <>
          <pointLight
            position={[0, 0.5, 0.7]}
            intensity={1}
            distance={15}
            color="#ffffcc"
          />
          <mesh position={[0, 0.5, 0.65]} castShadow>
            <boxGeometry args={[1.5, 0.2, 0.1]} />
            <meshStandardMaterial color="#ffffcc" emissive="#ffff99" emissiveIntensity={0.5} />
          </mesh>
        </>
      )}

      {[-0.8, 0.8].map((x, i) => (
        <group key={i} position={[x, -0.3, 0]}>
          <mesh castShadow rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.15, 8]} />
            <meshStandardMaterial color={"#333333"} />
          </mesh>
        </group>
      ))}

      <Text
        position={[0, 0.8, 0.61]}
        fontSize={0.2}
        color="#ff4444"
        anchorX="center"
        anchorY="middle"
      >
        {isStopped ? "🛑 BUS" : "CITY BUS"}
      </Text>

      {isStopped && (
        <Html position={[0, 2, 0]}>
          <div style={{
            background: '#e74c3c',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: 'bold'
          }}>
            STOPPED
          </div>
        </Html>
      )}
    </group>
  )
}

/* ----- ENHANCED TRAFFIC SYSTEM ----- */
function TrafficSystem() {
  const trafficDensity = useStore((s) => s.trafficDensity)
  
  const carPaths = [
    // Horizontal routes
    [[-45, 0.3, 0], [-35, 0.3, 0], [-25, 0.3, 0], [-15, 0.3, 0], [-5, 0.3, 0], [5, 0.3, 0], [15, 0.3, 0], [25, 0.3, 0], [35, 0.3, 0], [45, 0.3, 0]],
    [[-45, 0.3, 25], [-35, 0.3, 25], [-25, 0.3, 25], [-15, 0.3, 25], [-5, 0.3, 25], [5, 0.3, 25], [15, 0.3, 25], [25, 0.3, 25], [35, 0.3, 25], [45, 0.3, 25]],
    [[-45, 0.3, -25], [-35, 0.3, -25], [-25, 0.3, -25], [-15, 0.3, -25], [-5, 0.3, -25], [5, 0.3, -25], [15, 0.3, -25], [25, 0.3, -25], [35, 0.3, -25], [45, 0.3, -25]],
    
    // Vertical routes
    [[0, 0.3, -45], [0, 0.3, -35], [0, 0.3, -25], [0, 0.3, -15], [0, 0.3, -5], [0, 0.3, 5], [0, 0.3, 15], [0, 0.3, 25], [0, 0.3, 35], [0, 0.3, 45]],
    [[25, 0.3, -45], [25, 0.3, -35], [25, 0.3, -25], [25, 0.3, -15], [25, 0.3, -5], [25, 0.3, 5], [25, 0.3, 15], [25, 0.3, 25], [25, 0.3, 35], [25, 0.3, 45]],
    [[-25, 0.3, -45], [-25, 0.3, -35], [-25, 0.3, -25], [-25, 0.3, -15], [-25, 0.3, -5], [-25, 0.3, 5], [-25, 0.3, 15], [-25, 0.3, 25], [-25, 0.3, 35], [-25, 0.3, 45]]
  ]

  const busPaths = [
    // Main bus routes
    [[-45, 0.4, 0], [-30, 0.4, 0], [-15, 0.4, 0], [0, 0.4, 0], [15, 0.4, 0], [30, 0.4, 0], [45, 0.4, 0]],
    [[0, 0.4, -45], [0, 0.4, -30], [0, 0.4, -15], [0, 0.4, 0], [0, 0.4, 15], [0, 0.4, 30], [0, 0.4, 45]],
    [[-40, 0.4, 25], [-20, 0.4, 25], [0, 0.4, 25], [20, 0.4, 25], [40, 0.4, 25]]
  ]

  const carColors = ["#ff4444", "#44ff44", "#4444ff", "#ffff44", "#ff44ff", "#44ffff"]
  const carCount = trafficDensity === 'low' ? 12 : trafficDensity === 'medium' ? 20 : 30
  const busCount = trafficDensity === 'low' ? 2 : trafficDensity === 'medium' ? 3 : 5

  return (
    <group>
      {Array.from({ length: carCount }).map((_, i) => (
        <Car
          key={`car-${i}`}
          color={carColors[i % carColors.length]}
          speed={0.3 + Math.random() * 0.3}
          path={carPaths[i % carPaths.length]}
        />
      ))}
      
      {Array.from({ length: busCount }).map((_, i) => (
        <Bus
          key={`bus-${i}`}
          path={busPaths[i % busPaths.length]}
          stopAtStation={i === 0}
        />
      ))}
    </group>
  )
}

/* ----- SOLAR PANEL COMPONENT ----- */
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

/* ----- WIND TURBINE COMPONENT ----- */
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

/* ----- ENHANCED GROUND WITH ROADS ----- */
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

/* ----- ENHANCED ENERGY EFFICIENT HOUSE ----- */
function EnergyEfficientHouse({ 
  position = [0, 0, 0], 
  height = 6, 
  color = "#3498db", 
  name = "Eco Home",
  hasTurbine = true,
  hasSolar = true,
  isSpecial = false,
  showInterior = false
}) {
  const setFocus = useStore((s) => s.setFocus)
  const timeOfDay = useStore((s) => s.timeOfDay)

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
      <mesh castShadow receiveShadow onClick={handleClick}>
        <boxGeometry args={[4, height, 4]} />
        <meshStandardMaterial color={isSpecial ? "#3498db" : color} roughness={0.8} metalness={0.1} />
      </mesh>
      
      <group>
        {Array.from({ length: Math.floor(height / 2) }).map((_, floor) =>
          [-1.5, 1.5].map((side, i) => (
            <group key={`${floor}-${side}`}>
              <mesh
                position={[2.01, (floor * 2) - height/2 + 2, side * 0.8]}
                castShadow
              >
                <boxGeometry args={[0.02, 1.2, 1.2]} />
                <meshStandardMaterial 
                  color={timeOfDay === 'night' ? "#ffffcc" : "#87CEEB"} 
                  transparent 
                  opacity={timeOfDay === 'night' ? 0.9 : 0.7}
                  emissive={timeOfDay === 'night' ? "#ffff99" : "#000000"}
                  emissiveIntensity={timeOfDay === 'night' ? 0.5 : 0}
                />
              </mesh>
              <mesh
                position={[2.02, (floor * 2) - height/2 + 2, side * 0.8]}
                castShadow
              >
                <boxGeometry args={[0.02, 1.2, 1.2]} />
                <meshStandardMaterial color="#e3f2fd" transparent opacity={0.6} />
              </mesh>
              
              <mesh position={[2, (floor * 2) - height/2 + 2, side * 0.8]} castShadow>
                <boxGeometry args={[0.04, 1.3, 1.25]} />
                <meshStandardMaterial color="#2c3e50" />
              </mesh>
            </group>
          ))
        )}
      </group>

      <mesh position={[0, 1.5, 2.01]} castShadow>
        <boxGeometry args={[1.2, 2.5, 0.1]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      <mesh position={[0, height/2 + 0.2, 0]} castShadow>
        <boxGeometry args={[4.2, 0.4, 4.2]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>

      {hasSolar && (
        <group position={[0, height/2 + 0.3, 0]}>
          <SolarPanel position={[0, 0, 0]} rotation={[0, 0, 0]} />
          <SolarPanel position={[1.8, 0, 1.2]} rotation={[0, Math.PI/4, 0]} />
          <SolarPanel position={[-1.8, 0, 1.2]} rotation={[0, -Math.PI/4, 0]} />
        </group>
      )}

      {hasTurbine && (
        <WindTurbine position={[0, height/2, 0]} />
      )}

      {isSpecial && (
        <group position={[1.5, 0, 2]}>
          <mesh position={[0, 0.1, -1]} rotation={[0, 0, -Math.PI/12]} castShadow receiveShadow>
            <boxGeometry args={[2, 0.1, 1.5]} />
            <meshStandardMaterial color="#7f8c8d" />
          </mesh>
          
          <mesh position={[0.8, 0.3, -1]} rotation={[0, 0, -Math.PI/12]} castShadow>
            <boxGeometry args={[0.05, 0.4, 1.5]} />
            <meshStandardMaterial color="#2c3e50" />
          </mesh>
          <mesh position={[-0.8, 0.3, -1]} rotation={[0, 0, -Math.PI/12]} castShadow>
            <boxGeometry args={[0.05, 0.4, 1.5]} />
            <meshStandardMaterial color="#2c3e50" />
          </mesh>
        </group>
      )}

      {isSpecial && (
        <group position={[-1.5, 0, 2]}>
          {[0, 0.2, 0.4, 0.6].map((y, i) => (
            <mesh key={i} position={[0, y + 0.05, -i * 0.3]} castShadow receiveShadow>
              <boxGeometry args={[1, 0.1, 0.3]} />
              <meshStandardMaterial color="#95a5a6" />
            </mesh>
          ))}
          
          <mesh position={[0.8, 0.35, -0.45]} rotation={[0, 0, -Math.PI/8]} castShadow receiveShadow>
            <boxGeometry args={[0.8, 0.1, 1.2]} />
            <meshStandardMaterial color="#bdc3c7" />
          </mesh>
        </group>
      )}

      {isSpecial && showInterior && (
        <group position={[0, 0, -1]}>
          <mesh position={[0, 1.5, 0]} castShadow>
            <boxGeometry args={[3.8, 3, 0.1]} />
            <meshStandardMaterial color="#ecf0f1" />
          </mesh>
          
          <mesh position={[0, 4.5, 0]} castShadow>
            <boxGeometry args={[3.8, 2, 0.1]} />
            <meshStandardMaterial color="#dfe6e9" />
          </mesh>

          <WheelchairUser position={[-1, 0.4, 0.1]} moving={true} />
          <WheelchairUser position={[1, 0.4, 0.1]} moving={false} />
          
          <WheelchairUser position={[-1.2, 2.8, 0.1]} moving={true} onRamp={true} />
        </group>
      )}

      <Text
        position={[0, height/2 + 1, 0]}
        fontSize={0.3}
        color={isSpecial ? "#e74c3c" : "#8b4513"}
        anchorX="center"
        anchorY="middle"
      >
        {isSpecial ? "🏠 ACCESSIBLE HOME" : name}
      </Text>

      {isSpecial && (
        <Html position={[0, height/2 + 2, 0]} transform>
          <div style={{
            background: 'rgba(52, 152, 219, 0.95)',
            color: 'white',
            padding: '12px',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            minWidth: '250px',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 8px 0' }}>♿ Accessible Eco Home</h4>
            <div>🔵 Blue Energy Efficient Design</div>
            <div>🪟 Double-Sided Glass Windows</div>
            <div>♿ Wheelchair Accessible</div>
            <div>🛗 Stairs with Ramp System</div>
            <div>☀️ Solar Powered</div>
            <div>🌬️ Wind Turbine</div>
          </div>
        </Html>
      )}
    </group>
  )
}

/* ----- ENHANCED ENERGY EFFICIENT SOCIETY ----- */
function EnergyEfficientSociety({ position = [0, 0, 0] }) {
  const houses = [
    { position: [-18, 0, -35], name: "Eco Home 1" },
    { position: [-12, 0, -35], name: "Eco Home 2" },
    { position: [-6, 0, -35], name: "Eco Home 3" },
    { position: [0, 0, -35], name: "Eco Home 4" },
    { position: [6, 0, -35], name: "Eco Home 5" },
    { position: [12, 0, -35], name: "Eco Home 6" },
    { position: [18, 0, -35], name: "Eco Home 7" },
    
    { position: [-18, 0, -28], name: "Eco Home 8" },
    { position: [-12, 0, -28], name: "Eco Home 9" },
    { position: [-6, 0, -28], name: "Eco Home 10" },
    { position: [0, 0, -28], name: "Eco Home 11", isSpecial: true },
    { position: [6, 0, -28], name: "Eco Home 12" },
    { position: [12, 0, -28], name: "Eco Home 13" },
    { position: [18, 0, -28], name: "Eco Home 14" },
    
    { position: [-18, 0, -21], name: "Eco Home 15" },
    { position: [-12, 0, -21], name: "Eco Home 16" },
    { position: [-6, 0, -21], name: "Eco Home 17" },
    { position: [0, 0, -21], name: "Eco Home 18" },
    { position: [6, 0, -21], name: "Eco Home 19" },
    { position: [12, 0, -21], name: "Eco Home 20" },
    { position: [18, 0, -21], name: "Eco Home 21" }
  ]

  return (
    <group position={position}>
      <mesh position={[0, 0.01, -28]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial color="#27ae60" transparent opacity={0.1} />
      </mesh>
      
      <mesh position={[0, 0.02, -28]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2, 20]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      
      <mesh position={[0, 0.02, -28]} rotation={[-Math.PI / 2, 0, Math.PI/2]} receiveShadow>
        <planeGeometry args={[2, 40]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>

      <Text
        position={[0, 5, -28]}
        fontSize={0.6}
        color="#27ae60"
        anchorX="center"
        anchorY="middle"
      >
        🌱 Energy Efficient Society
      </Text>

      {houses.map((house, index) => (
        <EnergyEfficientHouse
          key={index}
          position={house.position}
          name={house.name}
          isSpecial={house.isSpecial}
          showInterior={house.isSpecial}
          color={house.isSpecial ? "#3498db" : "#a67c52"}
        />
      ))}

      <mesh position={[0, 0.03, -35]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[8, 32]} />
        <meshStandardMaterial color="#2ecc71" />
      </mesh>

      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 6
        return (
          <group key={i} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius - 35]}>
            <mesh position={[0, 1.5, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
              <meshStandardMaterial color="#8b4513" />
            </mesh>
            <mesh position={[0, 3.5, 0]} castShadow>
              <sphereGeometry args={[1.2, 8, 8]} />
              <meshStandardMaterial color="#27ae60" />
            </mesh>
          </group>
        )
      })}

      <Person position={[5, 0, -30]} color="#8b4513" speed={0.2} path={[
        [5, 0.5, -30], [3, 0.5, -32], [1, 0.5, -30], [3, 0.5, -28], [5, 0.5, -30]
      ]} />
      
      <Person position={[-5, 0, -32]} color="#2c3e50" speed={0.3} path={[
        [-5, 0.5, -32], [-7, 0.5, -30], [-9, 0.5, -32], [-7, 0.5, -34], [-5, 0.5, -32]
      ]} />

      <WheelchairUser position={[10, 0, -25]} moving={true} />
    </group>
  )
}

/* ----- ENHANCED WASTE BIN COMPONENT ----- */
function WasteBin({ position = [0, 0, 0], id = "bin1" }) {
  const [fillLevel, setFillLevel] = useState(0)
  const updateWasteBin = useStore((s) => s.updateWasteBin)
  const setAlertWasteManagement = useStore((s) => s.setAlertWasteManagement)

  const handleClick = () => {
    if (fillLevel < 1) {
      const newLevel = Math.min(1, fillLevel + 0.25)
      setFillLevel(newLevel)
      updateWasteBin(id, newLevel)
      
      if (newLevel >= 1) {
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
          background: fillLevel >= 1 ? '#e74c3c' : '#27ae60',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '10px',
          fontWeight: 'bold'
        }}>
          🗑️ {Math.round(fillLevel * 100)}% {fillLevel >= 1 ? 'FULL!' : ''}
        </div>
      </Html>
    </group>
  )
}

/* ----- ENHANCED WASTE COLLECTION TRUCK ----- */
function WasteTruck({ position = [0, 0, 0], targetBin = null, onCollectionComplete }) {
  const truckRef = useRef()
  const [currentPosition, setCurrentPosition] = useState(position)
  const [isCollecting, setIsCollecting] = useState(false)
  const [collectionProgress, setCollectionProgress] = useState(0)
  const [binLifted, setBinLifted] = useState(false)
  const timeOfDay = useStore((s) => s.timeOfDay)

  useFrame((_, dt) => {
    if (!truckRef.current || !targetBin) return

    const truckPos = truckRef.current.position
    const targetPos = new THREE.Vector3(targetBin[0], targetBin[1], targetBin[2])

    if (!isCollecting && truckPos.distanceTo(targetPos) > 2) {
      const direction = new THREE.Vector3().subVectors(targetPos, truckPos).normalize()
      truckPos.add(direction.multiplyScalar(dt * 4))
      truckRef.current.lookAt(truckPos.clone().add(direction))
      setCurrentPosition([truckPos.x, truckPos.y, truckPos.z])
    } 
    else if (!isCollecting) {
      setIsCollecting(true)
    }
    
    if (isCollecting) {
      const progress = collectionProgress + dt * 2
      setCollectionProgress(progress)

      if (progress < 0.3) {
        truckRef.current.position.y = position[1] + Math.sin(progress * 10) * 0.1
        if (progress > 0.2 && !binLifted) {
          setBinLifted(true)
        }
      } else if (progress >= 1) {
        setIsCollecting(false)
        setCollectionProgress(0)
        setBinLifted(false)
        if (onCollectionComplete) onCollectionComplete()
      }
    }
  })

  return (
    <group ref={truckRef} position={currentPosition}>
      <mesh castShadow>
        <boxGeometry args={[2, 1, 1.5]} />
        <meshStandardMaterial color="#27ae60" metalness={0.3} roughness={0.4} />
      </mesh>
      
      <mesh position={[0.8, 0.8, 0]} castShadow>
        <boxGeometry args={[1, 0.8, 1.2]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      <mesh position={[-0.5, 1, 0]} castShadow>
        <boxGeometry args={[1.5, 1, 1.2]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      
      <mesh position={[-0.5, 0.5 + collectionProgress * 0.4, 0]} castShadow>
        <boxGeometry args={[1.4, collectionProgress * 0.8, 1.1]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* Truck Headlights for Night */}
      {timeOfDay === 'night' && (
        <>
          <pointLight
            position={[0, 0.5, 0.8]}
            intensity={0.8}
            distance={12}
            color="#ffffcc"
          />
          <mesh position={[0, 0.5, 0.75]} castShadow>
            <boxGeometry args={[1.2, 0.15, 0.1]} />
            <meshStandardMaterial color="#ffffcc" emissive="#ffff99" emissiveIntensity={0.5} />
          </mesh>
        </>
      )}

      {isCollecting && collectionProgress < 0.3 && (
        <mesh position={[-1.2, 1.5 + Math.sin(collectionProgress * 20) * 0.5, 0]} castShadow>
          <boxGeometry args={[0.3, 0.8, 0.8]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
      )}
      
      {[-0.6, 0.6].map((x, i) => (
        <group key={i} position={[x, -0.3, 0]}>
          <mesh castShadow rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.25, 0.25, 0.2, 8]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        </group>
      ))}

      <Text
        position={[0, 1.8, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        WASTE TRUCK
      </Text>

      {isCollecting && (
        <Html position={[0, 2.5, 0]}>
          <div style={{
            background: '#e74c3c',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: 'bold'
          }}>
            🚛 COLLECTING: {Math.round(collectionProgress * 100)}%
          </div>
        </Html>
      )}
    </group>
  )
}

/* ----- ENHANCED WASTE MANAGEMENT SYSTEM ----- */
function WasteManagementSystem({ position = [35, 0, 35] }) {
  const [isTruckActive, setIsTruckActive] = useState(false)
  const [currentBinTarget, setCurrentBinTarget] = useState(null)
  const [collectedWaste, setCollectedWaste] = useState(0)
  const alertWasteManagement = useStore((s) => s.alertWasteManagement)
  const wasteBins = useStore((s) => s.wasteBins)
  const wasteProcessing = useStore((s) => s.wasteProcessing)
  const setWasteProcessing = useStore((s) => s.setWasteProcessing)
  const setEmergencyAlarm = useStore((s) => s.setEmergencyAlarm)
  const setAlertWasteManagement = useStore((s) => s.setAlertWasteManagement)
  const timeOfDay = useStore((s) => s.timeOfDay)
  
  const binPositions = [
    [-15, 0, 10], [20, 0, -8], [-8, 0, -18], 
    [25, 0, 15], [-20, 0, -25], [10, 0, 25]
  ]

  const startProcessing = () => {
    if (collectedWaste > 0 && !wasteProcessing.isProcessing) {
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
    const fullBins = Object.entries(wasteBins)
      .filter(([_, level]) => level >= 1)
      .map(([id]) => binPositions[parseInt(id.replace('bin', '')) - 1])

    if (fullBins.length > 0 && !isTruckActive && !currentBinTarget) {
      setCurrentBinTarget(fullBins[0])
      setIsTruckActive(true)
      setAlertWasteManagement(true)
    }

    if (wasteProcessing.isProcessing) {
      const newTime = wasteProcessing.processTime + dt
      
      if (newTime >= 4) {
        setWasteProcessing({
          isProcessing: false,
          processTime: 4,
          recycledWaste: Math.floor(collectedWaste * 0.6),
          reducedWaste: Math.floor(collectedWaste * 0.2),
          reusedWaste: Math.floor(collectedWaste * 0.15)
        })
        setCollectedWaste(0)
      } else {
        setWasteProcessing({
          ...wasteProcessing,
          processTime: newTime
        })
      }
    }
  })

  const handleCollectionComplete = () => {
    const binId = `bin${binPositions.findIndex(pos => 
      pos[0] === currentBinTarget[0] && 
      pos[1] === currentBinTarget[1] && 
      pos[2] === currentBinTarget[2]
    ) + 1}`
    
    useStore.getState().updateWasteBin(binId, 0)
    
    setCollectedWaste(prev => prev + 5)
    
    setCurrentBinTarget(null)
    setIsTruckActive(false)
    setAlertWasteManagement(false)
  }

  const triggerEmergency = () => {
    setEmergencyAlarm(true)
    setTimeout(() => setEmergencyAlarm(false), 3000)
  }

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[12, 8, 10]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.7} />
      </mesh>

      {/* Enhanced Windows with Night Lighting */}
      {Array.from({ length: 2 }).map((_, floor) =>
        Array.from({ length: 3 }).map((_, window) => (
          <mesh
            key={`${floor}-${window}`}
            position={[-5, -3 + floor * 3, -4.9 + window * 3]}
            castShadow
          >
            <boxGeometry args={[0.1, 2, 2.5]} />
            <meshStandardMaterial 
              color={timeOfDay === 'night' ? "#ffffcc" : "#87CEEB"} 
              transparent 
              opacity={timeOfDay === 'night' ? 0.9 : 0.7}
              emissive={timeOfDay === 'night' ? "#ffff99" : "#000000"}
              emissiveIntensity={timeOfDay === 'night' ? 0.5 : 0}
            />
          </mesh>
        ))
      )}

      <group position={[0, 4, -3]}>
        <group position={[-4, 0, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.8, 0.8, 2, 16]} />
            <meshStandardMaterial color="#e74c3c" />
          </mesh>
          <Text position={[0, 1.5, 0]} fontSize={0.3} color="white" anchorX="center">
            📉 REDUCE
          </Text>
          {wasteProcessing.reducedWaste > 0 && (
            <mesh position={[0, wasteProcessing.reducedWaste * 0.1 - 0.9, 0]} castShadow>
              <cylinderGeometry args={[0.75, 0.75, wasteProcessing.reducedWaste * 0.2, 16]} />
              <meshStandardMaterial color="#c0392b" />
            </mesh>
          )}
        </group>

        <group position={[0, 0, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.8, 0.8, 2, 16]} />
            <meshStandardMaterial color="#f39c12" />
          </mesh>
          <Text position={[0, 1.5, 0]} fontSize={0.3} color="white" anchorX="center">
            🔄 REUSE
          </Text>
          {wasteProcessing.reusedWaste > 0 && (
            <mesh position={[0, wasteProcessing.reusedWaste * 0.1 - 0.9, 0]} castShadow>
              <cylinderGeometry args={[0.75, 0.75, wasteProcessing.reusedWaste * 0.2, 16]} />
              <meshStandardMaterial color="#e67e22" />
            </mesh>
          )}
        </group>

        <group position={[4, 0, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.8, 0.8, 2, 16]} />
            <meshStandardMaterial color="#27ae60" />
          </mesh>
          <Text position={[0, 1.5, 0]} fontSize={0.3} color="white" anchorX="center">
            ♻️ RECYCLE
          </Text>
          {wasteProcessing.recycledWaste > 0 && (
            <mesh position={[0, wasteProcessing.recycledWaste * 0.1 - 0.9, 0]} castShadow>
              <cylinderGeometry args={[0.75, 0.75, wasteProcessing.recycledWaste * 0.2, 16]} />
              <meshStandardMaterial color="#229954" />
            </mesh>
          )}
        </group>
      </group>

      <group>
        <mesh position={[0, 1, 2]} rotation={[0, 0, Math.PI/2]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 8, 8]} />
          <meshStandardMaterial color="#95a5a6" />
        </mesh>
        
        <mesh position={[-2, 1, -1]} rotation={[0, Math.PI/2, Math.PI/2]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 4, 8]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        
        <mesh position={[0, 1, -1]} rotation={[0, 0, Math.PI/2]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 2, 8]} />
          <meshStandardMaterial color="#f39c12" />
        </mesh>
        
        <mesh position={[2, 1, -1]} rotation={[0, -Math.PI/2, Math.PI/2]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 4, 8]} />
          <meshStandardMaterial color="#27ae60" />
        </mesh>
      </group>

      <group position={[0, 3.5, 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[1.2, 1.2, 3, 16]} />
          <meshStandardMaterial color="#34495e" />
        </mesh>
        {wasteProcessing.isProcessing && (
          <mesh position={[0, wasteProcessing.processTime * 0.3 - 1.5, 0]} castShadow>
            <cylinderGeometry args={[1.1, 1.1, wasteProcessing.processTime * 0.6, 16]} />
            <meshStandardMaterial color="#3498db" transparent opacity={0.7} />
          </mesh>
        )}
      </group>

      <group position={[0, 4.5, 5]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <SolarPanel 
            key={i}
            position={[-4.5 + i * 1.3, 0.5, 0]} 
            rotation={[0, Math.PI, 0]} 
          />
        ))}
      </group>

      <WindTurbine position={[0, 4, 0]} />

      {isTruckActive && currentBinTarget && (
        <WasteTruck 
          position={[position[0] - 15, 0, position[2]]}
          targetBin={currentBinTarget}
          onCollectionComplete={handleCollectionComplete}
        />
      )}

      <mesh position={[0, 9, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.5, 8]} />
        <meshStandardMaterial color="#e74c3c" emissive="#e74c3c" emissiveIntensity={0.5} />
      </mesh>

      <Html position={[0, 6, 0]} transform>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '15px',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          minWidth: '320px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>🔄 Advanced Waste Management</h3>
          
          <div style={{ marginBottom: '10px' }}>
            <div>🗑️ Collected Waste: {collectedWaste} units</div>
            <div>⏱️ Process Time: {Math.min(4, wasteProcessing.processTime).toFixed(1)}/4 hrs</div>
            <div>🚛 Truck Status: {isTruckActive ? 'COLLECTING' : 'READY'}</div>
            
            {wasteProcessing.processTime >= 4 && (
              <div style={{ marginTop: '8px', padding: '8px', background: '#ecf0f1', borderRadius: '6px' }}>
                <div style={{ color: '#27ae60' }}>♻️ Recycled: {wasteProcessing.recycledWaste} units</div>
                <div style={{ color: '#e74c3c' }}>📉 Reduced: {wasteProcessing.reducedWaste} units</div>
                <div style={{ color: '#f39c12' }}>🔄 Reused: {wasteProcessing.reusedWaste} units</div>
              </div>
            )}
            
            {alertWasteManagement && (
              <div style={{ color: '#e74c3c', fontWeight: 'bold', marginTop: '5px' }}>
                ⚠️ ALERT: Bin Full! Truck dispatched
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <button 
              onClick={startProcessing}
              disabled={wasteProcessing.isProcessing || collectedWaste === 0}
              style={{
                background: wasteProcessing.isProcessing ? '#95a5a6' : collectedWaste === 0 ? '#95a5a6' : '#27ae60',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: collectedWaste > 0 && !wasteProcessing.isProcessing ? 'pointer' : 'not-allowed',
                flex: 1
              }}
            >
              {wasteProcessing.isProcessing ? '🔄 Processing...' : 'Start 4H Process'}
            </button>
            
            <button 
              onClick={triggerEmergency}
              style={{
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🚨 Emergency
            </button>
          </div>

          <div style={{ 
            background: 'linear-gradient(135deg, #e74c3c, #f39c12, #27ae60)',
            color: 'white',
            padding: '8px',
            borderRadius: '6px',
            marginTop: '8px',
            fontSize: '11px'
          }}>
            <div><strong>3R Waste Management System</strong></div>
            <div>📉 Reduce • 🔄 Reuse • ♻️ Recycle</div>
          </div>
        </div>
      </Html>

      <Text
        position={[0, 10, 0]}
        fontSize={0.5}
        color="#2c3e50"
        anchorX="center"
        anchorY="middle"
      >
        Advanced Waste Management
      </Text>
    </group>
  )
}

/* ----- OPTIMIZED MONITORING DRONE ----- */
function MonitoringDrone({ position = [0, 0, 0], isMonitoring = true, onWasteDetected }) {
  const droneRef = useRef()
  const [hover, setHover] = useState(0)
  const [scanning, setScanning] = useState(false)
  const [wasteDetected, setWasteDetected] = useState(false)
  const lastDetectionTime = useRef(0)
  const timeOfDay = useStore((s) => s.timeOfDay)

  useFrame((_, dt) => {
    if (droneRef.current && isMonitoring) {
      setHover(prev => prev + dt)
      droneRef.current.position.y = position[1] + Math.sin(hover * 2) * 0.5
      droneRef.current.rotation.x = Math.sin(hover * 3) * 0.1
      
      // Optimized waste detection - less frequent checks
      const now = Date.now()
      if (now - lastDetectionTime.current > 2000 && Math.random() < 0.01 && !wasteDetected) {
        lastDetectionTime.current = now
        setWasteDetected(true)
        setScanning(true)
        if (onWasteDetected) onWasteDetected()
        
        // Reset after 2 seconds as requested
        setTimeout(() => {
          setWasteDetected(false)
          setScanning(false)
        }, 2000)
      }
      
      // Less frequent scanning animation
      if (Math.random() < 0.01 && !scanning && !wasteDetected) {
        setScanning(true)
        setTimeout(() => setScanning(false), 1000)
      }
    }
  })

  return (
    <group ref={droneRef} position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.1, 0.8]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.7} roughness={0.3} />
      </mesh>
      
      <mesh position={[0, 0.1, 0]} castShadow>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color={wasteDetected ? "#e74c3c" : scanning ? "#f39c12" : "#3498db"} />
      </mesh>
      
      {[[0.4, 0.4], [0.4, -0.4], [-0.4, 0.4], [-0.4, -0.4]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0, z]} castShadow rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.05, 8]} />
          <meshStandardMaterial color="#95a5a6" />
        </mesh>
      ))}
      
      {/* Drone Lights for Night */}
      {timeOfDay === 'night' && (
        <>
          <pointLight
            position={[0, -0.2, 0]}
            intensity={0.5}
            distance={8}
            color="#00ff00"
          />
          <mesh position={[0, -0.25, 0]} castShadow>
            <sphereGeometry args={[0.05, 4, 4]} />
            <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.5} />
          </mesh>
        </>
      )}
      
      {/* Scanning Laser - Only render when active */}
      {scanning && (
        <mesh position={[0, -1, 0]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.5, 10, 8]} />
          <meshStandardMaterial 
            color={wasteDetected ? "#e74c3c" : "#00ff00"} 
            transparent 
            opacity={0.6}
            emissive={wasteDetected ? "#e74c3c" : "#00ff00"}
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
      
      {/* Status Light */}
      <pointLight 
        position={[0, 0.2, 0]} 
        color={wasteDetected ? "#e74c3c" : scanning ? "#f39c12" : "#00ff00"}
        intensity={1}
        distance={2}
      />

      {/* Status Indicator - Only show when active */}
      {(wasteDetected || scanning) && (
        <Html position={[0, 1.5, 0]}>
          <div style={{
            background: wasteDetected ? '#e74c3c' : scanning ? '#f39c12' : '#27ae60',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap'
          }}>
            {wasteDetected ? '🚨 WASTE DETECTED!' : scanning ? '🔍 SCANNING...' : '✅ MONITORING'}
          </div>
        </Html>
      )}
    </group>
  )
}

/* ----- OPTIMIZED WASTE MONITORING SYSTEM ----- */
function WasteMonitoringSystem({ position = [0, 0, 0] }) {
  const [drones] = useState([
    { id: 1, position: [15, 8, 15] },
    { id: 2, position: [-10, 12, 20] },
    { id: 3, position: [25, 10, -12] }
  ])
  
  const setAlert = useStore((s) => s.setAlert)

  const handleWasteDetection = (droneId) => {
    setAlert({
      type: 'emergency',
      message: `🚨 Drone #${droneId} detected waste! Cleanup in progress...`
    })
  }

  return (
    <group position={position}>
      {drones.map(drone => (
        <MonitoringDrone
          key={drone.id}
          position={drone.position}
          isMonitoring={true}
          onWasteDetected={() => handleWasteDetection(drone.id)}
        />
      ))}
      
      {/* Control Center */}
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[3, 1, 2]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      <Text
        position={[0, 2.8, 0]}
        fontSize={0.3}
        color="#3498db"
        anchorX="center"
        anchorY="middle"
      >
        DRONE CONTROL
      </Text>
      
      <Html position={[0, 4, 0]} transform>
        <div style={{
          background: 'rgba(44, 62, 80, 0.95)',
          padding: '12px',
          borderRadius: '8px',
          color: 'white',
          minWidth: '200px',
          textAlign: 'center',
          border: '2px solid #3498db'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#3498db' }}>🚁 Waste Monitoring</h4>
          <div style={{ fontSize: '11px' }}>
            <div>Active Drones: {drones.length}</div>
            <div>Status: 🟢 Operational</div>
            <div>Response: 2s Cleanup</div>
          </div>
        </div>
      </Html>
    </group>
  )
}

/* ----- ENHANCED CITY LAYOUT WITH PROPER SPACING ----- */
function CityLayout() {
  return (
    <group>
      {/* NORTH-WEST DISTRICT - Residential & Commercial */}
      <group position={[-25, 0, 25]}>
        <EnhancedBuilding position={[-15, 0, 15]} height={6} color="#a67c52" name="Residence A" hasTurbine={true} />
        <EnhancedBuilding position={[-5, 0, 15]} height={8} color="#b5651d" name="Residence B" hasTurbine={false} />
        <EnhancedBuilding position={[5, 0, 15]} height={7} color="#c19a6b" name="Residence C" hasTurbine={true} />
        <EnhancedBuilding position={[15, 0, 15]} height={10} color="#8b4513" name="Office A" hasTurbine={true} />
        
        <EnhancedBuilding position={[-15, 0, 5]} height={9} color="#a0522d" name="Office B" hasTurbine={false} />
        <EnhancedBuilding position={[-5, 0, 5]} height={12} color="#cd853f" name="Office C" hasTurbine={true} />
        <EnhancedBuilding position={[5, 0, 5]} height={8} color="#a67c52" name="Residence D" hasTurbine={true} />
        <EnhancedBuilding position={[15, 0, 5]} height={7} color="#b5651d" name="Residence E" hasTurbine={false} />
        
        <EnhancedBuilding position={[-15, 0, -5]} height={11} color="#c19a6b" name="Office D" hasTurbine={true} />
        <EnhancedBuilding position={[-5, 0, -5]} height={6} color="#8b4513" name="Residence F" hasTurbine={true} />
        <EnhancedBuilding position={[5, 0, -5]} height={9} color="#a0522d" name="Office E" hasTurbine={false} />
        <EnhancedBuilding position={[15, 0, -5]} height={8} color="#cd853f" name="Residence G" hasTurbine={true} />
        
        <EnhancedBuilding position={[-15, 0, -15]} height={7} color="#a67c52" name="Residence H" hasTurbine={true} />
        <EnhancedBuilding position={[-5, 0, -15]} height={10} color="#b5651d" name="Office F" hasTurbine={false} />
        <EnhancedBuilding position={[5, 0, -15]} height={8} color="#c19a6b" name="Residence I" hasTurbine={true} />
        <EnhancedBuilding position={[15, 0, -15]} height={12} color="#8b4513" name="Office G" hasTurbine={true} />
      </group>

      {/* NORTH-EAST DISTRICT - Institutional */}
      <ModernHospital position={[40, 0, 25]} />
      <InclusiveGlassSchool position={[40, 0, -5]} />
      <CulturalCenter position={[25, 0, 40]} />

      {/* SOUTH-WEST DISTRICT - Industrial & Utilities */}
      <WaterFilteringPlant position={[-35, 0, -25]} />
      <WasteManagementSystem position={[-35, 0, -40]} />
      <DataCenter position={[-40, 0, -10]} />

      {/* SOUTH-EAST DISTRICT - Green & Recreational */}
      <VerticalGardenBuilding position={[25, 0, -35]} />
      <EnergyEfficientSociety position={[0, 0, -45]} />

      {/* CENTRAL DISTRICT - Public Services */}
      <BusStation position={[0, 0, 0]} />
      <WasteMonitoringSystem position={[0, 0, 10]} />

      {/* Waste bins distributed around the city */}
      <WasteBin position={[-15, 0, 10]} id="bin1" />
      <WasteBin position={[20, 0, -8]} id="bin2" />
      <WasteBin position={[-8, 0, -18]} id="bin3" />
      <WasteBin position={[25, 0, 15]} id="bin4" />
      <WasteBin position={[-20, 0, -25]} id="bin5" />
      <WasteBin position={[10, 0, 25]} id="bin6" />

      {/* Additional monitoring drones */}
      <MonitoringDrone position={[30, 15, 20]} isMonitoring={true} />
      <MonitoringDrone position={[-25, 12, -25]} isMonitoring={true} />
      <MonitoringDrone position={[15, 18, -30]} isMonitoring={true} />

      {/* Citizens */}
      <Person position={[5, 0, 22]} color="#8b4513" speed={0.3} path={[
        [5, 0.5, 22], [3, 0.5, 24], [1, 0.5, 22], [3, 0.5, 20], [5, 0.5, 22]
      ]} />
      
      <Person position={[-3, 0, 27]} color="#2c3e50" speed={0.4} path={[
        [-3, 0.5, 27], [-5, 0.5, 25], [-7, 0.5, 27], [-5, 0.5, 29], [-3, 0.5, 27]
      ]} />

      <WheelchairUser position={[35, 0, 15]} moving={true} />
      <WheelchairUser position={[-35, 0, -5]} moving={true} />
    </group>
  )
}

/* ----- ENHANCED HUD ----- */
function HUD() {
  const alert = useStore((s) => s.alert)
  const timeOfDay = useStore((s) => s.timeOfDay)
  const alertWasteManagement = useStore((s) => s.alertWasteManagement)
  const emergencyAlarm = useStore((s) => s.emergencyAlarm)
  
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
          🏙️ Smart City • Time: {timeOfDay} • Traffic: 🟢 Flowing
        </div>
      )}
    </div>
  )
}

/* ----- SETTINGS ICON ----- */
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

/* ----- ENHANCED CONTROL PANEL ----- */
function ControlPanel() {
  const setTimeOfDay = useStore((s) => s.setTimeOfDay)
  const setTrafficDensity = useStore((s) => s.setTrafficDensity)
  const setStreetLightsOn = useStore((s) => s.setStreetLightsOn)
  const setFocus = useStore((s) => s.setFocus)
  const timeOfDay = useStore((s) => s.timeOfDay)
  const showCityControl = useStore((s) => s.showCityControl)
  const setShowCityControl = useStore((s) => s.setShowCityControl)
  const gardenSensors = useStore((s) => s.gardenSensors)
  const waterPlant = useStore((s) => s.waterPlant)

  // Automatically turn on street lights when night mode is activated
  useEffect(() => {
    if (timeOfDay === 'night') {
      setStreetLightsOn(true)
    }
  }, [timeOfDay, setStreetLightsOn])

  const locations = {
    '🏢 Smart Garden': { x: 25, y: 12, z: -35, lookAt: { x: 25, y: 0, z: -35 } },
    '💧 Water Plant': { x: -35, y: 8, z: -25, lookAt: { x: -35, y: 0, z: -25 } },
    '🚁 Drone Control': { x: 0, y: 10, z: 10, lookAt: { x: 0, y: 0, z: 10 } },
    '🏥 Modern Hospital': { x: 40, y: 15, z: 25, lookAt: { x: 40, y: 0, z: 25 } },
    '🏫 Glass School': { x: 40, y: 10, z: -5, lookAt: { x: 40, y: 0, z: -5 } },
    '🎪 Cultural Center': { x: 25, y: 15, z: 40, lookAt: { x: 25, y: 0, z: 40 } },
    '🚏 Bus Station': { x: 0, y: 10, z: 0, lookAt: { x: 0, y: 0, z: 0 } },
    '🗑️ Waste Management': { x: -35, y: 10, z: -40, lookAt: { x: -35, y: 0, z: -40 } },
    '🤖 Cloud Data Center': { x: -40, y: 10, z: -10, lookAt: { x: -40, y: 0, z: -10 } }
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
      
      {/* Garden Sensor Status */}
      <div style={{ 
        background: 'rgba(39, 174, 96, 0.1)', 
        padding: '8px', 
        borderRadius: '6px',
        marginBottom: '10px',
        border: '1px solid #27ae60'
      }}>
        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#27ae60', marginBottom: '4px' }}>
          🌿 Garden Sensors
        </div>
        <div style={{ fontSize: '10px' }}>
          <div>Soil: {Math.round(gardenSensors.soilMoisture)}%</div>
          <div>Water: {Math.round(gardenSensors.waterLevel)}%</div>
          <div>Temp: {Math.round(gardenSensors.temperature)}°C</div>
          <div>Status: {gardenSensors.isWatering ? '💧 Watering' : '✅ Normal'}</div>
        </div>
      </div>

      {/* Water Plant Status */}
      <div style={{ 
        background: 'rgba(52, 152, 219, 0.1)', 
        padding: '8px', 
        borderRadius: '6px',
        marginBottom: '10px',
        border: '1px solid #3498db'
      }}>
        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#3498db', marginBottom: '4px' }}>
          💧 Water Plant
        </div>
        <div style={{ fontSize: '10px' }}>
          <div>Status: {waterPlant.isProcessing ? '🔄 Processing' : '✅ Standby'}</div>
          <div>Quality: {Math.round(waterPlant.waterQuality)}%</div>
          <div>Filtered: {waterPlant.filteredWater}L</div>
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
            // Automatically turn on street lights when night mode is selected
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
                background: name.includes('Garden') ? '#27ae60' : 
                           name.includes('Water') ? '#3498db' :
                           name.includes('Drone') ? '#3498db' :
                           name.includes('Hospital') ? '#e74c3c' : 
                           name.includes('School') ? '#3498db' : '#d2691e', 
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

/* ----- ENHANCED MAIN APP COMPONENT ----- */
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
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
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
          🌟 Features: Smart Garden • Water Plant • Monitoring Drones • Hospital
        </div>
        <div style={{ fontSize: 11, color: '#3498db', marginTop: 2, fontWeight: 'bold' }}>
          💧 NEW: Enhanced Water Filtering Plant with real-time processing!
        </div>
        <div style={{ fontSize: 11, color: '#27ae60', marginTop: 2 }}>
          🚁 Drones now clean waste in 2 seconds!
        </div>
        <div style={{ fontSize: 11, color: '#e74c3c', marginTop: 2 }}>
          🌙 Night Mode: Automatic street lights and building illumination!
        </div>
        <div style={{ fontSize: 11, color: '#9b59b6', marginTop: 2 }}>
          🏙️ Enhanced Graphics: Better buildings, windows, and lighting effects!
        </div>
      </div>
    </div>
  )
}
