// Configuration du Bot Twitch Drakkar
require('dotenv').config();

module.exports = {
  // Configuration de base
  BOT_USERNAME: 'drakkarbot',
  OAUTH_TOKEN: process.env.OAUTH_TOKEN || 'oauth:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  CHANNEL: 'Sopralus',
  
  // Configuration API Twitch (pour les timeouts et abonnements)
  TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID || 'gou2n3f8ufocqls0fd4gc89u8i4w55',
  TWITCH_ACCESS_TOKEN: process.env.TWITCH_ACCESS_TOKEN || 'Bearer xiiwla1vm55m3wlc8m63z3fa2aknsk',
  
  // Configuration des timeouts (en secondes)
  MIN_TIMEOUT: 60,   // 1 minute
  MAX_TIMEOUT: 300,  // 5 minutes
  
  // Messages du bot
  MESSAGES: {
    COMMAND_USAGE: 'Usage: !drakar @utilisateur',
    INVALID_TARGET: 'Cible invalide. Utilisez: !drakar @utilisateur',
    SELF_TARGET: 'Vous ne pouvez pas vous défier vous-même !',
    TARGET_NOT_FOUND: 'Utilisateur non trouvé dans le chat.',
    DUEL_START: '⚔️ Duel drakar lancé ! @{challenger} vs @{target}',
    DUEL_WINNER: '🏆 @{winner} remporte le duel !',
    DUEL_LOSER: '💀 @{loser} perd et prend un timeout de {timeout} minutes !',
    ALREADY_IN_DUEL: 'Un duel est déjà en cours ! Attendez qu\'il se termine.',
    DAILY_LIMIT_REACHED: '⏰ Limite de {limit} duels par jour atteinte. Reset dans {time}.',
    DUELS_REMAINING: '📊 Duels restants: {challenger} ({challengerRemaining}), {target} ({targetRemaining})',
    NEW_WR_TOTAL_WINS: '🌟 NOUVEAU WORLD RECORD ! @{username} détient maintenant le record de victoires totales avec {value} victoires ! 🏆',
    NEW_WR_WIN_STREAK: '🔥 NOUVEAU WORLD RECORD ! @{username} détient maintenant le record de série de victoires avec {value} victoires consécutives ! 🔥'
  }
};
