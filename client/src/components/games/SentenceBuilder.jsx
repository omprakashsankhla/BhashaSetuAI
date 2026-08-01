import React, { useState, useEffect } from 'react';
import { Award, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SENTENCE_DATA = {
  hi: [
    { target: 'I drink water.', correct: ['मैं', 'पानी', 'पीता', 'हूँ'], pool: ['हूँ', 'पीता', 'पानी', 'मैं', 'खाता', 'वह'] },
    { target: 'This is my house.', correct: ['यह', 'मेरा', 'घर', 'है'], pool: ['मेरा', 'घर', 'है', 'यह', 'वह', 'किताब'] },
    { target: 'The food is good.', correct: ['खाना', 'अच्छा', 'है'], pool: ['अच्छा', 'है', 'खाना', 'पानी', 'बहुत'] },
    { target: 'Where is the school?', correct: ['स्कूल', 'कहाँ', 'है'], pool: ['कहाँ', 'है', 'स्कूल', 'घर', 'क्या'] }
  ],
  ur: [
    { target: 'I drink water.', correct: ['میں', 'پانی', 'پیتا', 'ہوں'], pool: ['ہوں', 'پیتا', 'پانی', 'میں', 'کھاتا', 'وہ'] },
    { target: 'This is my house.', correct: ['یہ', 'میرا', 'گھر', 'ہے'], pool: ['میرا', 'گھر', 'ہے', 'یہ', 'وہ', 'کتاب'] },
    { target: 'The food is good.', correct: ['کھانا', 'اچھا', 'ہے'], pool: ['اچھا', 'ہے', 'کھانا', 'پانی', 'بہت'] },
    { target: 'Where is the school?', correct: ['اسکول', 'کہاں', 'ہے'], pool: ['کہاں', 'ہے', 'اسکول', 'گھر', 'کیا'] }
  ],
  en: [
    { target: 'I drink water.', correct: ['I', 'drink', 'water'], pool: ['water', 'drink', 'I', 'eat', 'food'] },
    { target: 'This is my house.', correct: ['This', 'is', 'my', 'house'], pool: ['house', 'my', 'is', 'This', 'book'] }
  ]
};

const getSentenceData = (lang) => SENTENCE_DATA[lang] || SENTENCE_DATA['hi'] || SENTENCE_DATA['en'];

const SentenceBuilder = ({ onGameComplete }) => {
  const { i18n } = useTranslation();
  const sentences = getSentenceData((JSON.parse(localStorage.getItem('user') || '{}').preferred_language || 'hi'));

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedWords, setSelectedWords] = useState([]);
  const [wordPool, setWordPool] = useState([]);
  const [result, setResult] = useState(null); // 'correct' | 'incorrect'
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const activeSentence = sentences[currentIdx];

  useEffect(() => {
    initRound();
  }, [currentIdx]);

  const initRound = () => {
    if (!activeSentence) return;
    // Shuffle the pool of words
    const shuffled = [...activeSentence.pool].sort(() => Math.random() - 0.5);
    setWordPool(shuffled);
    setSelectedWords([]);
    setResult(null);
  };

  const handleWordSelect = (word) => {
    if (result === 'correct') return;
    // Add to selection, remove from pool
    setSelectedWords(prev => [...prev, word]);
    setWordPool(prev => {
      const idx = prev.indexOf(word);
      const updated = [...prev];
      if (idx > -1) updated.splice(idx, 1);
      return updated;
    });
  };

  const handleWordDeselect = (word) => {
    if (result === 'correct') return;
    // Remove from selection, add back to pool
    setSelectedWords(prev => prev.filter(w => w !== word));
    setWordPool(prev => [...prev, word]);
    setResult(null);
  };

  const handleCheck = () => {
    const isCorrect = selectedWords.length === activeSentence.correct.length && 
                      selectedWords.every((val, i) => val === activeSentence.correct[i]);
    
    if (isCorrect) {
      setResult('correct');
      setScore(s => s + 25);
    } else {
      setResult('incorrect');
      // Shake penalty or reset selection
      setTimeout(() => {
        // Return all words to pool
        setWordPool([...activeSentence.pool].sort(() => Math.random() - 0.5));
        setSelectedWords([]);
        setResult(null);
      }, 1500);
    }
  };

  const handleNext = () => {
    if (currentIdx < sentences.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setGameOver(true);
      if (onGameComplete) onGameComplete(score);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setScore(0);
    setGameOver(false);
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '580px', margin: '0 auto', border: '2px solid #fde68a', boxSizing: 'border-box', textAlign: 'center' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span className="card-badge active" style={{ background: '#d97706', color: 'white' }}>
          Sentence {currentIdx + 1} / {sentences.length}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b45309', fontWeight: 800 }}>
          <Award size={18} /> Score: {score}
        </div>
      </div>

      {gameOver ? (
        <div style={{ padding: '3rem 0' }}>
          <span style={{ fontSize: '4.5rem' }}>🧩</span>
          <h2 style={{ color: '#b45309', fontSize: '1.8rem', margin: '1rem 0' }}>Sentence Scrambler Completed!</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>You earned {score} points building sentences!</p>
          <button onClick={handleRestart} style={{ background: '#d97706', color: 'white', border: 'none', padding: '0.8rem 1.8rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={16} /> Replay
          </button>
        </div>
      ) : (
        <div>
          {/* Target translation display */}
          <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #fde68a', marginBottom: '1.5rem', textAlign: 'left' }}>
            <h5 style={{ margin: '0 0 0.5rem 0', color: '#b45309', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Build this sentence:</h5>
            <h2 style={{ margin: 0, color: '#1e293b', fontWeight: 900 }}>"{activeSentence?.target}"</h2>
          </div>

          {/* Construction Tray */}
          <div style={{ minHeight: '64px', width: '100%', background: '#fffbeb', border: '2px dashed #f59e0b', borderRadius: '16px', padding: '0.8rem', boxSizing: 'border-box', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            {selectedWords.map((word, idx) => (
              <button
                key={idx}
                onClick={() => handleWordDeselect(word)}
                style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
              >
                {word}
              </button>
            ))}
            {selectedWords.length === 0 && (
              <span style={{ color: '#d97706', fontSize: '0.9rem', fontStyle: 'italic' }}>Tap words below to arrange them here</span>
            )}
          </div>

          {/* Available Word Pool */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center', marginBottom: '2rem' }}>
            {wordPool.map((word, idx) => (
              <button
                key={idx}
                onClick={() => handleWordSelect(word)}
                style={{ background: 'white', border: '2px solid #fde68a', color: '#1e293b', padding: '0.5rem 1.2rem', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s' }}
                onMouseOver={e => e.currentTarget.style.borderColor = '#f59e0b'}
                onMouseOut={e => e.currentTarget.style.borderColor = '#fde68a'}
              >
                {word}
              </button>
            ))}
          </div>

          {/* Control Actions */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button
              onClick={handleCheck}
              disabled={selectedWords.length === 0 || result === 'correct'}
              style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', opacity: (selectedWords.length === 0 || result === 'correct') ? 0.6 : 1 }}
            >
              Check Sentence
            </button>
          </div>

          {/* Result Banner alerts */}
          {result && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', background: result === 'correct' ? '#dcfce7' : '#fee2e2', border: `1px solid ${result === 'correct' ? '#bbf7d0' : '#fecaca'}`, animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {result === 'correct' ? <CheckCircle size={18} color="#10b981" /> : <AlertCircle size={18} color="#ef4444" />}
                <span style={{ fontWeight: 800, color: result === 'correct' ? '#14532d' : '#7f1d1d' }}>
                  {result === 'correct' ? '✅ Perfect Word Order! Well done!' : '❌ Incorrect order! Resetting tray...'}
                </span>
              </div>
              {result === 'correct' && (
                <button onClick={handleNext} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem' }}>
                  Next Sentence →
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SentenceBuilder;
