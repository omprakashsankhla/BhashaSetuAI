/**
 * Sanitizes and validates LLM generated responses to eliminate scripting injections
 */
function sanitizeResponse(responseText) {
  if (!responseText) return '';

  // Remove potential dangerous script injections
  let clean = responseText
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/javascript:/gi, '');

  return clean;
}

module.exports = {
  sanitizeResponse
};
