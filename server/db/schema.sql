

CREATE TABLE IF NOT EXISTS Users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  age INT,
  preferred_language VARCHAR(50),
  education_level VARCHAR(255),
  proficiency_level ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
  role ENUM('Student', 'Admin') DEFAULT 'Student',
  settings JSON,
  skills_progress JSON,
  xp INT DEFAULT 0,
  coins INT DEFAULT 0,
  hearts INT DEFAULT 5,
  hearts_last_regen TIMESTAMP NULL,
  avatar VARCHAR(255) DEFAULT 'default_avatar.png',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  streak INT DEFAULT 1,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
);

CREATE TABLE IF NOT EXISTS Assessments (
  assessment_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  type ENUM('Reading', 'Writing', 'Vocabulary', 'Listening', 'Grammar', 'MCQ', 'Puzzle'),
  score DECIMAL(5,2),
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  INDEX idx_assessments_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS Lessons (
  lesson_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  level ENUM('Beginner', 'Intermediate', 'Advanced'),
  content_data JSON,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_lessons_level (level),
  INDEX idx_lessons_display_order (display_order)
);

CREATE TABLE IF NOT EXISTS Progress (
  progress_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  lesson_id INT,
  status ENUM('Not Started', 'In Progress', 'Completed') DEFAULT 'Not Started',
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES Lessons(lesson_id) ON DELETE CASCADE,
  INDEX idx_progress_user_id (user_id),
  INDEX idx_progress_lesson_id (lesson_id)
);

CREATE TABLE IF NOT EXISTS Voice_Assessments (
  voice_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  lesson_id INT,
  pronunciation_score DECIMAL(5,2),
  fluency_score DECIMAL(5,2),
  accuracy_score DECIMAL(5,2),
  confidence_score DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES Lessons(lesson_id) ON DELETE CASCADE,
  INDEX idx_voice_user_id (user_id),
  INDEX idx_voice_lesson_id (lesson_id)
);

CREATE TABLE IF NOT EXISTS Recommendations (
  recommendation_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  lesson_id INT,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES Lessons(lesson_id) ON DELETE CASCADE,
  INDEX idx_recommendations_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS Announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  target_user_id INT NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (target_user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  INDEX idx_announcements_target_user_id (target_user_id)
);

CREATE TABLE IF NOT EXISTS Platform_Settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS Assignments (
  assignment_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  lesson_id INT,
  status ENUM('Pending', 'Completed') DEFAULT 'Pending',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES Lessons(lesson_id) ON DELETE CASCADE,
  UNIQUE KEY unique_assignment (user_id, lesson_id),
  INDEX idx_assignments_user_id (user_id),
  INDEX idx_assignments_lesson_id (lesson_id)
);

CREATE TABLE IF NOT EXISTS PushSubscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  endpoint TEXT NOT NULL,
  p256dh VARCHAR(255) NOT NULL,
  auth VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  INDEX idx_push_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS lesson_translations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id INT NOT NULL,
    language_code VARCHAR(10) NOT NULL,
    interface_language VARCHAR(10) NOT NULL DEFAULT 'en',
    translated_content JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY lesson_lang_unique (lesson_id, language_code, interface_language),
    FOREIGN KEY (lesson_id) REFERENCES Lessons(lesson_id) ON DELETE CASCADE,
    INDEX idx_trans_lesson (lesson_id),
    INDEX idx_trans_lang (language_code),
    INDEX idx_trans_interface (interface_language)
);

CREATE TABLE IF NOT EXISTS Learning_Profiles (
  profile_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE,
  vocabulary_score INT DEFAULT 0,
  reading_score INT DEFAULT 0,
  listening_score INT DEFAULT 0,
  speaking_score INT DEFAULT 0,
  writing_score INT DEFAULT 0,
  weak_areas JSON,
  strong_areas JSON,
  recommended_lessons JSON,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Achievements (
  achievement_id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  title VARCHAR(100),
  description TEXT,
  xp_reward INT,
  icon VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS User_Achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  achievement_id INT,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES Achievements(achievement_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Streaks (
  user_id INT PRIMARY KEY,
  current_streak INT DEFAULT 0,
  max_streak INT DEFAULT 0,
  last_login DATE,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Tutor_Memory (
  memory_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  interaction_type ENUM('Doubt', 'Correction', 'Goal'),
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Skill_Analytics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  skill VARCHAR(50) NOT NULL,
  score INT DEFAULT 0,
  total_attempts INT DEFAULT 0,
  correct_attempts INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  UNIQUE KEY user_skill_unique (user_id, skill)
);

CREATE TABLE IF NOT EXISTS Weak_Areas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  skill VARCHAR(50) NOT NULL,
  topic VARCHAR(255) NOT NULL,
  fail_count INT DEFAULT 1,
  last_failed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  UNIQUE KEY user_skill_topic_unique (user_id, skill, topic)
);

CREATE TABLE IF NOT EXISTS Review_Queue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  item_type ENUM('Lesson', 'Vocabulary', 'Grammar') NOT NULL,
  item_id INT NOT NULL,
  next_review DATE NOT NULL,
  repetitions INT DEFAULT 0,
  interval_days INT DEFAULT 0,
  ease_factor DOUBLE DEFAULT 2.5,
  last_reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  UNIQUE KEY user_item_unique (user_id, item_type, item_id)
);

CREATE TABLE IF NOT EXISTS User_Settings (
  user_id INT PRIMARY KEY,
  interface_language VARCHAR(10) DEFAULT 'en',
  learning_language VARCHAR(10) DEFAULT 'hi',
  has_completed_assessment BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS User_Skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  skill_type ENUM('reading', 'writing', 'speaking', 'listening', 'vocabulary', 'grammar') NOT NULL,
  proficiency_level VARCHAR(50) DEFAULT 'Beginner',
  correct_count INT DEFAULT 0,
  total_count INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  UNIQUE KEY user_skill_type_unique (user_id, skill_type)
);

CREATE TABLE IF NOT EXISTS User_Analytics (
  user_id INT PRIMARY KEY,
  total_xp INT DEFAULT 0,
  total_coins INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  max_streak INT DEFAULT 0,
  last_active DATE,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Audit_Logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(255) NOT NULL,
  details TEXT NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL
);

