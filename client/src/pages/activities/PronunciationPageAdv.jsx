import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Mic, Volume2, CheckCircle2, AlertCircle, Play, Sparkles, Award } from 'lucide-react';
import { speakText as ttsSpeak, LANG_REC_MAP } from '../../utils/ttsHelper';

const ADV_PHRASES_BY_LANG = {
  hi: [
    { id: 1, text: 'खड़क सिंह के खड़कने से खड़कती हैं खिड़कियां, खिड़कियों के खड़कने से खड़कता है खड़क सिंह।', romanized: 'Khadaq Singh ke khadaqne se...', type: 'अनुप्रास (Tongue Twister)', description: 'उच्चारण स्पष्टता और जीभ की गति का परीक्षण करें।' },
    { id: 2, text: 'पीतल के पतीले में पपीता पीला-पीला।', romanized: 'Pital ke patile mein papita peela-peela...', type: 'अनुप्रास (Tongue Twister)', description: 'प और त अक्षरों के त्वरित दोहराव का अभ्यास।' },
    { id: 3, text: 'कच्चा पापड़ पक्का पापड़।', romanized: 'Kachha papad pakka papad...', type: 'अनुप्रास (Tongue Twister)', description: 'शीघ्र उच्चारण के लिए लघु वाक्यांश।' },
    { id: 4, text: 'समझ समझ के समझ को समझो, समझ समझना भी एक समझ है।', romanized: 'Samajh samajh ke samaj ko samajho...', type: 'अनुप्रास (Tongue Twister)', description: 'स और झ अक्षरों के अंतःसंबंध को समझें।' },
    { id: 5, text: 'चंदू के चाचा ने चंदू की चाची को चांदनी चौक में चांदी की चम्मच से चटनी चटाई।', romanized: 'Chandu ke chacha ne chandu ki chachi ko...', type: 'अनुप्रास (Tongue Twister)', description: 'च अक्षर के बार-बार उपयोग का अभ्यास।' },
    { id: 6, text: 'प्रशासनिक और संवैधानिक ढांचा अत्यंत जटिल है।', romanized: 'Prashasanik aur samvaidhanik dhancha...', type: 'उच्च स्तरीय वाक्य (Complex Phrase)', description: 'प्रशासनिक शब्दावली का अभ्यास।' },
    { id: 7, text: 'पर्यावरण संरक्षण प्रत्येक नागरिक का परम कर्तव्य है।', romanized: 'Paryavaran sanrakshan pratyek nagarik...', type: 'उच्च स्तरीय वाक्य (Complex Phrase)', description: 'सामाजिक चेतना और जटिल संयुक्ताक्षर।' },
    { id: 8, text: 'आत्मनिर्भरता और संकल्प से ही राष्ट्र सशक्त बनता है।', romanized: 'Aatmanirbharta aur sankalp se hi rashtra...', type: 'उच्च स्तरीय वाक्य (Complex Phrase)', description: 'गंभीर भाषण उच्चारण का अभ्यास।' },
    { id: 9, text: 'वैश्वीकरण के इस युग में तकनीकी ज्ञान अनिवार्य है।', romanized: 'Vaishvikaran ke is yug mein takneeki gyan...', type: 'उच्च स्तरीय वाक्य (Complex Phrase)', description: 'समकालीन और वैश्विक शब्दावली।' },
    { id: 10, text: 'सहानुभूति और करुणा ही मानवीय संबंधों का आधार हैं।', romanized: 'Sahanubhuti aur karuna hi manaviya...', type: 'उच्च स्तरीय वाक्य (Complex Phrase)', description: 'नैतिक और दार्शनिक शब्दावली।' }
  ],
  ta: [
    { id: 1, text: 'தத்தித் தாவுது தவளை, தத்தாமல் தாவுது தவளை.', romanized: 'Thathith thaavuthu thavalai...', type: 'நா நெகிழ் பயிற்சி (Tongue Twister)', description: 'த ஒலி உச்சரிப்பு வேகப்பயிற்சி.' },
    { id: 2, text: 'கொக்கு நெட்டக் கொக்கு, நெட்டக் கொக்கு இட்ட முட்டை கட்டை முட்டை.', romanized: 'Kokku nettak kokku...', type: 'நா நெகிழ் பயிற்சி (Tongue Twister)', description: 'க மற்றும் ட ஒலிகளின் உச்சரிப்புத் திறன்.' },
    { id: 3, text: 'துப்பாக்கிக்குத் துப்பாக்கி துப்பாக்கித் தூள்.', romanized: 'Thuppakkikkuth thuppakki...', type: 'நா நெகிழ் பயிற்சி (Tongue Twister)', description: 'வலிய எழுத்துக்களின் துல்லிய உச்சரிப்பு.' },
    { id: 4, text: 'யாழ் இனிது குழல் இனிது என்பர் மக்கள்.', romanized: 'Yaazh inithu kuzhal inithu...', type: 'இலக்கியத் தொடர் (Classical Phrase)', description: 'சிறப்பு ழகர (ழ், ள்) ஒலி உச்சரிப்பு.' },
    { id: 5, text: 'ஓடுற நரியில ஒரு நரி கிழ நரி, கிழ நரி முதுகில ஒரு பிடி நரைமுடி.', romanized: 'Odura nariyila oru nari kizha nari...', type: 'நா நெகிழ் பயிற்சி (Tongue Twister)', description: 'ரகர, ழகர வேறுபாடுகளைக் கண்டறியும் பயிற்சி.' },
    { id: 6, text: 'சுற்றுச்சூழல் பாதுகாப்பு ஒவ்வொரு குடிமகனின் முக்கிய கடமையாகும்.', romanized: 'Sutruchuzhal paathukaappu...', type: 'உயர்நிலை வாக்கியம் (Complex Phrase)', description: 'சமூக விழிப்புணர்வு மற்றும் கடின சொற்கள்.' },
    { id: 7, text: 'தொழில்நுட்ப வளர்ச்சி மனித வாழ்வை எளிதாக்குகிறது.', romanized: 'Thozhilnutpa valarchi manitha...', type: 'உயர்நிலை வாக்கியம் (Complex Phrase)', description: 'நவீன அறிவியல் சொற்களின் உச்சரிப்பு.' },
    { id: 8, text: 'பொருளாதார முன்னேற்றம் நாட்டின் வலிமையை உயர்த்தும்.', romanized: 'Porulaathaara munnetram...', type: 'உயர்நிலை வாக்கியம் (Complex Phrase)', description: 'நிதி சார்ந்த கலைச்சொற்கள்.' },
    { id: 9, text: 'நேர்மறையான சிந்தனைகள் நம் வாழ்க்கையை மேம்படுத்தும்.', romanized: 'Nermaraiyana sinthanaihal...', type: 'உயர்நிலை வாக்கியம் (Complex Phrase)', description: 'தத்துவ சொற்கள்.' },
    { id: 10, text: 'மனித நேயமும் கருணையும் சமூகத்தின் உன்னத நெறிகள்.', romanized: 'Manitha neyamum karunaiyum...', type: 'உயர்நிலை வாக்கியம் (Complex Phrase)', description: 'வாழ்வியல் விழுமியங்கள்.' }
  ],
  te: [
    { id: 1, text: 'కాకి కాక కాయా కాకికి కాక కాయా?', romanized: 'Kaki kaka kaya kakiki kaka kaya...', type: 'ఉచ్ఛారణ క్రీడ (Tongue Twister)', description: 'క వర్ణ ఉచ్ఛారణ వేగం.' },
    { id: 2, text: 'జలజ జలజల జలపాతం చూసి జలదరించింది.', romanized: 'Jalaja jalajala jalapatham chusi...', type: 'ఉచ్ఛారణ క్రీడ (Tongue Twister)', description: 'జ మరియు ల వర్ణాల పునరావృత్తి.' },
    { id: 3, text: 'నాలుగు నల్ల లారీలు, నాలుగు నల్ల లారీలు.', romanized: 'Nalugu nalla lareelu...', type: 'ఉచ్ఛారణ క్రీడ (Tongue Twister)', description: 'ల వర్ణ ఉచ్ఛారణ వేగం.' },
    { id: 4, text: 'బుజ్జి బాబు బజ్జీలు తిని బుజ్జగించాడు.',
      romanized: 'Bujji babu bajjeelu thini...', type: 'ఉచ్ఛారణ క్రీడ (Tongue Twister)', description: 'ద్విత్వాక్షరాల ఉచ్ఛారణ సాధన.' },
    { id: 5, text: 'కడప కడపకు గడప గడపకు దీపాలు పెట్టారు.', romanized: 'Kadapa kadapaku gadapa gadapaku...', type: 'ఉచ్ఛారణ క్రీడ (Tongue Twister)', description: 'డ మరియు ద వర్ణాల సాధన.' },
    { id: 6, text: 'సాంకేతిక పరిజ్ఞానం మానవ జీవన విధానాన్ని సులభతరం చేస్తుంది.', romanized: 'Sankethika parignanam manava...', type: 'క్లిష్టమైన వాక్యం (Complex Phrase)', description: 'ఆధునిక సాంకేతిక పదాల సాధన.' },
    { id: 7, text: 'పర్యావరణ పరిరక్షణ ప్రతి ఒక్కరి కనీస బాధ్యత.', romanized: 'Paryavarana parirakshana prati...', type: 'క్లిష్టమైన వాక్యం (Complex Phrase)', description: 'పర్యావరణ పదాల సున్నిత ఉచ్ఛారణ.' },
    { id: 8, text: 'అంకితభావం మరియు క్రమశిక్షణ విజయానికి మూలస్తంభాలు.', romanized: 'Ankithabhavam mariyu kramashikshana...', type: 'క్లిష్టమైన వాక్యం (Complex Phrase)', description: 'వ్యక్తిత్వ వికాస పదాలు.' },
    { id: 9, text: 'రాజ్యాంగ సవరణలు పార్లమెంటు ఆమోదం పొందాలి.', romanized: 'Rajyanga savaranalu parlementu...', type: 'క్లిష్టమైన వాక్యం (Complex Phrase)', description: 'రాజకీయ పరిపాలనా పదాలు.' },
    { id: 10, text: 'సానుభూతి మరియు కరుణ మానవ సంబంధాల పునాది.', romanized: 'Sanubhuthi mariyu karuna manava...', type: 'క్లిష్టమైన వాక్యం (Complex Phrase)', description: 'నైతిక సామాజిక పదాలు.' }
  ],
  en: [
    { id: 1, text: 'She sells seashells by the seashore.', romanized: 'She sells seashells...', type: 'Tongue Twister', description: 'Practice rapid shifting between s and sh sounds.' },
    { id: 2, text: 'Peter Piper picked a peck of pickled peppers.', romanized: 'Peter Piper...', type: 'Tongue Twister', description: 'Practice hard p consonant releases.' },
    { id: 3, text: 'Six slippery snails slid slowly seaward.', romanized: 'Six slippery snails...', type: 'Tongue Twister', description: 'Practice dental sibilant s speeds.' },
    { id: 4, text: 'Red lorry, yellow lorry.', romanized: 'Red lorry, yellow...', type: 'Tongue Twister', description: 'Practice alternating liquid r and l sounds.' },
    { id: 5, text: 'Betty Botter bought some butter but she said the butter\'s bitter.', romanized: 'Betty Botter bought...', type: 'Tongue Twister', description: 'Practice fast plosive b and dental t flaps.' },
    { id: 6, text: 'The constitutional amendments require comprehensive legislative support.', romanized: 'The constitutional...', type: 'Complex Phrase', description: 'Advanced vocabulary containing multiple syllables.' },
    { id: 7, text: 'Technological advancements facilitate sustainable global development.', romanized: 'Technological...', type: 'Complex Phrase', description: 'Societal development terminology.' },
    { id: 8, text: 'Psychological assessments evaluate cognitive and emotional capabilities.', romanized: 'Psychological...', type: 'Complex Phrase', description: 'Cognitive science vocabulary.' },
    { id: 9, text: 'Administrative operations demands maximum transparency and efficiency.', romanized: 'Administrative...', type: 'Complex Phrase', description: 'Business governance vocabulary.' },
    { id: 10, text: 'Environmental biodiversity guarantees ecological balance and resilience.', romanized: 'Environmental...', type: 'Complex Phrase', description: 'Scientific ecology terminology.' }
  ]
};

