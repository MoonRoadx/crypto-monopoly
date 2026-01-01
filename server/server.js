const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

// Données complètes du plateau (40 cases)
const boardData = [
  // Première rangée (bas du plateau)
  { pos: 0, type: 'corner', name: 'DÉPART', text: 'Recevez 200 USDT', price: 0, owner: null },
  { pos: 1, type: 'property', name: 'AAVE', price: 60, rent: [6, 30, 90, 160, 240, 320], color: 'defi', group: 'DeFi', owner: null },
  { pos: 2, type: 'special', name: 'BULL MARKET', text: 'Avancez jusqu’au prochain échange.', owner: null },
  { pos: 3, type: 'property', name: 'UNISWAP', price: 60, rent: [6, 30, 90, 160, 240, 320], color: 'defi', group: 'DeFi', owner: null },
  { pos: 4, type: 'fee', name: 'MINING FEE', text: 'Payez 200 USDT de frais de réseau.', amount: 200, owner: null },
  { pos: 5, type: 'exchange', name: 'BINANCE', price: 200, rent: [25, 50, 100, 200], owner: null },
  { pos: 6, type: 'property', name: 'CARDANO', price: 100, rent: [10, 50, 150, 280, 400, 550], color: 'layer1', group: 'Layer 1', owner: null },
  { pos: 7, type: 'special', name: 'BEAR MARKET', text: 'Reculez de 3 cases.', owner: null },
  { pos: 8, type: 'property', name: 'SOLANA', price: 100, rent: [10, 50, 150, 280, 400, 550], color: 'layer1', group: 'Layer 1', owner: null },
  { pos: 9, type: 'property', name: 'POLKADOT', price: 120, rent: [12, 60, 180, 320, 480, 640], color: 'layer1', group: 'Layer 1', owner: null },
  { pos: 10, type: 'corner', name: 'STAKING', text: 'Repos gratuit.', owner: null },

  // Deuxième rangée (droite du plateau)
  { pos: 11, type: 'property', name: 'OPENSEA', price: 140, rent: [14, 70, 200, 380, 550, 750], color: 'nft', group: 'NFT', owner: null },
  { pos: 12, type: 'property', name: 'BLUR', price: 140, rent: [14, 70, 200, 380, 550, 750], color: 'nft', group: 'NFT', owner: null },
  { pos: 13, type: 'protocol', name: 'CHAINLINK', price: 150, text: 'Loyer : 10x le résultat du dé.', owner: null },
  { pos: 14, type: 'property', name: 'MAGIC EDEN', price: 160, rent: [16, 80, 220, 440, 600, 800], color: 'nft', group: 'NFT', owner: null },
  { pos: 15, type: 'exchange', name: 'COINBASE', price: 200, rent: [25, 50, 100, 200], owner: null },
  { pos: 16, type: 'property', name: 'ETHEREUM', price: 180, rent: [18, 90, 250, 450, 625, 750], color: 'layer1', group: 'Layer 1', owner: null },
  { pos: 17, type: 'special', name: 'RUG PULL', text: 'Perdez 100 USDT ou piochez une carte.', amount: 100, owner: null },
  { pos: 18, type: 'property', name: 'ARBITRUM', price: 180, rent: [18, 90, 250, 450, 625, 750], color: 'layer2', group: 'Layer 2', owner: null },
  { pos: 19, type: 'property', name: 'OPTIMISM', price: 200, rent: [20, 100, 300, 500, 700, 900], color: 'layer2', group: 'Layer 2', owner: null },

  // Troisième rangée (haut du plateau)
  { pos: 20, type: 'corner', name: 'LIQUIDITY POOL', text: 'Repos gratuit.', owner: null },
  { pos: 21, type: 'property', name: 'AVAX', price: 220, rent: [22, 110, 330, 550, 770, 990], color: 'layer1', group: 'Layer 1', owner: null },
  { pos: 22, type: 'special', name: 'SMART CONTRACT BUG', text: 'Payez 150 USDT.', amount: 150, owner: null },
  { pos: 23, type: 'property', name: 'COSMOS', price: 220, rent: [22, 110, 330, 550, 770, 990], color: 'layer1', group: 'Layer 1', owner: null },
  { pos: 24, type: 'property', name: 'ALGORAND', price: 240, rent: [24, 120, 360, 600, 800, 1000], color: 'layer1', group: 'Layer 1', owner: null },
  { pos: 25, type: 'exchange', name: 'KRAKEN', price: 200, rent: [25, 50, 100, 200], owner: null },
  { pos: 26, type: 'property', name: 'SAND', price: 260, rent: [26, 130, 390, 650, 870, 1100], color: 'metaverse', group: 'Metaverse', owner: null },
  { pos: 27, type: 'property', name: 'MANA', price: 260, rent: [26, 130, 390, 650, 870, 1100], color: 'metaverse', group: 'Metaverse', owner: null },
  { pos: 28, type: 'utility', name: 'IPFS', price: 150, text: 'Loyer : 4x le résultat du dé.', owner: null },
  { pos: 29, type: 'property', name: 'GALA', price: 280, rent: [28, 140, 420, 700, 950, 1200], color: 'metaverse', group: 'Metaverse', owner: null },

  // Quatrième rangée (gauche du plateau)
  { pos: 30, type: 'corner', name: 'PRISON', text: 'En prison ? Payez 50 USDT ou faites un double.', owner: null },
  { pos: 31, type: 'property', name: 'BITCOIN', price: 300, rent: [30, 150, 450, 750, 950, 1200], color: 'og', group: 'OG Crypto', owner: null },
  { pos: 32, type: 'property', name: 'LITECOIN', price: 300, rent: [30, 150, 450, 750, 950, 1200], color: 'og', group: 'OG Crypto', owner: null },
  { pos: 33, type: 'special', name: 'HALVING', text: 'Loyers doublés jusqu’à votre prochain tour.', owner: null },
  { pos: 34, type: 'property', name: 'DOGECOIN', price: 320, rent: [32, 160, 480, 800, 1000, 1200], color: 'og', group: 'OG Crypto', owner: null },
  { pos: 35, type: 'exchange', name: 'FTX', price: 100, text: 'Loyer divisé par 2.', rent: [10, 25, 50, 100], owner: null },
  { pos: 36, type: 'special', name: 'AIRDROP', text: 'Recevez 100 USDT.', amount: -100, owner: null },
  { pos: 37, type: 'property', name: 'XRP', price: 350, rent: [35, 175, 500, 875, 1100, 1300], color: 'og', group: 'OG Crypto', owner: null },
  { pos: 38, type: 'fee', name: 'TAXES', text: 'Payez 100 USDT.', amount: 100, owner: null },
  { pos: 39, type: 'property', name: 'DOT', price: 400, rent: [40, 200, 600, 1000, 1250, 1500], color: 'layer1', group: 'Layer 1', owner: null }
];

