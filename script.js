// Variáveis do jogo
let money = 0.00;
let milkshakes = 0;
let milkshakeIncome = 0.05;
let rebirths = 0;
let bananaPowerActive = false;
let milkshakePrice = 30.00;
let upgradePrice = 100.00;
let rebirthPrice = 500.00;
let turboActive = false;
const turboDuration = 10000;
let timeExtenderActive = false; // Para o Time Extender
let bananaShieldActive = false; // Para o Banana Shield
let bananaRainActive = false;
const maxBananas = 20;  // Número máximo de bananas caindo na tela ao mesmo tempo
const bananaContainer = document.getElementById('banana-rain-container');
let rainCount = 0;
let clickCount = 0;
let eventActive = false;
let clicksDuringEvent = 0;
const requiredClicks = 30;
const eventDuration = 10000; // 10 segundos

// Função para gerar a renda automática
function generateIncome() {
  money += milkshakes * milkshakeIncome;
  money = parseFloat(money.toFixed(2)); // Arredonda para 2 casas decimais
  updateInfo();
}

// Atualiza as informações na tela
function updateInfo() {
  document.getElementById('money').textContent = money.toFixed(2);
  document.getElementById('milkshakes').textContent = milkshakes;
  document.getElementById('rebirths').textContent = rebirths;
}

// Lógica do clique na banana
function clickBanana() {
  money += turboActive ? milkshakeIncome * 2 : milkshakeIncome;
  money = parseFloat(money.toFixed(2));
  updateInfo();
  trackMission("Click on the banana 100 times");
  handleRedBananaEvent();
}

// Função para comprar Milkshake
function buyMilkshake() {
  if (money >= milkshakePrice) {
    money -= milkshakePrice;
    milkshakes++;
    milkshakeIncome += 0.05;
    milkshakePrice = Math.ceil(milkshakePrice * 1.5);
    updateInfo();
    showNotification('You bought a Milkshake!', 'success');
  } else {
    showNotification('Not enough coins to buy a milkshake!', 'error');
  }
}

// Função para comprar Upgrade
function buyUpgrade() {
  if (money >= upgradePrice) {
    money -= upgradePrice;
    milkshakeIncome *= 1.03;
    upgradePrice = Math.ceil(upgradePrice * 1.8);
    updateInfo();
    showNotification('Upgrade purchased successfully!', 'success');
  } else {
    showNotification('Not enough coins to purchase the Upgrade!', 'error');
  }
}

// Função de Rebirth
function performRebirth() {
  if (money >= rebirthPrice) {
    money -= rebirthPrice;
    rebirths++;
    milkshakes = 0;
    milkshakeIncome = 0.05;
    rebirthPrice = Math.ceil(rebirthPrice * 1.8);
    updateInfo();
    showNotification('Rebirth successfully completed!', 'success');
  } else {
    showNotification('Not enough coins to perform Rebirth!', 'error');
  }
}

// Função para ativar Auto Clicker
function buyAutoClicker() {
  if (money >= 500) {
    money -= 500;
    setInterval(() => clickBanana(), 5000); // Auto Clicker ativa a cada 5 segundos
    updateInfo();
    showNotification('Auto Clicker activated!', 'success');
  } else {
    showNotification('You dont have enough coins to buy Auto Clicker!', 'error');
  }
}

// Função para comprar Golden Banana
function buyGoldenBanana() {
  if (money >= 800) {
    money -= 800;
    const originalIncome = milkshakeIncome;
    milkshakeIncome *= 2; // Dobra a produção de cliques
    updateInfo();
    showNotification('Golden Banana activated!', 'success');
    setTimeout(() => {
      milkshakeIncome = originalIncome; // Volta a produção ao normal
      updateInfo();
    }, 30000); // Dura 30 segundos
  } else {
    showNotification('You dont have enough coins to buy Golden Banana!', 'error');
  }
}

// Evento Especial: Banana Vermelha

function handleRedBananaEvent() {
  if (!eventActive) {
    clickCount++;
    if (clickCount >= 200) triggerRedBananaEvent();
  } else {
    clicksDuringEvent++;
    if (clicksDuringEvent >= requiredClicks) resetRedBananaEvent(true);
  }
}

function triggerRedBananaEvent() {
  eventActive = true;
  clickCount = 0;
  clicksDuringEvent = 0;

  const banana = document.getElementById('banana');
  const eventMessage = document.createElement('div');
  eventMessage.id = 'eventMessage';
  eventMessage.textContent = 'RV has removed all his positions, quick click to get them back!';
  document.body.appendChild(eventMessage);

  const countdown = document.createElement('div');
  countdown.id = 'countdown';
  document.body.appendChild(countdown);

  let timeLeft = 10;
  countdown.textContent = timeLeft;

  const timer = setInterval(() => {
    timeLeft--;
    countdown.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      if (eventActive) resetRedBananaEvent(false);
    }
  }, 1000);

  banana.style.color = 'red';
}

