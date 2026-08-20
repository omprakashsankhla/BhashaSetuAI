import React, { useState, useEffect } from 'react';
import { Award, RefreshCw, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../../config/api';
import { SIGN_DATA } from '../../data/games/coreGamesData';

const getSignData = (lang) => SIGN_DATA[lang] || SIGN_DATA['hi'];



const SignReader = ({ onGameComplete }) => {
  const { i18n } = useTranslation();

  const [signs, setSigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15); // 15 seconds per sign quiz
  const [gameOver, setGameOver] = useState(false);

  const renderActualSign = (activeSign) => {
    const answer = activeSign?.answer;

    if (answer === 'No Entry') {
      return (
        <div style={{
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          backgroundColor: '#dc2626',
          border: '6px solid #ffffff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
        }}>
          <div style={{ width: '100px', height: '22px', backgroundColor: '#ffffff', borderRadius: '4px' }} />
        </div>
      );
    }

    if (answer === 'No Smoking') {
      return (
        <div style={{
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          border: '12px solid #dc2626',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
        }}>
          <span style={{ fontSize: '5rem' }}>🚬</span>
          <div style={{
            position: 'absolute',
            width: '120px',
            height: '10px',
            backgroundColor: '#dc2626',
            transform: 'rotate(-45deg)',
            borderRadius: '4px'
          }} />
        </div>
      );
    }

    if (answer === 'Danger') {
      return (
        <div style={{
          width: '170px',
          height: '170px',
          backgroundColor: '#dc2626',
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '6px',
            left: '6px',
            right: '6px',
            bottom: '6px',
            border: '3px solid #ffffff',
            clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
            pointerEvents: 'none'
          }} />
          <span style={{ fontSize: '4.5rem', color: '#ffffff', zIndex: 2 }}>💀</span>
        </div>
      );
    }

    if (answer === 'Quiet Zone / Silent Zone') {
      return (
        <div style={{
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          border: '12px solid #dc2626',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
        }}>
          <span style={{ fontSize: '4.5rem' }}>📯</span>
          <div style={{
            position: 'absolute',
            width: '120px',
            height: '10px',
            backgroundColor: '#dc2626',
            transform: 'rotate(-45deg)',
            borderRadius: '4px'
          }} />
        </div>
      );
    }

    if (answer === 'No Littering') {
      return (
        <div style={{
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          border: '12px solid #dc2626',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
        }}>
          <span style={{ fontSize: '6rem' }}>🚯</span>
        </div>
      );
    }

    if (answer === 'Stop') {
      return (
        <div style={{
          width: '170px',
          height: '170px',
          backgroundColor: '#dc2626',
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '6px',
            left: '6px',
            right: '6px',
            bottom: '6px',
            border: '3px solid #ffffff',
            clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
            pointerEvents: 'none'
          }} />
          <span style={{ color: '#ffffff', fontSize: '2.5rem', fontWeight: 900, fontFamily: 'system-ui, sans-serif', zIndex: 2 }}>STOP</span>
        </div>
      );
    }

    if (answer === 'Speed Limit') {
      return (
        <div style={{
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          border: '12px solid #dc2626',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
        }}>
          <span style={{ color: '#000000', fontSize: '3.2rem', fontWeight: 900, fontFamily: 'system-ui, sans-serif' }}>50</span>
        </div>
      );
    }

    if (answer === 'One Way') {
      return (
        <div style={{
          width: '110px',
          height: '160px',
          backgroundColor: '#2563eb',
          borderRadius: '12px',
          border: '5px solid #ffffff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
        }}>
          <span style={{ color: '#ffffff', fontSize: '5rem', fontWeight: 900 }}>↑</span>
        </div>
      );
    }

    if (answer === 'Hospital Ahead') {
      return (
        <div style={{
          width: '150px',
          height: '150px',
          backgroundColor: '#2563eb',
          borderRadius: '16px',
          border: '6px solid #ffffff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
        }}>
          <span style={{ color: '#ffffff', fontSize: '5rem', fontWeight: 900, fontFamily: 'sans-serif' }}>H</span>
        </div>
      );
    }

    if (answer === 'School Ahead') {
      return (
        <div style={{
          width: '150px',
          height: '150px',
          backgroundColor: '#f59e0b',
          transform: 'rotate(45deg)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '4px 4px 12px rgba(0,0,0,0.15)',
          border: '4px solid #1e293b',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '6px',
            left: '6px',
            right: '6px',
            bottom: '6px',
            border: '2px solid #1e293b',
            pointerEvents: 'none'
          }} />
          <div style={{
            transform: 'rotate(-45deg)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '5.5rem' }}>🚸</span>
          </div>
        </div>
      );
    }

    // Default fallback
    return (
      <div style={{
        width: '160px',
        height: '160px',
        borderRadius: '16px',
        backgroundColor: '#2563eb',
        border: '6px solid #ffffff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
      }}>
        <span style={{ color: '#ffffff', fontSize: '4rem' }}>⚠️</span>
      </div>
    );
  };

  const fetchGameData = async () => {
    let targetLang = 'hi';
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      targetLang = storedUser.learning_language || 'hi';
      const interfaceLang = i18n.language || 'en';
      
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/activities/game-data/signreader?lang=${targetLang}&interfaceLang=${interfaceLang}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.signs && data.signs.length > 0) {
          setSigns(data.signs);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error('Error fetching signreader data:', e);
    }
    
    // Fallback to local data if API fails or returns empty results
    setSigns(getSignData(targetLang));
    setLoading(false);
  };

  useEffect(() => {
    fetchGameData();
  }, []);

  const activeSign = signs[currentIdx];

  useEffect(() => {
    if (gameOver || isAnswered || loading || !activeSign) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          handleAnswer(null); // Timeout counts as wrong
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIdx, isAnswered, gameOver]);

  const handleAnswer = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    if (option === activeSign.answer) {
      setScore(s => s + 20);
    }
  };

  const handleNext = () => {
    if (currentIdx < signs.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(15);
    } else {
      setGameOver(true);
      if (onGameComplete) onGameComplete(score);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setTimeLeft(15);
    setGameOver(false);
  };

  let signBg = '#fef2f2';
  let signBorder = '#fecaca';
  let signText = '#991b1b';
  let icon = <ShieldAlert size={36} color="#ef4444" />;

  if (activeSign?.type === 'warning') {
    signBg = '#fffbeb';
    signBorder = '#fde68a';
    signText = '#92400e';
    icon = <AlertTriangle size={36} color="#f59e0b" />;
  } else if (activeSign?.type === 'info') {
    signBg = '#eff6ff';
    signBorder = '#bfdbfe';
    signText = '#1e40af';
    icon = <ShieldAlert size={36} color="#3b82f6" />;
  }

  if (loading) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #ecfeff, #cffafe)', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '580px', margin: '0 auto', border: '2px solid #cffafe', boxSizing: 'border-box', textAlign: 'center', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0e7490' }}>Preparing road signs and translations...</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, #ecfeff, #cffafe)', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '580px', margin: '0 auto', border: '2px solid #cffafe', boxSizing: 'border-box', textAlign: 'center' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span className="card-badge active" style={{ background: '#0891b2', color: 'white' }}>
          Sign {currentIdx + 1} / {signs.length}
        </span>
        <span style={{ fontWeight: 700, color: '#0e7490' }}>⏱️ Time: {timeLeft}s</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0e7490', fontWeight: 800 }}>
          <Award size={18} /> Score: {score}
        </div>
      </div>

      {gameOver ? (
        <div style={{ padding: '3rem 0' }}>
          <span style={{ fontSize: '4.5rem' }}>🚦</span>
          <h2 style={{ color: '#0e7490', fontSize: '1.8rem', margin: '1rem 0' }}>Sign Speed Reader Completed!</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>You earned {score} points interpreting signs!</p>
          <button onClick={handleRestart} style={{ background: '#0891b2', color: 'white', border: 'none', padding: '0.8rem 1.8rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={16} /> Replay
          </button>
        </div>
      ) : (
        <div>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1rem 0', fontWeight: 700 }}>
            Identify the correct meaning of this public sign:
          </p>

          {/* Graphical Sign Display */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1.5rem 0',
            marginBottom: '1.8rem'
          }}>
            {renderActualSign(activeSign)}
          </div>

          {/* Option Multiple Choices */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {activeSign?.options.map((option, idx) => {
              let btnBg = 'white';
              let btnBorder = '#cbd5e1';
              let btnColor = '#1e293b';

              if (isAnswered) {
                if (option === activeSign.answer) {
                  btnBg = '#dcfce7';
                  btnBorder = '#10b981';
                  btnColor = '#14532d';
                } else if (option === selectedOption) {
                  btnBg = '#fee2e2';
                  btnBorder = '#ef4444';
                  btnColor = '#7f1d1d';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  disabled={isAnswered}
                  style={{ 
                    background: btnBg, 
                    border: `2px solid ${btnBorder}`, 
                    color: btnColor, 
                    padding: '0.8rem 1.2rem', 
                    borderRadius: '16px', 
                    fontSize: '1rem', 
                    fontWeight: 700, 
                    cursor: isAnswered ? 'default' : 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => { if(!isAnswered) e.currentTarget.style.borderColor = '#0891b2'; }}
                  onMouseOut={e => { if(!isAnswered) e.currentTarget.style.borderColor = btnBorder; }}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', animation: 'fadeIn 0.3s' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: selectedOption === activeSign.answer ? '#15803d' : '#b91c1c' }}>
                {selectedOption === activeSign.answer ? '🎉 Correct! Safe interpretation!' : '❌ Incorrect! Watch street signs closely!'}
              </span>
              <button 
                onClick={handleNext} 
                style={{ background: '#0891b2', color: 'white', border: 'none', padding: '0.6rem 1.8rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem' }}
              >
                Continue →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SignReader;
