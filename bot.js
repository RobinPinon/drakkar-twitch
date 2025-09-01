const tmi = require('tmi.js');
const config = require('./config');
const TwitchAPI = require('./twitch-api');
const fs = require('fs');
const path = require('path');

// Configuration du client TMI
const client = new tmi.Client({
  options: { debug: true },
  identity: {
    username: config.BOT_USERNAME,
    password: config.OAUTH_TOKEN
  },
  channels: [config.CHANNEL]
});

// Variables globales
let isDuelActive = false;
let currentDuel = null;
const twitchAPI = new TwitchAPI();

// Système de limitation des duels par jour
const dailyDuels = new Map(); // username -> { count: number, lastReset: Date, isSubscriber: boolean }
const MAX_DUELS_PER_DAY = 5; // Duels de base par jour
const SUBSCRIBER_BONUS = 5; // Bonus de +5 duels pour les abonnés
const DAY_IN_MS = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

// Système de WR et leaderboard
const leaderboard = new Map(); // username -> { wins: number, losses: number, winStreak: number, bestWinStreak: number, totalDuels: number }
const WR_HOLDERS = new Map(); // type -> { username: string, value: number, date: Date }

// Fichiers de sauvegarde
const DATA_DIR = './data';
const LEADERBOARD_FILE = path.join(DATA_DIR, 'leaderboard.json');
const WR_FILE = path.join(DATA_DIR, 'worldrecords.json');
const DAILY_DUELS_FILE = path.join(DATA_DIR, 'dailyduels.json');

// Créer le dossier data s'il n'existe pas
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Fonction pour sauvegarder les données
function saveData() {
  try {
    // Sauvegarder le leaderboard
    const leaderboardData = Object.fromEntries(leaderboard);
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(leaderboardData, null, 2));
    
    // Sauvegarder les World Records
    const wrData = Object.fromEntries(WR_HOLDERS);
    fs.writeFileSync(WR_FILE, JSON.stringify(wrData, null, 2));
    
    // Sauvegarder les duels quotidiens
    const dailyDuelsData = Object.fromEntries(dailyDuels);
    fs.writeFileSync(DAILY_DUELS_FILE, JSON.stringify(dailyDuelsData, null, 2));
    
    console.log('💾 Données sauvegardées avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde:', error);
  }
}

// Fonction pour charger les données sauvegardées
function loadData() {
  try {
    // Charger le leaderboard
    if (fs.existsSync(LEADERBOARD_FILE)) {
      const leaderboardData = JSON.parse(fs.readFileSync(LEADERBOARD_FILE, 'utf8'));
      Object.entries(leaderboardData).forEach(([username, data]) => {
        // Convertir les dates string en objets Date
        if (data.lastDuel) {
          data.lastDuel = new Date(data.lastDuel);
        }
        leaderboard.set(username, data);
      });
      console.log(`📊 Leaderboard chargé: ${leaderboard.size} utilisateurs`);
    }
    
    // Charger les World Records
    if (fs.existsSync(WR_FILE)) {
      const wrData = JSON.parse(fs.readFileSync(WR_FILE, 'utf8'));
      Object.entries(wrData).forEach(([type, data]) => {
        // Convertir les dates string en objets Date
        if (data.date) {
          data.date = new Date(data.date);
        }
        WR_HOLDERS.set(type, data);
      });
      console.log(`🏆 World Records chargés: ${WR_HOLDERS.size} records`);
    }
    
          // Charger les duels quotidiens
      if (fs.existsSync(DAILY_DUELS_FILE)) {
        const dailyDuelsData = JSON.parse(fs.readFileSync(DAILY_DUELS_FILE, 'utf8'));
        Object.entries(dailyDuelsData).forEach(([username, data]) => {
          // Convertir les dates string en objets Date
          if (data.lastReset) {
            data.lastReset = new Date(data.lastReset);
          }
          // Ajouter le statut abonné s'il n'existe pas (pour la compatibilité)
          if (data.isSubscriber === undefined) {
            data.isSubscriber = false;
          }
          dailyDuels.set(username, data);
        });
        console.log(`📅 Duels quotidiens chargés: ${dailyDuels.size} utilisateurs`);
      }
    
    console.log('✅ Données chargées avec succès');
  } catch (error) {
    console.error('❌ Erreur lors du chargement des données:', error);
  }
}

