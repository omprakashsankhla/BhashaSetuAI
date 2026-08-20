/**
 * Centralized TTS (Text-to-Speech) utility for BhashaSetuAI.
 * 
 * Fixes:
 * - Async voice loading via onvoiceschanged
 * - Proper regional-language fallback when Premium/Google voice is unavailable
 * - Correct BCP-47 locale mapping for all 8 supported languages
 * - Marwadi (mwr) mapped to hi-IN since no native TTS voice exists
 */

const LANG_REC_MAP = {
  hi: 'hi-IN',
  ur: 'ur-PK',
  mwr: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  bn: 'bn-IN',
  mr: 'mr-IN',
  en: 'en-US'
};

// Pre-load voices as early as possible
let cachedVoices = [];
if (typeof window !== 'undefined' && window.speechSynthesis) {
  cachedVoices = window.speechSynthesis.getVoices();
  if (cachedVoices.length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
    };
  }
}

/**
 * Get the user's preferred language code from localStorage.
 * @returns {string} Language code (e.g. 'hi', 'mr', 'ta')
 */
export function getUserLearningLang() {
  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    return storedUser.learning_language || storedUser.preferred_language || 'hi';
  } catch (e) {
    return 'hi';
  }
}

/**
 * Get the BCP-47 locale for a given language code.
 * Falls back to 'hi-IN' for unknown codes (never builds invalid codes like 'Marathi-IN').
 * @param {string} langCode - Language code (e.g. 'mr', 'ta')
 * @returns {string} BCP-47 locale (e.g. 'mr-IN', 'ta-IN')
 */
export function getLangLocale(langCode) {
  return LANG_REC_MAP[langCode] || 'hi-IN';
}

/**
 * Find the best available voice for a given BCP-47 locale.
 * Priority: Google/Premium/Natural voice > any voice matching the language > null
 * @param {string} locale - BCP-47 locale (e.g. 'mr-IN')
 * @returns {SpeechSynthesisVoice|null}
 */
function findBestVoice(locale) {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) cachedVoices = voices;
  
  const langPrefix = locale.split('-')[0];
  
  const premiumVoice = cachedVoices.find(v =>
    v.lang.startsWith(langPrefix) &&
    (v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Natural'))
  );
  if (premiumVoice) return premiumVoice;
  
  const exactVoice = cachedVoices.find(v => v.lang.startsWith(langPrefix));
  return exactVoice || null;
}

/**
 * Speak text aloud using the Web Speech API with proper language and voice handling.
 * 
 * @param {string} text - The text to speak
 * @param {Object} [options] - Optional configuration
 * @param {string} [options.lang] - Override language code (defaults to user's learning_language)
 * @param {number} [options.rate] - Speech rate (default 0.85)
 * @param {function} [options.onStart] - Callback when speech starts
 * @param {function} [options.onEnd] - Callback when speech ends
 * @param {function} [options.onError] - Callback on error
 */
export function speakText(text, options = {}) {
  try {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (!text || typeof text !== 'string' || text.trim().length === 0) return;

    const learningLang = options.lang || getUserLearningLang();
    const isEnglish = /^[a-zA-Z0-9\s.,!?'"-]+$/.test(text);
    const locale = isEnglish ? 'en-US' : getLangLocale(learningLang);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale;
    utterance.rate = options.rate ?? 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    if (options.onStart) utterance.onstart = options.onStart;
    if (options.onEnd) utterance.onend = options.onEnd;
    if (options.onError) utterance.onerror = options.onError;

    const doSpeak = () => {
      const voice = findBestVoice(locale);
      if (voice) utterance.voice = voice;

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    };

    // If voices haven't loaded yet, wait for them
    if (window.speechSynthesis.getVoices().length === 0 && cachedVoices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        cachedVoices = window.speechSynthesis.getVoices();
        doSpeak();
      };
    } else {
      doSpeak();
    }
  } catch (e) {
    console.error('TTS playback failed:', e);
  }
}

/**
 * Cancel any ongoing speech.
 */
export function cancelSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export { LANG_REC_MAP };
