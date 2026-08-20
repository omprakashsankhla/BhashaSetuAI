const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../data/games');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 1. SIGN_DATA from client coreGamesData.js
const SIGN_DATA = {
  hi: [
    { sign: 'प्रवेश निषेध', type: 'danger', options: ['No Entry', 'Hospital Ahead', 'One Way', 'Speed Limit'], answer: 'No Entry' },
    { sign: 'धूम्रपान वर्जित', type: 'warning', options: ['Wet Floor', 'No Smoking', 'Toxic Danger', 'Keep Left'], answer: 'No Smoking' },
    { sign: 'खतरा', type: 'danger', options: ['Danger', 'Exit', 'Restaurant', 'Free Parking'], answer: 'Danger' },
    { sign: 'शांत क्षेत्र', type: 'info', options: ['Construction Zone', 'Quiet Zone / Silent Zone', 'Speed Breaker', 'No Parking'], answer: 'Quiet Zone / Silent Zone' },
    { sign: 'कृपया कचरा पात्र में डालें', type: 'info', options: ['Keep Left', 'No Littering', 'Do Not Touch', 'Emergency Exit'], answer: 'No Littering' },
    { sign: 'रुकें', type: 'danger', options: ['Stop', 'Go', 'Yield', 'Slow Down'], answer: 'Stop' },
    { sign: 'गति सीमा', type: 'info', options: ['Speed Limit', 'No Entry', 'Stop', 'Hospital'], answer: 'Speed Limit' },
    { sign: 'केवल एक तरफ़ा', type: 'warning', options: ['One Way', 'Two Way', 'U-Turn', 'Stop'], answer: 'One Way' },
    { sign: 'अस्पताल आगे है', type: 'info', options: ['Hospital Ahead', 'School Ahead', 'Market', 'Bus Stop'], answer: 'Hospital Ahead' },
    { sign: 'आगे स्कूल है', type: 'warning', options: ['School Ahead', 'Hospital', 'No Entry', 'Stop'], answer: 'School Ahead' }
  ],
  en: [
    { sign: 'NO ENTRY', type: 'danger', options: ['No Entry', 'Hospital Ahead', 'One Way', 'Speed Limit'], answer: 'No Entry' },
    { sign: 'NO SMOKING', type: 'warning', options: ['Wet Floor', 'No Smoking', 'Toxic Danger', 'Keep Left'], answer: 'No Smoking' },
    { sign: 'DANGER', type: 'danger', options: ['Danger', 'Exit', 'Restaurant', 'Free Parking'], answer: 'Danger' },
    { sign: 'SILENCE ZONE', type: 'info', options: ['Construction Zone', 'Quiet Zone / Silent Zone', 'Speed Breaker', 'No Parking'], answer: 'Quiet Zone / Silent Zone' },
    { sign: 'NO LITTERING', type: 'info', options: ['Keep Left', 'No Littering', 'Do Not Touch', 'Emergency Exit'], answer: 'No Littering' },
    { sign: 'STOP', type: 'danger', options: ['Stop', 'Go', 'Yield', 'Slow Down'], answer: 'Stop' },
    { sign: 'SPEED LIMIT', type: 'info', options: ['Speed Limit', 'No Entry', 'Stop', 'Hospital'], answer: 'Speed Limit' },
    { sign: 'ONE WAY', type: 'warning', options: ['One Way', 'Two Way', 'U-Turn', 'Stop'], answer: 'One Way' },
    { sign: 'HOSPITAL AHEAD', type: 'info', options: ['Hospital Ahead', 'School Ahead', 'Market', 'Bus Stop'], answer: 'Hospital Ahead' },
    { sign: 'SCHOOL AHEAD', type: 'warning', options: ['School Ahead', 'Hospital', 'No Entry', 'Stop'], answer: 'School Ahead' }
  ],
  bn: [
    { sign: 'প্রবেশ নিষেধ', type: 'danger', options: ['No Entry', 'Hospital Ahead', 'One Way', 'Speed Limit'], answer: 'No Entry' },
    { sign: 'ধূমপান নিষেধ', type: 'warning', options: ['Wet Floor', 'No Smoking', 'Toxic Danger', 'Keep Left'], answer: 'No Smoking' },
    { sign: 'বিপদ', type: 'danger', options: ['Danger', 'Exit', 'Restaurant', 'Free Parking'], answer: 'Danger' },
    { sign: 'নীরব এলাকা', type: 'info', options: ['Construction Zone', 'Quiet Zone / Silent Zone', 'Speed Breaker', 'No Parking'], answer: 'Quiet Zone / Silent Zone' },
    { sign: 'আবর্জনা ফেলবেন না', type: 'info', options: ['Keep Left', 'No Littering', 'Do Not Touch', 'Emergency Exit'], answer: 'No Littering' },
    { sign: 'থামুন', type: 'danger', options: ['Stop', 'Go', 'Yield', 'Slow Down'], answer: 'Stop' },
    { sign: 'গতি সীমা', type: 'info', options: ['Speed Limit', 'No Entry', 'Stop', 'Hospital'], answer: 'Speed Limit' },
    { sign: 'একমুখী রাস্তা', type: 'warning', options: ['One Way', 'Two Way', 'U-Turn', 'Stop'], answer: 'One Way' },
    { sign: 'সামনে হাসপাতাল', type: 'info', options: ['Hospital Ahead', 'School Ahead', 'Market', 'Bus Stop'], answer: 'Hospital Ahead' },
    { sign: 'সামনে স্কুল', type: 'warning', options: ['School Ahead', 'Hospital', 'No Entry', 'Stop'], answer: 'School Ahead' }
  ],
  mr: [
    { sign: 'प्रवेश निषिद्ध', type: 'danger', options: ['No Entry', 'Hospital Ahead', 'One Way', 'Speed Limit'], answer: 'No Entry' },
    { sign: 'धूम्रपान वर्ज्य', type: 'warning', options: ['Wet Floor', 'No Smoking', 'Toxic Danger', 'Keep Left'], answer: 'No Smoking' },
    { sign: 'धोका', type: 'danger', options: ['Danger', 'Exit', 'Restaurant', 'Free Parking'], answer: 'Danger' },
    { sign: 'शांतता क्षेत्र', type: 'info', options: ['Construction Zone', 'Quiet Zone / Silent Zone', 'Speed Breaker', 'No Parking'], answer: 'Quiet Zone / Silent Zone' },
    { sign: 'कचरा करू नये', type: 'info', options: ['Keep Left', 'No Littering', 'Do Not Touch', 'Emergency Exit'], answer: 'No Littering' },
    { sign: 'थांबा', type: 'danger', options: ['Stop', 'Go', 'Yield', 'Slow Down'], answer: 'Stop' },
    { sign: 'वेग मर्यादा', type: 'info', options: ['Speed Limit', 'No Entry', 'Stop', 'Hospital'], answer: 'Speed Limit' },
    { sign: 'एकेरी मार्ग', type: 'warning', options: ['One Way', 'Two Way', 'U-Turn', 'Stop'], answer: 'One Way' },
    { sign: 'पुढे रुग्णालय आहे', type: 'info', options: ['Hospital Ahead', 'School Ahead', 'Market', 'Bus Stop'], answer: 'Hospital Ahead' },
    { sign: 'पुढे शाळा आहे', type: 'warning', options: ['School Ahead', 'Hospital', 'No Entry', 'Stop'], answer: 'School Ahead' }
  ],
  mwr: [
    { sign: 'जावणो मना है', type: 'danger', options: ['No Entry', 'Hospital Ahead', 'One Way', 'Speed Limit'], answer: 'No Entry' },
    { sign: 'बीड़ी-सिगरेट मना है', type: 'warning', options: ['Wet Floor', 'No Smoking', 'Toxic Danger', 'Keep Left'], answer: 'No Smoking' },
    { sign: 'खतरो', type: 'danger', options: ['Danger', 'Exit', 'Restaurant', 'Free Parking'], answer: 'Danger' },
    { sign: 'शांत क्षेत्र', type: 'info', options: ['Construction Zone', 'Quiet Zone / Silent Zone', 'Speed Breaker', 'No Parking'], answer: 'Quiet Zone / Silent Zone' },
    { sign: 'कचरो ना नाखो', type: 'info', options: ['Keep Left', 'No Littering', 'Do Not Touch', 'Emergency Exit'], answer: 'No Littering' },
    { sign: 'रुक जाओ', type: 'danger', options: ['Stop', 'Go', 'Yield', 'Slow Down'], answer: 'Stop' },
    { sign: 'गति सीमा', type: 'info', options: ['Speed Limit', 'No Entry', 'Stop', 'Hospital'], answer: 'Speed Limit' },
    { sign: 'एक तरफा रस्तो', type: 'warning', options: ['One Way', 'Two Way', 'U-Turn', 'Stop'], answer: 'One Way' },
    { sign: 'आगे अस्पताल है', type: 'info', options: ['Hospital Ahead', 'School Ahead', 'Market', 'Bus Stop'], answer: 'Hospital Ahead' },
    { sign: 'आगे स्कूल है', type: 'warning', options: ['School Ahead', 'Hospital', 'No Entry', 'Stop'], answer: 'School Ahead' }
  ],
  ta: [
    { sign: 'உள்ளே நுழையாதீர்', type: 'danger', options: ['No Entry', 'Hospital Ahead', 'One Way', 'Speed Limit'], answer: 'No Entry' },
    { sign: 'புகைபிடிக்கக் கூடாது', type: 'warning', options: ['Wet Floor', 'No Smoking', 'Toxic Danger', 'Keep Left'], answer: 'No Smoking' },
    { sign: 'ஆபத்து', type: 'danger', options: ['Danger', 'Exit', 'Restaurant', 'Free Parking'], answer: 'Danger' },
    { sign: 'அமைதிப் பகுதி', type: 'info', options: ['Construction Zone', 'Quiet Zone / Silent Zone', 'Speed Breaker', 'No Parking'], answer: 'Quiet Zone / Silent Zone' },
    { sign: 'குப்பைகளைப் போடாதீர்', type: 'info', options: ['Keep Left', 'No Littering', 'Do Not Touch', 'Emergency Exit'], answer: 'No Littering' },
    { sign: 'நிறுத்து', type: 'danger', options: ['Stop', 'Go', 'Yield', 'Slow Down'], answer: 'Stop' },
    { sign: 'வேக வரம்பு', type: 'info', options: ['Speed Limit', 'No Entry', 'Stop', 'Hospital'], answer: 'Speed Limit' },
    { sign: 'ஒரு வழிப் பாதை', type: 'warning', options: ['One Way', 'Two Way', 'U-Turn', 'Stop'], answer: 'One Way' },
    { sign: 'முன்னால் மருத்துவமனை', type: 'info', options: ['Hospital Ahead', 'School Ahead', 'Market', 'Bus Stop'], answer: 'Hospital Ahead' },
    { sign: 'முன்னால் பள்ளி', type: 'warning', options: ['School Ahead', 'Hospital', 'No Entry', 'Stop'], answer: 'School Ahead' }
  ],
  te: [
    { sign: 'ప్రవేశం లేదు', type: 'danger', options: ['No Entry', 'Hospital Ahead', 'One Way', 'Speed Limit'], answer: 'No Entry' },
    { sign: 'పొగ త్రాగరాదు', type: 'warning', options: ['Wet Floor', 'No Smoking', 'Toxic Danger', 'Keep Left'], answer: 'No Smoking' },
    { sign: 'ప్రమాదం', type: 'danger', options: ['Danger', 'Exit', 'Restaurant', 'Free Parking'], answer: 'Danger' },
    { sign: 'నిశ్శబ్ద ప్రాంతం', type: 'info', options: ['Construction Zone', 'Quiet Zone / Silent Zone', 'Speed Breaker', 'No Parking'], answer: 'Quiet Zone / Silent Zone' },
    { sign: 'చెత్త వేయరాదు', type: 'info', options: ['Keep Left', 'No Littering', 'Do Not Touch', 'Emergency Exit'], answer: 'No Littering' },
    { sign: 'ఆగుము', type: 'danger', options: ['Stop', 'Go', 'Yield', 'Slow Down'], answer: 'Stop' },
    { sign: 'వేగ పరిమితి', type: 'info', options: ['Speed Limit', 'No Entry', 'Stop', 'Hospital'], answer: 'Speed Limit' },
    { sign: 'వన్ వే', type: 'warning', options: ['One Way', 'Two Way', 'U-Turn', 'Stop'], answer: 'One Way' },
    { sign: 'ముందు ఆసుపత్రి ఉంది', type: 'info', options: ['Hospital Ahead', 'School Ahead', 'Market', 'Bus Stop'], answer: 'Hospital Ahead' },
    { sign: 'ముందు పాఠశాల ఉంది', type: 'warning', options: ['School Ahead', 'Hospital', 'No Entry', 'Stop'], answer: 'School Ahead' }
  ],
  ur: [
    { sign: 'داخلہ ممنوع', type: 'danger', options: ['No Entry', 'Hospital Ahead', 'One Way', 'Speed Limit'], answer: 'No Entry' },
    { sign: 'تمباکو نوشی منع ہے', type: 'warning', options: ['Wet Floor', 'No Smoking', 'Toxic Danger', 'Keep Left'], answer: 'No Smoking' },
    { sign: 'خطرہ', type: 'danger', options: ['Danger', 'Exit', 'Restaurant', 'Free Parking'], answer: 'Danger' },
    { sign: 'خاموش علاقہ', type: 'info', options: ['Construction Zone', 'Quiet Zone / Silent Zone', 'Speed Breaker', 'No Parking'], answer: 'Quiet Zone / Silent Zone' },
    { sign: 'کوڑا مت پھینکیں', type: 'info', options: ['Keep Left', 'No Littering', 'Do Not Touch', 'Emergency Exit'], answer: 'No Littering' },
    { sign: 'رکیں', type: 'danger', options: ['Stop', 'Go', 'Yield', 'Slow Down'], answer: 'Stop' },
    { sign: 'رفتار کی حد', type: 'info', options: ['Speed Limit', 'No Entry', 'Stop', 'Hospital'], answer: 'Speed Limit' },
    { sign: 'یکطرفہ راستہ', type: 'warning', options: ['One Way', 'Two Way', 'U-Turn', 'Stop'], answer: 'One Way' },
    { sign: 'آگے ہسپتال ہے', type: 'info', options: ['Hospital Ahead', 'School Ahead', 'Market', 'Bus Stop'], answer: 'Hospital Ahead' },
    { sign: 'آگے سکول ہے', type: 'warning', options: ['School Ahead', 'Hospital', 'No Entry', 'Stop'], answer: 'School Ahead' }
  ]
};

