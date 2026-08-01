import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, Check, X, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { speakText as ttsSpeak } from '../../utils/ttsHelper';
import './FlashcardsPage.css';

const VOCAB_BY_LANG = {
  en: [
    { id: 1, target: 'Hello', romanized: 'Hello', meaning: 'Greeting used to introduce yourself', image: '👋' },
    { id: 2, target: 'Water', romanized: 'Water', meaning: 'A clear liquid that falls from the sky as rain', image: '💧' },
    { id: 3, target: 'Food', romanized: 'Food', meaning: 'Any nutritious substance that people or animals eat', image: '🍛' },
    { id: 4, target: 'Book', romanized: 'Book', meaning: 'A written or printed work consisting of pages glued together', image: '📖' },
    { id: 5, target: 'House', romanized: 'House', meaning: 'A building for human habitation', image: '🏠' },
    { id: 6, target: 'School', romanized: 'School', meaning: 'An institution for educating children', image: '🏫' },
    { id: 7, target: 'Teacher', romanized: 'Teacher', meaning: 'A person who helps students acquire knowledge', image: '🧑‍🏫' },
    { id: 8, target: 'Student', romanized: 'Student', meaning: 'A person who is studying at a school or college', image: '🧑‍🎓' },
    { id: 9, target: 'Family', romanized: 'Family', meaning: 'A group of one or more parents and their children', image: '👨‍👩‍👧‍👦' },
    { id: 10, target: 'Friend', romanized: 'Friend', meaning: 'A person whom one knows and has a bond of mutual affection', image: '🤝' },
    { id: 11, target: 'Time', romanized: 'Time', meaning: 'The indefinite continued progress of existence and events', image: '⏰' },
    { id: 12, target: 'Work', romanized: 'Work', meaning: 'Activity involving mental or physical effort done to achieve a purpose', image: '💼' },
    { id: 13, target: 'Money', romanized: 'Money', meaning: 'A current medium of exchange in the form of coins and banknotes', image: '💵' },
    { id: 14, target: 'Health', romanized: 'Health', meaning: 'The state of being free from illness or injury', image: '🍎' },
    { id: 15, target: 'Love', romanized: 'Love', meaning: 'An intense feeling of deep affection', image: '❤️' }
  ],
  hi: [
    { id: 1, target: 'नमस्ते', romanized: 'Namaste', meaning: 'Hello', image: '👋' },
    { id: 2, target: 'पानी', romanized: 'Paani', meaning: 'Water', image: '💧' },
    { id: 3, target: 'खाना', romanized: 'Khaana', meaning: 'Food', image: '🍛' },
    { id: 4, target: 'किताब', romanized: 'Kitaab', meaning: 'Book', image: '📖' },
    { id: 5, target: 'घर', romanized: 'Ghar', meaning: 'House / Home', image: '🏠' },
    { id: 6, target: 'स्कूल', romanized: 'School', meaning: 'School', image: '🏫' },
    { id: 7, target: 'शिक्षक', romanized: 'Shikshak', meaning: 'Teacher', image: '🧑‍🏫' },
    { id: 8, target: 'छात्र', romanized: 'Chhaatra', meaning: 'Student', image: '🧑‍🎓' },
    { id: 9, target: 'परिवार', romanized: 'Parivaar', meaning: 'Family', image: '👨‍👩‍👧‍👦' },
    { id: 10, target: 'दोस्त', romanized: 'Dost', meaning: 'Friend', image: '🤝' },
    { id: 11, target: 'समय', romanized: 'Samay', meaning: 'Time', image: '⏰' },
    { id: 12, target: 'काम', romanized: 'Kaam', meaning: 'Work', image: '💼' },
    { id: 13, target: 'पैसा', romanized: 'Paisa', meaning: 'Money', image: '💵' },
    { id: 14, target: 'स्वास्थ्य', romanized: 'Swaasthya', meaning: 'Health', image: '🍎' },
    { id: 15, target: 'प्यार', romanized: 'Pyaar', meaning: 'Love', image: '❤️' }
  ],
  ur: [
    { id: 1, target: 'سلام', romanized: 'Salaam', meaning: 'Hello', image: '👋' },
    { id: 2, target: 'پانی', romanized: 'Paani', meaning: 'Water', image: '💧' },
    { id: 3, target: 'کھانا', romanized: 'Khaana', meaning: 'Food', image: '🍛' },
    { id: 4, target: 'کتاب', romanized: 'Kitaab', meaning: 'Book', image: '📖' },
    { id: 5, target: 'گھر', romanized: 'Ghar', meaning: 'House / Home', image: '🏠' },
    { id: 6, target: 'اسکول', romanized: 'School', meaning: 'School', image: '🏫' },
    { id: 7, target: 'استاد', romanized: 'Ustaad', meaning: 'Teacher', image: '🧑‍🏫' },
    { id: 8, target: 'طالب علم', romanized: 'Talib-e-Ilm', meaning: 'Student', image: '🧑‍🎓' },
    { id: 9, target: 'خاندان', romanized: 'Khaandaan', meaning: 'Family', image: '👨‍👩‍👧‍👦' },
    { id: 10, target: 'دوست', romanized: 'Dost', meaning: 'Friend', image: '🤝' },
    { id: 11, target: 'وقت', romanized: 'Waqt', meaning: 'Time', image: '⏰' },
    { id: 12, target: 'کام', romanized: 'Kaam', meaning: 'Work', image: '💼' },
    { id: 13, target: 'پیسہ', romanized: 'Paisa', meaning: 'Money', image: '💵' },
    { id: 14, target: 'صحت', romanized: 'Sehat', meaning: 'Health', image: '🍎' },
    { id: 15, target: 'پیار', romanized: 'Pyaar', meaning: 'Love', image: '❤️' }
  ],
  mwr: [
    { id: 1, target: 'खम्मा घणी', romanized: 'Khamma Ghani', meaning: 'Hello', image: '👋' },
    { id: 2, target: 'पाणी', romanized: 'Paani', meaning: 'Water', image: '💧' },
    { id: 3, target: 'जीमण', romanized: 'Jeeman', meaning: 'Food', image: '🍛' },
    { id: 4, target: 'पोथी', romanized: 'Pothi', meaning: 'Book', image: '📖' },
    { id: 5, target: 'घर', romanized: 'Ghar', meaning: 'House / Home', image: '🏠' },
    { id: 6, target: 'निसाळ', romanized: 'Nisaal', meaning: 'School', image: '🏫' },
    { id: 7, target: 'गुरुजी', romanized: 'Guruji', meaning: 'Teacher', image: '🧑‍🏫' },
    { id: 8, target: 'चेला', romanized: 'Chela', meaning: 'Student', image: '🧑‍🎓' },
    { id: 9, target: 'कुटम्ब', romanized: 'Kutumb', meaning: 'Family', image: '👨‍👩‍👧‍👦' },
    { id: 10, target: 'भाईबंद', romanized: 'Bhaiband', meaning: 'Friend', image: '🤝' },
    { id: 11, target: 'बखत', romanized: 'Bakhat', meaning: 'Time', image: '⏰' },
    { id: 12, target: 'धंधो', romanized: 'Dhandho', meaning: 'Work', image: '💼' },
    { id: 13, target: 'टका', romanized: 'Taka', meaning: 'Money', image: '💵' },
    { id: 14, target: 'साता', romanized: 'Saata', meaning: 'Health', image: '🍎' },
    { id: 15, target: 'नेह', romanized: 'Neh', meaning: 'Love', image: '❤️' }
  ],
  ta: [
    { id: 1, target: 'வணக்கம்', romanized: 'Vanakkam', meaning: 'Hello', image: '👋' },
    { id: 2, target: 'தண்ணீர்', romanized: 'Thanneer', meaning: 'Water', image: '💧' },
    { id: 3, target: 'உணவு', romanized: 'Unavu', meaning: 'Food', image: '🍛' },
    { id: 4, target: 'புத்தகம்', romanized: 'Puthagam', meaning: 'Book', image: '📖' },
    { id: 5, target: 'வீடு', romanized: 'Veedu', meaning: 'House / Home', image: '🏠' },
    { id: 6, target: 'பள்ளி', romanized: 'Palli', meaning: 'School', image: '🏫' },
    { id: 7, target: 'ஆசிரியர்', romanized: 'Aasiriyar', meaning: 'Teacher', image: '🧑‍🏫' },
    { id: 8, target: 'மாணவன்', romanized: 'Maanavan', meaning: 'Student', image: '🧑‍🎓' },
    { id: 9, target: 'குடும்பம்', romanized: 'Kudumbam', meaning: 'Family', image: '👨‍👩‍👧‍👦' },
    { id: 10, target: 'நண்பன்', romanized: 'Nanban', meaning: 'Friend', image: '🤝' },
    { id: 11, target: 'நேரம்', romanized: 'Neeram', meaning: 'Time', image: '⏰' },
    { id: 12, target: 'வேலை', romanized: 'Velai', meaning: 'Work', image: '💼' },
    { id: 13, target: 'பணம்', romanized: 'Panam', meaning: 'Money', image: '💵' },
    { id: 14, target: 'ஆரோக்கியம்', romanized: 'Aarokkiyam', meaning: 'Health', image: '🍎' },
    { id: 15, target: 'அன்பு', romanized: 'Anbu', meaning: 'Love', image: '❤️' }
  ],
  te: [
    { id: 1, target: 'నమస్కారం', romanized: 'Namaskaram', meaning: 'Hello', image: '👋' },
    { id: 2, target: 'నీరు', romanized: 'Neeru', meaning: 'Water', image: '💧' },
    { id: 3, target: 'ఆహారం', romanized: 'Aaharam', meaning: 'Food', image: '🍛' },
    { id: 4, target: 'పుస్తకం', romanized: 'Pusthakam', meaning: 'Book', image: '📖' },
    { id: 5, target: 'ఇల్లు', romanized: 'Illu', meaning: 'House / Home', image: '🏠' },
    { id: 6, target: 'బడి', romanized: 'Badi', meaning: 'School', image: '🏫' },
    { id: 7, target: 'ఉపాధ్యాయుడు', romanized: 'Upaadhyaayudu', meaning: 'Teacher', image: '🧑‍🏫' },
    { id: 8, target: 'విద్యార్థి', romanized: 'Vidyaarthi', meaning: 'Student', image: '🧑‍🎓' },
    { id: 9, target: 'కుటుంబం', romanized: 'Kudumbam', meaning: 'Family', image: '👨‍👩‍👧‍👦' },
    { id: 10, target: 'స్నేహితుడు', romanized: 'Snehithudu', meaning: 'Friend', image: '🤝' },
    { id: 11, target: 'సమయం', romanized: 'Samayam', meaning: 'Time', image: '⏰' },
    { id: 12, target: 'పని', romanized: 'Pani', meaning: 'Work', image: '💼' },
    { id: 13, target: 'డబ్బు', romanized: 'Dabbu', meaning: 'Money', image: '💵' },
    { id: 14, target: 'ఆరోగ్యం', romanized: 'Aarogyam', meaning: 'Health', image: '🍎' },
    { id: 15, target: 'ప్రేమ', romanized: 'Prema', meaning: 'Love', image: '❤️' }
  ],
  bn: [
    { id: 1, target: 'নমস্কার', romanized: 'Nomoshkar', meaning: 'Hello', image: '👋' },
    { id: 2, target: 'জল', romanized: 'Jol', meaning: 'Water', image: '💧' },
    { id: 3, target: 'খাবার', romanized: 'Khabar', meaning: 'Food', image: '🍛' },
    { id: 4, target: 'বই', romanized: 'Boi', meaning: 'Book', image: '📖' },
    { id: 5, target: 'বাড়ি', romanized: 'Bari', meaning: 'House / Home', image: '🏠' },
    { id: 6, target: 'বিদ্যালয়', romanized: 'Bidyalay', meaning: 'School', image: '🏫' },
    { id: 7, target: 'শিক্ষক', romanized: 'Shikkhok', meaning: 'Teacher', image: '🧑‍🏫' },
    { id: 8, target: 'ছাত্র', romanized: 'Chhatro', meaning: 'Student', image: '🧑‍🎓' },
    { id: 9, target: 'পরিবার', romanized: 'Poribar', meaning: 'Family', image: '👨‍👩‍👧‍👦' },
    { id: 10, target: 'বন্ধু', romanized: 'Bondhu', meaning: 'Friend', image: '🤝' },
    { id: 11, target: 'সময়', romanized: 'Somoy', meaning: 'Time', image: '⏰' },
    { id: 12, target: 'কাজ', romanized: 'Kaj', meaning: 'Work', image: '💼' },
    { id: 13, target: 'টাকা', romanized: 'Taka', meaning: 'Money', image: '💵' },
    { id: 14, target: 'স্বাস্থ্য', romanized: 'Shastho', meaning: 'Health', image: '🍎' },
    { id: 15, target: 'ভালোবাসা', romanized: 'Bhalobasha', meaning: 'Love', image: '❤️' }
  ],
  mr: [
    { id: 1, target: 'नमस्कार', romanized: 'Namaskar', meaning: 'Hello', image: '👋' },
    { id: 2, target: 'पाणी', romanized: 'Paani', meaning: 'Water', image: '💧' },
    { id: 3, target: 'जेवण', romanized: 'Jevan', meaning: 'Food', image: '🍛' },
    { id: 4, target: 'पुस्तक', romanized: 'Pustak', meaning: 'Book', image: '📖' },
    { id: 5, target: 'घर', romanized: 'Ghar', meaning: 'House / Home', image: '🏠' },
    { id: 6, target: 'शाळा', romanized: 'Shaala', meaning: 'School', image: '🏫' },
    { id: 7, target: 'शिक्षक', romanized: 'Shikshak', meaning: 'Teacher', image: '🧑‍🏫' },
    { id: 8, target: 'विद्यार्थी', romanized: 'Vidyarthi', meaning: 'Student', image: '🧑‍🎓' },
    { id: 9, target: 'कुटुंब', romanized: 'Kutumb', meaning: 'Family', image: '👨‍👩‍👧‍👦' },
    { id: 10, target: 'मित्र', romanized: 'Mitra', meaning: 'Friend', image: '🤝' },
    { id: 11, target: 'वेळ', romanized: 'Vel', meaning: 'Time', image: '⏰' },
    { id: 12, target: 'काम', romanized: 'Kaam', meaning: 'Work', image: '💼' },
    { id: 13, target: 'पैसे', romanized: 'Paise', meaning: 'Money', image: '💵' },
    { id: 14, target: 'आरोग्य', romanized: 'Aarogya', meaning: 'Health', image: '🍎' },
    { id: 15, target: 'प्रेम', romanized: 'Prem', meaning: 'Love', image: '❤️' }
  ]
};