// Fonction pour formater les messages avec des variables
function formatMessage(message, variables) {
  return message.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key] || match;
  });
}

// Fonction pour vérifier et mettre à jour les duels quotidiens
async function checkDailyDuels(username) {
  const now = new Date();
  const userData = dailyDuels.get(username);
  
  // Vérifier le statut abonné (mise à jour quotidienne)
  let isSubscriber = false;
  try {
    isSubscriber = await twitchAPI.isSubscriber(username);
  } catch (error) {
    console.log(`⚠️ Impossible de vérifier le statut abonné de ${username}:`, error.message);
    // Utiliser l'ancien statut si disponible
    if (userData) {
      isSubscriber = userData.isSubscriber || false;
    }
  }
  
  // Calculer la limite totale (base + bonus abonné)
  const totalLimit = MAX_DUELS_PER_DAY + (isSubscriber ? SUBSCRIBER_BONUS : 0);
  
  // Si c'est le premier duel de l'utilisateur
  if (!userData) {
    dailyDuels.set(username, { count: 1, lastReset: now, isSubscriber });
    return { canDuel: true, remaining: totalLimit - 1, isSubscriber, totalLimit };
  }
  
  // Vérifier si c'est un nouveau jour ou si le statut abonné a changé
  const timeSinceReset = now - userData.lastReset;
  const statusChanged = userData.isSubscriber !== isSubscriber;
  
  if (timeSinceReset >= DAY_IN_MS || statusChanged) {
    // Nouveau jour ou changement de statut, reset du compteur
    dailyDuels.set(username, { count: 1, lastReset: now, isSubscriber });
    return { canDuel: true, remaining: totalLimit - 1, isSubscriber, totalLimit };
  }
  
  // Même jour, vérifier la limite
  if (userData.count >= totalLimit) {
    return { canDuel: false, remaining: 0, isSubscriber, totalLimit };
  }
  
  // Incrémenter le compteur
  userData.count++;
  userData.isSubscriber = isSubscriber; // Mettre à jour le statut
  dailyDuels.set(username, userData);
  
  // Sauvegarder les duels quotidiens
  saveData();
  
  return { canDuel: true, remaining: totalLimit - userData.count, isSubscriber, totalLimit };
}

// Fonction pour obtenir le temps restant avant reset
function getTimeUntilReset(lastReset) {
  const now = new Date();
  const timeSinceReset = now - lastReset;
  const timeUntilReset = DAY_IN_MS - timeSinceReset;
  
  const hours = Math.floor(timeUntilReset / (60 * 60 * 1000));
  const minutes = Math.floor((timeUntilReset % (60 * 60 * 1000)) / (60 * 1000));
  
  return `${hours}h ${minutes}m`;
}

// Fonction pour initialiser un utilisateur dans le leaderboard
function initUserInLeaderboard(username) {
  if (!leaderboard.has(username)) {
    leaderboard.set(username, {
      wins: 0,
      losses: 0,
      winStreak: 0,
      bestWinStreak: 0,
      totalDuels: 0
    });
  }
}

// Fonction pour mettre à jour le leaderboard après un duel
function updateLeaderboard(winner, loser) {
  // Initialiser les utilisateurs s'ils n'existent pas
  initUserInLeaderboard(winner);
  initUserInLeaderboard(loser);
  
  const winnerData = leaderboard.get(winner);
  const loserData = leaderboard.get(loser);
  
  // Mettre à jour le gagnant
  winnerData.wins++;
  winnerData.winStreak++;
  winnerData.totalDuels++;
  if (winnerData.winStreak > winnerData.bestWinStreak) {
    winnerData.bestWinStreak = winnerData.winStreak;
  }
  
  // Mettre à jour le perdant
  loserData.losses++;
  loserData.winStreak = 0;
  loserData.totalDuels++;
  
  // Vérifier les WR potentiels
  checkWorldRecords(winner, winnerData);
  
  // Sauvegarder automatiquement après chaque mise à jour
  saveData();
}

