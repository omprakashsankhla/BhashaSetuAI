const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { logAuditEvent } = require('../services/auditLogger');
const { GoogleGenAI } = require('@google/genai');
const { OpenAI } = require('openai');
const languageContext = require('../middleware/languageContext');
const { withTimeout } = require('../utils/withTimeout');
const rateLimit = require('express-rate-limit');

const router = express.Router();
const fs = require('fs');
const path = require('path');
const { translateOrAdaptContent } = require('./translationHelper');
const assessmentService = require('../services/assessmentService');
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
  return assessmentService.determineProficiency(age, educationLevel, requestedLevel);
}


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'MISSING_API_KEY' });
const sttAi = new GoogleGenAI({ apiKey: process.env.GEMINI_STT_API_KEY || process.env.GEMINI_API_KEY || 'MISSING_API_KEY' });
const fallbackAi = new GoogleGenAI({ apiKey: process.env.GEMINI_FALLBACK_API_KEY || process.env.GEMINI_API_KEY || 'MISSING_API_KEY' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_FALLBACK_API_KEY || process.env.OPENAI_API_KEY || 'MISSING_API_KEY' });

const verifyToken = require('../middleware/auth');

// Generate an assessment based on proficiency level and user category
router.get('/generate', verifyToken, languageContext, async (req, res) => {
  try {
    const targetLang = req.learningLanguage;
    const interfaceLang = req.interfaceLanguage;

    // 1. Fetch user's age and education level
    const [userRows] = await db.query('SELECT age, education_level FROM Users WHERE user_id = ?', [req.userId]);
    const user = userRows[0] || {};
    const userAge = user.age;
    const eduLevel = user.education_level;

    // 2. Apply Demographic rules
    let proficiency = req.query.level;
    const validLevels = ['Beginner', 'Intermediate', 'Advanced'];
    if (!proficiency || proficiency === 'undefined' || !validLevels.includes(proficiency)) {
      proficiency = determineProficiency(userAge, eduLevel, req.query.level);
    }

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

    // 1. Select the English questions from the master bank based on proficiency and demographics
    const mcqs = selectQuestions(b.MCQ, filterByDemographic(b.MCQ, userCategory), 5);
    const readings = selectQuestions(b.Reading, filterByDemographic(b.Reading, userCategory), 4);
    const writings = selectQuestions(b.Writing, filterByDemographic(b.Writing, userCategory), 3);
    const grammars = selectQuestions(b.Grammar, filterByDemographic(b.Grammar, userCategory), 3);

    let allSelected = [...mcqs, ...readings, ...writings, ...grammars];

    // 2. Fetch translations using exact unmodified objects (so cache hits work!)
    let questions = allSelected;
    if (targetLang !== 'en' || interfaceLang !== 'en') {
      try {
        console.log(`[Assessment] Translating generated assessment questions to Learning: ${targetLang}, Interface: ${interfaceLang}`);
        questions = await translateOrAdaptContent(allSelected, targetLang, interfaceLang, 'assessment');
      } catch (err) {
        console.error('[Assessment] AI Translation of selected questions failed, falling back to static offline files:', err.message);
        
        // Offline Fallback sequence:
        if (targetLang !== 'en' && learningQuestionBanks[targetLang]) {
          const offlineQuestions = buildOfflineFallback(learningQuestionBanks[targetLang], proficiency);
          if (offlineQuestions && offlineQuestions.length > 0) {
            console.log(`[Assessment Fallback] Serving Mode B questions from offline bank for ${targetLang}`);
            return res.status(200).json({ questions: offlineQuestions, isFallback: false });
          }
        } else if (interfaceLang !== 'en' && translatedQuestionBanks[interfaceLang]) {
          const offlineQuestions = buildOfflineFallback(translatedQuestionBanks[interfaceLang], proficiency);
          if (offlineQuestions && offlineQuestions.length > 0) {
            console.log(`[Assessment Fallback] Serving Mode A questions from offline bank for interface ${interfaceLang}`);
            return res.status(200).json({ questions: offlineQuestions, isFallback: false });
          }
        }
      }
    }

    // 3. Randomize and assign sequential IDs AFTER translation
    questions.sort(() => Math.random() - 0.5);
    questions = questions.map((q, idx) => ({ ...q, id: idx + 1 }));

    return res.status(200).json({ questions, isFallback: targetLang !== 'en' });

  } catch (error) {
    console.error('Assessment Error:', error);
    res.status(500).json({ message: 'Error generating assessment' });
  }
});

const { rateLimitStore } = require('../services/redisClient');

const voiceLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 6,
  keyGenerator: (req) => req.userId || 'anonymous',
  message: { message: 'Too many voice submissions. Please wait a moment.' },
  store: rateLimitStore
});

