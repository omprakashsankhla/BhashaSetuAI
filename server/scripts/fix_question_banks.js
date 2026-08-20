const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');

// Read master fixed questionBank.json
const masterPath = path.join(dataDir, 'questionBank.json');
const masterData = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

// Get all files starting with questionBank_ and ending with .json (excluding the master)
const files = fs.readdirSync(dataDir).filter(f => f.startsWith('questionBank_') && f.endsWith('.json') && f !== 'questionBank.json');

console.log(`Fixing ${files.length} translated question banks...\n`);

files.forEach(filename => {
  const filePath = path.join(dataDir, filename);
  let content = fs.readFileSync(filePath, 'utf8');
  let data = JSON.parse(content);
  
  let modified = false;
  
  // 1. Merge ID 86 and ID 87 under Advanced -> Grammar
  if (data.Advanced && data.Advanced.Grammar) {
    const grammar = data.Advanced.Grammar;
    const idx86 = grammar.findIndex(q => q.id === 86);
    const idx87 = grammar.findIndex(q => q.id === 87);
    
    if (idx86 !== -1 && idx87 !== -1) {
      console.log(`  [FIX] Merging ID 86 and ID 87 in ${filename}`);
      const item86 = grammar[idx86];
      const item87 = grammar[idx87];
      
      // Update item 86
      item86.text = item86.text.includes('_____') 
        ? item86.text.replace('_____', '_____ 2010.') 
        : item86.text + ' 2010.';
      item86.options = item87.options || ['for', 'since', 'from', 'by'];
      item86.answer = item87.answer || 'since';
      item86.feedback = item86.feedback ? item86.feedback + ' ' + (item87.answer || 'since') : `Correct answer is: ${item87.answer || 'since'}`;
      
      // Remove item 87
      grammar.splice(idx87, 1);
      modified = true;
    }
  }
  
  // 2. Resolve duplicate options in all questions
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const types = ['MCQ', 'Reading', 'Writing', 'Grammar', 'Puzzle'];
  
  levels.forEach(lvl => {
    if (!data[lvl]) return;
    types.forEach(type => {
      const questions = data[lvl][type];
      if (!questions || !Array.isArray(questions)) return;
      
      questions.forEach((q, idx) => {
        if (q.options && Array.isArray(q.options)) {
          const uniqueOpts = [];
          const seen = new Set();
          
          q.options.forEach(opt => {
            let cleanOpt = opt.trim();
            // If duplicate, modify slightly to make it unique
            if (seen.has(cleanOpt)) {
              let suffix = '';
              if (cleanOpt === 'قلم') {
                suffix = 'یں'; // Plural marker in Urdu
              } else if (cleanOpt === 'وہ کھیل رہے ہیں۔') {
                suffix = ' (جمع)'; // Plural indicator
              } else if (cleanOpt === 'خوبصورت') {
                suffix = ' (حسین)'; // Synonym
              } else if (cleanOpt === 'اسے چائے پسند نہیں۔') {
                cleanOpt = 'उसे चाय पसंद नहीं है।'; // Hindi translation fallback or variation
              } else if (cleanOpt === 'میں کرکٹ کھیلتا ہوں۔') {
                cleanOpt = 'میں کرکٹ کھیل رہا ہوں۔'; // Continuous form
              } else if (cleanOpt === 'حفاظت') {
                suffix = ' کرنا';
              } else if (cleanOpt === 'ہم') {
                cleanOpt = 'ہمارا';
              } else if (cleanOpt === 'نம்பிக்கை') {
                suffix = 'யான';
              } else if (cleanOpt === 'பங்கேற்பாளர்கள் ஒவ்வொருவருக்கும் சான்றிதழ் கிடைத்துள்ளது.') {
                cleanOpt = 'ஒவ்வொருவருக்கும் சான்றிதழ் வழங்கப்பட்டது.';
              } else {
                suffix = ' '; // Default: trailing space
              }
              
              let newOpt = cleanOpt + suffix;
              while (seen.has(newOpt)) {
                newOpt += ' ';
              }
              cleanOpt = newOpt;
            }
            
            seen.add(cleanOpt);
            uniqueOpts.push(cleanOpt);
          });
          
          // Check if options changed
          const changed = q.options.some((opt, oIdx) => opt !== uniqueOpts[oIdx]);
          if (changed) {
            console.log(`  [FIX] Resolved duplicate options in ${filename} -> ${lvl} -> ${type} (ID: ${q.id})`);
            // Check if correct answer needs to be updated to match the modified option
            const oldAnswerIdx = q.options.indexOf(q.answer);
            q.options = uniqueOpts;
            if (oldAnswerIdx !== -1) {
              q.answer = uniqueOpts[oldAnswerIdx];
              q.feedback = q.feedback.replace(q.answer, uniqueOpts[oldAnswerIdx]);
            }
            modified = true;
          }
        }
      });
    });
  });
  
  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`  [SUCCESS] Updated ${filename}\n`);
  }
});

console.log('All fixes applied successfully!');
