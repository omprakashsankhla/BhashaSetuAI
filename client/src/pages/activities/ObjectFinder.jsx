import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Star, Volume2, Trophy, RefreshCw, Compass, BookOpen } from 'lucide-react';
import { speakText as ttsSpeak } from '../../utils/ttsHelper';

const SCENE_CONFIGS = {
  kitchen: {
    icon: '🍳',
    emojis: { water: '🥤', apple: '🍎', book: '📖', chair: '🪑', phone: '📱' },
    positions: {
      water: { top: '25%', left: '15%' },
      apple: { top: '25%', left: '55%' },
      book: { top: '65%', left: '35%' },
      chair: { top: '55%', left: '72%' },
      phone: { top: '15%', left: '35%' }
    }
  },
  classroom: {
    icon: '🏫',
    emojis: { pen: '🖊️', board: '📋', bag: '🎒', clock: '⏰', desk: '🪵' },
    positions: {
      pen: { top: '20%', left: '20%' },
      board: { top: '15%', left: '50%' },
      bag: { top: '60%', left: '15%' },
      clock: { top: '18%', left: '80%' },
      desk: { top: '58%', left: '48%' }
    }
  },
  garden: {
    icon: '🌳',
    emojis: { flower: '🌸', tree: '🌳', ball: '⚽', bicycle: '🚲', bird: '🐦' },
    positions: {
      flower: { top: '65%', left: '20%' },
      tree: { top: '20%', left: '70%' },
      ball: { top: '70%', left: '50%' },
      bicycle: { top: '50%', left: '78%' },
      bird: { top: '18%', left: '25%' }
    }
  }
};