function resetRedBananaEvent(success) {
  eventActive = false;

  const banana = document.getElementById('banana');
  const eventMessage = document.getElementById('eventMessage');
  const countdown = document.getElementById('countdown');

  if (eventMessage) eventMessage.remove();
  if (countdown) countdown.remove();

  banana.style.color = '';

  if (success) {
    showNotification('You have recovered your positions and earned 25 coins!', 'success');
    money += 10;
  } else {
    showNotification('You failed to recover positions!', 'error');
  }

  updateInfo();
}

// Função para verificar o impacto do Banana Shield no evento de falha
function handleFailedEvent() {
  if (bananaShieldActive) {
    showNotification('The Banana Shield protected you from losing coins!', 'success');
  } else {
    money = Math.max(0, money - 20); // Perde 20 moedas em evento falho sem o Banana Shield
    showNotification('You lost your positions and 20 coins!', 'error');
  }
  updateInfo();
}

// Função para comprar Time Extender
function buyTimeExtender() {
  if (money >= 1500) {
    money -= 1500;
    timeExtenderActive = true;
    showNotification('Time Extender activated! Special events will last 5 seconds longer', 'success');
    setTimeout(() => {
      timeExtenderActive = false; // Desativa o Time Extender após 30 segundos
    }, 30000); // Dura 30 segundos
    updateInfo();
  } else {
    showNotification('You dont have enough coins to buy Time Extender!', 'error');
  }
}

// Função para comprar Banana Shield
function buyBananaShield() {
  if (money >= 2000) {
    money -= 2000;
    bananaShieldActive = true;
    showNotification('Banana Shield activated! You are protected from losing coins in failed events', 'success');
    setTimeout(() => {
      bananaShieldActive = false; // Desativa o Banana Shield após 30 segundos
    }, 30000); // Dura 30 segundos
    updateInfo();
  } else {
    showNotification('You dont have enough coins to buy Banana Shield!', 'error');
  }
}

// Função para mostrar notificações de Conquista, Sucesso e Erro
function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.classList.add('notification', type);

  // Adiciona o emoji de acordo com o tipo de notificação
  const emoji = document.createElement('span');
  emoji.classList.add('emoji');
  if (type === 'success') {
    emoji.textContent = '✅️'; // Emoji de sucesso
  } else if (type === 'error') {
    emoji.textContent = '❌️'; // Emoji de erro
  } else if (type === 'conquest') {
    emoji.textContent = '🏆'; // Emoji de troféu para conquista
  }

  // Cria o texto da notificação
  const text = document.createElement('span');
  text.textContent = message;

  // Adiciona o emoji e o texto à notificação
  notification.appendChild(emoji);
  notification.appendChild(text);

  document.body.appendChild(notification);

  // Animação de fade-out após 5 segundos
  setTimeout(() => {
    notification.classList.add('fade-out');
  }, 5000);

  // Remove a notificação após a animação de fade-out
  setTimeout(() => {
    notification.remove();
  }, 5500);
}

// Missões diárias
let dailyMissions = [
  { description: "Click on the banana 100 times", progress: 0, goal: 100, reward: 50 },
  { description: "Buy 5 upgrades", progress: 0, goal: 5, reward: 100 },
  { description: "Complete a Rebirth", progress: 0, goal: 1, reward: 200 }
];

// Função para rastrear o progresso das missões
function trackMission(missionType) {
  const mission = dailyMissions.find(m => m.description === missionType);
  if (mission) {
    mission.progress++;
    if (mission.progress >= mission.goal) {
      showNotification(`Mission Complete: ${mission.description}`, 'conquest');
      money += mission.reward;
      mission.progress = 0; // Reseta o progresso após a missão ser completada
    }
    updateInfo();
  }
}

// Exemplo de uso dentro do clique da banana
function clickBanana() {
  money += turboActive ? milkshakeIncome * 2 : milkshakeIncome;
  money = parseFloat(money.toFixed(2));
  updateInfo();

  // Rastreia a missão "Clique 100 vezes na banana"
  trackMission("Click on the banana 100 times");
  handleRedBananaEvent();
}

// Exemplo de uso dentro da função de Rebirth
function performRebirth() {
  if (money >= rebirthPrice) {
    money -= rebirthPrice;
    rebirths++;
    milkshakes = 0;
    milkshakeIncome = 0.05;
    rebirthPrice = Math.ceil(rebirthPrice * 1.8);
    updateInfo();

    // Rastreia a missão "Complete um Rebirth"
    trackMission("Complete a Rebirth");

    showNotification('Rebirth successfully completed!', 'success');
  } else {
    showNotification('Not enough coins to perform Rebirth!', 'error');
  }
}

