import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import { PlayerController } from './PlayerController';
import { Enemy } from './Enemy';
import { useGameStore } from '../store';

export const GameScene: React.FC = () => {
  const enemies = useGameStore((state) => state.enemies);

  return (
    <div className="w-full h-full absolute inset-0 bg-black">
      <Canvas
        shadows
        camera={{ fov: 75, position: [0, 2, 5] }}
        style={{ background: '#111' }}
      >
        <Sky sunPosition={[100, 20, 100]} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        
        {/* Environment */}
        <group>
          {/* Floor Mesh for collision detection (raycast) */}
          <mesh 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, 0, 0]} 
            userData={{ type: 'environment' }}
          >
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          <gridHelper args={[100, 50, 0xff0000, 0x444444]} />
          
          {/* Some random obstacles */}
          <mesh position={[5, 1, 5]} userData={{ type: 'environment' }}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="#444" />
          </mesh>
          <mesh position={[-10, 1.5, -5]} userData={{ type: 'environment' }}>
             <boxGeometry args={[3, 3, 3]} />
             <meshStandardMaterial color="#335" />
          </mesh>
        </group>

        {/* Entities */}
        <PlayerController />
        
        {enemies.map((enemy) => (
          <Enemy key={enemy.id} data={enemy} />
        ))}

      </Canvas>
    </div>
  );
};