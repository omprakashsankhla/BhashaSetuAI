import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Send, Mic, StopCircle, RotateCcw, Volume2 } from 'lucide-react';
import { speakText as ttsSpeak } from '../../utils/ttsHelper';
import './ConversationSim.css';

const LOCAL_SCENARIOS = {
  hi: [
    {
      id: "ordering-food",
      title: "रेस्टोरेंट में भोजन ऑर्डर करना",
      icon: "🍽️",
      systemPrompt: "You are a friendly waiter at a local North Indian restaurant. You MUST converse ONLY in Hindi. Do not output any English text. Help the user order a meal, keep your responses concise, and use natural Intermediate (B1) Hindi. Keep answers short (1-2 sentences).",
      initialMessage: "नमस्ते! हमारे रेस्टोरेंट में आपका स्वागत है। यह आज का मीनू है। क्या मैं आपके लिए पीने के पानी या ठंडी लस्सी से शुरुआत करूँ?"
    },
    {
      id: "asking-directions",
      title: "रास्ता पूछना (दुकान का पता)",
      icon: "🗺️",
      systemPrompt: "You are a helpful local resident standing on a city street corner. You MUST converse ONLY in Hindi. Do not write any English. Give clear directions to the user who is looking for the bank, using concise spatial prepositions. Keep answers short (1-2 sentences).",
      initialMessage: "नमस्ते भाई साहब, आप थोड़े परेशान लग रहे हैं। क्या आप इस तरफ किसी दुकान या बैंक का पता ढूंढ रहे हैं?"
    },
    {
      id: "returning-item",
      title: "कपड़े की दुकान में सामान बदलना",
      icon: "🛍️",
      systemPrompt: "You are a polite customer service agent at a clothing shop. You MUST converse ONLY in Hindi. Help the user exchange or return an item they bought. Ask for the bill simply. Keep answers short (1-2 sentences).",
      initialMessage: "हेलो! कस्टमर केयर सेंटर पर आपका स्वागत है। आज मैं आपकी शर्ट या कुर्ती बदलने में किस प्रकार सहायता कर सकता हूँ?"
    },
    {
      id: "doctor-appointment",
      title: "डॉक्टर को बीमारी के लक्षण बताना",
      icon: "🏥",
      systemPrompt: "You are a friendly general practitioner doctor at a clinic. You MUST converse ONLY in Hindi. Ask open-ended questions about their fever or body pain. Keep answers short (1-2 sentences).",
      initialMessage: "नमस्कार! आइए, बैठिए। बताइए आज आपको क्या तकलीफ है और कब से बुखार महसूस हो रहा है?"
    },
    {
      id: "hotel-checkin",
      title: "होटल में कमरा बुक करना",
      icon: "🏨",
      systemPrompt: "You are a hotel receptionist at the front desk. You MUST converse ONLY in Hindi. Handle the room check-in process by asking for ID and booking details. Keep answers short (1-2 sentences).",
      initialMessage: "शुभ संध्या! ग्रैंड इन होटल में आपका स्वागत है। क्या आपके नाम से कोई रूम रिजर्वेशन है?"
    },
    {
      id: "bank-account",
      title: "नया बैंक खाता खोलना",
      icon: "🏦",
      systemPrompt: "You are a bank clerk at State Bank. You MUST converse ONLY in Hindi. Guide the user on opening a savings account by explaining identity proof needed. Keep answers short (1-2 sentences).",
      initialMessage: "नमस्ते! बताइए, आज बैंक में कैसे आना हुआ? क्या आप बचत खाता (Savings Account) खुलवाना चाहते हैं?"
    },
    {
      id: "train-ticket",
      title: "रेलवे स्टेशन पर टिकट खरीदना",
      icon: "🚆",
      systemPrompt: "You are a railway ticket booking operator. You MUST converse ONLY in Hindi. Ask the user for destination, travel class, and date. Keep answers short (1-2 sentences).",
      initialMessage: "हाँ जी बताइए, आपको कहाँ जाने की टिकट चाहिए? कल सुबह की एक्सप्रेस ट्रेन में एक्सप्रेस सीटें खाली हैं।"
    },
    {
      id: "rent-apartment",
      title: "कमरा किराए पर लेना",
      icon: "🏠",
      systemPrompt: "You are a house owner renting a room. You MUST converse ONLY in Hindi. Discuss monthly rent, deposit amount, and basic rules. Keep answers short (1-2 sentences).",
      initialMessage: "नमस्ते! आप मेरा मकान किराए पर देखने आए थे। क्या आपको यह 2-BHK कमरा पसंद आया?"
    }
  ],
  ta: [
    {
      id: "ordering-food",
      title: "உணவகத்தில் உணவு ஆர்டர் செய்தல்",
      icon: "🍽️",
      systemPrompt: "You are a friendly waiter at a South Indian restaurant. You MUST converse ONLY in Tamil. Help the user order a meal, keep your responses concise, and use natural Intermediate (B1) Tamil.",
      initialMessage: "வணக்கம்! எங்கள் உணவகத்திற்கு உங்களை வரவேற்கிறோம். இது இன்றைய மெனு கார்டு. உங்களுக்கு முதலில் குடிக்கத் தண்ணீர் கொண்டு வரட்டுமா?"
    },
    {
      id: "asking-directions",
      title: "முகவரி கேட்டல் (வழி காட்டுதல்)",
      icon: "🗺️",
      systemPrompt: "You are a helpful local resident on the street. You MUST converse ONLY in Tamil. Give clear directions to the user looking for the bank. Keep answers short (1-2 sentences).",
      initialMessage: "வணக்கம் ஐயா! நீங்கள் ஏதோ முகவரியைத் தேடுவது போல் தெரிகிறது. நான் உங்களுக்கு உதவலாமா?"
    },
    {
      id: "returning-item",
      title: "துணிக்கடையில் மாற்றுதல்",
      icon: "🛍️",
      systemPrompt: "You are a store clerk. You MUST converse ONLY in Tamil. Help the user return/exchange clothes. Keep answers short (1-2 sentences).",
      initialMessage: "வணக்கம்! வாடிக்கையாளர் சேவை மையத்திற்கு வரவேற்கிறோம். தாங்கள் வாங்கிய ஆடையை மாற்றுவதற்கு வந்தீர்களா?"
    },
    {
      id: "doctor-appointment",
      title: "மருத்துவரிடம் ஆலோசனை பெறுதல்",
      icon: "🏥",
      systemPrompt: "You are a clinic doctor. You MUST converse ONLY in Tamil. Ask patient about symptoms. Keep answers short (1-2 sentences).",
      initialMessage: "வணக்கம்! அமருங்கள். இன்று உங்களுக்கு என்ன உடலநலக் குறைவு உள்ளது? காய்ச்சல் இருக்கிறதா?"
    },
    {
      id: "hotel-checkin",
      title: "விடுதியில் அறை பதிவு செய்தல்",
      icon: "🏨",
      systemPrompt: "You are a hotel receptionist. You MUST converse ONLY in Tamil. Keep answers short (1-2 sentences).",
      initialMessage: "வணக்கம்! ஹோட்டல் கிராண்ட் வரவேற்பறைக்கு உங்களை வரவேற்கிறோம். தங்களுக்கு அறை ஏதேனும் முன்பதிவு செய்யப்பட்டுள்ளதா?"
    },
    {
      id: "bank-account",
      title: "வங்கி கணக்கு துவங்குதல்",
      icon: "🏦",
      systemPrompt: "You are a bank clerk. You MUST converse ONLY in Tamil. Keep answers short (1-2 sentences).",
      initialMessage: "வணக்கம்! வங்கியில் சேமிப்புக் கணக்கு ஆரம்பிக்க வந்தீர்களா? உங்களிடம் அடையாளச் சான்று உள்ளதா?"
    },
    {
      id: "train-ticket",
      title: "இரயில் பயணச்சீட்டு வாங்குதல்",
      icon: "🚆",
      systemPrompt: "You are a railway agent. You MUST converse ONLY in Tamil. Keep answers short (1-2 sentences).",
      initialMessage: "வணக்கம்! தாங்கள் எங்கு செல்ல வேண்டும்? அதற்கான பயணச்சீட்டு தரட்டுமா?"
    },
    {
      id: "rent-apartment",
      title: "அறை வாடகைக்கு எடுத்தல்",
      icon: "🏠",
      systemPrompt: "You are a landlord. You MUST converse ONLY in Tamil. Keep answers short (1-2 sentences).",
      initialMessage: "வணக்கம்! வாடகை அறை பார்க்க வந்தீர்களா? இந்த வீட்டின் மாத வாடகை பத்தாயிரம் ரூபாய்."
    }
  ],
  en: [
    {
      id: "ordering-food",
      title: "Ordering Food at a Restaurant",
      icon: "🍽️",
      systemPrompt: "You are a friendly waiter at a cozy cafe. Help the customer order, keep your responses concise, and use natural B1-level English.",
      initialMessage: "Welcome to our cafe! Here is the menu. Can I get you started with something to drink while you look it over?"
    },
    {
      id: "asking-directions",
      title: "Asking for Directions",
      icon: "🗺️",
      systemPrompt: "You are a helpful resident. Give clear step-by-step directions using B1 prepositions and respond concisely.",
      initialMessage: "Excuse me, you look a bit confused. Are you looking for a specific landmark around here?"
    },
    {
      id: "returning-item",
      title: "Returning an Item to a Store",
      icon: "🛍️",
      systemPrompt: "You are a customer service clerk. Ask polite questions, request a receipt, and explain policies simply.",
      initialMessage: "Hello! Welcome to Customer Service. How can I assist you with your return or exchange today?"
    },
    {
      id: "doctor-appointment",
      title: "Describing Symptoms to a Doctor",
      icon: "🏥",
      systemPrompt: "You are a friendly doctor at a clinic. Ask about the patient's symptoms and offer basic health advice.",
      initialMessage: "Good afternoon! Please, take a seat. What seems to be bringing you in to see me today?"
    },
    {
      id: "hotel-checkin",
      title: "Checking into a Hotel",
      icon: "🏨",
      systemPrompt: "You are a hotel receptionist. Ask for booking details, ID, and explain amenities.",
      initialMessage: "Good evening! Welcome to the Grand Hotel front desk. How can I help you this evening?"
    },
    {
      id: "bank-account",
      title: "Opening a Bank Account",
      icon: "🏦",
      systemPrompt: "You are a bank clerk. Guide the user on opening a savings account.",
      initialMessage: "Hello there! Welcome. Are you looking to open a new savings account with us today?"
    },
    {
      id: "train-ticket",
      title: "Buying a Train Ticket",
      icon: "🚆",
      systemPrompt: "You are a railway booking assistant. Ask destination and date.",
      initialMessage: "Hi! Where are you traveling to today, and would you like a one-way or round-trip ticket?"
    },
    {
      id: "rent-apartment",
      title: "Renting an Apartment",
      icon: "🏠",
      systemPrompt: "You are a landlord showing a room. Discuss rent and security deposit details.",
      initialMessage: "Hello! Welcome to inspect the apartment. How do you like the rooms and layout?"
    }
  ]
};

