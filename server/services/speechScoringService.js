const { analyzePronunciation } = require('./pronunciationAnalyzer');
const { analyzeFluency } = require('./fluencyAnalyzer');

/**
 * Orchestrates pronunciation and fluency scores to return structured speech analytics
 */
function scoreSpeech(expectedText, transcription, languageCode = 'en', durationSeconds = 5) {
  const pronunciationResult = analyzePronunciation(expectedText, transcription, languageCode);
  const fluencyResult = analyzeFluency(transcription, durationSeconds);

  return {
    accuracy: pronunciationResult.accuracy,
    fluency: fluencyResult.fluency,
    wordsPerMinute: fluencyResult.wordsPerMinute,
    pauseCount: fluencyResult.pauseCount,
    problemWords: pronunciationResult.problemWords,
    phonemeErrors: pronunciationResult.phonemeErrors
  };
}

module.exports = {
  scoreSpeech
};
