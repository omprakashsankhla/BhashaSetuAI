import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ChevronRight, Trophy, RefreshCw } from 'lucide-react';

const SCENARIOS_LANG_DATA = {
  hi: {
    title: "वास्तविक जीवन परिदृश्य",
    desc: "रोजमर्रा के दस्तावेजों जैसे बस साइन, बैंक पर्ची और बिजली बिल को पढ़ने का अभ्यास करें।",
    win: "अद्भुत! आपने सभी परिदृश्यों को हल कर लिया है।",
    backBtn: "पीछे जाएं",
    readDesc: "नीचे दी गई जानकारी को ध्यान से पढ़ें और प्रश्न का उत्तर दें।",
    submitBtn: "उत्तर सबमिट करें",
    correctAlert: "✅ सही जवाब! आपने दस्तावेज़ को सही ढंग से समझा।",
    wrongAlert: "❌ गलत जवाब। फिर से कोशिश करें!",
    items: [
      { id: 1, title: 'बस मार्ग सूचना', icon: '🚌', color: '#f59e0b', content: "📋 बस रूट संख्या 42:\nरेलवे स्टेशन → सिटी बैंक → मुख्य बाज़ार → अस्पताल\n\nअगली बस: 10 मिनट में", question: 'यदि आपको अस्पताल जाना है, तो आप कौन सी बस लेंगे?', options: ['बस 12', 'बस 42', 'बस 7', 'बस 99'], answer: 'बस 42' },
      { id: 2, title: 'बैंक जमा पर्ची', icon: '🏦', color: '#3b82f6', content: "🏦 स्टेट बैंक ऑफ इंडिया\nखाता संख्या: ****1234\nलेनदेन: जमा (Deposit)\nराशि: ₹5,000\nशेष राशि: ₹25,000", question: 'पर्ची के अनुसार कितनी राशि जमा की गई है?', options: ['₹25,000', '₹10,000', '₹5,000', '₹1,234'], answer: '₹5,000' },
      { id: 3, title: 'दवा की शीशी का लेबल', icon: '💊', color: '#10b981', content: "💊 पैरासिटामोल 500mg\nखुराक: 1 गोली\nकब लें: भोजन के बाद\nआवृत्ति: दिन में 3 बार\nसावधानी: बच्चों से दूर रखें", question: 'आपको दिन में कितनी बार दवा लेनी चाहिए?', options: ['1 बार', '2 बार', '3 बार', '4 बार'], answer: '3 बार' },
      { id: 4, title: 'बिजली बिल सूचना', icon: '⚡', color: '#ef4444', content: "⚡ राज्य विद्युत बोर्ड\nबिल महीना: जुलाई 2026\nकुल देय राशि: ₹1,850\nअंतिम तिथि: 10 अगस्त 2026", question: 'बिजली बिल के भुगतान की अंतिम तिथि क्या है?', options: ['1 अगस्त', '10 अगस्त', '15 अगस्त', '31 जुलाई'], answer: '10 अगस्त' },
      { id: 5, title: 'राशन कार्ड पर्ची', icon: '🌾', color: '#8b5cf6', content: "🌾 खाद्य विभाग राशन पर्ची\nचावल: 10 किलोग्राम\nगेहूँ: 15 किलोग्राम\nचीनी: 2 किलोग्राम\nकुल मूल्य: ₹150", question: 'राशन पर्ची में गेहूँ की मात्रा कितनी है?', options: ['10 किलोग्राम', '15 किलोग्राम', '2 किलोग्राम', '5 किलोग्राम'], answer: '15 किलोग्राम' },
      { id: 6, title: 'किराना रसीद', icon: '🛒', color: '#ec4899', content: "🛒 सुपरमार्ट किराना बिल\nतेल: ₹200\nनमक: ₹25\nदाल: ₹120\nकुल योग: ₹345", question: 'दाल का मूल्य कितना है?', options: ['₹200', '₹25', '₹120', '₹345'], answer: '₹120' },
      { id: 7, title: 'रेलवे टिकट विवरण', icon: '🚆', color: '#06b6d4', content: "🚆 भारतीय रेलवे\nगाड़ी संख्या: 12952 (राजधानी)\nश्रेणी: तृतीय वातानुकूलित (3AC)\nसीट संख्या: 42 (लोअर)", question: 'टिकट के अनुसार यात्री की सीट संख्या क्या है?', options: ['12', '42', '3', '52'], answer: '42' },
      { id: 8, title: 'एटीएम निकासी रसीद', icon: '🏧', color: '#10b981', content: "🏧 एटीएम लेनदेन रसीद\nनिकासी राशि: ₹2,000\nबचा हुआ बैलेंस: ₹12,500\nस्थिति: सफल", question: 'एटीएम से कितनी राशि निकाली गई?', options: ['₹12,500', '₹2,000', '₹10,000', '₹5,000'], answer: '₹2,000' },
      { id: 9, title: 'जल आपूर्ति बिल', icon: '💧', color: '#3b82f6', content: "💧 जल बोर्ड बिल\nउपयोग: 15,000 लीटर\nबिल राशि: ₹350\nअंतिम तिथि: 25 अगस्त", question: 'इस महीने का जल बिल कितना है?', options: ['₹350', '₹15,000', '₹25', '₹150'], answer: '₹350' },
      { id: 10, title: 'डॉक्टर का पर्चा', icon: '📋', color: '#f59e0b', content: "📋 संजीवनी क्लीनिक\nमरीज का नाम: अमित कुमार\nसलाह: बेड रेस्ट (3 दिन)\nअगली मुलाक़ात: सोमवार", question: 'डॉक्टर ने कितने दिनों के बेड रेस्ट की सलाह दी है?', options: ['1 दिन', '2 दिन', '3 दिन', '5 दिन'], answer: '3 दिन' }
    ]
  },
  ur: {
    title: "حقیقی زندگی کے منظر نامے",
    desc: "روزمرہ کی دستاویزات جیسے بس سائن، بینک سلپ اور بجلی کا بل پڑھنے کی مشق کریں۔",
    win: "شاندار! آپ نے تمام منظرنامے حل کر لیے۔",
    backBtn: "پیچھے جائیں",
    readDesc: "نیچے دی گئی معلومات کو غور سے پڑھیں اور سوال کا جواب دیں۔",
    submitBtn: "جواب جمع کریں",
    correctAlert: "✅ درست جواب! آپ نے دستاویز کو صحیح سمجھا۔",
    wrongAlert: "❌ غلط جواب۔ دوبارہ کوشش کریں!",
    items: [
      { id: 1, title: 'بس روٹ کی معلومات', icon: '🚌', color: '#f59e0b', content: "📋 بس روٹ نمبر 42:\nریلوے اسٹیشن ← سٹی بینک ← مین بازار ← ہسپتال\n\nاگلی بس: 10 منٹ میں", question: 'اگر آپ کو ہسپتال جانا ہے تو آپ کون سی بس لیں گے؟', options: ['بس 12', 'بس 42', 'بس 7', 'بس 99'], answer: 'بس 42' },
      { id: 2, title: 'بینک ڈیپازٹ سلپ', icon: '🏦', color: '#3b82f6', content: "🏦 اسٹیٹ بینک آف انڈیا\nاکاؤنٹ نمبر: ****1234\nلین دین: جمع (Deposit)\nرقم: ₹5,000\nباقی رقم: ₹25,000", question: 'سلپ کے مطابق کتنی رقم جمع کی گئی ہے؟', options: ['₹25,000', '₹10,000', '₹5,000', '₹1,234'], answer: '₹5,000' },
      { id: 3, title: 'دوا کا لیبل', icon: '💊', color: '#10b981', content: "💊 پیراسیٹامول 500mg\nخوراک: 1 گولی\nکب لیں: کھانے کے بعد\nتعداد: دن میں 3 بار\nاحتیاط: بچوں سے دور رکھیں", question: 'آپ کو دن میں کتنی بار دوا لینی چاہئے؟', options: ['1 بار', '2 بار', '3 بار', '4 بار'], answer: '3-بار' },
      { id: 4, title: 'بجلی کا بل', icon: '⚡', color: '#ef4444', content: "⚡ اسٹیٹ الیکٹرسٹی بورڈ\nبل کا مہینہ: جولائی 2026\nکل واجب الادا رقم: ₹1,850\nآخری تاریخ: 10 اگست 2026", question: 'بجلی کا بل جمع کرانے کی آخری تاریخ کیا ہے؟', options: ['1 اگست', '10 اگست', '15 اگست', '31 جولائی'], answer: '10-اگست' },
      { id: 5, title: 'راشن کارڈ سلپ', icon: '🌾', color: '#8b5cf6', content: "🌾 محکمہ خوراک راشن سلپ\nچاول: 10 کلوگرام\nگیہوں: 15 کلوگرام\nچینی: 2 کلوگرام\nکل قیمت: ₹150", question: 'راشن سلپ میں گیہوں کی مقدار کتنی ہے؟', options: ['10 کلوگرام', '15 کلوگرام', '2 کلوگرام', '5 کلوگرام'], answer: '15-کلوگرام' },
      { id: 6, title: 'گروسری کی رسید', icon: '🛒', color: '#ec4899', content: "🛒 سپر مارٹ گروسری بل\nتیل: ₹200\nنمک: ₹25\nدال: ₹120\nکل رقم: ₹345", question: 'دال کی قیمت کتنی ہے؟', options: ['₹200', '₹25', '₹120', '₹345'], answer: '₹120' },
      { id: 7, title: 'ریلوے ٹکٹ', icon: '🚆', color: '#06b6d4', content: "🚆 انڈین ریلویز\nٹرین نمبر: 12952 (راجدھانی)\nکلاس: تھرڈ اے سی (3AC)\nسیٹ نمبر: 42 (لوئر)", question: 'ٹکٹ کے مطابق مسافر کی سیٹ کا نمبر کیا ہے؟', options: ['12', '42', '3', '52'], answer: '42' },
      { id: 8, title: 'اے ٹی ایم رسید', icon: '🏧', color: '#10b981', content: "🏧 اے ٹی ایم رسید\nنکالی گئی رقم: ₹2,000\nباقی بیلنس: ₹12,500\nاسٹیٹس: کامیاب", question: 'اے ٹی ایم سے کتنی رقم نکالی گئی؟', options: ['₹12,500', '₹2,000', '₹10,000', '₹5,000'], answer: '₹2,000' },
      { id: 9, title: 'پانی کا بل', icon: '💧', color: '#3b82f6', content: "💧 واٹر بورڈ بل\nاستعمال: 15,000 لیٹر\nبل کی رقم: ₹350\nآخری تاریخ: 25 اگست", question: 'اس مہینے کا پانی کا بل کتنا ہے؟', options: ['₹350', '₹15,000', '₹25', '₹150'], answer: '₹350' },
      { id: 10, title: 'ڈاکٹر کا نسخہ', icon: '📋', color: '#f59e0b', content: "📋 سنجیونی کلینک\nمریض کا نام: امیت کمار\nمشورہ: بیڈ ریسٹ (3 دن)\nدوبارہ ملاقات: پیر کے دن", question: 'ڈاکٹر نے کتنے دن آرام کا مشورہ دیا ہے؟', options: ['1 دن', '2 دن', '3 دن', '5 دن'], answer: '3-دن' }
    ]
  },
  en: {
    title: "Real-World Scenarios",
    desc: "Practice reading everyday documents like bus signs, bank slips, and electricity bills.",
    win: "Awesome! You completed all scenarios.",
    backBtn: "Go Back",
    readDesc: "Read the information below carefully and answer the question.",
    submitBtn: "Submit Answer",
    correctAlert: "✅ Correct! You understood the document perfectly.",
    wrongAlert: "❌ Incorrect. Try reading the details again!",
    items: [
      { id: 1, title: 'Bus Route Sign', icon: '🚌', color: '#f59e0b', content: "📋 Bus No. 42 Route:\nRailway Station → City Bank → Main Market → Hospital\n\nNext Bus: 10 minutes", question: 'If you want to go to the hospital, which bus should you take?', options: ['Bus 12', 'Bus 42', 'Bus 7', 'Bus 99'], answer: 'Bus 42' },
      { id: 2, title: 'Bank Deposit Slip', icon: '🏦', color: '#3b82f6', content: "🏦 State Bank of India\nAccount No: ****1234\nTransaction: Deposit\nAmount: ₹5,000\nBalance: ₹25,000", question: 'How much money was deposited according to the slip?', options: ['₹25,000', '₹10,000', '₹5,000', '₹1,234'], answer: '₹5,000' },
      { id: 3, title: 'Medicine Bottle Label', icon: '💊', color: '#10b981', content: "💊 Paracetamol 500mg\nDosage: 1 tablet\nWhen: After meals\nFrequency: 3 times a day\nWarning: Keep away from children", question: 'How many times per day should you take this medicine?', options: ['1 time', '2 times', '3 times', '4 times'], answer: '3 times' },
      { id: 4, title: 'Electricity Bill Summary', icon: '⚡', color: '#ef4444', content: "⚡ State Electricity Board\nBill Month: July 2026\nTotal Due: ₹1,850\nDue Date: 10 August 2026", question: 'What is the payment due date for the electricity bill?', options: ['1 August', '10 August', '15 August', '31 July'], answer: '10 August' },
      { id: 5, title: 'Ration Receipt Slip', icon: '🌾', color: '#8b5cf6', content: "🌾 Food Department Ration Receipt\nRice: 10 kg\nWheat: 15 kg\nSugar: 2 kg\nTotal Cost: ₹150", question: 'What is the quantity of wheat in the ration slip?', options: ['10 kg', '15 kg', '2 kg', '5 kg'], answer: '15 kg' },
      { id: 6, title: 'Grocery Mart Invoice', icon: '🛒', color: '#ec4899', content: "🛒 Supermart Grocery Invoice\nOil: ₹200\nSalt: ₹25\nPulses: ₹120\nTotal Bill: ₹345", question: 'What is the cost of the pulses?', options: ['₹200', '₹25', '₹120', '₹345'], answer: '₹120' },
      { id: 7, title: 'Railway Ticket Detail', icon: '🚆', color: '#06b6d4', content: "🚆 Indian Railways\nTrain No: 12952 (Rajdhani)\nClass: Third AC (3AC)\nSeat Number: 42 (Lower)", question: 'What is the passenger seat number in the ticket?', options: ['12', '42', '3', '52'], answer: '42' },
      { id: 8, title: 'ATM Transaction Receipt', icon: '🏧', color: '#10b981', content: "🏧 ATM Cash Withdrawal\nAmount Withdrawn: ₹2,000\nAvailable Balance: ₹12,500\nStatus: Successful", question: 'How much cash was withdrawn from the ATM?', options: ['₹12,500', '₹2,000', '₹10,000', '₹5,000'], answer: '₹2,000' },
      { id: 9, title: 'Water Supply Statement', icon: '💧', color: '#3b82f6', content: "💧 Water Supply Statement\nUsage: 15,000 Litres\nBill Amount: ₹350\nDue Date: 25 August", question: 'What is the bill amount for this month water?', options: ['₹350', '15,000 L', '₹25', '₹150'], answer: '₹350' },
      { id: 10, title: 'Doctor Prescription Note', icon: '📋', color: '#f59e0b', content: "📋 Sanjeevani Clinic\nPatient: Amit Kumar\nAdvice: Bed rest (3 days)\nNext visit: Monday", question: 'How many days of bed rest did the doctor prescribe?', options: ['1 day', '2 days', '3 days', '5 days'], answer: '3 days' }
    ]
  }
};