const SCENE_LANG_VOCAB = {
  hi: {
    kitchen: { title: "रसोई के सामान", water: "गिलास", apple: "सेब", book: "किताब", chair: "कुर्सी", phone: "फ़ोन" },
    classroom: { title: "कक्षा के सामान", pen: "कलम", board: "बोर्ड", bag: "बस्ता", clock: "घड़ी", desk: "मेज़" },
    garden: { title: "बगीचे के सामान", flower: "फूल", tree: "पेड़", ball: "गेंद", bicycle: "साइकिल", bird: "चिड़िया" },
    sentences: {
      water: "गिलास में ठंडा पानी है।", apple: "सेब सेहत के लिए अच्छा होता है।", book: "यह मेरी पसंदीदा किताब है।", chair: "कुर्सी पर बैठ जाओ।", phone: "फ़ोन पर बात करो।",
      pen: "कलम से सुंदर लिखो।", board: "बोर्ड पर पाठ लिखा है।", bag: "मेरा बस्ता भारी है।", clock: "घड़ी सही समय बताती है।", desk: "मेज़ पर कॉपी रखो।",
      flower: "लाल फूल सुंदर है।", tree: "पेड़ हमें छांव देता है।", ball: "हम गेंद से खेलेंगे।", bicycle: "साइकिल चलाना मजेदार है।", bird: "चिड़िया गा रही है।"
    }
  },
  ur: {
    kitchen: { title: "رسوئی کا سامان", water: "گلاس", apple: "سیب", book: "کتاب", chair: "کرسی", phone: "فون" },
    classroom: { title: "کلاس کا سامان", pen: "قلم", board: "بورڈ", bag: "بستہ", clock: "گھڑی", desk: "میز" },
    garden: { title: "باغ کا سامان", flower: "پھول", tree: "درخت", ball: "گیند", bicycle: "سائیکل", bird: "چڑیا" },
    sentences: {
      water: "گلاس میں ٹھنڈا پانی ہے۔", apple: "سیب صحت کے لیے اچھا ہوتا ہے۔", book: "یہ میری پسندیدہ کتاب ہے۔", chair: "کرسی پر بیٹھ جائیں।", phone: "فون پر بات کریں۔",
      pen: "قلم سے خوبصورت لکھیں۔", board: "بورڈ پر سبق لکھا ہے۔", bag: "میرا بستہ وزنی ہے۔", clock: "گھڑی صحیح وقت بتاتی ہے۔", desk: "میز پر کاپی رکھیں۔",
      flower: "سرخ پھول خوبصورت ہے۔", tree: "درخت ہمیں سایہ دیتا ہے۔", ball: "ہم گیند سے کھیلیں گے۔", bicycle: "سائیکل چلانا مزیدار ہے۔", bird: "چڑیا گاتی ہے۔"
    }
  },
  mwr: {
    kitchen: { title: "रसोई रा सामान", water: "लोटो", apple: "सेब", book: "पोथी", chair: "खाट", phone: "फोन" },
    classroom: { title: "निसाळ रा सामान", pen: "कलम", board: "बोर्ड", bag: "थैलो", clock: "घड़ी", desk: "मेज़" },
    garden: { title: "बगीचा रा सामान", flower: "फूल", tree: "रूख", ball: "दड़ो", bicycle: "साइकिल", bird: "चिड़कली" },
    sentences: {
      water: "लोटा मांय पाणी है।", apple: "सेब खावणो चोखो है।", book: "पोथी बांचणी चोखी बात है।", chair: "खाट माथे बैठ जाओ।", phone: "फोन माथे बात करो।",
      pen: "कलम स्यूं साफ लिखो।", board: "बोर्ड माथे लिखो।", bag: "म्हारो थैलो भारी है।", clock: "घड़ी टाइम बतावे है।", desk: "मेज़ माथे कॉपी राखो।",
      flower: "फूल घणो फूटरो है।", tree: "रूख छांव देवै है।", ball: "म्हे दड़ा स्यूं खेलावां।", bicycle: "साइकिल चलावणी चोखी लागे।", bird: "चिड़कली गीत गावे।"
    }
  },
  ta: {
    kitchen: { title: "சமையலறை பொருட்கள்", water: "டம்ளர்", apple: "ஆப்பிள்", book: "புத்தகம்", chair: "நாற்காலி", phone: "தொலைபேசி" },
    classroom: { title: "வகுப்பறை பொருட்கள்", pen: "பேனா", board: "கரும்பலகை", bag: "பை", clock: "கடிகாரம்", desk: "மேஜை" },
    garden: { title: "பூந்தோட்ட பொருட்கள்", flower: "பூ", tree: "மரம்", ball: "பந்து", bicycle: "மிதிவண்டி", bird: "பறவை" },
    sentences: {
      water: "டம்ளரில் தண்ணீர் உள்ளது.", apple: "ஆப்பிள் உடலுக்கு நல்லது.", book: "இது என் புத்தகம்.", chair: "நாற்காலியில் உட்காருங்கள்.", phone: "தொலைபேசியில் பேசுங்கள்.",
      pen: "பேனாவால் எழுதுங்கள்.", board: "கரும்பலகையில் பாடம் உள்ளது.", bag: "என் பை கனமாக உள்ளது.", clock: "கடிகாரம் நேரம் காட்டும்.", desk: "மேஜை மேல் வை.",
      flower: "பூ அழகாக இருக்கிறது.", tree: "மரம் நிழல் தரும்.", ball: "பந்து விளையாடுவோம்.", bicycle: "மிதிவண்டி ஓட்டுவது மகிழ்ச்சி.", bird: "பறவை பாடுகிறது."
    }
  },
  te: {
    kitchen: { title: "వంటగది వస్తువులు", water: "గ్లాసు", apple: "ఆపిల్", book: "పుస్తకం", chair: "కుర్చీ", phone: "ఫోన్" },
    classroom: { title: "తరగతి గది వస్తువులు", pen: "పెన్ను", board: "బోర్డు", bag: "సంచి", clock: "గడియారం", desk: "బల్ల" },
    garden: { title: "తోట వస్తువులు", flower: "పువ్వు", tree: "చెట్టు", ball: "బంతి", bicycle: "సైకిల్", bird: "పక్షి" },
    sentences: {
      water: "గ్లాసులో నీరు ఉంది.", apple: "ఆపిల్ ఆరోగ్యానికి మంచిది.", book: "ఇది నా పుస్తకం.", chair: "కుర్చీలో కూర్చోండి.", phone: "ఫోన్ మాట్లాడండి.",
      pen: "పెన్నుతో రాయండి.", board: "బోర్డు మీద పాఠం ఉంది.", bag: "నా సంచి బరువుగా ఉంది.", clock: "గడియారం సమయం చెబుతుంది.", desk: "బల్ల మీద పెట్టు.",
      flower: "పువ్వు అందంగా ఉంది.", tree: "చెట్టు నీడ ఇస్తుంది.", ball: "బంతితో ఆడుకుందాం.", bicycle: "సైకిల్ తొక్కడం సరదా.", bird: "పక్షి పాడుతోంది."
    }
  },
  bn: {
    kitchen: { title: "রান্নাঘরের জিনিসপত্র", water: "গ্লাস", apple: "আপেল", book: "বই", chair: "চেয়ার", phone: "ফোন" },
    classroom: { title: "শ্রেণীকক্ষের জিনিসপত্র", pen: "কলম", board: "বোর্ড", bag: "ব্যাগ", clock: "ঘড়ি", desk: "টেবিল" },
    garden: { title: "বাগানের জিনিসপত্র", flower: "ফুল", tree: "গাছ", ball: "বল", bicycle: "সাইকেল", bird: "পাখি" },
    sentences: {
      water: "গ্লাসে জল আছে।", apple: "আপেল স্বাস্থ্যের পক্ষে ভালো।", book: "এটি আমার প্রিয় বই।", chair: "চেয়ারে বসুন।", phone: "ফোনে কথা বলুন।",
      pen: "কলম দিয়ে লেখো।", board: "বোর্ডে লেখা আছে।", bag: "আমার ব্যাগটি ভারী।", clock: "ঘড়ি সময় দেখায়।", desk: "টেবিলে খাতা রাখো।",
      flower: "ফুলটি খুব সুন্দর।", tree: "গাছ আমাদের ছায়া দেয়।", ball: "আমরা বল খেলব।", bicycle: "সাইকেল চালানো মজার।", bird: "পাখি গান গাইছে।"
    }
  },
  mr: {
    kitchen: { title: "स्वयंपाकघरातील वस्तू", water: "गिलास", apple: "सफरचंद", book: "पुस्तक", chair: "खुर्ची", phone: "फोन" },
    classroom: { title: "वर्गातील वस्तू", pen: "पेन", board: "फळा", bag: "दप्तर", clock: "घड्याळ", desk: "बाक" },
    garden: { title: "बागेतील वस्तू", flower: "फूल", tree: "झाड", ball: "चेंडू", bicycle: "सायकल", bird: "पक्षी" },
    sentences: {
      water: "गिलासात पाणी आहे.", apple: "सफरचंद आरोग्यासाठी चांगले असते.", book: "हे माझे पुस्तक आहे.", chair: "खुर्चीवर बसा.", phone: "फोनवर बोल.",
      pen: "पेनाने लिही.", board: "फळ्यावर धडा लिहिला आहे.", bag: "माझे दप्तर जड आहे.", clock: "घड्याळ वेळ दाखवते.", desk: "बाकावर ठेव.",
      flower: "फूल सुंदर आहे.", tree: "झाड सावली देते.", ball: "चेंडूने खेळूया.", bicycle: "सायकल चालवणे मजेशीर आहे.", bird: "पक्षी गात आहे."
    }
  },
  en: {
    kitchen: { title: "Kitchen Items", water: "Glass", apple: "Apple", book: "Book", chair: "Chair", phone: "Phone" },
    classroom: { title: "Classroom Items", pen: "Pen", board: "Board", bag: "Bag", clock: "Clock", desk: "Desk" },
    garden: { title: "Garden Items", flower: "Flower", tree: "Tree", ball: "Ball", bicycle: "Bicycle", bird: "Bird" },
    sentences: {
      water: "There is water in the glass.", apple: "An apple is good for health.", book: "This is my favorite book.", chair: "Sit down on the chair.", phone: "The phone is ringing.",
      pen: "Write with a pen.", board: "The lesson is on the board.", bag: "My bag is heavy.", clock: "The clock tells the time.", desk: "Put the copy on the desk.",
      flower: "The flower is beautiful.", tree: "The tree gives us shade.", ball: "We will play with the ball.", bicycle: "Riding a bicycle is fun.", bird: "The bird is singing."
    }
  }
};

