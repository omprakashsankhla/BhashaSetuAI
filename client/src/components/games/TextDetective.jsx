import React, { useState, useEffect } from 'react';
import { Award, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DETECTIVE_DATA = {
  hi: [
    {
      sentenceParts: ['यह ', 'मेरे ', 'किताब है।'],
      wrongIdx: 1,
      wrongWord: 'मेरे ',
      options: ['मेरी ', 'मेरा ', 'मैं ', 'मुझे '],
      correctAnswer: 'मेरी ',
      explanation: 'किताब (Book) is a feminine noun in Hindi, so "मेरी" is the correct possessive pronoun.'
    },
    {
      sentenceParts: ['वह कल बाजार ', 'जाऊँगा।'],
      wrongIdx: 1,
      wrongWord: 'जाऊँगा।',
      options: ['जाएगा।', 'जाओगे।', 'गया था।', 'जाएँगे।'],
      correctAnswer: 'जाएगा।',
      explanation: 'Since the subject is "वह" (He/She third person singular), the verb must conjugate to "जाएगा" (will go).'
    },
    {
      sentenceParts: ['बच्चे मैदान में ', 'रोता ', 'है।'],
      wrongIdx: 1,
      wrongWord: 'रोता ',
      options: ['खेलते ', 'सोता ', 'खाता ', 'रोता '],
      correctAnswer: 'खेलते ',
      explanation: 'Plural subject "बच्चे" requires plural verb conjugation "खेलते" (play).'
    }
  ],
  ur: [
    {
      sentenceParts: ['یہ ', 'میرے ', 'کتاب ہے۔'],
      wrongIdx: 1,
      wrongWord: 'میرے ',
      options: ['میری ', 'میرا ', 'میں ', 'مجھے '],
      correctAnswer: 'میری ',
      explanation: 'کتاب (Book) is feminine in Urdu, so "میری" is correct.'
    },
    {
      sentenceParts: ['وہ کل بازار ', 'جاؤں گا۔'],
      wrongIdx: 1,
      wrongWord: 'جاؤں گا۔',
      options: ['جائے گا۔', 'جاؤ گے۔', 'گیا تھا۔', 'جائیں گے۔'],
      correctAnswer: 'جائے گا۔',
      explanation: 'For third person "وہ", the verb should be "جائے گا".'
    },
    {
      sentenceParts: ['بچے میدان میں ', 'روتا ', 'ہیں۔'],
      wrongIdx: 1,
      wrongWord: 'روتا ',
      options: ['کھیلتے ', 'سوتا ', 'کھاتا ', 'روتا '],
      correctAnswer: 'کھیلتے ',
      explanation: 'Plural subject "بچے" requires plural verb "کھیلتے".'
    }
  ],
  en: [
    {
      sentenceParts: ['These ', 'is ', 'my books.'],
      wrongIdx: 1,
      wrongWord: 'is ',
      options: ['are ', 'was ', 'be ', 'am '],
      correctAnswer: 'are ',
      explanation: 'Plural subject "These" requires plural verb "are".'
    },
    {
      sentenceParts: ['He ', 'do not ', 'like apples.'],
      wrongIdx: 1,
      wrongWord: 'do not ',
      options: ['does not ', 'did not ', 'is not ', 'are not '],
      correctAnswer: 'does not ',
      explanation: 'Singular pronoun "He" requires the auxiliary verb "does".'
    }
  ]
};

const getDetectiveData = (lang) => DETECTIVE_DATA[lang] || DETECTIVE_DATA['hi'] || DETECTIVE_DATA['en'];

const TextDetective = ({ onGameComplete }) => {
  const { i18n } = useTranslation();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedWordIdx, setSelectedWordIdx] = useState(null);
  const [isFixed, setIsFixed] = useState(false);
  const [chosenOption, setChosenOption] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const fetchGameData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const targetLang = storedUser.preferred_language || 'hi';
      const interfaceLang = i18n.language || 'en';
      
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/activities/game-data/textdetective?lang=${targetLang}&interfaceLang=${interfaceLang}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.puzzles) {
          setCases(data.puzzles);
        }
      }
    } catch (e) {
      console.error('Error fetching textdetective data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGameData();
  }, []);

  const activeCase = cases[currentIdx];

  const handleWordTap = (idx) => {
    if (isFixed) return;
    setSelectedWordIdx(idx);
  };

  const handleOptionSelect = (option) => {
    setChosenOption(option);
    if (option === activeCase.correctAnswer) {
      setIsFixed(true);
      setScore(s => s + 30);
    } else {
      // incorrect guess penalty
      setScore(s => Math.max(0, s - 5));
      alert('❌ That did not fit! Re-read grammar rules!');
    }
  };

  const handleNext = () => {
    if (currentIdx < cases.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedWordIdx(null);
      setIsFixed(false);
      setChosenOption(null);
    } else {
      setGameOver(true);
      if (onGameComplete) onGameComplete(score);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedWordIdx(null);
    setIsFixed(false);
    setChosenOption(null);
    setScore(0);
    setGameOver(false);
  };

  if (loading) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '580px', margin: '0 auto', border: '2px solid #cbd5e1', boxSizing: 'border-box', textAlign: 'center', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#334155' }}>Preparing grammar investigation files...</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '580px', margin: '0 auto', border: '2px solid #cbd5e1', boxSizing: 'border-box', textAlign: 'center' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span className="card-badge active" style={{ background: '#475569', color: 'white' }}>
          Case {currentIdx + 1} / {cases.length}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155', fontWeight: 800 }}>
          <Award size={18} /> Score: {score}
        </div>
      </div>

      {gameOver ? (
        <div style={{ padding: '3rem 0' }}>
          <span style={{ fontSize: '4.5rem' }}>🕵️</span>
          <h2 style={{ color: '#334155', fontSize: '1.8rem', margin: '1rem 0' }}>Grammar Investigation Complete!</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>You earned {score} points proofreading text!</p>
          <button onClick={handleRestart} style={{ background: '#475569', color: 'white', border: 'none', padding: '0.8rem 1.8rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={16} /> Replay
          </button>
        </div>
      ) : (
        <div>
          <p style={{ color: '#475569', fontSize: '0.85rem', margin: '0 0 1.5rem 0', fontWeight: 700 }}>
            Find the spelling or grammatical error in the sentence below and tap it to fix:
          </p>

          {/* Interactive Sentence display */}
          <div 
            style={{ 
              background: 'white', 
              border: '2px solid #cbd5e1', 
              borderRadius: '20px', 
              padding: '2.2rem 1.5rem', 
              fontSize: '1.5rem', 
              fontWeight: 800,
              color: '#1e293b',
              marginBottom: '2rem',
              boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.2rem'
            }}
          >
            {activeCase?.sentenceParts.map((part, idx) => {
              const isWrongPart = idx === activeCase.wrongIdx;
              const isPartSelected = idx === selectedWordIdx;
              
              let partColor = 'inherit';
              let borderBottom = 'none';
              let cursor = 'default';

              if (isWrongPart) {
                partColor = '#b91c1c';
                borderBottom = '2px dashed #ef4444';
                cursor = 'pointer';
              }
              if (isFixed && isWrongPart) {
                partColor = '#166534';
                borderBottom = '2px solid #10b981';
              }

              return (
                <span
                  key={idx}
                  onClick={() => isWrongPart && handleWordTap(idx)}
                  style={{
                    color: partColor,
                    borderBottom: borderBottom,
                    cursor: cursor,
                    padding: '0 0.2rem',
                    background: (isPartSelected && !isFixed) ? '#fee2e2' : 'transparent',
                    borderRadius: '4px'
                  }}
                >
                  {isFixed && isWrongPart ? activeCase.correctAnswer : part}
                </span>
              );
            })}
          </div>

          {/* If the wrong word is tapped, show options selector */}
          {selectedWordIdx !== null && !isFixed && (
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #cbd5e1', marginBottom: '2rem', animation: 'fadeIn 0.3s ease' }}>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#475569', fontWeight: 700 }}>
                Choose the correct replacement for "<strong style={{ color: '#b91c1c' }}>{activeCase.wrongWord.trim()}</strong>":
              </p>
              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {activeCase.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(opt)}
                    style={{
                      background: 'white',
                      border: '2px solid #cbd5e1',
                      padding: '0.5rem 1.2rem',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.borderColor = '#475569'}
                    onMouseOut={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                  >
                    {opt.trim()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Explanation / Success Banner */}
          {isFixed && (
            <div style={{ marginTop: '1.5rem', padding: '1.2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', background: '#dcfce7', border: '1px solid #bbf7d0', animation: 'fadeIn 0.3s ease', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                <CheckCircle size={18} color="#10b981" />
                <span style={{ fontWeight: 800, color: '#14532d' }}>Correct! Text Decoded successfully!</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#166534', lineHeight: 1.4 }}>
                <strong>Explanation:</strong> {activeCase.explanation}
              </p>
              <button 
                onClick={handleNext} 
                style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.6rem 1.8rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', marginTop: '0.8rem', alignSelf: 'center' }}
              >
                Next Case →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TextDetective;
