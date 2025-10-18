class GameLogic {
  static checkWinner(board) {
    const winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      
      if (board[a] && board[b] && board[c]) {
        const cellA = board[a];
        const cellB = board[b];
        const cellC = board[c];
        
        if (cellA.player === cellB.player && cellB.player === cellC.player) {
          return cellA.player;
        }
      }
    }
    
    return null;
  }
  
  static validateMove(room, position, playerId, size) {
    if (!room) {
      return { valid: false, error: 'Room not found' };
    }
    
    if (room.status !== 'playing') {
      return { valid: false, error: 'Game is not in progress' };
    }
    
    if (room.currentTurn !== playerId) {
      return { valid: false, error: 'Not your turn' };
    }
    
    if (position < 0 || position > 8) {
      return { valid: false, error: 'Invalid position' };
    }
    
    const validSizes = ['small', 'medium', 'large'];
    if (!validSizes.includes(size)) {
      return { valid: false, error: 'Invalid piece size' };
    }
    
    const player = room.players.find(p => p.id === playerId);
    if (!player) {
      return { valid: false, error: 'Player not found in room' };
    }
    
    if (player.pieces[size] <= 0) {
      return { valid: false, error: `No ${size} pieces left` };
    }
    
    const cell = room.board[position];
    if (cell) {
      if (cell.player === playerId) {
        return { valid: false, error: 'You already have a piece in this cell' };
      }
      
      if (!this.canOverride(cell.size, size)) {
        return { valid: false, error: 'Your piece is too small to override this cell' };
      }
    }
    
    return { valid: true, error: null };
  }
  
  static canOverride(existingSize, newSize) {
    const sizeOrder = { small: 1, medium: 2, large: 3 };
    return sizeOrder[newSize] > sizeOrder[existingSize];
  }
  
  static checkDraw(board, players) {
    const totalPiecesAvailable = players.reduce((sum, player) => {
      return sum + player.pieces.small + player.pieces.medium + player.pieces.large;
    }, 0);
    
    if (totalPiecesAvailable === 0) {
      const hasAvailableMoves = board.some(cell => cell === null);
      return !hasAvailableMoves;
    }
    
    return false;
  }
}

module.exports = GameLogic;
