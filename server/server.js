const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

const games = {};

io.on('connection', (socket) => {
  console.log(`Nouveau joueur : ${socket.id}`);

  socket.on('createGame', (playerName) => {
    const gameId = Math.random().toString(36).substring(2, 8);
    games[gameId] = {
      players: [{ id: socket.id, name: playerName }],
      currentPlayerIndex: 0,
      board: Array(40).fill(null), // À remplacer par ton boardData
      log: []
    };
    socket.join(gameId);
    socket.emit('gameCreated', { gameId, playerName });
  });

  socket.on('joinGame', ({ gameId, playerName }) => {
    if (games[gameId]) {
      games[gameId].players.push({ id: socket.id, name: playerName });
      socket.join(gameId);
      io.to(gameId).emit('playerJoined', games[gameId].players);
    }
  });

  socket.on('rollDice', (gameId) => {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    io.to(gameId).emit('diceRolled', { dice1, dice2 });
  });

  socket.on('sendMessage', ({ gameId, message, playerName }) => {
    io.to(gameId).emit('newMessage', { playerName, message });
  });
});

server.listen(3000, () => console.log('Serveur démarré sur le port 3000'));
