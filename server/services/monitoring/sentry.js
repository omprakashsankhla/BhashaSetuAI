const Sentry = require('@sentry/node');
const logger = require('../../utils/logger');
require('dotenv').config();

const dsn = process.env.SENTRY_DSN || '';

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV || 'development'
  });
  logger.info('Sentry initialized successfully in Node environment.');
} else {
  logger.info('No Sentry DSN provided. Error logging will fall back to local winston logger.');
}

module.exports = Sentry;
