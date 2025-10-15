import React, { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, useGLTF, ContactShadows, Sky, Text, Sparkles, Float, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { create } from 'zustand'

// Enhanced Zustand store
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
  waterLevel: 85,
  setWaterLevel: (level) => set({ waterLevel: level }),
  energyProduction: 1200,
  setEnergyProduction: (energy) => set({ energyProduction: energy }),
  airQuality: 95,
  setAirQuality: (quality) => set({ airQuality: quality }),
  population: 1250,
  setPopulation: (pop) => set({ population: pop })
}))

/* ----- ENHANCED VERTICAL GARDEN BUILDING ----- */
function VerticalGardenBuilding({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)
  const [plantsGrowing, setPlantsGrowing] = useState(false)
  
  const plantTypes = [
    { name: "🍋 Lemon", color: "#ffd700", height: 0.8, scale: 1.2 },
    { name: "🍎 Apple", color: "#ff4444", height: 1.2, scale: 1.1 },
    { name: "🍅 Tomato", color: "#ff6b6b", height: 0.6, scale: 0.9 },
    { name: "🥕 Carrot", color: "#ff8c00", height: 0.4, scale: 0.8 },
    { name: "🥬 Lettuce", color: "#90ee90", height: 0.3, scale: 1.0 },
    { name: "🍓 Strawberry", color: "#ff69b4", height: 0.2, scale: 0.7 },
    { name: "🌶️ Chili", color: "#ff0000", height: 0.5, scale: 0.8 },
    { name: "🍇 Grapes", color: "#9370db", height: 1.0, scale: 1.3 }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setPlantsGrowing(prev => !prev)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <group position={position}>
      {/* Modern Building Structure */}
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
        <boxGeometry args={[12, 25, 12]} />
        <meshStandardMaterial color="#34495e" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Glass Windows */}
      {Array.from({ length: 8 }).map((_, floor) => (
        <mesh key={floor} position={[0, -10 + floor * 3, 6.01]} castShadow>
          <planeGeometry args={[10, 2} />
          <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Vertical Garden Panels */}
      {[0, 1, 2, 3].map((side) => {
        const angle = (side / 4) * Math.PI * 2
        const offsetX = Math.cos(angle) * 6.1
        const offsetZ = Math.sin(angle) * 6.1
        const rotationY = angle + Math.PI

        return (
          <group key={side} position={[offsetX, 0, offsetZ]} rotation={[0, rotationY, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.4, 22, 11.8]} />
              <meshStandardMaterial color="#27ae60" metalness={0.4} roughness={0.2} />
            </mesh>

            {Array.from({ length: 7 }).map((_, level) => (
              <group key={level} position={[0.21, -9 + level * 3, 0]}>
                {Array.from({ length: 12 }).map((_, plantIndex) => {
                  const plant = plantTypes[(level * 12 + plantIndex) % plantTypes.length]
                  const plantX = -5 + plantIndex * 0.9
                  const growth = plantsGrowing ? 1.2 : 1.0
                  
                  return (
                    <group key={plantIndex} position={[0, 0.4, plantX]}>
                      {/* Plant Stem */}
                      <mesh castShadow>
                        <cylinderGeometry args={[0.08, 0.08, plant.height * growth, 8]} />
                        <meshStandardMaterial color="#228b22" />
                      </mesh>
                      
                      {/* Plant Fruit/Vegetable */}
                      <mesh position={[0, plant.height * growth/2 + 0.2, 0]} castShadow>
                        <sphereGeometry args={[0.2 * plant.scale * growth, 8, 8]} />
                        <meshStandardMaterial color={plant.color} />
                      </mesh>
                      
                      {/* Leaves */}
                      <mesh position={[0, plant.height * growth/2, 0.15]} castShadow rotation={[Math.PI/4, 0, 0]}>
                        <boxGeometry args={[0.25, 0.4, 0.03]} />
                        <meshStandardMaterial color="#32cd32" />
                      </mesh>
                    </group>
                  )
                })}
              </group>
            ))}

            {/* Watering System Pipes */}
            <mesh position={[0.25, 0, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 22, 8]} />
              <meshStandardMaterial color="#3498db" metalness={0.6} />
            </mesh>

            {/* Sprinklers */}
            {Array.from({ length: 7 }).map((_, level) => (
              <mesh key={level} position={[0.3, -8 + level * 3, 5]} castShadow>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshStandardMaterial color="#2980b9" metalness={0.5} />
              </mesh>
            ))}
          </group>
        )
      })}

      {/* Rooftop Garden */}
      <group position={[0, 12.5, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[12.2, 0.4, 12.2]} />
          <meshStandardMaterial color="#27ae60" metalness={0.4} />
        </mesh>

        {/* Rooftop Plant Beds */}
        {[-3, 0, 3].map((x) =>
          [-3, 0, 3].map((z) => (
            <group key={`${x}-${z}`} position={[x, 0.3, z]}>
              <mesh castShadow>
                <cylinderGeometry args={[1, 1, 0.6, 16]} />
                <meshStandardMaterial color="#8b4513" />
              </mesh>
              
              <mesh position={[0, 0.35, 0]} castShadow>
                <cylinderGeometry args={[0.9, 0.9, 0.4, 16]} />
                <meshStandardMaterial color="#a67c52" />
              </mesh>

              <mesh position={[0, 1.5, 0]} castShadow>
                <cylinderGeometry args={[0.12, 0.12, 2.5, 8]} />
                <meshStandardMaterial color="#228b22" />
              </mesh>
              
              <mesh position={[0, 3, 0]} castShadow>
                <sphereGeometry args={[0.9, 8, 8]} />
                <meshStandardMaterial color={plantTypes[(x + z + 4) % plantTypes.length].color} />
              </mesh>
            </group>
          ))
        )}

        {/* Solar Panels */}
        <SolarPanel position={[5, 0.3, 5]} rotation={[0, Math.PI/4, 0]} />
        <SolarPanel position={[-5, 0.3, 5]} rotation={[0, -Math.PI/4, 0]} />
        <SolarPanel position={[5, 0.3, -5]} rotation={[0, 3*Math.PI/4, 0]} />
        <SolarPanel position={[-5, 0.3, -5]} rotation={[0, -3*Math.PI/4, 0]} />
      </group>

      {/* Water Collection System */}
      <group position={[0, 16, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[2.5, 2.2, 4, 16]} />
          <meshStandardMaterial color="#3498db" transparent opacity={0.9} />
        </mesh>
        
        <mesh position={[0, 2.2, 0]} castShadow>
          <cylinderGeometry args={[2.6, 2.6, 0.4, 16]} />
          <meshStandardMaterial color="#2980b9" />
        </mesh>

        {/* Water Pipes */}
        <mesh position={[3, 0, 0]} rotation={[0, 0, Math.PI/2]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 6, 8]} />
          <meshStandardMaterial color="#34495e" />
        </mesh>
      </group>

      <Text
        position={[0, 20, 0]}
        fontSize={0.7}
        color="#27ae60"
        anchorX="center"
        anchorY="middle"
      >
        🌿 Vertical Farm
      </Text>

      <Html position={[0, 25, 0]} transform>
        <div style={{
          background: 'rgba(39, 174, 96, 0.95)',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          minWidth: '350px',
          textAlign: 'center',
          color: 'white',
          border: '2px solid #229954',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: 'white', fontSize: '18px' }}>
            🌿 Vertical Farming Center
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '12px',
            marginBottom: '15px'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div>🍋 Lemons: 144 plants</div>
              <div>🍎 Apples: 132 plants</div>
              <div>🍅 Tomatoes: 168 plants</div>
              <div>🥕 Carrots: 156 plants</div>
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <div>🥬 Lettuce: 180 plants</div>
              <div>🍓 Strawberries: 144 plants</div>
              <div>🌶️ Chilies: 156 plants</div>
              <div>🍇 Grapes: 120 plants</div>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(34, 153, 84, 0.3)', 
            padding: '12px', 
            borderRadius: '8px',
            fontSize: '12px',
            border: '1px solid #229954',
            marginBottom: '10px'
          }}>
            <div><strong>🌱 Advanced Farming Features:</strong></div>
            <div>✅ Hydroponic Technology</div>
            <div>✅ Automated Watering System</div>
            <div>✅ Rainwater Harvesting</div>
            <div>✅ Solar Powered Operations</div>
            <div>✅ Year-round Production</div>
            <div>✅ AI Monitoring System</div>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '10px', 
            borderRadius: '6px',
            fontSize: '11px'
          }}>
            <div><strong>📊 Production Statistics:</strong></div>
            <div>Daily Yield: ~80kg fresh produce</div>
            <div>Water Savings: 85% vs traditional farming</div>
            <div>Energy: 95% solar powered</div>
            <div>Space Efficiency: 10x traditional farming</div>
          </div>
        </div>
      </Html>

      {/* Farmers/Workers */}
      <ModernPerson position={[4, 0, 5]} color="#8b4513" speed={0.2} />
      <ModernPerson position={[-4, 0, -4]} color="#2c3e50" speed={0.3} />

      {/* Delivery Area */}
      <group position={[8, 0, 0]}>
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
          <planeGeometry args={[6, 4]} />
          <meshStandardMaterial color="#7f8c8d" />
        </mesh>
        <Text position={[0, 0.12, 0]} rotation={[-Math.PI/2, 0, 0]} fontSize={0.3} color="white" anchorX="center">
          DELIVERY
        </Text>
      </group>

      <Sparkles count={30} scale={[14, 28, 14]} size={2} speed={0.1} color="#27ae60" />
      <pointLight position={[0, 10, 0]} color="#27ae60" intensity={0.3} distance={15} />
    </group>
  )
}

