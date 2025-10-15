import React, { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, useGLTF, ContactShadows, Sky, Text, Sparkles, Float, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { create } from 'zustand'

const useStore = create((set) => ({
  focus: null,
  setFocus: (f) => set({ focus: f }),
  timeOfDay: 'day',
  setTimeOfDay: (t) => set({ timeOfDay: t }),
  showCityControl: false,
  setShowCityControl: (show) => set({ showCityControl: show }),
}))

/* ----- MODERN SCHOOL BUILDING ----- */
function ModernSchool({ position = [0, 0, 0] }) {
  const setFocus = useStore((s) => s.setFocus)
  
  return (
    <group position={position}>
      {/* Main School Building - Modern Design */}
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
        <boxGeometry args={[40, 25, 30]} />
        <meshStandardMaterial 
          color="#e3f2fd" 
          transparent 
          opacity={0.2}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Building Frame - Blue Theme */}
      <mesh castShadow>
        <boxGeometry args={[40.2, 25.2, 30.2]} />
        <meshStandardMaterial color="#1565c0" />
      </mesh>

      {/* Vertical Gardens */}
      <VerticalGarden position={[0, 0, 15.1]} width={40} height={25} />
      <VerticalGarden position={[0, 0, -15.1]} width={40} height={25} rotation={[0, Math.PI, 0]} />

      {/* Floor Levels with Windows */}
      {[0, 1, 2, 3].map(floor => (
        <group key={floor} position={[0, -9 + floor * 6, 0]}>
          {/* Windows Row */}
          {Array.from({ length: 10 }).map((_, i) => (
            <mesh key={i} position={[-17.5 + i * 3.5, 2, 15.2]} castShadow>
              <boxGeometry args={[2.5, 3, 0.1]} />
              <meshStandardMaterial color="#bbdefb" transparent opacity={0.8} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Grand Entrance */}
      <mesh position={[0, 5, 15.2]} castShadow>
        <boxGeometry args={[8, 10, 0.2]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>

      {/* Entrance Canopy */}
      <mesh position={[0, 10, 12]} castShadow>
        <boxGeometry args={[10, 1, 3]} />
        <meshStandardMaterial color="#1976d2" />
      </mesh>

      {/* School Name - Big and Clear */}
      <Text
        position={[0, 15, 15.3]}
        fontSize={1}
        color="#1565c0"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        🏫 GREEN VALLEY SCHOOL
      </Text>

      {/* School Flag */}
      <mesh position={[15, 20, 15.2]} castShadow>
        <boxGeometry args={[0.1, 8, 4]} />
        <meshStandardMaterial color="#d32f2f" />
      </mesh>

      {/* Playground Area */}
      <mesh position={[25, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[12, 32]} />
        <meshStandardMaterial color="#4caf50" />
      </mesh>

      {/* Basketball Court */}
      <mesh position={[-25, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 15]} />
        <meshStandardMaterial color="#795548" />
      </mesh>

      {/* School Information Display */}
      <Html position={[0, 30, 0]} transform>
        <div style={{
          background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
          padding: '25px',
          borderRadius: '20px',
          boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
          minWidth: '350px',
          textAlign: 'center',
          border: '4px solid #1565c0'
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0', 
            color: '#1565c0', 
            fontSize: '22px',
            fontWeight: 'bold'
          }}>
            🏫 GREEN VALLEY SCHOOL
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{ textAlign: 'left', fontSize: '14px' }}>
              <div>📚 32 Classrooms</div>
              <div>👨‍🏫 68 Teachers</div>
              <div>👥 1200 Students</div>
              <div>🏢 4 Floors</div>
            </div>
            
            <div style={{ textAlign: 'left', fontSize: '14px' }}>
              <div>🌿 Vertical Gardens</div>
              <div>🏀 Sports Facilities</div>
              <div>🎓 Est. 1985</div>
              <div>⭐ Grade A+</div>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(21, 101, 192, 0.1)', 
            padding: '15px', 
            borderRadius: '10px',
            fontSize: '13px',
            border: '2px solid #1565c0'
          }}>
            <div>✅ Science & Computer Labs</div>
            <div>✅ Library & Auditorium</div>
            <div>✅ Sports Ground</div>
            <div>✅ Cafeteria</div>
          </div>
        </div>
      </Html>

      {/* School Parking */}
      <SchoolParking position={[0, 0, -35]} />
    </group>
  )
}

/* ----- VERTICAL GARDEN COMPONENT ----- */
function VerticalGarden({ position = [0, 0, 0], width = 10, height = 8, rotation = [0, 0, 0] }) {
  const plantsPerRow = Math.floor(width / 1.5)
  const rows = Math.floor(height / 1.2)

  return (
    <group position={position} rotation={rotation}>
      {/* Green Wall Background */}
      <mesh receiveShadow>
        <boxGeometry args={[width, height, 0.3]} />
        <meshStandardMaterial color="#2e7d32" />
      </mesh>

      {/* Plants Grid */}
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: plantsPerRow }).map((_, col) => {
          const x = -width/2 + (col + 0.5) * (width / plantsPerRow)
          const y = -height/2 + (row + 0.5) * (height / rows)
          const plantSize = 0.3 + Math.random() * 0.2
          const plantHeight = 0.5 + Math.random() * 0.3
          
          return (
            <group key={`${row}-${col}`} position={[x, y, 0.2]}>
              {/* Plant Stem */}
              <mesh castShadow position={[0, -0.2, 0]}>
                <cylinderGeometry args={[0.05, 0.08, plantHeight, 8]} />
                <meshStandardMaterial color="#388e3c" />
              </mesh>
              {/* Plant Leaves */}
              <mesh castShadow position={[0, plantHeight/2, 0]}>
                <sphereGeometry args={[plantSize, 8, 8]} />
                <meshStandardMaterial color="#4caf50" />
              </mesh>
            </group>
          )
        })
      )}
    </group>
  )
}

