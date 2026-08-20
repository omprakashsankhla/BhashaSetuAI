import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  BookText, 
  ChevronRight, 
  Volume2, 
  Award, 
  Sparkles, 
  Play, 
  Square, 
  VolumeX, 
  Trophy, 
  BookOpen, 
  Compass, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  RotateCcw,
  BookOpenCheck
} from 'lucide-react';
import { STORIES_MAP } from './storiesData';
import { speakText as ttsSpeak, LANG_REC_MAP } from '../../utils/ttsHelper';
import './FlashcardsPage.css';



const WORD_MEANINGS = {
  hi: {
    'बाज़ार': "वह स्थान जहाँ सामान, भोजन और सब्जियाँ खरीदी और बेची जाती हैं।",
    'सब्जियां': "भोजन के रूप में खाए जाने वाले पौधे या उनके भाग।",
    'टमाटर': "रसोई में सब्जी के रूप में उपयोग होने वाला लाल, गोल फल।",
    'आलू': "जमीन के नीचे उगने वाली एक गोल स्टार्चयुक्त कंद सब्जी।",
    'प्याज़': "मजबूत गंध और स्वाद वाली परतों वाली एक गोल सब्जी।",
    'दुकानदार': "वह व्यक्ति जो सामान, भोजन या उत्पाद बेचता है।",
    'कीमत': "भुगतान में अपेक्षित, आवश्यक या दी जाने वाली धनराशि।",
    'छूट': "किसी चीज़ की सामान्य कीमत में की गई कमी।",
    'बस स्टॉप': "वह स्थान जहाँ यात्रियों के लिए बसें रुकती हैं।",
    'बस': "सड़क मार्ग से यात्रियों को ले जाने वाला एक बड़ा मोटर वाहन।",
    'पास': "यात्रा या प्रवेश की अनुमति देने वाला टिकट या परमिट।",
    'कंडक्टर': "सार्वजनिक परिवहन का प्रभारी व्यक्ति जो किराया वसूल करता है।",
    'खिड़की': "प्रकाश या हवा आने देने के लिए दीवार या वाहन में किया गया छेद।",
    'इमारतें': "छत और दीवारों वाली संरचनाएं, जैसे घर या कारखाने।",
    'स्कूल': "बच्चों को शिक्षित करने की संस्था।",
    'रसोई': "वह कमरा या क्षेत्र जहाँ भोजन तैयार और पकाया जाता है।",
    'पानी': "जीवन के लिए आवश्यक एक रंगहीन, पारदर्शी, गंधहीन तरल।",
    'तख्ता': "एक सपाट तख्ता जिस पर खाद्य सामग्री काटी जाती है।",
    'नमक': "भोजन का स्वाद बढ़ाने के लिए इस्तेमाल किया जाने वाला सफेद क्रिस्टलीय पदार्थ।",
    'मसाले': "भोजन में स्वाद जोड़ने के लिए उपयोग किए जाने वाले सुगंधित पदार्थ।",
    'खाना': "जीवन और विकास को बनाए रखने के लिए खाया जाने वाला पौष्टिक पदार्थ।",
    'क्लीनिक': "वह स्थान जहाँ मरीजों का चिकित्सीय उपचार किया जाता है।",
    'डॉक्टर': "चिकित्सा का एक योग्य चिकित्सक।",
    'थर्मामीटर': "शरीर का तापमान मापने का एक उपकरण।",
    'आराम': "आराम करने या ताकत हासिल करने के लिए काम या आंदोलन को रोकना।",
    'दवा': "बीमारी के इलाज के लिए इस्तेमाल की जाने वाली दवा या पदार्थ।",
    'पार्क': "सार्वजनिक मनोरंजन के लिए एक बड़ा हरा क्षेत्र।",
    'पेड़': "एक तने वाले काष्ठीय बारहमासी पौधे।",
    'फूल': "एक पौधे का बीज धारण करने वाला हिस्सा, जिसमें पंखुड़ियाँ होती हैं।",
    'पक्षी': "पंखों वाले गर्म खून वाले अंडे देने वाले कशेरुकी जीव।",
    'बेंच': "कई लोगों के लिए बैठने की एक लंबी सीट।",
    'ईमेल': "इलेक्ट्रॉनिक माध्यम से एक उपयोगकर्ता से दूसरे उपयोगकर्ता को भेजे जाने वाले संदेश।",
    'लिंक': "किसी वेबपेज का डिजिटल शॉर्टकट या पता।",
    'पासवर्ड': "किसी खाते में लॉग इन करने के लिए उपयोग किया जाने वाला एक गुप्त शब्द या वाक्यांश।",
    'स्पैम': "कई लोगों को भेजे जाने वाले अवांछित या संदिग्ध ईमेल।",
    'फ़ोन कॉल': "फोन का उपयोग करके किसी से बात करने की घटना।",
    'मैनेजर': "किसी संगठन को नियंत्रित या प्रशासित करने के लिए जिम्मेदार व्यक्ति।",
    'ओटीपी': "सुरक्षित डिजिटल प्रमाणीकरण के लिए उपयोग किया जाने वाला एक बार का पासवर्ड।",
    'पुलिस': "सार्वजनिक व्यवस्था बनाए रखने के लिए जिम्मेदार राज्य का नागरिक बल।",
    'हेलमेट': "मोटर साइकिल चालकों द्वारा पहना जाने वाला एक सुरक्षात्मक हेलमेट।",
    'गति': "वह दर जिस पर कोई व्यक्ति या वस्तु चलती है।",
    'लाल बत्ती': "वाहनों के रुकने का संकेत देने वाला ट्रैफिक सिग्नल।",
    'सड़क': "वाहनों, व्यक्तियों और जानवरों के लिए एक विस्तृत मार्ग।",
    'दुर्घटनाएं': "दुर्भाग्यपूर्ण घटनाएँ जो अप्रत्याशित रूप से घटित होती हैं।",
    'नंबर': "एक अंकगणितीय मान, या फोन/आईडी का प्रतिनिधित्व करने वाले अंक।",
    'पता': "उस स्थान का विवरण जहाँ कोई रहता है।",
    'दमकल': "आग बुझाने के लिए सुसज्जित एक बड़ा वाहन।",
    'दूरी': "दो चीज़ों के बीच की जगह।",
    'वेबसाइट': "किसी विषय के बारे में विवरण वाली इंटरनेट पर पेजों का एक समूह।",
    'समीक्षाएं': "किसी चीज़ का औपचारिक मूल्यांकन या समीक्षा।",
    'भुगतान': "पैसा चुकाने की क्रिया या प्रक्रिया।",
    'नौकरी': "नियमित रोजगार का एक सवेतन पद।",
    'कार्य': "किए जाने वाले या पूरे किए जाने वाले काम।",
    'शुल्क': "किसी सेवा या कार्य के लिए दिया जाने वाला भुगतान।",
    'नुकसान': "किसी चीज़ को खोने की क्रिया या प्रक्रिया, जैसे धन।",
    'चेतावनी': "एक सूचना जो किसी खतरे या घटना के बारे में सचेत करती है।",
    'प्रोफ़ाइल': "एक उपयोगकर्ता खाते या विवरण का रेखाचित्र।",
    'प्रमाणीकरण': "पहचान सत्यापित करने की प्रक्रिया।",
    'हैकर': "कंप्यूटर सुरक्षा में अनधिकृत सेंध लगाने वाले व्यक्ति।",
    'शेष राशि': "खाते में बची हुई कुल धनराशि।",
    'नेटवर्क': "आपस में जुड़े कंप्यूटरों या प्रणालियों का समूह।",
    'सुरक्षित': "खतरों या घुसपैठ से सुरक्षित।",
    'लेनदेन': "पैसे या वस्तुओं का आदान-प्रदान करने की क्रिया।",
    'वीडियो कॉल': "लाइव वीडियो के साथ की जाने वाली फोन कॉल।",
    'आवाज़': "बोलते समय गले से निकलने वाली ध्वनि।",
    'डीपफेक': "कृत्रिम बुद्धिमत्ता (AI) द्वारा बनाया गया नकली वीडियो या ऑडियो।",
    'अनुरोध': "विनम्रतापूर्वक की गई कोई प्रार्थना या याचना।",
    'परियोजना': "किसी विशेष लक्ष्य को प्राप्त करने के लिए बनाई गई योजना।",
    'संलग्नक': "ईमेल के साथ भेजी जाने वाली कोई अतिरिक्त फ़ाइल।",
    'हमला': "कंप्यूटर सिस्टम या नेटवर्क को नुकसान पहुंचाने की कार्रवाई।",
    'मालवेयर': "कंप्यूटर को नुकसान पहुंचाने के लिए बनाया गया दुर्भावनापूर्ण सॉफ्टवेयर।",
    'लाभ': "निवेश पर अर्जित किया गया अतिरिक्त वित्तीय रिटर्न।",
    'सिक्के': "धातु के बने गोल टुकड़े जो मुद्रा के रूप में प्रयुक्त होते हैं।",
    'नियमन': "प्राधिकरण द्वारा बनाए गए नियम या नियंत्रण निर्देश।",
    'पंजीकरण': "औपचारिक रूप से रिकॉर्ड में दर्ज करने की क्रिया।",
    'योजना': "एक व्यवस्थित रूपरेखा या सरकारी कार्यक्रम।",
    'रैनसमवेयर': "फाइलों को लॉक करके फिरौती मांगने वाला खतरनाक वायरस।",
    'विंडो': "कंप्यूटर स्क्रीन पर दिखने वाला एक चौकोर बॉक्स।",
    'बैकअप': "डेटा सुरक्षित रखने के लिए बनाई गई अतिरिक्त कॉपी।",
    'ड्राइव': "कंप्यूटर डेटा फ़ाइलों को संग्रहीत करने वाला उपकरण।",
    'दस्तावेज़': "लिखित या मुद्रित कागज जो जानकारी प्रदान करते हैं।",
    'चोरी': "बिना अनुमति किसी दूसरे की संपत्ति हड़पने का अपराध।",
    'श्रेडर': "कागज़ के दस्तावेज़ों को छोटे टुकड़ों में काटने की मशीन।",
    'विवरण': "खाते की गतिविधियों और शेष राशि को दर्शाने वाला विवरण पत्र।",
    'सिग्नल': "रेडियो तरंगें जिनका उपयोग संचार स्थापित करने में होता है।",
    'स्थानांतरण': "किसी चीज़ को एक स्थान से दूसरे स्थान पर ले जाने की क्रिया।",
    'प्रदाता': "कोई कंपनी जो सेवा प्रदान करती है, जैसे दूरसंचार प्रदाता।",
    'दुकान': "वह स्थान जहाँ वस्तुएं या उत्पाद बेचे जाते हैं।",
    'गुड़िया': "बच्चों के खेलने का एक छोटा मानव-रूपी खिलौना।",
    'गेंद': "खेलने के लिए इस्तेमाल की जाने वाली एक गोल वस्तु।",
    'सिक्का': "धातु का बना छोटा गोल टुकड़ा जो मुद्रा के रूप में चलता है।",
    'बादल': "आकाश में तैरते हुए पानी के वाष्प का समूह।",
    'बारिश': "बादलों से गिरने वाली पानी की बूँदें।",
    'छाता': "धूप या बारिश से बचने के लिए तानकर लगाया जाने वाला साधन।",
    'नाव': "पानी पर तैरने वाली छोटी सवारी या नौका।"
  },
  en: {
    'market': "A place where goods, food, and vegetables are bought and sold.",
    'vegetables': "Plants or parts of plants eaten as food.",
    'tomatoes': "A red, round fruit used as a vegetable in cooking.",
    'potatoes': "A round starchy tuber vegetable grown underground.",
    'onions': "A round vegetable with layers that has a strong smell and taste.",
    'vendor': "A person who sells goods, food, or products.",
    'price': "The amount of money expected, required, or given in payment.",
    'discount': "A reduction in the usual price of something.",
    'bus stop': "A designated place where buses stop for passengers.",
    'bus': "A large motor vehicle carrying passengers by road.",
    'pass': "A ticket or permit allowing travel or entry.",
    'conductor': "A person in charge of public transport who collects fares.",
    'window': "An opening in a wall or vehicle to let in light or air.",
    'buildings': "Structures with a roof and walls, such as houses or factories.",
    'school': "An institution for educating children.",
    'kitchen': "A room or area where food is prepared and cooked.",
    'water': "A colorless, transparent, odorless liquid essential for life.",
    'cutting board': "A flat board on which food items are chopped.",
    'salt': "A white crystalline substance used for seasoning food.",
    'spices': "Aromatic substances used to flavor food.",
    'food': "Nutritious substance eaten to maintain life and growth.",
    'clinic': "A place where patients are given medical treatment.",
    'doctor': "A qualified practitioner of medicine.",
    'thermometer': "An instrument for measuring body temperature.",
    'rest': "To stop work or movement in order to relax or recover strength.",
    'medicine': "A drug or substance used for treating illness.",
    'park': "A large green area for public recreation.",
    'trees': "Woody perennial plants having a single trunk.",
    'flowers': "The seed-bearing part of a plant, consisting of petals.",
    'birds': "Feathered warm-blooded egg-laying vertebrates.",
    'bench': "A long seat for several people.",
    'email': "Messages distributed by electronic means from one user to another.",
    'link': "A digital shortcut or address to a webpage.",
    'password': "A secret word or phrase used to log into an account.",
    'spam': "Unwanted or suspicious emails sent to many people.",
    'phone call': "An instance of speaking to someone using a phone.",
    'manager': "A person responsible for controlling or administering an organization.",
    'OTP': "One-Time Password used for secure digital authentication.",
    'police': "The civil force of a state responsible for maintaining public order.",
    'helmet': "A hard protective hat worn by motorcycle riders.",
    'speed': "The rate at which someone or something moves.",
    'red light': "A traffic signal indicating vehicles must stop.",
    'road': "A wide way for vehicles, persons, and animals.",
    'accidents': "Unfortunate incidents that happen unexpectedly.",
    'number': "An arithmetical value, or digits representing phone/ID.",
    'address': "The particulars of the place where someone lives.",
    'fire engine': "A large vehicle equipped for fighting fires.",
    'distance': "An amount of space between two things.",
    'website': "A set of pages on the internet with details about a subject.",
    'reviews': "Formal assessments or critical evaluations of something.",
    'payment': "The action or process of paying money.",
    'job': "A paid position of regular employment.",
    'tasks': "Pieces of work to be done or completed.",
    'fee': "A payment made to a professional body or system.",
    'loss': "The fact or process of losing something, like money.",
    'alert': "A notification that warns of a danger or event.",
    'profile': "An outline of something, especially a user account.",
    'authentication': "The process of verifying identity.",
    'hackers': "People who use computers to gain unauthorized access.",
    'balance': "The amount of money remaining in an account.",
    'network': "A group or system of interconnected things.",
    'secure': "Protected against threats or danger.",
    'transaction': "An instance of buying or selling something.",
    'video call': "A phone call accompanied by live video.",
    'voice': "The sound produced in a person's larynx.",
    'deepfake': "An altered video or image that represents someone else.",
    'request': "An act of asking politely or formally for something.",
    'project': "An enterprise carefully planned to achieve an aim.",
    'attachment': "A file sent with an email message.",
    'attack': "An aggressive and hostile action against a system.",
    'malware': "Software specifically designed to disrupt or damage.",
    'returns': "Profit earned on an investment.",
    'coins': "Flat, round pieces of metal used as money.",
    'regulation': "A rule or directive made by an authority.",
    'registration': "The act of enrolling or recording formally.",
    'scheme': "A large-scale systematic plan or arrangement.",
    'ransomware': "Malicious software locking files for ransom.",
    'window': "A visual framing area on a computer screen.",
    'backup': "A copy of files kept in case the original is lost.",
    'drive': "A device for storing computer data files.",
    'documents': "Written or printed papers providing information.",
    'theft': "The action or crime of stealing something.",
    'shredder': "A machine for cutting paper documents into pieces.",
    'statements': "Documents showing account activities and balances.",
    'signal': "An electrical impulse or radio wave transmitted.",
    'transfer': "An act of moving something from one place to another.",
    'provider': "A company that provides a service, like network.",
    'shop': "A building or room where goods or services are sold.",
    'dolls': "Small toy models of a human, often representing a baby or child.",
    'ball': "A round object used in games and sports.",
    'coin': "A flat, typically round piece of metal used as money.",
    'cloud': "A visible mass of condensed water vapor floating in the atmosphere.",
    'rain': "Water falling in drops from vapor condensed in the atmosphere.",
    'umbrella': "A folding circular canopy of cloth on a metal frame used for protection against rain.",
    'boat': "A small vessel for traveling on water."
  }
};

