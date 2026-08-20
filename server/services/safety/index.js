const { analyzePromptInjection } = require('./promptFirewall');
const { analyzeContentSafety } = require('./contentModerator');
const { verifyTutorPersona } = require('./tutorGuard');
const { sanitizeResponse } = require('./responseValidator');

/**
 * Perform security audits on incoming input queries
 */
function auditInputSafety(inputText) {
  const firewallCheck = analyzePromptInjection(inputText);
  if (!firewallCheck.clean) return firewallCheck;

  const contentCheck = analyzeContentSafety(inputText);
  if (!contentCheck.clean) return contentCheck;

  return { clean: true };
}

/**
 * Perform security audits on outgoing response messages
 */
function auditOutputSafety(outputText) {
  const tutorCheck = verifyTutorPersona(outputText);
  if (!tutorCheck.clean) return tutorCheck;

  const cleanOutput = sanitizeResponse(outputText);
  return {
    clean: true,
    sanitized: cleanOutput
  };
}

module.exports = {
  auditInputSafety,
  auditOutputSafety
};
