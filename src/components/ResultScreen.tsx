import type { CSSProperties } from 'react';
import { getScriptPack } from '../scripts';
import type { GameState } from '../game/types';
import { formatDate, formatDuration } from '../lib/format';

interface ResultScreenProps {
  state: GameState;
  onReplay: () => void;
  onChangeMode: () => void;
}

export function ResultScreen({
  state,
  onReplay,
  onChangeMode,
}: ResultScreenProps) {
  const result = state.result;
  const pack = getScriptPack(state.mode);

  if (!result) {
    return null;
  }

  const mistakeEntries = Object.entries(state.mistakes)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8);
  const accuracy =
    result.answered === 0
      ? 0
      : Math.round((result.correct / result.answered) * 100);

  return (
    <main className="page result-page">
      <header className="result-hero">
        <p className="eyebrow">
          {pack.label} run · {formatDate(result.endedAt)}
        </p>
        <h1>
          {result.score}
          <span>pts</span>
        </h1>
        <p className="lede">
          {result.correct} of {result.answered} prompts solved in{' '}
          {formatDuration(result.elapsedMs)}.
        </p>
      </header>

      <section className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Total time</span>
          <strong>{formatDuration(result.elapsedMs)}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Accuracy</span>
          <strong>{accuracy}%</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Clean answers</span>
          <strong>{result.cleanCount}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Level reached</span>
          <strong>{result.levelReached}</strong>
        </div>
      </section>

      <section className="panel mistakes-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Weak spots</p>
            <h2>Most missed glyphs</h2>
          </div>
          <p className="panel-note">
            Highlights from this run only, ordered by miss count.
          </p>
        </div>

        {mistakeEntries.length === 0 ? (
          <div className="perfect-state">
            <span>Perfect run.</span> No missed glyphs to highlight.
          </div>
        ) : (
          <div className="mistake-grid">
            {mistakeEntries.map(([unit, count], index) => (
              <div
                key={unit}
                className={`mistake-card ${index === 0 ? 'is-top' : ''}`}
                style={{ '--accent': pack.accent } as CSSProperties}
              >
                <span
                  className="mistake-glyph"
                  lang={pack.id === 'hangul' ? 'ko' : 'ja'}
                >
                  {unit}
                </span>
                <span className="mistake-romaji">
                  {pack.variants(unit)[0] ?? unit}
                </span>
                <span className="mistake-count">
                  {count} miss{count === 1 ? '' : 'es'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {state.missed.length > 0 && (
        <section className="panel missed-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Review</p>
              <h2>Missed prompts</h2>
            </div>
          </div>
          <ul className="missed-list">
            {state.missed.map((entry, index) => (
              <li key={`${entry.prompt}-${index}`}>
                <span
                  className="missed-prompt"
                  lang={pack.id === 'hangul' ? 'ko' : 'ja'}
                >
                  {entry.prompt}
                </span>
                <span className="missed-arrow">→</span>
                <span className="missed-answer">{entry.answer}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="result-actions">
        <button type="button" className="primary-button" onClick={onReplay}>
          Run it again
        </button>
        <button type="button" className="ghost-button" onClick={onChangeMode}>
          Change script
        </button>
      </div>
    </main>
  );
}
