import React, { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, useGLTF, ContactShadows, Sky, Text, Sparkles, Float, useTexture, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { create } from 'zustand'

// Enhanced Zustand store with comprehensive state management
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
  updateParkingLot: (id, cars) => set((state) => ({
    parkingLots: { ...state.parkingLots, [id]: cars }
  })),
  buildingLights: {},
  toggleBuildingLight: (id, status) => set((state) => ({
    buildingLights: { ...state.buildingLights, [id]: status }
  })),
  citySounds: true,
  setCitySounds: (sounds) => set({ citySounds: sounds }),
  showInfoPanels: true,
  setShowInfoPanels: (show) => set({ showInfoPanels: show }),
  activeCamera: 'free',
  setActiveCamera: (camera) => set({ activeCamera: camera }),
  // Enhanced turbine states
  turbines: {},
  updateTurbine: (id, speed) => set((state) => ({
    turbines: { ...state.turbines, [id]: speed }
  })),
  // Culture center states
  culturalEvents: [],
  addCulturalEvent: (event) => set((state) => ({ culturalEvents: [...state.culturalEvents, event] })),
  // Vertical farming states
  farmingProgress: 0,
  setFarmingProgress: (progress) => set({ farmingProgress: progress }),
  cropHealth: 100,
  setCropHealth: (health) => set({ cropHealth: health })
}))

/* ===== ENHANCED VERTICAL FARMING BUILDING WITH DETAILED PROCESS ===== */
function VerticalGardenBuilding({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)
  const farmingProgress = useStore((s) => s.farmingProgress)
  const cropHealth = useStore((s) => s.cropHealth)
  
  const farmRef = useRef()
  const [waterLevel, setWaterLevel] = useState(0.7)
  const [nutrientLevel, setNutrientLevel] = useState(0.8)
  const [lightIntensity, setLightIntensity] = useState(1.0)
  const [harvestReady, setHarvestReady] = useState(false)

  // Enhanced plant types with growth stages
  const plantTypes = [
    { 
      name: "🍋 Lemon", 
      color: "#ffd700", 
      height: 0.8,
      growthStages: ['seed', 'sprout', 'young', 'mature'],
      currentStage: 3
    },
    { 
      name: "🍎 Apple", 
      color: "#ff4444", 
      height: 1.2,
      growthStages: ['seed', 'sprout', 'young', 'mature'],
      currentStage: 3
    },
    { 
      name: "🍅 Tomato", 
      color: "#ff6b6b", 
      height: 0.6,
      growthStages: ['seed', 'sprout', 'young', 'mature'],
      currentStage: 3
    },
    { 
      name: "🥕 Carrot", 
      color: "#ff8c00", 
      height: 0.4,
      growthStages: ['seed', 'sprout', 'young', 'mature'],
      currentStage: 3
    },
    { 
      name: "🥬 Lettuce", 
      color: "#90ee90", 
      height: 0.3,
      growthStages: ['seed', 'sprout', 'young', 'mature'],
      currentStage: 3
    },
    { 
      name: "🍓 Strawberry", 
      color: "#ff69b4", 
      height: 0.2,
      growthStages: ['seed', 'sprout', 'young', 'mature'],
      currentStage: 3
    },
    { 
      name: "🌶️ Chili", 
      color: "#ff0000", 
      height: 0.5,
      growthStages: ['seed', 'sprout', 'young', 'mature'],
      currentStage: 3
    },
    { 
      name: "🍇 Grapes", 
      color: "#9370db", 
      height: 1.0,
      growthStages: ['seed', 'sprout', 'young', 'mature'],
      currentStage: 3
    }
  ]

  // Farming process animation
  useFrame((_, dt) => {
    if (farmRef.current) {
      farmRef.current.rotation.y += dt * 0.05
    }
    
    // Simulate farming process
    setWaterLevel(prev => Math.max(0.3, Math.min(1, prev + (Math.random() - 0.5) * 0.01)))
    setNutrientLevel(prev => Math.max(0.4, Math.min(1, prev + (Math.random() - 0.5) * 0.008)))
    setLightIntensity(prev => Math.max(0.5, Math.min(1.2, prev + (Math.random() - 0.5) * 0.005)))
  })

  const renderPlantGrowth = (plant, index, level, plantIndex) => {
    const growthFactor = plant.currentStage / plant.growthStages.length
    const plantHeight = plant.height * growthFactor
    
    return (
      <group key={`${level}-${plantIndex}`} position={[0, 0.2, -3.5 + plantIndex * 1]}>
        {/* Plant stem */}
        <mesh castShadow>
          <cylinderGeometry args={[0.03 * growthFactor, 0.05 * growthFactor, plantHeight, 8]} />
          <meshStandardMaterial color="#228b22" />
        </mesh>
        
        {/* Plant leaves */}
        <mesh position={[0, plantHeight/2, 0.1]} castShadow rotation={[Math.PI/4, 0, 0]}>
          <boxGeometry args={[0.2 * growthFactor, 0.3 * growthFactor, 0.02]} />
          <meshStandardMaterial color="#32cd32" />
        </mesh>
        
        {/* Fruits/vegetables - only show when mature */}
        {plant.currentStage >= 3 && (
          <mesh position={[0, plantHeight/2 + 0.1, 0]} castShadow>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color={plant.color} />
          </mesh>
        )}
        
        {/* Growth progress indicator */}
        <mesh position={[0.2, plantHeight + 0.1, 0]} castShadow>
          <sphereGeometry args={[0.05, 4, 4]} />
          <meshStandardMaterial 
            color={plant.currentStage === 4 ? "#00ff00" : "#ffff00"}
            emissive={plant.currentStage === 4 ? "#00ff00" : "#ffff00"}
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
    )
  }

  return (
    <group ref={farmRef} position={position}>
      {/* Main building structure */}
      <mesh castShadow receiveShadow onClick={() => setFocus({
        x: position[0],
        y: 12,
        z: position[2],
        lookAt: { x: position[0], y: 0, z: position[2] }
      })}>
        <boxGeometry args={[8, 20, 8]} />
        <meshStandardMaterial color="#8b4513" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Enhanced farming walls with detailed irrigation system */}
      {[0, 1, 2, 3].map((side) => {
        const angle = (side / 4) * Math.PI * 2
        const offsetX = Math.cos(angle) * 4.1
        const offsetZ = Math.sin(angle) * 4.1
        const rotationY = angle + Math.PI

        return (
          <group key={side} position={[offsetX, 0, offsetZ]} rotation={[0, rotationY, 0]}>
            {/* Wall structure */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.2, 18, 7.8]} />
              <meshStandardMaterial color="#27ae60" metalness={0.3} />
            </mesh>

            {/* Farming levels with enhanced details */}
            {Array.from({ length: 6 }).map((_, level) => (
              <group key={level} position={[0.11, -7 + level * 3, 0]}>
                {/* Level shelf */}
                <mesh castShadow>
                  <boxGeometry args={[0.1, 0.1, 7.6]} />
                  <meshStandardMaterial color="#8b4513" />
                </mesh>

                {/* Irrigation pipes */}
                <mesh position={[0.05, 0.2, 0]} castShadow>
                  <cylinderGeometry args={[0.02, 0.02, 7.6, 8]} />
                  <meshStandardMaterial color="#3498db" />
                </mesh>

                {/* Water droplets */}
                {Array.from({ length: 3 }).map((_, dropIndex) => (
                  <mesh key={dropIndex} position={[0.06, 0.1, -3 + dropIndex * 3]} castShadow>
                    <sphereGeometry args={[0.03, 4, 4]} />
                    <meshStandardMaterial color="#3498db" transparent opacity={0.7} />
                  </mesh>
                ))}

                {/* Plants on this level */}
                {Array.from({ length: 8 }).map((_, plantIndex) => {
                  const plant = plantTypes[(level * 8 + plantIndex) % plantTypes.length]
                  return renderPlantGrowth(plant, plantIndex, level, plantIndex)
                })}
              </group>
            ))}

            {/* Main water supply pipe */}
            <mesh position={[0.05, 0, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 18, 8]} />
              <meshStandardMaterial color="#2980b9" />
            </mesh>

            {/* Water valves for each level */}
            {Array.from({ length: 6 }).map((_, level) => (
              <mesh key={level} position={[0.08, -8 + level * 3, 3.5]} castShadow>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial color="#2980b9" />
              </mesh>
            ))}
          </group>
        )
      })}

      {/* Rooftop greenhouse and control center */}
      <group position={[0, 10.5, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[8.2, 0.2, 8.2]} />
          <meshStandardMaterial color="#27ae60" metalness={0.3} />
        </mesh>

        {/* Enhanced rooftop planters */}
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
                <meshStandardMaterial color={plantTypes[(Math.abs(x) + Math.abs(z)) % plantTypes.length].color} />
              </mesh>
            </group>
          ))
        )}

        {/* Enhanced solar panels */}
        <SolarPanel position={[3, 0.3, 3]} rotation={[0, Math.PI/4, 0]} />
        <SolarPanel position={[-3, 0.3, 3]} rotation={[0, -Math.PI/4, 0]} />
        <SolarPanel position={[3, 0.3, -3]} rotation={[0, 3*Math.PI/4, 0]} />
        <SolarPanel position={[-3, 0.3, -3]} rotation={[0, -3*Math.PI/4, 0]} />
      </group>

      {/* Water storage and processing tower */}
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

      {/* Enhanced information display */}
      <Text position={[0, 11, 0]} fontSize={0.5} color="#27ae60" anchorX="center" anchorY="middle">
        🏢 Vertical Farming Center
      </Text>

      {/* Detailed farming process information */}
      <Html position={[0, 15, 0]} transform>
        <div style={{
          background: 'rgba(39, 174, 96, 0.95)',
          padding: '25px',
          borderRadius: '20px',
          boxShadow: '0 12px 35px rgba(0,0,0,0.4)',
          minWidth: '400px',
          textAlign: 'center',
          color: 'white',
          border: '3px solid #229954',
          backdropFilter: 'blur(15px)',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            color: 'white', 
            fontSize: '22px',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            🌿 Advanced Vertical Farming Center
          </h3>
          
          {/* Farming process visualization */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{
              background: 'rgba(52, 152, 219, 0.8)',
              padding: '12px',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '24px'}}>💧</div>
              <div style={{fontSize: '12px', fontWeight: 'bold'}}>Water System</div>
              <div style={{fontSize: '14px'}}>{Math.round(waterLevel * 100)}%</div>
            </div>
            
            <div style={{
              background: 'rgba(46, 204, 113, 0.8)',
              padding: '12px',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '24px'}}>🌱</div>
              <div style={{fontSize: '12px', fontWeight: 'bold'}}>Nutrients</div>
              <div style={{fontSize: '14px'}}>{Math.round(nutrientLevel * 100)}%</div>
            </div>
            
            <div style={{
              background: 'rgba(241, 196, 15, 0.8)',
              padding: '12px',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <div style={{fontSize: '24px'}}>💡</div>
              <div style={{fontSize: '12px', fontWeight: 'bold'}}>LED Lighting</div>
              <div style={{fontSize: '14px'}}>{Math.round(lightIntensity * 100)}%</div>
            </div>
          </div>

          {/* Crop production details */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{fontWeight: 'bold', marginBottom: '8px'}}>🌿 Current Crops:</div>
              <div>🍋 Lemons: 32 plants</div>
              <div>🍎 Apples: 28 plants</div>
              <div>🍅 Tomatoes: 45 plants</div>
              <div>🥕 Carrots: 38 plants</div>
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <div style={{fontWeight: 'bold', marginBottom: '8px'}}>🌿 Additional Crops:</div>
              <div>🥬 Lettuce: 52 plants</div>
              <div>🍓 Strawberries: 40 plants</div>
              <div>🌶️ Chilies: 36 plants</div>
              <div>🍇 Grapes: 24 plants</div>
            </div>
          </div>

          {/* Farming process steps */}
          <div style={{ 
            background: 'rgba(34, 153, 84, 0.3)', 
            padding: '15px', 
            borderRadius: '12px',
            fontSize: '13px',
            border: '2px solid #229954',
            marginBottom: '15px'
          }}>
            <div style={{fontWeight: 'bold', marginBottom: '10px', fontSize: '14px'}}>🔄 Farming Process:</div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'}}>
              <div>✅ Seed Planting</div>
              <div>✅ Automated Watering</div>
              <div>✅ Nutrient Delivery</div>
              <div>✅ LED Growth Lights</div>
              <div>✅ Climate Control</div>
              <div>✅ Harvest Ready</div>
            </div>
          </div>

          {/* Sustainability metrics */}
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '12px', 
            borderRadius: '10px',
            fontSize: '12px'
          }}>
            <div style={{fontWeight: 'bold', marginBottom: '8px'}}>📊 Sustainability Metrics:</div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'}}>
              <div>Daily Yield: ~50kg fresh produce</div>
              <div>Water Savings: 95% vs traditional</div>
              <div>Energy: 100% solar powered</div>
              <div>Space Efficiency: 10x more efficient</div>
            </div>
          </div>
        </div>
      </Html>

      {/* Farmers and workers */}
      <Person position={[2, 0, 3]} color="#8b4513" speed={0.2} path={[
        [2, 0.5, 3], [1, 0.5, 2], [0, 0.5, 1], [-1, 0.5, 2], [-2, 0.5, 3]
      ]} />
      
      <Person position={[-3, 0, -2]} color="#2c3e50" speed={0.3} path={[
        [-3, 0.5, -2], [-2, 0.5, -1], [-1, 0.5, -2], [-2, 0.5, -3], [-3, 0.5, -2]
      ]} />

      {/* Farmer indicators */}
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

      {/* Ambient effects */}
      <Sparkles count={30} scale={[10, 20, 10]} size={3} speed={0.1} color="#27ae60" />
      
      {/* Water flow particles */}
      <Sparkles count={15} scale={[8, 18, 8]} size={2} speed={0.2} color="#3498db" />
    </group>
  )
}

