import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Trophy, Play, CheckCircle2, RotateCcw, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BalloonPop from '../components/games/BalloonPop';
import TraceMaster from '../components/games/TraceMaster';
import SoundMatcher from '../components/games/SoundMatcher';
import FruitCatcher from '../components/games/FruitCatcher';
import SentenceBuilder from '../components/games/SentenceBuilder';
import SignReader from '../components/games/SignReader';
import ShopKeeper from '../components/games/ShopKeeper';
import WordSprint from '../components/games/WordSprint';
import EchoChamber from '../components/games/EchoChamber';
import TextDetective from '../components/games/TextDetective';
import './ActivityEngine.css';
import { speakText as ttsSpeak, LANG_REC_MAP } from '../utils/ttsHelper';
import { API_BASE_URL } from '../config/api';

// ─── 8 NEW MINI-GAMES INTERACTIVE SANDBOX ───
const NewMiniGames = ({ gameType, onGameComplete }) => {
  let currentLang = 'hi';
  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    currentLang = storedUser.preferred_language || 'hi';
  } catch (e) {}

  const speak = (text) => {
    ttsSpeak(text, { lang: currentLang, rate: 0.85 });
  };

  // 1. Picture Bingo Game
  if (gameType === 'pic-bingo') {
    const BINGO_ITEMS = {
      hi: [
        { word: "सेब", emoji: "🍎" }, { word: "कार", emoji: "🚗" }, { word: "घर", emoji: "🏠" },
        { word: "अस्पताल", emoji: "🏥" }, { word: "किताब", emoji: "📖" }, { word: "स्कूल", emoji: "🏫" },
        { word: "बाज़ार", emoji: "🏪" }, { word: "बस", emoji: "🚌" }, { word: "ट्रेन", emoji: "🚂" }
      ],
      en: [
        { word: "Apple", emoji: "🍎" }, { word: "Car", emoji: "🚗" }, { word: "House", emoji: "🏠" },
        { word: "Hospital", emoji: "🏥" }, { word: "Book", emoji: "📖" }, { word: "School", emoji: "🏫" },
        { word: "Market", emoji: "🏪" }, { word: "Bus", emoji: "🚌" }, { word: "Train", emoji: "🚂" }
      ]
    };
    const items = BINGO_ITEMS[currentLang] || BINGO_ITEMS['hi'];
    const [marked, setMarked] = useState(Array(9).fill(false));
    const [targetIdx, setTargetIdx] = useState(0);

    const checkBingo = (newMarked) => {
      const wins = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];
      return wins.some(w => w.every(idx => newMarked[idx]));
    };

    const handleCellClick = (idx) => {
      if (idx === targetIdx && !marked[idx]) {
        const nextMarked = [...marked];
        nextMarked[idx] = true;
        setMarked(nextMarked);
        if (checkBingo(nextMarked)) {
          onGameComplete(100);
        } else {
          // Choose next unmarked index
          const remaining = nextMarked.map((m, i) => m ? null : i).filter(v => v !== null);
          if (remaining.length > 0) {
            const nextTarget = remaining[Math.floor(Math.random() * remaining.length)];
            setTargetIdx(nextTarget);
            speak(items[nextTarget].word);
          }
        }
      }
    };

    return (
      <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', textAlign: 'center', border: '1px solid #e2e8f0', maxWidth: '450px', width: '100%' }}>
        <h3 style={{ margin: '0 0 1rem 0' }}>🔔 {currentLang === 'hi' ? "बींगो (Find the spoken item)" : "Picture Bingo"}</h3>
        <button onClick={() => speak(items[targetIdx].word)} style={{ background: '#2b58ff', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <Volume2 size={16} /> Listen: {items[targetIdx].word}
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' }}>
          {items.map((it, idx) => (
            <button key={idx} onClick={() => handleCellClick(idx)} style={{ height: '90px', fontSize: '2rem', background: marked[idx] ? '#dcfce7' : '#f8fafc', border: `2px solid ${marked[idx] ? '#10b981' : '#cbd5e1'}`, borderRadius: '16px', cursor: marked[idx] ? 'default' : 'pointer' }}>
              {it.emoji}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 2. Memory Card Flip Game
  if (gameType === 'memory-flip') {
    const CARDS = [
      { id: 1, word: '🍎', match: 'apple' }, { id: 2, word: 'apple', match: 'apple' },
      { id: 3, word: '🚗', match: 'car' }, { id: 4, word: 'car', match: 'car' },
      { id: 5, word: '🏠', match: 'house' }, { id: 6, word: 'house', match: 'house' },
      { id: 7, word: '🏥', match: 'hospital' }, { id: 8, word: 'hospital', match: 'hospital' },
      { id: 9, word: '📖', match: 'book' }, { id: 10, word: 'book', match: 'book' },
      { id: 11, word: '🏫', match: 'school' }, { id: 12, word: 'school', match: 'school' }
    ];
    const [deck, setDeck] = useState(() => [...CARDS].sort(() => Math.random() - 0.5));
    const [selected, setSelected] = useState([]); // selected indices
    const [matched, setMatched] = useState([]); // matched values

    const handleFlip = (idx) => {
      if (selected.length === 2 || matched.includes(deck[idx].match) || selected.includes(idx)) return;
      
      const nextSel = [...selected, idx];
      setSelected(nextSel);

      if (nextSel.length === 2) {
        const [first, second] = nextSel;
        if (deck[first].match === deck[second].match) {
          const nextMat = [...matched, deck[first].match];
          setMatched(nextMat);
          setSelected([]);
          if (nextMat.length === 6) {
            onGameComplete(100);
          }
        } else {
          setTimeout(() => setSelected([]), 1000);
        }
      }
    };

    return (
      <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', textAlign: 'center', border: '1px solid #e2e8f0', maxWidth: '480px', width: '100%' }}>
        <h3 style={{ margin: '0 0 1.5rem 0' }}>🎴 Flash Memory Flip</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.8rem' }}>
          {deck.map((card, idx) => {
            const isOpen = selected.includes(idx) || matched.includes(card.match);
            return (
              <button key={idx} onClick={() => handleFlip(idx)} style={{ height: '80px', fontSize: isOpen ? '1.1rem' : '1.5rem', background: isOpen ? '#eff6ff' : '#2b58ff', border: 'none', color: isOpen ? '#1e3a8a' : 'white', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>
                {isOpen ? card.word : '❓'}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. Clue Crossword Puzzle Game
  if (gameType === 'crossword-clue') {
    const CLUES = {
      hi: [
        { q: "1. वह स्थान जहाँ विद्यार्थी पढ़ने जाते हैं?", a: "स्कूल" },
        { q: "2. बीमारों के इलाज की जगह?", a: "अस्पताल" },
        { q: "3. सब्जियों और फल खरीदने का स्थान?", a: "बाज़ार" },
        { q: "4. रेलगाड़ी रुकने का स्थान?", a: "स्टेशन" }
      ],
      en: [
        { q: "1. Place where pupils go to study?", a: "school" },
        { q: "2. Institution for medical care?", a: "hospital" },
        { q: "3. Location where goods are purchased?", a: "market" },
        { q: "4. Where you board trains?", a: "station" }
      ]
    };
    const list = CLUES[currentLang] || CLUES['hi'];
    const [cIdx, setCIdx] = useState(0);
    const [val, setVal] = useState('');
    const [msg, setMsg] = useState('');

    const handleVerify = () => {
      if (val.trim().toLowerCase() === list[cIdx].a.toLowerCase()) {
        setVal('');
        setMsg('✓ Correct!');
        setTimeout(() => {
          setMsg('');
          if (cIdx < 3) {
            setCIdx(c => c + 1);
          } else {
            onGameComplete(120);
          }
        }, 1000);
      } else {
        setMsg('✗ Incorrect. Try again!');
      }
    };

    return (
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', maxWidth: '480px', width: '100%' }}>
        <h3 style={{ margin: '0 0 1.2rem 0', color: '#1e293b' }}>🧩 Clue Crossword ({cIdx + 1}/4)</h3>
        <p style={{ fontSize: '1.15rem', color: '#475569', fontWeight: 700, lineHeight: 1.5, marginBottom: '2rem' }}>
          {list[cIdx].q}
        </p>
        <input type="text" value={val} onChange={e => setVal(e.target.value)} placeholder="Type answer here..." style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '0.8rem 1.2rem', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', marginBottom: '1.5rem', fontWeight: 600 }} />
        <button onClick={handleVerify} style={{ width: '100%', background: '#2b58ff', color: 'white', padding: '0.8rem', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>Verify Answer</button>
        {msg && <p style={{ marginTop: '1rem', fontWeight: 800, color: msg.startsWith('✓') ? '#10b981' : '#ef4444', textAlign: 'center' }}>{msg}</p>}
      </div>
    );
  }

  // 4. Tense Shift Connector Game
  if (gameType === 'tense-shift') {
    const PAIRS = [
      { pr: "लिखता है", pa: "लिखा" },
      { pr: "खाता है", pa: "खाया" },
      { pr: "जाता है", pa: "गया" },
      { pr: "पीता है", pa: "पिया" },
      { pr: "सोता है", pa: "सोया" }
    ];
    const [selectedPr, setSelectedPr] = useState(null);
    const [solved, setSolved] = useState([]);

    const handleConnect = (paVal) => {
      if (!selectedPr) return;
      const match = PAIRS.find(p => p.pr === selectedPr && p.pa === paVal);
      if (match) {
        setSolved([...solved, selectedPr]);
        setSelectedPr(null);
        if (solved.length + 1 === 5) {
          onGameComplete(100);
        }
      } else {
        setSelectedPr(null);
      }
    };

    return (
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', maxWidth: '500px', width: '100%' }}>
        <h3 style={{ margin: '0 0 1.5rem 0' }}>⏳ Tense Shift Connect</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h4 style={{ margin: '0 0 0.8rem 0', color: '#64748b' }}>वर्तमान (Present)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {PAIRS.map(p => (
                <button key={p.pr} disabled={solved.includes(p.pr)} onClick={() => setSelectedPr(p.pr)} style={{ padding: '0.8rem', borderRadius: '12px', border: `2px solid ${selectedPr === p.pr ? '#2b58ff' : '#cbd5e1'}`, background: solved.includes(p.pr) ? '#ecfdf5' : selectedPr === p.pr ? '#eff6ff' : 'white', cursor: solved.includes(p.pr) ? 'default' : 'pointer', fontWeight: 700 }}>
                  {p.pr} {solved.includes(p.pr) && '✓'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.8rem 0', color: '#64748b' }}>भूतकाल (Past)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {PAIRS.map(p => (
                <button key={p.pa} disabled={solved.includes(p.pr)} onClick={() => handleConnect(p.pa)} style={{ padding: '0.8rem', borderRadius: '12px', border: '2px solid #cbd5e1', background: solved.includes(p.pr) ? '#ecfdf5' : 'white', cursor: solved.includes(p.pr) ? 'default' : 'pointer', fontWeight: 700 }}>
                  {p.pa}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. Dialogue Puzzler Game
  if (gameType === 'dialogue-puzzler') {
    const LINES = [
      { id: 1, text: "नमस्ते भाई साहब!" },
      { id: 2, text: "नमस्कार! आज कैसे आना हुआ?" },
      { id: 3, text: "मुझे एक नया बचत खाता खुलवाना है।" },
      { id: 4, text: "ज़रूर, कृपया आधार कार्ड की कॉपी काउंटर पर जमा करें।" }
    ];
    const [scrambled, setScrambled] = useState(() => [...LINES].sort(() => Math.random() - 0.5));
    const [selectedIdxs, setSelectedIdxs] = useState([]);

    const handleSelectLine = (idx) => {
      const nextSel = [...selectedIdxs, idx];
      setSelectedIdxs(nextSel);
      if (nextSel.length === 4) {
        const sortedIds = nextSel.map(i => scrambled[i].id);
        const correct = sortedIds.every((id, idx) => id === idx + 1);
        if (correct) {
          onGameComplete(100);
        } else {
          setSelectedIdxs([]); // reset on failure
        }
      }
    };

    return (
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', maxWidth: '500px', width: '100%' }}>
        <h3 style={{ margin: '0 0 1.5rem 0' }}>💬 Dialogue Puzzler</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 600 }}>क्रमवार संवाद को व्यवस्थित करने के लिए लाइनों पर सही क्रम में क्लिक करें।</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {scrambled.map((line, idx) => {
            const clickOrder = selectedIdxs.indexOf(idx) + 1;
            return (
              <button key={idx} onClick={() => handleSelectLine(idx)} style={{ padding: '1rem', borderRadius: '12px', border: `2px solid ${clickOrder > 0 ? '#2b58ff' : '#cbd5e1'}`, background: clickOrder > 0 ? '#eff6ff' : 'white', textAlign: 'left', fontWeight: 600, fontSize: '0.98rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <span>{line.text}</span>
                {clickOrder > 0 && <span style={{ background: '#2b58ff', color: 'white', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.75rem', fontWeight: 900 }}>{clickOrder}</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 6. Editorial Speed Draft Game
  if (gameType === 'speed-editor') {
    const CHALLENGES = [
      { text: "वह बहुत [मदद] करता है।", word: "मदद", options: ["सहायता", "उपयोग", "मार्ग"], answer: "सहायता" },
      { text: "आज मौसम बहुत [चोखो] है।", word: "चोखो", options: ["खराब", "सुंदर", "अच्छा"], answer: "अच्छा" },
      { text: "हमें पत्र [भेजना] है।", word: "भेजना", options: ["प्रेषित करना", "देना", "लिखना"], answer: "प्रेषित करना" }
    ];
    const [idx, setIdx] = useState(0);

    const handleSelectOption = (opt) => {
      if (opt === CHALLENGES[idx].answer) {
        if (idx < 2) {
          setIdx(idx + 1);
        } else {
          onGameComplete(120);
        }
      }
    };

    return (
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', maxWidth: '480px', width: '100%' }}>
        <h3 style={{ margin: '0 0 1.2rem 0' }}>✍️ Editorial Speed Draft ({idx + 1}/3)</h3>
        <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginBottom: '2rem' }}>
          {CHALLENGES[idx].text}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {CHALLENGES[idx].options.map(opt => (
            <button key={opt} onClick={() => handleSelectOption(opt)} style={{ padding: '0.9rem', borderRadius: '12px', border: '2px solid #cbd5e1', background: 'white', fontWeight: 700, fontSize: '0.98rem', cursor: 'pointer', transition: 'all 0.15s' }}>
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 7. Debate Argument Builder Game
  if (gameType === 'debate-builder') {
    const CARDS = [
      { title: "तर्क 1: विज्ञान के प्रमाण", desc: "शोध बताते हैं कि तकनीक से पठन क्षमता में 20% सुधार होता है।", isWinner: true },
      { title: "तर्क 2: असंगत व्यक्तिगत राय", desc: "मुझे लगता है कि फोन क्लासरूम में अच्छा प्रभाव डालता है।", isWinner: false },
      { title: "तर्क 3: काल्पनिक उदाहरण", desc: "यदि फोन न हो तो कोई भी कभी बात नहीं कर पाएगा।", isWinner: false }
    ];

    return (
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', maxWidth: '500px', width: '100%' }}>
        <h3 style={{ margin: '0 0 1.2rem 0' }}>🗣️ Debate Argument Builder</h3>
        <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '1.8rem', fontWeight: 600 }}>डिबेट जीतने के लिए सबसे तार्किक और प्रामाणिक तर्क पत्र (Argument Card) चुनें।</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {CARDS.map((card, i) => (
            <button key={i} onClick={() => card.isWinner && onGameComplete(120)} style={{ padding: '1.2rem', borderRadius: '16px', border: '2px solid #cbd5e1', background: 'white', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}>
              <h4 style={{ margin: '0 0 0.4rem 0', color: '#2b58ff', fontWeight: 800 }}>{card.title}</h4>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>{card.desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 8. Idiom Connect Game
  if (gameType === 'idiom-connect') {
    const PAIRS = [
      { idm: "लोहा मानना", val: "शक्ति या प्रभाव स्वीकार करना" },
      { idm: "आँखों का तारा", val: "बहुत प्यारा होना" },
      { idm: "कान भरना", val: "शिकायत या चुगली करना" }
    ];
    const [selIdm, setSelIdm] = useState(null);
    const [solved, setSolved] = useState([]);

    const handleConnect = (val) => {
      if (!selIdm) return;
      const match = PAIRS.find(p => p.idm === selIdm && p.val === val);
      if (match) {
        setSolved([...solved, selIdm]);
        setSelIdm(null);
        if (solved.length + 1 === 3) {
          onGameComplete(100);
        }
      } else {
        setSelIdm(null);
      }
    };

    return (
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', maxWidth: '520px', width: '100%' }}>
        <h3 style={{ margin: '0 0 1.5rem 0' }}>🔗 Idiom Connect</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h4 style={{ margin: '0 0 0.8rem 0', color: '#64748b' }}>मुहावरा (Idiom)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {PAIRS.map(p => (
                <button key={p.idm} disabled={solved.includes(p.idm)} onClick={() => setSelIdm(p.idm)} style={{ padding: '0.8rem', borderRadius: '12px', border: `2px solid ${selIdm === p.idm ? '#2b58ff' : '#cbd5e1'}`, background: solved.includes(p.idm) ? '#ecfdf5' : selIdm === p.idm ? '#eff6ff' : 'white', cursor: solved.includes(p.idm) ? 'default' : 'pointer', fontWeight: 700, fontSize: '0.92rem' }}>
                  {p.idm} {solved.includes(p.idm) && '✓'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.8rem 0', color: '#64748b' }}>अर्थ (Meaning)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {PAIRS.map(p => (
                <button key={p.val} disabled={solved.includes(p.idm)} onClick={() => handleConnect(p.val)} style={{ padding: '0.8rem', borderRadius: '12px', border: '2px solid #cbd5e1', background: solved.includes(p.idm) ? '#ecfdf5' : 'white', cursor: solved.includes(p.idm) ? 'default' : 'pointer', fontWeight: 700, fontSize: '0.88rem' }}>
                  {p.val}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div className="game-placeholder">Unknown Game Sandbox</div>;
};

const GAME_TITLES = {
  hi: {
    'balloon-pop': "गुब्बारा पोड़ो",
    'trace-letters': "वर्ण लेखन",
    'sound-match': "ध्वनि मिलान",
    'fruit-catch': "फल पकड़ने वाला",
    'pic-bingo': "चित्र बींगो",
    'memory-flip': "स्मृति कार्ड मिलान",
    'sentence-builder': "वाक्य क्रमबद्धता",
    'sign-reader': "सड़क संकेत वाचक",
    'shop-keeper': "बाज़ार दुकानदार",
    'crossword-clue': "संकेत पहेली",
    'tense-shift': "काल परिवर्तन मिलान",
    'dialogue-puzzler': "संवाद पहेली",
    'word-sprint': "शब्द गति टाइपिंग",
    'echo-chamber': "ध्वनि प्रतिध्वनि",
    'text-detective': "व्याकरण जासूस",
    'speed-editor': "संपादन गति ड्राफ्ट",
    'debate-builder': "वाद-विवाद तर्क निर्माता",
    'idiom-connect': "मुहावरा मिलान"
  },
  en: {
    'balloon-pop': "Balloon Pop Catcher",
    'trace-letters': "Trace Master",
    'sound-match': "Sound Matcher",
    'fruit-catch': "Fruit Catcher",
    'pic-bingo': "Picture Bingo",
    'memory-flip': "Flash Memory Flip",
    'sentence-builder': "Sentence Scrambler",
    'sign-reader': "Speed Sign Reader",
    'shop-keeper': "Bazaar Shopkeeper",
    'crossword-clue': "Clue Crossword",
    'tense-shift': "Tense Shift Connect",
    'dialogue-puzzler': "Dialogue Puzzler",
    'word-sprint': "Word Sprint Typer",
    'echo-chamber': "Echo Tongue Twisters",
    'text-detective': "Grammar Detective",
    'speed-editor': "Editorial Speed Draft",
    'debate-builder': "Debate Argument Builder",
    'idiom-connect': "Idiom Connect"
  },
  ta: {
    'balloon-pop': "பலூன் பாப்",
    'trace-letters': "எழுத்து பயிற்சி",
    'sound-match': "ஒலி பொருத்தம்",
    'fruit-catch': "பழம் பிடிப்பவர்",
    'pic-bingo': "பட பிங்கோ",
    'memory-flip': "நினைவக அட்டை",
    'sentence-builder': "வாக்கிய அமைப்பு",
    'sign-reader': "சாலை சிக்னல்",
    'shop-keeper': "கடைக்காரர்",
    'crossword-clue': "குறுக்கெழுத்து புதிர்",
    'tense-shift': "கால மாற்றம்",
    'dialogue-puzzler': "உரையாடல் புதிர்",
    'word-sprint': "வேக தட்டச்சு",
    'echo-chamber': "ஒலி அதிர்வு",
    'text-detective': "இலக்கணக் கண்டறிதல்",
    'speed-editor': "வேகத் திருத்துநர்",
    'debate-builder': "விவாதக் கார்டு",
    'idiom-connect': "மரபுத்தொடர் பொருத்தம்"
  },
  te: {
    'balloon-pop': "బెలూన్ పాప్",
    'trace-letters': "అక్షర లేఖనం",
    'sound-match': "ధ్వని సరిపోలిక",
    'fruit-catch': "పండ్ల బుట్ట",
    'pic-bingo': "చిత్ర బింగో",
    'memory-flip': "మెమొరీ కార్డ్",
    'sentence-builder': "వాక్య నిర్మాణం",
    'sign-reader': "రోడ్డు సంకేతాలు",
    'shop-keeper': "దుకాణదారుడు",
    'crossword-clue': "పద వినోదం",
    'tense-shift': "కాలాలు-క్రియలు",
    'dialogue-puzzler': "సంభాషణ పజిల్",
    'word-sprint': "వేగవంతమైన టైపింగ్",
    'echo-chamber': "ధ్వని ఉచ్ఛారణ",
    'text-detective': "వ్యాకరణ పరిశోధన",
    'speed-editor': "ఎడిటింగ్ వేగం",
    'debate-builder': "చర్చా వేదిక",
    'idiom-connect': "జాతీయాలు-అర్థాలు"
  }
};

const fallbacksTitles = ['mwr', 'ur', 'bn', 'mr'];
fallbacksTitles.forEach(lang => {
  GAME_TITLES[lang] = GAME_TITLES['hi'];
});

const ENGINE_LOC = {
  hi: {
    wellPlayed: "शानदार खेल!",
    syncMsg: "आपका स्कोर और अर्जित सिक्के सिंक हो गए हैं।",
    score: "स्कोर",
    coins: "अर्जित सिक्के",
    backBtn: "खेल हब पर वापस जाएं"
  },
  en: {
    wellPlayed: "Well Played!",
    syncMsg: "Your game score and coins have been synchronized.",
    score: "SCORE",
    coins: "COINS EARNED",
    backBtn: "Back to Games Hub"
  },
  ta: {
    wellPlayed: "அருமையான ஆட்டம்!",
    syncMsg: "உங்கள் மதிப்பெண்கள் மற்றும் நாணயங்கள் சேமிக்கப்பட்டன.",
    score: "மதிப்பெண்",
    coins: "பெற்ற நாணயங்கள்",
    backBtn: "விளையாட்டு மையத்திற்குத் திரும்புக"
  },
  te: {
    wellPlayed: "అద్భుతంగా ఆడారు!",
    syncMsg: "మీ స్కోరు మరియు నాణేలు సేవ్ చేయబడ్డాయి.",
    score: "స్కోరు",
    coins: "సంపాదించిన నాణేలు",
    backBtn: "గేమ్స్ హబ్‌కు తిరిగి వెళ్ళు"
  }
};
fallbacksTitles.forEach(lang => {
  ENGINE_LOC[lang] = ENGINE_LOC['hi'];
});

const ActivityEngine = () => {
  const { gameType } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const currentLang = i18n.language || 'hi';
  const loc = ENGINE_LOC[currentLang] || ENGINE_LOC['hi'];
  const pageTitle = (GAME_TITLES[currentLang] && GAME_TITLES[currentLang][gameType]) || gameType.replace('-', ' ');
  
  const [sessionScore, setSessionScore] = useState(null);

  const handleGameComplete = (score) => {
    setSessionScore(score);
    
    // Save completion progress to local storage
    const progressStr = localStorage.getItem('games_progress') || '{}';
    try {
      const prog = JSON.parse(progressStr);
      prog[gameType] = true; // Mark current game as completed
      
      // Hardcoded game unlock sequence path
      const gameSequence = [
        'balloon-pop',
        'trace-letters',
        'sound-match',
        'fruit-catch',
        'pic-bingo',
        'memory-flip',
        'sentence-builder',
        'sign-reader',
        'shop-keeper',
        'crossword-clue',
        'tense-shift',
        'dialogue-puzzler',
        'word-sprint',
        'echo-chamber',
        'text-detective',
        'speed-editor',
        'debate-builder',
        'idiom-connect'
      ];
      
      const nextIdx = gameSequence.indexOf(gameType) + 1;
      if (nextIdx < gameSequence.length) {
        prog[gameSequence[nextIdx]] = true; // Unlock the next progressive game
      }
      
      localStorage.setItem('games_progress', JSON.stringify(prog));
      
      // Map gameType to a core skill
      let mappedSkill = 'vocabulary';
      if (['trace-letters', 'sentence-builder', 'tense-shift', 'speed-editor', 'idiom-connect'].includes(gameType)) mappedSkill = 'grammar';
      if (['sound-match', 'echo-chamber', 'dialogue-puzzler', 'debate-builder'].includes(gameType)) mappedSkill = 'listening';
      if (['sign-reader', 'text-detective'].includes(gameType)) mappedSkill = 'reading';

      const token = localStorage.getItem('token');
      if (token) {
        // Record skill progress (assume if they complete the game with >50 score, it's mostly correct)
        fetch(`${API_BASE_URL}/api/learning/progress/skill`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ skill: mappedSkill, isCorrect: score >= 50, source: 'game' })
        }).catch(err => console.error('Skill progress update failed', err));

        // Award coins
        fetch(`${API_BASE_URL}/api/dashboard/award-coins`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ coins: Math.round(score / 5) })
        }).catch(err => console.error('Coin award failed', err));
      }
    } catch (e) {
      console.error('Error saving game progress', e);
    }
  };

  const renderGame = () => {
    switch (gameType) {
      case 'balloon-pop':
        return <BalloonPop onGameComplete={handleGameComplete} />;
      case 'trace-letters':
        return <TraceMaster onGameComplete={handleGameComplete} />;
      case 'sound-match':
        return <SoundMatcher onGameComplete={handleGameComplete} />;
      case 'fruit-catch':
        return <FruitCatcher onGameComplete={handleGameComplete} />;
      case 'sentence-builder':
        return <SentenceBuilder onGameComplete={handleGameComplete} />;
      case 'sign-reader':
        return <SignReader onGameComplete={handleGameComplete} />;
      case 'shop-keeper':
        return <ShopKeeper onGameComplete={handleGameComplete} />;
      case 'word-sprint':
        return <WordSprint onGameComplete={handleGameComplete} />;
      case 'echo-chamber':
        return <EchoChamber onGameComplete={handleGameComplete} />;
      case 'text-detective':
        return <TextDetective onGameComplete={handleGameComplete} />;
      
      // Render new interactive sandbox games directly
      case 'pic-bingo':
      case 'memory-flip':
      case 'crossword-clue':
      case 'tense-shift':
      case 'dialogue-puzzler':
      case 'speed-editor':
      case 'debate-builder':
      case 'idiom-connect':
        return <NewMiniGames gameType={gameType} onGameComplete={handleGameComplete} />;

      default:
        return <div className="game-placeholder">Unknown Game Sandbox</div>;
    }
  };

  // TraceMaster has its own full-page layout — render it directly without wrapper
  if (gameType === 'trace-letters') {
    return <TraceMaster onGameComplete={handleGameComplete} />;
  }

  return (
    <div className="activity-container bg-default">
      <header className="activity-header">
        <button className="icon-btn" onClick={() => navigate('/games')}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ textTransform: 'capitalize', fontWeight: 800 }}>
          {pageTitle}
        </h2>
        <div style={{ width: 24 }}></div>
      </header>

      <main className="activity-main" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        {sessionScore !== null ? (
          <div 
            style={{ 
              background: 'white', 
              borderRadius: '24px', 
              padding: '3rem', 
              textAlign: 'center', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
              border: '1px solid #e2e8f0',
              maxWidth: '440px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <Trophy size={64} color="#eab308" style={{ margin: '0 auto 1.5rem auto' }} />
            <h2 style={{ fontSize: '1.8rem', color: '#1e293b', margin: '0 0 0.5rem 0', fontWeight: 800 }}>{loc.wellPlayed}</h2>
            <p style={{ color: '#64748b', margin: '0 0 2rem 0' }}>{loc.syncMsg}</p>
            
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-around', marginBottom: '2rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', fontWeight: 700 }}>{loc.score}</span>
                <span style={{ fontSize: '1.6rem', color: '#2b58ff', fontWeight: 900 }}>{sessionScore}</span>
              </div>
              <div style={{ borderLeft: '1px solid #e2e8f0' }} />
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', fontWeight: 700 }}>{loc.coins}</span>
                <span style={{ fontSize: '1.6rem', color: '#10b981', fontWeight: 900 }}>+{Math.round(sessionScore / 5)}</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/games')} 
              style={{ width: '100%', background: '#2b58ff', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
            >
              {loc.backBtn}
            </button>
          </div>
        ) : (
          renderGame()
        )}
      </main>
    </div>
  );
};

export default ActivityEngine;
