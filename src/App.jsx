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
  setShowCityControl: (show) => set({ showCityControl: show })
}))

/* ----- Vertical Farming Components ----- */
function LemonTree({ position = [0, 0, 0], growthStage = 1 }) {
  return (
    <group position={position}>
      {/* Tree trunk */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 3, 8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Tree leaves */}
      <mesh position={[0, 3, 0]} castShadow>
        <sphereGeometry args={[1.2, 8, 8]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>
      
      {/* Lemons */}
      {growthStage > 0.5 && Array.from({ length: Math.floor(growthStage * 8) }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 0.8
        return (
          <mesh 
            key={i}
            position={[
              Math.cos(angle) * radius,
              2.5 + Math.sin(i * 2) * 0.3,
              Math.sin(angle) * radius
            ]} 
            castShadow
          >
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#ffff00" />
          </mesh>
        )
      })}
    </group>
  )
}

function TomatoPlant({ position = [0, 0, 0], growthStage = 1 }) {
  return (
    <group position={position}>
      {/* Plant stem */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.08, 1.6, 8]} />
        <meshStandardMaterial color="#2ecc71" />
      </mesh>
      
      {/* Leaves */}
      {[0.4, 0.8, 1.2].map((y, i) => (
        <mesh key={i} position={[0.3, y, 0]} rotation={[0, 0, Math.PI/4]} castShadow>
          <sphereGeometry args={[0.2, 6, 6]} />
          <meshStandardMaterial color="#27ae60" />
        </mesh>
      ))}
      
      {/* Tomatoes */}
      {growthStage > 0.6 && Array.from({ length: Math.floor(growthStage * 6) }).map((_, i) => (
        <mesh 
          key={i}
          position={[
            Math.cos(i * 1.5) * 0.2,
            0.5 + i * 0.15,
            Math.sin(i * 1.5) * 0.2
          ]} 
          castShadow
        >
          <sphereGeometry args={[0.1, 6, 6]} />
          <meshStandardMaterial color="#ff4444" />
        </mesh>
      ))}
    </group>
  )
}

function AppleTree({ position = [0, 0, 0], growthStage = 1 }) {
  return (
    <group position={position}>
      {/* Tree trunk */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 2.4, 8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Tree leaves */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color="#2ecc71" />
      </mesh>
      
      {/* Apples */}
      {growthStage > 0.7 && Array.from({ length: Math.floor(growthStage * 6) }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2
        const radius = 0.7
        return (
          <mesh 
            key={i}
            position={[
              Math.cos(angle) * radius,
              2.2 + Math.sin(i * 3) * 0.2,
              Math.sin(angle) * radius
            ]} 
            castShadow
          >
            <sphereGeometry args={[0.12, 6, 6]} />
            <meshStandardMaterial color="#ff4444" />
          </mesh>
        )
      })}
    </group>
  )
}