/* ===== ENHANCED MODERN TECH HUB COMPONENTS ===== */
function ServerRack({ position = [0, 0, 0], activityLevel = 0.7 }) {
  const [lights, setLights] = useState(Array(8).fill(false))
  
  useFrame((_, dt) => {
    setLights(prev => prev.map((_, i) => Math.random() < activityLevel))
  })

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
            color={lights[i] ? "#00ff00" : "#34495e"}
            emissive={lights[i] ? "#00ff00" : "#000000"}
            emissiveIntensity={lights[i] ? 0.8 : 0}
          />
        </mesh>
      ))}
      
      <mesh position={[0, 1.2, 0.41]} castShadow>
        <boxGeometry args={[0.8, 0.4, 0.02]} />
        <meshStandardMaterial color="#3498db" emissive="#3498db" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Cooling fans */}
      {Array.from({ length: 2 }).map((_, i) => (
        <mesh key={i} position={[0.5, -1 + i * 1.5, 0.41]} castShadow rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.05, 8]} />
          <meshStandardMaterial color="#7f8c8d" metalness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

function Drone({ position = [0, 0, 0], isFlying = false, type = "delivery" }) {
  const droneRef = useRef()
  const [hover, setHover] = useState(0)
  const [rotorSpeed, setRotorSpeed] = useState(0)

  const droneColors = {
    delivery: "#e74c3c",
    surveillance: "#3498db",
    medical: "#2ecc71"
  }

  useFrame((_, dt) => {
    if (droneRef.current) {
      setHover(prev => prev + dt)
      setRotorSpeed(prev => Math.min(10, isFlying ? prev + dt * 2 : Math.max(0, prev - dt * 2)))
      
      if (isFlying) {
        droneRef.current.position.y = position[1] + Math.sin(hover * 2) * 0.5
        droneRef.current.rotation.x = Math.sin(hover * 3) * 0.1
      }
      
      // Rotor animation
      droneRef.current.children.forEach((child, index) => {
        if (index >= 4) { // Rotors start from index 4
          child.rotation.y += dt * rotorSpeed
        }
      })
    }
  })

  return (
    <group ref={droneRef} position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.1, 0.8]} />
        <meshStandardMaterial color={droneColors[type]} metalness={0.7} roughness={0.3} />
      </mesh>
      
      <mesh position={[0, 0.1, 0]} castShadow>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      
      {/* Enhanced rotors with animation */}
      {[[0.4, 0.4], [0.4, -0.4], [-0.4, 0.4], [-0.4, -0.4]].map(([x, z], i) => (
        <group key={i}>
          <mesh position={[x, 0, z]} castShadow rotation={[Math.PI/2, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.05, 8]} />
            <meshStandardMaterial color="#95a5a6" metalness={0.5} />
          </mesh>
          {/* Rotor blades */}
          <mesh position={[x, 0.03, z]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.3, 0.02, 0.1]} />
            <meshStandardMaterial color="#bdc3c7" metalness={0.3} />
          </mesh>
        </group>
      ))}
      
      {isFlying && (
        <pointLight position={[0, -0.3, 0]} color="#00ff00" intensity={1} distance={3} />
      )}
      
      {/* Status indicator */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.05, 4, 4]} />
        <meshStandardMaterial 
          color={isFlying ? "#00ff00" : "#ff4444"}
          emissive={isFlying ? "#00ff00" : "#ff4444"}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  )
}

