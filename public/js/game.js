// Game UI logic - Phase 3 implementation
class GameUI {
  constructor() {
    this.currentRoom = null;
    this.playerId = null;
    this.playerSymbol = null;
    this.isMyTurn = false;
    this.selectedPieceSize = 'small';
    this.pieces = { small: 3, medium: 3, large: 3 };
    
    // Initialize socket manager
    this.initializeSocket();
  }

  initializeSocket() {
    // Set up socket callbacks
    socketManager.setCallbacks({
      onRoomCreated: (data) => {
        this.handleRoomCreated(data);
      },
      onPlayerJoined: (data) => {
        this.handlePlayerJoined(data);
      },
      onGameStart: (data) => {
        this.handleGameStart(data);
      },
      onMoveMade: (data) => {
        this.handleMoveMade(data);
      },
      onGameOver: (data) => {
        this.handleGameOver(data);
      },
      onPlayerLeft: (data) => {
        this.handlePlayerLeft(data);
      },
      onError: (data) => {
        this.showError(data.message);
      },
      onChatMessage: (data) => {
        this.handleChatMessage(data);
      }
    });

    // Connect to socket
    socketManager.connect();
  }

  handleRoomCreated(data) {
    this.currentRoom = data.roomId;
    
    // Find which player I am (creator is first player)
    const myPlayer = data.room.players.find(p => p.id === socketManager.socket.id);
    this.playerId = myPlayer.id;
    this.playerSymbol = myPlayer.symbol;
    this.pieces = { ...myPlayer.pieces };
    
    this.showRoomInfo(data.roomId);
  }

  handlePlayerJoined(data) {
    this.currentRoom = data.room.roomId;
    
    // Find which player I am
    const myPlayer = data.room.players.find(p => p.id === socketManager.socket.id);
    if (myPlayer) {
      this.playerId = myPlayer.id;
      this.playerSymbol = myPlayer.symbol;
      this.pieces = { ...myPlayer.pieces };
    }
    
    // Update waiting message to show player count
    const waitingMsg = document.getElementById('waiting-message');
    if (waitingMsg) {
      waitingMsg.textContent = `Players: ${data.room.players.length}/2`;
    }
  }

  handleGameStart(data) {
    // Switch from lobby to game view
    this.showGameSection();
    this.initializeGame(data.room);
  }

  handleMoveMade(data) {
    // Update board with new move
    if (typeof boardRenderer !== 'undefined') {
      boardRenderer.renderBoard(data.room.board);
      
      // Animate the move
      boardRenderer.animateMove(data.move.position, data.move.player, data.move.size);
    }
    
    // Update game state
    this.updateGameState(data.room);
    
    // Update piece counts
    this.updatePieceCounts(data.room);
    
    // Show valid moves if it's my turn
    if (this.isMyTurn && typeof boardRenderer !== 'undefined') {
      boardRenderer.showValidMoves(this.pieces);
    }
  }

  handleGameOver(data) {
    const statusEl = document.getElementById('game-status');
    if (data.isDraw) {
      statusEl.textContent = 'Game ended in a draw!';
      statusEl.className = 'status-message';
    } else {
      // Highlight winning combination
      const winnerPlayer = data.winner;
      const winningCells = this.getWinningCells(data.room);
      if (winningCells.length > 0 && typeof boardRenderer !== 'undefined') {
        boardRenderer.highlightWinner(winningCells);
      }
      
      const winnerMessage = winnerPlayer.symbol === this.playerSymbol ? 'You win!' : `${winnerPlayer.name} wins!`;
      statusEl.textContent = winnerMessage;
      statusEl.className = winnerPlayer.symbol === this.playerSymbol ? 'status-message success' : 'status-message error';
    }
    
    // Disable board
    this.disableBoard();
  }

  getWinningCells(room) {
    // This would need to be implemented by checking the board state
    // For now, we'll return an empty array
    return [];
  }

  handlePlayerLeft(data) {
    const statusEl = document.getElementById('game-status');
    statusEl.textContent = 'Opponent disconnected. Game ended.';
    statusEl.className = 'status-message error';
    this.disableBoard();
  }

  initializeGame(roomData) {
    this.currentRoom = roomData.roomId;
    
    // Find my player data
    const myPlayer = roomData.players.find(p => p.id === socketManager.socket.id);
    this.playerId = myPlayer.id;
    this.playerSymbol = myPlayer.symbol;
    this.pieces = { ...myPlayer.pieces };
    
    // Update UI elements
    document.getElementById('game-room-code').textContent = this.currentRoom;
    document.getElementById('player-symbol').textContent = this.playerSymbol;
    
    // Check if it's my turn
    this.isMyTurn = roomData.currentTurn === this.playerId;
    this.updateTurnIndicator();
    
    // Initialize piece counts
    this.updatePieceCounts(roomData);
    
    // Render initial board
    if (typeof boardRenderer !== 'undefined') {
      boardRenderer.renderBoard(roomData.board);
    }
    
    // Enable/disable board based on turn
    if (this.isMyTurn) {
      this.enableBoard();
      if (typeof boardRenderer !== 'undefined') {
        boardRenderer.showValidMoves(this.pieces);
      }
    } else {
      this.disableBoard();
    }
    
    // Set default selected piece size
    this.updatePieceButtons();
  }

  updateGameState(room) {
    this.isMyTurn = room.currentTurn === this.playerId;
    this.updateTurnIndicator();
    
    // Update piece counts
    this.updatePieceCounts(room);
    
    // Enable/disable board based on turn
    if (this.isMyTurn) {
      this.enableBoard();
      if (typeof boardRenderer !== 'undefined') {
        boardRenderer.showValidMoves(this.pieces);
      }
    } else {
      this.disableBoard();
      // Clear valid move indicators
      const cells = document.querySelectorAll('.cell');
      cells.forEach(cell => {
        cell.classList.remove('invalid', 'can-override');
      });
    }
  }

