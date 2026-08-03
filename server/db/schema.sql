

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