const ObjectFinder = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

    let currentLang = 'hi';
  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    currentLang = storedUser.learning_language || 'hi';
  } catch (e) {}
  const langVocab = SCENE_LANG_VOCAB[currentLang] || SCENE_LANG_VOCAB['hi'];

  const [activeScene, setActiveScene] = useState('kitchen'); // kitchen, classroom, garden
  const [playMode, setPlayMode] = useState('study'); // study, quiz
  const [selectedWordKey, setSelectedWordKey] = useState(null);
  const [matchedKeys, setMatchedKeys] = useState([]);
  const [wrongKey, setWrongKey] = useState(null);
  const [activeItemInfo, setActiveItemInfo] = useState(null); // { name, sentence, emoji }
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const sceneConfig = SCENE_CONFIGS[activeScene];
  const vocab = langVocab[activeScene];

  const itemsList = Object.keys(sceneConfig.emojis).map(key => ({
    key,
    word: vocab[key]
  }));

  const handleWordSelect = (key) => {
    if (playMode === 'study') {
      showStudyInfo(key);
      return;
    }
    if (matchedKeys.includes(key)) return;
    setSelectedWordKey(key);
    setActiveItemInfo(null);
  };

  const showStudyInfo = (key) => {
    const itemEmoji = sceneConfig.emojis[key];
    const itemName = vocab[key];
    const sentence = langVocab.sentences[key] || '';
    setActiveItemInfo({ name: itemName, sentence, emoji: itemEmoji });
    speakText(`${itemName}. ${sentence}`);
  };

  const speakText = (text) => {
    ttsSpeak(text, { lang: currentLang, rate: 0.85 });
  };

  const handleObjectClick = (key) => {
    if (playMode === 'study') {
      showStudyInfo(key);
      return;
    }

    if (matchedKeys.includes(key)) return;
    if (selectedWordKey === null) return;

    if (selectedWordKey === key) {
      const newMatched = [...matchedKeys, key];
      setMatchedKeys(newMatched);
      setScore(prev => prev + 20);
      
      const itemName = vocab[key];
      const sentence = langVocab.sentences[key] || '';
      setActiveItemInfo({ name: itemName, sentence, emoji: sceneConfig.emojis[key] });
      speakText(itemName);

      setSelectedWordKey(null);

      if (newMatched.length === Object.keys(sceneConfig.emojis).length) {
        setGameComplete(true);
      }
    } else {
      setWrongKey(key);
      setTimeout(() => {
        setWrongKey(null);
        setSelectedWordKey(null);
      }, 800);
    }
  };

  const handleSceneChange = (scene) => {
    setActiveScene(scene);
    setMatchedKeys([]);
    setSelectedWordKey(null);
    setWrongKey(null);
    setActiveItemInfo(null);
    setGameComplete(false);
  };

  const handleReset = () => {
    setMatchedKeys([]);
    setSelectedWordKey(null);
    setWrongKey(null);
    setActiveItemInfo(null);
    setScore(0);
    setGameComplete(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem' }}>
      <button 
        onClick={() => navigate('/activities')} 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '12px', cursor: 'pointer', color: '#475569', fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
      >
        <ArrowLeft size={18} /> Back to Activities
      </button>

      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        
        {/* Banner */}
        <div style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)', borderRadius: '24px', padding: '1.8rem', color: 'white', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 0.4rem 0' }}>🔍 Spot the Object</h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>Switch scenes, review words in Study mode, or matching items in Quiz mode!</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.6rem 1.2rem', borderRadius: '20px', fontWeight: 800 }}>
            Score: {score}
          </div>
        </div>

        {/* Scene Selection + Mode Selector Grid */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          
          {/* Scenes Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', background: '#e2e8f0', padding: '0.3rem', borderRadius: '14px' }}>
            {Object.keys(SCENE_CONFIGS).map(scene => (
              <button
                key={scene}
                onClick={() => handleSceneChange(scene)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: activeScene === scene ? 'white' : 'transparent',
                  color: activeScene === scene ? '#0891b2' : '#64748b',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <span>{SCENE_CONFIGS[scene].icon}</span>
                <span style={{ textTransform: 'capitalize' }}>{scene}</span>
              </button>
            ))}
          </div>

          {/* Learn / Quiz Toggle Switch */}
          <div style={{ display: 'flex', gap: '0.5rem', background: '#e2e8f0', padding: '0.3rem', borderRadius: '14px' }}>
            <button
              onClick={() => { setPlayMode('study'); handleReset(); }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 800,
                cursor: 'pointer',
                background: playMode === 'study' ? '#0891b2' : 'transparent',
                color: playMode === 'study' ? 'white' : '#64748b',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <BookOpen size={16} /> Study Mode
            </button>
            <button
              onClick={() => { setPlayMode('quiz'); handleReset(); }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 800,
                cursor: 'pointer',
                background: playMode === 'quiz' ? '#0891b2' : 'transparent',
                color: playMode === 'quiz' ? 'white' : '#64748b',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Compass size={16} /> Quiz Challenge
            </button>
          </div>

        </div>

        {gameComplete ? (
          <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
            <Trophy size={64} color="#eab308" style={{ marginBottom: '1rem', marginInline: 'auto' }} />
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b', margin: '0 0 0.5rem 0' }}>Superb Job!</h2>
            <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '2rem' }}>You spotted and tagged all items in the {activeScene} scene!</p>
            <button 
              onClick={handleReset}
              style={{ background: '#0891b2', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw size={18} /> Play Again
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            
            {/* Environment Scene */}
            <div style={{ flex: 1, minWidth: '320px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', height: '360px', position: 'relative', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '1rem', left: '1.5rem', background: '#f1f5f9', padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                📍 {vocab.title}
              </div>

              {/* The Room Canvas Layout */}
              <div style={{ width: '82%', height: '72%', background: '#f1f5f9', borderRadius: '18px', border: '2px dashed #cbd5e1', position: 'relative' }}>
                
                {/* Object markers */}
                {Object.keys(sceneConfig.emojis).map(key => {
                  const isMatched = matchedKeys.includes(key);
                  const isWrong = wrongKey === key;
                  const isSelected = selectedWordKey === key;
                  const pos = sceneConfig.positions[key];
                  const emoji = sceneConfig.emojis[key];

                  let boxBg = 'white';
                  let border = '1px solid #e2e8f0';

                  if (playMode === 'quiz') {
                    if (isMatched) {
                      boxBg = '#dcfce7';
                      border = '1px solid #10b981';
                    } else if (isWrong) {
                      boxBg = '#fee2e2';
                      border = '1px solid #ef4444';
                    } else if (isSelected) {
                      boxBg = '#e0f2fe';
                      border = '2px solid #0891b2';
                    }
                  }

                  return (
                    <div 
                      key={key}
                      onClick={() => handleObjectClick(key)}
                      style={{
                        position: 'absolute', 
                        top: pos.top, 
                        left: pos.left,
                        fontSize: '2.4rem', 
                        cursor: 'pointer',
                        padding: '0.5rem', 
                        background: boxBg,
                        borderRadius: '16px', 
                        border: border,
                        transition: 'all 0.2s', 
                        boxShadow: '0 4px 6px rgba(0,0,0,0.04)',
                        transform: isWrong ? 'scale(0.9) rotate(-5deg)' : isSelected ? 'scale(1.15)' : 'scale(1)'
                      }}
                      onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                      onMouseOut={e => { e.currentTarget.style.transform = isWrong ? 'scale(0.9)' : isSelected ? 'scale(1.15)' : 'scale(1)'; }}
                    >
                      {emoji}
                      {playMode === 'quiz' && isMatched && <span style={{ position: 'absolute', top: -5, right: -5, background: '#10b981', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.7rem', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>✓</span>}
                    </div>
                  );
                })}

              </div>
            </div>

            {/* Word Badge Selectors */}
            <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
                {playMode === 'study' ? 'Tap to Learn' : 'Select word'}
              </span>
              
              {itemsList.map(item => {
                const isMatched = matchedKeys.includes(item.key);
                const isSelected = selectedWordKey === item.key;
                
                return (
                  <button
                    key={item.key}
                    onClick={() => handleWordSelect(item.key)}
                    disabled={playMode === 'quiz' && isMatched}
                    style={{
                      background: playMode === 'quiz' && isMatched ? '#f1f5f9' : isSelected ? '#0891b2' : 'white',
                      color: playMode === 'quiz' && isMatched ? '#94a3b8' : isSelected ? 'white' : '#334155',
                      border: '1px solid #e2e8f0',
                      padding: '0.85rem 1rem',
                      borderRadius: '16px',
                      fontWeight: 800,
                      fontSize: '1.05rem',
                      cursor: playMode === 'quiz' && isMatched ? 'default' : 'pointer',
                      boxShadow: isSelected ? '0 8px 12px rgba(6,182,212,0.15)' : '0 2px 4px rgba(0,0,0,0.02)',
                      transition: 'all 0.2s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{item.word}</span>
                    {playMode === 'quiz' && isMatched && <span style={{ color: '#10b981', fontSize: '0.8rem' }}>✓ Saved</span>}
                  </button>
                );
              })}
            </div>

          </div>
        )}

        {/* Dynamic Context Sentence Educational Tooltip */}
        {activeItemInfo && (
          <div 
            style={{
              marginTop: '1.5rem',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '1.2rem 1.5rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              animation: 'fadeIn 0.25s ease'
            }}
          >
            <span style={{ fontSize: '2.5rem' }}>{activeItemInfo.emoji}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1e293b' }}>
                  {activeItemInfo.name}
                </span>
                <button 
                  onClick={() => speakText(`${activeItemInfo.name}. ${activeItemInfo.sentence}`)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', display: 'flex' }}
                >
                  <Volume2 size={16} color="#0891b2" />
                </button>
              </div>
              <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.95rem', fontWeight: 600 }}>
                {activeItemInfo.sentence}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ObjectFinder;
