import { GameRoom } from './GameRoom.js';

export class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    
    createRoom(seed, hostId, maxPlayers = 6) {
        if (this.rooms.has(seed)) {
            throw new Error('Room with this seed already exists');
        }
        
        const room = new GameRoom(seed, hostId, maxPlayers);
        this.rooms.set(seed, room);
        return room;
    }
    
    getRoom(seed) {
        return this.rooms.get(seed);
    }
    
    removeRoom(seed) {
        return this.rooms.delete(seed);
    }
    
    getRoomCount() {
        return this.rooms.size;
    }
    
    getPlayerCount() {
        let total = 0;
        for (const room of this.rooms.values()) {
            total += room.getPlayerCount();
        }
        return total;
    }
    
    getAllRooms() {
        return Array.from(this.rooms.values()).map(room => room.getInfo());
    }
    
    cleanupInactiveRooms(maxAge = 3600000) {
        // Remove rooms older than maxAge (default 1 hour)
        const now = Date.now();
        let removed = 0;
        
        for (const [seed, room] of this.rooms.entries()) {
            if (now - room.createdAt.getTime() > maxAge && room.isEmpty()) {
                this.rooms.delete(seed);
                removed++;
            }
        }
        
        return removed;
    }
}