// Fallback for remaining regional languages (dynamically mapping Hindi translations inside them since they are purely in one script)
const fallbackLangs = ['mwr', 'ta', 'te', 'bn', 'mr'];
fallbackLangs.forEach(lang => {
  SCENARIOS_LANG_DATA[lang] = SCENARIOS_LANG_DATA['hi']; // default fallback to keep build intact
});

// Specialize Tamil & Telugu mappings to make sure there is no English mixed!
SCENARIOS_LANG_DATA.ta = {
  title: "நிஜ உலக சூழல்கள்",
  desc: "பேருந்து பலகை, வங்கி சீட்டு, மின்சார கட்டண விவரங்களை வாசிக்க பயிற்சி செய்க.",
  win: "அருமை! நீங்கள் அனைத்து விவரங்களையும் சரியாகப் படித்துவிட்டீர்கள்.",
  backBtn: "பின்செல்லவும்",
  readDesc: "கீழே உள்ள ஆவணத்தை கவனமாக வாசித்து வினாவிற்கு விடையளிக்கவும்.",
  submitBtn: "விடையைச் சமர்ப்பி",
  correctAlert: "✅ சரியான விடை! நீங்கள் விவரங்களைச் சரியாகப் புரிந்து கொண்டீர்கள்.",
  wrongAlert: "❌ தவறான விடை. மீண்டும் முயற்சி செய்க!",
  items: [
    { id: 1, title: 'பேருந்து வழித்தடம்', icon: '🚌', color: '#f59e0b', content: "📋 பேருந்து எண் 42 வழித்தடம்:\nஇரயில் நிலையம் → சிட்டி வங்கி → தலைமைச் சந்தை → மருத்துவமனை\n\nஅடுத்த பேருந்து: 10 நிமிடங்களில்", question: 'நீங்கள் மருத்துவமனைக்குச் செல்ல வேண்டும் எனில் எந்தப் பேருந்தை எடுக்க வேண்டும்?', options: ['பேருந்து 12', 'பேருந்து 42', 'பேருந்து 7', 'பேருந்து 99'], answer: 'பேருந்து 42' },
    { id: 2, title: 'வங்கி வைப்புச் சீட்டு', icon: '🏦', color: '#3b82f6', content: "🏦 பாரத ஸ்டேட் வங்கி\nகணக்கு எண்: ****1234\nபரிவர்த்தனை: வைப்பு (Deposit)\nதொகை: ₹5,000\nஇருப்புத் தொகை: ₹25,000", question: 'வைப்புச் சீட்டின்படி கணக்கில் செலுத்தப்பட்ட தொகை எவ்வளவு?', options: ['₹25,000', '₹10,000', '₹5,000', '₹1,234'], answer: '₹5,000' },
    { id: 3, title: 'மருந்துச் சீட்டு லேபிள்', icon: '💊', color: '#10b981', content: "💊 பாராசிட்டமால் 500 மிகி\nஅளவு: 1 மாத்திரை\nஎப்போது: உணவுக்குப் பின்\nஎத்தனை முறை: ஒரு நாளைக்கு 3 முறை\nஎச்சரிக்கை: குழந்தைகள் தொடாமல் வைக்கவும்", question: 'இந்த மாத்திரையை ஒரு நாளைக்கு எத்தனை முறை உட்கொள்ள வேண்டும்?', options: ['1 முறை', '2 முறை', '3 முறை', '4 முறை'], answer: '3 முறை' },
    { id: 4, title: 'மின் கட்டண விவரம்', icon: '⚡', color: '#ef4444', content: "⚡ மின்சார வாரியக் கட்டணம்\nமாதம்: ஜூலை 2026\nசெலுத்த வேண்டிய தொகை: ₹1,850\nஇறுதி நாள்: 10 ஆகஸ்ட் 2026", question: 'மின் கட்டணம் செலுத்த வேண்டிய இறுதி நாள் எது?', options: ['1 ஆகஸ்ட்', '10 ஆகஸ்ட்', '15 ஆகஸ்ட்', '31 ஜூலை'], answer: '10 ஆகஸ்ட்' },
    { id: 5, title: 'ரேஷன் கடை ரசீது', icon: '🌾', color: '#8b5cf6', content: "🌾 உணவுத் துறை ரேஷன் சீட்டு\nஅரிசி: 10 கிலோ\nகோதுமை: 15 கிலோ\nசர்க்கரை: 2 கிலோ\nமொத்த விலை: ₹150", question: 'ரேஷன் சீட்டில் உள்ள கோதுமையின் அளவு எவ்வளவு?', options: ['10 கிலோ', '15 கிலோ', '2 கிலோ', '5 கிலோ'], answer: '15 கிலோ' },
    { id: 6, title: 'மளிகைக் கடை பில்', icon: '🛒', color: '#ec4899', content: "🛒 சூப்பர்மார்க்கெட் மளிகை பில்\nஎண்ணெய்: ₹200\nஉப்பு: ₹25\nபருப்பு: ₹120\nமொத்த தொகை: ₹345", question: 'பருப்பின் விலை எவ்வளவு?', options: ['₹200', '₹25', '₹120', '₹345'], answer: '₹120' },
    { id: 7, title: 'இரயில் பயணச்சீட்டு', icon: '🚆', color: '#06b6d4', content: "🚆 இந்திய இரயில்வே\nவண்டி எண்: 12952 (ராஜ்தானி)\nவகுப்பு: மூன்றாம் வகுப்பு ஏசி (3AC)\nஇருக்கை எண்: 42 (கீழ் இருக்கை)", question: 'பயணச்சீட்டின்படி இருக்கை எண் எது?', options: ['12', '42', '3', '52'], answer: '42' },
    { id: 8, title: 'ஏடிஎம் ரசீது', icon: '🏧', color: '#10b981', content: "🏧 ஏடிஎம் பணப் பரிவர்த்தனை\nஎடுத்த தொகை: ₹2,000\nகணக்கில் உள்ள இருப்பு: ₹12,500\nநிலை: வெற்றி", question: 'ஏடிஎம் மூலம் எடுக்கப்பட்ட பணத் தொகை எவ்வளவு?', options: ['₹12,500', '₹2,000', '₹10,000', '₹5,000'], answer: '₹2,000' },
    { id: 9, title: 'குடிநீர் வாரியக் கட்டணம்', icon: '💧', color: '#3b82f6', content: "💧 குடிநீர் வாரியப் பில்\nபயன்பாடு: 15,000 லிட்டர்\nகட்டணத் தொகை: ₹350\nஇறுதி நாள்: 25 ஆகஸ்ட்", question: 'இந்த மாதத்திற்கான குடிநீர் கட்டணம் எவ்வளவு?', options: ['₹350', '15,000 லி', '₹25', '₹150'], answer: '₹350' },
    { id: 10, title: 'மருத்துவர் ஆலோசனைச் சீட்டு', icon: '📋', color: '#f59e0b', content: "📋 சஞ்சீவினி மருத்துவமனை\nநோயாளி: அமித் குமார்\nஅறிவுரை: ஓய்வு (3 நாட்கள்)\nஅடுத்த வருகை: திங்கட்கிழமை", question: 'மருத்துவர் எத்தனை நாட்கள் ஓய்வெடுக்க அறிவுறுத்தியுள்ளார்?', options: ['1 நாள்', '2 நாட்கள்', '3 நாட்கள்', '5 நாட்கள்'], answer: '3 நாட்கள்' }
  ]
};