// Fallback logic for remaining regional languages
const fallbackLangs = ['mwr', 'bn', 'mr', 'ur'];
fallbackLangs.forEach(lang => {
  ADV_PHRASES_BY_LANG[lang] = ADV_PHRASES_BY_LANG['hi'];
});

// Specialize Urdu
ADV_PHRASES_BY_LANG.ur = [
  { id: 1, text: 'چاندنی رات میں چاندنی چمچ سے چٹنی چٹائی۔', romanized: 'Chandni raat mein...', type: 'زبان کی مشق (Tongue Twister)', description: 'حرف چ کے مکرر استعمال کی مشق۔' },
  { id: 2, text: 'کچا پاپڑ پکا پاپڑ۔', romanized: 'Kacha papad pakka...', type: 'زبان کی مشق (Tongue Twister)', description: 'تلفظ کو تیز اور واضح کرنے کی مشق۔' },
  { id: 3, text: 'لال ریل پیلی ریل۔', romanized: 'Laal rail peeli rail...', type: 'زبان کی مشق (Tongue Twister)', description: 'حروف ر اور ل کی فوری ادائیگی۔' },
  { id: 4, text: 'سمجھ سمجھ کے سمجھ کو سمجھو۔', romanized: 'Samajh samajh ke...', type: 'زبان کی مشق (Tongue Twister)', description: 'حروف س اور جھ کی پیچیدگی دور کرنا۔' },
  { id: 5, text: 'تقی نے تکیے کے نیچے تقاضا کیا۔', romanized: 'Taqi ne takye ke...', type: 'زبان کی مشق (Tongue Twister)', description: 'ت اور ق کی ادائیگی کی مشق۔' },
  { id: 6, text: 'آئینی اور انتظامی ڈھانچہ انتہائی پیچیدہ ہے۔', romanized: 'Aaeeni aur intizaami...', type: 'مشکل جملہ (Complex Phrase)', description: 'انتظامی اور عدالتی الفاظ کی مشق۔' },
  { id: 7, text: 'ماحولیاتی بقا ہر شہری کی اولین قومی ذمہ داری ہے۔', romanized: 'Maholiyati baqa har...', type: 'مشکل جملہ (Complex Phrase)', description: 'ماحولیاتی اصطلاحات کی ادائیگی۔' },
  { id: 8, text: 'خود انحصاری اور پختہ عزم ہی قوم کو خودمختار بناتا ہے۔', romanized: 'Khud inhisari aur pukhta...', type: 'مشکل جملہ (Complex Phrase)', description: 'فلسفیانہ اور جذباتی الفاظ۔' },
  { id: 9, text: 'جدید دور میں سائنسی اور تکنیکی مہارت ناگزیر ہو چکی ہے۔', romanized: 'Jadeed daur mein...', type: 'مشکل جملہ (Complex Phrase)', description: 'علمی اور تعلیمی اصطلاحات۔' },
  { id: 10, text: 'ہمدردی اور انسانی احترام ہی پرامن معاشرے کی بنیاد ہیں۔', romanized: 'Hamdardi aur insani...', type: 'مشکل جملہ (Complex Phrase)', description: 'اخلاقی اور تہذیبی اقدار۔' }
];



