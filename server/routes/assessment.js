const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { GoogleGenAI } = require('@google/genai');
const { OpenAI } = require('openai');

const router = express.Router();
const fs = require('fs');
const path = require('path');
const { translateOrAdaptContent } = require('./translationHelper');
const questionBankPath = path.join(__dirname, '../data/questionBank.json');
const questionBank = JSON.parse(fs.readFileSync(questionBankPath, 'utf8'));

// Pre-load all translated question banks at startup for offline fallback
// Mode A: Learning English with local interface (e.g. questionBank_ta.json)
const translatedQuestionBanks = {};
// Mode B: Learning local language with English interface (e.g. questionBank_ta_learning.json)
const learningQuestionBanks = {};
const supportedLangs = ['hi', 'bn', 'mr', 'mwr', 'ta', 'te', 'ur'];

for (const lang of supportedLangs) {
  const langBankPath = path.join(__dirname, `../data/questionBank_${lang}.json`);
  if (fs.existsSync(langBankPath)) {
    try {
      translatedQuestionBanks[lang] = JSON.parse(fs.readFileSync(langBankPath, 'utf8'));
      console.log(`[Assessment] Loaded offline Mode A question bank for: ${lang}`);
    } catch (e) {
      console.warn(`[Assessment] Failed to parse questionBank_${lang}.json:`, e.message);
    }
  }
  
  const learningBankPath = path.join(__dirname, `../data/questionBank_${lang}_learning.json`);
  if (fs.existsSync(learningBankPath)) {
    try {
      learningQuestionBanks[lang] = JSON.parse(fs.readFileSync(learningBankPath, 'utf8'));
      console.log(`[Assessment] Loaded offline Mode B learning question bank for: ${lang}`);
    } catch (e) {
      console.warn(`[Assessment] Failed to parse questionBank_${lang}_learning.json:`, e.message);
    }
  }
}

// Helper to determine proficiency based on demographics
function determineProficiency(age, educationLevel, requestedLevel) {
  if (!educationLevel) return requestedLevel || 'Beginner';
  
  const edu = educationLevel.toLowerCase();
  const isNoFormal = edu.includes('no formal') || edu.includes('none');
  const isPrimary = edu.includes('primary');
  const isHighSchool = edu.includes('high school');
  const isAdultLiteracy = edu.includes('adult literacy');

  if (age !== null && age !== undefined && age !== '') {
    const ageNum = parseInt(age, 10);
    if (!isNaN(ageNum)) {
      if (ageNum >= 0 && ageNum <= 15) {
        if (isNoFormal || isPrimary) return 'Beginner';
      } else if (ageNum >= 16 && ageNum <= 20) {
        if (isHighSchool) return 'Intermediate';
      } else if (ageNum >= 21 && ageNum <= 49) {
        if (isHighSchool) return 'Advanced';
      } else if (ageNum >= 50) {
        if (isAdultLiteracy) return 'Intermediate';
        if (isNoFormal || isPrimary) return 'Beginner';
        if (isHighSchool) return 'Intermediate';
      }
    }
  }

  // Rest of ages / fallback
  if (isNoFormal || isPrimary) return 'Beginner';
  if (isHighSchool || isAdultLiteracy) return 'Intermediate';
  
  return requestedLevel || 'Beginner';
}


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'MISSING_API_KEY' });
const sttAi = new GoogleGenAI({ apiKey: process.env.GEMINI_STT_API_KEY || process.env.GEMINI_API_KEY || 'MISSING_API_KEY' });
const fallbackAi = new GoogleGenAI({ apiKey: process.env.GEMINI_FALLBACK_API_KEY || process.env.GEMINI_API_KEY || 'MISSING_API_KEY' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_FALLBACK_API_KEY || process.env.OPENAI_API_KEY || 'MISSING_API_KEY' });

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ message: 'No token provided.' });

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized!' });
    req.userId = decoded.user_id;
    next();
  });
};