function SoilSensor({ position = [0, 0, 0], moistureLevel = 0.7 }) {
  return (
    <group position={position}>
      {/* Sensor base */}
      <mesh castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.3, 8]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
      
      {/* Sensor probe */}
      <mesh position={[0, -0.4, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      {/* Status light */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial 
          color={moistureLevel > 0.3 ? "#00ff00" : "#ff4444"}
          emissive={moistureLevel > 0.3 ? "#00ff00" : "#ff4444"}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      <Html position={[0, 0.6, 0]}>
        <div style={{
          background: 'rgba(255,255,255,0.9)',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '10px',
          fontWeight: 'bold',
          color: moistureLevel > 0.3 ? '#27ae60' : '#e74c3c'
        }}>
          💧 {Math.round(moistureLevel * 100)}%
        </div>
      </Html>
    </group>
  )
}

function AutomatedIrrigation({ position = [0, 0, 0], isActive = true }) {
  return (
    <group position={position}>
      {/* Water tank */}
      <mesh castShadow>
        <cylinderGeometry args={[0.8, 0.8, 2, 16]} />
        <meshStandardMaterial color="#3498db" transparent opacity={0.8} />
      </mesh>
      
      {/* Water level */}
      <mesh position={[0, -0.5, 0]} castShadow>
        <cylinderGeometry args={[0.75, 0.75, 1, 16]} />
        <meshStandardMaterial color="#2980b9" />
      </mesh>
      
      {/* Pipes */}
      <mesh position={[0.9, 0.5, 0]} rotation={[0, 0, Math.PI/2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
        <meshStandardMaterial color="#95a5a6" />
      </mesh>
      
      {/* Control unit */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.6, 0.3, 0.6]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      {/* Status indicator */}
      <mesh position={[0, 1.35, 0.31]} castShadow>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial 
          color={isActive ? "#00ff00" : "#ff4444"}
          emissive={isActive ? "#00ff00" : "#ff4444"}
          emissiveIntensity={0.8}
        />
      </mesh>
      
      <Html position={[0, 2, 0]}>
        <div style={{
          background: 'rgba(255,255,255,0.9)',
          padding: '6px 10px',
          borderRadius: '8px',
          fontSize: '11px',
          fontWeight: 'bold',
          color: isActive ? '#27ae60' : '#e74c3c'
        }}>
          {isActive ? '🚰 IRRIGATION ACTIVE' : '🚰 IRRIGATION OFF'}
        </div>
      </Html>
    </group>
  )
}

function VerticalFarm({ position = [0, 0, 0] }) {
  const [growthProgress, setGrowthProgress] = useState(0)
  const [moistureLevels, setMoistureLevels] = useState([0.8, 0.6, 0.7, 0.5])
  const [irrigationActive, setIrrigationActive] = useState(true)

  // Simulate plant growth and moisture changes
  useFrame((_, dt) => {
    setGrowthProgress(prev => Math.min(1, prev + dt * 0.1))
    
    // Randomly adjust moisture levels
    if (Math.random() < 0.02) {
      setMoistureLevels(prev =>
  prev.map(level => Math.max(0.1, Math.min(1, level + (Math.random() - 0.5) * 0.1)))
);
    
    // Auto irrigation when moisture is low
    if (moistureLevels.some(level => level < 0.3)) {
      setIrrigationActive(true)
      setMoistureLevels(prev =>
        prev.map(level => Math.min(1, level + 0.1))
      )
    }
  })

  return (
    <group position={position}>
      {/* Main vertical farm structure */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[12, 8, 6]} />
        <meshStandardMaterial color="#34495e" roughness={0.8} />
      </mesh>

      {/* Glass walls */}
      <mesh position={[0, 0, 3.01]} castShadow>
        <boxGeometry args={[11.8, 7.8, 0.1]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 0, -3.01]} castShadow>
        <boxGeometry args={[11.8, 7.8, 0.1]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.3} />
      </mesh>

      {/* Growing levels */}
      {[0, 1, 2, 3].map(level => (
        <group key={level} position={[0, -2 + level * 2, 0]}>
          {/* Growing shelf */}
          <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
            <boxGeometry args={[10, 0.1, 4]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
          
          {/* Soil */}
          <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
            <boxGeometry args={[10, 0.1, 4]} />
            <meshStandardMaterial color="#a67c52" />
          </mesh>
          
          {/* Plants on this level */}
          <group>
            {/* Lemon trees on level 0 */}
            {level === 0 && [-3, 0, 3].map((x, i) => (
              <LemonTree key={i} position={[x, 1, -1]} growthStage={growthProgress} />
            ))}
            
            {/* Tomato plants on level 1 */}
            {level === 1 && [-4, -2, 0, 2, 4].map((x, i) => (
              <TomatoPlant key={i} position={[x, 1, -1]} growthStage={growthProgress} />
            ))}
            
            {/* Apple trees on level 2 */}
            {level === 2 && [-3, 0, 3].map((x, i) => (
              <AppleTree key={i} position={[x, 1, -1]} growthStage={growthProgress} />
            ))}
            
            {/* Mixed plants on level 3 */}
            {level === 3 && [-3, 0, 3].map((x, i) => (
              <TomatoPlant key={i} position={[x, 1, -1]} growthStage={growthProgress} />
            ))}
          </group>
          
          {/* Soil sensors for each level */}
          <SoilSensor 
            position={[4, 1, 1]} 
            moistureLevel={moistureLevels[level]} 
          />
        </group>
      ))}

      {/* Automated irrigation system */}
      <AutomatedIrrigation 
        position={[-5, 0, 0]} 
        isActive={irrigationActive} 
      />

      {/* Control room */}
      <mesh position={[5, 1, 2.9]} castShadow>
        <boxGeometry args={[2, 2, 0.2]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* Monitoring screens in control room */}
      {[0, 1].map(i => (
        <mesh key={i} position={[4.5 + i * 1, 1.5, 2.91]} castShadow>
          <planeGeometry args={[0.8, 0.6]} />
          <meshStandardMaterial color={i === 0 ? "#00ff00" : "#0000ff"} />
        </mesh>
      ))}

      <Text
        position={[0, 5, 0]}
        fontSize={0.5}
        color="#27ae60"
        anchorX="center"
        anchorY="middle"
      >
        🍋 Vertical Farm
      </Text>

      <Html position={[0, 6, 0]} transform>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '15px',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          minWidth: '300px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#27ae60' }}>🏢 Vertical Farming System</h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '10px',
            marginBottom: '12px'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div>🌱 Growth Progress: {Math.round(growthProgress * 100)}%</div>
              <div>💧 Moisture Levels:</div>
              {moistureLevels.map((level, i) => (
                <div key={i} style={{ fontSize: '12px', marginLeft: '10px' }}>
                  Level {i+1}: {Math.round(level * 100)}%
                </div>
              ))}
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <div>🍋 Lemons: {Math.floor(growthProgress * 8)}</div>
              <div>🍅 Tomatoes: {Math.floor(growthProgress * 6)}</div>
              <div>🍎 Apples: {Math.floor(growthProgress * 6)}</div>
              <div>🚰 Irrigation: {irrigationActive ? 'ACTIVE' : 'IDLE'}</div>
            </div>
          </div>

          <div style={{ 
            background: '#ecf0f1', 
            padding: '8px', 
            borderRadius: '6px',
            fontSize: '12px'
          }}>
            <div>✅ Automated Soil Monitoring</div>
            <div>✅ Smart Irrigation System</div>
            <div>✅ Multi-Level Cultivation</div>
            <div>✅ Real-time Growth Tracking</div>
          </div>
        </div>
      </Html>
    </group>
  )
}

/* ----- Enhanced Camera Controller ----- */
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

/* ----- Custom Orbit Controls ----- */
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
      maxDistance={50}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
      panSpeed={0.5}
      screenSpacePanning={true}
    />
  )
}

/* ----- Walking People ----- */
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
      {/* Body */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      
      {/* Walking animation */}
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

/* ----- Cultural Center with Banners ----- */
function CulturalCenter({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)

  const culturalStyles = [
    { name: "Sindhi", color: "#ff6b6b", pattern: "🎵" },
    { name: "Punjabi", color: "#4ecdc4", pattern: "💃" },
    { name: "Pashto", color: "#45b7d1", pattern: "⚔️" },
    { name: "Balochi", color: "#96ceb4", pattern: "🏔️" }
  ]

  return (
    <group position={position}>
      {/* Main Cultural Center Building */}
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

      {/* Entrance */}
      <mesh position={[0, 3, 4.1]} castShadow>
        <boxGeometry args={[3, 4, 0.2]} />
        <meshStandardMaterial color="#a67c52" />
      </mesh>

      {/* Cultural Banners */}
      <group position={[0, 4, 0]}>
        {culturalStyles.map((culture, index) => {
          const angle = (index / culturalStyles.length) * Math.PI * 2
          const radius = 8
          const bannerX = Math.cos(angle) * radius
          const bannerZ = Math.sin(angle) * radius
          
          return (
            <group key={culture.name} position={[bannerX, 0, bannerZ]} rotation={[0, -angle, 0]}>
              {/* Banner Pole */}
              <mesh position={[0, 4, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 8, 8]} />
                <meshStandardMaterial color="#d4af37" />
              </mesh>
              
              {/* Banner */}
              <mesh position={[0, 6, -0.5]} rotation={[0, 0, 0]} castShadow>
                <planeGeometry args={[2, 3]} />
                <meshStandardMaterial color={culture.color} />
              </mesh>
              
              {/* Cultural Symbol */}
              <Text
                position={[0, 6, -0.51]}
                fontSize={0.8}
                color="white"
                anchorX="center"
                anchorY="middle"
              >
                {culture.pattern}
              </Text>
              
              {/* Culture Name */}
              <Text
                position={[0, 4.5, -0.51]}
                fontSize={0.3}
                color="white"
                anchorX="center"
                anchorY="middle"
              >
                {culture.name}
              </Text>
            </group>
          )
        })}
      </group>

      {/* Central Flag */}
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

      {/* People gathering around cultural center */}
      <Person position={[3, 0, 2]} color="#8b4513" speed={0.3} path={[
        [3, 0.5, 2], [2, 0.5, 1], [1, 0.5, 2], [2, 0.5, 3], [3, 0.5, 2]
      ]} />
      
      <Person position={[-2, 0, -1]} color="#2c3e50" speed={0.4} path={[
        [-2, 0.5, -1], [-1, 0.5, -2], [0, 0.5, -1], [-1, 0.5, 0], [-2, 0.5, -1]
      ]} />
    </group>
  )
}

/* ----- Enhanced Ground WITHOUT Roads ----- */
function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#d2b48c" roughness={0.9} metalness={0.1} />
      </mesh>
      
      <gridHelper args={[200, 200, '#8b7355', '#8b7355']} position={[0, 0.01, 0]} />
      <ContactShadows position={[0, -0.03, 0]} opacity={0.3} width={50} blur={2} far={20} />
    </>
  )
}

