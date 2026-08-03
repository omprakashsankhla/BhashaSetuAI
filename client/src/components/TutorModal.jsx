import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send, Mic, Keyboard, StopCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import './TutorModal.css';

// Language code mapping for Web Speech API
const SPEECH_LANG_MAP = {
  'hi': 'hi-IN',
  'bn': 'bn-IN',
  'ta': 'ta-IN',
  'te': 'te-IN',
  'mr': 'mr-IN',
  'ur': 'ur-PK',
  'mwr': 'hi-IN',
  'gu': 'gu-IN',
  'kn': 'kn-IN',
  'ml': 'ml-IN',
  'pa': 'pa-IN',
  'en': 'en-US'
};

const TutorModal = ({ onClose }) => {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: t('tutor_greeting', "Hello! I am BhashaSetu, your personal AI language tutor. What do you want to learn today?") }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputMode, setInputMode] = useState('type'); // 'type' or 'speak'
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Check if Web Speech API is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = SPEECH_LANG_MAP[i18n.language] || 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setInput(finalTranscript);
        } else if (interimTranscript) {
          setInput(interimTranscript);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access in your browser settings.');
        }
      };

      recognitionRef.current = recognition;
    }
  }, [i18n.language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    const userMessage = { id: Date.now(), sender: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tutor/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: messageText,
          language: i18n.language
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: data.reply }]);
        
        // Speak the AI response aloud if auto play is enabled
        if ('speechSynthesis' in window && (settings.autoPlayAudio ?? true)) {
          window.speechSynthesis.cancel(); // Stop any ongoing speech
          const utterance = new SpeechSynthesisUtterance(data.reply);
          utterance.lang = SPEECH_LANG_MAP[i18n.language] || 'en-US';
          utterance.rate = settings.voiceSpeed ?? 1;
          
          const doSpeak = () => {
            const voices = window.speechSynthesis.getVoices();
            const langPrefix = utterance.lang.split('-')[0];
            const premiumVoice = voices.find(v => v.lang.startsWith(langPrefix) && (v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Natural')));
            const exactVoice = voices.find(v => v.lang.startsWith(langPrefix));
            if (premiumVoice) utterance.voice = premiumVoice;
            else if (exactVoice) utterance.voice = exactVoice;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
          };
          
          if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = () => { doSpeak(); };
          } else {
            doSpeak();
          }
        }
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: t('tutor_error', "I'm having trouble connecting right now. Please try again later.") }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: t('tutor_network_error', "Sorry, a network error occurred.") }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    if (!speechSupported) {
      alert(t('tutor_not_supported', 'Speech recognition is not supported in your browser.'));
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      // Auto-send after stopping
      if (input.trim()) {
        setTimeout(() => handleSend(input), 300);
      }
    } else {
      setInput('');
      // Update language before starting
      if (recognitionRef.current) {
        recognitionRef.current.lang = SPEECH_LANG_MAP[i18n.language] || 'en-US';
      }
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  return (
    <div className="tutor-modal-overlay">
      <div className="tutor-modal-content">
        <header className="tutor-header">
          <div className="tutor-info">
            <div className="tutor-avatar">
              <span role="img" aria-label="robot">🤖</span>
            </div>
            <div>
              <h2>BhashaSetu AI</h2>
              <p className="online-status">● {t('tutor_online', 'Online')}</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close AI Tutor">
            <X size={24} />
          </button>
        </header>

        <main className="chat-window">
          {messages.map(msg => (
            <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender}`}>
              <div className={`chat-bubble ${msg.sender}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="chat-bubble-wrapper ai">
              <div className="chat-bubble ai typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <footer className="tutor-input-area">
          <div className="input-mode-toggle">
            <button 
              className={`mode-btn ${inputMode === 'speak' ? 'active' : ''}`}
              onClick={() => setInputMode('speak')}
            >
              <Mic size={18} /> {t('tutor_speak', 'Speak')}
            </button>
            <button 
              className={`mode-btn ${inputMode === 'type' ? 'active' : ''}`}
              onClick={() => setInputMode('type')}
            >
              <Keyboard size={18} /> {t('tutor_type', 'Type')}
            </button>
          </div>

          {isOffline ? (
            <div className="offline-warning" style={{ padding: '1rem', textAlign: 'center', color: '#ef4444', background: '#fee2e2', borderRadius: '12px', width: '100%' }}>
              Internet connection required for AI features.
            </div>
          ) : inputMode === 'type' ? (
            <div className="text-input-wrapper">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={t('tutor_placeholder', 'Type your message...')}
                rows={1}
              />
              <button 
                className="send-btn" 
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          ) : (
            <div className="voice-input-wrapper">
              {input && (
                <div style={{ 
                  background: '#f1f5f9', 
                  padding: '0.8rem 1rem', 
                  borderRadius: '12px', 
                  marginBottom: '1rem',
                  color: '#334155',
                  fontStyle: 'italic',
                  textAlign: 'center'
                }}>
                  "{input}"
                </div>
              )}
              <button 
                className={`mic-record-btn ${isRecording ? 'recording' : ''}`}
                onClick={toggleRecording}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
              >
                {isRecording ? <StopCircle size={40} color="white" /> : <Mic size={40} color="white" />}
              </button>
              <p>
                {!speechSupported 
                  ? t('tutor_not_supported', "Speech not supported in this browser")
                  : isRecording 
                    ? t('tutor_listening', "Listening... Tap to stop & send")
                    : t('tutor_tap_speak', "Tap to speak")}
              </p>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
};

export default TutorModal;
