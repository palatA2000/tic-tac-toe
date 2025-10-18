const { v4: uuidv4 } = require('uuid');

// Utility functions for the game
const utils = {
  generateRoomId: () => {
    return uuidv4().substring(0, 8).toUpperCase();
  },
  
  formatTime: (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  }
};

module.exports = utils;
