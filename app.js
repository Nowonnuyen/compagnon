// Import des modules nécessaires
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

import fetch, { Headers } from 'node-fetch';
import { FormData } from 'formdata-node'; // <-- import FormData

// Polyfill fetch, Headers et FormData pour Node.js (nécessaire pour la lib OpenAI)
if (!globalThis.fetch) {
  globalThis.fetch = fetch;
  globalThis.Headers = Headers;
}
if (!globalThis.FormData) {
  globalThis.FormData = FormData;
}

// Polyfill Blob (pour Node.js 18+)
import { Blob } from 'node:buffer';
if (!globalThis.Blob) {
  globalThis.Blob = Blob;
}

import OpenAI from 'openai';

// Affiche la clé API pour vérification (à garder uniquement en dev, ne pas publier !)
console.log('Ma clé API est :', process.env.OPENAI_API_KEY);

// Initialisation de la lib OpenAI avec la clé d’API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Fonction qui appelle l’API OpenAI pour donner un conseil poker
async function getPokerAdvice(summary) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // modèle choisi
      messages: [
        {
          role: 'system',
          content: "Tu es un coach de poker Texas Hold'em expert. Donne des conseils précis et concis.",
        },
        {
          role: 'user',
          content: summary,
        },
      ],
      temperature: 0,
    });

    // Retourne le texte de la réponse IA
    return response.choices[0].message.content.trim();
  } catch (error) {
    // Affiche l’erreur si problème avec l’API
    console.error('Erreur IA :', error);
    return null;
  }
}

// --- Partie watcher sur dossier ---
// Dossier à surveiller pour les historiques de mains Winamax
const watchDir = '/Users/nowonnguyen/Library/Application Support/winamax/documents/accounts/NonoBasket/history';

// Objet pour mémoriser les tailles des fichiers déjà lues
const fileSizes = {};

// Fonction qui traite les nouvelles données ajoutées au fichier
function processNewData(newData) {
  // Chaque main est séparée par une ou plusieurs lignes vides
  const hands = newData.split(/\n\s*\n/);
  hands.forEach(async (hand) => {
    if (hand.trim().length > 0) {
      console.log('--- Nouvelle main détectée ---');
      console.log(hand);
      console.log('------------------------------\n');

      // Appel à l’IA pour obtenir un conseil poker sur cette main
      const advice = await getPokerAdvice(hand);
      if (advice) {
        console.log('Conseil IA :', advice, '\n');
      }
    }
  });
}

// Démarrage du watcher sur le dossier des historiques
console.log(`🚀 Démarrage du watcher sur le dossier : ${watchDir}`);

fs.watch(watchDir, (eventType, filename) => {
  if (!filename) return;

  const filePath = path.join(watchDir, filename);

  fs.stat(filePath, (err, stats) => {
    if (err) return;

    const previousSize = fileSizes[filename] || 0;

    // Si le fichier a grossi, on lit la nouvelle partie ajoutée
    if (stats.size > previousSize) {
      const stream = fs.createReadStream(filePath, { start: previousSize, end: stats.size - 1 });
      let newData = '';

      stream.on('data', (chunk) => {
        newData += chunk.toString();
      });

      stream.on('end', () => {
        processNewData(newData);
        fileSizes[filename] = stats.size; // mémorise la nouvelle taille
      });
    } else if (stats.size < previousSize) {
      // Le fichier a été tronqué ou réinitialisé, on met à jour la taille
      fileSizes[filename] = stats.size;
    }
  });
});
