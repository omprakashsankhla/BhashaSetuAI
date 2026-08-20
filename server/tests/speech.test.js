const { analyzePronunciation } = require('../services/pronunciationAnalyzer');
const { analyzeFluency } = require('../services/fluencyAnalyzer');
const { scoreSpeech } = require('../services/speechScoringService');

describe('Speech Pronunciation Analyzer', () => {
  test('should compute accurate matching word scores and flag problem words', () => {
    const expected = 'Hello world learning language';
    const transcript = 'Hello learning language'; // missed 'world'
    
    const result = analyzePronunciation(expected, transcript, 'en');
    expect(result.accuracy).toBe(75); // 3 of 4 words match
    expect(result.problemWords).toContain('world');
  });
});

describe('Speech Fluency Analyzer', () => {
  test('should calculate correct WPM and pause/hesitation counts', () => {
    const transcript = 'Hello um world ah learning'; // 2 hesitation pauses
    const result = analyzeFluency(transcript, 6); // 6 seconds duration = 0.1 min
    
    expect(result.pauseCount).toBe(2);
    expect(result.wordsPerMinute).toBe(50); // 5 words / 0.1 min
    expect(result.fluency).toBeLessThan(100);
  });
});

describe('Speech Scoring Orchestrator', () => {
  test('should return combined pronunciation and fluency metrics object', () => {
    const result = scoreSpeech('Hello world', 'Hello world', 'en', 1);
    expect(result.accuracy).toBe(100);
    expect(result.fluency).toBe(100);
    expect(result.wordsPerMinute).toBe(120);
    expect(result.pauseCount).toBe(0);
    expect(result.problemWords).toHaveLength(0);
  });
});
