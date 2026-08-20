const fs = require('fs');
const path = require('path');

const sandboxPath = path.join(__dirname, '../../client/src/data/games/sandboxData.js');

const MARWARI_DIALOGUES = [
  [
    { o: 1, t: "राम राम सा! थे कियां हो?" },
    { o: 2, t: "मैं चोखो हूँ, धन्यवाद सा।" },
    { o: 3, t: "कांई थाने कांई चाईजै?" },
    { o: 4, t: "हां, एक कॉफी दे देवो सा।" },
    { o: 5, t: "बिल्कुल, अणीं लाऊं सा।" },
    { o: 6, t: "धन्यवाद सा!" }
  ],
  [
    { o: 1, t: "सुणो सा, रेलगाड़ी स्टेशन कठै है?" },
    { o: 2, t: "सीधा जाओ अर डावी तरफ मुड़ जाओ सा।" },
    { o: 3, t: "कांई वो अठै सू दूर है?" },
    { o: 4, t: "नी, बस पांच मिनट री दूरी माथे है।" },
    { o: 5, t: "घणो घणो धन्यवाद सा!" },
    { o: 6, t: "थांरो स्वागत है सा!" }
  ],
  [
    { o: 1, t: "यो कुरतो कतरा रो है?" },
    { o: 2, t: "यो पांच सौ रुपिया रो है सा।" },
    { o: 3, t: "कांई थोड़ी छूट मिल सके है?" },
    { o: 4, t: "हां, मैं थाने साढ़े चार सौ रुपिया में दे सकूँ।" },
    { o: 5, t: "चोखो, मैं ले ल्यूं सा।" },
    { o: 6, t: "यो थांरो बिल रह्यो सा।" }
  ],
  [
    { o: 1, t: "कांई थे ऑर्डर देवण ने तैयार हो?" },
    { o: 2, t: "हां, मने एक पिज्जा चाईजे सा।" },
    { o: 3, t: "कांई पीवण री खातर कुछ चाईजे?" },
    { o: 4, t: "बस पाणी दे देवो, सा।" },
    { o: 5, t: "थांरो खाणो दस मिनट मे तैयार हो जावैला।" },
    { o: 6, t: "धन्यवाद सा!" }
  ],
  [
    { o: 1, t: "मने इतिहास री पोथ्या कठै मिलैला सा?" },
    { o: 2, t: "वे कपाट नंबर चार माथे है सा।" },
    { o: 3, t: "कांई मैं वांने एक हफ्ता री खातर ले सकूँ?" },
    { o: 4, t: "हां, बस थांरो लाइब्रेरी कार्ड दिखा द्यो सा।" },
    { o: 5, t: "यो रह्यो सा।" },
    { o: 6, t: "वाचन रो आनंद ल्यो सा!" }
  ]
];

