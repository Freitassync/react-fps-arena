import { create } from 'zustand';
import { PlayerState } from './types';
import io, { Socket } from 'socket.io-client';

interface GameStore {
  localPlayer: PlayerState;
  enemies: PlayerState[]; // Bots
  remotePlayers: PlayerState[]; // Real Humans
  
  isPlaying: boolean;
  gameOver: boolean;
  socket: Socket | null;
  
  // Actions
  setPlaying: (playing: boolean) => void;
  damageEnemy: (id: string, amount: number) => void;
  damagePlayer: (amount: number) => void;
  
  respawnEnemy: (id: string) => void;
  respawnPlayer: () => void;
  
  // Multiplayer Actions
  connectToServer: (url: string) => void;
  updateLocalPosition: (pos: [number, number, number], rot: [number, number, number]) => void;
  shootRemotePlayer: (targetId: string) => void;
}

const INITIAL_HP = 100;

// Bots for offline/mixed mode
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
  enemies: generateEnemies(3),
  remotePlayers: [],
  isPlaying: false,
  gameOver: false,
  socket: null,

  setPlaying: (playing) => set({ isPlaying: playing }),

  connectToServer: (url: string) => {
    const existingSocket = get().socket;
    if (existingSocket) {
        existingSocket.disconnect();
    }

    // Connect to provided URL
    const socket = io(url, {
        autoConnect: true,
        reconnection: true
    });

    socket.on('connect', () => {
        console.log('Connected to Multiplayer Server with ID:', socket.id);
        set((state) => ({ 
            localPlayer: { ...state.localPlayer, id: socket.id || 'hero' } 
        }));
    });

    socket.on('connect_error', (err) => {
        console.error("Connection error:", err);
        alert("Failed to connect to server. Check the URL.");
    });

    socket.on('currentPlayers', (players: Record<string, PlayerState>) => {
        const remoteList = Object.values(players).filter(p => p.id !== socket.id);
        set({ remotePlayers: remoteList.map(p => ({ ...p, isRemote: true })) });
    });

    socket.on('newPlayer', (player: PlayerState) => {
        set((state) => ({ 
            remotePlayers: [...state.remotePlayers, { ...player, isRemote: true }] 
        }));
    });

    socket.on('playerDisconnected', (id: string) => {
        set((state) => ({
            remotePlayers: state.remotePlayers.filter(p => p.id !== id)
        }));
    });

    socket.on('playerMoved', (data: { id: string, position: [number, number, number], rotation: [number, number, number] }) => {
        set((state) => ({
            remotePlayers: state.remotePlayers.map(p => 
                p.id === data.id 
                ? { ...p, position: data.position, rotation: data.rotation }
                : p
            )
        }));
    });

    socket.on('playerDamaged', (data: { id: string, hp: number }) => {
        const { localPlayer, remotePlayers } = get();
        
        if (localPlayer.id === data.id) {
            set({ localPlayer: { ...localPlayer, hp: data.hp, isDead: data.hp <= 0 }, gameOver: data.hp <= 0 });
        } else {
            set({ 
                remotePlayers: remotePlayers.map(p => p.id === data.id ? { ...p, hp: data.hp } : p)
            });
        }
    });

    set({ socket });
  },

  updateLocalPosition: (pos, rot) => {
      const { socket, localPlayer } = get();
      
      if (socket && socket.connected) {
          socket.emit('playerMovement', { position: pos, rotation: rot });
      }
  },

  shootRemotePlayer: (targetId) => {
      const { socket } = get();
      if (socket && socket.connected) {
          socket.emit('playerShoot', targetId);
      }
  },

  damageEnemy: (id, amount) => {
    set((state) => {
      const enemies = state.enemies.map((e) => {
        if (e.id === id) {
          const newHp = Math.max(0, e.hp - amount);
          const isDead = newHp === 0;
          
          if (isDead && !e.isDead) {
             setTimeout(() => get().respawnEnemy(id), 3000);
          }
          return { ...e, hp: newHp, isDead };
        }
        return e;
      });
      
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
      enemies: generateEnemies(3),
      gameOver: false,
      isPlaying: true
    }));
  },
}));