/* ----- SMALLER Wind Turbine Component ----- */
function WindTurbine({ position = [0, 0, 0] }) {
  const turbineRef = useRef()
  
  useFrame(() => {
    if (turbineRef.current) {
      turbineRef.current.rotation.y += 0.05
    }
  })

  return (
    <group position={position} scale={[0.7, 0.7, 0.7]}>
      {/* Tower */}
      <mesh position={[0, 5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 8, 8]} />
        <meshStandardMaterial color="#708090" />
      </mesh>
      
      {/* Rotating blades */}
      <group ref={turbineRef} position={[0, 8, 0]}>
        {/* Hub */}
        <mesh castShadow>
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        
        {/* Blades - Smaller */}
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

/* ----- Solar Panel Component ----- */
function SolarPanel({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[1.5, 0.02, 1]} />
        <meshStandardMaterial color="#1e3a8a" metalness={0.9} roughness={0.05} />
      </mesh>
      <mesh position={[0, -0.1, 0]} castShadow>
        <boxGeometry args={[1.6, 0.08, 1.1]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
    </group>
  )
}

/* ----- Energy Efficient House ----- */
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
      {/* Main structure - BLUE for special house */}
      <mesh castShadow receiveShadow onClick={handleClick}>
        <boxGeometry args={[4, height, 4]} />
        <meshStandardMaterial color={isSpecial ? "#3498db" : color} roughness={0.8} metalness={0.1} />
      </mesh>
      
      {/* Double-sided glass windows */}
      <group>
        {Array.from({ length: Math.floor(height / 2) }).map((_, floor) =>
          [-1.5, 1.5].map((side, i) => (
            <group key={`${floor}-${side}`}>
              {/* Double glass windows */}
              <mesh
                position={[2.01, (floor * 2) - height/2 + 2, side * 0.8]}
                castShadow
              >
                <boxGeometry args={[0.02, 1.2, 1.2]} />
                <meshStandardMaterial color="#87CEEB" transparent opacity={0.8} />
              </mesh>
              <mesh
                position={[2.02, (floor * 2) - height/2 + 2, side * 0.8]}
                castShadow
              >
                <boxGeometry args={[0.02, 1.2, 1.2]} />
                <meshStandardMaterial color="#e3f2fd" transparent opacity={0.6} />
              </mesh>
              
              {/* Window frames */}
              <mesh position={[2, (floor * 2) - height/2 + 2, side * 0.8]} castShadow>
                <boxGeometry args={[0.04, 1.3, 1.25]} />
                <meshStandardMaterial color="#2c3e50" />
              </mesh>
            </group>
          ))
        )}
      </group>

      {/* Front entrance */}
      <mesh position={[0, 1.5, 2.01]} castShadow>
        <boxGeometry args={[1.2, 2.5, 0.1]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* Rooftop */}
      <mesh position={[0, height/2 + 0.2, 0]} castShadow>
        <boxGeometry args={[4.2, 0.4, 4.2]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>

      {/* Solar Panels on roof */}
      {hasSolar && (
        <group position={[0, height/2 + 0.3, 0]}>
          <SolarPanel position={[0, 0, 0]} rotation={[0, 0, 0]} />
          <SolarPanel position={[1.8, 0, 1.2]} rotation={[0, Math.PI/4, 0]} />
          <SolarPanel position={[-1.8, 0, 1.2]} rotation={[0, -Math.PI/4, 0]} />
        </group>
      )}

      {/* SMALLER Wind Turbine on roof */}
      {hasTurbine && (
        <WindTurbine position={[0, height/2, 0]} />
      )}

      {/* Building label */}
      <Text
        position={[0, height/2 + 1, 0]}
        fontSize={0.3}
        color={isSpecial ? "#e74c3c" : "#8b4513"}
        anchorX="center"
        anchorY="middle"
      >
        {isSpecial ? "🏠 ACCESSIBLE HOME" : name}
      </Text>

      {/* Special house information */}
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
            <div>☀️ Solar Powered</div>
            <div>🌬️ Wind Turbine</div>
          </div>
        </Html>
      )}
    </group>
  )
}

