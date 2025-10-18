// Board rendering and management - Phase 3 implementation
class BoardRenderer {
  constructor() {
    this.boardState = Array(9).fill(null);
    this.winningCells = [];
  }

  renderBoard(boardData) {
    this.boardState = boardData;
    
    // Clear all cells first
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
      cell.innerHTML = '';
      cell.classList.remove('winner');
    });
    
    // Render each cell
    boardData.forEach((cellData, index) => {
      this.renderCell(index, cellData);
    });
  }

  renderCell(cellIndex, cellData) {
    const cell = document.querySelector(`.cell[data-position="${cellIndex}"]`);
    if (cell) {
      cell.innerHTML = '';
      
      if (cellData && cellData.mark) {
        const piece = document.createElement('div');
        piece.className = `piece ${cellData.mark.size} ${cellData.mark.symbol}`;
        piece.textContent = cellData.mark.symbol;
        
        // Apply size-specific styling
        const sizes = {
          small: '24px',
          medium: '36px',
          large: '48px'
        };
        piece.style.fontSize = sizes[cellData.mark.size];
        piece.style.fontWeight = 'bold';
        
        // Apply player-specific colors
        if (cellData.mark.symbol === 'X') {
          piece.style.color = '#e74c3c';
        } else {
          piece.style.color = '#3498db';
        }
        
        // Add size-specific border for better visibility
        const borderStyles = {
          small: '2px solid',
          medium: '3px solid',
          large: '4px solid'
        };
        
        if (cellData.mark.symbol === 'X') {
          piece.style.border = borderStyles[cellData.mark.size];
          piece.style.borderColor = '#c0392b';
          piece.style.borderRadius = '5px';
          piece.style.padding = '5px';
        } else {
          piece.style.border = borderStyles[cellData.mark.size];
          piece.style.borderColor = '#2980b9';
          piece.style.borderRadius = '50%';
          piece.style.padding = '5px';
        }
        
        cell.appendChild(piece);
        
        // Add hover effect for occupied cells
        cell.style.cursor = 'default';
        cell.title = `${cellData.mark.symbol} (${cellData.mark.size})`;
      }
    }
  }

  highlightWinner(winningCells) {
    this.winningCells = winningCells;
    
    // Add winner highlighting
    winningCells.forEach(index => {
      const cell = document.querySelector(`.cell[data-position="${index}"]`);
      if (cell) {
        cell.classList.add('winner');
        // Add a glowing animation
        cell.style.animation = 'winnerGlow 1s infinite alternate';
      }
    });
  }

  resetBoard() {
    this.boardState = Array(9).fill(null);
    this.winningCells = [];
    
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
      cell.innerHTML = '';
      cell.classList.remove('winner', 'occupied');
      cell.style.animation = '';
      cell.style.cursor = 'pointer';
      cell.title = '';
    });
  }

  showValidMoves(playerPieces) {
    const cells = document.querySelectorAll('.cell');
    
    cells.forEach((cell, index) => {
      const cellData = this.boardState[index];
      
      if (!cellData || !cellData.mark) {
        // Empty cell - check if player can place any piece
        cell.style.cursor = 'pointer';
        cell.classList.remove('invalid');
      } else {
        // Cell is occupied - check if larger piece can override
        const existingPiece = cellData.mark;
        const canPlaceSmall = playerPieces.small > 0 && this.canOverride(existingPiece.size, 'small');
        const canPlaceMedium = playerPieces.medium > 0 && this.canOverride(existingPiece.size, 'medium');
        const canPlaceLarge = playerPieces.large > 0 && this.canOverride(existingPiece.size, 'large');
        
        if (canPlaceSmall || canPlaceMedium || canPlaceLarge) {
          // Player can override this cell with a larger piece
          if (existingPiece.symbol) {
            cell.classList.add('can-override');
            cell.style.cursor = 'pointer';
          }
        } else {
          // Cannot override this cell
          cell.classList.add('invalid');
          cell.style.cursor = 'not-allowed';
        }
      }
    });
  }

  canOverride(existingSize, newSize) {
    const sizeOrder = { small: 1, medium: 2, large: 3 };
    return sizeOrder[newSize] > sizeOrder[existingSize];
  }

  animateMove(position, symbol, size) {
    const cell = document.querySelector(`.cell[data-position="${position}"]`);
    if (cell) {
      // Add a brief highlight animation
      cell.style.animation = 'placeAnimation 0.3s ease-out';
      
      setTimeout(() => {
        cell.style.animation = '';
      }, 300);
    }
  }
}

// Global board renderer instance
const boardRenderer = new BoardRenderer();