const NEW_DEBATE_CARDS = {
  hi: [
    [
      { id: 1, text: "तकनीक हमें जोड़ती है (सकारात्मक)", valid: true },
      { id: 2, text: "तकनीक हमें आलसी बनाती है (नकारात्मक)", valid: false },
      { id: 3, text: "यह सूचना तक पहुंच बढ़ाती है (सकारात्मक)", valid: true },
      { id: 4, text: "यह समय बर्बाद करती है (नकारात्मक)", valid: false }
    ],
    [
      { id: 1, text: "गृहकार्य कक्षा की सीख को मजबूत करता है (सकारात्मक)", valid: true },
      { id: 2, text: "गृहकार्य में बहुत अधिक समय लगता है (नकारात्मक)", valid: false },
      { id: 3, text: "यह छात्रों को स्वतंत्र अभ्यास में मदद करता है (सकारात्मक)", valid: true },
      { id: 4, text: "यह अनावश्यक तनाव पैदा करता है (नकारात्मक)", valid: false }
    ],
    [
      { id: 1, text: "सोशल मीडिया लोगों को संपर्क में रहने में मदद करता है (सकारात्मक)", valid: true },
      { id: 2, text: "यह आसानी से अफवाहें फैलाता है (नकारात्मक)", valid: false },
      { id: 3, text: "यह रचनात्मकता के लिए मंच प्रदान करता है (सकारात्मक)", valid: true },
      { id: 4, text: "यह सीधे संवाद को कम करता है (नकारात्मक)", valid: false }
    ],
    [
      { id: 1, text: "व्यायाम हृदय स्वास्थ्य में सुधार करता है (सकारात्मक)", valid: true },
      { id: 2, text: "व्यायाम से मांसपेशियों में थकान हो सकती है (नकारात्मक)", valid: false },
      { id: 3, text: "यह मानसिक स्पष्टता को बढ़ावा देता है (सकारात्मक)", valid: true },
      { id: 4, text: "यह व्यस्त दिन में से समय लेता है (नकारात्मक)", valid: false }
    ],
    [
      { id: 1, text: "सार्वजनिक परिवहन यातायात कम करता है (सकारात्मक)", valid: true },
      { id: 2, text: "बसें भीड़भाड़ वाली और विलंबित हो सकती हैं (नकारात्मक)", valid: false },
      { id: 3, text: "यह ग्रीनहाउस गैसों को कम करता है (सकारात्मक)", valid: true },
      { id: 4, text: "इसके लिए स्टेशन तक चलने की आवश्यकता होती है (नकारात्मक)", valid: false }
    ],
    [
      { id: 1, text: "पढ़ने से शब्दावली और सहानुभूति बढ़ती है (सकारात्मक)", valid: true },
      { id: 2, text: "किताबें ले जाने में भारी हो सकती हैं (नकारात्मक)", valid: false },
      { id: 3, text: "यह तनाव कम करता है और नींद बढ़ाता है (सकारात्मक)", valid: true },
      { id: 4, text: "कुछ किताबों को समझना मुश्किल होता है (नकारात्मक)", valid: false }
    ],
    [
      { id: 1, text: "ऑनलाइन शिक्षा लचीली समय सारिणी देती है (सकारात्मक)", valid: true },
      { id: 2, text: "इसमें व्यावहारिक प्रशिक्षण की कमी होती है (नकारात्मक)", valid: false },
      { id: 3, text: "यह आपकी अपनी गति से सीखने की अनुमति देता है (सकारात्मक)", valid: true },
      { id: 4, text: "इसके लिए मजबूत आत्म-अनुशासन की आवश्यकता होती है (नकारात्मक)", valid: false }
    ],
    [
      { id: 1, text: "सौर ऊर्जा स्वच्छ और नवीकरणीय है (सकारात्मक)", valid: true },
      { id: 2, text: "सोलर पैनल लगाने की लागत अधिक होती है (नकारात्मक)", valid: false },
      { id: 3, text: "यह मासिक बिजली बिलों को कम करता है (सकारात्मक)", valid: true },
      { id: 4, text: "यह मौसम की स्थिति पर निर्भर करता है (नकारात्मक)", valid: false }
    ]
  ],
  en: [
    [
      { id: 1, text: "Technology connects us (Pro)", valid: true },
      { id: 2, text: "Technology makes us lazy (Con)", valid: false },
      { id: 3, text: "It increases access to info (Pro)", valid: true },
      { id: 4, text: "It wastes our time (Con)", valid: false }
    ],
    [
      { id: 1, text: "Homework reinforces class learning (Pro)", valid: true },
      { id: 2, text: "Homework takes too much time (Con)", valid: false },
      { id: 3, text: "It helps students practice independently (Pro)", valid: true },
      { id: 4, text: "It causes unnecessary stress (Con)", valid: false }
    ],
    [
      { id: 1, text: "Social media helps people stay in touch (Pro)", valid: true },
      { id: 2, text: "It spreads rumors easily (Con)", valid: false },
      { id: 3, text: "It provides a platform for creativity (Pro)", valid: true },
      { id: 4, text: "It reduces face-to-face interaction (Con)", valid: false }
    ],
    [
      { id: 1, text: "Exercise improves cardiovascular health (Pro)", valid: true },
      { id: 2, text: "Exercise can cause muscle fatigue (Con)", valid: false },
      { id: 3, text: "It boosts mood and mental clarity (Pro)", valid: true },
      { id: 4, text: "It takes time out of a busy day (Con)", valid: false }
    ],
    [
      { id: 1, text: "Public transit reduces traffic congestion (Pro)", valid: true },
      { id: 2, text: "Buses can be crowded and delayed (Con)", valid: false },
      { id: 3, text: "It lowers greenhouse gas emissions (Pro)", valid: true },
      { id: 4, text: "It requires walking to the station (Con)", valid: false }
    ],
    [
      { id: 1, text: "Reading enhances vocabulary and empathy (Pro)", valid: true },
      { id: 2, text: "Books can be heavy to carry (Con)", valid: false },
      { id: 3, text: "It reduces stress and promotes sleep (Pro)", valid: true },
      { id: 4, text: "Some books are difficult to understand (Con)", valid: false }
    ],
    [
      { id: 1, text: "Online learning offers flexible schedules (Pro)", valid: true },
      { id: 2, text: "It lacks hands-on lab training (Con)", valid: false },
      { id: 3, text: "It allows learning at your own pace (Pro)", valid: true },
      { id: 4, text: "It requires strong self-discipline (Con)", valid: false }
    ],
    [
      { id: 1, text: "Solar energy is clean and renewable (Pro)", valid: true },
      { id: 2, text: "Solar panels have high setup costs (Con)", valid: false },
      { id: 3, text: "It reduces monthly electricity bills (Pro)", valid: true },
      { id: 4, text: "It depends on weather conditions (Con)", valid: false }
    ]
  ],
  bn: [
    [
      { id: 1, text: "প্রযুক্তি আমাদের যুক্ত করে (ইতিবাচক)", valid: true },
      { id: 2, text: "প্রযুক্তি আমাদের অলস করে (নেতিবাচক)", valid: false },
      { id: 3, text: "এটি তথ্যের সুযোগ বাড়ায় (ইতিবাচক)", valid: true },
      { id: 4, text: "এটি সময় নষ্ট করে (নেতিবাচক)", valid: false }
    ],
    [
      { id: 1, text: "বাড়ির কাজ শেখা বিষয়কে দৃঢ় করে (ইতিবাচক)", valid: true },
      { id: 2, text: "বাড়ির কাজ অতিরিক্ত সময় নেয় (নেতিবাচক)", valid: false },
      { id: 3, text: "এটি শিক্ষার্থীদের একা অনুশীলনে সাহায্য করে (ইতিবাচক)", valid: true },
      { id: 4, text: "এটি অতিরিক্ত মানসিক চাপ বাড়ায় (নেতিবাচক)", valid: false }
    ],
    [
      { id: 1, text: "সোশ্যাল মিডিয়া মানুষের যোগাযোগে সাহায্য করে (ইতিবাচক)", valid: true },
      { id: 2, text: "এটি সহজে গুজব ছড়ায় (নেতিবাচক)", valid: false },
      { id: 3, text: "এটি সৃজনশীলতার একটি প্ল্যাটফর্ম দেয় (ইতিবাচক)", valid: true },
      { id: 4, text: "এটি সরাসরি কথা বলা কমিয়ে দেয় (নেতিবাচক)", valid: false }
    ],
    [
      { id: 1, text: "ব্যায়াম হৃদযন্ত্রের স্বাস্থ্যের উন্নতি ঘটায় (ইতিবাচক)", valid: true },
      { id: 2, text: "ব্যায়াম পেশীর ক্লান্তি সৃষ্টি করতে পারে (নেতিবাচক)", valid: false },
      { id: 3, text: "এটি মানসিক সতেজতা বৃদ্ধি করে (ইতিবাচক)", valid: true },
      { id: 4, text: "এটি ব্যস্ত দিনের থেকে সময় নিয়ে নেয় (নেতিবাচক)", valid: false }
    ],
    [
      { id: 1, text: "গণপরিবহন যানজট কমায় (ইতিবাচক)", valid: true },
      { id: 2, text: "বাসে ভিড় এবং বিলম্ব হতে পারে (নেতিবাচক)", valid: false },
      { id: 3, text: "এটি ক্ষতিকারক গ্যাস নির্গমন কমায় (ইতিবাচক)", valid: true },
      { id: 4, text: "এর জন্য স্টেশন পর্যন্ত হাঁটার প্রয়োজন হয় (নেতিবাচক)", valid: false }
    ],
    [
      { id: 1, text: "বই পড়া শব্দভাণ্ডার ও সহানুভূতি বাড়ায় (ইতিবাচক)", valid: true },
      { id: 2, text: "বই বহন করা ভারী হতে পারে (নেতিবাচক)", valid: false },
      { id: 3, text: "এটি চাপ কমায় এবং ঘুম আসতে সাহায্য করে (ইতিবাচক)", valid: true },
      { id: 4, text: "কিছু বই বোঝা কঠিন হতে পারে (নেতিবাচক)", valid: false }
    ],
    [
      { id: 1, text: "অনলাইন শিক্ষা নমনীয় সময়সূচী দেয় (ইতিবাচক)", valid: true },
      { id: 2, text: "এতে ব্যবহারিক প্রশিক্ষণের অভাব থাকে (নেতিবাচক)", valid: false },
      { id: 3, text: "এটি নিজের গতিতে শেখার অনুমতি দেয় (ইতিবাচক)", valid: true },
      { id: 4, text: "এর জন্য দৃঢ় আত্ম-শৃঙ্খলার প্রয়োজন (নেতিবাচক)", valid: false }
    ],
    [
      { id: 1, text: "সৌরশক্তি পরিষ্কার এবং পুনর্নবীকরণযোগ্য (ইতিবাচক)", valid: true },
      { id: 2, text: "সোলার প্যানেলের প্রাথমিক খরচ অনেক বেশি (নেতিবাচক)", valid: false },
      { id: 3, text: "এটি মাসিক বিদ্যুত বিল কমায় (ইতিবাচক)", valid: true },
      { id: 4, text: "এটি আবহাওয়ার পরিস্থিতির উপর নির্ভর করে (নেতিবাচক)", valid: false }
    ]
  ],
  mr: [
    [
      { id: 1, text: "तंत्रज्ञान आपल्याला जोडते (सकारात्मक)", valid: true },
      { id: 2, text: "तंत्रज्ञान आपल्याला आळशी बनवते (नकारात्मक)", valid: false },
      { id: 3, text: "यामुळे माहिती मिळवणे सोपे होते (सकारात्मक)", valid: true },
      { id: 4, text: "यामुळे वेळ वाया जातो (नकारात्मक)", valid: false }
    ],
    [
      { id: 1, text: "गृहपाठ वर्गातील शिकणे दृढ करतो (सकारात्मक)", valid: true },
      { id: 2, text: "गृहपाठासाठी खूप वेळ लागतो (नकारात्मक)", valid: false },
      { id: 3, text: "हे विद्यार्थ्यांना स्वतंत्र सरावात मदत करते (सकारात्मक)", valid: true },
      { id: 4, text: "यामुळे अनावश्यक मानसिक ताण येतो (नकारात्मक)", valid: false }
    ],
    [
      { id: 1, text: "Social media সম্পर्कात राहण्यास मदत करतो (सकारात्मक)", valid: true },
      { id: 2, text: "यामुळे अफवा सहज पसरतात (नकारात्मक)", valid: false },
      { id: 3, text: "हे सर्जनशीलतेसाठी व्यासपीठ प्रदान करते (सकारात्मक)", valid: true },
      { id: 4, text: "यामुळे प्रत्यक्ष संवाद कमी होतो (नकारात्मक)", valid: false }
    ],
    [
      { id: 1, text: "व्यायामामुळे हृदयाचे आरोग्य सुधारते (सकारात्मक)", valid: true },
      { id: 2, text: "व्यायामामुळे स्नायूंचा थकवा येऊ शकतो (नकारात्मक)", valid: false },
      { id: 3, text: "हे मानसिक ताजेतवानेपणा वाढवते (सकारात्मक)", valid: true },
      { id: 4, text: "हे व्यस्त दिवसातून वेळ घेते (नकारात्मक)", valid: false }
    ],
    [
      { id: 1, text: "सार्वजनिक वाहतूक कोंडी कमी करते (सकारात्मक)", valid: true },
      { id: 2, text: "बसमध्ये गर्दी आणि उशीर होऊ शकतो (नकारात्मक)", valid: false },
      { id: 3, text: "हे हरितगृह वायू उत्सर्जन कमी करते (सकारात्मक)", valid: true },
      { id: 4, text: "यासाठी स्टेशनपर्यंत चालत जावे लागते (नकारात्मक)", valid: false }
    ],
    [
      { id: 1, text: "वाचनामुळे शब्दसंग्रह आणि सहानुभूती वाढते (सकारात्मक)", valid: true },
      { id: 2, text: "पुस्तके वाहून नेण्यास जड असू शकतात (नकारात्मक)", valid: false },
      { id: 3, text: "हे ताण कमी करते आणि झोप सुधारते (सकारात्मक)", valid: true },
      { id: 4, text: "काही पुस्तके समजण्यास कठीण असतात (नकारात्मक)", valid: false }
    ],
    [
      { id: 1, text: "ऑनलाइन शिक्षण लवचिक वेळापत्रक देते (सकारात्मक)", valid: true },
      { id: 2, text: "यामध्ये प्रात्यक्षिक प्रशिक्षणाचा अभाव असतो (नकारात्मक)", valid: false },
      { id: 3, text: "हे आपल्या गतीने शिकण्याची परवानगी देते (सकारात्मक)", valid: true },
      { id: 4, text: "यासाठी कडक स्वयं-शिस्तीची आवश्यकता असते (नकारात्मक)", valid: false }
    ],
    [
      { id: 1, text: "सौर ऊर्जा स्वच्छ आणि नूतनीकरणक्षम आहे (सकारात्मक)", valid: true },
      { id: 2, text: "सौर पॅनेल बसवण्याचा खर्च जास्त असतो (नकारात्मक)", valid: false },
      { id: 3, text: "यामुळे मासिक विजेचे बिल कमी होते (सकारात्मक)", valid: true },
      { id: 4, text: "हे हवामानावर अवलंबून असते (नकारात्मक)", valid: false }
    ]
  ],
  mwr: [
    [
      { id: 1, text: "तकनीक आपांने जोड़ै है (चोखी बात)", valid: true },
      { id: 2, text: "तकनीक आपांने आळसी बणावै है (माड़ी बात)", valid: false },
      { id: 3, text: "इण सू जाणकारी बधे है (चोखी बात)", valid: true },
      { id: 4, text: "यो टैम खराब करै है (माड़ी बात)", valid: false }
    ],
    [
      { id: 1, text: "स्कूल रो काम सीखबा ने पक्को करै है (चोखी बात)", valid: true },
      { id: 2, text: "इण काम मे घणो टैम लागे है (माड़ी बात)", valid: false },
      { id: 3, text: "यो टाबरां ने खुद सराव मे मदद करै है (चोखी बात)", valid: true },
      { id: 4, text: "यो फालतू रो ताण पैदा करै है (माड़ी बात)", valid: false }
    ],
    [
      { id: 1, text: "सोशल मीडिया माणसां ने जोड़बा मे मदद करै है (चोखी बात)", valid: true },
      { id: 2, text: "यो आसानी सू अफवावां फैलावै है (माड़ी बात)", valid: false },
      { id: 3, text: "यो नया कामां री खातर मंच देवै है (चोखी बात)", valid: true },
      { id: 4, text: "यो आपस री बातचीत् कम करै है (माड़ी बात)", valid: false }
    ],
    [
      { id: 1, text: "कसरत सू हिवडो चोखो रहवै है (चोखी बात)", valid: true },
      { id: 2, text: "कसरत सू डांडा थक सके है (माड़ी बात)", valid: false },
      { id: 3, text: "यो दिमाग ने चोखो अर साफ करै है (चोखी बात)", valid: true },
      { id: 4, text: "यो बिजी टैम मे सू वक्त लेवे है (माड़ी बात)", valid: false }
    ],
    [
      { id: 1, text: "सरकारी बस गाड्यां भीड़ कम करै है (चोखी बात)", valid: true },
      { id: 2, text: "बस मे भीड़ अर उशीर हो सके है (माड़ी बात)", valid: false },
      { id: 3, text: "यो प्रदुषण ने कम करै है (चोखी बात)", valid: true },
      { id: 4, text: "इण री खातर स्टेशन ताई चालणो पड़े है (माड़ी बात)", valid: false }
    ],
    [
      { id: 1, text: "पोथ्या पढबा सू ग्यान अर हमदरदी बधे है (चोखी बात)", valid: true },
      { id: 2, text: "पोथ्या लेबा मे भारी हो सके है (माड़ी बात)", valid: false },
      { id: 3, text: "यो ताण कम करै है अर नीद चोखी लावे है (चोखी बात)", valid: true },
      { id: 4, text: "पोथ्या समजबा मे दोरी होवे है (माड़ी बात)", valid: false }
    ],
    [
      { id: 1, text: "ऑनलाइन पढाई री खातर टैम आपणी मर्जी रो रहवै (चोखी बात)", valid: true },
      { id: 2, text: "इण मे खुद हाथ सू काम सीखबा री कमी रहवै (माड़ी बात)", valid: false },
      { id: 3, text: "यो आपणी गती सू सीखबा री छूट देवै है (चोखी बात)", valid: true },
      { id: 4, text: "इण री खातर खुद माथे काबू होणो चाईजे (माड़ी बात)", valid: false }
    ],
    [
      { id: 1, text: "सूरज री ऊर्जा साफ अर कदे नी खूटण वाली है (चोखी बात)", valid: true },
      { id: 2, text: "सोलर पैनल लगाबा रो खरचो घणो होवे है (माड़ी बात)", valid: false },
      { id: 3, text: "यो महीना रो बिजली बिल कम करै है (चोखी बात)", valid: true },
      { id: 4, text: "यो मौसम माथे निरभर करै है (माड़ी बात)", valid: false }
    ]
  ],
  ta: [
    [
      { id: 1, text: "தொழில்நுட்பம் நம்மை இணைக்கிறது (நேர்மறை)", valid: true },
      { id: 2, text: "தொழில்நுட்பம் நம்மை சோம்பேறியாக்குகிறது (எதிர்மறை)", valid: false },
      { id: 3, text: "இது தகவல்களை எளிதாக்குகிறது (நேர்மறை)", valid: true },
      { id: 4, text: "இது நேரத்தை வீணாக்குகிறது (எதிர்மறை)", valid: false }
    ],
    [
      { id: 1, text: "வீட்டுப்பாடம் கற்றலை வலுப்படுத்துகிறது (நேர்மறை)", valid: true },
      { id: 2, text: "வீட்டுப்பாடம் அதிக நேரம் எடுக்கிறது (எதிர்மறை)", valid: false },
      { id: 3, text: "இது மாணவர்கள் சொந்தமாகப் பயிற்சி செய்ய உதவுகிறது (நேர்மறை)", valid: true },
      { id: 4, text: "இது தேவையில்லாத மன அழுத்தத்தை ஏற்படுத்துகிறது (எதிர்மறை)", valid: false }
    ],
    [
      { id: 1, text: "சமூக ஊடகங்கள் தொடர்பு கொள்ள உதவுகின்றன (நேர்மறை)", valid: true },
      { id: 2, text: "இது எளிதில் வதந்திகளைப் பரப்புகிறது (எதிர்மறை)", valid: false },
      { id: 3, text: "இது படைப்பாற்றலுக்கான தளத்தை வழங்குகிறது (நேர்மறை)", valid: true },
      { id: 4, text: "இது நேரடி உரையாடலைக் குறைக்கிறது (எதிர்மறை)", valid: false }
    ],
    [
      { id: 1, text: "உடற்பயிற்சி இதய ஆரோக்கியத்தை மேம்படுத்துகிறது (நேர்மறை)", valid: true },
      { id: 2, text: "உடற்பயிற்சி தசை சோர்வை ஏற்படுத்தலாம் (எதிர்மறை)", valid: false },
      { id: 3, text: "இது மன தெளிவை ஊக்குவிக்கிறது (நேர்மறை)", valid: true },
      { id: 4, text: "இது பிஸியான நாளில் நேரத்தை எடுத்துக்கொள்கிறது (எதிர்மறை)", valid: false }
    ],
    [
      { id: 1, text: "பொதுப் போக்குவரத்து போக்குவரத்து நெரிசலைக் குறைக்கிறது (நேர்மறை)", valid: true },
      { id: 2, text: "பேருந்துகளில் கூட்டமும் தாமதமும் ஏற்படலாம் (எதிர்மறை)", valid: false },
      { id: 3, text: "இது பசுமைக்குடில் வாயு உமிழ்வைக் குறைக்கிறது (நேர்மறை)", valid: true },
      { id: 4, text: "இதற்கு நிலையம் வரை நடக்க வேண்டியிருக்கும் (எதிர்மறை)", valid: false }
    ],
    [
      { id: 1, text: "வாசிப்பு சொல்லகராதி மற்றும் பரிவை வளர்க்கிறது (நேர்மறை)", valid: true },
      { id: 2, text: "புத்தகங்களை எடுத்துச் செல்வது கடினமாக இருக்கலாம் (எதிர்மறை)", valid: false },
      { id: 3, text: "இது மன அழுத்தத்தைக் குறைத்து தூக்கத்தை மேம்படுத்துகிறது (நேர்மறை)", valid: true },
      { id: 4, text: "சில புத்தகங்களைப் புரிந்துகொள்வது கடினம் (எதிர்மறை)", valid: false }
    ],
    [
      { id: 1, text: "ஆன்லைன் கற்றல் நெகிழ்வான நேரத்தை வழங்குகிறது (நேர்மறை)", valid: true },
      { id: 2, text: "இதில் செய்முறைப் பயிற்சி குறைவாக இருக்கும் (எதிர்மறை)", valid: false },
      { id: 3, text: "இது உங்கள் சொந்த வேகத்தில் கற்க அனுமதிக்கிறது (நேர்மறை)", valid: true },
      { id: 4, text: "இதற்கு கடுமையான சுய ஒழுக்கம் தேவை (எதிர்மறை)", valid: false }
    ],
    [
      { id: 1, text: "சூரிய ஆற்றல் சுத்தமானது மற்றும் புதுப்பிக்கத்தக்கது (நேர்மறை)", valid: true },
      { id: 2, text: "சோலார் பேனல் அமைக்க அதிக செலவாகும் (எதிர்மறை)", valid: false },
      { id: 3, text: "இது மாத மின் கட்டணத்தைக் குறைக்கிறது (நேர்மறை)", valid: true },
      { id: 4, text: "இது வானிலை நிலையைப் பொறுத்தது (எதிர்மறை)", valid: false }
    ]
  ],
  te: [
    [
      { id: 1, text: "సాంకేతికత మమ్మల్ని కలుపుతుంది (అనుకూలం)", valid: true },
      { id: 2, text: "సాంకేతికత మమ్మల్ని బద్ధకస్తులను చేస్తుంది (ప్రతికూలం)", valid: false },
      { id: 3, text: "ఇది సమాచారాన్ని అందిస్తుంది (అనుకూలం)", valid: true },
      { id: 4, text: "ఇది సమయాన్ని వృధా చేస్తుంది (ప్రతికూలం)", valid: false }
    ],
    [
      { id: 1, text: "హోంవర్క్ నేర్చుకోవడాన్ని బలోపేతం చేస్తుంది (అనుకూలం)", valid: true },
      { id: 2, text: "హోంవర్క్ చేయడానికి చాలా సమయం పడుతుంది (ప్రతికూలం)", valid: false },
      { id: 3, text: "ఇది విద్యార్థులు స్వయంగా సాధన చేయడానికి సహాయపడుతుంది (అనుకూలం)", valid: true },
      { id: 4, text: "ఇది అనవసరమైన ఒత్తిడిని కలిగిస్తుంది (ప్రతికూలం)", valid: false }
    ],
    [
      { id: 1, text: "సమస్యల సాధనలో సోషల్ మీడియా సహాయపడుతుంది (అనుకూలం)", valid: true },
      { id: 2, text: "ఇది సులభంగా పుకార్లను వ్యాప్తి చేస్తుంది (ప్రతికూలం)", valid: false },
      { id: 3, text: "ఇది సృజనాత్మకతకు వేదికను అందిస్తుంది (అనుకూలం)", valid: true },
      { id: 4, text: "ఇది ప్రత్యక్ష సంభాషణను తగ్గిస్తుంది (ప్రతికూలం)", valid: false }
    ],
    [
      { id: 1, text: "వ్యాయామం గుండె ఆరోగ్యాన్ని మెరుగుపరుస్తుంది (అనుకూలం)", valid: true },
      { id: 2, text: "వ్యాయామం వల్ల కండరాల అలసట రావచ్చు (ప్రతికూలం)", valid: false },
      { id: 3, text: "ఇది మానసిక ప్రశాంతతను పెంచుతుంది (అనుకూలం)", valid: true },
      { id: 4, text: "ఇది బిజీ షెడ్యూల్ లో సమయాన్ని తీసుకుంటుంది (ప్రతికూలం)", valid: false }
    ],
    [
      { id: 1, text: "ప్రజా రవాణా ట్రాఫిక్ ఇబ్బందులను తగ్గిస్తుంది (అనుకూలం)", valid: true },
      { id: 2, text: "బస్సులలో రద్దీ మరియు ఆలస్యం కావచ్చు (ప్రతికూలం)", valid: false },
      { id: 3, text: "ఇది కాలుష్యాన్ని తగ్గిస్తుంది (అనుకూలం)", valid: true },
      { id: 4, text: "దీని కోసం స్టేషన్ వరకు నడవవలసి ఉంటుంది (ప్రతికూలం)", valid: false }
    ],
    [
      { id: 1, text: "చదవడం వల్ల పదజాలం మరియు సానుభూతి పెరుగుతాయి (అనుకూలం)", valid: true },
      { id: 2, text: "పుస్తకాలు మోసుకెళ్లడం బరువుగా ఉంటుంది (ప్రతికూలం)", valid: false },
      { id: 3, text: "ఇది ఒత్తిడిని తగ్గిస్తుంది మరియు నిద్రను ఇస్తుంది (అనుకూలం)", valid: true },
      { id: 4, text: "కొన్ని పుస్తకాలను అర్థం చేసుకోవడం కష్టం (ప్రతికూలం)", valid: false }
    ],
    [
      { id: 1, text: "ఆన్‌లైన్ లెర్నింగ్ అనుకూలమైన సమయాలను ఇస్తుంది (అనుకూలం)", valid: true },
      { id: 2, text: "ఇందులో ప్రాక్టికల్ ట్రైనింగ్ లోపిస్తుంది (ప్రతికూలం)", valid: false },
      { id: 3, text: "ఇది మన స్వంత వేగంతో నేర్చుకోవడానికి వీలు కల్పిస్తుంది (అనుకూలం)", valid: true },
      { id: 4, text: "దీనికి బలమైన స్వీయ-క్రమశిక్షణ అవసరం (ప్రతికూలం)", valid: false }
    ],
    [
      { id: 1, text: "సౌరశక్తి స్వచ్ఛమైనది మరియు పునరుత్పాదకమైనది (అనుకూలం)", valid: true },
      { id: 2, text: "సోలార్ ప్యానెల్ ఏర్పాటు ఖర్చు ఎక్కువ (ప్రతికూలం)", valid: false },
      { id: 3, text: "ఇది నెలవారీ విద్యుత్ బిల్లులను తగ్గిస్తుంది (అనుకూలం)", valid: true },
      { id: 4, text: "ఇది వాతావరణ పరిస్థితులపై ఆధారపడి ఉంటుంది (ప్రతికూలం)", valid: false }
    ]
  ],
  ur: [
    [
      { id: 1, text: "ٹیکنالوجی ہمیں جوڑتی ہے (مثبت)", valid: true },
      { id: 2, text: "ٹیکنالوجی ہمیں سست بناتی ہے (منفی)", valid: false },
      { id: 3, text: "یہ معلومات تک رسائی بڑھاتی ہے (مثبت)", valid: true },
      { id: 4, text: "یہ وقت ضائع کرتی ہے (منفی)", valid: false }
    ],
    [
      { id: 1, text: "ہوم ورک سیکھنے کو مضبوط بناتا ہے (مثبت)", valid: true },
      { id: 2, text: "ہوم ورک میں بہت زیادہ وقت لگتا ہے (منفی)", valid: false },
      { id: 3, text: "یہ طلباء کو خود مشق کرنے میں مدد دیتا ہے (مثبت)", valid: true },
      { id: 4, text: "یہ غیر ضروری ذہنی دباؤ پیدا کرتا ہے (منفی)", valid: false }
    ],
    [
      { id: 1, text: "سوشل میڈیا لوگوں کو رابطہ میں رکھتا ہے (مثبت)", valid: true },
      { id: 2, text: "یہ آسانی سے افواہیں پھیلاتا ہے (منفی)", valid: false },
      { id: 3, text: "یہ تخلیقی صلاحیتوں کے لیے پلیٹ فارم دیتا ہے (مثبت)", valid: true },
      { id: 4, text: "یہ براہ راست بات چیت کو کم کرتا ہے (منفی)", valid: false }
    ],
    [
      { id: 1, text: "ورزش دل کی صحت کو بہتر بناتی ہے (مثبت)", valid: true },
      { id: 2, text: "ورزش پٹھوں کی تھکن کا باعث بن سکتی ہے (منفی)", valid: false },
      { id: 3, text: "یہ ذہنی سکون اور بیداری کو بڑھاتی ہے (مثبت)", valid: true },
      { id: 4, text: "یہ مصروف دن میں سے وقت لیتی ہے (منفی)", valid: false }
    ],
    [
      { id: 1, text: "عوامی نقل و حمل ٹریفک جام کو کم کرتی ہے (مثبت)", valid: true },
      { id: 2, text: "بسوں میں بھیڑ اور تاخیر ہو سکتی ہے (منفی)", valid: false },
      { id: 3, text: "یہ گیسوں کے اخراج کو کم کرتی ہے (مثبت)", valid: true },
      { id: 4, text: "اس کے لیے اسٹیشن تک پیدل چلنا پڑتا ہے (منفی)", valid: false }
    ],
    [
      { id: 1, text: "مطالعہ سے ذخیرہ الفاظ اور ہمدردی بڑھتی ہے (مثبت)", valid: true },
      { id: 2, text: "کتابیں اٹھانا بھاری ہو سکتا ہے (منفی)", valid: false },
      { id: 3, text: "یہ دباؤ کم کرتا ہے اور نیند کو بہتر بناتا ہے (مثبت)", valid: true },
      { id: 4, text: "کچھ کتابوں کو سمجھنا مشکل ہوتا ہے (منفی)", valid: false }
    ],
    [
      { id: 1, text: "آن لائن تعلیم لچکدار نظام الاوقات پیش کرتی ہے (مثبت)", valid: true },
      { id: 2, text: "اس میں عملی تربیت کی कमी ہوتی ہے (منفی)", valid: false },
      { id: 3, text: "یہ آپ کو اپنی رفتار سے سیکھنے دیتا ہے (مثبت)", valid: true },
      { id: 4, text: "اس کے لیے سخت خود نظم و ضبط کی ضرورت ہے (منفی)", valid: false }
    ],
    [
      { id: 1, text: "سورج کی توانائی صاف اور ناقابل تجدید ہے (مثبت)", valid: true },
      { id: 2, text: "سولر پینل لگانے کی لاگت زیادہ ہوتی ہے (منفی)", valid: false },
      { id: 3, text: "یہ ماہانہ بجلی کے بلوں کو کم کرتی ہے (مثبت)", valid: true },
      { id: 4, text: "یہ موسم کی صورتحال پر منحصر ہوتی ہے (منفی)", valid: false }
    ]
  ]
};

