const languageService = require('../services/languageService');

const languageContext = async (req, res, next) => {
  try {
    // 1. Check query parameters first
    let intLang = req.query.interfaceLang || req.headers['x-interface-language'];
    let learnLang = req.query.lang || req.headers['x-learning-language'];

    // 2. Fallback to Database if user is logged in
    if (req.userId && (!intLang || !learnLang)) {
      const dbLangs = await languageService.getUserLanguages(req.userId);
      if (!intLang) intLang = dbLangs.interfaceLanguage;
      if (!learnLang) learnLang = dbLangs.learningLanguage;
    }

    // 3. Fallback to English
    req.interfaceLanguage = intLang || 'en';
    req.learningLanguage = learnLang || 'en';

    // 4. Validate
    if (!languageService.validateLanguage(req.interfaceLanguage)) req.interfaceLanguage = 'en';
    if (!languageService.validateLanguage(req.learningLanguage)) req.learningLanguage = 'en';

    next();
  } catch (error) {
    console.error('Language Context Middleware Error:', error);
    req.interfaceLanguage = 'en';
    req.learningLanguage = 'en';
    next();
  }
};

module.exports = languageContext;
