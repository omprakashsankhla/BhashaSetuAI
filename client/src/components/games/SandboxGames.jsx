import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Trophy, Play, CheckCircle2, RotateCcw, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import '../../pages/ActivityEngine.css';
import { speakText as ttsSpeak, LANG_REC_MAP } from '../../utils/ttsHelper';
import { API_BASE_URL } from '../../config/api';
import { BINGO_ITEMS, MEMORY_PAIRS, CROSSWORD_CLUES, TENSE_PAIRS, DIALOGUE_SETS, SPEED_EDITOR_SETS, DEBATE_CARDS, IDIOM_PAIRS } from '../../data/games/sandboxData';

// ─── 8 NEW MINI-GAMES INTERACTIVE SANDBOX// Translation Constants
const HEADERS = {
  hi: { present: 'वर्तमान', past: 'भूतकाल' },
  en: { present: 'Present', past: 'Past' },
  bn: { present: 'বর্তমান', past: 'অতীত' },
  mr: { present: 'वर्तमान', past: 'भूतकाळ' },
  mwr: { present: 'वर्तमान', past: 'भूतकाळ' },
  ta: { present: 'நிகழ்காலம்', past: 'இறந்தகாலம்' },
  te: { present: 'వర్తమాన కాలం', past: 'భూతకాలం' },
  ur: { present: 'حال', past: 'ماضی' }
};

const DIALOGUE_SUBTITLE = {
  hi: "क्रमवार संवाद को व्यवस्थित करने के लिए लाइनों पर सही क्रम में क्लिक करें।",
  en: "Click the lines in the correct order to arrange the sequential dialogue.",
  bn: "ক্রমানুসারে কথোপকথন সাজানোর জন্য লাইনগুলিতে সঠিক ক্রমে ক্লিক করুন।",
  mr: "क्रमवार संवाद व्यवस्थित करण्यासाठी ओळींवर योग्य क्रमाने क्लिक करा.",
  mwr: "क्रमवार संवाद व्यवस्थित करण्यासाठी ओळींवर योग्य क्रमाने क्लिक करा.",
  ta: "வரிசையான உரையாடலை ஒழுங்கமைக்க சரியான வரிசையில் வரிகளைக் கிளிக் செய்யவும்.",
  te: "క్రమ పద్ధతిలో సంభాషణను అమర్చడానికి సరైన వరుసలో లైన్లపై క్లిక్ చేయండి.",
  ur: "ترتیب وار مکالمے کو ترتیب دینے کے لیے صحیح ترتیب میں لائنوں پر کلک کریں۔"
};

// 1. Picture Bingo Game
const PicBingoGame = ({ currentLang, speak, onGameComplete }) => {
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
};

// 2. Memory Card Flip Game
const MemoryFlipGame = ({ onGameComplete }) => {
  const CARDS = [
    { id: 1, word: '🍎', match: 'apple' }, { id: 2, word: 'apple', match: 'apple' },
    { id: 3, word: '🚗', match: 'car' }, { id: 4, word: 'car', match: 'car' },
    { id: 5, word: '🏠', match: 'house' }, { id: 6, word: 'house', match: 'house' },
    { id: 7, word: '🏥', match: 'hospital' }, { id: 8, word: 'hospital', match: 'hospital' },
    { id: 9, word: '📖', match: 'book' }, { id: 10, word: 'book', match: 'book' },
    { id: 11, word: '🏫', match: 'school' }, { id: 12, word: 'school', match: 'school' }
  ];
  const [deck] = useState(() => [...CARDS].sort(() => Math.random() - 0.5));
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
};

// 3. Clue Crossword Puzzle Game
const CrosswordClueGame = ({ currentLang, onGameComplete }) => {
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
};

