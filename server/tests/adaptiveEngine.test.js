const db = require('../db');
const { getAdaptiveLearningProfile } = require('../services/adaptive');

describe('Unified Adaptive Learning Engine Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should compile full learning profile with skill vectors, engagement metrics, recommendations and dynamically interjected paths', async () => {
    // 1. Mock skillAnalyzer queries
    db.query.mockResolvedValueOnce([[
      { skill_type: 'vocabulary', correct_count: 1, total_count: 10 },
      { skill_type: 'speaking', correct_count: 3, total_count: 10 }
    ]]); // User_Skills SELECT
    db.query.mockResolvedValueOnce([[
      { skill: 'vocabulary', fail_count: 2 }
    ]]); // Weak_Areas SELECT

    // 2. Mock engagementAnalyzer query
    const todayStr = new Date().toISOString().split('T')[0];
    db.query.mockResolvedValueOnce([[
      { current_streak: 3, last_active: todayStr }
    ]]); // User_Analytics SELECT

    // 3. Mock pathPredictor queries
    db.query.mockResolvedValueOnce([[
      { lesson_id: 1, title: 'Alphabet Basics', level: 'Beginner', status: 'In Progress' }
    ]]); // Progress JOIN Lessons SELECT

    // Execute orchestrator
    const profile = await getAdaptiveLearningProfile(1);

    expect(profile.userId).toBe(1);
    
    // Skill vector calculations:
    // vocabulary correct/total = 10%, penalty for fail_count(2)*10 = 20%, final = 10 (capped)
    expect(profile.skillVectors.vocabulary).toBe(10);
    // speaking correct/total = 30%, no penalty, final = 30%
    expect(profile.skillVectors.speaking).toBe(30);

    // Engagement risk: active today so low risk
    expect(profile.engagement.dropoutRisk).toBe('Low');

    // Dynamic path boosters: vocabulary and speaking are both < 70%, so boosters are interjected
    expect(profile.learningPath).toHaveLength(3);
    expect(profile.learningPath[0].type).toBe('standard');
    expect(profile.learningPath[1].type).toBe('booster_vocab');
    expect(profile.learningPath[2].type).toBe('booster_speaking');

    // Recommendations mapping
    expect(profile.recommendations.weakestSkill).toBe('vocabulary');
    expect(profile.recommendations.recommendedGames).toContain('word-sprint');
  });
});
