process.env.DOTENV_CONFIG_QUIET = 'true';
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
require('dotenv').config();

// Environment Variable Validation
const requiredEnv = ['JWT_SECRET', 'GEMINI_API_KEY', 'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingEnv = requiredEnv.filter(env => !process.env[env]);

if (missingEnv.length > 0) {
  logger.error(`CRITICAL ERROR: Missing required environment variables: ${missingEnv.join(', ')}`);
  logger.error('Startup halted. Please configure your .env file or production environment variables.');
  process.exit(1);
}

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
const adaptiveRoutes = require('./routes/adaptive');
const analyticsRoutes = require('./routes/analytics');
const healthRoutes = require('./routes/health');
const systemRoutes = require('./routes/system');

const app = express();
const path = require('path');

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://*.googleusercontent.com"],
        connectSrc: ["'self'", "https://*.googleapis.com", "https://api.sarvam.ai", "http://localhost:5000"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "blob:", "data:"],
        frameSrc: ["'self'", "https://accounts.google.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');
  next();
});

app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

// Initialize Database
const db = require('./db');

const { rateLimitStore } = require('./services/redisClient');

const requestIdMiddleware = require('./middleware/requestIdMiddleware');
app.use(requestIdMiddleware);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  store: rateLimitStore
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
app.use('/api/adaptive', adaptiveRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoints
app.use('/api/health', healthRoutes);
app.use('/api/system', systemRoutes);

// Root endpoint for platform health checks
app.get('/', (req, res) => {
  res.status(200).send('BhashaSetu API is up and running');
});

const { startReminderJob } = require('./PushReminders');

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startReminderJob();
    
    // Run verification after binding port so healthchecks don't timeout
    db.verifyDatabase().then(() => {
      logger.info('Database Verification Hook Completed.');
    }).catch(err => {
      logger.error('Database Verification Hook Failed: ' + err.message);
    });
  });
}

module.exports = app;
