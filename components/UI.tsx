import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store';

export const UI: React.FC = () => {
  const { localPlayer, remotePlayers, killLogs, isPlaying, gameOver, respawnPlayer, joinGame, socket } = useGameStore();
  const [nameInput, setNameInput] = useState('');
  const [showScoreboard, setShowScoreboard] = useState(false);

  // Handle Tab for Scoreboard
  useEffect(() => {
      const down = (e: KeyboardEvent) => { if (e.code === 'Tab') { e.preventDefault(); setShowScoreboard(true); }};
      const up = (e: KeyboardEvent) => { if (e.code === 'Tab') { e.preventDefault(); setShowScoreboard(false); }};
      window.addEventListener('keydown', down);
      window.addEventListener('keyup', up);
      return () => {
          window.removeEventListener('keydown', down);
          window.removeEventListener('keyup', up);
      };
  }, []);

  const handleJoin = () => {
      if (nameInput.trim().length > 0) {
          joinGame(nameInput);
      }
  };

  // 1. Initial Name Input Screen (Before Joining)
  if (!socket && !isPlaying) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 text-white font-sans">
        <h1 className="text-6xl font-black italic tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            NEON ARENA
        </h1>
        <p className="mb-8 text-gray-400 tracking-widest text-sm">MULTIPLAYER ONLY</p>
        
        <div className="bg-gray-900 p-8 rounded-xl border border-gray-700 shadow-2xl w-full max-w-sm flex flex-col gap-4">
            <div>
                <label className="text-xs text-gray-500 font-bold uppercase">Codename</label>
                <input 
                    type="text" 
                    maxLength={12}
                    className="w-full bg-black border border-gray-600 rounded p-3 text-white text-lg focus:border-blue-500 focus:outline-none placeholder-gray-700"
                    placeholder="ENTER NAME..."
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                />
            </div>
            
            <button 
                onClick={handleJoin}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded tracking-wider transition-all transform hover:scale-[1.02]"
            >
                ENTER ARENA
            </button>
            <p className="text-center text-xs text-gray-600 mt-2">WASD to Move • Click to Shoot</p>
        </div>
      </div>
    );
  }

  // 2. Game Over Screen
  if (gameOver) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-900/40 backdrop-blur-sm text-white">
        <h1 className="text-8xl font-black text-red-500 drop-shadow-lg mb-2">ELIMINATED</h1>
        <p className="text-2xl mb-8 font-mono">Killed by Enemy</p>
        <button 
          onClick={() => respawnPlayer()}
          className="px-10 py-4 bg-white text-black font-black text-2xl rounded hover:bg-gray-200 transition shadow-xl"
        >
          RESPAWN
        </button>
      </div>
    );
  }

  // 3. Main HUD
  return (
    <>
      {/* Crosshair */}
      <div className="crosshair">
        <div className="w-1 h-1 bg-green-500 rounded-full shadow-[0_0_4px_#0f0]" />
        <div className="absolute border border-white/30 w-6 h-6 rounded-full -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2" />
      </div>
      
      {/* Hit Feedback Flash */}
      <div 
        id="hit-feedback" 
        className="absolute inset-0 pointer-events-none bg-white/20 opacity-0 transition-opacity duration-75 mix-blend-overlay" 
      />

      {/* Kill Feed (Top Right) */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-1 z-40 pointer-events-none">
          {killLogs.map((log) => (
              <div key={log.id} className="bg-black/60 backdrop-blur text-white text-sm px-3 py-1 rounded border-l-4 border-red-500 animate-fade-in-down">
                  <span className="text-blue-300 font-bold">{log.killerName}</span>
                  <span className="mx-1 text-gray-400">eliminated</span>
                  <span className="text-red-300 font-bold">{log.victimName}</span>
              </div>
          ))}
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-8 left-8 z-40 flex items-end gap-6 pointer-events-none">
        
        {/* Health */}
        <div>
             <div className="text-xs text-gray-400 font-bold uppercase mb-1">Health Integrity</div>
             <div className="flex items-end">
                <span className="text-6xl font-black italic leading-none text-white">{Math.ceil(localPlayer.hp)}</span>
                <span className="text-2xl font-bold text-gray-500 ml-1">%</span>
             </div>
             <div className="w-64 h-2 bg-gray-800 skew-x-[-12deg] mt-2 overflow-hidden border border-gray-600">
                <div 
                    className={`h-full transition-all duration-200 ${localPlayer.hp > 40 ? 'bg-blue-500' : 'bg-red-500 animate-pulse'}`} 
                    style={{ width: `${(localPlayer.hp / localPlayer.maxHp) * 100}%` }}
                />
             </div>
        </div>

        {/* Stats Mini */}
        <div className="mb-2">
            <div className="text-gray-400 text-xs font-bold uppercase">K / D</div>
            <div className="text-white font-mono text-xl">
                <span className="text-green-400">{localPlayer.kills}</span> / <span className="text-red-400">{localPlayer.deaths}</span>
            </div>
        </div>
      </div>

      {/* Scoreboard (Overlay) */}
      {showScoreboard && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="bg-gray-900 w-full max-w-2xl rounded-lg overflow-hidden border border-gray-700 shadow-2xl">
                  <div className="bg-gray-800 px-6 py-4 flex justify-between items-center border-b border-gray-700">
                      <h2 className="text-xl font-bold text-white tracking-widest">SCOREBOARD</h2>
                      <span className="text-xs text-green-400 font-mono">CONNECTED: {remotePlayers.length + 1}</span>
                  </div>
                  <table className="w-full text-left text-sm text-gray-300">
                      <thead className="bg-gray-950 text-xs uppercase font-bold text-gray-500">
                          <tr>
                              <th className="px-6 py-3">Player</th>
                              <th className="px-6 py-3 text-right">Kills</th>
                              <th className="px-6 py-3 text-right">Deaths</th>
                              <th className="px-6 py-3 text-right">Score</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                          {/* Sort players by kills */}
                          {[localPlayer, ...remotePlayers].sort((a,b) => b.kills - a.kills).map((p) => (
                              <tr key={p.id} className={p.id === localPlayer.id ? "bg-blue-900/20" : ""}>
                                  <td className="px-6 py-3 font-bold text-white flex items-center gap-2">
                                    {p.id === localPlayer.id && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                                    {p.name}
                                  </td>
                                  <td className="px-6 py-3 text-right font-mono text-green-400">{p.kills}</td>
                                  <td className="px-6 py-3 text-right font-mono text-red-400">{p.deaths}</td>
                                  <td className="px-6 py-3 text-right font-mono text-yellow-500">{p.score}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  <div className="bg-gray-950 px-6 py-2 text-center text-xs text-gray-600">
                      Release TAB to close
                  </div>
              </div>
          </div>
      )}
    </>
  );
};