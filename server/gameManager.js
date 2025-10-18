class GameManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(roomId) {
    const room = {
      roomId,
      players: [],
      board: Array(9).fill(null),
      currentTurn: null,
      status: 'waiting',
      winner: null,
      createdAt: Date.now()
    };
    
    this.rooms.set(roomId, room);
    return room;
  }

  joinRoom(roomId, player) {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return { success: false, error: 'Room not found' };
    }
    
    if (room.players.length >= 2) {
      return { success: false, error: 'Room is full' };
    }
    
    if (room.status !== 'waiting') {
      return { success: false, error: 'Game already in progress' };
    }

    const symbol = room.players.length === 0 ? 'X' : 'O';
    const playerData = {
      id: player.id,
      name: player.name,
      symbol,
      pieces: { small: 3, medium: 3, large: 3 }
    };
    
    room.players.push(playerData);
    
    if (room.players.length === 2) {
      room.status = 'playing';
      room.currentTurn = room.players[0].id;
    }
    
    return { success: true, room };
  }

  leaveRoom(roomId, playerId) {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    
    room.players = room.players.filter(p => p.id !== playerId);
    
    if (room.players.length === 0) {
      this.deleteRoom(roomId);
      return true;
    }
    
    if (room.status === 'playing') {
      room.status = 'finished';
      room.winner = room.players[0].id;
    }
    
    return true;
  }

  getRoomById(roomId) {
    return this.rooms.get(roomId);
  }

  getAllRooms() {
    const rooms = {};
    this.rooms.forEach((room, id) => {
      rooms[id] = room;
    });
    return rooms;
  }

  deleteRoom(roomId) {
    return this.rooms.delete(roomId);
  }

  updateRoom(room) {
    this.rooms.set(room.roomId, room);
  }

  makeMove(roomId, playerId, position, size) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    
    if (room.currentTurn !== playerId) {
      return null;
    }
    
    const player = room.players.find(p => p.id === playerId);
    if (!player || player.pieces[size] <= 0) {
      return null;
    }
    
    room.board[position] = {
      player: playerId,
      symbol: player.symbol,
      size
    };
    
    player.pieces[size]--;
    
    const nextPlayerIndex = (room.players.findIndex(p => p.id === playerId) + 1) % room.players.length;
    room.currentTurn = room.players[nextPlayerIndex].id;
    
    this.updateRoom(room);
    return room;
  }
}

const gameManager = new GameManager();
module.exports = gameManager;
