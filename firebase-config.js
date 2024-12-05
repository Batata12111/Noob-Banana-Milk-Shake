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