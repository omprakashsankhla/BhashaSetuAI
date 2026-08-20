import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Mic, Square, CheckCircle, RotateCcw, ChevronRight, Volume2 } from 'lucide-react';
import './SpeechPrep.css';
import { API_BASE_URL } from '../../config/api';

const SPEECH_LANG_DATA = {
  hi: {
    title: "भाषण एवं वाद-विवाद तैयारी",
    desc: "एक विषय चुनें, उस पर मौखिक रूप से विचार व्यक्त करें और एआई भाषण कोच से तुरंत प्रतिक्रिया प्राप्त करें।",
    startBtn: "रिकॉर्डिंग शुरू करें",
    stopBtn: "रिकॉर्डिंग रोकें",
    evaluateBtn: "भाषण का मूल्यांकन करें",
    retryBtn: "पुनः प्रयास करें",
    nextBtn: "अगला विषय",
    timerLabel: "भाषण समय:",
    heardLabel: "आपके द्वारा बोला गया भाषण (Transcript):",
    coachFeedbackLabel: "एआई भाषण कोच की समीक्षा (Feedback):",
    evaluatingLabel: "कोच आपके भाषण का विश्लेषण कर रहा है...",
    tipsTitle: "💡 तैयारी के मुख्य बिंदु (Tips):",
    prompts: [
      { id: 1, topic: "सोशल मीडिया का युवा पीढ़ी पर प्रभाव", tips: ["सकारात्मक प्रभाव जैसे ज्ञान साझा करना बताएं।", "नकारात्मक प्रभाव जैसे समय की बर्बादी पर चर्चा करें।", "निष्कर्ष में संतुलित उपयोग का सुझाव दें।"] },
      { id: 2, topic: "जलवायु परिवर्तन और हमारा कर्तव्य", tips: ["ग्लोबल वार्मिंग के मुख्य कारणों का उल्लेख करें।", "दैनिक जीवन में प्लास्टिक और प्रदूषण कम करने के उपाय बताएं।", "आने वाली पीढ़ियों के प्रति जिम्मेदारी स्पष्ट करें।"] },
      { id: 3, topic: "ऑनलाइन बनाम पारंपरिक शिक्षा प्रणाली", tips: ["ऑनलाइन शिक्षा की लचीलापन और सुलभता पर चर्चा करें।", "पारंपरिक क्लासरूम के सामाजिक अनुशासन को स्पष्ट करें।", "दोनों के मेल (हाइब्रिड मॉडल) पर अपनी राय दें।"] },
      { id: 4, topic: "कृत्रिम बुद्धिमत्ता (AI) और रोजगार का भविष्य", tips: ["एआई से उत्पन्न होने वाले नए तकनीकी अवसरों को बताएं।", "पारंपरिक नौकरियों के विस्थापन की चिंताओं को संबोधित करें।", "कौशल विकास (upskilling) के महत्व को रेखांकित करें।"] },
      { id: 5, topic: "सांस्कृतिक धरोहर का संरक्षण क्यों आवश्यक है?", tips: ["अपनी संस्कृति और परंपराओं के गौरव को समझाएं।", "आधुनिकता के बीच पुरानी धरोहरों के संरक्षण की चुनौतियों को बताएं।", "युवाओं को ऐतिहासिक स्थलों के प्रति जागरूक करने के तरीके सुझाएं।"] },
      { id: 6, topic: "शारीरिक और मानसिक स्वास्थ्य का अंतःसंबंध", tips: ["योग और स्वस्थ आहार की भूमिका बताएं।", "तनाव और आधुनिक जीवनशैली के मानसिक प्रभावों पर चर्चा करें।", "स्वस्थ मन में ही स्वस्थ शरीर का वास होता है, इसे स्पष्ट करें।"] },
      { id: 7, topic: "ग्रामीण विकास और डिजिटल इंडिया योजना", tips: ["गाँवों में इंटरनेट और ऑनलाइन बैंकिंग के फायदों को बताएं।", "कृषि में आधुनिक तकनीक के उपयोग पर चर्चा करें।", "शहरों की ओर पलायन रोकने के उपाय सुझाएं।"] },
      { id: 8, topic: "अंतरिक्ष अन्वेषण पर भारी खर्च: सही या गलत?", tips: ["वैज्ञानिक खोजों और भविष्य के मानव जीवन के पक्ष में तर्क दें।", "पृथ्वी पर मौजूद गरीबी और भूख की समस्याओं की तुलना करें।", "निष्कर्ष में एक संतुलित विकास नीति का सुझाव दें।"] }
    ]
  },
  en: {
    title: "Speech & Debate Prep",
    desc: "Select a topic, record your spoken thoughts, and get feedback from our AI Speech Coach.",
    startBtn: "Start Recording",
    stopBtn: "Stop Recording",
    evaluateBtn: "Evaluate Speech",
    retryBtn: "Retry Speech",
    nextBtn: "Next Topic",
    timerLabel: "Speech Timer:",
    heardLabel: "Your Spoken Transcript:",
    coachFeedbackLabel: "AI Speech Coach Review:",
    evaluatingLabel: "Analyzing your speech metrics...",
    tipsTitle: "💡 Preparation Tips:",
    prompts: [
      { id: 1, topic: "Impact of Social Media on the Youth", tips: ["Discuss positive outcomes like global networking.", "Discuss negative issues like mental pressure.", "Conclude with balanced digital wellness suggestions."] },
      { id: 2, topic: "Climate Change Action", tips: ["Outline prime indicators of global warming.", "Suggest simple everyday changes to minimize plastic waste.", "Clarify our responsibility to future generations."] },
      { id: 3, topic: "Online Education vs. Traditional Classrooms", tips: ["Discuss convenience and global access variables.", "Highlight the value of classroom discipline.", "Argue in favor of a hybrid approach."] },
      { id: 4, topic: "Artificial Intelligence and the Job Market", tips: ["Explore new employment domains created by tech.", "Address worries regarding traditional job shifts.", "Emphasize lifelong learning and upskilling."] },
      { id: 5, topic: "Preservation of Cultural Heritage", tips: ["Explain the value of maintaining historical legacies.", "Discuss issues in safeguarding traditions.", "Suggest methods to inspire young conservationists."] },
      { id: 6, topic: "Physical Health and Mental Well-being", tips: ["Detail the link between regular exercise and mood.", "Address modern stress management issues.", "Summarize with daily lifestyle advice."] },
      { id: 7, topic: "Rural Infrastructure and Digitization", tips: ["Outline benefits of rural internet connectivity.", "Discuss smart agricultural methods.", "Explore options to reduce urban migration pressure."] },
      { id: 8, topic: "Is Space Exploration Expenditure Justified?", tips: ["Highlight scientific breakthroughs and future resource prospects.", "Address immediate challenges like poverty and hunger.", "Propose a coordinated funding equilibrium."] }
    ]
  }
};

