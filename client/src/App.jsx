import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { SettingsProvider } from './context/SettingsContext';
import { SpeedInsights } from '@vercel/speed-insights/react';

const LanguageSelection = lazy(() => import('./pages/LanguageSelection'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const AssessmentPage = lazy(() => import('./pages/AssessmentPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LearnPage = lazy(() => import('./pages/LearnPage'));
const ActivitiesPage = lazy(() => import('./pages/ActivitiesPage'));
const FlashcardsPage = lazy(() => import('./pages/activities/FlashcardsPage'));
const StoriesPage = lazy(() => import('./pages/activities/StoriesPage'));
const ScenariosPage = lazy(() => import('./pages/activities/ScenariosPage'));
const PronunciationPage = lazy(() => import('./pages/activities/PronunciationPage'));
const PronunciationPageAdv = lazy(() => import('./pages/activities/PronunciationPageAdv'));
const WeakSkillsPage = lazy(() => import('./pages/activities/WeakSkillsPage'));
const PictureMatch = lazy(() => import('./pages/activities/PictureMatch'));
const AudioComp = lazy(() => import('./pages/activities/AudioComp'));
const ConversationSim = lazy(() => import('./pages/activities/ConversationSim'));
const SpeechPrep = lazy(() => import('./pages/activities/SpeechPrep'));
const ArticleTranslation = lazy(() => import('./pages/activities/ArticleTranslation'));
const ObjectFinder = lazy(() => import('./pages/activities/ObjectFinder'));
const GenderClassifier = lazy(() => import('./pages/activities/GenderClassifier'));
const DirectionsCompass = lazy(() => import('./pages/activities/DirectionsCompass'));
const ScamDetector = lazy(() => import('./pages/activities/ScamDetector'));
const MockInterview = lazy(() => import('./pages/activities/MockInterview'));
const GrammarEditor = lazy(() => import('./pages/activities/GrammarEditor'));
const LessonPage = lazy(() => import('./pages/LessonPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ActivityEngine = lazy(() => import('./pages/ActivityEngine'));
const GamesHub = lazy(() => import('./pages/GamesHub'));

// You will need to put your actual Google Client ID in an environment variable later
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy_client_id.apps.googleusercontent.com';

const LoadingFallback = () => (
  <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: '#f4f6f8' }}>
    <div style={{ border: '4px solid rgba(0,0,0,0.1)', borderTop: '4px solid #4B2BFF', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  </div>
);

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <SettingsProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<LanguageSelection />} />
              <Route path="/register" element={<AuthPage />} />
              <Route path="/assessment" element={<AssessmentPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/learn" element={<LearnPage />} />
              <Route path="/activities" element={<ActivitiesPage />} />
              <Route path="/activities/flashcards" element={<FlashcardsPage />} />
              <Route path="/activities/stories" element={<StoriesPage />} />
              <Route path="/activities/scenarios" element={<ScenariosPage />} />
              <Route path="/activities/pronunciation" element={<PronunciationPage />} />
              <Route path="/activities/pronunciation-adv" element={<PronunciationPageAdv />} />
              <Route path="/activities/weak-skills" element={<WeakSkillsPage />} />
              <Route path="/activities/picture-match" element={<PictureMatch />} />
              <Route path="/activities/audio-comp" element={<AudioComp />} />
              <Route path="/activities/conversation-sim" element={<ConversationSim />} />
              <Route path="/activities/speech-prep" element={<SpeechPrep />} />
              <Route path="/activities/article-translation" element={<ArticleTranslation />} />
              <Route path="/activities/object-finder" element={<ObjectFinder />} />
              <Route path="/activities/gender-match" element={<GenderClassifier />} />
              <Route path="/activities/directions-compass" element={<DirectionsCompass />} />
              <Route path="/activities/scam-detector" element={<ScamDetector />} />
              <Route path="/activities/mock-interview" element={<MockInterview />} />
              <Route path="/activities/grammar-editor" element={<GrammarEditor />} />
              <Route path="/lesson/:id" element={<LessonPage />} />
              <Route path="/games" element={<GamesHub />} />

              <Route path="/activity/:gameType" element={<ActivityEngine />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </Suspense>
        </Router>
        <SpeedInsights />
      </SettingsProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
