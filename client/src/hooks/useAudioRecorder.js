import { useState, useRef } from 'react';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [browserTranscript, setBrowserTranscript] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const recognitionRef = useRef(null);

  const startRecording = async () => {
    try {
      setBrowserTranscript('');
      setAudioBlob(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start Browser Speech Recognition for instant local evaluation
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        let learningLang = 'hi';
        try {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          learningLang = storedUser.learning_language || 'hi';
        } catch (e) {}

        const LANG_REC_MAP = { 
          hi: 'hi-IN', 
          ur: 'ur-PK', 
          mwr: 'hi-IN', 
          ta: 'ta-IN', 
          te: 'te-IN', 
          bn: 'bn-IN', 
          mr: 'mr-IN', 
          en: 'en-US' 
        };
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

      // Voice Activity Detection (VAD) / Silence Detection
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
      console.error("Microphone access error:", err);
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

  const resetRecording = () => {
    setIsRecording(false);
    setAudioBlob(null);
    setBrowserTranscript('');
  };

  return {
    isRecording,
    audioBlob,
    browserTranscript,
    startRecording,
    stopRecording,
    resetRecording
  };
}
