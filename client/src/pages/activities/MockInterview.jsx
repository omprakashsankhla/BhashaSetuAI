import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Star, Volume2, Trophy, Mic, UserCheck, RefreshCw, Send } from 'lucide-react';
import { speakText as ttsSpeak } from '../../utils/ttsHelper';
import { API_BASE_URL } from '../../config/api';

const INTERVIEW_DATA = {
  hi: {
    title: "नौकरी साक्षात्कार अभ्यास (Career Mock Interview)",
    desc: "एक पेशेवर इंटरव्यूअर के साथ नौकरी का साक्षात्कार दें और अपनी भाषा का परीक्षण करें।",
    startBtn: "साक्षात्कार शुरू करें",
    nextBtn: "भेजें",
    finishBtn: "मूल्यांकन प्राप्त करें",
    evaluating: "इंटरव्यूअर आपकी प्रतिक्रिया का मूल्यांकन कर रहा है...",
    feedbackTitle: "साक्षात्कार रिपोर्ट कार्ड (Performance Review)",
    scoreLabel: "कुल स्कोर:",
    roles: [
      { id: "software-engineer", title: "सॉफ्टवेयर इंजीनियर (Software Engineer)", icon: "💻", prompt: "You are a professional IT Hiring Manager conducting a technical interview for a Software Engineer position. Ask B2-level questions. Speak ONLY in Hindi. Ask 1 concise question at a time." },
      { id: "school-teacher", title: "स्कूल शिक्षक (School Teacher)", icon: "🏫", prompt: "You are a School Principal interviewing a candidate for a Teacher position. Ask about classroom management. Speak ONLY in Hindi. Ask 1 concise question at a time." },
      { id: "bank-clerk", title: "बैंक अधिकारी (Bank Officer)", icon: "🏦", prompt: "You are a Bank Branch Manager interviewing a candidate for a Bank Clerk position. Ask about customer service. Speak ONLY in Hindi. Ask 1 concise question at a time." },
      { id: "tourist-guide", title: "पर्यटक गाइड (Tourist Guide)", icon: "🗺️", prompt: "You are a Travel Agency Director interviewing a candidate for a Tourist Guide position. Ask about handling foreign tourists. Speak ONLY in Hindi. Ask 1 concise question at a time." },
      { id: "customer-care", title: "ग्राहक सेवा एजेंट (Customer Agent)", icon: "📞", prompt: "You are a Customer Service Manager interviewing a representative candidate. Ask about handling angry clients. Speak ONLY in Hindi. Ask 1 concise question at a time." },
      { id: "hotel-receptionist", title: "होटल स्वागतकर्ता (Hotel Desk)", icon: "🏨", prompt: "You are a Luxury Hotel Manager interviewing a Front Desk candidate. Ask about guest check-in courtesy. Speak ONLY in Hindi. Ask 1 concise question at a time." },
      { id: "hr-manager", title: "मानव संसाधन प्रबंधक (HR Recruiter)", icon: "👥", prompt: "You are a Director conducting an interview for an HR Executive. Ask about resolving office disputes. Speak ONLY in Hindi. Ask 1 concise question at a time." },
      { id: "office-admin", title: "कार्यालय प्रशासक (Office Admin)", icon: "📂", prompt: "You are a General Manager interviewing an Office Administrator. Ask about supply management. Speak ONLY in Hindi. Ask 1 concise question at a time." }
    ],
    greetings: {
      "software-engineer": "नमस्ते! आपका स्वागत है। हमारे पास आपके सॉफ्टवेयर इंजीनियर के आवेदन पत्र की कॉपी है। कृपया संक्षेप में बताएं कि आपने पिछले प्रोजेक्ट्स में कौन सी प्रोग्रामिंग भाषाओं का उपयोग किया है?",
      "school-teacher": "नमस्कार! आइए, बैठिए। आप हमारे विद्यालय में शिक्षक के पद के लिए आए हैं। आप बच्चों को किसी कठिन विषय को समझाने के लिए कौन सी शिक्षण पद्धति अपनाते हैं?",
      "bank-clerk": "नमस्ते! कृपया बैठिए। बैंकिंग में ग्राहकों के साथ विनम्रता से व्यवहार करना आवश्यक है। यदि कोई ग्राहक पासबुक प्रविष्टि के लिए लाइन में नाराज़ खड़ा हो, तो आप उसे कैसे समझाएंगे?",
      "tourist-guide": "नमस्कार! पर्यटक गाइड के पद के लिए आपका स्वागत है। मान लीजिए विदेशी पर्यटकों का एक दल स्थानीय स्मारकों को देखने आया है। आप उनका मार्गदर्शन कैसे शुरू करेंगे?",
      "customer-care": "नमस्ते! कस्टमर सर्विस में आपका स्वागत है। यदि कोई ग्राहक फोन पर बहुत गुस्से में चिल्ला रहा हो, तो आप उसे कैसे शांत करेंगे?",
      "hotel-receptionist": "नमस्कार! होटल लॉबी में आपका स्वागत है। जब कोई वीआईपी मेहमान होटल में आधी रात को चेक-इन के लिए आता है, तो आप उनकी अगवानी किस प्रकार करेंगे?",
      "hr-manager": "नमस्ते! बैठिए। ऑफिस में टीम के सदस्यों के बीच कभी-कभी आपसी विवाद हो जाता है। आप एक एचआर मैनेजर के रूप में इस विवाद को कैसे सुलझाएंगे?",
      "office-admin": "नमस्कार! आपका स्वागत है। एक ऑफिस एडमिनिस्ट्रेटर के रूप में आपको बहुत सारे कामों को एक साथ संभालना होता है। आप अपने दैनिक कार्यों की प्राथमिकताओं को कैसे तय करते हैं?"
    }
  },
  en: {
    title: "Career Mock Interview",
    desc: "Converse with a professional AI Recruiter in your chosen job sector to test your career skills.",
    startBtn: "Start Interview",
    nextBtn: "Submit Answer",
    finishBtn: "Get Performance Review",
    evaluating: "The Interviewer is evaluating your response...",
    feedbackTitle: "Performance Review Report Card",
    scoreLabel: "Overall Rating:",
    roles: [
      { id: "software-engineer", title: "Software Engineer", icon: "💻", prompt: "You are a professional IT Hiring Manager conducting a technical interview for a Software Engineer position. Ask B2-level questions. Speak ONLY in English. Ask 1 concise question at a time." },
      { id: "school-teacher", title: "School Teacher", icon: "🏫", prompt: "You are a School Principal interviewing a candidate for a Teacher position. Ask about classroom management. Speak ONLY in English. Ask 1 concise question at a time." },
      { id: "bank-clerk", title: "Bank Officer", icon: "🏦", prompt: "You are a Bank Branch Manager interviewing a candidate for a Bank Clerk position. Ask about customer service. Speak ONLY in English. Ask 1 concise question at a time." },
      { id: "tourist-guide", title: "Tourist Guide", icon: "🗺️", prompt: "You are a Travel Agency Director interviewing a candidate for a Tourist Guide position. Ask about handling tourists. Speak ONLY in English. Ask 1 concise question at a time." },
      { id: "customer-care", title: "Customer Agent", icon: "📞", prompt: "You are a Customer Service Manager interviewing a representative candidate. Ask about handling clients. Speak ONLY in English. Ask 1 concise question at a time." },
      { id: "hotel-receptionist", title: "Hotel Desk", icon: "🏨", prompt: "You are a Luxury Hotel Manager interviewing a Front Desk candidate. Ask about guest courtesy. Speak ONLY in English. Ask 1 concise question at a time." },
      { id: "hr-manager", title: "HR Recruiter", icon: "👥", prompt: "You are a Director conducting an interview for an HR Executive. Ask about disputes. Speak ONLY in English. Ask 1 concise question at a time." },
      { id: "office-admin", title: "Office Admin", icon: "📂", prompt: "You are a General Manager interviewing an Office Administrator. Ask about supply management. Speak ONLY in English. Ask 1 concise question at a time." }
    ],
    greetings: {
      "software-engineer": "Welcome! We have reviewed your software engineering application. Could you briefly summarize your experience with complex programming projects?",
      "school-teacher": "Good morning! Please take a seat. What teaching methodology do you find most effective when introducing a difficult subject to young pupils?",
      "bank-clerk": "Hello, thank you for coming. In banking, managing customer friction is vital. How would you handle an irate customer complaining about a long queue?",
      "tourist-guide": "Hello! Welcome to our tourism agency. If a group of international tourists arrives to inspect local monuments, how would you begin your guiding remarks?",
      "customer-care": "Good day! Welcome. If an angry client calls screaming about an overcharge, what steps would you take to de-escalate the situation?",
      "hotel-receptionist": "Welcome to the Grand Plaza Hotel interview. How would you welcome a VIP guest checking in late at night to ensure a luxury experience?",
      "hr-manager": "Hello, please sit down. How do you approach mediating conflicts between members of the same team?",
      "office-admin": "Welcome! As an office administrator, multitasking is essential. How do you prioritize urgent administrative duties under pressure?"
    }
  }
};

