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

/* ----- Modern Tech Hub Components ----- */
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

function Drone({ position = [0, 0, 0], isFlying = false }) {
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

function DataCenter({ position = [0, 0, 0] }) {
  const [serverActivity, setServerActivity] = useState([0.6, 0.8, 0.4, 0.7])
  const [dronesFlying, setDronesFlying] = useState(false)
  const [dataFlow, setDataFlow] = useState(0.5)

  useFrame((_, dt) => {
    setServerActivity(prev =>
      prev.map(activity => Math.max(0.3, Math.min(1, activity + (Math.random() - 0.5) * 0.1)))
    )
    
    setDataFlow(prev => Math.max(0.2, Math.min(0.9, prev + (Math.random() - 0.5) * 0.05)))
    
    if (Math.random() < 0.01) {
      setDronesFlying(!dronesFlying)
    }
  })

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

      <Drone position={[-6, 3, 0]} isFlying={dronesFlying} />
      <Drone position={[6, 4, 0]} isFlying={dronesFlying} />

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

/* ----- Wheelchair User ----- */
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

/* ----- Cultural Center with Enhanced Cultural Representations ----- */
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

      {/* Main Entrance */}
      <mesh position={[0, 3, 4.1]} castShadow>
        <boxGeometry args={[3, 4, 0.2]} />
        <meshStandardMaterial color="#a67c52" />
      </mesh>

      {/* Cultural Banners with Enhanced Design */}
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
              
              {/* Banner Flag */}
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

              {/* Cultural Display Platform */}
              <mesh position={[0, 1, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[1.5, 1.5, 0.2, 16]} />
                <meshStandardMaterial color={culture.color} transparent opacity={0.8} />
              </mesh>

              {/* Cultural Artifact */}
              <mesh position={[0, 1.5, 0]} castShadow>
                <boxGeometry args={[1, 0.8, 1]} />
                <meshStandardMaterial color={culture.color} />
              </mesh>

              {/* Cultural Symbol on Platform */}
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

      {/* Central Tower */}
      <mesh position={[0, 9, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 10, 8]} />
        <meshStandardMaterial color="#c9b037" />
      </mesh>

      {/* Cultural Center Title */}
      <Text
        position={[0, 7, 0]}
        fontSize={0.5}
        color="#d4af37"
        anchorX="center"
        anchorY="middle"
      >
        Cultural Center
      </Text>

      {/* Enhanced Cultural Information Display */}
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

      {/* People engaging with culture */}
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
    </group>
  )
}

/* ----- Road System ----- */
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

      {mainRoads.map((road, index) => {
        const segments = Math.floor(Math.sqrt(
          Math.pow(road.end[0] - road.start[0], 2) +
          Math.pow(road.end[2] - road.start[2], 2)
        ) / 4)
        
        return Array.from({ length: segments }).map((_, segIndex) => {
          const t = (segIndex + 0.5) / segments
          const pos = [
            road.start[0] + (road.end[0] - road.start[0]) * t,
            0.02,
            road.start[2] + (road.end[2] - road.start[2]) * t
          ]
          
          return (
            <mesh key={`${index}-${segIndex}`} position={pos} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2, 0.3]} />
              <meshStandardMaterial color="#ffff00" />
            </mesh>
          )
        })
      })}
    </group>
  )
}

