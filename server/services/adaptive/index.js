const { analyzeUserSkills } = require('./skillAnalyzer');
const { analyzeUserEngagement } = require('./engagementAnalyzer');
const { generateRecommendations } = require('./recommendationEngine');
const { generateDynamicPath } = require('./pathPredictor');

/**
 * Compiles a comprehensive adaptive learning profile for the student
 */
async function getAdaptiveLearningProfile(userId) {
  const skillVectors = await analyzeUserSkills(userId);
  const engagement = await analyzeUserEngagement(userId);
  const path = await generateDynamicPath(userId, skillVectors);
  const recommendations = await generateRecommendations(userId, skillVectors);

  return {
    userId,
    skillVectors,
    engagement,
    learningPath: path,
    recommendations
  };
}

module.exports = {
  analyzeUserSkills,
  analyzeUserEngagement,
  generateRecommendations,
  generateDynamicPath,
  getAdaptiveLearningProfile
};
