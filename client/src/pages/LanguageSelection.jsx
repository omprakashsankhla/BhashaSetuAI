import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './LanguageSelection.css';

const languages = [
  { code: 'en', name: 'English', sub: 'ENGLISH' },
  { code: 'hi', name: 'हिन्दी', sub: 'HINDI' },
  { code: 'mwr', name: 'मारवाड़ी', sub: 'MARWADI' },
  { code: 'ta', name: 'தமிழ்', sub: 'TAMIL' },
  { code: 'te', name: 'తెలుగు', sub: 'TELUGU' },
  { code: 'bn', name: 'বাংলা', sub: 'BENGALI' },
  { code: 'mr', name: 'मराठी', sub: 'MARATHI' },
  { code: 'ur', name: 'اردو', sub: 'URDU' }
];

const floatingWords = [
  { text: 'Welcome', color: '#4285F4', size: 2.5 },
  { text: 'A', color: '#A142F4', size: 2 },
  { text: 'Learn', color: '#34A853', size: 1.8 },
  { text: 'नमस्ते', color: '#EA4335', size: 2.5 },
  { text: 'अ', color: '#F56A42', size: 2.2 },
  { text: 'खम्मा घणी', color: '#35A8BA', size: 2.2 },
  { text: 'क', color: '#C532F4', size: 2.5 },
  { text: 'வணக்கம்', color: '#4285F4', size: 2.0 },
  { text: 'க', color: '#34A853', size: 2.2 },
  { text: 'స్వాగతం', color: '#F56A42', size: 2.2 },
  { text: 'అ', color: '#EA4378', size: 2.5 },
  { text: 'স্বাগতম', color: '#4285F4', size: 2.5 },
  { text: 'অ', color: '#A142F4', size: 2.2 },
  { text: 'नमस्कार', color: '#34A853', size: 2.2 },
  { text: 'म', color: '#EA4335', size: 2.0 },
  { text: 'خوش آمدید', color: '#35A8BA', size: 2.5 },
  { text: 'ا', color: '#F56A42', size: 2.2 },
  { text: 'Read', color: '#C532F4', size: 1.8 },
  { text: 'Bhasha', color: '#34A853', size: 2.0 },
  { text: 'Setu', color: '#EA4378', size: 2.0 }
];

const spokenText = {
  en: "Welcome to BhashaSetu. Please select your preferred language and click continue.",
  hi: "भाषासेतु में आपका स्वागत है। कृपया अपनी पसंदीदा भाषा चुनें और आगे बढ़ें पर क्लिक करें।",
  mwr: "भाषासेतु में आपका स्वागत है। कृपया अपनी पसंदीदा भाषा चुनें और आगे बढ़ें पर क्लिक करें।",
  ta: "பாஷாசேதுக்கு உங்களை வரவேற்கிறோம். தயவுசெய்து உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுத்து தொடரவும் என்பதை கிளிக் செய்யவும்.",
  te: "భాషాసేతుకు స్వాగతం. దయచేసి మీకు ఇష్టమైన భాషను ఎంచుకుని, కొనసాగించు క్లిక్ చేయండి.",
  bn: "ভাষাসেতুতে আপনাকে স্বাগত। অনুগ্রহ করে আপনার পছন্দের ভাষা বেছে নিন এবং চালিয়ে যান এ ক্লিক করুন।",
  mr: "भाषासेतू मध्ये आपले स्वागत आहे. कृपया तुमची पसंतीची भाषा निवडा आणि पुढे जा वर क्लिक करा.",
  ur: "بھاشا سیتو میں خوش آمدید۔ براہ کرم اپنی پسندیدہ زبان منتخب کریں اور جاری رکھیں پر کلک کریں۔"
};

