import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, BookOpen, Target, Gamepad2, Edit3, Award, BarChart2, User, Settings, LogOut, Bot, Play, ShieldAlert, Zap, Flame, Trophy } from 'lucide-react';
import ProfileModal from '../components/ProfileModal';
import SettingsModal from '../components/SettingsModal';
import LeaderboardModal from '../components/LeaderboardModal';
import TutorModal from '../components/TutorModal';
import ProgressModal from '../components/ProgressModal';
import './Dashboard.css';
import './ActivitiesPage.css'; // Reuse container styling

const GAMES_LIST = [
  // Beginner Games
  {
    id: 'balloon-pop',
    title: 'Balloon Pop Catcher',
    description: 'Pop floating letter balloons in the correct order to spell vocabulary words.',
    icon: '🎈',
    color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    level: 'Beginner',
    scoreGoal: 10,
    timeEst: '2 mins'
  },
  {
    id: 'trace-letters',
    title: 'Trace Master',
    description: 'Practice writing native letters directly on screen with drawing accuracy check.',
    icon: '✍️',
    color: 'linear-gradient(135deg, #ec4899, #be185d)',
    level: 'Beginner',
    scoreGoal: 100,
    timeEst: '3 mins'
  },
  {
    id: 'sound-match',
    title: 'Sound Matcher',
    description: 'Pair vocal sounds of the alphabet with their corresponding written scripts.',
    icon: '🔊',
    color: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    level: 'Beginner',
    scoreGoal: 8,
    timeEst: '2 mins'
  },
  {
    id: 'fruit-catch',
    title: 'Fruit Catcher',
    description: 'Catch the correct falling translation objects in your basket under speed pressure.',
    icon: '🍎',
    color: 'linear-gradient(135deg, #10b981, #047857)',
    level: 'Beginner',
    scoreGoal: 15,
    timeEst: '1.5 mins'
  },
  {
    id: 'pic-bingo',
    title: 'Picture Bingo',
    description: 'Match spoken vocabulary words to the correct image on a 3x3 grid to get Bingo!',
    icon: '🎲',
    color: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    level: 'Beginner',
    scoreGoal: 1,
    timeEst: '2 mins'
  },
  {
    id: 'memory-flip',
    title: 'Flash Memory Flip',
    description: 'Flip cards to match the written vocabulary word to its corresponding image and sound.',
    icon: '🎴',
    color: 'linear-gradient(135deg, #f43f5e, #be123c)',
    level: 'Beginner',
    scoreGoal: 6,
    timeEst: '2.5 mins'
  },

  // Intermediate Games
  {
    id: 'sentence-builder',
    title: 'Sentence Scrambler',
    description: 'Arrange scrambled words to construct grammatically sound sentences.',
    icon: '🧩',
    color: 'linear-gradient(135deg, #f59e0b, #b45309)',
    level: 'Intermediate',
    scoreGoal: 5,
    timeEst: '3 mins'
  },
  {
    id: 'sign-reader',
    title: 'Speed Sign Reader',
    description: 'Rapidly identify the meaning of public, travel, and safety street signs.',
    icon: '🚦',
    color: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    level: 'Intermediate',
    scoreGoal: 10,
    timeEst: '2 mins'
  },
  {
    id: 'shop-keeper',
    title: 'Bazaar Shopkeeper',
    description: 'Fulfill customer orders, measure products, and calculate bills correctly.',
    icon: '🏪',
    color: 'linear-gradient(135deg, #f97316, #c2410c)',
    level: 'Intermediate',
    scoreGoal: 50,
    timeEst: '4 mins'
  },
  {
    id: 'crossword-clue',
    title: 'Clue Crossword',
    description: 'Solve intermediate crossword puzzles with local word definitions and clues.',
    icon: '🧩',
    color: 'linear-gradient(135deg, #8b5cf6, #5b21b6)',
    level: 'Intermediate',
    scoreGoal: 4,
    timeEst: '3 mins'
  },
  {
    id: 'tense-shift',
    title: 'Tense Shift Connect',
    description: 'Connect verbs to their appropriate past, present, or future tense forms under a matching timer.',
    icon: '⏳',
    color: 'linear-gradient(135deg, #10b981, #065f46)',
    level: 'Intermediate',
    scoreGoal: 10,
    timeEst: '2 mins'
  },
  {
    id: 'dialogue-puzzler',
    title: 'Dialogue Puzzler',
    description: 'Re-arrange conversational bubbles to form a coherent, polite dialogue.',
    icon: '💬',
    color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    level: 'Intermediate',
    scoreGoal: 4,
    timeEst: '3 mins'
  },

  // Advanced Games
  {
    id: 'word-sprint',
    title: 'Word Sprint Typer',
    description: 'Type out correct phonetic translations before they crash into the screen edge.',
    icon: '⌨️',
    color: 'linear-gradient(135deg, #6366f1, #4338ca)',
    level: 'Advanced',
    scoreGoal: 12,
    timeEst: '2.5 mins'
  },
  {
    id: 'echo-chamber',
    title: 'Echo Tongue Twisters',
    description: 'Record tongue twisters and complex phrases to test pronunciation rhythm.',
    icon: '🎤',
    color: 'linear-gradient(135deg, #ec4899, #be185d)',
    level: 'Advanced',
    scoreGoal: 90,
    timeEst: '3 mins'
  },
  {
    id: 'text-detective',
    title: 'Grammar Detective',
    description: 'Spot and fix spelling/syntax errors hidden within news briefs or mock emails.',
    icon: '🕵️',
    color: 'linear-gradient(135deg, #475569, #334155)',
    level: 'Advanced',
    scoreGoal: 5,
    timeEst: '3.5 mins'
  },
  {
    id: 'speed-editor',
    title: 'Editorial Speed Draft',
    description: 'Race against the clock to replace formal words with their high-register synonyms.',
    icon: '✍️',
    color: 'linear-gradient(135deg, #f43f5e, #9f1239)',
    level: 'Advanced',
    scoreGoal: 8,
    timeEst: '2 mins'
  },
  {
    id: 'debate-builder',
    title: 'Debate Argument Builder',
    description: 'Select logical evidence blocks and counter-arguments to win an AI speech debate.',
    icon: '🗣️',
    color: 'linear-gradient(135deg, #f59e0b, #9a3412)',
    level: 'Advanced',
    scoreGoal: 3,
    timeEst: '4 mins'
  },
  {
    id: 'idiom-connect',
    title: 'Idiom Connect',
    description: 'Connect sophisticated cultural idioms with their abstract real-world explanations.',
    icon: '🔗',
    color: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    level: 'Advanced',
    scoreGoal: 5,
    timeEst: '2.5 mins'
  }
];