router.get('/generate', verifyToken, async (req, res) => {
  try {
    // 1. Fetch user's age, education level, and preferred learning language
    const [userRows] = await db.query('SELECT age, education_level, preferred_language FROM Users WHERE user_id = ?', [req.userId]);
    const user = userRows[0] || {};
    const userAge = user.age;
    const eduLevel = user.education_level;
    const targetLang = user.preferred_language || 'hi';
    const interfaceLang = req.query.lang || 'en';

    // 2. Apply Demographic rules
    const proficiency = determineProficiency(userAge, eduLevel, req.query.level);

    // Always use the master English question bank to translate/adapt from
    const bankToUse = questionBank;

    const b = bankToUse[proficiency];
    if (!b) return res.status(400).json({ message: 'Invalid proficiency level' });

    // 3. Determine Demographic Category
    const userCategory = 
      (userAge && userAge < 12) ? 'Kids' :
      (userAge && userAge >= 22) ? 'Professional' : 'Academic';

    // 4. Helper to filter questions by age & qualification relevance
    const filterByDemographic = (questionArray, category) => {
      if (!questionArray || questionArray.length === 0) return [];
      
      const kidKeywords = ['color', 'animal', 'fruit', 'number', 'letter', 'spelling', 'picture', 'family', 'greeting', 'cartoon', 'play', 'game', 'toy', 'dog', 'cat', 'vowel'];
      const profKeywords = ['office', 'bank', 'hospital', 'letter', 'report', 'project', 'work', 'colleague', 'meeting', 'email', 'client', 'schedule', 'negotiation', 'travel', 'professional', 'interview', 'salary', 'resume', 'business'];

      if (category === 'Kids') {
        const kidsList = questionArray.filter(q => {
          const text = ((q.text || '') + ' ' + (q.word || '')).toLowerCase();
          return kidKeywords.some(kw => text.includes(kw));
        });
        return kidsList.length >= 3 ? kidsList : questionArray;
      }
      
      if (category === 'Professional') {
        const profList = questionArray.filter(q => {
          const text = ((q.text || '') + ' ' + (q.word || '')).toLowerCase();
          return profKeywords.some(kw => text.includes(kw));
        });
        return profList.length >= 3 ? profList : questionArray;
      }

      return questionArray;
    };

    const getRandom = (arr, n) => {
      let len = arr.length;
      if (n > len) n = len;
      let result = new Array(n), taken = new Array(len);
      while (n--) {
        let x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
      }
      return result;
    };

    const selectQuestions = (originalArray, filteredArray, count) => {
      const selected = getRandom(filteredArray || [], count);
      if (selected.length < count) {
        const remainingNeed = count - selected.length;
        const selectedTexts = new Set(selected.map(q => q.text || q.word || ''));
        const unusedOriginal = (originalArray || []).filter(q => !selectedTexts.has(q.text || q.word || ''));
        const additional = getRandom(unusedOriginal, remainingNeed);
        return [...selected, ...additional];
      }
      return selected;
    };

    // Helper: build questions from a pre-translated offline question bank
    const buildOfflineFallback = (bank, prof) => {
      if (!bank || !bank[prof]) return null;
      const ob = bank[prof];
      const oMcqs = getRandom(ob.MCQ || [], 5);
      const oReadings = getRandom(ob.Reading || [], 4);
      const oWritings = getRandom(ob.Writing || [], 3);
      const oGrammars = getRandom(ob.Grammar || [], 3);
      let offlineAll = [...oMcqs, ...oReadings, ...oWritings, ...oGrammars];
      offlineAll.sort(() => Math.random() - 0.5);
      return offlineAll.map((q, idx) => ({ ...q, id: idx + 1 }));
    };

    // --- PRIMARY PATH: Use pre-translated offline bank when available ---
    if (targetLang !== 'en') {
      // User is learning targetLang
      if (learningQuestionBanks[targetLang]) {
        const offlineQuestions = buildOfflineFallback(learningQuestionBanks[targetLang], proficiency);
        if (offlineQuestions && offlineQuestions.length > 0) {
          console.log(`[Assessment] Serving Mode B questions from learning offline bank for ${targetLang}`);
          return res.status(200).json({ questions: offlineQuestions, isFallback: false });
        }
      }
    } else {
      // User is learning English
      if (interfaceLang !== 'en' && translatedQuestionBanks[interfaceLang]) {
        const offlineQuestions = buildOfflineFallback(translatedQuestionBanks[interfaceLang], proficiency);
        if (offlineQuestions && offlineQuestions.length > 0) {
          console.log(`[Assessment] Serving Mode A questions from interface offline bank for interface ${interfaceLang}`);
          return res.status(200).json({ questions: offlineQuestions, isFallback: false });
        }
      }
    }

    // --- FALLBACK PATH: English bank + translation (only when no offline bank) ---
    const mcqs = selectQuestions(b.MCQ, filterByDemographic(b.MCQ, userCategory), 5);
    const readings = selectQuestions(b.Reading, filterByDemographic(b.Reading, userCategory), 4);
    const writings = selectQuestions(b.Writing, filterByDemographic(b.Writing, userCategory), 3);
    const grammars = selectQuestions(b.Grammar, filterByDemographic(b.Grammar, userCategory), 3);

    let allSelected = [...mcqs, ...readings, ...writings, ...grammars];
    allSelected.sort(() => Math.random() - 0.5);
    const questions = allSelected.map((q, idx) => ({ ...q, id: idx + 1 }));

    // If target language is English, return directly
    if (targetLang === 'en') {
      return res.status(200).json({ questions, isFallback: false });
    }

    // Try translation cache/API (fast-fail at runtime)
    const translatedQuestions = await translateOrAdaptContent(questions, targetLang, interfaceLang, 'assessment');

    // Detect if translation actually happened by comparing a sample item
    const sampleOriginal = questions[0];
    const sampleTranslated = translatedQuestions[0];
    const translationSucceeded = sampleOriginal.text !== sampleTranslated.text;

    if (translationSucceeded) {
      return res.status(200).json({ questions: translatedQuestions, isFallback: false });
    }

    // Translation failed and no offline bank — return English as last resort
    console.warn(`[Assessment Fallback] No offline bank and Gemini failed for ${targetLang}. Returning English.`);
    return res.status(200).json({ questions, isFallback: true });

  } catch (error) {
    console.error('Assessment Error:', error);
    res.status(500).json({ message: 'Error generating assessment' });
  }
});