const fallbacks = ['mwr', 'ta', 'te', 'bn', 'mr', 'ur'];
fallbacks.forEach(lang => {
  INTERVIEW_DATA[lang] = INTERVIEW_DATA['hi'];
});

// Specialize Tamil & Telugu mappings to meet single language constraint
INTERVIEW_DATA.ta = {
  title: "வேலை நேர்காணல் பயிற்சி (Mock Interview)",
  desc: "தேர்வு செய்த வேலைத் துறையில் ஒரு தொழில்முறை நேர்காணல் செய்பவருடன் கலந்துரையாடி உங்கள் மொழித் திறனைச் சோதிக்கவும்.",
  startBtn: "நேர்காணலைத் தொடங்கு",
  nextBtn: "சமர்ப்பி",
  finishBtn: "மதிப்பீட்டைப் பெறு",
  evaluating: "நேர்காணல் செய்பவர் உங்கள் பதிலைப் பரிசீலிக்கிறார்...",
  feedbackTitle: "மதிப்பீட்டு அறிக்கை (Performance Review)",
  scoreLabel: "மதிப்பீடு:",
  roles: [
    { id: "software-engineer", title: "மென்பொருள் பொறியாளர் (Software Engineer)", icon: "💻", prompt: "You are conducting an interview for Software Engineer. Speak ONLY in Tamil. Ask 1 question." },
    { id: "school-teacher", title: "பள்ளி ஆசிரியர் (School Teacher)", icon: "🏫", prompt: "You are conducting an interview for Teacher. Speak ONLY in Tamil. Ask 1 question." },
    { id: "bank-clerk", title: "வங்கி அதிகாரி (Bank Officer)", icon: "🏦", prompt: "You are conducting an interview for Bank Clerk. Speak ONLY in Tamil. Ask 1 question." },
    { id: "tourist-guide", title: "சுற்றுலா வழிகாட்டி (Tourist Guide)", icon: "🗺️", prompt: "You are conducting an interview for Tourist Guide. Speak ONLY in Tamil. Ask 1 question." },
    { id: "customer-care", title: "வாடிக்கையாளர் சேவை (Customer Agent)", icon: "📞", prompt: "You are conducting an interview for Customer Agent. Speak ONLY in Tamil. Ask 1 question." },
    { id: "hotel-receptionist", title: "விடுதி வரவேற்பாளர் (Hotel Desk)", icon: "🏨", prompt: "You are conducting an interview for Hotel Receptionist. Speak ONLY in Tamil. Ask 1 question." },
    { id: "hr-manager", title: "மனிதவள மேலாளர் (HR Recruiter)", icon: "👥", prompt: "You are conducting an interview for HR Recruiter. Speak ONLY in Tamil. Ask 1 question." },
    { id: "office-admin", title: "அலுவலக நிர்வாகி (Office Admin)", icon: "📂", prompt: "You are conducting an interview for Office Admin. Speak ONLY in Tamil. Ask 1 question." }
  ],
  greetings: {
    "software-engineer": "வணக்கம்! மென்பொருள் பொறியாளர் பணிக்கு உங்களை வரவேற்கிறோம். உங்களது முந்தைய மென்பொருள் திட்டங்கள் பற்றி சுருக்கமாகக் கூற முடியுமா?",
    "school-teacher": "வணக்கம், அமருங்கள். மாணவர்களுக்கு ஒரு கடினமான பாடத்தை எளிமையாகப் புரிய வைக்க நீங்கள் எந்தக் கற்பித்தல் முறையைக் கையாளுவீர்கள்?",
    "bank-clerk": "வணக்கம்! வங்கியில் வாடிக்கையாளர் சேவை மிகவும் முக்கியம். கணக்கு விவரம் அறிய நீண்ட வரிசையில் நின்று கோபப்படும் வாடிக்கையாளரை நீங்கள் எப்படி கையாளுவீர்கள்?",
    "tourist-guide": "வணக்கம்! ஒரு சுற்றுலா குழுவிற்கு உள்ளூர் வரலாற்றுச் சின்னங்களை விளக்கும்போது உங்கள் உரையை எவ்வாறு தொடங்குவீர்கள்?",
    "customer-care": "வணக்கம்! வாடிக்கையாளர் ஒருவர் தொலைபேசியில் மிகவும் கோபமாகப் பேசும்போது அவரை எவ்வாறு அமைதிப்படுத்துவீர்கள்?",
    "hotel-receptionist": "வணக்கம்! இரவு நேரத்தில் வரும் விஐபி வாடிக்கையாளரை விடுதிக்கு வரவேற்க நீங்கள் என்ன செய்வீர்கள்?",
    "hr-manager": "வணக்கம்! அலுவலகத்தில் பணிபுரிபவர்களுக்கிடையே ஏற்படும் கருத்து வேறுபாடுகளை ஒரு மனிதவள மேலாளராக எவ்வாறு தீர்ப்பீர்கள்?",
    "office-admin": "வணக்கம்! ஒரு அலுவலக நிர்வாகியாகப் பல பணிகளை ஒரே நேரத்தில் செய்யும்போது எதற்கு முன்னுரிமை அளிப்பீர்கள்?"
  }
};

