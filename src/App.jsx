// src/App.jsx
import React, { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, useGLTF, ContactShadows, Sky, Text, Sparkles, Float, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import create from 'zustand'

/* ----- Store for state management ----- */
const useStore = create((set) => ({
  focus: null,
  setFocus: (f) => set({ focus: f }),
  timeOfDay: 'day',
  setTimeOfDay: (t) => set({ timeOfDay: t }),
  selectedHouse: 'energyEfficient',
  setSelectedHouse: (h) => set({ selectedHouse: h })
}))

/* ----- Camera Controller ----- */
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

/* ----- Wheelchair User ----- */
function WheelchairUser({ position = [0, 0, 0], color = "#2c3e50", speed = 1, path = [] }) {
  const chairRef = useRef()
  const [t, setT] = useState(Math.random() * 10)

  useFrame((_, dt) => {
    setT(prev => prev + dt * speed)
    
    if (chairRef.current && path.length > 0) {
      const tt = t % path.length
      const i = Math.floor(tt) % path.length
      const a = new THREE.Vector3(...path[i])
      const b = new THREE.Vector3(...path[(i + 1) % path.length])
      const f = tt % 1
      const pos = a.clone().lerp(b, f)
      
      chairRef.current.position.lerp(pos, 0.1)
      if (b) chairRef.current.lookAt(b)
    }
  })

  return (
    <group ref={chairRef} position={position}>
      {/* Wheelchair base */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.6, 0.1, 0.8]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      
      {/* Seat */}
      <mesh position={[0, 0.6, -0.1]} castShadow>
        <boxGeometry args={[0.5, 0.4, 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Backrest */}
      <mesh position={[0, 0.9, -0.3]} castShadow>
        <boxGeometry args={[0.5, 0.6, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Large wheels */}
      <mesh position={[-0.25, 0.3, 0.2]} rotation={[0, 0, Math.PI/2]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.05, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0.25, 0.3, 0.2]} rotation={[0, 0, Math.PI/2]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.05, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Small front wheels */}
      <mesh position={[-0.2, 0.15, -0.3]} rotation={[0, 0, Math.PI/2]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.05, 12]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0.2, 0.15, -0.3]} rotation={[0, 0, Math.PI/2]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.05, 12]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Person in wheelchair */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
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

/* ----- Wind Turbine Component ----- */
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
        
        {/* Blades */}
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

/* ----- Energy Efficient House with Accessibility ----- */
function EnergyEfficientHouse({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)
  const [showInterior, setShowInterior] = useState(false)

  const handleClick = () => {
    setFocus({
      x: position[0],
      y: 8,
      z: position[2],
      lookAt: { x: position[0], y: 0, z: position[2] }
    })
    setShowInterior(true)
    setTimeout(() => setShowInterior(false), 8000)
  }

  return (
    <group position={position}>
      {/* Main house structure */}
      <mesh castShadow receiveShadow onClick={handleClick}>
        <boxGeometry args={[6, 5, 8]} />
        <meshStandardMaterial color="#4a90e2" roughness={0.7} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 3.5, 0]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[4, 3, 4]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* Front wall with large windows for better insulation visualization */}
      <mesh position={[0, 1.5, 4.1]} castShadow>
        <boxGeometry args={[5, 3, 0.1]} />
        <meshStandardMaterial color="#a67c52" />
      </mesh>

      {/* Windows with improved insulation visualization */}
      <group>
        <mesh position={[-1.5, 2, 4.11]} castShadow>
          <boxGeometry args={[1, 1.5, 0.02]} />
          <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
        </mesh>
        <mesh position={[1.5, 2, 4.11]} castShadow>
          <boxGeometry args={[1, 1.5, 0.02]} />
          <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Door with wheelchair accessibility */}
      <mesh position={[0, 1, 4.11]} castShadow>
        <boxGeometry args={[1.2, 2, 0.02]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* Wheelchair ramp */}
      <mesh position={[0, -0.2, 5.5]} rotation={[0, 0, -Math.PI/8]} castShadow>
        <boxGeometry args={[2, 0.1, 2]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>

      {/* Solar panels on roof */}
      <group position={[0, 4, 0]}>
        <SolarPanel position={[-1.5, 0.5, 0]} rotation={[Math.PI/6, 0, 0]} />
        <SolarPanel position={[1.5, 0.5, 0]} rotation={[Math.PI/6, 0, 0]} />
        <SolarPanel position={[0, 0.5, -1]} rotation={[Math.PI/6, Math.PI/2, 0]} />
      </group>

      {/* Small wind turbine */}
      <WindTurbine position={[3, 0, 3]} />

      {/* Ventilation system visualization */}
      <mesh position={[0, 4, -3.5]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.5, 8]} />
        <meshStandardMaterial color="#95a5a6" />
      </mesh>

      {/* House label with energy features */}
      <Text
        position={[0, 6, 0]}
        fontSize={0.4}
        color="#27ae60"
        anchorX="center"
        anchorY="middle"
      >
        🏠 Energy Efficient Home
      </Text>

      {/* Features list */}
      <Html position={[0, 4, 0]} transform>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          minWidth: '250px',
          textAlign: 'center'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#27ae60' }}>Energy Features</h4>
          <div>✅ Improved Insulation</div>
          <div>✅ Pressure Balanced Ventilation</div>
          <div>✅ Sealed Ducts</div>
          <div>✅ Tight Construction</div>
          <div>✅ Fresh Air Ventilation</div>
          <div>✅ Efficient Windows</div>
          <div>✅ Proper HVAC System</div>
          <div>♿ Wheelchair Accessible</div>
        </div>
      </Html>

      {/* INTERIOR VIEW - Only shown when clicked */}
      {showInterior && (
        <group>
          {/* Transparent exterior to see inside */}
          <mesh position={[0, 2.5, 0]}>
            <boxGeometry args={[5.9, 4.9, 7.9]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.1} />
          </mesh>

          {/* Ground floor interior */}
          <mesh position={[0, 0, 0]} receiveShadow>
            <boxGeometry args={[5.8, 0.1, 7.8]} />
            <meshStandardMaterial color="#d2b48c" />
          </mesh>

          {/* First floor */}
          <mesh position={[0, 3, -2]} receiveShadow>
            <boxGeometry args={[5.8, 0.1, 3.8]} />
            <meshStandardMaterial color="#d2b48c" />
          </mesh>

          {/* Interior walls */}
          <mesh position={[2, 1.5, -1]} receiveShadow>
            <boxGeometry args={[0.1, 3, 5]} />
            <meshStandardMaterial color="#a67c52" />
          </mesh>

          {/* Wheelchair user on ground floor */}
          <WheelchairUser position={[-1, 0.5, 1]} color="#3498db" speed={0} />

          {/* Second wheelchair user coming down ramp from first floor */}
          <WheelchairUser 
            position={[0, 3.2, -3.5]} 
            color="#e74c3c" 
            speed={0.3}
            path={[
              [0, 3.2, -3.5],
              [0, 2.8, -2],
              [0, 2.4, -0.5],
              [0, 2, 1],
              [0, 1.5, 2.5],
              [0, 1, 3.5],
              [-1, 0.5, 2]
            ]}
          />

          {/* Person working in another room */}
          <WheelchairUser position={[3, 0.5, -1]} color="#2ecc71" speed={0} />

          {/* Stairs with ramp beside them */}
          <group position={[0, 1.5, -3]}>
            {/* Stairs */}
            {Array.from({ length: 6 }).map((_, i) => (
              <mesh key={i} position={[-1, i * 0.3, 0]} castShadow>
                <boxGeometry args={[0.8, 0.3, 1.5]} />
                <meshStandardMaterial color="#8b4513" />
              </mesh>
            ))}
            
            {/* Ramp beside stairs */}
            <mesh position={[1, 0.9, 0]} rotation={[0, 0, -Math.PI/4]} castShadow>
              <boxGeometry args={[0.8, 0.1, 3]} />
              <meshStandardMaterial color="#7f8c8d" />
            </mesh>
          </group>

          {/* Interior label */}
          <Html position={[0, 5, 0]}>
            <div style={{
              background: 'rgba(39, 174, 96, 0.9)',
              color: 'white',
              padding: '10px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              🏠 Interior View - Wheelchair Accessible Design
            </div>
          </Html>
        </group>
      )}
    </group>
  )
}

/* ----- Regular House ----- */
function RegularHouse({ position = [0, 0, 0], color = "#a67c52", name = "House" }) {
  const setFocus = useStore((s) => s.setFocus)

  const handleClick = () => {
    setFocus({
      x: position[0],
      y: 6,
      z: position[2],
      lookAt: { x: position[0], y: 0, z: position[2] }
    })
  }

  return (
    <group position={position}>
      {/* Main structure */}
      <mesh castShadow receiveShadow onClick={handleClick}>
        <boxGeometry args={[4, 4, 5]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 3, 0]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[3, 2, 4]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* Door */}
      <mesh position={[0, 1, 2.51]} castShadow>
        <boxGeometry args={[0.8, 1.5, 0.1]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>

      {/* Windows */}
      <mesh position={[-1.2, 2, 2.51]} castShadow>
        <boxGeometry args={[0.6, 0.8, 0.1]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
      </mesh>
      <mesh position={[1.2, 2, 2.51]} castShadow>
        <boxGeometry args={[0.6, 0.8, 0.1]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
      </mesh>

      <Text
        position={[0, 5, 0]}
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

/* ----- Park Area ----- */
function Park({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Grass area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[8, 32]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>

      {/* Trees */}
      {[
        [-3, 0, -3], [3, 0, -3], [-4, 0, 2], [4, 0, 2], [0, 0, 4]
      ].map((pos, i) => (
        <group key={i} position={pos}>
          {/* Tree trunk */}
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.3, 3, 8]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
          {/* Tree top */}
          <mesh position={[0, 3, 0]} castShadow>
            <sphereGeometry args={[1.2, 8, 8]} />
            <meshStandardMaterial color="#2ecc71" />
          </mesh>
        </group>
      ))}

      {/* Bench */}
      <group position={[0, 0.5, -2]}>
        <mesh castShadow>
          <boxGeometry args={[2, 0.1, 0.8]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        <mesh position={[0.9, -0.3, 0]} castShadow>
          <boxGeometry args={[0.1, 0.6, 0.8]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        <mesh position={[-0.9, -0.3, 0]} castShadow>
          <boxGeometry args={[0.1, 0.6, 0.8]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
      </group>

      <Text
        position={[0, 4, 0]}
        fontSize={0.4}
        color="#27ae60"
        anchorX="center"
        anchorY="middle"
      >
        Community Park
      </Text>
    </group>
  )
}

/* ----- Roads ----- */
function RoadSystem() {
  return (
    <group>
      {/* Main road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[50, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Side roads */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-15, 0.01, 10]} receiveShadow>
        <planeGeometry args={[8, 30]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[15, 0.01, 10]} receiveShadow>
        <planeGeometry args={[8, 30]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Road markings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[50, 0.3]} />
        <meshStandardMaterial color="#ffff00" />
      </mesh>
    </group>
  )
}

/* ----- Ground ----- */
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

/* ----- Housing Society Layout ----- */
function HousingSociety() {
  const regularHouses = [
    { position: [-20, 0, 15], color: "#a67c52", name: "House 1" },
    { position: [-20, 0, 5], color: "#b5651d", name: "House 2" },
    { position: [-20, 0, -5], color: "#c19a6b", name: "House 3" },
    { position: [-10, 0, 15], color: "#deb887", name: "House 4" },
    { position: [-10, 0, 5], color: "#d2b48c", name: "House 5" },
    { position: [-10, 0, -5], color: "#f4a460", name: "House 6" },
    { position: [10, 0, 15], color: "#8b4513", name: "House 7" },
    { position: [10, 0, 5], color: "#a0522d", name: "House 8" },
    { position: [10, 0, -5], color: "#cd853f", name: "House 9" },
    { position: [20, 0, 15], color: "#a67c52", name: "House 10" },
    { position: [20, 0, 5], color: "#b5651d", name: "House 11" },
    { position: [20, 0, -5], color: "#c19a6b", name: "House 12" }
  ]

  return (
    <group>
      {/* Energy Efficient House - CENTER AND SPECIAL */}
      <EnergyEfficientHouse position={[0, 0, 10]} />
      
      {/* Regular houses */}
      {regularHouses.map((house, index) => (
        <RegularHouse
          key={index}
          position={house.position}
          color={house.color}
          name={house.name}
        />
      ))}
      
      {/* Park */}
      <Park position={[0, 0, -15]} />
      
      {/* Roads */}
      <RoadSystem />
      
      {/* Walking wheelchair users in society */}
      <WheelchairUser 
        position={[-15, 0.5, 12]} 
        color="#3498db" 
        speed={0.2}
        path={[
          [-15, 0.5, 12],
          [-12, 0.5, 12],
          [-12, 0.5, 8],
          [-15, 0.5, 8],
          [-15, 0.5, 12]
        ]}
      />
      
      <WheelchairUser 
        position={[15, 0.5, 8]} 
        color="#e74c3c" 
        speed={0.15}
        path={[
          [15, 0.5, 8],
          [12, 0.5, 8],
          [12, 0.5, 12],
          [15, 0.5, 12],
          [15, 0.5, 8]
        ]}
      />

      {/* People walking in park */}
      <WheelchairUser 
        position={[-3, 0.5, -15]} 
        color="#2ecc71" 
        speed={0.1}
        path={[
          [-3, 0.5, -15],
          [0, 0.5, -18],
          [3, 0.5, -15],
          [0, 0.5, -12],
          [-3, 0.5, -15]
        ]}
      />
    </group>
  )
}

/* ----- HUD ----- */
function HUD() {
  const timeOfDay = useStore((s) => s.timeOfDay)
  
  return (
    <div style={{ position: 'absolute', left: 12, top: 12, zIndex: 50 }}>
      <div style={{ 
        background: 'rgba(255,255,255,0.95)', 
        padding: '10px 16px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#8b4513'
      }}>
        🏡 Energy Efficient Housing Society
        <div style={{ fontSize: '11px', color: '#27ae60', marginTop: '4px' }}>
          ♿ Wheelchair Accessible • 🌞 Solar Powered • 💨 Efficient Ventilation
        </div>
        <div style={{ fontSize: '11px', color: '#3498db', marginTop: '2px' }}>
          Click the blue house to see interior with wheelchair access!
        </div>
      </div>
    </div>
  )
}

/* ----- Control Panel ----- */
function ControlPanel() {
  const setTimeOfDay = useStore((s) => s.setTimeOfDay)
  const setFocus = useStore((s) => s.setFocus)
  const timeOfDay = useStore((s) => s.timeOfDay)

  const locations = {
    '🏠 Energy Efficient House': { x: 0, y: 10, z: 10, lookAt: { x: 0, y: 0, z: 10 } },
    '🌳 Community Park': { x: 0, y: 8, z: -15, lookAt: { x: 0, y: 0, z: -15 } },
    '🛣️ Main Road': { x: 0, y: 6, z: 0, lookAt: { x: 0, y: 0, z: 0 } }
  }

  return (
    <div style={{ 
      position: 'absolute', 
      right: 12, 
      top: 12, 
      zIndex: 50, 
      background: 'rgba(255,255,255,0.95)', 
      padding: 16, 
      borderRadius: 12, 
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      minWidth: '200px'
    }}>
      <h3 style={{ margin: '0 0 12px 0', color: '#8b4513' }}>Society Controls</h3>
      
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4, fontSize: '12px', fontWeight: 'bold' }}>
          Time of Day:
        </label>
        <select 
          value={timeOfDay}
          onChange={(e) => setTimeOfDay(e.target.value)}
          style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #d2b48c' }}
        >
          <option value="day">☀️ Day</option>
          <option value="evening">🌆 Evening</option>
          <option value="night">🌙 Night</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: '12px', fontWeight: 'bold' }}>
          Quick Navigation:
        </label>
        {Object.entries(locations).map(([name, pos]) => (
          <button 
            key={name}
            onClick={() => setFocus(pos)}
            style={{ 
              width: '100%', 
              background: '#3498db', 
              color: 'white', 
              border: 'none', 
              padding: '6px 8px', 
              borderRadius: '6px',
              cursor: 'pointer',
              marginBottom: '4px',
              fontSize: '11px'
            }}
          >
            {name}
          </button>
        ))}
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
      <HUD />
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
              Loading Housing Society...
            </div>
          </Html>
        }>
          <Sky {...skyConfig[timeOfDay]} />
          
          <Ground />
          
          {/* Housing Society Layout */}
          <HousingSociety />
          
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
          🎮 Controls: Drag to rotate • Scroll to zoom • Click houses to focus
        </div>
        <div style={{ fontSize: 11, color: '#3498db', marginTop: 4 }}>
          🌟 Special Feature: Click the blue Energy Efficient House to see interior with wheelchair access!
        </div>
        <div style={{ fontSize: 11, color: '#27ae60', marginTop: 2 }}>
          ✅ Features: Improved Insulation • Pressure Balance • Sealed Ducts • Tight Construction
        </div>
        <div style={{ fontSize: 11, color: '#e74c3c', marginTop: 2 }}>
          ♿ Wheelchair ramp and interior accessibility features included!
        </div>
      </div>
    </div>
  )
}
