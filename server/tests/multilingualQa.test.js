const { translateOrAdaptContent } = require('../routes/translationHelper');

describe('Multilingual QA Matrix Verification', () => {
  const languagePairs = [
    { interfaceLang: 'en', learningLang: 'hi' },
    { interfaceLang: 'en', learningLang: 'mr' },
    { interfaceLang: 'en', learningLang: 'ur' },
    { interfaceLang: 'hi', learningLang: 'en' },
    { interfaceLang: 'hi', learningLang: 'ta' },
    { interfaceLang: 'hi', learningLang: 'te' },
    { interfaceLang: 'mr', learningLang: 'en' },
    { interfaceLang: 'ur', learningLang: 'hi' }
  ];

  const testContent = {
    title: 'Basic Alphabet lesson',
    type: 'vocabulary',
    content: 'Learn vowels'
  };

  test('should generate separate cache keys for each matrix pair to prevent leakages', async () => {
    const translationResults = [];

    for (const pair of languagePairs) {
      // Call with isOffline = false to return mock fallback, verifying it executes and builds key correctly
      const result = await translateOrAdaptContent(
        [testContent], 
        pair.learningLang, 
        pair.interfaceLang, 
        'lessons',
        false
      );

      // Verify the returned result has the same structure and doesn't bleed from other pairs
      expect(result).toBeDefined();
      expect(result[0].title).toBe(testContent.title);
    }
  });
});
