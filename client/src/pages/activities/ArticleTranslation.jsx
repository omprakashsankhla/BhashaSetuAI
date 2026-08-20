import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Star, Volume2, CheckCircle, ChevronRight, RotateCcw, Trophy } from 'lucide-react';
import { speakText as ttsSpeak } from '../../utils/ttsHelper';
import './ArticleTranslation.css';
import { API_BASE_URL } from '../../config/api';

const TRANSLATION_LANG_DATA = {
  hi: {
    title: "लेख अनुवाद अभ्यास (Article Translation)",
    desc: "नीचे दिए गए जटिल गद्यांशों को ध्यान से पढ़ें और उनका अपनी भाषा में अनुवाद या सार लिखें।",
    win: "अद्भुत! आपने सभी जटिल गद्यांशों का अनुवाद सफलतापूर्वक पूरा कर लिया है।",
    speakBtn: "गद्यांश सुनें",
    userTransPlaceholder: "यहाँ अपना अनुवाद या सारांश लिखें...",
    submitBtn: "अनुवाद का मूल्यांकन करें",
    evaluating: "एआई अनुवादक आपकी प्रतिक्रिया का मूल्यांकन कर रहा है...",
    coachFeedbackTitle: "अनुवादक रिपोर्ट (Translation Review):",
    nextBtn: "अगला गद्यांश",
    restartBtn: "पुनः प्रयास करें",
    articles: [
      { id: 1, title: "प्रौद्योगिकी और समाज", text: "कृत्रिम बुद्धिमत्ता (AI) के विकास ने समाज में उत्पादकता को नए शिखर पर पहुंचा दिया है। हालांकि, इसने डेटा गोपनीयता और स्वचालित प्रणालियों के नैतिक नियंत्रण पर गंभीर बहस छेड़ दी है।" },
      { id: 2, title: "जलवायु परिवर्तन संकट", text: "वैश्विक तापमान में निरंतर वृद्धि ग्लेशियरों के पिघलने और समुद्र के जलस्तर के बढ़ने का मुख्य कारण है। यदि तत्काल कदम नहीं उठाए गए, तो पारिस्थितिक संतुलन पूरी तरह से बिगड़ जाएगा।" },
      { id: 3, title: "वैश्विक अर्थव्यवस्था का भविष्य", text: "डिजिटल मुद्राओं और ब्लॉकचेन तकनीक ने बैंकिंग प्रणालियों को रूपांतरित कर दिया है। यह विकेंद्रीकरण न केवल पारदर्शिता लाता है, बल्कि नए वित्तीय जोखिम भी प्रस्तुत करता है।" },
      { id: 4, title: "मानसिक स्वास्थ्य जागरूकता", text: "आधुनिक जीवनशैली में मानसिक तनाव एक मूक महामारी बन चुका है। हमें योग, ध्यान और सामाजिक संवाद को बढ़ावा देकर समाज में इसके प्रति संवेदनशीलता बढ़ानी होगी।" },
      { id: 5, title: "सांस्कृतिक संरक्षण का महत्व", text: "इतिहास और परंपराएं किसी भी समाज की रीढ़ होती हैं। वैश्वीकरण की आंधी में स्थानीय भाषाओं और शिल्पकला का संरक्षण करना हमारी सबसे बड़ी चुनौती है।" }
    ]
  },
  en: {
    title: "Article Translation Practice",
    desc: "Read the complex passages and write their detailed translation or summary in your own words.",
    win: "Fantastic! You completed all translation and summarization exercises successfully.",
    speakBtn: "Read Passage Aloud",
    userTransPlaceholder: "Write your translation or summary here...",
    submitBtn: "Submit Translation",
    evaluating: "The AI coach is evaluating your translation accuracy...",
    coachFeedbackTitle: "Translation Review Report:",
    nextBtn: "Next Passage",
    restartBtn: "Restart Session",
    articles: [
      { id: 1, title: "Technology and Society", text: "The advancement of Artificial Intelligence (AI) has pushed productivity to new heights. However, it has triggered serious debates on data privacy and the ethical control of automated systems." },
      { id: 2, title: "Climate Change Crisis", text: "Continuous rise in global temperature is the primary driver of melting glaciers and rising sea levels. If immediate actions are not taken, the ecological equilibrium will be permanently disrupted." },
      { id: 3, title: "Future of Global Economy", text: "Digital currencies and blockchain technology have transformed banking systems. This decentralization brings transparency but also introduces complex financial risks." },
      { id: 4, title: "Mental Health Awareness", text: "Mental stress has become a silent epidemic in modern lifestyles. We must raise social sensitivity by promoting yoga, mindfulness, and healthy community dialogues." },
      { id: 5, title: "Preserving Cultural Heritage", text: "History and traditions form the backbone of any community. Preserving local dialects and craftsmanship amid rapid globalization is our biggest collective challenge." }
    ]
  }
};

