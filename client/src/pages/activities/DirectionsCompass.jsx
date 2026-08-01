import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Star, Volume2, Trophy, RotateCcw, Compass, ArrowUp, ArrowDown, ArrowLeft as ArrowL, ArrowRight, HelpCircle } from 'lucide-react';
import { speakText as ttsSpeak } from '../../utils/ttsHelper';

const DIRECTIONS_DATA = {
  hi: {
    title: "Directions Compass (दिशा निर्देश)",
    desc: "नक्शे पर वाहन चलाने के लिए ऑडियो/टेक्स्ट दिशा-निर्देशों का पालन करें।",
    win: "बधाई हो! आप सही गंतव्य पर पहुंच गए हैं।",
    loss: "ओह! आप गलत दिशा में चले गए।",
    controls: "दिशा यंत्र (Controls)",
    startText: "शुरुआत (Start)",
    locations: { start: "शुरुआत", hospital: "अस्पताल", school: "स्कूल", market: "बाज़ार", library: "पुस्तकालय" },
    legendTitle: "दिशा सूचक गाइड (Directions Guide)",
    legendBody: "कम्पस की दिशाएं सीखें:\n⬆️ उत्तर (North) - ऊपर\n⬇️ दक्षिण (South) - नीचे\n⬅️ पश्चिम (West) - बाएं\n➡️ पूर्व (East) - दाएं\n\nनक्शा संकेत:\n🚗 - आपका वर्तमान स्थान\n🏫 - स्कूल, 🏥 - अस्पताल, 🏪 - बाज़ार, 📖 - पुस्तकालय",
    logMove: "आप चले:",
    dirNames: { up: "उत्तर (North)", down: "दक्षिण (South)", left: "पश्चिम (West)", right: "पूर्व (East)" },
    rounds: [
      { text: "सीधे दो कदम दक्षिण (नीचे) आगे बढ़ें और स्कूल पहुंचे।", target: [2, 0], audio: "सीधे दो कदम दक्षिण आगे बढ़ें और स्कूल पहुंचे।" },
      { text: "शुरुआत से सीधे दो कदम पूर्व (दाएं) आगे बढ़ें और अस्पताल पहुंचे।", target: [0, 2], audio: "शुरुआत से सीधे दो कदम पूर्व आगे बढ़ें और अस्पताल पहुंचे।" },
      { text: "शुरुआत से सीधे दो कदम पूर्व और फिर दो कदम दक्षिण जाकर बाज़ार पहुंचे।", target: [2, 2], audio: "शुरुआत से सीधे दो कदम पूर्व और फिर दो कदम दक्षिण जाकर बाज़ार पहुंचे।" }
    ]
  },
  ur: {
    title: "سمت نما کمپاس (سمتیں)",
    desc: "نقشے پر گاڑی چلانے کے لیے صوتی/تحریری ہدایات پر عمل کریں۔",
    win: "مبارک ہو! آپ صحیح جگہ پہنچ گئے ہیں۔",
    loss: "اوہ! آپ غلط سمت میں چلے گئے۔",
    controls: "کنٹرولز (Controls)",
    startText: "شروع (Start)",
    locations: { start: "شروع", hospital: "ہسپتال", school: "اسکول", market: "بازار", library: "لائبریری" },
    legendTitle: "سمتوں کی گائیڈ (Directions Guide)",
    legendBody: "کمپاس کی سمتیں سیکھیں:\n⬆️ شمال (North) - اوپر\n⬇️ جنوب (South) - نیچے\n⬅️ مغرب (West) - بائیں\n➡️ مشرق (East) - دائیں",
    logMove: "آپ چلے:",
    dirNames: { up: "شمال (North)", down: "جنوب (South)", left: "مغرب (West)", right: "مشرق (East)" },
    rounds: [
      { text: "سیدھے دو قدم جنوب (نیچے) آگے بڑھیں اور اسکول پہنچیں۔", target: [2, 0], audio: "سیدھے دو قدم جنوب آگے بڑھیں اور اسکول پہنچیں۔" },
      { text: "شروع سے سیدھے دو قدم مشرق (دائیں) آگے بڑھیں اور ہسپتال پہنچیں۔", target: [0, 2], audio: "شروع سے سیدھے دو قدم مشرق آگے بڑھیں اور ہسپتال پہنچیں۔" },
      { text: "شروع سے سیدھے دو قدم مشرق اور پھر دو قدم جنوب جا کر بازار پہنچیں۔", target: [2, 2], audio: "شروع سے سیدھے دو قدم مشرق اور پھر دو قدم جنوب جا کر بازار پہنچیں۔" }
    ]
  },
  ta: {
    title: "திசை காட்டி (Directions Compass)",
    desc: "வரைபடத்தில் வாகனத்தை ஓட்ட ஆடியோ/உரை வழிமுறைகளைப் பின்பற்றவும்.",
    win: "வாழ்த்துகள்! நீங்கள் சரியான இடத்தை அடைந்துவிட்டீர்கள்.",
    loss: "அய்யோ! நீங்கள் தவறான திசையில் சென்றுவிட்டீர்கள்.",
    controls: "கட்டுப்பாடுகள் (Controls)",
    startText: "தொடக்கம் (Start)",
    locations: { start: "தொடக்கம்", hospital: "மருத்துவமனை", school: "பள்ளி", market: "சந்தை", library: "நூலகம்" },
    legendTitle: "திசைகள் வழிகாட்டி (Directions Guide)",
    legendBody: "திசைகளை கற்க:\n⬆️ வடக்கு (North) - மேலே\n⬇️ தெற்கு (South) - கீழே\n⬅️ மேற்கு (West) - இடது\n➡️ கிழக்கு (East) - வலது",
    logMove: "நீங்கள் சென்ற திசை:",
    dirNames: { up: "வடக்கு (North)", down: "தெற்கு (South)", left: "மேற்கு (West)", right: "கிழக்கு (East)" },
    rounds: [
      { text: "நேராக இரண்டு அடிகள் தெற்கு நோக்கிச் சென்று பள்ளிக்குச் செல்லவும்.", target: [2, 0], audio: "நேராக இரண்டு அடிகள் தெற்கு நோக்கிச் சென்று பள்ளிக்குச் செல்லவும்." },
      { text: "தொடக்கத்திலிருந்து இரண்டு அடிகள் கிழக்கு நோக்கிச் சென்று மருத்துவமனைக்குச் செல்லவும்.", target: [0, 2], audio: "தொடக்கத்திலிருந்து இரண்டு அடிகள் கிழக்கு நோக்கிச் சென்று மருத்துவமனைக்குச் செல்லவும்." },
      { text: "தொடக்கத்திலிருந்து இரண்டு அடிகள் கிழக்கு, பின் இரண்டு அடிகள் தெற்கு நோக்கிச் சென்று சந்தைக்குச் செல்லவும்.", target: [2, 2], audio: "தொடக்கத்திலிருந்து இரண்டு அடிகள் கிழக்கு, பின் இரண்டு அடிகள் தெற்கு நோக்கிச் சென்று சந்தைக்குச் செல்லவும்." }
    ]
  },
  te: {
    title: "దిక్సూచి (Directions Compass)",
    desc: "మ్యాప్‌లో వాహనాన్ని నడపడానికి ఆడియో/టెక్స్ట్ సూచనలను అనుసరించండి.",
    win: "అభినందనలు! మీరు సరైన గమ్యస్థానాన్ని చేరుకున్నారు.",
    loss: "అయ్యో! మీరు తప్పు దారిలో వెళ్ళారు.",
    controls: "నియంత్రణలు (Controls)",
    startText: "ప్రారంభం (Start)",
    locations: { start: "ప్రారంభం", hospital: "ఆసుపత్రి", school: "పాఠశాల", market: "మార్కెట్", library: "గ్రంథాలయం" },
    legendTitle: "దిశల గైడ్ (Directions Guide)",
    legendBody: "దిశలను నేర్చుకోండి:\n⬆️ ఉత్తరం (North) - పైకి\n⬇️ దక్షిణం (South) - క్రిందికి\n⬅️ పడమర (West) - ఎడమవైపు\n➡️ తూర్పు (East) - కుడివైపు",
    logMove: "మీరు వెళ్ళిన దిశ:",
    dirNames: { up: "ఉత్తరం (North)", down: "దక్షిణం (South)", left: "పడమర (West)", right: "తూర్పు (East)" },
    rounds: [
      { text: "నేరుగా రెండు అడుగులు దక్షిణం వైపు వేసి పాఠశాల చేరుకోండి.", target: [2, 0], audio: "నేరుగా రెండు అడుగులు దక్షిణం వైపు వేసి పాఠశాల చేరుకోండి." },
      { text: "ప్రారంభం నుండి రెండు అడుగులు తూర్పు వైపు వేసి ఆసుపత్రి చేరుకోండి.", target: [0, 2], audio: "ప్రారంభం నుండి రెండు అడుగులు తూర్పు వైపు వేసి ఆసుపత్రి చేరుకోండి." },
      { text: "ప్రారంభం నుండి రెండు అడుగులు తూర్పు, ఆపై రెండు అడుగులు దక్షిణం వైపు వేసి మార్కెట్ చేరుకోండి.", target: [2, 2], audio: "ప్రారంభం నుండి రెండు అడుగులు తూర్పు, ఆపై రెండు అడుగులు దక్షిణం వైపు వేసి మార్కెట్ చేరుకోండి." }
    ]
  },
  en: {
    title: "Directions Compass",
    desc: "Follow the audio or text directions to drive the vehicle on the map grid.",
    win: "Congratulations! You reached the correct destination.",
    loss: "Oh! You drove in the wrong direction.",
    controls: "Direction Pad",
    startText: "Start",
    locations: { start: "Start", hospital: "Hospital", school: "School", market: "Market", library: "Library" },
    legendTitle: "Directions Guide",
    legendBody: "Learn Compass Directions:\n⬆️ North - Up\n⬇️ South - Down\n⬅️ West - Left\n➡️ East - Right",
    logMove: "You traveled:",
    dirNames: { up: "North", down: "South", left: "West", right: "East" },
    rounds: [
      { text: "Drive straight down two steps South to reach the School.", target: [2, 0], audio: "Drive straight down two steps South to reach the School." },
      { text: "Drive right two steps East to reach the Hospital.", target: [0, 2], audio: "Drive right two steps East to reach the Hospital." },
      { text: "Drive right two steps East and down two steps South to reach the Market.", target: [2, 2], audio: "Drive right two steps East and down two steps South to reach the Market." }
    ]
  }
};

