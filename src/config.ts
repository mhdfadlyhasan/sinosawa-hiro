function numberFromEnv(
  value: string | undefined,
  fallback: number,
  minimum: number,
  maximum = Number.POSITIVE_INFINITY,
): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(maximum, Math.max(minimum, parsed));
}

const maxSyllables = Math.floor(
  numberFromEnv(import.meta.env.VITE_MAX_SYLLABLES, 4, 1, 8),
);

export const config = Object.freeze({
  questionTimeLimitMs:
    numberFromEnv(import.meta.env.VITE_QUESTION_TIME_LIMIT_SECONDS, 10, 1, 120) *
    1000,
  skipUnlockMs:
    numberFromEnv(import.meta.env.VITE_SKIP_UNLOCK_SECONDS, 5, 0, 120) * 1000,
  cleanPoints: Math.floor(
    numberFromEnv(import.meta.env.VITE_CLEAN_ANSWER_POINTS, 5, 0, 100),
  ),
  correctedPoints: Math.floor(
    numberFromEnv(import.meta.env.VITE_CORRECTED_ANSWER_POINTS, 3, 0, 100),
  ),
  cleanStreakForLevelUp: Math.floor(
    numberFromEnv(import.meta.env.VITE_CLEAN_STREAK_FOR_LEVEL_UP, 5, 1, 100),
  ),
  startingLevel: Math.floor(
    numberFromEnv(import.meta.env.VITE_STARTING_LEVEL, 1, 1, maxSyllables),
  ),
  maxSyllables,
  runTimeLimitMs:
    numberFromEnv(import.meta.env.VITE_RUN_TIME_LIMIT_SECONDS, 0, 0, 3600) *
    1000,
  leaderboardSize: Math.floor(
    numberFromEnv(import.meta.env.VITE_LEADERBOARD_SIZE, 10, 1, 100),
  ),
  feedbackDelayMs: Math.floor(
    numberFromEnv(import.meta.env.VITE_FEEDBACK_DELAY_MS, 450, 0, 5000),
  ),
});
