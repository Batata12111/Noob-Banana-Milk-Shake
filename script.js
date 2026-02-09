 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/script.js b/script.js
index 2be289ebd1cc500477f9648afe4658eb2ae059f8..27b5ff93aaeb62d0784245bd114732ac4e3b7f0a 100644
--- a/script.js
+++ b/script.js
@@ -1,430 +1,500 @@
-// Variáveis do jogo
-let money = 0.00;
+const STORAGE_KEY = 'banana-milkshake-save';
+
+let money = 0.0;
 let milkshakes = 0;
 let milkshakeIncome = 0.05;
 let rebirths = 0;
-let bananaPowerActive = false;
-let milkshakePrice = 30.00;
-let upgradePrice = 100.00;
-let rebirthPrice = 500.00;
+
+let milkshakePrice = 30.0;
+let upgradePrice = 100.0;
+let rebirthPrice = 500.0;
+
 let turboActive = false;
-const turboDuration = 10000;
-let timeExtenderActive = false; // Para o Time Extender
-let bananaShieldActive = false; // Para o Banana Shield
+let goldenBananaActive = false;
+let timeExtenderActive = false;
+let bananaShieldActive = false;
 let bananaRainActive = false;
-const maxBananas = 20;  // Número máximo de bananas caindo na tela ao mesmo tempo
+
+let autoClickers = 0;
+let milkshakeFactories = 0;
+let bananaMagnetLevel = 0;
+
+const baseEventDuration = 10000;
+const magnetChancePerLevel = 0.05;
+const maxBananas = 20;
 const bananaContainer = document.getElementById('banana-rain-container');
+
 let rainCount = 0;
 let clickCount = 0;
 let eventActive = false;
 let clicksDuringEvent = 0;
 const requiredClicks = 30;
-const eventDuration = 10000; // 10 segundos
 
-// Função para gerar a renda automática
+const elements = {
+  money: document.getElementById('money'),
+  milkshakes: document.getElementById('milkshakes'),
+  rebirths: document.getElementById('rebirths'),
+  progressFill: document.getElementById('progress-fill'),
+  buyShake: document.getElementById('buy-shake'),
+  buyUpgrade: document.getElementById('buy-upgrade'),
+  rebirthButton: document.getElementById('rebirth-button'),
+  shopButton: document.getElementById('shopButton'),
+  shopModal: document.getElementById('shopModal'),
+  closeShop: document.getElementById('closeShop'),
+  banana: document.getElementById('banana')
+};
+
+const dailyMissions = [
+  { description: 'Click on the banana 100 times', progress: 0, goal: 100, reward: 50 },
+  { description: 'Buy 5 upgrades', progress: 0, goal: 5, reward: 100 },
+  { description: 'Complete a Rebirth', progress: 0, goal: 1, reward: 200 }
+];
+
+function formatMoney(value) {
+  return value.toFixed(2);
+}
+
+function syncGlobals() {
+  window.money = money;
+  window.milkshakes = milkshakes;
+}
+
+function updateProgressBar() {
+  const progress = Math.min(money / milkshakePrice, 1);
+  elements.progressFill.style.width = `${Math.round(progress * 100)}%`;
+}
+
+function updateButtons() {
+  elements.buyShake.textContent = `🧋 Milk-shake = ${Math.ceil(milkshakePrice)}`;
+  elements.buyUpgrade.textContent = `🔧 Upgrade = ${Math.ceil(upgradePrice)}`;
+  elements.rebirthButton.textContent = `🔄 Rebirth = ${Math.ceil(rebirthPrice)}`;
+
+  elements.buyShake.disabled = money < milkshakePrice;
+  elements.buyUpgrade.disabled = money < upgradePrice;
+  elements.rebirthButton.disabled = money < rebirthPrice;
+}
+
+function updateInfo() {
+  elements.money.textContent = formatMoney(money);
+  elements.milkshakes.textContent = milkshakes;
+  elements.rebirths.textContent = rebirths;
+  updateProgressBar();
+  updateButtons();
+  syncGlobals();
+  saveGame();
+}
+
+function saveGame() {
+  const payload = {
+    money,
+    milkshakes,
+    milkshakeIncome,
+    rebirths,
+    milkshakePrice,
+    upgradePrice,
+    rebirthPrice,
+    turboActive,
+    goldenBananaActive,
+    timeExtenderActive,
+    bananaShieldActive,
+    autoClickers,
+    milkshakeFactories,
+    bananaMagnetLevel
+  };
+
+  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
+}
+
+function loadGame() {
+  const saved = localStorage.getItem(STORAGE_KEY);
+  if (!saved) return;
+
+  const data = JSON.parse(saved);
+  money = Number(data.money) || 0;
+  milkshakes = Number(data.milkshakes) || 0;
+  milkshakeIncome = Number(data.milkshakeIncome) || 0.05;
+  rebirths = Number(data.rebirths) || 0;
+  milkshakePrice = Number(data.milkshakePrice) || 30.0;
+  upgradePrice = Number(data.upgradePrice) || 100.0;
+  rebirthPrice = Number(data.rebirthPrice) || 500.0;
+  turboActive = Boolean(data.turboActive);
+  goldenBananaActive = Boolean(data.goldenBananaActive);
+  timeExtenderActive = Boolean(data.timeExtenderActive);
+  bananaShieldActive = Boolean(data.bananaShieldActive);
+  autoClickers = Number(data.autoClickers) || 0;
+  milkshakeFactories = Number(data.milkshakeFactories) || 0;
+  bananaMagnetLevel = Number(data.bananaMagnetLevel) || 0;
+}
+
 function generateIncome() {
-  money += milkshakes * milkshakeIncome;
-  money = parseFloat(money.toFixed(2)); // Arredonda para 2 casas decimais
+  const factoryIncome = milkshakeFactories * 0.1;
+  money += milkshakes * milkshakeIncome + factoryIncome;
+  money = Number(money.toFixed(2));
   updateInfo();
 }
 