const fallbacks = ['mwr', 'bn', 'mr'];
fallbacks.forEach(lang => {
  DIRECTIONS_DATA[lang] = DIRECTIONS_DATA['hi'];
});

const DirectionsCompass = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

    let currentLang = 'hi';
  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    currentLang = storedUser.preferred_language || 'hi';
  } catch (e) {}
  const data = DIRECTIONS_DATA[currentLang] || DIRECTIONS_DATA['hi'];

  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [playerPos, setPlayerPos] = useState([0, 0]); // [Row, Col]
  const [score, setScore] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [gameComplete, setGameComplete] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]); // Array of moves
  const [showLegend, setShowLegend] = useState(false);

  const round = data.rounds[currentRoundIdx];

  const grid = [
    [ { label: data.locations.start, key: 'start', emoji: '🏁' }, { label: '', key: 'empty', emoji: '' }, { label: data.locations.hospital, key: 'hospital', emoji: '🏥' } ],
    [ { label: '', key: 'empty', emoji: '' }, { label: data.locations.library, key: 'library', emoji: '📖' }, { label: '', key: 'empty', emoji: '' } ],
    [ { label: data.locations.school, key: 'school', emoji: '🏫' }, { label: '', key: 'empty', emoji: '' }, { label: data.locations.market, key: 'market', emoji: '🏪' } ]
  ];

  const speakText = (text) => {
    ttsSpeak(text, { lang: currentLang, rate: 0.85 });
  };

  useEffect(() => {
    if (round) {
      speakText(round.audio);
    }
  }, [currentRoundIdx, currentLang]);

  const handleMove = (direction) => {
    if (statusMsg) return;

    let [r, c] = playerPos;
    let oldPos = [r, c];
    
    if (direction === 'up' && r > 0) r -= 1;
    if (direction === 'down' && r < 2) r += 1;
    if (direction === 'left' && c > 0) c -= 1;
    if (direction === 'right' && c < 2) c += 1;

    // Check if position actually changed
    if (oldPos[0] === r && oldPos[1] === c) return;

    setPlayerPos([r, c]);
    
    // Add to history log
    const dirText = data.dirNames[direction] || '';
    setMoveHistory(prev => [...prev, `${data.logMove} ${dirText}`]);

    // Check if player reached round target
    const target = round.target;
    if (r === target[0] && c === target[1]) {
      setScore(prev => prev + 30);
      setStatusMsg(data.win);
      speakText(data.locations[grid[r][c].key]);

      setTimeout(() => {
        setStatusMsg('');
        setMoveHistory([]);
        if (currentRoundIdx < data.rounds.length - 1) {
          setCurrentRoundIdx(prev => prev + 1);
          setPlayerPos([0, 0]);
        } else {
          setGameComplete(true);
        }
      }, 2000);
    }
  };

  const handleReset = () => {
    setCurrentRoundIdx(0);
    setPlayerPos([0, 0]);
    setScore(0);
    setStatusMsg('');
    setMoveHistory([]);
    setGameComplete(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem' }}>
      <button 
        onClick={() => navigate('/activities')} 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '12px', cursor: 'pointer', color: '#475569', fontSize: '0.9rem', fontWeight: 700, marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
      >
        <ArrowLeft size={18} /> Back to Activities
      </button>

      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
        
        {/* Banner */}
        <div style={{ background: 'linear-gradient(135deg, #6366f1, #4338ca)', borderRadius: '24px', padding: '1.8rem', color: 'white', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 0.4rem 0' }}>🧭 {data.title}</h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>{data.desc}</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.6rem 1.2rem', borderRadius: '20px', fontWeight: 800 }}>
            Score: {score}
          </div>
        </div>

        {gameComplete ? (
          <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
            <Trophy size={64} color="#eab308" style={{ marginBottom: '1.2rem', marginInline: 'auto' }} />
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b', margin: '0 0 0.5rem 0' }}>Perfect Navigation!</h2>
            <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '2rem' }}>You navigated correctly to all requested shops and buildings!</p>
            <button 
              onClick={handleReset}
              style={{ background: '#4338ca', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RotateCcw size={18} /> Restart Game
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            
            {/* 3x3 Grid Map Canvas */}
            <div style={{ flex: 1, minWidth: '320px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
              
              {/* Route alert bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                <button 
                  onClick={() => speakText(round.audio)}
                  style={{ background: '#6366f1', color: 'white', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                  <Volume2 size={16} />
                </button>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.4 }}>
                  {round.text}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem', marginBottom: '1.5rem' }}>
                {grid.map((row, rIdx) => 
                  row.map((cell, cIdx) => {
                    const isPlayer = playerPos[0] === rIdx && playerPos[1] === cIdx;
                    
                    let bg = '#f8fafc';
                    let border = '1px solid #e2e8f0';
                    let color = '#475569';
                    
                    if (cell.key === 'start') {
                      bg = '#eff6ff';
                      border = '1px solid #bfdbfe';
                      color = '#1e40af';
                    } else if (cell.key !== 'empty') {
                      bg = '#f5f3ff';
                      border = '1px solid #ddd6fe';
                      color = '#6d28d9';
                    }

                    return (
                      <div
                        key={cIdx}
                        style={{
                          height: '95px',
                          background: isPlayer ? '#fef08a' : bg,
                          border: isPlayer ? '2px solid #eab308' : border,
                          borderRadius: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          color: isPlayer ? '#854d0e' : color,
                          position: 'relative',
                          textAlign: 'center',
                          padding: '0.2rem',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)'
                        }}
                      >
                        {isPlayer ? (
                          <span style={{ fontSize: '1.6rem', marginBottom: '0.2rem' }}>🚗</span>
                        ) : (
                          <span style={{ fontSize: '1.4rem', marginBottom: '0.1rem' }}>{cell.emoji}</span>
                        )}
                        <span>{cell.label}</span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Movement Real-time Logs */}
              <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1rem', border: '1px solid #e2e8f0', minHeight: '60px' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800, display: 'block', marginBottom: '0.4rem' }}>
                  Direction History (मूवमेंट रिकॉर्ड)
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>
                  {moveHistory.length === 0 ? '-' : moveHistory.map((h, i) => (
                    <span key={i} style={{ background: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '8px' }}>
                      {h}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Controls & Legends sidebar */}
            <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
              
              {/* Direction Arrows */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.8rem' }}>
                  {data.controls}
                </span>

                <div style={{ display: 'grid', gridTemplateRows: 'repeat(3, 1fr)', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', width: '140px', height: '140px' }}>
                  <div />
                  <button 
                    onClick={() => handleMove('up')}
                    style={{ gridRow: 1, gridColumn: 2, background: 'white', border: '1px solid #cbd5e1', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                  >
                    <ArrowUp size={20} color="#475569" />
                  </button>
                  <div />

                  <button 
                    onClick={() => handleMove('left')}
                    style={{ gridRow: 2, gridColumn: 1, background: 'white', border: '1px solid #cbd5e1', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                  >
                    <ArrowL size={20} color="#475569" />
                  </button>
                  <div style={{ gridRow: 2, gridColumn: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Compass size={24} color="#6366f1" />
                  </div>
                  <button 
                    onClick={() => handleMove('right')}
                    style={{ gridRow: 2, gridColumn: 3, background: 'white', border: '1px solid #cbd5e1', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                  >
                    <ArrowRight size={20} color="#475569" />
                  </button>

                  <div />
                  <button 
                    onClick={() => handleMove('down')}
                    style={{ gridRow: 3, gridColumn: 2, background: 'white', border: '1px solid #cbd5e1', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                  >
                    <ArrowDown size={20} color="#475569" />
                  </button>
                  <div />
                </div>
              </div>

              {/* Status Alert Banner */}
              {statusMsg && (
                <div 
                  style={{
                    padding: '0.8rem',
                    borderRadius: '12px',
                    background: statusMsg === data.win ? '#dcfce7' : '#fee2e2',
                    color: statusMsg === data.win ? '#166534' : '#991b1b',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    textAlign: 'center',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  {statusMsg}
                </div>
              )}

              {/* Collapsible Educational Compass Legends */}
              <div style={{ width: '100%', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                <button
                  onClick={() => setShowLegend(!showLegend)}
                  style={{
                    width: '100%', padding: '0.8rem 1rem', background: 'none', border: 'none',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    cursor: 'pointer', fontWeight: 800, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <HelpCircle size={16} color="#6366f1" /> Guide Legend
                  </span>
                </button>
                {showLegend && (
                  <div style={{ padding: '0 1rem 1rem 1rem', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.6, whiteSpace: 'pre-line', borderTop: '1px solid #f1f5f9' }}>
                    {data.legendBody}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default DirectionsCompass;
