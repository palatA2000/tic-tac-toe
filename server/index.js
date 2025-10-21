const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const gameManager = require("./gameManager");
const gameLogic = require("./gameLogic");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("create-room", () => {
    const roomId = uuidv4().substring(0, 6).toUpperCase();
    gameManager.createRoom(roomId);
    
    // Automatically join the creator to the room
    const result = gameManager.joinRoom(roomId, {
      id: socket.id,
      name: 'Player',
    });
    
    if (result.success) {
      socket.join(roomId);
      socket.emit("room-created", { roomId, room: result.room });
      console.log(`Room ${roomId} created and joined by ${socket.id}`);
    }
  });

  socket.on("join-room", (data) => {
    const { roomId, playerName } = data;
    const result = gameManager.joinRoom(roomId, {
      id: socket.id,
      name: playerName,
    });

    if (result.success) {
      socket.join(roomId);
      socket.emit("player-joined", { room: result.room });
      socket.to(roomId).emit("player-joined", { room: result.room });

      if (result.room.status === "playing") {
        io.to(roomId).emit("game-start", { room: result.room });
      }
    } else {
      socket.emit("error", { message: result.error });
    }
  });

  socket.on("make-move", (data) => {
    const { roomId, position, size } = data;
    const result = gameLogic.validateMove(
      gameManager.getRoomById(roomId),
      position,
      socket.id,
      size
    );

    if (result.valid) {
      const room = gameManager.makeMove(roomId, socket.id, position, size);

      if (room) {
        io.to(roomId).emit("move-made", {
          room,
          move: { player: socket.id, position, size },
        });

        const winner = gameLogic.checkWinner(room.board);
        const isDraw = gameLogic.checkDraw(room.board, room.players);

        if (winner || isDraw) {
          room.status = "finished";
          room.winner = winner;
          gameManager.updateRoom(room);

          io.to(roomId).emit("game-over", {
            winner: winner ? room.players.find((p) => p.id === winner) : null,
            isDraw,
          });
        }
      }
    } else {
      socket.emit("error", { message: result.error });
    }
  });

  socket.on("send-chat-message", (data) => {
    const { roomId, message } = data;
    const room = gameManager.getRoomById(roomId);

    if (room) {
      const player = room.players.find((p) => p.id === socket.id);

      if (player) {
        io.to(roomId).emit("chat-message", {
          playerId: socket.id,
          playerName: player.name,
          playerSymbol: player.symbol,
          message: message,
          timestamp: Date.now(),
        });
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    const roomIds = Object.keys(gameManager.getAllRooms());
    for (const roomId of roomIds) {
      const room = gameManager.getRoomById(roomId);
      if (room && room.players.some((p) => p.id === socket.id)) {
        gameManager.leaveRoom(roomId, socket.id);

        if (room.players.length === 0) {
          gameManager.deleteRoom(roomId);
        } else {
          socket.to(roomId).emit("player-left", { playerId: socket.id });
        }
        break;
      }
    }
  });
});
