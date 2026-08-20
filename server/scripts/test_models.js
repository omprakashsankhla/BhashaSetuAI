const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY || 'MISSING_API_KEY';
const ai = new GoogleGenAI({ apiKey });

async function testModel(modelName) {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: 'Hello, respond with only one word: Success.',
    });
    console.log(`Model ${modelName}: Success - Response: ${response.text.trim()}`);
    return true;
  } catch (err) {
    console.log(`Model ${modelName}: Failed - ${err.message}`);
    return false;
  }
}

async function run() {
  const models = [
    'gemini-flash-latest',
    'gemini-flash-lite-latest',
    'gemini-2.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash'
  ];
  for (const m of models) {
    await testModel(m);
  }
}

run();