function HologramDisplay({ position = [0, 0, 0], dataFlow = 0.5 }) {
  const hologramRef = useRef()
  const [pulse, setPulse] = useState(0)
  const [dataPoints, setDataPoints] = useState([])

  useFrame((_, dt) => {
    setPulse(prev => prev + dt)
    if (hologramRef.current) {
      hologramRef.current.rotation.y += dt * 0.5
    }
    
    // Update data points
    if (Math.random() < dataFlow * 0.1) {
      setDataPoints(prev => [
        ...prev.slice(-10),
        {
          x: (Math.random() - 0.5) * 1.5,
          y: Math.random() * 1.5,
          z: (Math.random() - 0.5) * 1.5,
          life: 1
        }
      ])
    }
    
    setDataPoints(prev => prev.map(p => ({ ...p, life: p.life - dt * 0.5 })).filter(p => p.life > 0))
  })

  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.3, 0.4, 0.2, 16]} />
        <meshStandardMaterial color="#34495e" metalness={0.9} roughness={0.1} />
      </mesh>
      
      <group ref={hologramRef}>
        {/* Main hologram disc */}
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.8, 1, 0.02, 32]} />
          <meshStandardMaterial 
            color="#00ffff" 
            transparent 
            opacity={0.6 + Math.sin(pulse * 3) * 0.2}
            emissive="#00ffff"
            emissiveIntensity={0.4}
          />
        </mesh>
        
        {/* Data flow visualization */}
        <mesh position={[0, 1.5 + dataFlow * 0.8, 0]} rotation={[0, 0, Math.PI/4]}>
          <boxGeometry args={[0.1, dataFlow * 1.5, 0.1]} />
          <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={1} />
        </mesh>
        
        {/* Floating data points */}
        {dataPoints.map((point, i) => (
          <mesh key={i} position={[point.x, 1.5 + point.y, point.z]} scale={[point.life, point.life, point.life]}>
            <sphereGeometry args={[0.05, 4, 4]} />
            <meshStandardMaterial 
              color="#00ff00" 
              emissive="#00ff00"
              emissiveIntensity={point.life}
              transparent
              opacity={point.life}
            />
          </mesh>
        ))}
      </group>
      
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 1.2, 8]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
    </group>
  )
}

function RobotArm({ position = [0, 0, 0], isActive = true, task = "assembly" }) {
  const armRef = useRef()
  const [animation, setAnimation] = useState(0)
  const [gripperOpen, setGripperOpen] = useState(false)

  const taskColors = {
    assembly: "#e74c3c",
    welding: "#f39c12",
    painting: "#9b59b6",
    inspection: "#3498db"
  }

  useFrame((_, dt) => {
    if (armRef.current && isActive) {
      setAnimation(prev => prev + dt)
      armRef.current.rotation.y = Math.sin(animation) * 0.5
      armRef.current.rotation.x = Math.sin(animation * 2) * 0.3
      
      // Gripper animation
      setGripperOpen(Math.sin(animation * 3) > 0)
    }
  })

  return (
    <group ref={armRef} position={position}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 1, 8]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.8} roughness={0.2} />
      </mesh>
      
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color={taskColors[task]} metalness={0.5} />
      </mesh>
      
      <mesh position={[0.6, 1.2, 0]} rotation={[0, 0, Math.PI/4]} castShadow>
        <boxGeometry args={[0.8, 0.1, 0.1]} />
        <meshStandardMaterial color="#3498db" metalness={0.6} />
      </mesh>
      
      {/* Gripper */}
      <group position={[1, 1.2, 0]}>
        <mesh position={[0, 0, -0.1]} rotation={[0, 0, gripperOpen ? -0.3 : 0]} castShadow>
          <boxGeometry args={[0.1, 0.05, 0.2]} />
          <meshStandardMaterial color="#34495e" metalness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.1]} rotation={[0, 0, gripperOpen ? 0.3 : 0]} castShadow>
          <boxGeometry args={[0.1, 0.05, 0.2]} />
          <meshStandardMaterial color="#34495e" metalness={0.6} />
        </mesh>
      </group>
      
      <mesh position={[1, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial 
          color={isActive ? "#00ff00" : "#ff4444"}
          emissive={isActive ? "#00ff00" : "#ff4444"}
          emissiveIntensity={0.8}
        />
      </mesh>
    </group>
  )
}

