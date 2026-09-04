# 🌐 BhashaSetu AI — Multilingual AI Language Learning Platform

**BhashaSetu AI** is an intelligent, gamified language learning web application powered by **Google Gemini AI**. It offers personalized learning paths across **Beginner**, **Intermediate**, and **Advanced** proficiency levels with real-time AI speech evaluation, interactive AI tutoring, adaptive assessments, and multi-language support.

---

## ✨ Features & Google Gemini AI Integration

### 1. 🎙️ Multimodal Voice & Speech Evaluation (`gemini-3.5-flash`)
- Analyzes user spoken audio (WebM recordings) natively using Gemini's multimodal capabilities.
- Evaluates **pronunciation**, **fluency**, **accuracy**, and **confidence** scores (0–100) with detailed feedback.

### 2. 🧠 Adaptive AI Curriculum (10 Levels)
- Evaluates user baseline performance during assessments.
- Personalizes learning paths across **10 progressive difficulty levels** per track.
- Generates a customized 5-point learning strategy, overall evaluated proficiency, and targeted focus areas (Strengths vs. Weaknesses).

### 3. 🤖 Floating AI Tutor Widget (`gemini-3.5-flash-lite`)
- Accessible on all pages (Home, Learn, Activities).
- Powered by Gemini to deliver interactive, conversational assistance and answer learner questions in real time.

### 4. 📚 90+ Structured Interactive Lessons & Tracks
- Dynamic tracks for **Beginner**, **Intermediate**, and **Advanced** learners.
- Diverse activity types: MCQ, Reading/Speech, Listening (TTS), Writing, and Puzzles.

### 5. 🌍 8-Language Multilingual Engine
- Full localization of both the application interface (UI) and learning content.
- Supports 8 major regional languages: **English**, **Hindi**, **Bengali**, **Marathi**, **Marwari**, **Tamil**, **Telugu**, and **Urdu**.

### 6. 🎮 Interactive Games Hub & Sandbox
- **EchoChamber:** Practice speaking with 10 unique tongue twisters per language (80 total).
- **8 Custom Sandbox Mini-Games:** Picture Bingo, Flash Memory Flip, Clue Crossword, Tense Shift Connect, Dialogue Puzzler, Editorial Speed Draft, Debate Argument Builder, and Idiom Connect.

---

## 🛠️ Technology Stack

- **Frontend:** React, Vite, Lucide Icons, i18next (Multilingual), React Confetti
- **Backend:** Node.js, Express, Multer (Audio Uploads), JWT Authentication
- **AI SDK:** `@google/genai` (Google Gen AI Node.js SDK)
- **Database:** MySQL (`bhashasetu_db`)

---

## 📁 Project Structure

```
BhashaSetuAI/
├── client/                 # React Vite Frontend Application
│   ├── src/
│   │   ├── components/     # UI Modals, Games & Widgets (Tutor, Profile, Progress, Settings)
│   │   ├── pages/          # Dashboard, LearnPage, ActivitiesPage, LessonPage, GamesHub, etc.
│   │   ├── context/        # App & Settings Context Providers
│   │   └── locales/        # i18next Translation Resource JSON Files (8 Languages)
│   ├── sw.js               # Service Worker source code for offline support
│   ├── vite.config.js      # Vite and PWA configuration
│   └── package.json
├── server/                 # Express Node Backend API
│   ├── data/               # Multilingual Lesson & Question datasets
│   ├── middleware/         # Centralized middlewares (auth, languageContext)
│   ├── routes/             # Assessment, Dashboard, Learning, Tutor API routes
│   ├── db.js               # MySQL connection & verification logic
│   ├── index.js            # Main Express server entry point
│   ├── scripts/            # Database seed, migration, and generation helpers
│   ├── .env.example        # Environment variables template
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **MySQL Server**
- **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/))

### 1. Clone & Set Up Environment Variables
Navigate to the `server/` directory and copy the environment template:
```bash
cd server
cp .env.example .env
```
Fill in your credentials in `server/.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=bhashasetu_db
PORT=5000

GEMINI_API_KEY=your_gemini_api_key
```

### 2. Database Initialization
- Ensure MySQL is running.
- Create a database named `bhashasetu_db`.
- The Express server automatically verifies, creates, and sets up all required tables and structures (`Users`, `User_Settings`, `User_Analytics`, `User_Skills`, `Lessons`, `User_Lessons`, `Assessments`, `Learning_Profiles`, `spaced_repetition`) on startup.

### 3. Install Dependencies & Run

#### Backend:
```bash
cd server
npm install
npm run dev
```

#### Frontend:
```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser to start learning!

---

## 🧪 Running Tests

### Backend (Jest):
```bash
cd server
npm test
```

### Frontend (Vitest):
```bash
cd client
npm test
```

---

## 🔒 Security Notice
Make sure **never** to commit your actual `.env` file containing API keys or database passwords to public repositories. Always use `.env.example` as a template for team or submission sharing.