/* ----- SCHOOL PARKING ----- */
function SchoolParking({ position = [0, 0, 0] }) {
  const [parkedCars, setParkedCars] = useState(15)
  const totalSpots = 40

  useFrame(() => {
    if (Math.random() < 0.01) {
      setParkedCars(prev => {
        const change = Math.random() < 0.5 ? 1 : -1
        return Math.max(8, Math.min(totalSpots, prev + change))
      })
    }
  })

  return (
    <group position={position}>
      {/* Parking Lot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 30]} />
        <meshStandardMaterial color="#455a64" />
      </mesh>

      {/* Parking Grid Lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[48, 28]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.2} />
      </mesh>

      {/* Parking Spots */}
      {Array.from({ length: totalSpots }).map((_, i) => {
        const row = Math.floor(i / 8)
        const col = i % 8
        const occupied = i < parkedCars
        const x = -21 + col * 6
        const z = -10 + row * 6

        return (
          <group key={i} position={[x, 0.1, z]}>
            {/* Parking Spot */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[5, 4} />
              <meshStandardMaterial 
                color={occupied ? "#e57373" : "#81c784"} 
                transparent 
                opacity={0.7} 
              />
            </mesh>

            {/* Parked Car */}
            {occupied && (
              <ModernCar 
                position={[0, 0.5, 0]} 
                color={getRandomCarColor()}
              />
            )}

            {/* Spot Number */}
            <Text
              position={[0, 0.2, 1.8]}
              fontSize={0.25}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              {i + 1}
            </Text>
          </group>
        )
      })}

      {/* Parking Sign */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.6}
        color="#1565c0"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        🅿️ SCHOOL PARKING
      </Text>

      {/* Parking Info */}
      <Html position={[0, 6, 0]} transform>
        <div style={{
          background: 'rgba(21, 101, 192, 0.9)',
          color: 'white',
          padding: '12px',
          borderRadius: '10px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
          textAlign: 'center',
          minWidth: '200px'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>🅿️ School Parking</h4>
          <div style={{ fontSize: '12px' }}>
            <div>🚗 Available: {totalSpots - parkedCars}</div>
            <div>🚙 Occupied: {parkedCars}</div>
            <div>📊 {Math.round((parkedCars / totalSpots) * 100)}% Full</div>
          </div>
        </div>
      </Html>
    </group>
  )
}

/* ----- MODERN CAR DESIGN ----- */
function ModernCar({ position = [0, 0, 0], color = "#ff4444" }) {
  return (
    <group position={position}>
      {/* Car Body */}
      <mesh castShadow>
        <boxGeometry args={[2, 0.6, 1]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Car Roof */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.8, 0.4, 0.9]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Windows */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[1.7, 0.2, 0.8]} />
        <meshStandardMaterial color="#2c3e50" transparent opacity={0.7} />
      </mesh>
      
      {/* Headlights */}
      <mesh position={[0, 0.3, 0.51]} castShadow>
        <boxGeometry args={[0.8, 0.15, 0.1]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffff99" />
      </mesh>
      
      {/* Wheels */}
      {[-0.6, 0.6].map((x, i) => (
        <group key={i}>
          <mesh position={[x, -0.2, 0.3]} castShadow rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.25, 0.25, 0.15, 12]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
          <mesh position={[x, -0.2, -0.3]} castShadow rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.25, 0.25, 0.15, 12]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
        </group>
      ))}

      {/* Spoiler */}
      <mesh position={[0, 0.5, -0.51]} castShadow>
        <boxGeometry args={[1.5, 0.08, 0.1]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
    </group>
  )
}

/* ----- GROUND COMPONENT ----- */
function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#27ae60" roughness={0.8} metalness={0.1} />
      </mesh>
      <gridHelper args={[200, 200, '#8b7355', '#8b7355']} position={[0, 0.01, 0]} />
    </>
  )
}

