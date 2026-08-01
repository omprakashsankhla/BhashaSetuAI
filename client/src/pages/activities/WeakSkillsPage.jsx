import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  BrainCircuit, 
  Mic, 
  CheckCircle2, 
  XCircle, 
  Volume2, 
  Trophy, 
  RotateCcw, 
  Check, 
  VolumeX 
} from 'lucide-react';
import { speakText as ttsSpeak } from '../../utils/ttsHelper';

const SANDBOX_DATA = {
  hi: {
    title: "कमज़ोर कौशल वर्कबेंच (Weakness Workbench)",
    desc: "क्विज़ नहीं, बल्कि विशेष इंटरैक्टिव प्रयोगों द्वारा अपने कमज़ोर कौशलों को सुधारें।",
    tabs: {
      speaking: "🗣️ उच्चारण (Speaking)",
      writing: "✍️ व्याकरण बिल्डर (Writing)",
      reading: "🧠 शब्दावली मैच (Vocab Connect)"
    },
    speaking: [
      { id: 1, prompt: "स्तर 1: आसान वाक्य पढ़ें:", sentence: "आसमान का रंग नीला है", breakdown: ["आसमान", "का", "रंग", "नीला", "है"] },
      { id: 2, prompt: "स्तर 2: दैनिक दिनचर्या वाक्य पढ़ें:", sentence: "स्वस्थ रहने के लिए फल खाएं", breakdown: ["स्वस्थ", "रहने", "के", "लिए", "फल", "खाएं"] },
      { id: 3, prompt: "स्तर 3: पर्यावरण जागरूकता:", sentence: "पर्यावरण संरक्षण के लिए पेड़ लगाएं", breakdown: ["पर्यावरण", "संरक्षण", "के", "लिए", "पेड़", "लगाएं"] },
      { id: 4, prompt: "स्तर 4: सामाजिक वाक्य:", sentence: "कल हम सब मिलकर पिकनिक पर जाएंगे", breakdown: ["कल", "हम", "सब", "मिलकर", "पिकनिक", "पर", "जाएंगे"] },
      { id: 5, prompt: "स्तर 5: टंग ट्विस्टर 1 (कठिन):", sentence: "खड़क सिंह के खड़कने से खड़कती हैं खिड़कियां", breakdown: ["खड़क", "सिंह", "के", "खड़कने", "से", "खड़कती", "हैं", "खिड़कियां"] },
      { id: 6, prompt: "स्तर 6: टंग ट्विस्टर 2 (कठिन):", sentence: "चंदू के चाचा ने चंदू की चाची को चटनी चटाई", breakdown: ["चंदू", "के", "चाचा", "ने", "चंदू", "की", "चाची", "को", "चटनी", "चटाई"] },
      { id: 7, prompt: "स्तर 7: तकनीकी वाक्य:", sentence: "कृत्रिम बुद्धिमत्ता आज मानव जीवन का हिस्सा है", breakdown: ["कृत्रिम", "बुद्धिमत्ता", "आज", "मानव", "जीवन", "का", "हिस्सा", "है"] },
      { id: 8, prompt: "स्तर 8: उन्नत वाक्य:", sentence: "पर्यावरण संरक्षण के लिए सामूहिक उत्तरदायित्व अनिवार्य है", breakdown: ["पर्यावरण", "संरक्षण", "के", "लिए", "सामूहिक", "उत्तरदायित्व", "अनिवार्य", "है"] },
      { id: 9, prompt: "स्तर 9: वैज्ञानिक वाक्य:", sentence: "वैज्ञानिकों ने इस नए प्रयोग द्वारा अनेक निष्कर्ष प्राप्त किए", breakdown: ["वैज्ञानिकों", "ने", "इस", "नए", "प्रयोग", "द्वारा", "अनेक", "निष्कर्ष", "प्राप्त", "किए"] },
      { id: 10, prompt: "स्तर 10: संस्कृत सूक्ति उच्चारण (उच्चतम):", sentence: "सत्यमेव जयते नानृतं सत्येन पन्था विततो देवयानः", breakdown: ["सत्यमेव", "जयते", "नानृतं", "सत्येन", "पन्था", "विततो", "देवयानः"] }
    ],
    writing: [
      { id: 1, desc: "स्तर 1: शब्द व्यवस्थित करें:", scramble: ["नीला", "आसमान", "है।", "का", "रंग"], target: "आसमान का रंग नीला है।" },
      { id: 2, desc: "स्तर 2: सरल क्रिया वाक्य:", scramble: ["चाहिए।", "मुझे", "ताजा", "पानी", "पीना"], target: "मुझे ताजा पानी पीना चाहिए।" },
      { id: 3, desc: "स्तर 3: कारक चिह्न वाक्य:", scramble: ["जाती", "लड़कियां", "हैं।", "स्कूल", "रोज"], target: "लड़कियां रोज स्कूल जाती हैं।" },
      { id: 4, desc: "स्तर 4: यद्यपि-तथापि नियम:", scramble: ["तथापि", "यद्यपि", "ईमानदार", "वह", "है।", "निर्धन", "है,", "वह"], target: "यद्यपि वह निर्धन है, तथापि वह ईमानदार है।" },
      { id: 5, desc: "स्तर 5: भूतकाल वाक्य:", scramble: ["पत्र", "लिखा।", "राम", "ने", "कल", "सुंदर"], target: "राम ने कल सुंदर पत्र लिखा।" },
      { id: 6, desc: "स्तर 6: क्रिया विशेषण:", scramble: ["गया", "बाज़ार", "खरीदने", "सब्जियां।", "रवि", "ताज़ी"], target: "रवि ताज़ी सब्जियां खरीदने बाज़ार गया।" },
      { id: 7, desc: "स्तर 7: व्याकरण वाक्य:", scramble: ["नहीं", "परन्तु", "का", "होता,", "यद्यपि", "प्रयोग", "साथ", "तथापि"], target: "यद्यपि के साथ तथापि का प्रयोग होता है परन्तु नहीं।" },
      { id: 8, desc: "स्तर 8: शुद्ध सर्वनाम प्रयोग:", scramble: ["दिल्ली", "जाना", "मुझे", "आज", "है।", "आवश्यक"], target: "मुझे आज दिल्ली जाना आवश्यक है।" },
      { id: 9, desc: "स्तर 9: वैज्ञानिक कर्मवाच्य:", scramble: ["अनेक", "प्राप्त", "किए।", "निष्कर्ष", "वैज्ञानिकों", "ने", "महत्वपूर्ण"], target: "वैज्ञानिकों ने अनेक महत्वपूर्ण निष्कर्ष प्राप्त किए।" },
      { id: 10, desc: "स्तर 10: जटिल दार्शनिक वाक्य:", scramble: ["सत्य", "मार्ग", "का", "होता", "है।", "कठिन", "सदैव", "अत्यंत"], target: "सत्य का मार्ग सदैव अत्यंत कठिन होता है।" }
    ],
    reading: [
      { id: 1, desc: "स्तर 1: बुनियादी बाज़ार शब्द:", pairs: [{ left: "बाज़ार", right: "खरीदने-बेचने का स्थान" }, { left: "सब्जियां", right: "भोजन के रूप में खाने वाले पौधे" }, { left: "कीमत", right: "धनराशि जो चुकानी पड़े" }, { left: "छूट", right: "सामान्य मूल्य में कटौती" }] },
      { id: 2, desc: "स्तर 2: स्वास्थ्य एवं चिकित्सा:", pairs: [{ left: "क्लीनिक", right: "मरीजों का उपचार गृह" }, { left: "डॉक्टर", right: "चिकित्सा का योग्य विशेषज्ञ" }, { left: "थर्मामीटर", right: "तापमान मापने का यंत्र" }, { left: "दवा", right: "बीमारी दूर करने वाली औषधि" }] },
      { id: 3, desc: "स्तर 3: डिजिटल सुरक्षा:", pairs: [{ left: "चेतावनी", right: "खतरे के बारे में सचेत करना" }, { left: "प्रोफ़ाइल", right: "उपयोगकर्ता विवरण की रूपरेखा" }, { left: "प्रमाणीकरण", right: "पहचान सत्यापित करने का काम" }, { left: "हैकर", right: "अनधिकृत डिजिटल घुसपैठिया" }] },
      { id: 4, desc: "स्तर 4: पर्यावरण एवं प्रकृति:", pairs: [{ left: "संरक्षण", right: "बचाव और सुरक्षा" }, { left: "उत्पादकता", right: "काम करने की क्षमता" }, { left: "निष्कर्ष", right: "अंतिम परिणाम" }, { left: "अनिवार्य", right: "जो बहुत आवश्यक हो" }] },
      { id: 5, desc: "स्तर 5: वित्तीय साइबर अपराध:", pairs: [{ left: "लेनदेन", right: "मुद्रा या वस्तु का आदान-प्रदान" }, { left: "स्पैम", right: "अवांछित या अवांछित ईमेल" }, { left: "ओटीपी", right: "एक बार का गुप्त पासवर्ड" }, { left: "शेष राशि", right: "खाते में बची हुई रकम" }] },
      { id: 6, desc: "स्तर 6: परिवहन एवं नियम:", pairs: [{ left: "कंडक्टर", right: "टिकट वसूलने वाला रेल/बस कर्मचारी" }, { left: "दुर्घटनाएं", right: "अचानक होने वाली अप्रिय घटनाएं" }, { left: "नियमन", right: "व्यवस्थित करने के कानून या निर्देश" }, { left: "दमकल", right: "आग बुझाने वाली सरकारी गाड़ी" }] },
      { id: 7, desc: "स्तर 7: तकनीकी एवं एआई:", pairs: [{ left: "कृत्रिम", right: "मानव-निर्मित या अप्राकृतिक" }, { left: "बुद्धिमत्ता", right: "सोचने और समझने की शक्ति" }, { left: "समीक्षाएं", right: "किसी चीज़ का विश्लेषण या मूल्यांकन" }, { left: "डीपफेक", right: "एआई द्वारा निर्मित नकली मीडिया" }] },
      { id: 8, desc: "स्तर 8: उन्नत शब्दावली:", pairs: [{ left: "अलंकार", right: "काव्य की शोभा बढ़ाने वाले तत्व" }, { left: "यमक", right: "भिन्न अर्थ वाले समान शब्दों का मेल" }, { left: "अनुप्रास", right: "समान अक्षरों की आवृत्ति" }, { left: "प्रतिमानों", right: "मानक या उदाहरण स्वरूप ढांचे" }] },
      { id: 9, desc: "स्तर 9: विधिक एवं प्रशासनिक:", pairs: [{ left: "दस्तावेज़", right: "कागज़ात जो सबूत के रूप में हों" }, { left: "श्रेडर", right: "कागज़ के छोटे टुकड़े करने वाली मशीन" }, { left: "विवरण", right: "विस्तृत ब्योरा देने वाला पत्र" }, { left: "प्रदाता", right: "सेवा उपलब्ध कराने वाली संस्था" }] },
      { id: 10, desc: "स्तर 10: दार्शनिक एवं अमूर्त:", pairs: [{ left: "सत्यमेव", right: "सत्य की ही हमेशा" }, { left: "संलग्नक", right: "मुख्य पत्र के साथ जोड़ी गई फाइल" }, { left: "प्रतिमान", right: "मानदंड या मानक रूप" }, { left: "नैतिक", right: "सदाचार या धर्म के अनुसार" }] }
    ]
  },
  en: {
    title: "Weakness Workbench Lab",
    desc: "Say goodbye to standard quizzes! Practice weak skills with high-fidelity, interactive playgrounds.",
    tabs: {
      speaking: "🗣️ Pronunciation Lab",
      writing: "✍️ Grammar Builder",
      reading: "🧠 Semantic Connector"
    },
    speaking: [
      { id: 1, prompt: "Level 1: Simple phonetics check:", sentence: "The blue sky is clear today", breakdown: ["The", "blue", "sky", "is", "clear", "today"] },
      { id: 2, prompt: "Level 2: Common speech vocabulary:", sentence: "Fresh fruits are good for health", breakdown: ["Fresh", "fruits", "are", "good", "for", "health"] },
      { id: 3, prompt: "Level 3: Intermediary cadence:", sentence: "We must protect our environment daily", breakdown: ["We", "must", "protect", "our", "environment", "daily"] },
      { id: 4, prompt: "Level 4: Speed and rhythm check:", sentence: "The quick brown fox jumps over the lazy dog", breakdown: ["The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog"] },
      { id: 5, prompt: "Level 5: Classic tongue twister 1:", sentence: "Peter Piper picked a peck of pickled peppers", breakdown: ["Peter", "Piper", "picked", "a", "peck", "of", "pickled", "peppers"] },
      { id: 6, prompt: "Level 6: Classic tongue twister 2:", sentence: "She sells seashells by the seashore of the ocean", breakdown: ["She", "sells", "seashells", "by", "the", "seashore", "of", "the", "ocean"] },
      { id: 7, prompt: "Level 7: Professional workspace terminology:", sentence: "Meticulous preparation guarantees outstanding professional achievements", breakdown: ["Meticulous", "preparation", "guarantees", "outstanding", "professional", "achievements"] },
      { id: 8, prompt: "Level 8: Multi-syllabic advanced phonemes:", sentence: "Phenomenological sustainability requires comprehensive infrastructure updates", breakdown: ["Phenomenological", "sustainability", "requires", "comprehensive", "infrastructure", "updates"] },
      { id: 9, prompt: "Level 9: Highly fluent technical articulation:", sentence: "The intuitive interface facilitates seamless user interaction and experience", breakdown: ["The", "intuitive", "interface", "facilitates", "seamless", "user", "interaction", "and", "experience"] },
      { id: 10, prompt: "Level 10: Academic philosophical speed (Highest):", sentence: "An analysis of the juxtaposition reveals complex sociocultural paradigms", breakdown: ["An", "analysis", "of", "the", "juxtaposition", "reveals", "complex", "sociocultural", "paradigms"] }
    ],
    writing: [
      { id: 1, desc: "Level 1: Basic word arrangement:", scramble: ["sky", "is", "The", "blue."], target: "The sky is blue." },
      { id: 2, desc: "Level 2: Infinitive verb sequence:", scramble: ["want", "I", "to", "buy", "some", "apples."], target: "I want to buy some apples." },
      { id: 3, desc: "Level 3: Temporal placement:", scramble: ["school", "bus", "arrives", "at", "eight", "o'clock."], target: "The school bus arrives at eight o'clock." },
      { id: 4, desc: "Level 4: Conditional tense coordination:", scramble: ["he", "If", "had", "studied,", "he", "would", "have", "passed."], target: "If he had studied, he would have passed." },
      { id: 5, desc: "Level 5: Contrast concession layout:", scramble: ["Although", "she", "was", "tired,", "she", "completed", "the", "report."], target: "Although she was tired, she completed the report." },
      { id: 6, desc: "Level 6: Direct inversion structure:", scramble: ["No", "sooner", "did", "he", "arrive", "than", "the", "meeting", "started."], target: "No sooner did he arrive than the meeting started." },
      { id: 7, desc: "Level 7: Preposition constraint check:", scramble: ["He", "congratulated", "her", "on", "her", "remarkable", "promotion", "yesterday."], target: "He congratulated her on her remarkable promotion yesterday." },
      { id: 8, desc: "Level 8: Correlative coordination sequence:", scramble: ["Not", "only", "did", "she", "sing,", "but", "she", "also", "played", "guitar."], target: "Not only did she sing, but she also played guitar." },
      { id: 9, desc: "Level 9: Inverted past conditional:", scramble: ["Hardly", "had", "we", "begun", "when", "the", "heavy", "rain", "poured", "down."], target: "Hardly had we begun when the heavy rain poured down." },
      { id: 10, desc: "Level 10: Subjunctive past conditional (Highest):", scramble: ["Had", "I", "known", "the", "truth,", "I", "would", "have", "acted", "differently."], target: "Had I known the truth, I would have acted differently." }
    ],
    reading: [
      { id: 1, desc: "Level 1: Basic market definitions:", pairs: [{ left: "Market", right: "Shopping area to buy/sell" }, { left: "Vendor", right: "Person selling goods" }, { left: "Price", right: "Cost expected for payment" }, { left: "Discount", right: "Reduction in normal price" }] },
      { id: 2, desc: "Level 2: Medical vocabulary:", pairs: [{ left: "Doctor", right: "Medical qualified expert" }, { left: "Clinic", right: "Local health treatment center" }, { left: "Medicine", right: "Substance curing illnesses" }, { left: "Rest", right: "Relaxation to recover strength" }] },
      { id: 3, desc: "Level 3: Intermediary cyber security:", pairs: [{ left: "Network", right: "Interconnected data system" }, { left: "Secure", right: "Protected against threats" }, { left: "Alert", right: "Warning notification signal" }, { left: "Transaction", right: "An instance of buying or selling" }] },
      { id: 4, desc: "Level 4: Advanced verbal roots:", pairs: [{ left: "Meticulous", right: "Very careful and precise" }, { left: "Isolation", right: "State of being alone" }, { left: "Conjunction", right: "Joining word connecting clauses" }, { left: "Mitigate", right: "Make less severe or reduce" }] },
      { id: 5, desc: "Level 5: High-tier descriptive words:", pairs: [{ left: "Cogent", right: "Clear, logical and convincing" }, { left: "Verbose", right: "Using too many words" }, { left: "Equivocal", right: "Ambiguous or open to meanings" }, { left: "Redundant", right: "No longer needed or useful" }] },
      { id: 6, desc: "Level 6: Enterprise digital safety:", pairs: [{ left: "Deepfake", right: "AI altered synthetic media" }, { left: "Phishing", right: "Fraudulent electronic hooks" }, { left: "Malware", right: "Harmful software code payload" }, { left: "Ransomware", right: "Extortion data lock software" }] },
      { id: 7, desc: "Level 7: Sociocultural and philosophy:", pairs: [{ left: "Juxtaposition", right: "Contrast placing side-by-side" }, { left: "Ephemeral", right: "Short-lived or transient nature" }, { left: "Ethos", right: "Guiding spirit of a culture" }, { left: "Paradox", right: "Self-contradictory statement" }] },
      { id: 8, desc: "Level 8: Linguistic parameters:", pairs: [{ left: "Inversion", right: "Reversal of standard order" }, { left: "Mitigation", right: "Action reducing severity" }, { left: "Integrity", right: "Quality of being whole" }, { left: "Inertia", right: "Resistance to change state" }] },
      { id: 9, desc: "Level 9: Grammar clause classifications:", pairs: [{ left: "Subjunctive", right: "Hypothetical verb mood" }, { left: "Concessive", right: "Contrast coordinate clause" }, { left: "Phoneme", right: "Distinct sound unit of speech" }, { left: "Semantics", right: "The science of word meanings" }] },
      { id: 10, desc: "Level 10: Academic science terminology (Highest):", pairs: [{ left: "Corroborate", right: "Confirm with backing evidence" }, { left: "Photosynthetic", right: "Light conversion into energy" }, { left: "Epistemological", right: "Pertaining to theory of knowledge" }, { left: "Reciprocate", right: "Respond in similar manner" }] }
    ]
  },
  ta: {
    title: "பலவீனமான திறன்கள் மேம்பாட்டு கூடம்",
    desc: "சாதாரண வினாடி-வினா அல்லாமல், சோதனை முறையில் பலவீனமான திறன்களை மேம்படுத்தவும்.",
    tabs: {
      speaking: "🗣️ உச்சரிப்பு கூடம் (Speaking)",
      writing: "✍️ இலக்கண ஆக்கம் (Writing)",
      reading: "🧠 சொல் பொருத்தம் (Vocab Connect)"
    },
    speaking: [
      { id: 1, prompt: "நிலை 1: எளிய சொற்றொடர் உச்சரிப்பு:", sentence: "ஆசின் வண்ணம் நீலம்", breakdown: ["ஆசின்", "வண்ணம்", "நீலம்"] },
      { id: 2, prompt: "நிலை 2: அன்றாட சொற்கள்:", sentence: "பழங்களை உண்பது உடல்நலத்திற்கு நல்லது", breakdown: ["பழங்களை", "உண்பது", "உடல்நலத்திற்கு", "நல்லது"] },
      { id: 3, prompt: "நிலை 3: சுற்றுச்சூழல் விழிப்புணர்வு:", sentence: "மரம் நட்டு மழை பெறுவோம்", breakdown: ["மரம்", "நட்டு", "மழை", "பெறுவோம்"] },
      { id: 4, prompt: "நிலை 4: வேக உச்சரிப்பு:", sentence: "துடிப்பான குதிரை வேகமாக ஓடியது", breakdown: ["துடிப்பான", "குதிரை", "வேகமாக", "ஓடியது"] },
      { id: 5, prompt: "நிலை 5: கடின வார்த்தை 1:", sentence: "வாய்ப்புகள் பலமுறை கதவைத் தட்டாது", breakdown: ["வாய்ப்புகள்", "பலமுறை", "கதவைத்", "தட்டாது"] },
      { id: 6, prompt: "நிலை 6: கடின வார்த்தை 2:", sentence: "முயற்சி உடையார் இகழ்ச்சி அடையார்", breakdown: ["முயற்சி", "உடையார்", "இகழ்ச்சி", "அடையார்"] },
      { id: 7, prompt: "நிலை 7: அறிவியல் உச்சரிப்பு:", sentence: "செயற்கை நுண்ணறிவு இன்றைய தேவையாகும்", breakdown: ["செயற்கை", "நுண்ணறிவு", "இன்றைய", "தேவையாகும்"] },
      { id: 8, prompt: "நிலை 8: சுற்றுச்சூழல் வாக்கியம்:", sentence: "சுற்றுச்சூழல் பாதுகாப்பு நம் ஒவ்வொருவரின் கடமையாகும்", breakdown: ["சுற்றுச்சூழல்", "பாதுகாப்பு", "நம்", "ஒவ்வொருவரின்", "கடமையாகும்"] },
      { id: 9, prompt: "நிலை 9: மேம்பட்ட இலக்கியம்:", sentence: "யாதும் ஊரே யாவரும் கேளிர்", breakdown: ["யாதும்", "ஊரே", "யாவரும்", "கேளிர்"] },
      { id: 10, prompt: "நிலை 10: செய்யுள் வரிகள் (உயர்ந்த):", sentence: "வாய்மையே வெல்லும் தீதிலா நன்மைகள் விளையும்", breakdown: ["வாய்மையே", "வெல்லும்", "தீதிலா", "நன்மைகள்", "விளையும்"] }
    ],
    writing: [
      { id: 1, desc: "நிலை 1: எளிய சொற்களை வரிசைப்படுத்துக:", scramble: ["நீலம்.", "வண்ணம்", "வானத்தின்"], target: "வானத்தின் வண்ணம் நீலம்." },
      { id: 2, desc: "நிலை 2: வினைமுற்று வாக்கியம்:", scramble: ["வேண்டும்.", "உண்ண", "பழங்கள்", "நாம்"], target: "நாம் பழங்கள் உண்ண வேண்டும்." },
      { id: 3, desc: "நிலை 3: கால அமைப்பு:", scramble: ["நாளை", "செல்வேன்.", "பள்ளிக்கு", "நான்"], target: "நான் நாளை பள்ளிக்கு செல்வேன்." },
      { id: 4, desc: "நிலை 4: இறந்தகால வினைச்சொல்:", scramble: ["நேற்று", "வந்தான்.", "கண்ணன்", "ஊரிலிருந்து"], target: "கண்ணன் நேற்று ஊரிலிருந்து வந்தான்." },
      { id: 5, desc: "நிலை 5: வேற்றுமை உருபு:", scramble: ["பாடம்", "படித்தான்.", "கண்ணன்", "நேற்று"], target: "கண்ணன் நேற்று பாடம் படித்தான்." },
      { id: 6, desc: "நிலை 6: பன்மை வினைமுற்று:", scramble: ["அவர்கள்", "வந்தார்கள்.", "நேற்று", "மாலை"], target: "அவர்கள் நேற்று மாலை வந்தார்கள்." },
      { id: 7, desc: "நிலை 7: எதிர்மறை வினை:", scramble: ["நான்", "செய்யமாட்டேன்.", "அத்தகைய", "தீய", "காரியங்களை"], target: "நான் அத்தகைய தீய காரியங்களை செய்யமாட்டேன்." },
      { id: 8, desc: "நிலை 8: வினா வாக்கியம்:", scramble: ["நீ", "எப்போது", "வருவாய்?", "வீட்டிற்கு"], target: "நீ எப்போது வீட்டிற்கு வருவாய்?" },
      { id: 9, desc: "நிலை 9: கூட்டு வாக்கியம்:", scramble: ["மழை", "இருப்பினும்", "பெய்தது,", "விளையாடினோம்.", "நாங்கள்"], target: "மழை பெய்தது, இருப்பினும் நாங்கள் விளையாடினோம்." },
      { id: 10, desc: "நிலை 10: இலக்கிய வாக்கியம் (உயர்ந்த):", scramble: ["கேளிர்.", "ஊரே", "யாவரும்", "யாதும்"], target: "யாதும் ஊரே யாவரும் கேளிர்." }
    ],
    reading: [
      { id: 1, desc: "நிலை 1: எளிய பொருட்கள்:", pairs: [{ left: "சந்தை", right: "பொருட்கள் வாங்கும் இடம்" }, { left: "காய்கறிகள்", right: "உணவாக பயன்படும் தாவரங்கள்" }, { left: "விலை", right: "பொருளின் மதிப்புத் தொகை" }, { left: "தள்ளுபடி", right: "விலையில் அளிக்கப்படும் குறைப்பு" }] },
      { id: 2, desc: "நிலை 2: மனித உடலும் சுகமும்:", pairs: [{ left: "மருத்துவர்", right: "சிகிச்சை அளிக்கும் தகுதியானவர்" }, { left: "மருந்து", right: "நோயைக் குணப்படுத்தும் பொருள்" }, { left: "ஓய்வு", right: "உடல் சோர்வை போக்கும் நிலை" }, { left: "பள்ளி", right: "கல்வி கற்கும் நிறுவனம்" }] },
      { id: 3, desc: "நிலை 3: பாதுகாப்பு அமைப்புகள்:", pairs: [{ left: "பாதுகாப்பு", right: "காப்பாற்றுதல் அல்லது காத்தல்" }, { left: "எச்சரிக்கை", right: "அபாயத்தை முன்கூட்டியே அறிவித்தல்" }, { left: "அடையாளம்", right: "சரியான நபரைக் கண்டறிதல்" }, { left: "காவல்துறை", right: "ஒழுங்குமுறையைப் பேணும் அமைப்பு" }] },
      { id: 4, desc: "நிலை 4: உற்பத்தி சொற்கள்:", pairs: [{ left: "உற்பத்தி", right: "ஆக்கம் அல்லது தயாரித்தல்" }, { left: "முயற்சி", right: "பாடுபடுதல் அல்லது உழைத்தல்" }, { left: "உரிமை", right: "சொந்தம் அல்லது தகுதி" }, { left: "இழப்பு", right: "நஷ்டம் அல்லது சேதம்" }] },
      { id: 5, desc: "நிலை 5: இணையவழிச் சொற்கள்:", pairs: [{ left: "வலைப்பின்னல்", right: "இணைக்கப்பட்ட கணினி அமைப்பு" }, { left: "மின்னஞ்சல்", right: "இலத்திரனியல் செய்தி முறை" }, { left: "பரிவர்த்தனை", right: "பணப் பரிமாற்றம் செய்தல்" }, { left: "கடவுச்சொல்", right: "ரகசிய பாதுகாப்புச் சொல்" }] },
      { id: 6, desc: "நிலை 6: அரசு மற்றும் போக்குவரத்து:", pairs: [{ left: "வாகனம்", right: "பயணிக்க உதவும் வண்டி" }, { left: "ஆவணம்", right: "சான்றாகப் பயன்படும் காகிதம்" }, { left: "துண்டாக்கி", right: "தாளை வெட்டும் இயந்திரம்" }, { left: "வழங்குநர்", right: "சேவை அளிக்கும் நிறுவனம்" }] },
      { id: 7, desc: "நிலை 7: நவீன தொழில்நுட்பங்கள்:", pairs: [{ left: "செயற்கை", right: "மனிதனால் உருவாக்கப்பட்டது" }, { left: "நுண்ணறிவு", right: "சிந்திக்கும் ஆற்றல்" }, { left: "மதிப்பாய்வு", right: "விமர்சனம் அல்லது தரம் அறிதல்" }, { left: "தீம்பொருள்", right: "நச்சு மென்பொருள் நிரல்" }] },
      { id: 8, desc: "நிலை 8: தமிழ் இலக்கியச் சொற்கள்:", pairs: [{ left: "வாய்மை", right: "உண்மை பேசுதல்" }, { left: "கேளிர்", right: "உறவினர் அல்லது நண்பர்" }, { left: "யாதும்", right: "எல்லா அல்லது ஏதேனும்" }, { left: "கடமை", right: "செய்ய வேண்டிய பொறுப்பு" }] },
      { id: 9, desc: "நிலை 9: மேம்பட்ட மொழியியல்:", pairs: [{ left: "உச்சரிப்பு", right: "சொற்களைப் ஒலிக்கும் விதம்" }, { left: "இலக்கணம்", right: "மொழியைப் பிழையின்றி எழுதும் விதி" }, { left: "ஒலிப்பு", right: "ஒலி எழுப்பும் நுட்பம்" }, { left: "பொருள்", right: "சொல்லின் கருத்து விளக்கம்" }] },
      { id: 10, desc: "நிலை 10: உயர்ந்த தத்துவங்கள் (உயர்ந்த):", pairs: [{ left: "நெறிமுறை", right: "ஒழுக்கம் சார்ந்த தத்துவம்" }, { left: "முடிவு", right: "இறுதித் தீர்மானம்" }, { left: "நோக்கம்", right: "குறிக்கோள் அல்லது இலக்கு" }, { left: "விளைவு", right: "காரியத்தின் முடிவுப் பயன்" }] }
    ]
  },
  te: {
    title: "నైపుణ్యాల ప్రయోగశాల (Weakness Workbench)",
    desc: "క్విజ్ రూపంలో కాకుండా, ప్రయోగాత్మక పద్ధతులలో మీ బలహీనమైన నైపుణ్యాలను మెరుగుపరచుకోండి.",
    tabs: {
      speaking: "🗣️ ఉచ్ఛారణ ప్రయోగశాల (Speaking)",
      writing: "✍️ వ్యాకరణ నిర్మాణం (Writing)",
      reading: "🧠 పదాల సంధానం (Vocab Connect)"
    },
    speaking: [
      { id: 1, prompt: "స్థాయి 1: సాధారణ వాక్యం పలకండి:", sentence: "ఆకాశం రంగు నీలం", breakdown: ["ఆకాశం", "రంగు", "నీలం"] },
      { id: 2, prompt: "స్థాయి 2: దినచర్య వాక్యం:", sentence: "ఆరోగ్యంగా ఉండటానికి పండ్లు తినండి", breakdown: ["ఆరోగ్యంగా", "ఉండటానికి", "పండ్లు", "తినండి"] },
      { id: 3, prompt: "స్థాయి 3: పర్యావరణ స్పృహ:", sentence: "పర్యావరణాన్ని రక్షించడానికి మొక్కలు నాటండి", breakdown: ["పర్యావరణాన్ని", "రక్షించడానికి", "మొక్కలు", "నాటండి"] },
      { id: 4, prompt: "స్థాయి 4: వేగ ఉచ్ఛారణ:", sentence: "వేగంగా పరిగెత్తే గుర్రం బహుమతి గెలుచుకుంది", breakdown: ["వేగంగా", "పరిగెత్తే", "గుర్రం", "బహుమతి", "గెలుచుకుంది"] },
      { id: 5, prompt: "స్థాయి 5: కఠిన పదం 1:", sentence: "కష్టపడితేనే ఫలితం లభిస్తుంది", breakdown: ["కష్టపడితేనే", "ఫలితం", "లభిస్తుంది"] },
      { id: 6, prompt: "స్థాయి 6: కఠిన పదం 2:", sentence: "నిజాయితీ అనేది అత్యంత విలువైన గుణం", breakdown: ["నిజాయితీ", "అనేది", "అత్యంత", "విలువైన", "గుణం"] },
      { id: 7, prompt: "స్థాయి 7: సాంకేతిక ఉచ్ఛారణ:", sentence: "కృత్రిమ మేధస్సు నేటి అవసరంగా మారింది", breakdown: ["కృత్రిమ", "మేధస్సు", "నేటి", "అవసరంగా", "మారింది"] },
      { id: 8, prompt: "స్థాయి 8: పర్యావరణ పరిరక్షణ:", sentence: "పర్యావరణ పరిరక్షణ మన అందరి బాధ్యత", breakdown: ["పర్యావరణ", "పరిరక్షణ", "మన", "అందరి", "బాధ్యత"] },
      { id: 9, prompt: "స్థాయి 9: తెలుగు సూక్తులు:", sentence: "దేశమును ప్రేమించుమన్నా మంచి పెంచమన్నా", breakdown: ["దేశమును", "ప్రేమించుమన్నా", "మంచి", "పెంచమన్నా"] },
      { id: 10, prompt: "స్థాయి 10: సాహిత్య పద్య పాదం (అత్యున్నత):", sentence: "సత్యమేవ జయతే నిజమే ఎల్లప్పుడూ గెలుస్తుంది", breakdown: ["సత్యమేవ", "జయతే", "నిజమే", "ఎల్లప్పుడూ", "గెలుస్తుంది"] }
    ],
    writing: [
      { id: 1, desc: "స్థాయి 1: పదాలను సరిచేయండి:", scramble: ["నీలం.", "రంగు", "ఆకాశం"], target: "ఆకాశం రంగు నీలం." },
      { id: 2, desc: "స్థాయి 2: క్రియ వాక్య నిర్మాణం:", scramble: ["తినాలి.", "పండ్లు", "రోజు", "మనం"], target: "మనం రోజు పండ్లు తినాలి." },
      { id: 3, desc: "స్థాయి 3: భవిష్యత్ కాలం:", scramble: ["వెళ్తాను.", "రేపు", "నేను", "బడికి"], target: "నేను రేపు బడికి వెళ్తాను." },
      { id: 4, desc: "స్థాయి 4: భూతకాల క్రియ:", scramble: ["వచ్చాడు.", "నిన్న", "ఇంటికి", "రాముడు"], target: "రాముడు నిన్న ఇంటికి వచ్చాడు." },
      { id: 5, desc: "స్థాయి 5: విభక్తి ప్రత్యయాలు:", scramble: ["చదివింది.", "పాఠం", "సీత", "నిన్న"], target: "సీత నిన్న పాఠం చదివింది." },
      { id: 6, desc: "స్థాయి 6: బహువచన కర్త:", scramble: ["వచ్చారు.", "వారు", "నిన్న", "ఇక్కడికి"], target: "వారు నిన్న ఇక్కడికి వచ్చారు." },
      { id: 7, desc: "స్థాయి 7: వ్యతిరేక క్రియ:", scramble: ["చేయను.", "పనులు", "అలాంటి", "నేను", "చెడు"], target: "నేను అలాంటి చెడు పనులు చేయను." },
      { id: 8, desc: "స్థాయి 8: ప్రశ్నార్థక వాక్యం:", scramble: ["ఎప్పుడు", "వెళ్తావు?", "నువ్వు", "ఊరికి"], target: "నువ్వు ఎప్పుడు ఊరికి వెళ్తావు?" },
      { id: 9, desc: "స్థాయి 9: మిశ్రమ వాక్యం:", scramble: ["పడింది,", "వర్షం", "ఆడుకున్నాము.", "మేము", "అయినా"], target: "వర్షం పడింది, అయినా మేము ఆడుకున్నాము." },
      { id: 10, desc: "స్థాయి 10: సాహిత్య వాక్యం (అత్యున్నత):", scramble: ["ప్రేమించుమన్నా.", "దేశమును", "నువ్వు", "ఎల్లప్పుడూ"], target: "దేశమును ప్రేమించుమన్నా నువ్వు ఎల్లప్పుడూ." }
    ],
    reading: [
      { id: 1, desc: "స్థాయి 1: మార్కెట్ పదాలు:", pairs: [{ left: "బజారు", right: "కొనుగోలు అమ్మకాల స్థలం" }, { left: "కూరగాయలు", right: "ఆహారంగా తినే మొక్కల భాగాలు" }, { left: "ధర", right: "వస్తువు యొక్క విలువ" }, { left: "తగ్గింపు", right: "ధరలో ఇచ్చే మినహాయింపు" }] },
      { id: 2, desc: "స్థాయి 2: వైద్య పదాలు:", pairs: [{ left: "వైద్యుడు", right: "చికిత్స చేసే నిపుణుడు" }, { left: "మందు", right: "వ్యాధిని నివారించే ఔషధం" }, { left: "విశ్రాంతి", right: "శరీర అలసటను దూరం చేసే స్థితి" }, { left: "బడి", right: "విద్యను నేర్పించే సంస్థ" }] },
      { id: 3, desc: "స్థాయి 3: రక్షణ వ్యవస్థలు:", pairs: [{ left: "భద్రత", right: "కాపాడటం లేదా రక్షించడం" }, { left: "హెచ్చరిక", right: "ప్రమాదాన్ని ముందే తెలియజేయడం" }, { left: "ధ్రువీకరణ", right: "సరియైన వ్యక్తిని గుర్తించడం" }, { left: "పోలీసు", right: "శాంతిభద్రతలను కాపాడే వ్యవస్థ" }] },
      { id: 4, desc: "స్థాయి 4: ఉత్పాదక పదాలు:", pairs: [{ left: "ఉత్పాదకత", right: "పని చేసే సామర్థ్యం" }, { left: "ప్రయత్నం", right: "కష్టపడటం లేదా శ్రమించడం" }, { left: "హక్కు", right: "అర్హత లేదా సొంతం" }, { left: "నష్టం", right: "క్షీణత లేదా హాని" }] },
      { id: 5, desc: "స్థాయి 5: ఇంటర్నెట్ పదాలు:", pairs: [{ left: "నెట్‌వర్క్", right: "కలిపి ఉంచిన కంప్యూటర్ వ్యవస్థ" }, { left: "ఈమెయిల్", right: "డిజిటల్ సమాచార పద్ధతి" }, { left: "లావాదేవీ", right: "డబ్బును బదిలీ చేయడం" }, { left: "పాస్‌వర్డ్", right: "రహస్య రక్షణ పదం" }] },
      { id: 6, desc: "స్థాయి 6: ప్రభుత్వ సేవలు:", pairs: [{ left: "వాహనం", right: "ప్రయాణానికి సహాయపడే బండి" }, { left: "పత్రం", right: "ఆధారంగా ఉపయోగపడే కాగితం" }, { left: "ష్రెడర్", right: "కాగితాన్ని ముక్కలు చేసే యంత్రం" }, { left: "సేవలు", right: "సహాయం అందించే సంస్థ" }] },
      { id: 7, desc: "స్థాయి 7: ఆధునిక సాంకేతికత:", pairs: [{ left: "కృత్రిమ", right: "మానవుడు సృష్టించింది" }, { left: "మేధస్సు", right: "ఆలోచించే శక్తి" }, { left: "సమీక్ష", right: "గుణదోషాలను విశ్లేషించడం" }, { left: "మాల్‌వేర్", right: "హానికరమైన సాఫ్ట్‌వేర్" }] },
      { id: 8, desc: "స్థాయి 8: తెలుగు సాహిత్య పదాలు:", pairs: [{ left: "సత్యం", right: "నిజం పలకడం" }, { left: "బంధువు", right: "చుట్టం లేదా స్నేహితుడు" }, { left: "దేశము", right: "నివసించే ప్రాంతం" }, { left: "బాధ్యత", right: "నిర్వహించాల్సిన కర్తవ్యం" }] },
      { id: 9, desc: "స్థాయి 9: వ్యాకరణ పదాలు:", pairs: [{ left: "ఉచ్ఛారణ", right: "పదాలను పలికే విధానం" }, { left: "వ్యాకరణం", right: "భాషా నియమ నిబంధనలు" }, { left: "సంధి", right: "పదాలను కలపడం" }, { left: "అర్థం", right: "పదం యొక్క భావం" }] },
      { id: 10, desc: "స్థాయి 10: తాత్విక పదాలు (అత్యున్నత):", pairs: [{ left: "నైతికత", right: "ధర్మబద్ధమైన ప్రవర్తన" }, { left: "ఫలితం", right: "చివరి ముగింపు" }, { left: "లక్ష్యం", right: "చేరాల్సిన గమ్యం" }, { left: "ప్రభావం", right: "పని యొక్క ఫలిత మార్పు" }] }
    ]
  }
};

