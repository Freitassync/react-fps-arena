import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface WeaponProps {
    isShooting: boolean;
}

export const Weapon: React.FC<WeaponProps> = ({ isShooting }) => {
    const groupRef = useRef<THREE.Group>(null);
    const recoilTime = useRef(0);
    const { camera } = useThree();

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // 1. Weapon Sway (Movimento da respiração/andar)
        const time = state.clock.getElapsedTime();
        // Lissajous curve for natural sway
        const swayX = Math.sin(time * 2) * 0.005;
        const swayY = Math.cos(time * 1.5) * 0.005 + Math.sin(time * 4) * 0.002;

        // 2. Mouse Look Inertia (Simula o peso da arma atrasando um pouco a mira)
        // Isso requer acesso ao movimento do mouse, mas podemos simular com base na rotação da câmera se tivéssemos o delta,
        // mas vamos focar no recuo aqui.

        // 3. Recoil Logic
        let recoilZ = 0;
        let recoilRotX = 0;
        let recoilRotZ = 0; // Twist

        if (isShooting) {
            recoilTime.current = 1.0;
        }

        if (recoilTime.current > 0) {
            recoilTime.current -= delta * 8; // Snap back faster
            if (recoilTime.current < 0) recoilTime.current = 0;
            
            // Kick back and up
            recoilZ = recoilTime.current * 0.15;
            recoilRotX = recoilTime.current * 0.2;
            recoilRotZ = (Math.random() - 0.5) * recoilTime.current * 0.1;
        }

        // Base Position (Right side, slightly down - CSGO Style)
        // X: 0.25 (Right), Y: -0.25 (Down), Z: -0.4 (Forward)
        const baseX = 0.25;
        const baseY = -0.3;
        const baseZ = -0.4;

        groupRef.current.position.set(
            baseX + swayX, 
            baseY + swayY, 
            baseZ + recoilZ
        );

        groupRef.current.rotation.x = recoilRotX;
        groupRef.current.rotation.z = recoilRotZ;
    });

    // Material definitions
    const skinMaterial = new THREE.MeshStandardMaterial({ color: "#e0ac69", roughness: 0.8 });
    const sleeveMaterial = new THREE.MeshStandardMaterial({ color: "#1a1a1a", roughness: 0.9 });
    const gunDarkMaterial = new THREE.MeshStandardMaterial({ color: "#111", roughness: 0.4, metalness: 0.6 });
    const gunMetalMaterial = new THREE.MeshStandardMaterial({ color: "#333", roughness: 0.3, metalness: 0.8 });

    return (
        <group ref={groupRef}>
            {/* === ARMS & HANDS === */}
            
            {/* Right Arm (Main holding arm) - Angled from bottom right */}
            <mesh position={[0.15, -0.15, 0.3]} rotation={[0.2, -0.3, -0.2]}>
                <boxGeometry args={[0.12, 0.1, 0.65]} />
                <primitive object={sleeveMaterial} attach="material" />
            </mesh>
            
            {/* Right Wrist/Hand */}
            <mesh position={[0.02, -0.08, 0.12]} rotation={[0.2, -0.1, 0]}>
                <boxGeometry args={[0.09, 0.1, 0.15]} />
                <primitive object={skinMaterial} attach="material" />
            </mesh>

            {/* Left Arm (Support) - Coming from bottom left */}
            <mesh position={[-0.15, -0.2, 0.3]} rotation={[0.3, 0.4, 0.2]}>
                <boxGeometry args={[0.11, 0.1, 0.6]} />
                <primitive object={sleeveMaterial} attach="material" />
            </mesh>

            {/* Left Hand (Gripping underneath) */}
            <mesh position={[-0.03, -0.12, 0.05]} rotation={[0.5, 0.5, 0.2]}>
                <boxGeometry args={[0.09, 0.09, 0.12]} />
                <primitive object={skinMaterial} attach="material" />
            </mesh>


            {/* === THE GUN (PISTOL) === */}
            <group rotation={[0, 0, 0]}> 
                {/* Main Body */}
                <mesh position={[0, 0, 0]} castShadow>
                    <boxGeometry args={[0.06, 0.08, 0.25]} />
                    <primitive object={gunMetalMaterial} attach="material" />
                </mesh>
                
                {/* Slide (Top Part) */}
                <mesh position={[0, 0.05, 0]} castShadow>
                    <boxGeometry args={[0.062, 0.04, 0.25]} />
                    <primitive object={gunDarkMaterial} attach="material" />
                </mesh>

                {/* Grip/Handle */}
                <mesh position={[0, -0.08, 0.08]} rotation={[0.3, 0, 0]}>
                    <boxGeometry args={[0.055, 0.15, 0.07]} />
                    <primitive object={gunDarkMaterial} attach="material" />
                </mesh>
                
                {/* Trigger Guard */}
                <mesh position={[0, -0.05, -0.02]}>
                    <boxGeometry args={[0.01, 0.05, 0.08]} />
                    <primitive object={gunDarkMaterial} attach="material" />
                </mesh>

                {/* Barrel Hole */}
                <mesh position={[0, 0.05, -0.13]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.015, 0.015, 0.01, 8]} />
                    <meshStandardMaterial color="#000" />
                </mesh>
                
                {/* Sights */}
                <mesh position={[0, 0.075, 0.12]}>
                    <boxGeometry args={[0.01, 0.015, 0.01]} />
                    <primitive object={gunDarkMaterial} attach="material" />
                </mesh>
                <mesh position={[0, 0.075, -0.12]}>
                    <boxGeometry args={[0.005, 0.01, 0.01]} />
                    <meshStandardMaterial color="#0f0" emissive="#0f0" emissiveIntensity={1} />
                </mesh>
                
                {/* Muzzle Flash Light */}
                {recoilTime.current > 0.8 && (
                     <pointLight position={[0, 0.1, -0.3]} color="#ffaa00" intensity={3} distance={5} decay={2} />
                )}
            </group>
        </group>
    );
};