// Map remaining languages to Hindi since they share structure, and specialize Urdu
const fallbacks = ['mwr', 'te', 'bn', 'mr'];
fallbacks.forEach(lang => {
  LOCAL_SCENARIOS[lang] = LOCAL_SCENARIOS['hi'];
});

// Specialize Urdu
LOCAL_SCENARIOS.ur = [
  {
    id: "ordering-food",
    title: "ریسٹورنٹ میں آرڈر دینا",
    icon: "🍽️",
    systemPrompt: "You are a waiter at a local restaurant. You MUST converse ONLY in Urdu. Keep responses concise.",
    initialMessage: "خوش آمدید! یہ ہمارا مینیو ہے۔ کیا میں آپ کے پینے کے لیے پانی یا چائے سے شروعات کروں؟"
  },
  {
    id: "asking-directions",
    title: "راستہ پوچھنا",
    icon: "🗺️",
    systemPrompt: "You are a resident on the street. You MUST converse ONLY in Urdu. Help the user find the bank.",
    initialMessage: "السلام علیکم! آپ کچھ پریشان لگ رہے ہیں۔ کیا آپ کسی خاص جگہ کا پتہ ڈھونڈ رہے ہیں؟"
  },
  {
    id: "returning-item",
    title: "سامان تبدیل کرنا",
    icon: "🛍️",
    systemPrompt: "You are a customer service assistant. You MUST converse ONLY in Urdu.",
    initialMessage: "ہیلو! کسٹمر سروس پر خوش آمدید۔ آج میں آپ کی کس طرح مدد کر سکتا ہوں؟"
  },
  {
    id: "doctor-appointment",
    title: "ڈاکٹر کو بیماری بتانا",
    icon: "🏥",
    systemPrompt: "You are a doctor at a clinic. You MUST converse ONLY in Urdu.",
    initialMessage: "السلام علیکم! تشریف رکھیں۔ فرمائیے، آج آپ کی کیا طبیعت خراب ہے؟"
  },
  {
    id: "hotel-checkin",
    title: "ہوٹل چیک ان",
    icon: "🏨",
    systemPrompt: "You are a hotel receptionist. You MUST converse ONLY in Urdu.",
    initialMessage: "شب بخیر! گرینڈ ہوٹل میں خوش آمدید۔ کیا آپ کے نام سے کوئی کمرہ بک ہے؟"
  },
  {
    id: "bank-account",
    title: "بینک اکاؤنٹ کھولنا",
    icon: "🏦",
    systemPrompt: "You are a bank representative. You MUST converse ONLY in Urdu.",
    initialMessage: "السلام علیکم! بتائیے، کیا آپ ہمارے بینک میں نیا سیونگ اکاؤنٹ کھولنا چاہتے ہیں؟"
  },
  {
    id: "train-ticket",
    title: "ٹرین کا ٹکٹ خریدنا",
    icon: "🚆",
    systemPrompt: "You are a ticketing clerk. You MUST converse ONLY in Urdu.",
    initialMessage: "جی جناب، بتائیے آپ کو کہاں کی ٹکٹ چاہیئے؟ ایکسپریس سیٹیں دستیاب ہیں۔"
  },
  {
    id: "rent-apartment",
    title: "مکان کرائے پر لینا",
    icon: "🏠",
    systemPrompt: "You are a landlord renting a room. You MUST converse ONLY in Urdu.",
    initialMessage: "السلام علیکم! آپ میرا مکان دیکھنے آئے تھے۔ کیا آپ کو یہ کمرہ پسند آیا؟"
  }
];