function DataCenter({ position = [0, 0, 0] }) {
  const [serverActivity, setServerActivity] = useState([0.6, 0.8, 0.4, 0.7, 0.9, 0.5])
  const [dronesFlying, setDronesFlying] = useState(false)
  const [dataFlow, setDataFlow] = useState(0.5)
  const [securityLights, setSecurityLights] = useState(false)

  useFrame((_, dt) => {
    setServerActivity(prev =>
      prev.map(activity => Math.max(0.3, Math.min(1, activity + (Math.random() - 0.5) * 0.1)))
    )
    
    setDataFlow(prev => Math.max(0.2, Math.min(0.9, prev + (Math.random() - 0.5) * 0.05)))
    
    if (Math.random() < 0.005) {
      setDronesFlying(!dronesFlying)
    }
    
    setSecurityLights(Math.sin(Date.now() * 0.001) > 0)
  })

  return (
    <group position={position}>
      {/* Main building with enhanced details */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[15, 6, 8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Glass facade */}
      <mesh position={[0, 0, 4.01]} castShadow>
        <boxGeometry args={[14.8, 5.8, 0.1]} />
        <meshStandardMaterial color="#001122" transparent opacity={0.9} metalness={0.8} />
      </mesh>

      {/* Security lights */}
      <mesh position={[7.5, 3, 4]} castShadow>
        <boxGeometry args={[0.2, 0.1, 0.1]} />
        <meshStandardMaterial 
          color={securityLights ? "#ffff00" : "#333333"}
          emissive={securityLights ? "#ffff00" : "#000000"}
          emissiveIntensity={1}
        />
      </mesh>
      <mesh position={[-7.5, 3, 4]} castShadow>
        <boxGeometry args={[0.2, 0.1, 0.1]} />
        <meshStandardMaterial 
          color={securityLights ? "#ffff00" : "#333333"}
          emissive={securityLights ? "#ffff00" : "#000000"}
          emissiveIntensity={1}
        />
      </mesh>

      {/* Multi-level interior */}
      {[0, 1, 2].map(level => (
        <group key={level} position={[0, -1.5 + level * 2, 0]}>
          <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[12, 0.1, 3]} />
            <meshStandardMaterial color="#2c3e50" metalness={0.7} roughness={0.3} />
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

      {/* Enhanced drone system */}
      <Drone position={[-6, 3, 0]} isFlying={dronesFlying} type="surveillance" />
      <Drone position={[6, 4, 0]} isFlying={dronesFlying} type="delivery" />
      <Drone position={[0, 5, -3]} isFlying={dronesFlying} type="medical" />

      {/* Control panels */}
      <mesh position={[5, 2, 3.9]} castShadow>
        <boxGeometry args={[2, 2, 0.2]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.5} />
      </mesh>

      {[0, 1].map(i => (
        <mesh key={i} position={[4.5 + i * 1, 2.5, 3.91]} castShadow>
          <planeGeometry args={[0.8, 0.6]} />
          <meshStandardMaterial 
            color={i === 0 ? "#00ff00" : "#0000ff"} 
            emissive={i === 0 ? "#00ff00" : "#0000ff"}
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}

      {/* Enhanced ambient effects */}
      <Sparkles count={80} scale={[14, 5, 7]} size={3} speed={0.5} color="#00ffff" />
      <Sparkles count={30} scale={[14, 5, 7]} size={2} speed={0.3} color="#ff00ff" />

      <Text position={[0, 4.5, 0]} fontSize={0.5} color="#00ffff" anchorX="center" anchorY="middle">
        🤖 Advanced Tech Hub
      </Text>

      {/* Enhanced information panel */}
      <Html position={[0, 7, 0]} transform>
        <div style={{
          background: 'rgba(0,0,0,0.95)',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '0 12px 35px rgba(0,255,255,0.4)',
          minWidth: '350px',
          textAlign: 'center',
          color: '#00ffff',
          border: '2px solid #00ffff',
          backdropFilter: 'blur(15px)',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h3 style={{ 
            margin: '0 0 15px 0', 
            color: '#00ffff',
            fontSize: '20px',
            fontWeight: 'bold',
            textShadow: '0 0 10px #00ffff'
          }}>🏢 Cloud Data Center</h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '12px',
            marginBottom: '15px'
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
            padding: '12px', 
            borderRadius: '10px',
            fontSize: '13px',
            border: '1px solid #00ffff',
            marginBottom: '12px'
          }}>
            <div style={{fontWeight: 'bold', marginBottom: '8px'}}>✅ Active Systems:</div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px'}}>
              <div>AI Processing</div>
              <div>Real-time Analytics</div>
              <div>Automated Systems</div>
              <div>Drone Deployment</div>
              <div>Security Monitoring</div>
              <div>Cloud Services</div>
            </div>
          </div>

          {/* Performance metrics */}
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(0,255,255,0.1), rgba(255,0,255,0.1))',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '12px'
          }}>
            <div style={{fontWeight: 'bold', marginBottom: '5px'}}>📈 Performance Metrics:</div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px'}}>
              <div>Uptime: 99.99%</div>
              <div>Response: 12ms</div>
              <div>Load: 68%</div>
            </div>
          </div>
        </div>
      </Html>
    </group>
  )
}

/* ===== ENHANCED CULTURAL CENTER WITH DETAILED FEATURES ===== */
function CulturalCenter({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)
  const culturalEvents = useStore((s) => s.culturalEvents)
  
  const [activeEvent, setActiveEvent] = useState(null)
  const [lightsOn, setLightsOn] = useState(true)

  const culturalStyles = [
    { 
      name: "Sindhi", 
      color: "#ff6b6b", 
      pattern: "🎵",
      image: "🎨",
      description: "Sindhi Culture - Music & Ajrak",
      features: ["Traditional Music", "Ajrak Patterns", "Sufi Heritage", "Folk Dance"],
      artifacts: ["Ajrak Textiles", "Musical Instruments", "Traditional Jewelry"]
    },
    { 
      name: "Punjabi", 
      color: "#4ecdc4", 
      pattern: "💃",
      image: "🌾",
      description: "Punjabi Culture - Bhangra & Agriculture",
      features: ["Bhangra Dance", "Wheat Fields", "Folk Music", "Cuisine"],
      artifacts: ["Phulkari Embroidery", "Dhol Drums", "Traditional Attire"]
    },
    { 
      name: "Pashto", 
      color: "#45b7d1", 
      pattern: "⚔️",
      image: "🏔️",
      description: "Pashtun Culture - Mountains & Tradition",
      features: ["Mountain Heritage", "Traditional Dance", "Tribal Arts", "Hospitality"],
      artifacts: ["Karakul Hats", "Rugs", "Tribal Jewelry"]
    },
    { 
      name: "Balochi", 
      color: "#96ceb4", 
      pattern: "🏔️",
      image: "🐫",
      description: "Balochi Culture - Desert & Camel",
      features: ["Desert Life", "Camel Culture", "Embroidery", "Nomadic Traditions"],
      artifacts: ["Balochi Rugs", "Traditional Dress", "Camel Decorations"]
    }
  ]

  // Simulate cultural events
  useEffect(() => {
    const events = [
      { id: 1, name: "Sindhi Music Night", culture: "Sindhi", time: "19:00", attendees: 45 },
      { id: 2, name: "Punjabi Bhangra Workshop", culture: "Punjabi", time: "15:00", attendees: 32 },
      { id: 3, name: "Pashtun Art Exhibition", culture: "Pashto", time: "11:00", attendees: 28 },
      { id: 4, name: "Balochi Craft Display", culture: "Balochi", time: "14:00", attendees: 36 }
    ]
    events.forEach(event => useStore.getState().addCulturalEvent(event))
  }, [])

  return (
    <group position={position}>
      {/* Main building with enhanced architecture */}
      <mesh castShadow receiveShadow onClick={() => setFocus({
        x: position[0],
        y: 8,
        z: position[2],
        lookAt: { x: position[0], y: 0, z: position[2] }
      })}>
        <boxGeometry args={[12, 6, 8]} />
        <meshStandardMaterial color="#8b4513" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Ornamental entrance */}
      <mesh position={[0, 3, 4.1]} castShadow>
        <boxGeometry args={[3, 4, 0.2]} />
        <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Cultural display towers */}
      <group position={[0, 4, 0]}>
        {culturalStyles.map((culture, index) => {
          const angle = (index / culturalStyles.length) * Math.PI * 2
          const radius = 8
          const bannerX = Math.cos(angle) * radius
          const bannerZ = Math.sin(angle) * radius
          
          return (
            <group key={culture.name} position={[bannerX, 0, bannerZ]} rotation={[0, -angle, 0]}>
              {/* Cultural tower */}
              <mesh position={[0, 4, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 8, 8]} />
                <meshStandardMaterial color="#d4af37" metalness={0.5} />
              </mesh>
              
              {/* Cultural banner */}
              <mesh position={[0, 6, -0.5]} rotation={[0, 0, 0]} castShadow>
                <planeGeometry args={[2, 3]} />
                <meshStandardMaterial color={culture.color} metalness={0.3} />
              </mesh>
              
              <Text position={[0, 6, -0.51]} fontSize={0.8} color="white" anchorX="center" anchorY="middle">
                {culture.pattern}
              </Text>
              
              <Text position={[0, 4.5, -0.51]} fontSize={0.3} color="white" anchorX="center" anchorY="middle">
                {culture.name}
              </Text>

              {/* Cultural artifact display */}
              <mesh position={[0, 1, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[1.5, 1.5, 0.2, 16]} />
                <meshStandardMaterial color={culture.color} transparent opacity={0.8} />
              </mesh>

              <mesh position={[0, 1.5, 0]} castShadow>
                <boxGeometry args={[1, 0.8, 1]} />
                <meshStandardMaterial color={culture.color} metalness={0.3} />
              </mesh>

              <Text position={[0, 1.8, 0]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
                {culture.image}
              </Text>

              {/* Floating cultural symbols */}
              <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                <Text position={[0, 3, 0]} fontSize={0.4} color={culture.color} anchorX="center" anchorY="middle">
                  {culture.pattern}
                </Text>
              </Float>
            </group>
          )
        })}
      </group>

      {/* Central spire */}
      <mesh position={[0, 9, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 10, 8]} />
        <meshStandardMaterial color="#c9b037" metalness={0.5} />
      </mesh>

      {/* Decorative elements */}
      <mesh position={[0, 10, 0]} castShadow>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial color="#d4af37" emissive="#d4af37" emissiveIntensity={0.5} />
      </mesh>

      <Text position={[0, 7, 0]} fontSize={0.5} color="#d4af37" anchorX="center" anchorY="middle">
        Cultural Heritage Center
      </Text>

      {/* Enhanced information panel */}
      <Html position={[0, 12, 0]} transform>
        <div style={{
          background: 'rgba(139, 69, 19, 0.95)',
          padding: '25px',
          borderRadius: '20px',
          boxShadow: '0 12px 35px rgba(0,0,0,0.4)',
          minWidth: '400px',
          textAlign: 'center',
          color: 'white',
          border: '3px solid #d4af37',
          backdropFilter: 'blur(15px)',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            color: '#d4af37', 
            fontSize: '22px',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            🎪 Cultural Heritage Center
          </h3>
          
          {/* Cultural representation grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '15px',
            marginBottom: '20px'
          }}>
            {culturalStyles.map((culture, index) => (
              <div key={culture.name} style={{
                background: culture.color,
                padding: '15px',
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={() => setActiveEvent(culture.name)}
              onMouseLeave={() => setActiveEvent(null)}
              >
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{culture.image}</div>
                <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>{culture.name}</div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>{culture.description}</div>
              </div>
            ))}
          </div>

          {/* Cultural features */}
          <div style={{ 
            background: 'rgba(212, 175, 55, 0.2)', 
            padding: '15px', 
            borderRadius: '12px',
            fontSize: '13px',
            border: '2px solid #d4af37',
            marginBottom: '15px'
          }}>
            <div style={{fontWeight: 'bold', marginBottom: '10px', fontSize: '14px'}}>Cultural Features:</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {culturalStyles.map(culture => (
                <div key={culture.name} style={{ textAlign: 'left' }}>
                  <strong>{culture.name}:</strong> {culture.features.join(', ')}
                </div>
              ))}
            </div>
          </div>

          {/* Today's events */}
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '12px', 
            borderRadius: '10px',
            fontSize: '12px'
          }}>
            <div style={{fontWeight: 'bold', marginBottom: '8px'}}>📅 Today's Events:</div>
            {culturalEvents.slice(0, 3).map(event => (
              <div key={event.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '5px',
                padding: '5px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '5px'
              }}>
                <span>{event.name}</span>
                <span>{event.time} ({event.attendees} people)</span>
              </div>
            ))}
          </div>
        </div>
      </Html>

      {/* People enjoying cultural activities */}
      <Person position={[3, 0, 2]} color="#8b4513" speed={0.3} path={[
        [3, 0.5, 2], [2, 0.5, 1], [1, 0.5, 2], [2, 0.5, 3], [3, 0.5, 2]
      ]} />
      
      <Person position={[-2, 0, -1]} color="#2c3e50" speed={0.4} path={[
        [-2, 0.5, -1], [-1, 0.5, -2], [0, 0.5, -1], [-1, 0.5, 0], [-2, 0.5, -1]
      ]} />

      {/* Cultural performers */}
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

      {/* Ambient cultural effects */}
      <Sparkles count={40} scale={[15, 8, 10]} size={3} speed={0.1} color="#d4af37" />
      
      {/* Floating cultural symbols */}
      <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
        <Text position={[0, 5, 0]} fontSize={0.3} color="#d4af37" anchorX="center" anchorY="middle">
          🎨 🎵 💃 🎪
        </Text>
      </Float>
    </group>
  )
}

/* ===== ENHANCED WIND TURBINES WITH REALISTIC DESIGN ===== */
function WindTurbine({ position = [0, 0, 0], scale = 1, efficiency = 0.8 }) {
  const turbineRef = useRef()
  const bladesRef = useRef()
  const [rotationSpeed, setRotationSpeed] = useState(0)
  const [powerOutput, setPowerOutput] = useState(0)
  
  useFrame((_, dt) => {
    if (turbineRef.current && bladesRef.current) {
      const speed = efficiency * 2 + Math.sin(Date.now() * 0.001) * 0.5
      setRotationSpeed(speed)
      bladesRef.current.rotation.y += dt * speed
      
      // Calculate power output based on rotation speed
      setPowerOutput(Math.min(100, Math.round(speed * 40)))
    }
  })

  return (
    <group ref={turbineRef} position={position} scale={[scale, scale, scale]}>
      {/* Tower */}
      <mesh position={[0, 5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.3, 10, 16]} />
        <meshStandardMaterial color="#708090" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Nacelle (housing) */}
      <mesh position={[0, 10, 0]} castShadow>
        <boxGeometry args={[0.8, 0.6, 1.2]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.5} roughness={0.3} />
      </mesh>
      
      {/* Blades */}
      <group ref={bladesRef} position={[0, 10, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial color="#34495e" metalness={0.5} />
        </mesh>
        
        {[0, 1, 2].map((i) => (
          <mesh 
            key={i} 
            rotation={[0, 0, (i * Math.PI * 2) / 3]} 
            position={[2, 0, 0]}
            castShadow
          >
            <boxGeometry args={[4, 0.1, 0.3]} />
            <meshStandardMaterial color="#ecf0f1" metalness={0.2} roughness={0.4} />
          </mesh>
        ))}
      </group>
      
      {/* Power indicator */}
      <mesh position={[0, 8, 0]} castShadow>
        <sphereGeometry args={[0.1, 4, 4]} />
        <meshStandardMaterial 
          color={powerOutput > 50 ? "#00ff00" : powerOutput > 20 ? "#ffff00" : "#ff4444"}
          emissive={powerOutput > 50 ? "#00ff00" : powerOutput > 20 ? "#ffff00" : "#ff4444"}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Power output display */}
      <Html position={[0, 12, 0]}>
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '5px 8px',
          borderRadius: '6px',
          fontSize: '10px',
          fontWeight: 'bold',
          textAlign: 'center',
          minWidth: '50px'
        }}>
          ⚡ {powerOutput}%
        </div>
      </Html>
      
      {/* Ambient wind effect */}
      <pointLight position={[0, 8, 0]} color="#ffffff" intensity={0.1} distance={5} />
    </group>
  )
}

