/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_QUESTION_TIME_LIMIT_SECONDS?: string;
  readonly VITE_SKIP_UNLOCK_SECONDS?: string;
  readonly VITE_CLEAN_ANSWER_POINTS?: string;
  readonly VITE_CORRECTED_ANSWER_POINTS?: string;
  readonly VITE_CLEAN_STREAK_FOR_LEVEL_UP?: string;
  readonly VITE_STARTING_LEVEL?: string;
  readonly VITE_MAX_SYLLABLES?: string;
  readonly VITE_RUN_TIME_LIMIT_SECONDS?: string;
  readonly VITE_LEADERBOARD_SIZE?: string;
  readonly VITE_FEEDBACK_DELAY_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
