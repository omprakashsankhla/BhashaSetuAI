import React, { useState, useEffect, useRef } from 'react';
import { Award, RefreshCw, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../../config/api';

const SPRINT_WORDS = {
  hi: [
    { target: 'नमस्ते', translation: 'hello' },
    { target: 'पानी', translation: 'water' },
    { target: 'किताब', translation: 'book' },
    { target: 'घर', translation: 'house' },
    { target: 'खाना', translation: 'food' },
    { target: 'कल', translation: 'tomorrow' }
  ],
  ur: [
    { target: 'سلام', translation: 'hello' },
    { target: 'پانی', translation: 'water' },
    { target: 'کتاب', translation: 'book' },
    { target: 'گھر', translation: 'house' },
    { target: 'کھانا', translation: 'food' },
    { target: 'کل', translation: 'tomorrow' }
  ],
  en: [
    { target: 'hello', translation: 'hello' },
    { target: 'water', translation: 'water' },
    { target: 'book', translation: 'book' },
    { target: 'house', translation: 'house' },
    { target: 'food', translation: 'food' }
  ]
};

const getSprintWords = (lang) => SPRINT_WORDS[lang] || SPRINT_WORDS['hi'] || SPRINT_WORDS['en'];

const WordSprint = ({ onGameComplete }) => {
  const { i18n } = useTranslation();

  const [vocab, setVocab] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeWord, setActiveWord] = useState(null);
  const [wordX, setWordX] = useState(300); // starts at right edge (px)
  const [typed, setTyped] = useState('');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  const timerRef = useRef();

  const fetchGameData = async () => {
    let targetLang = 'hi';
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      targetLang = storedUser.learning_language || 'hi';
      const interfaceLang = i18n.language || 'en';
      
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/activities/game-data/wordsprint?lang=${targetLang}&interfaceLang=${interfaceLang}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.words && data.words.length > 0) {
          setVocab(data.words);
          const next = data.words[Math.floor(Math.random() * data.words.length)];
          setActiveWord(next);
          setWordX(320);
          setTyped('');
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error('Error fetching wordsprint data:', e);
    }
    
    // Fallback to local offline data
    const fallbackWords = getSprintWords(targetLang);
    setVocab(fallbackWords);
    if (fallbackWords.length > 0) {
      const next = fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
      setActiveWord(next);
      setWordX(320);
      setTyped('');
    }
    setLoading(false);
  };

  // Load random word
  const loadNextWord = () => {
    if (!vocab || vocab.length === 0) return;
    const next = vocab[Math.floor(Math.random() * vocab.length)];
    setActiveWord(next);
    setWordX(320);
    setTyped('');
  };

  useEffect(() => {
    fetchGameData();
    return () => clearInterval(timerRef.current);
  }, []);

  // Physics animation tick
  useEffect(() => {
    if (gameOver || !activeWord) return;

    timerRef.current = setInterval(() => {
      setWordX(x => {
        const nextX = x - 2; // move left
        if (nextX <= 10) {
          // Word hit the left edge! Lose life
          setLives(l => {
            const updated = l - 1;
            if (updated <= 0) {
              setGameOver(true);
              if (onGameComplete) onGameComplete(score);
            }
            return updated;
          });
          loadNextWord();
          return 320;
        }
        return nextX;
      });
    }, 40);

    return () => clearInterval(timerRef.current);
  }, [activeWord, gameOver, score]);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setTyped(text);

    // If matches expected translation fully
    if (text.toLowerCase().trim() === activeWord.translation.toLowerCase().trim()) {
      setScore(s => s + 10);
      loadNextWord();
    }
  };

  const handleRestart = () => {
    setScore(0);
    setLives(3);
    setGameOver(false);
    loadNextWord();
  };

  if (loading) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '580px', margin: '0 auto', border: '2px solid #cbd5e1', boxSizing: 'border-box', textAlign: 'center', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#3730a3' }}>Generating AI Game Puzzles...</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '580px', margin: '0 auto', border: '2px solid #cbd5e1', boxSizing: 'border-box', textAlign: 'center' }}>
      
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.2rem' }}>
          {[...Array(3)].map((_, i) => (
            <Heart 
              key={i} 
              size={20} 
              fill={i < lives ? '#ef4444' : 'none'} 
              color={i < lives ? '#ef4444' : '#cbd5e1'} 
            />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#3730a3', fontWeight: 800 }}>
          <Award size={18} /> Score: {score}
        </div>
      </div>

      {gameOver ? (
        <div style={{ padding: '3rem 0' }}>
          <span style={{ fontSize: '4.5rem' }}>⌨️</span>
          <h2 style={{ color: '#3730a3', fontSize: '1.8rem', margin: '1rem 0' }}>Sprint Typing Over!</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>You successfully typed and scored {score} points!</p>
          <button onClick={handleRestart} style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '0.8rem 1.8rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={16} /> Play Again
          </button>
        </div>
      ) : (
        <div>
          <p style={{ color: '#475569', fontSize: '0.85rem', margin: '0 0 1.5rem 0', fontWeight: 700 }}>
            Type the English translation for the word before it crashes into the left wall:
          </p>

          {/* Typing Lane */}
          <div 
            style={{ 
              height: '120px', 
              width: '100%', 
              background: 'white', 
              border: '2px solid #cbd5e1', 
              borderRadius: '20px', 
              position: 'relative', 
              overflow: 'hidden',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {/* Red Danger wall indicator */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '8px', background: '#ef4444' }} />

            {/* Running Word */}
            {activeWord && (
              <div
                style={{
                  position: 'absolute',
                  left: `${wordX}px`,
                  background: '#4f46e5',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '0.5rem 1rem',
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)',
                  transition: 'left 0.04s linear'
                }}
              >
                {activeWord.target}
              </div>
            )}
          </div>

          {/* Input field */}
          <div style={{ maxWidth: '360px', margin: '0 auto' }}>
            <input
              type="text"
              value={typed}
              onChange={handleInputChange}
              placeholder="Type English meaning here..."
              style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '1.2rem', fontWeight: 800, textAlign: 'center', boxSizing: 'border-box' }}
              autoFocus
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WordSprint;