INTERVIEW_DATA.te = {
  title: "ఉద్యోగ ఇంటర్వ్యూ సాధన (Mock Interview)",
  desc: "మీరు ఎంచుకున్న ఉద్యోగ రంగంలో ఏఐ ఇంటర్వ్యూయర్ తో మాట్లాడి మీ నైపుణ్యాలను పరీక్షించుకోండి.",
  startBtn: "ఇంటర్వ్యూ ప్రారంభించు",
  nextBtn: "సమర్పించు",
  finishBtn: "ఫలితం తెలుసుకోండి",
  evaluating: "ఇంటర్వ్యూయర్ మీ సమాధానాన్ని పరిశీలిస్తున్నారు...",
  feedbackTitle: "ఇంటర్వ్యూ ఫలిత నివేదిక (Performance Review)",
  scoreLabel: "మొత్తం స్కోరు:",
  roles: [
    { id: "software-engineer", title: "సాఫ్ట్‌వేర్ ఇంజనీర్ (Software Engineer)", icon: "💻", prompt: "Conduct interview for Software Engineer. Speak ONLY in Telugu. Ask 1 question." },
    { id: "school-teacher", title: "పాఠశాల ఉపాధ్యాయుడు (School Teacher)", icon: "🏫", prompt: "Conduct interview for School Teacher. Speak ONLY in Telugu. Ask 1 question." },
    { id: "bank-clerk", title: "బ్యాంక్ అధికారి (Bank Officer)", icon: "🏦", prompt: "Conduct interview for Bank Officer. Speak ONLY in Telugu. Ask 1 question." },
    { id: "tourist-guide", title: "టూరిస్ట్ గైడ్ (Tourist Guide)", icon: "🗺️", prompt: "Conduct interview for Tourist Guide. Speak ONLY in Telugu. Ask 1 question." },
    { id: "customer-care", title: "కస్టమర్ కేర్ ఏజెంట్ (Customer Agent)", icon: "📞", prompt: "Conduct interview for Customer Agent. Speak ONLY in Telugu. Ask 1 question." },
    { id: "hotel-receptionist", title: "హోటల్ రిసెప్షనిస్ట్ (Hotel Desk)", icon: "🏨", prompt: "Conduct interview for Hotel Desk. Speak ONLY in Telugu. Ask 1 question." },
    { id: "hr-manager", title: "హెచ్ఆర్ మేనేజర్ (HR Recruiter)", icon: "👥", prompt: "Conduct interview for HR Recruiter. Speak ONLY in Telugu. Ask 1 question." },
    { id: "office-admin", title: "ఆఫీస్ అడ్మినిస్ట్రేటర్ (Office Admin)", icon: "📂", prompt: "Conduct interview for Office Admin. Speak ONLY in Telugu. Ask 1 question." }
  ],
  greetings: {
    "software-engineer": "నమస్కారం! సాఫ్ట్‌వేర్ ఇంజనీర్ ఉద్యోగానికి మిమ్మల్ని ఆహ్వానిస్తున్నాము. మీ మునుపటి ప్రాజెక్ట్ అనుభవాన్ని గురించి క్లుప్తంగా చెప్పగలరా?",
    "school-teacher": "నమస్కారం, కూర్చోండి. విద్యార్థులకు కష్టమైన సబ్జెక్టును సులభంగా బోధించడానికి మీరు ఏ పద్ధతిని ఉపయోగిస్తారు?",
    "bank-clerk": "నమస్కారం! బ్యాంకులో కస్టమర్లతో మాట్లాడటం చాలా కీలకం. లైన్ లో నిలబడి కోపంగా ఉన్న కస్టమర్ ను మీరు ఎలా సమాధానపరుస్తారు?",
    "tourist-guide": "నమస్కారం! టూరిస్ట్ గైడ్ ఉద్యోగానికి స్వాగతం. ఒక విదేశీ పర్యాటక బృందానికి స్థానిక చారిత్రక ప్రదేశాలను వివరించడం మీరు ఎలా ప్రారంభిస్తారు?",
    "customer-care": "నమస్కారం! కస్టమర్ కేర్ లో పని చేయడానికి సిద్ధంగా ఉన్నారా? ఒక కస్టమర్ కోపంతో అరుస్తున్నప్పుడు మీ సమాధానం ఎలా ఉంటుంది?",
    "hotel-receptionist": "నమస్కారం! రాత్రి వేళలో వచ్చే వీఐపీ అతిథిని హోటల్ లోకి ఎలా ఆహ్వానిస్తారు?",
    "hr-manager": "నమస్కారం! ఉద్యోగుల మధ్య వచ్చే గొడవలను పరిష్కరించడానికి హెచ్ఆర్ మేనేజర్‌గా మీరు ఎలాంటి చర్యలు తీసుకుంటారు?",
    "office-admin": "నమస్కారం! ఆఫీస్ అడ్మినిస్ట్రేటర్ గా రోజువారీ పనులలో ప్రాధాన్యతలను ఎలా నిర్ణయిస్తారు?"
  }
};