// 4. Tense Shift Connector Game
const TenseShiftGame = ({ currentLang, interfaceLang, onGameComplete }) => {
  const sourcePairs = TENSE_PAIRS[currentLang] || TENSE_PAIRS['hi'];
  
  const [round, setRound] = useState(1);
  const [currentPairs, setCurrentPairs] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [selectedPr, setSelectedPr] = useState(null);
  const [solved, setSolved] = useState([]);
  const [isRoundComplete, setIsRoundComplete] = useState(false);

  const HEADERS = {
    hi: { present: 'वर्तमान', past: 'भूतकाल' },
    en: { present: 'Present', past: 'Past' },
    bn: { present: 'বর্তমান', past: 'অতীত' },
    mr: { present: 'वर्तमान', past: 'भूतकाळ' },
    mwr: { present: 'वर्तमान', past: 'भूतकाळ' },
    ta: { present: 'நிகழ்காலம்', past: 'இறந்தகாலம்' },
    te: { present: 'వర్తమాన కాలం', past: 'భూతకాలం' },
    ur: { present: 'حال', past: 'ماضی' }
  };
  const tText = HEADERS[interfaceLang] || HEADERS['en'];

  useEffect(() => {
    const shuffled = [...sourcePairs].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5).map(p => ({
      pr: p.v,
      pa: p.t
    }));
    setCurrentPairs(selected);
    const shuffledPast = selected.map(p => p.pa).sort(() => Math.random() - 0.5);
    setRightItems(shuffledPast);
    setSolved([]);
    setSelectedPr(null);
    setIsRoundComplete(false);
  }, [round, sourcePairs]);

  const handleConnect = (paVal) => {
    if (!selectedPr) return;
    const match = currentPairs.find(p => p.pr === selectedPr && p.pa === paVal);
    if (match) {
      const nextSolved = [...solved, selectedPr];
      setSolved(nextSolved);
      setSelectedPr(null);
      if (nextSolved.length === 5) {
        setIsRoundComplete(true);
      }
    } else {
      setSelectedPr(null);
    }
  };

  return (
    <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', maxWidth: '500px', width: '100%' }}>
      <h3 style={{ margin: '0 0 0.5rem 0' }}>⏳ Tense Shift Connect ({round}/5)</h3>
      <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.5rem', fontWeight: 600 }}>
        {interfaceLang === 'hi' ? "वर्तमान काल के क्रिया रूपों को उनके सही भूतकाल/भविष्यकाल रूपों से जोड़ें।" : "Connect verb forms to their correct past/future tense forms."}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
        <div>
          <h4 style={{ margin: '0 0 0.8rem 0', color: '#64748b' }}>{tText.present}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {currentPairs.map(p => (
              <button key={p.pr} disabled={solved.includes(p.pr) || isRoundComplete} onClick={() => setSelectedPr(p.pr)} style={{ padding: '0.8rem', borderRadius: '12px', border: `2px solid ${selectedPr === p.pr ? '#2b58ff' : '#cbd5e1'}`, background: solved.includes(p.pr) ? '#ecfdf5' : selectedPr === p.pr ? '#eff6ff' : 'white', cursor: solved.includes(p.pr) || isRoundComplete ? 'default' : 'pointer', fontWeight: 700, transition: 'all 0.15s' }}>
                {p.pr} {solved.includes(p.pr) && '✓'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h4 style={{ margin: '0 0 0.8rem 0', color: '#64748b' }}>{tText.past}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {rightItems.map(paVal => {
              const corrPres = currentPairs.find(p => p.pa === paVal)?.pr;
              const isSolved = solved.includes(corrPres);

              return (
                <button key={paVal} disabled={isSolved || isRoundComplete} onClick={() => handleConnect(paVal)} style={{ padding: '0.8rem', borderRadius: '12px', border: `2px solid ${selectedPr && !isSolved ? '#3b82f6' : '#cbd5e1'}`, background: isSolved ? '#ecfdf5' : 'white', cursor: isSolved || isRoundComplete ? 'default' : 'pointer', fontWeight: 700, transition: 'all 0.15s' }}>
                  {paVal} {isSolved && '✓'}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {isRoundComplete && (
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s' }}>
          {round < 5 ? (
            <button onClick={() => setRound(r => r + 1)} style={{ background: '#2b58ff', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 6px rgba(43,88,255,0.2)' }}>
              Continue to Next Task →
            </button>
          ) : (
            <button onClick={() => onGameComplete(100)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 6px rgba(16,185,129,0.2)' }}>
              Complete Game 🎉
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// 5. Dialogue Puzzler Game
const DialoguePuzzlerGame = ({ currentLang, interfaceLang, onGameComplete }) => {
  const [round, setRound] = useState(1);
  const [scrambled, setScrambled] = useState([]);
  const [selectedIdxs, setSelectedIdxs] = useState([]);
  const [isRoundComplete, setIsRoundComplete] = useState(false);

  const DIALOGUE_SUBTITLE = {
    hi: "क्रमवार संवाद को व्यवस्थित करने के लिए लाइनों पर सही क्रम में क्लिक करें।",
    en: "Click the lines in the correct order to arrange the sequential dialogue.",
    bn: "ক্রমানুসারে কথোপকথন সাজানোর জন্য লাইনগুলিতে সঠিক ক্রমে ক্লিক করুন।",
    mr: "क्रमवार संवाद व्यवस्थित करण्यासाठी ओळींवर योग्य क्रमाने क्लिक करा.",
    mwr: "क्रमवार संवाद व्यवस्थित करण्यासाठी ओळींवर योग्य क्रमाने क्लिक करा.",
    ta: "வரிசையான உரையாடலை ஒழுங்கமைக்க সঠিক வரிசையில் வரிகளைக் கிளிக் செய்யவும்.",
    te: "క్రమ పద్ధతిలో సంభాషణను అమర్చడానికి సరైన వరుసలో లైన్లపై క్లిక్ చేయండి.",
    ur: "ترتیب وار مکالمے کو ترتیب دینے کے لیے صحیح ترتیب میں لائنوں پر کلک کریں۔"
  };

  const sourceLines = (DIALOGUE_SETS[currentLang] && DIALOGUE_SETS[currentLang][round - 1]) || 
                      (DIALOGUE_SETS['hi'] && DIALOGUE_SETS['hi'][round - 1]) || 
                      [];
  const LINES = sourceLines.map(line => ({
    id: line.o,
    text: line.t
  }));

  useEffect(() => {
    setScrambled([...LINES].sort(() => Math.random() - 0.5));
    setSelectedIdxs([]);
    setIsRoundComplete(false);
  }, [round, sourceLines]);

  const handleSelectLine = (idx) => {
    if (isRoundComplete) return;
    const nextSel = [...selectedIdxs, idx];
    setSelectedIdxs(nextSel);
    if (nextSel.length === scrambled.length) {
      const sortedIds = nextSel.map(i => scrambled[i].id);
      const correct = sortedIds.every((id, idx) => id === idx + 1);
      if (correct) {
        setIsRoundComplete(true);
      } else {
        setSelectedIdxs([]); // reset on failure
      }
    }
  };

  return (
    <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', maxWidth: '500px', width: '100%' }}>
      <h3 style={{ margin: '0 0 0.5rem 0' }}>💬 Dialogue Puzzler ({round}/5)</h3>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 600 }}>{DIALOGUE_SUBTITLE[interfaceLang] || DIALOGUE_SUBTITLE['en']}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
        {scrambled.map((line, idx) => {
          const clickOrder = selectedIdxs.indexOf(idx) + 1;
          return (
            <button key={idx} disabled={isRoundComplete} onClick={() => handleSelectLine(idx)} style={{ padding: '1rem', borderRadius: '12px', border: `2px solid ${clickOrder > 0 ? '#2b58ff' : '#cbd5e1'}`, background: clickOrder > 0 ? '#eff6ff' : 'white', textAlign: 'left', fontWeight: 600, fontSize: '0.98rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: isRoundComplete ? 'default' : 'pointer' }}>
              <span>{line.text}</span>
              {clickOrder > 0 && <span style={{ background: '#2b58ff', color: 'white', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.75rem', fontWeight: 900 }}>{clickOrder}</span>}
            </button>
          );
        })}
      </div>

      {isRoundComplete && (
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s' }}>
          {round < 5 ? (
            <button onClick={() => setRound(r => r + 1)} style={{ background: '#2b58ff', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 6px rgba(43,88,255,0.2)' }}>
              Continue to Next Task →
            </button>
          ) : (
            <button onClick={() => onGameComplete(100)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 6px rgba(16,185,129,0.2)' }}>
              Complete Game 🎉
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// 6. Editorial Speed Draft Game
const SpeedEditorGame = ({ currentLang, onGameComplete }) => {
  const sourceSets = SPEED_EDITOR_SETS[currentLang] || SPEED_EDITOR_SETS['hi'];
  
  const [CHALLENGES, setChallenges] = useState([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    let rawChallenges = [...sourceSets];
    while (rawChallenges.length < 10) {
      rawChallenges = [...rawChallenges, ...rawChallenges.map(x => ({ ...x }))];
    }
    const compiled = rawChallenges.slice(0, 10).map((item) => {
      const otherFixes = sourceSets.filter(x => x.fix !== item.fix).map(x => x.fix);
      const shuffledOthers = [...otherFixes].sort(() => Math.random() - 0.5);
      const options = [item.fix, shuffledOthers[0], shuffledOthers[1]].sort(() => Math.random() - 0.5);
      
      let textPrefix = "Correct this: ";
      if (currentLang === 'hi' || currentLang === 'mwr' || currentLang === 'mr') {
        textPrefix = "इसे सही करें: ";
      } else if (currentLang === 'ta') {
        textPrefix = "இதை சரிசெய்யவும்: ";
      } else if (currentLang === 'te') {
        textPrefix = "దీనిని సరిచేయండి: ";
      } else if (currentLang === 'ur') {
        textPrefix = "इसे सही करें: ";
      } else if (currentLang === 'bn') {
        textPrefix = "এটি সংশোধন করুন: ";
      }
      
      return {
        text: `${textPrefix}"${item.err}"`,
        options,
        answer: item.fix
      };
    });
    setChallenges(compiled);
    setIdx(0);
  }, [sourceSets, currentLang]);

  const handleSelectOption = (opt) => {
    if (opt === CHALLENGES[idx].answer) {
      if (idx < 9) {
        setIdx(idx + 1);
      } else {
        onGameComplete(120);
      }
    }
  };

  if (CHALLENGES.length === 0) return null;

  return (
    <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', maxWidth: '480px', width: '100%' }}>
      <h3 style={{ margin: '0 0 1.2rem 0' }}>✍️ Editorial Speed Draft ({idx + 1}/10)</h3>
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
};

// 7. Debate Argument Builder Game
const DebateBuilderGame = ({ currentLang, interfaceLang, onGameComplete }) => {
  const [round, setRound] = useState(1);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [correctSelected, setCorrectSelected] = useState(false);

  const DEBATE_SUBTITLE = {
    hi: "डिबेट जीतने के लिए सबसे तार्किक और प्रामाणिक तर्क पत्र (Argument Card) चुनें।",
    en: "Select the most logical and authentic argument card to win the debate.",
    bn: "বিতর্ক জেতার জন্য সবচেয়ে যুক্তিসঙ্গত এবং খাঁটি যুক্তিカード নির্বাচন করুন।",
    mr: "वादविवाद जिंकण्यासाठी सर्वात तार्किक आणि अस्सल युक्तिवाद कार्ड निवडा.",
    mwr: "वादविवाद जिंकण्यासाठी सर्वात तार्किक आणि अस्سل युक्तिवाद कार्ड निवडा.",
    ta: "விவாதத்தில் வெற்றி பெற மிகவும் தர்க்கரீதியான மற்றும் உண்மையான வாத அட்டையைத் தேர்ந்தெடுக்கவும்.",
    te: "చర్చలో గెలవడానికి అత్యంత తార్కిక మరియు ప్రామాణికమైన వాదన కార్డును ఎంచుకోండి.",
    ur: "بحث جیتنے کے لیے سب سے زیادہ منطقی اور مستند دلیل کارڈ منتخب کریں۔"
  };

  const sourceCardsAll = DEBATE_CARDS[currentLang] || DEBATE_CARDS['hi'];
  const currentRoundCards = sourceCardsAll[round - 1] || sourceCardsAll[0] || [];

  const handleCardClick = (card) => {
    if (correctSelected) return; // Must proceed to next round
    setSelectedCardId(card.id);
    if (card.valid) {
      setCorrectSelected(true);
    }
  };

  const handleNextRound = () => {
    if (round < 8) {
      setRound(round + 1);
      setSelectedCardId(null);
      setCorrectSelected(false);
    } else {
      onGameComplete(120);
    }
  };

  let titlePrefix = "Argument";
  if (currentLang === 'hi' || currentLang === 'mwr' || currentLang === 'mr') {
    titlePrefix = "तर्क";
  } else if (currentLang === 'ta') {
    titlePrefix = "வாதம்";
  } else if (currentLang === 'te') {
    titlePrefix = "వాదన";
  } else if (currentLang === 'ur') {
    titlePrefix = "دلیل";
  } else if (currentLang === 'bn') {
    titlePrefix = "যুক্তি";
  }

  const nextBtnText = {
    hi: "अगले स्तर पर जाएं",
    en: "Continue to Next Task",
    bn: "পরবর্তী স্তরে যান",
    mr: "पुढील स्तरावर जा",
    mwr: "पुढील स्तरावर जा",
    ta: "அடுத்த நிலைக்குச் செல்லவும்",
    te: "తదుపరి స్థాయికి కొనసాగండి",
    ur: "اگلے مرحلے پر جائیں"
  };

  const levelText = {
    hi: `स्तर ${round} / 10`,
    en: `Level ${round} of 10`,
    bn: `स्तर ${round} / 10`,
    mr: `स्तर ${round} / १०`,
    mwr: `स्तर ${round} / १०`,
    ta: `நிலை ${round} / 10`,
    te: `స్థాయి ${round} / 10`,
    ur: `لیول ${round} / 10`
  };

  return (
    <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', maxWidth: '500px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
        <h3 style={{ margin: 0 }}>🗣️ Debate Argument Builder</h3>
        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#2b58ff', background: '#eff6ff', padding: '0.3rem 0.8rem', borderRadius: '20px' }}>
          {levelText[interfaceLang] || levelText['en']}
        </span>
      </div>
      
      {/* Progress Bar */}
      <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div style={{ width: `${(round / 10) * 100}%`, height: '100%', background: '#2b58ff', transition: 'width 0.3s ease' }} />
      </div>

      <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '1.8rem', fontWeight: 600 }}>
        {DEBATE_SUBTITLE[interfaceLang] || DEBATE_SUBTITLE['en']}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {currentRoundCards.map((card, i) => {
          const isSelected = selectedCardId === card.id;
          const isValid = card.valid;
          
          let cardBg = 'white';
          let cardBorder = '#cbd5e1';
          let titleColor = '#2b58ff';
          
          if (isSelected) {
            if (isValid) {
              cardBg = '#ecfdf5';
              cardBorder = '#10b981';
              titleColor = '#047857';
            } else {
              cardBg = '#fef2f2';
              cardBorder = '#ef4444';
              titleColor = '#b91c1c';
            }
          } else if (correctSelected && isValid) {
            cardBg = '#ecfdf5';
            cardBorder = '#10b981';
            titleColor = '#047857';
          }

          return (
            <button 
              key={card.id} 
              onClick={() => handleCardClick(card)} 
              disabled={correctSelected && !isSelected}
              style={{ 
                padding: '1.2rem', 
                borderRadius: '16px', 
                border: `2px solid ${cardBorder}`, 
                background: cardBg, 
                textAlign: 'left', 
                cursor: (correctSelected && !isSelected) ? 'not-allowed' : 'pointer', 
                transition: 'all 0.2s',
                transform: isSelected ? 'scale(1.01)' : 'none',
                opacity: (correctSelected && !isSelected && !isValid) ? 0.6 : 1
              }}
            >
              <h4 style={{ margin: '0 0 0.4rem 0', color: titleColor, fontWeight: 800 }}>
                {titlePrefix} {i + 1} {isSelected && (isValid ? '✓' : '✗')}
              </h4>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>
                {card.text}
              </p>
            </button>
          );
        })}
      </div>

      {/* Feedback Messages */}
      {selectedCardId && (
        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          borderRadius: '12px', 
          background: correctSelected ? '#ecfdf5' : '#fef2f2', 
          border: `1px solid ${correctSelected ? '#a7f3d0' : '#fca5a5'}`,
          color: correctSelected ? '#065f46' : '#991b1b',
          fontSize: '0.9rem',
          fontWeight: 700,
          textAlign: 'center'
        }}>
          {correctSelected 
            ? (interfaceLang === 'hi' ? "सटीक तर्क! यह एक मजबूत और तार्किक तर्क है।" : "Excellent point! That is a strong and logical argument.")
            : (interfaceLang === 'hi' ? "अमान्य तर्क। कृपया दोबारा प्रयास करें।" : "Invalid argument. Try to find the Pro position.")
          }
        </div>
      )}

      {/* Continue Button */}
      {correctSelected && (
        <button 
          onClick={handleNextRound}
          style={{
            marginTop: '1.8rem',
            width: '100%',
            padding: '1rem',
            borderRadius: '16px',
            border: 'none',
            background: '#2b58ff',
            color: 'white',
            fontWeight: 800,
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(43, 88, 255, 0.25)',
            transition: 'all 0.2s',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#1a44e5'}
          onMouseOut={(e) => e.currentTarget.style.background = '#2b58ff'}
        >
          {nextBtnText[interfaceLang] || nextBtnText['en']} &rarr;
        </button>
      )}
    </div>
  );
};

// 8. Idiom Connect Game
const IdiomConnectGame = ({ currentLang, interfaceLang, onGameComplete }) => {
  const [idiomRound, setIdiomRound] = useState(1);
  const [selIdm, setSelIdm] = useState(null);
  const [solved, setSolved] = useState([]);
  const [roundComplete, setRoundComplete] = useState(false);

  const sourcePairs = IDIOM_PAIRS[currentLang] || IDIOM_PAIRS['hi'];
  const PAIRS = sourcePairs.slice((idiomRound - 1) * 5, idiomRound * 5);

  const handleConnect = (val) => {
    if (!selIdm) return;
    const match = PAIRS.find(p => p.idm === selIdm && p.val === val);
    if (match) {
      const newSolved = [...solved, selIdm];
      setSolved(newSolved);
      setSelIdm(null);
      if (newSolved.length === 5) {
        setRoundComplete(true);
      }
    } else {
      setSelIdm(null);
    }
  };

  const handleNextIdiomRound = () => {
    if (idiomRound < 2) {
      setIdiomRound(2);
      setSolved([]);
      setSelIdm(null);
      setRoundComplete(false);
    } else {
      onGameComplete(100);
    }
  };

  const IDIOM_HEADER = {
    hi: "मुहावरा (Idiom)",
    en: "Idiom",
    bn: "বাগধারা (Idiom)",
    mr: "वाक्प्रचार (Idiom)",
    mwr: "मुहावरा (Idiom)",
    ta: "மரபுத்தொடர் (Idiom)",
    te: "జాతీయం (Idiom)",
    ur: "محاورہ (Idiom)"
  };

  const MEANING_HEADER = {
    hi: "अर्थ (Meaning)",
    en: "Meaning",
    bn: "অর্থ (Meaning)",
    mr: "अर्थ (Meaning)",
    mwr: "अर्थ (Meaning)",
    ta: "பொருள் (Meaning)",
    te: "అర్థం (Meaning)",
    ur: "معنی (Meaning)"
  };

  const nextBtnText = {
    hi: "अगले स्तर पर जाएं",
    en: "Continue to Next Task",
    bn: "পরবর্তী স্তরে যান",
    mr: "पुढील स्तरावर जा",
    mwr: "पुढील स्तरावर जा",
    ta: "அடுத்த நிலைக்குச் செல்லவும்",
    te: "తదుపరి స్థాయికి కొనసాగండి",
    ur: "اگلے مرحلے پر جائیں"
  };

  const idiomLevelText = {
    hi: `दौर ${idiomRound} / 2`,
    en: `Round ${idiomRound} of 2`,
    bn: `রাউন্ড ${idiomRound} / ২`,
    mr: `फेरी ${idiomRound} / २`,
    mwr: `फेरी ${idiomRound} / २`,
    ta: `சுற்று ${idiomRound} / 2`,
    te: `రౌండ్ ${idiomRound} / 2`,
    ur: `راؤنڈ ${idiomRound} / 2`
  };

  return (
    <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', maxWidth: '520px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
        <h3 style={{ margin: 0 }}>🔗 Idiom Connect</h3>
        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#2b58ff', background: '#eff6ff', padding: '0.3rem 0.8rem', borderRadius: '20px' }}>
          {idiomLevelText[interfaceLang] || idiomLevelText['en']}
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div style={{ width: `${(idiomRound / 2) * 100}%`, height: '100%', background: '#2b58ff', transition: 'width 0.3s ease' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <h4 style={{ margin: '0 0 0.8rem 0', color: '#64748b' }}>{IDIOM_HEADER[interfaceLang] || IDIOM_HEADER['en']}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {PAIRS.map(p => (
              <button key={p.idm} disabled={solved.includes(p.idm) || roundComplete} onClick={() => setSelIdm(p.idm)} style={{ padding: '0.8rem', borderRadius: '12px', border: `2px solid ${selIdm === p.idm ? '#2b58ff' : '#cbd5e1'}`, background: solved.includes(p.idm) ? '#ecfdf5' : selIdm === p.idm ? '#eff6ff' : 'white', cursor: (solved.includes(p.idm) || roundComplete) ? 'default' : 'pointer', fontWeight: 700, fontSize: '0.92rem', width: '100%' }}>
                {p.idm} {solved.includes(p.idm) && '✓'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h4 style={{ margin: '0 0 0.8rem 0', color: '#64748b' }}>{MEANING_HEADER[interfaceLang] || MEANING_HEADER['en']}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {PAIRS.map(p => (
              <button key={p.val} disabled={solved.includes(p.idm) || roundComplete} onClick={() => handleConnect(p.val)} style={{ padding: '0.8rem', borderRadius: '12px', border: '2px solid #cbd5e1', background: solved.includes(p.idm) ? '#ecfdf5' : 'white', cursor: (solved.includes(p.idm) || roundComplete) ? 'default' : 'pointer', fontWeight: 700, fontSize: '0.88rem', width: '100%' }}>
                {p.val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {roundComplete && (
        <button 
          onClick={handleNextIdiomRound}
          style={{
            marginTop: '1.8rem',
            width: '100%',
            padding: '1rem',
            borderRadius: '16px',
            border: 'none',
            background: '#2b58ff',
            color: 'white',
            fontWeight: 800,
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(43, 88, 255, 0.25)',
            transition: 'all 0.2s',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#1a44e5'}
          onMouseOut={(e) => e.currentTarget.style.background = '#2b58ff'}
        >
          {nextBtnText[interfaceLang] || nextBtnText['en']} &rarr;
        </button>
      )}
    </div>
  );
};

// Main Sandbox Router Component
const NewMiniGames = ({ gameType, onGameComplete }) => {
  const { i18n } = useTranslation();
  let currentLang = 'hi';
  let interfaceLang = 'en';
  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    currentLang = storedUser.learning_language || 'hi';
    interfaceLang = storedUser.interface_language || i18n.language || 'en';
  } catch (e) {}

  const speak = (text) => {
    ttsSpeak(text, { lang: currentLang, rate: 0.85 });
  };

  switch (gameType) {
    case 'pic-bingo':
      return <PicBingoGame currentLang={currentLang} speak={speak} onGameComplete={onGameComplete} />;
    case 'memory-flip':
      return <MemoryFlipGame onGameComplete={onGameComplete} />;
    case 'crossword-clue':
      return <CrosswordClueGame currentLang={currentLang} onGameComplete={onGameComplete} />;
    case 'tense-shift':
      return <TenseShiftGame currentLang={currentLang} interfaceLang={interfaceLang} onGameComplete={onGameComplete} />;
    case 'dialogue-puzzler':
      return <DialoguePuzzlerGame currentLang={currentLang} interfaceLang={interfaceLang} onGameComplete={onGameComplete} />;
    case 'speed-editor':
      return <SpeedEditorGame currentLang={currentLang} onGameComplete={onGameComplete} />;
    case 'debate-builder':
      return <DebateBuilderGame currentLang={currentLang} interfaceLang={interfaceLang} onGameComplete={onGameComplete} />;
    case 'idiom-connect':
      return <IdiomConnectGame currentLang={currentLang} interfaceLang={interfaceLang} onGameComplete={onGameComplete} />;
    default:
      return <div className="game-placeholder">Unknown Game Sandbox</div>;
  }
};

export default NewMiniGames;