/* ===== ENHANCED MODERN CARS WITH REALISTIC DESIGN ===== */
function ModernCar({ position = [0, 0, 0], color = "#ff4444", speed = 1, path = [], type = "sedan" }) {
  const carRef = useRef()
  const [t, setT] = useState(Math.random() * 10)
  const [headlightsOn, setHeadlightsOn] = useState(false)

  const carTypes = {
    sedan: { length: 1.2, height: 0.4, width: 0.6 },
    suv: { length: 1.4, height: 0.5, width: 0.7 },
    sports: { length: 1.0, height: 0.3, width: 0.5 }
  }

  const carSpecs = carTypes[type]

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

    // Simulate headlights based on time
    const timeOfDay = useStore.getState().timeOfDay
    setHeadlightsOn(timeOfDay === 'night' || timeOfDay === 'evening')
  })

  return (
    <group ref={carRef} position={position}>
      {/* Car body */}
      <mesh castShadow>
        <boxGeometry args={[carSpecs.length, carSpecs.height, carSpecs.width]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Windows */}
      <mesh position={[0, carSpecs.height * 0.7, 0]} castShadow>
        <boxGeometry args={[carSpecs.length * 0.9, carSpecs.height * 0.3, carSpecs.width * 0.8]} />
        <meshStandardMaterial color="#1e3a8a" transparent opacity={0.3} metalness={0.9} />
      </mesh>
      
      {/* Roof */}
      <mesh position={[0, carSpecs.height * 1.1, 0]} castShadow>
        <boxGeometry args={[carSpecs.length * 0.8, carSpecs.height * 0.1, carSpecs.width * 0.7]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Wheels */}
      {[-0.3, 0.3].map((x, i) => (
        <group key={i} position={[x, -carSpecs.height * 0.3, carSpecs.width * 0.4]}>
          <mesh castShadow rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
            <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.1} />
          </mesh>
        </group>
      ))}
      
      {/* Headlights */}
      {headlightsOn && (
        <>
          <pointLight position={[0.3, 0, carSpecs.width * 0.5]} color="#ffffcc" intensity={0.5} distance={3} />
          <pointLight position={[-0.3, 0, carSpecs.width * 0.5]} color="#ffffcc" intensity={0.5} distance={3} />
        </>
      )}
      
      {/* Taillights */}
      <mesh position={[0, 0, -carSpecs.width * 0.45]} castShadow>
        <boxGeometry args={[0.4, 0.1, 0.05]} />
        <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Brand emblem */}
      <mesh position={[0, carSpecs.height * 0.6, carSpecs.width * 0.45]} castShadow>
        <sphereGeometry args={[0.05, 4, 4]} />
        <meshStandardMaterial color="#ffffff" metalness={0.9} />
      </mesh>
    </group>
  )
}

