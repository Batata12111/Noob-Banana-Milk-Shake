const STORAGE_KEY = 'banana-milkshake-save';

let money = 0.0;
let milkshakes = 0;
let milkshakeIncome = 0.05;
let rebirths = 0;

let milkshakePrice = 30.0;
let upgradePrice = 100.0;
let rebirthPrice = 500.0;

let turboActive = false;
let goldenBananaActive = false;
let timeExtenderActive = false;
let bananaShieldActive = false;
let bananaRainActive = false;

let autoClickers = 0;
let milkshakeFactories = 0;
let bananaMagnetLevel = 0;

const baseEventDuration = 10000;
const magnetChancePerLevel = 0.05;
const maxBananas = 20;
const bananaContainer = document.getElementById('banana-rain-container');

let rainCount = 0;
let clickCount = 0;
let eventActive = false;
let clicksDuringEvent = 0;
const requiredClicks = 30;

const elements = {
  money: document.getElementById('money'),
  milkshakes: document.getElementById('milkshakes'),
  rebirths: document.getElementById('rebirths'),
  progressFill: document.getElementById('progress-fill'),
  buyShake: document.getElementById('buy-shake'),
  buyUpgrade: document.getElementById('buy-upgrade'),
  rebirthButton: document.getElementById('rebirth-button'),
  shopButton: document.getElementById('shopButton'),
  shopModal: document.getElementById('shopModal'),
  closeShop: document.getElementById('closeShop'),
  banana: document.getElementById('banana')
};

const dailyMissions = [
  { description: 'Click on the banana 100 times', progress: 0, goal: 100, reward: 50 },
  { description: 'Buy 5 upgrades', progress: 0, goal: 5, reward: 100 },
  { description: 'Complete a Rebirth', progress: 0, goal: 1, reward: 200 }
];

function formatMoney(value) {
  return value.toFixed(2);
}

function syncGlobals() {
  window.money = money;
  window.milkshakes = milkshakes;
}

function updateProgressBar() {
  const progress = Math.min(money / milkshakePrice, 1);
  elements.progressFill.style.width = `${Math.round(progress * 100)}%`;
}

function updateButtons() {
  elements.buyShake.textContent = `🧋 Milk-shake = ${Math.ceil(milkshakePrice)}`;
  elements.buyUpgrade.textContent = `🔧 Upgrade = ${Math.ceil(upgradePrice)}`;
  elements.rebirthButton.textContent = `🔄 Rebirth = ${Math.ceil(rebirthPrice)}`;

  elements.buyShake.disabled = money < milkshakePrice;
  elements.buyUpgrade.disabled = money < upgradePrice;
  elements.rebirthButton.disabled = money < rebirthPrice;
}

function updateInfo() {
  elements.money.textContent = formatMoney(money);
  elements.milkshakes.textContent = milkshakes;
  elements.rebirths.textContent = rebirths;
  updateProgressBar();
  updateButtons();
  syncGlobals();
  saveGame();
}