-// Atualiza as informações na tela
-function updateInfo() {
-  document.getElementById('money').textContent = money.toFixed(2);
-  document.getElementById('milkshakes').textContent = milkshakes;
-  document.getElementById('rebirths').textContent = rebirths;
+function addCoinAnimation() {
+  const coin = document.createElement('div');
+  coin.className = 'coin';
+  coin.textContent = '🪙';
+  coin.style.left = `${50 + Math.random() * 10 - 5}%`;
+  coin.style.top = `${45 + Math.random() * 10}%`;
+  document.body.appendChild(coin);
+
+  setTimeout(() => {
+    coin.remove();
+  }, 1000);
+}
+
+function getMagnetChance() {
+  return Math.min(bananaMagnetLevel * magnetChancePerLevel, 0.3);
 }
 
-// Lógica do clique na banana
 function clickBanana() {
-  money += turboActive ? milkshakeIncome * 2 : milkshakeIncome;
-  money = parseFloat(money.toFixed(2));
+  let income = milkshakeIncome;
+  if (turboActive || goldenBananaActive) {
+    income *= 2;
+  }
+
+  if (bananaMagnetLevel > 0 && Math.random() < getMagnetChance()) {
+    income *= 2;
+    showNotification('Banana Magnet! Double coins!', 'conquest');
+  }
+
+  money += income;
+  money = Number(money.toFixed(2));
+  addCoinAnimation();
   updateInfo();
-  trackMission("Click on the banana 100 times");
+  trackMission('Click on the banana 100 times');
   handleRedBananaEvent();
+  startBananaRain();
 }
 
-// Função para comprar Milkshake
 function buyMilkshake() {
-  if (money >= milkshakePrice) {
-    money -= milkshakePrice;
-    milkshakes++;
-    milkshakeIncome += 0.05;
-    milkshakePrice = Math.ceil(milkshakePrice * 1.5);
-    updateInfo();
-    showNotification('You bought a Milkshake!', 'success');
-  } else {
+  if (money < milkshakePrice) {
     showNotification('Not enough coins to buy a milkshake!', 'error');
+    return;
   }
+
+  money -= milkshakePrice;
+  milkshakes += 1;
+  milkshakeIncome += 0.05;
+  milkshakePrice = Math.ceil(milkshakePrice * 1.5);
+  updateInfo();
+  showNotification('You bought a Milkshake!', 'success');
 }
 
-// Função para comprar Upgrade
 function buyUpgrade() {
-  if (money >= upgradePrice) {
-    money -= upgradePrice;
-    milkshakeIncome *= 1.03;
-    upgradePrice = Math.ceil(upgradePrice * 1.8);
-    updateInfo();
-    showNotification('Upgrade purchased successfully!', 'success');
-  } else {
+  if (money < upgradePrice) {
     showNotification('Not enough coins to purchase the Upgrade!', 'error');
+    return;
   }
+
+  money -= upgradePrice;
+  milkshakeIncome *= 1.03;
+  upgradePrice = Math.ceil(upgradePrice * 1.8);
+  updateInfo();
+  trackMission('Buy 5 upgrades');
+  showNotification('Upgrade purchased successfully!', 'success');
 }
 
-// Função de Rebirth
 function performRebirth() {
-  if (money >= rebirthPrice) {
-    money -= rebirthPrice;
-    rebirths++;
-    milkshakes = 0;
-    milkshakeIncome = 0.05;
-    rebirthPrice = Math.ceil(rebirthPrice * 1.8);
-    updateInfo();
-    showNotification('Rebirth successfully completed!', 'success');
-  } else {
+  if (money < rebirthPrice) {
     showNotification('Not enough coins to perform Rebirth!', 'error');
+    return;
   }
+
+  money -= rebirthPrice;
+  rebirths += 1;
+  milkshakes = 0;
+  milkshakeIncome = 0.05;
+  milkshakePrice = 30.0;
+  upgradePrice = 100.0;
+  rebirthPrice = Math.ceil(rebirthPrice * 1.8);
+  updateInfo();
+  trackMission('Complete a Rebirth');
+  showNotification('Rebirth successfully completed!', 'success');
 }
 
-// Função para ativar Auto Clicker
 function buyAutoClicker() {
-  if (money >= 500) {
-    money -= 500;
-    setInterval(() => clickBanana(), 5000); // Auto Clicker ativa a cada 5 segundos
-    updateInfo();
-    showNotification('Auto Clicker activated!', 'success');
-  } else {
+  if (money < 500) {
     showNotification('You dont have enough coins to buy Auto Clicker!', 'error');
+    return;
   }
+
+  money -= 500;
+  autoClickers += 1;
+  updateInfo();
+  showNotification('Auto Clicker activated!', 'success');
 }
 
-// Função para comprar Golden Banana
 function buyGoldenBanana() {
-  if (money >= 800) {
-    money -= 800;
-    const originalIncome = milkshakeIncome;
-    milkshakeIncome *= 2; // Dobra a produção de cliques
-    updateInfo();
-    showNotification('Golden Banana activated!', 'success');
-    setTimeout(() => {
-      milkshakeIncome = originalIncome; // Volta a produção ao normal
-      updateInfo();
-    }, 30000); // Dura 30 segundos
-  } else {
+  if (money < 800) {
     showNotification('You dont have enough coins to buy Golden Banana!', 'error');
+    return;
   }
-}
-
-// Evento Especial: Banana Vermelha
 
-function handleRedBananaEvent() {
-  if (!eventActive) {
-    clickCount++;
-    if (clickCount >= 200) triggerRedBananaEvent();
-  } else {
-    clicksDuringEvent++;
-    if (clicksDuringEvent >= requiredClicks) resetRedBananaEvent(true);
-  }
-}
-
-function triggerRedBananaEvent() {
-  eventActive = true;
-  clickCount = 0;
-  clicksDuringEvent = 0;
-
-  const banana = document.getElementById('banana');
-  const eventMessage = document.createElement('div');
-  eventMessage.id = 'eventMessage';
-  eventMessage.textContent = 'RV has removed all his positions, quick click to get them back!';
-  document.body.appendChild(eventMessage);
-
-  const countdown = document.createElement('div');
-  countdown.id = 'countdown';
-  document.body.appendChild(countdown);
-
-  let timeLeft = 10;
-  countdown.textContent = timeLeft;
-
-  const timer = setInterval(() => {
-    timeLeft--;
-    countdown.textContent = timeLeft;
-    if (timeLeft <= 0) {
-      clearInterval(timer);
-      if (eventActive) resetRedBananaEvent(false);
-    }
-  }, 1000);
-
-  banana.style.color = 'red';
+  money -= 800;
+  goldenBananaActive = true;
+  updateInfo();
+  showNotification('Golden Banana activated!', 'success');
+  setTimeout(() => {
+    goldenBananaActive = false;
+    updateInfo();
+  }, 30000);
 }
 
-function resetRedBananaEvent(success) {
-  eventActive = false;
-
-  const banana = document.getElementById('banana');
-  const eventMessage = document.getElementById('eventMessage');
-  const countdown = document.getElementById('countdown');
-
-  if (eventMessage) eventMessage.remove();
-  if (countdown) countdown.remove();
-
-  banana.style.color = '';
-
-  if (success) {
-    showNotification('You have recovered your positions and earned 25 coins!', 'success');
-    money += 10;
-  } else {
-    showNotification('You failed to recover positions!', 'error');
+function buyMilkshakeFactory() {
+  if (money < 1000) {
+    showNotification('You dont have enough coins to buy Milkshake Factory!', 'error');
+    return;
   }
 
+  money -= 1000;
+  milkshakeFactories += 1;
   updateInfo();
+  showNotification('Milkshake Factory is now producing!', 'success');
 }
 
-// Função para verificar o impacto do Banana Shield no evento de falha
-function handleFailedEvent() {
-  if (bananaShieldActive) {
-    showNotification('The Banana Shield protected you from losing coins!', 'success');
-  } else {
-    money = Math.max(0, money - 20); // Perde 20 moedas em evento falho sem o Banana Shield
-    showNotification('You lost your positions and 20 coins!', 'error');
+function buyBananaMagnet() {
+  if (money < 1200) {
+    showNotification('You dont have enough coins to buy Banana Magnet!', 'error');
+    return;
   }
+
+  money -= 1200;
+  bananaMagnetLevel += 1;
   updateInfo();
+  showNotification('Banana Magnet upgraded!', 'success');
 }
 
-// Função para comprar Time Extender
 function buyTimeExtender() {
-  if (money >= 1500) {
-    money -= 1500;
-    timeExtenderActive = true;
-    showNotification('Time Extender activated! Special events will last 5 seconds longer', 'success');
-    setTimeout(() => {
-      timeExtenderActive = false; // Desativa o Time Extender após 30 segundos
-    }, 30000); // Dura 30 segundos
-    updateInfo();
-  } else {
+  if (money < 1500) {
     showNotification('You dont have enough coins to buy Time Extender!', 'error');
+    return;
   }
+
+  money -= 1500;
+  timeExtenderActive = true;
+  showNotification('Time Extender activated! Special events will last 5 seconds longer', 'success');
+  setTimeout(() => {
+    timeExtenderActive = false;
+  }, 30000);
+  updateInfo();
 }
 
-// Função para comprar Banana Shield
 function buyBananaShield() {
-  if (money >= 2000) {
-    money -= 2000;
-    bananaShieldActive = true;
-    showNotification('Banana Shield activated! You are protected from losing coins in failed events', 'success');
-    setTimeout(() => {
-      bananaShieldActive = false; // Desativa o Banana Shield após 30 segundos
-    }, 30000); // Dura 30 segundos
-    updateInfo();
-  } else {
+  if (money < 2000) {
     showNotification('You dont have enough coins to buy Banana Shield!', 'error');
+    return;
   }
+
+  money -= 2000;
+  bananaShieldActive = true;
+  showNotification('Banana Shield activated! You are protected from losing coins in failed events', 'success');
+  setTimeout(() => {
+    bananaShieldActive = false;
+  }, 30000);
+  updateInfo();
 }
 
-// Função para mostrar notificações de Conquista, Sucesso e Erro
 function showNotification(message, type) {
   const notification = document.createElement('div');
   notification.classList.add('notification', type);
 
-  // Adiciona o emoji de acordo com o tipo de notificação
   const emoji = document.createElement('span');
   emoji.classList.add('emoji');
   if (type === 'success') {
-    emoji.textContent = '✅️'; // Emoji de sucesso
+    emoji.textContent = '✅️';
   } else if (type === 'error') {
-    emoji.textContent = '❌️'; // Emoji de erro
+    emoji.textContent = '❌️';
   } else if (type === 'conquest') {
-    emoji.textContent = '🏆'; // Emoji de troféu para conquista
+    emoji.textContent = '🏆';
   }
 
-  // Cria o texto da notificação
   const text = document.createElement('span');
   text.textContent = message;
 
-  // Adiciona o emoji e o texto à notificação
   notification.appendChild(emoji);
   notification.appendChild(text);
 
   document.body.appendChild(notification);
 
-  // Animação de fade-out após 5 segundos
   setTimeout(() => {
     notification.classList.add('fade-out');
   }, 5000);
 
-  // Remove a notificação após a animação de fade-out
   setTimeout(() => {
     notification.remove();
   }, 5500);
 }
 
-// Missões diárias
-let dailyMissions = [
-  { description: "Click on the banana 100 times", progress: 0, goal: 100, reward: 50 },
-  { description: "Buy 5 upgrades", progress: 0, goal: 5, reward: 100 },
-  { description: "Complete a Rebirth", progress: 0, goal: 1, reward: 200 }
-];
-
-// Função para rastrear o progresso das missões
 function trackMission(missionType) {
-  const mission = dailyMissions.find(m => m.description === missionType);
-  if (mission) {
-    mission.progress++;
-    if (mission.progress >= mission.goal) {
-      showNotification(`Mission Complete: ${mission.description}`, 'conquest');
-      money += mission.reward;
-      mission.progress = 0; // Reseta o progresso após a missão ser completada
-    }
-    updateInfo();
+  const mission = dailyMissions.find((missionItem) => missionItem.description === missionType);
+  if (!mission) return;
+
+  mission.progress += 1;
+  if (mission.progress >= mission.goal) {
+    showNotification(`Mission Complete: ${mission.description}`, 'conquest');
+    money += mission.reward;
+    mission.progress = 0;
   }
+  updateInfo();
 }
 
-// Exemplo de uso dentro do clique da banana
-function clickBanana() {
-  money += turboActive ? milkshakeIncome * 2 : milkshakeIncome;
-  money = parseFloat(money.toFixed(2));
+function handleFailedEvent() {
+  if (bananaShieldActive) {
+    showNotification('The Banana Shield protected you from losing coins!', 'success');
+  } else {
+    money = Math.max(0, money - 20);
+    showNotification('You lost your positions and 20 coins!', 'error');
+  }
   updateInfo();
-
-  // Rastreia a missão "Clique 100 vezes na banana"
-  trackMission("Click on the banana 100 times");
-  handleRedBananaEvent();
 }
 
-// Exemplo de uso dentro da função de Rebirth
-function performRebirth() {
-  if (money >= rebirthPrice) {
-    money -= rebirthPrice;
-    rebirths++;
-    milkshakes = 0;
-    milkshakeIncome = 0.05;
-    rebirthPrice = Math.ceil(rebirthPrice * 1.8);
-    updateInfo();
-
-    // Rastreia a missão "Complete um Rebirth"
-    trackMission("Complete a Rebirth");
-
-    showNotification('Rebirth successfully completed!', 'success');
+function handleRedBananaEvent() {
+  if (!eventActive) {
+    clickCount += 1;
+    if (clickCount >= 200) {
+      triggerRedBananaEvent();
+    }
   } else {
-    showNotification('Not enough coins to perform Rebirth!', 'error');
+    clicksDuringEvent += 1;
+    if (clicksDuringEvent >= requiredClicks) {
+      resetRedBananaEvent(true);
+    }
   }
 }
 
-// Função para mostrar notificações de Conquista, Sucesso e Erro
-function showNotification(message, type) {
-  const notification = document.createElement('div');
-  notification.classList.add('notification', type);
-
-  // Adiciona o emoji de acordo com o tipo de notificação
-  const emoji = document.createElement('span');
-  emoji.classList.add('emoji');
-  if (type === 'success') {
-    emoji.textContent = '✅️'; // Emoji de sucesso
-  } else if (type === 'error') {
-    emoji.textContent = '❌️'; // Emoji de erro
-  } else if (type === 'conquest') {
-    emoji.textContent = '🏆'; // Emoji de troféu para conquista
-  }
+function triggerRedBananaEvent() {
+  eventActive = true;
+  clickCount = 0;
+  clicksDuringEvent = 0;
 
-  // Cria o texto da notificação
-  const text = document.createElement('span');
-  text.textContent = message;
+  const eventMessage = document.createElement('div');
+  eventMessage.id = 'eventMessage';
+  eventMessage.textContent = 'RV has removed all his positions, quick click to get them back!';
+  document.body.appendChild(eventMessage);
 
-  // Adiciona o emoji e o texto à notificação
-  notification.appendChild(emoji);
-  notification.appendChild(text);
+  const countdown = document.createElement('div');
+  countdown.id = 'countdown';
+  document.body.appendChild(countdown);
 
-  document.body.appendChild(notification);
+  let timeLeft = Math.floor(getEventDuration() / 1000);
+  countdown.textContent = timeLeft;
 
-  // Animação de fade-out após 5 segundos
-  setTimeout(() => {
-    notification.classList.add('fade-out');
-  }, 5000);
+  const timer = setInterval(() => {
+    timeLeft -= 1;
+    countdown.textContent = timeLeft;
+    if (timeLeft <= 0) {
+      clearInterval(timer);
+      if (eventActive) {
+        resetRedBananaEvent(false);
+      }
+    }
+  }, 1000);
 
-  // Remove a notificação após a animação de fade-out
-  setTimeout(() => {
-    notification.remove();
-  }, 5500);
+  elements.banana.style.color = 'red';
 }
 
-// Função para atualizar as informações na tela
-function updateInfo() {
-  document.getElementById('money').textContent = money.toFixed(2);
-  document.getElementById('milkshakes').textContent = milkshakes;
-  document.getElementById('rebirths').textContent = rebirths;
+function getEventDuration() {
+  return timeExtenderActive ? baseEventDuration + 5000 : baseEventDuration;
 }
 
-// Referências dos elementos
-const shopButton = document.getElementById('shopButton'); // Botão para abrir a loja
-const shopModal = document.getElementById('shopModal'); // Modal da loja
-const closeShop = document.getElementById('closeShop'); // Botão para fechar a loja
-
-// Função para abrir a loja
-function openShop() {
-  shopModal.style.display = 'block'; // Exibe o modal
-  document.body.style.overflow = 'hidden'; // Desabilita o scroll quando o modal está aberto
-}
+function resetRedBananaEvent(success) {
+  eventActive = false;
 
-// Função para fechar a loja
-function closeShopModal() {
-  shopModal.style.display = 'none'; // Esconde o modal
-  document.body.style.overflow = 'auto'; // Habilita o scroll novamente
-}
+  const eventMessage = document.getElementById('eventMessage');
+  const countdown = document.getElementById('countdown');
 
-// Evento para abrir a loja ao clicar no botão
-shopButton.addEventListener('click', openShop);
+  if (eventMessage) eventMessage.remove();
+  if (countdown) countdown.remove();
 
-// Evento para fechar a loja ao clicar no botão de fechar
-closeShop.addEventListener('click', closeShopModal);
+  elements.banana.style.color = '';
 
-// Ajuste: Fechar modal ao clicar fora do conteúdo do modal
-shopModal.addEventListener('click', (event) => {
-  if (event.target === shopModal) {
-    closeShopModal(); // Fecha a loja somente se o clique for fora do conteúdo do modal
+  if (success) {
+    showNotification('You have recovered your positions and earned 25 coins!', 'success');
+    money += 25;
+  } else {
+    handleFailedEvent();
   }
-});
 
-// Função que começa a chuva de bananas
+  updateInfo();
+}
+
 function startBananaRain() {
   if (bananaRainActive) return;
 
   bananaRainActive = true;
-  
+
   const interval = setInterval(() => {
     if (rainCount >= maxBananas) {
-      clearInterval(interval); // Para a chuva se atingir o máximo de bananas
+      clearInterval(interval);
       bananaRainActive = false;
+      return;
     }
 
-    // Cria um novo emoji de banana
     const bananaEmoji = document.createElement('div');
     bananaEmoji.classList.add('banana-emoji');
     bananaEmoji.textContent = '🍌';
 
-    // Define a posição inicial aleatória do emoji na parte superior
     const randomX = Math.random() * window.innerWidth;
     bananaEmoji.style.left = `${randomX}px`;
 
-    // Adiciona o emoji à tela
     bananaContainer.appendChild(bananaEmoji);
+    rainCount += 1;
 
-    // Incrementa o contador de bananas
-    rainCount++;
-
-    // Remove o emoji da tela após ele terminar a animação
     setTimeout(() => {
       bananaEmoji.remove();
-      rainCount--; // Decrementa o contador
-    }, 3000); // 3 segundos depois que o emoji termina sua animação
-  }, 100); // Dispara a cada 100ms para criar a animação
+      rainCount -= 1;
+    }, 3000);
+  }, 100);
 }
 
-// Função de clique na banana
-function clickBanana() {
-  money += milkshakeIncome;
-  money = parseFloat(money.toFixed(2));
+function openShop() {
+  elements.shopModal.style.display = 'block';
+  document.body.style.overflow = 'hidden';
+}
+
+function closeShopModal() {
+  elements.shopModal.style.display = 'none';
+  document.body.style.overflow = 'auto';
+}
+
+function bindEvents() {
+  elements.shopButton.addEventListener('click', openShop);
+  elements.closeShop.addEventListener('click', closeShopModal);
+
+  elements.shopModal.addEventListener('click', (event) => {
+    if (event.target === elements.shopModal) {
+      closeShopModal();
+    }
+  });
+
+  elements.banana.addEventListener('keydown', (event) => {
+    if (event.key === 'Enter' || event.key === ' ') {
+      event.preventDefault();
+      clickBanana();
+    }
+  });
+}
+
+function startAutoClickers() {
+  setInterval(() => {
+    if (autoClickers <= 0) return;
+
+    for (let i = 0; i < autoClickers; i += 1) {
+      clickBanana();
+    }
+  }, 5000);
+}
+
+function initGame() {
+  loadGame();
+  bindEvents();
   updateInfo();
-  trackMission("Click on the banana 100 times");
-  handleRedBananaEvent();
+  startAutoClickers();
+  setInterval(generateIncome, 1000);
+}
 
-  // Inicia a chuva de bananas quando o jogador clicar
-  startBananaRain();
-}
\ No newline at end of file
+initGame();
 
EOF
)
