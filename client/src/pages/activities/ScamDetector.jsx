import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Star, Trophy, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, RotateCcw, Volume2 } from 'lucide-react';
import { speakText as ttsSpeak } from '../../utils/ttsHelper';

const MESSAGES_DATA = {
  hi: {
    title: "Scam Alert Officer (सुरक्षा अधिकारी)",
    desc: "संदेशों की जांच करें और बताएं कि वे सुरक्षित हैं या ऑनलाइन घोटाला (Scam)।",
    scamBtn: "घोटाला (Scam) 🚨",
    safeBtn: "सुरक्षित (Safe) 🟢",
    senderLabel: "प्रेषक:",
    winMsg: "अद्भुत! आपने सभी सुरक्षित और धोखाधड़ी वाले संदेशों को सही ढंग से पहचाना।",
    playAudio: "संदेश सुनें",
    actionPlanLabel: "🚨 सुरक्षा सलाह (Action Plan):",
    items: [
      { id: 1, sender: "KBC-WINNER", text: "प्रिय ग्राहक, बधाई हो! आपने केबीसी लकी ड्रा में 25,000,000 रुपये जीते हैं। अपना कैश पुरस्कार प्राप्त करने के लिए तुरंत यहाँ क्लिक करें: http://fake-kbc-rewards.com", isScam: true, tip: "केबीसी कभी भी लिंक या मैसेज के जरिए नकद पुरस्कार नहीं देता। यह एक धोखाधड़ी वाला लिंक (Phishing Link) है.", action: "लिंक पर क्लिक न करें। नंबर ब्लॉक करें और साइबर हेल्पलाइन नंबर 1930 पर रिपोर्ट करें।" },
      { id: 2, sender: "AD-SBI_BANK", text: "प्रिय ग्राहक, आपका एसबीआई डेबिट कार्ड ब्लॉक हो गया है। इसे तुरंत अनब्लॉक करने के लिए 1 मिनट में अपना ओटीपी यहां अपडेट करें: http://sbi-unblock-portal.net", isScam: true, tip: "बैंक कभी भी कार्ड अनब्लॉक करने के लिए ओटीपी या बाहरी वेबसाइट लिंक नहीं मांगते।", action: "ओटीपी किसी के साथ साझा न करें। तुरंत अपने बैंक के आधिकारिक टोल-फ्री नंबर पर कॉल करें।" },
      { id: 3, sender: "VM-INFO", text: "आपका पैकेज कल सुबह 10 बजे आपके पते पर पहुंचा दिया जाएगा। डिलीवरी अपडेट देखने के लिए अपने आधिकारिक पोस्टल ऐप पर जाएं। धन्यवाद।", isScam: false, tip: "यह एक सामान्य डिलीवरी सूचना है और इसमें किसी व्यक्तिगत क्रेडेंशियल या संदिग्ध लिंक की मांग नहीं की गई है।", action: "यह संदेश सुरक्षित है। आप आधिकारिक ट्रैकिंग नंबर के माध्यम से पार्सल ट्रैक कर सकते हैं।" },
      { id: 4, sender: "AD-ELECTRIC", text: "महत्वपूर्ण सूचना: आपके बिजली का बिल बकाया है। आज रात 9:30 बजे बिजली काट दी जाएगी। तुरंत भुगतान करने के लिए इस नंबर पर संपर्क करें: 88921-XXXXX", isScam: true, tip: "बिजली विभाग व्यक्तिगत मोबाइल नंबरों से इस तरह की धमकी भरे संदेश नहीं भेजता।", action: "इस नंबर पर कॉल न करें। बिजली कटौती की पुष्टि के लिए आधिकारिक बिजली वितरण केंद्र या उप-स्टेशन से संपर्क करें।" },
      { id: 5, sender: "AD-ALERT", text: "प्रिय उपयोगकर्ता, आपके खाते में ₹1200 का गैस सब्सिडी रिफंड ट्रांसफर कर दिया गया है। अपने बैंक लेनदेन विवरण की जांच करें। सुरक्षित रहें।", isScam: false, tip: "यह एक सरकारी ट्रांजैक्शन की साधारण सूचना है और इसमें कोई व्यक्तिगत जानकारी या पासवर्ड नहीं मांगा गया है।", action: "यह संदेश सुरक्षित है। पुष्टि के लिए अपना बैंक स्टेटमेंट देख सकते हैं।" },
      { id: 6, sender: "WORK-AMAZON", text: "अमेज़ॅन वर्क-फ़ॉर्म-होम जॉब ऑफर! सिर्फ 2 घंटे काम करें और रोज़ ₹50,000 कमाएं। सीट बुक करने के लिए ₹500 रजिस्ट्रेशन फीस अभी भरें: http://fake-job-pay.in", isScam: true, tip: "कोई भी असली कंपनी नौकरी देने के लिए कभी भी अग्रिम शुल्क या सुरक्षा राशि नहीं मांगती।", action: "पंजीकरण राशि का भुगतान न करें। यह नौकरी के नाम पर धोखाधड़ी है।" },
      { id: 7, sender: "GAS-KYC", text: "प्रिय ग्राहक, आपके गैस कनेक्शन का केवाईसी (KYC) अधूरा है। 24 घंटे में कनेक्शन बंद हो जाएगा। केवाईसी अपडेट करने के लिए तुरंत यहाँ आधार कार्ड अपलोड करें: http://fake-gas-kyc.org", isScam: true, tip: "गैस एजेंसियां कभी भी एसएमएस लिंक के जरिए केवाईसी करने को नहीं कहती हैं।", action: "लिंक पर दस्तावेज़ अपलोड न करें। अपने स्थानीय गैस वितरक (Agency) से मिलकर ही केवाईसी कराएं।" },
      { id: 8, sender: "AD-PAYTM", text: "भुगतान सफल! आपने किराने की दुकान पर ₹350 का भुगतान किया है। पेटीएम वॉलेट ट्रांजैक्शन आईडी: 44021285.", isScam: false, tip: "यह आपके द्वारा किए गए भुगतान की पुष्टि का एक साधारण संदेश है।", action: "यह सुरक्षित है। भविष्य के रिकॉर्ड के लिए इस ट्रांजैक्शन आईडी को रख लें।" }
    ]
  },
  ur: {
    title: "سیکیورٹی گارڈ (اسکیم الرٹ)",
    desc: "فون پیغامات کی جانچ کریں اور پہچانیں کہ وہ محفوظ ہیں یا آن لائن دھوکہ (Scam)۔",
    scamBtn: "دھوکہ (Scam) 🚨",
    safeBtn: "محفوظ (Safe) 🟢",
    senderLabel: "بھیجنے والا:",
    winMsg: "شاندار! آپ نے تمام پیغامات کی صحیح شناخت کی۔",
    playAudio: "پیغام سنیں",
    actionPlanLabel: "🚨 حفاظتی مشورہ (Action Plan):",
    items: [
      { id: 1, sender: "KBC-WINNER", text: "محترم کسٹمر، مبارک ہو! آپ نے کے بی سی لکی ڈرا میں 25,000,000 روپے جیتے ہیں۔ اپنا انعام وصول کرنے کے لیے فوری طور پر یہاں کلک کریں: http://fake-kbc-rewards.com", isScam: true, tip: "کے بی سی کبھی بھی پیغامات کے ذریعے نقد انعامات نہیں دیتا۔ یہ ایک جعلی لنک ہے۔", action: "لنک پر کلک نہ کریں۔ نمبر بلاک کریں اور سائبر ہیلپ لائن 1930 پر رپورٹ کریں۔" },
      { id: 2, sender: "AD-SBI_BANK", text: "محترم کسٹمر، آپ کا ایس بی آئی ڈیبٹ کارڈ بلاک کر دیا گیا ہے۔ اسے فوری طور پر کھولنے کے لیے اپنا او ٹی پی یہاں درج کریں: http://sbi-unblock-portal.net", isScam: true, tip: "بینک کبھی بھی کارڈ کھولنے کے لیے او ٹی پی یا ویب سائٹ کا لنک نہیں مانگتے۔", action: "او ٹی پی کسی کے ساتھ شیئر نہ کریں۔ فوری طور پر اپنے بینک کے آفیشل ٹول فری نمبر پر کال کریں۔" },
      { id: 3, sender: "VM-INFO", text: "آپ کا پارسل کل صبح 10 بجے آپ کے پتے پر پہنچا دیا جائے گا۔ تفصیلات کے لیے اپنے آفیشل پوسٹل ایپ پر لاگ ان کریں۔ شکریہ۔", isScam: false, tip: "یہ ایک عام ڈلیوری پیغام ہے جس میں کوئی مشکوک لنک یا ذاتی معلومات نہیں مانگی گئی ہیں۔", action: "یہ پیغام محفوظ ہے۔ آپ آفیشل ایپ پر جا کر ٹریک کر سکتے ہیں۔" },
      { id: 4, sender: "AD-ELECTRIC", text: "ضروری اطلاع: آپ کا بجلی کا بل ادا نہیں ہوا ہے۔ آج رات بجلی کاٹ دی جائے گی۔ بل ادا کرنے کے لیے فوری طور پر اس نمبر پر رابطہ کریں: 88921-XXXXX", isScam: true, tip: "محکمہ بجلی کبھی بھی موبائل نمبروں سے ایسے دھمکی آمیز پیغامات نہیں بھیجتا۔", action: "اس نمبر پر کال نہ کریں۔ قریبی بجلی گھر سے رابطہ کریں۔" },
      { id: 5, sender: "AD-ALERT", text: "محترم صارف، آپ کے اکاؤنٹ میں گیس سبسڈی کے ₹1200 منتقل کر دیے گئے ہیں۔ اپنے بینک بیلنس کی جانچ کریں۔ شکریہ۔", isScam: false, tip: "یہ حکومت کی طرف سے رقم منتقلی کی سادہ اطلاع ہے جس میں کوئی پاس ورڈ نہیں مانگا گیا ہے۔", action: "یہ محفوظ ہے۔ اپنے بینک اسٹیٹمنٹ میں تصدیق کریں۔" },
      { id: 6, sender: "WORK-AMAZON", text: "گھر بیٹھے ملازمت کا سنہری موقع! روزانہ ₹50,000 کمائیں۔ رجسٹریشن فیس ₹500 ابھی جمع کرائیں: http://fake-job-pay.in", isScam: true, tip: "کوئی بھی اصلی کمپنی نوکری دینے کے لیے پیسے نہیں مانگتی۔", action: "پیسے جمع نہ کرائیں، یہ نوکری کا جھانسا دے کر لوٹنے کا طریقہ ہے۔" },
      { id: 7, sender: "GAS-KYC", text: "محترم کسٹمر، گیس کنکشن بلاک ہونے والا ہے۔ فوری طور پر کے وائی سی اپڈیٹ کرنے کے لیے یہاں آدھار کارڈ اپ لوڈ کریں: http://fake-gas-kyc.org", isScam: true, tip: "گیس ایجنسیاں کبھی بھی ایس ایم ایس کے ذریعے آدھار کارڈ نہیں مانگتیں۔", action: "لنک پر آدھار اپ لوڈ نہ کریں۔ اپنی گیس ایجنسی سے رابطہ کریں۔" },
      { id: 8, sender: "AD-PAYTM", text: "ادائیگی کامیاب! آپ نے دکان پر ₹350 ادا کیے ہیں۔ ٹرانزیکشن آئی ڈی: 44021285.", isScam: false, tip: "یہ ایک ادائیگی کا تصدیقی پیغام ہے۔", action: "یہ پیغام محفوظ ہے۔ رسید اپنے پاس رکھیں۔" }
    ]
  },
  ta: {
    title: "பாதுகாப்பு அதிகாரி (Scam Detector)",
    desc: "தொலைபேசி செய்திகளை ஆய்வு செய்து, அவை பாதுகாப்பானதா அல்லது ஆன்லைன் மோசடியா (Scam) என கண்டறியவும்.",
    scamBtn: "மோசடி (Scam) 🚨",
    safeBtn: "பாதுகாப்பானது (Safe) 🟢",
    senderLabel: "அனுப்பியவர்:",
    winMsg: "அருமை! நீங்கள் அனைத்து செய்திகளையும் சரியாக வகைப்படுத்தினீர்கள்.",
    playAudio: "செய்தியைக் கேளுங்கள்",
    actionPlanLabel: "🚨 பாதுகாப்பு அறிவுரை (Action Plan):",
    items: [
      { id: 1, sender: "KBC-WINNER", text: "வாழ்த்துகள்! நீங்கள் கேபிசி லக்கி டிராவில் ₹2.5 கோடியை வென்றுள்ளீர்கள். உங்கள் பரிசை உடனடியாகப் பெற இங்கே கிளிக் செய்யவும்: http://fake-kbc-rewards.com", isScam: true, tip: "அரசு அல்லது நிறுவனங்கள் ஒருபோதும் செய்திகள் மூலம் பரிசுகளை அறிவிப்பதில்லை. இது ஒரு போலி இணையதளம்.", action: "இணைப்பை கிளிக் செய்ய வேண்டாம். எண்ணை முடக்கி, சைபர் உதவி எண் 1930 இல் புகார் செய்யுங்கள்." },
      { id: 2, sender: "AD-SBI_BANK", text: "வாடிக்கையாளரே, உங்கள் எஸ்பிஐ கார்டு முடக்கப்பட்டுள்ளது. உடனடியாக சரிசெய்ய 1 நிமிடத்திற்குள் உங்கள் மொபைலுக்கு வந்த ஓடிபியை (OTP) இங்கே பதிவு செய்யவும்: http://sbi-unblock-portal.net", isScam: true, tip: "வங்கி அதிகாரிகள் ஒருபோதும் ஓடிபி எண்களை தொலைபேசி மூலமாகவோ அல்லது போலி இணைப்புகள் மூலமாகவோ கேட்க மாட்டார்கள்.", action: "ஒருபோதும் ஓடிபி எண்ணைப் பகிர வேண்டாம். வங்கியின் அதிகாரப்பூர்வ வாடிக்கையாளர் சேவை மையத்தை அழைக்கவும்." },
      { id: 3, sender: "VM-INFO", text: "உங்கள் பார்சல் நாளை காலை 10 மணிக்கு விநியோகிக்கப்படும். கூடுதல் விவரங்களுக்கு அதிகாரப்பூர்வ போஸ்டல் செயலியை பார்க்கவும். நன்றி.", isScam: false, tip: "இது சாதாரண பார்சல் விநியோக செய்தி. இதில் எந்த ஒரு கடவுச்சொல்லோ அல்லது சந்தேகத்திற்குரிய இணைப்போ கேட்கப்படவில்லை.", action: "இது பாதுகாப்பானது. அதிகாரப்பூர்வ தளத்தில் பார்சலை கண்காணிக்கலாம்." },
      { id: 4, sender: "AD-ELECTRIC", text: "முக்கிய அறிவிப்பு: உங்கள் மின்சார கட்டணம் செலுத்தப்படவில்லை. இன்று இரவு 9:30 மணிக்கு மின் இணைப்பு துண்டிக்கப்படும். உடனே கட்டணம் செலுத்த இந்த எண்ணை தொடர்பு கொள்ளவும்: 88921-XXXXX", isScam: true, tip: "மின்சார வாரியம் ஒருபோதும் மொபைல் எண்கள் வழியாக மின் இணைப்பை துண்டிப்பதாக மிரட்டல் செய்திகளை அனுப்பாது.", action: "இந்த எண்ணுக்கு அழைக்க வேண்டாம். உங்கள் பகுதி மின்சார அலுவலகத்தை தொடர்பு கொள்ளவும்." },
      { id: 5, sender: "AD-ALERT", text: "அன்பான வாடிக்கையாளரே, எரிவாயு மானியம் ₹1200 உங்கள் கணக்கில் வரவு வைக்கப்பட்டுள்ளது. உங்கள் வங்கி கணக்கை சரிபார்க்கவும்.", isScam: false, tip: "இது அரசாங்க மானியம் கணக்கில் சேர்ந்ததற்கான சாதாரண அறிவிப்பு செய்தி.", action: "இது பாதுகாப்பான செய்தி. உங்கள் கணக்கு அறிக்கையை சரிபார்க்கவும்." },
      { id: 6, sender: "WORK-AMAZON", text: "அமேசான் வீட்டில் இருந்தே வேலை! தினமும் ₹50,000 சம்பாதிக்கலாம். பதிவு செய்ய ₹500 மட்டும் செலுத்துங்கள்: http://fake-job-pay.in", isScam: true, tip: "எந்த ஒரு புகழ்பெற்ற நிறுவனமும் வேலை தருவதற்கு முன்பணம் கேட்பதில்லை.", action: "பணம் செலுத்த வேண்டாம். இது ஒரு மோசடி வேலை அறிவிப்பு." },
      { id: 7, sender: "GAS-KYC", text: "வாடிக்கையாளரே, உங்கள் எரிவாயு இணைப்பு கேஒய்சி அப்டேட் செய்யவில்லை எனில் 24 மணிநேரத்தில் முடக்கப்படும். உடனே ஆதார் பதிவேற்றவும்: http://fake-gas-kyc.org", isScam: true, tip: "எரிவாயு நிறுவனங்கள் ஒருபோதும் எஸ்எம்எஸ் இணைப்புகள் மூலம் ஆதார் எண்களைக் கேட்பதில்லை.", action: "ஆதார் கார்டை பதிவேற்ற வேண்டாம். உங்கள் எரிவாயு முகவரை அணுகவும்." },
      { id: 8, sender: "AD-PAYTM", text: "பணம் செலுத்தியது வெற்றி! நீங்கள் கடைக்கு ₹350 செலுத்தியுள்ளீர்கள். பரிவர்த்தனை எண்: 44021285.", isScam: false, tip: "இது நீங்கள் செய்த பணப் பரிவர்த்தனையின் சாதாரண உறுதிப்படுத்தல் செய்தி.", action: "இது பாதுகாப்பானது. குறிப்புக்காக பரிவர்த்தனை எண்ணை வைத்துக் கொள்ளவும்." }
    ]
  },
  te: {
    title: "భద్రతా అధికారి (Scam Detector)",
    desc: "ఫోన్ సందేశాలను పరిశీలించి, అవి సురక్షితమైనవా లేదా ఆన్‌లైన్ మోసాలా (Scam) అని గుర్తించండి.",
    scamBtn: "మోసం (Scam) 🚨",
    safeBtn: "సురక్షితం (Safe) 🟢",
    senderLabel: "పంపినవారు:",
    winMsg: "అద్భుతం! మీరు అన్ని సందేశాలను విజయవంతంగా సురక్షిత మరియు మోసపూరితమైనవిగా గుర్తించారు.",
    playAudio: "సందేశం విను",
    actionPlanLabel: "🚨 భద్రతా సలహా (Action Plan):",
    items: [
      { id: 1, sender: "KBC-WINNER", text: "అభినందనలు! మీరు కేబీసీ లక్కీ డ్రాలో రూ. 2.5 కోట్లు గెలుచుకున్నారు. మీ నగదు బహుమతి పొందడానికి వెంటనే ఇక్కడ క్లిక్ చేయండి: http://fake-kbc-rewards.com", isScam: true, tip: "కేబీసీ లేదా ఏ సంస్థ కూడా ఎప్పుడూ లింక్‌ల ద్వారా నగదు బహుమతులు ఇవ్వదు. ఇది ఒక మోసపూరిత లింక్.", action: "లింక్ పై క్లిక్ చేయవద్దు. నెంబర్ బ్లాక్ చేసి, సైబర్ హెల్ప్ లైన్ 1930 లో ఫిర్యాదు చేయండి." },
      { id: 2, sender: "AD-SBI_BANK", text: "ప్రియమైన కస్టమర్, మీ ఎస్బీఐ డెబిట్ కార్డ్ బ్లాక్ చేయబడింది. వెంటనే అన్‌బ్లాక్ చేయడానికి 1 నిమిషంలో మీ ఓటీపీని ఇక్కడ అప్‌డేట్ చేయండి: http://sbi-unblock-portal.net", isScam: true, tip: "బ్యాంకులు ఎప్పుడూ కార్డ్ అన్‌బ్లాక్ చేయడానికి ఓటీపీలు లేదా తెలియని వెబ్‌సైట్ లింక్‌లను అడగవు.", action: "ఓటీపీ ఎవరితోనూ పంచుకోకండి. మీ బ్యాంక్ అధికారిక టోల్ ఫ్రీ నెంబర్ ను సంప్రదించండి." },
      { id: 3, sender: "VM-INFO", text: "మీ పార్సెల్ రేపు ఉదయం 10 గంటలకు మీ చిరునామాకు డెలివరీ చేయబడుతుంది. మరిన్ని వివరాల కోసం అధికారిక పోస్టల్ యాప్‌ను సందర్శించండి. ధన్యవాదాలు.", isScam: false, tip: "ఇది సాధారణ పార్సెల్ డెలివరీ సమాచారం. ఇందులో ఎలాంటి రహస్య సమాచారాన్ని అడగలేదు.", action: "ఇది సురక్షితమైనది. అధికారిక సైట్ లో ట్రాక్ చేసుకోండి." },
      { id: 4, sender: "AD-ELECTRIC", text: "ముఖ్య గమనిక: మీ విద్యుత్ బిల్లు బకాయి ఉంది. ఈ రోజు రాత్రి 9:30 గంటలకు విద్యుత్ కనెక్షన్ కట్ చేయబడుతుంది. వెంటనే ఈ నెంబర్‌ను సంప్రదించండి: 88921-XXXXX", isScam: true, tip: "విద్యుత్ శాఖ ఎప్పుడూ ఇలాంటి వ్యక్తిగత నెంబర్ల నుండి బెదిరింపు సందేశాలను పంపదు.", action: "ఈ నెంబర్ కు ఫోన్ చేయవద్దు. మీ సమీప విద్యుత్ కార్యాలయాన్ని సంప్రదించండి." },
      { id: 5, sender: "AD-ALERT", text: "ప్రియమైన కస్టమర్, మీ గ్యాస్ సబ్సిడీ రీఫండ్ ₹1200 మీ ఖాతాకు బదిలీ చేయబడింది. మీ ఖాతా వివరాలను తనిఖీ చేసుకోండి.", isScam: false, tip: "ఇది ప్రభుత్వ సబ్సిడీ బదిలీ సమాచారం. ఇందులో ఎటువంటి వ్యక్తిగత సమాచారం అడగలేదు.", action: "ఇది సురక్షితమైనది. నిర్ధారణ కోసం బ్యాంక్ స్టేట్మెంట్ చెక్ చేసుకోండి." },
      { id: 6, sender: "WORK-AMAZON", text: "అమెజాన్ వర్క్ ఫ్రమ్ హోమ్ ఉద్యోగం! రోజుకు ₹50,000 సంపాదించండి. రిజిస్ట్రేషన్ ఫీజు ₹500 చెల్లించండి: http://fake-job-pay.in", isScam: true, tip: "ఏ ప్రముఖ సంస్థ కూడా ఉద్యోగం ఇవ్వడానికి ముందుగా డబ్బులు అడగదు.", action: "డబ్బులు చెల్లించవద్దు. ఇది ఉద్యోగాల పేరుతో జరుగుతున్న మోసం." },
      { id: 7, sender: "GAS-KYC", text: "కస్టమర్ గారూ, మీ గ్యాస్ కనెక్షన్ కేవైసీ 24 గంటల్లో అప్‌డేట్ కాకపోతే కనెక్షన్ కట్ అవుతుంది. ఆధార్ అప్‌లోడ్ చేయండి: http://fake-gas-kyc.org", isScam: true, tip: "గ్యాస్ ఏజెన్సీలు ఎప్పుడూ ఎస్ఎంఎస్ లింకుల ద్వారా ఆధార్ కార్డులను అడగవు.", action: "ఆధార్ కార్డు అప్‌లోడ్ చేయవద్దు. మీ గ్యాస్ ఏజెన్సీ డీలర్ ని సంప్రదించండి." },
      { id: 8, sender: "AD-PAYTM", text: "చెల్లింపు విజయవంతమైంది! మీరు దుకాణంలో ₹350 చెల్లించారు. లావాదేవీ సంఖ్య: 44021285.", isScam: false, tip: "ఇది మీరు చేసిన చెల్లింపు నిర్ధారణ సందేశం.", action: "ఇది సురક્ષితమైనది. భవిష్యత్ అవసరాల కోసం రికార్డు ఉంచుకోండి." }
    ]
  },
  en: {
    title: "Scam Alert Officer",
    desc: "Inspect the mobile messages and identify if they are safe or online scams.",
    scamBtn: "Scam 🚨",
    safeBtn: "Safe 🟢",
    senderLabel: "Sender:",
    winMsg: "Outstanding! You identified all messages and completed your safety training.",
    playAudio: "Listen Message",
    actionPlanLabel: "🚨 Safety Advisory (Action Plan):",
    items: [
      { id: 1, sender: "KBC-WINNER", text: "Dear Customer, Congratulations! You won ₹25,000,000 in our lucky draw. Click here to claim your cash reward immediately: http://fake-kbc-rewards.com", isScam: true, tip: "Legitimate organizations never award money through unverified SMS links. This is a phishing site.", action: "Do not click the link. Block the sender and report immediately to Cyber Crime Helpline 1930." },
      { id: 2, sender: "AD-SBI_BANK", text: "Dear User, your bank account is suspended due to verification failure. Re-activate in 1 min by submitting your OTP code here: http://sbi-unblock-portal.net", isScam: true, tip: "Banks never ask you to submit your OTP over text messages or external links.", action: "Do not share OTP. Immediately call the official customer care number of your bank to verify." },
      { id: 3, sender: "VM-INFO", text: "Your package delivery is scheduled for tomorrow at 10:00 AM. Access your official postal app dashboard to track updates. Thank you.", isScam: false, tip: "This is a basic informational delivery alert without any requests for sensitive credentials or suspicious link formats.", action: "This message is safe. Use the official app or tracking number to monitor your package." },
      { id: 4, sender: "AD-ELECTRIC", text: "Urgent Notice: Your electricity bill is past due. Power will be disconnected tonight at 9:30 PM. Call our support desk now: 88921-XXXXX", isScam: true, tip: "Electricity utility boards do not issue immediate shutoff warnings via personal mobile phone numbers.", action: "Do not call the number. Contact the official electricity distribution helpline or sub-station to confirm." },
      { id: 5, sender: "AD-ALERT", text: "Dear Customer, Gas Subsidy refund of ₹1200 has been credited to your bank account. Check your transaction statement.", isScam: false, tip: "This is a simple credit confirmation text with no request for personal credentials or links.", action: "This is a safe transactional alert. Keep it for your accounting records." },
      { id: 6, sender: "WORK-AMAZON", text: "Amazon Work-from-Home opportunity! Earn up to ₹50,000 daily. Pay ₹500 registration fee now to lock your seat: http://fake-job-pay.in", isScam: true, tip: "No reputable company asks for advance registration or security deposits to hire employees.", action: "Do not pay any amount. Report this recruitment scam on the Cyber Crime portal." },
      { id: 7, sender: "GAS-KYC", text: "Dear Customer, your gas connection will be suspended in 24 hours due to incomplete KYC. Upload your Aadhaar Card immediately to verify: http://fake-gas-kyc.org", isScam: true, tip: "Gas agencies never request KYC verification via links or third-party web forms.", action: "Do not upload documents. Visit your authorized gas dealer to update details." },
      { id: 8, sender: "AD-PAYTM", text: "Payment successful! You paid ₹350 at the grocery store. Paytm wallet transaction ID: 44021285.", isScam: false, tip: "This is a standard payment credit confirmation text.", action: "This is safe. Retain the transaction ID for future records." }
    ]
  }
};

