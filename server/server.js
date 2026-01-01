const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

// Données du plateau (exemple à compléter avec ton boardData)
const boardData = [
  { pos: 0, type: 'corner', name: 'DÉPART', price: 0, owner: null },
  { pos: 1, type: 'property', name: 'AAVE', price: 60, owner: null, rent: [6, 30, 90, 160, 240, 320] },
  { pos: 2, type: 'special', name: 'BULL MARKET' },
  { pos: 3, type: 'property', name: 'UNISWAP', price: 60, owner: null, rent: [6, 30, 90, 160, 240, 320] },
  // Ajoute ici le reste de ton boardData (40 cases au total)
];

const games = {};

io.on('connection', (socket) => {
  console.log(`Nouveau joueur connecté : ${socket.id}`);

  // Créer une partie
  socket.on('createGame', (playerName) => {
    const gameId = Math.random().toString(36).substring(2, 8);
    games[gameId] = {
      players: [{ id: socket.id, name: playerName, properties: [] }],
      currentPlayerIndex: 0,
      board: [...boardData],
      log: []
    };
    socket.join(gameId);
    socket.emit('gameCreated', { gameId, playerName });
  });

  // Rejoindre une partie
  socket.on('joinGame', ({ gameId, playerName }) => {
    if (games[gameId]) {
      games[gameId].players.push({ id: socket.id, name: playerName, properties: [] });
      socket.join(gameId);
      io.to(gameId).emit('playerJoined', games[gameId].players);
      io.to(gameId).emit('updateGameState', games[gameId]);
    }
  });

  // Lancer les dés
  socket.on('rollDice', (gameId) => {
    const game = games[gameId];
    if (!game) return;

    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const total = dice1 + dice2;
    const currentPlayer = game.players[game.currentPlayerIndex];

    // Mettre à jour la position du joueur (simplifié)
    io.to(gameId).emit('diceRolled', { dice1, dice2, playerName: currentPlayer.name, total });

    // Passer au joueur suivant
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    io.to(gameId).emit('playerTurn', { playerIndex: game.currentPlayerIndex });
  });

  // Acheter une propriété
  socket.on('buyProperty', ({ gameId, playerName, propertyPos }) => {
    const game = games[gameId];
    if (!game || game.board[propertyPos].owner) return;

    const player = game.players.find(p => p.name === playerName);
    if (!player) return;

    game.board[propertyPos].owner = playerName;
    player.properties.push(propertyPos);
    io.to(gameId).emit('propertyBought', { propertyPos, playerName });
    io.to(gameId).emit('updateGameState', game);
  });

  // Chat
  socket.on('sendMessage', ({ gameId, message, playerName }) => {
    io.to(gameId).emit('newMessage', { playerName, message });
  });

  // Déconnexion
  socket.on('disconnect', () => {
    console.log(`Joueur déconnecté : ${socket.id}`);
  });
});

// Écouter sur le port fourni par Render
const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Serveur démarré sur le port ${port}`));