// 2. WORD_SPRINT fallback data
const WORD_SPRINT_DATA = {
  hi: {
    words: [
      { target: 'नमस्ते', translation: 'hello' },
      { target: 'पानी', translation: 'water' },
      { target: 'किताब', translation: 'book' },
      { target: 'घर', translation: 'house' },
      { target: 'खाना', translation: 'food' },
      { target: 'कल', translation: 'tomorrow' }
    ]
  },
  ur: {
    words: [
      { target: 'سلام', translation: 'hello' },
      { target: 'پانی', translation: 'water' },
      { target: 'کتاب', translation: 'book' },
      { target: 'گھر', translation: 'house' },
      { target: 'کھانا', translation: 'food' },
      { target: 'کل', translation: 'tomorrow' }
    ]
  },
  en: {
    words: [
      { target: 'hello', translation: 'hello' },
      { target: 'water', translation: 'water' },
      { target: 'book', translation: 'book' },
      { target: 'house', translation: 'house' },
      { target: 'food', translation: 'food' },
      { target: 'tomorrow', translation: 'tomorrow' }
    ]
  },
  bn: {
    words: [
      { target: 'নমস্কার', translation: 'hello' },
      { target: 'জল', translation: 'water' },
      { target: 'বই', translation: 'book' },
      { target: 'বাড়ি', translation: 'house' },
      { target: 'খাবার', translation: 'food' },
      { target: 'আগামীকাল', translation: 'tomorrow' }
    ]
  },
  mr: {
    words: [
      { target: 'नमस्कार', translation: 'hello' },
      { target: 'पाणी', translation: 'water' },
      { target: 'पुस्तक', translation: 'book' },
      { target: 'घर', translation: 'house' },
      { target: 'अन्न', translation: 'food' },
      { target: 'उद्या', translation: 'tomorrow' }
    ]
  },
  mwr: {
    words: [
      { target: 'रामराम', translation: 'hello' },
      { target: 'पाणी', translation: 'water' },
      { target: 'पोथी', translation: 'book' },
      { target: 'घर', translation: 'house' },
      { target: 'जीमण', translation: 'food' },
      { target: 'काले', translation: 'tomorrow' }
    ]
  },
  ta: {
    words: [
      { target: 'வணக்கம்', translation: 'hello' },
      { target: 'தண்ணீர்', translation: 'water' },
      { target: 'புத்தகம்', translation: 'book' },
      { target: 'வீடு', translation: 'house' },
      { target: 'உணவு', translation: 'food' },
      { target: 'நாளை', translation: 'tomorrow' }
    ]
  },
  te: {
    words: [
      { target: 'నమస్కారం', translation: 'hello' },
      { target: 'నీరు', translation: 'water' },
      { target: 'పుస్తకం', translation: 'book' },
      { target: 'ఇల్లు', translation: 'house' },
      { target: 'ఆహారం', translation: 'food' },
      { target: 'రేపు', translation: 'tomorrow' }
    ]
  }
};