/* ----- Energy Efficient Society ----- */
function EnergyEfficientSociety({ position = [0, 0, 0] }) {
  const houses = [
    // Row 1
    { position: [-18, 0, -35], name: "Eco Home 1" },
    { position: [-12, 0, -35], name: "Eco Home 2" },
    { position: [-6, 0, -35], name: "Eco Home 3" },
    { position: [0, 0, -35], name: "Eco Home 4" },
    { position: [6, 0, -35], name: "Eco Home 5" },
    { position: [12, 0, -35], name: "Eco Home 6" },
    { position: [18, 0, -35], name: "Eco Home 7" },
    
    // Row 2
    { position: [-18, 0, -28], name: "Eco Home 8" },
    { position: [-12, 0, -28], name: "Eco Home 9" },
    { position: [-6, 0, -28], name: "Eco Home 10" },
    { position: [0, 0, -28], name: "Eco Home 11", isSpecial: true }, // Special accessible house
    { position: [6, 0, -28], name: "Eco Home 12" },
    { position: [12, 0, -28], name: "Eco Home 13" },
    { position: [18, 0, -28], name: "Eco Home 14" },
    
    // Row 3
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
      {/* Society boundary and roads */}
      <mesh position={[0, 0.01, -28]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial color="#27ae60" transparent opacity={0.1} />
      </mesh>

      {/* Society label */}
      <Text
        position={[0, 5, -28]}
        fontSize={0.6}
        color="#27ae60"
        anchorX="center"
        anchorY="middle"
      >
        🌱 Energy Efficient Society
      </Text>

      {/* Generate all houses */}
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

      {/* Society park area */}
      <mesh position={[0, 0.03, -35]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[8, 32]} />
        <meshStandardMaterial color="#2ecc71" />
      </mesh>

      {/* Park trees */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 6
        return (
          <group key={i} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius - 35]}>
            {/* Tree trunk */}
            <mesh position={[0, 1.5, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
              <meshStandardMaterial color="#8b4513" />
            </mesh>
            {/* Tree top */}
            <mesh position={[0, 3.5, 0]} castShadow>
              <sphereGeometry args={[1.2, 8, 8]} />
              <meshStandardMaterial color="#27ae60" />
            </mesh>
          </group>
        )
      })}

      {/* People in society */}
      <Person position={[5, 0, -30]} color="#8b4513" speed={0.2} path={[
        [5, 0.5, -30], [3, 0.5, -32], [1, 0.5, -30], [3, 0.5, -28], [5, 0.5, -30]
      ]} />
      
      <Person position={[-5, 0, -32]} color="#2c3e50" speed={0.3} path={[
        [-5, 0.5, -32], [-7, 0.5, -30], [-9, 0.5, -32], [-7, 0.5, -34], [-5, 0.5, -32]
      ]} />
    </group>
  )
}