// Fonction pour vérifier les World Records
function checkWorldRecords(username, userData) {
  const now = new Date();
  
  // WR Victoires totales
  const currentWinsWR = WR_HOLDERS.get('totalWins');
  if (!currentWinsWR || userData.wins > currentWinsWR.value) {
    WR_HOLDERS.set('totalWins', { username, value: userData.wins, date: now });
    return { type: 'totalWins', value: userData.wins, isNew: true };
  }
  
  // WR Meilleure série de victoires
  const currentStreakWR = WR_HOLDERS.get('bestWinStreak');
  if (!currentStreakWR || userData.bestWinStreak > currentStreakWR.value) {
    WR_HOLDERS.set('bestWinStreak', { username, value: userData.bestWinStreak, date: now });
    return { type: 'bestWinStreak', value: userData.bestWinStreak, isNew: true };
  }
  
  return null;
}

// Fonction pour obtenir le top 5 du leaderboard
function getTopLeaderboard(limit = 5) {
  const sortedUsers = Array.from(leaderboard.entries())
    .sort(([, a], [, b]) => {
      // Trier par ratio de victoire (victoires / total), puis par victoires totales
      const ratioA = a.totalDuels > 0 ? a.wins / a.totalDuels : 0;
      const ratioB = b.totalDuels > 0 ? b.wins / b.totalDuels : 0;
      
      if (ratioA !== ratioB) return ratioB - ratioA;
      return b.wins - a.wins;
    })
    .slice(0, limit);
  
  return sortedUsers;
}

// Fonction pour formater le leaderboard
function formatLeaderboard() {
  const topUsers = getTopLeaderboard(5);
  let message = '🏆 **LEADERBOARD TOP 5** 🏆\n';
  
  topUsers.forEach(([username, data], index) => {
    const ratio = data.totalDuels > 0 ? ((data.wins / data.totalDuels) * 100).toFixed(1) : 0;
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
    message += `${medal} ${username}: ${data.wins}W/${data.losses}L (${ratio}% WR) | Série: ${data.bestWinStreak}\n`;
  });
  
  return message;
}

// Fonction pour afficher les World Records
function formatWorldRecords() {
  let message = '🌟 **WORLD RECORDS** 🌟\n';
  
  const totalWinsWR = WR_HOLDERS.get('totalWins');
  if (totalWinsWR) {
    const dateStr = totalWinsWR.date.toLocaleDateString('fr-FR');
    message += `🏆 Victoires totales: @${totalWinsWR.username} (${totalWinsWR.value}) - ${dateStr}\n`;
  }
  
  const bestStreakWR = WR_HOLDERS.get('bestWinStreak');
  if (bestStreakWR) {
    const dateStr = bestStreakWR.date.toLocaleDateString('fr-FR');
    message += `🔥 Meilleure série: @${bestStreakWR.username} (${bestStreakWR.value}) - ${dateStr}\n`;
  }
  
  return message;
}

// Fonction pour obtenir le rang d'un utilisateur dans le leaderboard
function getUserRank(username) {
  const sortedUsers = Array.from(leaderboard.entries())
    .sort(([, a], [, b]) => {
      // Trier par ratio de victoire (victoires / total), puis par victoires totales
      const ratioA = a.totalDuels > 0 ? a.wins / a.totalDuels : 0;
      const ratioB = b.totalDuels > 0 ? b.wins / b.totalDuels : 0;
      
      if (ratioA !== ratioB) return ratioB - ratioA;
      return b.wins - a.wins;
    });
  
  const userIndex = sortedUsers.findIndex(([name]) => name === username);
  if (userIndex === -1) return 'N/A';
  
  const rank = userIndex + 1;
  if (rank === 1) return '🥇 1er';
  if (rank === 2) return '🥈 2ème';
  if (rank === 3) return '🥉 3ème';
  return `${rank}ème`;
}

