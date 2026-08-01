import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mic, Square, Volume2, CheckCircle, XCircle, Loader, X, Heart, Flame, Lightbulb, Snail } from 'lucide-react';
import Confetti from 'react-confetti';
import './LessonPage.css';

const PRACTICE_LAB_LOC = {
  hi: {
    title: "🎯 व्यक्तिगत अभ्यास लैब",
    desc: "कमज़ोरियों को सुधारने के लिए विशिष्ट अभ्यासों का चयन करें या मिश्रित अभ्यास सत्र शुरू करें।",
    strengthsTitle: "कौशल विश्लेषण (Skill Levels)",
    focusArea: "विशेष ध्यान दें",
    modes: {
      reading: { title: "📖 पठन अभ्यास (Reading)", desc: "पढ़ने और समझने की क्षमता में सुधार करें।" },
      writing: { title: "✍️ लेखन और व्याकरण (Writing)", desc: "वाक्य संरचना और अनुवाद का अभ्यास करें।" },
      speaking: { title: "🗣️ उच्चारण और बोलना (Speaking)", desc: "बोलने की सटीकता और लय को बढ़ाएं।" },
      listening: { title: "👂 श्रवण अभ्यास (Listening)", desc: "सुनकर समझने और लिखने का अभ्यास करें।" },
      mixed: { title: "⚡ मिश्रित अभ्यास (Personalized Mixed)", desc: "आपकी कमज़ोरियों पर आधारित विशेष मिश्रित सत्र।" }
    },
    backBtn: "वापस जाएं"
  },
  en: {
    title: "🎯 Personalized Practice Lab",
    desc: "Hone your skills through custom target drills or run a smart mixed session.",
    strengthsTitle: "Your Current Skill Levels",
    focusArea: "Recommended Focus",
    modes: {
      reading: { title: "📖 Reading Lab", desc: "Improve comprehension with reading passages." },
      writing: { title: "✍️ Writing & Grammar", desc: "Sharpen syntax with translations and phrase builders." },
      speaking: { title: "🗣️ Pronunciation & Speaking", desc: "Hone verbal clarity with read-aloud checks." },
      listening: { title: "👂 Listening Drills", desc: "Train your ear with audio transcription challenges." },
      mixed: { title: "⚡ Personalized Mixed Training", desc: "A tailored training session prioritizing your weaknesses." }
    },
    backBtn: "Go Back"
  },
  ta: {
    title: "🎯 தனிப்பயனாக்கப்பட்ட பயிற்சி கூடம்",
    desc: "உங்கள் பலவீனங்களைச் சரிசெய்ய குறிப்பிட்ட பயிற்சிகளைத் தேர்ந்தெடுக்கவும் அல்லது கலப்புப் பயிற்சியைத் தொடங்கவும்.",
    strengthsTitle: "உங்கள் தற்போதைய திறன் நிலைகள்",
    focusArea: "பரிந்துரைக்கப்பட்ட கவனம்",
    modes: {
      reading: { title: "📖 வாசிப்புப் பயிற்சி", desc: "வாசிப்பு மற்றும் புரிந்துகொள்ளும் திறனை மேம்படுத்துங்கள்." },
      writing: { title: "✍️ எழுத்து & இலக்கணம்", desc: "வாக்கிய அமைப்பு மற்றும் மொழிபெயர்ப்பு பயிற்சி." },
      speaking: { title: "🗣️ உச்சரிப்பு & பேசுதல்", desc: "பேசும் துல்லியம் மற்றும் உச்சரிப்பை வளர்த்துக் கொள்ளுங்கள்." },
      listening: { title: "👂 கேட்டல் பயிற்சி", desc: "ஒலியைக் கேட்டு எழுதுதல் மற்றும் புரிந்துகொள்ளும் பயிற்சி." },
      mixed: { title: "⚡ தனிப்பயனாக்கப்பட்ட கலவை", desc: "உங்கள் பலவீனங்களின் அடிப்படையில் வடிவமைக்கப்பட்ட கலப்புப் பயிற்சி." }
    },
    backBtn: "பின்செல்லவும்"
  },
  te: {
    title: "🎯 వ్యక్తిగతీకరించిన ప్రాక్టీస్ ల్యాబ్",
    desc: "మీ బలహీనతలను మెరుగుపరుచుకోవడానికి నిర్దిష్ట నైపుణ్యాలను ఎంచుకోండి లేదా మిశ్రమ సాధనను ప్రారంభించండి.",
    strengthsTitle: "మీ ప్రస్తుత నైపుణ్యాల స్థాయిలు",
    focusArea: "సూచించబడిన శ్రద్ధ",
    modes: {
      reading: { title: "📖 పఠన సాధన", desc: "చదవటం మరియు అర్థం చేసుకునే సామర్థ్యాన్ని మెరుగుపరచండి." },
      writing: { title: "✍️ లేఖనం & వ్యాకరణం", desc: "వాక్య నిర్మాణం మరియు అనువాద సాధన." },
      speaking: { title: "🗣️ ఉచ్ఛారణ & సంభాషణ", desc: "మాట్లాడే నైపుణ్యాలు మరియు ఉచ్ఛారణను మెరుగుపరచండి." },
      listening: { title: "👂 శ్రవణ సాధన", desc: "విని అర్థం చేసుకోవడం మరియు రాసే సాధన." },
      mixed: { title: "⚡ వ్యక్తిగతీకరించిన మిశ్రమం", desc: "మీ బలహీనతల ఆధారంగా రూపొందించిన మిశ్రమ సాధన." }
    },
    backBtn: "వెనుకకు వెళ్ళు"
  }
};