// Special translation mapping for target-specific Telugu scenarios to support user request
LOCAL_SCENARIOS.te = [
  {
    id: "ordering-food",
    title: "హోటల్లో భోజనం ఆర్డర్ చేయడం",
    icon: "🍽️",
    systemPrompt: "You are a waiter at an Andhra restaurant. You MUST converse ONLY in Telugu. Help order food.",
    initialMessage: "నమస్కారం! మా హోటల్‌కు స్వాగతం. ఇది మా మెనూ. మీకు తాగడానికి చల్లని నీరు లేదా మజ్జిగ తీసుకురానా?"
  },
  {
    id: "asking-directions",
    title: "దారి అడగడం",
    icon: "🗺️",
    systemPrompt: "You are a local guide on the street. You MUST converse ONLY in Telugu.",
    initialMessage: "నమస్కారం! మీరు ఏదైనా అడ్రస్ వెతుకుతున్నారా? నేను మీకు సహాయపడగలనా?"
  },
  {
    id: "returning-item",
    title: "బట్టలు మార్పిడి చేయడం",
    icon: "🛍️",
    systemPrompt: "You are a shop assistant. You MUST converse ONLY in Telugu.",
    initialMessage: "నమస్కారం! కస్టమర్ సర్వీస్ డెస్క్‌కు స్వాగతం. మీరు కొన్న బట్టలను ఎక్స్చేంజ్ చేయడానికి వచ్చారా?"
  },
  {
    id: "doctor-appointment",
    title: "వైద్యుడిని సంప్రదించడం",
    icon: "🏥",
    systemPrompt: "You are a doctor at a clinic. You MUST converse ONLY in Telugu.",
    initialMessage: "నమస్కారం! కూర్చోండి. ఈ రోజు మీకు ఏ విధంగా ఆరోగ్యం బాగోలేదు?"
  },
  {
    id: "hotel-checkin",
    title: "హోటల్ రూమ్ చెకిన్",
    icon: "🏨",
    systemPrompt: "You are a hotel receptionist. You MUST converse ONLY in Telugu.",
    initialMessage: "నమస్కారం! గ్రాండ్ ఇన్ హోటల్‌కు స్వాగతం. మీ పేరు మీద ఏమైనా రూమ్ బుకింగ్ ఉందా?"
  },
  {
    id: "bank-account",
    title: "బ్యాంక్ ఖాతా తెరవడం",
    icon: "🏦",
    systemPrompt: "You are a bank clerk. You MUST converse ONLY in Telugu.",
    initialMessage: "నమస్కారం! మీరు మా బ్యాంకులో కొత్త సేవింగ్స్ ఖాతా తెరవాలనుకుంటున్నారా?"
  },
  {
    id: "train-ticket",
    title: "రైలు టికెట్ కొనడం",
    icon: "🚆",
    systemPrompt: "You are a ticket clerk. You MUST converse ONLY in Telugu.",
    initialMessage: "నమస్కారం! మీకు ఎక్కడికి వెళ్ళడానికి రైలు టికెట్ కావాలి?"
  },
  {
    id: "rent-apartment",
    title: "ఇల్లు అద్దెకు తీసుకోవడం",
    icon: "🏠",
    systemPrompt: "You are a house owner renting a room. You MUST converse ONLY in Telugu.",
    initialMessage: "నమస్కారం! మీరు ఇల్లు అద్దెకు చూడటానికి వచ్చారా? ఈ రూములు మీకు నచ్చాయా?"
  }
];