// Fonction pour générer un timeout aléatoire
function getRandomTimeout() {
  const minSeconds = config.MIN_TIMEOUT;
  const maxSeconds = config.MAX_TIMEOUT;
  const randomSeconds = Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds;
  return Math.ceil(randomSeconds / 60); // Retourne en minutes
}

// Fonction pour démarrer un duel
async function startDuel(challenger, target) {
  if (isDuelActive) {
    client.say(config.CHANNEL, config.MESSAGES.ALREADY_IN_DUEL);
    return;
  }

  // Vérifier les limitations quotidiennes UNIQUEMENT pour l'attaquant (challenger)
  const challengerLimits = await checkDailyDuels(challenger);
  if (!challengerLimits.canDuel) {
    const userData = dailyDuels.get(challenger);
    const timeUntilReset = getTimeUntilReset(userData.lastReset);
    const subscriberText = challengerLimits.isSubscriber ? ' (Abonné: +5 duels)' : '';
    client.say(config.CHANNEL, `⏰ @${challenger}, vous avez atteint votre limite de ${challengerLimits.totalLimit} duels par jour${subscriberText}. Reset dans ${timeUntilReset}.`);
    return;
  }

  // La cible n'a pas de limitation quotidienne - elle peut être attaquée autant de fois que voulu

  isDuelActive = true;
  currentDuel = { challenger, target, startTime: Date.now() };

  const startMessage = formatMessage(config.MESSAGES.DUEL_START, {
    challenger: challenger,
    target: target
  });
  
  client.say(config.CHANNEL, startMessage);
  // Attendre 3 secondes avant de déterminer le vainqueur
  setTimeout(() => {
    endDuel();
  }, 3000);
}

// Fonction pour terminer un duel
async function endDuel() {
  if (!currentDuel) return;

  const { challenger, target } = currentDuel;
  
  // 50-50 chance (avec protection pour sopralus et ekapsos)
  let winner, loser;
  
  // Si sopralus ou ekapsos participe au duel, il gagne toujours
  if (challenger.toLowerCase() === 'sopralus' || challenger.toLowerCase() === 'ekapsos') {
    winner = challenger;
    loser = target;
  } else if (target.toLowerCase() === 'sopralus' || target.toLowerCase() === 'ekapsos') {
    winner = target;
    loser = challenger;
  } else {
    // Sinon, 50-50 normal
    winner = Math.random() < 0.5 ? challenger : target;
    loser = winner === challenger ? target : challenger;
  }
  const timeoutMinutes = getRandomTimeout();

  // Mettre à jour le leaderboard
  updateLeaderboard(winner, loser);
  
  // Vérifier les WR potentiels
  const wrResult = checkWorldRecords(winner, leaderboard.get(winner));
  
  // Messages de fin
  const winnerMessage = formatMessage(config.MESSAGES.DUEL_WINNER, { winner });
  const loserMessage = formatMessage(config.MESSAGES.DUEL_LOSER, { 
    loser, 
    timeout: timeoutMinutes 
  });

  client.say(config.CHANNEL, winnerMessage);
  client.say(config.CHANNEL, loserMessage);
  
  // Afficher les stats du gagnant
  const winnerStats = leaderboard.get(winner);
  const winRatio = ((winnerStats.wins / winnerStats.totalDuels) * 100).toFixed(1);

  // Appliquer le vrai timeout via l'API Twitch
  const timeoutSeconds = timeoutMinutes * 60;
  const timeoutSuccess = await twitchAPI.timeoutUser(loser, timeoutSeconds, 'Duel drakar - Défaite');
  
  if (timeoutSuccess) {
    console.log(`✅ Timeout de ${loser} appliqué pour ${timeoutMinutes} minutes`);
  } else {
    console.log(`❌ Échec de l'application du timeout à ${loser}`);
    client.say(config.CHANNEL, `⚠️ Impossible d'appliquer le timeout à ${loser}. Vérifiez les permissions du bot.`);
  }
  
  // Réinitialiser le duel
  isDuelActive = false;
  currentDuel = null;
}

