import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Award, RefreshCw, CheckCircle, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BALLOON_DATA } from '../../data/games/coreGamesData';

// Vocabulary words and syllables for balloon popping
const getGameData = (lang) => BALLOON_DATA[lang] || BALLOON_DATA['hi'];

const BalloonPop = ({ onGameComplete }) => {
  const { i18n } = useTranslation();
  const gameWords = getGameData((JSON.parse(localStorage.getItem('user') || '{}').learning_language || 'hi'));

  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [spelledSyllables, setSpelledSyllables] = useState([]);
  const [balloons, setBalloons] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const animationFrameRef = useRef();
  const activeWord = gameWords[currentWordIdx];

  // Synthesize balloon pop sound using Web Audio API
  const playPopSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch (e) {
      console.error('Audio synthesis failed', e);
    }
  };

  // Generate balloons for current word
  const initBalloons = () => {
    if (!activeWord) return;
    const pool = activeWord.pool;
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
    
    const newBalloons = pool.map((text, idx) => ({
      id: idx,
      text,
      x: 50 + Math.random() * 300,
      y: 400 + Math.random() * 150,
      speed: 1 + Math.random() * 1.5,
      color: colors[idx % colors.length],
      size: 65 + Math.random() * 15
    }));
    setBalloons(newBalloons);
  };

  useEffect(() => {
    initBalloons();
    setSpelledSyllables([]);
  }, [currentWordIdx]);

  // Main game animation loop
  useEffect(() => {
    if (gameOver) return;

    const updatePhysics = () => {
      setBalloons(prev => 
        prev.map(b => {
          let newY = b.y - b.speed;
          // Respawn at bottom if floats off screen
          if (newY < -80) {
            newY = 480;
          }
          return { ...b, y: newY };
        })
      );
      animationFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animationFrameRef.current = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [gameOver]);

  const handlePop = (balloon) => {
    playPopSound();
    
    // Check spelling sequence
    const expectedNext = activeWord.syllables[spelledSyllables.length];
    
    if (balloon.text === expectedNext) {
      const updated = [...spelledSyllables, balloon.text];
      setSpelledSyllables(updated);
      setScore(prev => prev + 10);

      // Remove popped balloon
      setBalloons(prev => prev.filter(b => b.id !== balloon.id));

      // Word complete?
      if (updated.length === activeWord.syllables.length) {
        setTimeout(() => {
          if (currentWordIdx < gameWords.length - 1) {
            setCurrentWordIdx(prev => prev + 1);
          } else {
            setGameOver(true);
            if (onGameComplete) onGameComplete(score + 50);
          }
        }, 600);
      }
    } else {
      // Wrong balloon popped
      setScore(prev => Math.max(0, prev - 5));
      // Bounce the balloon down slightly as penalty
      setBalloons(prev => prev.map(b => b.id === balloon.id ? { ...b, y: b.y + 100 } : b));
    }
  };

  const handleRestart = () => {
    setCurrentWordIdx(0);
    setSpelledSyllables([]);
    setScore(0);
    setGameOver(false);
  };

  return (
    <div style={{ background: 'linear-gradient(180deg, #dbeafe, #eff6ff)', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '600px', margin: '0 auto', border: '2px solid #bfdbfe', boxSizing: 'border-box', position: 'relative' }}>
      
      {/* Game Header Dashboard */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span style={{ background: '#3b82f6', color: 'white', fontWeight: 700, padding: '0.4rem 1rem', borderRadius: '12px', fontSize: '0.85rem' }}>
          Word {currentWordIdx + 1} / {gameWords.length}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1e3a8a', fontWeight: 800 }}>
          <Award size={18} /> Score: {score}
        </div>
      </div>

      {gameOver ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <span style={{ fontSize: '4rem' }}>🎉</span>
          <h2 style={{ color: '#1e3a8a', fontSize: '1.8rem', margin: '1rem 0' }}>Game Completed!</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>You successfully spelled all the words!</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={handleRestart} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.8rem 1.8rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <RefreshCw size={16} /> Replay
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Target Word and Progress */}
          <div style={{ textAlign: 'center', background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
            <p style={{ margin: '0 0 0.4rem 0', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Spell this word:</p>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.5rem', color: '#1e3a8a', fontWeight: 900 }}>{activeWord?.translation}</h1>
            
            {/* Spelled syllables output block */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', minHeight: '44px', alignItems: 'center', marginTop: '1rem' }}>
              {activeWord?.syllables.map((syl, index) => {
                const isSpelled = index < spelledSyllables.length;
                return (
                  <div 
                    key={index}
                    style={{ 
                      minWidth: '50px', 
                      height: '44px', 
                      borderRadius: '10px', 
                      border: isSpelled ? '2px solid #10b981' : '2px dashed #cbd5e1', 
                      background: isSpelled ? '#dcfce7' : '#f8fafc',
                      color: '#1e293b',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: 800,
                      fontSize: '1.2rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isSpelled ? syl : ''}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Balloon Sandbox Area */}
          <div style={{ height: '400px', width: '100%', border: '1px solid #bfdbfe', background: '#f0f9ff', borderRadius: '20px', overflow: 'hidden', position: 'relative', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.03)' }}>
            {balloons.map(b => (
              <div
                key={b.id}
                onClick={() => handlePop(b)}
                style={{
                  position: 'absolute',
                  left: b.x,
                  top: b.y,
                  width: b.size,
                  height: b.size * 1.15,
                  borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
                  background: b.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  boxShadow: 'inset -5px -5px 15px rgba(0,0,0,0.15), 0 10px 15px rgba(0,0,0,0.1)',
                  userSelect: 'none',
                  transition: 'transform 0.1s',
                  transform: 'scale(1)'
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {/* Balloon text */}
                {b.text}
                {/* Balloon string knot node */}
                <div style={{ position: 'absolute', bottom: '-4px', left: 'calc(50% - 4px)', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: `6px solid ${b.color}` }} />
                {/* Balloon String line */}
                <div style={{ position: 'absolute', bottom: '-24px', left: '50%', width: '1px', height: '20px', background: '#94a3b8' }} />
              </div>
            ))}
          </div>
          
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
            <HelpCircle size={14} /> Tip: Pop only the balloons that match the spelling parts!
          </p>
        </div>
      )}
    </div>
  );
};

export default BalloonPop;