const ConversationSim = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeScenario, setActiveScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [conversationEnded, setConversationEnded] = useState(false);

  let currentLang = 'hi';
  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    currentLang = storedUser.preferred_language || 'hi';
  } catch (e) {}

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const targetLang = storedUser.preferred_language || 'hi';
        const interfaceLang = i18n.language || 'en';
        const res = await fetch(`http://localhost:5000/api/activities/conversation-sim?lang=${targetLang}&interfaceLang=${interfaceLang}`);
        if (res.ok) {
          const data = await res.json();
          setScenarios(data.items || []);
        }
      } catch (err) {
        console.error('Error fetching scenarios:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchScenarios();
  }, []);

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Setup speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      
      const LANG_REC_MAP = { hi: 'hi-IN', ur: 'ur-PK', mwr: 'hi-IN', ta: 'ta-IN', te: 'te-IN', bn: 'bn-IN', mr: 'mr-IN', en: 'en-US' };
      recognition.lang = LANG_REC_MAP[currentLang] || 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, [currentLang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  const speakText = (text) => {
    ttsSpeak(text, { lang: currentLang, rate: 0.85 });
  };

  const startScenario = (scenario) => {
    setActiveScenario(scenario);
    setMessages([
      { role: 'assistant', content: scenario.initialMessage }
    ]);
    setConversationEnded(false);
    setInput('');
    
    // Auto-read initial message aloud to trigger immediate auditory engagement
    setTimeout(() => {
      speakText(scenario.initialMessage);
    }, 400);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isAiTyping || conversationEnded) return;

    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsAiTyping(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/activities/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          systemPrompt: activeScenario.systemPrompt,
          messages: updatedMessages.map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
          }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        speakText(data.reply);
      } else {
        const errorFallback = currentLang === 'hi' ? "मुझे अभी प्रतिक्रिया देने में कठिनाई हो रही है। कृपया पुनः प्रयास करें!" : "I am having trouble responding right now. Please try again.";
        setMessages(prev => [...prev, { role: 'assistant', content: errorFallback }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const networkError = currentLang === 'hi' ? "कनेक्शन त्रुटि। कृपया इंटरनेट की जांच करें।" : "Network error. Please check your connection.";
      setMessages(prev => [...prev, { role: 'assistant', content: networkError }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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

  if (activeScenario) {
    return (
      <div className="conv-sim-chat-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8fafc' }}>
        
        {/* Chat Header */}
        <header style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <button 
            onClick={() => { setActiveScenario(null); setMessages([]); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: '#475569' }}
          >
            <ArrowLeft size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ fontSize: '1.8rem' }}>{activeScenario.icon}</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#1e293b' }}>
                {activeScenario.title}
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                ● Active Roleplay
              </span>
            </div>
          </div>
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
                  padding: '1.2rem 1.4rem',
                  boxShadow: m.role === 'user' ? '0 10px 15px -3px rgba(59,130,246,0.2)' : '0 4px 6px rgba(0,0,0,0.02)',
                  border: m.role === 'user' ? 'none' : '1px solid #e2e8f0',
                  lineHeight: 1.5,
                  fontSize: '1.05rem',
                  fontWeight: m.role === 'user' ? 600 : 500
                }}
              >
                {m.content}
                {m.role === 'assistant' && (
                  <button 
                    onClick={() => speakText(m.content)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: '0.6rem', display: 'inline-flex', verticalAlign: 'middle' }}
                  >
                    <Volume2 size={15} color="#64748b" />
                  </button>
                )}
              </div>
            ))}

            {isAiTyping && (
              <div style={{ alignSelf: 'flex-start', background: 'white', borderRadius: '16px', padding: '1rem 1.4rem', border: '1px solid #e2e8f0', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <span className="dot-typing" style={{ width: '8px', height: '8px', background: '#94a3b8', borderRadius: '50%' }}></span>
                <span className="dot-typing" style={{ width: '8px', height: '8px', background: '#94a3b8', borderRadius: '50%' }}></span>
                <span className="dot-typing" style={{ width: '8px', height: '8px', background: '#94a3b8', borderRadius: '50%' }}></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bar */}
        <footer style={{ background: 'white', borderTop: '1px solid #e2e8f0', padding: '1.2rem 2rem' }}>
          <div style={{ maxWidth: '650px', margin: '0 auto', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            
            {recognitionRef.current && (
              <button
                onClick={toggleRecording}
                style={{
                  background: isRecording ? '#fee2e2' : '#f1f5f9',
                  border: 'none',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                {isRecording ? <StopCircle size={20} color="#ef4444" /> : <Mic size={20} color="#6366f1" />}
              </button>
            )}

            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={currentLang === 'hi' ? "अपना उत्तर यहाँ टाइप करें..." : "Type your reply here..."}
              rows={1}
              style={{
                flex: 1,
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '0.85rem 1.2rem',
                fontSize: '1rem',
                resize: 'none',
                fontFamily: 'inherit',
                outline: 'none',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)'
              }}
            />

            <button
              onClick={sendMessage}
              disabled={!input.trim() || isAiTyping}
              style={{
                background: input.trim() && !isAiTyping ? '#6366f1' : '#cbd5e1',
                color: 'white',
                border: 'none',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                cursor: input.trim() && !isAiTyping ? 'pointer' : 'not-allowed',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 4px 6px rgba(99,102,241,0.1)'
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </footer>

      </div>
    );
  }

  if (loading && !activeScenario) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#6366f1' }}>Preparing conversation scenarios...</p>
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
        
        {/* Header Banner */}
        <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', borderRadius: '24px', padding: '2rem', color: 'white', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 0.4rem 0' }}>
            {currentLang === 'hi' ? "💬 संवाद सिम्युलेटर" : "💬 Conversation Simulator"}
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>
            {currentLang === 'hi' ? "एआई ट्यूटर के साथ बातचीत करके दैनिक जीवन की विभिन्न परिस्थितियों में बोलने और लिखने का अभ्यास करें।" : "Practice conversational language skills with AI characters in simulated real-world situations."}
          </p>
        </div>

        {/* Scenarios Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.2rem' }}>
          {scenarios.map(s => (
            <div
              key={s.id}
              onClick={() => startScenario(s)}
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '24px',
                padding: '1.5rem',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '140px'
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.04)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.01)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '2.5rem' }}>{s.icon}</span>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', color: '#1e293b', fontWeight: 800 }}>
                    {s.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                    {currentLang === 'hi' ? "चर्चा शुरू करने के लिए टैप करें" : "Tap to launch simulation"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default ConversationSim;
