const db = require('../db');

async function migrateData() {
  console.log('--- STARTING DATABASE NORMALIZATION MIGRATION ---');
  try {
    // 1. Verify tables are auto-created first
    await db.verifyDatabase();

    // 2. Fetch all raw users
    const [users] = await db.query('SELECT user_id, name, settings, skills_progress, xp, coins, streak, preferred_language, learning_language FROM Users');
    console.log(`Found ${users.length} users to migrate.`);

    for (const user of users) {
      console.log(`Migrating user ID: ${user.user_id} (${user.name})...`);

      // Parse JSON columns safely
      let settingsObj = {};
      if (user.settings) {
        settingsObj = typeof user.settings === 'string' ? JSON.parse(user.settings) : user.settings;
      }
      
      let skillsProgressObj = {};
      if (user.skills_progress) {
        skillsProgressObj = typeof user.skills_progress === 'string' ? JSON.parse(user.skills_progress) : user.skills_progress;
      }

      // Determine settings values
      const interfaceLang = user.preferred_language || 'en';
      const learningLang = user.learning_language || settingsObj.learning_language || 'hi';
      const hasCompletedAssessment = settingsObj.has_completed_assessment || false;

      // A. Populate User_Settings
      await db.query(`
        INSERT INTO User_Settings (user_id, interface_language, learning_language, has_completed_assessment)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          interface_language = VALUES(interface_language),
          learning_language = VALUES(learning_language),
          has_completed_assessment = VALUES(has_completed_assessment)
      `, [user.user_id, interfaceLang, learningLang, hasCompletedAssessment]);

      // B. Populate User_Analytics
      const xpVal = user.xp || 0;
      const coinsVal = user.coins || 0;
      const streakVal = user.streak || 0;
      await db.query(`
        INSERT INTO User_Analytics (user_id, total_xp, total_coins, current_streak, max_streak, last_active)
        VALUES (?, ?, ?, ?, ?, CURRENT_DATE())
        ON DUPLICATE KEY UPDATE
          total_xp = VALUES(total_xp),
          total_coins = VALUES(total_coins),
          current_streak = VALUES(current_streak),
          max_streak = VALUES(max_streak),
          last_active = VALUES(last_active)
      `, [user.user_id, xpVal, coinsVal, streakVal, streakVal]);

      // C. Populate User_Skills
      const skillTypes = ['reading', 'writing', 'speaking', 'listening', 'vocabulary', 'grammar'];
      for (const skill of skillTypes) {
        const stats = skillsProgressObj[skill] || { correct: 0, total: 0 };
        const correctCount = stats.correct || 0;
        const totalCount = stats.total || 0;
        
        await db.query(`
          INSERT INTO User_Skills (user_id, skill_type, correct_count, total_count)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            correct_count = VALUES(correct_count),
            total_count = VALUES(total_count)
        `, [user.user_id, skill, correctCount, totalCount]);
      }
    }

    console.log('--- DATABASE NORMALIZATION MIGRATION COMPLETED SUCCESSFULLY ---');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
}

migrateData();
