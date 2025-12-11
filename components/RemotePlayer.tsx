import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { PlayerState } from '../types';

interface RemotePlayerProps {
  data: PlayerState;
}

export const RemotePlayer: React.FC<RemotePlayerProps> = ({ data }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    
    // Interpolate position for smoothness
    const targetPos = new THREE.Vector3(...data.position);
    meshRef.current.position.lerp(targetPos, 0.1);
    
    // Interpolate rotation (only Y axis usually matters for visual body)
    // We assume data.rotation is passed as Euler or similar
    // meshRef.current.rotation.set(...data.rotation);
  });

  if (data.isDead) return null;

  return (
    <group>
      <Html position={[data.position[0], data.position[1] + 1.2, data.position[2]]} center distanceFactor={10}>
         <div className="flex flex-col items-center">
             <div className="bg-blue-600/80 text-white text-xs px-2 py-0.5 rounded font-bold mb-1 shadow-lg border border-blue-400">
               P: {data.id.slice(0, 4)}
             </div>
             <div className="w-8 h-1 bg-gray-900 rounded-full overflow-hidden border border-gray-600">
                <div className="h-full bg-green-400" style={{ width: `${(data.hp / data.maxHp) * 100}%` }} />
             </div>
         </div>
      </Html>

      <mesh 
        ref={meshRef}
        userData={{ type: 'remote_player', id: data.id }}
        position={new THREE.Vector3(...data.position)}
      >
        <boxGeometry args={[0.6, 1.8, 0.6]} />
        <meshStandardMaterial color={data.color} />
        
        {/* Face/Visor */}
        <mesh position={[0, 0.5, 0.31]}>
            <planeGeometry args={[0.4, 0.2]} />
            <meshStandardMaterial color="#00ffff" emissive="#00aaaa" />
        </mesh>
      </mesh>
    </group>
  );
};