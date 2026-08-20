const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env'), override: true });

const masterPath = path.join(__dirname, '../data/questionBank.json');
const masterData = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

const languageNames = {
  mwr: 'Marwadi'
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function translateBatchGemini(strings) {
  if (strings.length === 0) return [];
  
  let attempts = 0;
  while (attempts < 3) {
    try {
      const prompt = `Translate the following JSON array of strings to Marwadi (mwr). Return ONLY a valid JSON array of the translated strings in the EXACT same order. Do NOT include any markdown formatting, backticks, or other text. Here is the array: ${JSON.stringify(strings)}`;
      
      const apiKey = process.env.GEMINI_API_KEY || 'MISSING_API_KEY';
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: prompt,
      });

      let text = response.text.trim();
      if (text.startsWith('\`\`\`json')) text = text.substring(7);
      if (text.startsWith('\`\`\`')) text = text.substring(3);
      if (text.endsWith('\`\`\`')) text = text.substring(0, text.length - 3);
      
      const translatedList = JSON.parse(text.trim());
      
      if (Array.isArray(translatedList) && translatedList.length === strings.length) {
        return translatedList;
      } else {
        throw new Error('Length mismatch or invalid array');
      }
    } catch (err) {
      attempts++;
      console.log(`[Error] Gemini Batch translation failed (attempt ${attempts}):`, err.message);
      await delay(5000);
    }
  }
  
  console.log(`[Error] Returning original strings after 3 failed Gemini attempts.`);
  return strings; // Fallback
}

async function translateAllStringsGemini(strings) {
  const uniqueStrings = Array.from(new Set(strings.filter(s => s && typeof s === 'string' && s.trim().length > 0)));
  console.log(`Translating ${uniqueStrings.length} unique strings to Marwadi using Gemini...`);
  
  const translations = {};
  const batchSize = 25; // Smaller batch for Gemini JSON limits
  
  for (let i = 0; i < uniqueStrings.length; i += batchSize) {
    const batch = uniqueStrings.slice(i, i + batchSize);
    console.log(`  Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(uniqueStrings.length / batchSize)}`);
    const results = await translateBatchGemini(batch);
    for (let j = 0; j < batch.length; j++) {
      translations[batch[j]] = results[j];
    }
    await delay(4500); // Respect 15 req/min free limit
  }
  
  return translations;
}

const translationsCache = {};

