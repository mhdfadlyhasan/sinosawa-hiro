import type { ScriptPack } from './types';

const INITIAL_JAMO = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
];

const INITIAL_ROMAN = [
  'g',
  'kk',
  'n',
  'd',
  'tt',
  'r',
  'm',
  'b',
  'pp',
  's',
  'ss',
  '',
  'j',
  'jj',
  'ch',
  'k',
  't',
  'p',
  'h',
];

const MEDIAL_JAMO = [
  'ㅏ',
  'ㅐ',
  'ㅑ',
  'ㅒ',
  'ㅓ',
  'ㅔ',
  'ㅕ',
  'ㅖ',
  'ㅗ',
  'ㅘ',
  'ㅙ',
  'ㅚ',
  'ㅛ',
  'ㅜ',
  'ㅝ',
  'ㅞ',
  'ㅟ',
  'ㅠ',
  'ㅡ',
  'ㅢ',
  'ㅣ',
];

const MEDIAL_ROMAN = [
  'a',
  'ae',
  'ya',
  'yae',
  'eo',
  'e',
  'yeo',
  'ye',
  'o',
  'wa',
  'wae',
  'oe',
  'yo',
  'u',
  'wo',
  'we',
  'wi',
  'yu',
  'eu',
  'ui',
  'i',
];

const FINAL_JAMO = [
  '',
  'ㄱ',
  'ㄲ',
  'ㄳ',
  'ㄴ',
  'ㄵ',
  'ㄶ',
  'ㄷ',
  'ㄹ',
  'ㄺ',
  'ㄻ',
  'ㄼ',
  'ㄽ',
  'ㄾ',
  'ㄿ',
  'ㅀ',
  'ㅁ',
  'ㅂ',
  'ㅄ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
];

const FINAL_ROMAN = [
  '',
  'k',
  'k',
  'ks',
  'n',
  'nj',
  'nh',
  't',
  'l',
  'lk',
  'lm',
  'lb',
  'ls',
  'lt',
  'lp',
  'lh',
  'm',
  'p',
  'ps',
  't',
  't',
  'ng',
  't',
  't',
  'k',
  't',
  'p',
  'h',
];

const INITIAL_ALTS = INITIAL_ROMAN.map((roman, index) =>
  index === 5 ? ['r', 'l'] : [roman],
);

const FINAL_ALTS: string[][] = [
  [''],
  ['k', 'g'],
  ['k', 'g'],
  ['ks'],
  ['n'],
  ['nj'],
  ['nh'],
  ['t', 'd'],
  ['l', 'r'],
  ['lk'],
  ['lm'],
  ['lb'],
  ['ls'],
  ['lt'],
  ['lp'],
  ['lh'],
  ['m'],
  ['p', 'b'],
  ['ps'],
  ['t', 'd'],
  ['t', 'd'],
  ['ng'],
  ['t', 'd'],
  ['t', 'd'],
  ['k', 'g'],
  ['t', 'd'],
  ['p', 'b'],
  ['h'],
];

const BASIC_INITIALS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const BASIC_MEDIALS = ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅡ', 'ㅣ'];
const OTHER_MEDIALS = ['ㅑ', 'ㅕ', 'ㅛ', 'ㅠ', 'ㅐ', 'ㅔ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅢ'];
const SIMPLE_FINALS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ'];

function compose(initial: string, medial: string, final = ''): string {
  const initialIndex = INITIAL_JAMO.indexOf(initial);
  const medialIndex = MEDIAL_JAMO.indexOf(medial);
  const finalIndex = FINAL_JAMO.indexOf(final);

  if (initialIndex < 0 || medialIndex < 0 || finalIndex < 0) {
    return '';
  }

  return String.fromCharCode(
    0xac00 + (initialIndex * 21 + medialIndex) * 28 + finalIndex,
  );
}

const BASIC_POOL = BASIC_INITIALS.flatMap((initial) =>
  BASIC_MEDIALS.map((medial) => compose(initial, medial)),
);

const COMPOUND_VOWEL_POOL = BASIC_INITIALS.flatMap((initial) =>
  OTHER_MEDIALS.map((medial) => compose(initial, medial)),
);

const BATCHIM_POOL = BASIC_INITIALS.flatMap((initial) =>
  BASIC_MEDIALS.flatMap((medial) =>
    SIMPLE_FINALS.map((final) => compose(initial, medial, final)),
  ),
);

export interface DecomposedHangul {
  initial: number;
  medial: number;
  final: number;
}

export function decomposeHangul(char: string): DecomposedHangul | null {
  const code = char.charCodeAt(0);

  if (code < 0xac00 || code > 0xd7a3) {
    return null;
  }

  const offset = code - 0xac00;
  const initial = Math.floor(offset / (21 * 28));
  const medial = Math.floor((offset % (21 * 28)) / 28);
  const final = offset % 28;

  return { initial, medial, final };
}

export function romanizeHangul(text: string): string {
  const parts: string[] = [];

  for (const char of text) {
    const decomposed = decomposeHangul(char);

    if (!decomposed) {
      parts.push(char);
      continue;
    }

    parts.push(
      INITIAL_ROMAN[decomposed.initial] +
        MEDIAL_ROMAN[decomposed.medial] +
        FINAL_ROMAN[decomposed.final],
    );
  }

  return parts.join('');
}

function hangulVariants(unit: string): string[] {
  const decomposed = decomposeHangul(unit);

  if (!decomposed) {
    return [unit];
  }

  const canonical = romanizeHangul(unit);
  const variants = new Set<string>([canonical]);

  for (const initial of INITIAL_ALTS[decomposed.initial]) {
    for (const final of FINAL_ALTS[decomposed.final]) {
      variants.add(initial + MEDIAL_ROMAN[decomposed.medial] + final);
    }
  }

  return [...variants];
}

export const hangulPack: ScriptPack = {
  id: 'hangul',
  label: 'Hangul',
  nativeLabel: '한글',
  description: 'Read Korean syllable blocks. Type the Revised Romanization.',
  sample: '가나',
  accent: '#7c9cff',
  tiers: [BASIC_POOL, COMPOUND_VOWEL_POOL, BATCHIM_POOL],
  variants: hangulVariants,
};