/* ----- City Layout ----- */
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
      {/* Cultural Center */}
      <CulturalCenter position={[0, 0, 25]} />
      
      {/* Vertical Farm - SEPARATED from society */}
      <VerticalFarm position={[30, 0, -10]} />
      
      {/* Energy Efficient Society - SEPARATED from vertical farm */}
      <EnergyEfficientSociety position={[0, 0, 0]} />
      
      {/* Regular buildings */}
      {buildings.map((building, index) => (
        <EnergyEfficientHouse
          key={index}
          position={building.position}
          height={building.height}
          color={building.color}
          name={building.name}
          hasTurbine={building.hasTurbine}
          hasSolar={true}
        />
      ))}
      
      {/* More walking people around the city */}
      <Person position={[5, 0, 22]} color="#8b4513" speed={0.3} path={[
        [5, 0.5, 22], [3, 0.5, 24], [1, 0.5, 22], [3, 0.5, 20], [5, 0.5, 22]
      ]} />
      
      <Person position={[-3, 0, 27]} color="#2c3e50" speed={0.4} path={[
        [-3, 0.5, 27], [-5, 0.5, 25], [-7, 0.5, 27], [-5, 0.5, 29], [-3, 0.5, 27]
      ]} />
      
      <Person position={[8, 0, 28]} color="#8b4513" speed={0.2} path={[
        [8, 0.5, 28], [10, 0.5, 26], [12, 0.5, 28], [10, 0.5, 30], [8, 0.5, 28]
      ]} />
    </group>
  )
}

