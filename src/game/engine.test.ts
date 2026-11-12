import { describe, expect, it } from 'vitest';
import { config } from '../config';
import {
  createRun,
  endRun,
  skipQuestion,
  submitAnswer,
  tick,
  updateInput,
} from './engine';

const NOW = 1_700_000_000_000;

describe('game engine', () => {
  it('scores a first-try answer and advances after feedback', () => {
    let state = createRun('hangul', NOW);
    state = updateInput(state, state.current.answer);
    state = submitAnswer(state, NOW + 1000);

    expect(state.score).toBe(config.cleanPoints);
    expect(state.cleanStreak).toBe(1);
    expect(state.answeredCount).toBe(1);
    expect(state.feedback?.kind).toBe('correct');
    expect(state.locked).toBe(true);

    state = tick(state, NOW + 1000 + config.feedbackDelayMs);

    expect(state.locked).toBe(false);
    expect(state.questionNumber).toBe(2);
    expect(state.input).toBe('');
  });

  it('awards corrected points after a wrong attempt and records one miss', () => {
    let state = createRun('hangul', NOW);
    const units = state.current.units;
    state = updateInput(state, 'definitely-wrong');
    state = submitAnswer(state, NOW + 100);
    state = updateInput(state, state.current.answer);
    state = submitAnswer(state, NOW + 200);

    expect(state.score).toBe(config.correctedPoints);
    expect(state.cleanStreak).toBe(0);
    expect(state.cleanCount).toBe(0);
    expect(state.missed).toHaveLength(1);
    expect(state.mistakes[units[0]]).toBe(1);
  });

  it('does not double-count repeated wrong attempts on the same prompt', () => {
    let state = createRun('hangul', NOW);
    const units = state.current.units;

    state = updateInput(state, 'nope');
    state = submitAnswer(state, NOW + 100);
    state = updateInput(state, 'still-nope');
    state = submitAnswer(state, NOW + 200);
    state = updateInput(state, state.current.answer);
    state = submitAnswer(state, NOW + 300);

    expect(state.missed).toHaveLength(1);

    for (const unit of units) {
      expect(state.mistakes[unit]).toBe(1);
    }
  });

  it('levels up after a clean streak and uses longer prompts next', () => {
    let state = createRun('hiragana', NOW);
    let clock = NOW;

    for (let index = 0; index < config.cleanStreakForLevelUp; index += 1) {
      clock += 1000;
      state = updateInput(state, state.current.answer);
      state = submitAnswer(state, clock);

      if (index < config.cleanStreakForLevelUp - 1) {
        clock += config.feedbackDelayMs;
        state = tick(state, clock);
      }
    }

    expect(state.score).toBe(
      config.cleanPoints * config.cleanStreakForLevelUp,
    );
    expect(state.level).toBe(config.startingLevel + 1);
    expect(state.cleanStreak).toBe(0);

    clock += config.feedbackDelayMs;
    state = tick(state, clock);

    expect(state.current.units).toHaveLength(config.startingLevel + 1);
  });

  it('resets the clean streak on a wrong answer without lowering the level', () => {
    let state = createRun('hangul', NOW);
    let clock = NOW;

    for (let index = 0; index < config.cleanStreakForLevelUp; index += 1) {
      clock += 1000;
      state = updateInput(state, state.current.answer);
      state = submitAnswer(state, clock);
      clock += config.feedbackDelayMs;
      state = tick(state, clock);
    }

    expect(state.level).toBe(2);

    clock += 1000;
    state = updateInput(state, 'wrong');
    state = submitAnswer(state, clock);

    expect(state.cleanStreak).toBe(0);
    expect(state.level).toBe(2);
  });

  it('ends the run when the question timer expires', () => {
    let state = createRun('hangul', NOW);
    const units = state.current.units;
    state = tick(state, NOW + config.questionTimeLimitMs);

    expect(state.phase).toBe('finished');
    expect(state.result).not.toBeNull();
    expect(state.answeredCount).toBe(1);
    expect(state.result?.answered).toBe(1);
    expect(state.mistakes[units[0]]).toBe(1);
  });

  it('ends the run on timeout without double-counting a wrong guess', () => {
    let state = createRun('hangul', NOW);
    state = updateInput(state, 'wrong');
    state = submitAnswer(state, NOW + 100);
    state = tick(state, NOW + config.questionTimeLimitMs);

    expect(state.phase).toBe('finished');
    expect(state.missed).toHaveLength(1);
    expect(state.answeredCount).toBe(1);
  });

  it('blocks skipping until the unlock time', () => {
    let state = createRun('hangul', NOW);

    state = skipQuestion(state, NOW + 1000);
    expect(state.locked).toBe(false);
    expect(state.answeredCount).toBe(0);

    state = skipQuestion(state, NOW + config.skipUnlockMs);
    expect(state.locked).toBe(true);
    expect(state.feedback?.kind).toBe('skip');
    expect(state.answeredCount).toBe(1);
  });

  it('finishes with a record containing score, time, and date', () => {
    let state = createRun('katakana', NOW);
    state = updateInput(state, state.current.answer);
    state = submitAnswer(state, NOW + 1500);
    state = endRun(state, NOW + 2000);

    expect(state.phase).toBe('finished');
    expect(state.result).not.toBeNull();
    expect(state.result?.mode).toBe('katakana');
    expect(state.result?.score).toBe(config.cleanPoints);
    expect(state.result?.elapsedMs).toBe(2000);
    expect(Number.isNaN(Date.parse(state.result?.endedAt ?? ''))).toBe(false);
  });
});
