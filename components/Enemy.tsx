import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { PlayerState } from '../types';
import { useGameStore } from '../store';

interface EnemyProps {
  data: PlayerState;
}

export const Enemy: React.FC<EnemyProps> = ({ data }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const store = useGameStore();
  const { camera } = useThree();

  // Simple AI: Move towards player if close, otherwise wander
  useFrame((state, delta) => {
    if (!meshRef.current || data.isDead || store.gameOver || !store.isPlaying) return;

    const playerPos = camera.position;
    const enemyPos = meshRef.current.position;
    
    // Calculate distance
    const dist = enemyPos.distanceTo(playerPos);
    const speed = 3 * delta; // Bot speed

    // Simple Chase Logic
    if (dist < 20 && dist > 1.5) {
        const dir = new THREE.Vector3().subVectors(playerPos, enemyPos).normalize();
        // Ignore Y for movement (stay on ground)
        meshRef.current.position.add(new THREE.Vector3(dir.x * speed, 0, dir.z * speed));
        meshRef.current.lookAt(playerPos.x, enemyPos.y, playerPos.z);
    } else if (dist <= 1.5) {
        // Attack range
        if (Math.random() < 0.05) { // Random chance to hit per frame roughly
            store.damagePlayer(5);
        }
    }

    // Sync ref position back to store (optional for this simple version, but good for "multiplayer" feel)
    // In a real app we'd lerp the store position here.
    
    // Update local visual position from store if we were doing server auth, 
    // but here the component owns the movement for smoothness.
  });

  if (data.isDead) return null;

  return (
    <group position={data.position as any}>
      {/* Name/Health Tag */}
      <Html position={[0, 1.2, 0]} center distanceFactor={10}>
         <div className="bg-black/50 text-white text-xs px-1 rounded whitespace-nowrap">
           HP: {data.hp}
         </div>
         <div className="w-8 h-1 bg-red-900 mt-1">
            <div className="h-full bg-red-500" style={{ width: `${(data.hp / data.maxHp) * 100}%` }} />
         </div>
      </Html>

      {/* The Enemy Mesh */}
      <mesh 
        ref={meshRef}
        userData={{ type: 'enemy', id: data.id }}
        position={[0, 0, 0]} // Relative to group
      >
        <capsuleGeometry args={[0.5, 1, 4, 8]} />
        <meshStandardMaterial color={data.color} />
        
        {/* Eyes to see direction */}
        <mesh position={[0, 0.4, 0.3]}>
           <boxGeometry args={[0.3, 0.1, 0.2]} />
           <meshStandardMaterial color="black" />
        </mesh>
      </mesh>
    </group>
  );
};