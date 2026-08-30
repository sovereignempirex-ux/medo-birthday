const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const Database = require('better-sqlite3');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// ==================== SQLITE DATABASE ====================
const db = new Database(path.join(__dirname, 'medo_birthday.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT NOT NULL,
    text TEXT NOT NULL,
    room TEXT DEFAULT 'general',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT NOT NULL,
    game TEXT NOT NULL,
    score INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS game_rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT UNIQUE NOT NULL,
    game_type TEXT NOT NULL,
    players TEXT DEFAULT '[]',
    board TEXT DEFAULT '[]',
    current_turn TEXT DEFAULT '',
    status TEXT DEFAULT 'waiting',
    winner TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log('✅ SQLite Database Connected');

// ==================== AUTH MIDDLEWARE ====================
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ==================== AUTH ROUTES ====================
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existing) return res.status(400).json({ error: 'Email exists' });

    const hashed = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)').run(email, hashed, name);
    const user = { id: result.lastInsertRowid, email, name };
    const token = jwt.sign(user, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(400).json({ error: 'User not found' });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, email, name: user.name }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, email, name, avatar FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

// ==================== CHAT ROUTES ====================
app.get('/api/chat/messages', (req, res) => {
  try {
    const messages = db.prepare('SELECT * FROM messages ORDER BY created_at DESC LIMIT 100').all();
    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chat/messages', authMiddleware, (req, res) => {
  try {
    const { text, room = 'general' } = req.body;
    const result = db.prepare('INSERT INTO messages (sender, text, room) VALUES (?, ?, ?)').run(req.user.name || req.user.email, text, room);
    const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);
    io.emit('new_message', message);
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== SCORES / LEADERBOARD ====================
app.get('/api/scores', (req, res) => {
  try {
    const scores = db.prepare('SELECT * FROM scores ORDER BY score DESC LIMIT 50').all();
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/scores', authMiddleware, (req, res) => {
  try {
    const { game, score } = req.body;
    const result = db.prepare('INSERT INTO scores (player_name, game, score) VALUES (?, ?, ?)').run(req.user.name || req.user.email, game, score);
    const newScore = db.prepare('SELECT * FROM scores WHERE id = ?').get(result.lastInsertRowid);
    res.json(newScore);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== GAME ROOMS ====================
app.get('/api/games/rooms', (req, res) => {
  try {
    const rooms = db.prepare("SELECT * FROM game_rooms WHERE status IN ('waiting', 'playing')").all();
    res.json(rooms.map(r => ({ ...r, players: JSON.parse(r.players), board: JSON.parse(r.board) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/games/rooms', authMiddleware, (req, res) => {
  try {
    const { gameType, roomId } = req.body;
    const players = JSON.stringify([{ socketId: '', name: req.user.name, symbol: gameType === 'tictactoe' ? 'X' : 'white' }]);
    const board = JSON.stringify(gameType === 'tictactoe' ? Array(9).fill(null) : []);
    db.prepare('INSERT INTO game_rooms (room_id, game_type, players, board) VALUES (?, ?, ?, ?)').run(roomId, gameType, players, board);
    const room = db.prepare('SELECT * FROM game_rooms WHERE room_id = ?').get(roomId);
    res.json({ ...room, players: JSON.parse(room.players), board: JSON.parse(room.board) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== SOCKET.IO ====================
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  socket.on('join_chat', (userData) => {
    activeUsers.set(socket.id, userData);
    socket.broadcast.emit('user_joined', { ...userData, id: socket.id });
    io.emit('active_users', Array.from(activeUsers.values()));
  });

  socket.on('send_message', (data) => {
    try {
      const result = db.prepare('INSERT INTO messages (sender, text, room) VALUES (?, ?, ?)').run(data.sender, data.text, data.room || 'general');
      const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);
      io.emit('new_message', message);
    } catch (err) {
      console.error('Message error:', err);
    }
  });

  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', data);
  });

  socket.on('stop_typing', (data) => {
    socket.broadcast.emit('stop_typing', data);
  });

  // Tic Tac Toe
  socket.on('join_tictactoe', ({ roomId, playerName }) => {
    socket.join(roomId);
    let room = db.prepare('SELECT * FROM game_rooms WHERE room_id = ? AND game_type = ?').get(roomId, 'tictactoe');
    if (!room) {
      const players = JSON.stringify([{ socketId: socket.id, name: playerName, symbol: 'X' }]);
      const board = JSON.stringify(Array(9).fill(null));
      db.prepare('INSERT INTO game_rooms (room_id, game_type, players, board, current_turn, status) VALUES (?, ?, ?, ?, ?, ?)')
        .run(roomId, 'tictactoe', players, board, 'X', 'waiting');
      room = db.prepare('SELECT * FROM game_rooms WHERE room_id = ?').get(roomId);
      socket.emit('tictactoe_state', { ...room, players: JSON.parse(room.players), board: JSON.parse(room.board) });
    } else {
      const players = JSON.parse(room.players);
      if (players.length < 2) {
        players.push({ socketId: socket.id, name: playerName, symbol: 'O' });
        db.prepare('UPDATE game_rooms SET players = ?, status = ? WHERE room_id = ?').run(JSON.stringify(players), 'playing', roomId);
        room = db.prepare('SELECT * FROM game_rooms WHERE room_id = ?').get(roomId);
        io.to(roomId).emit('tictactoe_state', { ...room, players: JSON.parse(room.players), board: JSON.parse(room.board) });
      } else {
        socket.emit('room_full');
        return;
      }
    }
    socket.roomId = roomId;
  });

  socket.on('tictactoe_move', ({ roomId, index, symbol }) => {
    const room = db.prepare('SELECT * FROM game_rooms WHERE room_id = ?').get(roomId);
    if (!room || room.status !== 'playing') return;

    const board = JSON.parse(room.board);
    if (board[index] !== null) return;

    board[index] = symbol;
    const currentTurn = symbol === 'X' ? 'O' : 'X';

    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    let winner = null;
    for (const [a,b,c] of wins) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        winner = board[a];
        break;
      }
    }

    let status = 'playing';
    let winnerStr = null;
    if (winner) {
      status = 'finished';
      winnerStr = winner;
    } else if (board.every(c => c !== null)) {
      status = 'finished';
      winnerStr = 'draw';
    }

    db.prepare('UPDATE game_rooms SET board = ?, current_turn = ?, status = ?, winner = ? WHERE room_id = ?')
      .run(JSON.stringify(board), currentTurn, status, winnerStr, roomId);

    const updated = db.prepare('SELECT * FROM game_rooms WHERE room_id = ?').get(roomId);
    io.to(roomId).emit('tictactoe_state', { ...updated, players: JSON.parse(updated.players), board: JSON.parse(updated.board) });
  });

  socket.on('tictactoe_reset', ({ roomId }) => {
    const room = db.prepare('SELECT * FROM game_rooms WHERE room_id = ?').get(roomId);
    if (room) {
      db.prepare('UPDATE game_rooms SET board = ?, current_turn = ?, status = ?, winner = ? WHERE room_id = ?')
        .run(JSON.stringify(Array(9).fill(null)), 'X', 'playing', null, roomId);
      const updated = db.prepare('SELECT * FROM game_rooms WHERE room_id = ?').get(roomId);
      io.to(roomId).emit('tictactoe_state', { ...updated, players: JSON.parse(updated.players), board: JSON.parse(updated.board) });
    }
  });

  // Chess
  socket.on('join_chess', ({ roomId, playerName }) => {
    socket.join(roomId);
    let room = db.prepare('SELECT * FROM game_rooms WHERE room_id = ? AND game_type = ?').get(roomId, 'chess');
    if (!room) {
      const initialBoard = [];
      for (let r = 0; r < 8; r++) {
        const row = [];
        for (let c = 0; c < 8; c++) row.push(null);
        initialBoard.push(row);
      }
      const pieces = ['♜','♞','♝','♛','♚','♝','♞','♜'];
      const pawns = ['♟','♟','♟','♟','♟','♟','♟','♟'];
      const whitePieces = ['♖','♘','♗','♕','♔','♗','♘','♖'];
      const whitePawns = ['♙','♙','♙','♙','♙','♙','♙','♙'];
      for (let c = 0; c < 8; c++) {
        initialBoard[0][c] = pieces[c];
        initialBoard[1][c] = pawns[c];
        initialBoard[6][c] = whitePawns[c];
        initialBoard[7][c] = whitePieces[c];
      }
      const players = JSON.stringify([{ socketId: socket.id, name: playerName, symbol: 'white' }]);
      db.prepare('INSERT INTO game_rooms (room_id, game_type, players, board, current_turn, status) VALUES (?, ?, ?, ?, ?, ?)')
        .run(roomId, 'chess', players, JSON.stringify(initialBoard), 'white', 'waiting');
      room = db.prepare('SELECT * FROM game_rooms WHERE room_id = ?').get(roomId);
      socket.emit('chess_state', { ...room, players: JSON.parse(room.players), board: JSON.parse(room.board) });
    } else {
      const players = JSON.parse(room.players);
      if (players.length < 2) {
        players.push({ socketId: socket.id, name: playerName, symbol: 'black' });
        db.prepare('UPDATE game_rooms SET players = ?, status = ? WHERE room_id = ?').run(JSON.stringify(players), 'playing', roomId);
        room = db.prepare('SELECT * FROM game_rooms WHERE room_id = ?').get(roomId);
        io.to(roomId).emit('chess_state', { ...room, players: JSON.parse(room.players), board: JSON.parse(room.board) });
      } else {
        socket.emit('room_full');
        return;
      }
    }
    socket.roomId = roomId;
  });

  socket.on('chess_move', ({ roomId, from, to }) => {
    const room = db.prepare('SELECT * FROM game_rooms WHERE room_id = ?').get(roomId);
    if (!room || room.status !== 'playing') return;

    const board = JSON.parse(room.board);
    const piece = board[from.row][from.col];
    if (!piece) return;

    board[to.row][to.col] = piece;
    board[from.row][from.col] = null;
    const currentTurn = room.current_turn === 'white' ? 'black' : 'white';

    db.prepare('UPDATE game_rooms SET board = ?, current_turn = ? WHERE room_id = ?')
      .run(JSON.stringify(board), currentTurn, roomId);

    const updated = db.prepare('SELECT * FROM game_rooms WHERE room_id = ?').get(roomId);
    io.to(roomId).emit('chess_state', { ...updated, players: JSON.parse(updated.players), board: JSON.parse(updated.board) });
  });

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
    activeUsers.delete(socket.id);
    io.emit('active_users', Array.from(activeUsers.values()));

    if (socket.roomId) {
      const room = db.prepare('SELECT * FROM game_rooms WHERE room_id = ?').get(socket.roomId);
      if (room) {
        const players = JSON.parse(room.players).filter(p => p.socketId !== socket.id);
        if (players.length === 0) {
          db.prepare('DELETE FROM game_rooms WHERE room_id = ?').run(socket.roomId);
        } else {
          db.prepare('UPDATE game_rooms SET players = ?, status = ? WHERE room_id = ?')
            .run(JSON.stringify(players), 'waiting', socket.roomId);
          const updated = db.prepare('SELECT * FROM game_rooms WHERE room_id = ?').get(socket.roomId);
          io.to(socket.roomId).emit('tictactoe_state', { ...updated, players: JSON.parse(updated.players), board: JSON.parse(updated.board) });
        }
      }
    }
  });
});



// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== SERVE STATIC FILES (Production) ====================
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// ==================== START SERVER ====================
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🚀 Medo Birthday Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready for real-time connections`);
  console.log(`💾 SQLite Database: ${path.join(__dirname, 'medo_birthday.db')}`);
});