const MockInterview = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

    let currentLang = 'hi';
  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    currentLang = storedUser.learning_language || 'hi';
  } catch (e) {}
  const data = INTERVIEW_DATA[currentLang] || INTERVIEW_DATA['hi'];

  const [activeRole, setActiveRole] = useState(null);
  const [round, setRound] = useState(1);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [report, setReport] = useState('');
  
  // Voice recognition
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const feedEndRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      const LANG_REC_MAP = { hi: 'hi-IN', ur: 'ur-PK', mwr: 'hi-IN', ta: 'ta-IN', te: 'te-IN', bn: 'bn-IN', mr: 'mr-IN', en: 'en-US' };
      recognition.lang = LANG_REC_MAP[currentLang] || 'en-US';

      recognition.onresult = (event) => {
        setInput(event.results[0][0].transcript);
        setIsRecording(false);
      };

      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, [currentLang]);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const speakText = (text) => {
    ttsSpeak(text, { lang: currentLang, rate: 0.85 });
  };

  const handleStart = (role) => {
    setActiveRole(role);
    setRound(1);
    setReport('');
    const firstMsg = data.greetings[role.id];
    setMessages([{ role: 'assistant', content: firstMsg }]);
    
    setTimeout(() => {
      speakText(firstMsg);
    }, 300);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setIsTyping(true);

    if (round < 4) {
      // Converse with interviewer
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/activities/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            systemPrompt: activeRole.prompt,
            messages: updated.map(m => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content
            }))
          })
        });

        if (res.ok) {
          const resData = await res.json();
          setMessages(prev => [...prev, { role: 'assistant', content: resData.reply }]);
          setRound(r => r + 1);
          speakText(resData.reply);
        } else {
          setMessages(prev => [...prev, { role: 'assistant', content: "Failed to load next question." }]);
        }
      } catch (err) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Network error. Try again!" }]);
      } finally {
        setIsTyping(false);
      }
    } else {
      // Evaluate Interview Performance
      try {
        const token = localStorage.getItem('token');
        const evalPrompt = `You are a professional HR assessment coach. The candidate just finished an interview in ${currentLang === 'hi' ? 'Hindi' : currentLang === 'ta' ? 'Tamil' : currentLang === 'te' ? 'Telugu' : 'English'}.
Evaluate their interview response transcript:
${updated.map(m => `${m.role}: ${m.content}`).join('\n')}

Provide feedback ONLY in the candidate's language (${currentLang === 'hi' ? 'Hindi' : currentLang === 'ta' ? 'Tamil' : currentLang === 'te' ? 'Telugu' : 'English'}).
Structure your review cleanly:
1. **Grammar & Vocabulary** (व्याकरण और प्रवाह)
2. **Professional Courtesy** (शिष्टता और लहजा)
3. **Key Suggestions** (प्रमुख सुझाव)
4. **Rating Score: X/10**`;

        const res = await fetch(`${API_BASE_URL}/api/activities/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            systemPrompt: evalPrompt,
            messages: [{ role: 'user', content: 'Please generate my final report card.' }]
          })
        });

        if (res.ok) {
          const resData = await res.json();
          setReport(resData.reply);
        } else {
          setReport("Failed to generate report.");
        }
      } catch (err) {
        setReport("Network error generating report.");
      } finally {
        setIsTyping(false);
      }
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setInput('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleReset = () => {
    setActiveRole(null);
    setMessages([]);
    setInput('');
    setRound(1);
    setReport('');
  };

  if (report) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '3rem 2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', maxWidth: '600px', width: '100%' }}>
          <Trophy size={54} color="#eab308" style={{ marginBottom: '1.2rem', marginInline: 'auto' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e293b', margin: '0 0 1.5rem 0', textAlign: 'center' }}>
            {data.feedbackTitle}
          </h2>

          <pre style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', fontFamily: 'inherit', fontSize: '1.02rem', lineHeight: '1.8', whiteSpace: 'pre-wrap', color: '#334155', fontWeight: 600, marginBottom: '2rem' }}>
            {report}
          </pre>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={handleReset}
              style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.8rem 2.5rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw size={18} /> {currentLang === 'hi' ? "नया साक्षात्कार" : "New Interview"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeRole) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8fafc' }}>
        
        {/* Interview Header */}
        <header style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.8rem' }}>{activeRole.icon}</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#1e293b' }}>
                {activeRole.title}
              </h2>
              <span style={{ fontSize: '0.78rem', color: '#3b82f6', fontWeight: 800 }}>
                Question {round} of 4
              </span>
            </div>
          </div>
          <button 
            onClick={handleReset} 
            style={{ background: 'none', border: '1px solid #cbd5e1', padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}
          >
            Quit
          </button>
        </header>

        {/* Chat Feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          <div style={{ maxWidth: '650px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  background: m.role === 'user' ? '#3b82f6' : 'white',
                  color: m.role === 'user' ? 'white' : '#1e293b',
                  borderRadius: m.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  padding: '1.2rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
                  border: m.role === 'user' ? 'none' : '1px solid #e2e8f0',
                  lineHeight: 1.5,
                  fontSize: '1.02rem',
                  fontWeight: m.role === 'user' ? 700 : 500
                }}
              >
                {m.content}
                {m.role === 'assistant' && (
                  <button 
                    onClick={() => speakText(m.content)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: '0.5rem', display: 'inline-flex', verticalAlign: 'middle' }}
                  >
                    <Volume2 size={14} color="#64748b" />
                  </button>
                )}
              </div>
            ))}

            {isTyping && (
              <div style={{ alignSelf: 'flex-start', background: 'white', borderRadius: '16px', padding: '1rem', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#64748b', fontWeight: 700 }}>
                {data.evaluating}
              </div>
            )}

            <div ref={feedEndRef} />
          </div>
        </div>

        {/* Footer controls */}
        <footer style={{ background: 'white', borderTop: '1px solid #e2e8f0', padding: '1.2rem 2rem' }}>
          <div style={{ maxWidth: '650px', margin: '0 auto', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            
            {recognitionRef.current && (
              <button
                onClick={toggleRecording}
                style={{
                  background: isRecording ? '#fee2e2' : '#f1f5f9',
                  border: 'none',
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Mic size={18} color={isRecording ? '#ef4444' : '#6366f1'} />
              </button>
            )}

            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={currentLang === 'hi' ? "अपनी प्रतिक्रिया यहाँ लिखें..." : "Type your response here..."}
              style={{
                flex: 1,
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '0.8rem 1.2rem',
                fontSize: '0.98rem',
                outline: 'none'
              }}
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              style={{
                background: input.trim() && !isTyping ? '#6366f1' : '#cbd5e1',
                color: 'white',
                border: 'none',
                padding: '0.8rem 1.8rem',
                borderRadius: '12px',
                cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
                fontWeight: 800,
                fontSize: '0.95rem'
              }}
            >
              {round === 4 ? data.finishBtn : data.nextBtn}
            </button>

          </div>
        </footer>

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

      <div style={{ maxWidth: '750px', margin: '0 auto' }}>
        
        {/* Banner */}
        <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '24px', padding: '2rem', color: 'white', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 0.4rem 0' }}>💼 {data.title}</h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>{data.desc}</p>
        </div>

        {/* Roles list */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.2rem' }}>
          {data.roles.map(role => (
            <div
              key={role.id}
              onClick={() => handleStart(role)}
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '24px',
                padding: '1.5rem',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '1.2rem'
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.03)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.01)';
              }}
            >
              <span style={{ fontSize: '2.5rem' }}>{role.icon}</span>
              <div>
                <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '1.12rem', color: '#1e293b', fontWeight: 800 }}>
                  {role.title}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 800 }}>
                  {data.startBtn} →
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default MockInterview;
