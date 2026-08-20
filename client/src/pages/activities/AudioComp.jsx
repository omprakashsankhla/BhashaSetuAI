import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Star, Play, Pause, Eye, EyeOff, CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react';
import './AudioComp.css';

const AUDIO_COMP_LANG_DATA = {
  hi: {
    title: "ऑडियो बोध (Audio Comprehension)",
    desc: "ऑडियो क्लिप सुनें और समझ का परीक्षण करने के लिए दिए गए 5 प्रश्नों के उत्तर दें।",
    win: "अद्भुत! आपने सभी ऑडियो बोध अभ्यासों को हल कर लिया है।",
    play: "ऑडियो सुनें",
    pause: "रोकें",
    showTrans: "स्क्रिप्ट देखें",
    hideTrans: "स्क्रिप्ट छिपाएं",
    submit: "उत्तर जांचें",
    next: "अगला अभ्यास",
    restart: "पुनः प्रयास करें",
    stats: "स्कोर सारांश",
    items: [
      {
        id: 1,
        title: "अस्पताल में डॉक्टर से परामर्श",
        transcript: "मरीज: डॉक्टर साहब, मुझे कल रात से तेज बुखार और सिरदर्द है।\nडॉक्टर: ठीक है, अपना तापमान चेक कराइए। आपको 102 डिग्री बुखार है। मैं दवा लिख रहा हूँ, इसे दिन में तीन बार भोजन के बाद लें और तीन दिन आराम करें।",
        questions: [
          { question: "मरीज को बुखार कब से है?", options: ["आज सुबह से", "कल रात से", "दो दिनों से", "एक हफ्ते से"], answer: "कल रात से" },
          { question: "थर्मामीटर पर तापमान कितना था?", options: ["99 डिग्री", "100 डिग्री", "102 डिग्री", "104 डिग्री"], answer: "102 डिग्री" },
          { question: "दवा दिन में कितनी बार लेनी है?", options: ["एक बार", "दो बार", "तीन बार", "चार बार"], answer: "तीन बार" },
          { question: "दवा कब खानी है?", options: ["खाली पेट", "सोने से पहले", "भोजन के बाद", "भोजन से पहले"], answer: "भोजन के बाद" },
          { question: "डॉक्टर ने कितने दिन आराम करने की सलाह दी?", options: ["1 दिन", "2 दिन", "3 दिन", "5 दिन"], answer: "3 दिन" }
        ]
      },
      {
        id: 2,
        title: "रेलवे स्टेशन पर पूछताछ",
        transcript: "यात्री: क्षमा करें, शताब्दी एक्सप्रेस किस प्लेटफॉर्म पर आएगी?\nपूछताछ बाबू: शताब्दी एक्सप्रेस प्लेटफॉर्म नंबर 3 पर आएगी। यह ट्रेन अपने निर्धारित समय से 20 मिनट की देरी से चल रही है। यह सुबह 10:30 बजे पहुंचेगी।",
        questions: [
          { question: "यात्री किस ट्रेन के बारे में पूछ रहा है?", options: ["राजधानी एक्सप्रेस", "शताब्दी एक्सप्रेस", "पैसेंजर ट्रेन", "लोकल ट्रेन"], answer: "शताब्दी एक्सप्रेस" },
          { question: "ट्रेन किस प्लेटफॉर्म नंबर पर आएगी?", options: ["प्लेटफॉर्म 1", "प्लेटफॉर्म 2", "प्लेटफॉर्म 3", "प्लेटफॉर्म 4"], answer: "प्लेटफॉर्म 3" },
          { question: "ट्रेन कितने मिनट की देरी से चल रही है?", options: ["10 मिनट", "20 मिनट", "30 मिनट", "कोई देरी नहीं"], answer: "20 मिनट" },
          { question: "ट्रेन के पहुंचने का नया समय क्या है?", options: ["सुबह 10:00 बजे", "सुबह 10:10 बजे", "सुबह 10:30 बजे", "सुबह 11:00 बजे"], answer: "सुबह 10:30 बजे" },
          { question: "यात्री किससे बात कर रहा है?", options: ["कंडक्टर", "ड्राइवर", "पूछताछ बाबू", "कुली"], answer: "पूछताछ बाबू" }
        ]
      },
      {
        id: 3,
        title: "बैंक खाता जमा समस्या",
        transcript: "ग्राहक: नमस्ते मैनेजर साहब, मैंने सुबह मशीन से ₹5,000 जमा किए थे, लेकिन मेरे खाते में अभी तक पैसा क्रेडिट नहीं हुआ है।\nमैनेजर: कृपया मुझे अपनी जमा रसीद और खाता संख्या दीजिए। मैं सिस्टम में चेक करता हूँ। आपका पैसा शाम 5:00 बजे तक जमा हो जाएगा।",
        questions: [
          { question: "ग्राहक ने कितनी राशि जमा की थी?", options: ["₹1,000", ["₹2,000"], "₹5,000", "₹10,000"], answer: "₹5,000" },
          { question: "पैसा जमा करने के लिए किस साधन का उपयोग किया गया था?", options: ["बैंक चेक", "मशीन", "कैशियर काउंटर", "मोबाइल ऐप"], answer: "मशीन" },
          { question: "खाते में पैसा कब तक क्रेडिट होगा?", options: ["तुरंत", "दोपहर 12:00 बजे", "शाम 5:00 बजे", "कल सुबह"], answer: "शाम 5:00 बजे" },
          { question: "मैनेजर ने ग्राहक से क्या मांगा?", options: ["पासबुक", "चेक बुक", "जमा रसीद", "आधार कार्ड"], answer: "जमा रसीद" },
          { question: "ग्राहक किससे शिकायत कर रहा है?", options: ["कैशियर", "गार्ड", "मैनेजर", "अन्य ग्राहक"], answer: "मैनेजर" }
        ]
      },
      {
        id: 4,
        title: "चाय की दुकान पर बातचीत",
        transcript: "रमेश: भैया, दो कप कड़क मसाला चाय बनाना और शक्कर थोड़ी कम रखना।\nदुकानदार: ठीक है रमेश भाई, अभी पांच मिनट में गरमा-गरम चाय लाता हूँ। साथ में कुछ समोसा या बिस्कुट भी लेंगे क्या?\nरमेश: नहीं भैया, बस दो बिस्कुट के पैकेट दे दो।",
        questions: [
          { question: "रमेश ने कितनी चाय का ऑर्डर दिया?", options: ["एक कप", "दो कप", "तीन कप", "चार कप"], answer: "दो कप" },
          { question: "चाय किस प्रकार की होनी चाहिए?", options: ["मीठी चाय", "कड़क मसाला चाय", "बिना चीनी की चाय", "दूध के बिना"], answer: "कड़क मसाला चाय" },
          { question: "दुकानदार चाय तैयार करने में कितना समय लेगा?", options: ["2 मिनट", "5 मिनट", "10 मिनट", "15 मिनट"], answer: "5 मिनट" },
          { question: "रमेश ने चाय में क्या कम रखने को कहा?", options: ["दूध", "अदरक", "शक्कर", "पानी"], answer: "शक्कर" },
          { question: "चाय के साथ रमेश ने खाने के लिए क्या लिया?", options: ["समोसा", "बिस्कुट", "नमकीन", "कुछ नहीं"], answer: "बिस्कुट" }
        ]
      },
      {
        id: 5,
        title: "मोबाइल रिचार्ज दुकान",
        transcript: "ग्राहक: मुझे अपने फोन में 28 दिनों का इंटरनेट पैक डलवाना है। सबसे अच्छा प्लान कौन सा है?\nदुकानदार: हमारे पास ₹299 का प्लान है, जिसमें आपको रोज़ 1.5 जीबी इंटरनेट डेटा और अनलिमिटेड कॉलिंग मिलेगी। इसके लिए मुझे अपना मोबाइल नंबर बताइए।",
        questions: [
          { question: "ग्राहक को कितने दिनों की वैधता का पैक चाहिए?", options: ["14 दिन", "28 दिन", "56 दिन", "84 दिन"], answer: "28 दिन" },
          { question: "प्लान की कीमत कितनी है?", options: ["₹199", "₹299", "₹399", "₹499"], answer: "₹299" },
          { question: "इस प्लान में प्रतिदिन कितना डेटा मिलता है?", options: ["1 जीबी", "1.5 जीबी", "2 जीबी", "3 जीबी"], answer: "1.5 जीबी" },
          { question: "कॉलिंग की क्या सीमा है?", options: ["100 मिनट प्रतिदिन", "1000 मिनट", "अनलिमिटेड", "कोई कॉलिंग नहीं"], answer: "अनलिमिटेड" },
          { question: "रिचार्ज करने के लिए दुकानदार ने क्या मांगा?", options: ["ईमेल आईडी", "मोबाइल नंबर", "आधार कार्ड", "ओटीपी"], answer: "मोबाइल नंबर" }
        ]
      },
      {
        id: 6,
        title: "सब्जी मंडी में मोल-भाव",
        transcript: "संगीता: भैया, टमाटर क्या भाव दिए हैं?\nदुकानदार: बहनजी, टमाटर ₹80 किलो हैं। बहुत ताजे हैं।\nसंगीता: ₹80 बहुत महँगे हैं! ठीक भाव लगाओ, मैं दो किलो लूँगी।\nदुकानदार: अच्छा ठीक है, आप ₹70 के भाव से ले लीजिए।",
        questions: [
          { question: "संगीता किस सब्जी का दाम पूछ रही है?", options: ["आलू", "प्याज", "टमाटर", "गोभी"], answer: "टमाटर" },
          { question: "शुरुआत में टमाटर का दाम प्रति किलो क्या था?", options: ["₹40", "₹60", "₹80", "₹100"], answer: "₹80" },
          { question: "संगीता कितने किलो टमाटर खरीदना चाहती है?", options: ["1 किलो", "2 किलो", "3 किलो", "5 किलो"], answer: "25 किलो" },
          { question: "मोल-भाव के बाद तय हुआ नया भाव क्या है?", options: ["₹50", "₹60", "₹70", "₹75"], answer: "₹70" },
          { question: "दुकानदार ने टमाटरों की क्या विशेषता बताई?", options: ["छोटे हैं", "ताजे हैं", "सस्ते हैं", "लाल हैं"], answer: "ताजे हैं" }
        ]
      },
      {
        id: 7,
        title: "राहगीर से रास्ता पूछना",
        transcript: "राकेश: नमस्ते भाई साहब, क्या आप मुझे बताएंगे कि बस स्टैंड यहाँ से कितनी दूर है?\nराहगीर: हाँ, बस स्टैंड यहाँ से लगभग आधा किलोमीटर दूर है। आप इस सड़क पर सीधे जाइए, फिर अगले चौराहे से बाएं मुड़ जाइए। बस स्टैंड सामने ही है।",
        questions: [
          { question: "राकेश किस जगह का रास्ता पूछ रहा है?", options: ["रेलवे स्टेशन", "बस स्टैंड", "बाजार", "अस्पताल"], answer: "बस स्टैंड" },
          { question: "बस स्टैंड यहाँ से कितनी दूर है?", options: ["1 किलोमीटर", "आधा किलोमीटर", "2 किलोमीटर", "बहुत दूर"], answer: "आधा किलोमीटर" },
          { question: "राहगीर ने किस दिशा में सीधे जाने को कहा?", options: ["दाएं जाने को", "बाएं जाने को", "सड़क पर सीधे", "पीछे मुड़ने को"], answer: "सड़क पर सीधे" },
          { question: "चौराहे से किस ओर मुड़ना है?", options: ["दाएं", "बाएं", "यू-टर्न", "सीधे जाना है"], answer: "बाएं" },
          { question: "राकेश ने बातचीत की शुरुआत कैसे की?", options: ["नमस्ते कहकर", "हेलो कहकर", "सीधा सवाल पूछकर", "बिना बोले"], answer: "नमस्ते कहकर" }
        ]
      },
      {
        id: 8,
        title: "साइबर फ्रॉड से बचाव",
        transcript: "अमित: बैंक कस्टमर केयर से बोल रहा हूँ, आपका खाता बंद होने वाला है। तुरंत अपना पिन और ओटीपी बताइए।\nसुरेश: मैं अपना ओटीपी कभी किसी को नहीं बताता। हमारी बैंक शाखा ने कहा है कि कोई भी बैंक अधिकारी फोन पर गोपनीय पासवर्ड नहीं मांगता। मैं अभी पुलिस में रिपोर्ट करूँगा।",
        questions: [
          { question: "फोन करने वाले ने खुद को कहाँ का कर्मचारी बताया?", options: ["बिजली विभाग", "पुलिस स्टेशन", "बैंक कस्टमर केयर", "लॉटरी ऑफिस"], answer: "बैंक कस्टमर केयर" },
          { question: "कॉलर सुरेश से क्या जानकारी मांग रहा था?", options: ["नाम और पता", "पिन और ओटीपी", "खाता संख्या", "ईमेल आईडी"], answer: "पिन और ओटीपी" },
          { question: "सुरेश ने कॉलर को क्या उत्तर दिया?", options: ["ओटीपी बता दिया", "पासवर्ड बदल दिया", "ओटीपी बताने से मना किया", "फोन काट दिया"], answer: "ओटीपी बताने से मना किया" },
          { question: "बैंक के अनुसार अधिकारियों को फोन पर क्या नहीं मांगना चाहिए?", options: ["नाम", "खाता संख्या", "गोपनीय पासवर्ड", "मोबाइल नंबर"], answer: "गोपनीय पासवर्ड" },
          { question: "सुरेश ने फोन रखने के बाद क्या करने की बात कही?", options: ["बैंक जाने की", "पुलिस में रिपोर्ट करने की", "पैसे निकालने की", "घर जाने की"], answer: "पुलिस में रिपोर्ट करने की" }
        ]
      }
    ]
  },
  en: {
    title: "Audio Comprehension",
    desc: "Listen to the audio clip and answer 5 questions to test your listening comprehension.",
    win: "Awesome! You solved all audio comprehension exercises.",
    play: "Play Audio",
    pause: "Pause",
    showTrans: "Show Transcript",
    hideTrans: "Hide Transcript",
    submit: "Check Answers",
    next: "Next Exercise",
    restart: "Restart Session",
    stats: "Score Summary",
    items: [
      {
        id: 1,
        title: "Doctor Consultation",
        transcript: "Patient: Doctor, I have had a high fever and headache since last night.\nDoctor: Okay, let me check your temperature. It is 102 degrees. I am prescribing some medicine, take it 3 times a day after meals, and rest for three days.",
        questions: [
          { question: "Since when has the patient had a fever?", options: ["This morning", "Last night", "Two days ago", "A week ago"], answer: "Last night" },
          { question: "What was the temperature reading?", options: ["99 degrees", "100 degrees", "102 degrees", "104 degrees"], answer: "102 degrees" },
          { question: "How many times a day should the medicine be taken?", options: ["Once", "Twice", "Three times", "Four times"], answer: "Three times" },
          { question: "When should the medicine be consumed?", options: ["Empty stomach", "Before sleeping", "After meals", "Before meals"], answer: "After meals" },
          { question: "How many days of rest did the doctor prescribe?", options: ["1 day", "2 days", "3 days", "5 days"], answer: "3 days" }
        ]
      },
      {
        id: 2,
        title: "Railway Inquiry",
        transcript: "Passenger: Excuse me, which platform will the Shatabdi Express arrive at?\nClerk: The Shatabdi Express will arrive on Platform 3. The train is delayed by 20 minutes and is expected at 10:30 AM.",
        questions: [
          { question: "Which train is the passenger asking about?", options: ["Rajdhani Express", "Shatabdi Express", "Passenger Train", "Local Train"], answer: "Shatabdi Express" },
          { question: "On which platform will the train arrive?", options: ["Platform 1", "Platform 2", "Platform 3", "Platform 4"], answer: "Platform 3" },
          { question: "By how many minutes is the train delayed?", options: ["10 mins", "20 mins", "30 mins", "No delay"], answer: "20 minutes" },
          { question: "What is the new arrival time?", options: ["10:00 AM", "10:10 AM", "10:30 AM", "11:00 AM"], answer: "10:30 AM" },
          { question: "Who is the passenger speaking to?", options: ["Conductor", "Driver", "Inquiry Clerk", "Porter"], answer: "Inquiry Clerk" }
        ]
      },
      {
        id: 3,
        title: "Bank deposit issue",
        transcript: "Customer: Hello manager, I deposited ₹5,000 cash at the kiosk machine this morning, but the amount is not showing in my account.\nManager: Please give me your transaction receipt and account number. I will trace it. It will credit by 5:00 PM.",
        questions: [
          { question: "How much money did the customer deposit?", options: ["₹1,000", "₹2,000", "₹5,000", "₹10,000"], answer: "₹5,000" },
          { question: "Where did they deposit the cash?", options: ["Cheque book", "Kiosk machine", "Cashier desk", "Mobile app"], answer: "Kiosk machine" },
          { question: "When will the account be credited?", options: ["Immediately", "12:00 PM", "5:00 PM", "Tomorrow morning"], answer: "5:00 PM" },
          { question: "What document did the manager request?", options: ["Passbook", "Cheque booklet", "Transaction receipt", "ID card"], answer: "Transaction receipt" },
          { question: "Who did the customer complain to?", options: ["Cashier", "Guard", "Manager", "Another user"], answer: "Manager" }
        ]
      },
      {
        id: 4,
        title: "At the Tea Stall",
        transcript: "Ramesh: Brother, make two cups of strong masala tea and put less sugar, please.\nVendor: Sure Ramesh, it will take five minutes. Would you like some samosas or biscuits with it?\nRamesh: No thanks, just two packets of biscuits.",
        questions: [
          { question: "How many cups of tea did Ramesh order?", options: ["One", "Two", "Three", "Four"], answer: "Two" },
          { question: "What style of tea did he request?", options: ["Sweet tea", "Strong masala tea", "Sugarless tea", "Black tea"], answer: "Strong masala tea" },
          { question: "How long will the vendor take to prepare the tea?", options: ["2 mins", "5 mins", "10 mins", "15 mins"], answer: "5 minutes" },
          { question: "What did Ramesh want less of?", options: ["Milk", "Ginger", "Sugar", "Water"], answer: "Sugar" },
          { question: "What snack did Ramesh purchase?", options: ["Samosas", "Biscuits", "Chips", "Nothing"], answer: "Biscuits" }
        ]
      },
      {
        id: 5,
        title: "Mobile Shop Recharge",
        transcript: "Customer: I want a 28-day data pack recharge. What is your best plan?\nVendor: We have the ₹299 plan. It gives you 1.5 GB daily internet data and unlimited calls. I just need your number.",
        questions: [
          { question: "What plan validity does the customer want?", options: ["14 days", "28 days", "56 days", "84 days"], answer: "28 days" },
          { question: "How much does the plan cost?", options: ["₹199", "₹299", "₹399", "₹499"], answer: "₹299" },
          { question: "How much data is provided daily?", options: ["1 GB", "1.5 GB", "2 GB", "3 GB"], answer: "1.5 GB" },
          { question: "What is the voice calling limit?", options: ["100 mins a day", "1000 mins", "Unlimited", "No calls"], answer: "Unlimited" },
          { question: "What detail did the vendor request?", options: ["Email ID", "Mobile number", "ID proof", "OTP"], answer: "Mobile number" }
        ]
      },
      {
        id: 6,
        title: "Bargaining at the Market",
        transcript: "Sangeeta: Brother, how much are the tomatoes?\nVendor: Sister, they are ₹80 per kilo. They are very fresh.\nSangeeta: That is expensive! Give me a fair price and I will buy two kilos.\nVendor: Okay, you can have them for ₹70.",
        questions: [
          { question: "Which vegetable is Sangeeta purchasing?", options: ["Potato", "Onion", "Tomato", "Cabbage"], answer: "Tomato" },
          { question: "What was the initial price per kilo?", options: ["₹40", "₹60", "₹80", "₹100"], answer: "₹80" },
          { question: "How many kilos does Sangeeta want to buy?", options: ["1 kilo", "2 kilos", "3 kilos", "5 kilos"], answer: "2 kilos" },
          { question: "What is the agreed discounted price?", options: ["₹50", "₹60", "₹70", "₹75"], answer: "₹70" },
          { question: "How did the vendor describe the tomatoes?", options: ["Small", "Fresh", "Cheap", "Imported"], answer: "Fresh" }
        ]
      },
      {
        id: 7,
        title: "Asking for Directions",
        transcript: "Rakesh: Excuse me, could you tell me how far the bus stand is from here?\nResident: Sure, it is about half a kilometer away. Go straight down this road, then turn left at the crossing. The stand is right there.",
        questions: [
          { question: "Where is Rakesh trying to go?", options: ["Railway Station", "Bus Stand", "Market", "Hospital"], answer: "Bus Stand" },
          { question: "How far is the bus stand?", options: ["1 kilometer", "Half a kilometer", "2 kilometers", "Very far"], answer: "Half a kilometer" },
          { question: "In which direction should Rakesh walk first?", options: ["Turn right", "Turn left", "Go straight down the road", "Turn back"], answer: "Go straight down the road" },
          { question: "Which way should he turn at the crossing?", options: ["Right", "Left", "U-turn", "No turn"], answer: "Left" },
          { question: "How did Rakesh politely start the query?", options: ["Saying excuse me", "Shouting", "Asking directly", "Waving"], answer: "Saying excuse me" }
        ]
      },
      {
        id: 8,
        title: "Preventing Cyber Fraud",
        transcript: "Caller: I am calling from bank support. Your account is about to be locked. Please tell me your PIN and OTP immediately.\nSuresh: I never share my OTP. My bank says support clerks never ask for secure passwords. I am reporting this scam.",
        questions: [
          { question: "Where did the caller claim to call from?", options: ["Electricity board", "Police", "Bank support desk", "Lottery house"], answer: "Bank support desk" },
          { question: "What information was the caller asking for?", options: ["Name and address", "PIN and OTP", "Account number", "Email ID"], answer: "PIN and OTP" },
          { question: "What was Suresh response?", options: ["Shared OTP", "Changed password", "Refused to share OTP", "Hung up immediately"], answer: "Refused to share OTP" },
          { question: "What does the bank advise never sharing on calls?", options: ["Full name", "Account numbers", "Secure passwords", "Mobile numbers"], answer: "Secure passwords" },
          { question: "What did Suresh say he would do next?", options: ["Visit branch", "Report the scam", "Withdraw cash", "Block his own card"], answer: "Report the scam" }
        ]
      }
    ]
  }
};