const GAMES_LOC_DATA = {
  hi: {
    hubTitle: "खेल हब",
    hubDesc: "रोमांचक और मनोरंजक खेलों के माध्यम से भाषा सीखें!",
    lockedAlert: "🔒 यह खेल बंद है! इसे खोलने के लिए अधिक सिक्के कमाएं या पिछले स्तर पूरे करें!",
    scoreGoal: "लक्ष्य:",
    timeEst: "समय:",
    ready: "शुरू करें",
    locked: "ताला लगा है",
    play: "खेलें",
    tabs: { Beginner: "प्रारंभिक", Intermediate: "मध्यम", Advanced: "उच्च" },
    games: {
      'balloon-pop': { title: "गुब्बारा पोड़ो", desc: "शब्दावली के शब्दों को बनाने के लिए अक्षरों के गुब्बारों को सही क्रम में फोड़ें।" },
      'trace-letters': { title: "वर्ण लेखन", desc: "सटीकता जांच के साथ सीधे स्क्रीन पर वर्णमाला के अक्षरों को लिखने का अभ्यास करें।" },
      'sound-match': { title: "ध्वनि मिलान", desc: "वर्णमाला की आवाज़ों को उनके संबंधित लिखित वर्णों के साथ जोड़ें।" },
      'fruit-catch': { title: "फल पकड़ने वाला", desc: "अपनी टोकरी में सही गिरते हुए अनुवाद फलों को पकड़ें।" },
      'pic-bingo': { title: "चित्र बींगो", desc: "बींगो पाने के लिए 3x3 ग्रिड पर सही चित्र के साथ बोले गए शब्दों का मिलान करें।" },
      'memory-flip': { title: "स्मृति कार्ड मिलान", desc: "लिखित शब्दों को उनके संबंधित चित्र से मिलाने के लिए कार्डों को पलटें।" },
      'sentence-builder': { title: "वाक्य क्रमबद्धता", desc: "व्याकरणिक रूप से सही वाक्य बनाने के लिए बिखरे हुए शब्दों को व्यवस्थित करें।" },
      'sign-reader': { title: "सड़क संकेत वाचक", desc: "सड़क, यात्रा और सुरक्षा संकेतों के अर्थों को शीघ्रता से पहचानें।" },
      'shop-keeper': { title: "बाज़ार दुकानदार", desc: "ग्राहकों के ऑर्डर पूरे करें, वस्तुओं को मापें और सही बिल की गणना करें।" },
      'crossword-clue': { title: "संकेत पहेली", desc: "स्थानीय शब्द परिभाषाओं और संकेतों के साथ पहेली को हल करें।" },
      'tense-shift': { title: "काल परिवर्तन मिलान", desc: "क्रियाओं को उनके सही भूत, वर्तमान या भविष्य काल रूपों से जोड़ें।" },
      'dialogue-puzzler': { title: "संवाद पहेली", desc: "दुकानदार या ग्राहक के साथ बातचीत की पंक्तियों को सही क्रम में व्यवस्थित करें।" },
      'word-sprint': { title: "शब्द गति टाइपिंग", desc: "शब्दों के स्क्रीन से टकराने से पहले उनका सही अनुवाद टाइप करें।" },
      'echo-chamber': { title: "ध्वनि प्रतिध्वनि", desc: "उच्चारण लय और स्पष्टता का परीक्षण करने के लिए कठिन वाक्यों को बोलें।" },
      'text-detective': { title: "व्याकरण जासूस", desc: "समाचारों या ईमेल में छिपी वर्तनी और व्याकरण की गलतियों को खोजें।" },
      'speed-editor': { title: "संपादन गति ड्राफ्ट", desc: "औपचारिक शब्दों को उनके सही उच्च-स्तरीय समानार्थी शब्दों से बदलें।" },
      'debate-builder': { title: "वाद-विवाद तर्क निर्माता", desc: "बहस जीतने के लिए सबसे तार्किक साक्ष्य और तर्क कार्ड चुनें।" },
      'idiom-connect': { title: "मुहावरा मिलान", desc: "मुहावरों को उनके सही वास्तविक अर्थों के साथ जोड़ें।" }
    }
  },
  en: {
    hubTitle: "Games Hub",
    hubDesc: "Master languages through interactive, gamified learning challenges!",
    lockedAlert: "🔒 This game is locked! Earn more coins or complete lower levels to unlock it!",
    scoreGoal: "Goal:",
    timeEst: "Time:",
    ready: "READY",
    locked: "LOCKED",
    play: "Play",
    tabs: { Beginner: "Beginner", Intermediate: "Intermediate", Advanced: "Advanced" },
    games: {
      'balloon-pop': { title: "Balloon Pop Catcher", desc: "Pop floating letter balloons in the correct order to spell vocabulary words." },
      'trace-letters': { title: "Trace Master", desc: "Practice writing native letters directly on screen with drawing accuracy check." },
      'sound-match': { title: "Sound Matcher", desc: "Pair vocal sounds of the alphabet with their corresponding written scripts." },
      'fruit-catch': { title: "Fruit Catcher", desc: "Catch the correct falling translation objects in your basket under speed pressure." },
      'pic-bingo': { title: "Picture Bingo", desc: "Match spoken vocabulary words to the correct image on a 3x3 grid to get Bingo!" },
      'memory-flip': { title: "Flash Memory Flip", desc: "Flip cards to match the written vocabulary word to its corresponding image and sound." },
      'sentence-builder': { title: "Sentence Scrambler", desc: "Arrange scrambled words to construct grammatically sound sentences." },
      'sign-reader': { title: "Speed Sign Reader", desc: "Rapidly identify the meaning of public, travel, and safety street signs." },
      'shop-keeper': { title: "Bazaar Shopkeeper", desc: "Fulfill customer orders, measure products, and calculate bills correctly." },
      'crossword-clue': { title: "Clue Crossword", desc: "Solve intermediate crossword puzzles with local word definitions and clues." },
      'tense-shift': { title: "Tense Shift Connect", desc: "Connect verbs to their appropriate past, present, or future tense forms." },
      'dialogue-puzzler': { title: "Dialogue Puzzler", desc: "Re-arrange conversational bubbles to form a coherent, polite dialogue." },
      'word-sprint': { title: "Word Sprint Typer", desc: "Type out correct phonetic translations before they crash into the screen edge." },
      'echo-chamber': { title: "Echo Tongue Twisters", desc: "Record tongue twisters and complex phrases to test pronunciation rhythm." },
      'text-detective': { title: "Grammar Detective", desc: "Spot and fix spelling/syntax errors hidden within news briefs or mock emails." },
      'speed-editor': { title: "Editorial Speed Draft", desc: "Race against the clock to replace formal words with their high-register synonyms." },
      'debate-builder': { title: "Debate Argument Builder", desc: "Select logical evidence blocks and counter-arguments to win an AI speech debate." },
      'idiom-connect': { title: "Idiom Connect", desc: "Connect sophisticated cultural idioms with their abstract real-world explanations." }
    }
  },
  ta: {
    hubTitle: "விளையாட்டு மையம்",
    hubDesc: "ஊடாடும் மற்றும் வேடிக்கையான விளையாட்டுகள் மூலம் மொழியைக் கற்றுக்கொள்ளுங்கள்!",
    lockedAlert: "🔒 இந்த விளையாட்டு பூட்டப்பட்டுள்ளது! மேலும் நாணயங்களை சம்பாதிக்கவும் அல்லது முந்தைய நிலைகளை முடிக்கவும்!",
    scoreGoal: "இலக்கு:",
    timeEst: "நேரம்:",
    ready: "தயார்",
    locked: "பூட்டப்பட்டது",
    play: "விளையாடு",
    tabs: { Beginner: "தொடக்க நிலை", Intermediate: "இடைநிலை", Advanced: "உயர் நிலை" },
    games: {
      'balloon-pop': { title: "பலூன் பாப்", desc: "வார்த்தைகளை உருவாக்க பலூன்களை சரியான வரிசையில் உடைக்கவும்." },
      'trace-letters': { title: "எழுத்து பயிற்சி", desc: "திரையில் எழுத்துக்களை எழுதுவதன் மூலம் எழுத்துக்களைப் பயிற்சி செய்யுங்கள்." },
      'sound-match': { title: "ஒலி பொருத்தம்", desc: "எழுத்துக்களின் ஒலிகளை அவற்றின் எழுத்துக்களுடன் பொருத்துங்கள்." },
      'fruit-catch': { title: "பழம் பிடிப்பவர்", desc: "விழும் சரியான மொழிபெயர்ப்பு பழங்களை கூடைக்குள் பிடித்திடுங்கள்." },
      'pic-bingo': { title: "பட பிங்கோ", desc: "பிங்கோவை வெல்ல 3x3 கட்டத்தில் சொல்லப்பட்ட வார்த்தையை சரியான படத்துடன் பொருத்துங்கள்." },
      'memory-flip': { title: "நினைவக அட்டை", desc: "வார்த்தைகளை அவற்றின் படங்களுடன் பொருத்த அட்டைகளைத் திருப்புங்கள்." },
      'sentence-builder': { title: "வாக்கிய அமைப்பு", desc: "சரியான வாக்கியத்தை உருவாக்க வார்த்தைகளை வரிசைப்படுத்துங்கள்." },
      'sign-reader': { title: "சாலை சிக்னல்", desc: "சாலை மற்றும் பாதுகாப்பு சிக்னல்களின் அர்த்தங்களை விரைவாகக் கண்டறியவும்." },
      'shop-keeper': { title: "கடைக்காரர்", desc: "வாடிக்கையாளர் ஆர்டர்களை முடித்து, பில்களைக் கணக்கிடுங்கள்." },
      'crossword-clue': { title: "குறுக்கெழுத்து புதிர்", desc: "உள்ளூர் குறிப்புகளுடன் குறுக்கெழுத்து புதிர்களை தீர்க்கவும்." },
      'tense-shift': { title: "கால மாற்றம்", desc: "வினைச்சொற்களை அவற்றின் கால வடிவங்களுடன் பொருத்துங்கள்." },
      'dialogue-puzzler': { title: "உரையாடல் புதிர்", desc: "உரையாடல் வரிகளை சரியான வரிசையில் பொருத்துங்கள்." },
      'word-sprint': { title: "வேக தட்டச்சு", desc: "வார்த்தைகள் விழுவதற்குள் அவற்றின் மொழிபெயர்ப்பை தட்டச்சு செய்யவும்." },
      'echo-chamber': { title: "ஒலி அதிர்வு", desc: "உச்சரிப்பைச் சோதிக்க கடினமான வாக்கியங்களை உரக்கப் பேசுங்கள்." },
      'text-detective': { title: "இலக்கணக் கண்டறிதல்", desc: "உரைகளில் உள்ள எழுத்துப் பிழைகளைக் கண்டறியவும்." },
      'speed-editor': { title: "வேகத் திருத்துநர்", desc: "வார்த்தைகளை அவற்றின் முறையான சொற்களாக மாற்றவும்." },
      'debate-builder': { title: "விவாதக் கார்டு", desc: "விவாதத்தில் வெற்றி பெற சிறந்த தர்க்கவாதத்தைத் தேர்ந்தெடுக்கவும்." },
      'idiom-connect': { title: "மரபுத்தொடர் பொருத்தம்", desc: "மரபுத்தொடர்களை அவற்றின் உண்மையான பொருளுடன் பொருத்துங்கள்." }
    }
  },
  te: {
    hubTitle: "గేమ్స్ హబ్",
    hubDesc: "వినోదభరితమైన ఆటల ద్వారా భాషను సులభంగా నేర్చుకోండి!",
    lockedAlert: "🔒 ఈ ఆట లాక్ చేయబడింది! మరిన్ని నాణేలు సంపాదించండి లేదా మునుపటి స్థాయిలను పూర్తి చేయండి!",
    scoreGoal: "లక్ష్యం:",
    timeEst: "సమయం:",
    ready: "సిద్ధం",
    locked: "లాక్ చేయబడింది",
    play: "ఆడండి",
    tabs: { Beginner: "ప్రారంభ స్థాయి", Intermediate: "మధ్యమ స్థాయి", Advanced: "ఉన్నత స్థాయి" },
    games: {
      'balloon-pop': { title: "బెలూన్ పాప్", desc: "పదాలను రూపొందించడానికి అక్షరాల బెలూన్లను సరైన వరుసలో పగలగొట్టండి." },
      'trace-letters': { title: "అక్షర లేఖనం", desc: "స్క్రీన్ పై అక్షరాలను రాయడం ద్వారా వర్ణమాలను ప్రాక్టీస్ చేయండి." },
      'sound-match': { title: "ధ్వని సరిపోలిక", desc: "అక్షరాల శబ్దాలను వాటి రాత రూపాలతో జతపరచండి." },
      'fruit-catch': { title: "పండ్ల బుట్ట", desc: "సరైన అనువాదం గల పండ్లను బుట్టలో పట్టుకోండి." },
      'pic-bingo': { title: "చిత్ర బింగో", desc: "చెప్పిన పదాన్ని సరైన చిత్రంతో జతపరిచి బింగో సాధించండి." },
      'memory-flip': { title: "మెమొరీ కార్డ్", desc: "పదాలను వాటి చిత్రాలతో జతపరచడానికి కార్డులను తిప్పండి." },
      'sentence-builder': { title: "వాక్య నిర్మాణం", desc: "సరైన వాక్యాన్ని నిర్మించడానికి పదాలను అమర్చండి." },
      'sign-reader': { title: "రోడ్డు సంకేతాలు", desc: "రోడ్డు మరియు భద్రతా సంకేతాల అర్థాలను త్వరగా గుర్తించండి." },
      'shop-keeper': { title: "దుకాణదారుడు", desc: "కస్టమర్ల ఆర్డర్లను పూర్తి చేసి బిల్లులను లెక్కించండి." },
      'crossword-clue': { title: "పద వినోదం", desc: "చిన్న ఆధారాలతో పదాల పజిల్‌ను పూర్తి చేయండి." },
      'tense-shift': { title: "కాలాలు-క్రియలు", desc: "క్రియలను వాటి సరైన కాల రూపాలతో జతపరచండి." },
      'dialogue-puzzler': { title: "సంభాషణ పజిల్", desc: "సంభాషణను సరైన క్రమంలో అమర్చండి." },
      'word-sprint': { title: "వేగవంతమైన టైపింగ్", desc: "పదాలు కింద పడకముందే వాటి అనువాదాన్ని టైప్ చేయండి." },
      'echo-chamber': { title: "ధ్వని ఉచ్ఛారణ", desc: "ఉచ్ఛారణను పరీక్షించుకోవడానికి కఠినమైన వాక్యాలను పలకండి." },
      'text-detective': { title: "వ్యాకరణ పరిశోధన", desc: "వాక్యాలలో తప్పులను గుర్తించి సరిచేయండి." },
      'speed-editor': { title: "ఎడిటింగ్ వేగం", desc: "సాధారణ పదాలను సరైన అధికారిక పదాలుగా మార్చండి." },
      'debate-builder': { title: "చర్చా వేదిక", desc: "వాదనలో గెలవడానికి సరైన తార్కిక కార్డును ఎంచుకోండి." },
      'idiom-connect': { title: "జాతీయాలు-అర్థాలు", desc: "జాతీయాలను వాటి సరైన అర్థాలతో జతపరచండి." }
    }
  }
};

