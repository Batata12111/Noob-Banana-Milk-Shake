let leaderboard = [];
let playerName = '';

// Função para inicializar a leaderboard
function initLeaderboard() {
  let leaderboardButton = document.getElementById('leaderboardButton');
  if (!leaderboardButton) {
    leaderboardButton = document.createElement('button');
    leaderboardButton.id = 'leaderboardButton';
    leaderboardButton.textContent = 'Leaderboard';
    document.body.appendChild(leaderboardButton);
  }

  leaderboardButton.addEventListener('click', handleLeaderboardClick);

  // Atualiza a leaderboard a cada 30 segundos
  setInterval(updateLeaderboard, 30000);
}

// Função para lidar com o clique no botão da leaderboard
function handleLeaderboardClick() {
  if (!playerName) {
    playerName = prompt('Enter your name for the leaderboard:');
    if (!playerName) {
      alert('You need to provide a name to join the leaderboard.');
      return;
    }
  }

  showLeaderboard();
}

// Função para atualizar a leaderboard
function updateLeaderboard() {
  const playerIndex = leaderboard.findIndex(player => player.name === playerName);

  if (playerIndex !== -1) {
    leaderboard[playerIndex].milkshakes = milkshakes;
    leaderboard[playerIndex].money = money;
  } else {
    leaderboard.push({ name: playerName, milkshakes, money });
  }

  leaderboard.sort((a, b) => b.milkshakes - a.milkshakes || b.money - a.money);
}

// Função para exibir a leaderboard
function showLeaderboard() {
  const modal = document.createElement('div');
  modal.id = 'leaderboardModal';
  modal.className = 'modal';

  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modalContent.innerHTML = `
    <span class="close" onclick="closeLeaderboardModal()">&times;</span>
    <h2>Leaderboard</h2>
    <div id="leaderboardContent"></div>
  `;

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  displayLeaderboardContent();
}

// Função para atualizar o conteúdo da leaderboard
function displayLeaderboardContent() {
  const leaderboardContent = document.getElementById('leaderboardContent');
  leaderboardContent.innerHTML = '';

  leaderboard.forEach((player, index) => {
    const entry = document.createElement('div');
    entry.className = 'leaderboard-entry';

    let medal = '';
    if (index === 0) medal = '🥇';
    else if (index === 1) medal = '🥈';
    else if (index === 2) medal = '🥉';

    entry.innerHTML = `
      <span class="rank">${medal} ${index + 1}.</span>
      <span class="player-name">${player.name}</span>
      <span class="stats">Milkshakes: ${player.milkshakes} | Money: $${player.money.toFixed(2)}</span>
    `;
    leaderboardContent.appendChild(entry);
  });
}

// Função para fechar o modal da leaderboard
function closeLeaderboardModal() {
  document.getElementById('leaderboardModal').remove();
}

// Inicializar a leaderboard
initLeaderboard();