// Gestion des événements de connexion
client.on('connected', (addr, port) => {
  console.log(`🤖 Bot connecté à ${addr}:${port}`);
  console.log(`📺 Rejoins le canal: ${config.CHANNEL}`);
});

// Gestion des erreurs
client.on('disconnected', (reason) => {
  console.log(`❌ Bot déconnecté: ${reason}`);
});

// Gestion des messages du chat
client.on('message', async (channel, tags, message, self) => {
  // Ignorer les messages du bot
  if (self) return;

  const username = tags.username;
  const messageLower = message.toLowerCase();

  // Commande !drakar
  if (messageLower.startsWith('!drakar')) {
    const args = message.split(' ');
    
    if (args.length !== 2) {
      client.say(channel, config.MESSAGES.COMMAND_USAGE);
      return;
    }

    let target = args[1];
    
    // Nettoyer le nom de la cible (enlever @ si présent)
    if (target.startsWith('@')) {
      target = target.substring(1);
    }

    // Vérifications
    if (!target || target.trim() === '') {
      client.say(channel, config.MESSAGES.INVALID_TARGET);
      return;
    }

    if (target.toLowerCase() === username.toLowerCase()) {
      client.say(channel, config.MESSAGES.SELF_TARGET);
      return;
    }

    // Démarrer le duel
    startDuel(username, target);
  }
  
  // Commande !duels pour vérifier ses duels restants
  if (messageLower.startsWith('!duels')) {
    const userData = dailyDuels.get(username);
    if (!userData) {
      // Vérifier le statut abonné en temps réel
      try {
        const isSubscriber = await twitchAPI.isSubscriber(username);
        const totalLimit = MAX_DUELS_PER_DAY + (isSubscriber ? SUBSCRIBER_BONUS : 0);
        const subscriberText = isSubscriber ? ' (Abonné: +5 duels)' : '';
        client.say(channel, `📊 @${username}, vous n'avez pas encore lancé de duel aujourd'hui. Limite: ${totalLimit} duels par jour${subscriberText}.`);
      } catch (error) {
        // Fallback si l'API échoue
        client.say(channel, `📊 @${username}, vous n'avez pas encore lancé de duel aujourd'hui. Limite: ${MAX_DUELS_PER_DAY} duels par jour.`);
      }
    } else {
      const timeUntilReset = getTimeUntilReset(userData.lastReset);
      const totalLimit = MAX_DUELS_PER_DAY + (userData.isSubscriber ? SUBSCRIBER_BONUS : 0);
      const subscriberText = userData.isSubscriber ? ' (Abonné: +5 duels)' : '';
      client.say(channel, `📊 @${username}, vous avez lancé ${userData.count}/${totalLimit} duels aujourd'hui${subscriberText}. Reset dans ${timeUntilReset}.`);
    }
  }
  
  // Commande !stats pour voir ses statistiques
  if (messageLower.startsWith('!stats')) {
    const userData = leaderboard.get(username);
    if (!userData || userData.totalDuels === 0) {
      client.say(channel, `📊 @${username}, vous n'avez pas encore participé à de duel.`);
    } else {
      const winRatio = ((userData.wins / userData.totalDuels) * 100).toFixed(1);
      client.say(channel, `📊 @${username}: ${userData.wins}W/${userData.losses}L (${winRatio}% WR) | Série actuelle: ${userData.winStreak} | Meilleure série: ${userData.bestWinStreak} | Total: ${userData.totalDuels} duels | Position: ${getUserRank(username)}`);
    }
  }
  
  // Commande !top pour voir le leaderboard
  if (messageLower.startsWith('!top')) {
    const leaderboardMsg = formatLeaderboard();
    // Diviser le message en plusieurs parties si trop long
    const lines = leaderboardMsg.split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        client.say(channel, line);
      }
    });
  }
  
  // Commande !records pour voir les World Records globaux
  if (messageLower.startsWith('!records')) {
    const wrMsg = formatWorldRecords();
    const lines = wrMsg.split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        client.say(channel, line);
      }
    });
  }
  
  // Commande !help pour afficher toutes les commandes disponibles
  if (messageLower.startsWith('!help')) {
    const helpMessage = '🌟 **COMMANDES DISPONIBLES** 🌟 | ⚔️ !drakar @utilisateur - Lancer un duel | 📊 !duels - Vérifier vos duels restants (5/jour +5 si abonné) | 📈 !stats - Vos statistiques personnelles | 🏆 !top - Leaderboard top 5 | 🔥 !records - World Records globaux | ❓ !help - Afficher cette liste';
    client.say(channel, helpMessage);
  }
});

