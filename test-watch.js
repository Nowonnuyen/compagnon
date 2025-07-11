const fs = require('fs');
const path = require('path');

const watchFolder = '/Users/nowonnguyen/Library/Application Support/winamax/documents/accounts/NonoBasket/history';

// Fichier à surveiller (remplace par un fichier existant dans ton dossier)
const watchedFileName = '20250711_Nice 21_real_holdem_no-limit.txt';
const watchedFilePath = path.join(watchFolder, watchedFileName);

let lastSize = 0;

function readNewContent() {
  fs.stat(watchedFilePath, (err, stats) => {
    if (err) {
      console.error('Erreur stat fichier:', err.message);
      return;
    }

    const newSize = stats.size;

    if (newSize > lastSize) {
      // On lit uniquement la partie nouvelle
      const stream = fs.createReadStream(watchedFilePath, { start: lastSize, end: newSize - 1, encoding: 'utf8' });

      let newData = '';
      stream.on('data', chunk => {
        newData += chunk;
      });

      stream.on('end', () => {
        console.log('--- Nouveau contenu ajouté ---');
        console.log(newData);
        lastSize = newSize;
      });

      stream.on('error', err => {
        console.error('Erreur lecture fichier:', err);
      });
    } else if (newSize < lastSize) {
      // Fichier tronqué / reset (ex: rotation de logs)
      console.log('Le fichier a été tronqué, on repart de zéro.');
      lastSize = 0;
    }
  });
}

// Initialisation : récupérer la taille initiale pour ne pas relire tout au démarrage
fs.stat(watchedFilePath, (err, stats) => {
  if (err) {
    console.error('Erreur initiale stat:', err.message);
    return;
  }
  lastSize = stats.size;

  console.log(`🚀 Surveillance du fichier : ${watchedFilePath}`);
  fs.watch(watchedFilePath, (eventType, filename) => {
    if (eventType === 'change') {
      readNewContent();
    }
  });
});
