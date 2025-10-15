import React, { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, useGLTF, ContactShadows, Sky, Text, Sparkles, Float, useTexture, Environment, Stars, Cloud, useVideoTexture, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { create } from 'zustand'

// =============================================
// ENHANCED ZUSTAND STORE WITH COMPREHENSIVE STATE MANAGEMENT
// =============================================

const useStore = create((set, get) => ({
  // City State
  alert: null,
  focus: null,
  timeOfDay: 'day',
  trafficDensity: 'medium',
  streetLightsOn: false,
  weather: 'clear',
  showCityControl: false,
  emergencyAlarm: false,
  
  // Waste Management
  wasteBins: {},
  alertWasteManagement: false,
  wasteProcessing: {
    isProcessing: false,
    processTime: 0,
    recycledWaste: 0,
    reducedWaste: 0,
    reusedWaste: 0
  },
  truckStatus: 'idle',
  currentBinTarget: null,
  collectedWaste: 0,
  
  // Energy Management
  energyProduction: {
    solar: 1250,
    wind: 850,
    hydro: 420,
    totalConsumption: 2000
  },
  
  // Water Management
  waterSystem: {
    filtrationActive: true,
    waterQuality: 98.5,
    reservoirLevel: 85,
    consumptionRate: 1250,
    treatmentStages: {
      primary: true,
      secondary: true,
      tertiary: true,
      disinfection: true
    }
  },
  
  // Education System
  schoolData: {
    students: 1250,
    teachers: 85,
    classesActive: 32,
    energyUsage: 'solar',
    events: ['Science Fair', 'Sports Day', 'Art Exhibition'],
    facilities: {
      library: true,
      labs: true,
      sports: true,
      auditorium: true
    }
  },
  
  // Healthcare System
  hospitalData: {
    patients: 156,
    doctors: 45,
    nurses: 120,
    emergencies: 12,
    bedsAvailable: 34,
    surgeriesToday: 8,
    departments: {
      emergency: true,
      surgery: true,
      cardiology: true,
      pediatrics: true
    }
  },
  
  // Modern Housing
  modernHouses: [
    { id: 1, energy: 'solar', smart: true, residents: 4, color: '#3498db', lightsOn: false },
    { id: 2, energy: 'wind', smart: true, residents: 3, color: '#e74c3c', lightsOn: true },
    { id: 3, energy: 'hybrid', smart: false, residents: 5, color: '#2ecc71', lightsOn: false },
    { id: 4, energy: 'solar', smart: true, residents: 2, color: '#f39c12', lightsOn: true }
  ],
  
  // Transportation
  publicTransport: {
    buses: 12,
    trains: 8,
    stations: 15,
    activeRoutes: 6
  },
  
  // Environmental Data
  environment: {
    airQuality: 85,
    noiseLevel: 65,
    greenSpaces: 28,
    co2Level: 420
  },
  
  // City Events
  cityEvents: [],
  
  // Animation States
  animations: {
    schoolBell: false,
    hospitalHelicopter: false,
    fountainActive: true,
    birdsFlying: true,
    trafficLights: true,
    windTurbines: true
  },
  
  // Setters
  setAlert: (alert) => set({ alert }),
  setFocus: (focus) => set({ focus }),
  setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
  setTrafficDensity: (trafficDensity) => set({ trafficDensity }),
  setStreetLightsOn: (streetLightsOn) => set({ streetLightsOn }),
  setWeather: (weather) => set({ weather }),
  setShowCityControl: (showCityControl) => set({ showCityControl }),
  setEmergencyAlarm: (emergencyAlarm) => set({ emergencyAlarm }),
  
  updateWasteBin: (id, level) => set((state) => ({ 
    wasteBins: { ...state.wasteBins, [id]: level } 
  })),
  setAlertWasteManagement: (alertWasteManagement) => set({ alertWasteManagement }),
  setWasteProcessing: (wasteProcessing) => set({ wasteProcessing }),
  setTruckStatus: (truckStatus) => set({ truckStatus }),
  setCurrentBinTarget: (currentBinTarget) => set({ currentBinTarget }),
  setCollectedWaste: (collectedWaste) => set({ collectedWaste }),
  
  // Enhanced setters for new systems
  updateEnergyProduction: (updates) => set((state) => ({
    energyProduction: { ...state.energyProduction, ...updates }
  })),
  
  updateWaterSystem: (updates) => set((state) => ({
    waterSystem: { ...state.waterSystem, ...updates }
  })),
  
  updateSchoolData: (updates) => set((state) => ({
    schoolData: { ...state.schoolData, ...updates }
  })),
  
  updateHospitalData: (updates) => set((state) => ({
    hospitalData: { ...state.hospitalData, ...updates }
  })),
  
  updateModernHouse: (id, updates) => set((state) => ({
    modernHouses: state.modernHouses.map(house => 
      house.id === id ? { ...house, ...updates } : house
    )
  })),
  
  updateEnvironment: (updates) => set((state) => ({
    environment: { ...state.environment, ...updates }
  })),
  
  addCityEvent: (event) => set((state) => ({ 
    cityEvents: [...state.cityEvents, { ...event, id: Date.now() }] 
  })),
  
  removeCityEvent: (id) => set((state) => ({ 
    cityEvents: state.cityEvents.filter(e => e.id !== id) 
  })),
  
  setAnimationState: (animation, state) => set((prev) => ({
    animations: { ...prev.animations, [animation]: state }
  }))
}))

// =============================================
// ENHANCED UTILITY FUNCTIONS AND CONSTANTS
// =============================================

const COLORS = {
  primary: '#3498db',
  secondary: '#2ecc71',
  accent: '#e74c3c',
  warning: '#f39c12',
  dark: '#2c3e50',
  light: '#ecf0f1'
}

const ANIMATION_CONFIG = {
  slow: { speed: 0.5, intensity: 1 },
  medium: { speed: 1, intensity: 2 },
  fast: { speed: 2, intensity: 3 }
}

// Enhanced math utilities
const MathUtils = {
  lerp: (start, end, factor) => start + (end - start) * factor,
  clamp: (value, min, max) => Math.min(Math.max(value, min), max),
  random: (min, max) => Math.random() * (max - min) + min,
  randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
}

// =============================================
// ENHANCED PARTICLE SYSTEMS
// =============================================

function AdvancedParticleSystem({ 
  count = 100, 
  color = '#ffffff', 
  size = 1, 
  speed = 1,
  scale = [1, 1, 1],
  position = [0, 0, 0],
  type = 'sparkle'
}) {
  const particlesRef = useRef()
  const [particles] = useState(() => 
    Array.from({ length: count }, () => ({
      position: [MathUtils.random(-scale[0], scale[0]), MathUtils.random(-scale[1], scale[1]), MathUtils.random(-scale[2], scale[2])],
      velocity: [MathUtils.random(-1, 1), MathUtils.random(-1, 1), MathUtils.random(-1, 1)],
      size: MathUtils.random(size * 0.5, size * 1.5),
      life: MathUtils.random(0, Math.PI * 2)
    }))
  )

  useFrame((_, dt) => {
    if (particlesRef.current) {
      particles.forEach((particle, i) => {
        particle.life += dt * speed
        particle.position[0] += particle.velocity[0] * dt
        particle.position[1] += particle.velocity[1] * dt
        particle.position[2] += particle.velocity[2] * dt
        
        // Boundary check and reset
        if (Math.abs(particle.position[0]) > scale[0] || 
            Math.abs(particle.position[1]) > scale[1] || 
            Math.abs(particle.position[2]) > scale[2]) {
          particle.position = [MathUtils.random(-scale[0], scale[0]), MathUtils.random(-scale[1], scale[1]), MathUtils.random(-scale[2], scale[2])]
        }
      })
    }
  })

  return (
    <group ref={particlesRef} position={position}>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position}>
          <sphereGeometry args={[particle.size * (0.5 + Math.sin(particle.life) * 0.5), 8, 8]} />
          <meshStandardMaterial 
            color={color}
            transparent
            opacity={0.6 + Math.sin(particle.life) * 0.4}
            emissive={color}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}

// =============================================
// ENHANCED SOLAR PANEL WITH ANIMATIONS
// =============================================

function AdvancedSolarPanel({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  isActive = true,
  efficiency = 0.85,
  size = 'medium'
}) {
  const panelRef = useRef()
  const [pulse, setPulse] = useState(0)
  const [energyOutput, setEnergyOutput] = useState(0)

  const sizes = {
    small: [1, 0.02, 0.8],
    medium: [1.5, 0.02, 1],
    large: [2, 0.02, 1.2]
  }

  useFrame((_, dt) => {
    setPulse(prev => prev + dt)
    if (panelRef.current && isActive) {
      panelRef.current.rotation.x = Math.sin(pulse) * 0.02
      setEnergyOutput(Math.sin(pulse * 0.5) * 0.5 + 0.5)
    }
  })

  return (
    <group ref={panelRef} position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={sizes[size]} />
        <meshStandardMaterial 
          color={isActive ? "#1e3a8a" : "#2c3e50"} 
          metalness={0.9} 
          roughness={0.05}
          emissive={isActive ? "#1e3a8a" : "#000000"}
          emissiveIntensity={isActive ? energyOutput * 0.2 : 0}
        />
      </mesh>
      
      <mesh position={[0, -0.06, 0]} castShadow>
        <boxGeometry args={[sizes[size][0] * 1.1, 0.08, sizes[size][2] * 1.1]} />
        <meshStandardMaterial color="#34495e" metalness={0.3} />
      </mesh>
      
      {/* Energy collection effect */}
      {isActive && (
        <group position={[0, 0.03, 0]}>
          <Sparkles 
            count={8} 
            scale={[sizes[size][0] * 0.8, 0.1, sizes[size][2] * 0.8]} 
            size={2} 
            speed={0.5} 
            color="#00ffff" 
          />
        </group>
      )}
      
      {/* Efficiency indicator */}
      <Html position={[0, -0.2, 0]} transform>
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          color: isActive ? '#00ff00' : '#666666',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          fontFamily: 'monospace',
          whiteSpace: 'nowrap'
        }}>
          {isActive ? `☀️ ${Math.round(energyOutput * efficiency * 100)}W` : 'OFFLINE'}
        </div>
      </Html>
    </group>
  )
}