// Gestion des commandes de modération (pour les timeouts réels)
client.on('timeout', (channel, username, reason, duration, tags) => {
  console.log(`⏰ Timeout: ${username} pour ${duration} secondes. Raison: ${reason}`);
});

// Gestion des commandes de modération
client.on('ban', (channel, username, reason, tags) => {
  console.log(`🚫 Ban: ${username}. Raison: ${reason}`);
});

// Fonction pour se connecter
function connect() {
  try {
    client.connect();
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    setTimeout(connect, 5000); // Réessayer dans 5 secondes
  }
}

// Sauvegarde automatique toutes les 5 minutes
setInterval(() => {
  saveData();
}, 5 * 60 * 1000); // 5 minutes

// Sauvegarde lors de l'arrêt du bot
process.on('SIGINT', () => {
  console.log('\n🔄 Arrêt du bot...');
  saveData();
  console.log('💾 Données sauvegardées. Au revoir ! 👋');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Arrêt du bot...');
  saveData();
  console.log('💾 Données sauvegardées. Au revoir ! 👋');
  process.exit(0);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Exception non capturée:', error);
  saveData(); // Sauvegarder avant de quitter
  process.exit(1);
});

// Démarrer le bot
async function startBot() {
  console.log('🚀 Démarrage du Bot drakar...');
  console.log('📝 Assurez-vous d\'avoir configuré config.js avec vos informations Twitch');
  
  // Charger les données sauvegardées
  console.log('📂 Chargement des données sauvegardées...');
  loadData();
  
  // Tester la connexion à l'API Twitch
  console.log('🔍 Test de connexion à l\'API Twitch...');
  const apiConnected = await twitchAPI.testConnection();
  
  if (apiConnected) {
    console.log('✅ Connexion à l\'API Twitch réussie');
    
    // Vérifier les permissions de modération
    console.log('🔍 Vérification des permissions de modération...');
    const isModerator = await twitchAPI.isModerator();
    
    if (isModerator) {
      console.log('✅ Bot modérateur - Les timeouts fonctionneront !');
    } else {
      console.log('⚠️ Bot non modérateur - Les timeouts ne fonctionneront pas');
      console.log('💡 Ajoutez drakarbot comme modérateur sur votre chaîne');
    }
    
    // Obtenir les infos de la chaîne
    try {
      const channelInfo = await twitchAPI.getChannelInfo();
      if (channelInfo) {
        console.log(`📺 Chaîne: ${channelInfo.displayName} - ${channelInfo.title || 'Aucun titre'}`);
      }
    } catch (error) {
      console.log('⚠️ Impossible de récupérer les infos de la chaîne');
    }
    
    connect();
  } else {
    console.log('❌ Échec de la connexion à l\'API Twitch');
    console.log('⚠️ Les timeouts ne fonctionneront pas. Vérifiez votre configuration.');
    console.log('📝 Assurez-vous d\'avoir configuré TWITCH_CLIENT_ID et TWITCH_ACCESS_TOKEN');
    // Continuer quand même pour le chat
    connect();
  }
}

startBot();
