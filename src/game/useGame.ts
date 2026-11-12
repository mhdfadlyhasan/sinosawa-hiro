import { useCallback, useEffect, useState } from 'react';
import {
  createRun,
  endRun,
  submitAnswer,
  tick,
  updateInput,
} from './engine';
import type { ScriptId } from '../scripts';
import type { GameState } from './types';

export interface GameController {
  state: GameState | null;
  start: (mode: ScriptId) => void;
  reset: () => void;
  submit: () => void;
  end: () => void;
  setInput: (value: string) => void;
}

export function useGame(): GameController {
  const [state, setState] = useState<GameState | null>(null);

  useEffect(() => {
    if (state?.phase !== 'playing') {
      return;
    }

    const interval = window.setInterval(() => {
      setState((current) =>
        current && current.phase === 'playing'
          ? tick(current, Date.now())
          : current,
      );
    }, 50);

    return () => window.clearInterval(interval);
  }, [state?.phase, state?.runId]);

  const start = useCallback((mode: ScriptId) => {
    setState(createRun(mode, Date.now()));
  }, []);

  const reset = useCallback(() => {
    setState(null);
  }, []);

  const submit = useCallback(() => {
    setState((current) =>
      current ? submitAnswer(current, Date.now()) : current,
    );
  }, []);

  const end = useCallback(() => {
    setState((current) => (current ? endRun(current, Date.now()) : current));
  }, []);

  const setInput = useCallback((value: string) => {
    setState((current) => (current ? updateInput(current, value) : current));
  }, []);

  return { state, start, reset, submit, end, setInput };
}
