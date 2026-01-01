const socket = io('https://crypto-monopoly-backend.onrender.com');

document.addEventListener('DOMContentLoaded', () => {
  console.log("Script chargé et DOM prêt");
  document.getElementById('createGameButton').addEventListener('click', createGame);
  document.getElementById('joinGameButton').addEventListener('click', joinGame);
  document.getElementById('rollDiceButton').addEventListener('click', rollDice);
  document.getElementById('sendMessageButton').addEventListener('click', sendMessage);

  function createGame() {
    const playerName = document.getElementById('playerName').value;
    socket.emit('createGame', playerName);
  }

  function joinGame() {
    const playerName = document.getElementById('playerName').value;
    const gameId = document.getElementById('gameIdInput').value;
    socket.emit('joinGame', { gameId, playerName });
  }

  function rollDice() {
    socket.emit('rollDice', gameId);
  }

  function sendMessage() {
    const message = document.getElementById('chatInput').value;
    socket.emit('sendMessage', { gameId, message, playerName: document.getElementById('playerName').value });
  }

  socket.on('gameCreated', ({ gameId }) => {
    document.getElementById('gameIdDisplay').textContent = `ID de la partie : ${gameId}`;
  });

  socket.on('newMessage', ({ playerName, message }) => {
    const chatDiv = document.getElementById('chat');
    chatDiv.innerHTML += `<div><b>${playerName}:</b> ${message}</div>`;
  });
});