const fallbacks = ['mwr', 'ur', 'bn', 'mr'];
fallbacks.forEach(lang => {
  GAMES_LOC_DATA[lang] = GAMES_LOC_DATA['hi'];
});

const GamesHub = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const currentLang = i18n.language || 'hi';
  const loc = GAMES_LOC_DATA[currentLang] || GAMES_LOC_DATA['hi'];

  const [activeLevel, setActiveLevel] = useState(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.proficiency_level || 'Beginner';
      } catch (e) {
        return 'Beginner';
      }
    }
    return 'Beginner';
  });

  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showTutor, setShowTutor] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [data, setData] = useState(null);

  // Simulated unlock progress
  const [unlockedGames, setUnlockedGames] = useState({
    'balloon-pop': true,
    'trace-letters': true,
    'sound-match': true,
    'fruit-catch': true,
    'pic-bingo': true,
    'memory-flip': true,
    'sentence-builder': false, // unlocked after playing beginner
    'sign-reader': false,
    'shop-keeper': false,
    'crossword-clue': false,
    'tense-shift': false,
    'dialogue-puzzler': false,
    'word-sprint': false,
    'echo-chamber': false,
    'text-detective': false,
    'speed-editor': false,
    'debate-builder': false,
    'idiom-connect': false
  });

  useEffect(() => {
    fetchDashboardData();
    // Check local storage for unlocked level indices
    const stats = localStorage.getItem('games_progress');
    if (stats) {
      try {
        const prog = JSON.parse(stats);
        setUnlockedGames(prev => ({ ...prev, ...prog }));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/register');
        return;
      }
      const res = await fetch(`http://localhost:5000/api/dashboard/data?interfaceLang=${i18n.language || 'en'}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        // Automatically unlock intermediate if beginner is finished, etc.
        const totalCoins = json.stats?.coins || 0;
        if (totalCoins > 50) {
          setUnlockedGames(prev => ({
            ...prev,
            'sentence-builder': true,
            'sign-reader': true,
            'shop-keeper': true,
            'crossword-clue': true,
            'tense-shift': true,
            'dialogue-puzzler': true
          }));
        }
        if (totalCoins > 120) {
          setUnlockedGames(prev => ({
            ...prev,
            'word-sprint': true,
            'echo-chamber': true,
            'text-detective': true,
            'speed-editor': true,
            'debate-builder': true,
            'idiom-connect': true
          }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/register');
  };

  const handlePlayGame = (gameId, isUnlocked) => {
    if (!isUnlocked) {
      alert(loc.lockedAlert);
      return;
    }
    navigate(`/activity/${gameId}`);
  };

  const filteredGames = GAMES_LIST.filter(g => g.level === activeLevel);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>{currentLang === 'hi' ? "भाषासेतु" : currentLang === 'ta' ? "பாஷாசேது" : currentLang === 'te' ? "భాషాసేతు" : "BhashaSetu"}</h2>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => navigate('/dashboard')}><Home size={20} /> <span>{t('dash_nav_home', 'Home')}</span></button>
          <button className="nav-item" onClick={() => navigate('/learn')}><BookOpen size={20} /> <span>{t('dash_nav_learn', 'Learn')}</span></button>
          <button className="nav-item" onClick={() => navigate('/activities')}><Target size={20} /> <span>{t('dash_nav_activities', 'Activities')}</span></button>
          <button className="nav-item active"><Gamepad2 size={20} /> <span>{t('dash_nav_games', 'Games')}</span></button>
          <button className="nav-item" onClick={() => navigate('/lesson/practice')}><Edit3 size={20} /> <span>{t('dash_nav_practice', 'Practice')}</span></button>
          <button className="nav-item" onClick={() => setShowLeaderboard(true)}><Award size={20} /> <span>{t('dash_nav_leaderboard', 'Leaderboard')}</span></button>
          <button className="nav-item" onClick={() => setShowProgress(true)}><BarChart2 size={20} /> <span>{t('dash_nav_progress', 'Progress')}</span></button>
          <button className="nav-item" onClick={() => setShowProfile(true)}><User size={20} /> <span>{t('dash_nav_profile', 'Profile')}</span></button>
          <button className="nav-item" onClick={() => setShowSettings(true)}><Settings size={20} /> <span>{t('dash_nav_settings', 'Settings')}</span></button>
          
          <button className="nav-item logout" onClick={handleLogout} style={{ marginTop: 'auto' }}>
            <LogOut size={20} /> <span>{t('dash_nav_logout', 'Logout')}</span>
          </button>
        </nav>
      </aside>

      <div className="dashboard-workspace activities-workspace">
        <header className="dashboard-header activities-header">
          <div className="welcome-text">
            <h1>🎮 {loc.hubTitle}</h1>
            <p>{loc.hubDesc}</p>
          </div>
        </header>

        {/* Level tabs selector */}
        <div className="activity-tabs" style={{ display: 'flex', gap: '1rem', padding: '0 2.5rem', marginBottom: '2rem' }}>
          {['Beginner', 'Intermediate', 'Advanced'].map(level => (
            <button
              key={level}
              className={`activity-tab ${activeLevel === level ? 'active' : ''}`}
              onClick={() => setActiveLevel(level)}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                background: activeLevel === level ? '#2b58ff' : '#f1f5f9',
                color: activeLevel === level ? 'white' : '#64748b',
                transition: 'all 0.2s'
              }}
            >
              {loc.tabs[level]}
            </button>
          ))}
        </div>

        {/* Catalog container */}
        <main className="activities-container" style={{ paddingTop: 0 }}>
          <div className="activities-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {filteredGames.map((game) => {
              const isUnlocked = unlockedGames[game.id];
              const gameLoc = loc.games[game.id] || { title: game.title, desc: game.description };
              return (
                <div 
                  key={game.id} 
                  className={`activity-card ${!isUnlocked ? 'locked-card-hub' : ''}`}
                  onClick={() => handlePlayGame(game.id, isUnlocked)}
                  style={{ 
                    position: 'relative', 
                    cursor: isUnlocked ? 'pointer' : 'not-allowed',
                    opacity: isUnlocked ? 1 : 0.65,
                    border: '1px solid #e2e8f0',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    background: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '220px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div 
                        style={{ 
                          width: '52px', 
                          height: '52px', 
                          borderRadius: '16px', 
                          background: game.color, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '1.8rem',
                          color: 'white',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}
                      >
                        {game.icon}
                      </div>
                      <span 
                        style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 700, 
                          color: isUnlocked ? '#10b981' : '#94a3b8',
                          background: isUnlocked ? '#dcfce7' : '#f1f5f9',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '20px'
                        }}
                      >
                        {isUnlocked ? loc.ready : loc.locked}
                      </span>
                    </div>

                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: '#1e293b', fontWeight: 800 }}>{gameLoc.title}</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.4 }}>{gameLoc.desc}</p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                    <span>⏱️ {loc.timeEst} {game.timeEst}</span>
                    <span style={{ color: '#2b58ff', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      {isUnlocked ? <>{loc.play} <Play size={12} fill="#2b58ff" /></> : <>🔒 {loc.locked}</>}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      <div className="ai-tutor-fab" onClick={() => setShowTutor(true)}>
        <span style={{ fontWeight: '600', fontSize: '1.05rem', letterSpacing: '0.5px' }}>{t('dash_talk_with_me')}</span>
        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.6rem', borderRadius: '50%', display: 'flex' }}>
          <Bot size={24} />
        </div>
      </div>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
      {showTutor && <TutorModal onClose={() => setShowTutor(false)} />}
      {showProgress && <ProgressModal data={data} onClose={() => setShowProgress(false)} />}
    </div>
  );
};

export default GamesHub;
