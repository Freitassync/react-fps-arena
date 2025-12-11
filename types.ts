import { Vector3 } from 'three';

export interface PlayerState {
  id: string;
  position: [number, number, number]; // Serializable position
  rotation: [number, number, number];
  color: string;
  hp: number;
  maxHp: number;
  isDead: boolean;
  score: number;
  isRemote?: boolean; // True for other real players
}

export interface Bullet {
  id: string;
  position: Vector3;
  direction: Vector3;
  ownerId: string;
}

export const PLAYER_SPEED = 10;
export const PLAYER_JUMP_FORCE = 10;
export const GRAVITY = 30;
export const BULLET_SPEED = 50;
export const MELEE_RANGE = 5; // Raycast range