// =============================================
// ENHANCED WIND TURBINE WITH PHYSICS
// =============================================

function AdvancedWindTurbine({ 
  position = [0, 0, 0], 
  scale = 1,
  windSpeed = 1,
  operational = true
}) {
  const turbineRef = useRef()
  const bladesRef = useRef()
  const [vibration, setVibration] = useState(0)

  useFrame((_, dt) => {
    if (bladesRef.current && operational) {
      bladesRef.current.rotation.y += dt * 2 * windSpeed
      setVibration(prev => prev + dt * windSpeed)
    }
    
    if (turbineRef.current) {
      turbineRef.current.rotation.z = Math.sin(vibration) * 0.01 * windSpeed
    }
  })

  return (
    <group ref={turbineRef} position={position} scale={[scale, scale, scale]}>
      {/* Tower with realistic taper */}
      <mesh position={[0, 8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.6, 16, 16]} />
        <meshStandardMaterial color="#708090" metalness={0.4} roughness={0.6} />
      </mesh>
      
      {/* Nacelle */}
      <mesh position={[0, 16, 0]} castShadow>
        <boxGeometry args={[1.2, 1, 1.5]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.6} />
      </mesh>
      
      {/* Blades */}
      <group ref={bladesRef} position={[0, 16, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial color="#34495e" metalness={0.5} />
        </mesh>
        
        {[0, 1, 2].map((i) => (
          <mesh 
            key={i} 
            rotation={[0, 0, (i * Math.PI * 2) / 3]} 
            position={[1.5, 0, 0]}
            castShadow
          >
            <boxGeometry args={[6, 0.3, 0.8]} />
            <meshStandardMaterial color="#ecf0f1" metalness={0.3} roughness={0.4} />
          </mesh>
        ))}
      </group>
      
      {/* Status indicator */}
      <Html position={[0, 20, 0]} transform>
        <div style={{
          background: operational ? 'rgba(46, 204, 113, 0.9)' : 'rgba(231, 76, 60, 0.9)',
          color: 'white',
          padding: '6px 10px',
          borderRadius: '8px',
          fontSize: '10px',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}>
          {operational ? `🌬️ ${Math.round(windSpeed * 100)}%` : '⚡ OFFLINE'}
        </div>
      </Html>
      
      {/* Wind effect particles */}
      {operational && (
        <AdvancedParticleSystem
          count={15}
          color="#3498db"
          size={0.5}
          speed={windSpeed}
          scale={[2, 2, 2]}
          position={[0, 16, 0]}
        />
      )}
    </group>
  )
}

// =============================================
// ADVANCED WATER FILTRATION PLANT
// =============================================

function AdvancedWaterFiltrationPlant({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)
  const waterSystem = useStore((s) => s.waterSystem)
  const updateWaterSystem = useStore((s) => s.updateWaterSystem)
  
  const [animationTime, setAnimationTime] = useState(0)
  const [valveStates, setValveStates] = useState({
    intake: true,
    primary: true,
    secondary: true,
    tertiary: true,
    output: true
  })

  useFrame((_, dt) => {
    setAnimationTime(prev => prev + dt)
  })

  const toggleValve = (valve) => {
    setValveStates(prev => ({
      ...prev,
      [valve]: !prev[valve]
    }))
  }

  const startEmergencyProtocol = () => {
    useStore.getState().setEmergencyAlarm(true)
    useStore.getState().addCityEvent({
      type: 'emergency',
      title: 'Water Plant Emergency Protocol',
      message: 'Emergency water treatment protocol activated',
      timestamp: new Date().toLocaleTimeString()
    })
    
    setTimeout(() => {
      useStore.getState().setEmergencyAlarm(false)
    }, 5000)
  }

  return (
    <group position={position}>
      {/* Main Plant Structure */}
      <mesh 
        castShadow 
        receiveShadow 
        onClick={() => setFocus({
          x: position[0],
          y: 25,
          z: position[2],
          lookAt: { x: position[0], y: 0, z: position[2] }
        })}
      >
        <boxGeometry args={[40, 15, 30]} />
        <meshStandardMaterial color="#3498db" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Water Intake Structure */}
      <WaterIntake position={[-15, 5, 0]} active={valveStates.intake} />
      
      {/* Primary Treatment */}
      <PrimaryTreatment position={[-8, 3, -10]} active={valveStates.primary && waterSystem.treatmentStages.primary} />
      
      {/* Secondary Treatment */}
      <SecondaryTreatment position={[0, 3, -10]} active={valveStates.secondary && waterSystem.treatmentStages.secondary} />
      
      {/* Tertiary Treatment */}
      <TertiaryTreatment position={[8, 3, -10]} active={valveStates.tertiary && waterSystem.treatmentStages.tertiary} />
      
      {/* Disinfection */}
      <DisinfectionUnit position={[15, 3, 0]} active={waterSystem.treatmentStages.disinfection} />
      
      {/* Clean Water Reservoir */}
      <WaterReservoir position={[0, 8, 12]} level={waterSystem.reservoirLevel} />
      
      {/* Control Tower */}
      <ControlTower position={[0, 12, -12]} />
      
      {/* Piping System */}
      <PipingSystem 
        position={[0, 2, 0]} 
        valveStates={valveStates}
        waterFlow={waterSystem.filtrationActive}
      />
      
      {/* Solar Power Array */}
      <group position={[0, 8, -20]}>
        {Array.from({ length: 20 }).map((_, i) => (
          <AdvancedSolarPanel
            key={i}
            position={[-18 + i * 2, 0, 0]}
            rotation={[0, 0, 0]}
            isActive={waterSystem.filtrationActive}
            size="medium"
          />
        ))}
      </group>

      <Text
        position={[0, 20, 0]}
        fontSize={1.2}
        color="#3498db"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
      >
        💧 Advanced Water Filtration Plant
      </Text>

      {/* Comprehensive Control Interface */}
      <Html position={[0, 25, 0]} transform>
        <div style={{
          background: 'rgba(52, 152, 219, 0.97)',
          padding: '30px',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          minWidth: '600px',
          maxWidth: '800px',
          color: 'white',
          border: '3px solid #2980b9',
          backdropFilter: 'blur(20px)',
          fontFamily: 'Inter, sans-serif'
        }}>
          <h3 style={{ 
            margin: '0 0 25px 0', 
            fontSize: '28px',
            fontWeight: '700',
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            💧 Advanced Water Treatment Facility
          </h3>
          
          {/* Real-time Metrics */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '20px',
            marginBottom: '25px'
          }}>
            <MetricCard 
              title="Water Quality" 
              value={`${waterSystem.waterQuality}%`}
              status={waterSystem.waterQuality > 95 ? 'excellent' : 'good'}
              icon="💧"
            />
            <MetricCard 
              title="Reservoir Level" 
              value={`${waterSystem.reservoirLevel}%`}
              status={waterSystem.reservoirLevel > 70 ? 'excellent' : waterSystem.reservoirLevel > 40 ? 'good' : 'warning'}
              icon="🌊"
            />
            <MetricCard 
              title="Consumption" 
              value={`${waterSystem.consumptionRate} L/s`}
              status="normal"
              icon="🚰"
            />
          </div>

          {/* Treatment Process Control */}
          <div style={{ 
            background: 'rgba(41, 128, 185, 0.4)', 
            padding: '20px', 
            borderRadius: '12px',
            marginBottom: '20px',
            border: '2px solid #2980b9'
          }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600' }}>
              🔧 Treatment Process Control
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {Object.entries(waterSystem.treatmentStages).map(([stage, active]) => (
                <ProcessStage 
                  key={stage}
                  name={stage}
                  active={active}
                  onToggle={() => updateWaterSystem({
                    treatmentStages: {
                      ...waterSystem.treatmentStages,
                      [stage]: !active
                    }
                  })}
                />
              ))}
            </div>
          </div>

          {/* Valve Control Panel */}
          <div style={{ 
            background: 'rgba(41, 128, 185, 0.4)', 
            padding: '20px', 
            borderRadius: '12px',
            marginBottom: '20px',
            border: '2px solid #2980b9'
          }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600' }}>
              🎛️ Valve Control System
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {Object.entries(valveStates).map(([valve, open]) => (
                <ValveControl 
                  key={valve}
                  name={valve}
                  open={open}
                  onToggle={() => toggleValve(valve)}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <ControlButton 
              onClick={() => updateWaterSystem({ filtrationActive: !waterSystem.filtrationActive })}
              active={waterSystem.filtrationActive}
              label={waterSystem.filtrationActive ? '🟢 System Online' : '🔴 System Offline'}
            />
            <ControlButton 
              onClick={startEmergencyProtocol}
              active={false}
              label="🚨 Emergency Protocol"
              style={{ background: 'linear-gradient(135deg, #e74c3c, #c0392b)' }}
            />
            <ControlButton 
              onClick={() => updateWaterSystem({ reservoirLevel: 100 })}
              active={false}
              label="🔄 Refill Reservoir"
              style={{ background: 'linear-gradient(135deg, #2ecc71, #27ae60)' }}
            />
          </div>

          {/* System Status */}
          <div style={{ 
            marginTop: '20px',
            padding: '15px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>System Status:</div>
            <div>✅ Filtration: {waterSystem.filtrationActive ? 'ACTIVE' : 'STANDBY'}</div>
            <div>✅ Power: SOLAR (100% RENEWABLE)</div>
            <div>✅ Automation: AI-CONTROLLED</div>
            <div>✅ Safety: ALL SYSTEMS NOMINAL</div>
          </div>
        </div>
      </Html>

      {/* Ambient Effects */}
      <AdvancedParticleSystem
        count={50}
        color="#3498db"
        size={2}
        speed={0.3}
        scale={[45, 10, 35]}
        position={[0, 5, 0]}
      />
      
      <Sparkles 
        count={100} 
        scale={[45, 20, 35]} 
        size={3} 
        speed={0.2} 
        color="#3498db" 
      />
    </group>
  )
}

// =============================================
// WATER FILTRATION SUB-COMPONENTS
// =============================================

function WaterIntake({ position = [0, 0, 0], active = true }) {
  const [waterFlow, setWaterFlow] = useState(0)

  useFrame((_, dt) => {
    setWaterFlow(prev => prev + dt)
  })

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[3, 4, 6, 16]} />
        <meshStandardMaterial color="#2980b9" metalness={0.3} />
      </mesh>
      
      <mesh position={[0, 3, 0]} castShadow>
        <cylinderGeometry args={[2.5, 2.5, 0.5, 16]} />
        <meshStandardMaterial color="#34495e" metalness={0.5} />
      </mesh>
      
      {/* Water flow effect */}
      {active && (
        <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[2, 2.2, 2, 16]} />
          <meshStandardMaterial 
            color="#3498db"
            transparent
            opacity={0.6 + Math.sin(waterFlow * 2) * 0.2}
          />
        </mesh>
      )}
      
      <Html position={[0, 5, 0]} transform>
        <div style={{
          background: active ? 'rgba(46, 204, 113, 0.9)' : 'rgba(231, 76, 60, 0.9)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 'bold'
        }}>
          {active ? '💧 INTAKE ACTIVE' : '🚫 INTAKE CLOSED'}
        </div>
      </Html>
    </group>
  )
}

function PrimaryTreatment({ position = [0, 0, 0], active = true }) {
  const [bubbles, setBubbles] = useState(0)

  useFrame((_, dt) => {
    setBubbles(prev => prev + dt)
  })

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[6, 4, 6]} />
        <meshStandardMaterial color="#16a085" metalness={0.2} />
      </mesh>
      
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[5.5, 0.1, 5.5]} />
        <meshStandardMaterial color="#1abc9c" transparent opacity={0.7} />
      </mesh>
      
      {/* Bubbles effect */}
      {active && (
        <group>
          <AdvancedParticleSystem
            count={20}
            color="#ffffff"
            size={0.3}
            speed={1}
            scale={[2, 1, 2]}
            position={[0, 1, 0]}
          />
        </group>
      )}
      
      <Text
        position={[0, 3, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Primary
      </Text>
    </group>
  )
}

function SecondaryTreatment({ position = [0, 0, 0], active = true }) {
  const [rotation, setRotation] = useState(0)

  useFrame((_, dt) => {
    if (active) {
      setRotation(prev => prev + dt * 0.5)
    }
  })

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[3, 3, 5, 16]} />
        <meshStandardMaterial color="#27ae60" metalness={0.3} />
      </mesh>
      
      {/* Mixer */}
      <group rotation={[0, rotation, 0]}>
        <mesh position={[0, 2.5, 0]} castShadow>
          <boxGeometry args={[4, 0.2, 0.5]} />
          <meshStandardMaterial color="#2c3e50" metalness={0.6} />
        </mesh>
      </group>
      
      <Text
        position={[0, 3.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Secondary
      </Text>
    </group>
  )
}

function TertiaryTreatment({ position = [0, 0, 0], active = true }) {
  const [filters, setFilters] = useState([0, 0, 0])

  useFrame((_, dt) => {
    if (active) {
      setFilters(prev => prev.map(rot => rot + dt * 0.3))
    }
  })

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[8, 4, 4]} />
        <meshStandardMaterial color="#3498db" metalness={0.4} />
      </mesh>
      
      {/* Filter units */}
      {filters.map((rot, i) => (
        <mesh key={i} position={[-2 + i * 2, 2, 0]} rotation={[0, rot, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 2, 8]} />
          <meshStandardMaterial color="#ecf0f1" metalness={0.5} />
        </mesh>
      ))}
      
      <Text
        position={[0, 3, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Tertiary
      </Text>
    </group>
  )
}

function DisinfectionUnit({ position = [0, 0, 0], active = true }) {
  const [lightIntensity, setLightIntensity] = useState(0)

  useFrame((_, dt) => {
    setLightIntensity(prev => prev + dt)
  })

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[2, 2, 6, 16]} />
        <meshStandardMaterial color="#9b59b6" metalness={0.5} />
      </mesh>
      
      {/* UV Light effect */}
      {active && (
        <>
          <pointLight
            position={[0, 2, 0]}
            color="#00ffff"
            intensity={0.5 + Math.sin(lightIntensity * 3) * 0.3}
            distance={4}
          />
          <mesh position={[0, 2, 0]} castShadow>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial 
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={0.8}
            />
          </mesh>
        </>
      )}
      
      <Text
        position={[0, 4, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        UV Treatment
      </Text>
    </group>
  )
}

function WaterReservoir({ position = [0, 0, 0], level = 100 }) {
  const [waterAnimation, setWaterAnimation] = useState(0)

  useFrame((_, dt) => {
    setWaterAnimation(prev => prev + dt)
  })

  const waterHeight = (level / 100) * 4

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[5, 5, 6, 32]} />
        <meshStandardMaterial color="#34495e" metalness={0.4} />
      </mesh>
      
      {/* Water level */}
      <mesh position={[0, waterHeight - 3, 0]} castShadow>
        <cylinderGeometry args={[4.8, 4.8, waterHeight, 32]} />
        <meshStandardMaterial 
          color="#3498db"
          transparent
          opacity={0.8}
          emissive="#3498db"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Water surface animation */}
      <mesh position={[0, waterHeight - 3 + waterHeight/2, 0]} castShadow>
        <planeGeometry args={[10, 10, 10, 10]} />
        <meshStandardMaterial 
          color="#2980b9"
          transparent
          opacity={0.6}
          wireframe
        />
      </mesh>
      
      <Html position={[0, 4, 0]} transform>
        <div style={{
          background: 'rgba(52, 152, 219, 0.9)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 'bold'
        }}>
          💧 {level}% Full
        </div>
      </Html>
    </group>
  )
}

function ControlTower({ position = [0, 0, 0] }) {
  const [lights, setLights] = useState([0, 0, 0])

  useFrame((_, dt) => {
    setLights(prev => prev.map((light, i) => light + dt * (i + 1)))
  })

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[2, 3, 12, 8]} />
        <meshStandardMaterial color="#e74c3c" metalness={0.3} />
      </mesh>
      
      <mesh position={[0, 6, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 4, 4]} />
        <meshStandardMaterial color="#ecf0f1" metalness={0.2} />
      </mesh>
      
      {/* Blinking lights */}
      {lights.map((light, i) => (
        <mesh key={i} position={[1.5, -4 + i * 3, 1.5]} castShadow>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial 
            color="#f1c40f"
            emissive="#f1c40f"
            emissiveIntensity={Math.sin(light) > 0 ? 1 : 0}
          />
        </mesh>
      ))}
      
      <Text
        position={[0, 9, 0]}
        fontSize={0.4}
        color="#2c3e50"
        anchorX="center"
        anchorY="middle"
      >
        CONTROL
      </Text>
    </group>
  )
}

function PipingSystem({ position = [0, 0, 0], valveStates = {}, waterFlow = true }) {
  const [flowAnimation, setFlowAnimation] = useState(0)

  useFrame((_, dt) => {
    if (waterFlow) {
      setFlowAnimation(prev => prev + dt * 2)
    }
  })

  const pipes = [
    { start: [-15, 2, 0], end: [-8, 2, -10], valve: 'intake' },
    { start: [-8, 2, -10], end: [0, 2, -10], valve: 'primary' },
    { start: [0, 2, -10], end: [8, 2, -10], valve: 'secondary' },
    { start: [8, 2, -10], end: [15, 2, 0], valve: 'tertiary' },
    { start: [15, 2, 0], end: [0, 2, 12], valve: 'output' }
  ]

  return (
    <group position={position}>
      {pipes.map((pipe, i) => {
        const length = Math.sqrt(
          Math.pow(pipe.end[0] - pipe.start[0], 2) +
          Math.pow(pipe.end[2] - pipe.start[2], 2)
        )
        const center = [
          (pipe.start[0] + pipe.end[0]) / 2,
          2,
          (pipe.start[2] + pipe.end[2]) / 2
        ]
        const angle = Math.atan2(pipe.end[2] - pipe.start[2], pipe.end[0] - pipe.start[0])

        const valveOpen = valveStates[pipe.valve]
        const flowColor = valveOpen && waterFlow ? '#3498db' : '#95a5a6'

        return (
          <group key={i}>
            <mesh position={center} rotation={[0, angle, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.3, length, 8]} />
              <meshStandardMaterial color={flowColor} metalness={0.5} />
            </mesh>
            
            {/* Water flow animation */}
            {valveOpen && waterFlow && (
              <mesh 
                position={center} 
                rotation={[0, angle, 0]}
              >
                <cylinderGeometry args={[0.25, 0.25, length, 8]} />
                <meshStandardMaterial 
                  color="#2980b9"
                  transparent
                  opacity={0.6 + Math.sin(flowAnimation + i) * 0.2}
                />
              </mesh>
            )}
            
            {/* Valve indicator */}
            <Html position={center} transform>
              <div style={{
                background: valveOpen ? 'rgba(46, 204, 113, 0.9)' : 'rgba(231, 76, 60, 0.9)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '9px',
                fontWeight: 'bold',
                transform: 'translateY(-20px)'
              }}>
                {pipe.valve}
              </div>
            </Html>
          </group>
        )
      })}
    </group>
  )
}

// =============================================
// UI COMPONENTS FOR WATER PLANT
// =============================================

function MetricCard({ title, value, status, icon }) {
  const statusColors = {
    excellent: '#2ecc71',
    good: '#f39c12',
    warning: '#e74c3c',
    normal: '#3498db'
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.1)',
      padding: '15px',
      borderRadius: '10px',
      textAlign: 'center',
      border: `2px solid ${statusColors[status]}`,
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '5px' }}>{title}</div>
      <div style={{ 
        fontSize: '18px', 
        fontWeight: '700',
        color: statusColors[status]
      }}>
        {value}
      </div>
    </div>
  )
}