/* ----- ENHANCED CULTURAL CENTER ----- */
function CulturalCenter({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)
  const [lightsOn, setLightsOn] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setLightsOn(prev => !prev)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const culturalStyles = [
    { 
      name: "Sindhi", 
      color: "#ff6b6b", 
      pattern: "🎵",
      image: "🎨",
      description: "Sindhi Culture - Music & Ajrak",
      features: ["Traditional Music", "Ajrak Patterns", "Sufi Heritage", "Embroidery Art"]
    },
    { 
      name: "Punjabi", 
      color: "#4ecdc4", 
      pattern: "💃",
      image: "🌾",
      description: "Punjabi Culture - Bhangra & Agriculture",
      features: ["Bhangra Dance", "Wheat Fields", "Folk Music", "Festival Celebrations"]
    },
    { 
      name: "Pashto", 
      color: "#45b7d1", 
      pattern: "⚔️",
      image: "🏔️",
      description: "Pashtun Culture - Mountains & Tradition",
      features: ["Mountain Heritage", "Traditional Dance", "Tribal Arts", "Handicrafts"]
    },
    { 
      name: "Balochi", 
      color: "#96ceb4", 
      pattern: "🏔️",
      image: "🐫",
      description: "Balochi Culture - Desert & Camel",
      features: ["Desert Life", "Camel Culture", "Embroidery", "Nomadic Traditions"]
    },
    { 
      name: "Kashmiri", 
      color: "#ff9ff3", 
      pattern: "❄️",
      image: "🧣",
      description: "Kashmiri Culture - Valley & Shawls",
      features: ["Pashmina Shawls", "Houseboats", "Gardens", "Cuisine"]
    },
    { 
      name: "Seraiki", 
      color: "#feca57", 
      pattern: "🎭",
      image: "🎪",
      description: "Seraiki Culture - Theater & Poetry",
      features: ["Folk Theater", "Poetry", "Music", "Traditional Dress"]
    }
  ]

  return (
    <group position={position}>
      {/* Modern Cultural Center Building */}
      <mesh 
        castShadow 
        receiveShadow 
        onClick={() => setFocus({
          x: position[0],
          y: 10,
          z: position[2],
          lookAt: { x: position[0], y: 0, z: position[2] }
        })}
      >
        <boxGeometry args={[20, 12, 16]} />
        <meshStandardMaterial color="#8b4513" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Ornate Entrance */}
      <group position={[0, 0, 8]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[6, 5, 1} />
          <meshStandardMaterial color="#a67c52" metalness={0.4} />
        </mesh>
        
        <mesh position={[0, 2.5, 0.51]} castShadow>
          <planeGeometry args={[4, 3} />
          <meshStandardMaterial color="#d4af37" emissive="#d4af37" emissiveIntensity={lightsOn ? 0.5 : 0.1} />
        </mesh>

        <Text position={[0, 2.5, 0.52]} fontSize={0.4} color="#8b4513" anchorX="center" anchorY="middle">
          CULTURAL CENTER
        </Text>

        {/* Decorative Pillars */}
        {[-3, 3].map((x, i) => (
          <mesh key={i} position={[x, 3, 0.5]} castShadow>
            <cylinderGeometry args={[0.3, 0.4, 6, 8]} />
            <meshStandardMaterial color="#d4af37" metalness={0.6} />
          </mesh>
        ))}
      </group>

      {/* Cultural Display Towers */}
      <group position={[0, 6, 0]}>
        {culturalStyles.map((culture, index) => {
          const angle = (index / culturalStyles.length) * Math.PI * 2
          const radius = 14
          const towerX = Math.cos(angle) * radius
          const towerZ = Math.sin(angle) * radius
          
          return (
            <group key={culture.name} position={[towerX, 0, towerZ]} rotation={[0, -angle, 0]}>
              {/* Tower Structure */}
              <mesh position={[0, 4, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.25, 8, 8]} />
                <meshStandardMaterial color="#d4af37" metalness={0.5} />
              </mesh>
              
              {/* Cultural Banner */}
              <mesh position={[0, 6, -1]} rotation={[0, 0, 0]} castShadow>
                <planeGeometry args={[2.5, 4} />
                <meshStandardMaterial color={culture.color} metalness={0.3} />
              </mesh>
              
              <Text position={[0, 6, -1.01]} fontSize={0.8} color="white" anchorX="center" anchorY="middle">
                {culture.pattern}
              </Text>
              
              <Text position={[0, 4, -1.01]} fontSize={0.3} color="white" anchorX="center" anchorY="middle">
                {culture.name}
              </Text>

              {/* Cultural Artifact Display */}
              <mesh position={[0, 1, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[1.8, 1.8, 0.3, 16]} />
                <meshStandardMaterial color={culture.color} transparent opacity={0.8} />
              </mesh>

              <mesh position={[0, 1.5, 0]} castShadow>
                <boxGeometry args={[1.2, 0.8, 1.2]} />
                <meshStandardMaterial color={culture.color} metalness={0.3} />
              </mesh>

              <Text position={[0, 1.8, 0]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
                {culture.image}
              </Text>
            </group>
          )
        })}
      </group>

      {/* Central Dome */}
      <mesh position={[0, 8, 0]} castShadow>
        <sphereGeometry args={[4, 16, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Dome Decoration */}
      <mesh position={[0, 8, 0]} castShadow>
        <cylinderGeometry args={[4.2, 4.2, 0.3, 32]} />
        <meshStandardMaterial color="#b8860b" metalness={0.8} />
      </mesh>

      {/* Spire */}
      <mesh position={[0, 12, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.1, 6, 8]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.5} />
      </mesh>

      <Text
        position={[0, 16, 0]}
        fontSize={0.8}
        color="#d4af37"
        anchorX="center"
        anchorY="middle"
      >
        🎪 Cultural Heritage Center
      </Text>

      <Html position={[0, 20, 0]} transform>
        <div style={{
          background: 'rgba(139, 69, 19, 0.95)',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          minWidth: '400px',
          textAlign: 'center',
          color: 'white',
          border: '2px solid #d4af37',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#d4af37', fontSize: '18px' }}>
            🎪 Cultural Heritage Center
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr 1fr', 
            gap: '10px',
            marginBottom: '15px'
          }}>
            {culturalStyles.map((culture, index) => (
              <div key={culture.name} style={{
                background: culture.color,
                padding: '10px',
                borderRadius: '8px',
                textAlign: 'center',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }}>
                <div style={{ fontSize: '20px', marginBottom: '5px' }}>{culture.image}</div>
                <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{culture.name}</div>
                <div style={{ fontSize: '9px', opacity: 0.9 }}>{culture.description}</div>
              </div>
            ))}
          </div>

          <div style={{ 
            background: 'rgba(212, 175, 55, 0.2)', 
            padding: '12px', 
            borderRadius: '8px',
            fontSize: '11px',
            border: '1px solid #d4af37'
          }}>
            <div><strong>🏛️ Cultural Features:</strong></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
              {culturalStyles.map(culture => (
                <div key={culture.name} style={{ textAlign: 'left' }}>
                  <strong>{culture.name}:</strong> {culture.features.join(', ')}
                </div>
              ))}
            </div>
          </div>

          <div style={{ 
            marginTop: '10px',
            background: 'rgba(255,255,255,0.1)', 
            padding: '8px', 
            borderRadius: '6px',
            fontSize: '10px'
          }}>
            <div><strong>🎭 Daily Activities:</strong></div>
            <div>Traditional Dance Performances • Music Concerts • Art Exhibitions • Cultural Workshops</div>
          </div>
        </div>
      </Html>

      {/* Performers and Visitors */}
      <ModernPerson position={[3, 0, 3]} color="#8b4513" speed={0.3} />
      <ModernPerson position={[-3, 0, -2]} color="#2c3e50" speed={0.4} />
      <ModernPerson position={[2, 0, -3]} color="#8b4513" speed={0.2} />

      {/* Performance Stage */}
      <group position={[0, 0, -6]}>
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[8, 0.4, 4} />
          <meshStandardMaterial color="#a67c52" />
        </mesh>
        <Text position={[0, 0.5, 0]} fontSize={0.3} color="#d4af37" anchorX="center" anchorY="middle">
          STAGE
        </Text>
      </group>

      <Sparkles count={50} scale={[25, 15, 20]} size={2} speed={0.1} color="#d4af37" />
      <pointLight position={[0, 10, 0]} color="#d4af37" intensity={0.4} distance={20} />
    </group>
  )
}

/* ----- MODERN SOLAR PANEL ----- */
function SolarPanel({ position = [0, 0, 0], rotation = [0, 0, 0], isActive = true }) {
  const panelRef = useRef()
  const [pulse, setPulse] = useState(0)

  useFrame((_, dt) => {
    setPulse(prev => prev + dt)
    if (panelRef.current && isActive) {
      panelRef.current.rotation.x = Math.sin(pulse * 0.5) * 0.01
    }
  })

  return (
    <group ref={panelRef} position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[2, 0.08, 1.2} />
        <meshStandardMaterial 
          color={isActive ? "#1a237e" : "#455a64"} 
          metalness={0.9} 
          roughness={0.05}
          emissive={isActive ? "#0d47a1" : "#000000"}
          emissiveIntensity={isActive ? 0.3 : 0}
        />
      </mesh>
      
      <mesh position={[0, -0.06, 0]} castShadow>
        <boxGeometry args={[2.1, 0.12, 1.3} />
        <meshStandardMaterial color="#37474f" metalness={0.6} roughness={0.3} />
      </mesh>
      
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[1.8, 0.02, 1} />
        <meshStandardMaterial 
          color={isActive ? "#4fc3f7" : "#78909c"} 
          transparent 
          opacity={0.4}
          emissive={isActive ? "#29b6f6" : "#000000"}
          emissiveIntensity={isActive ? 0.5 : 0}
        />
      </mesh>

      {isActive && (
        <Sparkles count={8} scale={[1.8, 0.1, 1]} size={1.5} speed={0.3} color="#40c4ff" />
      )}
    </group>
  )
}

/* ----- MODERN PERSON ----- */
function ModernPerson({ position = [0, 0, 0], color = "#8b4513", speed = 1, path = [] }) {
  const personRef = useRef()
  const [t, setT] = useState(Math.random() * 10)

  useFrame((_, dt) => {
    setT(prev => prev + dt * speed)
    
    if (personRef.current && path.length > 0) {
      const tt = t % path.length
      const i = Math.floor(tt) % path.length
      const nextIndex = (i + 1) % path.length
      const a = new THREE.Vector3(...path[i])
      const b = new THREE.Vector3(...path[nextIndex])
      const f = tt % 1
      const pos = a.clone().lerp(b, f)
      
      personRef.current.position.lerp(pos, 0.1)
      
      if (b) {
        const direction = new THREE.Vector3().subVectors(b, a).normalize()
        personRef.current.lookAt(personRef.current.position.clone().add(direction))
      }
    }
  })

  return (
    <group ref={personRef} position={position}>
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1.8, 8]} />
        <meshStandardMaterial color={color} metalness={0.3} />
      </mesh>
      
      <mesh position={[0, 1.9, 0]} castShadow>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
    </group>
  )
}

/* ----- ENHANCED WASTE MANAGEMENT ----- */
function WasteManagementSystem({ position = [25, 0, 25] }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)

  useEffect(() => {
    let interval
    if (isProcessing) {
      interval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 100) {
            setIsProcessing(false)
            return 0
          }
          return prev + 1
        })
      }, 50)
    }
    return () => clearInterval(interval)
  }, [isProcessing])

  return (
    <group position={position}>
      {/* Main Processing Building */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[15, 8, 12]} />
        <meshStandardMaterial color="#27ae60" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Processing Tanks */}
      <group position={[0, 4, -2]}>
        {[-5, 0, 5].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[1.2, 1.2, 3, 16]} />
              <meshStandardMaterial color={i === 0 ? "#e74c3c" : i === 1 ? "#f39c12" : "#27ae60"} metalness={0.5} />
            </mesh>
            
            {/* Processing Animation */}
            {isProcessing && (
              <mesh position={[0, processingProgress/33 - 1.5, 0]} castShadow>
                <cylinderGeometry args={[1.1, 1.1, processingProgress/16.5, 16]} />
                <meshStandardMaterial 
                  color={i === 0 ? "#c0392b" : i === 1 ? "#e67e22" : "#229954"} 
                  transparent 
                  opacity={0.7}
                />
              </mesh>
            )}
          </group>
        ))}
      </group>

      {/* Conveyor System */}
      <group position={[0, 1, 3]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[12, 0.5, 1} />
          <meshStandardMaterial color="#7f8c8d" metalness={0.4} />
        </mesh>
        
        <mesh position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[10, 0.1, 0.8} />
          <meshStandardMaterial color="#95a5a6" />
        </mesh>
      </group>

      {/* Solar Panels */}
      <group position={[0, 4.5, 6]}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SolarPanel key={i} position={[-6 + i * 2.5, 0.5, 0]} rotation={[0, Math.PI, 0]} isActive={true} />
        ))}
      </group>

      <Text position={[0, 11, 0]} fontSize={0.6} color="#27ae60" anchorX="center" anchorY="middle">
        ♻️ Waste Management
      </Text>

      <Html position={[0, 14, 0]} transform>
        <div style={{
          background: 'rgba(39, 174, 96, 0.95)',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          minWidth: '350px',
          textAlign: 'center',
          color: 'white',
          border: '2px solid #229954',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: 'white' }}>♻️ Advanced Waste Management</h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '10px',
            marginBottom: '15px'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div>🗑️ Waste Collected: 85%</div>
              <div>🔄 Processing: {isProcessing ? 'ACTIVE' : 'READY'}</div>
              <div>🚛 Collection Trucks: 3</div>
              <div>⚡ Power: Solar</div>
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <div>♻️ Recycling Rate: 78%</div>
              <div>📉 Waste Reduction: 45%</div>
              <div>🔄 Reuse Rate: 32%</div>
              <div>🌱 Composting: 25%</div>
            </div>
          </div>

          {isProcessing && (
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              padding: '10px', 
              borderRadius: '8px',
              marginBottom: '10px'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Processing: {processingProgress}%</div>
              <div style={{ 
                background: '#34495e', 
                borderRadius: '5px', 
                height: '10px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  background: '#2ecc71', 
                  height: '100%', 
                  width: `${processingProgress}%`,
                  transition: 'width 0.1s ease'
                }}></div>
              </div>
            </div>
          )}

          <button 
            onClick={() => setIsProcessing(true)}
            disabled={isProcessing}
            style={{
              background: isProcessing ? 
                'linear-gradient(135deg, #95a5a6, #7f8c8d)' : 
                'linear-gradient(135deg, #27ae60, #229954)',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              width: '100%',
              fontWeight: 'bold',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
          >
            {isProcessing ? '🔄 PROCESSING WASTE...' : 'START WASTE PROCESSING'}
          </button>

          <div style={{ 
            marginTop: '10px',
            background: 'rgba(34, 153, 84, 0.3)', 
            padding: '10px', 
            borderRadius: '8px',
            fontSize: '11px'
          }}>
            <div><strong>🔄 3R Waste Management System</strong></div>
            <div>📉 Reduce • 🔄 Reuse • ♻️ Recycle</div>
          </div>
        </div>
      </Html>

      <Sparkles count={25} scale={[18, 10, 14]} size={2} speed={0.1} color="#27ae60" />
    </group>
  )
}

