const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');

// Get all files matching questionBank_*.json
const files = fs.readdirSync(dataDir).filter(f => f.startsWith('questionBank_') && f.endsWith('.json'));

console.log(`Found ${files.length} question bank files to validate.\n`);

let overallPassed = true;

const expectedLevels = ['Beginner', 'Intermediate', 'Advanced'];
const expectedTypes = ['MCQ', 'Reading', 'Writing', 'Grammar', 'Puzzle'];

files.forEach(filename => {
  const filePath = path.join(dataDir, filename);
  console.log(`==================================================`);
  console.log(`Validating: ${filename}`);
  console.log(`==================================================`);
  
  let fileContent;
  try {
    fileContent = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error(`[FAIL] Could not read file: ${err.message}`);
    overallPassed = false;
    return;
  }
  
  let data;
  try {
    data = JSON.parse(fileContent);
  } catch (err) {
    console.error(`[FAIL] Invalid JSON syntax: ${err.message}`);
    overallPassed = false;
    return;
  }
  
  let filePassed = true;
  
  expectedLevels.forEach(lvl => {
    if (!data[lvl]) {
      console.error(`  [FAIL] Missing level: ${lvl}`);
      filePassed = false;
      return;
    }
    
    expectedTypes.forEach(type => {
      const questions = data[lvl][type];
      if (!questions) {
        console.error(`  [FAIL] Level ${lvl} is missing type: ${type}`);
        filePassed = false;
        return;
      }
      
      if (!Array.isArray(questions)) {
        console.error(`  [FAIL] Level ${lvl} type ${type} is not an array`);
        filePassed = false;
        return;
      }
      
      console.log(`  [INFO] Level ${lvl} - ${type}: ${questions.length} questions`);
      
      const seenTexts = new Set();
      
      questions.forEach((q, idx) => {
        const qLabel = `${lvl} -> ${type} -> Item at index ${idx} (ID: ${q.id || 'none'})`;
        
        if (!q.id) {
          console.error(`    [FAIL] ${qLabel}: Missing 'id'`);
          filePassed = false;
        }
        if (!q.type) {
          console.error(`    [FAIL] ${qLabel}: Missing 'type'`);
          filePassed = false;
        }
        if (!q.text || typeof q.text !== 'string' || q.text.trim().length === 0) {
          console.error(`    [FAIL] ${qLabel}: Missing or empty 'text'`);
          filePassed = false;
        }
        
        // Duplicate check
        if (q.text) {
          const uniqueKey = q.text + '|' + (q.options ? q.options.join(',') : '') + '|' + (q.answer || '');
          if (seenTexts.has(uniqueKey)) {
            console.error(`    [FAIL] ${qLabel}: Duplicate question text and options detected: "${q.text.substring(0, 40)}..."`);
            filePassed = false;
          } else {
            seenTexts.add(uniqueKey);
          }
        }
        
        // Alignment checks
        if (['MCQ', 'Grammar', 'Puzzle'].includes(type) || ['MCQ', 'Grammar', 'Puzzle'].includes(q.type)) {
          if (!Array.isArray(q.options) || q.options.length < 2) {
            console.error(`    [FAIL] ${qLabel}: Missing or insufficient 'options' array (must have at least 2 options)`);
            filePassed = false;
          } else {
            // Check unique options
            const optSet = new Set(q.options);
            if (optSet.size !== q.options.length) {
              console.error(`    [FAIL] ${qLabel}: Duplicate values found in 'options' array: [${q.options.join(', ')}]`);
              filePassed = false;
            }
            
            // Check answer in options
            if (!q.answer) {
              console.error(`    [FAIL] ${qLabel}: Missing 'answer'`);
              filePassed = false;
            } else if (!q.options.includes(q.answer)) {
              console.error(`    [FAIL] ${qLabel}: Answer alignment mismatch! Answer "${q.answer}" is not in options: [${q.options.join(', ')}]`);
              filePassed = false;
            }
          }
        }
        
        if (type === 'Reading' && !q.word) {
          console.error(`    [FAIL] ${qLabel}: Reading question is missing 'word' parameter`);
          filePassed = false;
        }
      });
    });
  });
  
  if (filePassed) {
    console.log(`[PASS] ${filename} is structured correctly, has no duplicates, and possesses correct answer-option alignment.`);
  } else {
    overallPassed = false;
  }
});

console.log(`\n==================================================`);
if (overallPassed) {
  console.log(`OVERALL STATUS: ALL PASSED`);
} else {
  console.log(`OVERALL STATUS: VALIDATION FAILED`);
  process.exit(1);
}
