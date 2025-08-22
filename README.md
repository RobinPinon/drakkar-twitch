# 🤖 Bot Twitch Drakkar

Un bot Twitch qui permet aux utilisateurs de s'affronter dans des duels 50-50 avec la commande `!drakkar`.

## ✨ Fonctionnalités

- **Commande `!drakkar @utilisateur`** : Lance un duel entre deux joueurs
- **Système 50-50** : Le perdant est choisi aléatoirement
- **Timeout automatique** : Le perdant reçoit un timeout de 1 à 15 minutes
- **Protection anti-spam** : Un seul duel peut être actif à la fois
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

### Commande principale

```
!drakkar @utilisateur
```

**Exemples :**
- `!drakkar @pseudo123` - Défie l'utilisateur pseudo123
- `!drakkar pseudo123` - Fonctionne aussi sans @

### Déroulement d'un duel

1. Un utilisateur tape `!drakkar @cible`
2. Le bot annonce le début du duel
3. Attente de 3 secondes pour le suspense
4. Le vainqueur est choisi aléatoirement (50-50)
5. Le perdant reçoit un timeout de 1 à 15 minutes
6. Messages de félicitations et de défaite

## 🛡️ Sécurité et modération

- **Protection anti-spam** : Un seul duel à la fois
- **Vérifications** : Impossible de se défier soi-même
- **Validation** : Format de commande strict
- **Logs** : Tous les timeouts sont enregistrés

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