async function run() {
  const targets = [
    { lang: 'mwr', mode: 'A' }, { lang: 'mwr', mode: 'B' }
  ];

  // Collect all unique strings from master data
  const allMasterStrings = [];
  for (const level in masterData) {
    for (const type in masterData[level]) {
      for (const item of masterData[level][type]) {
        if (item.text) allMasterStrings.push(item.text);
        if (item.feedback) allMasterStrings.push(item.feedback);
        if (item.word) allMasterStrings.push(item.word);
        if (item.answer) allMasterStrings.push(item.answer);
        if (item.options) allMasterStrings.push(...item.options);
      }
    }
  }

  // Pre-load static translations for interface commands
  const interfaceCommands = {
    'Translate into English': { mwr: 'अंग्रेजी में अनुवाद करें' },
    'The phrase was': { mwr: 'वाक्यांश था' },
    'Fill in the blank': { mwr: 'रिक्त स्थान भरें' },
    'Correct answer is': { mwr: 'सही उत्तर है' },
    'Read aloud': { mwr: 'ज़ोर से पढ़ें' }
  };

  let transMap = translationsCache['mwr'];
  if (!transMap) {
    transMap = await translateAllStringsGemini(allMasterStrings);
    translationsCache['mwr'] = transMap;
  }

  for (const target of targets) {
    console.log(`\n========================================`);
    console.log(`Processing: ${target.lang} - Mode ${target.mode}`);
    console.log(`========================================`);

    const fileName = `questionBank_${target.mode === 'B' ? `${target.lang}_learning` : target.lang}.json`;
    const outputPath = path.join(__dirname, '../data', fileName);

    const localCommands = {};
    for (const key in interfaceCommands) {
      localCommands[key] = interfaceCommands[key][target.lang] || transMap[key] || key;
    }

    const outputData = {};

    for (const level of ['Beginner', 'Intermediate', 'Advanced']) {
      outputData[level] = {};
      const levelData = masterData[level];

      for (const type of ['MCQ', 'Reading', 'Writing', 'Grammar', 'Puzzle']) {
        const items = levelData[type] || [];
        outputData[level][type] = [];

        for (const item of items) {
          const newItem = { ...item };

          if (target.mode === 'A') {
            // Mode A: Learning English, Local Interface
            if (type === 'MCQ') {
              newItem.text = transMap[item.text] || item.text;
              newItem.feedback = transMap[item.feedback] || item.feedback;
            } else if (type === 'Reading') {
              newItem.text = `${localCommands['Read aloud']}: ${item.word}`;
            } else if (type === 'Writing') {
              const transWord = transMap[item.text] || item.text;
              newItem.text = `${localCommands['Translate into English']}: ${transWord}`;
              newItem.feedback = `${localCommands['The phrase was']}: ${item.text}`;
            } else if (type === 'Grammar') {
              newItem.text = `${localCommands['Fill in the blank']}: ${item.text}`;
              newItem.feedback = `${localCommands['Correct answer is']}: ${item.answer}`;
            } else if (type === 'Puzzle') {
              newItem.text = transMap[item.text] || item.text;
              newItem.feedback = `${localCommands['Correct answer is']}: ${item.answer}`;
            }
          } else {
            // Mode B: Learning Local Language, English Interface
            const langName = languageNames[target.lang];
            
            if (type === 'MCQ') {
              newItem.text = item.text.replace(/fruit|animal|color|day of the week|vegetable|drink|month of the year|vehicle|shape|professional role/g, match => `${match} in ${langName}`);
              newItem.options = item.options.map(opt => transMap[opt] || opt);
              
              const correctIdx = item.options.indexOf(item.answer);
              if (correctIdx !== -1) {
                newItem.answer = newItem.options[correctIdx];
              } else {
                newItem.answer = transMap[item.answer] || item.answer;
              }
              newItem.feedback = `Correct answer is: ${newItem.answer}`;
            } else if (type === 'Reading') {
              const transWord = transMap[item.word] || item.word;
              newItem.text = `Read aloud: ${transWord}`;
              newItem.word = transWord;
            } else if (type === 'Writing') {
              newItem.text = `Translate into ${langName}: ${item.text}`;
              newItem.answer = transMap[item.text] || item.text;
              newItem.feedback = `Correct translation is: ${newItem.answer}`;
            } else if (type === 'Grammar') {
              const fullSentence = item.text.replace('_____', item.answer).replace('___', item.answer);
              const transFull = transMap[fullSentence] || fullSentence;
              const transAns = transMap[item.answer] || item.answer;
              
              newItem.text = `Fill in the blank: ${transFull.replace(transAns, '___')}`;
              newItem.options = item.options.map(opt => transMap[opt] || opt);
              
              const correctIdx = item.options.indexOf(item.answer);
              if (correctIdx !== -1) {
                newItem.answer = newItem.options[correctIdx];
              } else {
                newItem.answer = transAns;
              }
              newItem.feedback = `Correct answer is: ${newItem.answer}`;
            } else if (type === 'Puzzle') {
              newItem.text = item.text;
              newItem.options = item.options.map(opt => transMap[opt] || opt);
              
              const correctIdx = item.options.indexOf(item.answer);
              if (correctIdx !== -1) {
                newItem.answer = newItem.options[correctIdx];
              } else {
                newItem.answer = transMap[item.answer] || item.answer;
              }
              newItem.feedback = `Correct answer is: ${newItem.answer}`;
            }
          }

          outputData[level][type].push(newItem);
        }
      }
    }

    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');
    console.log(`[Success] Written file to ${outputPath}`);
  }

  console.log('\n========================================');
  console.log('Marwadi Question Banks generated successfully!');
  console.log('========================================');
}

run().catch(console.error);