// 3. SHOPKEEPER fallback data
const SHOPKEEPER_DATA = {
  hi: {
    items: [
      { name: 'टमाटर', price: 20, emoji: '🍅' },
      { name: 'आलू', price: 10, emoji: '🥔' },
      { name: 'प्याज़', price: 15, emoji: '🧅' }
    ],
    customers: [
      { dialogue: 'नमस्ते! मुझे 2 किलो टमाटर और 1 किलो आलू चाहिए।', targetTomatoes: 2, targetPotatoes: 1, targetOnions: 0, bill: 50 },
      { dialogue: 'सुनिए, मुझे 1 किलो टमाटर और 2 किलो प्याज़ दे दीजिए।', targetTomatoes: 1, targetPotatoes: 0, targetOnions: 2, bill: 50 },
      { dialogue: 'भैया, मुझे 3 किलो आलू और 1 किलो प्याज़ तोल दीजिए।', targetTomatoes: 0, targetPotatoes: 3, targetOnions: 1, bill: 45 }
    ]
  },
  ur: {
    items: [
      { name: 'ٹماٹر', price: 20, emoji: '🍅' },
      { name: 'آلو', price: 10, emoji: '🥔' },
      { name: 'پیاز', price: 15, emoji: '🧅' }
    ],
    customers: [
      { dialogue: 'سلام! مجھے 2 کلو ٹماٹر اور 1 کلو آلو چاہیے۔', targetTomatoes: 2, targetPotatoes: 1, targetOnions: 0, bill: 50 },
      { dialogue: 'سنیے، مجھے 1 کلو ٹماٹر اور 2 کلو پیاز دے دیجیے۔', targetTomatoes: 1, targetPotatoes: 0, targetOnions: 2, bill: 50 },
      { dialogue: 'بھیا، مجھے 3 کلو آلو اور 1 کلو پیاز تول دیجیے۔', targetTomatoes: 0, targetPotatoes: 3, targetOnions: 1, bill: 45 }
    ]
  },
  en: {
    items: [
      { name: 'tomatoes', price: 20, emoji: '🍅' },
      { name: 'potatoes', price: 10, emoji: '🥔' },
      { name: 'onions', price: 15, emoji: '🧅' }
    ],
    customers: [
      { dialogue: 'Hello! I need 2 kg tomatoes and 1 kg potatoes.', targetTomatoes: 2, targetPotatoes: 1, targetOnions: 0, bill: 50 },
      { dialogue: 'Excuse me, please give me 1 kg tomatoes and 2 kg onions.', targetTomatoes: 1, targetPotatoes: 0, targetOnions: 2, bill: 50 },
      { dialogue: 'Brother, please weigh 3 kg potatoes and 1 kg onions for me.', targetTomatoes: 0, targetPotatoes: 3, targetOnions: 1, bill: 45 }
    ]
  },
  bn: {
    items: [
      { name: 'টমেটো', price: 20, emoji: '🍅' },
      { name: 'আলু', price: 10, emoji: '🥔' },
      { name: 'পেঁয়াজ', price: 15, emoji: '🧅' }
    ],
    customers: [
      { dialogue: 'নমস্কার! আমার ২ কেজি টমেটো এবং ১ কেজি আলু লাগবে।', targetTomatoes: 2, targetPotatoes: 1, targetOnions: 0, bill: 50 },
      { dialogue: 'শুনুন, আমাকে ১ কেজি টমেটো এবং ২ কেজি পেঁয়াজ দিন।', targetTomatoes: 1, targetPotatoes: 0, targetOnions: 2, bill: 50 },
      { dialogue: 'দাদা, আমার জন্য ৩ কেজি আলু এবং ১ কেজি পেঁয়াজ ওজন করুন।', targetTomatoes: 0, targetPotatoes: 3, targetOnions: 1, bill: 45 }
    ]
  },
  mr: {
    items: [
      { name: 'टोमॅटो', price: 20, emoji: '🍅' },
      { name: 'बटाटे', price: 10, emoji: '🥔' },
      { name: 'कांदा', price: 15, emoji: '🧅' }
    ],
    customers: [
      { dialogue: 'मला २ किलो टोमॅटो आणि १ किलो बटाटे हवे आहेत.', targetTomatoes: 2, targetPotatoes: 1, targetOnions: 0, bill: 50 },
      { dialogue: 'मला १ किलो टोमॅटो आणि २ किलो कांदा द्या.', targetTomatoes: 1, targetPotatoes: 0, targetOnions: 2, bill: 50 },
      { dialogue: 'माझ्यासाठी ३ किलो बटाटे आणि १ किलो कांदा मोजा.', targetTomatoes: 0, targetPotatoes: 3, targetOnions: 1, bill: 45 }
    ]
  },
  mwr: {
    items: [
      { name: 'टमाटर', price: 20, emoji: '🍅' },
      { name: 'आलू', price: 10, emoji: '🥔' },
      { name: 'प्याज़', price: 15, emoji: '🧅' }
    ],
    customers: [
      { dialogue: 'रामराम! मने २ किलो टमाटर और १ किलो आलू चाईजै।', targetTomatoes: 2, targetPotatoes: 1, targetOnions: 0, bill: 50 },
      { dialogue: 'सुणो, मने १ किलो टमाटर और २ किलो प्याज़ दे देवो।', targetTomatoes: 1, targetPotatoes: 0, targetOnions: 2, bill: 50 },
      { dialogue: 'भाईजी, मने ३ किलो आलू और १ किलो प्याज़ तोल देवो।', targetTomatoes: 0, targetPotatoes: 3, targetOnions: 1, bill: 45 }
    ]
  },
  ta: {
    items: [
      { name: 'தக்காளி', price: 20, emoji: '🍅' },
      { name: 'உருளைக்கிழங்கு', price: 10, emoji: '🥔' },
      { name: 'வெங்காயம்', price: 15, emoji: '🧅' }
    ],
    customers: [
      { dialogue: 'வணக்கம்! எனக்கு 2 கிலோ தக்காளி மற்றும் 1 கிலோ உருளைக்கிழங்கு வேண்டும்.', targetTomatoes: 2, targetPotatoes: 1, targetOnions: 0, bill: 50 },
      { dialogue: 'எனக்கு 1 கிலோ தக்காளி மற்றும் 2 கிலோ வெங்காயம் கொடுங்கள்.', targetTomatoes: 1, targetPotatoes: 0, targetOnions: 2, bill: 50 },
      { dialogue: 'எனக்கு 3 கிலோ உருளைக்கிழங்கு மற்றும் 1 கிலோ வெங்காயம் எடை போடுங்கள்.', targetTomatoes: 0, targetPotatoes: 3, targetOnions: 1, bill: 45 }
    ]
  },
  te: {
    items: [
      { name: 'టమోటాలు', price: 20, emoji: '🍅' },
      { name: 'బంగాళాదుంపలు', price: 10, emoji: '🥔' },
      { name: 'ఉల్లిపాయలు', price: 15, emoji: '🧅' }
    ],
    customers: [
      { dialogue: 'నమస్కారం! నాకు 2 కిలోల టమోటాలు మరియు 1 కిలో బంగాళాదుంపలు కావాలి.', targetTomatoes: 2, targetPotatoes: 1, targetOnions: 0, bill: 50 },
      { dialogue: 'నాకు 1 కిలో టమోటా మరియు 2 కిలోల ఉల్లిపాయలు ఇవ్వండి.', targetTomatoes: 1, targetPotatoes: 0, targetOnions: 2, bill: 50 },
      { dialogue: 'నా కోసం 3 కిలోల బంగాళాదుంపలు మరియు 1 కిలో ఉల్లిపాయలు తూకం వేయండి.', targetTomatoes: 0, targetPotatoes: 3, targetOnions: 1, bill: 45 }
    ]
  }
};

