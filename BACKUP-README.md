# 💾 Système de Sauvegarde Automatique - Bot Drakkar

## 🎯 **Objectif**

Ce système permet de **conserver l'historique complet** de votre bot Twitch entre chaque redémarrage :
- ✅ **Leaderboard** (victoires, défaites, séries)
- ✅ **World Records** (records globaux)
- ✅ **Limitations quotidiennes** (duels par jour)

## 🔄 **Sauvegarde Automatique**

### **Quand ?**
- **Après chaque duel** (mise à jour du leaderboard)
- **Après chaque modification** des duels quotidiens
- **Toutes les 5 minutes** (sauvegarde de sécurité)
- **Lors de l'arrêt** du bot (Ctrl+C, fermeture)

### **Où ?**
```
drakkar-twitch/
├── data/                    # Données actuelles
│   ├── leaderboard.json    # Leaderboard
│   ├── worldrecords.json   # World Records
│   └── dailyduels.json     # Duels quotidiens
├── backups/                 # Sauvegardes manuelles
│   ├── backup-2024-01-15T10-30-00-000Z/
│   └── backup-2024-01-15T15-45-00-000Z/
└── bot.js                   # Bot principal
```

## 🛠️ **Commandes de Sauvegarde**

### **1. Créer une sauvegarde manuelle**
```bash
npm run backup:create
# ou
node backup.js create
```

### **2. Lister les sauvegardes disponibles**
```bash
npm run backup:list
# ou
node backup.js list
```

### **3. Restaurer une sauvegarde**
```bash
npm run backup:restore backup-2024-01-15T10-30-00-000Z
# ou
node backup.js restore backup-2024-01-15T10-30-00-000Z
```

### **4. Afficher l'aide**
```bash
npm run backup
# ou
node backup.js help
```

## 📊 **Structure des Données Sauvegardées**

### **Leaderboard** (`leaderboard.json`)
```json
{
  "username": {
    "wins": 5,
    "losses": 2,
    "winStreak": 3,
    "bestWinStreak": 4,
    "totalDuels": 7
  }
}
```

### **World Records** (`worldrecords.json`)
```json
{
  "totalWins": {
    "username": "player123",
    "value": 25,
    "date": "2024-01-15T10:30:00.000Z"
  },
  "bestWinStreak": {
    "username": "champion",
    "value": 8,
    "date": "2024-01-14T15:45:00.000Z"
  }
}
```

### **Duels Quotidiens** (`dailyduels.json`)
```json
{
  "username": {
    "count": 3,
    "lastReset": "2024-01-15T00:00:00.000Z"
  }
}
```

## 🚀 **Démarrage avec Données**

### **Premier lancement**
- Le bot crée automatiquement le dossier `data/`
- Aucune donnée à charger (première fois)

### **Lancements suivants**
- Le bot charge automatiquement les données sauvegardées
- Tous les scores et records sont conservés
- Les limitations quotidiennes sont respectées

## 🔒 **Sécurité**

### **Protection des données**
- Les fichiers de données sont **exclus de Git** (`.gitignore`)
- **Sauvegarde automatique** avant chaque modification
- **Sauvegarde de sécurité** avant restauration

### **En cas de problème**
- Les données sont sauvegardées **toutes les 5 minutes**
- **Sauvegarde de l'état actuel** avant restauration
- **Logs détaillés** de toutes les opérations

## 📝 **Exemples d'Usage**

### **Scénario 1 : Sauvegarde quotidienne**
```bash
# Créer une sauvegarde avant maintenance
npm run backup:create

# Vérifier les sauvegardes disponibles
npm run backup:list

# Redémarrer le bot
npm start
```

### **Scénario 2 : Restauration après problème**
```bash
# Lister les sauvegardes
npm run backup:list

# Restaurer la sauvegarde la plus récente
npm run backup:restore backup-2024-01-15T10-30-00-000Z

# Redémarrer le bot
npm start
```

### **Scénario 3 : Migration de serveur**
```bash
# 1. Créer une sauvegarde sur l'ancien serveur
npm run backup:create

# 2. Copier le dossier backups/ vers le nouveau serveur

# 3. Restaurer sur le nouveau serveur
npm run backup:restore backup-2024-01-15T10-30-00-000Z

# 4. Démarrer le bot
npm start
```

## ⚠️ **Points Importants**

### **Ne jamais supprimer**
- ❌ Le dossier `data/` (données actuelles)
- ❌ Le dossier `backups/` (sauvegardes)

### **En cas de corruption**
- Utiliser la **dernière sauvegarde valide**
- Le bot crée automatiquement une sauvegarde avant restauration
- **Toujours tester** après restauration

### **Performance**
- Les sauvegardes sont **rapides** (< 1 seconde)
- **Pas d'impact** sur les performances du bot
- **Automatique** en arrière-plan

## 🎉 **Avantages**

- ✅ **Historique complet** conservé
- ✅ **Sauvegarde automatique** transparente
- ✅ **Restauration facile** en cas de problème
- ✅ **Migration simple** entre serveurs
- ✅ **Sécurité maximale** des données
- ✅ **Aucune perte** de progression des joueurs

---

**Votre bot conserve maintenant TOUT son historique ! 🚀💾**