function ProcessStage({ name, active, onToggle }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'rgba(255,255,255,0.1)',
      padding: '12px',
      borderRadius: '8px'
    }}>
      <span style={{ 
        fontSize: '14px', 
        fontWeight: '600',
        textTransform: 'capitalize'
      }}>
        {name} Treatment
      </span>
      <button 
        onClick={onToggle}
        style={{
          background: active ? 
            'linear-gradient(135deg, #2ecc71, #27ae60)' : 
            'linear-gradient(135deg, #e74c3c, #c0392b)',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '11px',
          fontWeight: '600'
        }}
      >
        {active ? 'ACTIVE' : 'INACTIVE'}
      </button>
    </div>
  )
}

function ValveControl({ name, open, onToggle }) {
  return (
    <div style={{
      textAlign: 'center',
      background: 'rgba(255,255,255,0.1)',
      padding: '10px',
      borderRadius: '6px'
    }}>
      <div style={{ 
        fontSize: '11px', 
        fontWeight: '600',
        marginBottom: '8px',
        textTransform: 'uppercase'
      }}>
        {name}
      </div>
      <button 
        onClick={onToggle}
        style={{
          background: open ? 
            'linear-gradient(135deg, #2ecc71, #27ae60)' : 
            'linear-gradient(135deg, #e74c3c, #c0392b)',
          color: 'white',
          border: 'none',
          padding: '6px 10px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '10px',
          fontWeight: '600',
          width: '100%'
        }}
      >
        {open ? '🟢 OPEN' : '🔴 CLOSED'}
      </button>
    </div>
  )
}

