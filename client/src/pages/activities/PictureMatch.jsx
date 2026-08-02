import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  Star, 
  Trophy, 
  RotateCcw, 
  Volume2, 
  Sparkles, 
  Brain, 
  Clock, 
  BookmarkCheck, 
  Eye, 
  TrendingUp,
  Award
} from 'lucide-react';
import { speakText as ttsSpeak, LANG_REC_MAP } from '../../utils/ttsHelper';
import './PictureMatch.css';
import { API_BASE_URL } from '../../config/api';

// Premium Emoji Dictionary mapping vocabulary English keys (lowercased) to illustrations
const EMOJI_MAP = {
  cat: '🐱',
  dog: '🐶',
  cow: '🐮',
  elephant: '🐘',
  bird: '🐦',
  fish: '🐟',
  horse: '🐴',
  lion: '🦁',
  water: '🥤',
  bread: '🍞',
  milk: '🥛',
  rice: '🍚',
  apple: '🍎',
  banana: '🍌',
  tea: '☕',
  fruit: '🧺',
  red: '🔴',
  blue: '🔵',
  green: '🟢',
  yellow: '🟡',
  black: '⚫',
  white: '⚪',
  book: '📖',
  pen: '✏️',
  table: '🪵',
  chair: '🪑',
  phone: '📱',
  house: '🏠',
  door: '🚪',
  key: '🔑'
};

