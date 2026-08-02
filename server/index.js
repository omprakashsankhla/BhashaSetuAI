const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');

// Override default console methods to use winston
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

console.log = function(...args) {
  logger.info(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
  originalConsoleLog.apply(console, args);
};

console.error = function(...args) {
  logger.error(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
  originalConsoleError.apply(console, args);
};

console.warn = function(...args) {
  logger.warn(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
  originalConsoleWarn.apply(console, args);
};

console.info = function(...args) {
  logger.info(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
  originalConsoleInfo.apply(console, args);
};
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const assessmentRoutes = require('./routes/assessment');
const dashboardRoutes = require('./routes/dashboard');
const learningRoutes = require('./routes/learning');
const adminRoutes = require('./routes/admin');
const tutorRoutes = require('./routes/tutor');
const profileRoutes = require('./routes/profile');
const settingsRoutes = require('./routes/settings');
const activitiesRoutes = require('./routes/activities');

const app = express();
const path = require('path');

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', apiLimiter);

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tutor', tutorRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/activities', activitiesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'BhashaSetu Backend is running' });
});

const { startReminderJob } = require('./PushReminders');

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startReminderJob();
  });
}

module.exports = app;