const fallbacksScam = ['mwr', 'bn', 'mr'];
fallbacksScam.forEach(lang => {
  MESSAGES_DATA[lang] = MESSAGES_DATA['hi'];
});

const ScamDetector = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

    let currentLang = 'hi';
  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    currentLang = storedUser.preferred_language || 'hi';
  } catch (e) {}
  const data = MESSAGES_DATA[currentLang] || MESSAGES_DATA['hi'];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null); // { correct: boolean, text: string, action: string }
  const [gameComplete, setGameComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentItem = data.items[currentIndex];

  const speakText = () => {
    if (currentItem) {
      ttsSpeak(currentItem.text, {
        lang: currentLang,
        rate: 0.85,
        onStart: () => setIsPlaying(true),
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false)
      });
    }
  };

  const handleDecision = (decision) => {
    if (feedback) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }

    const isScam = decision === 'scam';
    const isCorrect = currentItem.isScam === isScam;

    if (isCorrect) {
      setScore(prev => prev + 20);
      setFeedback({
        correct: true,
        text: `✓ Safe Choice! ${currentItem.tip}`,
        action: currentItem.action
      });
    } else {
      setFeedback({
        correct: false,
        text: `✗ Warning! ${currentItem.tip}`,
        action: currentItem.action
      });
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentIndex < data.items.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setGameComplete(true);
      }
    }, 4500);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setScore(0);
    setFeedback(null);
    setGameComplete(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem' }}>
      <button 
        onClick={() => navigate('/activities')} 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '12px', cursor: 'pointer', color: '#475569', fontSize: '0.9rem', fontWeight: 700, marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
      >
        <ArrowLeft size={18} /> Back to Activities
      </button>

      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        
        {/* Banner */}
        <div style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderRadius: '24px', padding: '1.8rem', color: 'white', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 0.4rem 0' }}>🚨 {data.title}</h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.85rem' }}>{data.desc}</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.6rem 1.2rem', borderRadius: '20px', fontWeight: 800 }}>
            Score: {score}
          </div>
        </div>

        {gameComplete ? (
          <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
            <Trophy size={64} color="#eab308" style={{ marginBottom: '1.2rem', marginInline: 'auto' }} />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e293b', margin: '0 0 0.5rem 0' }}>Training Complete!</h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '2rem' }}>{data.winMsg}</p>
            <button 
              onClick={handleReset}
              style={{ background: '#dc2626', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RotateCcw size={18} /> Re-inspect
            </button>
          </div>
        ) : (
          <div>
            
            {/* Phone Screen Mockup */}
            <div style={{ background: '#000000', borderRadius: '40px', padding: '1.2rem 1.2rem 2.5rem 1.2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '4px solid #334155', marginBottom: '2rem' }}>
              
              {/* Speaker notch */}
              <div style={{ width: '100px', height: '18px', background: '#334155', borderRadius: '0 0 10px 10px', marginInline: 'auto', marginBottom: '1rem' }} />

              {/* Chat Viewport */}
              <div style={{ background: '#f1f5f9', borderRadius: '24px', padding: '1.5rem 1rem', minHeight: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                
                {/* Sender Title */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.5rem' }}>
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>
                      {data.senderLabel}
                    </span>
                    <p style={{ margin: '0.1rem 0 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#334155' }}>
                      {currentItem.sender}
                    </p>
                  </div>
                  
                  {/* TTS Button */}
                  <button
                    onClick={speakText}
                    style={{
                      background: isPlaying ? '#fee2e2' : '#ffffff',
                      border: '1px solid #cbd5e1',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    <Volume2 size={16} color={isPlaying ? '#ef4444' : '#64748b'} />
                  </button>
                </div>

                {/* Message Bubble */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px 20px 20px 4px', padding: '1.2rem', color: '#1e293b', fontSize: '1rem', lineHeight: 1.5, position: 'relative', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', fontWeight: 600 }}>
                  {currentItem.text}
                </div>

              </div>
            </div>

            {/* Decision Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <button
                onClick={() => handleDecision('safe')}
                disabled={feedback !== null}
                style={{
                  background: 'white',
                  border: '2px solid #10b981',
                  color: '#065f46',
                  padding: '1.2rem',
                  borderRadius: '16px',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  cursor: feedback !== null ? 'default' : 'pointer',
                  textAlign: 'center',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                }}
              >
                {data.safeBtn}
              </button>

              <button
                onClick={() => handleDecision('scam')}
                disabled={feedback !== null}
                style={{
                  background: 'white',
                  border: '2px solid #ef4444',
                  color: '#991b1b',
                  padding: '1.2rem',
                  borderRadius: '16px',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  cursor: feedback !== null ? 'default' : 'pointer',
                  textAlign: 'center',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                }}
              >
                {data.scamBtn}
              </button>
            </div>

            {/* Feedback box */}
            {feedback && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                
                {/* Explanation text */}
                <div 
                  style={{
                    padding: '1.2rem',
                    borderRadius: '16px',
                    background: feedback.correct ? '#ecfdf5' : '#fff5f5',
                    border: `1px solid ${feedback.correct ? '#a7f3d0' : '#feb2b2'}`,
                    color: feedback.correct ? '#065f46' : '#9b2c2c',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    textAlign: 'center',
                    lineHeight: 1.4
                  }}
                >
                  {feedback.text}
                </div>

                {/* Safety Action advisory block */}
                <div 
                  style={{
                    padding: '1.2rem',
                    borderRadius: '16px',
                    background: '#fffbeb',
                    border: '1px solid #fef3c7',
                    color: '#92400e',
                    fontSize: '0.88rem',
                    lineHeight: 1.5
                  }}
                >
                  <p style={{ margin: '0 0 0.3rem 0', fontWeight: 900, fontSize: '0.92rem' }}>
                    {data.actionPlanLabel}
                  </p>
                  <span style={{ fontWeight: 700 }}>
                    {feedback.action}
                  </span>
                </div>

              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default ScamDetector;
