import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Star, Trophy, RefreshCw, CheckCircle2, XCircle, ChevronRight, Sparkles } from 'lucide-react';

const EDITOR_LANG_DATA = {
  hi: {
    title: "संपादन मंडल (Editorial Board)",
    desc: "नीचे दिए गए समाचार और औपचारिक आलेखों के मसौदों में व्याकरण की त्रुटियों को पहचानें और उन्हें ठीक करें।",
    win: "अद्भुत! आपने संपादन के सभी 3 राउंड पूरे कर लिए हैं और आलेखों को प्रकाशित कर दिया है।",
    submitBtn: "संपादन पूरा करें",
    nextRoundBtn: "अगला राउंड →",
    restartBtn: "पुनः प्रयास करें",
    hintTitle: "💡 व्याकरण नियम संकेत (Rule Card):",
    rounds: [
      {
        id: 1,
        name: "राउंड 1: व्यक्तिगत पत्र (Personal Letter)",
        rawText: "कल मेरे [बहन] बाजार [गया] था। उसने वहां से कई सुंदर [किताबें] खरीदीं।",
        challenges: [
          { id: 1, target: "बहन", options: ["बहन", "भाई", "बहनों"], correct: "बहन", tip: "बहन यहाँ एकवचन संज्ञा के रूप में सही है।" },
          { id: 2, target: "गया", options: ["गया", "गई", "गए"], correct: "गई", tip: "संज्ञा 'बहन' स्त्रीलिंग है, इसलिए क्रिया 'गई' होगी।" },
          { id: 3, target: "किताबें", options: ["किताबें", "किताब", "किताबो"], correct: "किताबें", tip: "वाक्य में 'कई' शब्द बहुवचन 'किताबें' का संकेत करता है।" }
        ]
      },
      {
        id: 2,
        name: "राउंड 2: समाचार रिपोर्ट (News Report)",
        rawText: "कल शहर में भारी [बारिश] [हुआ]। सड़कों पर पानी [भर] गया था।",
        challenges: [
          { id: 1, target: "बारिश", options: ["बारिश", "तूफान", "बूंदें"], correct: "बारिश", tip: "वाक्य संदर्भ के अनुसार 'बारिश' संज्ञा अनुकूल है।" },
          { id: 2, target: "हुआ", options: ["हुआ", "हुई", "हुए"], correct: "हुई", tip: "बारिश स्त्रीलिंग शब्द है, अतः क्रिया 'हुई' होगी।" },
          { id: 3, target: "भर", options: ["भर", "खाली", "सूख"], correct: "भर", tip: "भारी बारिश के कारण सड़कों पर पानी 'भर' जाता है।" }
        ]
      },
      {
        id: 3,
        name: "राउंड 3: कार्यालयी अनुरोध (Business Request)",
        rawText: "महोदय, [सबल] कारणों से मैं कल कार्यालय नहीं आ [सकूँगा]। कृपया मेरी एक दिन की छुट्टी [स्वीकार] करें।",
        challenges: [
          { id: 1, target: "सबल", options: ["सबल", "कमजोर", "व्यक्तिगत"], correct: "व्यक्तिगत", tip: "कार्यालयी छुट्टियों के लिए 'व्यक्तिगत' (personal) कारण लिखना मानक है।" },
          { id: 2, target: "सकूँगा", options: ["सकूँगा", "सकते", "पाऊंगा"], correct: "सकूँगा", tip: "उत्तम पुरुष एकवचन (मैं) के साथ 'सकूँगा' क्रिया शुद्ध है।" },
          { id: 3, target: "स्वीकार", options: ["स्वीकार", "मंजूर", "खारिज"], correct: "स्वीकार", tip: "औपचारिक भाषा में छुट्टी 'स्वीकार' करने का अनुरोध किया जाता है।" }
        ]
      }
    ]
  },
  en: {
    title: "Editorial Board",
    desc: "Proofread the formal drafts and correct all syntactic or word-choice errors.",
    win: "Fantastic! You finished all 3 editing rounds and published the formal articles.",
    submitBtn: "Verify Draft",
    nextRoundBtn: "Next Round →",
    restartBtn: "Restart Session",
    hintTitle: "💡 Grammar Rule Card:",
    rounds: [
      {
        id: 1,
        name: "Round 1: Personal Letter",
        rawText: "Yesterday my [sister] [go] to the market. She [bought] some fresh fruits.",
        challenges: [
          { id: 1, target: "sister", options: ["sister", "brother", "sisters"], correct: "sister", tip: "The context indicates a singular subject 'sister'." },
          { id: 2, target: "go", options: ["go", "went", "goes"], correct: "went", tip: "'Yesterday' indicates the simple past tense, requiring the verb 'went'." },
          { id: 3, target: "bought", options: ["bought", "buyed", "buys"], correct: "bought", tip: "The irregular past tense of buy is 'bought'." }
        ]
      },
      {
        id: 2,
        name: "Round 2: News Report",
        rawText: "The local government [have] [announced] a new policy to support [sustainability] initiatives.",
        challenges: [
          { id: 1, target: "have", options: ["have", "has", "are"], correct: "has", tip: "The singular subject 'government' takes the singular verb 'has'." },
          { id: 2, target: "announced", options: ["announced", "announce", "announcing"], correct: "announced", tip: "Present perfect tense uses 'has + past participle (announced)'." },
          { id: 3, target: "sustainability", options: ["sustainability", "sustainable", "sustainably"], correct: "sustainability", tip: "We need a noun ('sustainability') to modify the word 'initiatives'." }
        ]
      },
      {
        id: 3,
        name: "Round 3: Business Request",
        rawText: "Dear Manager, I am writing to [request] a formal leave of absence. I will [delegate] my duties to Sam.",
        challenges: [
          { id: 1, target: "request", options: ["request", "demand", "ask"], correct: "request", tip: "'Request' is the appropriate formal register for corporate leave emails." },
          { id: 2, target: "delegate", options: ["delegate", "forget", "give"], correct: "delegate", tip: "'Delegate' means to hand over tasks or responsibilities to another colleague." }
        ]
      }
    ]
  }
};

