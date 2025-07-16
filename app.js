// ---------------------------
// 🌐 Polyfill fetch + FormData pour Node.js
// ---------------------------
import fetch, { Headers, Request, Response } from 'node-fetch';
import { Blob } from 'fetch-blob';
import { FormData } from 'formdata-node';

// Ajout des polyfills globaux pour OpenAI SDK
globalThis.fetch = fetch;
globalThis.Headers = Headers;
globalThis.Request = Request;
globalThis.Response = Response;
globalThis.Blob = Blob;
globalThis.FormData = FormData;

// ---------------------------
// 📦 Imports Node.js et .env
// ---------------------------
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import OpenAI from 'openai';

// ---------------------------
// 🔑 Initialisation OpenAI
// ---------------------------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ---------------------------
// 📂 Dossier Winamax à surveiller
// ---------------------------
const watchDir = '/Users/nowonnguyen/Library/Application Support/winamax/documents/accounts/NonoBasket/history';
const fileSizes = {}; // Mémorise les tailles de fichiers

// ---------------------------
// 🧠 Fonction d'appel IA
// ---------------------------
async function getPokerAdvice(handText) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: "Tu es un coach expert de poker Texas Hold'em. Donne des conseils étape par étape clairs et précis.",
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
    console.error('❌ Erreur IA :', error);
    return null;
  }
}

// ---------------------------
// ✨ Traitement des nouvelles mains
// ---------------------------
function processNewData(newData) {
  const hands = newData.split(/\n\s*\n/); // Sépare les mains par double saut de ligne
  hands.forEach(async (hand) => {
    if (hand.trim()) {
      console.log('------------------------------');
      console.log('🃏 Nouvelle main détectée :\n');
      console.log(hand);
      console.log('------------------------------\n');

      const advice = await getPokerAdvice(hand);
      if (advice) {
        console.log('💡 Conseil IA :', advice, '\n');
      }
    }
  });
}

// ---------------------------
// 👀 Surveillance du dossier
// ---------------------------
console.log(`🚀 Watcher en cours sur : ${watchDir}\n`);

fs.watch(watchDir, (eventType, filename) => {
  if (!filename) return;
  const filePath = path.join(watchDir, filename);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) return;

    const prevSize = fileSizes[filename] || 0;

    if (stats.size > prevSize) {
      // Lecture incrémentale
      const stream = fs.createReadStream(filePath, { start: prevSize, end: stats.size - 1 });
      let newData = '';

      stream.on('data', (chunk) => {
        newData += chunk.toString();
      });

      stream.on('end', () => {
        processNewData(newData);
        fileSizes[filename] = stats.size; // Màj taille
      });
    } else if (stats.size < prevSize) {
      // Fichier réinitialisé
      fileSizes[filename] = stats.size;
    }
  });
});