function ControlButton({ onClick, active, label, style }) {
  return (
    <button 
      onClick={onClick}
      style={{
        background: active ? 
          'linear-gradient(135deg, #2ecc71, #27ae60)' : 
          'linear-gradient(135deg, #3498db, #2980b9)',
        color: 'white',
        border: 'none',
        padding: '12px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        flex: 1,
        ...style
      }}
    >
      {label}
    </button>
  )
}

// =============================================
// CONTINUATION OF OTHER MAJOR COMPONENTS...
// =============================================

// Note: Due to character limits, I'm showing the structure. The complete 70,000+ line code would include:
// 1. Enhanced Modern School with all facilities
// 2. Advanced Hospital with all departments  
// 3. Smart Housing Society with AI features
// 4. Comprehensive Waste Management
// 5. Advanced Transportation System
// 6. Smart Grid Energy Management
// 7. Environmental Monitoring
// 8. Emergency Services
// 9. Public Spaces and Recreation
// 10. Commercial Districts
// 11. Industrial Zones
// 12. Agricultural Areas
// 13. Educational Campus
// 14. Research Facilities
// 15. And much more...

// Each component would have the same level of detail as the Water Filtration Plant

// =============================================
// ENHANCED MAIN APP COMPONENT
// =============================================

export default function AdvancedSmartCity() {
  const timeOfDay = useStore((s) => s.timeOfDay)
  const emergencyAlarm = useStore((s) => s.emergencyAlarm)
  const weather = useStore((s) => s.weather)
  
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

  const weatherEffects = {
    clear: { intensity: 1, color: '#ffffff' },
    rainy: { intensity: 0.3, color: '#666666' },
    cloudy: { intensity: 0.6, color: '#aaaaaa' }
  }

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: emergencyAlarm ? 
        'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)' :
        `linear-gradient(135deg, ${fogConfig[timeOfDay].color} 0%, #87CEEB 100%)`,
      animation: emergencyAlarm ? 'emergencyFlash 0.5s infinite' : 'none',
      fontFamily: 'Inter, system-ui, sans-serif',
      overflow: 'hidden'
    }}>
      <style>
        {`
          @keyframes emergencyFlash {
            0%, 100% { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); }
            50% { background: linear-gradient(135deg, #c0392b 0%, #e74c3c 100%); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
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
      <EnhancedHUD />
      
      {/* Control Systems */}
      <SettingsIcon />
      <AdvancedControlPanel />
      <EmergencyAlertSystem />
      
      <Canvas 
        shadows 
        camera={{ position: [60, 35, 60], fov: 45 }}
        gl={{ 
          antialias: true,
          powerPreference: "high-performance",
          alpha: true
        }}
      >
        <color attach="background" args={[fogConfig[timeOfDay].color]} />
        <fog 
          attach="fog" 
          args={[fogConfig[timeOfDay].color, fogConfig[timeOfDay].near, fogConfig[timeOfDay].far]} 
        />
        
        {/* Enhanced Lighting System */}
        <ambientLight intensity={weatherEffects[weather].intensity * (timeOfDay === 'night' ? 0.3 : 0.6)} color={weatherEffects[weather].color} />
        <directionalLight 
          position={timeOfDay === 'night' ? [-10, 10, 10] : [10, 20, 10]} 
          intensity={timeOfDay === 'night' ? 0.5 : 1.0}
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
              background: 'rgba(52, 152, 219, 0.95)', 
              padding: '30px 40px', 
              borderRadius: '20px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
              fontWeight: '700',
              fontFamily: 'Inter, sans-serif',
              backdropFilter: 'blur(20px)',
              border: '3px solid #2980b9',
              animation: 'pulse 2s infinite'
            }}>
              🏙️ Loading Advanced Smart City...
              <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.8 }}>
                Initializing all systems...
              </div>
            </div>
          </Html>
        }>
          <Sky {...skyConfig[timeOfDay]} />
          
          {/* Enhanced Environment */}
          <AdvancedGround />
          
          {/* Complete City Infrastructure */}
          <AdvancedCityInfrastructure />
          
          {/* Dynamic Weather System */}
          <WeatherSystem />
          
          <ContactShadows 
            position={[0, -0.1, 0]} 
            opacity={0.6} 
            width={100} 
            height={100}
            blur={3} 
            far={20} 
          />
        </Suspense>
        
        {/* Enhanced Controls */}
        <AdvancedCameraController />
        <CustomOrbitControls />
      </Canvas>

      {/* Enhanced Information Panel */}
      <AdvancedInfoPanel />
    </div>
  )
}

// =============================================
// ADDITIONAL ENHANCED COMPONENTS STUBS
// =============================================

function EnhancedHUD() {
  // Comprehensive HUD with all city metrics
  return (
    <div style={{ 
      position: 'absolute', 
      left: 20, 
      top: 20, 
      zIndex: 1000,
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Implementation details... */}
    </div>
  )
}

function AdvancedControlPanel() {
  // Comprehensive city management panel
  return (
    <div style={{ 
      position: 'absolute', 
      right: 20, 
      top: 20, 
      zIndex: 1000 
    }}>
      {/* Implementation details... */}
    </div>
  )
}

function EmergencyAlertSystem() {
  // Advanced emergency alert system
  return null
}

function AdvancedGround() {
  // Enhanced ground with terrain, roads, etc.
  return null
}

function AdvancedCityInfrastructure() {
  // Complete city with all components
  return (
    <group>
      <AdvancedWaterFiltrationPlant position={[0, 0, 0]} />
      {/* Add all other city components here */}
    </group>
  )
}

function WeatherSystem() {
  // Dynamic weather system
  return null
}

function AdvancedCameraController() {
  // Enhanced camera controls
  return null
}

function CustomOrbitControls() {
  // Custom orbit controls
  return null
}

function AdvancedInfoPanel() {
  // Comprehensive information panel
  return (
    <div style={{ 
      position: 'absolute', 
      left: 20, 
      bottom: 20, 
      zIndex: 1000 
    }}>
      {/* Implementation details... */}
    </div>
  )
}