/* ----- CONTROL PANEL ----- */
function ControlPanel() {
  const setFocus = useStore((s) => s.setFocus)
  const showCityControl = useStore((s) => s.showCityControl)
  const setShowCityControl = useStore((s) => s.setShowCityControl)

  const locations = {
    '🏫 School': { x: 0, y: 25, z: 0, lookAt: { x: 0, y: 0, z: 0 } },
    '🅿️ School Parking': { x: 0, y: 10, z: -35, lookAt: { x: 0, y: 0, z: -35 } },
    '🛣️ Main Road': { x: 0, y: 20, z: 50, lookAt: { x: 0, y: 0, z: 0 } },
  }

  if (!showCityControl) return null

  return (
    <div style={{ 
      position: 'absolute', 
      right: 20, 
      top: 20, 
      zIndex: 50, 
      background: 'rgba(255,255,255,0.95)', 
      padding: 15, 
      borderRadius: 10, 
      boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
      minWidth: '200px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, color: '#1565c0', fontSize: '16px' }}>📍 Navigation</h3>
        <button 
          onClick={() => setShowCityControl(false)}
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '18px', 
            cursor: 'pointer',
            color: '#1565c0'
          }}
        >
          ✕
        </button>
      </div>
      
      {Object.entries(locations).map(([name, pos]) => (
        <button 
          key={name}
          onClick={() => setFocus(pos)}
          style={{ 
            width: '100%', 
            background: '#1565c0', 
            color: 'white', 
            border: 'none', 
            padding: '10px', 
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '8px',
            fontSize: '12px'
          }}
        >
          {name}
        </button>
      ))}
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
      }}
      onClick={() => setShowCityControl(!showCityControl)}
    >
      ⚙️
    </div>
  )
}

/* ----- CAMERA CONTROLLER ----- */
function CameraController() {
  const { camera } = useThree()
  const focus = useStore((s) => s.focus)
  
  useFrame(() => {
    if (!focus) return
    
    camera.position.lerp(new THREE.Vector3(focus.x, focus.y, focus.z), 0.05)
    camera.lookAt(focus.lookAt.x, focus.lookAt.y, focus.lookAt.z)
  })
  
  return null
}

/* ----- ORBIT CONTROLS ----- */
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
      minDistance={10}
      maxDistance={100}
    />
  )
}

/* ----- HELPER FUNCTIONS ----- */
function getRandomCarColor() {
  const colors = ["#ff4444", "#44ff44", "#4444ff", "#ffff44", "#ff44ff", "#44ffff", "#ff8844"]
  return colors[Math.floor(Math.random() * colors.length)]
}

/* ----- MAIN APP COMPONENT ----- */
export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #87CEEB, #98FB98)' }}>
      <SettingsIcon />
      <ControlPanel />
      
      <Canvas shadows camera={{ position: [0, 30, 50], fov: 50 }}>
        <color attach="background" args={['#87CEEB']} />
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[10, 20, 10]} 
          intensity={1.0}
          castShadow
        />
        
        <Suspense fallback={
          <Html center>
            <div style={{ color: 'white', fontSize: '18px', background: 'rgba(21, 101, 192, 0.8)', padding: '20px', borderRadius: '10px' }}>
              Loading Modern School...
            </div>
          </Html>
        }>
          <Sky sunPosition={[100, 20, 100]} />
          <Ground />
          <ModernSchool position={[0, 0, 0]} />
          <ContactShadows position={[0, -0.1, 0]} opacity={0.3} />
        </Suspense>
        
        <CustomOrbitControls />
        <CameraController />
      </Canvas>

      <div style={{ 
        position: 'absolute', 
        left: 20, 
        bottom: 20, 
        zIndex: 50, 
        background: 'rgba(255,255,255,0.95)', 
        padding: '15px', 
        borderRadius: '10px', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        border: '2px solid #1565c0'
      }}>
        <div style={{ fontSize: 16, fontWeight: 'bold', color: '#1565c0', marginBottom: '8px' }}>
          🏫 MODERN SCHOOL DEMO
        </div>
        <div style={{ fontSize: 12, color: '#666' }}>
          🖱️ Drag to rotate • 🔍 Scroll to zoom
        </div>
        <div style={{ fontSize: 12, color: '#1565c0', marginTop: '5px', fontWeight: 'bold' }}>
          ⚙️ Click top-right icon for navigation
        </div>
      </div>
    </div>
  )
}
