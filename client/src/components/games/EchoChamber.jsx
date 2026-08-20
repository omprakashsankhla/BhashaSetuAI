import React, { useState, useRef, useEffect } from 'react';
import { Award, Mic, MicOff, Volume2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { speakText as ttsSpeak } from '../../utils/ttsHelper';

const TWISTERS_DATA = {
  hi: [
    { id: 1, text: 'ऊंट उकडूं-उकडूं उबलता ऊंटनी ऊपर', meaning: 'The camel squats bouncing on the she-camel.', expected: 'ऊंट उकडूं उकडूं उबलता ऊंटनी ऊपर' },
    { id: 2, text: 'डाली पर पड़ी थी पकी-पकी पपैया पीली-पीली', meaning: 'Ripe yellow papayas were on the branch.', expected: 'डाली पर पड़ी थी पकी पकी पपैया पीली पीली' },
    { id: 3, text: 'जो हँसेगा वो फँसेगा जो फँसेगा वो हँसेगा', meaning: 'He who laughs will get trapped, he who is trapped will laugh.', expected: 'जो हँसेगा वो फँसेगा जो फँसेगा वो हँसेगा' },
    { id: 4, text: 'तीन तोते तीन टोपी ओढ़कर तीन ताल में तैरते', meaning: 'Three parrots wearing three hats swim in three ponds.', expected: 'तीन तोते तीन टोपी ओढ़कर तीन ताल में तैरते' },
    { id: 5, text: 'गड्ढे में गड़बड़ गड़गड़ गडरिया गुड़ गोबर', meaning: 'Chaos in the pit, shepherd with jaggery and dung.', expected: 'गड्ढे में गड़बड़ गड़गड़ गडरिया गुड़ गोबर' },
    { id: 6, text: 'भालू भागा भीड़ में भीड़ में भागा भालू', meaning: 'The bear ran into the crowd, the bear ran in the crowd.', expected: 'भालू भागा भीड़ में भीड़ में भागा भालू' },
    { id: 7, text: 'मछली मच्छर में मच्छर मछली में मच्छर मर गया', meaning: 'Fish in mosquito, mosquito in fish, mosquito died.', expected: 'मछली मच्छर में मच्छर मछली में मच्छर मर गया' },
    { id: 8, text: 'ठठेरा ठठेरी को ठोक ठोककर ठीक करता था', meaning: 'The tinsmith fixed things by hammering.', expected: 'ठठेरा ठठेरी को ठोक ठोककर ठीक करता था' },
    { id: 9, text: 'कच्ची मिट्टी पक्की मिट्टी कच्ची ईंट पक्की ईंट', meaning: 'Raw clay, baked clay, raw brick, baked brick.', expected: 'कच्ची मिट्टी पक्की मिट्टी कच्ची ईंट पक्की ईंट' },
    { id: 10, text: 'नानी ने नानी को नानी कहा नानी ने नानी को मानी', meaning: 'Grandma called grandma "grandma" and grandma agreed.', expected: 'नानी ने नानी को नानी कहा नानी ने नानी को मानी' }
  ],
  en: [
    { id: 1, text: 'How much wood would a woodchuck chuck if a woodchuck could chuck wood', meaning: 'A classic question about a woodchuck\'s wood-chucking ability.', expected: 'how much wood would a woodchuck chuck if a woodchuck could chuck wood' },
    { id: 2, text: 'Fuzzy Wuzzy was a bear, Fuzzy Wuzzy had no hair', meaning: 'A bear named Fuzzy Wuzzy was ironically bald.', expected: 'fuzzy wuzzy was a bear fuzzy wuzzy had no hair' },
    { id: 3, text: 'I scream, you scream, we all scream for ice cream', meaning: 'Everyone screams for ice cream.', expected: 'i scream you scream we all scream for ice cream' },
    { id: 4, text: 'A proper copper coffee pot', meaning: 'Describing a coffee pot made of proper copper.', expected: 'a proper copper coffee pot' },
    { id: 5, text: 'Toy boat, toy boat, toy boat', meaning: 'Repeat toy boat three times quickly.', expected: 'toy boat toy boat toy boat' },
    { id: 6, text: 'Unique New York, unique New York, you know you need unique New York', meaning: 'An exercise in articulating unique and New York rapidly.', expected: 'unique new york unique new york you know you need unique new york' },
    { id: 7, text: 'The thirty-three thieves thought that they thrilled the throne throughout Thursday', meaning: 'Thirty-three thieves and their thoughts on a throne on Thursday.', expected: 'the thirty three thieves thought that they thrilled the throne throughout thursday' },
    { id: 8, text: 'Which wristwatch is a Swiss wristwatch', meaning: 'A challenge with w, s, and ch sounds.', expected: 'which wristwatch is a swiss wristwatch' },
    { id: 9, text: 'Can you can a canned can into an uncanned can like a canner can can a canned can', meaning: 'A convoluted sentence about canning cans.', expected: 'can you can a canned can into an uncanned can like a canner can can a canned can' },
    { id: 10, text: 'If two witches were watching two watches, which witch would watch which watch', meaning: 'Two witches and two watches — who watches what?', expected: 'if two witches were watching two watches which witch would watch which watch' }
  ],
  bn: [
    { id: 1, text: 'কাচা কলা পাকা কলা কাচা কলা পাকা কলা', meaning: 'Raw banana, ripe banana — repeat quickly.', expected: 'কাচা কলা পাকা কলা কাচা কলা পাকা কলা' },
    { id: 2, text: 'পাকা পেঁপে পাকা পেঁপে কাঁচা পেঁপে কাঁচা পেঁপে', meaning: 'Ripe papaya, raw papaya — repeat rapidly.', expected: 'পাকা পেঁপে পাকা পেঁপে কাঁচা পেঁপে কাঁচা পেঁপে' },
    { id: 3, text: 'হাতি গাছে চড়ে না, গাছে চড়ে বাঁদর', meaning: 'Elephants don\'t climb trees, monkeys climb trees.', expected: 'হাতি গাছে চড়ে না গাছে চড়ে বাঁদর' },
    { id: 4, text: 'ঝিঁঝিঁ পোকা ঝিঁঝিঁ করে ঝিঁঝিঁর ঝাঁকে ঝিঁঝিঁ পোকা', meaning: 'Crickets chirp in a swarm of crickets.', expected: 'ঝিঁঝিঁ পোকা ঝিঁঝিঁ করে ঝিঁঝিঁর ঝাঁকে ঝিঁঝিঁ পোকা' },
    { id: 5, text: 'তিন তিতির তিনটি তেতো তেঁতুল তুলে তেড়েফুড়ে তোলে', meaning: 'Three partridges pick three sour tamarinds clumsily.', expected: 'তিন তিতির তিনটি তেতো তেঁতুল তুলে তেড়েফুড়ে তোলে' },
    { id: 6, text: 'গোল গোল গোলাপ গোলাপের গাছে গোল গোল জল', meaning: 'Round roses on rose bushes with round water drops.', expected: 'গোল গোল গোলাপ গোলাপের গাছে গোল গোল জল' },
    { id: 7, text: 'ঢাকা ঢাকি ঢোল বাজায় ঢোলের তালে ঢাক বাজে', meaning: 'Dhaka drums play to the beat of the drum.', expected: 'ঢাকা ঢাকি ঢোল বাজায় ঢোলের তালে ঢাক বাজে' },
    { id: 8, text: 'বকবক করে বক পাখি বকের ঝাঁকে বক পাখি', meaning: 'The crane bird chatters; cranes in a flock.', expected: 'বকবক করে বক পাখি বকের ঝাঁকে বক পাখি' },
    { id: 9, text: 'চাচা চাচি চিনি চায় চিনির চামচে চাচা চিনি চান', meaning: 'Uncle and aunt want sugar, uncle takes sugar with a spoon.', expected: 'চাচা চাচি চিনি চায় চিনির চামচে চাচা চিনি চান' },
    { id: 10, text: 'কটকটে কাক কট কট করে কাটে কাক কটকটে', meaning: 'The crunchy crow crunches crunchily.', expected: 'কটকটে কাক কট কট করে কাটে কাক কটকটে' }
  ],
  mr: [
    { id: 1, text: 'काळ्या माकडाने काळा कबुतर काळ्या काचेत काढला', meaning: 'The black monkey pulled the black pigeon through the black glass.', expected: 'काळ्या माकडाने काळा कबुतर काळ्या काचेत काढला' },
    { id: 2, text: 'कच्चा पपद पक्का पपद कच्चा पपद पक्का पपद', meaning: 'Raw papad, crisp papad — repeat quickly.', expected: 'कच्चा पपद पक्का पपद कच्चा पपद पक्का पपद' },
    { id: 3, text: 'बाबा बगळ्याच्या बागेत बसून बटाटे भाजत होता', meaning: 'Baba was roasting potatoes sitting in the crane\'s garden.', expected: 'बाबा बगळ्याच्या बागेत बसून बटाटे भाजत होता' },
    { id: 4, text: 'टपटप टपकतो टपोरा, टपोरा टपकतो टपटप', meaning: 'The fat drop drips, dripping fatly.', expected: 'टपटप टपकतो टपोरा टपोरा टपकतो टपटप' },
    { id: 5, text: 'मासळी मासे मारते मारता मारता मासे मरते', meaning: 'The fisherman catches fish; while catching, fish die.', expected: 'मासळी मासे मारते मारता मारता मासे मरते' },
    { id: 6, text: 'गोळ गोळ गोळी गुळाच्या गोळीला गोड गोड गोळी', meaning: 'Round, round pill — the jaggery pill is sweet.', expected: 'गोळ गोळ गोळी गुळाच्या गोळीला गोड गोड गोळी' },
    { id: 7, text: 'शिशिर शेतात शेवग्याचे शेंग शिजवतो', meaning: 'Shishir cooks drumstick pods in the field.', expected: 'शिशिर शेतात शेवग्याचे शेंग शिजवतो' },
    { id: 8, text: 'ढोलकीचा ढोल ढमढम वाजतो ढोलकीवाला ढणढण', meaning: 'The dholki drum beats dhum-dhum, the drummer beats dhan-dhan.', expected: 'ढोलकीचा ढोल ढमढम वाजतो ढोलकीवाला ढणढण' },
    { id: 9, text: 'चार चोर चार चोपड्या चोरून चौकात चालले', meaning: 'Four thieves stole four books and walked to the square.', expected: 'चार चोर चार चोपड्या चोरून चौकात चालले' },
    { id: 10, text: 'पाऊस पडतो पटापट पटापट पडतो पाऊस', meaning: 'Rain falls pat-a-pat, pat-a-pat falls rain.', expected: 'पाऊस पडतो पटापट पटापट पडतो पाऊस' }
  ],
  mwr: [
    { id: 1, text: 'ऊंट ऊभो ऊंच ऊंच ऊभारै ऊंटनी ऊपर', meaning: 'The camel stands tall, towering over the she-camel.', expected: 'ऊंट ऊभो ऊंच ऊंच ऊभारै ऊंटनी ऊपर' },
    { id: 2, text: 'काचो पापड़ पाको पापड़ काचो पापड़ पाको पापड़', meaning: 'Raw papad, cooked papad — repeat rapidly.', expected: 'काचो पापड़ पाको पापड़ काचो पापड़ पाको पापड़' },
    { id: 3, text: 'छत पर छिपकली छम छम चढ़ती छत री छिपकली', meaning: 'The lizard climbs the roof pitter-patter.', expected: 'छत पर छिपकली छम छम चढ़ती छत री छिपकली' },
    { id: 4, text: 'भैंसा भागो भीड़ में भीड़ में भागो भैंसा', meaning: 'The buffalo ran into the crowd, the buffalo ran in the crowd.', expected: 'भैंसा भागो भीड़ में भीड़ में भागो भैंसा' },
    { id: 5, text: 'घड़ो फूटयो गड़बड़ गड़बड़ गडरिया गुड़ गोबर', meaning: 'The pot broke — chaos, shepherd, jaggery, dung.', expected: 'घड़ो फूटयो गड़बड़ गड़बड़ गडरिया गुड़ गोबर' },
    { id: 6, text: 'तीन ताऊ तीन टोपी ओढ़कर तीन ताळी मे तैरै', meaning: 'Three uncles wearing three hats swim in three ponds.', expected: 'तीन ताऊ तीन टोपी ओढ़कर तीन ताळी मे तैरै' },
    { id: 7, text: 'बाबो बगीचा मे बैठ बडो बटाटो भुणै', meaning: 'The old man sits in the garden roasting big potatoes.', expected: 'बाबो बगीचा मे बैठ बडो बटाटो भुणै' },
    { id: 8, text: 'नानी ने नानो ने नाची नानो ने नानी ने नचायो', meaning: 'Grandma and grandson danced, grandson made grandma dance.', expected: 'नानी ने नानो ने नाची नानो ने नानी ने नचायो' },
    { id: 9, text: 'ठेठ ठाकुर ठेका ठोंकर ठगयो ठेला ठेलर', meaning: 'The staunch Thakur stamped the contract and cheated the cart-pusher.', expected: 'ठेठ ठाकुर ठेका ठोंकर ठगयो ठेला ठेलर' },
    { id: 10, text: 'मोर मोरनी मे मगन मोरनी मोर मे मगन', meaning: 'The peacock is lost in the peahen, the peahen in the peacock.', expected: 'मोर मोरनी मे मगन मोरनी मोर मे मगन' }
  ],
  ta: [
    { id: 1, text: 'குரு கொக்கு குரு குருவி கொக்கு குருவி குரு', meaning: 'Crane, sparrow — the crane and sparrow alternate rapidly.', expected: 'குரு கொக்கு குரு குருவி கொக்கு குருவி குரு' },
    { id: 2, text: 'பப்பாளி பழம் பழுத்த பப்பாளி பழம் பச்சை பப்பாளி', meaning: 'Papaya fruit, ripe papaya fruit, green papaya.', expected: 'பப்பாளி பழம் பழுத்த பப்பாளி பழம் பச்சை பப்பாளி' },
    { id: 3, text: 'பம்பரம் பம்பரம் சுத்தும் பம்பரம் சுத்த சுத்த பம்பரம்', meaning: 'Spinning top, spinning top, the top spins round and round.', expected: 'பம்பரம் பம்பரம் சுத்தும் பம்பரம் சுத்த சுத்த பம்பரம்' },
    { id: 4, text: 'வாழை வாழை வாழைப்பழம் வாழைப்பழம் வாழை வாழை', meaning: 'Banana banana banana-fruit, banana-fruit banana banana.', expected: 'வாழை வாழை வாழைப்பழம் வாழைப்பழம் வாழை வாழை' },
    { id: 5, text: 'மாமா மாமா மாங்காய் வாங்கி வா மாமா', meaning: 'Uncle uncle, buy raw mangoes, uncle.', expected: 'மாமா மாமா மாங்காய் வாங்கி வா மாமா' },
    { id: 6, text: 'ஆட்டுக்குட்டி ஆடும் ஆட்டம் ஆடு ஆடும் ஆட்டம்', meaning: 'The goat kid dances the dance the goat dances.', expected: 'ஆட்டுக்குட்டி ஆடும் ஆட்டம் ஆடு ஆடும் ஆட்டம்' },
    { id: 7, text: 'கிளி கிளி கிளிச்சொல் கிளிக்கு கிளிச்சொல் சொல்', meaning: 'Parrot, parrot — tell the parrot the parrot-word.', expected: 'கிளி கிளி கிளிச்சொல் கிளிக்கு கிளிச்சொல் சொல்' },
    { id: 8, text: 'பூனை பூனை பால் குடிக்கும் பூனை பூனை பால் கொட்டும் பூனை', meaning: 'Cat cat drinks milk, cat cat spills milk.', expected: 'பூனை பூனை பால் குடிக்கும் பூனை பூனை பால் கொட்டும் பூனை' },
    { id: 9, text: 'குட்டி குரங்கு குதிக்கும் குரங்கு குட்டி குரங்கு குதித்தது', meaning: 'Little monkey jumps — the little monkey jumped.', expected: 'குட்டி குரங்கு குதிக்கும் குரங்கு குட்டி குரங்கு குதித்தது' },
    { id: 10, text: 'தட்டு தட்டு தட்டில் தட்டு தட்டுன்னு தட்டு', meaning: 'Tap tap, tap on the plate, tap with a tap.', expected: 'தட்டு தட்டு தட்டில் தட்டு தட்டுன்னு தட்டு' }
  ],
  te: [
    { id: 1, text: 'కాకి కాకి కావు కావు కాకి కాకికి కావు', meaning: 'Crow crow caw caw — the crow caws at the crow.', expected: 'కాకి కాకి కావు కావు కాకి కాకికి కావు' },
    { id: 2, text: 'బొమ్మ బొమ్మ బొమ్మల బొమ్మ బొమ్మల బొమ్మ బొమ్మ', meaning: 'Doll doll, doll of dolls, doll of dolls doll.', expected: 'బొమ్మ బొమ్మ బొమ్మల బొమ్మ బొమ్మల బొమ్మ బొమ్మ' },
    { id: 3, text: 'చిలక చిలక చిలకమ్మ చిలకకు చిలకమ్మ చెప్పింది', meaning: 'Parrot parrot, the she-parrot told the parrot.', expected: 'చిలక చిలక చిలకమ్మ చిలకకు చిలకమ్మ చెప్పింది' },
    { id: 4, text: 'గొర్రె గొర్రె గొర్రెల గొర్రె గొర్రెల మంద గొర్రె', meaning: 'Sheep sheep, sheep of sheep, flock sheep.', expected: 'గొర్రె గొర్రె గొర్రెల గొర్రె గొర్రెల మంద గొర్రె' },
    { id: 5, text: 'పిల్లి పాలు పట్టి పారింది పాలు పట్టిన పిల్లి', meaning: 'The cat grabbed the milk and ran — the milk-grabbing cat.', expected: 'పిల్లి పాలు పట్టి పారింది పాలు పట్టిన పిల్లి' },
    { id: 6, text: 'కుక్క కుక్క కుక్కపిల్ల కుక్కపిల్ల కుక్కకు కుక్క', meaning: 'Dog dog puppy puppy — dog to the dog.', expected: 'కుక్క కుక్క కుక్కపిల్ల కుక్కపిల్ల కుక్కకు కుక్క' },
    { id: 7, text: 'చెట్టు చెట్టు చెట్టుపై చిలక చెట్టు చిలక చెట్టుపై', meaning: 'Tree tree, parrot on the tree, tree parrot on the tree.', expected: 'చెట్టు చెట్టు చెట్టుపై చిలక చెట్టు చిలక చెట్టుపై' },
    { id: 8, text: 'పాము పాము పాముల పాము పాముల మంద పాము', meaning: 'Snake snake, snake of snakes, snake herd snake.', expected: 'పాము పాము పాముల పాము పాముల మంద పాము' },
    { id: 9, text: 'తాత తాత తాతయ్య తాతకు తాతయ్య తాత', meaning: 'Grandpa grandpa, grandpa to grandpa, grandpa is grandpa.', expected: 'తాత తాత తాతయ్య తాతకు తాతయ్య తాత' },
    { id: 10, text: 'ఎర్ర లారీ పచ్చ లారీ ఎర్ర లారీ పచ్చ లారీ', meaning: 'Red lorry green lorry — repeat rapidly.', expected: 'ఎర్ర లారీ పచ్చ లారీ ఎర్ర లారీ పచ్చ లారీ' }
  ],
  ur: [
    { id: 1, text: 'تقی نے تکیے کے نیچے تقاضا کیا تقی', meaning: 'Taqi made a request under the pillow.', expected: 'تقی نے تکیے کے نیچے تقاضا کیا تقی' },
    { id: 2, text: 'لال لال لال لالہ لال لالہ لال لال', meaning: 'Red red red Lala, red Lala red red.', expected: 'لال لال لال لالہ لال لالہ لال لال' },
    { id: 3, text: 'بلبل بولے بولی بولی بلبل کی بولی بلبل', meaning: 'The nightingale speaks its language — nightingale\'s tongue.', expected: 'بلبل بولے بولی بولی بلبل کی بولی بلبل' },
    { id: 4, text: 'پپیتا پکا پپیتا کچا پپیتا پکا پپیتا', meaning: 'Ripe papaya, raw papaya, ripe papaya.', expected: 'پپیتا پکا پپیتا کچا پپیتا پکا پپیتا' },
    { id: 5, text: 'اونٹ اونٹنی پر اونٹنی اونٹ پر اونٹ', meaning: 'Camel on she-camel, she-camel on camel.', expected: 'اونٹ اونٹنی پر اونٹنی اونٹ پر اونٹ' },
    { id: 6, text: 'مچھلی مچھلی مچھلی مچھیرا مچھلی مارے', meaning: 'Fish fish fish — the fisherman catches fish.', expected: 'مچھلی مچھلی مچھلی مچھیرا مچھلی مارے' },
    { id: 7, text: 'ڈھول ڈھولکی ڈھم ڈھم بجائے ڈھولکی والا ڈھن ڈھن', meaning: 'The drum and dholki beat dhum-dhum, the drummer beats dhan-dhan.', expected: 'ڈھول ڈھولکی ڈھم ڈھم بجائے ڈھولکی والا ڈھن ڈھن' },
    { id: 8, text: 'بچے بھاگ بھاگ کر بھاگے بھاگتے بچے بھاگے', meaning: 'Children ran running, running children ran.', expected: 'بچے بھاگ بھاگ کر بھاگے بھاگتے بچے بھاگے' },
    { id: 9, text: 'چار چور چار چادریں چرا کر چوراہے پر چلے', meaning: 'Four thieves stole four sheets and walked to the crossroad.', expected: 'چار چور چار چادریں چرا کر چوراہے پر چلے' },
    { id: 10, text: 'کلی کلی کھلی کھلی کلی کلیاں کھلیں کھلیں', meaning: 'Buds bloomed, blossomed buds bloomed open.', expected: 'کلی کلی کھلی کھلی کلی کلیاں کھلیں کھلیں' }
  ]
};

const getTwisters = (lang) => TWISTERS_DATA[lang] || TWISTERS_DATA['hi'] || TWISTERS_DATA['en'];
const LANG_REC_MAP = { hi: 'hi-IN', ur: 'ur-PK', en: 'en-US', bn: 'bn-IN', mr: 'mr-IN', mwr: 'hi-IN', ta: 'ta-IN', te: 'te-IN' };


const EchoChamber = ({ onGameComplete }) => {
  const { i18n } = useTranslation();
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const learningLang = storedUser.learning_language || 'hi';
  const interfaceLang = i18n.language?.split('-')[0] || learningLang;
  const list = getTwisters(learningLang);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState(null); // 'great' | 'try-again'
  const [transcript, setTranscript] = useState('');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const recognitionRef = useRef(null);
  const activeTwister = list[currentIdx];

  // Multilingual UI text
  const UI = {
    hi: {
      twister: 'ट्विस्टर',
      score: 'स्कोर',
      completed: 'ध्वनि ट्विस्टर पूर्ण!',
      earnedPts: (s) => `आपने ${s} अंक अर्जित किए!`,
      replay: 'फिर से खेलें',
      instruction: 'इस जीभ-मोड़ वाक्य को जितना तेज़ और स्पष्ट हो सके बोलें:',
      meaning: 'अर्थ',
      hearExample: 'उदाहरण सुनें',
      listening: 'सुन रहे हैं... बोलें!',
      tapMic: 'बोलने के लिए माइक दबाएं',
      youSaid: 'आपने कहा',
      great: '🎉 शानदार उच्चारण लय!',
      tryAgain: '❌ फिर से उच्चारण करें।',
      continue: 'आगे बढ़ें →',
      speechNotSupported: 'आपके ब्राउज़र में स्पीच रिकग्निशन उपलब्ध नहीं है। कृपया Chrome या Edge का उपयोग करें।'
    },
    en: {
      twister: 'Twister',
      score: 'Score',
      completed: 'Echo Twisters Completed!',
      earnedPts: (s) => `You earned ${s} points speaking fluently!`,
      replay: 'Replay',
      instruction: 'Read this tongue twister aloud as fast and clearly as possible:',
      meaning: 'meaning',
      hearExample: 'Hear Example',
      listening: 'Listening... Speak!',
      tapMic: 'Tap Mic to Speak',
      youSaid: 'You said',
      great: '🎉 Fantastic pronunciation rhythm!',
      tryAgain: '❌ Try pronouncing again.',
      continue: 'Continue →',
      speechNotSupported: 'Speech recognition is not supported in your browser. Please use Chrome or Edge.'
    },
    bn: {
      twister: 'জিভ খেলা',
      score: 'স্কোর',
      completed: 'ধ্বনি খেলা সম্পূর্ণ!',
      earnedPts: (s) => `আপনি ${s} পয়েন্ট অর্জন করেছেন!`,
      replay: 'আবার খেলুন',
      instruction: 'এই জিভ-মোড়ক বাক্যটি যত দ্রুত এবং স্পষ্টভাবে সম্ভব পড়ুন:',
      meaning: 'অর্থ',
      hearExample: 'উদাহরণ শুনুন',
      listening: 'শুনছি... বলুন!',
      tapMic: 'মাইকে ট্যাপ করুন',
      youSaid: 'আপনি বললেন',
      great: '🎉 চমৎকার উচ্চারণ!',
      tryAgain: '❌ আবার চেষ্টা করুন।',
      continue: 'পরবর্তী →',
      speechNotSupported: 'আপনার ব্রাউজারে স্পিচ রিকগনিশন উপলভ্য নয়। অনুগ্রহ করে Chrome বা Edge ব্যবহার করুন।'
    },
    mr: {
      twister: 'जिभेचे व्यायाम',
      score: 'गुण',
      completed: 'ध्वनी व्यायाम पूर्ण!',
      earnedPts: (s) => `तुम्ही ${s} गुण मिळवले!`,
      replay: 'पुन्हा खेळा',
      instruction: 'हे जीभ-मोडणारे वाक्य जितक्या वेगाने आणि स्पष्टपणे शक्य तितके वाचा:',
      meaning: 'अर्थ',
      hearExample: 'उदाहरण ऐका',
      listening: 'ऐकतोय... बोला!',
      tapMic: 'माइकवर टॅप करा',
      youSaid: 'तुम्ही म्हणालात',
      great: '🎉 उत्तम उच्चारण!',
      tryAgain: '❌ पुन्हा प्रयत्न करा.',
      continue: 'पुढे →',
      speechNotSupported: 'तुमच्या ब्राउझरमध्ये स्पीच रिकग्निशन उपलब्ध नाही. कृपया Chrome किंवा Edge वापरा.'
    },
    mwr: {
      twister: 'जीभ रो खेल',
      score: 'स्कोर',
      completed: 'ध्वनि खेल पूरो!',
      earnedPts: (s) => `थांने ${s} अंक मिलया!`,
      replay: 'फेर सू खेलो',
      instruction: 'इण जीभ-मोड़ बात ने जितणा तेज़ अर साफ़ हो सकै बोलो:',
      meaning: 'अर्थ',
      hearExample: 'उदाहरण सुणो',
      listening: 'सुण रह्या हां... बोलो!',
      tapMic: 'बोलबा सारू माइक दबाओ',
      youSaid: 'थांने कह्यो',
      great: '🎉 घणो चोखो उच्चारण!',
      tryAgain: '❌ फेर सू बोलो।',
      continue: 'आगे बढ़ो →',
      speechNotSupported: 'थांरे ब्राउज़र मे स्पीच रिकग्निशन कोनी है। Chrome या Edge काम मे लेवो।'
    },
    ta: {
      twister: 'நா நெகிழ் பயிற்சி',
      score: 'மதிப்பெண்',
      completed: 'ஒலி பயிற்சி முடிந்தது!',
      earnedPts: (s) => `நீங்கள் ${s} புள்ளிகள் பெற்றீர்கள்!`,
      replay: 'மீண்டும் விளையாடு',
      instruction: 'இந்த நா நெகிழ் வாக்கியத்தை விரைவாகவும் தெளிவாகவும் படியுங்கள்:',
      meaning: 'பொருள்',
      hearExample: 'எடுத்துக்காட்டு கேளுங்கள்',
      listening: 'கேட்கிறேன்... பேசுங்கள்!',
      tapMic: 'பேச மைக்கைத் தட்டுங்கள்',
      youSaid: 'நீங்கள் சொன்னது',
      great: '🎉 அருமையான உச்சரிப்பு!',
      tryAgain: '❌ மீண்டும் முயற்சிக்கவும்.',
      continue: 'தொடரவும் →',
      speechNotSupported: 'உங்கள் உலாவியில் பேச்சு அறிதல் ஆதரிக்கப்படவில்லை. Chrome அல்லது Edge பயன்படுத்தவும்.'
    },
    te: {
      twister: 'నాలుక మడత',
      score: 'స్కోర్',
      completed: 'ధ్వని పరీక్ష పూర్తయింది!',
      earnedPts: (s) => `మీరు ${s} పాయింట్లు సాధించారు!`,
      replay: 'మళ్ళీ ఆడండి',
      instruction: 'ఈ నాలుక మడత వాక్యాన్ని వీలైనంత వేగంగా మరియు స్పష్టంగా చదవండి:',
      meaning: 'అర్థం',
      hearExample: 'ఉదాహరణ వినండి',
      listening: 'వింటున్నాను... చెప్పండి!',
      tapMic: 'మాట్లాడటానికి మైక్ నొక్కండి',
      youSaid: 'మీరు చెప్పింది',
      great: '🎉 అద్భుతమైన ఉచ్ఛారణ!',
      tryAgain: '❌ మళ్ళీ ప్రయత్నించండి.',
      continue: 'కొనసాగించండి →',
      speechNotSupported: 'మీ బ్రౌజర్‌లో స్పీచ్ రికగ్నిషన్ అందుబాటులో లేదు. దయచేసి Chrome లేదా Edge వాడండి.'
    },
    ur: {
      twister: 'زبان کی مشق',
      score: 'اسکور',
      completed: 'آواز کی مشق مکمل!',
      earnedPts: (s) => `آپ نے ${s} پوائنٹس حاصل کیے!`,
      replay: 'دوبارہ کھیلیں',
      instruction: 'اس زبان توڑ جملے کو جتنی تیزی اور صفائی سے ممکن ہو پڑھیں:',
      meaning: 'معنی',
      hearExample: 'مثال سنیں',
      listening: 'سن رہے ہیں... بولیں!',
      tapMic: 'بولنے کے لیے مائک دبائیں',
      youSaid: 'آپ نے کہا',
      great: '🎉 شاندار تلفظ!',
      tryAgain: '❌ دوبارہ تلفظ کریں۔',
      continue: 'آگے بڑھیں ←',
      speechNotSupported: 'آپ کے براؤزر میں اسپیچ ریکگنیشن دستیاب نہیں ہے۔ براہ کرم Chrome یا Edge استعمال کریں۔'
    }
  };

  const t = UI[interfaceLang] || UI['en'];

  const startRecording = () => {
    setResult(null);
    setTranscript('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t.speechNotSupported);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = LANG_REC_MAP[learningLang] || 'hi-IN';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);

      const cleanText = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
      const cleanExpected = activeTwister.expected.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();

      // Proximity check: check if at least 50% of words are matching
      const userWords = cleanText.split(' ');
      const expectedWords = cleanExpected.split(' ');
      const matchCount = userWords.filter(w => expectedWords.includes(w)).length;

      const accuracy = matchCount / expectedWords.length;
      if (accuracy >= 0.45) {
        setResult('great');
        setScore(s => s + Math.round(accuracy * 100));
      } else {
        setResult('try-again');
      }
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setResult('try-again');
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
    ttsSpeak(activeTwister.text, { rate: 0.8 });
  };

  const handleNext = () => {
    if (currentIdx < list.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setResult(null);
      setTranscript('');
    } else {
      setGameOver(true);
      if (onGameComplete) onGameComplete(score);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setScore(0);
    setGameOver(false);
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #fce7f3, #fbcfe8)', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '580px', margin: '0 auto', border: '2px solid #cbd5e1', boxSizing: 'border-box', textAlign: 'center' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span className="card-badge active" style={{ background: '#db2777', color: 'white' }}>
          {t.twister} {currentIdx + 1} / {list.length}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#be185d', fontWeight: 800 }}>
          <Award size={18} /> {t.score}: {score}
        </div>
      </div>

      {gameOver ? (
        <div style={{ padding: '3rem 0' }}>
          <span style={{ fontSize: '4.5rem' }}>🎤</span>
          <h2 style={{ color: '#be185d', fontSize: '1.8rem', margin: '1rem 0' }}>{t.completed}</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>{t.earnedPts(score)}</p>
          <button onClick={handleRestart} style={{ background: '#db2777', color: 'white', border: 'none', padding: '0.8rem 1.8rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={16} /> {t.replay}
          </button>
        </div>
      ) : (
        <div>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1rem 0', fontWeight: 700 }}>
            {t.instruction}
          </p>

          <div style={{ background: 'white', borderRadius: '20px', padding: '2rem 1.5rem', border: '1px solid #fbcfe8', marginBottom: '1.5rem' }}>
            <h1 style={{ margin: '0 0 0.8rem 0', color: '#be185d', fontSize: '2rem', fontWeight: 900, lineHeight: 1.4 }}>
              {activeTwister?.text}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0, fontStyle: 'italic' }}>
              {t.meaning}: "{activeTwister?.meaning}"
            </p>
          </div>

          <button 
            onClick={speak} 
            style={{ background: '#fdf2f8', border: '1px solid #fbcfe8', color: '#db2777', padding: '0.5rem 1.2rem', borderRadius: '20px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, marginBottom: '2rem' }}
          >
            <Volume2 size={16} /> {t.hearExample}
          </button>

          {/* Mic Record Toggle */}
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              style={{ width: 80, height: 80, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', background: isRecording ? '#ef4444' : '#db2777', boxShadow: isRecording ? '0 0 0 10px rgba(239,68,68,0.2)' : '0 4px 20px rgba(219,39,119,0.3)', transition: 'all 0.3s' }}
            >
              {isRecording ? <MicOff size={30} color="white" /> : <Mic size={30} color="white" />}
            </button>
            <p style={{ color: '#64748b', marginTop: '0.6rem', fontSize: '0.85rem', fontWeight: 700 }}>
              {isRecording ? t.listening : t.tapMic}
            </p>
          </div>

          {transcript && (
            <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              {t.youSaid}: <strong style={{ color: '#be185d' }}>"{transcript}"</strong>
            </p>
          )}

          {result && (
            <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', background: result === 'great' ? '#dcfce7' : '#fee2e2', border: `1px solid ${result === 'great' ? '#bbf7d0' : '#fecaca'}`, animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {result === 'great' ? <CheckCircle size={18} color="#10b981" /> : <AlertCircle size={18} color="#ef4444" />}
                <span style={{ fontWeight: 800, color: result === 'great' ? '#14532d' : '#7f1d1d' }}>
                  {result === 'great' ? t.great : t.tryAgain}
                </span>
              </div>
              {result === 'great' && (
                <button onClick={handleNext} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem' }}>
                  {t.continue}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


export default EchoChamber;