function saveGame() {
  const payload = {
    money,
    milkshakes,
    milkshakeIncome,
    rebirths,
    milkshakePrice,
    upgradePrice,
    rebirthPrice,
    turboActive,
    goldenBananaActive,
    timeExtenderActive,
    bananaShieldActive,
    autoClickers,
    milkshakeFactories,
    bananaMagnetLevel
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function loadGame() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  const data = JSON.parse(saved);
  money = Number(data.money) || 0;
  milkshakes = Number(data.milkshakes) || 0;
  milkshakeIncome = Number(data.milkshakeIncome) || 0.05;
  rebirths = Number(data.rebirths) || 0;
  milkshakePrice = Number(data.milkshakePrice) || 30.0;
  upgradePrice = Number(data.upgradePrice) || 100.0;
  rebirthPrice = Number(data.rebirthPrice) || 500.0;
  turboActive = Boolean(data.turboActive);
  goldenBananaActive = Boolean(data.goldenBananaActive);
  timeExtenderActive = Boolean(data.timeExtenderActive);
  bananaShieldActive = Boolean(data.bananaShieldActive);
  autoClickers = Number(data.autoClickers) || 0;
  milkshakeFactories = Number(data.milkshakeFactories) || 0;
  bananaMagnetLevel = Number(data.bananaMagnetLevel) || 0;
}

function generateIncome() {
  const factoryIncome = milkshakeFactories * 0.1;
  money += milkshakes * milkshakeIncome + factoryIncome;
  money = Number(money.toFixed(2));
  updateInfo();
}

function addCoinAnimation() {
  const coin = document.createElement('div');
  coin.className = 'coin';
  coin.textContent = '🪙';
  coin.style.left = `${50 + Math.random() * 10 - 5}%`;
  coin.style.top = `${45 + Math.random() * 10}%`;
  document.body.appendChild(coin);

  setTimeout(() => {
    coin.remove();
  }, 1000);
}

function getMagnetChance() {
  return Math.min(bananaMagnetLevel * magnetChancePerLevel, 0.3);
}

function clickBanana() {
  let income = milkshakeIncome;
  if (turboActive || goldenBananaActive) {
    income *= 2;
  }

  if (bananaMagnetLevel > 0 && Math.random() < getMagnetChance()) {
    income *= 2;
    showNotification('Banana Magnet! Double coins!', 'conquest');
  }

  money += income;
  money = Number(money.toFixed(2));
  addCoinAnimation();
  updateInfo();
  trackMission('Click on the banana 100 times');
  handleRedBananaEvent();
  startBananaRain();
}

function buyMilkshake() {
  if (money < milkshakePrice) {
    showNotification('Not enough coins to buy a milkshake!', 'error');
    return;
  }

  money -= milkshakePrice;
  milkshakes += 1;
  milkshakeIncome += 0.05;
  milkshakePrice = Math.ceil(milkshakePrice * 1.5);
  updateInfo();
  showNotification('You bought a Milkshake!', 'success');
}

function buyUpgrade() {
  if (money < upgradePrice) {
    showNotification('Not enough coins to purchase the Upgrade!', 'error');
    return;
  }

  money -= upgradePrice;
  milkshakeIncome *= 1.03;
  upgradePrice = Math.ceil(upgradePrice * 1.8);
  updateInfo();
  trackMission('Buy 5 upgrades');
  showNotification('Upgrade purchased successfully!', 'success');
}

function performRebirth() {
  if (money < rebirthPrice) {
    showNotification('Not enough coins to perform Rebirth!', 'error');
    return;
  }

  money -= rebirthPrice;
  rebirths += 1;
  milkshakes = 0;
  milkshakeIncome = 0.05;
  milkshakePrice = 30.0;
  upgradePrice = 100.0;
  rebirthPrice = Math.ceil(rebirthPrice * 1.8);
  updateInfo();
  trackMission('Complete a Rebirth');
  showNotification('Rebirth successfully completed!', 'success');
}

function buyAutoClicker() {
  if (money < 500) {
    showNotification('You dont have enough coins to buy Auto Clicker!', 'error');
    return;
  }

  money -= 500;
  autoClickers += 1;
  updateInfo();
  showNotification('Auto Clicker activated!', 'success');
}

function buyGoldenBanana() {
  if (money < 800) {
    showNotification('You dont have enough coins to buy Golden Banana!', 'error');
    return;
  }

  money -= 800;
  goldenBananaActive = true;
  updateInfo();
  showNotification('Golden Banana activated!', 'success');
  setTimeout(() => {
    goldenBananaActive = false;
    updateInfo();
  }, 30000);
}

function buyMilkshakeFactory() {
  if (money < 1000) {
    showNotification('You dont have enough coins to buy Milkshake Factory!', 'error');
    return;
  }

  money -= 1000;
  milkshakeFactories += 1;
  updateInfo();
  showNotification('Milkshake Factory is now producing!', 'success');
}

function buyBananaMagnet() {
  if (money < 1200) {
    showNotification('You dont have enough coins to buy Banana Magnet!', 'error');
    return;
  }

  money -= 1200;
  bananaMagnetLevel += 1;
  updateInfo();
  showNotification('Banana Magnet upgraded!', 'success');
}

function buyTimeExtender() {
  if (money < 1500) {
    showNotification('You dont have enough coins to buy Time Extender!', 'error');
    return;
  }

  money -= 1500;
  timeExtenderActive = true;
  showNotification('Time Extender activated! Special events will last 5 seconds longer', 'success');
  setTimeout(() => {
    timeExtenderActive = false;
  }, 30000);
  updateInfo();
}

function buyBananaShield() {
  if (money < 2000) {
    showNotification('You dont have enough coins to buy Banana Shield!', 'error');
    return;
  }

  money -= 2000;
  bananaShieldActive = true;
  showNotification('Banana Shield activated! You are protected from losing coins in failed events', 'success');
  setTimeout(() => {
    bananaShieldActive = false;
  }, 30000);
  updateInfo();
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.classList.add('notification', type);

  const emoji = document.createElement('span');
  emoji.classList.add('emoji');
  if (type === 'success') {
    emoji.textContent = '✅️';
  } else if (type === 'error') {
    emoji.textContent = '❌️';
  } else if (type === 'conquest') {
    emoji.textContent = '🏆';
  }

  const text = document.createElement('span');
  text.textContent = message;

  notification.appendChild(emoji);
  notification.appendChild(text);

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('fade-out');
  }, 5000);

  setTimeout(() => {
    notification.remove();
  }, 5500);
}

