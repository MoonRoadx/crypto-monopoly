// Connexion au serveur WebSocket (remplace l'URL par celle de ton backend Heroku)
const socket = io('https://ton-url-heroku.herokuapp.com');

// Variables globales
let gameId;
let playerName;
let currentPlayerIndex = 0;
let players = [];
let board = []; // À remplir avec ton boardData existant

// DOM Elements
const playerNameInput = document.getElementById('playerName');
const gameIdInput = document.getElementById('gameIdInput');
const gameIdDisplay = document.getElementById('gameIdDisplay');
const chatDiv = document.getElementById('chat');
const chatInput = document.getElementById('chatInput');
const gameLog = document.getElementById('gameLog');

// Créer une nouvelle partie
function createGame() {
  playerName = playerNameInput.value;
  socket.emit('createGame', playerName);
}

// Rejoindre une partie existante
function joinGame() {
  playerName = playerNameInput.value;
  gameId = gameIdInput.value;
  socket.emit('joinGame', { gameId, playerName });
}

// Lancer les dés
function rollDice() {
  socket.emit('rollDice', gameId);
}

// Envoyer un message dans le chat
function sendMessage() {
  const message = chatInput.value;
  socket.emit('sendMessage', { gameId, message, playerName });
  chatInput.value = '';
}

// Écouter les événements du serveur
socket.on('gameCreated', ({ gameId: id }) => {
  gameId = id;
  gameIdDisplay.textContent = `ID de la partie : ${gameId}`;
  addLog(`Partie créée ! ID : ${gameId}`);
});

socket.on('playerJoined', (updatedPlayers) => {
  players = updatedPlayers;
  addLog(`${players[players.length - 1].name} a rejoint la partie !`);
  updatePlayerList();
});

socket.on('diceRolled', ({ dice1, dice2 }) => {
  const total = dice1 + dice2;
  addLog(`${playerName} a lancé les dés : ${dice1} et ${dice2} (Total: ${total})`);
  // Logique pour déplacer le joueur sur le plateau
});

socket.on('newMessage', ({ playerName, message }) => {
  chatDiv.innerHTML += `<div><b>${playerName}:</b> ${message}</div>`;
  chatDiv.scrollTop = chatDiv.scrollHeight;
});

socket.on('playerTurn', ({ playerIndex }) => {
  currentPlayerIndex = playerIndex;
  addLog(`C'est au tour de ${players[playerIndex].name}`);
  // Mettre en évidence le joueur actuel dans l'UI
});

// Fonctions utilitaires
function addLog(message) {
  const entry = document.createElement('div');
  entry.textContent = message;
  gameLog.insertBefore(entry, gameLog.firstChild);
}

function updatePlayerList() {
  const playerList = document.getElementById('playerList');
  playerList.innerHTML = '<h3>Joueurs :</h3>';
  players.forEach(player => {
    playerList.innerHTML += `<div>${player.name} ${player.id === socket.id ? '(Toi)' : ''}</div>`;
  });
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  // Remplir le plateau avec tes données (boardData)
  board = [
    { pos: 0, type: 'corner', name: 'DÉPART' },
    { pos: 1, type: 'property', name: 'AAVE', price: 60 },
    // ... (ajoute le reste de ton boardData ici)
  ];
});
