const { analyzeUserSkills } = require('./skillAnalyzer');

/**
 * Recommends target activities and specific games based on current literacy scores
 */
async function generateRecommendations(userId, skillVectors) {
  const skills = skillVectors || await analyzeUserSkills(userId);
  
  // Find the weakest literacy vector
  let weakestSkill = 'vocabulary';
  let minScore = 100;

  for (const [skill, score] of Object.entries(skills)) {
    if (score < minScore) {
      minScore = score;
      weakestSkill = skill;
    }
  }

  const recommendations = {
    weakestSkill,
    recommendedFocus: weakestSkill.toUpperCase(),
    recommendedGames: [],
    suggestedAction: 'Complete a diagnostic lesson to test your skills.'
  };

  // Map weakest skills to game routes
  const skillToGamesMap = {
    vocabulary: ['word-sprint', 'balloon-pop', 'fruit-catch'],
    speaking: ['echo-chamber', 'speech-prep', 'mock-interview'],
    reading: ['stories', 'scenarios', 'sign-reader'],
    grammar: ['grammar-editor', 'sentence-builder'],
    listening: ['sound-match', 'audio-comp'],
    writing: ['trace-letters', 'word-sprint']
  };

  recommendations.recommendedGames = skillToGamesMap[weakestSkill] || ['word-sprint'];

  // Suggest actions
  if (minScore < 50) {
    recommendations.suggestedAction = `Your ${weakestSkill} score is currently ${minScore}%. Try playing ${recommendations.recommendedGames[0]} for a booster!`;
  } else if (minScore < 85) {
    recommendations.suggestedAction = `Strengthen your ${weakestSkill} skills by playing interactive games today.`;
  } else {
    recommendations.suggestedAction = 'Awesome job! All literacy vectors are high. Advance to intermediate lessons.';
  }

  return recommendations;
}

module.exports = {
  generateRecommendations
};
