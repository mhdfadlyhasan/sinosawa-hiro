import { useEffect, useRef } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { config } from '../config';
import type { ScriptPack } from '../scripts';
import type { GameState } from '../game/types';
import { formatDuration } from '../lib/format';

interface GameScreenProps {
  state: GameState;
  pack: ScriptPack;
  onSubmit: () => void;
  onEnd: () => void;
  onInput: (value: string) => void;
}

export function GameScreen({
  state,
  pack,
  onSubmit,
  onEnd,
  onInput,
}: GameScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!state.locked) {
      inputRef.current?.focus();
    }
  }, [state.questionNumber, state.locked]);

  const feedback = state.feedback;
  const frozenAt =
    state.locked && feedback ? feedback.at : state.now;
  const questionElapsed = Math.max(
    0,
    Math.min(
      config.questionTimeLimitMs,
      frozenAt - state.questionStartedAt,
    ),
  );
  const remainingMs = config.questionTimeLimitMs - questionElapsed;
  const runElapsed = state.now - state.startedAt;
  const atMaxLevel = state.level >= config.maxSyllables;
  const levelUpVisible =
    state.levelUpAt !== null && state.now - state.levelUpAt < 1700;

  const levelProgress = atMaxLevel
    ? 'Max level'
    : `${state.cleanStreak} / ${config.cleanStreakForLevelUp} clean to level ${
        state.level + 1
      }`;

  let feedbackMessage = '';
  let feedbackTone = '';

  if (feedback?.kind === 'correct') {
    feedbackMessage = `Correct +${feedback.points ?? 0}`;
    feedbackTone = 'is-good';
  } else if (feedback?.kind === 'wrong') {
    feedbackMessage = 'Not quite — try again.';
    feedbackTone = 'is-bad';
  } else if (feedback?.kind === 'skip') {
    feedbackMessage = 'Skipped.';
    feedbackTone = 'is-warn';
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <main className="page game-page">
      <div className="game-topbar">
        <div
          className="mode-chip"
          style={{ '--accent': pack.accent } as CSSProperties}
        >
          <span className="mode-dot" />
          {pack.label}
          <span className="mode-chip-native">{pack.nativeLabel}</span>
        </div>
        <div className="run-clock">
          <span className="run-clock-label">Run</span>
          {formatDuration(runElapsed)}
        </div>
        <button type="button" className="ghost-button" onClick={onEnd}>
          End run
        </button>
      </div>

      <section className="game-stage">
        <div className="question-meta">
          <span>Question {state.questionNumber}</span>
          <span>
            Level {state.level} · {state.level}{' '}
            {state.level === 1 ? 'glyph' : 'glyphs'}
          </span>
        </div>

        <div
          key={state.questionNumber}
          className="prompt"
          lang={pack.id === 'hangul' ? 'ko' : 'ja'}
        >
          {state.current.prompt}
        </div>

        {feedback?.kind === 'skip' && (
          <div className="answer-reveal" role="status" aria-live="polite">
            <span className="answer-reveal-label">Answer</span>
            <span className="answer-reveal-value">{feedback.answer}</span>
          </div>
        )}

        <div className="timer-row">
          <span
            className={`timer-value ${
              remainingMs < 3000 && !state.locked ? 'is-danger' : ''
            }`}
          >
            {(remainingMs / 1000).toFixed(1)}s
          </span>
          <div className="timer-track" aria-hidden="true">
            <div
              className={`timer-fill ${
                remainingMs < 3000 && !state.locked ? 'is-danger' : ''
              }`}
              style={{
                width: `${(questionElapsed / config.questionTimeLimitMs) * 100}%`,
              }}
            />
          </div>
          <span className="score-live">{state.score} pts</span>
        </div>

        <form className="answer-form" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            value={state.input}
            onChange={(event) => onInput(event.target.value)}
            disabled={state.locked}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            placeholder="type the romanization…"
            aria-label="Romanization answer"
          />
          <button
            type="submit"
            className="primary-button"
            disabled={state.locked || state.input.trim().length === 0}
          >
            Check
          </button>
        </form>

        <div
          className={`feedback-line ${feedbackTone}`}
          aria-live="assertive"
        >
          {feedbackMessage || '\u00a0'}
        </div>

        <div className="game-actions">
          <div className="level-progress">
            <div className="level-progress-head">
              <span>Level {state.level}</span>
              <span>{levelProgress}</span>
            </div>
            <div className="level-track" aria-hidden="true">
              <div
                className="level-fill"
                style={{
                  width: atMaxLevel
                    ? '100%'
                    : `${
                        (state.cleanStreak /
                          config.cleanStreakForLevelUp) *
                        100
                      }%`,
                }}
              />
            </div>
          </div>
        </div>

        {levelUpVisible && (
          <div className="level-up-toast" role="status">
            Level up — {state.level} glyph{state.level === 1 ? '' : 's'} per
            prompt
          </div>
        )}
      </section>
    </main>
  );
}