const fallbacks = ['mwr', 'ta', 'te', 'bn', 'mr', 'ur'];
fallbacks.forEach(lang => {
  SPEECH_LANG_DATA[lang] = SPEECH_LANG_DATA['hi'];
});

// Specialize Tamil & Telugu mappings
SPEECH_LANG_DATA.ta = {
  title: "பேச்சு மற்றும் விவாதப் பயிற்சி (Speech Prep)",
  desc: "ஒரு தலைப்பைத் தேர்வு செய்து, உங்கள் கருத்துக்களை வாய்மொழியாகப் பேசி, ஏஐ பேச்சு பயிற்சியாளரிடம் இருந்து மதிப்பீட்டைப் பெறுங்கள்.",
  startBtn: "பதிவு செய்யத் தொடங்கு",
  stopBtn: "பதிவு செய்வதை நிறுத்து",
  evaluateBtn: "பேச்சை மதிப்பிடுக",
  retryBtn: "மீண்டும் பேசுக",
  nextBtn: "அடுத்த தலைப்பு",
  timerLabel: "பேச்சு நேரம்:",
  heardLabel: "உங்களது பேச்சு உரை:",
  coachFeedbackLabel: "ஏஐ பேச்சு பயிற்சியாளர் மதிப்பீடு:",
  evaluatingLabel: "உங்கள் பேச்சை அலசுகிறது...",
  tipsTitle: "💡 ஆயத்தக் குறிப்புகள் (Tips):",
  prompts: [
    { id: 1, topic: "இளைஞர்களிடம் சமூக ஊடகங்களின் தாக்கம்", tips: ["உலகளாவிய நெட்வொர்க்கிங் போன்ற நேர்மறை விளைவுகளைப் பேசுக.", "மன அழுத்தம் போன்ற எதிர்மறைப் பிரச்சினைகளைக் குறிப்பிடுக.", "முடிவாக டிஜிட்டல் நலத்திற்கான ஆலோசனைகளைத் தருக."] },
    { id: 2, topic: "காலநிலை மாற்றம் - நம் கடமை", tips: ["புவி வெப்பமயமாதலின் முக்கிய அறிகுறிகளைப் பட்டியலிடுக.", "நெகிழிப் பயன்பாட்டைக் குறைப்பதற்கான எளிய வழிகளைக் கூறுக.", "வருங்காலத் தலைமுறையினருக்கான நம் கடமையை விளக்குக."] },
    { id: 3, topic: "ஆன்லைன் கல்வி மற்றும் வகுப்பறைக் கல்வி", tips: ["ஆன்லைன் கல்வியின் வசதிகளையும் வாய்ப்புகளையும் விவாதிக்கவும்.", "வகுப்பறை ஒழுக்கத்தின் முக்கியத்துவத்தை விளக்கவும்.", "இரண்டும் கலந்த ஹைப்ரிட் முறை பற்றி விவாதிக்கவும்."] },
    { id: 4, topic: "செயற்கை நுண்ணறிவும் வேலைவாய்ப்புகளும்", tips: ["தொழில்நுட்பத்தால் உருவாகும் புதிய வேலைவாய்ப்புகளை ஆராய்க.", "சாதாரண வேலைவாய்ப்பு இழப்பு பற்றிய அச்சங்களைப் பேசுக.", "திறன்களை மேம்படுத்துவதன் முக்கியத்துவத்தை விளக்குக."] }
  ]
};

