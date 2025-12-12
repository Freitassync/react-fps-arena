import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';

const app = express();
const server = http.createServer(app);

// Export logic so Vite can use it
export const setupGameServer = (io) => {
  let players = {};

  io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    // Initialize with temporary data, waiting for 'joinGame'
    players[socket.id] = {
      id: socket.id,
      name: `Player ${socket.id.substr(0,4)}`,
      position: [0, 5, 0],
      rotation: [0, 0, 0],
      color: `hsl(${Math.random() * 360}, 80%, 50%)`,
      hp: 100,
      maxHp: 100,
      isDead: false,
      score: 0,
      kills: 0,
      deaths: 0
    };

    socket.emit('currentPlayers', players);
    socket.broadcast.emit('newPlayer', players[socket.id]);

    // Handle Player Join (Setting Name)
    socket.on('joinGame', (name) => {
      if (players[socket.id]) {
        players[socket.id].name = name.substring(0, 15) || 'Unknown';
        players[socket.id].isDead = false;
        players[socket.id].hp = 100;
        io.emit('updatePlayerState', players[socket.id]);
      }
    });

    socket.on('playerMovement', (movementData) => {
      if (players[socket.id] && !players[socket.id].isDead) {
        players[socket.id].position = movementData.position;
        players[socket.id].rotation = movementData.rotation;
        socket.broadcast.emit('playerMoved', {
          id: socket.id,
          position: movementData.position,
          rotation: movementData.rotation
        });
      }
    });

    socket.on('playerShoot', (targetId) => {
      const shooter = players[socket.id];
      const victim = players[targetId];

      if (shooter && victim && !victim.isDead) {
        victim.hp -= 15; // Damage per shot
        io.emit('playerDamaged', { id: targetId, hp: victim.hp });
        
        if (victim.hp <= 0) {
           victim.isDead = true;
           victim.deaths += 1;
           shooter.kills += 1;
           shooter.score += 100;
           
           // Notify everyone of the kill
           io.emit('killFeed', {
              id: Date.now().toString(),
              killerName: shooter.name,
              victimName: victim.name,
              timestamp: Date.now()
           });

           // Sync stats
           io.emit('updatePlayerState', shooter);
           io.emit('updatePlayerState', victim);
        }
      }
    });

    socket.on('respawnRequest', () => {
       if (players[socket.id]) {
          players[socket.id].isDead = false;
          players[socket.id].hp = 100;
          players[socket.id].position = [(Math.random() - 0.5) * 40, 5, (Math.random() - 0.5) * 40];
          io.emit('updatePlayerState', players[socket.id]);
       }
    });

    socket.on('disconnect', () => {
      console.log('Player disconnected:', socket.id);
      delete players[socket.id];
      io.emit('playerDisconnected', socket.id);
    });
  });
};

// Check if running directly (node server.js) vs imported (Vite plugin)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });
    
    setupGameServer(io);
    
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}