// Multilingual vocabulary data mapping to enforce single-language matching
const LANG_VOCAB_MAP = {
  hi: {
    cat: "बिल्ली", dog: "कुत्ता", cow: "गाय", elephant: "हाथी", bird: "पक्षी", fish: "मछली", horse: "घोड़ा", lion: "शेर",
    water: "पानी", bread: "रोटी", milk: "दूध", rice: "चावल", apple: "सेब", banana: "केला", tea: "चाय", fruit: "फल",
    red: "लाल", blue: "नीला", green: "हरा", yellow: "पीला", black: "काला", white: "सफेद",
    book: "किताब", pen: "कलम", table: "मेज़", chair: "कुर्सी", phone: "फोन", house: "घर", door: "दरवाज़ा", key: "चाबी"
  },
  ur: {
    cat: "بلی", dog: "کتا", cow: "گائے", elephant: "ہاتھی", bird: "پرندہ", fish: "مچھلی", horse: "گھوڑا", lion: "شیر",
    water: "پانی", bread: "روٹی", milk: "دودھ", rice: "چاول", apple: "سیب", banana: "کیلا", tea: "چائے", fruit: "پھل",
    red: "سرخ", blue: "نیلا", green: "سبز", yellow: "پیلا", black: "کالا", white: "سفید",
    book: "کتاب", pen: "قلم", table: "میز", chair: "کرسی", phone: "فون", house: "گھر", door: "دروازہ", key: "چابی"
  },
  mwr: {
    cat: "मिनी", dog: "कूतरो", cow: "गाळ", elephant: "हाथी", bird: "पंखी", fish: "माछली", horse: "घौड़ो", lion: "शेर",
    water: "पाणी", bread: "सोगरी", milk: "दूध", rice: "चोखा", apple: "सेब", banana: "केळो", tea: "चाह", fruit: "फल",
    red: "रातो", blue: "लीलो", green: "हरी", yellow: "पीळो", black: "काळो", white: "धोळो",
    book: "पोथी", pen: "कलम", table: "मेज", chair: "खाट", phone: "फोन", house: "घर", door: "किवाड़", key: "कूंची"
  },
  ta: {
    cat: "பூனை", dog: "நாய்", cow: "பசு", elephant: "யானை", bird: "பறவை", fish: "மீன்", horse: "குதிரை", lion: "சிங்கம்",
    water: "தண்ணீர்", bread: "ரொட்டி", milk: "பாலா", rice: "அரிசி", apple: "ஆப்பிள்", banana: "வாழைப்பழம்", tea: "தேநீர்", fruit: "பழம்",
    red: "சிவப்பு", blue: "நீலம்", green: "பச்சை", yellow: "மஞ்சள்", black: "கருப்பு", white: "வெள்ளை",
    book: "புத்தகம்", pen: "பேனா", table: "மேஜை", chair: "நாற்காலி", phone: "தொலைபேசி", house: "வீடு", door: "கதவு", key: "சாவி"
  },
  te: {
    cat: "పిల్లి", dog: "కుక్క", cow: "ఆవు", elephant: "ఏనుగు", bird: "పక్షి", fish: "చేప", horse: "గుర్రం", lion: "సింహం",
    water: "నీరు", bread: "రొట్టె", milk: "పాలు", rice: "బియ్యం", apple: "ఆపిల్", banana: "అరటిపండు", tea: "టీ", fruit: "పండు",
    red: "ఎరుపు", blue: "నీలం", green: "ఆకుపచ్చ", yellow: "పసుపు", black: "నలుపు", white: "తెలుపు",
    book: "పుస్తకం", pen: "కలము", table: "బల్ల", chair: "కుర్చీ", phone: "ఫోన్", house: "ఇల్లు", door: "తలుపు", key: "తాళంచెవి"
  },
  bn: {
    cat: "বিড়াল", dog: "কুকুর", cow: "গরু", elephant: "হাতি", bird: "পাখি", fish: "মাছ", horse: "ঘোড়া", lion: "সিংহ",
    water: "জল", bread: "রুটি", milk: "দুধ", rice: "চাল", apple: "আপেল", banana: "কলা", tea: "চা", fruit: "ফল",
    red: "লাল", blue: "নীল", green: "সবুজ", yellow: "হলুদ", black: "কালো", white: "সাদা",
    book: "বই", pen: "কলম", table: "টেবিল", chair: "চেয়ার", phone: "ফোন", house: "বাড়ি", door: "দরজা", key: "চাবি"
  },
  mr: {
    cat: "मांजर", dog: "कुत्रा", cow: "गाय", elephant: "हत्ती", bird: "पक्षी", fish: "मासा", horse: "घोडा", lion: "सिंह",
    water: "पाणी", bread: "भाकरी", milk: "दूध", rice: "तांदूळ", apple: "सफरचंद", banana: "केळे", tea: "चहा", fruit: "फळ",
    red: "लाल", blue: "निळा", green: "हिरवा", yellow: "पिवळा", black: "काळा", white: "पांढरा",
    book: "पुस्तक", pen: "पेन", table: "मेज", chair: "खुर्ची", phone: "फोन", house: "घर", door: "दार", key: "किल्ली"
  },
  en: {
    cat: "Cat", dog: "Dog", cow: "Cow", elephant: "Elephant", bird: "Bird", fish: "Fish", horse: "Horse", lion: "Lion",
    water: "Water", bread: "Bread", milk: "Milk", rice: "Rice", apple: "Apple", banana: "Banana", tea: "Tea", fruit: "Fruit",
    red: "Red", blue: "Blue", green: "Green", yellow: "Yellow", black: "Black", white: "White",
    book: "Book", pen: "Pen", table: "Table", chair: "Chair", phone: "Phone", house: "House", door: "Door", key: "Key"
  }
};



