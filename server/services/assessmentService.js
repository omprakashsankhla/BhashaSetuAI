function determineProficiency(age, educationLevel, requestedLevel) {
  if (!educationLevel) return requestedLevel || 'Beginner';
  
  const edu = educationLevel.toLowerCase();
  const isNoFormal = edu.includes('no formal') || edu.includes('none');
  const isPrimary = edu.includes('primary');
  const isHighSchool = edu.includes('high school');
  const isAdultLiteracy = edu.includes('adult literacy');

  if (age !== null && age !== undefined && age !== '') {
    const ageNum = parseInt(age, 10);
    if (!isNaN(ageNum)) {
      if (ageNum >= 0 && ageNum <= 15) {
        if (isNoFormal || isPrimary) return 'Beginner';
      } else if (ageNum >= 16 && ageNum <= 20) {
        if (isHighSchool) return 'Intermediate';
      } else if (ageNum >= 21 && ageNum <= 49) {
        if (isHighSchool) return 'Advanced';
      } else if (ageNum >= 50) {
        if (isAdultLiteracy) return 'Intermediate';
        if (isNoFormal || isPrimary) return 'Beginner';
        if (isHighSchool) return 'Intermediate';
      }
    }
  }

  // Rest of ages / fallback
  if (isNoFormal || isPrimary) return 'Beginner';
  if (isHighSchool || isAdultLiteracy) return 'Intermediate';
  
  return requestedLevel || 'Beginner';
}

const curriculumBeginner = [
  { title: 'Letters', type: 'reading' },
  { title: 'Vowels', type: 'reading' },
  { title: 'Consonants', type: 'reading' },
  { title: 'Greetings', type: 'speaking' },
  { title: 'Family', type: 'vocabulary' },
  { title: 'Colors', type: 'vocabulary' },
  { title: 'Weekly Assessment', type: 'quiz' },
  { title: 'Numbers', type: 'listening' },
  { title: 'Days of week', type: 'vocabulary' },
  { title: 'Months', type: 'vocabulary' },
  { title: 'Animals', type: 'vocabulary' },
  { title: 'Fruits', type: 'vocabulary' },
  { title: 'Vegetables', type: 'vocabulary' },
  { title: 'Weekly Test', type: 'quiz' },
  { title: 'Sentence Building', type: 'grammar' },
  { title: 'Reading', type: 'reading' },
  { title: 'Listening', type: 'listening' },
  { title: 'Speaking', type: 'speaking' },
  { title: 'Object Identification', type: 'vocabulary' },
  { title: 'Picture Story', type: 'reading' },
  { title: 'Role Play', type: 'speaking' },
  { title: 'Hospital', type: 'speaking' },
  { title: 'Bank', type: 'listening' },
  { title: 'Bus', type: 'speaking' },
  { title: 'Market', type: 'vocabulary' },
  { title: 'Emergency', type: 'speaking' },
  { title: 'Digital Payments', type: 'reading' },
  { title: 'Phone Calls', type: 'speaking' },
  { title: 'Reading Signs', type: 'reading' },
  { title: 'Final Assessment', type: 'quiz' }
];

const curriculumIntermediate = [
  { title: 'Complex Sentence Structures', type: 'grammar' },
  { title: 'Advanced Vocabulary', type: 'vocabulary' },
  { title: 'Idiomatic Expressions', type: 'vocabulary' },
  { title: 'Professional Communication', type: 'speaking' },
  { title: 'Family and Relationships', type: 'reading' },
  { title: 'Advanced Colors & Descriptive Adjectives', type: 'reading' },
  { title: 'Weekly Assessment Intermediate 1', type: 'quiz' },
  { title: 'Advanced Numeracy and Statistics', type: 'listening' },
  { title: 'Calendars, Schedules, and Temporal Clauses', type: 'reading' },
  { title: 'Fauna and Ecological Systems', type: 'reading' },
  { title: 'Flora, Agriculture, and Botany', type: 'reading' },
  { title: 'Culinary Arts and Grocery', type: 'vocabulary' },
  { title: 'Advanced Discourse and Cohesion', type: 'grammar' },
  { title: 'Weekly Assessment Intermediate 2', type: 'quiz' },
  { title: 'Advanced Hypothesis and Conditionals', type: 'grammar' },
  { title: 'Advanced Rhetoric and Persuasion', type: 'speaking' },
  { title: 'Synthesis and Technical Writing', type: 'reading' },
  { title: 'Advanced Public Speaking and Oratory', type: 'speaking' },
  { title: 'Weekly Assessment Intermediate 3', type: 'quiz' },
  { title: 'Advanced Stylistics and Literary Devices', type: 'reading' },
  { title: 'Advanced Critical Thinking and Argumentation', type: 'speaking' },
  { title: 'Advanced Global English and Varieties', type: 'reading' },
  { title: 'Weekly Assessment Intermediate 4', type: 'quiz' },
  { title: 'Advanced Editing and Proofreading', type: 'grammar' },
  { title: 'Advanced Cross-Cultural Pragmatics', type: 'speaking' },
  { title: 'Advanced Professional Networking and Negotiation', type: 'speaking' },
  { title: 'Weekly Assessment Intermediate 5', type: 'quiz' },
  { title: 'Advanced Leadership and Crisis Communication', type: 'speaking' },
  { title: 'Advanced Innovation and Future Trends', type: 'reading' },
  { title: 'Advanced Mastery and Capstone Preparation', type: 'quiz' }
];

