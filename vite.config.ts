import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { Server } from 'socket.io';
// @ts-ignore
import { setupGameServer } from './server.js';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'express-socket-io',
      configureServer(server) {
        if (!server.httpServer) return;
        
        const io = new Server(server.httpServer);
        setupGameServer(io);
      }
    }
  ]
});