/**
 * Evaluates fluency metrics such as speech speed (words per minute) and pause detections
 */
function analyzeFluency(transcription, durationSeconds = 5) {
  if (!transcription) {
    return { fluency: 0, wordsPerMinute: 0, pauseCount: 0 };
  }

  const cleanText = transcription.toLowerCase();
  const words = cleanText.split(/\s+/).filter(w => w.length > 0);

  // Count common filler words indicative of hesitation/pauses
  const fillerWords = ['um', 'ah', 'uh', 'hmm', 'oh', 'like'];
  let pauseCount = 0;
  
  words.forEach(word => {
    if (fillerWords.includes(word)) {
      pauseCount += 1;
    }
  });

  // Calculate words per minute (WPM)
  const durationMin = Math.max(durationSeconds, 1) / 60;
  const wordsPerMinute = Math.round(words.length / durationMin);

  // Fluency score calculation (100 base, reduced by pauses or extremely low speed)
  let fluency = 100 - (pauseCount * 12);
  
  // Normal WPM for native speakers is 110-150. For learners, WPM < 60 reduces fluency.
  if (wordsPerMinute < 60) {
    fluency -= 20;
  }
  
  fluency = Math.max(Math.min(fluency, 100), 10);

  return {
    fluency,
    wordsPerMinute,
    pauseCount
  };
}

module.exports = {
  analyzeFluency
};
