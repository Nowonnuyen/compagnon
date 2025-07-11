const fs = require('fs');
const path = require('path');

// Chemin vers le dossier à surveiller (à modifier selon ta config)
const watchDir = '/Users/nowonnguyen/Library/Application Support/winamax/documents/accounts/NonoBasket/history';

// On stocke la taille précédente de chaque fichier pour ne lire que les ajouts
const fileSizes = {};

// Fonction pour traiter les nouvelles données ajoutées dans un fichier
function processNewData(newData) {
  // Sépare les mains de poker par double saut de ligne (ou plus)
  const hands = newData.split(/\n\s*\n/);
  hands.forEach((hand, index) => {
    if (hand.trim().length > 0) {
      console.log(`--- Nouvelle main détectée ---`);
      console.log(hand);
      console.log('------------------------------\n');
    }
  });
}

console.log(`🚀 Démarrage du watcher sur le dossier : ${watchDir}`);

fs.watch(watchDir, (eventType, filename) => {
  if (!filename) return;

  const filePath = path.join(watchDir, filename);

  // Vérifie si le fichier existe (évite erreurs quand un fichier est supprimé)
  fs.stat(filePath, (err, stats) => {
    if (err) {
      // Le fichier peut avoir été supprimé, ignore
      return;
    }

    // Taille précédente
    const previousSize = fileSizes[filename] || 0;

    // Si la taille a augmenté, on lit la partie ajoutée
    if (stats.size > previousSize) {
      const stream = fs.createReadStream(filePath, { start: previousSize, end: stats.size });
      let newData = '';

      stream.on('data', chunk => {
        newData += chunk.toString();
      });

      stream.on('end', () => {
        processNewData(newData);
        // Met à jour la taille connue
        fileSizes[filename] = stats.size;
      });
    }
    // Sinon, met à jour la taille si fichier plus petit (reset)
    else if (stats.size < previousSize) {
      fileSizes[filename] = stats.size;
    }
  });
});