SPEECH_LANG_DATA.te = {
  title: "ఉపన్యాసం మరియు విவாத సాధన (Speech Prep)",
  desc: "ఒక అంశాన్ని ఎంచుకోండి, మీ ఆలోచనలను మాట్లాడండి మరియు ఏఐ స్పీచ్ కోచ్ నుండి సమీక్షను పొందండి.",
  startBtn: "రికార్డింగ్ ప్రారంభించు",
  stopBtn: "రికార్డింగ్ ఆపు",
  evaluateBtn: "ఉపన్యాసాన్ని సమీక్షించు",
  retryBtn: "మళ్లీ ప్రయత్నించు",
  nextBtn: "తదుపరి అంశం",
  timerLabel: "సమయం:",
  heardLabel: "మీరు మాట్లాడినది:",
  coachFeedbackLabel: "ఏఐ స్పీచ్ కోచ్ సమీక్ష:",
  evaluatingLabel: "మీ ఉపన్యాసాన్ని విశ్లేషిస్తోంది...",
  tipsTitle: "💡 కొన్ని ముఖ్యమైన చిట్కాలు (Tips):",
  prompts: [
    { id: 1, topic: "యువతపై సోషల్ మీడియా ప్రభావం", tips: ["సమాచార మార్పిడి లాంటి ప్రయోజనాలను చర్చించండి.", "సమయం వృథా కావడం వంటి ప్రతికూలతలను వివరించండి.", "ముగింపులో సమతుల్య వినియోగాన్ని సూచించండి."] },
    { id: 2, topic: "వాతావరణ మార్పులు - మన బాధ్యత", tips: ["గ్లోబల్ వార్మింగ్ కు గల ప్రధాన కారణాలను చెప్పండి.", "ప్లాస్టిక్ వాడకాన్ని తగ్గించే మార్గాలను సూచించండి.", "భవిష్యత్ తరాల పట్ల మన బాధ్యతను స్పష్టం చేయండి."] },
    { id: 3, topic: "ఆన్‌లైన్ విద్య వర్సెస్ సాంప్రదాయ తరగతులు", tips: ["ఆన్‌లైన్ విద్య అందించే సౌలభ్యాన్ని చర్చించండి.", "తరగతి గదిలో లభించే క్రమశిక్షణను వివరించండి.", "రెంటి కలయిక (హైబ్రిడ్) ప్రాముఖ్యతను చెప్పండి."] },
    { id: 4, topic: "కృత్రిమ మేధస్సు (AI) మరియు ఉపాధి అవకాశాలు", tips: ["కొత్త టెక్నాలజీ రంగంలో వచ్చే ఉద్యోగాలను వివరించండి.", "ఉద్యోగ నష్టాలపై ఆందోళనలను ప్రస్తావించండి.", "నైపుణ్యాల అభివృద్ధి (upskilling) ప్రాముఖ్యతను చెప్పండి."] }
  ]
};