const PictureMatch = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Game Difficulty State
  const [difficulty, setDifficulty] = useState('Easy'); 

  // Game Board States
  const [targetCards, setTargetCards] = useState([]);
  const [englishCards, setEnglishCards] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null); 
  const [selectedEnglish, setSelectedEnglish] = useState(null); 
  
  // Flipped Memory Match states (Hard Mode)
  const [memoryCards, setMemoryCards] = useState([]); 
  const [firstFlippedIndex, setFirstFlippedIndex] = useState(null);
  const [secondFlippedIndex, setSecondFlippedIndex] = useState(null);
  
  // General Stats
  const [matchedPairs, setMatchedPairs] = useState([]); 
  const [wrongPair, setWrongPair] = useState(null); 
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [totalMatched, setTotalMatched] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [movesCount, setMovesCount] = useState(0);

  // Load API Bank
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/activities/picture-match?count=30`);
        if (res.ok) {
          const data = await res.json();
          setAllItems(data.items || []);
          const cats = ['All', ...new Set(data.items.map(i => i.category))];
          setCategories(cats);
        }
      } catch (err) {
        console.error('Failed to load picture match data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getEmoji = (item) => {
    const key = item.word_english.toLowerCase();
    return EMOJI_MAP[key] || '📦';
  };

  // Safe translator based on user selected language
  const getTranslatedWord = useCallback((item) => {
      let currentLang = 'hi';
  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    currentLang = storedUser.preferred_language || 'hi';
  } catch (e) {}
    const key = item.word_english.toLowerCase();
    const langDict = LANG_VOCAB_MAP[currentLang] || LANG_VOCAB_MAP['hi'];
    return langDict[key] || item.word_target;
  }, [i18n.language]);

  // Build standard setup round based on category & difficulty level
  const setupRound = useCallback((items, roundNum, diff) => {
    let pool = items;
    if (activeCategory !== 'All') {
      pool = items.filter(i => i.category === activeCategory);
    }
    // Fallback if not enough category items
    if (pool.length < 6) pool = items;

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    
    if (diff === 'Easy') {
      // 3 Pairs: Left is Emojis, Right is Words in selected language
      const selected = shuffled.slice(0, 3);
      setTargetCards(selected.map(i => ({ ...i, displayContent: getEmoji(i), type: 'emoji' })));
      setEnglishCards([...selected].sort(() => Math.random() - 0.5).map(i => ({ ...i, displayContent: getTranslatedWord(i), type: 'word' })));
    } else if (diff === 'Medium') {
      // 4 Pairs: Left is Emojis, Right is Words in selected language
      const selected = shuffled.slice(0, 4);
      setTargetCards(selected.map(i => ({ ...i, displayContent: getEmoji(i), type: 'emoji' })));
      setEnglishCards([...selected].sort(() => Math.random() - 0.5).map(i => ({ ...i, displayContent: getTranslatedWord(i), type: 'word' })));
    } else {
      // Hard Mode: 12 cards memory deck (6 pairs)
      // Each pair has one Picture card, one selected language word card
      const selected = shuffled.slice(0, 6);
      const pictureCards = selected.map(i => ({
        id: i.id,
        content: getEmoji(i),
        type: 'picture',
        isFlipped: false,
        isMatched: false,
        word: getTranslatedWord(i)
      }));
      const textCards = selected.map(i => ({
        id: i.id,
        content: getTranslatedWord(i),
        type: 'text',
        isFlipped: false,
        isMatched: false,
        word: getTranslatedWord(i)
      }));
      
      const combinedShuffled = [...pictureCards, ...textCards].sort(() => Math.random() - 0.5);
      setMemoryCards(combinedShuffled);
      setFirstFlippedIndex(null);
      setSecondFlippedIndex(null);
    }

    setSelectedTarget(null);
    setSelectedEnglish(null);
    setMatchedPairs([]);
    setWrongPair(null);
    setMovesCount(0);
  }, [activeCategory, getTranslatedWord]);

  useEffect(() => {
    if (allItems.length > 0) {
      setupRound(allItems, round, difficulty);
    }
  }, [allItems, activeCategory, setupRound, round, difficulty]);

  // Audio voice synthesis support
  const speakWord = (text) => {
    ttsSpeak(text, { rate: 0.85 });
  };

  // Easy / Medium MATCH logic
  useEffect(() => {
    if (selectedTarget !== null && selectedEnglish !== null) {
      const targetItem = targetCards[selectedTarget];
      const englishItem = englishCards[selectedEnglish];

      setMovesCount(prev => prev + 1);

      if (targetItem.id === englishItem.id) {
        // Successful match
        const newMatched = [...matchedPairs, targetItem.id];
        setMatchedPairs(newMatched);
        setScore(prev => prev + 15);
        setTotalMatched(prev => prev + 1);

        speakWord(getTranslatedWord(targetItem));

        setTimeout(() => {
          setSelectedTarget(null);
          setSelectedEnglish(null);

          const maxPairs = difficulty === 'Easy' ? 3 : 4;
          if (newMatched.length === maxPairs) {
            if (round >= 3) {
              setGameComplete(true);
            } else {
              setRound(prev => prev + 1);
            }
          }
        }, 800);
      } else {
        // Wrong match feedback
        setWrongPair({ target: selectedTarget, english: selectedEnglish });
        setTimeout(() => {
          setSelectedTarget(null);
          setSelectedEnglish(null);
          setWrongPair(null);
        }, 600);
      }
    }
  }, [selectedTarget, selectedEnglish, targetCards, englishCards, matchedPairs, round, difficulty, getTranslatedWord]);

  const handleTargetClick = (index) => {
    const item = targetCards[index];
    if (matchedPairs.includes(item.id)) return;
    setSelectedTarget(index);
  };

  const handleEnglishClick = (index) => {
    const item = englishCards[index];
    if (matchedPairs.includes(item.id)) return;
    if (selectedTarget === null) return; // Must select Left side item first
    setSelectedEnglish(index);
  };

  // Hard Mode Card-flip callback
  const handleMemoryCardClick = (index) => {
    // Check constraints
    if (memoryCards[index].isFlipped || memoryCards[index].isMatched) return;
    if (firstFlippedIndex !== null && secondFlippedIndex !== null) return;

    // Flip card
    const updatedCards = [...memoryCards];
    updatedCards[index].isFlipped = true;
    setMemoryCards(updatedCards);

    if (firstFlippedIndex === null) {
      setFirstFlippedIndex(index);
    } else {
      setSecondFlippedIndex(index);
      setMovesCount(prev => prev + 1);
      
      const firstCard = memoryCards[firstFlippedIndex];
      const secondCard = updatedCards[index];

      // Check matching
      if (firstCard.id === secondCard.id) {
        // Correct pair!
        setTimeout(() => {
          const matchedState = updatedCards.map((c, i) => {
            if (i === firstFlippedIndex || i === index) {
              return { ...c, isMatched: true };
            }
            return c;
          });
          setMemoryCards(matchedState);
          setFirstFlippedIndex(null);
          setSecondFlippedIndex(null);
          setScore(prev => prev + 25);
          setTotalMatched(prev => prev + 1);
          speakWord(firstCard.word);

          // Check if all memory cards matched (6 pairs total)
          const allComplete = matchedState.every(c => c.isMatched);
          if (allComplete) {
            if (round >= 3) {
              setGameComplete(true);
            } else {
              setRound(prev => prev + 1);
            }
          }
        }, 600);
      } else {
        // Errored Match — Flip back after delay
        setTimeout(() => {
          const resetState = updatedCards.map((c, i) => {
            if (i === firstFlippedIndex || i === index) {
              return { ...c, isFlipped: false };
            }
            return c;
          });
          setMemoryCards(resetState);
          setFirstFlippedIndex(null);
          setSecondFlippedIndex(null);
        }, 1000);
      }
    }
  };

  const handleRestart = () => {
    setScore(0);
    setRound(1);
    setTotalMatched(0);
    setGameComplete(false);
    setupRound(allItems, 1, difficulty);
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setScore(0);
    setRound(1);
    setTotalMatched(0);
    setGameComplete(false);
  };

  const handleDifficultyChange = (diff) => {
    setDifficulty(diff);
    setScore(0);
    setRound(1);
    setTotalMatched(0);
    setGameComplete(false);
  };

  // Rendering Loading
  if (loading) {
    return (
      <div className="pm-container">
        <div className="pm-loading">
          <div className="pm-spinner"></div>
          Loading picture matches...
        </div>
      </div>
    );
  }

  const maxRoundPairs = difficulty === 'Easy' ? 3 : difficulty === 'Medium' ? 4 : 6;
  const totalRoundsPossible = maxRoundPairs * 3;
  const percentage = Math.round((totalMatched / totalRoundsPossible) * 100);
  const progressPercent = ((totalMatched + matchedPairs.length) / totalRoundsPossible) * 100;

  return (
    <div className="pm-container" style={{ background: '#f8fafc', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div className="pm-header" style={{ padding: '1rem 1.5rem', background: 'white', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
        <button className="icon-btn" onClick={() => navigate('/activities')} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
          <ArrowLeft size={22} color="#475569" />
        </button>
        <div style={{ textAlign: 'center' }}>
          <span className="pm-header-title" style={{ display: 'block', fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
            🎨 Picture Match Labs
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Tap and connect matching words</span>
        </div>
        
        <div className="pm-header-right" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div className="pm-score-badge">
            <Star size={16} fill="#92400e" /> {score} pts
          </div>
          <div className="pm-round-badge" style={{ fontWeight: 800 }}>
            Round {round}/3
          </div>
        </div>
      </div>

      {/* Difficulty & Category Controllers */}
      <div style={{ background: 'white', padding: '0.5rem 1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', alignItems: 'center' }}>
        
        {/* Level selection */}
        <div style={{ display: 'inline-flex', gap: '0.3rem', background: '#f1f5f9', padding: '0.3rem', borderRadius: '12px' }}>
          {['Easy', 'Medium', 'Hard'].map(diff => (
            <button
              key={diff}
              onClick={() => handleDifficultyChange(diff)}
              style={{
                border: 'none',
                background: difficulty === diff ? 'white' : 'transparent',
                color: difficulty === diff ? '#2563eb' : '#64748b',
                padding: '0.4rem 1rem',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: difficulty === diff ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Categories Bar */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {categories.slice(0, 5).map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              style={{
                border: 'none',
                background: activeCategory === cat ? '#2563eb' : '#f1f5f9',
                color: activeCategory === cat ? 'white' : '#475569',
                padding: '0.4rem 0.9rem',
                borderRadius: '20px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Active Area of Game Complete */}
      {gameComplete ? (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
          <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', maxWidth: '420px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', animation: 'scaleUp 0.3s ease' }}>
            <Trophy size={64} color="#eab308" style={{ marginBottom: '1.2rem', marginInline: 'auto' }} />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.5rem 0' }}>Perfect Matcher!</h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', margin: '0 0 2rem 0', fontWeight: 500 }}>
              Completed all 3 rounds of <span style={{ color: '#2563eb', fontWeight: 700 }}>{difficulty} Mode</span> matching.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800 }}>Score</span>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '1.5rem', fontWeight: 900, color: '#2563eb' }}>{score}</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800 }}>Accuracy</span>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>{percentage}%</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button 
                onClick={handleRestart}
                style={{ flex: 1, background: '#2563eb', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
              >
                Replay Level
              </button>
              <button 
                onClick={() => navigate('/activities')}
                style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '0.8rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
              >
                Activities
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Active Game Arena */
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.5rem' }}>
          
          {difficulty !== 'Hard' ? (
            /* Easy & Medium Mode: Column Connection Style matching */
            <div style={{ display: 'flex', gap: '3rem', width: '100%', maxWidth: '640px', justifyContent: 'center' }}>
              
              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', textAlign: 'center', letterSpacing: '0.05em' }}>
                  Illustration
                </div>

                {targetCards.map((item, idx) => {
                  const isMatched = matchedPairs.includes(item.id);
                  const isSelected = selectedTarget === idx;
                  const isWrong = wrongPair && wrongPair.target === idx;

                  let cardStyle = {
                    background: 'white',
                    color: '#0f172a',
                    border: '2px solid #e2e8f0'
                  };

                  if (isMatched) {
                    cardStyle = { background: '#dcfce7', color: '#15803d', border: '2px solid #86efac' };
                  } else if (isSelected) {
                    cardStyle = { background: '#eff6ff', color: '#1d4ed8', border: '2px solid #93c5fd' };
                  } else if (isWrong) {
                    cardStyle = { background: '#fef2f2', color: '#991b1b', border: '2px solid #fca5a5' };
                  }

                  return (
                    <div
                      key={item.key}
                      onClick={() => handleTargetClick(idx)}
                      style={{
                        ...cardStyle,
                        padding: '1.2rem',
                        borderRadius: '16px',
                        fontWeight: 800,
                        fontSize: '2.5rem',
                        cursor: isMatched ? 'default' : 'pointer',
                        textAlign: 'center',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.25s',
                        userSelect: 'none',
                        opacity: isMatched ? 0.6 : 1
                      }}
                      className={isWrong ? 'matched-wrong' : ''}
                    >
                      {item.displayContent}
                    </div>
                  );
                })}
              </div>

              {/* Right Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', textAlign: 'center', letterSpacing: '0.05em' }}>
                  Vocabulary Word
                </div>

                {englishCards.map((item, idx) => {
                  const isMatched = matchedPairs.includes(item.id);
                  const isSelected = selectedEnglish === idx;
                  const isWrong = wrongPair && wrongPair.english === idx;

                  let cardStyle = {
                    background: 'white',
                    color: '#475569',
                    border: '2px solid #e2e8f0'
                  };

                  if (isMatched) {
                    cardStyle = { background: '#dcfce7', color: '#15803d', border: '2px solid #86efac' };
                  } else if (isSelected) {
                    cardStyle = { background: '#ecfdf5', color: '#047857', border: '2px solid #6ee7b7' };
                  } else if (isWrong) {
                    cardStyle = { background: '#fef2f2', color: '#991b1b', border: '2px solid #fca5a5' };
                  }

                  return (
                    <div
                      key={item.key}
                      onClick={() => handleEnglishClick(idx)}
                      style={{
                        ...cardStyle,
                        padding: '1.2rem',
                        borderRadius: '16px',
                        fontWeight: 800,
                        fontSize: '1.15rem',
                        cursor: isMatched ? 'default' : 'pointer',
                        textAlign: 'center',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.25s',
                        userSelect: 'none',
                        opacity: isMatched ? 0.6 : 1
                      }}
                      className={isWrong ? 'matched-wrong' : ''}
                    >
                      {item.displayContent}
                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            /* Hard Mode: 12 Flipped Memory matching grids */
            <div style={{ width: '100%', maxWidth: '600px' }}>
              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem 0', fontWeight: 600 }}>
                💡 Find cards with matching content (e.g. 🐟 matches word)
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.8rem' }}>
                {memoryCards.map((card, idx) => {
                  const showContent = card.isFlipped || card.isMatched;
                  
                  return (
                    <div
                      key={idx}
                      onClick={() => handleMemoryCardClick(idx)}
                      style={{
                        height: '110px',
                        background: card.isMatched 
                          ? '#dcfce7' 
                          : showContent 
                            ? 'white' 
                            : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: card.isMatched ? '#166534' : '#0f172a',
                        border: card.isMatched ? '2px solid #86efac' : '2px solid #e2e8f0',
                        borderRadius: '16px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontWeight: 800,
                        fontSize: card.type === 'picture' && showContent ? '2.5rem' : '1.15rem',
                        cursor: card.isMatched ? 'default' : 'pointer',
                        transform: showContent ? 'rotateY(0)' : 'rotateY(180deg)',
                        transition: 'transform 0.4s ease, background-color 0.3s',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        userSelect: 'none',
                        textAlign: 'center',
                        padding: '0.5rem'
                      }}
                    >
                      <div style={{ transform: showContent ? 'none' : 'rotateY(180deg)' }}>
                        {showContent ? card.content : '❓'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Progress Footer */}
      <div className="pm-footer" style={{ borderTop: '1px solid #e2e8f0', padding: '1rem 1.5rem', background: 'white' }}>
        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 800 }}>Moves: {movesCount}</span>
        
        <div className="pm-progress-track" style={{ height: '8px', background: '#f1f5f9', flex: 1, marginInline: '1rem', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            className="pm-progress-fill"
            style={{ width: `${progressPercent}%`, height: '100%', background: '#2563eb', transition: 'width 0.4s ease' }}
          ></div>
        </div>

        <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 800 }}>
          Progress: {Math.min(totalMatched + matchedPairs.length, totalRoundsPossible)}/{totalRoundsPossible}
        </span>
      </div>
      
    </div>
  );
};

export default PictureMatch;
