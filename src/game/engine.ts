import { config } from '../config';
import {
  buildQuestion,
  getScriptPack,
  normalizeAnswer,
} from '../scripts';
import type { ScriptId } from '../scripts';
import type { GameState, MissedQuestion, RunRecord } from './types';

function makeRunId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function recordMistake(
  state: GameState,
): Pick<GameState, 'mistakes' | 'missed' | 'mistakeRecorded'> {
  if (state.mistakeRecorded) {
    return {
      mistakes: state.mistakes,
      missed: state.missed,
      mistakeRecorded: true,
    };
  }

  const mistakes = { ...state.mistakes };

  for (const unit of state.current.units) {
    mistakes[unit] = (mistakes[unit] ?? 0) + 1;
  }

  const missed: MissedQuestion = {
    prompt: state.current.prompt,
    answer: state.current.answer,
    units: [...state.current.units],
  };

  return {
    mistakes,
    missed: [...state.missed, missed],
    mistakeRecorded: true,
  };
}

export function createRun(
  mode: ScriptId,
  now: number,
  random: () => number = Math.random,
): GameState {
  const level = config.startingLevel;
  const current = buildQuestion(getScriptPack(mode), level, '', random);

  return {
    runId: makeRunId(),
    mode,
    phase: 'playing',
    level,
    score: 0,
    cleanStreak: 0,
    cleanCount: 0,
    correctCount: 0,
    answeredCount: 0,
    mistakes: {},
    missed: [],
    current,
    input: '',
    firstAttempt: true,
    mistakeRecorded: false,
    feedback: null,
    locked: false,
    levelUpAt: null,
    startedAt: now,
    questionStartedAt: now,
    questionNumber: 1,
    now,
    result: null,
  };
}

export function updateInput(state: GameState, input: string): GameState {
  if (state.phase !== 'playing' || state.locked) {
    return state;
  }

  return {
    ...state,
    input,
    feedback: state.feedback?.kind === 'wrong' ? null : state.feedback,
  };
}

export function finishRun(state: GameState, now: number): GameState {
  if (state.phase === 'finished') {
    return state;
  }

  const result: RunRecord = {
    id: state.runId,
    mode: state.mode,
    score: state.score,
    correct: state.correctCount,
    answered: state.answeredCount,
    cleanCount: state.cleanCount,
    elapsedMs: Math.max(0, now - state.startedAt),
    endedAt: new Date(now).toISOString(),
    levelReached: state.level,
  };

  return {
    ...state,
    phase: 'finished',
    locked: true,
    feedback: null,
    now,
    result,
  };
}

function timeoutRun(state: GameState, now: number): GameState {
  const mistake = recordMistake(state);

  return finishRun(
    {
      ...state,
      ...mistake,
      cleanStreak: 0,
      answeredCount: state.answeredCount + 1,
      firstAttempt: false,
      input: '',
      locked: true,
      feedback: null,
      now,
    },
    now,
  );
}

function nextQuestion(state: GameState, now: number): GameState {
  if (
    config.runTimeLimitMs > 0 &&
    now - state.startedAt >= config.runTimeLimitMs
  ) {
    return finishRun(state, now);
  }

  const current = buildQuestion(
    getScriptPack(state.mode),
    state.level,
    state.current.prompt,
  );

  return {
    ...state,
    current,
    input: '',
    firstAttempt: true,
    mistakeRecorded: false,
    feedback: null,
    locked: false,
    questionStartedAt: now,
    questionNumber: state.questionNumber + 1,
    now,
  };
}

export function tick(state: GameState, now: number): GameState {
  if (state.phase !== 'playing') {
    return state;
  }

  if (
    config.runTimeLimitMs > 0 &&
    now - state.startedAt >= config.runTimeLimitMs
  ) {
    return finishRun(state, now);
  }

  if (state.locked) {
    if (
      state.feedback &&
      now - state.feedback.at >= config.feedbackDelayMs
    ) {
      return nextQuestion(state, now);
    }

    return { ...state, now };
  }

  if (now - state.questionStartedAt >= config.questionTimeLimitMs) {
    return timeoutRun(state, now);
  }

  return { ...state, now };
}

export function submitAnswer(state: GameState, now: number): GameState {
  if (state.phase !== 'playing' || state.locked) {
    return state;
  }

  if (now - state.questionStartedAt >= config.questionTimeLimitMs) {
    return timeoutRun(state, now);
  }

  const normalized = normalizeAnswer(state.input);

  if (!normalized) {
    return state;
  }

  if (!state.current.accepted.includes(normalized)) {
    const mistake = recordMistake(state);

    return {
      ...state,
      ...mistake,
      firstAttempt: false,
      input: '',
      locked: false,
      feedback: { kind: 'wrong', at: now },
      now,
    };
  }

  const wasFirstAttempt = state.firstAttempt;
  const points = wasFirstAttempt
    ? config.cleanPoints
    : config.correctedPoints;
  let cleanStreak = wasFirstAttempt ? state.cleanStreak + 1 : 0;
  let level = state.level;
  let levelUpAt = state.levelUpAt;

  if (wasFirstAttempt && cleanStreak >= config.cleanStreakForLevelUp) {
    if (level < config.maxSyllables) {
      level += 1;
      levelUpAt = now;
    }

    cleanStreak = 0;
  }

  return {
    ...state,
    score: state.score + points,
    correctCount: state.correctCount + 1,
    answeredCount: state.answeredCount + 1,
    cleanCount: state.cleanCount + (wasFirstAttempt ? 1 : 0),
    cleanStreak,
    level,
    levelUpAt,
    input: '',
    locked: true,
    feedback: { kind: 'correct', points, at: now },
    now,
  };
}

export function skipQuestion(state: GameState, now: number): GameState {
  if (state.phase !== 'playing' || state.locked) {
    return state;
  }

  if (now - state.questionStartedAt >= config.questionTimeLimitMs) {
    return timeoutRun(state, now);
  }

  if (now - state.questionStartedAt < config.skipUnlockMs) {
    return state;
  }

  const mistake = recordMistake(state);

  return {
    ...state,
    ...mistake,
    cleanStreak: 0,
    answeredCount: state.answeredCount + 1,
    firstAttempt: false,
    input: '',
    locked: true,
    feedback: {
      kind: 'skip',
      answer: state.current.answer,
      at: now,
    },
    now,
  };
}

export function endRun(state: GameState, now: number): GameState {
  return finishRun(state, now);
}
