import type { Question, ScriptId } from '../scripts';

export type Phase = 'playing' | 'finished';

export type FeedbackKind = 'correct' | 'wrong' | 'skip' | 'limit';

export interface Feedback {
  kind: FeedbackKind;
  at: number;
  points?: number;
  answer?: string;
}

export interface MissedQuestion {
  prompt: string;
  answer: string;
  units: string[];
}

export interface RunRecord {
  id: string;
  mode: ScriptId;
  score: number;
  correct: number;
  answered: number;
  cleanCount: number;
  elapsedMs: number;
  endedAt: string;
  levelReached: number;
}

export interface GameState {
  runId: string;
  mode: ScriptId;
  phase: Phase;
  level: number;
  score: number;
  cleanStreak: number;
  cleanCount: number;
  correctCount: number;
  answeredCount: number;
  mistakes: Record<string, number>;
  missed: MissedQuestion[];
  current: Question;
  input: string;
  firstAttempt: boolean;
  wrongAttempts: number;
  mistakeRecorded: boolean;
  feedback: Feedback | null;
  locked: boolean;
  levelUpAt: number | null;
  startedAt: number;
  questionStartedAt: number;
  questionNumber: number;
  now: number;
  result: RunRecord | null;
}