// Map remaining languages to Hindi since they share structure, and specialize Tamil & Telugu
const fallbackLangs = ['mwr', 'bn', 'mr', 'ur'];
fallbackLangs.forEach(lang => {
  AUDIO_COMP_LANG_DATA[lang] = AUDIO_COMP_LANG_DATA['hi'];
});

// Specialize Tamil
AUDIO_COMP_LANG_DATA.ta = {
  title: "ஒலிப் புரிதல் (Audio Comprehension)",
  desc: "ஒலிப் பதிவைக் கேட்டு, உங்கள் புரிதல் திறனை சோதிக்க கேட்கப்படும் 5 வினாக்களுக்கு விடையளிக்கவும்.",
  win: "அருமை! நீங்கள் அனைத்து ஒலிப் புரிதல் பயிற்சிகளையும் முடித்துவிட்டீர்கள்.",
  play: "ஒலியை இயக்கு",
  pause: "நிறுத்து",
  showTrans: "உரையைக் காட்டு",
  hideTrans: "உரையை மறை",
  submit: "விடை காண்க",
  next: "அடுத்த பயிற்சி",
  restart: "மீண்டும் தொடங்குக",
  stats: "மதிப்பெண் விவரம்",
  items: [
    {
      id: 1,
      title: "மருத்துவர் ஆலோசனை",
      transcript: "நோயாளி: டாக்டர், நேற்று இரவில் இருந்து எனக்குக் கடுமையான காய்ச்சலும் தலைவலியும் உள்ளது.\nமருத்துவர்: சரி, உங்கள் வெப்பநிலையைச் சோதிப்போம். 102 டிகிரி காய்ச்சல் உள்ளது. நான் மருந்து எழுதுகிறேன், உணவுக்குப் பின் ஒரு நாளைக்கு மூன்று முறை சாப்பிடுங்கள், மூன்று நாட்கள் ஓய்வெடுங்கள்.",
      questions: [
        { question: "நோயாளிக்கு எப்போதிலிருந்து காய்ச்சல் உள்ளது?", options: ["இன்று காலையிலிருந்து", "நேற்று இரவிலிருந்து", "இரண்டு நாட்களாக", "ஒரு வாரமாக"], answer: "நேற்று இரவிலிருந்து" },
        { question: "உடல் வெப்பநிலை எவ்வளவு காட்டியது?", options: ["99 டிகிரி", "100 டிகிரி", "102 டிகிரி", "104 டிகிரி"], answer: "102 டிகிரி" },
        { question: "மருந்தை ஒரு நாளைக்கு எத்தனை முறை உட்கொள்ள வேண்டும்?", options: ["ஒரு முறை", "இரு முறை", "மூன்று முறை", "நான்கு முறை"], answer: "மூன்று முறை" },
        { question: "மருந்தை எப்போது உட்கொள்ள வேண்டும்?", options: ["வெறும் வயிற்றில்", "தூங்கும் முன்", "உணவுக்குப் பின்", "உணவுக்கு முன்"], answer: "உணவுக்குப் பின்" },
        { question: "மருத்துவர் எத்தனை நாட்கள் ஓய்வெடுக்கச் சொன்னார்?", options: ["1 நாள்", "2 நாட்கள்", "3 நாட்கள்", "5 நாட்கள்"], answer: "3 நாட்கள்" }
      ]
    },
    {
      id: 2,
      title: "இரயில் நிலைய விசாரணை",
      transcript: "பயணী: மன்னிக்கவும், சதாப்தி எக்ஸ்பிரஸ் எந்த நடைமேடைக்கு வரும்?\nவிசாரணை அதிகாரி: சதாப்தி எக்ஸ்பிரஸ் நடைமேடை 3-க்கு வரும். இந்த இரயில் 20 நிமிடங்கள் தாமதமாக வந்து காலை 10:30 மணிக்கு நடைமேடையை அடையும்.",
      questions: [
        { question: "பயணী எந்த இரயில் பற்றி விசாரிக்கிறார்?", options: ["ராஜ்தானி எக்ஸ்பிரஸ்", "சதாப்தி எக்ஸ்பிரஸ்", "பாசஞ்சர் இரயில்", "லோக்கல் இரயில்"], answer: "சதாப்தி எக்ஸ்பிரஸ்" },
        { question: "இரயில் எந்த நடைமேடைக்கு வரும்?", options: ["நடைமேடை 1", "நடைமேடை 2", "நடைமேடை 3", "நடைமேடை 4"], answer: "நடைமேடை 3" },
        { question: "இரயில் எத்தனை நிமிடங்கள் தாமதமாக இயங்குகிறது?", options: ["10 நிமிடங்கள்", "20 நிமிடங்கள்", "30 நிமிடங்கள்", "தாமதம் இல்லை"], answer: "20 நிமிடங்கள்" },
        { question: "இரயில் வரும் புதிய நேரம் என்ன?", options: ["காலை 10:00 மணி", "காலை 10:10 மணி", "காலை 10:30 மணி", "காலை 11:00 மணி"], answer: "காலை 10:30 மணி" },
        { question: "பயணী யாரிடம் பேசுகிறார்?", options: ["நடத்துனர்", "ஓட்டுனர்", "விசாரணை அதிகாரி", "சுமை தூக்குபவர்"], answer: "விசாரணை அதிகாரி" }
      ]
    },
    {
      id: 3,
      title: "வங்கி பணப் பிரச்சனை",
      transcript: "வாடிக்கையாளர்: வணக்கம் மேலாளர் அவர்களே, இன்று காலையில் இயந்திரத்தில் ₹5,000 செலுத்தினேன், ஆனால் இன்னும் என் கணக்கில் வரவு வைக்கப்படவில்லை.\nமேலாளர்: தயவுசெய்து உங்கள் ரசீதையும் கணக்கு எண்ணையும் தாருங்கள். சோதித்துப் பார்க்கிறேன். மாலை 5:00 மணிக்குள் வரவு வைக்கப்படும்.",
      questions: [
        { question: "வாடிக்கையாளர் எவ்வளவு தொகை செலுத்தினார்?", options: ["₹1,000", "₹2,000", "₹5,000", "₹10,000"], answer: "₹5,000" },
        { question: "பணம் செலுத்த எதனைப் பயன்படுத்தினர்?", options: ["காசோலை", "இயந்திரம்", "வங்கி கவுண்டர்", "மொபைல் செயலி"], answer: "இயந்திரம்" },
        { question: "பணம் எப்போது கணக்கில் வரவு வைக்கப்படும்?", options: ["உடனடியாக", "மதியம் 12:00 மணி", "மாலை 5:00 மணி", "நாளை காலை"], answer: "மாலை 5:00 மணி" },
        { question: "மேலாளர் வாடிக்கையாளரிடம் எதனை கேட்டார்?", options: ["சேமிப்பு புத்தகம்", "காசோலை புத்தகம்", "ரசீது", "அடையாள அட்டை"], answer: "ரசீது" },
        { question: "வாடிக்கையாளர் யாரிடம் புகார் செய்கிறார்?", options: ["காசாளர்", "காவலாளி", "மேலாளர்", "மற்றொரு வாடிக்கையாளர்"], answer: "மேலாளர்" }
      ]
    },
    {
      id: 4,
      title: "தேநீர்க் கடையில்",
      transcript: "ரமேஷ்: அண்ணே, இரண்டு கப் மசாலா டீ போடுங்க, சர்க்கரை கொஞ்சம் குறைவாக இருக்கட்டும்.\nகடைக்காரர்: சரிங்க தம்பி, ஐந்து நிமிடத்தில் கொண்டு வருகிறேன். டீயுடன் சமோசா அல்லது பிஸ்கட் வேண்டுமா?\nரமேஷ்: சமோசா வேண்டாம், இரண்டு பிஸ்கட் பாக்கெட் மட்டும் கொடுங்கள்.",
      questions: [
        { question: "ரமேஷ் எத்தனை டீ ஆர்டர் செய்தார்?", options: ["ஒரு கப்", "இரண்டு கப்", "மூன்று கப்", "நான்கு கப்"], answer: "இரண்டு கப்" },
        { question: "என்ன வகையான தேநீர் கேட்டார்?", options: ["சாதாரண டீ", "கடுமையான மசாலா டீ", "சர்க்கரை இல்லாத டீ", "பால் டீ"], answer: "கடுமையான மசாலா டீ" },
        { question: "டீ தயாரிக்க கடைக்காரர் எவ்வளவு நேரம் எடுப்பார்?", options: ["2 நிமிடங்கள்", "5 நிமிடங்கள்", "10 நிமிடங்கள்", "15 நிமிடங்கள்"], answer: "5 நிமிடங்கள்" },
        { question: "ரமேஷ் எதனை குறைவாகப் போடச் சொன்னார்?", options: ["பால்", "இஞ்சி", "சர்க்கரை", "தண்ணீர்"], answer: "சர்க்கரை" },
        { question: "டீயுடன் ரமேஷ் வாங்கிய தின்பண்டம் எது?", options: ["சமோசா", "பிஸ்கட்", "சிப்ஸ்", "ஒன்றுமில்லை"], answer: "பிஸ்கட்" }
      ]
    },
    {
      id: 5,
      title: "மொபைல் ரீசார்ஜ் கடை",
      transcript: "வாடிக்கையாளர்: எனது மொபைலுக்கு 28 நாட்கள் இணைய பேக் போட வேண்டும். சிறந்த திட்டம் எது?\nகடைக்காரர்: ₹299 திட்டம் உள்ளது. இதில் தினமும் 1.5 ஜிபி டேட்டாவும் வரம்பற்ற அழைப்புகளும் கிடைக்கும். உங்கள் மொபைல் எண்ணைக் கூறுங்கள்.",
      questions: [
        { question: "வாடிக்கையாளருக்கு எத்தனை நாட்களுக்கான திட்டம் வேண்டும்?", options: ["14 நாட்கள்", "28 நாட்கள்", "56 நாட்கள்", "84 நாட்கள்"], answer: "28 நாட்கள்" },
        { question: "திட்டத்தின் விலை எவ்வளவு?", options: ["₹199", "₹299", "₹399", "₹499"], answer: "₹299" },
        { question: "இந்த திட்டத்தில் தினமும் எவ்வளவு இணைய டேட்டா கிடைக்கும்?", options: ["1 ஜிபி", "1.5 ஜிபி", "2 ஜிபி", "3 ஜிபி"], answer: "1.5 ஜிபி" },
        { question: "அழைப்புகளின் வரம்பு என்ன?", options: ["தினமும் 100 நிமிடம்", "1000 நிமிடங்கள்", "வரம்பற்றது", "அழைப்புகள் இல்லை"], answer: "வரம்பற்றது" },
        { question: "ரீசார்ஜ் செய்ய கடைக்காரர் எதனைக் கேட்டார்?", options: ["மின்னஞ்சல்", "மொபைல் எண்", "ஆதார் கார்டு", "ஓடிபி"], answer: "மொபைல் எண்" }
      ]
    },
    {
      id: 6,
      title: "சந்தையில் பேரம் பேசுதல்",
      transcript: "சங்கீதா: அண்ணே, தக்காளி கிலோ என்ன விலை?\nகடைக்காரர்: தக்காளி கிலோ ₹80 அம்மா, மிகவும் பிரஷ்ஷாக உள்ளது.\nசங்கீதா: ₹80 மிகவும் அதிகம்! சரியான விலை சொல்லுங்கள், இரண்டு கிலோ வாங்குகிறேன்.\nகடைக்காரர்: சரிங்கம்மா, கிலோ ₹70 வீதம் எடுத்துக்கொள்ளுங்கள்.",
      questions: [
        { question: "சங்கீதா எந்தக் காய்கறியின் விலை கேட்கிறார்?", options: ["உருளைக்கிழங்கு", "வெங்காயம்", "தக்காளி", "கோஸ்"], answer: "தக்காளி" },
        { question: "முதலில் தக்காளியின் விலை கிலோவுக்கு எவ்வளவு?", options: ["₹40", "₹60", "₹80", "₹100"], answer: "₹80" },
        { question: "சங்கீதா எத்தனை கிலோ வாங்க விரும்புகிறார்?", options: ["1 கிலோ", "2 கிலோ", "3 கிலோ", "5 கிலோ"], answer: "2 கிலோ" },
        { question: "பேரம் பேசிய பிறகு முடிவு செய்யப்பட்ட புதிய விலை என்ன?", options: ["₹50", "₹60", "₹70", "₹75"], answer: "₹70" },
        { question: "கடைக்காரர் தக்காளியின் என்ன சிறப்பைக் கூறினார்?", options: ["சிறியது", "பிரஷ்ஷானது", "மலிவானது", "சிவப்பானது"], answer: "பிரஷ்ஷானது" }
      ]
    },
    {
      id: 7,
      title: "வழி கேட்டல்",
      transcript: "ராகேஷ்: வணக்கம் அண்ணே, பேருந்து நிலையம் இங்கிருந்து எவ்வளவு தூரம் உள்ளது?\nவழிப்போக்கர்: பேருந்து நிலையம் அரை கிலோமீட்டர் தூரத்தில் உள்ளது. இந்தச் சாலையில் நேராகச் சென்று, அடுத்தச் சந்திப்பில் இடதுபுறம் திரும்புங்கள். பேருந்து நிலையம் எதிரிலேயே இருக்கும்.",
      questions: [
        { question: "ராகேஷ் எந்த இடத்திற்கு வழி கேட்கிறார்?", options: ["இரயில் நிலையம்", "பேருந்து நிலையம்", "சந்தை", "மருத்துவமனை"], answer: "பேருந்து நிலையம்" },
        { question: "பேருந்து நிலையம் எவ்வளவு தூரம் உள்ளது?", options: ["1 கிலோமீட்டர்", "அரை கிலோமீட்டர்", "2 கிலோமீட்டர்", "மிகவும் தூரம்"], answer: "அரை கிலோமீட்டர்" },
        { question: "வழிப்போக்கர் முதலில் எந்த திசையில் செல்லச் சொன்னார்?", options: ["வலதுபுறம்", "இடதுபுறம்", "சாலையில் நேராக", "பின்புறம்"], answer: "சாலையில் நேராக" },
        { question: "சந்திப்பில் எந்தப் பக்கம் திரும்ப வேண்டும்?", options: ["வலதுபுறம்", "இடதுபுறம்", "நேராகச் செல்ல வேண்டும்", "திரும்பக் கூடாது"], answer: "இடதுபுறம்" },
        { question: "ராகேஷ் பேச்சை எவ்வாறு தொடங்கினார்?", options: ["வணக்கம் கூறி", "ஹலோ கூறி", "நேரடியாகக் கேட்டு", "பேசாமல்"], answer: "வணக்கம் கூறி" }
      ]
    },
    {
      id: 8,
      title: "இணைய மோசடி பாதுகாப்பு",
      transcript: "அழைப்பவர்: வங்கி வாடிக்கையாளர் சேவையிலிருந்து பேசுகிறேன், உங்கள் கணக்கு முடங்கப்போகிறது. உடனே உங்கள் பின் நம்பரையும் ஓடிபியையும் கூறுங்கள்.\nசுரேஷ்: எனது ஓடிபியை யாருக்கும் கூற மாட்டேன். வங்கியிலிருந்து போனில் ரகசிய எண்களைக் கேட்க மாட்டார்கள் என வங்கி கூறியுள்ளது. நான் போலீசில் புகார் செய்வேன்.",
      questions: [
        { question: "அழைப்பவர் எங்கு வேலை செய்வதாகக் கூறினார்?", options: ["மின்சார வாரியம்", "காவல் நிலையம்", "வங்கி வாடிக்கையாளர் சேவை", "லட்டரி அலுவலகம்"], answer: "வங்கி வாடிக்கையாளர் சேவை" },
        { question: "அழைப்பவர் சுரேஷிடம் என்ன விவரங்களைக் கேட்டார்?", options: ["பெயர் மற்றும் முகவரி", "பின் மற்றும் ஓடிபி", "கணக்கு எண்", "மின்னஞ்சல்"], answer: "பின் மற்றும் ஓடிபி" },
        { question: "சுரேஷின் பதில் என்னவாக இருந்தது?", options: ["ஓடிபியைக் கூறினார்", "கடவுச்சொல்லை மாற்றினார்", "ஓடிபி கூற மறுத்தார்", "போனை வைத்தார்"], answer: "ஓடிபி கூற மறுத்தார்" },
        { question: "வங்கியின் அறிவுரைப்படி எதனை போனில் பகிரக் கூடாது?", options: ["பெயர்", "கணக்கு எண்", "ரகசிய எண்கள் / கடவுச்சொல்", "மொபைல் எண்"], answer: "ரகசிய எண்கள் / கடவுச்சொல்" },
        { question: "சுரேஷ் போனை வைத்த பின் என்ன செய்யப்போவதாகக் கூறினார்?", options: ["வங்கிக்குச் செல்ல", "போலீசில் புகார் செய்ய", "பணம் எடுக்க", "வீட்டிற்குச் செல்ல"], answer: "போலீசில் புகார் செய்ய" }
      ]
    }
  ]
};