// Stockage des parties en cours
const games = {};

io.on('connection', (socket) => {
  console.log(`Nouveau joueur connecté : ${socket.id}`);

  // Créer une partie
  socket.on('createGame', (playerName) => {
    const gameId = Math.random().toString(36).substring(2, 8);
    games[gameId] = {
      players: [{ id: socket.id, name: playerName, properties: [], position: 0, cash: 1500 }],
      currentPlayerIndex: 0,
      board: JSON.parse(JSON.stringify(boardData)), // Copie profonde pour éviter les références
      log: []
    };
    socket.join(gameId);
    socket.emit('gameCreated', { gameId, playerName });
    io.to(gameId).emit('updateGameState', games[gameId]);
  });

  // Rejoindre une partie
  socket.on('joinGame', ({ gameId, playerName }) => {
    if (games[gameId]) {
      games[gameId].players.push({ id: socket.id, name: playerName, properties: [], position: 0, cash: 1500 });
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

    // Mettre à jour la position du joueur
    currentPlayer.position = (currentPlayer.position + total) % 40;
    const newPosition = game.board[currentPlayer.position];

    // Appliquer les effets de la case
    if (newPosition.type === 'fee') {
      currentPlayer.cash -= newPosition.amount;
      game.log.push(`${currentPlayer.name} paie ${newPosition.amount} USDT (${newPosition.name}).`);
    } else if (newPosition.type === 'special') {
      if (newPosition.name === 'AIRDROP') {
        currentPlayer.cash += 100;
        game.log.push(`${currentPlayer.name} reçoit 100 USDT (Airdrop).`);
      } else if (newPosition.name === 'BEAR MARKET') {
        currentPlayer.position = (currentPlayer.position - 3 + 40) % 40;
        game.log.push(`${currentPlayer.name} recule de 3 cases (Bear Market).`);
      } else if (newPosition.text.includes('avancez')) {
        // Logique pour avancer jusqu'au prochain échange (à implémenter)
      }
    }

    // Vérifier si la case est achetable
    if (newPosition.type === 'property' && !newPosition.owner) {
      io.to(gameId).emit('canBuyProperty', { propertyPos: currentPlayer.position });
    } else if (newPosition.owner && newPosition.owner !== currentPlayer.name) {
      // Payer le loyer (à implémenter selon le type de case)
    }

    // Passer au joueur suivant
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    io.to(gameId).emit('diceRolled', { dice1, dice2, playerName: currentPlayer.name, total, newPosition });
    io.to(gameId).emit('updateGameState', game);
  });

  // Acheter une propriété
  socket.on('buyProperty', ({ gameId, playerName }) => {
    const game = games[gameId];
    if (!game) return;

    const currentPlayer = game.players.find(p => p.name === playerName);
    const propertyPos = currentPlayer.position;
    const property = game.board[propertyPos];

    if (property.type === 'property' && !property.owner && currentPlayer.cash >= property.price) {
      property.owner = playerName;
      currentPlayer.cash -= property.price;
      currentPlayer.properties.push(propertyPos);
      game.log.push(`${playerName} achète ${property.name} pour ${property.price} USDT.`);
      io.to(gameId).emit('propertyBought', { propertyPos, playerName });
      io.to(gameId).emit('updateGameState', game);
    }
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
