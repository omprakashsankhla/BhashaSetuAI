/**
 * Prompt injection and jailbreak firewall filter
 */
function analyzePromptInjection(promptText) {
  if (!promptText) return { clean: true };

  const lower = promptText.toLowerCase();
  
  // Custom injection triggers
  const jailbreakPatterns = [
    'ignore all previous',
    'ignore the instructions',
    'override the system',
    'you are now a',
    'system override',
    'do anything now',
    'dan mode',
    'forget you are an ai tutor',
    'forget your role'
  ];

  for (const pattern of jailbreakPatterns) {
    if (lower.includes(pattern)) {
      return {
        clean: false,
        reason: `Jailbreak pattern detected: "${pattern}"`
      };
    }
  }

  return { clean: true };
}

module.exports = {
  analyzePromptInjection
};
