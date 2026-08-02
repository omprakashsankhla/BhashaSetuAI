USE `bhashasetu_db`;

-- Insert Default Platform Settings
INSERT IGNORE INTO Platform_Settings (setting_key, setting_value) VALUES 
('maintenance_mode', 'false'),
('enable_leaderboard', 'true'),
('ai_strictness', 'medium');

-- Insert Default Admin User (Password: Admin@123)
INSERT IGNORE INTO Users (name, email, password_hash, role, preferred_language, education_level, proficiency_level) 
VALUES ('Super Admin', 'admin@bhashasetu.com', '$2b$10$wjkVG92Toa4iy2Ibn2Ek0.4TfKqEmcln7yFAdg.hiXGrH6IaMDh6C', 'Admin', 'hi', 'Graduate', 'Advanced');