const PronunciationPageAdv = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

    let currentLang = 'hi';
  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    currentLang = storedUser.preferred_language || 'hi';
  } catch (e) {}
  const phrases = ADV_PHRASES_BY_LANG[currentLang] || ADV_PHRASES_BY_LANG['hi'];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState(null); // 'great' | 'try-again'
  const [transcript, setTranscript] = useState('');
  const [scores, setScores] = useState({}); // { phraseId: 'mastered' | 'failed' | 'pending' }

  const recognitionRef = useRef(null);

  useEffect(() => {
    setScores(phrases.reduce((acc, p) => {
      acc[p.id] = 'pending';
      return acc;
    }, {}));
    setCurrentIdx(0);
    setResult(null);
    setTranscript('');
  }, [currentLang]);

  const activePhrase = phrases[currentIdx];

  const startRecording = () => {
    setResult(null);
    setTranscript('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = LANG_REC_MAP[currentLang] || 'hi-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;

    recognition.onresult = (event) => {
      const allTrans = Array.from(event.results[0]).map(r => r.transcript.toLowerCase().trim());
      setTranscript(allTrans[0]);

      const expected = activePhrase.text.toLowerCase().trim()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?।]/g, ""); // strip punctuation

      // Match check: if spoken match matches or is closely contained
      const matched = allTrans.some(t => {
        const cleanedT = t.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?।]/g, "");
        return cleanedT.includes(expected) || expected.includes(cleanedT) || 
               cleanedT.split(" ").filter(w => expected.includes(w)).length > (expected.split(" ").length * 0.4);
      });

      if (matched) {
        setResult('great');
        setScores(prev => ({ ...prev, [activePhrase.id]: 'mastered' }));
      } else {
        setResult('try-again');
        setScores(prev => ({ ...prev, [activePhrase.id]: 'failed' }));
      }
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setResult('try-again');
      setScores(prev => ({ ...prev, [activePhrase.id]: 'failed' }));
    };

    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const speak = () => {
    ttsSpeak(activePhrase.text, { lang: currentLang, rate: 0.72 });
  };

  const masteredCount = Object.values(scores).filter(v => v === 'mastered').length;

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '2rem', color: '#f8fafc' }}>
      
      {/* Header */}
      <header style={{ maxWidth: '900px', margin: '0 auto 2.5rem auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={() => navigate('/activities')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#1e293b', border: '1px solid #334155', padding: '0.6rem 1.2rem', borderRadius: '12px', cursor: 'pointer', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 700 }}
        >
          <ArrowLeft size={18} /> {currentLang === 'hi' ? "पीछे जाएं" : "Back"}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#1e293b', padding: '0.6rem 1.2rem', borderRadius: '16px', border: '1px solid #334155' }}>
          <Award size={20} color="#eab308" />
          <span style={{ fontWeight: 800 }}>
            {currentLang === 'hi' ? `सफलता: ${masteredCount} / ${phrases.length}` : `Mastered: ${masteredCount} / ${phrases.length}`}
          </span>
        </div>
      </header>

      {/* Main Grid */}
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }}>
        
        {/* Left Sidebar List */}
        <div style={{ background: '#1e293b', borderRadius: '24px', padding: '1.2rem', border: '1px solid #334155', height: 'fit-content' }}>
          <h3 style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 1rem 0', letterSpacing: '0.05em', fontWeight: 800 }}>
            {currentLang === 'hi' ? "अभ्यास सूची" : "Practice List"}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {phrases.map((p, idx) => {
              const sc = scores[p.id];
              let dotColor = '#64748b';
              if (sc === 'mastered') dotColor = '#10b981';
              if (sc === 'failed') dotColor = '#ef4444';

              return (
                <button
                  key={p.id}
                  onClick={() => { setCurrentIdx(idx); setResult(null); setTranscript(''); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0.8rem 1rem',
                    background: currentIdx === idx ? '#334155' : 'transparent',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    color: currentIdx === idx ? 'white' : '#94a3b8',
                    fontWeight: 700,
                    textAlign: 'left',
                    transition: 'all 0.15s'
                  }}
                >
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
                    {idx + 1}. {p.text}
                  </span>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor }} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active Practice Deck */}
        {activePhrase && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '380px' }}>
            
            {/* Header info */}
            <div>
              <span style={{ background: '#3b82f6', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>
                {activePhrase.type}
              </span>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.6rem', fontWeight: 600 }}>
                {activePhrase.description}
              </p>

              {/* Text Card */}
              <div style={{ margin: '2rem 0', background: '#0f172a', border: '1px solid #334155', borderRadius: '20px', padding: '2rem', textAlign: 'center', position: 'relative' }}>
                
                {/* Speaker play audio */}
                <button
                  onClick={speak}
                  style={{ position: 'absolute', top: '15px', right: '15px', background: '#1e293b', border: '1px solid #334155', width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                  <Volume2 size={16} color="#3b82f6" />
                </button>

                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', lineHeight: '1.6', margin: '0 0 0.8rem 0' }}>
                  {activePhrase.text}
                </h1>
                <p style={{ margin: 0, color: '#64748b', fontSize: '1.05rem', fontStyle: 'italic' }}>
                  {activePhrase.romanized}
                </p>
              </div>
            </div>

            {/* Speaking / Feedback Triggers */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              
              {/* Mic buttons */}
              {isRecording ? (
                <button
                  onClick={stopRecording}
                  style={{
                    background: '#ef4444',
                    border: 'none',
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: '0 0 15px rgba(239,68,68,0.5)',
                    animation: 'pulse 1.5s infinite'
                  }}
                >
                  <span style={{ width: '20px', height: '20px', background: 'white', borderRadius: '3px' }} />
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  style={{
                    background: '#3b82f6',
                    border: 'none',
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: '0 0 15px rgba(59,130,246,0.3)',
                    transition: 'transform 0.15s'
                  }}
                >
                  <Mic size={32} color="white" />
                </button>
              )}

              <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>
                {isRecording ? (currentLang === 'hi' ? "बोलना जारी रखें..." : "Speaking...") : (currentLang === 'hi' ? "रिकॉर्ड करने के लिए माइक दबाएं" : "Tap microphone to record")}
              </p>

              {/* Speech transcription feedback */}
              {transcript && (
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem 1.5rem', borderRadius: '16px', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box', textAlign: 'center', border: '1px solid #334155' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
                    {currentLang === 'hi' ? "सुना गया शब्द:" : "Speech detected:"}
                  </span>
                  <span style={{ fontWeight: 700, color: '#f8fafc' }}>
                    "{transcript}"
                  </span>
                </div>
              )}

              {/* Accuracy alert boxes */}
              {result && (
                <div 
                  style={{
                    width: '100%',
                    padding: '1.2rem',
                    borderRadius: '16px',
                    background: result === 'great' ? '#064e3b' : '#7f1d1d',
                    border: `1px solid ${result === 'great' ? '#065f46' : '#991b1b'}`,
                    color: result === 'great' ? '#34d399' : '#f87171',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem',
                    fontWeight: 800,
                    fontSize: '1rem'
                  }}
                >
                  {result === 'great' ? (
                    <>
                      <CheckCircle2 size={20} />
                      <span>{currentLang === 'hi' ? "उत्कृष्ट उच्चारण! बहुत बढ़िया।" : "Excellent pronunciation! Great job."}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={20} />
                      <span>{currentLang === 'hi' ? "कृपया पुनः प्रयास करें।" : "Try again, practice makes perfect!"}</span>
                    </>
                  )}
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default PronunciationPageAdv;
