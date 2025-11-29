import { io } from 'socket.io-client';

export class SocketManager {
    constructor(serverUrl = 'http://localhost:8000') {
        this.serverUrl = serverUrl;
        this.socket = null;
        this.connected = false;
        this.roomSeed = null;
        this.isHost = false;
        this.callbacks = {
            connected: [],
            disconnected: [],
            playerJoined: [],
            playerLeft: [],
            playerInput: [],
            gameStarted: [],
            hostDisconnected: [],
            hostFeedback: [],
            gameStateUpdate: [],
            playerReadyStatus: []
        };
    }
    
    connect() {
        if (this.socket) {
            console.warn('Socket already connected');
            return;
        }
        
        this.socket = io(this.serverUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });
        
        this.setupListeners();
    }
    
    setupListeners() {
        this.socket.on('connect', () => {
            console.log('Connected to server:', this.socket.id);
            this.connected = true;
            this.trigger('connected', this.socket.id);
        });
        
        this.socket.on('disconnect', (reason) => {
            console.log('Disconnected from server:', reason);
            this.connected = false;
            this.trigger('disconnected', reason);
        });
        
        this.socket.on('playerJoined', (data) => {
            this.emit('playerJoined', data);
        });
        
        this.socket.on('playerLeft', (data) => {
            this.emit('playerLeft', data);
        });
        
        this.socket.on('playerInput', (data) => {
            this.trigger('playerInput', data);
        });
        
        this.socket.on('gameStarted', () => {
            this.emit('gameStarted');
        });
        
        this.socket.on('hostDisconnected', () => {
            this.emit('hostDisconnected');
        });
        
        this.socket.on('hostFeedback', (feedback) => {
            this.trigger('hostFeedback', feedback);
        });
        
        this.socket.on('gameStateUpdate', (gameState) => {
            this.trigger('gameStateUpdate', gameState);
        });
        
        this.socket.on('playerReadyStatus', (data) => {
            this.trigger('playerReadyStatus', data);
        });
    }
    
    createRoom(seed) {
        return new Promise((resolve, reject) => {
            if (!this.socket) {
                reject(new Error('Not connected to server'));
                return;
            }
            
            this.socket.emit('createRoom', seed, (response) => {
                if (response.success) {
                    this.roomSeed = seed;
                    this.isHost = true;
                    resolve(response);
                } else {
                    reject(new Error(response.error));
                }
            });
        });
    }
    
    joinRoom(seed, playerColor) {
        return new Promise((resolve, reject) => {
            if (!this.socket) {
                reject(new Error('Not connected to server'));
                return;
            }
            
            this.socket.emit('connectToRoom', seed, playerColor, (response) => {
                if (response.success) {
                    this.roomSeed = seed;
                    this.isHost = false;
                    resolve(response);
                } else {
                    reject(new Error(response.error));
                }
            });
        });
    }
    
    sendPlayerInput(input) {
        if (!this.socket || !this.connected) return;
        this.socket.emit('playerInput', input);
    }
    
    sendHostFeedback(playerId, feedback) {
        if (!this.socket || !this.connected || !this.isHost) return;
        this.socket.emit('hostFeedback', playerId, feedback);
    }
    
    sendGameStateUpdate(gameState) {
        if (!this.socket || !this.connected || !this.isHost) return;
        this.socket.emit('gameStateUpdate', gameState);
    }
    
    startGame() {
        if (!this.socket || !this.connected || !this.isHost) return;
        this.socket.emit('startGame');
    }
    
    setPlayerReady(isReady) {
        if (!this.socket || !this.connected) return;
        this.socket.emit('playerReady', isReady);
    }
    
    on(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
    }
    
    off(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
        }
    }
    
    trigger(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => callback(data));
        }
    }
    
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
            this.roomSeed = null;
            this.isHost = false;
        }
    }
}
