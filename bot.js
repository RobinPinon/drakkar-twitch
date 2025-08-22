const tmi = require('tmi.js');
const config = require('./config');
const TwitchAPI = require('./twitch-api');

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

// Fonction pour formater les messages avec des variables
function formatMessage(message, variables) {
  return message.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key] || match;
  });
}

// Fonction pour générer un timeout aléatoire
function getRandomTimeout() {
  const minSeconds = config.MIN_TIMEOUT;
  const maxSeconds = config.MAX_TIMEOUT;
  const randomSeconds = Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds;
  return Math.ceil(randomSeconds / 60); // Retourne en minutes
}

// Fonction pour démarrer un duel
function startDuel(challenger, target) {
  if (isDuelActive) {
    client.say(config.CHANNEL, config.MESSAGES.ALREADY_IN_DUEL);
    return;
  }

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
  
  // 50-50 chance (avec protection pour sopralus)
  let winner, loser;
  
  // Si sopralus participe au duel, il gagne toujours
  if (challenger.toLowerCase() === 'sopralus') {
    winner = challenger;
    loser = target;
  } else if (target.toLowerCase() === 'sopralus') {
    winner = target;
    loser = challenger;
  } else {
    // Sinon, 50-50 normal
    winner = Math.random() < 0.5 ? challenger : target;
    loser = winner === challenger ? target : challenger;
  }
  const timeoutMinutes = getRandomTimeout();

  // Messages de fin
  const winnerMessage = formatMessage(config.MESSAGES.DUEL_WINNER, { winner });
  const loserMessage = formatMessage(config.MESSAGES.DUEL_LOSER, { 
    loser, 
    timeout: timeoutMinutes 
  });

  client.say(config.CHANNEL, winnerMessage);
  client.say(config.CHANNEL, loserMessage);

  // Appliquer le vrai timeout via l'API Twitch
  const timeoutSeconds = timeoutMinutes * 60;
  const timeoutSuccess = await twitchAPI.timeoutUser(loser, timeoutSeconds, 'Duel Drakkar - Défaite');
  
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
client.on('message', (channel, tags, message, self) => {
  // Ignorer les messages du bot
  if (self) return;

  const username = tags.username;
  const messageLower = message.toLowerCase();

  // Commande !drakkar
  if (messageLower.startsWith('!drakkar')) {
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

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Exception non capturée:', error);
  process.exit(1);
});

// Démarrer le bot
async function startBot() {
  console.log('🚀 Démarrage du Bot Drakkar...');
  console.log('📝 Assurez-vous d\'avoir configuré config.js avec vos informations Twitch');
  
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
      console.log('💡 Ajoutez drakkarbot comme modérateur sur votre chaîne');
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