/* ----- MODERN APARTMENT BUILDING ----- */
function ModernApartment({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)
  const [lightsOn, setLightsOn] = useState([])

  useEffect(() => {
    // Initialize random lights
    const initialLights = Array.from({ length: 24 }, () => Math.random() > 0.4)
    setLightsOn(initialLights)
    
    const interval = setInterval(() => {
      setLightsOn(prev => prev.map(light => Math.random() > 0.6 ? !light : light))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <group position={position}>
      {/* Main Building */}
      <mesh castShadow receiveShadow onClick={() => setFocus({
        x: position[0], y: 8, z: position[2], lookAt: { x: position[0], y: 0, z: position[2] }
      })}>
        <boxGeometry args={[8, 16, 8]} />
        <meshStandardMaterial color="#a67c52" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Windows */}
      {Array.from({ length: 5 }).map((_, floor) => (
        <group key={floor} position={[0, -6 + floor * 3, 0]}>
          {Array.from({ length: 4 }).map((_, side) => {
            const angle = (side / 4) * Math.PI * 2
            const isFront = side === 0
            const lightIndex = floor * 4 + side
            
            return (
              <mesh key={side} position={[Math.cos(angle) * 4.01, 0, Math.sin(angle) * 4.01]} rotation={[0, -angle, 0]}>
                <planeGeometry args={[1.5, 2} />
                <meshStandardMaterial 
                  color={lightsOn[lightIndex] ? "#fff8e1" : "#1a237e"} 
                  emissive={lightsOn[lightIndex] ? "#ffecb3" : "#000000"}
                  emissiveIntensity={lightsOn[lightIndex] ? 0.6 : 0}
                  transparent
                  opacity={0.9}
                />
              </mesh>
            )
          })}
        </group>
      ))}

      {/* Balconies */}
      {Array.from({ length: 5 }).map((_, floor) => (
        <group key={floor} position={[0, -7 + floor * 3, 0]}>
          {Array.from({ length: 4 }).map((_, side) => {
            const angle = (side / 4) * Math.PI * 2
            return (
              <group key={side} position={[Math.cos(angle) * 4.1, 0, Math.sin(angle) * 4.1]} rotation={[0, -angle, 0]}>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[1.8, 0.1, 0.8} />
                  <meshStandardMaterial color="#8d6e63" />
                </mesh>
                
                {/* Balcony Railings */}
                <mesh position={[0, 0.6, -0.4]} castShadow>
                  <boxGeometry args={[1.8, 1.2, 0.05} />
                  <meshStandardMaterial color="#6d4c41" />
                </mesh>
              </group>
            )
          })}
        </group>
      ))}

      {/* Rooftop Garden */}
      <group position={[0, 9, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[8.2, 0.3, 8.2} />
          <meshStandardMaterial color="#388e3c" />
        </mesh>
        
        {/* Rooftop Planters */}
        {[-2, 0, 2].map((x) =>
          [-2, 0, 2].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, 0.2, z]} castShadow>
              <cylinderGeometry args={[0.6, 0.6, 0.4, 8]} />
              <meshStandardMaterial color="#8b4513" />
            </mesh>
          ))
        )}
      </group>

      <Text position={[0, 18, 0]} fontSize={0.5} color="#a67c52" anchorX="center" anchorY="middle">
        🏠 Modern Apartments
      </Text>

      <Html position={[0, 21, 0]} transform>
        <div style={{
          background: 'rgba(166, 124, 82, 0.95)',
          padding: '15px',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          minWidth: '250px',
          textAlign: 'center',
          color: 'white',
          border: '2px solid #8b4513',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: 'white' }}>🏠 Residential Tower</h3>
          <div>🏢 Floors: 5</div>
          <div>🏠 Apartments: 20</div>
          <div>🌿 Rooftop Garden</div>
          <div>🔒 Security: 24/7</div>
        </div>
      </Html>

      <Sparkles count={15} scale={[10, 18, 10]} size={2} speed={0.1} color="#a67c52" />
    </group>
  )
}

/* ----- ENHANCED GROUND ----- */
function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200, 50, 50]} />
        <meshStandardMaterial color="#d2b48c" roughness={0.9} metalness={0.1} />
      </mesh>
      
      {/* Roads */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 200, 1, 1]} />
        <meshStandardMaterial color="#333333" roughness={0.8} />
      </mesh>
      
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI/2]} receiveShadow>
        <planeGeometry args={[8, 200, 1, 1]} />
        <meshStandardMaterial color="#333333" roughness={0.8} />
      </mesh>

      {/* Road Markings */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.5, 200, 1, 1]} />
        <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.5} />
      </mesh>
      
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, Math.PI/2]} receiveShadow>
        <planeGeometry args={[0.5, 200, 1, 1]} />
        <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.5} />
      </mesh>

      <ContactShadows position={[0, -0.03, 0]} opacity={0.4} width={50} height={50} blur={2} far={20} />
      <gridHelper args={[200, 50, '#8b7355', '#8b7355']} position={[0, 0.01, 0]} />
    </>
  )
}

