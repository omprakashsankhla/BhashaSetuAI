import React, { useState, useEffect } from 'react';
import { Award, RefreshCw, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../../config/api';

const SIGN_DATA = {
  hi: [
    { sign: 'प्रवेश निषेध', type: 'danger', options: ['No Entry', 'Hospital Ahead', 'One Way', 'Speed Limit'], answer: 'No Entry' },
    { sign: 'धूम्रपान वर्जित', type: 'warning', options: ['Wet Floor', 'No Smoking', 'Toxic Danger', 'Keep Left'], answer: 'No Smoking' },
    { sign: 'खतरा', type: 'danger', options: ['Danger', 'Exit', 'Restaurant', 'Free Parking'], answer: 'Danger' },
    { sign: 'शांत क्षेत्र', type: 'info', options: ['Construction Zone', 'Quiet Zone / Silent Zone', 'Speed Breaker', 'No Parking'], answer: 'Quiet Zone / Silent Zone' },
    { sign: 'कृपया कचरा पात्र में डालें', type: 'info', options: ['Keep Left', 'No Littering / Throw Trash in Bin', 'Do Not Touch', 'Emergency Exit'], answer: 'No Littering / Throw Trash in Bin' }
  ],
  ur: [
    { sign: 'داخلہ ممنوع', type: 'danger', options: ['No Entry', 'Hospital Ahead', 'One Way', 'Speed Limit'], answer: 'No Entry' },
    { sign: 'تمباکو نوشی منع ہے', type: 'warning', options: ['Wet Floor', 'No Smoking', 'Toxic Danger', 'Keep Left'], answer: 'No Smoking' },
    { sign: 'خطرہ', type: 'danger', options: ['Danger', 'Exit', 'Restaurant', 'Free Parking'], answer: 'Danger' },
    { sign: 'خاموش علاقہ', type: 'info', options: ['Construction Zone', 'Quiet Zone / Silent Zone', 'Speed Breaker', 'No Parking'], answer: 'Quiet Zone / Silent Zone' },
    { sign: 'کوڑا دان استعمال کریں', type: 'info', options: ['Keep Left', 'No Littering / Throw Trash in Bin', 'Do Not Touch', 'Emergency Exit'], answer: 'No Littering / Throw Trash in Bin' }
  ],
  en: [
    { sign: 'NO ENTRY', type: 'danger', options: ['No Entry', 'Hospital Ahead', 'One Way', 'Speed Limit'], answer: 'No Entry' },
    { sign: 'NO SMOKING', type: 'warning', options: ['Wet Floor', 'No Smoking', 'Toxic Danger', 'Keep Left'], answer: 'No Smoking' },
    { sign: 'DANGER', type: 'danger', options: ['Danger', 'Exit', 'Restaurant', 'Free Parking'], answer: 'Danger' },
    { sign: 'SILENCE ZONE', type: 'info', options: ['Construction Zone', 'Quiet Zone / Silent Zone', 'Speed Breaker', 'No Parking'], answer: 'Quiet Zone / Silent Zone' }
  ]
};

const getSignData = (lang) => SIGN_DATA[lang] || SIGN_DATA['hi'] || SIGN_DATA['en'];

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

  const fetchGameData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const targetLang = storedUser.preferred_language || 'hi';
      const interfaceLang = i18n.language || 'en';
      
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/activities/game-data/signreader?lang=${targetLang}&interfaceLang=${interfaceLang}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.signs) {
          setSigns(data.signs);
        }
      }
    } catch (e) {
      console.error('Error fetching signreader data:', e);
    } finally {
      setLoading(false);
    }
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
          <div 
            style={{ 
              background: signBg, 
              border: `4px solid ${signBorder}`, 
              borderRadius: '24px', 
              padding: '2.5rem 1.5rem', 
              marginBottom: '2rem', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '1rem',
              boxShadow: '0 8px 16px rgba(0,0,0,0.05)'
            }}
          >
            {icon}
            <h1 
              style={{ 
                margin: 0, 
                color: signText, 
                fontSize: '2.4rem', 
                fontWeight: 900, 
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontFamily: 'system-ui, sans-serif'
              }}
            >
              {activeSign?.sign}
            </h1>
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