// 4. TEXTDETECTIVE fallback data
const TEXTDETECTIVE_DATA = {
  hi: {
    puzzles: [
      { sentenceParts: ['यह ', 'मेरे ', 'किताब है।'], wrongIdx: 1, wrongWord: 'मेरे ', options: ['मेरी ', 'मेरा ', 'मैं ', 'मुझे '], correctAnswer: 'मेरी ', explanation: 'किताब (Book) स्त्रीलिंग है, इसलिए "मेरी" सही है।' },
      { sentenceParts: ['वह कल बाजार ', 'जाऊँगा।'], wrongIdx: 1, wrongWord: 'जाऊँगा।', options: ['जायेगा।', 'जाओगे।', 'गया था।', 'जायेंगे।'], correctAnswer: 'जायेगा।', explanation: 'अन्य पुरुष "वह" के लिए क्रिया "जायेगा" होगी।' }
    ]
  },
  ur: {
    puzzles: [
      { sentenceParts: ['یہ ', 'میرے ', 'کتاب ہے۔'], wrongIdx: 1, wrongWord: 'میرے ', options: ['میری ', 'میرا ', 'میں ', 'مجھے '], correctAnswer: 'میری ', explanation: 'کتاب स्त्रीलिंग है, इसलिए "میری" सही है।' },
      { sentenceParts: ['وہ کل بازار ', 'جاؤں گا۔'], wrongIdx: 1, wrongWord: 'جاؤں گا۔', options: ['جائے گا۔', 'جاؤ گے۔', 'گیا تھا۔', 'جائیں گے۔'], correctAnswer: 'جائے گا۔', explanation: 'अन्य पुरुष "وہ" के लिए क्रिया "جائے گا" होगी।' }
    ]
  },
  en: {
    puzzles: [
      { sentenceParts: ['These ', 'is ', 'my books.'], wrongIdx: 1, wrongWord: 'is ', options: ['are ', 'was ', 'be ', 'am '], correctAnswer: 'are ', explanation: 'Plural subject "These" requires plural verb "are".' },
      { sentenceParts: ['He ', 'do not ', 'like apples.'], wrongIdx: 1, wrongWord: 'do not ', options: ['does not ', 'did not ', 'is not ', 'are not '], correctAnswer: 'does not ', explanation: 'Singular pronoun "He" requires the auxiliary verb "does".' }
    ]
  },
  bn: {
    puzzles: [
      { sentenceParts: ['এটি ', 'আমারে ', 'বই।'], wrongIdx: 1, wrongWord: 'আমারে ', options: ['আমার ', 'আমাকে ', 'আমি ', 'আমরা '], correctAnswer: 'আমার ', explanation: "'বই' এর সাথে সম্বন্ধপদ 'আমার' হবে।" },
      { sentenceParts: ['সে কাল বাজারে ', 'যাব।'], wrongIdx: 1, wrongWord: 'যাব।', options: ['যাবে।', 'গেছল।', 'যাবে না।', 'যাব।'], correctAnswer: 'যাবে।', explanation: "প্রথম পুরুষ 'সে' এর সাথে ক্রিয়া 'যাবে' হবে।" }
    ]
  },
  mr: {
    puzzles: [
      { sentenceParts: ['ती ', 'पुस्तक आहे.'], wrongIdx: 0, wrongWord: 'ती ', options: ['ते ', 'तो ', 'ती ', 'त्या '], correctAnswer: 'ते ', explanation: "मराठीत 'पुस्तक' हा नपुंसकलिंगी शब्द असल्याने 'ते' योग्य आहे।" },
      { sentenceParts: ['तो उद्या बाजारात ', 'जाऊ.'], wrongIdx: 1, wrongWord: 'जाऊ.', options: ['जाईल.', 'गेला.', 'जाणार.', 'जाऊ.'], correctAnswer: 'जाईल.', explanation: "तृतीय पुरुष 'तो' साठी 'जाईल' क्रियापद योग्य आहे।" }
    ]
  },
  mwr: {
    puzzles: [
      { sentenceParts: ['यो ', 'म्हारो ', 'पोथी है।'], wrongIdx: 1, wrongWord: 'म्हारो ', options: ['म्हारी ', 'म्हारो ', 'मने ', 'मैं '], correctAnswer: 'म्हारी ', explanation: 'पोथी स्त्रीलिंग है, ज्यूं "म्हारी" सही है।' },
      { sentenceParts: ['वो काल बजार ', 'जाऊँगा।'], wrongIdx: 1, wrongWord: 'जाऊँगा।', options: ['जासी।', 'जावेला।', 'गयो हो।', 'जाऊँगा।'], correctAnswer: 'जासी।', explanation: 'अन्य पुरुष "वो" के लिए क्रिया "जासी" सही है।' }
    ]
  },
  ta: {
    puzzles: [
      { sentenceParts: ['அது ', 'என்னோடு ', 'புத்தகம்.'], wrongIdx: 1, wrongWord: 'என்னோடு ', options: ['என்னுடைய ', 'எனக்கு ', 'நான் ', 'நம்முடைய '], correctAnswer: 'என்னுடைய ', explanation: "'புத்தகம்' என்ற பெயர்ச்சொல்லுடன் 'என்னுடைய' என்ற உரிமைப் பெயர் வர வேண்டும்." },
      { sentenceParts: ['அவன் நாளை கடைக்கு ', 'போவேன்.'], wrongIdx: 1, wrongWord: 'போவேன்.', options: ['போவான்.', 'போனாள்.', 'போனான்.', 'போவேன்.'], correctAnswer: 'போவான்.', explanation: "'அவன்' என்ற படர்க்கை ஆண்பாலுக்கு 'போவான்' என்பதே சரி." }
    ]
  },
  te: {
    puzzles: [
      { sentenceParts: ['అది ', 'నాకు ', 'పుస్తకం.'], wrongIdx: 1, wrongWord: 'నాకు ', options: ['నా ', 'నన్ను ', 'నేను ', 'మన '], correctAnswer: 'నా ', explanation: "'పుస్తకం' తో పాటు 'నా' అనే విభక్తి రూపం రావాలి." },
      { sentenceParts: ['అతడు రేపు బజారుకు ', 'వెళ్తాను.'], wrongIdx: 1, wrongWord: 'వెళ్తాను.', options: ['వెళ్తాడు.', 'వెళ్తాను.', 'వెళ్లాడు.', 'వెళ్తాము.'], correctAnswer: 'వెళ్తాడు.', explanation: "'అతడు' అనే ప్రథమ పురుష ఏకవచనానికి 'వెళ్తాడు' అనేది సరైన క్రియ." }
    ]
  }
};