/* ----- ENHANCED CITY LAYOUT ----- */
function CityLayout() {
  return (
    <group>
      {/* Major City Components */}
      <VerticalGardenBuilding position={[-30, 0, 30]} />
      <CulturalCenter position={[30, 0, 30]} />
      <WasteManagementSystem position={[0, 0, -30]} />
      
      {/* Residential Areas */}
      <ModernApartment position={[-20, 0, 10]} />
      <ModernApartment position={[-10, 0, 15]} />
      <ModernApartment position={[10, 0, 10]} />
      <ModernApartment position={[20, 0, 15]} />
      <ModernApartment position={[-15, 0, -10]} />
      <ModernApartment position={[15, 0, -10]} />

      {/* People */}
      <ModernPerson position={[5, 0, 5]} color="#8b4513" speed={0.2} />
      <ModernPerson position={[-5, 0, 8]} color="#2c3e50" speed={0.3} />
      <ModernPerson position={[8, 0, -5]} color="#8b4513" speed={0.4} />
      <ModernPerson position={[-8, 0, -8]} color="#2c3e50" speed={0.25} />

      {/* Street Lights */}
      {Array.from({ length: 16 }).map((_, i) => (
        <group key={i} position={[-35 + i * 5, 0, 0]}>
          <mesh position={[0, 4, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.12, 8, 8]} />
            <meshStandardMaterial color="#666666" metalness={0.6} />
          </mesh>
          <mesh position={[0, 8, 0]} castShadow>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshStandardMaterial color="#ffffcc" emissive="#ffff99" emissiveIntensity={1} />
          </mesh>
        </group>
      ))}

      <Sparkles count={100} scale={[100, 20, 100]} size={3} speed={0.1} color="#ffffff" />
    </group>
  )
}

