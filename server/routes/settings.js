const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const webpush = require('web-push');
const db = require('../db');
require('dotenv').config({ override: true });

const router = express.Router();

webpush.setVapidDetails(
  'mailto:support@bhashasetu.example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ message: 'No token provided.' });
  const token = authHeader.split(' ')[1];
  
  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key', (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized!' });
    req.userId = decoded.user_id;
    next();
  });
};

// GET settings
router.get('/', verifyToken, async (req, res) => {
  try {
    const [users] = await db.query('SELECT settings FROM Users WHERE user_id = ?', [req.userId]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    
    // Default settings if null
    const defaultSettings = {
      theme: 'light',
      voiceSpeed: 1,
      autoPlayAudio: true,
      dailyReminders: true,
      weeklyReports: false,
      appLanguage: 'en'
    };

    const userSettings = users[0].settings || defaultSettings;
    res.json({ ...defaultSettings, ...userSettings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
});

// PUT update settings
router.put('/', verifyToken, async (req, res) => {
  try {
    const newSettings = req.body;
    
    // Fetch current settings to merge
    const [users] = await db.query('SELECT settings FROM Users WHERE user_id = ?', [req.userId]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    
    const currentSettings = users[0].settings || {};
    const mergedSettings = { ...currentSettings, ...newSettings };

    await db.query('UPDATE Users SET settings = ? WHERE user_id = ?', [JSON.stringify(mergedSettings), req.userId]);
    
    res.json(mergedSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

// POST change password
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const [users] = await db.query('SELECT password_hash FROM Users WHERE user_id = ?', [req.userId]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = users[0];
    const passwordIsValid = await bcrypt.compare(oldPassword, user.password_hash);

    if (!passwordIsValid) {
      return res.status(401).json({ message: 'Invalid current password' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE Users SET password_hash = ? WHERE user_id = ?', [hashedNewPassword, req.userId]);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// DELETE account
router.delete('/account', verifyToken, async (req, res) => {
  try {
    // Because of ON DELETE CASCADE in the schema, this will also delete
    // progress, assessments, recommendations, etc.
    await db.query('DELETE FROM Users WHERE user_id = ?', [req.userId]);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

// GET VAPID Public Key
router.get('/push/vapidPublicKey', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// POST Subscribe to Push Notifications
router.post('/push/subscribe', verifyToken, async (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ message: 'Invalid subscription object' });
  }

  try {
    const { endpoint, keys: { p256dh, auth } } = subscription;
    
    // Upsert the subscription
    await db.query(`
      INSERT INTO PushSubscriptions (user_id, endpoint, p256dh, auth) 
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE p256dh = VALUES(p256dh), auth = VALUES(auth)
    `, [req.userId, endpoint, p256dh, auth]);

    res.status(201).json({ message: 'Subscribed successfully.' });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    res.status(500).json({ message: 'Failed to subscribe' });
  }
});

// GET Test Push Notification
router.get('/push/test', verifyToken, async (req, res) => {
  try {
    const [subscriptions] = await db.query('SELECT * FROM PushSubscriptions WHERE user_id = ?', [req.userId]);
    
    if (subscriptions.length === 0) {
      return res.status(404).json({ message: 'No push subscriptions found for user.' });
    }

    const payload = JSON.stringify({
      title: 'BhashaSetu Test',
      body: 'This is a test notification! Daily reminders will look like this.',
      icon: '/pwa-192x192.png'
    });

    const sendPromises = subscriptions.map(sub => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth }
      };
      return webpush.sendNotification(pushSubscription, payload).catch(err => {
        console.error('Push error for sub', sub.id, err);
        if (err.statusCode === 410) {
          // Subscription has expired or is no longer valid
          return db.query('DELETE FROM PushSubscriptions WHERE id = ?', [sub.id]);
        }
      });
    });

    await Promise.all(sendPromises);
    res.json({ message: 'Test notification sent!' });
  } catch (error) {
    console.error('Error sending test push:', error);
    res.status(500).json({ message: 'Failed to send test push' });
  }
});

module.exports = router;
