import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Star, Trophy, RefreshCw, Volume2, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { speakText as ttsSpeak } from '../../utils/ttsHelper';

const LANGUAGE_DATA = {
  hi: {
    title: "Noun Classifier (लिंग वर्गीकरण)",
    desc: "शब्दों को सही श्रेणी (पुलिंग या स्त्रीलिंग) में डालें।",
    bucketA: "पुलिंग (Masculine)",
    bucketB: "स्त्रीलिंग (Feminine)",
    clueTitle: "व्याकरण नियम गाइड (Gender Clues)",
    clueText: "हिंदी भाषा में सभी संज्ञा शब्दों का लिंग (पुल्लिंग या स्त्रीलिंग) होता है:\n1. शब्द जिनके अंत में 'आ' या 'ा' ध्वनि आती है (जैसे: सूरज, आम, कमरा) अक्सर पुल्लिंग होते हैं।\n2. शब्द जिनके अंत में 'ई' या 'ी' ध्वनि आती है (जैसे: चाबी, बिल्ली, नदी, रोटी) अक्सर स्त्रीलिंग होते हैं।\n3. पेय पदार्थों में पानी, दूध, जूस पुल्लिंग होते हैं, जबकि चाय, लस्सी स्त्रीलिंग हैं।",
    items: [
      { id: 1, word: "पानी", category: "A", detail: "सभी मुख्य पेय पदार्थ (चाय, लस्सी छोड़कर) पुल्लिंग होते हैं।" },
      { id: 2, word: "किताब", category: "B", detail: "किताब, पोथी स्त्रीलिंग शब्द हैं।" },
      { id: 3, word: "घर", category: "A", detail: "मकान, भवन, घर पुल्लिंग शब्द हैं।" },
      { id: 4, word: "रोटी", category: "B", detail: "खाने की रोटियाँ स्त्रीलिंग में आती हैं।" },
      { id: 5, word: "चाबी", category: "B", detail: "ई-कारान्त शब्द (ी पर खत्म होने वाले) अक्सर स्त्रीलिंग होते हैं।" },
      { id: 6, word: "फ़ोन", category: "A", detail: "फ़ोन, कंप्यूटर पुल्लिंग शब्द हैं।" },
      { id: 7, word: "सूरज", category: "A", detail: "खगोलीय पिंड (सूरज, तारा, चाँद) पुल्लिंग हैं।" },
      { id: 8, word: "नदी", category: "B", detail: "नदियों के नाम स्त्रीलिंग होते हैं।" },
      { id: 9, word: "दूध", category: "A", detail: "दूध पुल्लिंग द्रव्यवाचक संज्ञा है।" },
      { id: 10, word: "बिल्ली", category: "B", detail: "बिल्ली मादा पशु है, इसलिए स्त्रीलिंग है।" },
      { id: 11, word: "आम", category: "A", detail: "फलों के नाम (आम, केला, सेब) पुल्लिंग होते हैं।" },
      { id: 12, word: "हवा", category: "B", detail: "हवा, आंधी स्त्रीलिंग शब्द हैं।" }
    ]
  },
  ur: {
    title: "اسم کا جنس (تذکیر و تانیث)",
    desc: "الفاظ کو صحیح خانے (مذکر یا مؤنث) میں ڈالیں۔",
    bucketA: "مذکر (Masculine)",
    bucketB: "مؤنث (Feminine)",
    clueTitle: "گرائمر کی رہنمائی (Gender Clues)",
    clueText: "اردو زبان میں تمام اسماء کا کوئی نہ کوئی جنس ہوتا ہے:\n1. جن الفاظ کے آخر میں 'ا' یا 'ہ' ہو (جیسے کمرہ، لڑکا) وہ مذکر ہوتے ہیں۔\n2. جن الفاظ کے آخر میں 'ی' ہو (جیسے چابی، بلی، روٹی) وہ مؤنث ہوتے ہیں۔\n3. پانی اور دودھ مذکر ہیں، جبکہ چائے مؤنث ہے۔",
    items: [
      { id: 1, word: "پانی", category: "A", detail: "پانی، دودھ مذکر ہیں۔" },
      { id: 2, word: "کتاب", category: "B", detail: "کتاب مؤنث ہے۔" },
      { id: 3, word: "گھر", category: "A", detail: "مکان، گھر مذکر ہیں۔" },
      { id: 4, word: "روٹی", category: "B", detail: "روٹی مؤنث ہے۔" },
      { id: 5, word: "چابی", category: "B", detail: "چابی مؤنث ہے۔" },
      { id: 6, word: "فون", category: "A", detail: "فون مذکر ہے۔" },
      { id: 7, word: "سورج", category: "A", detail: "سورج مذکر ہے۔" },
      { id: 8, word: "ندی", category: "B", detail: "ندی مؤنث ہے۔" },
      { id: 9, word: "دودھ", category: "A", detail: "دودھ مذکر ہے۔" },
      { id: 10, word: "بلی", category: "B", detail: "بلی مؤنث ہے۔" },
      { id: 11, word: "آم", category: "A", detail: "آم مذکر ہے۔" },
      { id: 12, word: "ہوا", category: "B", detail: "ہوا مؤنث ہے۔" }
    ]
  },
  mwr: {
    title: "संज्ञा वर्गीकरण (पुल्लिंग-स्त्रीलिंग)",
    desc: "शब्दां नै सही खांचे (पुल्लिंग या स्त्रीलिंग) मांय डालो।",
    bucketA: "पुल्लिंग (Masculine)",
    bucketB: "स्त्रीलिंग (Feminine)",
    clueTitle: "व्याकरण नियम (Clues)",
    clueText: "मारवाड़ी भासा मांय लिंग रा नियम:\n1. 'ओ' कारान्त शब्द (जैसे: छोरों, लोटो) पुल्लिंग होवे है।\n2. 'ई' कारान्त शब्द (जैसे: कूंची, छोरी) स्त्रीलिंग होवे है।",
    items: [
      { id: 1, word: "पाणी", category: "A", detail: "पाणी पुल्लिंग है।" },
      { id: 2, word: "पोथी", category: "B", detail: "पोथी स्त्रीलिंग है।" },
      { id: 3, word: "घर", category: "A", detail: "घर पुल्लिंग है।" },
      { id: 4, word: "सोगरी", category: "B", detail: "सोगरी (रोटी) स्त्रीलिंग है।" },
      { id: 5, word: "कूंची", category: "B", detail: "कूंची (चाबी) स्त्रीलिंग है।" },
      { id: 6, word: "फोन", category: "A", detail: "फोन पुल्लिंग है।" },
      { id: 7, word: "सूरज", category: "A", detail: "सूरज पुल्लिंग है।" },
      { id: 8, word: "नदी", category: "B", detail: "नदी स्त्रीलिंग है।" },
      { id: 9, word: "दूध", category: "A", detail: "दूध पुल्लिंग है।" },
      { id: 10, word: "मिनकी", category: "B", detail: "मिनकी (बिल्ली) स्त्रीलिंग है।" },
      { id: 11, word: "आंबो", category: "A", detail: "आंबो (आम) पुल्लिंग है।" },
      { id: 12, word: "बाव", category: "B", detail: "बाव (हवा) स्त्रीलिंग है।" }
    ]
  },
  mr: {
    title: "नाम वर्गीकरण (लिंग ओळख)",
    desc: "शब्दांना योग्य गटामध्ये (पुल्लिंग किंवा स्त्रीलिंग) वर्गीकरण करा.",
    bucketA: "पुल्लिंग (Masculine)",
    bucketB: "स्त्रीलिंग (Feminine)",
    clueTitle: "मराठी लिंग नियम",
    clueText: "मराठी भाषेत लिंग निश्चित करताना 'तो' (पुल्लिंग) आणि 'ती' (स्त्रीलिंग) चा वापर केला जातो.",
    items: [
      { id: 1, word: "पाणी", category: "A", detail: "तो पाणी (पुल्लिंग)." },
      { id: 2, word: "पुस्तक", category: "A", detail: "तो पुस्तक (पुल्लिंग)." },
      { id: 3, word: "घर", category: "A", detail: "तो घर (पुल्लिंग)." },
      { id: 4, word: "भाकरी", category: "B", detail: "ती भाकरी (स्त्रीलिंग)." },
      { id: 5, word: "किल्ली", category: "B", detail: "ती किल्ली (स्त्रीलिंग)." },
      { id: 6, word: "खुर्ची", category: "B", detail: "ती खुर्ची (स्त्रीलिंग)." },
      { id: 7, word: "सूर्य", category: "A", detail: "तो सूर्य (पुल्लिंग)." },
      { id: 8, word: "नदी", category: "B", detail: "ती नदी (स्त्रीलिंग)." },
      { id: 9, word: "दूध", category: "A", detail: "तो दूध (पुल्लिंग)." },
      { id: 10, word: "मांजर", category: "B", detail: "ती मांजर (स्त्रीलिंग)." },
      { id: 11, word: "आंबा", category: "A", detail: "तो आंबा (पुल्लिंग)." },
      { id: 12, word: "हवा", category: "B", detail: "ती हवा (स्त्रीलिंग)." }
    ]
  },
  bn: {
    title: "বিশেষ্য লিঙ্গ নির্ধারণ",
    desc: "শব্দগুলিকে সঠিক বাক্সে (পুংলিঙ্গ বা স্ত্রীলিঙ্গ) সাজান।",
    bucketA: "পুংলিঙ্গ (Masculine)",
    bucketB: "স্ত্রীলিঙ্গ (Feminine)",
    clueTitle: "ব্যাকরণ নির্দেশিকা",
    clueText: "বাংলায় পুংলিঙ্গ পুরুষবাচক জীব ও বস্তু বোঝায় এবং স্ত্রীলিঙ্গ স্ত্রীবাচক জীব ও বস্তু বোঝায়।",
    items: [
      { id: 1, word: "জল", category: "A", detail: "জল পুংলিঙ্গ।" },
      { id: 2, word: "বই", category: "A", detail: "বই পুংলিঙ্গ।" },
      { id: 3, word: "বাড়ি", category: "A", detail: "বাড়ি পুংলিঙ্গ।" },
      { id: 4, word: "রুটি", category: "B", detail: "রুটি স্ত্রীলিঙ্গ।" },
      { id: 5, word: "চাবি", category: "B", detail: "চাবি স্ত্রীলিঙ্গ।" },
      { id: 6, word: "ফোন", category: "A", detail: "ফোন পুংলিঙ্গ।" },
      { id: 7, word: "সূর্য", category: "A", detail: "সূর্য পুংলিঙ্গ।" },
      { id: 8, word: "নদী", category: "B", detail: "নদী স্ত্রীলিঙ্গ।" },
      { id: 9, word: "দুধ", category: "A", detail: "দুধ পুংলিঙ্গ।" },
      { id: 10, word: "বেড়াল", category: "B", detail: "বেড়াল স্ত্রীলিঙ্গ।" },
      { id: 11, word: "আম", category: "A", detail: "আম পুংলিঙ্গ।" },
      { id: 12, word: "বাতাস", category: "B", detail: "বাতাস স্ত্রীলিঙ্গ।" }
    ]
  },
  ta: {
    title: "திணை வகைப்பாடு (Classifiers)",
    desc: "சொற்களை உயர்திணை அல்லது அஃறிணை பிரிவுகளில் வகைப்படுத்துக.",
    bucketA: "உயர்திணை (Human)",
    bucketB: "அஃறிணை (Non-human / Neuter)",
    clueTitle: "தமிழ் திணை விதிமுறை",
    clueText: "தமிழில் திணை இரு வகைப்படும்:\n1. உயர்திணை: மக்கள், தேவர்கள் போன்ற பகுத்தறிவு உடையவர்கள்.\n2. அஃறிணை: விலங்குகள், தாவரங்கள் மற்றும் உயிரற்ற பொருட்கள்.",
    items: [
      { id: 1, word: "மாணவன்", category: "A", detail: "மாணவன் மனிதன் என்பதால் உயர்திணை." },
      { id: 2, word: "ஆசிரியர்", category: "A", detail: "ஆசிரியர் உயர்திணை." },
      { id: 3, word: "தோழன்", category: "A", detail: "நண்பன் உயர்திணை." },
      { id: 4, word: "தண்ணீர்", category: "B", detail: "தண்ணீர் உயிரற்ற பொருள் என்பதால் அஃறிணை." },
      { id: 5, word: "வீடு", category: "B", detail: "வீடு அஃறிணை." },
      { id: 6, word: "பூனை", category: "B", detail: "பூனை விலங்கு என்பதால் அஃறிணை." },
      { id: 7, word: "மருத்துவர்", category: "A", detail: "மருத்துவர் மனிதன் என்பதால் உயர்திணை." },
      { id: 8, word: "மரம்", category: "B", detail: "மரம் தாவரம் என்பதால் அஃறிணை." },
      { id: 9, word: "புத்தகம்", category: "B", detail: "புத்தகம் அஃறிணை." },
      { id: 10, word: "குழந்தை", category: "A", detail: "குழந்தை மனிதன் என்பதால் உயர்திணை." },
      { id: 11, word: "மேஜை", category: "B", detail: "மேஜை அஃறிணை." },
      { id: 12, word: "தாய்", category: "A", detail: "தாய் உயர்திணை." }
    ]
  },
  te: {
    title: "లింగ/నామవాచక వర్గీకరణ (Classifiers)",
    desc: "పదాలను మనుషులు (మహత్/మహతీ) లేదా వస్తువులు/జంతువుల (అమహత్) కింద వర్గీకరించండి.",
    bucketA: "మనుషులు (Human)",
    bucketB: "జంతువులు/వస్తువులు (Non-human)",
    clueTitle: "తెలుగు నామవాచక నియమాలు",
    clueText: "తెలుగులో నామవాచకాలను మనుషులు (మహత్, మహతీ వాచకాలు) మరియు మనుషులు కానివి (అమహత్ - జంతువులు, వస్తువులు, మొక్కలు) గా వర్గీకరిస్తాం.",
    items: [
      { id: 1, word: "విద్యార్థి", category: "A", detail: "విద్యార్థి మానవుడు కాబట్టి హ్యూమన్." },
      { id: 2, word: "ఉపాధ్యాయుడు", category: "A", detail: "ఉపాధ్యాయుడు మానవుడు." },
      { id: 3, word: "స్నేహితుడు", category: "A", detail: "స్నేహితుడు మానవుడు." },
      { id: 4, word: "నీరు", category: "B", detail: "నీరు నిర్జీవ ద్రవం కాబట్టి నాన్-హ్యూమన్." },
      { id: 5, word: "ఇల్లు", category: "B", detail: "ఇల్లు నాన్-హ్యూమన్." },
      { id: 6, word: "పిల్లి", category: "B", detail: "పిల్లి జంతువు కాబట్టి నాన్-హ్యూమన్." },
      { id: 7, word: "వైద్యుడు", category: "A", detail: "వైద్యుడు హ్యూమన్." },
      { id: 8, word: "చెట్టు", category: "B", detail: "చెట్టు నాన్-హ్యూమన్." },
      { id: 9, word: "పుస్తకం", category: "B", detail: "పుస్తకం నాన్-హ్యూమన్." },
      { id: 10, word: "బిడ్డ", category: "A", detail: "బిడ్డ హ్యూమన్." },
      { id: 11, word: "బల్ల", category: "B", detail: "బల్ల నాన్-హ్యూమన్." },
      { id: 12, word: "తల్లి", category: "A", detail: "తల్లి హ్యూమన్." }
    ]
  },
  en: {
    title: "Countable vs Uncountable Nouns",
    desc: "Sort each noun into Countable or Uncountable categories.",
    bucketA: "Countable",
    bucketB: "Uncountable",
    clueTitle: "Nouns Sorting Clues",
    clueText: "1. Countable nouns can be singular or plural and counted using numbers (e.g. 1 book, 3 apples).\n2. Uncountable nouns are mass substances, concepts, or liquids that cannot be counted directly (e.g. water, milk, rice) without adding measurement units (e.g. a cup of milk).",
    items: [
      { id: 1, word: "Apple", category: "A", detail: "You can count apples (e.g. 1 apple, 2 apples)." },
      { id: 2, word: "Book", category: "A", detail: "Books are solid individual items you can count." },
      { id: 3, word: "Key", category: "A", detail: "Keys are distinct metal objects you can count." },
      { id: 4, word: "Water", category: "B", detail: "Liquids are mass nouns and cannot be counted individually." },
      { id: 5, word: "Milk", category: "B", detail: "Milk is a liquid mass noun." },
      { id: 6, word: "Rice", category: "B", detail: "Grains are considered mass nouns." },
      { id: 7, word: "Chair", category: "A", detail: "Chairs can be counted (e.g. 4 chairs around the table)." },
      { id: 8, word: "Sugar", category: "B", detail: "Sugar is a fine granular mass substance." },
      { id: 9, word: "Phone", category: "A", detail: "Phones are physical electronic gadgets you can count." },
      { id: 10, word: "Money", category: "B", detail: "Money is a generic concept of value and is uncountable (use dollars or rupees to count)." },
      { id: 11, word: "Pen", category: "A", detail: "Pens are distinct writing utensils you can count." },
      { id: 12, word: "Love", category: "B", detail: "Love is an abstract feeling/concept and cannot be counted." }
    ]
  }
};