/* ----- ENHANCED HUD ----- */
function HUD() {
  const timeOfDay = useStore((s) => s.timeOfDay)
  const waterLevel = useStore((s) => s.waterLevel)
  const energyProduction = useStore((s) => s.energyProduction)
  const airQuality = useStore((s) => s.airQuality)
  const population = useStore((s) => s.population)

  return (
    <div style={{ 
      position: 'absolute', 
      left: 20, 
      top: 20, 
      zIndex: 1000,
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        background: 'rgba(255,255,255,0.95)', 
        padding: '12px 20px', 
        borderRadius: '15px', 
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#8b4513',
        border: '2px solid #d2b48c',
        backdropFilter: 'blur(10px)',
        marginBottom: '10px'
      }}>
        🏙️ Smart City Dashboard • Time: {timeOfDay} • Population: {population}
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ 
          background: 'rgba(255,255,255,0.9)', 
          padding: '10px', 
          borderRadius: '10px', 
          textAlign: 'center',
          minWidth: '80px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '5px' }}>💧</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#3498db' }}>{waterLevel}%</div>
          <div style={{ fontSize: '11px', color: '#7f8c8d' }}>Water</div>
        </div>
        
        <div style={{ 
          background: 'rgba(255,255,255,0.9)', 
          padding: '10px', 
          borderRadius: '10px', 
          textAlign: 'center',
          minWidth: '80px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '5px' }}>⚡</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#f39c12' }}>{energyProduction}kW</div>
          <div style={{ fontSize: '11px', color: '#7f8c8d' }}>Energy</div>
        </div>
        
        <div style={{ 
          background: 'rgba(255,255,255,0.9)', 
          padding: '10px', 
          borderRadius: '10px', 
          textAlign: 'center',
          minWidth: '80px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '5px' }}>🌱</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#27ae60' }}>{airQuality}%</div>
          <div style={{ fontSize: '11px', color: '#7f8c8d' }}>Air Quality</div>
        </div>
      </div>
    </div>
  )
}