const fallbacks = ['mwr', 'ta', 'te', 'bn', 'mr', 'ur'];
fallbacks.forEach(lang => {
  TRANSLATION_LANG_DATA[lang] = TRANSLATION_LANG_DATA['hi'];
});

// Specialize Tamil & Telugu mappings
TRANSLATION_LANG_DATA.ta = {
  title: "கட்டுரை மொழிபெயர்ப்பு (Article Translation)",
  desc: "கீழே உள்ள கடினமான பத்திகளைப் படித்து, அவற்றை உங்கள் சொந்த சொற்களில் மொழிபெயர்க்கவும் அல்லது சுருக்கி எழுதவும்.",
  win: "அருமை! நீங்கள் அனைத்து மொழிபெயர்ப்புப் பயிற்சிகளையும் வெற்றிகரமாக முடித்துவிட்டீர்கள்.",
  speakBtn: "பத்தியைக் கேளுங்கள்",
  userTransPlaceholder: "உங்கள் மொழிபெயர்ப்பு அல்லது சுருக்கத்தை இங்கே எழுதவும்...",
  submitBtn: "மதிப்பீட்டைப் பெறு",
  evaluating: "உங்கள் மொழிபெயர்ப்பை ஏஐ மதிப்பிடுகிறது...",
  coachFeedbackTitle: "மொழிபெயர்ப்பு மதிப்பீடு (Review Report):",
  nextBtn: "அடுத்த பத்தி",
  restartBtn: "மீண்டும் தொடங்குக",
  articles: [
    { id: 1, title: "தொழில்நுட்பமும் சமூகமும்", text: "செயற்கை நுண்ணறிவின் (AI) வளர்ச்சி சமூகத்தின் உற்பத்தித் திறனைப் புதிய எல்லைக்குக் கொண்டு சென்றுள்ளது. எனினும், இது தரவுத் தனியுரிமை மற்றும் நெறிமுறை கட்டுப்பாடுகள் குறித்த விவாதங்களை எழுப்பியுள்ளது." },
    { id: 2, title: "காலநிலை மாற்ற நெருக்கடி", text: "உலகளாவிய வெப்பநிலை அதிகரிப்பு பனிப்பாறைகள் உருகுவதற்கும் கடல் மட்டம் உயர்வதற்கும் முதன்மைக் காரணமாகும். உடனடி நடவடிக்கை எடுக்காவிட்டால், சுற்றுச்சூழல் சமநிலை முற்றிலுமாகப் பாதிக்கப்படும்." }
  ]
};