// Specialize Telugu
AUDIO_COMP_LANG_DATA.te = {
  title: "ఆడియో గ్రహణ శక్తి (Audio Comprehension)",
  desc: "ఆడియో క్లిప్‌ను వినండి మరియు మీ గ్రహణ శక్తిని పరీక్షించడానికి అడిగిన 5 ప్రశ్నలకు సమాధానం ఇవ్వండి.",
  win: "అద్భుతం! మీరు అన్ని ఆడియో గ్రహణ శక్తి వ్యాయామాలను విజయవంతంగా పూర్తి చేశారు.",
  play: "ఆడియో ప్లే చేయి",
  pause: "ఆపు",
  showTrans: "ట్రాన్స్క్రిప్ట్ చూడు",
  hideTrans: "ట్రాన్స్క్రిప్ట్ దాచు",
  submit: "సమాధానాలు సరిచూడు",
  next: "తదుపరి వ్యాయామం",
  restart: "మళ్లీ ప్రారంభించు",
  stats: "స్కోరు నివేదిక",
  items: [
    {
      id: 1,
      title: "వైద్యుడి సంప్రదింపులు",
      transcript: "రోగి: డాక్టర్ గారు, నిన్న రాత్రి నుండి నాకు తీవ్రమైన జ్వరం మరియు తలనొప్పి ఉంది.\nవైద్యుడు: సరే, మీ ఉష్ణోగ్రతను తనిఖీ చేద్దాం. మీకు 102 డిగ్రీల జ్వరం ఉంది. నేను మందులు రాస్తున్నాను, రోజుకు మూడు సార్లు భోజనం తర్వాత వేసుకోండి, మూడు రోజులు విశ్రాంతి తీసుకోండి.",
      questions: [
        { question: "రోగికి జ్వరం ఎప్పటి నుండి ఉంది?", options: ["ఈ రోజు ఉదయం నుండి", "నిన్న రాత్రి నుండి", "రెండు రోజుల నుండి", "ఒక వారం నుండి"], answer: "నిన్న రాత్రి నుండి" },
        { question: "థర్మామీటర్‌లో ఎంత ఉష్ణోగ్రత చూపించింది?", options: ["99 డిగ్రీలు", "100 డిగ్రీలు", "102 డిగ్రీలు", "104 డిగ్రీలు"], answer: "102 డిగ్రీలు" },
        { question: "మందును రోజుకు ఎన్ని సార్లు వేసుకోవాలి?", options: ["ఒక సారి", "రెండు సార్లు", "మూడు సార్లు", "నాలుగు సార్లు"], answer: "మూడు సార్లు" },
        { question: "మందును ఎప్పుడు వేసుకోవాలి?", options: ["ఖాళీ కడుపుతో", "పడుకునే ముందు", "భోజనం తర్వాత", "భోజనానికి ముందు"], answer: "భోజనం తర్వాత" },
        { question: "వైద్యుడు ఎన్ని రోజుల విశ్రాంతిని సలహా ఇచ్చారు?", options: ["1 రోజు", "2 రోజులు", "3 రోజులు", "5 రోజులు"], answer: "3 రోజులు" }
      ]
    },
    {
      id: 2,
      title: "రైల్వే స్టేషన్ విచారణ",
      transcript: "ప్రయాణీకుడు: క్షమించండి, శతాబ్ది ఎక్స్‌ప్రెస్ ఏ ప్లాట్‌ఫారమ్‌పై వస్తుంది?\nక్లర్క్: శతాబ్ది ఎక్స్‌ప్రెస్ ప్లాట్‌ఫారమ్ నంబర్ 3 పై వస్తుంది. ఈ రైలు 20 నిమిషాలు ఆలస్యంగా నడుస్తోంది, ఉదయం 10:30 గంటలకు చేరుకుంటుంది.",
      questions: [
        { question: "ప్రయాణీకుడు ఏ రైలు గురించి అడుగుతున్నాడు?", options: ["రాజధాని ఎక్స్‌ప్రెస్", "శతాబ్ది ఎక్స్‌ప్రెస్", "ప్యాసింజర్ రైలు", "లోకల్ రైలు"], answer: "శతాబ్ది ఎక్స్‌ప్రెస్" },
        { question: "రైలు ఏ ప్లాట్‌ఫారమ్‌పై వస్తుంది?", options: ["ప్లాట్‌ఫారమ్ 1", "ప్లాట్‌ఫారమ్ 2", "ప్లాట్‌ఫారమ్ 3", "ప్లాట్‌ఫారమ్ 4"], answer: "ప్లాట్‌ఫారమ్ 3" },
        { question: "రైలు ఎన్ని నిమిషాలు ఆలస్యంగా నడుస్తోంది?", options: ["10 నిమిషాలు", "20 నిమిషాలు", "30 నిమిషాలు", "ఆలస్యం లేదు"], answer: "20 నిమిషాలు" },
        { question: "రైలు వచ్చే కొత్త సమయం ఏది?", options: ["ఉదయం 10:00 గంటలకు", "ఉదయం 10:10 గంటలకు", "ఉదయం 10:30 గంటలకు", "ఉదయం 11:00 గంటలకు"], answer: "ఉదయం 10:30 గంటలకు" },
        { question: "ప్రయాణీకుడు ఎవరితో మాట్లాడుతున్నాడు?", options: ["కండక్టర్", "డ్రైవర్", "విచారణ క్లర్క్", "కూలీ"], answer: "విచారణ క్లర్క్" }
      ]
    },
    {
      id: 3,
      title: "బ్యాంక్ డిపాజిట్ సమస్య",
      transcript: "కస్టమర్: నమస్కారం మేనేజర్ గారు, నేను ఈ రోజు ఉదయం మెషీన్ లో ₹5,000 డిపాజిట్ చేసాను, కానీ నా ఖాతాలో ఇంకా జమ కాలేదు.\nమేనేజర్: దయచేసి మీ రశీదు మరియు ఖాతా సంఖ్య ఇవ్వండి. నేను సిస్టమ్ లో తనిఖీ చేస్తాను. సాయంత్రం 5:00 గంటలకల్లా జమ అవుతుంది.",
      questions: [
        { question: "కస్టమర్ ఎంత మొత్తం డిపాజిట్ చేసారు?", options: ["₹1,000", "₹2,000", "₹5,000", "₹10,000"], answer: "₹5,000" },
        { question: "నగదు డిపాజిట్ చేయడానికి దేనిని ఉపయోగించారు?", options: ["బ్యాంక్ చెక్", "మెషీన్", "క్యాషియర్ కౌంటర్", "మొబైల్ యాప్"], answer: "మెషీన్" },
        { question: "ఖాతాలో ఎప్పటికి జమ అవుతుంది?", options: ["వెంటనే", "మధ్యాహ్నం 12:00 గంటలకు", "సాయంత్రం 5:00 గంటలకు", "రేపు ఉదయం"], answer: "సాయంత్రం 5:00 గంటలకు" },
        { question: "మేనేజర్ కస్టమర్ నుండి ఏ పత్రాన్ని కోరారు?", options: ["పాస్ బుక్", "చెక్ బుక్", "డిపాజిట్ రశీదు", "ఐడీ కార్డు"], answer: "డిపాజిట్ రశీదు" },
        { question: "కస్టమర్ ఎవరికి ఫిర్యాదు చేస్తున్నారు?", options: ["క్యాషియర్", "గార్డు", "మేనేజర్", "మరో కస్టమర్"], answer: "మేనేజర్" }
      ]
    },
    {
      id: 4,
      title: "టీ దుకాణం వద్ద సంభాషణ",
      transcript: "రమేష్: అన్నయ్యా, రెండు కప్పుల స్ట్రాంగ్ మసాలా టీ చేయి, పంచదార కొంచెం తక్కువగా వేయి.\nదుకాణదారుడు: సరే రమేష్ గారూ, ఐదు నిమిషాల్లో వేడి టీ తెస్తాను. దాంతో పాటు సమోసా లేదా బిస్కెట్లు ఏమైనా కావాలా?\nరమేష్: సమోసాలు వద్దు, కేవలం రెండు బిస్కెట్ ప్యాకెట్లు ఇవ్వండి.",
      questions: [
        { question: "రమేష్ ఎన్ని టీలు ఆర్డర్ చేసాడు?", options: ["ఒక కప్పు", "రెండు కప్పులు", "మూడు కప్పులు", "నాలుగు కప్పులు"], answer: "రెండు కప్పులు" },
        { question: "ఏ రకమైన టీ అడిగాడు?", options: ["స్వీట్ టీ", "స్ట్రాంగ్ మసాలా టీ", "షుగర్ లేని టీ", "బ్లాక్ టీ"], answer: "స్ట్రాంగ్ మసాలా టీ" },
        { question: "టీ తయారు చేయడానికి దుకాణదారుడు ఎంత సమయం తీసుకుంటాడు?", options: ["2 నిమిషాలు", "5 నిమిషాలు", "10 నిమిషాలు", "15 నిమిషాలు"], answer: "5 నిమిషాలు" },
        { question: "రమేష్ టీలో దేనిని తక్కువగా వేయమన్నాడు?", options: ["పాలు", "అల్లం", "పంచదార", "నీరు"], answer: "పంచదార" },
        { question: "టీతో పాటు రమేష్ ఏ తినుబండారాన్ని కొన్నాడు?", options: ["సమోసా", "బిస్కెట్లు", "చిప్స్", "ఏమీ లేదు"], answer: "బిస్కెట్లు" }
      ]
    },
    {
      id: 5,
      title: "మొబైల్ రీఛార్జ్ దుకాణం",
      transcript: "కస్టమర్: నా ఫోన్‌కు 28 రోజుల ఇంటర్నెట్ ప్యాక్ వేయాలి. మంచి ప్లాన్ ఏది ఉందో చెప్పండి.\nదుకాణదారుడు: మా వద్ద ₹299 ప్లాన్ ఉంది. ఇందులో మీకు రోజుకు 1.5 జీబీ డేటా మరియు అపరిమిత కాల్స్ లభిస్తాయి. మీ మొబైల్ నంబర్ చెప్పండి.",
      questions: [
        { question: "కస్టమర్‌కు ఎన్ని రోజుల ప్లాన్ కావాలి?", options: ["14 రోజులు", "28 రోజులు", "56 రోజులు", "84 రోజులు"], answer: "28 రోజులు" },
        { question: "ప్లాన్ ధర ఎంత?", options: ["₹199", "₹299", "₹399", "₹499"], answer: "₹299" },
        { question: "ఈ ప్లాన్‌లో రోజుకు ఎంత డేటా లభిస్తుంది?", options: ["1 జీబీ", "1.5 జీబీ", "2 జీబీ", "3 జీబీ"], answer: "1.5 జీబీ" },
        { question: "కాలింగ్ పరిమితి ఏమిటి?", options: ["రోజుకు 100 నిమిషాలు", "1000 నిమిషాలు", "అపరిమితం", "కాల్స్ లేవు"], answer: "అపరిమితం" },
        { question: "రీఛార్జ్ చేయడానికి దుకాణదారుడు ఏ వివరాలను అడిగారు?", options: ["ఇమెయిల్ ఐడీ", "మొబైల్ నంబర్", "ఐడీ ప్రూఫ్", "ఓటీపీ"], answer: "మొబైల్ నంబర్" }
      ]
    },
    {
      id: 6,
      title: "మార్కెట్లో బేరసారాలు",
      transcript: "సంగీత: అన్నయ్యా, టమోటాలు కిలో ఎంత ధర?\nదుకాణదారుడు: అమ్మగారూ, టమోటాలు కిలో ₹80. చాలా తాజాగా ఉన్నాయి.\nసంగీత: ₹80 చాలా ఎక్కువ! సరైన ధర చెప్పండి, నేను రెండు కిలోలు తీసుకుంటాను.\nదుకాణదారుడు: సరేనమ్మా, కిలో ₹70 కి తీసుకోండి.",
      questions: [
        { question: "సంగీత ఏ కూరగాయ ధర అడుగుతోంది?", options: ["ఆలూ", "ఉల్లిపాయలు", "టమోటాలు", "క్యాబేజీ"], answer: "టమోటాలు" },
        { question: "మొదట టమోటాల ధర కిలో ఎంత?", options: ["₹40", "₹60", "₹80", "₹100"], answer: "₹80" },
        { question: "సంగీత ఎన్ని కిలోలు కొనాలనుకుంటోంది?", options: ["1 కిలో", "2 కిలోలు", "3 కిలోలు", "5 కిలోలు"], answer: "2 కిలోలు" },
        { question: "బేరసారాల తర్వాత నిర్ణయించిన కొత్త ధర ఎంత?", options: ["₹50", "₹60", "₹70", "₹75"], answer: "₹70" },
        { question: "దుకాణదారుడు టమోటాల గురించి ఏమని చెప్పారు?", options: ["చిన్నగా ఉన్నాయి", "తాజాగా ఉన్నాయి", "చౌకగా ఉన్నాయి", "ఎర్రగా ఉన్నాయి"], answer: "తాజాగా ఉన్నాయి" }
      ]
    },
    {
      id: 7,
      title: "దారి అడగడం",
      transcript: "రాకేశ్: నమస్కారం అండీ, బస్ స్టాండ్ ఇక్కడి నుండి ఎంత దూరంలో ఉంటుంది?\nగైడ్: బస్ స్టాండ్ ఇక్కడి నుండి అర కిలోమీటరు దూరంలో ఉంటుంది. ఈ రోడ్డుపై నేరుగా వెళ్ళండి, తర్వాత కూడలి నుండి ఎడమవైపునకు తిరగండి. బస్ స్టాండ్ ఎదురుగానే ఉంటుంది.",
      questions: [
        { question: "రాకేశ్ ఏ ప్రదేశానికి దారి అడుగుతున్నాడు?", options: ["రైల్వే స్టేషన్", "బస్ స్టాండ్", "మార్కెట్", "ఆసుపత్రి"], answer: "బస్ స్టాండ్" },
        { question: "బస్ స్టాండ్ ఎంత దూరంలో ఉంది?", options: ["1 కిలోమీటరు", "అర కిలోమీటరు", "2 కిలోమీటర్లు", "చాలా దూరం"], answer: "అర కిలోమీటరు" },
        { question: "మొదట ఏ దిశలో వెళ్ళాలని గైడ్ చెప్పారు?", options: ["కుడివైపునకు", "ఎడమవైపునకు", "రోడ్డుపై నేరుగా", "వెనుకకు"], answer: "రోడ్డుపై నేరుగా" },
        { question: "కూడలి నుండి ఏ పక్కకు తిరగాలి?", options: ["కుడివైపు", "ఎడమవైపు", "నేరుగా వెళ్ళాలి", "తిరగకూడదు"], answer: "ఎడమవైపు" },
        { question: "రాకేశ్ సంభాషణను ఎలా ప్రారంభించాడు?", options: ["నమస్కారం చెప్పి", "హలో చెప్పి", "నేరుగా అడిగి", "మాట్లాడకుండా"], answer: "నమస్కారం చెప్పి" }
      ]
    },
    {
      id: 8,
      title: "సైబర్ మోసాల నివారణ",
      transcript: "కాలర్: నేను బ్యాంక్ కస్టమర్ కేర్ నుండి మాట్లాడుతున్నాను. మీ ఖాతా బ్లాక్ కాబోతోంది. వెంటనే మీ పిన్ మరియు ఓటీపీ చెప్పండి.\nసురేశ్: నా ఓటీపీని ఎవరికీ చెప్పను. బ్యాంక్ అధికారులు ఫోన్ లో పిన్ నంబర్లు అడగరని మా బ్యాంక్ చెప్పింది. నేను పోలీసులకు ఫిర్యాదు చేస్తాను.",
      questions: [
        { question: "ఫోన్ చేసిన వ్యక్తి ఎక్కడ పని చేస్తున్నట్లు చెప్పాడు?", options: ["విద్యుత్ శాఖ", "పోలీస్ స్టేషన్", "బ్యాంక్ కస్టమర్ కేర్", "లాటరీ ఆఫీస్"], answer: "బ్యాంక్ కస్టమర్ కేర్" },
        { question: "కాలర్ సురేశ్ ను ఏ సమాచారం అడిగాడు?", options: ["పేరు మరియు చిరునామా", "పిన్ మరియు ఓటీపీ", "ఖాతా సంఖ్య", "ఇమెయిల్ ఐడీ"], answer: "పిన్ మరియు ఓటీపీ" },
        { question: "సురేశ్ సమాధానం ఏమిటి?", options: ["ఓటీపీ చెప్పాడు", "పాస్ వర్డ్ మార్చాడు", "ఓటీపీ చెప్పనని నిరాకరించాడు", "ఫోన్ కట్ చేసాడు"], answer: "ఓటీపీ చెప్పనని నిరాకరించాడు" },
        { question: "బ్యాంకుల ప్రకారం ఫోన్ లో దేనిని అడగకూడదు?", options: ["పేరు", "ఖాతా సంఖ్య", "రహస్య పిన్ / ఓటీపీ", "మొబైల్ నంబర్"], answer: "రహస్య పిన్ / ఓటీపీ" },
        { question: "సురేశ్ ఫోన్ పెట్టిన తర్వాత ఏం చేస్తానని చెప్పాడు?", options: ["బ్యాంకుకు వెళ్తాను", "పోలీసులకు ఫిర్యాదు చేస్తాను", "డ్రా చేస్తాను", "ఇంటికి వెళ్తాను"], answer: "పోలీసులకు ఫిర్యాదు చేస్తాను" }
      ]
    }
  ]
};