/* ----- SETTINGS PANEL ----- */
function SettingsPanel() {
  const setTimeOfDay = useStore((s) => s.setTimeOfDay)
  const setShowCityControl = useStore((s) => s.setShowCityControl)
  const showCityControl = useStore((s) => s.showCityControl)
  const setFocus = useStore((s) => s.setFocus)

  const locations = {
    '🌿 Vertical Farm': { x: -30, y: 15, z: 30, lookAt: { x: -30, y: 0, z: 30 } },
    '🎪 Cultural Center': { x: 30, y: 10, z: 30, lookAt: { x: 30, y: 0, z: 30 } },
    '♻️ Waste Management': { x: 0, y: 10, z: -30, lookAt: { x: 0, y: 0, z: -30 } },
    '🏠 Residential Area': { x: 0, y: 8, z: 10, lookAt: { x: 0, y: 0, z: 10 } }
  }

  if (!showCityControl) return null

  return (
    <div style={{ 
      position: 'absolute', 
      right: 100, 
      top: 20, 
      zIndex: 999, 
      background: 'rgba(255,255,255,0.95)', 
      padding: 20, 
      borderRadius: 15, 
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      minWidth: '250px',
      border: '2px solid #d2b48c',
      backdropFilter: 'blur(10px)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: '#8b4513', fontSize: '18px', fontWeight: 'bold' }}>City Controls</h3>
        <button 
          onClick={() => setShowCityControl(false)}
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '20px', 
            cursor: 'pointer',
            color: '#8b4513',
            fontWeight: 'bold',
            padding: '5px'
          }}
        >
          ✕
        </button>
      </div>
      
      <div style={{ marginBottom: 15 }}>
        <label style={{ display: 'block', marginBottom: 6, fontSize: '13px', fontWeight: 'bold', color: '#8b4513' }}>
          🌅 Time of Day:
        </label>
        <select 
          onChange={(e) => setTimeOfDay(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '8px', 
            borderRadius: '8px', 
            border: '2px solid #d2b48c', 
            fontSize: '13px',
            background: 'white',
            color: '#8b4513'
          }}
        >
          <option value="day">☀️ Day</option>
          <option value="evening">🌆 Evening</option>
          <option value="night">🌙 Night</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 6, fontSize: '13px', fontWeight: 'bold', color: '#8b4513' }}>
          🗺️ Quick Navigation:
        </label>
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
              fontSize: '12px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              textAlign: 'left'
            }}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ----- MAIN APP COMPONENT ----- */
