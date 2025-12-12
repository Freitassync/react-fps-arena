import { Vector3 } from 'three';

export interface PlayerState {
  id: string;
  name: string; // New: Player Name
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  hp: number;
  maxHp: number;
  isDead: boolean;
  score: number;
  kills: number; // New: K/D tracking
  deaths: number; // New: K/D tracking
  isRemote?: boolean;
}

export interface KillLog {
  id: string;
  killerName: string;
  victimName: string;
  timestamp: number;
}

export const PLAYER_SPEED = 12; // Slightly faster for arena feel
export const PLAYER_JUMP_FORCE = 12;
export const GRAVITY = 35;
export const MELEE_RANGE = 100; // Raycast shooting range
