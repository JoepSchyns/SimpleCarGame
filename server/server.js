import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { GameRoom } from './src/GameRoom.js';
import { RoomManager } from './src/RoomManager.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files in production
if (process.env.NODE_ENV === 'production') {
    const publicPath = join(__dirname, '..', 'public');
    app.use(express.static(publicPath));
}

// Room manager instance
const roomManager = new RoomManager();

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        rooms: roomManager.getRoomCount(),
        players: roomManager.getPlayerCount(),
        timestamp: new Date().toISOString()
    });
});

// Get room info
app.get('/api/rooms/:seed', (req, res) => {
    const room = roomManager.getRoom(req.params.seed);
    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room.getInfo());
});

// Serve index.html for all other routes in production (SPA fallback)
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        const publicPath = join(__dirname, '..', 'public');
        res.sendFile(join(publicPath, 'index.html'));
    });
}

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`[${new Date().toISOString()}] Client connected: ${socket.id}`);
    
    // Create room (host)
    socket.on('createRoom', (seed, callback) => {
        try {
            const room = roomManager.createRoom(seed, socket.id);
            socket.join(seed);
            socket.data.roomSeed = seed;
            socket.data.isHost = true;
            
            console.log(`[${seed}] Room created by ${socket.id}`);
            
            if (callback) {
                callback({ success: true, seed });
            }
        } catch (error) {
            console.error(`Error creating room:`, error.message);
            if (callback) {
                callback({ success: false, error: error.message });
            }
        }
    });
    
    // Connect to room (player)
    socket.on('connectToRoom', (seed, playerColor, callback) => {
        try {
            const room = roomManager.getRoom(seed);
            
            if (!room) {
                throw new Error('Room not found');
            }
            
            if (room.isFull()) {
                throw new Error('Room is full');
            }
            
            const player = room.addPlayer(socket.id, playerColor);
            socket.join(seed);
            socket.data.roomSeed = seed;
            socket.data.isHost = false;
            socket.data.playerId = player.id;
            
            // Notify host about new player
            io.to(room.hostId).emit('playerJoined', {
                playerId: socket.id,
                color: playerColor,
                playerNumber: room.getPlayerCount()
            });
            
            console.log(`[${seed}] Player ${socket.id} joined (${room.getPlayerCount()}/${room.maxPlayers})`);
            
            if (callback) {
                callback({ 
                    success: true, 
                    playerId: socket.id,
                    playerNumber: room.getPlayerCount()
                });
            }
        } catch (error) {
            console.error(`Error connecting to room:`, error.message);
            if (callback) {
                callback({ success: false, error: error.message });
            }
        }
    });
    
    // Player input
    socket.on('playerInput', (input) => {
        const roomSeed = socket.data.roomSeed;
        if (!roomSeed) return;
        
        const room = roomManager.getRoom(roomSeed);
        if (!room) return;
        
        // Forward input to host
        io.to(room.hostId).emit('playerInput', {
            playerId: socket.id,
            input
        });
    });
    
    // Host feedback to player
    socket.on('hostFeedback', (playerId, feedback) => {
        io.to(playerId).emit('hostFeedback', feedback);
    });
    
    // Game state update from host
    socket.on('gameStateUpdate', (gameState) => {
        const roomSeed = socket.data.roomSeed;
        if (!roomSeed || !socket.data.isHost) return;
        
        const room = roomManager.getRoom(roomSeed);
        if (!room) return;
        
        // Broadcast to all players in room
        socket.to(roomSeed).emit('gameStateUpdate', gameState);
    });
    
    // Start game
    socket.on('startGame', () => {
        const roomSeed = socket.data.roomSeed;
        if (!roomSeed || !socket.data.isHost) return;
        
        const room = roomManager.getRoom(roomSeed);
        if (!room) return;
        
        room.startGame();
        io.to(roomSeed).emit('gameStarted');
        console.log(`[${roomSeed}] Game started`);
    });
    
    // Player ready status
    socket.on('playerReady', (isReady) => {
        const roomSeed = socket.data.roomSeed;
        if (!roomSeed) return;
        
        const room = roomManager.getRoom(roomSeed);
        if (!room) return;
        
        room.setPlayerReady(socket.id, isReady);
        
        // Notify host
        io.to(room.hostId).emit('playerReadyStatus', {
            playerId: socket.id,
            isReady,
            allReady: room.areAllPlayersReady()
        });
    });
    
    // Disconnect handling
    socket.on('disconnect', () => {
        const roomSeed = socket.data.roomSeed;
        console.log(`[${new Date().toISOString()}] Client disconnected: ${socket.id}`);
        
        if (!roomSeed) return;
        
        const room = roomManager.getRoom(roomSeed);
        if (!room) return;
        
        if (socket.data.isHost) {
            // Host disconnected - notify all players and close room
            io.to(roomSeed).emit('hostDisconnected');
            roomManager.removeRoom(roomSeed);
            console.log(`[${roomSeed}] Room closed - host disconnected`);
        } else {
            // Player disconnected - notify host
            room.removePlayer(socket.id);
            io.to(room.hostId).emit('playerLeft', { 
                playerId: socket.id,
                remainingPlayers: room.getPlayerCount()
            });
            console.log(`[${roomSeed}] Player ${socket.id} left (${room.getPlayerCount()} remaining)`);
            
            // Remove room if empty
            if (room.isEmpty()) {
                roomManager.removeRoom(roomSeed);
                console.log(`[${roomSeed}] Room removed - no players`);
            }
        }
    });
});

// Start server
const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔════════════════════════════════════════╗
║   SimpleCarGame Server                 ║
║   Port: ${PORT.toString().padEnd(31)}║
║   Status: Running                      ║
╚════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    httpServer.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