const fallbacks = ['mwr', 'bn', 'mr', 'ur'];
fallbacks.forEach(lang => {
  SANDBOX_DATA[lang] = SANDBOX_DATA['hi'];
});

const WeakSkillsPage = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  // Interface language for labels and tabs
  const uiLang = i18n.language || 'hi';
  const uiData = SANDBOX_DATA[uiLang] || SANDBOX_DATA['hi'];

  // Learning language for exercise contents and speech tools
  let learningLang = 'hi';
  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    learningLang = storedUser.preferred_language || 'hi';
  } catch (e) {}

  const currentLang = learningLang;
  const contentData = SANDBOX_DATA[learningLang] || SANDBOX_DATA['hi'];

  const data = {
    title: uiData.title,
    desc: uiData.desc,
    tabs: uiData.tabs,
    speaking: contentData.speaking,
    writing: contentData.writing,
    reading: contentData.reading
  };

  const [activeTab, setActiveTab] = useState('speaking');

  // Challenge Indexes for Pagination
  const [speakingIdx, setSpeakingIdx] = useState(0);
  const [writingIdx, setWritingIdx] = useState(0);
  const [readingIdx, setReadingIdx] = useState(0);

  // Active items based on index
  const activeSpeaking = data.speaking[speakingIdx] || data.speaking[0];
  const activeWriting = data.writing[writingIdx] || data.writing[0];
  const activeReading = data.reading[readingIdx] || data.reading[0];

  // Speaking Tab States
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [speakingAccuracy, setSpeakingAccuracy] = useState(0);
  const [speakingFluency, setSpeakingFluency] = useState(0);
  const [wordValidation, setWordValidation] = useState([]);
  const recognitionRef = useRef(null);

  // Writing Tab States
  const [scrambleChips, setScrambleChips] = useState([]);
  const [constructedSentence, setConstructedSentence] = useState([]);
  const [writingChecked, setWritingChecked] = useState(false);
  const [writingCorrect, setWritingCorrect] = useState(false);

  // Reading Tab States
  const [vocabLeftItems, setVocabLeftItems] = useState([]);
  const [vocabRightItems, setVocabRightItems] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [vocabMatches, setVocabMatches] = useState({}); // leftKey -> rightKey
  const [vocabCompleted, setVocabCompleted] = useState(false);

  // Initial load and Reset triggers
  useEffect(() => {
    resetSpeakingState();
  }, [speakingIdx, currentLang]);

  useEffect(() => {
    resetWritingState();
  }, [writingIdx, currentLang]);

  useEffect(() => {
    resetReadingState();
  }, [readingIdx, currentLang]);

  // Overall Reset on Lang Change
  useEffect(() => {
    setSpeakingIdx(0);
    setWritingIdx(0);
    setReadingIdx(0);
  }, [currentLang]);

  const resetSpeakingState = () => {
    setIsRecording(false);
    setHasRecorded(false);
    setSpokenTranscript('');
    setSpeakingAccuracy(0);
    setSpeakingFluency(0);
    setWordValidation([]);
  };

  const resetWritingState = () => {
    const item = data.writing[writingIdx] || data.writing[0];
    setScrambleChips([...item.scramble].sort(() => 0.5 - Math.random()));
    setConstructedSentence([]);
    setWritingChecked(false);
    setWritingCorrect(false);
  };

  const resetReadingState = () => {
    const item = data.reading[readingIdx] || data.reading[0];
    const lefts = item.pairs.map(p => p.left).sort(() => 0.5 - Math.random());
    const rights = item.pairs.map(p => p.right).sort(() => 0.5 - Math.random());
    setVocabLeftItems(lefts);
    setVocabRightItems(rights);
    setSelectedLeft(null);
    setSelectedRight(null);
    setVocabMatches({});
    setVocabCompleted(false);
  };

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      const LANG_REC_MAP = { hi: 'hi-IN', ur: 'ur-PK', mwr: 'hi-IN', ta: 'ta-IN', te: 'te-IN', bn: 'bn-IN', mr: 'mr-IN', en: 'en-US' };
      rec.lang = LANG_REC_MAP[currentLang] || 'en-US';

      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript.trim().toLowerCase();
        setSpokenTranscript(transcript);
        evaluateSpeech(transcript);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, [currentLang, speakingIdx]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setHasRecorded(false);
      setSpokenTranscript('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const evaluateSpeech = (transcript) => {
    const targetWords = activeSpeaking.breakdown;
    const spokenWords = transcript.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()।]/g, "").split(/\s+/);
    
    let matchedCount = 0;
    const validated = targetWords.map(word => {
      const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()।]/g, "").toLowerCase();
      const match = spokenWords.some(sw => sw.includes(cleanWord) || cleanWord.includes(sw));
      if (match) matchedCount++;
      return { word, correct: match };
    });

    const accuracyScore = Math.round((matchedCount / targetWords.length) * 100);
    const fluencyScore = Math.min(100, Math.round(accuracyScore * 0.95 + (Math.random() * 8)));

    setWordValidation(validated);
    setSpeakingAccuracy(accuracyScore);
    setSpeakingFluency(fluencyScore);
    setHasRecorded(true);
  };

  const playWordTTS = (textToSpeak) => {
    ttsSpeak(textToSpeak, { lang: currentLang, rate: 0.8 });
  };

  // Scramble interactions
  const handleChipClick = (chip) => {
    if (writingChecked) return;
    setConstructedSentence(prev => [...prev, chip]);
    setScrambleChips(prev => prev.filter(c => c !== chip));
  };

  const handleRemoveConstructed = (word) => {
    if (writingChecked) return;
    setScrambleChips(prev => [...prev, word]);
    setConstructedSentence(prev => prev.filter(w => w !== word));
  };

  const handleCheckWriting = () => {
    const sentence = constructedSentence.join(' ');
    const isCorrect = sentence.trim().toLowerCase().replace(/[,\s.]/g, '') === activeWriting.target.trim().toLowerCase().replace(/[,\s.]/g, '');
    setWritingCorrect(isCorrect);
    setWritingChecked(true);
  };

  // Vocab Match connections
  const handleVocabClick = (val, side) => {
    if (vocabCompleted) return;

    if (side === 'left') {
      setSelectedLeft(val);
      if (selectedRight) {
        verifyVocabPair(val, selectedRight);
      }
    } else {
      setSelectedRight(val);
      if (selectedLeft) {
        verifyVocabPair(selectedLeft, val);
      }
    }
  };

  const verifyVocabPair = (leftVal, rightVal) => {
    const match = activeReading.pairs.find(p => p.left === leftVal && p.right === rightVal);
    if (match) {
      setVocabMatches(prev => {
        const next = { ...prev, [leftVal]: rightVal };
        if (Object.keys(next).length === activeReading.pairs.length) {
          setVocabCompleted(true);
        }
        return next;
      });
    }
    setSelectedLeft(null);
    setSelectedRight(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Premium Gradient Header */}
      <header style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', padding: '1.8rem 2.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.15)', color: 'white' }}>
        <button 
          onClick={() => navigate('/activities')} 
          style={{ background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', color: 'white', padding: '0.6rem', borderRadius: '50%', transition: 'all 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <BrainCircuit size={24} />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.01em' }}>{data.title}</h1>
            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8, fontWeight: 500 }}>{data.desc}</p>
          </div>
        </div>
      </header>

      {/* Tabs Layout */}
      <div style={{ maxWidth: '960px', margin: '2rem auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: '#e2e8f0', padding: '0.35rem', borderRadius: '16px', marginBottom: '2rem' }}>
          {Object.entries(data.tabs).map(([tabKey, tabTitle]) => {
            const isActive = activeTab === tabKey;
            return (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                style={{
                  flex: 1,
                  padding: '0.9rem',
                  border: 'none',
                  borderRadius: '12px',
                  background: isActive ? 'white' : 'transparent',
                  color: isActive ? '#4f46e5' : '#475569',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isActive ? '0 4px 6px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {tabTitle}
              </button>
            );
          })}
        </div>

        {/* 🗣️ Tab 1: Pronunciation Articulation Lab */}
        {activeTab === 'speaking' && (
          <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b', fontWeight: 800 }}>🗣️ Articulation Analyzer</h3>
              <span style={{ fontSize: '0.9rem', color: '#4f46e5', fontWeight: 800, background: '#e0e7ff', padding: '0.25rem 0.75rem', borderRadius: '10px' }}>
                Difficulty Level: {speakingIdx + 1} / 10
              </span>
            </div>
            
            {/* Pagination Selector */}
            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {[...Array(10)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSpeakingIdx(i)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: 'none',
                    background: speakingIdx === i ? '#4f46e5' : '#f1f5f9',
                    color: speakingIdx === i ? 'white' : '#475569',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    boxShadow: speakingIdx === i ? '0 4px 10px rgba(79, 70, 229, 0.25)' : 'none'
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>{activeSpeaking.prompt}</p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                <button 
                  onClick={() => playWordTTS(activeSpeaking.sentence)}
                  style={{ background: '#e0e7ff', border: 'none', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4f46e5' }}
                >
                  <Volume2 size={20} />
                </button>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>
                  "{activeSpeaking.sentence}"
                </span>
              </div>

              {isRecording && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', margin: '1.5rem 0', height: '30px', alignItems: 'center' }}>
                  {[...Array(6)].map((_, i) => (
                    <div 
                      key={i} 
                      style={{ 
                        width: '4px', 
                        height: '100%', 
                        background: '#ef4444', 
                        borderRadius: '2px', 
                        animation: 'bounceWave 0.6s infinite alternate', 
                        animationDelay: `${i * 0.1}s` 
                      }} 
                    />
                  ))}
                </div>
              )}

              <button
                onClick={toggleRecording}
                style={{
                  background: isRecording ? '#fee2e2' : '#4f46e5',
                  color: isRecording ? '#ef4444' : 'white',
                  border: 'none',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: '0 10px 15px rgba(79, 70, 229, 0.25)',
                  margin: '0 auto',
                  transition: 'all 0.2s'
                }}
              >
                {isRecording ? <VolumeX size={24} /> : <Mic size={24} />}
              </button>
            </div>

            {hasRecorded && (
              <div style={{ animation: 'slideUp 0.3s ease' }}>
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ flex: 1, background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '20px', padding: '1.2rem', textAlign: 'center' }}>
                    <h5 style={{ margin: '0 0 0.5rem 0', color: '#065f46', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>🎯 Accuracy</h5>
                    <p style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: '#047857' }}>{speakingAccuracy}%</p>
                  </div>
                  <div style={{ flex: 1, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '20px', padding: '1.2rem', textAlign: 'center' }}>
                    <h5 style={{ margin: '0 0 0.5rem 0', color: '#1e40af', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>🔊 Fluency</h5>
                    <p style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: '#1d4ed8' }}>{speakingFluency}%</p>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#475569', fontSize: '0.9rem', fontWeight: 700 }}>Phoneme Word Map Analysis:</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                    {wordValidation.map((w, idx) => (
                      <span 
                        key={idx} 
                        onClick={() => !w.correct && playWordTTS(w.word)}
                        style={{ 
                          padding: '0.4rem 0.8rem', 
                          borderRadius: '10px', 
                          fontWeight: 700, 
                          fontSize: '1rem',
                          background: w.correct ? '#d1fae5' : '#fee2e2',
                          color: w.correct ? '#065f46' : '#b91c1c',
                          border: `1px solid ${w.correct ? '#a7f3d0' : '#fecaca'}`,
                          cursor: w.correct ? 'default' : 'pointer'
                        }}
                        title={w.correct ? "Pronounced Correctly" : "Click to hear correct pronunciation"}
                      >
                        {w.word} {!w.correct && "🔊"}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                      {speakingAccuracy >= 80 ? data.speaking[speakingIdx].success : data.speaking[speakingIdx].fail}
                    </p>
                    {speakingAccuracy >= 80 && speakingIdx < 9 && (
                      <button 
                        onClick={() => setSpeakingIdx(prev => prev + 1)}
                        style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Next Level →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ✍️ Tab 2: Grammar Builder Scramble Workbench */}
        {activeTab === 'writing' && (
          <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b', fontWeight: 800 }}>✍️ Restructuring Workbench</h3>
              <span style={{ fontSize: '0.9rem', color: '#4f46e5', fontWeight: 800, background: '#e0e7ff', padding: '0.25rem 0.75rem', borderRadius: '10px' }}>
                Difficulty Level: {writingIdx + 1} / 10
              </span>
            </div>

            {/* Pagination Selector */}
            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {[...Array(10)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setWritingIdx(i)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: 'none',
                    background: writingIdx === i ? '#4f46e5' : '#f1f5f9',
                    color: writingIdx === i ? 'white' : '#475569',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    boxShadow: writingIdx === i ? '0 4px 10px rgba(79, 70, 229, 0.25)' : 'none'
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, margin: '0 0 2rem 0' }}>{activeWriting.desc}</p>

            {/* Sentence Editor Panel */}
            <div style={{ background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '20px', padding: '2rem', minHeight: '100px', display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center', marginBottom: '2rem' }}>
              {constructedSentence.length === 0 ? (
                <span style={{ color: '#94a3b8', fontSize: '1.1rem', fontWeight: 600 }}>Click word chips below to start repairing the sentence structure...</span>
              ) : (
                constructedSentence.map((word, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRemoveConstructed(word)}
                    disabled={writingChecked}
                    style={{
                      background: '#4f46e5',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: 700,
                      boxShadow: '0 2px 4px rgba(79, 70, 229, 0.15)',
                      animation: 'scaleUp 0.15s ease'
                    }}
                  >
                    {word} ✕
                  </button>
                ))
              )}
            </div>

            {/* Scramble Word Pool */}
            {!writingChecked && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '2.5rem', justifyContent: 'center' }}>
                {scrambleChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChipClick(chip)}
                    style={{
                      background: 'white',
                      border: '1px solid #cbd5e1',
                      padding: '0.5rem 1rem',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#475569',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#475569'; }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Submissions Action */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              {!writingChecked ? (
                <button 
                  onClick={handleCheckWriting}
                  disabled={constructedSentence.length === 0}
                  style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '0.8rem 2.5rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '1rem', transition: 'all 0.2s' }}
                >
                  Submit Repair
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={resetWritingState}
                    style={{ background: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1', padding: '0.8rem 2rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '1rem' }}
                  >
                    Reset Challenge
                  </button>
                  {writingCorrect && writingIdx < 9 && (
                    <button 
                      onClick={() => setWritingIdx(prev => prev + 1)}
                      style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '1rem' }}
                    >
                      Next Level →
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Feedback Panel */}
            {writingChecked && (
              <div style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '20px', background: writingCorrect ? '#ecfdf5' : '#fff5f5', border: `1px solid ${writingCorrect ? '#a7f3d0' : '#fecaca'}`, animation: 'slideUp 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                  {writingCorrect ? <CheckCircle2 color="#047857" size={24} /> : <XCircle color="#ef4444" size={24} />}
                  <h4 style={{ margin: 0, color: writingCorrect ? '#065f46' : '#b91c1c', fontSize: '1.1rem', fontWeight: 850 }}>
                    {writingCorrect ? "Correct Structure!" : "Incorrect Structure"}
                  </h4>
                </div>
                <p style={{ margin: '0 0 1rem 0', color: writingCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem', fontWeight: 500 }}>
                  {writingCorrect ? data.writing[writingIdx].success : data.writing[writingIdx].fail}
                </p>
                <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, display: 'block', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Expected Target:</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>{activeWriting.target}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 🧠 Tab 3: Semantic Connector Vocab Connect */}
        {activeTab === 'reading' && (
          <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b', fontWeight: 800 }}>🧠 Semantic Vocab Connector</h3>
              <span style={{ fontSize: '0.9rem', color: '#4f46e5', fontWeight: 800, background: '#e0e7ff', padding: '0.25rem 0.75rem', borderRadius: '10px' }}>
                Difficulty Level: {readingIdx + 1} / 10
              </span>
            </div>

            {/* Pagination Selector */}
            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {[...Array(10)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setReadingIdx(i)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: 'none',
                    background: readingIdx === i ? '#4f46e5' : '#f1f5f9',
                    color: readingIdx === i ? 'white' : '#475569',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    boxShadow: readingIdx === i ? '0 4px 10px rgba(79, 70, 229, 0.25)' : 'none'
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, margin: '0 0 2rem 0' }}>{activeReading.desc}</p>

            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem' }}>
              {/* Left Column (Vocabulary Words) */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>Word</h4>
                {vocabLeftItems.map(word => {
                  const isMatched = !!vocabMatches[word];
                  const isSelected = selectedLeft === word;
                  return (
                    <button
                      key={word}
                      onClick={() => handleVocabClick(word, 'left')}
                      disabled={isMatched}
                      style={{
                        padding: '1rem',
                        borderRadius: '14px',
                        border: isMatched ? '1px solid #d1fae5' : `2px solid ${isSelected ? '#4f46e5' : '#e2e8f0'}`,
                        background: isMatched ? '#ecfdf5' : isSelected ? '#e0e7ff' : 'white',
                        color: isMatched ? '#10b981' : isSelected ? '#4f46e5' : '#475569',
                        fontWeight: isSelected || isMatched ? 800 : 600,
                        fontSize: '1rem',
                        textAlign: 'left',
                        cursor: isMatched ? 'default' : 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span>{word}</span>
                      {isMatched && <Check size={16} />}
                    </button>
                  );
                })}
              </div>

              {/* Right Column (Synonyms / Meanings) */}
              <div style={{ flex: 1.3, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>Meaning / Synonym</h4>
                {vocabRightItems.map(meaning => {
                  const isMatched = Object.values(vocabMatches).includes(meaning);
                  const isSelected = selectedRight === meaning;
                  return (
                    <button
                      key={meaning}
                      onClick={() => handleVocabClick(meaning, 'right')}
                      disabled={isMatched}
                      style={{
                        padding: '1rem',
                        borderRadius: '14px',
                        border: isMatched ? '1px solid #d1fae5' : `2px solid ${isSelected ? '#4f46e5' : '#e2e8f0'}`,
                        background: isMatched ? '#ecfdf5' : isSelected ? '#e0e7ff' : 'white',
                        color: isMatched ? '#10b981' : isSelected ? '#4f46e5' : '#475569',
                        fontWeight: isSelected || isMatched ? 800 : 600,
                        fontSize: '0.95rem',
                        textAlign: 'left',
                        cursor: isMatched ? 'default' : 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span>{meaning}</span>
                      {isMatched && <Check size={16} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Winning celebration box */}
            {vocabCompleted && (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1.5rem', borderRadius: '20px', textAlign: 'center', animation: 'scaleUp 0.3s ease' }}>
                <Trophy size={48} color="#10b981" style={{ margin: '0 auto 0.8rem auto' }} />
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#065f46', fontSize: '1.2rem', fontWeight: 800 }}>
                  {data.reading[readingIdx].success}
                </h4>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                  <button 
                    onClick={resetReadingState}
                    style={{ background: '#cbd5e1', color: '#1e293b', border: 'none', padding: '0.6rem 1.8rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Match Again
                  </button>
                  {readingIdx < 9 && (
                    <button 
                      onClick={() => setReadingIdx(prev => prev + 1)}
                      style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.6rem 1.8rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Next Level →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounceWave {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1.2); }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(15px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}} />
    </div>
  );
};

export default WeakSkillsPage;
