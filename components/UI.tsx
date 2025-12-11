import React from 'react';
import { useGameStore } from '../store';

export const UI: React.FC = () => {
  const { localPlayer, isPlaying, gameOver, respawnPlayer, setPlaying } = useGameStore();

  if (gameOver) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 text-white">
        <h1 className="text-6xl font-bold text-red-600 mb-4">YOU DIED</h1>
        <p className="text-2xl mb-8">Final Score: {localPlayer.score}</p>
        <button 
          onClick={() => respawnPlayer()}
          className="px-8 py-4 bg-white text-black font-bold text-xl rounded hover:bg-gray-200 transition"
        >
          RESPAWN
        </button>
      </div>
    );
  }

  if (!isPlaying) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 text-white backdrop-blur-sm">
        <h1 className="text-5xl font-bold mb-2">FPS ARENA</h1>
        <p className="mb-8 text-gray-300">React + Three.js + Zustand</p>
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 max-w-md text-center">
            <p className="mb-4">Controls:</p>
            <ul className="text-left text-sm space-y-2 mb-6 text-gray-400">
                <li>• <b>WASD</b> to Move</li>
                <li>• <b>SPACE</b> to Jump</li>
                <li>• <b>MOUSE</b> to Look</li>
                <li>• <b>CLICK</b> to Shoot</li>
            </ul>
            <button 
            onClick={() => setPlaying(true)}
            className="w-full px-6 py-3 bg-blue-600 font-bold rounded hover:bg-blue-500 transition"
            >
            CLICK TO START
            </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Crosshair */}
      <div className="crosshair">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
      
      {/* Hit Feedback Flash */}
      <div 
        id="hit-feedback" 
        className="absolute inset-0 pointer-events-none bg-red-500/20 opacity-0 transition-opacity duration-75" 
      />

      {/* HUD Info */}
      <div className="absolute bottom-6 left-6 z-40">
        <div className="flex items-end gap-4">
            <div>
                <div className="text-4xl font-bold text-white tracking-wider flex items-center gap-2">
                    <span>{Math.ceil(localPlayer.hp)}</span>
                    <span className="text-sm font-normal text-gray-400">HP</span>
                </div>
                <div className="w-64 h-3 bg-gray-800 rounded-full mt-1 overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-300 ${localPlayer.hp > 30 ? 'bg-green-500' : 'bg-red-600 animate-pulse'}`} 
                        style={{ width: `${(localPlayer.hp / localPlayer.maxHp) * 100}%` }}
                    />
                </div>
            </div>
        </div>
      </div>

      <div className="absolute top-6 right-6 z-40">
        <div className="text-right">
            <div className="text-sm text-gray-400 uppercase tracking-widest">Score</div>
            <div className="text-3xl font-mono text-yellow-400">{localPlayer.score.toString().padStart(6, '0')}</div>
        </div>
      </div>
    </>
  );
};