// Função para mostrar notificações de Conquista, Sucesso e Erro
function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.classList.add('notification', type);

  // Adiciona o emoji de acordo com o tipo de notificação
  const emoji = document.createElement('span');
  emoji.classList.add('emoji');
  if (type === 'success') {
    emoji.textContent = '✅️'; // Emoji de sucesso
  } else if (type === 'error') {
    emoji.textContent = '❌️'; // Emoji de erro
  } else if (type === 'conquest') {
    emoji.textContent = '🏆'; // Emoji de troféu para conquista
  }

  // Cria o texto da notificação
  const text = document.createElement('span');
  text.textContent = message;

  // Adiciona o emoji e o texto à notificação
  notification.appendChild(emoji);
  notification.appendChild(text);

  document.body.appendChild(notification);

  // Animação de fade-out após 5 segundos
  setTimeout(() => {
    notification.classList.add('fade-out');
  }, 5000);

  // Remove a notificação após a animação de fade-out
  setTimeout(() => {
    notification.remove();
  }, 5500);
}

// Função para atualizar as informações na tela
function updateInfo() {
  document.getElementById('money').textContent = money.toFixed(2);
  document.getElementById('milkshakes').textContent = milkshakes;
  document.getElementById('rebirths').textContent = rebirths;
}

// Referências dos elementos
const shopButton = document.getElementById('shopButton'); // Botão para abrir a loja
const shopModal = document.getElementById('shopModal'); // Modal da loja
const closeShop = document.getElementById('closeShop'); // Botão para fechar a loja

// Função para abrir a loja
function openShop() {
  shopModal.style.display = 'block'; // Exibe o modal
  document.body.style.overflow = 'hidden'; // Desabilita o scroll quando o modal está aberto
}

// Função para fechar a loja
function closeShopModal() {
  shopModal.style.display = 'none'; // Esconde o modal
  document.body.style.overflow = 'auto'; // Habilita o scroll novamente
}

// Evento para abrir a loja ao clicar no botão
shopButton.addEventListener('click', openShop);

// Evento para fechar a loja ao clicar no botão de fechar
closeShop.addEventListener('click', closeShopModal);

// Ajuste: Fechar modal ao clicar fora do conteúdo do modal
shopModal.addEventListener('click', (event) => {
  if (event.target === shopModal) {
    closeShopModal(); // Fecha a loja somente se o clique for fora do conteúdo do modal
  }
});

// Função que começa a chuva de bananas
function startBananaRain() {
  if (bananaRainActive) return;

  bananaRainActive = true;
  
  const interval = setInterval(() => {
    if (rainCount >= maxBananas) {
      clearInterval(interval); // Para a chuva se atingir o máximo de bananas
      bananaRainActive = false;
    }

    // Cria um novo emoji de banana
    const bananaEmoji = document.createElement('div');
    bananaEmoji.classList.add('banana-emoji');
    bananaEmoji.textContent = '🍌';

    // Define a posição inicial aleatória do emoji na parte superior
    const randomX = Math.random() * window.innerWidth;
    bananaEmoji.style.left = `${randomX}px`;

    // Adiciona o emoji à tela
    bananaContainer.appendChild(bananaEmoji);

    // Incrementa o contador de bananas
    rainCount++;

    // Remove o emoji da tela após ele terminar a animação
    setTimeout(() => {
      bananaEmoji.remove();
      rainCount--; // Decrementa o contador
    }, 3000); // 3 segundos depois que o emoji termina sua animação
  }, 100); // Dispara a cada 100ms para criar a animação
}

// Função de clique na banana
function clickBanana() {
  money += milkshakeIncome;
  money = parseFloat(money.toFixed(2));
  updateInfo();
  trackMission("Click on the banana 100 times");
  handleRedBananaEvent();

  // Inicia a chuva de bananas quando o jogador clicar
  startBananaRain();
}

// Importando as funções necessárias do SDK
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, get, child } from "firebase/database";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDaR0sc_Iy8K7MtuH-Wci96d-FeDn317Pw",
  authDomain: "leader-board-d5ffa.firebaseapp.com",
  databaseURL: "https://leader-board-d5ffa-default-rtdb.firebaseio.com",
  projectId: "leader-board-d5ffa",
  storageBucket: "leader-board-d5ffa.firebasestorage.app",
  messagingSenderId: "932824630059",
  appId: "1:932824630059:web:b855d5e34a8684d7c97b6e",
  measurementId: "G-92TW6BS4H8"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);  // Banco de dados

// Função para adicionar ou atualizar dados da leaderboard
export function addData(playerName, milkshakes, money) {
  const leaderboardRef = ref(db, 'leaderboard/' + playerName);
  set(leaderboardRef, {
    milkshakes: milkshakes,
    money: money
  }).then(() => {
    console.log("Dados salvos com sucesso!");
  }).catch((error) => {
    console.error("Erro ao salvar dados:", error);
  });
}

// Função para obter dados da leaderboard
export function getLeaderboard() {
  const leaderboardRef = ref(db, 'leaderboard/');
  return get(leaderboardRef);
}