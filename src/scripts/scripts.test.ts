import { describe, expect, it } from 'vitest';
import { buildQuestion } from './build';
import { decomposeHangul, hangulPack, romanizeHangul } from './hangul';
import {
  hiraganaPack,
  katakanaPack,
  romanizeKana,
  toKatakana,
} from './kana';
import { normalizeAnswer } from './types';

describe('hangul romanization', () => {
  it('romanizes basic syllables', () => {
    expect(romanizeHangul('가')).toBe('ga');
    expect(romanizeHangul('각')).toBe('gak');
    expect(romanizeHangul('한글')).toBe('hangeul');
    expect(romanizeHangul('괜')).toBe('gwaen');
  });

  it('decomposes syllable blocks', () => {
    expect(decomposeHangul('가')).toEqual({
      initial: 0,
      medial: 0,
      final: 0,
    });
    expect(decomposeHangul('한')).toEqual({
      initial: 18,
      medial: 0,
      final: 4,
    });
    expect(decomposeHangul('a')).toBeNull();
  });

  it('accepts common final-consonant variants', () => {
    expect(hangulPack.variants('각')).toContain('gak');
    expect(hangulPack.variants('각')).toContain('gag');
    expect(hangulPack.variants('라')).toContain('la');
  });
});

describe('kana romanization', () => {
  it('romanizes hiragana and katakana', () => {
    expect(romanizeKana('あ')).toBe('a');
    expect(romanizeKana('し')).toBe('shi');
    expect(romanizeKana('きゃ')).toBe('kya');
    expect(romanizeKana('パタン')).toBe('patan');
    expect(romanizeKana(toKatakana('きゃ'))).toBe('kya');
  });

  it('accepts alternative Hepburn spellings', () => {
    expect(hiraganaPack.variants('し')).toEqual(
      expect.arrayContaining(['shi', 'si']),
    );
    expect(hiraganaPack.variants('ちゃ')).toEqual(
      expect.arrayContaining(['cha', 'tya']),
    );
    expect(katakanaPack.variants('キャ')).toEqual(['kya']);
  });
});

describe('question generation', () => {
  it('builds the requested number of units with accepted answers', () => {
    const question = buildQuestion(hiraganaPack, 2, '', () => 0);

    expect(question.prompt).toBe('あい');
    expect(question.answer).toBe('ai');
    expect(question.units).toHaveLength(2);
    expect(question.accepted).toContain(normalizeAnswer('ai'));
  });

  it('builds nonsense combinations from the right script', () => {
    const question = buildQuestion(katakanaPack, 1, '', () => 0);

    expect(question.mode).toBe('katakana');
    expect(question.prompt).toBe('ア');
    expect(question.answer).toBe('a');
  });

  it('normalizes spacing and casing', () => {
    expect(normalizeAnswer('  Ga Na ')).toBe('gana');
    expect(normalizeAnswer('patan')).toBe('patan');
  });
});