const SpeechPrep = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

    let currentLang = 'hi';
  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    currentLang = storedUser.learning_language || 'hi';
  } catch (e) {}
  const data = SPEECH_LANG_DATA[currentLang] || SPEECH_LANG_DATA['hi'];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [timer, setTimer] = useState(0);

  const [aiFeedback, setAiFeedback] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedbackReceived, setFeedbackReceived] = useState(false);

  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    setCurrentIndex(0);
    setTranscript('');
    setAiFeedback('');
    setFeedbackReceived(false);
    setTimer(0);
  }, [currentLang]);

  // Setup speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      const LANG_REC_MAP = { hi: 'hi-IN', ur: 'ur-PK', mwr: 'hi-IN', ta: 'ta-IN', te: 'te-IN', bn: 'bn-IN', mr: 'mr-IN', en: 'en-US' };
      recognition.lang = LANG_REC_MAP[currentLang] || 'en-US';

      let finalText = '';

      recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += t + ' ';
          } else {
            interim = t;
          }
        }
        setTranscript(finalText + interim);
      };

      recognition.onend = () => {
        if (isRecording) {
          try { recognition.start(); } catch (e) {}
        }
      };

      recognition.onerror = (e) => {
        console.error('SpeechRecognition error:', e.error);
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          stopRecording();
        }
      };

      recognitionRef.current = recognition;
    }
  }, [isRecording, currentLang]);

  const currentPrompt = data.prompts[currentIndex];

  const startRecording = () => {
    setTranscript('');
    setAiFeedback('');
    setFeedbackReceived(false);
    setTimer(0);
    setIsRecording(true);

    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    if (recognitionRef.current) {
      try { recognitionRef.current.start(); } catch (e) {}
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getFeedback = async () => {
    if (!transcript.trim() || !currentPrompt) return;
    setIsEvaluating(true);

    const systemPrompt = `You are an advanced language and debate speech coach. The student was given this speech topic:
"${currentPrompt.topic}"

Tips:
${currentPrompt.tips.map(t => `- ${t}`).join('\n')}

Spoken speech transcript (spoken in ${currentLang === 'hi' ? 'Hindi' : currentLang === 'ta' ? 'Tamil' : currentLang === 'te' ? 'Telugu' : 'English'}):
"${transcript}"

Spoken time: ${formatTime(timer)}.
Evaluate their speech and provide feedback ONLY in the student's target language (${currentLang === 'hi' ? 'Hindi' : currentLang === 'ta' ? 'Tamil' : currentLang === 'te' ? 'Telugu' : 'English'}).
Structure your feedback:
1. **Overall Evaluation** (समग्र प्रभाव)
2. **Grammar & Lexicon** (व्याकरण और शब्दावली)
3. **Coherence & Structure** (तर्क और स्पष्टता)
4. **Suggestions for Improvement** (सुधार के बिंदु)
5. **Coach Score: X/10**`;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/activities/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          systemPrompt: systemPrompt,
          messages: [{ role: 'user', content: 'Evaluate my speech.' }]
        })
      });

      if (res.ok) {
        const resData = await res.json();
        setAiFeedback(resData.reply);
      } else {
        setAiFeedback('Unable to analyze speech at this time.');
      }
    } catch (err) {
      setAiFeedback('Network error. Check internet connection.');
    } finally {
      setIsEvaluating(false);
      setFeedbackReceived(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < data.prompts.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTranscript('');
      setAiFeedback('');
      setFeedbackReceived(false);
      setTimer(0);
    } else {
      navigate('/activities');
    }
  };

  const handleRetry = () => {
    setTranscript('');
    setAiFeedback('');
    setFeedbackReceived(false);
    setTimer(0);
  };

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
        <div style={{ background: 'linear-gradient(135deg, #ec4899, #db2777)', borderRadius: '24px', padding: '2rem', color: 'white', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 0.4rem 0' }}>🎙️ {data.title}</h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>{data.desc}</p>
        </div>

        {currentPrompt && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Topic Deck Card */}
            <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
              <span style={{ fontSize: '0.78rem', color: '#db2777', background: '#fdf2f8', fontWeight: 900, padding: '0.3rem 0.8rem', borderRadius: '8px', textTransform: 'uppercase', display: 'inline-block', marginBottom: '0.8rem' }}>
                Topic {currentIndex + 1}
              </span>
              <h2 style={{ fontSize: '1.6rem', color: '#1e293b', fontWeight: 800, margin: '0 0 1.5rem 0', lineHeight: 1.4 }}>
                {currentPrompt.topic}
              </h2>

              <div style={{ background: '#f8fafc', padding: '1.2rem 1.5rem', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 0.8rem 0', color: '#475569', fontSize: '0.95rem', fontWeight: 800 }}>
                  {data.tipsTitle}
                </h4>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, fontWeight: 600 }}>
                  {currentPrompt.tips.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recorder controls */}
            <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {isRecording ? (
                  <button
                    onClick={stopRecording}
                    style={{ background: '#ef4444', color: 'white', border: 'none', width: '60px', height: '60px', borderRadius: '50%', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 10px rgba(239,68,68,0.2)' }}
                  >
                    <Square size={20} />
                  </button>
                ) : (
                  <button
                    onClick={startRecording}
                    style={{ background: '#ec4899', color: 'white', border: 'none', width: '60px', height: '60px', borderRadius: '50%', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 10px rgba(236,72,153,0.2)' }}
                  >
                    <Mic size={22} />
                  </button>
                )}
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>
                  {data.timerLabel} <span style={{ color: '#ec4899' }}>{formatTime(timer)}</span>
                </div>
              </div>

              {transcript && (
                <div style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.2rem', boxSizing: 'border-box' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                    {data.heardLabel}
                  </span>
                  <p style={{ margin: 0, fontSize: '0.98rem', color: '#1e293b', fontWeight: 600, lineHeight: 1.5 }}>
                    "{transcript}"
                  </p>
                </div>
              )}

              {/* Action buttons */}
              {transcript && !isRecording && !feedbackReceived && (
                <button
                  onClick={getFeedback}
                  disabled={isEvaluating}
                  style={{
                    background: '#ec4899',
                    color: 'white',
                    border: 'none',
                    padding: '0.8rem 2.2rem',
                    borderRadius: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: '0.95rem'
                  }}
                >
                  {isEvaluating ? data.evaluatingLabel : data.evaluateBtn}
                </button>
              )}
            </div>

            {/* Coach evaluation feed */}
            {aiFeedback && (
              <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)' }}>
                <h3 style={{ margin: '0 0 1.2rem 0', fontSize: '1.15rem', color: '#1e293b', fontWeight: 900 }}>
                  {data.coachFeedbackLabel}
                </h3>
                <pre style={{ margin: 0, padding: '1.2rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', fontFamily: 'inherit', fontSize: '1rem', lineHeight: '1.7', whiteSpace: 'pre-wrap', color: '#334155', fontWeight: 600 }}>
                  {aiFeedback}
                </pre>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.8rem' }}>
                  <button
                    onClick={handleRetry}
                    style={{ background: 'white', border: '1px solid #cbd5e1', color: '#475569', padding: '0.8rem 2rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontSize: '0.92rem' }}
                  >
                    <RotateCcw size={15} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} /> {data.retryBtn}
                  </button>
                  <button
                    onClick={handleNext}
                    style={{ background: '#ec4899', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontSize: '0.92rem' }}
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

export default SpeechPrep;
