const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Missing GEMINI_API_KEY in server/.env");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const ENGLISH_DEBATE = [
  // Topic 1: Technology
  [
    { id: 1, text: "Technology connects us (Pro)", valid: true },
    { id: 2, text: "Technology makes us lazy (Con)", valid: false },
    { id: 3, text: "It increases access to info (Pro)", valid: true },
    { id: 4, text: "It wastes our time (Con)", valid: false }
  ],
  // Topic 2: Homework
  [
    { id: 1, text: "Homework reinforces class learning (Pro)", valid: true },
    { id: 2, text: "Homework takes too much time (Con)", valid: false },
    { id: 3, text: "It helps students practice independently (Pro)", valid: true },
    { id: 4, text: "It causes unnecessary stress (Con)", valid: false }
  ],
  // Topic 3: Social Media
  [
    { id: 1, text: "Social media helps people stay in touch (Pro)", valid: true },
    { id: 2, text: "It spreads rumors easily (Con)", valid: false },
    { id: 3, text: "It provides a platform for creativity (Pro)", valid: true },
    { id: 4, text: "It reduces face-to-face interaction (Con)", valid: false }
  ],
  // Topic 4: Physical Exercise
  [
    { id: 1, text: "Exercise improves cardiovascular health (Pro)", valid: true },
    { id: 2, text: "Exercise can cause muscle fatigue (Con)", valid: false },
    { id: 3, text: "It boosts mood and mental clarity (Pro)", valid: true },
    { id: 4, text: "It takes time out of a busy day (Con)", valid: false }
  ],
  // Topic 5: Public Transport
  [
    { id: 1, text: "Public transit reduces traffic congestion (Pro)", valid: true },
    { id: 2, text: "Buses can be crowded and delayed (Con)", valid: false },
    { id: 3, text: "It lowers greenhouse gas emissions (Pro)", valid: true },
    { id: 4, text: "It requires walking to the station (Con)", valid: false }
  ],
  // Topic 6: Reading Books
  [
    { id: 1, text: "Reading enhances vocabulary and empathy (Pro)", valid: true },
    { id: 2, text: "Books can be heavy to carry (Con)", valid: false },
    { id: 3, text: "It reduces stress and promotes sleep (Pro)", valid: true },
    { id: 4, text: "Some books are difficult to understand (Con)", valid: false }
  ],
  // Topic 7: Online Learning
  [
    { id: 1, text: "Online learning offers flexible schedules (Pro)", valid: true },
    { id: 2, text: "It lacks hands-on lab training (Con)", valid: false },
    { id: 3, text: "It allows learning at your own pace (Pro)", valid: true },
    { id: 4, text: "It requires strong self-discipline (Con)", valid: false }
  ],
  // Topic 8: Solar Energy
  [
    { id: 1, text: "Solar energy is clean and renewable (Pro)", valid: true },
    { id: 2, text: "Solar panels have high setup costs (Con)", valid: false },
    { id: 3, text: "It reduces monthly electricity bills (Pro)", valid: true },
    { id: 4, text: "It depends on weather conditions (Con)", valid: false }
  ]
];

const TARGET_LANGS = [
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'mr', name: 'Marathi' },
  { code: 'mwr', name: 'Marwari' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'ur', name: 'Urdu' }
];

async function translateTopic(topicIndex, cards, targetLang, attempt = 1) {
  const prompt = `Translate the following list of debate argument cards into ${targetLang.name}.
Keep the exact same JSON format keys ("id", "text", "valid").
Translate only the "text" field into natural, conversational, polite ${targetLang.name} script (not romanized). Include equivalent markers for (Pro) and (Con) in parentheses (e.g. (सकारात्मक) / (नकारात्मक) for Hindi, or appropriate translations).

Input Cards (JSON format):
${JSON.stringify(cards, null, 2)}

Provide the translated cards STRICTLY as a raw JSON array. No markdown formatting.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text.trim();
    return JSON.parse(text);
  } catch (error) {
    const errMsg = error.message || '';
    const isRateLimit = errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('Quota') || errMsg.includes('RESOURCE_EXHAUSTED');
    if (isRateLimit && attempt <= 3) {
      console.warn(`Rate limit hit translating topic ${topicIndex + 1} to ${targetLang.name}. Retrying in 15s (Attempt ${attempt}/3)...`);
      await new Promise(resolve => setTimeout(resolve, 15000));
      return translateTopic(topicIndex, cards, targetLang, attempt + 1);
    }
    console.error(`Error translating topic ${topicIndex + 1} to ${targetLang.name}:`, error);
    return cards;
  }
}

async function run() {
  console.log("Starting multilingual debate cards translation generation...");
  const result = {
    en: ENGLISH_DEBATE
  };

  for (const lang of TARGET_LANGS) {
    console.log(`Translating all 8 debate topics to ${lang.name} (${lang.code})...`);
    const translatedTopics = [];
    for (let i = 0; i < ENGLISH_DEBATE.length; i++) {
      const trans = await translateTopic(i, ENGLISH_DEBATE[i], lang);
      translatedTopics.push(trans);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    result[lang.code] = translatedTopics;
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  const jsContent = `export const DEBATE_CARDS = ${JSON.stringify(result, null, 2)};\n`;
  const sandboxPath = path.join(__dirname, '../../client/src/data/games/sandboxData.js');
  if (!fs.existsSync(sandboxPath)) {
    console.error(`Could not locate sandboxData.js at ${sandboxPath}`);
    process.exit(1);
  }

  let content = fs.readFileSync(sandboxPath, 'utf8');
  const startIdx = content.indexOf('export const DEBATE_CARDS = {');
  if (startIdx === -1) {
    console.error("Could not find DEBATE_CARDS export in sandboxData.js");
    process.exit(1);
  }

  let braceCount = 0;
  let endIdx = -1;
  for (let i = startIdx; i < content.length; i++) {
    if (content[i] === '{') {
      braceCount++;
    } else if (content[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        endIdx = i;
        break;
      }
    }
  }

  if (endIdx === -1) {
    console.error("Could not trace end brace of DEBATE_CARDS");
    process.exit(1);
  }

  let replaceEnd = endIdx + 1;
  if (content[replaceEnd] === ';') {
    replaceEnd++;
  }

  const newContent = content.slice(0, startIdx) + jsContent + content.slice(replaceEnd);
  fs.writeFileSync(sandboxPath, newContent, 'utf8');
  console.log("Successfully rewrote sandboxData.js with 8 multilingual debate topics!");
}

run();
