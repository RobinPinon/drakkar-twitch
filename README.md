# 🤖 Bot Twitch Drakkar

Un bot Twitch qui permet aux utilisateurs de s'affronter dans des duels 50-50 avec la commande `!drakkar`.

## ✨ Fonctionnalités

- **Commande `!drakkar @utilisateur`** : Lance un duel entre deux joueurs
- **Système 50-50** : Le perdant est choisi aléatoirement (sauf sopralus qui gagne toujours !)
- **Timeout automatique** : Le perdant reçoit un timeout de 1 à 15 minutes
- **Protection anti-spam** : Un seul duel peut être actif à la fois
- **Limitation quotidienne** : Maximum 5 duels par jour par utilisateur
- **Système de leaderboard** : Classement des meilleurs joueurs
- **World Records** : Records de victoires totales et séries de victoires
- **Statistiques personnelles** : Suivi des performances individuelles
- **Messages personnalisés** : Interface utilisateur claire et amusante

## 🚀 Installation

### Prérequis

- Node.js (version 14 ou supérieure)
- Compte Twitch avec application développeur
- Token OAuth pour le bot

### Étapes d'installation

1. **Cloner le projet**
   ```bash
   git clone <votre-repo>
   cd drakkar-twitch
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer le bot**
   - Ouvrir `config.js`
   - Remplacer les valeurs par vos informations :
     - `BOT_USERNAME` : Nom d'utilisateur de votre bot
     - `OAUTH_TOKEN` : Token OAuth de votre bot
     - `CHANNEL` : Nom de votre chaîne Twitch

4. **Lancer le bot**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Obtenir les Tokens nécessaires

#### 1. Token OAuth pour le chat (tmi.js)
1. Aller sur [Twitch Developer Console](https://dev.twitch.tv/console)
2. Créer une nouvelle application
3. Générer un token OAuth avec les scopes :
   - `chat:edit` (pour envoyer des messages)

#### 2. Token d'accès pour l'API (timeouts)
1. Dans votre application Twitch, notez le **Client ID**
2. Générez un token d'accès avec les scopes :
   - `channel:moderate` (pour les timeouts)
   - `user:read:email` (pour l'authentification)
3. Ce token doit être différent du token OAuth du chat

### Variables de configuration

```javascript
// Dans config.js
BOT_USERNAME: 'drakkarbot',           // Nom d'utilisateur du bot
OAUTH_TOKEN: 'oauth:token_ici',       // Token OAuth pour le chat
CHANNEL: 'votre_chaine',              // Nom de votre chaîne
TWITCH_CLIENT_ID: 'client_id_ici',    // ID de votre application Twitch
TWITCH_ACCESS_TOKEN: 'access_token',   // Token d'accès pour l'API
MIN_TIMEOUT: 60,                      // Timeout minimum (1 minute)
MAX_TIMEOUT: 900,                     // Timeout maximum (15 minutes)
```

## 📖 Utilisation

### Commandes principales

- **`!drakkar @utilisateur`** - Lancer un duel contre un autre utilisateur
- **`!duels`** - Vérifier vos duels restants pour aujourd'hui (limite: 5 duels/jour)
- **`!stats`** - Voir vos statistiques personnelles (victoires, défaites, ratio, séries)
- **`!top`** - Afficher le leaderboard top 5 des meilleurs joueurs
- **`!wr`** - Voir vos statistiques personnelles détaillées avec votre rang
- **`!records`** - Voir les World Records globaux actuels
- **`!help`** - Afficher la liste complète de toutes les commandes disponibles

**Exemples :**
- `!drakkar @pseudo123` - Défie l'utilisateur pseudo123
- `!drakkar pseudo123` - Fonctionne aussi sans @
- `!stats` - Consulter vos performances
- `!top` - Voir le classement
- `!wr` - Voir vos stats détaillées avec votre rang
- `!records` - Voir les World Records globaux
- `!help` - Voir toutes les commandes disponibles

### Déroulement d'un duel

1. Un utilisateur tape `!drakkar @cible`
2. Le bot vérifie les limitations quotidiennes (max 5 duels/jour)
3. Le bot annonce le début du duel
4. Attente de 3 secondes pour le suspense
5. Le vainqueur est choisi (sopralus gagne toujours, sinon 50-50)
6. Le perdant reçoit un timeout de 1 à 15 minutes
7. Mise à jour du leaderboard et vérification des WR
8. Affichage des statistiques et records

## 🛡️ Sécurité et modération

- **Protection anti-spam** : Un seul duel à la fois
- **Limitation quotidienne** : Maximum 5 duels par jour par utilisateur
- **Vérifications** : Impossible de se défier soi-même
- **Validation** : Format de commande strict
- **Logs** : Tous les timeouts sont enregistrés

## 🏆 Système de Leaderboard et World Records

### Leaderboard
- **Classement top 5** : Trié par ratio de victoire puis par nombre de victoires
- **Statistiques détaillées** : Victoires, défaites, ratio, séries de victoires
- **Commande `!top`** : Affiche le classement en temps réel

### World Records
- **Victoires totales** : Record du joueur avec le plus de victoires
- **Séries de victoires** : Record de la plus longue série de victoires consécutives
- **Commande `!wr`** : Affiche les records actuels
- **Notifications automatiques** : Annonce des nouveaux WR lors des duels

### Statistiques personnelles
- **Commande `!stats`** : Affiche vos performances individuelles
- **Suivi des séries** : Série actuelle et meilleure série historique
- **Ratio de victoire** : Pourcentage de victoires sur tous vos duels

## 🔍 Dépannage

### Problèmes courants

1. **Bot ne se connecte pas**
   - Vérifier le token OAuth
   - Vérifier le nom d'utilisateur du bot
   - Vérifier que le bot n'est pas déjà connecté

2. **Commandes ne fonctionnent pas**
   - Vérifier que le bot est dans le bon canal
   - Vérifier les permissions du bot
   - Vérifier la syntaxe de la commande

3. **Timeouts ne s'appliquent pas**
   - Le bot doit avoir les permissions de modération
   - Vérifier les scopes OAuth

### Logs et débogage

Le bot affiche des logs détaillés dans la console :
- Connexion/déconnexion
- Commandes reçues
- Résultats des duels
- Erreurs et exceptions

## 📝 Personnalisation

### Modifier les messages

Éditez les messages dans `config.js` :

```javascript
MESSAGES: {
  DUEL_START: '⚔️ Nouveau duel ! {challenger} vs {target}',
  DUEL_WINNER: '🎉 {winner} gagne !',
  // ... autres messages
}
```

### Modifier les timeouts

```javascript
MIN_TIMEOUT: 30,   // 30 secondes minimum
MAX_TIMEOUT: 1800, // 30 minutes maximum
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer des améliorations
- Ajouter de nouvelles fonctionnalités

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 🆘 Support

Si vous rencontrez des problèmes :
1. Vérifier la section dépannage
2. Consulter les logs de la console
3. Vérifier la configuration
4. Ouvrir une issue sur GitHub

---

**Bon streaming avec votre Bot Drakkar ! ⚔️**
