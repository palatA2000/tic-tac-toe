const { v4: uuidv4 } = require('uuid');

const utils = {
  generateRoomId: () => {
    return uuidv4().substring(0, 6).toUpperCase();
  },
  
  formatTime: (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  },
  
  isRoomExpired: (createdAt, maxAge = 24 * 60 * 60 * 1000) => {
    return Date.now() - createdAt > maxAge;
  },
  
  sanitizePlayerName: (name) => {
    return name.trim().substring(0, 20).replace(/[<>]/g, '');
  },
  
  getTotalPieces: (player) => {
    return player.pieces.small + player.pieces.medium + player.pieces.large;
  },
  
  getPieceDisplay: (size) => {
    const sizeMap = {
      small: 'S',
      medium: 'M', 
      large: 'L'
    };
    return sizeMap[size] || size;
  },
  
  validateRoomId: (roomId) => {
    return typeof roomId === 'string' && roomId.length === 6 && /^[A-Z0-9]+$/.test(roomId);
  }
};

module.exports = utils;
