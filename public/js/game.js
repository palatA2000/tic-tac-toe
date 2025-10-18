// Game UI logic - will be expanded in Phase 2-3
class GameUI {
  constructor() {
    this.currentRoom = null;
    this.playerSymbol = null;
    this.isMyTurn = false;
    this.selectedPieceSize = 'small';
  }

  initialize(roomData) {
    console.log('Initialize game - Phase 1 placeholder', roomData);
  }

  createRoom() {
    console.log('Creating room - Phase 1 placeholder');
    const roomCode = this.generateRoomCode();
    this.showRoomInfo(roomCode);
  }

  joinRoom(roomCode) {
    console.log('Joining room - Phase 1 placeholder', roomCode);
    // TODO: Validate room code and join in Phase 2
  }

  showRoomInfo(roomCode) {
    const roomInfo = document.getElementById('room-info');
    const currentRoomSpan = document.getElementById('current-room');
    
    roomInfo.classList.remove('hidden');
    currentRoomSpan.textContent = roomCode;
  }

  selectPieceSize(size) {
    console.log('Select piece size - Phase 1 placeholder', size);
    this.selectedPieceSize = size;
    this.updatePieceButtons();
  }

  updatePieceButtons() {
    const buttons = document.querySelectorAll('.piece-btn');
    buttons.forEach(btn => {
      btn.classList.remove('selected');
      if (btn.dataset.size === this.selectedPieceSize) {
        btn.classList.add('selected');
      }
    });
  }

  handleCellClick(position) {
    console.log('Cell clicked - Phase 1 placeholder', position);
    // TODO: Send move to server in Phase 2
  }

  generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}

// Initialize game UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const gameUI = new GameUI();
  
  // Event listeners for Phase 1 testing
  const createRoomBtn = document.getElementById('create-room');
  const joinRoomBtn = document.getElementById('join-room');
  const roomCodeInput = document.getElementById('room-code');
  const startGameBtn = document.getElementById('start-game');
  
  if (createRoomBtn) {
    createRoomBtn.addEventListener('click', () => {
      gameUI.createRoom();
    });
  }
  
  if (joinRoomBtn) {
    joinRoomBtn.addEventListener('click', () => {
      const roomCode = roomCodeInput.value.trim();
      if (roomCode) {
        gameUI.joinRoom(roomCode);
      } else {
        alert('Please enter a room code');
      }
    });
  }
  
  if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
      console.log('Start game - Phase 1 placeholder');
      // TODO: Navigate to game page in Phase 2
      window.location.href = '/game.html';
    });
  }
  
  // Piece size selection on game page
  const pieceButtons = document.querySelectorAll('.piece-btn');
  pieceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      gameUI.selectPieceSize(btn.dataset.size);
    });
  });
  
  // Cell clicks on game page
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    cell.addEventListener('click', () => {
      gameUI.handleCellClick(cell.dataset.position);
    });
  });
  
  // Leave game button
  const leaveGameBtn = document.getElementById('leave-game');
  if (leaveGameBtn) {
    leaveGameBtn.addEventListener('click', () => {
      console.log('Leave game - Phase 1 placeholder');
      window.location.href = '/';
    });
  }
});