  updateTurnIndicator() {
    const indicator = document.getElementById('turn-indicator');
    if (this.isMyTurn) {
      indicator.textContent = 'Your turn!';
      indicator.style.color = '#27ae60';
    } else {
      indicator.textContent = 'Opponent\'s turn...';
      indicator.style.color = '#e74c3c';
    }
  }

  updatePieceCounts(room) {
    // Find my player to get current piece counts
    const myPlayer = room.players.find(p => p.id === this.playerId);
    if (myPlayer) {
      this.pieces = { ...myPlayer.pieces };
      
      // Update button display with visual size differences
      const buttons = document.querySelectorAll('.piece-btn');
      const fontSizes = { small: '18px', medium: '28px', large: '38px' };
      
      buttons.forEach(btn => {
        const size = btn.dataset.size;
        btn.innerHTML = '';
        
        const symbolSpan = document.createElement('span');
        symbolSpan.textContent = this.playerSymbol;
        symbolSpan.style.fontSize = fontSizes[size];
        symbolSpan.style.fontWeight = 'bold';
        symbolSpan.style.marginRight = '8px';
        
        const countSpan = document.createElement('span');
        countSpan.textContent = `(${this.pieces[size]})`;
        countSpan.style.fontSize = '14px';
        
        btn.appendChild(symbolSpan);
        btn.appendChild(countSpan);
        
        // Disable button if no pieces left
        btn.disabled = this.pieces[size] === 0;
        if (this.pieces[size] === 0) {
          btn.style.opacity = '0.5';
          btn.style.cursor = 'not-allowed';
        } else {
          btn.style.opacity = '1';
          btn.style.cursor = 'pointer';
        }
      });
    }
  }

  createRoom() {
    socketManager.createRoom();
  }

  joinRoom(roomCode) {
    socketManager.joinRoom(roomCode.trim().toUpperCase());
  }

  showRoomInfo(roomCode) {
    const roomInfo = document.getElementById('room-info');
    const currentRoomSpan = document.getElementById('current-room');
    
    roomInfo.classList.remove('hidden');
    currentRoomSpan.textContent = roomCode;
  }

  selectPieceSize(size) {
    if (this.pieces[size] > 0) {
      this.selectedPieceSize = size;
      this.updatePieceButtons();
    }
  }

  updatePieceButtons() {
    const buttons = document.querySelectorAll('.piece-btn');
    buttons.forEach(btn => {
      btn.classList.remove('selected');
      if (btn.dataset.size === this.selectedPieceSize && this.pieces[this.selectedPieceSize] > 0) {
        btn.classList.add('selected');
      }
    });
  }

  handleCellClick(position) {
    if (!this.isMyTurn || this.pieces[this.selectedPieceSize] === 0) {
      return;
    }
    
    socketManager.makeMove(this.currentRoom, parseInt(position), this.selectedPieceSize);
  }

  enableBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
      cell.style.pointerEvents = 'auto';
      cell.style.opacity = '1';
    });
  }

  disableBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
      cell.style.pointerEvents = 'none';
      cell.style.opacity = '0.6';
    });
  }

  showError(message) {
    const statusEl = document.getElementById('game-status');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = 'status-message error';
      setTimeout(() => {
        statusEl.textContent = '';
        statusEl.className = 'status-message';
      }, 3000);
    }
  }

  showGameSection() {
    document.getElementById('lobby-section').classList.add('hidden');
    document.getElementById('game-section').classList.remove('hidden');
  }

  showLobbySection() {
    document.getElementById('lobby-section').classList.remove('hidden');
    document.getElementById('game-section').classList.add('hidden');
  }

  handleChatMessage(data) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';

    // Add 'my-message' class if this is my message
    if (data.playerId === this.playerId) {
      messageDiv.classList.add('my-message');
    } else {
      messageDiv.classList.add('opponent-message');
    }

    // Create message content
    const header = document.createElement('div');
    header.className = 'message-header';
    header.textContent = `${data.playerSymbol} - ${data.playerName}`;

    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = data.message;

    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageDiv.appendChild(header);
    messageDiv.appendChild(content);
    messageDiv.appendChild(time);

    chatMessages.appendChild(messageDiv);

    // Auto-scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  sendChatMessage() {
    const chatInput = document.getElementById('chat-input');
    if (!chatInput) return;

    const message = chatInput.value.trim();
    if (message && this.currentRoom) {
      socketManager.sendChatMessage(this.currentRoom, message);
      chatInput.value = '';
    }
  }
}

// Initialize game UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const gameUI = new GameUI();
  
  // Event listeners for lobby
  const createRoomBtn = document.getElementById('create-room');
  const joinRoomBtn = document.getElementById('join-room');
  const roomCodeInput = document.getElementById('room-code');
  
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
  
  // Piece size selection
  const pieceButtons = document.querySelectorAll('.piece-btn');
  pieceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      gameUI.selectPieceSize(btn.dataset.size);
    });
  });
  
  // Cell clicks
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
      socketManager.disconnect();
      window.location.reload();
    });
  }

  // Chat functionality
  const sendChatBtn = document.getElementById('send-chat-btn');
  const chatInput = document.getElementById('chat-input');

  if (sendChatBtn) {
    sendChatBtn.addEventListener('click', () => {
      gameUI.sendChatMessage();
    });
  }

  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        gameUI.sendChatMessage();
      }
    });
  }
});