router.post('/voice', verifyToken, upload.single('audio'), async (req, res) => {
  try {
    const expectedText = req.body.expectedText || '';
    const browserTranscript = req.body.browserTranscript || '';

    let transcription = '';
    let aiScores = { pronunciation: 0, fluency: 0, accuracy: 0, confidence: 0, feedback: 'Error evaluating' };

    const combinedPrompt = `You are a strict language evaluator. The user was supposed to say: "${expectedText}".
Listen to the provided audio clip and transcribe it exactly as spoken.
CRITICAL RULE: If the audio is empty, contains only background noise, or there is no recognizable speech, you MUST set "transcription" to "" (empty string) and all scores to 0. Do NOT hallucinate the expected text if it was not spoken.
Then evaluate the transcription against the expected text.
Provide ONLY a JSON object containing the following keys (all integer values from 0-100 except transcription and feedback which are strings):
"transcription" (what the user actually said), "pronunciation", "fluency", "accuracy", "confidence", "feedback" (a brief encouraging 1-sentence feedback).`;

    try {
      if (browserTranscript && browserTranscript.trim() !== '') {
        console.log(`Using browser transcript fast-path: "${browserTranscript}"`);
        const evalPrompt = `You are a language evaluator. The user was expected to read aloud: "${expectedText}". 
        The speech recognition transcribed it as: "${browserTranscript}".
        Evaluate their spoken attempt against the expected text.
        Provide ONLY a JSON object containing the following keys (all integer values from 0-100 except transcription and feedback which are strings):
        "transcription": "${browserTranscript}", "pronunciation", "fluency", "accuracy", "confidence", "feedback" (a brief encouraging 1-sentence feedback).`;

        const response = await sttAi.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: evalPrompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                transcription: { type: 'STRING' },
                pronunciation: { type: 'INTEGER' },
                fluency: { type: 'INTEGER' },
                accuracy: { type: 'INTEGER' },
                confidence: { type: 'INTEGER' },
                feedback: { type: 'STRING' }
              },
              required: ['transcription', 'pronunciation', 'fluency', 'accuracy', 'confidence', 'feedback']
            }
          }
        });

        const parsed = JSON.parse(response.text.trim());
        transcription = browserTranscript;
        aiScores = parsed;
      } else {
        if (!req.file) {
          return res.status(400).json({ message: 'No audio file uploaded.' });
        }
        
        let isEvaluated = false;

        // Try Sarvam AI STT first!
        if (process.env.SARVAM_API_KEY) {
          try {
            console.log("Attempting STT using Sarvam AI...");
            const formData = new FormData();
            const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype || 'audio/webm' });
            formData.append('file', fileBlob, 'speech.webm');
            formData.append('model', 'saaras:v3');
            formData.append('mode', 'transcribe');
             const [userRows] = await db.query('SELECT preferred_language FROM Users WHERE user_id = ?', [req.userId]);
             const targetLang = (userRows[0] && userRows[0].preferred_language) || 'hi';
             const sarvamLangCodes = {
               hi: 'hi-IN',
               ta: 'ta-IN',
               te: 'te-IN',
               bn: 'bn-IN',
               mr: 'mr-IN',
               ur: 'ur-IN',
               en: 'en-IN'
             };
             const langCode = sarvamLangCodes[targetLang] || 'en-IN';
             formData.append('language_code', langCode);

            const sarvamResponse = await fetch('https://api.sarvam.ai/speech-to-text', {
              method: 'POST',
              headers: {
                'api-subscription-key': process.env.SARVAM_API_KEY
              },
              body: formData
            });

            if (sarvamResponse.ok) {
              const sarvamResult = await sarvamResponse.json();
              transcription = sarvamResult.transcript || '';
              console.log(`Sarvam AI STT success. Transcription: "${transcription}"`);

              if (transcription.trim() !== '') {
                const evalPrompt = `You are a language evaluator. The user was expected to read aloud: "${expectedText}". 
                The speech recognition transcribed it as: "${transcription}".
                Evaluate their spoken attempt against the expected text.
                Provide ONLY a JSON object containing the following keys (all integer values from 0-100 except transcription and feedback which are strings):
                "transcription": "${transcription}", "pronunciation", "fluency", "accuracy", "confidence", "feedback" (a brief encouraging 1-sentence feedback).`;

                const evalResponse = await sttAi.models.generateContent({
                  model: 'gemini-3.6-flash',
                  contents: evalPrompt,
                  config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                      type: 'OBJECT',
                      properties: {
                        transcription: { type: 'STRING' },
                        pronunciation: { type: 'INTEGER' },
                        fluency: { type: 'INTEGER' },
                        accuracy: { type: 'INTEGER' },
                        confidence: { type: 'INTEGER' },
                        feedback: { type: 'STRING' }
                      },
                      required: ['transcription', 'pronunciation', 'fluency', 'accuracy', 'confidence', 'feedback']
                    }
                  }
                });

                aiScores = JSON.parse(evalResponse.text.trim());
                isEvaluated = true;
              }
            } else {
              const errBody = await sarvamResponse.text();
              console.warn(`Sarvam AI API returned error status ${sarvamResponse.status}: ${errBody}`);
            }
          } catch (sarvamErr) {
            console.error('Sarvam AI STT error:', sarvamErr.message);
          }
        }

        if (!isEvaluated) {
          console.log("Sarvam AI STT skipped or failed. Falling back to Gemini STT...");
          // Use sttAi for STT as requested
          const response = await sttAi.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    inlineData: {
                      data: req.file.buffer.toString("base64"),
                      mimeType: req.file.mimetype,
                    }
                  },
                  { text: combinedPrompt }
                ]
              }
            ],
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: 'OBJECT',
                properties: {
                  transcription: { type: 'STRING' },
                  pronunciation: { type: 'INTEGER' },
                  fluency: { type: 'INTEGER' },
                  accuracy: { type: 'INTEGER' },
                  confidence: { type: 'INTEGER' },
                  feedback: { type: 'STRING' }
                },
                required: ['transcription', 'pronunciation', 'fluency', 'accuracy', 'confidence', 'feedback']
              }
            }
          });

          let rawContent = response.text || '';
          rawContent = rawContent.trim();

          const evalData = JSON.parse(rawContent);
          transcription = evalData.transcription || '';
          aiScores = {
            pronunciation: evalData.pronunciation || 0,
            fluency: evalData.fluency || 0,
            accuracy: evalData.accuracy || 0,
            confidence: evalData.confidence || 0,
            feedback: evalData.feedback || 'Evaluated successfully'
          };
        }
      }
    } catch (e) {
      console.error('Gemini STT Error:', e.message);
      // Fallback if STT fails
      console.log('Attempting STT fallback using fallbackAi...');
      try {
        const responseFallback = await fallbackAi.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    data: req.file.buffer.toString("base64"),
                    mimeType: req.file.mimetype,
                  }
                },
                { text: combinedPrompt }
              ]
            }
          ],
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                transcription: { type: 'STRING' },
                pronunciation: { type: 'INTEGER' },
                fluency: { type: 'INTEGER' },
                accuracy: { type: 'INTEGER' },
                confidence: { type: 'INTEGER' },
                feedback: { type: 'STRING' }
              },
              required: ['transcription', 'pronunciation', 'fluency', 'accuracy', 'confidence', 'feedback']
            }
          }
        });

        let rawContent = responseFallback.text || '';
        rawContent = rawContent.trim();
        const evalData = JSON.parse(rawContent);
        transcription = evalData.transcription || '';
        aiScores = {
          pronunciation: evalData.pronunciation || 0,
          fluency: evalData.fluency || 0,
          accuracy: evalData.accuracy || 0,
          confidence: evalData.confidence || 0,
          feedback: evalData.feedback || 'Evaluated successfully via fallback'
        };
      } catch (fallbackErr) {
        console.error('Gemini STT Fallback Error:', fallbackErr.message);
        console.log('Attempting STT fallback using OpenAI...');
        try {
          const os = require('os');
          const tempPath = path.join(os.tmpdir(), `audio-${Date.now()}.webm`);
          fs.writeFileSync(tempPath, req.file.buffer);
          
          const transcriptionResponse = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempPath),
            model: 'whisper-1'
          });
          
          const whisperText = transcriptionResponse.text;
          fs.unlinkSync(tempPath);

          const gptPrompt = `You are a strict language evaluator. The user was supposed to say: "${expectedText}". 
          They actually said: "${whisperText}".
          If they said nothing, set all scores to 0.
          Provide ONLY a JSON object containing the following keys (all integer values from 0-100 except transcription and feedback which are strings):
          "transcription": "${whisperText}", "pronunciation", "fluency", "accuracy", "confidence", "feedback" (a brief encouraging 1-sentence feedback).`;

          const gptRes = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: gptPrompt }]
          });

          let rawContent = gptRes.choices[0].message.content || '';
          if (rawContent.startsWith('```json')) {
            rawContent = rawContent.replace(/^```json/, '').replace(/```$/, '').trim();
          } else if (rawContent.startsWith('```')) {
            rawContent = rawContent.replace(/^```/, '').replace(/```$/, '').trim();
          }

          const evalData = JSON.parse(rawContent);
          transcription = whisperText || '';
          aiScores = {
            pronunciation: evalData.pronunciation || 0,
            fluency: evalData.fluency || 0,
            accuracy: evalData.accuracy || 0,
            confidence: evalData.confidence || 0,
            feedback: evalData.feedback || 'Evaluated successfully via OpenAI fallback'
          };
        } catch (openaiErr) {
          console.error('OpenAI Fallback Error:', openaiErr.message);
          return res.status(500).json({ message: 'Failed to transcribe and evaluate audio.' });
        }
      }
    }

    if (!transcription || transcription.trim() === '') {
      return res.status(200).json({
        message: 'Assessment graded successfully',
        scores: { pronunciation: 0, fluency: 0, accuracy: 0, confidence: 0, feedback: 'No speech detected. Please try again.' }
      });
    }

    /* 
      // NOTE: ChatGPT (OpenAI) evaluation code is commented out below due to quota exhaustion causing major delays.
      // If you recharge your OpenAI account, you can revert to using STT (Gemini) + Eval (OpenAI) separately.
    */

    console.log(`STT Transcription: "${transcription}" | Expected: "${expectedText}" | Score: ${aiScores.pronunciation}`);

    const insertQuery = `
      INSERT INTO Voice_Assessments 
      (user_id, pronunciation_score, fluency_score, accuracy_score, confidence_score)
      VALUES (?, ?, ?, ?, ?)
    `;

    await db.query(insertQuery, [
      req.userId,
      aiScores.pronunciation,
      aiScores.fluency,
      aiScores.accuracy,
      aiScores.confidence
    ]);

    res.status(200).json({
      message: 'Assessment graded successfully',
      scores: aiScores
    });
  } catch (error) {
    console.error('Voice Error:', error);
    res.status(500).json({ message: 'Error processing voice' });
  }
});

