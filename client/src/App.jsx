import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { SettingsProvider } from './context/SettingsContext';
import LanguageSelection from './pages/LanguageSelection';
import AuthPage from './pages/AuthPage';
import AssessmentPage from './pages/AssessmentPage';
import Dashboard from './pages/Dashboard';
import LearnPage from './pages/LearnPage';
import ActivitiesPage from './pages/ActivitiesPage';
import FlashcardsPage from './pages/activities/FlashcardsPage';
import StoriesPage from './pages/activities/StoriesPage';
import ScenariosPage from './pages/activities/ScenariosPage';
import PronunciationPage from './pages/activities/PronunciationPage';
import PronunciationPageAdv from './pages/activities/PronunciationPageAdv';
import WeakSkillsPage from './pages/activities/WeakSkillsPage';
import PictureMatch from './pages/activities/PictureMatch';
import AudioComp from './pages/activities/AudioComp';
import ConversationSim from './pages/activities/ConversationSim';
import SpeechPrep from './pages/activities/SpeechPrep';
import ArticleTranslation from './pages/activities/ArticleTranslation';
import ObjectFinder from './pages/activities/ObjectFinder';
import GenderClassifier from './pages/activities/GenderClassifier';
import DirectionsCompass from './pages/activities/DirectionsCompass';
import ScamDetector from './pages/activities/ScamDetector';
import MockInterview from './pages/activities/MockInterview';
import GrammarEditor from './pages/activities/GrammarEditor';
import LessonPage from './pages/LessonPage';
import AdminDashboard from './pages/AdminDashboard';
import ActivityEngine from './pages/ActivityEngine';
import GamesHub from './pages/GamesHub';

// You will need to put your actual Google Client ID in an environment variable later
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy_client_id.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <SettingsProvider>
        <Router>
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
      </Router>
      </SettingsProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
