# Tic-Tac-Toe

A real-time multiplayer tic-tac-toe game built with Node.js, Express, and Socket.IO.

## Features

- **Multiplayer**: Play with friends in real-time
- **Room System**: Create or join rooms with unique codes
- **Real-time Updates**: Live game state updates using WebSockets
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: HTML, CSS, JavaScript
- **Real-time Communication**: WebSockets via Socket.IO

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Usage

Start the development server:
```bash
npm run dev
```

Or start the production server:
```bash
npm start
```

Open your browser and navigate to `http://localhost:3000`

## How to Play

1. Create a new room or join an existing one
2. Share the room code with your friend
3. Take turns placing X's and O's on the grid
4. First player to get 3 in a row wins!

## API Endpoints

- `GET /` - Main game interface
- `GET /game` - Game page
- Socket.IO events for real-time gameplay

## Socket.IO Events

- `create-room` - Create a new game room
- `join-room` - Join an existing room
- `make-move` - Make a move on the game board
- `room-created` - Room created successfully
- `player-joined` - Player joined the room
- `game-start` - Game begins
- `move-made` - Move executed
- `game-over` - Game finished
- `player-left` - Player disconnected

## License

ISC
