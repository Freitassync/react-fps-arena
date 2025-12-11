import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { MELEE_RANGE, PLAYER_SPEED, PLAYER_JUMP_FORCE, GRAVITY } from '../types';

// Helper for keyboard input
const useKeyboard = () => {
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => setKeys((k) => ({ ...k, [e.code]: true }));
    const handleKeyUp = (e: KeyboardEvent) => setKeys((k) => ({ ...k, [e.code]: false }));
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  return keys;
};

export const PlayerController: React.FC = () => {
  const { camera, scene } = useThree();
  const keys = useKeyboard();
  const store = useGameStore();
  
  // Physics state
  const velocity = useRef(new THREE.Vector3());
  const isJumping = useRef(false);
  const controlsRef = useRef<any>(null); // PointerLockControls type is generic in Drei
  
  // Raycaster for shooting
  const raycaster = useRef(new THREE.Raycaster());
  const [lastShot, setLastShot] = useState(0);

  // Sync state with pointer lock
  useEffect(() => {
    if (store.isPlaying && controlsRef.current) {
      controlsRef.current.lock();
    } else if (!store.isPlaying && controlsRef.current) {
      controlsRef.current.unlock();
    }
  }, [store.isPlaying]);

  // Handle shooting input
  useEffect(() => {
    const handleMouseDown = () => {
      if (!store.isPlaying || store.gameOver) return;

      const now = Date.now();
      if (now - lastShot < 400) return; // Fire rate limit
      setLastShot(now);

      // Trigger visual recoil or sound here if needed

      // Raycast Logic
      raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
      raycaster.current.far = MELEE_RANGE * 4; // Shooting range

      // Get all enemy meshes
      // Note: In a complex scene we would use layers or specific lists, here we just intersect everything
      // and filter by userData
      const intersects = raycaster.current.intersectObjects(scene.children, true);

      for (const hit of intersects) {
         // Check if we hit an enemy
         if (hit.object.userData && hit.object.userData.type === 'enemy') {
            const enemyId = hit.object.userData.id;
            store.damageEnemy(enemyId, 25); // 25 damage
            
            // Visual feedback
            const feedbackEl = document.getElementById('hit-feedback');
            if (feedbackEl) {
                feedbackEl.style.opacity = '1';
                setTimeout(() => feedbackEl.style.opacity = '0', 100);
            }
            break; // Only hit the first thing
         }
         // Stop if we hit a wall/floor
         if (hit.object.userData.type === 'environment') {
             break;
         }
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, [store.isPlaying, store.gameOver, camera, scene, lastShot]);


  useFrame((state, delta) => {
    if (!store.isPlaying || store.gameOver) return;

    // --- Movement Logic ---
    const moveSpeed = PLAYER_SPEED;
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(
      0,
      0,
      Number(keys['KeyS'] || 0) - Number(keys['KeyW'] || 0)
    );
    const sideVector = new THREE.Vector3(
      Number(keys['KeyA'] || 0) - Number(keys['KeyD'] || 0),
      0,
      0
    );

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(moveSpeed)
      .applyEuler(camera.rotation);

    // Apply movement velocity
    velocity.current.x = direction.x;
    velocity.current.z = direction.z;

    // Jump
    if (keys['Space'] && !isJumping.current) {
      velocity.current.y = PLAYER_JUMP_FORCE;
      isJumping.current = true;
    }

    // Gravity
    velocity.current.y -= GRAVITY * delta;

    // Apply velocity to camera (player)
    controlsRef.current.getObject().position.x += velocity.current.x * delta;
    controlsRef.current.getObject().position.y += velocity.current.y * delta;
    controlsRef.current.getObject().position.z += velocity.current.z * delta;

    // Floor Collision (Simple y > 1 check, assuming player height is 2 units, eyes at 1.6)
    if (controlsRef.current.getObject().position.y < 1.6) {
      velocity.current.y = 0;
      controlsRef.current.getObject().position.y = 1.6;
      isJumping.current = false;
    }
  });

  return (
    <PointerLockControls 
        ref={controlsRef} 
        onUnlock={() => store.setPlaying(false)}
        onLock={() => store.setPlaying(true)}
    />
  );
};