const curriculumAdvanced = [
  { title: 'Advanced Phonetics and Dialectal Variation', type: 'speaking' },
  { title: 'Advanced Etymology and Lexicology', type: 'vocabulary' },
  { title: 'Advanced Syntax and Generative Grammar', type: 'grammar' },
  { title: 'Advanced Discourse Analysis and Textual Cohesion', type: 'reading' },
  { title: 'Advanced Cognitive Linguistics and Metaphor Theory', type: 'reading' },
  { title: 'Weekly Assessment Advanced 1', type: 'quiz' },
  { title: 'Advanced Psycholinguistics and Language Acquisition', type: 'reading' },
  { title: 'Advanced Sociolinguistics and Language Variation', type: 'reading' },
  { title: 'Advanced Corpus Linguistics and Computational Lexicography', type: 'reading' },
  { title: 'Advanced Pragmatics and Speech Act Theory', type: 'speaking' },
  { title: 'Weekly Assessment Advanced 2', type: 'quiz' },
  { title: 'Advanced Computational Linguistics and NLP', type: 'reading' },
  { title: 'Advanced Forensic Linguistics and Authorship Attribution', type: 'reading' },
  { title: 'Advanced Language Typology and Universals', type: 'grammar' },
  { title: 'Advanced Language Evolution and Historical Linguistics', type: 'reading' },
  { title: 'Weekly Assessment Advanced 3', type: 'quiz' },
  { title: 'Advanced Semiotics and Philosophy of Language', type: 'reading' },
  { title: 'Advanced Stylistics and Literary Poetics', type: 'reading' },
  { title: 'Advanced Second Language Acquisition (SLA) Theories', type: 'reading' },
  { title: 'Advanced Bilingualism and Multilingualism Studies', type: 'speaking' },
  { title: 'Weekly Assessment Advanced 4', type: 'quiz' },
  { title: 'Advanced Translation and Interpretation Practicum', type: 'grammar' },
  { title: 'Advanced Critical Pedagogy and Language Teaching', type: 'speaking' },
  { title: 'Advanced Academic and Professional Writing Capstone', type: 'reading' },
  { title: 'Advanced Language Policy and Planning Systems', type: 'reading' },
  { title: 'Advanced Capstone Thesis and Presentation Viva', type: 'quiz' }
];

function getCurriculumLessons(level) {
  const lvl = level || 'Beginner';
  if (lvl === 'Advanced') return curriculumAdvanced;
  if (lvl === 'Intermediate') return curriculumIntermediate;
  return curriculumBeginner;
}

function getCurriculumPrompt(userAge, eduLevel, totalScore, results, interfaceLanguage) {
  return `You are an expert language teacher. The user took a language assessment.
User Age: ${userAge || 'Not specified'}
User Education Level: ${eduLevel || 'Not specified'}
Score: ${totalScore} out of ${results.length * 10}.
Details: ${results.map(r => `Q: ${r.type}, Correct: ${r.isCorrect}`).join('; ')}.

Generate a JSON object with the following structure:
{
  "overall_level": "Beginner/Intermediate/Advanced",
  "strengths": ["string", "string", "string", "string", "string"],
  "weaknesses": ["string", "string", "string", "string", "string"],
  "learning_strategy": "Exactly 5 lines of text summarizing their performance. You MUST write this summary in the user's interface language (${interfaceLanguage}). Customize the advice based on their age and education level (e.g. kid-friendly if age < 12, professional/situational if adult/workplace, simple/supportive if 50+ or no formal education).",
  "recommended_focus": "reading|writing|listening|speaking|grammar|vocabulary",
  "improvements": ["string", "string", "string", "string", "string"]
}

Output strictly valid JSON. No markdown formatting.`;
}

module.exports = {
  determineProficiency,
  getCurriculumLessons,
  getCurriculumPrompt
};