/* ----- Bus Station ----- */
function BusStation({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[6, 0.2, 2]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>
      
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[5, 0.1, 1.5]} />
        <meshStandardMaterial color="#34495e" transparent opacity={0.7} />
      </mesh>
      
      {[-2, 2].map((x) => (
        <mesh key={x} position={[x, 1, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
      ))}
      
      <Text
        position={[0, 1.5, 1.1]}
        fontSize={0.3}
        color="#e74c3c"
        anchorX="center"
        anchorY="middle"
      >
        BUS STOP
      </Text>
      
      <Person position={[-1, 0.5, 0]} color="#8b4513" speed={0} />
      <Person position={[1, 0.5, 0]} color="#2c3e50" speed={0} />
    </group>
  )
}

/* ----- Street Lights ----- */
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

/* ----- Street Light System ----- */
function StreetLightSystem() {
  const lightPositions = [
    ...Array.from({ length: 16 }).map((_, i) => [-35 + i * 5, 0, 0]),
    ...Array.from({ length: 16 }).map((_, i) => [0, 0, -35 + i * 5]),
    ...Array.from({ length: 12 }).map((_, i) => [-25 + i * 5, 0, -20]),
    ...Array.from({ length: 10 }).map((_, i) => [-15 + i * 5, 0, 30]),
    
    [15, 0, 15], [-15, 0, 15], [0, 0, 0], [-8, 0, -2], [8, 0, -6],
    
    [10, 0, 25], [-10, 0, 25], [0, 0, 20]
  ]

  return (
    <group>
      {lightPositions.map((pos, index) => (
        <StreetLight key={index} position={pos} />
      ))}
    </group>
  )
}

/* ----- Enhanced Vehicle System with Proper Road Movement ----- */
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

/* ----- Traffic System ----- */
function TrafficSystem() {
  const trafficDensity = useStore((s) => s.trafficDensity)
  
  const carPaths = [
    [[-35, 0.3, 0], [-25, 0.3, 0], [-15, 0.3, 0], [-5, 0.3, 0], [5, 0.3, 0], [15, 0.3, 0], [25, 0.3, 0], [35, 0.3, 0]],
    [[-35, 0.3, -20], [-25, 0.3, -20], [-15, 0.3, -20], [-5, 0.3, -20], [5, 0.3, -20], [15, 0.3, -20], [25, 0.3, -20], [35, 0.3, -20]],
    
    [[0, 0.3, -35], [0, 0.3, -25], [0, 0.3, -15], [0, 0.3, -5], [0, 0.3, 5], [0, 0.3, 15], [0, 0.3, 25], [0, 0.3, 35]],
    [[20, 0.3, -35], [20, 0.3, -25], [20, 0.3, -15], [20, 0.3, -5], [20, 0.3, 5], [20, 0.3, 15], [20, 0.3, 25], [20, 0.3, 35]]
  ]

  const busPaths = [
    [[-35, 0.4, 0], [-15, 0.4, 0], [0, 0.4, 0], [15, 0.4, 0], [35, 0.4, 0]],
    [[0, 0.4, -35], [0, 0.4, -15], [0, 0.4, 0], [0, 0.4, 15], [0, 0.4, 35]],
    [[-30, 0.4, 25], [-15, 0.4, 25], [0, 0.4, 25], [15, 0.4, 25], [30, 0.4, 25]]
  ]

  const carColors = ["#ff4444", "#44ff44", "#4444ff", "#ffff44", "#ff44ff", "#44ffff"]
  const carCount = trafficDensity === 'low' ? 8 : trafficDensity === 'medium' ? 15 : 25
  const busCount = trafficDensity === 'low' ? 1 : trafficDensity === 'medium' ? 2 : 4

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

/* ----- Enhanced Ground with Roads ----- */
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

/* ----- Solar Panel Component ----- */
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

/* ----- Energy Efficient House with Accessibility Features ----- */
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
                <meshStandardMaterial color="#87CEEB" transparent opacity={0.8} />
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

/* ----- Energy Efficient Society ----- */
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

/* ----- Smart Buildings with Solar and Turbines ----- */
function SmartBuilding({ 
  position = [0, 0, 0], 
  height = 8, 
  color = "#a67c52", 
  name = "Building",
  hasTurbine = false,
  hasSolar = true
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
      <mesh castShadow receiveShadow onClick={handleClick}>
        <boxGeometry args={[3, height, 3]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
      </mesh>
      
      <group>
        {Array.from({ length: Math.floor(height / 2) }).map((_, floor) =>
          [-1, 1].map((side, i) => (
            <group key={`${floor}-${side}`}>
              <mesh
                position={[1.51, (floor * 2) - height/2 + 2, side * 0.8]}
                castShadow
              >
                <boxGeometry args={[0.02, 1.2, 0.8]} />
                <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
              </mesh>
              <mesh position={[1.5, (floor * 2) - height/2 + 2, side * 0.8]} castShadow>
                <boxGeometry args={[0.04, 1.3, 0.85]} />
                <meshStandardMaterial color="#8b4513" />
              </mesh>
            </group>
          ))
        )}
      </group>
      
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

/* ----- Waste Bin Component ----- */
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

/* ----- Enhanced Waste Collection Truck with Animation ----- */
function WasteTruck({ position = [0, 0, 0], targetBin = null, onCollectionComplete }) {
  const truckRef = useRef()
  const [currentPosition, setCurrentPosition] = useState(position)
  const [isCollecting, setIsCollecting] = useState(false)
  const [collectionProgress, setCollectionProgress] = useState(0)
  const [binLifted, setBinLifted] = useState(false)

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
        <meshStandardMaterial color="#27ae60" />
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

/* ----- Enhanced Waste Management System with 3R Bins and Pipes ----- */
function WasteManagementSystem({ position = [15, 0, 15] }) {
  const [isTruckActive, setIsTruckActive] = useState(false)
  const [currentBinTarget, setCurrentBinTarget] = useState(null)
  const [collectedWaste, setCollectedWaste] = useState(0)
  const alertWasteManagement = useStore((s) => s.alertWasteManagement)
  const wasteBins = useStore((s) => s.wasteBins)
  const wasteProcessing = useStore((s) => s.wasteProcessing)
  const setWasteProcessing = useStore((s) => s.setWasteProcessing)
  const setEmergencyAlarm = useStore((s) => s.setEmergencyAlarm)
  const setAlertWasteManagement = useStore((s) => s.setAlertWasteManagement)
  
  const binPositions = [
    [-10, 0, 8], [12, 0, -5], [-5, 0, -12], 
    [18, 0, 10], [-15, 0, -18], [5, 0, 20]
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

/* ----- City Layout ----- */
function CityLayout() {
  const buildings = [
    { position: [-25, 0, 15], height: 6, color: "#a67c52", name: "Residence A", hasTurbine: true },
    { position: [-20, 0, 18], height: 8, color: "#b5651d", name: "Residence B", hasTurbine: false },
    { position: [-30, 0, 20], height: 7, color: "#c19a6b", name: "Residence C", hasTurbine: true },
    
    { position: [20, 0, -15], height: 12, color: "#8b4513", name: "Office A", hasTurbine: true },
    { position: [25, 0, -18], height: 10, color: "#a0522d", name: "Office B", hasTurbine: false },
    { position: [15, 0, -20], height: 14, color: "#cd853f", name: "Office C", hasTurbine: true }
  ]

  return (
    <group>
      {/* Enhanced Cultural Center */}
      <CulturalCenter position={[0, 0, 25]} />
      
      {/* Bus Station near Cultural Center */}
      <BusStation position={[15, 0, 25]} />
      
      {/* Modern Tech Hub */}
      <DataCenter position={[45, 0, -25]} />
      
      {/* Energy Efficient Society */}
      <EnergyEfficientSociety position={[0, 0, -40]} />
      
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
      
      {/* GREEN waste bins around town */}
      <WasteBin position={[-10, 0, 8]} id="bin1" />
      <WasteBin position={[12, 0, -5]} id="bin2" />
      <WasteBin position={[-5, 0, -12]} id="bin3" />
      <WasteBin position={[18, 0, 10]} id="bin4" />
      <WasteBin position={[-15, 0, -18]} id="bin5" />
      <WasteBin position={[5, 0, 20]} id="bin6" />
      
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
    </group>
  )
}

/* ----- Enhanced HUD ----- */
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
    '🚏 Bus Station': { x: 15, y: 10, z: 25, lookAt: { x: 15, y: 0, z: 25 } },
    '🗑️ Waste Management': { x: 15, y: 10, z: 15, lookAt: { x: 15, y: 0, z: 15 } },
    '🤖 Cloud Data Center': { x: 45, y: 10, z: -25, lookAt: { x: 45, y: 0, z: -25 } },
    '🏠 Energy Society': { x: 0, y: 15, z: -40, lookAt: { x: 0, y: 0, z: -40 } },
    '🔵 Accessible Home': { x: 0, y: 8, z: -40, lookAt: { x: 0, y: 0, z: -40 } },
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

/* ----- Main App Component ----- */
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
          🌟 Features: Cultural Center • Tech Hub • Energy Society • Accessible Homes
        </div>
        <div style={{ fontSize: 11, color: '#3498db', marginTop: 2 }}>
          🤖 Tech Hub: AI Processing • Robotics • Drones • Data Analytics
        </div>
        <div style={{ fontSize: 11, color: '#27ae60', marginTop: 2 }}>
          ⚙️ Click settings icon (top-right) for city controls
        </div>
        <div style={{ fontSize: 11, color: '#e74c3c', marginTop: 2, fontWeight: 'bold' }}>
          🗑️ NEW: Auto waste collection! Click bins to fill them, truck collects automatically!
        </div>
        <div style={{ fontSize: 11, color: '#d4af37', marginTop: 2, fontWeight: 'bold' }}>
          🎪 ENHANCED: Cultural Center with Sindhi, Punjabi, Pashto & Balochi cultures!
        </div>
      </div>
    </div>
  )
}
