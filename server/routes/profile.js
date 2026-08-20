const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/avatars'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// Middleware to verify token
const verifyToken = require('../middleware/auth');

// GET user profile
router.get('/', verifyToken, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT name, email, age, preferred_language, interface_language, learning_language, education_level, proficiency_level, xp, coins, streak, role, avatar, created_at FROM Users WHERE user_id = ?',
      [req.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Failed to fetch profile data' });
  }
});

// PUT update user profile (except email)
router.put('/', verifyToken, async (req, res) => {
  try {
    const { name, age, preferred_language, interface_language, learning_language, education_level, proficiency_level, avatar } = req.body;

    // Fetch existing user to preserve values if they are undefined in PUT body
    const [existing] = await db.query(
      'SELECT name, age, preferred_language, interface_language, learning_language, education_level, proficiency_level, avatar FROM Users WHERE user_id = ?',
      [req.userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const current = existing[0];

    const updatedName = name !== undefined ? name : current.name;
    const updatedAge = age !== undefined ? age : current.age;
    const updatedLang = preferred_language !== undefined ? preferred_language : current.preferred_language;
    const updatedInterface = interface_language !== undefined ? interface_language : current.interface_language;
    const updatedLearning = learning_language !== undefined ? learning_language : current.learning_language;
    const updatedEdu = education_level !== undefined ? education_level : current.education_level;
    const updatedProf = proficiency_level !== undefined ? proficiency_level : current.proficiency_level;
    const updatedAvatar = avatar !== undefined ? avatar : current.avatar;

    const query = `
      UPDATE Users 
      SET name = ?, age = ?, preferred_language = ?, interface_language = ?, learning_language = ?, education_level = ?, proficiency_level = ?, avatar = ?
      WHERE user_id = ?
    `;

    await db.query(query, [
      updatedName,
      updatedAge,
      updatedLang,
      updatedInterface,
      updatedLearning,
      updatedEdu,
      updatedProf,
      updatedAvatar,
      req.userId
    ]);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// POST upload custom avatar
router.post('/upload-avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Create the public URL for the image
    const avatarUrl = `http://localhost:5000/uploads/avatars/${req.file.filename}`;
    
    // Update DB
    await db.query('UPDATE Users SET avatar = ? WHERE user_id = ?', [avatarUrl, req.userId]);
    
    res.json({ message: 'Avatar updated successfully', avatar: avatarUrl });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ message: 'Failed to upload avatar' });
  }
});

module.exports = router;
