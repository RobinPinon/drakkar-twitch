// Configuration d'exemple pour le Bot Twitch Drakkar
// Copiez ce fichier vers config.js et remplissez vos informations

module.exports = {
  // ⚠️ REMPLACEZ CES VALEURS PAR VOS INFORMATIONS
  
  // Nom d'utilisateur de votre bot Twitch
  BOT_USERNAME: 'drakkarbot',
  
  // Token OAuth de votre bot (commence par 'oauth:')
  // Obtenez-le sur: https://dev.twitch.tv/console
  OAUTH_TOKEN: 'oauth:your_oauth_token_here',
  
  // Nom de votre chaîne Twitch (sans @)
  CHANNEL: 'your_channel_name_here',
  
  // Configuration API Twitch (pour les timeouts)
  TWITCH_CLIENT_ID: 'your_client_id_here', // ID de votre application Twitch
  TWITCH_ACCESS_TOKEN: 'Bearer your_access_token_here', // Token d'accès pour l'API (commence par 'Bearer')
  
  // Configuration des timeouts (en secondes)
  MIN_TIMEOUT: 60,   // 1 minute minimum
  MAX_TIMEOUT: 900,  // 15 minutes maximum
  
  // Messages du bot (personnalisables)
  MESSAGES: {
    COMMAND_USAGE: 'Usage: !drakkar @utilisateur',
    INVALID_TARGET: 'Cible invalide. Utilisez: !drakkar @utilisateur',
    SELF_TARGET: 'Vous ne pouvez pas vous défier vous-même !',
    TARGET_NOT_FOUND: 'Utilisateur non trouvé dans le chat.',
    DUEL_START: '⚔️ Duel Drakkar lancé ! @{challenger} vs @{target}',
    DUEL_WINNER: '🏆 @{winner} remporte le duel !',
    DUEL_LOSER: '💀 @{loser} perd et prend un timeout de {timeout} minutes !',
    ALREADY_IN_DUEL: 'Un duel est déjà en cours ! Attendez qu\'il se termine.'
  }
};

/*
INSTRUCTIONS DE CONFIGURATION:

1. Copiez ce fichier vers config.js:
   cp config.example.js config.js

2. Remplissez vos informations dans config.js:
   - BOT_USERNAME: Nom d'utilisateur de votre bot
   - OAUTH_TOKEN: Token OAuth (commence par 'oauth:')
   - CHANNEL: Nom de votre chaîne Twitch

3. Pour obtenir un token OAuth:
   - Allez sur https://dev.twitch.tv/console
   - Créez une nouvelle application
   - Générez un token avec les scopes:
     * channel:moderate (pour les timeouts)
     * chat:edit (pour envoyer des messages)

4. Lancez le bot:
   npm start

⚠️ IMPORTANT: Ne commitez jamais config.js avec vos vrais tokens !
*/
