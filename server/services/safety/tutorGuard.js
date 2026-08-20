/**
 * Tutor Guard to assert academic compliance of outputs
 */
function verifyTutorPersona(responseStyle) {
  if (!responseStyle) return { clean: true };

  const lower = responseStyle.toLowerCase();
  
  // Flag phrases that represent non-academic or inappropriate responses
  const nonAcademicPhrases = [
    'let us play cards',
    'i can give you financial advice',
    'buy this stock',
    'vote for',
    'political opinions'
  ];

  for (const phrase of nonAcademicPhrases) {
    if (lower.includes(phrase)) {
      return {
        clean: false,
        reason: `Tutor response fell out of academic context: "${phrase}"`
      };
    }
  }

  return { clean: true };
}

module.exports = {
  verifyTutorPersona
};