const StoriesPage = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const getStoriesForLanguage = useCallback((lang) => {
    return STORIES_MAP[lang] || STORIES_MAP['hi'];
  }, []);

  let learningLang = 'hi';
  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    learningLang = storedUser.learning_language || 'hi';
  } catch (e) {}

  const [stories, setStories] = useState(() => getStoriesForLanguage(learningLang));
  const [selected, setSelected] = useState(null);
  
  // UI Customization States
  const [guidedMode, setGuidedMode] = useState(false);
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  
  // Quiz states
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null); // 'correct' | 'incorrect'
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  // Translation Popup
  const [activeWordInfo, setActiveWordInfo] = useState(null);
  
  // Statistics and Filter
  const [filterLevel, setFilterLevel] = useState(() => {
    return searchParams.get('level') || 'All';
  });

  useEffect(() => {
    const lvl = searchParams.get('level');
    if (lvl) {
      setFilterLevel(lvl);
    }
  }, [searchParams]);

  const [completedStories, setCompletedStories] = useState(() => {
    try {
      const saved = localStorage.getItem('bhashasetu_completed_stories');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    let currentLearningLang = 'hi';
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      currentLearningLang = storedUser.learning_language || 'hi';
    } catch (e) {}

    setStories(getStoriesForLanguage(currentLearningLang));
    setSelected(null);
    setCurrentQIndex(0);
    setSelectedOption(null);
    setResult(null);
    setQuizCompleted(false);
    setQuizScore(0);
    setActiveWordInfo(null);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [getStoriesForLanguage, learningLang]);

  // Mark story as completed in local storage
  const markStoryAsCompleted = (storyId) => {
    const updated = { ...completedStories, [storyId]: true };
    setCompletedStories(updated);
    localStorage.setItem('bhashasetu_completed_stories', JSON.stringify(updated));
  };

  // Dynamic Options Generator for Multiple Choice Quiz
  const generatedOptions = useMemo(() => {
    if (!selected) return [];
    
    return selected.questions.map(q => {
      const correct = q.answer;
      // Gather other answers from the current story or general bank
      const otherAnswers = selected.questions
        .map(otherQ => otherQ.answer)
        .filter(ans => ans !== correct);
      
      const wrongAnswersPool = [
        ...otherAnswers,
        'Market', 'Bus Stop', 'Hospital', 'School', 'Home', 'Water', 
        'Vegetables', 'Doctor', 'Rest', 'Accident', 'Police', 'Post Office', 
        'Password', 'Phone Call', 'Red Light', 'Green Park', 'Bench', 'Kitchen'
      ];
      
      // Select 3 random unique incorrect options
      const wrong = wrongAnswersPool
        .filter(ans => ans.toLowerCase() !== correct.toLowerCase())
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      
      // Shuffle combination
      return [correct, ...wrong].sort(() => 0.5 - Math.random());
    });
  }, [selected]);

  // Split story content into sentences dynamically
  const storySentences = useMemo(() => {
    if (!selected) return [];
    // Split on typical Indian & English sentence endpoints
    return selected.content.split(/(?<=[.।?])\s+/).filter(s => s.trim().length > 0);
  }, [selected]);

  // Speak selected text using web speech synthesis
  const speakText = (text) => {
    let learningLang = 'hi';
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      learningLang = storedUser.learning_language || 'hi';
    } catch (e) {}
    ttsSpeak(text, { lang: learningLang, rate: 0.85 });
  };

  // Read whole story sequence
  useEffect(() => {
    if (!isPlayingAll || !selected) return;

    if (currentSentenceIdx >= storySentences.length) {
      setIsPlayingAll(false);
      setCurrentSentenceIdx(0);
      return;
    }

    const currentText = storySentences[currentSentenceIdx];
    speakText(currentText);

    // Wait until speech is complete before moving to the next sentence
    const timer = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(timer);
        setCurrentSentenceIdx(prev => prev + 1);
      }
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, [isPlayingAll, currentSentenceIdx, storySentences, selected]);

  const togglePlayAll = () => {
    if (isPlayingAll) {
      window.speechSynthesis.cancel();
      setIsPlayingAll(false);
    } else {
      setIsPlayingAll(true);
      setCurrentSentenceIdx(0);
    }
  };

  const handleStartStory = (story) => {
    setSelected(story);
    setCurrentQIndex(0);
    setSelectedOption(null);
    setResult(null);
    setQuizCompleted(false);
    setQuizScore(0);
    setGuidedMode(false);
    setCurrentSentenceIdx(0);
    setIsPlayingAll(false);
    setActiveWordInfo(null);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleCheckAnswer = (option) => {
    if (!selected || result !== null) return;
    setSelectedOption(option);
    const currentQ = selected.questions[currentQIndex];
    const isCorrect = option.toLowerCase() === currentQ.answer.toLowerCase();
    
    if (isCorrect) {
      setResult('correct');
      setQuizScore(prev => prev + 1);
    } else {
      setResult('incorrect');
    }
  };

  const handleNextQuestion = () => {
    if (selected && currentQIndex < selected.questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setResult(null);
    } else {
      setQuizCompleted(true);
      markStoryAsCompleted(selected.id);
    }
  };

  // Filtered stories based on difficulty selection
  const filteredStories = useMemo(() => {
    if (filterLevel === 'All') return stories;
    return stories.filter(s => s.level === filterLevel);
  }, [stories, filterLevel]);

  // Statistics calculation
  const totalCompleted = Object.keys(completedStories).length;
  const progressPercent = stories.length > 0 ? Math.round((totalCompleted / stories.length) * 100) : 0;

  // Custom visual styles
  const colors = {
    Beginner: { text: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
    Intermediate: { text: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
    Advanced: { text: '#8b5cf6', bg: '#f5f3ff', border: '#c4b5fd' }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem 1.5rem', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Tooltip Translation Card */}
      {activeWordInfo && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15,23,42,0.3)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '1.8rem', borderRadius: '24px', width: '90%', maxWidth: '380px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', textAlign: 'center', animation: 'scaleUp 0.25s ease' }}>
            <span style={{ fontSize: '2.5rem' }}>🗣️</span>
            <h2 style={{ fontSize: '2.2rem', color: '#1e293b', margin: '0.8rem 0 0.2rem 0', fontWeight: 900 }}>{activeWordInfo.native}</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, margin: '0 0 1rem 0' }}>Translation & Phonics</p>
            
            <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.4rem 0', fontSize: '1.2rem', color: '#2563eb', fontWeight: 800 }}>"{activeWordInfo.english}"</p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 600, lineHeight: 1.4 }}>
                <strong>Meaning:</strong> {(() => {
                  const word = activeWordInfo.native;
                  const eng = activeWordInfo.english;
                  const lang = i18n.language || 'hi';
                  
                  if (WORD_MEANINGS[lang] && WORD_MEANINGS[lang][word]) return WORD_MEANINGS[lang][word];
                  if (WORD_MEANINGS[lang] && WORD_MEANINGS[lang][eng]) return WORD_MEANINGS[lang][eng];
                  
                  // search fallbacks
                  const fallbacks = ['hi', 'en'];
                  for (const f of fallbacks) {
                    if (WORD_MEANINGS[f] && WORD_MEANINGS[f][word]) return WORD_MEANINGS[f][word];
                    if (WORD_MEANINGS[f] && WORD_MEANINGS[f][eng]) return WORD_MEANINGS[f][eng];
                  }
                  return lang === 'hi' ? "कहानी के संदर्भ में उपयोग।" : "Meaning contextually defined in the story.";
                })()}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button 
                onClick={() => speakText(activeWordInfo.native)} 
                style={{ flex: 1, display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', background: '#3b82f6', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                <Volume2 size={16} /> Hear Word
              </button>
              <button 
                onClick={() => setActiveWordInfo(null)} 
                style={{ flex: 1, background: '#e2e8f0', color: '#475569', border: 'none', padding: '0.8rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selected ? (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          {/* Header Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <button 
              onClick={() => { setSelected(null); if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }} 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '12px', cursor: 'pointer', color: '#475569', fontSize: '0.9rem', fontWeight: 700, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
            >
              <ArrowLeft size={18} /> Back to Library
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => { setGuidedMode(!guidedMode); setCurrentSentenceIdx(0); }} 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: guidedMode ? '#3b82f6' : 'white', color: guidedMode ? 'white' : '#475569', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '12px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
              >
                <Compass size={16} /> {guidedMode ? 'Disable Slides' : 'Guided Reading'}
              </button>

              <button 
                onClick={togglePlayAll} 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: isPlayingAll ? '#ef4444' : 'white', color: isPlayingAll ? 'white' : '#475569', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '12px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
              >
                {isPlayingAll ? <Square size={16} /> : <Play size={16} />}
                {isPlayingAll ? 'Stop Player' : 'Auto Read Story'}
              </button>
            </div>
          </div>

          {/* Interactive Story Board */}
          <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <span style={{ color: colors[selected.level]?.text || '#64748b', background: colors[selected.level]?.bg || '#f1f5f9', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', tracking: '0.05em', padding: '0.3rem 0.8rem', borderRadius: '12px' }}>
                {selected.level} Level
              </span>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Tap highlighted words to translate</span>
            </div>

            <h1 style={{ fontSize: '2.2rem', color: '#1e293b', margin: '0 0 1.5rem 0', fontWeight: 900, tracking: '-0.02em' }}>{selected.title}</h1>
            
            {/* Story Reading Layout */}
            {!guidedMode ? (
              <div style={{ lineHeight: '2.2', fontSize: '1.2rem', color: '#334155', fontWeight: 500, textAlign: 'justify' }}>
                {storySentences.map((sentence, sIdx) => {
                  const words = Object.keys(selected.words);
                  let parts = [sentence];
                  words.forEach(word => {
                    parts = parts.flatMap(part =>
                      typeof part === 'string'
                        ? part.split(word).flatMap((seg, i, arr) =>
                            i < arr.length - 1 ? [seg, <span key={word + i} className="highlight-word" style={{ color: '#2563eb', fontWeight: 700, borderBottom: '2px dashed #2563eb', cursor: 'pointer', padding: '0 2px' }} onClick={(e) => setActiveWordInfo({ native: word, english: selected.words[word] })}>{word}</span>] : [seg]
                          )
                        : [part]
                    );
                  });

                  const isCurrent = isPlayingAll && sIdx === currentSentenceIdx;

                  return (
                    <span 
                      key={sIdx} 
                      style={{ 
                        background: isCurrent ? '#fef08a' : 'transparent', 
                        padding: isCurrent ? '0.2rem 0.4rem' : 0, 
                        borderRadius: '6px', 
                        transition: 'background 0.3s ease',
                        marginRight: '8px'
                      }}
                    >
                      {parts}
                    </span>
                  );
                })}
              </div>
            ) : (
              /* Guided Slide Deck Reading Mode */
              <div style={{ background: '#f8fafc', borderRadius: '18px', padding: '2rem', border: '1px solid #e2e8f0', textAlign: 'center', minHeight: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <p style={{ margin: '0 0 1rem 0', fontSize: '1.35rem', lineHeight: '2', color: '#1e293b', fontWeight: 600 }}>
                  {(() => {
                    const sentence = storySentences[currentSentenceIdx] || '';
                    const words = Object.keys(selected.words);
                    let parts = [sentence];
                    words.forEach(word => {
                      parts = parts.flatMap(part =>
                        typeof part === 'string'
                          ? part.split(word).flatMap((seg, i, arr) =>
                              i < arr.length - 1 ? [seg, <span key={word + i} style={{ color: '#2563eb', fontWeight: 700, borderBottom: '2px dashed #2563eb', cursor: 'pointer' }} onClick={() => setActiveWordInfo({ native: word, english: selected.words[word] })}>{word}</span>] : [seg]
                            )
                          : [part]
                      );
                    });
                    return parts;
                  })()}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', marginTop: '1.5rem' }}>
                  <button 
                    disabled={currentSentenceIdx === 0} 
                    onClick={() => setCurrentSentenceIdx(prev => prev - 1)}
                    style={{ background: 'white', border: '1px solid #cbd5e1', padding: '0.4rem 1.2rem', borderRadius: '10px', fontWeight: 700, cursor: currentSentenceIdx === 0 ? 'not-allowed' : 'pointer', opacity: currentSentenceIdx === 0 ? 0.5 : 1 }}
                  >
                    ← Previous
                  </button>
                  <button 
                    onClick={() => speakText(storySentences[currentSentenceIdx])}
                    style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', padding: '0.4rem 1.2rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <Volume2 size={16} /> Listen
                  </button>
                  <button 
                    disabled={currentSentenceIdx === storySentences.length - 1} 
                    onClick={() => {
                      const nextIdx = currentSentenceIdx + 1;
                      setCurrentSentenceIdx(nextIdx);
                      speakText(storySentences[nextIdx]);
                    }}
                    style={{ background: 'white', border: '1px solid #cbd5e1', padding: '0.4rem 1.2rem', borderRadius: '10px', fontWeight: 700, cursor: currentSentenceIdx === storySentences.length - 1 ? 'not-allowed' : 'pointer', opacity: currentSentenceIdx === storySentences.length - 1 ? 0.5 : 1 }}
                  >
                    Next sentence →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Comprehension Quiz Card */}
          <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            
            {!quizCompleted ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <HelpCircle size={18} color="#3b82f6" /> Comprehension Check
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>
                    Question {currentQIndex + 1} of {selected.questions.length}
                  </span>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.4 }}>
                    {selected.questions[currentQIndex].question}
                  </p>
                </div>

                {/* Multiple Choice Options Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem', marginBottom: '1.5rem' }}>
                  {generatedOptions[currentQIndex]?.map((option, idx) => {
                    const isSelected = selectedOption === option;
                    const isCorrectOption = option.toLowerCase() === selected.questions[currentQIndex].answer.toLowerCase();
                    
                    let btnStyle = {
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      color: '#334155'
                    };

                    if (result !== null) {
                      if (isCorrectOption) {
                        btnStyle = { background: '#dcfce7', border: '1px solid #10b981', color: '#14532d' };
                      } else if (isSelected) {
                        btnStyle = { background: '#fee2e2', border: '1px solid #ef4444', color: '#7f1d1d' };
                      }
                    } else if (isSelected) {
                      btnStyle = { background: '#eff6ff', border: '1px solid #3b82f6', color: '#1e3a8a' };
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleCheckAnswer(option)}
                        disabled={result !== null}
                        style={{
                          ...btnStyle,
                          padding: '1rem',
                          borderRadius: '12px',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          cursor: result !== null ? 'default' : 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        {option}
                        {result !== null && isCorrectOption && <CheckCircle2 size={16} color="#10b981" />}
                        {result !== null && isSelected && !isCorrectOption && <XCircle size={16} color="#ef4444" />}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback Indicator */}
                {result && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: result === 'correct' ? '#ecfdf5' : '#fef2f2', border: `1px solid ${result === 'correct' ? '#a7f3d0' : '#fecaca'}`, padding: '1rem', borderRadius: '14px', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>{result === 'correct' ? '🎉' : '💡'}</span>
                      <span style={{ color: result === 'correct' ? '#065f46' : '#991b1b', fontWeight: 700, fontSize: '0.88rem' }}>
                        {result === 'correct' 
                          ? 'Correct answer! Keep it up!' 
                          : `The correct answer was "${selected.questions[currentQIndex].answer}".`}
                      </span>
                    </div>

                    <button
                      onClick={handleNextQuestion}
                      style={{ background: result === 'correct' ? '#10b981' : '#64748b', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      {currentQIndex === selected.questions.length - 1 ? 'Finish Quiz' : 'Next Question →'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Quiz Score Result Page */
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <Trophy size={64} color="#eab308" style={{ marginBottom: '1rem' }} />
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e293b', margin: '0 0 0.5rem 0' }}>Story Completed!</h2>
                <p style={{ color: '#64748b', fontSize: '1rem', margin: '0 0 1.5rem 0' }}>You answered all questions and learned new vocabulary words!</p>
                
                <div style={{ display: 'inline-flex', gap: '2rem', background: '#f8fafc', padding: '1rem 2rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Score</h4>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb' }}>{quizScore} / {selected.questions.length}</span>
                  </div>
                  <div>
                    <h4 style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Accuracy</h4>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>{Math.round((quizScore / selected.questions.length) * 100)}%</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
                  <button 
                    onClick={() => handleStartStory(selected)} 
                    style={{ background: 'white', border: '1px solid #e2e8f0', color: '#475569', padding: '0.8rem 1.8rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <RotateCcw size={16} /> Replay Story
                  </button>
                  <button 
                    onClick={() => setSelected(null)} 
                    style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.8rem 1.8rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Back to Stories List
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Stories Library Dashboard */
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          <button 
            onClick={() => navigate('/activities')} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '12px', cursor: 'pointer', color: '#475569', fontSize: '0.9rem', fontWeight: 700, marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
          >
            <ArrowLeft size={18} /> Back to Activities
          </button>

          {/* User Progress Banner */}
          <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', borderRadius: '24px', padding: '2rem', color: 'white', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', boxShadow: '0 10px 20px rgba(59,130,246,0.15)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Sparkles size={20} color="#fef08a" />
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', tracking: '0.08em', fontWeight: 800, color: '#93c5fd' }}>Reading Milestone</span>
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 0.5rem 0' }}>BhashaSetu Stories</h1>
              <p style={{ margin: 0, color: '#bfdbfe', fontSize: '0.95rem' }}>Master vocabulary and context meanings through custom short stories.</p>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#93c5fd', fontWeight: 700 }}>Completed</span>
                <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.8rem', fontWeight: 900 }}>{totalCompleted} / {stories.length}</h3>
              </div>
              
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem' }}>{progressPercent}%</span>
              </div>
            </div>
          </div>

          {/* Filters Area */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', background: '#e2e8f0', padding: '0.3rem', borderRadius: '12px' }}>
              {['All', 'Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setFilterLevel(lvl)}
                  style={{
                    background: filterLevel === lvl ? 'white' : 'transparent',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    color: filterLevel === lvl ? '#1e293b' : '#64748b',
                    boxShadow: filterLevel === lvl ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
            
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 700 }}>
              Showing {filteredStories.length} stories
            </span>
          </div>

          {/* Stories Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
            {filteredStories.map(story => {
              const isCompleted = completedStories[story.id];
              return (
                <div 
                  key={story.id} 
                  onClick={() => handleStartStory(story)}
                  style={{ 
                    background: 'white', 
                    borderRadius: '20px', 
                    padding: '1.5rem', 
                    cursor: 'pointer', 
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)', 
                    border: '1px solid #e2e8f0', 
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '160px'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.05)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                      <span style={{ color: colors[story.level]?.text || '#64748b', background: colors[story.level]?.bg || '#f1f5f9', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', padding: '0.2rem 0.6rem', borderRadius: '8px' }}>
                        {story.level}
                      </span>
                      
                      {isCompleted && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: '#10b981', fontSize: '0.75rem', fontWeight: 700 }}>
                          <BookOpenCheck size={14} /> Completed
                        </span>
                      )}
                    </div>

                    <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>
                      {story.title}
                    </h3>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', lineHeight: 1.4 }}>
                      {story.preview}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.2rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.8rem' }}>
                    <span style={{ color: '#2563eb', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                      <BookOpen size={14} /> Start Reading
                    </span>
                    <ChevronRight size={16} color="#cbd5e1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoriesPage;
