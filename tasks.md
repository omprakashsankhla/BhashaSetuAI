# BhashaSetu AI - Active Task List

## 📋 Phase 1: Question Bank Generation & Validation
- [x] Align on generation strategy (Option A: Automated Script vs. Option B: Manual Prompts).
- [x] Update and run script/prompts for Mode B question banks:
  - [x] Telugu learning (`te_learning`)
  - [x] Urdu learning (`ur_learning`)
  - [x] Marwadi learning (`mwr_learning`)
- [x] Update and run script/prompts for Mode A question banks:
  - [x] Telugu interface (`te.json`)
  - [x] Urdu interface (`ur.json`)
  - [x] Marwadi interface (`mwr.json`)
- [x] Thicken other Mode A question count from 5 to 25 items where necessary.
- [x] Run automated validation script to verify:
  - [x] Correct JSON syntax
  - [x] Correct prompt-answer alignment
  - [x] Zero duplicate answers / copy-paste bugs

## 📖 Phase 2: Lesson Generation & Database Cache
- [x] Fix and verify Gemini settings in lesson pre-generation logic.
- [x] Execute bulk lesson pre-generation for all 88 lessons across the 7 regional languages:
  - [x] Hindi (`hi`)
  - [x] Tamil (`ta`)
  - [x] Telugu (`te`)
  - [x] Bengali (`bn`)
  - [x] Marathi (`mr`)
  - [x] Urdu (`ur`)
  - [x] Marwadi (`mwr`)
- [x] Verify `lesson_translations` table row count in MySQL.

## 🚀 Phase 3: Push to Railway & Verification
- [x] Verify all E2E Test Mode patches locally.
- [x] Apply local Lessons deduplication fix to the Railway production database.
- [x] Deploy backend updates and database inserts/caching to Railway.
- [x] Manually verify active lessons served on local/production frontend.