const fallbacksPractice = ['mwr', 'bn', 'mr', 'ur'];
fallbacksPractice.forEach(lang => {
  PRACTICE_LAB_LOC[lang] = PRACTICE_LAB_LOC['hi'];
});

const LessonPage = ({ lessonId: propLessonId, onClose }) => {
  const params = useParams();
  const id = propLessonId || params.id;

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const [lessonData, setLessonData] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  
  const [lessonComplete, setLessonComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [xpEarned, setXpEarned] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);

  // Practice selection states
  const [selectedPracticeMode, setSelectedPracticeMode] = useState(null);
  const [skillScores, setSkillScores] = useState(null);

  // Gamification States
  const [hearts, setHearts] = useState(5);
  const [streak, setStreak] = useState(0);
  const [coins, setCoins] = useState(10); // Local session coins for hints
  const [showHint, setShowHint] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [shakeHeart, setShakeHeart] = useState(false);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [browserTranscript, setBrowserTranscript] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    fetchLessonData();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, [id]);

  const startPracticeMode = (mode) => {
    setSelectedPracticeMode(mode);
    if (!lessonData || !lessonData.activities) return;

    let filtered = [];
    if (mode === 'reading') {
      filtered = lessonData.activities.filter(a => a.type === 'MCQ' || a.type === 'Reading');
    } else if (mode === 'writing') {
      filtered = lessonData.activities.filter(a => a.type === 'Writing' || a.type === 'Puzzle');
    } else if (mode === 'speaking') {
      filtered = lessonData.activities.filter(a => a.type === 'Reading');
    } else if (mode === 'listening') {
      filtered = lessonData.activities.filter(a => a.type === 'Listening');
    } else if (mode === 'mixed') {
      // Find lowest skill
      let lowest = 'reading';
      let lowestVal = 100;
      if (skillScores) {
        Object.entries(skillScores).forEach(([k, v]) => {
          if (v < lowestVal) {
            lowestVal = v;
            lowest = k;
          }
        });
      }
      // Prioritize activities matching lowest skill
      let typeMatch = 'MCQ';
      if (lowest === 'writing') typeMatch = 'Writing';
      if (lowest === 'speaking') typeMatch = 'Reading';
      if (lowest === 'listening') typeMatch = 'Listening';

      const matched = lessonData.activities.filter(a => a.type === typeMatch || (typeMatch === 'Writing' && a.type === 'Puzzle'));
      const others = lessonData.activities.filter(a => !(a.type === typeMatch || (typeMatch === 'Writing' && a.type === 'Puzzle')));
      filtered = [...matched.slice(0, 5), ...others.slice(0, 5)];
    }

    // Fallback if not enough questions of that type are found
    if (filtered.length < 8) {
      const rest = lessonData.activities.filter(a => !filtered.includes(a));
      filtered = [...filtered, ...rest];
    }

    // Set exactly 8 questions for the session and sort by increasing difficulty
    const finalActivities = filtered.slice(0, 8);
    const DIFFICULTY_ORDER = { MCQ: 1, Listening: 2, Reading: 3, Puzzle: 4, Writing: 5 };
    finalActivities.sort((a, b) => (DIFFICULTY_ORDER[a.type] || 3) - (DIFFICULTY_ORDER[b.type] || 3));

    setLessonData(prev => ({
      ...prev,
      activities: finalActivities
    }));
  };

  const fetchLessonData = async () => {
    setLoading(true);
    setLessonComplete(false);
    setCurrentIdx(0);
    setHearts(5);
    setStreak(0);
    setIsGameOver(false);
    setSelectedPracticeMode(null);
    let learningLang = 'hi';
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      learningLang = storedUser.preferred_language || 'hi';
    } catch (e) {}

    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/register');
      
      const res = await fetch(`http://localhost:5000/api/learning/${id}?lang=${learningLang}&interfaceLang=${i18n.language}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const json = await res.json();
        setLessonData(json);
        
        // If it's practice mode, fetch user's strengths/weaknesses for personalization
        if (id === 'practice') {
          try {
            const dashRes = await fetch('http://localhost:5000/api/dashboard/data', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (dashRes.ok) {
              const dashJson = await dashRes.json();
              setSkillScores(dashJson.skillAnalysis || { reading: 65, writing: 40, speaking: 55, listening: 70, vocabulary: 50 });
            }
          } catch (e) {
            console.error('Error fetching dashboard skill analysis in practice:', e);
          }
        }
        
        setLoading(false);
      } else {
        if (onClose) onClose(); else navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      if (onClose) onClose(); else navigate('/dashboard');
    }
  };

  const playTTS = (textToSpeak, slow = false) => {
    try {
      if (!window.speechSynthesis) return;
      
      const isEnglish = /^[a-zA-Z0-9\s.,!?'"-]+$/.test(textToSpeak);
      let learningLang = 'hi';
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        learningLang = storedUser.preferred_language || 'hi';
      } catch (e) {}

      const LANG_REC_MAP = { hi: 'hi-IN', ur: 'ur-PK', mwr: 'hi-IN', ta: 'ta-IN', te: 'te-IN', bn: 'bn-IN', mr: 'mr-IN', en: 'en-US' };
      const langCode = isEnglish ? 'en-US' : (LANG_REC_MAP[learningLang] || 'hi-IN');
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = langCode;
      utterance.rate = slow ? 0.4 : 0.85; 
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const speakUtterance = () => {
        const voices = window.speechSynthesis.getVoices();
        const exactVoice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
        const premiumVoice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]) && (v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Natural')));
        
        if (premiumVoice) {
          utterance.voice = premiumVoice;
        } else if (exactVoice) {
          utterance.voice = exactVoice;
        }

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      };

      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          speakUtterance();
        };
      } else {
        speakUtterance();
      }
    } catch (e) {
      console.error("TTS playback failed", e);
    }
  };

  const playSound = (type) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.setValueAtTime(250, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.log("Audio not supported");
    }
  };

  useEffect(() => {
    if (lessonData && lessonData.activities && lessonData.activities.length > 0 && currentIdx < lessonData.activities.length) {
      const currentQ = lessonData.activities[currentIdx];
      if (currentQ.type === 'Listening' && currentQ.audioText) {
        playTTS(currentQ.audioText);
      } else if (currentQ.type === 'Writing' && currentQ.text) {
        playTTS(currentQ.text);
      }
    }
  }, [currentIdx, lessonData]);

  const startRecording = async () => {
    try {
      setBrowserTranscript('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start Browser Speech Recognition for instant STT evaluation
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        let learningLang = 'hi';
        try {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          learningLang = storedUser.preferred_language || 'hi';
        } catch (e) {}

        const LANG_REC_MAP = { hi: 'hi-IN', ur: 'ur-PK', mwr: 'hi-IN', ta: 'ta-IN', te: 'te-IN', bn: 'bn-IN', mr: 'mr-IN', en: 'en-US' };
        recognition.lang = LANG_REC_MAP[learningLang] || 'en-US';
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          console.log("Local browser SpeechRecognition transcript:", transcript);
          setBrowserTranscript(transcript);
        };
        recognition.onerror = (e) => {
          console.error("Local SpeechRecognition error:", e);
        };
        recognition.start();
        recognitionRef.current = recognition;
      }

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;
      microphone.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      let silenceStart = performance.now();
      let hasSpoken = false;

      scriptProcessor.onaudioprocess = () => {
        if (mediaRecorder.state !== 'recording') return;
        
        const array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        
        let sum = 0;
        for (let i = 0; i < array.length; i++) {
          sum += array[i];
        }
        const average = sum / array.length;

        if (average > 10) {
          hasSpoken = true;
          silenceStart = performance.now();
        } else if (hasSpoken) {
          // If silent for 1.0 seconds after speaking, stop recording
          if (performance.now() - silenceStart > 1000) {
            stopRecording();
            scriptProcessor.disconnect();
            microphone.disconnect();
          }
        }
      };
    } catch (err) {
      console.error("Microphone error", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    }
  };

  const handleCheck = async () => {
    const activity = lessonData.activities[currentIdx];
    let correct = false;
    let fbText = '';
    
    if (activity.type === 'Reading') {
      if (!audioBlob) {
        setIsCorrect(false);
        setFeedbackText('No audio detected. Please try recording again.');
        setIsChecked(true);
        return;
      }
      setIsChecked(true);
      setFeedbackText('Analyzing your pronunciation...'); 
      
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('audio', audioBlob, 'speech.webm');
        formData.append('expectedText', activity.word);
        if (browserTranscript) {
          formData.append('browserTranscript', browserTranscript);
        }
        console.log("Sending lesson voice request with browserTranscript:", browserTranscript);

        const res = await fetch('http://localhost:5000/api/assessment/voice', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        const data = await res.json();
        
        if (res.ok) {
          correct = data.scores.pronunciation >= 70;
          setIsCorrect(correct);
          fbText = `Score: ${data.scores.pronunciation}/100. ${data.scores.feedback || ''}`;
          setFeedbackText(fbText);
        } else {
          setIsCorrect(false);
          setFeedbackText('Error analyzing audio.');
        }
      } catch (err) {
        setIsCorrect(false);
        setFeedbackText('Network error.');
      }
    } else {
      if (!selectedAnswer) return;

      correct = selectedAnswer.toLowerCase().trim() === activity.answer.toLowerCase().trim();
      fbText = correct ? 'Excellent job!' : `Not quite. ${activity.feedback || 'Try again next time.'}`;
      setIsCorrect(correct);
      setFeedbackText(fbText);
      setIsChecked(true);
    }

    // Call API to record skill progress
    try {
      const token = localStorage.getItem('token');
      fetch('http://localhost:5000/api/learning/progress/skill', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ skill: activity.type, isCorrect: correct, source: 'lesson' })
      });
    } catch (e) {
      console.error('Error saving skill progress', e);
    }

    if (correct) {
      playSound('correct');
      setStreak(s => s + 1);
    } else {
      playSound('incorrect');
      setStreak(0);
      setShakeHeart(true);
      setTimeout(() => setShakeHeart(false), 500);
      if (hearts > 1) {
        setHearts(h => h - 1);
      } else {
        setHearts(0);
        setIsGameOver(true);
      }
    }
  };

  const handleNext = async () => {
    setIsChecked(false);
    setSelectedAnswer('');
    setIsCorrect(false);
    setAudioBlob(null);
    setBrowserTranscript('');
    setFeedbackText('');
    setShowHint(false);
    
    if (currentIdx < lessonData.activities.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      const bonusXP = Math.floor(streak * 2); 
      const result = await completeLesson();
      if (result) {
        setXpEarned((result.xpEarned || 20) + bonusXP);
        setCoinsEarned(result.coinsEarned || 10);
      } else {
        setXpEarned(20 + bonusXP);
        setCoinsEarned(10);
      }
      setLessonComplete(true);
    }
  };

  const completeLesson = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/learning/${id}/complete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  if (loading) return <div className="lesson-container"><Loader className="spin" size={48} color="#4285F4"/></div>;

  if (isGameOver) {
    return (
      <div className="lesson-container bg-writing">
        <div className="lesson-card engine-card">
          <h1>Out of Hearts! 💔</h1>
          <p>You made a few mistakes, but that's how we learn!</p>
          <div style={{ margin: '2rem 0' }}>
            <Heart size={64} fill="#ef4444" color="#ef4444" />
          </div>
          <button className="check-btn primary-btn" onClick={fetchLessonData}>Try Again</button>
          <Link to="/dashboard" className="check-btn natural" style={{ marginTop: '1rem', background: '#cbd5e1' }}>Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (lessonComplete) {
    const nextBtnText = id === 'practice' 
      ? (currentLang === 'hi' ? "अभ्यास लैब पर वापस जाएं" : currentLang === 'ta' ? "பயிற்சி கூடத்திற்குத் திரும்புக" : currentLang === 'te' ? "ప్రాక్టీస్ ల్యాబ్‌కు తిరిగి వెళ్ళు" : "Back to Practice Lab")
      : t('dash_next_lesson', 'Next Lesson (Dashboard)');

    const handleNextAction = () => {
      if (id === 'practice') {
        fetchLessonData();
      } else {
        if (onClose) onClose(); else navigate('/dashboard');
      }
    };

    return (
      <div className="lesson-container bg-default">
        <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} />
        <div className="lesson-card engine-card">
          <h1>Lesson Completed! 🎉</h1>
          <p>You finished <strong>{lessonData.lesson.title}</strong>!</p>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', margin: '2rem 0' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '2.5rem', margin: 0 }}>⭐</p>
              <p style={{ fontWeight: 'bold', color: '#eab308', fontSize: '1.2rem' }}>+{xpEarned} XP</p>
              {streak > 2 && <span style={{fontSize: '0.8rem', color: '#f97316'}}>Streak Bonus applied!</span>}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="reward-box" style={{ fontSize: '2.5rem', margin: 0 }}>🪙</div>
              <p style={{ fontWeight: 'bold', color: '#eab308', fontSize: '1.2rem' }}>+{coinsEarned} Coins</p>
            </div>
          </div>
          <button onClick={handleNextAction} className="check-btn natural">{nextBtnText}</button>
        </div>
      </div>
    );
  }

  const currentLang = i18n.language || 'hi';
  const loc = PRACTICE_LAB_LOC[currentLang] || PRACTICE_LAB_LOC['hi'];

  if (id === 'practice' && !selectedPracticeMode) {
    let lowestSkill = 'reading';
    let lowestVal = 100;
    if (skillScores) {
      Object.entries(skillScores).forEach(([k, v]) => {
        if (v < lowestVal) {
          lowestVal = v;
          lowestSkill = k;
        }
      });
    }

    return (
      <div className="lesson-container bg-default" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '2rem', background: '#f8fafc' }}>
        <div className="lesson-card engine-card" style={{ width: '100%', maxWidth: '980px', background: 'white', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <button 
              onClick={() => onClose ? onClose() : navigate(-1)}
              style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={20} strokeWidth={2.5} />
            </button>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#1e293b' }}>{loc.title}</h2>
            <div style={{ width: 40 }} />
          </header>

          <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            
            {/* Left Column: Skill Levels & Description */}
            <div style={{ flex: '1', minWidth: '290px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <p style={{ color: '#64748b', fontSize: '1rem', margin: 0, lineHeight: 1.5, textAlign: 'left' }}>{loc.desc}</p>
              
              {skillScores && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', textAlign: 'left' }}>
                  <h4 style={{ margin: '0 0 1.2rem 0', color: '#475569', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    📈 {loc.strengthsTitle}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {Object.entries(skillScores).map(([skill, val]) => {
                      const isLowest = skill === lowestSkill;
                      return (
                        <div 
                          key={skill} 
                          style={{ 
                            background: 'white', 
                            border: isLowest ? '2px solid #2b58ff' : '1px solid #e2e8f0', 
                            borderRadius: '12px', 
                            padding: '0.8rem 1rem', 
                            position: 'relative'
                          }}
                        >
                          {isLowest && (
                            <span style={{ position: 'absolute', top: '-10px', right: '12px', background: '#2b58ff', color: 'white', fontSize: '0.55rem', padding: '0.15rem 0.4rem', borderRadius: '8px', fontWeight: 800, whiteSpace: 'nowrap' }}>
                              {loc.focusArea}
                            </span>
                          )}
                          <span style={{ textTransform: 'capitalize', fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                            {skill}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${val}%`, height: '100%', background: isLowest ? '#2b58ff' : '#10b981', borderRadius: '3px' }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b' }}>{val}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Interactive Practice Drills */}
            <div style={{ flex: '1.3', minWidth: '340px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {['reading', 'writing', 'speaking', 'listening', 'mixed'].map(mode => {
                const isRecommended = mode === 'mixed' || (mode === 'reading' && lowestSkill === 'reading') || (mode === 'writing' && lowestSkill === 'writing') || (mode === 'speaking' && lowestSkill === 'speaking') || (mode === 'listening' && lowestSkill === 'listening');
                return (
                  <button
                    key={mode}
                    onClick={() => startPracticeMode(mode)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1.2rem',
                      borderRadius: '16px',
                      border: isRecommended ? '2px solid #2b58ff' : '1px solid #e2e8f0',
                      background: isRecommended ? '#f5f8ff' : 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.05)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'; }}
                  >
                    <div style={{ flex: 1, paddingRight: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>
                          {loc.modes[mode].title}
                        </h4>
                        {isRecommended && (
                          <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
                            ★ Recommended
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b', fontWeight: 500, lineHeight: 1.4 }}>
                        {loc.modes[mode].desc}
                      </p>
                    </div>
                    <span style={{ fontSize: '1.4rem', color: '#2b58ff', fontWeight: 'bold' }}>→</span>
                  </button>
                );
              })}
            </div>

          </div>

        </div>
      </div>
    );
  }

  const activity = lessonData.activities[currentIdx];

  const getBgClass = () => {
    switch(activity.type) {
      case 'MCQ': return 'bg-mcq';
      case 'Reading': return 'bg-reading';
      case 'Writing': return 'bg-writing';
      case 'Listening': return 'bg-listening';
      case 'Puzzle': return 'bg-puzzle';
      default: return 'bg-default';
    }
  };

  const renderMCQ = () => (
    <div className="q-mcq">
      <div className="options-grid">
        {activity.options.map(opt => (
          <button 
            key={opt} 
            className={`option-btn ${selectedAnswer === opt ? 'selected' : ''}`}
            onClick={() => setSelectedAnswer(opt)}
            disabled={isChecked}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  const renderReading = () => (
    <div className="q-reading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '1rem' }}>
      <div className="flashcard large" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1A73E8', margin: '1rem 0' }}>
        {activity.word}
      </div>
      <div className="a-controls mt-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        {!isRecording ? (
          <button className="mic-btn record" onClick={startRecording} disabled={isChecked}>
            <Mic size={32} color="#fff" />
          </button>
        ) : (
          <button className="mic-btn stop" onClick={stopRecording}>
            <Square size={24} color="#fff" fill="#fff" />
          </button>
        )}
        <div className="recording-status" style={{ marginTop: '1rem', color: '#666' }}>
          {isRecording ? "Listening... (Click square to stop)" : (audioBlob ? "Audio recorded." : "Tap microphone to read aloud.")}
        </div>
      </div>
    </div>
  );

  const renderWriting = () => (
    <div className="q-writing" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button className="play-audio-btn" onClick={() => playTTS(activity.text)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <Volume2 size={48} color="#4285F4" />
        </button>
        <button className="play-audio-btn slow" onClick={() => playTTS(activity.text, true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} title="Slow Audio">
          <Snail size={32} color="#4285F4" />
        </button>
      </div>
      <textarea 
        className="text-input" 
        rows={2}
        placeholder="Type here..."
        value={selectedAnswer}
        onChange={(e) => setSelectedAnswer(e.target.value)}
        disabled={isChecked}
        style={{ height: 'auto', minHeight: '72px', resize: 'none', width: '100%', maxWidth: '400px', padding: '1rem', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '1.1rem' }}
      />
    </div>
  );

  const renderListening = () => (
    <div className="q-listening" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button className="play-audio-btn" onClick={() => playTTS(activity.audioText)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <Volume2 size={48} color="#4285F4" />
        </button>
        <button className="play-audio-btn slow" onClick={() => playTTS(activity.audioText, true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} title="Slow Audio">
          <Snail size={32} color="#4285F4" />
        </button>
      </div>
      <input 
        type="text" 
        className="text-input" 
        placeholder="What did you hear?"
        value={selectedAnswer}
        onChange={(e) => setSelectedAnswer(e.target.value)}
        disabled={isChecked}
        style={{ width: '100%', maxWidth: '400px', padding: '1rem', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '1.1rem' }}
      />
    </div>
  );

  const renderPuzzle = () => (
    <div className="q-puzzle" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
      <div className="puzzle-dropzone" style={{ minHeight: '60px', width: '100%', maxWidth: '400px', padding: '1rem', border: '2px dashed #4285F4', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>
        {selectedAnswer || "Tap words to build the sentence"}
      </div>
      <div className="puzzle-words" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
        {activity.words && activity.words.map(w => (
          <button 
            key={w} 
            className="puzzle-piece option-btn"
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '2px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '1.1rem' }}
            onClick={() => setSelectedAnswer(prev => prev ? prev + ' ' + w : w)}
            disabled={isChecked || selectedAnswer.includes(w)}
          >
            {w}
          </button>
        ))}
      </div>
      <button onClick={() => setSelectedAnswer('')} disabled={isChecked} style={{ padding: '0.5rem 1rem', color: '#666', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
        Clear
      </button>
    </div>
  );

  return (
    <div className={`lesson-container ${getBgClass()}`}>
      <div className="lesson-card engine-card">
        
        <header className="lesson-header" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
            <button 
              className="exit-btn" 
              onClick={() => {
                if (id === 'practice') {
                  setSelectedPracticeMode(null);
                } else {
                  if (onClose) onClose(); else navigate(-1);
                }
              }}
              style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
              title="Exit Lesson"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
            <div style={{ flex: 1, padding: '0 1.5rem' }}>
              <div className="progress-bar" style={{ marginBottom: '0' }}>
                <div 
                  className="progress-fill" 
                  style={{ width: `${(currentIdx / lessonData.activities.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className={`heart-container ${shakeHeart ? 'shake' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#ef4444', fontWeight: 'bold' }}>
                <Heart size={20} fill="#ef4444" /> {hearts}
              </div>
              {streak >= 2 && (
                <div className="streak-container pulse" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f97316', fontWeight: 'bold' }}>
                  <Flame size={20} fill="#f97316" /> {streak}
                </div>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h2 style={{ fontSize: '1.75rem', color: '#1e293b', textAlign: 'left', marginTop: '1rem', fontWeight: '800', letterSpacing: '-0.02em', lineHeight: '1.3' }}>
              {activity.text}
            </h2>
            <button 
              className="hint-btn" 
              onClick={() => { if(coins > 0 && !showHint) { setCoins(c=>c-1); setShowHint(true); } }}
              style={{ background: '#fef3c7', color: '#d97706', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: coins > 0 ? 'pointer' : 'not-allowed', marginTop: '1rem', boxShadow: '0 4px 10px rgba(217, 119, 6, 0.2)' }}
              title={`Hint (Costs 1 Coin) - You have ${coins} coins`}
            >
              <Lightbulb size={24} fill={showHint ? '#d97706' : 'none'} />
            </button>
          </div>
          {showHint && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '1rem', borderRadius: '12px', color: '#b45309', marginTop: '1rem', textAlign: 'left', fontSize: '1rem', fontWeight: '500' }}>
              💡 Hint: {activity.answer || activity.word || "Try to use the correct tense and gender based on context."}
            </div>
          )}
        </header>

        <div className="question-body">
          {activity.type === 'MCQ' && renderMCQ()}
          {activity.type === 'Reading' && renderReading()}
          {activity.type === 'Writing' && renderWriting()}
          {activity.type === 'Listening' && renderListening()}
          {activity.type === 'Puzzle' && renderPuzzle()}
        </div>

        <footer className="lesson-footer" style={{ marginTop: '2rem' }}>
          {isChecked && feedbackText !== 'Analyzing your pronunciation...' && (
            <div className={`feedback-box ${isCorrect ? 'correct' : 'incorrect'}`} style={{ padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: isCorrect ? '#d7ffb8' : '#ffdfe0', border: `2px solid ${isCorrect ? '#58cc02' : '#ea4335'}`, color: isCorrect ? '#2b7000' : '#ea4335' }}>
              {isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{isCorrect ? 'Correct!' : 'Incorrect'}</h3>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>{feedbackText}</p>
              </div>
            </div>
          )}

          {!isChecked ? (
            <button 
              className="check-btn primary-btn" 
              onClick={handleCheck}
              disabled={(!selectedAnswer && activity.type !== 'Reading') || (activity.type === 'Reading' && !audioBlob) || feedbackText === 'Analyzing your pronunciation...'}
              style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: '#58cc02', color: 'white', fontSize: '1.2rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
            >
              {feedbackText === 'Analyzing your pronunciation...' ? 'Analyzing...' : 'Check'}
            </button>
          ) : (
            <button 
              className="check-btn primary-btn" 
              onClick={handleNext}
              style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: '#4285F4', color: 'white', fontSize: '1.2rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
            >
              {currentIdx === lessonData.activities.length - 1 ? 'Finish Lesson' : 'Continue'}
            </button>
          )}
        </footer>

      </div>
    </div>
  );
};

export default LessonPage;
