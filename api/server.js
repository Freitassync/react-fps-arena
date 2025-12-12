import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let players = {};

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

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

  socket.emit('currentPlayers', players);
  socket.broadcast.emit('newPlayer', players[socket.id]);

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

  socket.on('playerShoot', (targetId) => {
    if (players[targetId]) {
      players[targetId].hp -= 10;
      io.emit('playerDamaged', { id: targetId, hp: players[targetId].hp });
      if (players[targetId].hp <= 0 && !players[targetId].isDead) {
        players[targetId].isDead = true;
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

export default function handler(req, res) {
  if (!server.listening) {
    server.listen(3001, () => {
      console.log('Socket.io server started on port 3001');
    });
  }
  res.end('Socket.io server running');
}
