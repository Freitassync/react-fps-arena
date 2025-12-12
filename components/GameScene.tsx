import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Stars, ContactShadows } from '@react-three/drei';
import { PlayerController } from './PlayerController';
import { RemotePlayer } from './RemotePlayer';
import { useGameStore } from '../store';

export const GameScene: React.FC = () => {
  const remotePlayers = useGameStore((state) => state.remotePlayers);

  return (
    <div className="w-full h-full absolute inset-0 bg-neutral-900">
      <Canvas
        shadows
        camera={{ fov: 80, position: [0, 2, 5] }}
        style={{ background: '#050505' }}
      >
        <fog attach="fog" args={['#050505', 10, 50]} />
        <Sky sunPosition={[100, 10, 100]} turbidity={10} rayleigh={0.5} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.4} />
        <hemisphereLight intensity={0.5} color="#444" groundColor="#000" />
        <directionalLight 
            position={[50, 50, 25]} 
            intensity={1.5} 
            castShadow 
            shadow-mapSize={[1024, 1024]} 
        />
        
        {/* Environment Group */}
        <group>
          {/* Floor Grid */}
          <mesh 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, 0, 0]} 
            receiveShadow
            userData={{ type: 'environment' }}
          >
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.2} />
          </mesh>
          <gridHelper args={[200, 50, 0x00ff00, 0x222222]} position={[0, 0.01, 0]} />
          
          {/* Obstacles / Cover */}
          <mesh position={[5, 1.5, 5]} castShadow receiveShadow userData={{ type: 'environment' }}>
            <boxGeometry args={[3, 3, 3]} />
            <meshStandardMaterial color="#444" roughness={0.2} metalness={0.8} />
          </mesh>

          <mesh position={[-10, 2, -10]} castShadow receiveShadow userData={{ type: 'environment' }}>
             <boxGeometry args={[4, 4, 4]} />
             <meshStandardMaterial color="#553333" roughness={0.5} />
          </mesh>

          <mesh position={[15, 1, -5]} castShadow receiveShadow userData={{ type: 'environment' }}>
             <boxGeometry args={[2, 2, 8]} />
             <meshStandardMaterial color="#335577" roughness={0.1} />
          </mesh>
        </group>

        <ContactShadows resolution={1024} scale={50} blur={2} opacity={0.5} far={10} color="#000000" />

        {/* Entities */}
        <PlayerController />
        
        {/* Remote Real Players */}
        {remotePlayers.map((player) => (
           <RemotePlayer key={player.id} data={player} />
        ))}

      </Canvas>
    </div>
  );
};