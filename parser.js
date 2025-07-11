/** convention de documentation utilisée dans le code JavaScript (juste bonne pratique) decrire ce que fait une fonction ou un paramètre
 * Parse une main Winamax brute en JSON structuré.
 * @param {string} handText - Texte complet d'une main
 * @returns {object} parsedHand - Objet JSON structuré
 */

//handText ouput du for each de : handsRaw.forEach((handTextRaw, i) dans app.js
function parseHand(handText) {
    const lines = handText.trim().split('\n').map(l => l.trim()); // transforme en Json 
  
    // Extraction header : Hand ID + Date (Traitement en cascaqde ici, chaque étape dépend de la réussite de la précédente)
    // Ex : "Winamax Poker - Hand #123456789 - 2025/07/09 21:42:13"
    const headerLine = lines.find(l => l.startsWith('Winamax Poker - Hand')); // bonne pratique : On découpe la main en lignes, on enlève les espaces inutiles. (Nettoyer les espaces, ça évite de rater des lignes importantes.) 
    const headerMatch = headerLine.match(/Hand #(\d+) - (\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})/); //regex, Recherche de la ligne d’entête contenant l’ID et la date.
    const handId = headerMatch ? headerMatch[1] : null; //Extraction via regex du numéro de main et date.
    const date = headerMatch ? headerMatch[2].replace(/\//g, '-') : null; //Extraction propre, date formatée en YYYY-MM-DD.
  
    // Sections clés à détecter
    const sections = {
      blinds: [],
      preFlop: [],
      flop: [],
      turn: [],
      river: [],
      showdown: [],
      summary: []
    };
  
    // Indicateur de section courante
    let currentSection = null;
  
    // Marqueurs de sections (Winamax)
    const sectionMarkers = {
      '*** ANTE/BLINDS ***': 'blinds',
      '*** HOLE CARDS ***': 'preFlop',
      '*** FLOP ***': 'flop',
      '*** TURN ***': 'turn',
      '*** RIVER ***': 'river',
      '*** SHOW DOWN ***': 'showdown',
      '*** SUMMARY ***': 'summary'
    };
  
    // Parcours lignes et classification par section
    for (const line of lines) {
      if (sectionMarkers[line]) {
        currentSection = sectionMarkers[line];
        continue;
      }
      if (currentSection) {
        sections[currentSection].push(line);
      }
    }
  
    // Parsing blinds (exemple simple : "small blind: 0.05, big blind: 0.10")
    const blinds = {};
    sections.blinds.forEach(line => {
      const sb = line.match(/small blind[: ]+(\d+\.?\d*)/i);
      if (sb) blinds.small = parseFloat(sb[1]);
      const bb = line.match(/big blind[: ]+(\d+\.?\d*)/i);
      if (bb) blinds.big = parseFloat(bb[1]);
    });
  
    // Pour les autres sections, on garde les actions en tableau brut (peut être amélioré plus tard)
    // Exemple : preFlop = [ "Player1: raises 0.10", "Player2: calls 0.10" ]
  
    return {
      handId,
      date,
      blinds,
      preFlop: sections.preFlop,
      flop: sections.flop,
      turn: sections.turn,
      river: sections.river,
      showdown: sections.showdown,
      summary: sections.summary
    };
  }
  
  module.exports = { parseHand };
  