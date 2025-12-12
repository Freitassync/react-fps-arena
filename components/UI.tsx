import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store';

export const UI: React.FC = () => {
  const { localPlayer, isPlaying, gameOver, respawnPlayer, setPlaying, connectToServer, socket } = useGameStore();
  const [serverUrl, setServerUrl] = useState('');

  // Load URL from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('fps_server_url');
    setServerUrl(saved || 'http://localhost:3000');
  }, []);

  const handleConnect = () => {
      localStorage.setItem('fps_server_url', serverUrl);
      connectToServer(serverUrl);
  };

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
        <p className="mb-8 text-gray-300">React + Three.js + Socket.io</p>
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 max-w-md text-center w-full">
            <p className="mb-4 text-gray-400">Controls:</p>
            <ul className="text-left text-sm space-y-2 mb-6 text-gray-500">
                <li>• <b>WASD</b> to Move</li>
                <li>• <b>SPACE</b> to Jump</li>
                <li>• <b>CLICK</b> to Shoot</li>
            </ul>
            
            <div className="flex flex-col gap-3">
                <button 
                onClick={() => setPlaying(true)}
                className="w-full px-6 py-3 bg-blue-600 font-bold rounded hover:bg-blue-500 transition"
                >
                SINGLE PLAYER (VS BOTS)
                </button>

                <div className="h-px bg-gray-700 my-2"></div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs text-left text-gray-400">Multiplayer Server URL:</label>
                    <input 
                        type="text" 
                        value={serverUrl} 
                        onChange={(e) => setServerUrl(e.target.value)}
                        className="bg-black border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                        placeholder="https://your-app.onrender.com"
                    />
                    <div className="flex gap-2">
                        <button 
                            onClick={handleConnect}
                            disabled={!!socket}
                            className={`flex-1 px-4 py-3 font-bold rounded transition border ${socket ? 'bg-green-800 border-green-600 text-green-200' : 'bg-transparent border-white text-white hover:bg-white/10'}`}
                        >
                            {socket ? 'CONNECTED' : 'CONNECT'}
                        </button>
                        {socket && (
                            <button 
                            onClick={() => setPlaying(true)}
                            className="flex-1 px-4 py-3 bg-green-600 font-bold rounded hover:bg-green-500 transition text-white"
                            >
                            PLAY ONLINE
                            </button>
                        )}
                    </div>
                </div>
                {!socket && <p className="text-xs text-gray-500 mt-2">Deploy <code>server.js</code> to Render/Glitch to play with friends.</p>}
            </div>
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
            
            {/* Server Status Indicator */}
            <div className="mb-2">
                <div className={`w-3 h-3 rounded-full ${socket?.connected ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-red-500'}`} title={socket?.connected ? "Online" : "Offline"} />
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