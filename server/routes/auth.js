const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { logAuditEvent } = require('../services/auditLogger');
const { syncUserAnalytics } = require('../services/analyticsService');

const router = express.Router();

// Helper to determine proficiency based on demographics
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

// Registration Endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, age, education_level, preferred_language, interface_language, learning_language, proficiency_level } = req.body;

    // 1. Check if user already exists
    const [existingUsers] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Hash password securely
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Enforce demographic rules for proficiency level
    const finalProficiency = determineProficiency(age, education_level, proficiency_level);

    // 3. Insert into database
    const insertQuery = `
      INSERT INTO Users (name, email, password_hash, age, education_level, preferred_language, interface_language, learning_language, proficiency_level, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Student')
    `;
    const [result] = await db.query(insertQuery, [
      name, 
      email, 
      password_hash, 
      age || null, 
      education_level || null,
      interface_language || preferred_language || 'en',
      interface_language || preferred_language || 'en',
      learning_language || preferred_language || 'hi',
      finalProficiency
    ]);

    // Set initial streak
    await db.query('UPDATE Users SET streak = 1, last_login = CURDATE() WHERE user_id = ?', [result.insertId]);
    await syncUserAnalytics(result.insertId);

    await logAuditEvent(result.insertId, 'REGISTER', { email }, req.ip);

    // 4. Generate JWT Token
    const token = jwt.sign(
      { user_id: result.insertId, email, role: 'Student' }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        name,
        email,
        role: 'Student',
        proficiency_level: finalProficiency,
        has_completed_assessment: false,
        interface_language: interface_language || preferred_language || 'en',
        learning_language: learning_language || preferred_language || 'hi',
        preferred_language: interface_language || preferred_language || 'en',
        settings: {}
      }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login Endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const [users] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];

    // 2. Compare password hashes
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Generate JWT Token
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 4. Update Streak and Last Login
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    let newStreak = user.streak || 0;
    
    if (user.last_login) {
      const lastLoginDate = new Date(user.last_login);
      lastLoginDate.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(today - lastLoginDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays === 1) {
        newStreak += 1; // Logged in the next day
      } else if (diffDays > 1) {
        newStreak = 1; // Streak broken
      }
      // If diffDays === 0, they logged in today already, streak remains same
    } else {
      newStreak = 1; // First time logging in with new columns
    }

    await db.query('UPDATE Users SET streak = ?, last_login = CURDATE() WHERE user_id = ?', [newStreak, user.user_id]);
    await syncUserAnalytics(user.user_id);

    await logAuditEvent(user.user_id, 'LOGIN', { email: user.email }, req.ip);

    let has_completed = false;
    if (user.settings) {
      if (typeof user.settings === 'string') {
        has_completed = user.settings.includes('ai_insights');
      } else {
        has_completed = !!user.settings.ai_insights;
      }
    }

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        proficiency_level: user.proficiency_level || 'Beginner',
        has_completed_assessment: has_completed,
        interface_language: user.interface_language,
        learning_language: user.learning_language,
        preferred_language: user.preferred_language,
        settings: typeof user.settings === 'string' ? JSON.parse(user.settings || '{}') : (user.settings || {})
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Google Login Endpoint
router.post('/google', async (req, res) => {
  try {
    const { token, interface_language, preferred_language } = req.body;
    
    // Verify Google Access Token by fetching user info
    const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!googleResponse.ok) {
      throw new Error('Invalid Google access token');
    }
    
    const payload = await googleResponse.json();
    const email = payload.email;
    const name = payload.name;

    // Check if user exists
    let [users] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
    let user;

    if (users.length === 0) {
      // Auto-register user with Google info
      const dummyPassword = Math.random().toString(36).slice(-8);
      const password_hash = await bcrypt.hash(dummyPassword, 10);
      
      const insertQuery = `
        INSERT INTO Users (name, email, password_hash, preferred_language, interface_language, learning_language, role, settings)
        VALUES (?, ?, ?, ?, ?, 'hi', 'Student', ?)
      `;
      const newSettings = JSON.stringify({ needs_language_confirmation: true });
      const [result] = await db.query(insertQuery, [
        name, 
        email, 
        password_hash, 
        interface_language || preferred_language || 'en',
        interface_language || preferred_language || 'en',
        newSettings
      ]);
      
      user = {
        user_id: result.insertId,
        name,
        email,
        role: 'Student',
        interface_language: interface_language || preferred_language || 'en',
        learning_language: 'hi',
        preferred_language: interface_language || preferred_language || 'en',
        settings: newSettings
      };
    } else {
      user = users[0];
    }

    // Generate JWT Token
    const jwtToken = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    let settingsObj = {};
    let has_completed = false;
    if (user.settings) {
      if (typeof user.settings === 'string') {
        settingsObj = JSON.parse(user.settings);
        has_completed = user.settings.includes('ai_insights');
      } else {
        settingsObj = user.settings;
        has_completed = !!user.settings.ai_insights;
      }
    }

    res.status(200).json({
      message: 'Google login successful',
      token: jwtToken,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        has_completed_assessment: has_completed,
        interface_language: user.interface_language,
        learning_language: user.learning_language,
        preferred_language: user.preferred_language,
        settings: settingsObj
      }
    });

  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(401).json({ message: 'Invalid Google Token or configuration' });
  }
});

module.exports = router;
