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
  setAirQuality: (quality) => set({ airQuality: quality })
}))

/* ----- MODERN VERTICAL GARDEN BUILDING ----- */
function VerticalGardenBuilding({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)
  
  const plantTypes = [
    { name: "🍋 Lemon", color: "#ffd700", height: 0.8 },
    { name: "🍎 Apple", color: "#ff4444", height: 1.2 },
    { name: "🍅 Tomato", color: "#ff6b6b", height: 0.6 },
    { name: "🥕 Carrot", color: "#ff8c00", height: 0.4 },
    { name: "🥬 Lettuce", color: "#90ee90", height: 0.3 },
    { name: "🍓 Strawberry", color: "#ff69b4", height: 0.2 },
    { name: "🌶️ Chili", color: "#ff0000", height: 0.5 },
    { name: "🍇 Grapes", color: "#9370db", height: 1.0 }
  ]

  return (
    <group position={position}>
      {/* Modern Building Structure */}
      <mesh castShadow receiveShadow onClick={() => setFocus({
        x: position[0], y: 12, z: position[2], lookAt: { x: position[0], y: 0, z: position[2] }
      })}>
        <boxGeometry args={[10, 25, 10]} />
        <meshStandardMaterial color="#34495e" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Glass Windows */}
      {Array.from({ length: 8 }).map((_, floor) => (
        <mesh key={floor} position={[0, -10 + floor * 3, 5.01]} castShadow>
          <planeGeometry args={[8, 2} />
          <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Vertical Garden Panels */}
      {[0, 1, 2, 3].map((side) => {
        const angle = (side / 4) * Math.PI * 2
        const offsetX = Math.cos(angle) * 5.1
        const offsetZ = Math.sin(angle) * 5.1
        const rotationY = angle + Math.PI

        return (
          <group key={side} position={[offsetX, 0, offsetZ]} rotation={[0, rotationY, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.3, 22, 9.8]} />
              <meshStandardMaterial color="#27ae60" metalness={0.4} roughness={0.2} />
            </mesh>

            {Array.from({ length: 7 }).map((_, level) => (
              <group key={level} position={[0.16, -9 + level * 3, 0]}>
                {Array.from({ length: 10 }).map((_, plantIndex) => {
                  const plant = plantTypes[(level * 10 + plantIndex) % plantTypes.length]
                  const plantX = -4 + plantIndex * 0.8
                  
                  return (
                    <group key={plantIndex} position={[0, 0.3, plantX]}>
                      <mesh castShadow>
                        <cylinderGeometry args={[0.06, 0.06, plant.height, 8]} />
                        <meshStandardMaterial color="#228b22" />
                      </mesh>
                      
                      <mesh position={[0, plant.height/2 + 0.15, 0]} castShadow>
                        <sphereGeometry args={[0.18, 8, 8]} />
                        <meshStandardMaterial color={plant.color} />
                      </mesh>
                    </group>
                  )
                })}
              </group>
            ))}
          </group>
        )
      })}

      {/* Rooftop Garden */}
      <group position={[0, 12.5, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[10.2, 0.3, 10.2]} />
          <meshStandardMaterial color="#27ae60" metalness={0.4} />
        </mesh>

        {[-3, 0, 3].map((x) =>
          [-3, 0, 3].map((z) => (
            <group key={`${x}-${z}`} position={[x, 0.3, z]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.6, 0.6, 0.5, 16]} />
                <meshStandardMaterial color="#8b4513" />
              </mesh>
              
              <mesh position={[0, 0.3, 0]} castShadow>
                <cylinderGeometry args={[0.55, 0.55, 0.4, 16]} />
                <meshStandardMaterial color="#a67c52" />
              </mesh>

              <mesh position={[0, 1.5, 0]} castShadow>
                <cylinderGeometry args={[0.08, 0.08, 2.5, 8]} />
                <meshStandardMaterial color="#228b22" />
              </mesh>
              
              <mesh position={[0, 3, 0]} castShadow>
                <sphereGeometry args={[0.7, 8, 8]} />
                <meshStandardMaterial color={plantTypes[(x + z + 4) % plantTypes.length].color} />
              </mesh>
            </group>
          ))
        )}

        <SolarPanel position={[4, 0.3, 4]} rotation={[0, Math.PI/4, 0]} />
        <SolarPanel position={[-4, 0.3, 4]} rotation={[0, -Math.PI/4, 0]} />
        <SolarPanel position={[4, 0.3, -4]} rotation={[0, 3*Math.PI/4, 0]} />
        <SolarPanel position={[-4, 0.3, -4]} rotation={[0, -3*Math.PI/4, 0]} />
      </group>

      {/* Water Collection System */}
      <group position={[0, 15, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[2, 1.8, 3, 16]} />
          <meshStandardMaterial color="#3498db" transparent opacity={0.9} />
        </mesh>
        
        <mesh position={[0, 1.8, 0]} castShadow>
          <cylinderGeometry args={[2.1, 2.1, 0.3, 16]} />
          <meshStandardMaterial color="#2980b9" />
        </mesh>

        <mesh position={[2.5, 0, 0]} rotation={[0, 0, Math.PI/2]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 5, 8]} />
          <meshStandardMaterial color="#34495e" />
        </mesh>
      </group>

      <Text position={[0, 14, 0]} fontSize={0.6} color="#27ae60" anchorX="center" anchorY="middle">
        🌿 Vertical Garden
      </Text>

      <Html position={[0, 18, 0]} transform>
        <div className="info-panel">
          <h3>🌿 Vertical Garden Building</h3>
          
          <div className="info-grid">
            <div>
              <div>🍋 Lemons: 32 plants</div>
              <div>🍎 Apples: 28 plants</div>
              <div>🍅 Tomatoes: 45 plants</div>
              <div>🥕 Carrots: 38 plants</div>
            </div>
            
            <div>
              <div>🥬 Lettuce: 52 plants</div>
              <div>🍓 Strawberries: 40 plants</div>
              <div>🌶️ Chilies: 36 plants</div>
              <div>🍇 Grapes: 24 plants</div>
            </div>
          </div>

          <div className="feature-list">
            <div><strong>🌱 Sustainable Features:</strong></div>
            <div>✅ Vertical Farming Technology</div>
            <div>✅ Automated Watering System</div>
            <div>✅ Rainwater Harvesting</div>
            <div>✅ Solar Powered</div>
            <div>✅ Year-round Production</div>
          </div>

          <div className="stats-panel">
            <div><strong>📊 Production Stats:</strong></div>
            <div>Daily Yield: ~50kg fresh produce</div>
            <div>Water Savings: 70% vs traditional farming</div>
            <div>Energy: 100% solar powered</div>
          </div>
        </div>
      </Html>

      <ModernPerson position={[3, 0, 4]} color="#8b4513" speed={0.2} />
      <ModernPerson position={[-3, 0, -3]} color="#2c3e50" speed={0.3} />

      <Sparkles count={25} scale={[12, 25, 12]} size={2} speed={0.1} color="#27ae60" />
    </group>
  )
}

/* ----- MODERN HOSPITAL ----- */
function ModernHospital({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)

  return (
    <group position={position}>
      {/* Main Building */}
      <mesh castShadow receiveShadow onClick={() => setFocus({
        x: position[0], y: 8, z: position[2], lookAt: { x: position[0], y: 0, z: position[2] }
      })}>
        <boxGeometry args={[15, 12, 20]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.3} />
      </mesh>

      {/* Windows */}
      {Array.from({ length: 4 }).map((_, floor) => (
        <group key={floor} position={[0, -4 + floor * 3, 0]}>
          {Array.from({ length: 6 }).map((_, i) => (
            <mesh key={i} position={[-5 + i * 2, 0, 10.01]} castShadow>
              <planeGeometry args={[1.5, 2} />
              <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Red Cross Sign */}
      <mesh position={[0, 8, 10.01]} castShadow>
        <planeGeometry args={[3, 3} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      <mesh position={[0, 8, 10.02]} rotation={[0, 0, Math.PI/4]} castShadow>
        <boxGeometry args={[0.5, 4, 0.1} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 8, 10.02]} rotation={[0, 0, -Math.PI/4]} castShadow>
        <boxGeometry args={[0.5, 4, 0.1} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Helipad */}
      <mesh position={[0, 6.1, 0]} rotation={[-Math.PI/2, 0, 0]} castShadow>
        <circleGeometry args={[3, 32]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <mesh position={[0, 6.11, 0]} rotation={[-Math.PI/2, 0, 0]} castShadow>
        <ringGeometry args={[2.5, 3, 32]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      <Text position={[0, 6.12, 0]} rotation={[-Math.PI/2, 0, 0]} fontSize={0.5} color="white" anchorX="center">
        H
      </Text>

      {/* Ambulance Entrance */}
      <group position={[0, 0, -10]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[8, 4, 1} />
          <meshStandardMaterial color="#34495e" />
        </mesh>
        <mesh position={[0, 2, 0.51]} castShadow>
          <planeGeometry args={[6, 3} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        <Text position={[0, 2, 0.52]} fontSize={0.4} color="white" anchorX="center">
          EMERGENCY
        </Text>
      </group>

      <Text position={[0, 14, 0]} fontSize={0.6} color="#e74c3c" anchorX="center" anchorY="middle">
        🏥 Modern Hospital
      </Text>

      <Html position={[0, 18, 0]} transform>
        <div className="info-panel medical">
          <h3>🏥 Modern Hospital</h3>
          
          <div className="info-grid">
            <div>
              <div>👨‍⚕️ Doctors: 45</div>
              <div>👩‍⚕️ Nurses: 120</div>
              <div>🛏️ Beds: 200</div>
              <div>🚑 Ambulances: 8</div>
            </div>
            
            <div>
              <div>💊 Pharmacy: 24/7</div>
              <div>🧬 Labs: 6</div>
              <div>📈 Success Rate: 98%</div>
              <div>⏰ Emergency: Instant</div>
            </div>
          </div>

          <div className="feature-list">
            <div><strong>🏥 Medical Services:</strong></div>
            <div>✅ Emergency Care</div>
            <div>✅ Surgery Units</div>
            <div>✅ ICU Facilities</div>
            <div>✅ Pediatric Care</div>
            <div>✅ Cardiology</div>
          </div>
        </div>
      </Html>

      <Ambulance position={[5, 0, -8]} />
      <ModernPerson position={[-2, 0, 8]} color="#ffffff" speed={0} />
      <ModernPerson position={[3, 0, 5]} color="#ffffff" speed={0} />

      <Sparkles count={20} scale={[18, 15, 22]} size={2} speed={0.1} color="#e74c3c" />
    </group>
  )
}

/* ----- MODERN SCHOOL ----- */
function ModernSchool({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)

  return (
    <group position={position}>
      {/* Main Building */}
      <mesh castShadow receiveShadow onClick={() => setFocus({
        x: position[0], y: 6, z: position[2], lookAt: { x: position[0], y: 0, z: position[2] }
      })}>
        <boxGeometry args={[18, 8, 15]} />
        <meshStandardMaterial color="#f1c40f" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Windows */}
      {Array.from({ length: 3 }).map((_, floor) => (
        <group key={floor} position={[0, -2 + floor * 3, 0]}>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[-7 + i * 2, 0, 7.51]} castShadow>
              <planeGeometry args={[1.5, 2} />
              <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Entrance */}
      <group position={[0, 0, -7.5]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[6, 4, 1} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        <mesh position={[0, 2, 0.51]} castShadow>
          <planeGeometry args={[4, 3} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
      </group>

      {/* Playground */}
      <group position={[12, 0, 0]}>
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
          <circleGeometry args={[8, 32]} />
          <meshStandardMaterial color="#27ae60" />
        </mesh>
        
        {/* Swings */}
        {[-3, 0, 3].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <mesh position={[0, 2.5, 0]} castShadow>
              <boxGeometry args={[0.1, 3, 0.1} />
              <meshStandardMaterial color="#8b4513" />
            </mesh>
            <mesh position={[0, 1, 0]} castShadow>
              <boxGeometry args={[1.5, 0.1, 0.1} />
              <meshStandardMaterial color="#e74c3c" />
            </mesh>
          </group>
        ))}

        {/* Slide */}
        <group position={[-5, 0, 3]}>
          <mesh position={[0, 1.5, 0]} rotation={[0, 0, -Math.PI/4]} castShadow>
            <boxGeometry args={[0.1, 4, 0.5} />
            <meshStandardMaterial color="#3498db" />
          </mesh>
          <mesh position={[1.4, 0.1, 0]} castShadow>
            <boxGeometry args={[0.5, 0.2, 0.5} />
            <meshStandardMaterial color="#e74c3c" />
          </mesh>
        </group>
      </group>

      <Text position={[0, 10, 0]} fontSize={0.6} color="#f39c12" anchorX="center" anchorY="middle">
        🏫 Modern School
      </Text>

      <Html position={[0, 13, 0]} transform>
        <div className="info-panel education">
          <h3>🏫 Modern School</h3>
          
          <div className="info-grid">
            <div>
              <div>👨‍🏫 Teachers: 35</div>
              <div>👨‍🎓 Students: 500</div>
              <div>📚 Classes: 20</div>
              <div>🏀 Playground: Yes</div>
            </div>
            
            <div>
              <div>💻 Computer Lab</div>
              <div>🔬 Science Labs</div>
              <div>📊 Library</div>
              <div>🎨 Arts Program</div>
            </div>
          </div>

          <div className="feature-list">
            <div><strong>🎓 Facilities:</strong></div>
            <div>✅ Smart Classrooms</div>
            <div>✅ Sports Complex</div>
            <div>✅ Science Labs</div>
            <div>✅ Library</div>
            <div>✅ Computer Center</div>
          </div>
        </div>
      </Html>

      <ModernPerson position={[2, 0, 5]} color="#f1c40f" speed={0.2} />
      <ModernPerson position={[-3, 0, 3]} color="#f1c40f" speed={0.3} />
      <SchoolBus position={[-8, 0, -5]} />

      <Sparkles count={15} scale={[20, 10, 18]} size={2} speed={0.1} color="#f39c12" />
    </group>
  )
}

/* ----- WATER TREATMENT PLANT ----- */
function WaterTreatmentPlant({ position = [0, 0, 0] }) {
  const waterLevel = useStore((s) => s.waterLevel)

  return (
    <group position={position}>
      {/* Main Treatment Tanks */}
      <group position={[0, 0, 0]}>
        {[-4, 0, 4].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[1.5, 1.5, 4, 16]} />
              <meshStandardMaterial color="#3498db" metalness={0.4} />
            </mesh>
            
            <mesh position={[0, waterLevel/25 - 1, 0]} castShadow>
              <cylinderGeometry args={[1.4, 1.4, waterLevel/12.5, 16]} />
              <meshStandardMaterial color="#2980b9" transparent opacity={0.8} />
            </mesh>

            <mesh position={[0, 2.2, 0]} castShadow>
              <cylinderGeometry args={[1.6, 1.6, 0.3, 16]} />
              <meshStandardMaterial color="#2c3e50" />
            </mesh>
          </group>
        ))}
      </div>

      {/* Processing Building */}
      <mesh position={[0, 0, -5]} castShadow receiveShadow>
        <boxGeometry args={[8, 6, 4} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.5} />
      </mesh>

      {/* Pipes */}
      <group>
        <mesh position={[0, 1, -2]} rotation={[0, 0, Math.PI/2]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 12, 8]} />
          <meshStandardMaterial color="#95a5a6" metalness={0.6} />
        </mesh>
        
        <mesh position={[-4, 1, 0]} rotation={[0, Math.PI/2, Math.PI/2]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 8, 8]} />
          <meshStandardMaterial color="#3498db" metalness={0.5} />
        </mesh>
      </group>

      <Text position={[0, 8, 0]} fontSize={0.6} color="#3498db" anchorX="center" anchorY="middle">
        💧 Water Treatment
      </Text>

      <Html position={[0, 11, 0]} transform>
        <div className="info-panel water">
          <h3>💧 Water Treatment Plant</h3>
          
          <div className="info-grid">
            <div>
              <div>💧 Water Level: {waterLevel}%</div>
              <div>🔄 Treatment: 95%</div>
              <div>🚰 Distribution: Active</div>
              <div>🔬 Quality: Excellent</div>
            </div>
            
            <div>
              <div>⏱️ Process: 24/7</div>
              <div>🌱 Recycled: 80%</div>
              <div>💡 Energy: Solar</div>
              <div>📊 Capacity: 1000L/s</div>
            </div>
          </div>

          <div className="feature-list">
            <div><strong>🔧 Treatment Process:</strong></div>
            <div>✅ Filtration System</div>
            <div>✅ Chemical Treatment</div>
            <div>✅ UV Purification</div>
            <div>✅ Quality Monitoring</div>
            <div>✅ Recycling System</div>
          </div>
        </div>
      </Html>

      <Sparkles count={20} scale={[12, 8, 10]} size={2} speed={0.1} color="#3498db" />
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
      panelRef.current.rotation.x = Math.sin(pulse) * 0.02
    }
  })

  return (
    <group ref={panelRef} position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[2, 0.05, 1.2} />
        <meshStandardMaterial 
          color={isActive ? "#1e3a8a" : "#2c3e50"} 
          metalness={0.9} 
          roughness={0.05}
          emissive={isActive ? "#1e3a8a" : "#000000"}
          emissiveIntensity={isActive ? 0.2 : 0}
        />
      </mesh>
      
      <mesh position={[0, -0.1, 0]} castShadow>
        <boxGeometry args={[2.1, 0.1, 1.3} />
        <meshStandardMaterial color="#34495e" metalness={0.4} />
      </mesh>
      
      <mesh position={[0, 0.03, 0]} castShadow>
        <boxGeometry args={[1.8, 0.01, 1} />
        <meshStandardMaterial 
          color={isActive ? "#00ffff" : "#7f8c8d"} 
          transparent 
          opacity={0.3}
          emissive={isActive ? "#00ffff" : "#000000"}
          emissiveIntensity={isActive ? 0.3 : 0}
        />
      </mesh>

      {isActive && (
        <Sparkles count={8} scale={[1.8, 0.1, 1]} size={1} speed={0.2} color="#00ffff" />
      )}
    </group>
  )
}

/* ----- MODERN WIND TURBINE ----- */
function WindTurbine({ position = [0, 0, 0], scale = 1 }) {
  const turbineRef = useRef()
  
  useFrame((_, dt) => {
    if (turbineRef.current) {
      turbineRef.current.rotation.y += dt * 3
    }
  })

  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.4, 16, 8]} />
        <meshStandardMaterial color="#bdc3c7" metalness={0.4} roughness={0.6} />
      </mesh>
      
      <group ref={turbineRef} position={[0, 16, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.8, 8, 8]} />
          <meshStandardMaterial color="#2c3e50" metalness={0.6} />
        </mesh>
        
        {[0, 1, 2].map((i) => (
          <mesh 
            key={i} 
            rotation={[0, 0, (i * Math.PI * 2) / 3]} 
            position={[3, 0, 0]}
            castShadow
          >
            <boxGeometry args={[6, 0.3, 0.8} />
            <meshStandardMaterial color="#ecf0f1" metalness={0.3} roughness={0.2} />
          </mesh>
        ))}
      </group>
      
      <pointLight position={[0, 12, 0]} color="#ffffff" intensity={0.3} distance={8} />
    </group>
  )
}

/* ----- MODERN CAR ----- */
function ModernCar({ position = [0, 0, 0], color = "#e74c3c", speed = 1, path = [] }) {
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
      
      const direction = new THREE.Vector3().subVectors(b, a).normalize()
      carRef.current.lookAt(carRef.current.position.clone().add(direction))
    }
  })

  return (
    <group ref={carRef} position={position}>
      {/* Car Body */}
      <mesh castShadow>
        <boxGeometry args={[2.2, 0.6, 1} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
      
      {/* Windshield */}
      <mesh position={[0, 0.5, 0.25]} castShadow>
        <boxGeometry args={[1.8, 0.4, 0.8} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
      </mesh>
      
      {/* Roof */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[1.6, 0.1, 0.9} />
        <meshStandardMaterial color={color} metalness={0.6} />
      </mesh>
      
      {/* Headlights */}
      <mesh position={[0.8, 0.3, 0.51]} castShadow>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffff99" emissiveIntensity={1} />
      </mesh>
      <mesh position={[-0.8, 0.3, 0.51]} castShadow>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffff99" emissiveIntensity={1} />
      </mesh>
      
      {/* Wheels */}
      {[[0.6, 0.3], [-0.6, 0.3]].map(([x, y], i) => (
        <group key={i} position={[x, -0.2, y]}>
          <mesh castShadow rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
            <meshStandardMaterial color="#2c3e50" metalness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ----- AMBULANCE ----- */
function Ambulance({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[2.5, 0.8, 1.2} />
        <meshStandardMaterial color="#ffffff" metalness={0.4} />
      </mesh>
      
      <mesh position={[0, 0.6, 0.3]} castShadow>
        <boxGeometry args={[2.2, 0.5, 0.9} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.3} />
        <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={2} />
      </mesh>
      
      <Text position={[0, 0.6, 0.61]} fontSize={0.15} color="white" anchorX="center">
        AMBULANCE
      </Text>
    </group>
  )
}

/* ----- SCHOOL BUS ----- */
function SchoolBus({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[3, 1.2, 1.5} />
        <meshStandardMaterial color="#f1c40f" metalness={0.3} />
      </mesh>
      
      <mesh position={[0, 0.6, 0.4]} castShadow>
        <boxGeometry args={[2.8, 0.8, 1.3} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      <Text position={[0, 0.6, 0.76]} fontSize={0.2} color="#e74c3c" anchorX="center">
        SCHOOL BUS
      </Text>
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

/* ----- ENHANCED CULTURAL CENTER ----- */
function CulturalCenter({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)

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
      {/* Modern Cultural Center Building */}
      <mesh castShadow receiveShadow onClick={() => setFocus({
        x: position[0], y: 8, z: position[2], lookAt: { x: position[0], y: 0, z: position[2] }
      })}>
        <boxGeometry args={[20, 10, 15]} />
        <meshStandardMaterial color="#8b4513" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Decorative Cultural Elements */}
      <group position={[0, 5, 0]}>
        {culturalStyles.map((culture, index) => {
          const angle = (index / culturalStyles.length) * Math.PI * 2
          const radius = 12
          const bannerX = Math.cos(angle) * radius
          const bannerZ = Math.sin(angle) * radius
          
          return (
            <group key={culture.name} position={[bannerX, 0, bannerZ]} rotation={[0, -angle, 0]}>
              <mesh position={[0, 6, 0]} castShadow>
                <cylinderGeometry args={[0.15, 0.15, 12, 8]} />
                <meshStandardMaterial color="#d4af37" metalness={0.6} />
              </mesh>
              
              <mesh position={[0, 8, -0.8]} rotation={[0, 0, 0]} castShadow>
                <planeGeometry args={[2.5, 4} />
                <meshStandardMaterial color={culture.color} metalness={0.4} />
              </mesh>
              
              <Text position={[0, 8, -0.81]} fontSize={1} color="white" anchorX="center" anchorY="middle">
                {culture.pattern}
              </Text>
              
              <Text position={[0, 5.5, -0.81]} fontSize={0.4} color="white" anchorX="center" anchorY="middle">
                {culture.name}
              </Text>
            </group>
          )
        })}
      </group>

      {/* Central Dome */}
      <mesh position={[0, 8, 0]} castShadow>
        <sphereGeometry args={[3, 16, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.2} />
      </mesh>

      <Text position={[0, 13, 0]} fontSize={0.7} color="#d4af37" anchorX="center" anchorY="middle">
        🎪 Cultural Center
      </Text>

      <Html position={[0, 16, 0]} transform>
        <div className="info-panel cultural">
          <h3>🎪 Cultural Heritage Center</h3>
          
          <div className="cultural-grid">
            {culturalStyles.map((culture, index) => (
              <div key={culture.name} className="culture-card" style={{ background: culture.color }}>
                <div className="culture-icon">{culture.image}</div>
                <div className="culture-name">{culture.name}</div>
                <div className="culture-desc">{culture.description}</div>
              </div>
            ))}
          </div>

          <div className="feature-list">
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

      <ModernPerson position={[5, 0, 3]} color="#8b4513" speed={0.3} />
      <ModernPerson position={[-3, 0, -2]} color="#2c3e50" speed={0.4} />

      <Sparkles count={40} scale={[25, 12, 18]} size={2} speed={0.1} color="#d4af37" />
    </group>
  )
}

/* ----- ENHANCED WASTE MANAGEMENT ----- */
function WasteManagementSystem({ position = [25, 0, 25] }) {
  const [isTruckActive, setIsTruckActive] = useState(false)
  const [currentBinTarget, setCurrentBinTarget] = useState(null)
  const wasteBins = useStore((s) => s.wasteBins)
  const wasteProcessing = useStore((s) => s.wasteProcessing)

  const binPositions = [
    [-10, 0, 8], [12, 0, -5], [-5, 0, -12], 
    [18, 0, 10], [-15, 0, -18], [5, 0, 20]
  ]

  return (
    <group position={position}>
      {/* Modern Waste Management Building */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[15, 8, 12]} />
        <meshStandardMaterial color="#27ae60" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Processing Tanks */}
      <group position={[0, 4, -2]}>
        {[-5, 0, 5].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[1, 1, 3, 16]} />
              <meshStandardMaterial color={i === 0 ? "#e74c3c" : i === 1 ? "#f39c12" : "#27ae60"} metalness={0.5} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Solar Panels */}
      <group position={[0, 4.5, 6]}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SolarPanel key={i} position={[-6 + i * 2.5, 0.5, 0]} rotation={[0, Math.PI, 0]} isActive={true} />
        ))}
      </group>

      <WindTurbine position={[8, 4, 0]} scale={0.7} />

      <Text position={[0, 11, 0]} fontSize={0.6} color="#27ae60" anchorX="center" anchorY="middle">
        ♻️ Waste Management
      </Text>

      <Html position={[0, 14, 0]} transform>
        <div className="info-panel waste">
          <h3>♻️ Advanced Waste Management</h3>
          
          <div className="info-grid">
            <div>
              <div>🗑️ Full Bins: {Object.values(wasteBins).filter(level => level >= 1).length}</div>
              <div>🔄 Processing: {wasteProcessing.isProcessing ? 'Active' : 'Ready'}</div>
              <div>🚛 Truck: {isTruckActive ? 'Collecting' : 'Available'}</div>
            </div>
            
            <div>
              <div>♻️ Recycled: {wasteProcessing.recycledWaste}</div>
              <div>📉 Reduced: {wasteProcessing.reducedWaste}</div>
              <div>🔄 Reused: {wasteProcessing.reusedWaste}</div>
            </div>
          </div>

          <div className="feature-list">
            <div><strong>🔄 3R System:</strong></div>
            <div>✅ Reduce • Reuse • Recycle</div>
            <div>✅ Automated Collection</div>
            <div>✅ Solar Powered</div>
            <div>✅ Real-time Monitoring</div>
          </div>
        </div>
      </Html>

      <Sparkles count={25} scale={[18, 10, 14]} size={2} speed={0.1} color="#27ae60" />
    </group>
  )
}

/* ----- ENHANCED GROUND & ROADS ----- */
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
    </>
  )
}

/* ----- ENHANCED CITY LAYOUT ----- */
function CityLayout() {
  return (
    <group>
      {/* Major City Components */}
      <CulturalCenter position={[0, 0, 40]} />
      <ModernHospital position={[-30, 0, 20]} />
      <ModernSchool position={[30, 0, 20]} />
      <VerticalGardenBuilding position={[-30, 0, -20]} />
      <WaterTreatmentPlant position={[30, 0, -20]} />
      <WasteManagementSystem position={[0, 0, -40]} />
      
      {/* Residential Buildings */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const radius = 25
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        return (
          <mesh key={i} position={[x, 3, z]} castShadow receiveShadow>
            <boxGeometry args={[3, 6, 3]} />
            <meshStandardMaterial color="#a67c52" roughness={0.3} />
          </mesh>
        )
      })}

      {/* Modern Cars */}
      <ModernCar color="#e74c3c" speed={0.4} path={[[-40, 0.5, 0], [40, 0.5, 0]]} />
      <ModernCar color="#3498db" speed={0.3} path={[[0, 0.5, -40], [0, 0.5, 40]]} />
      <ModernCar color="#2ecc71" speed={0.5} path={[[-30, 0.5, -30], [30, 0.5, 30]]} />

      {/* People */}
      <ModernPerson position={[10, 0, 35]} color="#8b4513" speed={0.2} />
      <ModernPerson position={[-10, 0, 35]} color="#2c3e50" speed={0.3} />
      <ModernPerson position={[15, 0, -35]} color="#8b4513" speed={0.4} />

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

  return (
    <div className="hud-container">
      <div className="hud-main">
        🏙️ Smart City Dashboard • Time: {timeOfDay} • 🌡️ Air Quality: {airQuality}%
      </div>
      
      <div className="hud-stats">
        <div className="stat-item">
          <div className="stat-icon">💧</div>
          <div className="stat-value">{waterLevel}%</div>
          <div className="stat-label">Water</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-icon">⚡</div>
          <div className="stat-value">{energyProduction}kW</div>
          <div className="stat-label">Energy</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-icon">🌱</div>
          <div className="stat-value">{airQuality}%</div>
          <div className="stat-label">Air Quality</div>
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

  if (!showCityControl) return null

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h3>City Controls</h3>
        <button onClick={() => setShowCityControl(false)}>✕</button>
      </div>
      
      <div className="control-group">
        <label>🌅 Time of Day:</label>
        <select onChange={(e) => setTimeOfDay(e.target.value)}>
          <option value="day">☀️ Day</option>
          <option value="evening">🌆 Evening</option>
          <option value="night">🌙 Night</option>
        </select>
      </div>

      <div className="control-group">
        <label>🚗 Traffic Density:</label>
        <select>
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High</option>
        </select>
      </div>

      <div className="navigation-group">
        <label>🗺️ Quick Navigation:</label>
        <button>🎪 Cultural Center</button>
        <button>🏥 Hospital</button>
        <button>🏫 School</button>
        <button>🌿 Vertical Garden</button>
        <button>💧 Water Plant</button>
        <button>♻️ Waste Management</button>
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
    <div className="app-container">
      <style>{`
        .app-container {
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: 'Arial', sans-serif;
          overflow: hidden;
        }

        .hud-container {
          position: absolute;
          left: 20px;
          top: 20px;
          z-index: 1000;
        }

        .hud-main {
          background: rgba(255,255,255,0.95);
          padding: 12px 20px;
          border-radius: 15px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          font-size: 14px;
          font-weight: bold;
          color: #8b4513;
          border: 2px solid #d2b48c;
          backdrop-filter: blur(10px);
          margin-bottom: 10px;
        }

        .hud-stats {
          display: flex;
          gap: 10px;
        }

        .stat-item {
          background: rgba(255,255,255,0.9);
          padding: 10px;
          border-radius: 10px;
          text-align: center;
          min-width: 80px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .stat-icon { font-size: 20px; margin-bottom: 5px; }
        .stat-value { font-size: 16px; font-weight: bold; color: #2c3e50; }
        .stat-label { font-size: 11px; color: #7f8c8d; }

        .settings-panel {
          position: absolute;
          right: 100px;
          top: 20px;
          z-index: 999;
          background: rgba(255,255,255,0.95);
          padding: 20px;
          border-radius: 15px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
          min-width: 250px;
          border: 2px solid #d2b48c;
          backdrop-filter: blur(10px);
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .settings-header h3 {
          margin: 0;
          color: #8b4513;
          font-size: 18px;
        }

        .settings-header button {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #8b4513;
          font-weight: bold;
        }

        .control-group {
          margin-bottom: 15px;
        }

        .control-group label {
          display: block;
          margin-bottom: 6px;
          font-size: 13px;
          font-weight: bold;
          color: #8b4513;
        }

        .control-group select {
          width: 100%;
          padding: 8px;
          border-radius: 8px;
          border: 2px solid #d2b48c;
          font-size: 13px;
          background: white;
          color: #8b4513;
        }

        .navigation-group {
          margin-top: 15px;
        }

        .navigation-group label {
          display: block;
          margin-bottom: 6px;
          font-size: 13px;
          font-weight: bold;
          color: #8b4513;
        }

        .navigation-group button {
          width: 100%;
          background: linear-gradient(135deg, #d2691e, #8b4513);
          color: white;
          border: none;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 5px;
          font-size: 12px;
          font-weight: bold;
          transition: all 0.3s ease;
          text-align: left;
        }

        .navigation-group button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .info-panel {
          background: rgba(255,255,255,0.95);
          padding: 20px;
          border-radius: 15px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
          min-width: 300px;
          text-align: center;
          color: #2c3e50;
          border: 2px solid;
          backdrop-filter: blur(10px);
        }

        .info-panel h3 {
          margin: 0 0 15px 0;
          font-size: 18px;
        }

        .info-panel.cultural { border-color: #d4af37; }
        .info-panel.medical { border-color: #e74c3c; }
        .info-panel.education { border-color: #f39c12; }
        .info-panel.water { border-color: #3498db; }
        .info-panel.waste { border-color: #27ae60; }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 15px;
        }

        .cultural-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        }

        .culture-card {
          padding: 10px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          color: white;
        }

        .culture-icon { font-size: 24px; margin-bottom: 5px; }
        .culture-name { font-weight: bold; font-size: 14px; }
        .culture-desc { font-size: 11px; opacity: 0.9; }

        .feature-list {
          background: rgba(52, 152, 219, 0.1);
          padding: 12px;
          border-radius: 8px;
          font-size: 12px;
          border: 1px solid;
        }

        .stats-panel {
          margin-top: 10px;
          background: rgba(255,255,255,0.2);
          padding: 8px;
          border-radius: 6px;
          font-size: 11px;
        }

        .settings-icon {
          position: absolute;
          right: 25px;
          top: 25px;
          z-index: 1000;
          background: rgba(255,255,255,0.95);
          border-radius: 50%;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 25px rgba(0,0,0,0.2);
          cursor: pointer;
          font-size: 28px;
          transition: all 0.3s ease;
          border: 2px solid #d2b48c;
          backdrop-filter: blur(10px);
        }

        .info-bottom {
          position: absolute;
          left: 20px;
          bottom: 20px;
          z-index: 1000;
          background: rgba(255,255,255,0.95);
          padding: 20px;
          border-radius: 15px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          border: 2px solid #d2b48c;
          backdrop-filter: blur(10px);
          max-width: 400px;
        }

        .info-bottom div {
          font-size: 12px;
          color: #a67c52;
          margin-bottom: 6px;
        }
      `}</style>

      <HUD />
      
      <div className="settings-icon" onClick={() => setShowCityControl(true)}>
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
            <div className="info-panel">
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

      <div className="info-bottom">
        <div>🎮 Controls: Drag to rotate • Scroll to zoom • Click buildings to focus</div>
        <div>🌟 Features: Cultural Center • Hospital • School • Vertical Garden</div>
        <div>💧 Water Treatment Plant • Waste Management System</div>
        <div>⚡ Solar Panels • Wind Turbines • Modern Infrastructure</div>
        <div>🏥 Medical Care • 🏫 Education • 🌿 Sustainable Living</div>
      </div>
    </div>
  )
}
