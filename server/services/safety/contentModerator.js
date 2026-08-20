/**
 * Content moderation check for inappropriate language, hate, or harassment
 */
function analyzeContentSafety(text) {
  if (!text) return { clean: true };

  const lower = text.toLowerCase();
  
  // Basic list of inappropriate terms / hate flags across languages for demonstration
  const bannedKeywords = [
    'hate you',
    'stupid bot',
    'kill yourself',
    'harass',
    'abuse',
    'violence',
    'threaten',
    'illegal instructions',
    'make a bomb'
  ];

  for (const keyword of bannedKeywords) {
    if (lower.includes(keyword)) {
      return {
        clean: false,
        reason: `Flagged content keyword detected: "${keyword}"`
      };
    }
  }

  return { clean: true };
}

module.exports = {
  analyzeContentSafety
};