const GenderClassifier = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

    let currentLang = 'hi';
  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    currentLang = storedUser.learning_language || 'hi';
  } catch (e) {}
  const data = LANGUAGE_DATA[currentLang] || LANGUAGE_DATA['hi'];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null); // { correct: boolean, text: string }
  const [gameComplete, setGameComplete] = useState(false);
  const [showClues, setShowClues] = useState(false);
  
  // Slide animation helpers
  const [slideDir, setSlideDir] = useState(null); // 'left' | 'right' | null

  const currentItem = data.items[currentIndex];

  const triggerSound = (isCorrect) => {
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (isCorrect) {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      }
    }
  };

  const handleClassify = (bucket) => {
    if (feedback) return; // Prevent multiple clicks

    const isCorrect = currentItem.category === bucket;
    setSlideDir(bucket === 'A' ? 'left' : 'right');
    triggerSound(isCorrect);

    if (isCorrect) {
      setScore(prev => prev + 15);
      setFeedback({
        correct: true,
        text: `✓ Correct! ${currentItem.detail}`
      });
    } else {
      setFeedback({
        correct: false,
        text: `✗ Wrong! ${currentItem.detail}`
      });
    }

    setTimeout(() => {
      setFeedback(null);
      setSlideDir(null);
      if (currentIndex < data.items.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setGameComplete(true);
      }
    }, 2800);
  };

  const speakText = () => {
    if (currentItem) {
      ttsSpeak(currentItem.word, { lang: currentLang, rate: 0.85 });
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setScore(0);
    setFeedback(null);
    setSlideDir(null);
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

      <div style={{ maxWidth: '620px', margin: '0 auto' }}>
        
        {/* Banner */}
        <div style={{ background: 'linear-gradient(135deg, #ec4899, #be185d)', borderRadius: '24px', padding: '1.8rem', color: 'white', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 0.4rem 0' }}>{data.title}</h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>{data.desc}</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.6rem 1.2rem', borderRadius: '20px', fontWeight: 800 }}>
            Score: {score}
          </div>
        </div>

        {gameComplete ? (
          <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
            <Trophy size={64} color="#eab308" style={{ marginBottom: '1rem', marginInline: 'auto' }} />
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b', margin: '0 0 0.5rem 0' }}>Fabulous Classifying!</h2>
            <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '2rem' }}>You completed the noun categorization check with 12 vocabulary terms!</p>
            <button 
              onClick={handleReset}
              style={{ background: '#be185d', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw size={18} /> Restart
            </button>
          </div>
        ) : (
          <div>
            
            {/* Word Card Panel */}
            <div 
              style={{ 
                background: 'white', 
                borderRadius: '24px', 
                padding: '2.5rem', 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 8px 16px -3px rgba(0,0,0,0.02)', 
                textAlign: 'center', 
                marginBottom: '1.5rem', 
                position: 'relative',
                transform: slideDir === 'left' ? 'translateX(-120px) rotate(-10deg)' : slideDir === 'right' ? 'translateX(120px) rotate(10deg)' : 'none',
                opacity: slideDir ? 0.3 : 1,
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
            >
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800 }}>
                Nouns sorted: {currentIndex} / {data.items.length}
              </span>
              
              <h2 style={{ fontSize: '3rem', fontWeight: 900, color: '#1e293b', margin: '1rem 0 1.2rem 0' }}>
                {currentItem.word}
              </h2>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem' }}>
                <button
                  onClick={speakText}
                  style={{ background: '#f1f5f9', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '12px', color: '#475569', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Volume2 size={16} /> Listen Word
                </button>
              </div>
            </div>

            {/* Classification Drop Chest Buckets */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.5rem' }}>
              <button
                onClick={() => handleClassify('A')}
                disabled={feedback !== null}
                style={{
                  background: 'linear-gradient(135deg, #fdf4ff, #fae8ff)',
                  border: '2px dashed #d946ef',
                  color: '#86198f',
                  padding: '1.5rem 1rem',
                  borderRadius: '20px',
                  fontWeight: 900,
                  fontSize: '1.15rem',
                  cursor: feedback !== null ? 'default' : 'pointer',
                  textAlign: 'center',
                  transition: 'transform 0.2s',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                }}
                onMouseOver={e => { if(feedback===null) e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                📥 {data.bucketA}
              </button>

              <button
                onClick={() => handleClassify('B')}
                disabled={feedback !== null}
                style={{
                  background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)',
                  border: '2px dashed #f43f5e',
                  color: '#9f1239',
                  padding: '1.5rem 1rem',
                  borderRadius: '20px',
                  fontWeight: 900,
                  fontSize: '1.15rem',
                  cursor: feedback !== null ? 'default' : 'pointer',
                  textAlign: 'center',
                  transition: 'transform 0.2s',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                }}
                onMouseOver={e => { if(feedback===null) e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                📥 {data.bucketB}
              </button>
            </div>

            {/* Explanation Feedback Block */}
            {feedback && (
              <div 
                style={{
                  padding: '1.2rem',
                  borderRadius: '16px',
                  background: feedback.correct ? '#ecfdf5' : '#fff5f5',
                  border: `1px solid ${feedback.correct ? '#a7f3d0' : '#feb2b2'}`,
                  color: feedback.correct ? '#065f46' : '#9b2c2c',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  textAlign: 'center',
                  animation: 'fadeIn 0.3s ease',
                  marginBottom: '1.5rem'
                }}
              >
                {feedback.text}
              </div>
            )}

            {/* Expandable Grammar Rule Clues Panel */}
            <div style={{ background: 'white', borderRadius: '18px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
              <button
                onClick={() => setShowClues(!showClues)}
                style={{
                  width: '100%',
                  padding: '1rem 1.5rem',
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontWeight: 800,
                  color: '#475569',
                  fontSize: '0.92rem'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HelpCircle size={18} color="#be185d" /> {data.clueTitle}
                </span>
                {showClues ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              
              {showClues && (
                <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, whiteSpace: 'pre-line', borderTop: '1px solid #f1f5f9' }}>
                  {data.clueText}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default GenderClassifier;