const fallbacks = ['mwr', 'ta', 'te', 'bn', 'mr', 'ur'];
fallbacks.forEach(lang => {
  EDITOR_LANG_DATA[lang] = EDITOR_LANG_DATA['hi'];
});

// Specialize Tamil & Telugu mappings
EDITOR_LANG_DATA.ta = {
  title: "செய்தி திருத்துநர் (Editorial Board)",
  desc: "கீழே உள்ள உரை வரைவுகளில் இருக்கும் இலக்கணப் பிழைகளைக் கண்டறிந்து திருத்தவும்.",
  win: "வாழ்த்துகள்! நீங்கள் 3 சுற்றுகளையும் வெற்றிகரமாக முடித்து கட்டுரையைப் பிரசுரித்துவிட்டீர்கள்.",
  submitBtn: "சரிபார்க்கவும்",
  nextRoundBtn: "அடுத்த சுற்று →",
  restartBtn: "மீண்டும் தொடங்குக",
  hintTitle: "💡 இலக்கண விதி கார்டு:",
  rounds: [
    {
      id: 1,
      name: "சுற்று 1: தனிப்பட்ட கடிதம்",
      rawText: "நேற்று என் [தங்கை] கடைக்குச் [சென்றான்]. அவள் அங்கிருந்து பல [புத்தகங்கள்] வாங்கினாள்.",
      challenges: [
        { id: 1, target: "தங்கை", options: ["தங்கை", "தம்பி", "தங்கைகள்"], correct: "தங்கை", tip: "இங்கே ஒருமைப் பெயர்ச்சொல்லான 'தங்கை' என்பது சரியானது." },
        { id: 2, target: "சென்றான்", options: ["சென்றான்", "சென்றாள்", "சென்றனர்"], correct: "சென்றாள்", tip: "தங்கை பெண்பால் என்பதால் வினைமுற்று 'சென்றாள்' என்று முடிய வேண்டும்." },
        { id: 3, target: "புத்தகங்கள்", options: ["புத்தகங்கள்", "புத்தகம்", "புத்தகங்களை"], correct: "புத்தகங்கள்", tip: "பன்மைச் சொல் 'புத்தகங்கள்' என்பது சரியானது." }
      ]
    },
    {
      id: 2,
      name: "சுற்று 2: செய்தி அறிக்கை",
      rawText: "நேற்று நகரில் பலத்த [மழை] [பெய்தார்]. இதனால் சாலைகளில் நீர் [தேங்கியது].",
      challenges: [
        { id: 1, target: "மழை", options: ["மழை", "வெயில்", "காற்று"], correct: "மழை", tip: "வாக்கிய அமைப்பிற்கு ஏற்ப 'மழை' என்ற சொல் பொருத்தமானது." },
        { id: 2, target: "பெய்தார்", options: ["பெய்தார்", "பெய்தது", "பெய்தனர்"], correct: "பெய்தது", tip: "மழை அஃறிணை என்பதால் 'பெய்தது' என்ற வினைமுற்று வர வேண்டும்." },
        { id: 3, target: "தேங்கியது", options: ["தேங்கியது", "வற்றியது", "மறைந்தது"], correct: "தேங்கியது", tip: "மழையால் சாலைகளில் நீர் தேங்குவது இயல்பு." }
      ]
    },
    {
      id: 3,
      name: "சுற்று 3: அலுவலகக் கடிதம்",
      rawText: "மதிப்பிற்குரிய ஐயா, [சொந்த] காரணங்களால் என்னால் நாளை வர [இயலாது]. தயவுசெய்து விடுப்பை [ஏற்கவும்].",
      challenges: [
        { id: 1, target: "சொந்த", options: ["சொந்த", "பொதுவான", "தேவையற்ற"], correct: "சொந்த", tip: "விடுப்புக் கடிதத்தில் சொந்தக் காரணம் (personal reason) குறிப்பிடுவது முறை." },
        { id: 2, target: "இயலாது", options: ["இயலாது", "முடியாது", "மாட்டேன்"], correct: "இயலாது", tip: "முறைப்படியான கடிதங்களில் 'இயலாது' என்ற சொல் நயமானது." },
        { id: 3, target: "ஏற்கவும்", options: ["ஏற்கவும்", "மறுக்கவும்", "தள்ளவும்"], correct: "ஏற்கவும்", tip: "விடுப்பை ஏற்கக் கோருவது அலுவலகச் சொல் வழக்கு." }
      ]
    }
  ]
};

