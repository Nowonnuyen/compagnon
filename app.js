// Import du polyfill fetch pour Node.js
import fetch, { Headers, Request, Response } from 'node-fetch';
import { Blob } from "fetch-blob";

global.Blob = Blob;


// Polyfill global de fetch et classes associées (nécessaire pour la lib OpenAI)
if (!globalThis.fetch) {
  globalThis.fetch = fetch;
}
if (!globalThis.Headers) {
  globalThis.Headers = Headers;
}
if (!globalThis.Request) {
  globalThis.Request = Request;
}
if (!globalThis.Response) {
  globalThis.Response = Response;
}

import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import OpenAI from 'openai';

// Initialisation de l’API OpenAI avec la clé d’API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Dossier à surveiller (exemple)
const watchDir = '/Users/nowonnguyen/Library/Application Support/winamax/documents/accounts/NonoBasket/history';

// Objet pour mémoriser la taille des fichiers lus
const fileSizes = {};

// Fonction d’appel à l’API OpenAI pour recevoir un conseil poker
async function getPokerAdvice(handText) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: "Tu es un coach de poker Texas Hold'em expert. Sois clair, concis, et donne des conseils précis étape par étape.",
        },
        {
          role: 'user',
          content: handText,
        },
      ],
      temperature: 0.5,
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Erreur IA :', error);
    return null;
  }
}

// Traitement des nouvelles mains détectées dans le fichier
function processNewData(newData) {
  const hands = newData.split(/\n\s*\n/);
  hands.forEach(async (hand) => {
    if (hand.trim().length > 0) {
      console.log('--- Nouvelle main détectée ---');
      console.log(hand);
      console.log('------------------------------\n');

      const advice = await getPokerAdvice(hand);
      if (advice) {
        console.log('Conseil IA :', advice, '\n');
      }
    }
  });
}

// Démarrage du watcher sur le dossier history
console.log(`🚀 Démarrage du watcher sur : ${watchDir}`);

fs.watch(watchDir, (eventType, filename) => {
  if (!filename) return;
  const filePath = path.join(watchDir, filename);

  fs.stat(filePath, (err, stats) => {
    if (err) return;

    const previousSize = fileSizes[filename] || 0;

    if (stats.size > previousSize) {
      const stream = fs.createReadStream(filePath, { start: previousSize, end: stats.size - 1 });
      let newData = '';

      stream.on('data', (chunk) => {
        newData += chunk.toString();
      });

      stream.on('end', () => {
        processNewData(newData);
        fileSizes[filename] = stats.size;
      });
    } else if (stats.size < previousSize) {
      // Fichier tronqué ou réinitialisé, on reset la taille mémorisée
      fileSizes[filename] = stats.size;
    }
  });
});