async function clean() {
  const content = fs.readFileSync(sandboxPath, 'utf8');
  
  // 1. Extract clean prefix (BINGO_ITEMS to mr: [ ... ] of DIALOGUE_SETS)
  const dialogueSetsStart = content.indexOf('export const DIALOGUE_SETS = {');
  const mrStart = content.indexOf('  mr: [', dialogueSetsStart);
  
  // Find matching end brace of mr dialogue array
  let braceCount = 0;
  let mrEnd = -1;
  for (let i = mrStart; i < content.length; i++) {
    if (content[i] === '[') {
      braceCount++;
    } else if (content[i] === ']') {
      braceCount--;
      if (braceCount === 0) {
        mrEnd = i;
        break;
      }
    }
  }
  
  if (mrEnd === -1) {
    console.error("Could not find end of mr dialogues");
    process.exit(1);
  }
  
  const prefix = content.slice(0, mrEnd + 1);
  
  // 2. Extract clean suffix (SPEED_EDITOR_SETS onwards)
  const speedEditorStart = content.indexOf('export const SPEED_EDITOR_SETS = {');
  if (speedEditorStart === -1) {
    console.error("Could not find SPEED_EDITOR_SETS");
    process.exit(1);
  }
  
  // But wait, we also have IDIOM_PAIRS at the end. We want to completely replace DEBATE_CARDS with NEW_DEBATE_CARDS.
  // The original DEBATE_CARDS starts after SPEED_EDITOR_SETS and before IDIOM_PAIRS.
  // Let's extract SPEED_EDITOR_SETS block.
  const debateCardsStart = content.indexOf('export const DEBATE_CARDS = {', speedEditorStart);
  if (debateCardsStart === -1) {
    console.error("Could not find original DEBATE_CARDS");
    process.exit(1);
  }
  
  const speedEditorBlock = content.slice(speedEditorStart, debateCardsStart);
  
  const idiomPairsStart = content.indexOf('export const IDIOM_PAIRS = {', debateCardsStart);
  if (idiomPairsStart === -1) {
    console.error("Could not find IDIOM_PAIRS");
    process.exit(1);
  }
  
  const idiomPairsBlock = content.slice(idiomPairsStart);

  // Extract the original clean ta, te, ur dialogue sets from our file (which are intact at line 868 onwards).
  // Let's search for "ta: [" after line 850.
  const taIdx = content.indexOf('  ta: [', mrEnd);
  const urIdx = content.indexOf('  ur: [', taIdx);
  
  // Find matching end brace of ur dialogue array
  braceCount = 0;
  let urEnd = -1;
  for (let i = urIdx; i < content.length; i++) {
    if (content[i] === '[') {
      braceCount++;
    } else if (content[i] === ']') {
      braceCount--;
      if (braceCount === 0) {
        urEnd = i;
        break;
      }
    }
  }
  
  if (urEnd === -1) {
    console.error("Could not find end of ur dialogues");
    process.exit(1);
  }
  
  const taTeUrDialogues = content.slice(taIdx, urEnd + 1);

  // 3. Assemble clean sandboxData.js
  const dialogueBlock = `,\n  mwr: ${JSON.stringify(MARWARI_DIALOGUES, null, 2)},\n  ${taTeUrDialogues}\n};`;
  
  const debateBlock = `\nexport const DEBATE_CARDS = ${JSON.stringify(NEW_DEBATE_CARDS, null, 2)};\n\n`;
  
  const finalContent = prefix + dialogueBlock + '\n\n\n' + speedEditorBlock + debateBlock + idiomPairsBlock;
  
  fs.writeFileSync(sandboxPath, finalContent, 'utf8');
  console.log("Successfully cleaned and rebuilt sandboxData.js dynamically!");
}

clean();