SCENARIOS_LANG_DATA.te = {
  title: "నిజ జీవిత పరిస్థితులు",
  desc: "బస్సు బోర్డు, బ్యాంక్ స్లిప్, విద్యుత్ బిల్లు వంటి రోజువారీ పత్రాలను చదవడం ప్రాక్టీస్ చేయండి.",
  win: "అద్భుతం! మీరు అన్ని పరిస్థితులను విజయవంతంగా పూర్తి చేశారు.",
  backBtn: "వెనుకకు వెళ్ళు",
  readDesc: "క్రింది సమాచారాన్ని జాగ్రత్తగా చదివి ప్రశ్నకు సమాధానం ఇవ్వండి.",
  submitBtn: "సమాధానం సమర్పించు",
  correctAlert: "✅ సరైన సమాధానం! మీరు పత్రాన్ని సరిగ్గా అర్థం చేసుకున్నారు.",
  wrongAlert: "❌ తప్పు సమాధానం. మళ్లీ ప్రయత్నించండి!",
  items: [
    { id: 1, title: 'బస్సు మార్గం వివరాలు', icon: '🚌', color: '#f59e0b', content: "📋 బస్సు నెం. 42 మార్గం:\nరైల్వే స్టేషన్ → సిటీ బ్యాంక్ → మెయిన్ మార్కెట్ → ఆసుపత్రి\n\nతదుపరి బస్సు: 10 నిమిషాలలో", question: 'మీరు ఆసుపత్రికి వెళ్లాలంటే ఏ బస్సు ఎక్కాలి?', options: ['బస్సు 12', 'బస్సు 42', 'బస్సు 7', 'బస్సు 99'], answer: 'బస్సు 42' },
    { id: 2, title: 'బ్యాంక్ డిపాజిట్ స్లిప్', icon: '🏦', color: '#3b82f6', content: "🏦 స్టేట్ బ్యాంక్ ఆఫ్ ఇండియా\nఖాతా సంఖ్య: ****1234\nలావాదేవీ: డిపాజిట్ (Deposit)\nమొత్తం: ₹5,000\nమిగిలిన బ్యాలెన్స్: ₹25,000", question: 'స్లిప్ ప్రకారం ఎంత మొత్తం డిపాజిట్ చేయబడింది?', options: ['₹25,000', '₹10,000', '₹5,000', '₹1,234'], answer: '₹5,000' },
    { id: 3, title: 'మందు సీసా లేబుల్', icon: '💊', color: '#10b981', content: "💊 పారాసిటమాల్ 500mg\nమోతాదు: 1 టాబ్లెట్\nఎప్పుడు: భోజనం తర్వాత\nసార్లు: రోజుకు 3 సార్లు\nహెచ్చరిక: పిల్లలకు దూరంగా ఉంచండి", question: 'ఈ మందును రోజుకు ఎన్ని సార్లు వేసుకోవాలి?', options: ['1 సారి', '2 సార్లు', '3 సార్లు', '4 సార్లు'], answer: '3 సార్లు' },
    { id: 4, title: 'కరెంటు బిల్లు వివరాలు', icon: '⚡', color: '#ef4444', content: "⚡ స్టేట్ ఎలక్ట్రిసిటీ బోర్డ్\nబిల్లు నెల: జూలై 2026\nచెల్లించవలసిన మొత్తం: ₹1,850\nచివరి తేదీ: 10 ఆగస్టు 2026", question: 'కరెంటు బిల్లు చెల్లించడానికి చివరి తేదీ ఏది?', options: ['1 ఆగస్టు', '10 ఆగస్టు', '15 ఆగస్టు', '31 జూలై'], answer: '10 ఆగస్టు' },
    { id: 5, title: 'రేషన్ రసీదు స్లిప్', icon: '🌾', color: '#8b5cf6', content: "🌾 ఆహార శాఖ రేషన్ రసీదు\nబియ్యం: 10 కిలోలు\nగోధుమలు: 15 కిలోలు\nచక్కెర: 2 కిలోలు\nమొత్తం ఖరీదు: ₹150", question: 'రేషన్ స్లిప్‌లో గోధుమల పరిమాణం ఎంత?', options: ['10 కిలోలు', '15 కిలోలు', '2 కిలోలు', '5 కిలోలు'], answer: '15 కిలోలు' },
    { id: 6, title: 'కిరాణా బిల్లు', icon: '🛒', color: '#ec4899', content: "🛒 సూపర్‌మార్కెట్ కిరాణా బిల్లు\nనూనె: ₹200\nఉప్పు: ₹25\nపప్పు: ₹120\nమొత్తం బిల్లు: ₹345", question: 'పప్పు ధర ఎంత?', options: ['₹200', '₹25', '₹120', '₹345'], answer: '₹120' },
    { id: 7, title: 'రైలు ప్రయాణ టికెట్', icon: '🚆', color: '#06b6d4', content: "🚆 ఇండియన్ రైల్వేస్\nరైలు సంఖ్య: 12952 (రాజధాని)\nతరగతి: థర్డ్ ఏసీ (3AC)\nసీటు సంఖ్య: 42 (క్రింది సీటు)", question: 'టికెట్ ప్రకారం ప్రయాణీకుడి సీటు సంఖ్య ఎంత?', options: ['12', '42', '3', '52'], answer: '42' },
    { id: 8, title: 'ఏటీఎమ్ రసీదు', icon: '🏧', color: '#10b981', content: "🏧 ఏటీఎమ్ నగదు విత్ డ్రా\nడ్రా చేసిన మొత్తం: ₹2,000\nఖాతాలో మిగిలిన బ్యాలెన్స్: ₹12,500\nస్థితి: విజయం", question: 'ఏటీఎమ్ నుండి ఎంత నగదు డ్రా చేయబడింది?', options: ['₹12,500', '₹2,000', '₹10,000', '₹5,000'], answer: '₹2,000' },
    { id: 9, title: 'వాటర్ బిల్లు స్టేట్‌మెంట్', icon: '💧', color: '#3b82f6', content: "💧 వాటర్ బోర్డు బిల్లు\nవాడకం: 15,000 లీటర్లు\nబిల్లు మొత్తం: ₹350\nచివరి తేదీ: 25 ఆగస్టు", question: 'ఈ నెలకు నీటి బిల్లు మొత్తం ఎంత?', options: ['₹350', '15,000 లీ', '₹25', '₹150'], answer: '₹350' },
    { id: 10, title: 'డాక్టర్ ప్రిస్క్రిప్షన్ నోట్', icon: '📋', color: '#f59e0b', content: "📋 సంజీవని క్లినిక్\nరోగి: అమిత్ కుమార్\nసలహా: బెడ్ రెస్ట్ (3 రోజులు)\nతదుపరి దర్శనం: సోమవారం", question: 'వైద్యుడు ఎన్ని రోజుల విశ్రాంతిని సలహా ఇచ్చారు?', options: ['1 రోజు', '2 రోజులు', '3 రోజులు', '5 రోజులు'], answer: '3 రోజులు' }
  ]
};

