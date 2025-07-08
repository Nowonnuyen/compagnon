const fs = require('fs');
const chokidar = require('chokidar');

// Chemin vers ton fichier history.txt Winamax sur MacBook
const historyFile = '/Users/nowonnguyen/Library/Application Support/winamax/documents/history.txt';

function getLastHand() {
  const content = fs.readFileSync(historyFile, 'utf8'); //"Winamax Poker - Hand" est un marqueur dans le fichier qui identifie le début d’une main de poker.
  const hands = content.split('Winamax Poker - Hand');
  const lastHandText = 'Winamax Poker - Hand' + hands[hands.length - 1];
  return lastHandText;
}
//recupere le txt a jour pour que getLastHand travail sur les données à jour 
//Patern Observer 
chokidar.watch(historyFile).on('change', () => {
  console.log('🔄 Fichier modifié, lecture de la dernière main...');
  const lastHand = getLastHand();
  console.log('🃏 Dernière main :\n', lastHand);
});