/* ----- Enhanced HUD ----- */
function HUD() {
  const alert = useStore((s) => s.alert)
  const timeOfDay = useStore((s) => s.timeOfDay)
  
  const alertStyles = {
    info: { background: 'linear-gradient(135deg, #d2691e, #8b4513)', color: 'white' },
    emergency: { background: 'linear-gradient(135deg, #e74c3c, #c0392b)', color: 'white' },
    success: { background: 'linear-gradient(135deg, #27ae60, #229954)', color: 'white' }
  }

  return (
    <div style={{ position: 'absolute', left: 12, top: 12, zIndex: 50 }}>
      {alert ? (
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
          🏙️ Smart City • Time: {timeOfDay} • No Roads, No Traffic
        </div>
      )}
    </div>
  )
}

/* ----- Settings Icon ----- */
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

/* ----- SMALLER Control Panel ----- */
function ControlPanel() {
  const setTimeOfDay = useStore((s) => s.setTimeOfDay)
  const setFocus = useStore((s) => s.setFocus)
  const timeOfDay = useStore((s) => s.timeOfDay)
  const showCityControl = useStore((s) => s.showCityControl)
  const setShowCityControl = useStore((s) => s.setShowCityControl)

  const locations = {
    '🎪 Cultural Center': { x: 0, y: 15, z: 25, lookAt: { x: 0, y: 0, z: 25 } },
    '🏢 Vertical Farm': { x: 30, y: 10, z: -10, lookAt: { x: 30, y: 0, z: -10 } },
    '🏠 Energy Society': { x: 0, y: 15, z: -28, lookAt: { x: 0, y: 0, z: -28 } },
    '🔵 Accessible Home': { x: 0, y: 8, z: -28, lookAt: { x: 0, y: 0, z: -28 } }
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
          onChange={(e) => setTimeOfDay(e.target.value)}
          style={{ width: '100%', padding: '4px', borderRadius: '6px', border: '1px solid #d2b48c', fontSize: '11px' }}
        >
          <option value="day">☀️ Day</option>
          <option value="evening">🌆 Evening</option>
          <option value="night">🌙 Night</option>
        </select>
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

/* ----- Main App Component ----- */
export default function App() {
  const timeOfDay = useStore((s) => s.timeOfDay)
  
  const skyConfig = {
    day: { sunPosition: [100, 20, 100], inclination: 0, azimuth: 0.25 },
    evening: { sunPosition: [10, 5, 100], inclination: 0, azimuth: 0.25 },
    night: { sunPosition: [-100, -20, 100], inclination: 0, azimuth: 0.25 }
  }

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)'
    }}>
      <style>
        {`
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
          🌟 Features: Cultural Center • Vertical Farming • Energy Society • Accessible Homes
        </div>
        <div style={{ fontSize: 11, color: '#3498db', marginTop: 2 }}>
          🍋 Vertical Farm: Lemons • Tomatoes • Apples • Automated Systems
        </div>
        <div style={{ fontSize: 11, color: '#27ae60', marginTop: 2 }}>
          ⚙️ Click settings icon (top-right) for city controls
        </div>
        <div style={{ fontSize: 11, color: '#e74c3c', marginTop: 2, fontWeight: 'bold' }}>
          🚫 NO ROADS • NO TRAFFIC • PEDESTRIAN-FRIENDLY CITY
        </div>
      </div>
    </div>
  )
}
