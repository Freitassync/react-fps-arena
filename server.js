const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Allow CORS for development
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Game State on Server
let players = {};

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Initialize new player
  players[socket.id] = {
    id: socket.id,
    position: [0, 2, 0],
    rotation: [0, 0, 0],
    color: `hsl(${Math.random() * 360}, 100%, 50%)`,
    hp: 100,
    maxHp: 100,
    isDead: false,
    score: 0
  };

  // Send current state to new player
  socket.emit('currentPlayers', players);

  // Notify others of new player
  socket.broadcast.emit('newPlayer', players[socket.id]);

  // Handle Movement
  socket.on('playerMovement', (movementData) => {
    if (players[socket.id]) {
      players[socket.id].position = movementData.position;
      players[socket.id].rotation = movementData.rotation;
      socket.broadcast.emit('playerMoved', {
        id: socket.id,
        position: movementData.position,
        rotation: movementData.rotation
      });
    }
  });

  // Handle Damage/Shooting
  socket.on('playerShoot', (targetId) => {
    if (players[targetId]) {
      players[targetId].hp -= 10;
      io.emit('playerDamaged', { id: targetId, hp: players[targetId].hp });
      
      if (players[targetId].hp <= 0 && !players[targetId].isDead) {
         players[targetId].isDead = true;
         // Increment score of shooter
         if (players[socket.id]) {
            players[socket.id].score += 100;
            io.emit('scoreUpdate', { id: socket.id, score: players[socket.id].score });
         }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});