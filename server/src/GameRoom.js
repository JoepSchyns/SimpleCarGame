export class GameRoom {
    constructor(seed, hostId, maxPlayers = 6) {
        this.seed = seed;
        this.hostId = hostId;
        this.maxPlayers = maxPlayers;
        this.players = new Map();
        this.createdAt = new Date();
        this.gameStarted = false;
        this.gameState = null;
    }
    
    addPlayer(playerId, color) {
        if (this.players.size >= this.maxPlayers) {
            throw new Error('Room is full');
        }
        
        const player = {
            id: playerId,
            color: color,
            ready: false,
            score: 0,
            lives: 10,
            joinedAt: new Date()
        };
        
        this.players.set(playerId, player);
        return player;
    }
    
    removePlayer(playerId) {
        return this.players.delete(playerId);
    }
    
    getPlayer(playerId) {
        return this.players.get(playerId);
    }
    
    getPlayerCount() {
        return this.players.size;
    }
    
    isFull() {
        return this.players.size >= this.maxPlayers;
    }
    
    isEmpty() {
        return this.players.size === 0;
    }
    
    setPlayerReady(playerId, isReady) {
        const player = this.players.get(playerId);
        if (player) {
            player.ready = isReady;
        }
    }
    
    areAllPlayersReady() {
        if (this.players.size === 0) return false;
        return Array.from(this.players.values()).every(p => p.ready);
    }
    
    startGame() {
        this.gameStarted = true;
        this.gameState = {
            startTime: new Date(),
            running: true
        };
    }
    
    updatePlayerScore(playerId, score) {
        const player = this.players.get(playerId);
        if (player) {
            player.score = score;
        }
    }
    
    updatePlayerLives(playerId, lives) {
        const player = this.players.get(playerId);
        if (player) {
            player.lives = lives;
        }
    }
    
    getInfo() {
        return {
            seed: this.seed,
            hostId: this.hostId,
            playerCount: this.players.size,
            maxPlayers: this.maxPlayers,
            gameStarted: this.gameStarted,
            players: Array.from(this.players.values()).map(p => ({
                id: p.id,
                color: p.color,
                ready: p.ready,
                score: p.score,
                lives: p.lives
            })),
            createdAt: this.createdAt
        };
    }
}
