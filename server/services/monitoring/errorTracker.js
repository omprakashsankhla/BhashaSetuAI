const Sentry = require('./sentry');
const logger = require('../../utils/logger');

// Local storage for error history
const errorStore = [];

/**
 * Capture and trace application exception
 */
function captureException(err, context = {}) {
  const errorDetails = {
    message: err.message || String(err),
    stack: err.stack || '',
    context,
    timestamp: new Date().toISOString()
  };

  errorStore.push(errorDetails);
  
  // Cap memory size of error store to prevent memory leaks (keep latest 100 records)
  if (errorStore.length > 100) {
    errorStore.shift();
  }

  logger.error(`[Error Telemetry] Exception: ${errorDetails.message} | Context: ${JSON.stringify(context)}`);

  // Forward to Sentry if initialized
  if (Sentry.captureException) {
    Sentry.captureException(err, { extra: context });
  }
}

/**
 * Fetch recorded exceptions list
 */
function getErrorsSummary() {
  return {
    totalRecordedErrors: errorStore.length,
    recentErrors: errorStore.slice(-10) // Return last 10 errors
  };
}

module.exports = {
  captureException,
  getErrorsSummary
};
