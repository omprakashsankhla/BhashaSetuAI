import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Mic, MicOff, Volume2, CheckCircle, AlertCircle, Play, ChevronRight, Award } from 'lucide-react';
import { speakText as ttsSpeak, LANG_REC_MAP } from '../../utils/ttsHelper';
import './FlashcardsPage.css'; // Leverage standard BhashaSetu design assets

const WORDS_BY_LANG = {
  hi: [
    { id: 1, word: 'नमस्ते', romanized: 'Namaste', meaning: 'Hello', example: 'नमस्ते, आप कैसे हैं?', translation: 'Hello, how are you?' },
    { id: 2, word: 'धन्यवाद', romanized: 'Dhanyavaad', meaning: 'Thank you', example: 'मदद के लिए धन्यवाद।', translation: 'Thank you for the help.' },
    { id: 3, word: 'हाँ', romanized: 'Haan', meaning: 'Yes', example: 'हाँ, मैं कल आऊँगा।', translation: 'Yes, I will come tomorrow.' },
    { id: 4, word: 'नहीं', romanized: 'Nahin', meaning: 'No', example: 'नहीं, मुझे यह पसंद नहीं है।', translation: 'No, I do not like this.' },
    { id: 5, word: 'कृपया', romanized: 'Kripaya', meaning: 'Please', example: 'कृपया यहाँ बैठिए।', translation: 'Please sit here.' },
    { id: 6, word: 'स्वागत है', romanized: 'Swaagat hai', meaning: 'Welcome', example: 'आपका स्वागत है।', translation: 'You are welcome.' },
    { id: 7, word: 'शुभकामनाएँ', romanized: 'Shubhkaamnaayein', meaning: 'Good wishes / Best of luck', example: 'परीक्षा के लिए शुभकामनाएँ।', translation: 'Best of luck for the exam.' },
    { id: 8, word: 'माफ़ कीजिए', romanized: 'Maaf keejiye', meaning: 'Excuse me / Sorry', example: 'माफ़ कीजिए, क्या मैं जा सकता हूँ?', translation: 'Excuse me, may I go?' },
    { id: 9, word: 'अच्छा', romanized: 'Achha', meaning: 'Good', example: 'यह बहुत अच्छा काम है।', translation: 'This is a very good work.' },
    { id: 10, word: 'खराब', romanized: 'Kharaab', meaning: 'Bad', example: 'आज मौसम खराब है।', translation: 'The weather is bad today.' },
    { id: 11, word: 'पानी', romanized: 'Paani', meaning: 'Water', image: '💧', example: 'मुझे पीने का पानी चाहिए।', translation: 'I want drinking water.' },
    { id: 12, word: 'खाना', romanized: 'Khaana', meaning: 'Food', example: 'खाना बहुत स्वादिष्ट है।', translation: 'The food is very delicious.' },
    { id: 13, word: 'बड़ा', romanized: 'Bada', meaning: 'Big', example: 'यह एक बड़ा पेड़ है।', translation: 'This is a big tree.' },
    { id: 14, word: 'छोटा', romanized: 'Chhota', meaning: 'Small', example: 'वह एक छोटा बच्चा है।', translation: 'He is a small child.' },
    { id: 15, word: 'कल', romanized: 'Kal', meaning: 'Tomorrow / Yesterday', example: 'हम कल मिलेंगे।', translation: 'We will meet tomorrow.' }
  ],
  ur: [
    { id: 1, word: 'سلام', romanized: 'Salaam', meaning: 'Hello', example: 'سلام، آپ کیسے ہیں؟', translation: 'Hello, how are you?' },
    { id: 2, word: 'شکریہ', romanized: 'Shukriya', meaning: 'Thank you', example: 'مدد کے لیے شکریہ۔', translation: 'Thank you for the help.' },
    { id: 3, word: 'ہاں', romanized: 'Haan', meaning: 'Yes', example: 'ہاں، میں کل آؤں گا۔', translation: 'Yes, I will come tomorrow.' },
    { id: 4, word: 'نہیں', romanized: 'Nahin', meaning: 'No', example: 'نہیں، مجھے یہ پسند نہیں ہے۔', translation: 'No, I do not like this.' },
    { id: 5, word: 'مہربانی فرما کر', romanized: 'Meharbani farma kar', meaning: 'Please', example: 'مہربانی فرما کر یہاں بیٹھیں۔', translation: 'Please sit here.' },
    { id: 6, word: 'خوش آمدید', romanized: 'Khush aamdeed', meaning: 'Welcome', example: 'آپ کا خوش آمدید۔', translation: 'You are welcome.' },
    { id: 7, word: 'نیک تمنائیں', romanized: 'Naik tamannaen', meaning: 'Good wishes / Best of luck', example: 'امتحان کے لیے نیک تمنائیں۔', translation: 'Best of luck for the exam.' },
    { id: 8, word: 'معاف کیجیے', romanized: 'Maaf keejiye', meaning: 'Excuse me / Sorry', example: 'معاف کیجیے، کیا میں جا سکتا ہوں؟', translation: 'Excuse me, may I go?' },
    { id: 9, word: 'اچھا', romanized: 'Achha', meaning: 'Good', example: 'یہ بہت اچھا کام ہے۔', translation: 'This is a very good work.' },
    { id: 10, word: 'خراب', romanized: 'Kharaab', meaning: 'Bad', example: 'آج موسم خراب ہے۔', translation: 'The weather is bad today.' },
    { id: 11, word: 'پانی', romanized: 'Paani', meaning: 'Water', example: 'مجھے پینے کا پانی چاہیے۔', translation: 'I want drinking water.' },
    { id: 12, word: 'کھانا', romanized: 'Khaana', meaning: 'Food', example: 'کھانا بہت لذیذ ہے۔', translation: 'The food is very delicious.' },
    { id: 13, word: 'بڑا', romanized: 'Bada', meaning: 'Big', example: 'یہ ایک بڑا درخت ہے۔', translation: 'This is a big tree.' },
    { id: 14, word: 'چھوٹا', romanized: 'Chhota', meaning: 'Small', example: 'وہ ایک چھوٹا بچہ ہے۔', translation: 'He is a small child.' },
    { id: 15, word: 'کل', romanized: 'Kal', meaning: 'Tomorrow / Yesterday', example: 'ہم کل ملیں گے۔', translation: 'We will meet tomorrow.' }
  ],
  mwr: [
    { id: 1, word: 'खम्मा घणी', romanized: 'Khamma Ghani', meaning: 'Hello', example: 'खम्मा घणी सा, कैंया हो?', translation: 'Hello, how are you?' },
    { id: 2, word: 'घणो मान', romanized: 'Ghano maan', meaning: 'Thank you', example: 'मदद वास्ते घणो मान।', translation: 'Thank you for the help.' },
    { id: 3, word: 'हाँ', romanized: 'Haan', meaning: 'Yes', example: 'हाँ, म्हे काल आऊँगा।', translation: 'Yes, I will come tomorrow.' },
    { id: 4, word: 'कोनी', romanized: 'Koni', meaning: 'No', example: 'कोनी, मने ओ पसंद कोनी।', translation: 'No, I do not like this.' },
    { id: 5, word: 'नेडा आवो', romanized: 'Neda aavo', meaning: 'Please / Come close', example: 'नेडा आवो अठे बैठो।', translation: 'Please sit here.' },
    { id: 6, word: 'आओ सा', romanized: 'Aao sa', meaning: 'Welcome', example: 'थांको आओ सा।', translation: 'You are welcome.' },
    { id: 7, word: 'बधाई हो', romanized: 'Badhai ho', meaning: 'Good wishes / Best of luck', example: 'बधाई हो परीक्षा सारू।', translation: 'Best of luck for the exam.' },
    { id: 8, word: 'माफ़ करो', romanized: 'Maaf karo', meaning: 'Excuse me / Sorry', example: 'माफ़ करो, कई म्हे जा सकूँ?', translation: 'Excuse me, may I go?' },
    { id: 9, word: 'चोखो', romanized: 'Chokho', meaning: 'Good', example: 'ओ घणो चोखो काम है।', translation: 'This is a very good work.' },
    { id: 10, word: 'बुरो', romanized: 'Buro', meaning: 'Bad', example: 'आज मोसम बुरो है।', translation: 'The weather is bad today.' },
    { id: 11, word: 'पाणी', romanized: 'Paani', meaning: 'Water', example: 'मने पीवण रो पाणी चाहिजे।', translation: 'I want drinking water.' },
    { id: 12, word: 'जीमण', romanized: 'Jeeman', meaning: 'Food', example: 'जीमण घणो स्वाद है।', translation: 'The food is very delicious.' },
    { id: 13, word: 'मोटो', romanized: 'Moto', meaning: 'Big', example: 'ओ मोटो रूख है।', translation: 'This is a big tree.' },
    { id: 14, word: 'छोटो', romanized: 'Chhoto', meaning: 'Small', example: 'वो छोटो टाबर है।', translation: 'He is a small child.' },
    { id: 15, word: 'काले', romanized: 'Kaale', meaning: 'Tomorrow / Yesterday', example: 'म्हे काले मिलाँगा।', translation: 'We will meet tomorrow.' }
  ],
  ta: [
    { id: 1, word: 'வணக்கம்', romanized: 'Vanakkam', meaning: 'Hello', example: 'வணக்கம், எப்படி இருக்கிறீர்கள்?', translation: 'Hello, how are you?' },
    { id: 2, word: 'நன்றி', romanized: 'Nandri', meaning: 'Thank you', example: 'உதவிக்கு நன்றி.', translation: 'Thank you for the help.' },
    { id: 3, word: 'ஆம்', romanized: 'Aam', meaning: 'Yes', example: 'ஆம், நான் நாளை வருவேன்.', translation: 'Yes, I will come tomorrow.' },
    { id: 4, word: 'இல்லை', romanized: 'Illai', meaning: 'No', example: 'இல்லை, எனக்கு இது பிடிக்கவில்லை.', translation: 'No, I do not like this.' },
    { id: 5, word: 'தயவுசெய்து', romanized: 'Thayavuseythu', meaning: 'Please', example: 'தயவுசெய்து இங்கே அமருங்கள்.', translation: 'Please sit here.' },
    { id: 6, word: 'வரவேற்பு', romanized: 'Varaverpu', meaning: 'Welcome', example: 'உங்களை வரவேற்கிறோம்.', translation: 'You are welcome.' },
    { id: 7, word: 'வாழ்த்துக்கள்', romanized: 'Vaalthukkal', meaning: 'Good wishes / Best of luck', example: 'தேர்வுக்கு வாழ்த்துக்கள்.', translation: 'Best of luck for the exam.' },
    { id: 8, word: 'மன்னிக்கவும்', romanized: 'Mannikkavum', meaning: 'Excuse me / Sorry', example: 'மன்னிக்கவும், நான் போகலாமா?', translation: 'Excuse me, may I go?' },
    { id: 9, word: 'நல்லது', romanized: 'Nallathu', meaning: 'Good', example: 'இது ஒரு நல்ல வேலை.', translation: 'This is a very good work.' },
    { id: 10, word: 'கெட்டது', romanized: 'Kettathu', meaning: 'Bad', example: 'இன்று வானிலை மோசமாக உள்ளது.', translation: 'The weather is bad today.' },
    { id: 11, word: 'தண்ணீர்', romanized: 'Thanneer', meaning: 'Water', example: 'எனக்கு குடிநீர் வேண்டும்.', translation: 'I want drinking water.' },
    { id: 12, word: 'உணவு', romanized: 'Unavu', meaning: 'Food', example: 'உணவு மிகவும் சுவையாக உள்ளது.', translation: 'The food is very delicious.' },
    { id: 13, word: 'பெரியது', romanized: 'Periyathu', meaning: 'Big', example: 'இது ஒரு பெரிய மரம்.', translation: 'This is a big tree.' },
    { id: 14, word: 'சிறியது', romanized: 'Siriyathu', meaning: 'Small', example: 'அவன் ஒரு சிறிய குழந்தை.', translation: 'He is a small child.' },
    { id: 15, word: 'நாளை', romanized: 'Naalai', meaning: 'Tomorrow', example: 'நாம் நாளை சந்திப்போம்.', translation: 'We will meet tomorrow.' }
  ],
  te: [
    { id: 1, word: 'నమస్కారం', romanized: 'Namaskaram', meaning: 'Hello', example: 'నమస్కారం, ఎలా ఉన్నారు?', translation: 'Hello, how are you?' },
    { id: 2, word: 'ధన్యవాదాలు', romanized: 'Dhanyavaadalu', meaning: 'Thank you', example: 'సహాయానికి ధన్యవాదాలు.', translation: 'Thank you for the help.' },
    { id: 3, word: 'అవును', romanized: 'Avunu', meaning: 'Yes', example: 'అవును, నేను రేపు వస్తాను.', translation: 'Yes, I will come tomorrow.' },
    { id: 4, word: 'వద్దు', romanized: 'Vaddu', meaning: 'No', example: 'వద్దు, నాకు ఇది నచ్చలేదు.', translation: 'No, I do not like this.' },
    { id: 5, word: 'దయచేసి', romanized: 'Dayachesi', meaning: 'Please', example: 'దయచేసి ఇక్కడ కూర్చోండి.', translation: 'Please sit here.' },
    { id: 6, word: 'స్వాగతం', romanized: 'Swaagatham', meaning: 'Welcome', example: 'మీకు స్వాగతం.', translation: 'You are welcome.' },
    { id: 7, word: 'శుభాకాంక్షలు', romanized: 'Shubhaakaankshalu', meaning: 'Good wishes / Best of luck', example: 'పరీక్షకు శుభాకాంక్షలు.', translation: 'Best of luck for the exam.' },
    { id: 8, word: 'క్షమించండి', romanized: 'Kshaminchandi', meaning: 'Excuse me / Sorry', example: 'క్షమించండి, నేను వెళ్ళవచ్చా?', translation: 'Excuse me, may I go?' },
    { id: 9, word: 'మంచిది', romanized: 'Manchidi', meaning: 'Good', example: 'ఇది చాలా మంచి పని.', translation: 'This is a very good work.' },
    { id: 10, word: 'చెడ్డది', romanized: 'Cheddadi', meaning: 'Bad', example: 'ఈరోజు వాతావరణం బాగోలేదు.', translation: 'The weather is bad today.' },
    { id: 11, word: 'నీరు', romanized: 'Neeru', meaning: 'Water', example: 'నాకు త్రాగునీరు కావాలి.', translation: 'I want drinking water.' },
    { id: 12, word: 'ఆహారం', romanized: 'Aaharam', meaning: 'Food', example: 'ఆహారం చాలా రుచిగా ఉంది.', translation: 'The food is very delicious.' },
    { id: 13, word: 'పెద్దది', romanized: 'Peddadi', meaning: 'Big', example: 'ఇది ఒక పెద్ద చెట్టు.', translation: 'This is a big tree.' },
    { id: 14, word: 'చిన్నది', romanized: 'Chinnadi', meaning: 'Small', example: 'అతను ఒక చిన్న బాబు.', translation: 'He is a small child.' },
    { id: 15, word: 'రేపు', romanized: 'Repu', meaning: 'Tomorrow', example: 'మనం రేపు కలుద్దాం.', translation: 'We will meet tomorrow.' }
  ],
  bn: [
    { id: 1, word: 'নমস্কার', romanized: 'Nomoshkar', meaning: 'Hello', example: 'নমস্কার, আপনি কেমন আছেন?', translation: 'Hello, how are you?' },
    { id: 2, word: 'ধন্যবাদ', romanized: 'Dhonnobad', meaning: 'Thank you', example: 'সাহায্যের জন্য ধন্যবাদ।', translation: 'Thank you for the help.' },
    { id: 3, word: 'হ্যাঁ', romanized: 'Haan', meaning: 'Yes', example: 'হ্যাঁ, আমি আগামীকাল আসব।', translation: 'Yes, I will come tomorrow.' },
    { id: 4, word: 'না', romanized: 'Naa', meaning: 'No', example: 'না, আমার এটা পছন্দ নয়।', translation: 'No, I do not like this.' },
    { id: 5, word: 'দয়া করে', romanized: 'Doya kore', meaning: 'Please', example: 'দয়া করে এখানে বসুন।', translation: 'Please sit here.' },
    { id: 6, word: 'স্বাগতম', romanized: 'Shagotom', meaning: 'Welcome', example: 'আপনাকে স্বাগতম।', translation: 'You are welcome.' },
    { id: 7, word: 'শুভকামনা', romanized: 'Shubhokamona', meaning: 'Good wishes / Best of luck', example: 'পরীক্ষার জন্য শুভকামনা।', translation: 'Best of luck for the exam.' },
    { id: 8, word: 'মাফ করবেন', romanized: 'Maaf korben', meaning: 'Excuse me / Sorry', example: 'মাফ করবেন, আমি কি যেতে পারি?', translation: 'Excuse me, may I go?' },
    { id: 9, word: 'ভালো', romanized: 'Bhalo', meaning: 'Good', example: 'এটি খুব ভালো কাজ।', translation: 'This is a very good work.' },
    { id: 10, word: 'খারাপ', romanized: 'Kharap', meaning: 'Bad', example: 'আজকে আবহাওয়া খারাপ।', translation: 'The weather is bad today.' },
    { id: 11, word: 'জল', romanized: 'Jol', meaning: 'Water', example: 'আমার পানের জল লাগবে।', translation: 'I want drinking water.' },
    { id: 12, word: 'খাবার', romanized: 'Khabar', meaning: 'Food', example: 'খাবারটি খুব সুস্বাদু।', translation: 'The food is very delicious.' },
    { id: 13, word: 'বড়', romanized: 'Boro', meaning: 'Big', example: 'এটি একটি বড় গাছ।', translation: 'This is a big tree.' },
    { id: 14, word: 'ছোট', romanized: 'Chhoto', meaning: 'Small', example: 'সে একটি ছোট বাচ্চা।', translation: 'He is a small child.' },
    { id: 15, word: 'আগামীকাল', romanized: 'Agamikal', meaning: 'Tomorrow', example: 'আমরা আগামীকাল দেখা করব।', translation: 'We will meet tomorrow.' }
  ],
  mr: [
    { id: 1, word: 'नमस्कार', romanized: 'Namaskar', meaning: 'Hello', example: 'नमस्कार, तुम्ही कसे आहात?', translation: 'Hello, how are you?' },
    { id: 2, word: 'धन्यवाद', romanized: 'Dhanyavaad', meaning: 'Thank you', example: 'मदतीसाठी धन्यवाद।', translation: 'Thank you for the help.' },
    { id: 3, word: 'हो', romanized: 'Ho', meaning: 'Yes', example: 'हो, मी उद्या येईन।', translation: 'Yes, I will come tomorrow.' },
    { id: 4, word: 'नाही', romanized: 'Naahi', meaning: 'No', example: 'नाही, मला हे आवडत नाही।', translation: 'No, I do not like this.' },
    { id: 5, word: 'कृपया', romanized: 'Krupaya', meaning: 'Please', example: 'कृपया येथे बसा।', translation: 'Please sit here.' },
    { id: 6, word: 'स्वागत आहे', romanized: 'Swaagat aahe', meaning: 'Welcome', example: 'तुमचे स्वागत आहे।', translation: 'You are welcome.' },
    { id: 7, word: 'शुभेच्छा', romanized: 'Shubhechha', meaning: 'Good wishes / Best of luck', example: 'परीक्षेसाठी शुभेच्छा।', translation: 'Best of luck for the exam.' },
    { id: 8, word: 'माफ करा', romanized: 'Maaf kara', meaning: 'Excuse me / Sorry', example: 'माफ करा, मी जाऊ शकतो का?', translation: 'Excuse me, may I go?' },
    { id: 9, word: 'चांगले', romanized: 'Chaangle', meaning: 'Good', example: 'हे खूप चांगले काम आहे।', translation: 'This is a very good work.' },
    { id: 10, word: 'वाईट', romanized: 'Waait', meaning: 'Bad', example: 'आज हवामान वाईट आहे।', translation: 'The weather is bad today.' },
    { id: 11, word: 'पाणी', romanized: 'Paani', meaning: 'Water', example: 'मला पिण्याचे पाणी हवे आहे।', translation: 'I want drinking water.' },
    { id: 12, word: 'जेवण', romanized: 'Jevan', meaning: 'Food', example: 'जेवण खूप स्वादिष्ट आहे।', translation: 'The food is very delicious.' },
    { id: 13, word: 'मोठा', romanized: 'Motha', meaning: 'Big', example: 'हे एक मोठे झाड आहे।', translation: 'This is a big tree.' },
    { id: 14, word: 'लहान', romanized: 'Lahaan', meaning: 'Small', example: 'तो एक लहान मुलगा आहे।', translation: 'He is a small child.' },
    { id: 15, word: 'उद्या', romanized: 'Udya', meaning: 'Tomorrow', example: 'आपण उद्या भेटू।', translation: 'We will meet tomorrow.' }
  ],
  en: [
    { id: 1, word: 'Hello', romanized: 'Hello', meaning: 'Greeting used to introduce yourself', example: 'Hello, how are you doing?', translation: 'A casual friendly greeting.' },
    { id: 2, word: 'Thank you', romanized: 'Thank you', meaning: 'Expressing gratitude', example: 'Thank you for helping me today.', translation: 'A common polite phrase.' },
    { id: 3, word: 'Yes', romanized: 'Yes', meaning: 'Affirmative response', example: 'Yes, I will join the meeting.', translation: 'Agreement or confirmation.' },
    { id: 4, word: 'No', romanized: 'No', meaning: 'Negative response', example: 'No, I have not finished yet.', translation: 'Disagreement or refusal.' },
    { id: 5, word: 'Please', romanized: 'Please', meaning: 'Polite request', example: 'Please sit down and relax.', translation: 'Used to ask for something politely.' },
    { id: 6, word: 'Welcome', romanized: 'Welcome', meaning: 'Friendly greeting or response to thanks', example: 'Welcome to our school!', translation: 'Greeting a guest or responding to thank you.' },
    { id: 7, word: 'Best wishes', romanized: 'Best wishes', meaning: 'Good wishes / Hope for success', example: 'Best wishes for your new project.', translation: 'Wishing someone well.' },
    { id: 8, word: 'Excuse me', romanized: 'Excuse me', meaning: 'Polite way to get attention or apologize', example: 'Excuse me, could you tell me the time?', translation: 'Getting attention politely.' },
    { id: 9, word: 'Good', romanized: 'Good', meaning: 'Having desirable qualities', example: 'This is a very good book.', translation: 'High quality or positive.' },
    { id: 10, word: 'Bad', romanized: 'Bad', meaning: 'Poor quality or unpleasant', example: 'The weather today is really bad.', translation: 'Unpleasant or negative.' },
    { id: 11, word: 'Water', romanized: 'Water', meaning: 'Clear liquid essential for life', example: 'Can I have a glass of water, please?', translation: 'Drinkable fluid.' },
    { id: 12, word: 'Food', romanized: 'Food', meaning: 'Nourishment eaten to sustain life', example: 'The dinner food was extremely delicious.', translation: 'Eatable items.' },
    { id: 13, word: 'Big', romanized: 'Big', meaning: 'Large in size or scale', example: 'That is a very big house on the hill.', translation: 'Large dimension.' },
    { id: 14, word: 'Small', romanized: 'Small', meaning: 'Little in size or scale', example: 'A small puppy is running in the garden.', translation: 'Little dimension.' },
    { id: 15, word: 'Tomorrow', romanized: 'Tomorrow', meaning: 'The day after today', example: 'We will start working tomorrow.', translation: 'The next upcoming day.' }
  ]
};



