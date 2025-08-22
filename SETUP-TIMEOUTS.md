# 🔧 Configuration des Timeouts - Bot Drakkar

Ce guide vous explique comment configurer les **vrais timeouts** pour votre bot Twitch Drakkar.

## ⚠️ Problème résolu

**Avant** : Le bot simulait les timeouts (pas de vrais timeouts)
**Maintenant** : Le bot utilise **twurple** pour appliquer de vrais timeouts via l'API Twitch officielle

## 📋 Prérequis

1. ✅ Compte Twitch `drakkarbot` créé
2. ✅ Application Twitch sur [dev.twitch.tv](https://dev.twitch.tv/console)
3. ✅ Bot connecté au chat (fonctionne déjà)

## 🔑 Configuration requise

### 1. Récupérer le Client ID
1. Allez sur [Twitch Developer Console](https://dev.twitch.tv/console)
2. Sélectionnez votre application `drakkarbot`
3. Copiez le **Client ID** affiché

### 2. Générer un Token d'accès
1. Dans votre application, cliquez sur **"Generate Token"**
2. Sélectionnez ces scopes :
   - ✅ `channel:moderate` (obligatoire pour les timeouts)
   - ✅ `user:read:email` (pour l'authentification)
3. Copiez le token généré (commence par `Bearer`)

### 3. Mettre à jour config.js
```javascript
// Configuration API Twitch (pour les timeouts)
TWITCH_CLIENT_ID: 'votre_client_id_ici',        // Remplacez par votre Client ID
TWITCH_ACCESS_TOKEN: 'votre_access_token_ici',   // Remplacez par votre token
```

## 📝 Exemple de configuration complète

```javascript
module.exports = {
  BOT_USERNAME: 'drakkarbot',
  OAUTH_TOKEN: 'oauth:rz2l10i41ypju53eggmohdv8kfq6vx',
  CHANNEL: 'Sopralus',
  
  // ⚠️ NOUVEAU : Configuration pour les timeouts
  TWITCH_CLIENT_ID: 'abc123def456ghi789',           // Votre Client ID
  TWITCH_ACCESS_TOKEN: 'Bearer xyz789abc123def456', // Votre token d'accès
  
  MIN_TIMEOUT: 60,   // 1 minute
  MAX_TIMEOUT: 900,  // 15 minutes
  // ... reste de la config
};
```

## 🧪 Test de la configuration

1. **Redémarrez le bot** : `npm start`
2. **Vérifiez les logs** :
   ```
   🔍 Test de connexion à l'API Twitch...
   ✅ Connexion à l'API Twitch réussie
   ```
3. **Testez la commande** : `!drakkar @utilisateur`
4. **Vérifiez le timeout** : L'utilisateur doit être vraiment timeouté

## ❌ Problèmes courants

### "Connexion à l'API Twitch échouée"
- ❌ Client ID incorrect
- ❌ Token d'accès expiré
- ❌ Scopes manquants
- ❌ Application non autorisée

### "Impossible d'appliquer le timeout"
- ❌ Bot pas modérateur sur la chaîne
- ❌ Permissions insuffisantes
- ❌ Utilisateur déjà timeouté

## 🔒 Sécurité

- ✅ `config.js` est dans `.gitignore` (pas de commit)
- ✅ Tokens séparés pour chat et API
- ✅ Scopes minimaux requis
- ✅ Logs détaillés pour le débogage
- ✅ Utilisation de **twurple** (bibliothèque officielle et sécurisée)

## 🚀 Avantages de twurple

- **Plus robuste** : Gestion automatique des erreurs et retry
- **Type-safe** : Support TypeScript natif
- **Maintenu** : Bibliothèque officielle et régulièrement mise à jour
- **Performant** : Optimisé pour l'API Twitch
- **Sécurisé** : Gestion automatique de l'authentification

## 📚 Ressources

- [Twitch Developer Console](https://dev.twitch.tv/console)
- [Documentation API Twitch](https://dev.twitch.tv/docs/api)
- [Scopes OAuth](https://dev.twitch.tv/docs/authentication/scopes)

---

**Une fois configuré, vos duels Drakkar appliqueront de vrais timeouts ! ⚔️⏰**
