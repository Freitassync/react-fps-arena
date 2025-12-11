import { create } from 'zustand';
import { PlayerState } from './types';
import * as THREE from 'three';

interface GameStore {
  localPlayer: PlayerState;
  enemies: PlayerState[];
  isPlaying: boolean;
  gameOver: boolean;
  
  // Actions
  setPlaying: (playing: boolean) => void;
  damageEnemy: (id: string, amount: number) => void;
  damagePlayer: (amount: number) => void;
  updateEnemyPosition: (id: string, position: [number, number, number]) => void;
  respawnEnemy: (id: string) => void;
  respawnPlayer: () => void;
  resetGame: () => void;
}

const INITIAL_HP = 100;

const generateEnemies = (count: number): PlayerState[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `bot-${i}`,
    position: [(Math.random() - 0.5) * 40, 1, (Math.random() - 0.5) * 40],
    rotation: [0, 0, 0],
    color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    hp: INITIAL_HP,
    maxHp: INITIAL_HP,
    isDead: false,
    score: 0,
  }));
};

export const useGameStore = create<GameStore>((set, get) => ({
  localPlayer: {
    id: 'hero',
    position: [0, 1, 0],
    rotation: [0, 0, 0],
    color: '#00ff00',
    hp: INITIAL_HP,
    maxHp: INITIAL_HP,
    isDead: false,
    score: 0,
  },
  enemies: generateEnemies(5),
  isPlaying: false,
  gameOver: false,

  setPlaying: (playing) => set({ isPlaying: playing }),

  damageEnemy: (id, amount) => {
    set((state) => {
      const enemies = state.enemies.map((e) => {
        if (e.id === id) {
          const newHp = Math.max(0, e.hp - amount);
          const isDead = newHp === 0;
          
          if (isDead && !e.isDead) {
            // Update score
             setTimeout(() => get().respawnEnemy(id), 3000);
          }
          return { ...e, hp: newHp, isDead };
        }
        return e;
      });
      
      // Increment score if killed
      const enemy = state.enemies.find(e => e.id === id);
      let newScore = state.localPlayer.score;
      if (enemy && enemy.hp > 0 && enemies.find(e => e.id === id)?.isDead) {
          newScore += 100;
      }

      return { enemies, localPlayer: { ...state.localPlayer, score: newScore } };
    });
  },

  damagePlayer: (amount) => {
    set((state) => {
      if (state.localPlayer.isDead) return {};
      const newHp = Math.max(0, state.localPlayer.hp - amount);
      const isDead = newHp === 0;
      return { 
        localPlayer: { ...state.localPlayer, hp: newHp, isDead },
        gameOver: isDead
      };
    });
  },

  updateEnemyPosition: (id, position) => {
    set((state) => ({
      enemies: state.enemies.map((e) => (e.id === id ? { ...e, position } : e)),
    }));
  },

  respawnEnemy: (id) => {
    set((state) => ({
      enemies: state.enemies.map((e) =>
        e.id === id
          ? {
              ...e,
              isDead: false,
              hp: INITIAL_HP,
              position: [(Math.random() - 0.5) * 40, 1, (Math.random() - 0.5) * 40],
            }
          : e
      ),
    }));
  },

  respawnPlayer: () => {
    set((state) => ({
      localPlayer: { ...state.localPlayer, hp: INITIAL_HP, isDead: false, score: 0 },
      enemies: generateEnemies(5), // Reset enemies too
      gameOver: false,
      isPlaying: true
    }));
  },

  resetGame: () => {
     set({
        localPlayer: {
            id: 'hero',
            position: [0, 1, 0],
            rotation: [0, 0, 0],
            color: '#00ff00',
            hp: INITIAL_HP,
            maxHp: INITIAL_HP,
            isDead: false,
            score: 0,
          },
          enemies: generateEnemies(5),
          isPlaying: false,
          gameOver: false,
     })
  }
}));