const PronunciationPage = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  
  const [vocab, setVocab] = useState(() => WORDS_BY_LANG[JSON.parse(localStorage.getItem('user') || '{}').preferred_language || 'hi'] || WORDS_BY_LANG['hi']);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState(null); // 'great' | 'try-again'
  const [transcript, setTranscript] = useState('');
  
  // Keep track of master status of all 15 words
  const [mastery, setMastery] = useState({}); // { wordId: 'mastered' | 'failed' | 'pending' }

  const recognitionRef = useRef(null);

  useEffect(() => {
    const list = WORDS_BY_LANG[JSON.parse(localStorage.getItem('user') || '{}').preferred_language || 'hi'] || WORDS_BY_LANG['hi'];
    setVocab(list);
    setCurrentIdx(0);
    setResult(null);
    setTranscript('');
    setMastery(list.reduce((acc, word) => {
      acc[word.id] = 'pending';
      return acc;
    }, {}));
  }, [i18n.language]);

  const activeWord = vocab[currentIdx];

  const startRecording = () => {
    setResult(null);
    setTranscript('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = LANG_REC_MAP[JSON.parse(localStorage.getItem('user') || '{}').preferred_language || 'hi'] || 'hi-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;

    recognition.onresult = (event) => {
      const allTranscripts = Array.from(event.results[0]).map(r => r.transcript.toLowerCase().trim());
      setTranscript(allTranscripts[0]);
      
      const expectedTarget = activeWord.word.toLowerCase().trim();
      const expectedRoman = activeWord.romanized.toLowerCase().trim();
      
      // Allow match if it contains expected native word, roman spelling, or matches close equivalents
      const matched = allTranscripts.some(t => 
        t.includes(expectedTarget) || 
        t.includes(expectedRoman) ||
        expectedTarget.includes(t) ||
        expectedRoman.includes(t)
      );

      if (matched) {
        setResult('great');
        setMastery(prev => ({ ...prev, [activeWord.id]: 'mastered' }));
      } else {
        setResult('try-again');
        setMastery(prev => ({ ...prev, [activeWord.id]: 'failed' }));
      }
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setResult('try-again');
      setMastery(prev => ({ ...prev, [activeWord.id]: 'failed' }));
    };

    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const speak = () => {
    ttsSpeak(activeWord.word, { rate: 0.75 });
  };

  const selectWord = (index) => {
    setCurrentIdx(index);
    setResult(null);
    setTranscript('');
  };

  const handleNextWord = () => {
    if (currentIdx < vocab.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setResult(null);
      setTranscript('');
    }
  };

  const masteredCount = Object.values(mastery).filter(v => v === 'mastered').length;

  const PALETTES = [
    { bg: 'linear-gradient(135deg, #fdf2f8, #fbcfe8)', border: '#fbcfe8', accent: '#be185d', badge: '#ec4899', exampleBg: '#fdf2f8', micBg: '#ec4899', textSec: '#be185d' },
    { bg: 'linear-gradient(135deg, #eff6ff, #bfdbfe)', border: '#bfdbfe', accent: '#1e40af', badge: '#3b82f6', exampleBg: '#eff6ff', micBg: '#3b82f6', textSec: '#1e40af' },
    { bg: 'linear-gradient(135deg, #ecfdf5, #a7f3d0)', border: '#a7f3d0', accent: '#065f46', badge: '#10b981', exampleBg: '#ecfdf5', micBg: '#10b981', textSec: '#065f46' },
    { bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: '#fde68a', accent: '#92400e', badge: '#f59e0b', exampleBg: '#fef3c7', micBg: '#f59e0b', textSec: '#92400e' },
    { bg: 'linear-gradient(135deg, #ede9fe, #c4b5fd)', border: '#c4b5fd', accent: '#5b21b6', badge: '#8b5cf6', exampleBg: '#ede9fe', micBg: '#8b5cf6', textSec: '#5b21b6' },
    { bg: 'linear-gradient(135deg, #fce7f3, #f9a8d4)', border: '#f9a8d4', accent: '#9d174d', badge: '#ec4899', exampleBg: '#fce7f3', micBg: '#ec4899', textSec: '#9d174d' },
    { bg: 'linear-gradient(135deg, #ecfeff, #a5f3fc)', border: '#a5f3fc', accent: '#155e75', badge: '#06b6d4', exampleBg: '#ecfeff', micBg: '#06b6d4', textSec: '#155e75' },
    { bg: 'linear-gradient(135deg, #fff7ed, #fed7aa)', border: '#fed7aa', accent: '#9a3412', badge: '#f97316', exampleBg: '#fff7ed', micBg: '#f97316', textSec: '#9a3412' },
    { bg: 'linear-gradient(135deg, #fef2f2, #fecaca)', border: '#fecaca', accent: '#991b1b', badge: '#ef4444', exampleBg: '#fef2f2', micBg: '#ef4444', textSec: '#991b1b' },
    { bg: 'linear-gradient(135deg, #f0fdf4, #bbf7d0)', border: '#bbf7d0', accent: '#166534', badge: '#22c55e', exampleBg: '#f0fdf4', micBg: '#22c55e', textSec: '#166534' },
  ];

  const pal = PALETTES[currentIdx % PALETTES.length];

  return (
    <div className="flashcards-container" style={{ background: '#f1f5f9', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <div className="flashcards-header sticky-header">
        <button className="icon-btn" onClick={() => navigate('/activities')}>
          <ArrowLeft size={24} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Award size={20} color="#eab308" />
          <span style={{ fontWeight: 700, color: '#334155' }}>
            Mastered: {masteredCount} / {vocab.length}
          </span>
        </div>
        <h2 style={{ fontSize: '1.2rem', margin: 0, color: '#1e293b', fontWeight: 800 }}>🎙️ Pronunciation Lab</h2>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: 'calc(100vh - 72px)' }}>
        
        {/* Left Column: Word Sidebar Selector */}
        <div style={{ width: '300px', borderRight: '1px solid #e2e8f0', background: 'white', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9' }}>
            <h4 style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Word List</h4>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
            {vocab.map((item, idx) => {
              const status = mastery[item.id] || 'pending';
              const isSelected = idx === currentIdx;
              const itemPal = PALETTES[idx % PALETTES.length];

              let statusColor = '#94a3b8'; // Pending
              let statusText = '●';
              if (status === 'mastered') {
                statusColor = '#10b981';
                statusText = '✓';
              } else if (status === 'failed') {
                statusColor = '#ef4444';
                statusText = '×';
              }

              return (
                <div 
                  key={item.id} 
                  onClick={() => selectWord(idx)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem 1rem', borderRadius: '12px', cursor: 'pointer', marginBottom: '0.4rem', transition: 'all 0.2s', background: isSelected ? itemPal.exampleBg : 'transparent', border: isSelected ? `1px solid ${itemPal.border}` : '1px solid transparent' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? itemPal.accent : '#94a3b8', width: '20px' }}>
                      {idx + 1}
                    </span>
                    <div>
                      <div style={{ fontWeight: 800, color: isSelected ? itemPal.accent : '#1e293b', fontSize: '1.05rem' }}>
                        {item.word}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {item.romanized}
                      </div>
                    </div>
                  </div>
                  <span style={{ color: statusColor, fontWeight: 900, fontSize: '1.2rem', width: '24px', textAlign: 'center' }}>
                    {statusText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Main Practice Station */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f1f5f9', padding: '1rem', overflowY: 'auto', height: '100%' }}>
          <div style={{ background: pal.bg, borderRadius: '24px', padding: '2rem 2.5rem', width: '100%', maxWidth: '540px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)', border: `2px solid ${pal.border}`, textAlign: 'center', position: 'relative', boxSizing: 'border-box', transition: 'background 0.4s ease, border-color 0.4s ease', margin: 'auto' }}>
            
            {/* Header Badge info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ background: pal.badge, color: 'white', fontWeight: 700, padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.8rem' }}>
                Word {currentIdx + 1} of {vocab.length}
              </span>
              <span style={{ fontSize: '0.85rem', color: pal.accent, fontWeight: 700 }}>Phonics Lab</span>
            </div>

            {/* Pronunciation Target Area */}
            <p style={{ color: '#475569', margin: '0 0 0.2rem 0', fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700 }}>Practice Pronouncing</p>
            <h1 style={{ fontSize: '3.6rem', color: pal.accent, margin: '0 0 0.2rem 0', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {activeWord.word}
            </h1>
            <p style={{ color: pal.textSec, fontSize: '1.3rem', fontWeight: 600, margin: '0 0 0.3rem 0' }}>
              "{activeWord.romanized}"
            </p>
            <p style={{ color: '#475569', fontSize: '0.95rem', margin: '0 0 1.2rem 0', fontStyle: 'italic' }}>
              meaning: {activeWord.meaning}
            </p>

            {/* Speak Aloud synthesis trigger */}
            <button 
              onClick={speak} 
              style={{ background: 'white', border: `1px solid ${pal.border}`, color: '#1e293b', padding: '0.5rem 1.2rem', borderRadius: '20px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
            >
              <Volume2 size={16} color={pal.accent} /> Hear Native Speaker
            </button>

            {/* Interactive Phonics Sentence Example Use Case */}
            <div style={{ background: 'white', border: `1px solid ${pal.border}`, borderRadius: '16px', padding: '1.2rem', marginBottom: '1.5rem', textAlign: 'left', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
              <h5 style={{ margin: '0 0 0.5rem 0', color: pal.accent, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Example Use Case:</h5>
              <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.4rem 0', lineHeight: 1.4 }}>
                {activeWord.example}
              </p>
              <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, fontWeight: 500 }}>
                💡 ({activeWord.translation})
              </p>
            </div>

            {/* Microphone Action Zone */}
            <div style={{ margin: '1.5rem 0 1rem 0' }}>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                style={{ width: 80, height: 80, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', background: isRecording ? '#ef4444' : pal.micBg, boxShadow: isRecording ? '0 0 0 10px rgba(239,68,68,0.2)' : `0 4px 18px rgba(0,0,0,0.1)`, transition: 'all 0.3s' }}
              >
                {isRecording ? <MicOff size={30} color="white" /> : <Mic size={30} color="white" />}
              </button>
              <p style={{ color: isRecording ? '#ef4444' : '#475569', marginTop: '0.8rem', fontSize: '0.85rem', fontWeight: 700 }}>
                {isRecording ? 'Listening... Speak Word clearly!' : 'Tap Mic to Speak Word'}
              </p>
            </div>

            {/* Realtime User Transcript */}
            {transcript && (
              <p style={{ color: '#475569', fontSize: '0.85rem', margin: '0.5rem 0' }}>
                You said: <strong style={{ color: '#1e293b' }}>"{transcript}"</strong>
              </p>
            )}

            {/* Feedback Alert Section */}
            {result && (
              <div 
                style={{ marginTop: '1.2rem', padding: '1rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', background: result === 'great' ? '#dcfce7' : '#fee2e2', border: `1px solid ${result === 'great' ? '#bbf7d0' : '#fecaca'}`, animation: 'fadeIn 0.3s ease' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {result === 'great' 
                    ? <CheckCircle size={20} color="#10b981" /> 
                    : <AlertCircle size={20} color="#ef4444" />}
                  <span style={{ color: result === 'great' ? '#14532d' : '#7f1d1d', fontWeight: 800, fontSize: '0.95rem' }}>
                    {result === 'great' ? '🎉 Excellent! Native Pronunciation!' : '🔄 Oops! Try pronouncing it again.'}
                  </span>
                </div>
                {result === 'great' && currentIdx < vocab.length - 1 && (
                  <button 
                    onClick={handleNextWord} 
                    style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}
                  >
                    Practice Next Word →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PronunciationPage;