router.post('/submit', verifyToken, async (req, res) => {
  try {
    const { results, lang, level } = req.body;
    
    // 1. Fetch user's age and education level
    const [userRows] = await db.query('SELECT age, education_level FROM Users WHERE user_id = ?', [req.userId]);
    const user = userRows[0] || {};
    const userAge = user.age;
    const eduLevel = user.education_level;
    const isNoFormalEdu = eduLevel ? (eduLevel.toLowerCase().includes('no formal') || eduLevel.toLowerCase().includes('none')) : false;

    // 2. Apply Demographic rules
    const requestedLevel = determineProficiency(userAge, eduLevel, level);

    const totalScore = results.reduce((acc, curr) => acc + (curr.isCorrect ? 10 : 0), 0);

    const insertQuery = `
      INSERT INTO Assessments 
      (user_id, type, score)
      VALUES (?, 'MCQ', ?)
    `;
    await db.query(insertQuery, [req.userId, totalScore]);

    // Clear existing curriculum progress if the user is retaking the assessment
    await db.query(`DELETE FROM Progress WHERE user_id = ?`, [req.userId]);

    // Generate Personalized Curriculum using Gemini API

    // Analyze weak points
    const failedQuestions = results.filter(r => !r.isCorrect).length;

    const currPrompt = `You are an expert language teacher. The user took a language assessment.
User Age: ${userAge || 'Not specified'}
User Education Level: ${eduLevel || 'Not specified'}
Score: ${totalScore} out of ${results.length * 10}.
Details: ${results.map(r => `Q: ${r.type}, Correct: ${r.isCorrect}`).join('; ')}.

Generate a JSON object with the following structure:
{
  "overall_level": "Beginner/Intermediate/Advanced",
  "strengths": ["string", "string", "string", "string", "string"],
  "weaknesses": ["string", "string", "string", "string", "string"],
  "learning_strategy": "Exactly 5 lines of text summarizing their performance in language code: '${lang}'. Customize the advice based on their age and education level (e.g. kid-friendly if age < 12, professional/situational if adult/workplace, simple/supportive if 50+ or no formal education).",
  "recommended_focus": "reading|writing|listening|speaking|grammar|vocabulary",
  "improvements": ["string", "string", "string", "string", "string"]
}

Output strictly valid JSON. No markdown formatting.`;

    let curriculumBeginner = [
      { title: 'Letters', type: 'reading' },
      { title: 'Vowels', type: 'reading' },
      { title: 'Consonants', type: 'reading' },
      { title: 'Greetings', type: 'speaking' },
      { title: 'Family', type: 'vocabulary' },
      { title: 'Colors', type: 'vocabulary' },
      { title: 'Weekly Assessment', type: 'quiz' },
      { title: 'Numbers', type: 'listening' },
      { title: 'Days of week', type: 'vocabulary' },
      { title: 'Months', type: 'vocabulary' },
      { title: 'Animals', type: 'vocabulary' },
      { title: 'Fruits', type: 'vocabulary' },
      { title: 'Vegetables', type: 'vocabulary' },
      { title: 'Weekly Test', type: 'quiz' },
      { title: 'Sentence Building', type: 'grammar' },
      { title: 'Reading', type: 'reading' },
      { title: 'Listening', type: 'listening' },
      { title: 'Speaking', type: 'speaking' },
      { title: 'Object Identification', type: 'vocabulary' },
      { title: 'Picture Story', type: 'reading' },
      { title: 'Role Play', type: 'speaking' },
      { title: 'Hospital', type: 'speaking' },
      { title: 'Bank', type: 'listening' },
      { title: 'Bus', type: 'speaking' },
      { title: 'Market', type: 'vocabulary' },
      { title: 'Emergency', type: 'speaking' },
      { title: 'Digital Payments', type: 'reading' },
      { title: 'Phone Calls', type: 'speaking' },
      { title: 'Reading Signs', type: 'reading' },
      { title: 'Final Assessment', type: 'quiz' }
    ];

    let curriculumIntermediate = [
      { title: 'Complex Sentence Structures', type: 'grammar' },
      { title: 'Advanced Vocabulary', type: 'vocabulary' },
      { title: 'Idiomatic Expressions', type: 'vocabulary' },
      { title: 'Professional Communication', type: 'speaking' },
      { title: 'Family and Relationships', type: 'reading' },
      { title: 'Advanced Colors & Descriptive Adjectives', type: 'reading' },
      { title: 'Weekly Assessment Intermediate 1', type: 'quiz' },
      { title: 'Advanced Numeracy and Statistics', type: 'listening' },
      { title: 'Calendars, Schedules, and Temporal Clauses', type: 'reading' },
      { title: 'Fauna and Ecological Systems', type: 'reading' },
      { title: 'Flora, Agriculture, and Botany', type: 'reading' },
      { title: 'Culinary Arts and Grocery', type: 'vocabulary' },
      { title: 'Advanced Discourse and Cohesion', type: 'grammar' },
      { title: 'Weekly Assessment Intermediate 2', type: 'quiz' },
      { title: 'Advanced Hypothesis and Conditionals', type: 'grammar' },
      { title: 'Advanced Rhetoric and Persuasion', type: 'speaking' },
      { title: 'Synthesis and Technical Writing', type: 'reading' },
      { title: 'Advanced Public Speaking and Oratory', type: 'speaking' },
      { title: 'Weekly Assessment Intermediate 3', type: 'quiz' },
      { title: 'Advanced Stylistics and Literary Devices', type: 'reading' },
      { title: 'Advanced Critical Thinking and Argumentation', type: 'speaking' },
      { title: 'Advanced Global English and Varieties', type: 'reading' },
      { title: 'Weekly Assessment Intermediate 4', type: 'quiz' },
      { title: 'Advanced Editing and Proofreading', type: 'grammar' },
      { title: 'Advanced Cross-Cultural Pragmatics', type: 'speaking' },
      { title: 'Advanced Professional Networking and Negotiation', type: 'speaking' },
      { title: 'Weekly Assessment Intermediate 5', type: 'quiz' },
      { title: 'Advanced Leadership and Crisis Communication', type: 'speaking' },
      { title: 'Advanced Innovation and Future Trends', type: 'reading' },
      { title: 'Advanced Mastery and Capstone Preparation', type: 'quiz' }
    ];

    let curriculumAdvanced = [
      { title: 'Advanced Phonetics and Dialectal Variation', type: 'speaking' },
      { title: 'Advanced Etymology and Lexicology', type: 'vocabulary' },
      { title: 'Advanced Syntax and Generative Grammar', type: 'grammar' },
      { title: 'Advanced Discourse Analysis and Textual Cohesion', type: 'reading' },
      { title: 'Advanced Cognitive Linguistics and Metaphor Theory', type: 'reading' },
      { title: 'Weekly Assessment Advanced 1', type: 'quiz' },
      { title: 'Advanced Psycholinguistics and Language Acquisition', type: 'reading' },
      { title: 'Advanced Sociolinguistics and Language Variation', type: 'reading' },
      { title: 'Advanced Corpus Linguistics and Computational Lexicography', type: 'reading' },
      { title: 'Advanced Pragmatics and Speech Act Theory', type: 'speaking' },
      { title: 'Weekly Assessment Advanced 2', type: 'quiz' },
      { title: 'Advanced Computational Linguistics and NLP', type: 'reading' },
      { title: 'Advanced Forensic Linguistics and Authorship Attribution', type: 'reading' },
      { title: 'Advanced Language Typology and Universals', type: 'grammar' },
      { title: 'Advanced Language Evolution and Historical Linguistics', type: 'reading' },
      { title: 'Weekly Assessment Advanced 3', type: 'quiz' },
      { title: 'Advanced Semiotics and Philosophy of Language', type: 'reading' },
      { title: 'Advanced Stylistics and Literary Poetics', type: 'reading' },
      { title: 'Advanced Second Language Acquisition (SLA) Theories', type: 'reading' },
      { title: 'Weekly Assessment Advanced 4', type: 'quiz' },
      { title: 'Advanced Multilingualism and Psycholinguistic Processing', type: 'reading' },
      { title: 'Advanced Critical Discourse Analysis (CDA)', type: 'reading' },
      { title: 'Advanced Human-Computer Interaction (HCI) and Voice AI Linguistics', type: 'listening' },
      { title: 'Advanced Research Methodology in Applied Linguistics', type: 'reading' },
      { title: 'Weekly Assessment Advanced 5', type: 'quiz' },
      { title: 'Advanced Linguistic Universals and Biolinguistics', type: 'reading' },
      { title: 'Advanced Digital Literacies and Multimodal Semiotics', type: 'reading' },
      { title: 'Advanced Capstone Project Integration and Evaluation', type: 'quiz' }
    ];

    let curriculum = curriculumBeginner;
    if (requestedLevel === 'Intermediate') curriculum = curriculumIntermediate;
    if (requestedLevel === 'Advanced') curriculum = curriculumAdvanced;

    try {
      const promptMod = currPrompt + '\nReturn ONLY the JSON object output, no markdown.';
      const geminiRes = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: promptMod
      });

      let content = geminiRes.text;
      if (content.startsWith('\`\`\`json')) {
        content = content.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
      } else if (content.startsWith('\`\`\`')) {
        content = content.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
      }

      const parsed = JSON.parse(content);
      req.aiInsights = parsed;
      req.evaluationText = parsed.learning_strategy || "You did a great job!";
    } catch (geminiErr) {
      console.error('Gemini Primary Eval Error, using fallback:', geminiErr.message);
      try {
        const promptMod = currPrompt + '\nReturn ONLY the JSON object output, no markdown.';
        const fallbackRes = await fallbackAi.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: promptMod
        });

        let content = fallbackRes.text;
        if (content.startsWith('\`\`\`json')) {
          content = content.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
        } else if (content.startsWith('\`\`\`')) {
          content = content.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
        }

        const parsed = JSON.parse(content);
        req.aiInsights = parsed;
        req.evaluationText = parsed.learning_strategy || "You did a great job!";
      } catch (fallbackErr) {
        console.error('Gemini Fallback Eval Error:', fallbackErr.message);
        req.evaluationText = "Keep practicing! You are making good progress.";
        req.aiInsights = {
          overall_level: "Beginner",
          strengths: ["Attempting questions"],
          weaknesses: ["Needs more practice"],
          learning_strategy: "Keep practicing! You are making good progress.",
          recommended_focus: "vocabulary"
        };
      }
    }
    // Reorder curriculum based on recommended_focus and demographics
    if (req.aiInsights) {
      let focusType = req.aiInsights.recommended_focus ? req.aiInsights.recommended_focus.toLowerCase() : '';
      
      // Determine demographic preferred types
      let demoPrefType = '';
      if (userAge && userAge < 12) {
        demoPrefType = 'vocabulary'; // Kids love learning names of objects/animals
      } else if (userAge && userAge >= 22 && !isNoFormalEdu) {
        demoPrefType = 'speaking'; // Professionals need oral practice
      }

      // Sort by: priority 1 = matches focusType, priority 2 = matches demoPrefType
      curriculum.sort((a, b) => {
        const aType = a.type.toLowerCase();
        const bType = b.type.toLowerCase();
        
        let aScore = 0;
        let bScore = 0;
        
        if (aType === focusType) aScore += 2;
        if (bType === focusType) bScore += 2;
        
        if (aType === demoPrefType) aScore += 1;
        if (bType === demoPrefType) bScore += 1;
        
        return bScore - aScore; // Descending score
      });
    }

    // Save all three curriculums to Lessons and Progress tables
    const allCurriculums = [
      { level: 'Beginner', lessons: curriculumBeginner },
      { level: 'Intermediate', lessons: curriculumIntermediate },
      { level: 'Advanced', lessons: curriculumAdvanced }
    ];

    for (const group of allCurriculums) {
      for (let i = 0; i < group.lessons.length; i++) {
        const lesson = group.lessons[i];
        const [insertLesson] = await db.query(
          `INSERT INTO Lessons (title, level, content_data) VALUES (?, ?, ?)`,
          [lesson.title, group.level, JSON.stringify({ type: lesson.type })]
        );

        const lessonId = insertLesson.insertId;
        
        let status = 'Not Started';
        let completedAt = null;

        if (group.level === 'Beginner') {
          if (requestedLevel === 'Beginner') {
            status = (i === 0) ? 'In Progress' : 'Not Started';
          } else {
            status = 'completed';
            completedAt = new Date();
          }
        } else if (group.level === 'Intermediate') {
          if (requestedLevel === 'Beginner') {
            status = 'Not Started';
          } else if (requestedLevel === 'Intermediate') {
            status = (i === 0) ? 'In Progress' : 'Not Started';
          } else {
            status = 'completed';
            completedAt = new Date();
          }
        } else if (group.level === 'Advanced') {
          if (requestedLevel === 'Advanced') {
            status = (i === 0) ? 'In Progress' : 'Not Started';
          } else {
            status = 'Not Started';
          }
        }

        await db.query(
          `INSERT INTO Progress (user_id, lesson_id, status, completed_at) VALUES (?, ?, ?, ?)`,
          [req.userId, lessonId, status, completedAt]
        );
      }
    }

    // Save insights and selected proficiency level to user settings
    if (req.aiInsights) {
      req.aiInsights.overall_level = requestedLevel; // Override AI with target level
      await db.query(
        `UPDATE Users SET proficiency_level = ?, settings = JSON_SET(COALESCE(settings, '{}'), '$.ai_insights', CAST(? AS JSON)) WHERE user_id = ?`,
        [requestedLevel, JSON.stringify(req.aiInsights), req.userId]
      );
    } else {
      await db.query(
        `UPDATE Users SET proficiency_level = ? WHERE user_id = ?`,
        [requestedLevel, req.userId]
      );
    }

    res.status(200).json({
      message: 'Assessment and curriculum saved successfully',
      totalScore,
      curriculum,
      insights: req.aiInsights,
      evaluation: req.evaluationText || "Keep practicing! You are making good progress."
    });
  } catch (err) {
    console.error('Error saving final assessment:', err);
    res.status(500).json({ message: 'Error saving final assessment' });
  }
});

module.exports = router;