function trackMission(missionType) {
  const mission = dailyMissions.find((missionItem) => missionItem.description === missionType);
  if (!mission) return;

  mission.progress += 1;
  if (mission.progress >= mission.goal) {
    showNotification(`Mission Complete: ${mission.description}`, 'conquest');
    money += mission.reward;
    mission.progress = 0;
  }
  updateInfo();
}

function handleFailedEvent() {
  if (bananaShieldActive) {
    showNotification('The Banana Shield protected you from losing coins!', 'success');
  } else {
    money = Math.max(0, money - 20);
    showNotification('You lost your positions and 20 coins!', 'error');
  }
  updateInfo();
}

function handleRedBananaEvent() {
  if (!eventActive) {
    clickCount += 1;
    if (clickCount >= 200) {
      triggerRedBananaEvent();
    }
  } else {
    clicksDuringEvent += 1;
    if (clicksDuringEvent >= requiredClicks) {
      resetRedBananaEvent(true);
    }
  }
}

function triggerRedBananaEvent() {
  eventActive = true;
  clickCount = 0;
  clicksDuringEvent = 0;

  const eventMessage = document.createElement('div');
  eventMessage.id = 'eventMessage';
  eventMessage.textContent = 'RV has removed all his positions, quick click to get them back!';
  document.body.appendChild(eventMessage);

  const countdown = document.createElement('div');
  countdown.id = 'countdown';
  document.body.appendChild(countdown);

  let timeLeft = Math.floor(getEventDuration() / 1000);
  countdown.textContent = timeLeft;

  const timer = setInterval(() => {
    timeLeft -= 1;
    countdown.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      if (eventActive) {
        resetRedBananaEvent(false);
      }
    }
  }, 1000);

  elements.banana.style.color = 'red';
}

function getEventDuration() {
  return timeExtenderActive ? baseEventDuration + 5000 : baseEventDuration;
}

function resetRedBananaEvent(success) {
  eventActive = false;

  const eventMessage = document.getElementById('eventMessage');
  const countdown = document.getElementById('countdown');

  if (eventMessage) eventMessage.remove();
  if (countdown) countdown.remove();

  elements.banana.style.color = '';

  if (success) {
    showNotification('You have recovered your positions and earned 25 coins!', 'success');
    money += 25;
  } else {
    handleFailedEvent();
  }

  updateInfo();
}

function startBananaRain() {
  if (bananaRainActive) return;

  bananaRainActive = true;

  const interval = setInterval(() => {
    if (rainCount >= maxBananas) {
      clearInterval(interval);
      bananaRainActive = false;
      return;
    }

    const bananaEmoji = document.createElement('div');
    bananaEmoji.classList.add('banana-emoji');
    bananaEmoji.textContent = '🍌';

    const randomX = Math.random() * window.innerWidth;
    bananaEmoji.style.left = `${randomX}px`;

    bananaContainer.appendChild(bananaEmoji);
    rainCount += 1;

    setTimeout(() => {
      bananaEmoji.remove();
      rainCount -= 1;
    }, 3000);
  }, 100);
}

function openShop() {
  elements.shopModal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeShopModal() {
  elements.shopModal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

function bindEvents() {
  elements.shopButton.addEventListener('click', openShop);
  elements.closeShop.addEventListener('click', closeShopModal);

  elements.shopModal.addEventListener('click', (event) => {
    if (event.target === elements.shopModal) {
      closeShopModal();
    }
  });

  elements.banana.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      clickBanana();
    }
  });
}

function startAutoClickers() {
  setInterval(() => {
    if (autoClickers <= 0) return;

    for (let i = 0; i < autoClickers; i += 1) {
      clickBanana();
    }
  }, 5000);
}

function initGame() {
  loadGame();
  bindEvents();
  updateInfo();
  startAutoClickers();
  setInterval(generateIncome, 1000);
}

initGame();
