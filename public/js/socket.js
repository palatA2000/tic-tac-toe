// Socket connection handler - Phase 3 implementation
class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.callbacks = {};
  }

  connect() {
    this.socket = io();
    this.isConnected = true;
    
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });
    
    this.socket.on('room-created', (data) => {
      if (this.callbacks.onRoomCreated) {
        this.callbacks.onRoomCreated(data);
      }
    });
    
    this.socket.on('player-joined', (data) => {
      if (this.callbacks.onPlayerJoined) {
        this.callbacks.onPlayerJoined(data);
      }
    });
    
    this.socket.on('game-start', (data) => {
      if (this.callbacks.onGameStart) {
        this.callbacks.onGameStart(data);
      }
    });
    
    this.socket.on('move-made', (data) => {
      if (this.callbacks.onMoveMade) {
        this.callbacks.onMoveMade(data);
      }
    });
    
    this.socket.on('game-over', (data) => {
      if (this.callbacks.onGameOver) {
        this.callbacks.onGameOver(data);
      }
    });
    
    this.socket.on('player-left', (data) => {
      if (this.callbacks.onPlayerLeft) {
        this.callbacks.onPlayerLeft(data);
      }
    });
    
    this.socket.on('error', (data) => {
      console.error('Socket error:', data.message);
      if (this.callbacks.onError) {
        this.callbacks.onError(data);
      }
    });

    this.socket.on('chat-message', (data) => {
      if (this.callbacks.onChatMessage) {
        this.callbacks.onChatMessage(data);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  createRoom() {
    if (this.socket && this.isConnected) {
      this.socket.emit('create-room');
    }
  }

  joinRoom(roomId, playerName = 'Player') {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-room', { roomId, playerName });
    }
  }

  makeMove(roomId, position, size) {
    if (this.socket && this.isConnected) {
      this.socket.emit('make-move', { roomId, position, size });
    }
  }

  sendChatMessage(roomId, message) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send-chat-message', { roomId, message });
    }
  }

  setCallbacks(callbacks) {
    this.callbacks = callbacks;
  }
}

// Global socket manager instance
const socketManager = new SocketManager();
