#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DATA_DIR = './data';
const BACKUP_DIR = './backups';

// Créer le dossier de sauvegarde s'il n'existe pas
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Fonction pour créer une sauvegarde
function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);
  
  if (!fs.existsSync(DATA_DIR)) {
    console.log('❌ Aucune donnée à sauvegarder (dossier data inexistant)');
    return;
  }
  
  try {
    // Créer le dossier de sauvegarde
    fs.mkdirSync(backupPath, { recursive: true });
    
    // Copier tous les fichiers de données
    const files = fs.readdirSync(DATA_DIR);
    files.forEach(file => {
      const sourcePath = path.join(DATA_DIR, file);
      const destPath = path.join(backupPath, file);
      fs.copyFileSync(sourcePath, destPath);
    });
    
    console.log(`✅ Sauvegarde créée: ${backupPath}`);
    console.log(`📁 Fichiers sauvegardés: ${files.join(', ')}`);
  } catch (error) {
    console.error('❌ Erreur lors de la création de la sauvegarde:', error);
  }
}

// Fonction pour lister les sauvegardes disponibles
function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('❌ Aucune sauvegarde trouvée');
    return;
  }
  
  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(item => fs.statSync(path.join(BACKUP_DIR, item)).isDirectory())
    .sort()
    .reverse();
  
  if (backups.length === 0) {
    console.log('❌ Aucune sauvegarde trouvée');
    return;
  }
  
  console.log('📁 Sauvegardes disponibles:');
  backups.forEach((backup, index) => {
    const backupPath = path.join(BACKUP_DIR, backup);
    const stats = fs.statSync(backupPath);
    const date = stats.mtime.toLocaleString('fr-FR');
    console.log(`  ${index + 1}. ${backup} (${date})`);
  });
}

// Fonction pour restaurer une sauvegarde
function restoreBackup(backupName) {
  const backupPath = path.join(BACKUP_DIR, backupName);
  
  if (!fs.existsSync(backupPath)) {
    console.log(`❌ Sauvegarde ${backupName} introuvable`);
    return;
  }
  
  try {
    // Créer une sauvegarde de l'état actuel avant restauration
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const currentBackupPath = path.join(BACKUP_DIR, `pre-restore-${timestamp}`);
    
    if (fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(currentBackupPath, { recursive: true });
      const currentFiles = fs.readdirSync(DATA_DIR);
      currentFiles.forEach(file => {
        const sourcePath = path.join(DATA_DIR, file);
        const destPath = path.join(currentBackupPath, file);
        fs.copyFileSync(sourcePath, destPath);
      });
      console.log(`💾 Sauvegarde de l'état actuel: ${currentBackupPath}`);
    }
    
    // Supprimer le dossier data actuel
    if (fs.existsSync(DATA_DIR)) {
      fs.rmSync(DATA_DIR, { recursive: true, force: true });
    }
    
    // Créer le nouveau dossier data
    fs.mkdirSync(DATA_DIR, { recursive: true });
    
    // Copier les fichiers de la sauvegarde
    const files = fs.readdirSync(backupPath);
    files.forEach(file => {
      const sourcePath = path.join(backupPath, file);
      const destPath = path.join(DATA_DIR, file);
      fs.copyFileSync(sourcePath, destPath);
    });
    
    console.log(`✅ Restauration réussie depuis: ${backupName}`);
    console.log(`📁 Fichiers restaurés: ${files.join(', ')}`);
  } catch (error) {
    console.error('❌ Erreur lors de la restauration:', error);
  }
}

// Fonction pour afficher l'aide
function showHelp() {
  console.log(`
🔄 Script de sauvegarde et restauration du Bot Drakkar

Usage:
  node backup.js [commande] [option]

Commandes:
  create, c     Créer une nouvelle sauvegarde
  list, l       Lister les sauvegardes disponibles
  restore, r    Restaurer une sauvegarde
  help, h       Afficher cette aide

Exemples:
  node backup.js create
  node backup.js list
  node backup.js restore backup-2024-01-15T10-30-00-000Z
  node backup.js help
`);
}

// Gestion des arguments de ligne de commande
const command = process.argv[2];
const option = process.argv[3];

switch (command) {
  case 'create':
  case 'c':
    createBackup();
    break;
    
  case 'list':
  case 'l':
    listBackups();
    break;
    
  case 'restore':
  case 'r':
    if (!option) {
      console.log('❌ Veuillez spécifier le nom de la sauvegarde à restaurer');
      console.log('💡 Exemple: node backup.js restore backup-2024-01-15T10-30-00-000Z');
    } else {
      restoreBackup(option);
    }
    break;
    
  case 'help':
  case 'h':
  default:
    showHelp();
    break;
}
