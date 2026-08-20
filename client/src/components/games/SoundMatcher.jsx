import React, { useState, useEffect } from 'react';
import { Award, RefreshCw, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { speakText as ttsSpeak } from '../../utils/ttsHelper';

const MATCH_DATA = {
  hi: [
    { id: '1', word: 'नमस्ते', sound: 'नमस्ते' },
    { id: '2', word: 'धन्यवाद', sound: 'धन्यवाद' },
    { id: '3', word: 'पानी', sound: 'पानी' },
    { id: '4', word: 'घर', sound: 'घर' }
  ],
  ur: [
    { id: '1', word: 'سلام', sound: 'سلام' },
    { id: '2', word: 'شکریہ', sound: 'شکریہ' },
    { id: '3', word: 'پانی', sound: 'پانی' },
    { id: '4', word: 'گھر', sound: 'گھر' }
  ],
  en: [
    { id: '1', word: 'hello', sound: 'hello' },
    { id: '2', word: 'thanks', sound: 'thanks' },
    { id: '3', word: 'water', sound: 'water' },
    { id: '4', word: 'house', sound: 'house' }
  ]
};

const getMatchData = (lang) => MATCH_DATA[lang] || MATCH_DATA['hi'] || MATCH_DATA['en'];

const SoundMatcher = ({ onGameComplete }) => {
  const { i18n } = useTranslation();
  const rawPairs = getMatchData((JSON.parse(localStorage.getItem('user') || '{}').learning_language || 'hi'));

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]); // indices of currently flipped cards
  const [matched, setMatched] = useState([]); // matched card IDs
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    initDeck();
  }, []);

  const initDeck = () => {
    // Generate 4 sound cards and 4 word cards
    const deck = [];
    rawPairs.forEach(pair => {
      deck.push({
        id: `${pair.id}-sound`,
        matchId: pair.id,
        type: 'sound',
        content: pair.sound,
        isFlipped: false
      });
      deck.push({
        id: `${pair.id}-word`,
        matchId: pair.id,
        type: 'word',
        content: Array.isArray(pair.word) ? pair.word[0] : pair.word,
        isFlipped: false
      });
    });

    // Shuffle deck
    const shuffled = deck.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setScore(0);
    setGameOver(false);
  };

  const speak = (text) => {
    ttsSpeak(text, { rate: 0.8 });
  };

  const handleCardClick = (idx) => {
    // Ignore click if already matched or flipped or two cards are already open
    const card = cards[idx];
    if (matched.includes(card.matchId) || flipped.includes(idx) || flipped.length >= 2) return;

    // Trigger TTS if it's a sound card
    if (card.type === 'sound') {
      speak(card.content);
    }

    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    // Two cards open? Check match!
    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const card1 = cards[newFlipped[0]];
      const card2 = cards[newFlipped[1]];

      if (card1.matchId === card2.matchId && card1.type !== card2.type) {
        // Matched!
        setMatched(prev => {
          const updated = [...prev, card1.matchId];
          if (updated.length === rawPairs.length) {
            setGameOver(true);
            if (onGameComplete) onGameComplete(Math.max(10, 100 - moves * 8));
          }
          return updated;
        });
        setScore(prev => prev + 25);
        setFlipped([]);
      } else {
        // Not matched, flip back after timeout
        setTimeout(() => {
          setFlipped([]);
        }, 1200);
      }
    }
  };

  const handleRestart = () => {
    initDeck();
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '560px', margin: '0 auto', border: '2px solid #bae6fd', boxSizing: 'border-box', textAlign: 'center' }}>
      
      {/* Game Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <span className="card-badge active" style={{ background: '#0284c7', color: 'white' }}>
          Pairs Match ({matched.length}/{rawPairs.length})
        </span>
        <div style={{ display: 'flex', gap: '1rem', fontWeight: 800, color: '#0369a1' }}>
          <span>Moves: {moves}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Award size={18} /> Score: {score}</span>
        </div>
      </div>

      {gameOver ? (
        <div style={{ padding: '3rem 0' }}>
          <span style={{ fontSize: '4.5rem' }}>🔠</span>
          <h2 style={{ color: '#0369a1', fontSize: '1.8rem', margin: '1rem 0' }}>Memory Match Completed!</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>Matched all pairs in {moves} moves!</p>
          <button onClick={handleRestart} style={{ background: '#0284c7', color: 'white', border: 'none', padding: '0.8rem 1.8rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={16} /> Play Again
          </button>
        </div>
      ) : (
        <div>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.5rem 0', fontWeight: 700 }}>
            💡 Match the speaker cards to their matching written word script cards!
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', width: '100%' }}>
            {cards.map((card, idx) => {
              const isCardFlipped = flipped.includes(idx);
              const isCardMatched = matched.includes(card.matchId);
              const showFront = isCardFlipped || isCardMatched;

              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(idx)}
                  style={{
                    height: '110px',
                    borderRadius: '16px',
                    cursor: isCardMatched ? 'default' : 'pointer',
                    perspective: '600px',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '16px',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                      transition: 'transform 0.5s',
                      transformStyle: 'preserve-3d',
                      transform: showFront ? 'rotateY(180deg)' : 'none',
                      position: 'absolute'
                    }}
                  >
                    {/* Back face (Cover/Hidden) */}
                    <div
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        borderRadius: '16px',
                        background: '#0284c7',
                        border: '2px solid #bae6fd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 900,
                        fontSize: '1.8rem',
                        boxSizing: 'border-box'
                      }}
                    >
                      ❓
                    </div>

                    {/* Front face (Revealed Card) */}
                    <div
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        borderRadius: '16px',
                        background: isCardMatched ? '#dcfce7' : 'white',
                        border: `2px solid ${isCardMatched ? '#10b981' : '#cbd5e1'}`,
                        color: isCardMatched ? '#14532d' : '#1e293b',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: 'rotateY(180deg)',
                        boxSizing: 'border-box',
                        padding: '0.5rem'
                      }}
                    >
                      {card.type === 'sound' ? (
                        <>
                          <Volume2 size={28} color={isCardMatched ? '#10b981' : '#0284c7'} />
                          <span style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.2rem', fontWeight: 700 }}>LISTEN</span>
                        </>
                      ) : (
                        <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{card.content}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SoundMatcher;
