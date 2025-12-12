import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { PlayerState } from '../types';

interface RemotePlayerProps {
  data: PlayerState;
}

export const RemotePlayer: React.FC<RemotePlayerProps> = ({ data }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    
    const targetPos = new THREE.Vector3(...data.position);
    // Smooth lerp
    groupRef.current.position.lerp(targetPos, 0.2);
    
    // Rotate body based on Y rotation sent by player
    groupRef.current.rotation.y = data.rotation[1];
  });

  if (data.isDead) return null;

  return (
    <group ref={groupRef} userData={{ type: 'remote_player', id: data.id }}>
      {/* Name Tag */}
      <Html position={[0, 2.5, 0]} center distanceFactor={15}>
         <div className="flex flex-col items-center pointer-events-none">
             <div className="bg-black/60 text-white text-xs font-bold px-2 py-1 rounded border border-white/20 backdrop-blur-md">
               {data.name}
             </div>
             <div className="w-10 h-1.5 bg-gray-800 rounded mt-1 overflow-hidden border border-gray-600">
                <div className={`h-full ${data.hp > 50 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${(data.hp / data.maxHp) * 100}%` }} />
             </div>
         </div>
      </Html>

      {/* BODY */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[0.8, 1.2, 0.5]} />
        <meshStandardMaterial color={data.color} roughness={0.7} />
      </mesh>
      
      {/* HEAD */}
      <mesh position={[0, 1.9, 0]} castShadow>
         <boxGeometry args={[0.4, 0.4, 0.4]} />
         <meshStandardMaterial color={data.color} />
         {/* Visor */}
         <mesh position={[0, 0, 0.21]}>
             <planeGeometry args={[0.3, 0.15]} />
             <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} />
         </mesh>
      </mesh>

      {/* ARMS */}
      <mesh position={[-0.5, 1.2, 0]}>
         <boxGeometry args={[0.2, 1, 0.2]} />
         <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.5, 1.2, 0.2]} rotation={[-0.5, 0, 0]}>
         <boxGeometry args={[0.2, 1, 0.2]} />
         <meshStandardMaterial color="#333" />
         {/* Gun held in hand */}
         <mesh position={[0, -0.4, 0.3]} rotation={[1.5, 0, 0]}>
             <boxGeometry args={[0.1, 0.4, 0.1]} />
             <meshStandardMaterial color="black" />
         </mesh>
      </mesh>

      {/* LEGS */}
      <mesh position={[-0.25, 0.3, 0]}>
         <boxGeometry args={[0.25, 0.9, 0.3]} />
         <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0.25, 0.3, 0]}>
         <boxGeometry args={[0.25, 0.9, 0.3]} />
         <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  );
};