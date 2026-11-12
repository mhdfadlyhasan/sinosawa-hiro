import { hangulPack } from './hangul';
import { hiraganaPack, katakanaPack } from './kana';
import type { ScriptId, ScriptPack } from './types';

export const SCRIPT_PACKS: Record<ScriptId, ScriptPack> = {
  hangul: hangulPack,
  hiragana: hiraganaPack,
  katakana: katakanaPack,
};

export const SCRIPT_LIST: ScriptPack[] = [
  hangulPack,
  hiraganaPack,
  katakanaPack,
];

export function getScriptPack(mode: ScriptId): ScriptPack {
  return SCRIPT_PACKS[mode];
}

export type { Question, ScriptId, ScriptPack } from './types';
export { normalizeAnswer } from './types';
export { buildQuestion } from './build';
