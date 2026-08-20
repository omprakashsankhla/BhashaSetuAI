/**
 * SuperMemo-2 (SM-2) Spaced Repetition Scheduling Algorithm
 */

/**
 * Calculates the next review date, repetitions, interval, and ease factor
 * based on the quality response rating (0 to 5).
 * 
 * Quality ratings mapping:
 * 5: perfect response
 * 4: correct response after a hesitation
 * 3: correct response recalled with serious difficulty
 * 2: incorrect response; where the correct one seemed easy to recall
 * 1: incorrect response; the correct one remembered
 * 0: complete blackout.
 * 
 * @param {number} qualityResponse - Quality score from 0 to 5
 * @param {number} prevRepetitions - Previous repetitions count
 * @param {number} prevInterval - Previous interval in days
 * @param {number} prevEaseFactor - Previous ease factor (default 2.5)
 * @returns {object} { repetitions, intervalDays, easeFactor, nextReviewDate }
 */
function calculateSM2(qualityResponse, prevRepetitions, prevInterval, prevEaseFactor = 2.5) {
  let repetitions = prevRepetitions;
  let intervalDays = prevInterval;
  let easeFactor = prevEaseFactor;

  if (qualityResponse >= 3) {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(prevInterval * easeFactor);
    }
    
    // Update ease factor: EF'=EF+(0.1-(5-q)*(0.08+(5-q)*0.02))
    const q = qualityResponse;
    easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (easeFactor < 1.3) {
      easeFactor = 1.3;
    }
    
    repetitions += 1;
  } else {
    // Quality response < 3: start over
    repetitions = 0;
    intervalDays = 1;
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);

  return {
    repetitions,
    intervalDays,
    easeFactor,
    nextReviewDate
  };
}

module.exports = {
  calculateSM2
};