router.post('/voice', verifyToken, languageContext, voiceLimiter, upload.single('audio'), async (req, res) => {
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
"transcription" (what the user actually said), "pronunciation", "fluency", "accuracy", "confidence", "feedback" (a brief encouraging 1-sentence feedback written in the language corresponding to language code: ${req.interfaceLanguage}).`;

    try {
      if (browserTranscript && browserTranscript.trim() !== '') {
        console.log(`Using browser transcript fast-path: "${browserTranscript}"`);
        const evalPrompt = `You are a language evaluator. The user was expected to read aloud: "${expectedText}". 
        The speech recognition transcribed it as: "${browserTranscript}".
        Evaluate their spoken attempt against the expected text.
        Provide ONLY a JSON object containing the following keys (all integer values from 0-100 except transcription and feedback which are strings):
        "transcription": "${browserTranscript}", "pronunciation", "fluency", "accuracy", "confidence", "feedback" (a brief encouraging 1-sentence feedback written in the language corresponding to language code: ${req.interfaceLanguage}).`;

        const response = await withTimeout(
          sttAi.models.generateContent({
          model: 'gemini-3.5-flash',
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
        }), 15000, 'Gemini Browser Transcript Eval');

        const parsed = JSON.parse(response.text.trim());
        transcription = browserTranscript;
        aiScores = parsed;
      } else {
        if (!req.file) {
          return res.status(400).json({ message: 'No audio file uploaded.' });
        }
        
        const allowedMimes = ['audio/webm', 'audio/ogg', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/m4a', 'audio/x-m4a', 'audio/mp4', 'application/octet-stream'];
        if (!allowedMimes.includes(req.file.mimetype)) {
          return res.status(400).json({ message: 'Invalid audio file format.' });
        }
        
        const buffer = req.file.buffer;
        if (buffer && buffer.length > 0) {
          const header = buffer.slice(0, 4);
          const isWebM = header[0] === 0x1A && header[1] === 0x45 && header[2] === 0xDF && header[3] === 0xA3;
          const isRIFF = header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46;
          const isMP3 = (header[0] === 0x49 && header[1] === 0x44 && header[2] === 0x33) || (header[0] === 0xFF && (header[1] & 0xE0) === 0xE0);
          
          if (!isWebM && !isRIFF && !isMP3 && req.file.mimetype !== 'application/octet-stream') {
            return res.status(400).json({ message: 'File signature verification failed. Only genuine audio files are allowed.' });
          }
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
             const [userRows] = await db.query('SELECT learning_language FROM Users WHERE user_id = ?', [req.userId]);
             const targetLang = (userRows[0] && userRows[0].learning_language) || 'hi';
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

            const sarvamResponse = await withTimeout(fetch('https://api.sarvam.ai/speech-to-text', {
              method: 'POST',
              headers: {
                'api-subscription-key': process.env.SARVAM_API_KEY
              },
              body: formData
            }), 15000, 'Sarvam STT');

            if (sarvamResponse.ok) {
              const sarvamResult = await sarvamResponse.json();
              transcription = sarvamResult.transcript || '';
              console.log(`Sarvam AI STT success. Transcription: "${transcription}"`);

              if (transcription.trim() !== '') {
                const evalPrompt = `You are a language evaluator. The user was expected to read aloud: "${expectedText}". 
                The speech recognition transcribed it as: "${transcription}".
                Evaluate their spoken attempt against the expected text.
                Provide ONLY a JSON object containing the following keys (all integer values from 0-100 except transcription and feedback which are strings):
                "transcription": "${transcription}", "pronunciation", "fluency", "accuracy", "confidence", "feedback" (a brief encouraging 1-sentence feedback written in the language corresponding to language code: ${req.interfaceLanguage}).`;

                const evalResponse = await withTimeout(sttAi.models.generateContent({
                  model: 'gemini-3.5-flash',
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
                }), 15000, 'Gemini Sarvam Eval');

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
          const response = await withTimeout(sttAi.models.generateContent({
            model: 'gemini-3.5-flash',
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
          }), 15000, 'Gemini Primary Eval');

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
      if (!req.file) {
        console.log('Attempting text-only AI fallback since req.file is undefined...');
        try {
          const fallbackTextPrompt = `You are a language evaluator. The user was expected to read aloud: "${expectedText}". 
          The speech recognition transcribed it as: "${browserTranscript}".
          Evaluate their spoken attempt against the expected text.
          Provide ONLY a JSON object containing the following keys (all integer values from 0-100 except transcription and feedback which are strings):
          "transcription": "${browserTranscript}", "pronunciation", "fluency", "accuracy", "confidence", "feedback" (a brief encouraging 1-sentence feedback written in the language corresponding to language code: ${req.interfaceLanguage}).`;

          const responseTextFallback = await withTimeout(
            fallbackAi.models.generateContent({
              model: 'gemini-3.5-flash',
              contents: fallbackTextPrompt,
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
            }),
            15000,
            'Gemini Text Fallback'
          );
          
          const parsed = JSON.parse(responseTextFallback.text.trim());
          transcription = browserTranscript || '';
          aiScores = parsed;
        } catch (textFallbackErr) {
          console.error('Text-only fallback failed:', textFallbackErr);
          transcription = browserTranscript || '';
          aiScores = { pronunciation: 0, fluency: 0, accuracy: 0, confidence: 0, feedback: 'Evaluation temporarily unavailable, please retry.' };
        }
      } else {
      console.log('Attempting STT fallback using fallbackAi...');
      try {
        const responseFallback = await withTimeout(fallbackAi.models.generateContent({
          model: 'gemini-3.5-flash',
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
        }), 15000, 'Gemini Fallback STT');

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
          
          const transcriptionResponse = await withTimeout(openai.audio.transcriptions.create({
            file: fs.createReadStream(tempPath),
            model: 'whisper-1'
          }), 15000, 'OpenAI Whisper');
          
          const whisperText = transcriptionResponse.text;
          fs.unlinkSync(tempPath);

          const gptPrompt = `You are a strict language evaluator. The user was supposed to say: "${expectedText}". 
          They actually said: "${whisperText}".
          If they said nothing, set all scores to 0.
          Provide ONLY a JSON object containing the following keys (all integer values from 0-100 except transcription and feedback which are strings):
          "transcription": "${whisperText}", "pronunciation", "fluency", "accuracy", "confidence", "feedback" (a brief encouraging 1-sentence feedback written in the language corresponding to language code: ${req.interfaceLanguage}).`;

          const gptRes = await withTimeout(openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: gptPrompt }]
          }), 15000, 'OpenAI Fallback Eval');

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
      } // End of else (!req.file)
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

    // Augment with speechScoringService details
    const speechScoringService = require('../services/speechScoringService');
    const speechResult = speechScoringService.scoreSpeech(
      expectedText, 
      transcription, 
      req.interfaceLanguage || 'en'
    );

    const finalScores = {
      ...aiScores,
      accuracy: speechResult.accuracy,
      fluency: speechResult.fluency,
      wordsPerMinute: speechResult.wordsPerMinute,
      pauseCount: speechResult.pauseCount,
      problemWords: speechResult.problemWords,
      phonemeErrors: speechResult.phonemeErrors
    };

    res.status(200).json({
      message: 'Assessment graded successfully',
      scores: finalScores
    });
  } catch (error) {
    console.error('Voice Error:', error);
    res.status(500).json({ message: 'Error processing voice' });
  }
});

router.post('/submit', verifyToken, languageContext, async (req, res) => {
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

    const currPrompt = assessmentService.getCurriculumPrompt(userAge, eduLevel, totalScore, results, req.interfaceLanguage);
    let curriculum = [...assessmentService.getCurriculumLessons(requestedLevel)];

    try {
      const promptMod = currPrompt + '\nReturn ONLY the JSON object output, no markdown.';
      const geminiRes = await withTimeout(ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: promptMod
      }), 15000, 'Gemini Primary Submit');

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
        const fallbackRes = await withTimeout(fallbackAi.models.generateContent({
          model: 'gemini-3.5-flash-lite',
          contents: promptMod
        }), 15000, 'Gemini Fallback Submit');

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
      { level: 'Beginner', lessons: assessmentService.getCurriculumLessons('Beginner') },
      { level: 'Intermediate', lessons: assessmentService.getCurriculumLessons('Intermediate') },
      { level: 'Advanced', lessons: assessmentService.getCurriculumLessons('Advanced') }
    ];

    for (const group of allCurriculums) {
      for (let i = 0; i < group.lessons.length; i++) {
        const lesson = group.lessons[i];
        let lessonId;
        const [existing] = await db.query(
          'SELECT lesson_id FROM Lessons WHERE title = ? AND level = ?',
          [lesson.title, group.level]
        );
        
        if (existing.length > 0) {
          lessonId = existing[0].lesson_id;
        } else {
          const [insertLesson] = await db.query(
            `INSERT INTO Lessons (title, level, content_data) VALUES (?, ?, ?)`,
            [lesson.title, group.level, JSON.stringify({ type: lesson.type })]
          );
          lessonId = insertLesson.insertId;
        }
        
        let status = 'Not Started';
        let completedAt = null;

        if (group.level === 'Beginner') {
          if (requestedLevel === 'Beginner') {
            status = (i === 0) ? 'In Progress' : 'Not Started';
          } else {
            status = 'completed';
            completedAt = null;
          }
        } else if (group.level === 'Intermediate') {
          if (requestedLevel === 'Beginner') {
            status = 'Not Started';
          } else if (requestedLevel === 'Intermediate') {
            status = (i === 0) ? 'In Progress' : 'Not Started';
          } else {
            status = 'completed';
            completedAt = null;
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

    await logAuditEvent(req.userId, 'ASSESSMENT_SUBMIT', { totalScore, level: requestedLevel }, req.ip);

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