const AudioComp = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

    let currentLang = 'hi';
  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    currentLang = storedUser.learning_language || 'hi';
  } catch (e) {}
  const data = AUDIO_COMP_LANG_DATA[currentLang] || AUDIO_COMP_LANG_DATA['hi'];

  const [currentScenario, setCurrentScenario] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const synthRef = useRef(window.speechSynthesis);

  const [answers, setAnswers] = useState({}); // { questionIndex: selectedOption }
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null); // { correct: number, total: number }

  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const currentData = data.items[currentScenario];

  const handlePlay = () => {
    if (!currentData) return;

    if (isPlaying) {
      synthRef.current.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(currentData.transcript);
    const LANG_REC_MAP = { hi: 'hi-IN', ur: 'ur-PK', mwr: 'hi-IN', ta: 'ta-IN', te: 'te-IN', bn: 'bn-IN', mr: 'mr-IN', en: 'en-US' };
    utterance.lang = LANG_REC_MAP[currentLang] || 'en-US';
    utterance.rate = 0.82;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    synthRef.current.cancel();
    synthRef.current.speak(utterance);
  };

  const handleSelectOption = (qIdx, option) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIdx]: option }));
  };

  const handleSubmit = () => {
    if (!currentData) return;

    let correct = 0;
    currentData.questions.forEach((q, idx) => {
      if (answers[idx] === q.answer) {
        correct++;
      }
    });

    setFeedback({ correct, total: currentData.questions.length });
    setSubmitted(true);
    setTotalCorrect(prev => prev + correct);
    setTotalQuestions(prev => prev + currentData.questions.length);
  };

  const handleNext = () => {
    synthRef.current.cancel();
    setIsPlaying(false);

    if (currentScenario < data.items.length - 1) {
      setCurrentScenario(prev => prev + 1);
      setAnswers({});
      setSubmitted(false);
      setFeedback(null);
      setShowTranscript(false);
    } else {
      setGameComplete(true);
    }
  };

  const handleRestart = () => {
    synthRef.current.cancel();
    setIsPlaying(false);
    setCurrentScenario(0);
    setAnswers({});
    setSubmitted(false);
    setFeedback(null);
    setShowTranscript(false);
    setTotalCorrect(0);
    setTotalQuestions(0);
    setGameComplete(false);
  };

  const getOptionStyle = (qIdx, option) => {
    if (!submitted) {
      return answers[qIdx] === option 
        ? { background: '#eff6ff', border: '2px solid #3b82f6', color: '#1e3a8a' }
        : { background: 'white', border: '2px solid #e2e8f0', color: '#334155' };
    }
    const q = currentData.questions[qIdx];
    if (option === q.answer) {
      return { background: '#dcfce7', border: '2px solid #10b981', color: '#14532d', fontWeight: 'bold' };
    }
    if (answers[qIdx] === option && option !== q.answer) {
      return { background: '#fee2e2', border: '2px solid #ef4444', color: '#7f1d1d' };
    }
    return { background: '#f8fafc', border: '2px solid #f1f5f9', color: '#94a3b8', cursor: 'default' };
  };

  if (gameComplete) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '3rem 2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', maxWidth: '500px', width: '100%' }}>
          <Trophy size={64} color="#eab308" style={{ marginBottom: '1.2rem', marginInline: 'auto' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b', margin: '0 0 0.5rem 0' }}>{data.stats}</h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2rem' }}>
            {data.win}
          </p>
          <div style={{ background: '#f1f5f9', padding: '1.5rem', borderRadius: '16px', fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', marginBottom: '2rem' }}>
            🎯 {totalCorrect} / {totalQuestions} Correct
          </div>
          <button 
            onClick={handleRestart}
            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.8rem 2.2rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RotateCcw size={18} /> {data.restart}
          </button>
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
        
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: '24px', padding: '1.8rem', color: 'white', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 0.4rem 0' }}>🎧 {data.title}</h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>{data.desc}</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.6rem 1.2rem', borderRadius: '20px', fontWeight: 800 }}>
            {currentScenario + 1} / {data.items.length}
          </div>
        </div>

        {currentData && (
          <div>
            
            {/* Listening Deck */}
            <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)', textAlign: 'center', marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>
                Conversation Topic
              </span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', margin: '0.4rem 0 1.5rem 0' }}>
                {currentData.title}
              </h2>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <button
                  onClick={handlePlay}
                  style={{
                    background: isPlaying ? '#fef2f2' : '#3b82f6',
                    color: isPlaying ? '#ef4444' : 'white',
                    border: 'none',
                    padding: '0.8rem 2rem',
                    borderRadius: '16px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: '1rem',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {isPlaying ? '⏸ ' + data.pause : '▶ ' + data.play}
                </button>

                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  style={{
                    background: 'white',
                    color: '#475569',
                    border: '1px solid #e2e8f0',
                    padding: '0.8rem 2rem',
                    borderRadius: '16px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {showTranscript ? data.hideTrans : data.showTrans}
                </button>
              </div>

              {/* Collapsible Transcript */}
              {showTranscript && (
                <div style={{ marginTop: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.2rem 1.5rem', textAlign: 'left', fontSize: '1.05rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontWeight: 500 }}>
                  {currentData.transcript}
                </div>
              )}
            </div>

            {/* Questions list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
              {currentData.questions.map((q, qIdx) => (
                <div key={qIdx} style={{ background: 'white', borderRadius: '24px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.01)' }}>
                  <h3 style={{ margin: '0 0 1.2rem 0', fontSize: '1.15rem', color: '#1e293b', fontWeight: 800 }}>
                    {qIdx + 1}. {q.question}
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                    {q.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => handleSelectOption(qIdx, opt)}
                        style={{
                          ...getOptionStyle(qIdx, opt),
                          padding: '1rem',
                          borderRadius: '14px',
                          fontSize: '1rem',
                          cursor: submitted ? 'default' : 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s'
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Grade / Proceed Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              {!submitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length < currentData.questions.length}
                  style={{
                    background: Object.keys(answers).length === currentData.questions.length ? '#10b981' : '#cbd5e1',
                    color: 'white',
                    border: 'none',
                    padding: '1rem 3rem',
                    borderRadius: '16px',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    cursor: Object.keys(answers).length === currentData.questions.length ? 'pointer' : 'not-allowed'
                  }}
                >
                  {data.submit}
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', width: '100%', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>
                    Score: {feedback.correct} / {feedback.total} Correct
                  </div>
                  <button
                    onClick={handleNext}
                    style={{
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '1rem 3rem',
                      borderRadius: '16px',
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {data.next}
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default AudioComp;
