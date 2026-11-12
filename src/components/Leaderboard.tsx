import { useState } from 'react';
import type { CSSProperties } from 'react';
import { SCRIPT_LIST } from '../scripts';
import type { ScriptId } from '../scripts';
import type { RunRecord } from '../game/types';
import { recordsForMode } from '../game/storage';
import { formatDate, formatDuration } from '../lib/format';

interface LeaderboardProps {
  records: RunRecord[];
}

export function Leaderboard({ records }: LeaderboardProps) {
  const [selectedMode, setSelectedMode] = useState<ScriptId>('hangul');
  const rows = recordsForMode(records, selectedMode);
  const selectedPack = SCRIPT_LIST.find((pack) => pack.id === selectedMode);

  return (
    <section className="panel leaderboard">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Local records</p>
          <h2>Leaderboard</h2>
        </div>
        <p className="panel-note">Top runs per script, stored in this browser.</p>
      </div>

      <div className="tabs" role="tablist" aria-label="Leaderboard script">
        {SCRIPT_LIST.map((pack) => (
          <button
            key={pack.id}
            type="button"
            role="tab"
            aria-selected={pack.id === selectedMode}
            className={`tab ${pack.id === selectedMode ? 'is-active' : ''}`}
            style={{ '--accent': pack.accent } as CSSProperties}
            onClick={() => setSelectedMode(pack.id)}
          >
            <span>{pack.label}</span>
            <span className="tab-native" lang={pack.id === 'hangul' ? 'ko' : 'ja'}>
              {pack.nativeLabel}
            </span>
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="empty-state">
          <span
            className="empty-glyph"
            lang={selectedMode === 'hangul' ? 'ko' : 'ja'}
          >
            {selectedPack?.sample}
          </span>
          <p>No {selectedPack?.label} runs yet. Set the first record.</p>
        </div>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Score</th>
                <th>Time</th>
                <th>Correct</th>
                <th>Level</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((record, index) => (
                <tr key={record.id}>
                  <td className="rank">{index + 1}</td>
                  <td className="score-cell">{record.score}</td>
                  <td>{formatDuration(record.elapsedMs)}</td>
                  <td>
                    {record.correct}/{record.answered}
                  </td>
                  <td>{record.levelReached}</td>
                  <td className="date-cell">{formatDate(record.endedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
