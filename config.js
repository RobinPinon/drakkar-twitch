// Configuration du Bot Twitch Drakkar
module.exports = {
  // Remplacez ces valeurs par vos informations
  BOT_USERNAME: 'drakkarbot',
  OAUTH_TOKEN: 'rz2l10i41ypju53eggmohdv8kfq6vx', // Remplacez par votre token OAuth
  CHANNEL: 'Sopralus', // Remplacez par le nom de votre chaîne
  
  // Configuration API Twitch (pour les timeouts)
  TWITCH_CLIENT_ID: 'gou2n3f8ufocqls0fd4gc89u8i4w55', // ID de votre application Twitch
  TWITCH_ACCESS_TOKEN: 'Bearer 7ird2g5apktlcdc68v9ybtdgznqwwe', // Token d'accès pour l'API (commence par 'Bearer')
  
  // Configuration des timeouts (en secondes)
  MIN_TIMEOUT: 60,   // 1 minute
  MAX_TIMEOUT: 300,  // 5 minutes
  
  // Messages du bot
  MESSAGES: {
    COMMAND_USAGE: 'Usage: !drakkar @utilisateur',
    INVALID_TARGET: 'Cible invalide. Utilisez: !drakkar @utilisateur',
    SELF_TARGET: 'Vous ne pouvez pas vous défier vous-même !',
    TARGET_NOT_FOUND: 'Utilisateur non trouvé dans le chat.',
    DUEL_START: '⚔️ Duel Drakkar lancé ! @{challenger} vs @{target}',
    DUEL_WINNER: '🏆 @{winner} remporte le duel !',
    DUEL_LOSER: '💀 @{loser} perd et prend un timeout de {timeout} minutes !',
    ALREADY_IN_DUEL: 'Un duel est déjà en cours ! Attendez qu\'il se termine.',
    DAILY_LIMIT_REACHED: '⏰ Limite de {limit} duels par jour atteinte. Reset dans {time}.',
    DUELS_REMAINING: '📊 Duels restants: {challenger} ({challengerRemaining}), {target} ({targetRemaining})',
    NEW_WR_TOTAL_WINS: '🌟 NOUVEAU WORLD RECORD ! @{username} détient maintenant le record de victoires totales avec {value} victoires ! 🏆',
    NEW_WR_WIN_STREAK: '🔥 NOUVEAU WORLD RECORD ! @{username} détient maintenant le record de série de victoires avec {value} victoires consécutives ! 🔥'
  }
};