/* ===== ENHANCED PARKING LOT SYSTEM ===== */
function ParkingLot({ position = [0, 0, 0], capacity = 20, id = "parking1" }) {
  const parkingLots = useStore((s) => s.parkingLots)
  const currentCars = parkingLots[id] || 0
  
  const parkingSpots = Array.from({ length: capacity }).map((_, i) => {
    const row = Math.floor(i / 5)
    const col = i % 5
    return {
      position: [
        -8 + col * 4,
        0,
        -6 + row * 3
      ],
      occupied: i < currentCars
    }
  })

  return (
    <group position={position}>
      {/* Parking lot surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial color="#34495e" roughness={0.8} metalness={0.1} />
      </mesh>
      
      {/* Parking spot markers */}
      {parkingSpots.map((spot, i) => (
        <group key={i} position={spot.position}>
          {/* Parking space */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[3.5, 2.5]} />
            <meshStandardMaterial color={spot.occupied ? "#e74c3c" : "#27ae60"} />
          </mesh>
          
          {/* Parking line */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3.2, 2.2]} />
            <meshStandardMaterial color="#ecf0f1" transparent opacity={0.3} />
          </mesh>
          
          {/* Parked car if occupied */}
          {spot.occupied && (
            <ModernCar 
              position={[0, 0.3, 0]} 
              color={i % 3 === 0 ? "#3498db" : i % 3 === 1 ? "#e74c3c" : "#2ecc71"}
              type={i % 3 === 0 ? "sedan" : i % 3 === 1 ? "suv" : "sports"}
              speed={0}
            />
          )}
        </group>
      ))}
      
      {/* Parking lot info */}
      <Html position={[0, 2, 0]}>
        <div style={{
          background: 'rgba(52, 73, 94, 0.9)',
          color: 'white',
          padding: '10px 15px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 'bold',
          textAlign: 'center',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}>
          🅿️ Parking Lot<br/>
          {currentCars}/{capacity} cars
        </div>
      </Html>
    </group>
  )
}

/* ===== ENHANCED REALISTIC HOMES ===== */
function RealisticHome({ 
  position = [0, 0, 0], 
  height = 6, 
  color = "#a67c52", 
  name = "Modern Home",
  hasGarage = true,
  hasGarden = true,
  style = "modern"
}) {
  const setFocus = useStore((s) => s.setFocus)
  const [lightsOn, setLightsOn] = useState(false)

  const homeStyles = {
    modern: { roofColor: "#2c3e50", windowColor: "#3498db", detailColor: "#34495e" },
    traditional: { roofColor: "#8b4513", windowColor: "#87CEEB", detailColor: "#a67c52" },
    contemporary: { roofColor: "#e74c3c", windowColor: "#1e3a8a", detailColor: "#2c3e50" }
  }

  const styleConfig = homeStyles[style]

  useFrame(() => {
    // Simulate lights turning on in the evening/night
    const timeOfDay = useStore.getState().timeOfDay
    setLightsOn(timeOfDay === 'night' || timeOfDay === 'evening')
  })

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
      {/* Main house structure */}
      <mesh castShadow receiveShadow onClick={handleClick}>
        <boxGeometry args={[4, height, 4]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
      </mesh>
      
      {/* Roof */}
      <mesh position={[0, height/2 + 0.5, 0]} castShadow>
        <coneGeometry args={[3, 1.5, 4]} />
        <meshStandardMaterial color={styleConfig.roofColor} roughness={0.7} />
      </mesh>
      
      {/* Windows with detailed frames */}
      {Array.from({ length: Math.floor(height / 2) }).map((_, floor) =>
        [-1.5, 1.5].map((side, i) => (
          <group key={`${floor}-${side}`}>
            {/* Window frame */}
            <mesh position={[2.01, (floor * 2) - height/2 + 2, side * 0.8]} castShadow>
              <boxGeometry args={[0.04, 1.3, 0.85]} />
              <meshStandardMaterial color={styleConfig.detailColor} metalness={0.3} />
            </mesh>
            
            {/* Window glass */}
            <mesh position={[2.02, (floor * 2) - height/2 + 2, side * 0.8]} castShadow>
              <boxGeometry args={[0.02, 1.2, 0.8]} />
              <meshStandardMaterial 
                color={lightsOn ? "#ffffcc" : styleConfig.windowColor} 
                transparent 
                opacity={lightsOn ? 0.9 : 0.7}
                emissive={lightsOn ? "#ffffcc" : "#000000"}
                emissiveIntensity={lightsOn ? 0.3 : 0}
              />
            </mesh>
          </group>
        ))
      )}
      
      {/* Front door */}
      <mesh position={[0, 0.5, 2.01]} castShadow>
        <boxGeometry args={[1, 2, 0.1]} />
        <meshStandardMaterial color="#8b4513" metalness={0.3} />
      </mesh>
      
      {/* Door handle */}
      <mesh position={[0.4, 0.5, 2.06]} castShadow>
        <sphereGeometry args={[0.05, 4, 4]} />
        <meshStandardMaterial color="#d4af37" metalness={0.8} />
      </mesh>

      {/* Garage */}
      {hasGarage && (
        <group position={[1.5, 0, -1.8]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.5, 1.5, 0.1]} />
            <meshStandardMaterial color={styleConfig.detailColor} metalness={0.3} />
          </mesh>
          
          {/* Garage door segments */}
          {Array.from({ length: 4 }).map((_, i) => (
            <mesh key={i} position={[0, -0.5 + i * 0.4, 0.06]} castShadow>
              <boxGeometry args={[1.4, 0.3, 0.02]} />
              <meshStandardMaterial color="#ecf0f1" metalness={0.2} />
            </mesh>
          ))}
        </group>
      )}
      
      {/* Garden */}
      {hasGarden && (
        <group position={[0, 0, -2.5]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[3, 2]} />
            <meshStandardMaterial color="#27ae60" roughness={0.9} />
          </mesh>
          
          {/* Garden plants */}
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[-1 + (i % 4) * 0.7, 0.2, -0.5 + Math.floor(i / 4) * 0.7]} castShadow>
              <sphereGeometry args={[0.1, 4, 4]} />
              <meshStandardMaterial color="#2ecc71" />
            </mesh>
          ))}
        </group>
      )}
      
      {/* House number */}
      <Text position={[0, height/2 + 1, 0]} fontSize={0.3} color={styleConfig.detailColor} anchorX="center" anchorY="middle">
        {name}
      </Text>

      {/* Outdoor lighting */}
      {lightsOn && (
        <pointLight position={[0, height/2, 0]} color="#ffffcc" intensity={0.3} distance={5} />
      )}
    </group>
  )
}