EDITOR_LANG_DATA.te = {
  title: "ఎడిటోరియల్ బోర్డ్ (Grammar Editor)",
  desc: "వ్యాసాలలో ఉన్న వ్యాకరణ తప్పులను గుర్తించి సరైన పదాలను ఎంచుకోండి.",
  win: "అద్భుతం! మీరు 3 రౌండ్ల ఎడిటింగ్ పూర్తి చేసి నివేదికను విజయవంతంగా ప్రచురించారు.",
  submitBtn: "సరిచూసుకోండి",
  nextRoundBtn: "తదుపరి రౌండ్ →",
  restartBtn: "మళ్లీ ప్రారంభించు",
  hintTitle: "💡 వ్యాకరణ నియమ సూచిక:",
  rounds: [
    {
      id: 1,
      name: "రౌండ్ 1: వ్యక్తిగత లేఖ",
      rawText: "నిన్న నా [చెల్లెలు] మార్కెట్‌కు [వెళ్ళాడు]. ఆమె అక్కడ కొన్ని [పుస్తకాలు] కొన్నది.",
      challenges: [
        { id: 1, target: "చెల్లెలు", options: ["చెల్లెలు", "తమ్ముడు", "చెల్లెళ్ళు"], correct: "చెల్లెలు", tip: "ఇక్కడ 'చెల్లెలు' అనేది ఏకవచన నామవాచకం." },
        { id: 2, target: "వెళ్ళాడు", options: ["వెళ్ళాడు", "వెళ్ళింది", "వెళ్ళారు"], correct: "వెళ్ళింది", tip: "చెల్లెలు స్త్రీలింగం కాబట్టి క్రియ 'వెళ్ళింది' అని రావాలి." },
        { id: 3, target: "పుస్తకాలు", options: ["పుస్తకాలు", "పుస్తకం", "పుస్తకాలను"], correct: "పుస్తకాలు", tip: "బహువచనం 'పుస్తకాలు' అనేది ఇక్కడ సరైనది." }
      ]
    },
    {
      id: 2,
      name: "రౌండ్ 2: వార్తా నివేదిక",
      rawText: "నిన్న నగరంలో భారీ [వర్షం] [కురిశాడు]. రోడ్లన్నీ జలమయం [అయ్యాయి].",
      challenges: [
        { id: 1, target: "వర్షం", options: ["వర్షం", "ఎండ", "గాలి"], correct: "వర్షం", tip: "వాక్యం ప్రకారం 'వర్షం' అనేది సరైన నామవాచకం." },
        { id: 2, target: "కురిశాడు", options: ["కురిశాడు", "కురిసింది", "కురిశారు"], correct: "కురిసింది", tip: "వర్షం అచేతనం కాబట్టి క్రియ 'కురిసింది' అని ఉండాలి." },
        { id: 3, target: "అయ్యాయి", options: ["అయ్యాయి", "ఎండిపోయాయి", "ఖాళీ అయ్యాయి"], correct: "అయ్యాయి", tip: "భారీ వర్షాల వల్ల రోడ్లు జలమయం అవుతాయి." }
      ]
    },
    {
      id: 3,
      name: "రౌండ్ 3: కార్యాలయ అభ్యర్థన",
      rawText: "అయ్యా, [వ్యక్తిగత] కారణాల వల్ల నేను రేపు ఆఫీస్ కు [రాలేకపోతున్నాను]. దయచేసి సెలవు [మంజూరు] చేయండి.",
      challenges: [
        { id: 1, target: "వ్యక్తిగత", options: ["వ్యక్తిగత", "సాధారణ", "పనికిరాని"], correct: "వ్యక్తిగత", tip: "సెలవు కోసం 'వ్యక్తిగత కారణాలు' అని రాయడం సరైన పద్ధతి." },
        { id: 2, target: "రాలేకపోతున్నాను", options: ["రాలేకపోతున్నాను", "రాను", "రావట్లేదు"], correct: "రాలేకపోతున్నాను", tip: "సవినయంగా అభ్యర్థించడానికి 'రాలేకపోతున్నాను' అనడం ఉచితం." },
        { id: 3, target: "మంజూరు", options: ["మంజూరు", "రద్దు", "తిరస్కరణ"], correct: "మంజూరు", tip: "కార్యాలయ భాషలో సెలవును 'మంజూరు' చేయమని కోరుతాము." }
      ]
    }
  ]
};

