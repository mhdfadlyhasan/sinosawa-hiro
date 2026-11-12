import { useEffect, useRef, useState } from 'react';
import { config } from './config';
import { getScriptPack } from './scripts';
import type { ScriptId } from './scripts';
import { addRecord, loadRecords } from './game/storage';
import type { RunRecord } from './game/types';
import { useGame } from './game/useGame';
import { GameScreen } from './components/GameScreen';
import { ResultScreen } from './components/ResultScreen';
import { StartScreen } from './components/StartScreen';

export default function App() {
  const game = useGame();
  const [records, setRecords] = useState<RunRecord[]>(() => loadRecords());
  const savedRunId = useRef<string | null>(null);

  const result = game.state?.result;

  useEffect(() => {
    if (!result || result.answered === 0) {
      return;
    }

    if (savedRunId.current === result.id) {
      return;
    }

    savedRunId.current = result.id;
    setRecords(addRecord(result, config.leaderboardSize));
  }, [result]);

  function start(mode: ScriptId) {
    game.start(mode);
  }

  if (game.state?.phase === 'finished' && game.state.result) {
    return (
      <ResultScreen
        state={game.state}
        onReplay={() => game.start(game.state!.mode)}
        onChangeMode={() => {
          game.reset();
        }}
      />
    );
  }

  if (game.state?.phase === 'playing') {
    return (
      <GameScreen
        state={game.state}
        pack={getScriptPack(game.state.mode)}
        onSubmit={game.submit}
        onEnd={game.end}
        onInput={game.setInput}
      />
    );
  }

  return <StartScreen records={records} onStart={start} />;
}