export default function App() {
  const timeOfDay = useStore((s) => s.timeOfDay)
  const setShowCityControl = useStore((s) => s.setShowCityControl)

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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <style>
        {`
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
      
      <div 
        style={{
          position: 'absolute',
          right: 25,
          top: 25,
          zIndex: 1000,
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          fontSize: '28px',
          transition: 'all 0.3s ease',
          border: '2px solid #d2b48c',
          backdropFilter: 'blur(10px)'
        }}
        onClick={() => setShowCityControl(true)}
      >
        ⚙️
      </div>
      
      <SettingsPanel />

      <Canvas 
        shadows 
        camera={{ position: [50, 30, 50], fov: 45 }}
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
              🏙️ Loading Smart City...
            </div>
          </Html>
        }>
          <Sky {...skyConfig[timeOfDay]} />
          
          <Ground />
          <CityLayout />
          
          <ContactShadows 
            position={[0, -0.1, 0]} 
            opacity={0.5} 
            width={50} 
            height={50}
            blur={2} 
            far={10} 
          />
        </Suspense>
        
        <OrbitControls
          enablePan={true}
          enableRotate={true}
          enableZoom={true}
          minDistance={5}
          maxDistance={100}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
          panSpeed={0.5}
        />
      </Canvas>

      <div style={{ 
        position: 'absolute', 
        left: 20, 
        bottom: 20, 
        zIndex: 1000, 
        background: 'rgba(255,255,255,0.95)', 
        padding: 20, 
        borderRadius: '15px', 
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
        border: '2px solid #d2b48c',
        backdropFilter: 'blur(10px)',
        maxWidth: '400px'
      }}>
        <div style={{ fontSize: 14, fontWeight: 'bold', color: '#8b4513', marginBottom: 8 }}>
          🎮 Controls: Drag to rotate • Scroll to zoom • Click buildings to focus
        </div>
        <div style={{ fontSize: 12, color: '#a67c52', marginBottom: 6 }}>
          🌟 Features: Vertical Farming • Cultural Center • Waste Management
        </div>
        <div style={{ fontSize: 12, color: '#27ae60', marginBottom: 6 }}>
          🌿 Vertical Farm: Hydroponic technology with 85% water savings
        </div>
        <div style={{ fontSize: 12, color: '#d4af37', marginBottom: 6 }}>
          🎪 Cultural Center: 6 regional cultures with traditional arts
        </div>
        <div style={{ fontSize: 12, color: '#3498db' }}>
          ⚙️ Click settings icon (top-right) for city controls
        </div>
      </div>
    </div>
  )
}