const GrammarEditor = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

    let currentLang = 'hi';
  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    currentLang = storedUser.learning_language || 'hi';
  } catch (e) {}
  const data = EDITOR_LANG_DATA[currentLang] || EDITOR_LANG_DATA['hi'];

  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [userSelections, setUserSelections] = useState({}); // { challengeId: selectedVal }
  const [activeChallenge, setActiveChallenge] = useState(null); // challenge object currently opened
  const [isChecked, setIsChecked] = useState(false);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const round = data.rounds[currentRoundIdx];

  const handleSelectWord = (challenge, opt) => {
    setUserSelections(prev => ({ ...prev, [challenge.id]: opt }));
    setActiveChallenge(null);
  };

  const handleCheck = () => {
    // Validate if all challenges match the correct answer
    const allCorrect = round.challenges.every(c => userSelections[c.id] === c.correct);
    setIsChecked(true);
    if (allCorrect) {
      setRoundCompleted(true);
    }
  };

  const handleNextRound = () => {
    setIsChecked(false);
    setRoundCompleted(false);
    setUserSelections({});
    
    if (currentRoundIdx < data.rounds.length - 1) {
      setCurrentRoundIdx(prev => prev + 1);
    } else {
      setGameComplete(true);
    }
  };

  const handleReset = () => {
    setCurrentRoundIdx(0);
    setUserSelections({});
    setActiveChallenge(null);
    setIsChecked(false);
    setRoundCompleted(false);
    setGameComplete(false);
  };

  const renderDraftText = () => {
    let text = round.rawText;
    
    // Replace [word] placeholders with clickable elements
    const parts = [];
    let remaining = text;

    while (remaining.includes('[') && remaining.includes(']')) {
      const startIdx = remaining.indexOf('[');
      const endIdx = remaining.indexOf(']');
      
      // text before bracket
      parts.push(remaining.substring(0, startIdx));
      
      const targetPlaceholder = remaining.substring(startIdx + 1, endIdx);
      const chal = round.challenges.find(c => c.target === targetPlaceholder || c.options.includes(targetPlaceholder));
      
      if (chal) {
        const userChoice = userSelections[chal.id];
        const isWrong = isChecked && userChoice !== chal.correct;
        const isRight = isChecked && userChoice === chal.correct;
        
        let borderCol = '#cbd5e1';
        let bgCol = '#f1f5f9';
        let textCol = '#475569';

        if (userChoice) {
          borderCol = '#3b82f6';
          bgCol = '#eff6ff';
          textCol = '#1d4ed8';
        }
        if (isRight) {
          borderCol = '#10b981';
          bgCol = '#ecfdf5';
          textCol = '#047857';
        }
        if (isWrong) {
          borderCol = '#ef4444';
          bgCol = '#fef2f2';
          textCol = '#b91c1c';
        }

        parts.push(
          <button
            key={chal.id}
            onClick={() => !isChecked && setActiveChallenge(chal)}
            style={{
              padding: '0.2rem 0.8rem',
              margin: '0 0.25rem',
              borderRadius: '8px',
              border: `2px solid ${borderCol}`,
              background: bgCol,
              color: textCol,
              fontWeight: 800,
              cursor: isChecked ? 'default' : 'pointer',
              fontSize: '1.05rem',
              transition: 'all 0.15s'
            }}
          >
            {userChoice || targetPlaceholder}
          </button>
        );
      } else {
        parts.push(`[${targetPlaceholder}]`);
      }

      remaining = remaining.substring(endIdx + 1);
    }
    parts.push(remaining);

    return <div style={{ fontSize: '1.25rem', lineHeight: '2', color: '#1e293b', fontWeight: 600 }}>{parts}</div>;
  };

  if (gameComplete) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '3rem 2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
          <Trophy size={64} color="#eab308" style={{ marginBottom: '1.2rem', marginInline: 'auto' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b', margin: '0 0 0.5rem 0' }}>Perfect Editing!</h2>
          <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '2rem' }}>{data.win}</p>
          <button 
            onClick={handleReset}
            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.8rem 2.2rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={18} /> {data.restartBtn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem' }}>
      <button 
        onClick={() => navigate('/activities')} 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '12px', cursor: 'pointer', color: '#475569', fontSize: '0.9rem', fontWeight: 700, marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
      >
        <ArrowLeft size={18} /> Back to Activities
      </button>

      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        
        {/* Banner */}
        <div style={{ background: 'linear-gradient(135deg, #a855f7, #7e22ce)', borderRadius: '24px', padding: '1.8rem', color: 'white', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 0.4rem 0' }}>✍️ {data.title}</h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>{data.desc}</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.6rem 1.2rem', borderRadius: '20px', fontWeight: 800 }}>
            Round {currentRoundIdx + 1} / {data.rounds.length}
          </div>
        </div>

        {round && (
          <div>
            
            {/* Editor Canvas card */}
            <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#7e22ce', background: '#f3e8ff', fontWeight: 900, padding: '0.3rem 0.8rem', borderRadius: '8px', textTransform: 'uppercase', display: 'inline-block', marginBottom: '1.5rem' }}>
                {round.name}
              </span>
              
              {renderDraftText()}
            </div>

            {/* Modal-like Inline Dropdown selector */}
            {activeChallenge && (
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.92rem', color: '#475569', fontWeight: 800 }}>
                  Choose correction for "{activeChallenge.target}":
                </h4>
                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                  {activeChallenge.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleSelectWord(activeChallenge, opt)}
                      style={{
                        background: 'white',
                        border: '1px solid #cbd5e1',
                        borderRadius: '12px',
                        padding: '0.6rem 1.2rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        color: '#1e293b',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                        transition: 'all 0.15s'
                      }}
                      onMouseOver={e => e.currentTarget.style.borderColor = '#7e22ce'}
                      onMouseOut={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Validation Tips Cards */}
            {isChecked && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                
                {/* Rules cards checklist */}
                {round.challenges.map(chal => {
                  const userChoice = userSelections[chal.id];
                  const isCorrect = userChoice === chal.correct;

                  return (
                    <div 
                      key={chal.id}
                      style={{
                        padding: '1.2rem',
                        borderRadius: '18px',
                        background: isCorrect ? '#ecfdf5' : '#fff5f5',
                        border: `1px solid ${isCorrect ? '#a7f3d0' : '#feb2b2'}`,
                        color: isCorrect ? '#065f46' : '#991b1b',
                        fontSize: '0.92rem',
                        lineHeight: 1.5
                      }}
                    >
                      <p style={{ margin: '0 0 0.3rem 0', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        "{userChoice || chal.target}": {isCorrect ? 'Correct!' : `Incorrect (Expected: "${chal.correct}")`}
                      </p>
                      <span style={{ fontWeight: 600, display: 'block', marginTop: '0.4rem', opacity: 0.85 }}>
                        {data.hintTitle} {chal.tip}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Actions Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              {!isChecked ? (
                <button
                  onClick={handleCheck}
                  disabled={round.challenges.some(c => !userSelections[c.id])}
                  style={{
                    background: round.challenges.every(c => userSelections[c.id]) ? '#7e22ce' : '#cbd5e1',
                    color: 'white',
                    border: 'none',
                    padding: '1rem 3rem',
                    borderRadius: '16px',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    cursor: round.challenges.every(c => userSelections[c.id]) ? 'pointer' : 'not-allowed'
                  }}
                >
                  {data.submitBtn}
                </button>
              ) : (
                <button
                  onClick={handleNextRound}
                  style={{
                    background: '#7e22ce',
                    color: 'white',
                    border: 'none',
                    padding: '1rem 3rem',
                    borderRadius: '16px',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {currentRoundIdx === data.rounds.length - 1 ? 'Publish Articles' : data.nextRoundBtn}
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default GrammarEditor;