const ScenariosPage = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

    let currentLang = 'hi';
  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    currentLang = storedUser.learning_language || 'hi';
  } catch (e) {}
  const data = SCENARIOS_LANG_DATA[currentLang] || SCENARIOS_LANG_DATA['hi'];

  const [selected, setSelected] = useState(null);
  const [pickedAnswer, setPickedAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [completedList, setCompletedList] = useState([]);

  const handleSelectScenario = (s) => {
    setSelected(s);
    setPickedAnswer('');
    setResult(null);
  };

  const handleSubmitAnswer = () => {
    if (pickedAnswer === selected.answer) {
      setResult('correct');
      if (!completedList.includes(selected.id)) {
        setCompletedList([...completedList, selected.id]);
      }
    } else {
      setResult('incorrect');
    }
  };

  const handleReset = () => {
    setCompletedList([]);
    setSelected(null);
    setPickedAnswer('');
    setResult(null);
  };

  if (selected) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem' }}>
        <button 
          onClick={() => { setSelected(null); setPickedAnswer(''); setResult(null); }} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '12px', cursor: 'pointer', color: '#475569', fontSize: '0.9rem', fontWeight: 700, marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
        >
          <ArrowLeft size={18} /> {data.backBtn}
        </button>

        <div style={{ maxWidth: '700px', margin: '0 auto', background: 'white', borderRadius: '24px', padding: '2.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '2.5rem' }}>{selected.icon}</span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>{selected.title}</h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem', fontWeight: 600 }}>
            {data.readDesc}
          </p>

          <pre style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.8rem', fontFamily: 'inherit', fontSize: '1.05rem', lineHeight: '1.8', whiteSpace: 'pre-wrap', color: '#1e293b', marginBottom: '2rem', fontWeight: 600 }}>
            {selected.content}
          </pre>

          <h3 style={{ marginBottom: '1.2rem', fontSize: '1.15rem', color: '#1e293b', fontWeight: 800 }}>
            {selected.question}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2rem' }}>
            {selected.options.map(opt => (
              <button 
                key={opt} 
                onClick={() => !result && setPickedAnswer(opt)} 
                style={{ 
                  padding: '1rem 1.5rem', 
                  borderRadius: '16px', 
                  border: `2px solid ${pickedAnswer === opt ? '#3b82f6' : '#e2e8f0'}`, 
                  background: pickedAnswer === opt ? '#eff6ff' : 'white', 
                  cursor: result ? 'default' : 'pointer', 
                  textAlign: 'left', 
                  fontSize: '1.05rem', 
                  fontWeight: pickedAnswer === opt ? 800 : 600, 
                  transition: 'all 0.15s',
                  color: '#334155'
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              onClick={handleSubmitAnswer} 
              disabled={!pickedAnswer || result === 'correct'} 
              style={{ 
                background: pickedAnswer ? '#3b82f6' : '#cbd5e1', 
                color: 'white', 
                border: 'none', 
                padding: '0.85rem 2.2rem', 
                borderRadius: '14px', 
                cursor: pickedAnswer ? 'pointer' : 'not-allowed', 
                fontSize: '1rem', 
                fontWeight: 800 
              }}
            >
              {data.submitBtn}
            </button>
          </div>

          {result && (
            <div 
              style={{ 
                marginTop: '1.5rem', 
                padding: '1.2rem', 
                borderRadius: '16px', 
                background: result === 'correct' ? '#ecfdf5' : '#fff5f5', 
                border: `1px solid ${result === 'correct' ? '#a7f3d0' : '#fecaca'}`,
                color: result === 'correct' ? '#065f46' : '#991b1b', 
                fontWeight: 700,
                fontSize: '0.95rem'
              }}
            >
              {result === 'correct' ? data.correctAlert : data.wrongAlert}
            </div>
          )}
        </div>
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

      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        
        {/* Header card */}
        <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: '24px', padding: '2rem', color: 'white', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 0.4rem 0' }}>🌍 {data.title}</h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>{data.desc}</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.6rem 1.2rem', borderRadius: '20px', fontWeight: 800 }}>
            {completedList.length} / {data.items.length} Completed
          </div>
        </div>

        {completedList.length === data.items.length ? (
          <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
            <Trophy size={64} color="#eab308" style={{ marginBottom: '1rem', marginInline: 'auto' }} />
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b', margin: '0 0 0.5rem 0' }}>All Scenarios Solved!</h2>
            <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '2rem' }}>{data.win}</p>
            <button 
              onClick={handleReset}
              style={{ background: '#d97706', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw size={18} /> Reset Progress
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.items.map(s => {
              const isDone = completedList.includes(s.id);
              return (
                <div 
                  key={s.id} 
                  onClick={() => handleSelectScenario(s)} 
                  style={{ 
                    background: 'white', 
                    borderRadius: '20px', 
                    padding: '1.2rem 1.5rem', 
                    cursor: 'pointer', 
                    boxShadow: '0 2px 4px rgba(0,0,0,0.01)', 
                    border: isDone ? '1px solid #a7f3d0' : '1px solid #e2e8f0', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    transition: 'all 0.2s',
                    background: isDone ? '#f0fdf4' : 'white'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.04)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.01)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                    <div style={{ background: s.color, width: 48, height: 48, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                      {s.icon}
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '1.1rem', color: '#1e293b', fontWeight: 800 }}>
                        {s.title}
                      </h3>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                        {isDone ? '✓ Completed' : 'Tap to start reading'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} color={isDone ? '#10b981' : '#cbd5e1'} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScenariosPage;
