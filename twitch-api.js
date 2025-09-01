const { ApiClient } = require('@twurple/api');
const { StaticAuthProvider } = require('@twurple/auth');
const config = require('./config');

class TwitchAPI {
  constructor() {
    // Configuration de l'authentification avec twurple
    // Nettoyer le token (enlever 'Bearer' si présent)
    const cleanToken = config.TWITCH_ACCESS_TOKEN.replace(/^Bearer\s+/i, '');
    
    this.authProvider = new StaticAuthProvider(
      config.TWITCH_CLIENT_ID,
      cleanToken
    );
    
    // Création du client API
    this.apiClient = new ApiClient({ authProvider: this.authProvider });
  }

  // Obtenir l'ID de l'utilisateur par son nom
  async getUserId(username) {
    try {
      const user = await this.apiClient.users.getUserByName(username);
      return user ? user.id : null;
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération de l'ID de ${username}:`, error.message);
      return null;
    }
  }

  // Obtenir l'ID du modérateur (bot)
  async getModeratorId() {
    try {
      const user = await this.apiClient.users.getUserByName(config.BOT_USERNAME);
      return user ? user.id : null;
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération de l'ID du modérateur:`, error.message);
      return null;
    }
  }

  // Obtenir l'ID de la chaîne
  async getBroadcasterId() {
    try {
      const user = await this.apiClient.users.getUserByName(config.CHANNEL);
      return user ? user.id : null;
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération de l'ID de la chaîne:`, error.message);
      return null;
    }
  }

  // Appliquer un timeout à un utilisateur (pas un ban permanent)
  async timeoutUser(username, duration, reason = 'Duel drakar - Défaite') {
    try {
      const [userInfo, moderatorId, broadcasterId] = await Promise.all([
        this.apiClient.users.getUserByName(username),
        this.getModeratorId(),
        this.getBroadcasterId()
      ]);

      if (!userInfo || !moderatorId || !broadcasterId) {
        console.error('❌ Impossible de récupérer les IDs nécessaires pour le timeout');
        console.log(`Debug: userInfo=${!!userInfo}, moderatorId=${moderatorId}, broadcasterId=${broadcasterId}`);
        return false;
      }

      // Utilisation de l'API twurple pour le TIMEOUT (pas ban)
      // duration > 0 = timeout, duration = null = ban permanent
      await this.apiClient.moderation.banUser(
        broadcasterId,
        {
          user: userInfo.id,
          duration: duration, // Durée en secondes pour le timeout
          reason: reason
        }
      );

      console.log(`✅ TIMEOUT appliqué à ${username} pour ${duration} secondes (pas de ban permanent)`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de l'application du timeout à ${username}:`, error.message);
      console.error('Détails de l\'erreur:', error);
      return false;
    }
  }

  // Vérifier si l'API est accessible
  async testConnection() {
    try {
      const user = await this.apiClient.users.getUserByName(config.BOT_USERNAME);
      return user !== null;
    } catch (error) {
      console.error('❌ Erreur de connexion à l\'API Twitch:', error.message);
      return false;
    }
  }

  // Obtenir les informations de la chaîne
  async getChannelInfo() {
    try {
      const broadcasterId = await this.getBroadcasterId();
      if (!broadcasterId) return null;
      
      const channel = await this.apiClient.channels.getChannelInfoById(broadcasterId);
      return channel;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des infos de la chaîne:', error.message);
      return null;
    }
  }

  // Vérifier si le bot est modérateur
  async isModerator() {
    try {
      const broadcasterId = await this.getBroadcasterId();
      const moderatorId = await this.getModeratorId();
      
      if (!broadcasterId || !moderatorId) return false;

      const moderators = await this.apiClient.moderation.getModerators(broadcasterId);
      // twurple retourne un objet avec une propriété data
      if (moderators && moderators.data) {
        return moderators.data.some(mod => mod.userId === moderatorId);
      }
      return false;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des permissions de modération:', error.message);
      return false;
    }
  }

  // Vérifier si un utilisateur est abonné à la chaîne
  async isSubscriber(username) {
    try {
      const broadcasterId = await this.getBroadcasterId();
      const userId = await this.getUserId(username);
      
      if (!broadcasterId || !userId) {
        console.log(`⚠️ Impossible de récupérer les IDs pour ${username}: broadcasterId=${broadcasterId}, userId=${userId}`);
        return false;
      }

      console.log(`🔍 Vérification de l'abonnement de ${username}...`);
      
      // Vérifier l'abonnement
      const subscription = await this.apiClient.subscriptions.getSubscriptionForUser(
        broadcasterId,
        userId
      );
      
      const isSub = subscription !== null;
      console.log(`📊 ${username} est ${isSub ? 'ABONNÉ' : 'NON ABONNÉ'}`);
      return isSub;
    } catch (error) {
      // Si l'erreur est 404, l'utilisateur n'est pas abonné
      if (error.status === 404) {
        console.log(`📊 ${username} n'est pas abonné (404)`);
        return false;
      }
      console.error(`❌ Erreur lors de la vérification de l'abonnement de ${username}:`, error.message);
      console.error(`❌ Status: ${error.status}, Code: ${error.code}`);
      return false;
    }
  }
}

module.exports = TwitchAPI;