const languages = ['hi', 'en', 'bn', 'mr', 'mwr', 'ta', 'te', 'ur'];

// Write SignReader files
languages.forEach(lang => {
  const data = { signs: SIGN_DATA[lang] || SIGN_DATA['en'] };
  fs.writeFileSync(path.join(targetDir, `signreader_${lang}.json`), JSON.stringify(data, null, 2), 'utf8');
});

// Write WordSprint files
languages.forEach(lang => {
  const data = WORD_SPRINT_DATA[lang] || WORD_SPRINT_DATA['en'];
  fs.writeFileSync(path.join(targetDir, `wordsprint_${lang}.json`), JSON.stringify(data, null, 2), 'utf8');
});

// Write ShopKeeper files
languages.forEach(lang => {
  const data = SHOPKEEPER_DATA[lang] || SHOPKEEPER_DATA['en'];
  fs.writeFileSync(path.join(targetDir, `shopkeeper_${lang}.json`), JSON.stringify(data, null, 2), 'utf8');
});

// Write TextDetective files
languages.forEach(lang => {
  const data = TEXTDETECTIVE_DATA[lang] || TEXTDETECTIVE_DATA['en'];
  fs.writeFileSync(path.join(targetDir, `textdetective_${lang}.json`), JSON.stringify(data, null, 2), 'utf8');
});

console.log('All multilingual fallback games data generated successfully!');
