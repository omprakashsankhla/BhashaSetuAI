import React, { useState, useEffect, useRef } from 'react';
import { Award, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CATCHER_DATA = {
  hi: [
    { target: 'Water', correctWord: 'पानी', wrongWords: ['खाना', 'घर', 'किताब', 'लड़का'] },
    { target: 'Food', correctWord: 'खाना', wrongWords: ['पानी', 'पेड़', 'दोस्त', 'आज'] },
    { target: 'Book', correctWord: 'किताब', wrongWords: ['कल', 'पैसा', 'स्कूल', 'काम'] },
    { target: 'House', correctWord: 'घर', wrongWords: ['नमक', 'चाय', 'फूल', 'बड़ा'] }
  ],
  ur: [
    { target: 'Water', correctWord: 'پانی', wrongWords: ['کھانا', 'گھر', 'کتاب', 'لڑکا'] },
    { target: 'Food', correctWord: 'کھانا', wrongWords: ['پانی', 'درخت', 'دوست', 'آج'] },
    { target: 'Book', correctWord: 'کتاب', wrongWords: ['کل', 'پیسہ', 'اسکول', 'کام'] },
    { target: 'House', correctWord: 'گھر', wrongWords: ['نمک', 'چائے', 'پھول', 'بڑا'] }
  ],
  en: [
    { target: 'Water', correctWord: 'water', wrongWords: ['food', 'house', 'book', 'boy'] },
    { target: 'Food', correctWord: 'food', wrongWords: ['water', 'tree', 'friend', 'today'] },
    { target: 'Book', correctWord: 'book', wrongWords: ['yesterday', 'money', 'school', 'work'] },
    { target: 'House', correctWord: 'house', wrongWords: ['salt', 'tea', 'flower', 'big'] }
  ]
};

const getCatcherData = (lang) => CATCHER_DATA[lang] || CATCHER_DATA['hi'] || CATCHER_DATA['en'];

const FruitCatcher = ({ onGameComplete }) => {
  const { i18n } = useTranslation();
  const gameRounds = getCatcherData((JSON.parse(localStorage.getItem('user') || '{}').learning_language || 'hi'));

  const [roundIdx, setRoundIdx] = useState(0);
  const [basketX, setBasketX] = useState(150); // Basket horizontal position (0 to 300)
  const [fallingItems, setFallingItems] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); // 30-second round timer
  const [gameOver, setGameOver] = useState(false);

  const gameAreaRef = useRef(null);
  const activeRound = gameRounds[roundIdx];

  // Game tick physics loop
  useEffect(() => {
    if (gameOver) return;

    // Spawn falling items timer
    const spawnInterval = setInterval(() => {
      const isCorrect = Math.random() > 0.6;
      const wordText = isCorrect ? activeRound.correctWord : activeRound.wrongWords[Math.floor(Math.random() * activeRound.wrongWords.length)];
      
      setFallingItems(prev => [
        ...prev,
        {
          id: Math.random(),
          text: wordText,
          isCorrect,
          x: Math.random() * 260,
          y: 0,
          speed: 2 + Math.random() * 2.5
        }
      ]);
    }, 1000);

    // Timer countdown
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          clearInterval(spawnInterval);
          handleRoundComplete();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(timer);
    };
  }, [roundIdx, gameOver]);

  // Main physics loop
  useEffect(() => {
    if (gameOver) return;

    const gameLoop = setInterval(() => {
      setFallingItems(prev => {
        const remaining = [];
        prev.forEach(item => {
          const newY = item.y + item.speed;

          // Check basket collision (basket is at y = 350, height = 30, width = 60)
          const basketY = 350;
          const hitBasket = newY >= basketY - 10 && newY <= basketY + 15 && item.x >= basketX - 25 && item.x <= basketX + 45;

          if (hitBasket) {
            // Collision caught!
            if (item.isCorrect) {
              setScore(s => s + 15);
            } else {
              setScore(s => Math.max(0, s - 10));
            }
          } else if (newY < 380) {
            remaining.push({ ...item, y: newY });
          }
        });
        return remaining;
      });
    }, 30);

    return () => clearInterval(gameLoop);
  }, [basketX, roundIdx, gameOver]);

  const handleRoundComplete = () => {
    if (roundIdx < gameRounds.length - 1) {
      setRoundIdx(prev => prev + 1);
      setTimeLeft(30);
      setFallingItems([]);
    } else {
      setGameOver(true);
      if (onGameComplete) onGameComplete(score);
    }
  };

  const moveBasket = (direction) => {
    setBasketX(x => {
      if (direction === 'left') return Math.max(10, x - 25);
      return Math.min(270, x + 25);
    });
  };

  const handleRestart = () => {
    setRoundIdx(0);
    setScore(0);
    setTimeLeft(30);
    setFallingItems([]);
    setGameOver(false);
  };

  return (
    <div style={{ background: 'linear-gradient(180deg, #dcfce7, #f0fdf4)', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '580px', margin: '0 auto', border: '2px solid #bbf7d0', boxSizing: 'border-box', textAlign: 'center' }}>
      
      {/* Game Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span className="card-badge active" style={{ background: '#10b981', color: 'white' }}>
          Round {roundIdx + 1} / {gameRounds.length}
        </span>
        <span style={{ fontWeight: 700, color: '#15803d' }}>⏳ Time: {timeLeft}s</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#15803d', fontWeight: 800 }}>
          <Award size={18} /> Score: {score}
        </div>
      </div>

      {gameOver ? (
        <div style={{ padding: '3rem 0' }}>
          <span style={{ fontSize: '4.5rem' }}>🍎</span>
          <h2 style={{ color: '#15803d', fontSize: '1.8rem', margin: '1rem 0' }}>Fruit Catcher Completed!</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>You caught words and scored {score} points!</p>
          <button onClick={handleRestart} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.8rem 1.8rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={16} /> Play Again
          </button>
        </div>
      ) : (
        <div>
          <div style={{ background: 'white', borderRadius: '16px', padding: '1rem', border: '1px solid #bbf7d0', marginBottom: '1.5rem' }}>
            <p style={{ margin: '0 0 0.3rem 0', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>Catch translation for:</p>
            <h2 style={{ margin: 0, color: '#15803d', fontWeight: 900 }}>"{activeRound?.target}"</h2>
          </div>

          {/* Fall Canvas Game Zone */}
          <div 
            ref={gameAreaRef}
            style={{ 
              height: '380px', 
              width: '100%', 
              background: '#ecfdf5', 
              border: '2px solid #bbf7d0', 
              borderRadius: '20px', 
              position: 'relative', 
              overflow: 'hidden',
              boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.03)'
            }}
          >
            {/* Falling Words */}
            {fallingItems.map(item => (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  left: item.x,
                  top: item.y,
                  background: 'white',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                  whiteSpace: 'nowrap'
                }}
              >
                {item.text}
              </div>
            ))}

            {/* Catcher Basket */}
            <div
              style={{
                position: 'absolute',
                left: basketX,
                bottom: '10px',
                width: '64px',
                height: '24px',
                background: '#15803d',
                borderRadius: '0 0 16px 16px',
                borderTop: '6px solid #eab308',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 900,
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                transition: 'left 0.1s ease-out'
              }}
            >
              BASKET
            </div>
          </div>

          {/* Steer controls */}
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button 
              onClick={() => moveBasket('left')} 
              style={{ background: 'white', border: '2px solid #cbd5e1', padding: '0.6rem 2rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontSize: '1.1rem' }}
            >
              ◀ Left
            </button>
            <button 
              onClick={() => moveBasket('right')} 
              style={{ background: 'white', border: '2px solid #cbd5e1', padding: '0.6rem 2rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontSize: '1.1rem' }}
            >
              Right ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FruitCatcher;