TRANSLATION_LANG_DATA.te = {
  title: "వ్యాసాల అనువాద సాధన (Article Translation)",
  desc: "క్రింది క్లిష్టమైన భాగాలను చదివి, మీ స్వంత మాటలలో వాటిని అనువదించండి లేదా సారాంశాన్ని రాయండి.",
  win: "అభినందనలు! మీరు అన్ని అనువాద సాధనలను విజయవంతంగా పూర్తి చేశారు.",
  speakBtn: "భాగం వినండి",
  userTransPlaceholder: "మీ అనువాదం లేదా సారాంశం ఇక్కడ రాయండి...",
  submitBtn: "అనువాదాన్ని సమీక్షించు",
  evaluating: "ఏఐ కోచ్ మీ అనువాదాన్ని సమీక్షిస్తోంది...",
  coachFeedbackTitle: "అనువాద సమీక్ష నివేదిక (Review Report):",
  nextBtn: "తదుపరి భాగం",
  restartBtn: "మళ్లీ ప్రారంభించు",
  articles: [
    { id: 1, title: "సాంకేతికత మరియు సమాజం", text: "కృత్రిమ మేధస్సు (AI) అభివృద్ధి సమాజంలో ఉత్పాదకతను కొత్త శిఖరాలకు చేర్చింది. అయితే, ఇది డేటా గోప్యత మరియు నైతిక నియంత్రణపై తీవ్రమైన చర్చలను రేకెత్తించింది." },
    { id: 2, title: "వాతావరణ మార్పుల సంక్షోభం", text: "ప్రపంచ ఉష్ణోగ్రత నిరంతరం పెరగడం హిమానీనదాలు కరగడానికి మరియు సముద్ర మట్టాలు పెరగడానికి ప్రధాన కారణం. తక్షణ చర్యలు తీసుకోకపోతే పర్యావరణ సమతుల్యత దెబ్బతింటుంది." }
  ]
};