const FlashcardsPage = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  
  const [cards, setCards] = useState(() => VOCAB_BY_LANG[JSON.parse(localStorage.getItem('user') || '{}').preferred_language || 'hi'] || VOCAB_BY_LANG['en']);
  const [unlockedIndex, setUnlockedIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setCards(VOCAB_BY_LANG[JSON.parse(localStorage.getItem('user') || '{}').preferred_language || 'hi'] || VOCAB_BY_LANG['en']);
    setUnlockedIndex(0);
    setIsFlipped(false);
    setScore(0);
    setFinished(false);
  }, [i18n.language]);

  const handleFlip = (index) => {
    if (index !== unlockedIndex) return; 
    setIsFlipped(!isFlipped);
  };

  const handleCardCompleted = (index, knewIt) => {
    if (index !== unlockedIndex) return;
    
    if (knewIt) {
      setScore(prev => prev + 1);
    }
    
    setIsFlipped(false);
    
    setTimeout(() => {
      if (unlockedIndex < cards.length - 1) {
        setUnlockedIndex(prev => prev + 1);
      } else {
        setFinished(true);
      }
    }, 200);
  };

  const speakText = (text) => {
    ttsSpeak(text);
  };

  const handleReset = () => {
    setUnlockedIndex(0);
    setIsFlipped(false);
    setScore(0);
    setFinished(false);
  };

  const progress = ((unlockedIndex) / cards.length) * 100;

  return (
    <div className="flashcards-container">
      <div className="flashcards-header sticky-header">
        <button className="icon-btn" onClick={() => navigate('/activities')}>
          <ArrowLeft size={24} />
        </button>
        <div className="progress-bar-container">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <span className="progress-text">{unlockedIndex}/{cards.length} Completed</span>
        <button className="reset-btn" onClick={handleReset}>Reset</button>
      </div>

      <div className="flashcards-scroll-area">
        <div className="flashcards-intro">
          <h2>Vocabulary Grid Journey</h2>
          <p>Complete cards step-by-step. Each completed card unlocks the next one in the grid!</p>
        </div>

        <div className="flashcard-list">
          {cards.map((card, index) => {
            const isCompleted = index < unlockedIndex;
            const isActive = index === unlockedIndex;
            const isLocked = index > unlockedIndex;

            if (isCompleted) {
              return (
                <div key={card.id} className="flashcard completed-card">
                  <div className="card-completed-header">
                    <span className="card-badge">Card {index + 1}</span>
                    <span className="status-badge"><Check size={12} /> Completed</span>
                  </div>
                  <div className="card-completed-body">
                    <span className="card-emoji">{card.image}</span>
                    <div className="card-completed-details">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                        <h2 className="target-word-flat">{card.target}</h2>
                        <button 
                          className="audio-btn-small" 
                          onClick={() => speakText(card.target)}
                        >
                          <Volume2 size={13} />
                        </button>
                      </div>
                      <p className="romanized-flat">({card.romanized})</p>
                      <h3 className="meaning-flat">{card.meaning}</h3>
                    </div>
                  </div>
                </div>
              );
            }

            if (isActive) {
              return (
                <div key={card.id} className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={() => handleFlip(index)}>
                  <div className="flashcard-inner">
                    {/* Front of active card */}
                    <div className="flashcard-front">
                      <div className="card-active-header">
                        <span className="card-badge active">Card {index + 1}</span>
                        <span className="status-badge active">Active</span>
                      </div>
                      <span className="card-emoji">{card.image}</span>
                      <h2 className="target-word">{card.target}</h2>
                      <button 
                        className="audio-btn" 
                        onClick={(e) => { e.stopPropagation(); speakText(card.target); }}
                      >
                        <Volume2 size={20} />
                      </button>
                      <p className="flip-hint">Tap card to flip</p>
                    </div>

                    {/* Back of active card */}
                    <div className="flashcard-back">
                      <h3 className="romanized">{card.romanized}</h3>
                      <h2 className="meaning-word">{card.meaning}</h2>
                      
                      <div className="card-action-buttons">
                        <button 
                          className="card-action-btn gotit" 
                          onClick={(e) => { e.stopPropagation(); handleCardCompleted(index, true); }}
                        >
                          <Check size={14} /> Got It!
                        </button>
                        <button 
                          className="card-action-btn needpractice" 
                          onClick={(e) => { e.stopPropagation(); handleCardCompleted(index, false); }}
                        >
                          <X size={14} /> Practice
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Locked Card
            return (
              <div key={card.id} className="flashcard locked-card">
                <div className="card-locked-header">
                  <span className="card-badge locked">Card {index + 1}</span>
                  <span className="status-badge locked"><Lock size={11} /> Locked</span>
                </div>
                <div className="card-locked-body">
                  <Lock size={36} className="lock-icon" />
                </div>
              </div>
            );
          })}
        </div>

        {finished && (
          <div className="flashcards-completed-summary">
            <div className="summary-icon">🎉</div>
            <h2>Session Complete!</h2>
            <p>Excellent effort! You successfully went through all 15 words.</p>
            <p className="score-badge">Final Score: {score}/15 Got It</p>
            <button className="primary-btn" onClick={() => navigate('/activities')}>
              Back to Activities
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardsPage;
