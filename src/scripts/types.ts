export type ScriptId = 'hangul' | 'hiragana' | 'katakana';

export interface Question {
  prompt: string;
  answer: string;
  accepted: string[];
  units: string[];
  mode: ScriptId;
}

export interface ScriptPack {
  id: ScriptId;
  label: string;
  nativeLabel: string;
  description: string;
  sample: string;
  accent: string;
  tiers: string[][];
  variants: (unit: string) => string[];
}

export function normalizeAnswer(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s\-'’.]/g, '');
}