const LanguageSelection = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState(() => {
    return localStorage.getItem('i18nextLng') || i18n.language || 'en';
  });
  const containerRef = useRef(null);
  const lettersRef = useRef([]);

  useEffect(() => {
    if (i18n.language) {
      setSelectedLang(i18n.language);
    }
  }, [i18n.language]);

  const handleLanguageSelect = (code) => {
    setSelectedLang(code);
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
  };

  const handleOrbClick = () => {
    // TTS removed as requested
  };

  const handleContinue = () => {
    navigate('/register');
  };

  // Static layout logic
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const numWords = floatingWords.length;
    
    const generateLayout = () => {
      let cardRectInit = container.querySelector('.ls-card')?.getBoundingClientRect();
      let newItems = [];
      
      for (let i = 0; i < numWords; i++) {
        let x, y;
        let isOverlapping;
        let attempts = 0;
        
        do {
          isOverlapping = false;
          x = Math.random() * (window.innerWidth - 120) + 20;
          y = Math.random() * (window.innerHeight - 120) + 20;
          
          // Check against card bounds
          if (
            cardRectInit && 
            x + 100 > cardRectInit.left - 30 && 
            x - 30 < cardRectInit.right + 30 && 
            y + 100 > cardRectInit.top - 30 && 
            y - 30 < cardRectInit.bottom + 30
          ) {
            isOverlapping = true;
          }
          
          // Check against other words
          if (!isOverlapping) {
            for (let j = 0; j < newItems.length; j++) {
              let existing = newItems[j];
              let dx = x - existing.x;
              let dy = y - existing.y;
              let distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < 110) { // minimum distance
                isOverlapping = true;
                break;
              }
            }
          }
          attempts++;
        } while (isOverlapping && attempts < 200);
        
        newItems.push({ x, y });
      }
      return newItems;
    };

    let items = generateLayout();

    // Apply to DOM directly
    items.forEach((p, idx) => {
      if (lettersRef.current[idx]) {
        lettersRef.current[idx].style.transform = `translate(${p.x}px, ${p.y}px)`;
      }
    });

    // Re-layout on resize
    const handleResize = () => {
      let newItems = generateLayout();
      newItems.forEach((p, idx) => {
        if (lettersRef.current[idx]) {
          lettersRef.current[idx].style.transform = `translate(${p.x}px, ${p.y}px)`;
        }
      });
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="ls-container" ref={containerRef}>
      {/* Background Floating Letters */}
      <div className="floating-letters">
        {floatingWords.map((word, idx) => (
          <span 
            key={idx}
            ref={el => lettersRef.current[idx] = el}
            className="letter"
            style={{ color: word.color, fontSize: `${word.size}rem` }}
          >
            {word.text}
          </span>
        ))}
      </div>

      <div className="ls-card">
        <div className="ls-header">
          <p className="ls-suptitle">{t('suptitle')}</p>
          <h1 className="ls-title">BhashaSetu</h1>
          <p className="ls-subtitle">{t('subtitle')}</p>
        </div>

        <div className="ls-ai-section">
          <div className="ai-orb-container" onClick={handleOrbClick} style={{ cursor: 'pointer' }} title="Click me to speak!">
            <div className="ai-orb"></div>
            <div className="ai-orb-glow"></div>
            <div className="ai-orb-ring"></div>
          </div>
          <div className="ai-greeting">
            {t('ai_greeting')} <span>{t('ai_guide')}</span>
          </div>
        </div>

        <div className="ls-language-section">
          <h2>{t('choose_lang')}</h2>
          <p>{t('tap_lang')}</p>
          
          <div className="ls-grid">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`ls-lang-btn ${selectedLang === lang.code ? 'selected' : ''}`}
                onClick={() => handleLanguageSelect(lang.code)}
              >
                <span className="lang-name">{lang.name}</span>
                <span className="lang-sub">{lang.sub}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="ls-action-section">
          <button className="ls-continue-btn" onClick={handleContinue}>
            {t('continue')} &rarr;
          </button>
        </div>
      </div>

      <div className="ls-footer">
        {t('footer')}
      </div>
    </div>
  );
};

export default LanguageSelection;