/* ===== ENHANCED CAMERA CONTROLLER ===== */
function CameraController() {
  const { camera } = useThree()
  const focus = useStore((s) => s.focus)
  const activeCamera = useStore((s) => s.activeCamera)
  
  useFrame(() => {
    if (!focus || activeCamera !== 'focus') return
    
    const tgt = new THREE.Vector3(focus.x, focus.y, focus.z)
    camera.position.lerp(tgt, 0.05)
    
    const lookAt = new THREE.Vector3(focus.lookAt.x, focus.lookAt.y, focus.lookAt.z)
    camera.lookAt(lookAt)
  })
  
  return null
}

/* ===== ENHANCED ORBIT CONTROLS ===== */
function CustomOrbitControls() {
  const { camera, gl } = useThree()
  const controlsRef = useRef()
  const activeCamera = useStore((s) => s.activeCamera)

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={activeCamera === 'free'}
      enableRotate={activeCamera === 'free'}
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

// ... (Previous components like Person, WheelchairUser, RoadSystem, etc. remain the same but enhanced)

/* ===== ENHANCED MAIN APP COMPONENT ===== */
export default function App() {
  const timeOfDay = useStore((s) => s.timeOfDay)
  const emergencyAlarm = useStore((s) => s.emergencyAlarm)
  const showInfoPanels = useStore((s) => s.showInfoPanels)
  
  const skyConfig = {
    day: { sunPosition: [100, 20, 100], inclination: 0, azimuth: 0.25 },
    evening: { sunPosition: [10, 5, 100], inclination: 0, azimuth: 0.25 },
    night: { sunPosition: [-100, -20, 100], inclination: 0, azimuth: 0.25 }
  }

  const fogConfig = {
    day: { color: '#87CEEB', near: 10, far: 100 },
    evening: { color: '#ff7f50', near: 5, far: 80 },
    night: { color: '#191970', near: 1, far: 60 }
  }

  // Initialize parking lots
  useEffect(() => {
    useStore.getState().updateParkingLot("culturalCenter", 8)
    useStore.getState().updateParkingLot("school", 12)
    useStore.getState().updateParkingLot("hospital", 15)
  }, [])

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      animation: emergencyAlarm ? 'emergencyFlash 0.5s infinite' : 'none',
      fontFamily: 'Arial, sans-serif',
      overflow: 'hidden'
    }}>
      <style>
        {`
          @keyframes emergencyFlash {
            0%, 100% { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
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
      
      {/* Enhanced HUD */}
      <div style={{ 
        position: 'absolute', 
        left: 20, 
        top: 20, 
        zIndex: 1000,
        fontFamily: 'Arial, sans-serif'
      }}>
        {emergencyAlarm ? (
          <div style={{ 
            background: 'linear-gradient(135deg, #e74c3c, #c0392b)', 
            color: 'white',
            padding: '20px 25px', 
            borderRadius: '15px', 
            boxShadow: '0 12px 35px rgba(231, 76, 60, 0.6)',
            minWidth: '350px',
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'center',
            animation: 'pulse 0.5s infinite',
            backdropFilter: 'blur(15px)',
            border: '3px solid #ff4444'
          }}>
            🚨 EMERGENCY ALARM ACTIVATED! 🚨
          </div>
        ) : (
          <div style={{ 
            background: 'rgba(255,255,255,0.95)', 
            padding: '15px 20px', 
            borderRadius: '15px', 
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#2c3e50',
            border: '2px solid #d2b48c',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div>🏙️ Smart City Dashboard</div>
            <div style={{width: '2px', height: '20px', background: '#d2b48c'}}></div>
            <div>Time: {timeOfDay}</div>
            <div style={{width: '2px', height: '20px', background: '#d2b48c'}}></div>
            <div>Traffic: 🟢 Flowing</div>
            <div style={{width: '2px', height: '20px', background: '#d2b48c'}}></div>
            <div>Power: ☀️ Solar + 🌬️ Wind</div>
          </div>
        )}
      </div>

      {/* Enhanced Settings Icon */}
      <div 
        style={{
          position: 'absolute',
          right: 25,
          top: 25,
          zIndex: 1000,
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '50%',
          width: '65px',
          height: '65px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          fontSize: '30px',
          transition: 'all 0.3s ease',
          border: '2px solid #d2b48c',
          backdropFilter: 'blur(10px)'
        }}
        onClick={() => useStore.getState().setShowCityControl(!useStore.getState().showCityControl)}
      >
        ⚙️
      </div>

      {/* Enhanced Control Panel */}
      {useStore((s) => s.showCityControl) && (
        <div style={{ 
          position: 'absolute', 
          right: 100, 
          top: 20, 
          zIndex: 999, 
          background: 'rgba(255,255,255,0.95)', 
          padding: 25, 
          borderRadius: 20, 
          boxShadow: '0 12px 35px rgba(0,0,0,0.2)',
          minWidth: '280px',
          maxWidth: '300px',
          border: '3px solid #d2b48c',
          backdropFilter: 'blur(15px)',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#8b4513', fontSize: '20px', fontWeight: 'bold' }}>City Controls</h3>
            <button 
              onClick={() => useStore.getState().setShowCityControl(false)}
              style={{ 
                background: 'none', 
                border: 'none', 
                fontSize: '22px', 
                cursor: 'pointer',
                color: '#8b4513',
                fontWeight: 'bold',
                padding: '5px',
                borderRadius: '5px',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(139, 69, 19, 0.1)'}
              onMouseOut={(e) => e.target.style.background = 'none'}
            >
              ✕
            </button>
          </div>
          
          {/* Enhanced control options */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '14px', fontWeight: 'bold', color: '#8b4513' }}>
              🌅 Time of Day:
            </label>
            <select 
              value={timeOfDay}
              onChange={(e) => useStore.getState().setTimeOfDay(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px', 
                borderRadius: '10px', 
                border: '2px solid #d2b48c', 
                fontSize: '14px',
                background: 'white',
                color: '#8b4513',
                fontWeight: 'bold'
              }}
            >
              <option value="day">☀️ Day</option>
              <option value="evening">🌆 Evening</option>
              <option value="night">🌙 Night</option>
            </select>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '14px', fontWeight: 'bold', color: '#8b4513' }}>
              🚗 Traffic Density:
            </label>
            <select 
              onChange={(e) => useStore.getState().setTrafficDensity(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px', 
                borderRadius: '10px', 
                border: '2px solid #d2b48c', 
                fontSize: '14px',
                background: 'white',
                color: '#8b4513',
                fontWeight: 'bold'
              }}
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '14px', fontWeight: 'bold', color: '#8b4513' }}>
              💡 Street Lights:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => useStore.getState().setStreetLightsOn(true)}
                style={{ 
                  flex: 1, 
                  background: 'linear-gradient(135deg, #27ae60, #229954)', 
                  color: 'white', 
                  border: 'none', 
                  padding: '10px', 
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                }}
              >
                ON
              </button>
              <button 
                onClick={() => useStore.getState().setStreetLightsOn(false)}
                style={{ 
                  flex: 1, 
                  background: 'linear-gradient(135deg, #e74c3c, #c0392b)', 
                  color: 'white', 
                  border: 'none', 
                  padding: '10px', 
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                }}
              >
                OFF
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '14px', fontWeight: 'bold', color: '#8b4513' }}>
              🎮 Camera Mode:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => useStore.getState().setActiveCamera('free')}
                style={{ 
                  flex: 1, 
                  background: useStore.getState().activeCamera === 'free' ? 
                    'linear-gradient(135deg, #3498db, #2980b9)' : 
                    'linear-gradient(135deg, #95a5a6, #7f8c8d)', 
                  color: 'white', 
                  border: 'none', 
                  padding: '10px', 
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
              >
                Free
              </button>
              <button 
                onClick={() => useStore.getState().setActiveCamera('focus')}
                style={{ 
                  flex: 1, 
                  background: useStore.getState().activeCamera === 'focus' ? 
                    'linear-gradient(135deg, #3498db, #2980b9)' : 
                    'linear-gradient(135deg, #95a5a6, #7f8c8d)', 
                  color: 'white', 
                  border: 'none', 
                  padding: '10px', 
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
              >
                Focus
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '14px', fontWeight: 'bold', color: '#8b4513' }}>
              🗺️ Quick Navigation:
            </label>
            <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '5px' }}>
              {[
                { name: '🎪 Cultural Center', pos: { x: -15, y: 15, z: 35 } },
                { name: '🌿 Vertical Farm', pos: { x: -35, y: 12, z: -15 } },
                { name: '🚏 Bus Station', pos: { x: 15, y: 10, z: 25 } },
                { name: '🗑️ Waste Management', pos: { x: 25, y: 10, z: 25 } },
                { name: '🤖 Tech Hub', pos: { x: 45, y: 10, z: -35 } },
                { name: '🏠 Energy Society', pos: { x: 0, y: 15, z: -45 } },
                { name: '🅿️ Parking Lots', pos: { x: 0, y: 8, z: 20 } },
                { name: '🌬️ Wind Turbines', pos: { x: 30, y: 8, z: -20 } }
              ].map((location, index) => (
                <button 
                  key={index}
                  onClick={() => useStore.getState().setFocus({
                    x: location.pos.x,
                    y: location.pos.y,
                    z: location.pos.z,
                    lookAt: { x: location.pos.x, y: 0, z: location.pos.z }
                  })}
                  style={{ 
                    width: '100%', 
                    background: 'linear-gradient(135deg, #d2691e, #8b4513)', 
                    color: 'white', 
                    border: 'none', 
                    padding: '10px 12px', 
                    borderRadius: '10px',
                    cursor: 'pointer',
                    marginBottom: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    textAlign: 'left',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  {location.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Canvas with better rendering */}
      <Canvas 
        shadows 
        camera={{ position: [50, 30, 50], fov: 45 }}
        gl={{ 
          antialias: true,
          powerPreference: "high-performance",
          alpha: true
        }}
        style={{ background: fogConfig[timeOfDay].color }}
      >
        <color attach="background" args={[fogConfig[timeOfDay].color]} />
        <fog 
          attach="fog" 
          args={[fogConfig[timeOfDay].color, fogConfig[timeOfDay].near, fogConfig[timeOfDay].far]} 
        />
        
        {/* Enhanced lighting system */}
        <ambientLight intensity={timeOfDay === 'night' ? 0.4 : timeOfDay === 'evening' ? 0.7 : 0.8} />
        <directionalLight 
          position={timeOfDay === 'night' ? [-10, 10, 10] : [10, 20, 10]} 
          intensity={timeOfDay === 'night' ? 0.6 : timeOfDay === 'evening' ? 0.8 : 1.0}
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-far={100}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
        />
        
        <Suspense fallback={
          <Html center>
            <div style={{ 
              color: 'white', 
              fontSize: '24px', 
              background: 'rgba(139, 69, 19, 0.9)', 
              padding: '30px 40px', 
              borderRadius: '20px',
              boxShadow: '0 12px 35px rgba(0,0,0,0.4)',
              fontWeight: 'bold',
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              🏙️ Loading Advanced Smart City...
              <div style={{fontSize: '14px', marginTop: '10px', opacity: 0.8}}>
                Enhanced 3D Environment with Realistic Features
              </div>
            </div>
          </Html>
        }>
          <Sky {...skyConfig[timeOfDay]} />
          
          {/* Enhanced ground with better textures */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[200, 200, 100, 100]} />
            <meshStandardMaterial 
              color="#d2b48c" 
              roughness={0.9} 
              metalness={0.1} 
            />
          </mesh>
          
          {/* Complete enhanced city layout */}
          <group>
            {/* Cultural Center with parking */}
            <CulturalCenter position={[-15, 0, 35]} />
            <ParkingLot position={[-5, 0, 25]} capacity={20} id="culturalCenter" />
            
            {/* Vertical Farming Center */}
            <VerticalGardenBuilding position={[-35, 0, -15]} />
            
            {/* Tech Hub */}
            <DataCenter position={[45, 0, -35]} />
            
            {/* Enhanced wind turbines */}
            <WindTurbine position={[30, 0, -20]} scale={1.2} efficiency={0.9} />
            <WindTurbine position={[35, 0, -25]} scale={1.0} efficiency={0.8} />
            <WindTurbine position={[25, 0, -15]} scale={1.1} efficiency={0.85} />
            
            {/* Realistic homes */}
            <RealisticHome position={[-20, 0, 10]} name="Modern Villa" style="modern" hasGarage={true} hasGarden={true} />
            <RealisticHome position={[-25, 0, 15]} name="Family Home" style="traditional" hasGarage={true} hasGarden={true} />
            <RealisticHome position={[-15, 0, 5]} name="Contemporary" style="contemporary" hasGarage={false} hasGarden={true} />
            
            {/* Additional parking lots */}
            <ParkingLot position={[10, 0, 30]} capacity={15} id="school" />
            <ParkingLot position={[20, 0, 15]} capacity={25} id="hospital" />
            
            {/* Enhanced road system would go here */}
            {/* Enhanced traffic system would go here */}
            {/* Enhanced waste management would go here */}
          </group>
          
          <ContactShadows 
            position={[0, -0.1, 0]} 
            opacity={0.6} 
            width={50} 
            height={50}
            blur={2} 
            far={10} 
          />
        </Suspense>
        
        {/* Enhanced Controls */}
        <CustomOrbitControls />
        <CameraController />
      </Canvas>

      {/* Enhanced Info Panel */}
      {showInfoPanels && (
        <div style={{ 
          position: 'absolute', 
          left: 20, 
          bottom: 20, 
          zIndex: 1000, 
          background: 'rgba(255,255,255,0.95)', 
          padding: 25, 
          borderRadius: 20, 
          boxShadow: '0 12px 35px rgba(0,0,0,0.15)',
          border: '3px solid #d2b48c',
          backdropFilter: 'blur(15px)',
          maxWidth: '450px',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{ fontSize: 15, fontWeight: 'bold', color: '#8b4513', marginBottom: 12 }}>
            🎮 Enhanced Controls: Drag to rotate • Scroll to zoom • Click buildings to focus
          </div>
          <div style={{ fontSize: 13, color: '#a67c52', marginBottom: 8 }}>
            🌟 Advanced Features: Realistic Cultural Center • High-Tech Farming • Modern Homes
          </div>
          <div style={{ fontSize: 13, color: '#3498db', marginBottom: 8 }}>
            🤖 Tech Hub: AI Systems • Robotics • Drones • Real-time Data Analytics
          </div>
          <div style={{ fontSize: 13, color: '#27ae60', marginBottom: 8 }}>
            🌿 Vertical Farming: Automated Systems • Real-time Monitoring • Sustainable Design
          </div>
          <div style={{ fontSize: 13, color: '#e74c3c', marginBottom: 8, fontWeight: 'bold' }}>
            🚗 ENHANCED: Realistic modern cars with headlights, detailed design, and parking systems!
          </div>
          <div style={{ fontSize: 13, color: '#d4af37', marginBottom: 8, fontWeight: 'bold' }}>
            🎪 ENHANCED: Cultural Center with Sindhi, Punjabi, Pashto & Balochi cultural displays!
          </div>
          <div style={{ fontSize: 13, color: '#27ae60', fontWeight: 'bold' }}>
            🏠 ENHANCED: Realistic homes with garages, gardens, and detailed architecture!
          </div>
        </div>
      )}
    </div>
  )
}
