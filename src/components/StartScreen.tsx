import type { CSSProperties } from 'react';
import { config } from '../config';
import { SCRIPT_LIST } from '../scripts';
import type { ScriptId } from '../scripts';
import { recordsForMode } from '../game/storage';
import type { RunRecord } from '../game/types';
import { formatDuration } from '../lib/format';
import { Leaderboard } from './Leaderboard';

interface StartScreenProps {
  records: RunRecord[];
  onStart: (mode: ScriptId) => void;
}

export function StartScreen({ records, onStart }: StartScreenProps) {
  return (
    <main className="page">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Time-trial reading trainer</p>
          <h1>
            sinosawa<span>-hiro</span>
          </h1>
          <p className="lede">
            Read the glyphs, type the romanization, and keep the clock moving.
            Every clean answer makes the next prompt longer.
          </p>
        </div>

        <div className="rules-strip" aria-label="Game settings">
          <span>
            <strong>{config.questionTimeLimitMs / 1000}s</strong> per prompt
          </span>
          <span>
            <strong>+{config.cleanPoints}</strong> clean
          </span>
          <span>
            <strong>+{config.correctedPoints}</strong> corrected
          </span>
          <span>
            Level up every <strong>{config.cleanStreakForLevelUp}</strong> clean
          </span>
        </div>
      </header>

      <section className="mode-grid" aria-label="Choose a script">
        {SCRIPT_LIST.map((pack) => {
          const best = recordsForMode(records, pack.id)[0];

          return (
            <button
              key={pack.id}
              type="button"
              className="mode-card"
              style={{ '--accent': pack.accent } as CSSProperties}
              onClick={() => onStart(pack.id)}
            >
              <span className="mode-glyph" lang={pack.id === 'hangul' ? 'ko' : 'ja'}>
                {pack.sample}
              </span>
              <span className="mode-content">
                <span className="mode-heading">
                  <span className="mode-title">{pack.label}</span>
                  <span
                    className="mode-native"
                    lang={pack.id === 'hangul' ? 'ko' : 'ja'}
                  >
                    {pack.nativeLabel}
                  </span>
                </span>
                <span className="mode-description">{pack.description}</span>
                <span className="mode-meta">
                  {best
                    ? `Best ${best.score} pts · ${formatDuration(best.elapsedMs)}`
                    : 'No record yet'}
                </span>
              </span>
              <span className="mode-start">Start</span>
            </button>
          );
        })}
      </section>

      <Leaderboard records={records} />

      <footer className="footer">
        Input is checked with the Revised Romanization for Korean and Hepburn
        for Japanese. Records stay on this device.
        {config.runTimeLimitMs > 0 && (
          <span>
            {' '}
            Runs end automatically after {config.runTimeLimitMs / 1000}s.
          </span>
        )}
      </footer>
    </main>
  );
}
