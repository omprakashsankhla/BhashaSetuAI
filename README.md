# 🌐 BhashaSetu AI — Multilingual AI Language Learning Platform

**BhashaSetu AI** is an intelligent, gamified language learning web application powered by **Google Gemini AI**. It offers personalized learning paths across **Beginner**, **Intermediate**, and **Advanced** proficiency levels with real-time AI speech evaluation, interactive AI tutoring, adaptive assessments, and multi-language support.

---

## ✨ Features & Google Gemini AI Integration

### 1. 🎙️ Multimodal Voice & Speech Evaluation (`gemini-1.5-flash`)
- Analyzes user spoken audio (WebM recordings) natively using Gemini's multimodal capabilities.
- Evaluates **pronunciation**, **fluency**, **accuracy**, and **confidence** scores (0–100) with encouraging feedback.

### 2. 🧠 Adaptive AI Curriculum & Learning Strategy
- Evaluates user baseline performance during initial/retake assessments.
- Generates a customized 5-point learning strategy, overall evaluated proficiency, and targeted focus areas (Strengths vs. Weaknesses).

### 3. 🤖 Floating AI Tutor Widget
- Accessible on all pages (Home, Learn, Activities).
- Powered by Gemini to deliver interactive, conversational assistance and answer learner questions in real time.

### 4. 📚 90+ Structured Interactive Lessons & Tracks
- Dynamic tracks for **Beginner**, **Intermediate**, and **Advanced** learners.
- Diverse activity types: MCQ, Reading/Speech, Listening (TTS), Writing, and Puzzles.

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
│   │   ├── components/     # UI Modals & Widgets (Tutor, Profile, Progress, Settings)
│   │   ├── pages/          # Dashboard, LearnPage, ActivitiesPage, LessonPage, etc.
│   │   ├── context/        # App & Settings Context Providers
│   │   └── i18n/           # Multilingual Translations
│   └── package.json
├── server/                 # Express Node Backend API
│   ├── data/               # Lesson datasets (Beginner, Intermediate, Advanced)
│   ├── routes/             # Assessment, Dashboard, Learning, Tutor API endpoints
│   ├── db.js               # MySQL Connection configuration
│   ├── server.js           # Main Express server entry point
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
Ensure MySQL is running and execute the database setup script or create `bhashasetu_db` with tables (`Users`, `Progress`, `Lessons`, `Assessments`, `Voice_Assessments`).

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

## 🔒 Security Notice
Make sure **never** to commit your actual `.env` file containing API keys or database passwords to public repositories. Always use `.env.example` as a template for team or submission sharing.
