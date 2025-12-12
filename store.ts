import { create } from 'zustand';
import { PlayerState, KillLog } from './types';
import io, { Socket } from 'socket.io-client';

interface GameStore {
  localPlayer: PlayerState;
  remotePlayers: PlayerState[];
  killLogs: KillLog[];
  
  isPlaying: boolean;
  gameOver: boolean;
  socket: Socket | null;
  
  // Actions
  setPlaying: (playing: boolean) => void;
  joinGame: (name: string) => void;
  shootRemotePlayer: (targetId: string) => void;
  respawnPlayer: () => void;
  updateLocalPosition: (pos: [number, number, number], rot: [number, number, number]) => void;
}

const SERVER_URL = "https://react-fps-arena.vercel.app/";

export const useGameStore = create<GameStore>((set, get) => ({
  localPlayer: {
    id: 'hero',
    name: 'Player',
    position: [0, 5, 0],
    rotation: [0, 0, 0],
    color: '#00ff00',
    hp: 100,
    maxHp: 100,
    isDead: false,
    score: 0,
    kills: 0,
    deaths: 0
  },
  remotePlayers: [],
  killLogs: [],
  isPlaying: false,
  gameOver: false,
  socket: null,

  setPlaying: (playing) => set({ isPlaying: playing }),

  joinGame: (name: string) => {
    const existingSocket = get().socket;
    if (existingSocket) existingSocket.disconnect();

    const socket = io(SERVER_URL, {
        autoConnect: true,
        reconnection: true
    });

    socket.on('connect', () => {
        console.log('Connected to Arena');
        // Tell server our name
        socket.emit('joinGame', name);
        
        set((state) => ({ 
            localPlayer: { ...state.localPlayer, id: socket.id || 'hero', name: name },
            isPlaying: true
        }));
    });

    socket.on('currentPlayers', (players: Record<string, PlayerState>) => {
        const remoteList = Object.values(players).filter(p => p.id !== socket.id);
        set({ remotePlayers: remoteList.map(p => ({ ...p, isRemote: true })) });
        
        // Also update local player if exists in list
        if (socket.id && players[socket.id]) {
            set((state) => ({ localPlayer: { ...state.localPlayer, ...players[socket.id] } }));
        }
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
            if (data.hp <= 0) set({ isPlaying: false });
        } else {
            set({ 
                remotePlayers: remotePlayers.map(p => p.id === data.id ? { ...p, hp: data.hp } : p)
            });
        }
    });

    socket.on('updatePlayerState', (player: PlayerState) => {
        const { localPlayer, remotePlayers } = get();
        if (localPlayer.id === player.id) {
            set({ localPlayer: { ...localPlayer, ...player } });
        } else {
            set({
                remotePlayers: remotePlayers.map(p => p.id === player.id ? { ...p, ...player } : p)
            });
        }
    });

    socket.on('killFeed', (log: KillLog) => {
        set((state) => ({
            killLogs: [log, ...state.killLogs].slice(0, 5) // Keep last 5
        }));
        setTimeout(() => {
            set((state) => ({
                killLogs: state.killLogs.filter(l => l.id !== log.id)
            }));
        }, 5000); // Remove after 5s
    });

    set({ socket });
  },

  updateLocalPosition: (pos, rot) => {
      const { socket } = get();
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

  respawnPlayer: () => {
    const { socket } = get();
    if (socket && socket.connected) {
        socket.emit('respawnRequest');
        set({ gameOver: false, isPlaying: true });
    }
  },
}));