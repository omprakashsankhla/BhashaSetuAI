const db = require('../db');
const fs = require('fs');
const path = require('path');
const cacheService = require('./redisClient');
const { translateOrAdaptContent } = require('../routes/translationHelper');
require('dotenv').config({ override: true });

class LessonService {
  /**
   * Get a translated lesson from Redis/DB cache or translate it on the fly
   * @param {number|string} lessonId 
   * @param {string} learningLang 
   * @param {string|boolean} [interfaceLang='en'] - User's interface language or isOffline boolean
   * @param {boolean} [isOffline=false] - Set true for batch pre-generation (longer timeouts, more retries)
   * @returns {Promise<any>}
   */
  async getTranslatedLesson(lessonId, learningLang, interfaceLang = 'en', isOffline = false) {
    if (typeof interfaceLang === 'boolean') {
      isOffline = interfaceLang;
      interfaceLang = 'en';
    }

    const cacheKey = `lesson_${lessonId}_${learningLang}_${interfaceLang}`;

    // 1. Check Redis Cache
    const redisHit = await cacheService.get(cacheKey);
    if (redisHit) {
      return JSON.parse(redisHit);
    }

    // 2. Check Database Cache
    let [rows] = await db.query(
      'SELECT translated_content FROM lesson_translations WHERE lesson_id = ? AND language_code = ? AND interface_language = ?',
      [lessonId, learningLang, interfaceLang]
    );

    if (rows.length > 0) {
      const content = typeof rows[0].translated_content === 'string' 
        ? JSON.parse(rows[0].translated_content) 
        : rows[0].translated_content;
      
      // Update Redis cache
      await cacheService.set(cacheKey, JSON.stringify(content), 86400);
      return content;
    }

    // 3. Cache Miss: Translate and Store
    const englishLesson = await this.getEnglishLesson(lessonId);
    if (!englishLesson) {
      throw new Error(`Lesson ${lessonId} not found in master data.`);
    }

    if (learningLang === 'en' && interfaceLang === 'en') {
      return englishLesson;
    }

    console.log(`[CACHE MISS] Translating Lesson ${lessonId} to Learning: ${learningLang}, Interface: ${interfaceLang}`);
    const translatedActivities = await this.translateLessonContent(englishLesson.activities, learningLang, interfaceLang, isOffline);
    
    const translatedLesson = {
      ...englishLesson,
      activities: translatedActivities
    };

    // 4. Save to Cache
    const shouldSave = isOffline || (translatedActivities && JSON.stringify(translatedActivities) !== JSON.stringify(englishLesson.activities));
    if (shouldSave) {
      await db.query(
        'REPLACE INTO lesson_translations (lesson_id, language_code, interface_language, translated_content) VALUES (?, ?, ?, ?)',
        [lessonId, learningLang, interfaceLang, JSON.stringify(translatedLesson)]
      );
      await cacheService.set(cacheKey, JSON.stringify(translatedLesson), 86400);
    } else {
      await cacheService.set(cacheKey, JSON.stringify(translatedLesson), 3600); // 1 hr fallback cache
    }

    return translatedLesson;
  }

  /**
   * Translate lesson content through the shared translationHelper,
   * which checks translation_cache.json first and persists new entries.
   */
  async translateLessonContent(activities, learningLang, interfaceLang = 'en', isOffline = false) {
    if (typeof interfaceLang === 'boolean') {
      isOffline = interfaceLang;
      interfaceLang = 'en';
    }
    try {
      return await translateOrAdaptContent(activities, learningLang, interfaceLang, 'lessons', isOffline);
    } catch (err) {
      console.error(`AI Lesson Translation failed for ${learningLang} with interface ${interfaceLang}:`, err.message);
      return activities; // fallback to English
    }
  }

  async getEnglishLesson(lessonId) {
    // Determine level prefix if we have it from DB
    let levelPrefix = '';
    
    if (lessonId !== 'practice') {
      const [dbLesson] = await db.query('SELECT level, title FROM Lessons WHERE lesson_id = ?', [lessonId]);
      if (dbLesson.length > 0) {
        if (dbLesson[0].level === 'Intermediate') levelPrefix = '_intermediate';
        if (dbLesson[0].level === 'Advanced') levelPrefix = '_advanced';
        
        const filePath = path.join(__dirname, '..', 'data', `lessons${levelPrefix}_en.json`);
        if (fs.existsSync(filePath)) {
          const allLessonsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const lessonData = allLessonsData.find(l => l.title === dbLesson[0].title);
          return lessonData;
        }
      }
    } else {
      // Practice logic
      const filePath = path.join(__dirname, '..', 'data', `lessons_en.json`);
      if (fs.existsSync(filePath)) {
        const allLessonsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let allActivities = [];
        allLessonsData.forEach(l => {
          if (l.activities) allActivities = allActivities.concat(l.activities);
        });
        allActivities = allActivities.sort(() => 0.5 - Math.random()).slice(0, 40);
        return { activities: allActivities };
      }
    }
    return null;
  }
}

module.exports = new LessonService();
