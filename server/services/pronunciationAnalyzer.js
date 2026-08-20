/**
 * Analyzes word accuracy and identifies mispronounced or omitted words
 */
function analyzePronunciation(expectedText, transcription, languageCode = 'en') {
  if (!expectedText || !transcription) {
    return { accuracy: 0, problemWords: [] };
  }

  const cleanText = (text) => text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '').trim();

  const expectedWords = cleanText(expectedText).split(/\s+/);
  const actualWords = cleanText(transcription).split(/\s+/);

  const problemWords = [];
  let correctCount = 0;

  expectedWords.forEach((word) => {
    if (actualWords.includes(word)) {
      correctCount += 1;
    } else {
      problemWords.push(word);
    }
  });

  const accuracy = Math.round((correctCount / expectedWords.length) * 100);

  // Return basic phoneme errors for English
  const phonemeErrors = [];
  if (languageCode.startsWith('en') && problemWords.length > 0) {
    problemWords.forEach(word => {
      // Mock basic phoneme mapping for English demonstration
      if (word.includes('th')) phonemeErrors.push({ phoneme: 'ð', word });
      else if (word.includes('r')) phonemeErrors.push({ phoneme: 'r', word });
      else phonemeErrors.push({ phoneme: 'schwa', word });
    });
  }

  return {
    accuracy,
    problemWords,
    phonemeErrors
  };
}

module.exports = {
  analyzePronunciation
};