const ArticleTranslation = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  let currentLang = 'hi';
  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    currentLang = storedUser.learning_language || 'hi';
  } catch (e) {}
  const data = TRANSLATION_LANG_DATA[currentLang] || TRANSLATION_LANG_DATA['hi'];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userTranslation, setUserTranslation] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [graded, setGraded] = useState(false);

  const [completedCount, setCompletedCount] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const targetLang = storedUser.learning_language || 'hi';
        const interfaceLang = i18n.language || 'en';
        const res = await fetch(`${API_BASE_URL}/api/activities/article-translation?lang=${targetLang}&interfaceLang=${interfaceLang}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const resData = await res.json();
          setArticles(resData.items || []);
        }
      } catch (err) {
        console.error('Error fetching articles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [currentLang, i18n.language]);

  useEffect(() => {
    setCurrentIndex(0);
    setUserTranslation('');
    setAiFeedback('');
    setGraded(false);
    setCompletedCount(0);
    setGameComplete(false);
  }, [currentLang]);

  const currentArticle = articles[currentIndex];

  const speakText = () => {
    if (currentArticle) {
      ttsSpeak(currentArticle.text, { lang: currentLang, rate: 0.82 });
    }
  };

  const gradeTranslation = async () => {
    if (!userTranslation.trim() || !currentArticle) return;
    setIsEvaluating(true);

    const systemPrompt = `You are a professional language translation evaluator. The student was given the following passage to translate or summarize in their own words:

Original Text:
"${currentArticle.text}"

Student's Translation/Summary:
"${userTranslation}"

Please evaluate their work and provide a detailed review ONLY in the student's target language (${currentLang === 'hi' ? 'Hindi' : currentLang === 'ta' ? 'Tamil' : currentLang === 'te' ? 'Telugu' : 'English'}).
Provide feedback in the following structured format:
1. **Accuracy** (सटीकता) - Did they capture the core meaning?
2. **Grammar & Register** (व्याकरण और शिष्टाचार)
3. **Suggestions** (सुधार के लिए सुझाव)
4. **Overall Score: X/10**`;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/activities/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          systemPrompt,
          messages: [{ role: 'user', content: 'Evaluate my translation.' }]
        })
      });

      if (res.ok) {
        const resData = await res.json();
        setAiFeedback(resData.reply);
        setGraded(true);
        setCompletedCount(c => c + 1);
      } else {
        setAiFeedback('Unable to evaluate translation at this time.');
      }
    } catch (err) {
      setAiFeedback('Network error. Please try again later.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNext = () => {
    setAiFeedback('');
    setUserTranslation('');
    setGraded(false);

    if (currentIndex < articles.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      gameCompleteAction();
    }
  };

  const gameCompleteAction = () => {
    setGameComplete(true);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserTranslation('');
    setAiFeedback('');
    setGraded(false);
    setCompletedCount(0);
    setGameComplete(false);
  };

  if (gameComplete) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '3rem 2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
          <Trophy size={64} color="#eab308" style={{ marginBottom: '1.2rem', marginInline: 'auto' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b', margin: '0 0 0.5rem 0' }}>Translation Complete!</h2>
          <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '2rem' }}>{data.win}</p>
          <button 
            onClick={handleRestart}
            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.8rem 2.2rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RotateCcw size={18} /> {data.restartBtn}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#3b82f6' }}>Preparing articles and translation coach...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem' }}>
      
      {/* Header */}
      <button 
        onClick={() => navigate('/activities')} 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '12px', cursor: 'pointer', color: '#475569', fontSize: '0.9rem', fontWeight: 700, marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
      >
        <ArrowLeft size={18} /> Back to Activities
      </button>

      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        
        {/* Banner */}
        <div style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: '24px', padding: '1.8rem', color: 'white', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 0.4rem 0' }}>✍️ {data.title}</h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>{data.desc}</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.6rem 1.2rem', borderRadius: '20px', fontWeight: 800 }}>
            {currentIndex + 1} / {articles.length}
          </div>
        </div>

        {currentArticle && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Original Article Text */}
            <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)', position: 'relative' }}>
              <span style={{ fontSize: '0.78rem', color: '#2563eb', background: '#eff6ff', fontWeight: 900, padding: '0.3rem 0.8rem', borderRadius: '8px', textTransform: 'uppercase', display: 'inline-block', marginBottom: '0.8rem' }}>
                Article: {currentArticle.title}
              </span>
              
              <p style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 700, lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
                {currentArticle.text}
              </p>

              <button
                onClick={speakText}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 800,
                  color: '#475569',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Volume2 size={16} /> {data.speakBtn}
              </button>
            </div>

            {/* Translation Input Canvas */}
            <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', border: '1px solid #e2e8f0' }}>
              <textarea
                value={userTranslation}
                onChange={e => setUserTranslation(e.target.value)}
                disabled={graded}
                placeholder={data.userTransPlaceholder}
                rows={5}
                style={{
                  width: '100%',
                  border: '1px solid #cbd5e1',
                  borderRadius: '16px',
                  padding: '1.2rem',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontWeight: 600
                }}
              />

              {!graded && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.2rem' }}>
                  <button
                    onClick={gradeTranslation}
                    disabled={!userTranslation.trim() || isEvaluating}
                    style={{
                      background: userTranslation.trim() && !isEvaluating ? '#2563eb' : '#cbd5e1',
                      color: 'white',
                      border: 'none',
                      padding: '0.9rem 2.5rem',
                      borderRadius: '14px',
                      fontWeight: 800,
                      cursor: userTranslation.trim() && !isEvaluating ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {isEvaluating ? data.evaluating : data.submitBtn}
                  </button>
                </div>
              )}
            </div>

            {/* Translation feedback panel */}
            {aiFeedback && (
              <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)' }}>
                <h3 style={{ margin: '0 0 1.2rem 0', fontSize: '1.15rem', color: '#1e293b', fontWeight: 900 }}>
                  {data.coachFeedbackTitle}
                </h3>
                <pre style={{ margin: 0, padding: '1.2rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', fontFamily: 'inherit', fontSize: '1rem', lineHeight: '1.7', whiteSpace: 'pre-wrap', color: '#334155', fontWeight: 600 }}>
                  {aiFeedback}
                </pre>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.8rem' }}>
                  <button
                    onClick={handleNext}
                    style={{ background: '#2563eb', color: 'white', border: 'none', padding: '0.8rem 2.5rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontSize: '0.92rem' }}
                  >
                    {data.nextBtn}
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default ArticleTranslation;
