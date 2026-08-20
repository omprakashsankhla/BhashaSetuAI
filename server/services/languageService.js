const db = require('../db');

const SUPPORTED_LANGUAGES = ['en', 'hi', 'bn', 'mr', 'mwr', 'ta', 'te', 'ur'];

class LanguageService {
  /**
   * Validate if a language code is supported
   * @param {string} code - Language code to validate
   * @returns {boolean}
   */
  validateLanguage(code) {
    return SUPPORTED_LANGUAGES.includes(code);
  }

  /**
   * Get language preferences for a user
   * @param {number} userId 
   * @returns {Promise<{interfaceLanguage: string, learningLanguage: string}>}
   */
  async getUserLanguages(userId) {
    const [rows] = await db.query(
      'SELECT interface_language, learning_language FROM Users WHERE user_id = ?',
      [userId]
    );

    if (rows.length === 0) {
      throw new Error('User not found');
    }

    return {
      interfaceLanguage: rows[0].interface_language || 'en',
      learningLanguage: rows[0].learning_language || 'en'
    };
  }

  /**
   * Set the interface language for a user
   * @param {number} userId 
   * @param {string} langCode 
   */
  async setInterfaceLanguage(userId, langCode) {
    if (!this.validateLanguage(langCode)) {
      throw new Error(`Unsupported language code: ${langCode}`);
    }

    await db.query(
      'UPDATE Users SET interface_language = ? WHERE user_id = ?',
      [langCode, userId]
    );
  }

  /**
   * Set the learning language for a user
   * @param {number} userId 
   * @param {string} langCode 
   */
  async setLearningLanguage(userId, langCode) {
    if (!this.validateLanguage(langCode)) {
      throw new Error(`Unsupported language code: ${langCode}`);
    }

    await db.query(
      'UPDATE Users SET learning_language = ? WHERE user_id = ?',
      [langCode, userId]
    );
  }

  /**
   * Get all supported languages metadata
   */
  getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
  }
}

module.exports = new LanguageService();
