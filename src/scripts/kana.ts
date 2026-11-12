import type { ScriptPack } from './types';

const BASIC = [
  'あ', 'い', 'う', 'え', 'お',
  'か', 'き', 'く', 'け', 'こ',
  'さ', 'し', 'す', 'せ', 'そ',
  'た', 'ち', 'つ', 'て', 'と',
  'な', 'に', 'ぬ', 'ね', 'の',
  'は', 'ひ', 'ふ', 'へ', 'ほ',
  'ま', 'み', 'む', 'め', 'も',
  'や', 'ゆ', 'よ',
  'ら', 'り', 'る', 'れ', 'ろ',
  'わ', 'を', 'ん',
];

const DAKUTEN = [
  'が', 'ぎ', 'ぐ', 'げ', 'ご',
  'ざ', 'じ', 'ず', 'ぜ', 'ぞ',
  'だ', 'ぢ', 'づ', 'で', 'ど',
  'ば', 'び', 'ぶ', 'べ', 'ぼ',
  'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ',
];

const YOON = [
  'きゃ', 'きゅ', 'きょ',
  'しゃ', 'しゅ', 'しょ',
  'ちゃ', 'ちゅ', 'ちょ',
  'にゃ', 'にゅ', 'にょ',
  'ひゃ', 'ひゅ', 'ひょ',
  'みゃ', 'みゅ', 'みょ',
  'りゃ', 'りゅ', 'りょ',
  'ぎゃ', 'ぎゅ', 'ぎょ',
  'じゃ', 'じゅ', 'じょ',
  'びゃ', 'びゅ', 'びょ',
  'ぴゃ', 'ぴゅ', 'ぴょ',
];

const ROMAJI: Record<string, string[]> = {
  あ: ['a'], い: ['i'], う: ['u'], え: ['e'], お: ['o'],
  か: ['ka'], き: ['ki'], く: ['ku'], け: ['ke'], こ: ['ko'],
  さ: ['sa'], し: ['shi', 'si'], す: ['su'], せ: ['se'], そ: ['so'],
  た: ['ta'], ち: ['chi', 'ti'], つ: ['tsu', 'tu'], て: ['te'], と: ['to'],
  な: ['na'], に: ['ni'], ぬ: ['nu'], ね: ['ne'], の: ['no'],
  は: ['ha'], ひ: ['hi'], ふ: ['fu', 'hu'], へ: ['he'], ほ: ['ho'],
  ま: ['ma'], み: ['mi'], む: ['mu'], め: ['me'], も: ['mo'],
  や: ['ya'], ゆ: ['yu'], よ: ['yo'],
  ら: ['ra'], り: ['ri'], る: ['ru'], れ: ['re'], ろ: ['ro'],
  わ: ['wa'], を: ['wo', 'o'], ん: ['n', 'nn'],
  が: ['ga'], ぎ: ['gi'], ぐ: ['gu'], げ: ['ge'], ご: ['go'],
  ざ: ['za'], じ: ['ji', 'zi'], ず: ['zu'], ぜ: ['ze'], ぞ: ['zo'],
  だ: ['da'], ぢ: ['ji', 'di'], づ: ['zu', 'du'], で: ['de'], ど: ['do'],
  ば: ['ba'], び: ['bi'], ぶ: ['bu'], べ: ['be'], ぼ: ['bo'],
  ぱ: ['pa'], ぴ: ['pi'], ぷ: ['pu'], ぺ: ['pe'], ぽ: ['po'],
  きゃ: ['kya'], きゅ: ['kyu'], きょ: ['kyo'],
  しゃ: ['sha', 'sya'], しゅ: ['shu', 'syu'], しょ: ['sho', 'syo'],
  ちゃ: ['cha', 'tya'], ちゅ: ['chu', 'tyu'], ちょ: ['cho', 'tyo'],
  にゃ: ['nya'], にゅ: ['nyu'], にょ: ['nyo'],
  ひゃ: ['hya'], ひゅ: ['hyu'], ひょ: ['hyo'],
  みゃ: ['mya'], みゅ: ['myu'], みょ: ['myo'],
  りゃ: ['rya'], りゅ: ['ryu'], りょ: ['ryo'],
  ぎゃ: ['gya'], ぎゅ: ['gyu'], ぎょ: ['gyo'],
  じゃ: ['ja', 'zya'], じゅ: ['ju', 'zyu'], じょ: ['jo', 'zyo'],
  びゃ: ['bya'], びゅ: ['byu'], びょ: ['byo'],
  ぴゃ: ['pya'], ぴゅ: ['pyu'], ぴょ: ['pyo'],
};

function shiftKana(value: string, offset: number): string {
  return [...value]
    .map((char) => {
      const code = char.charCodeAt(0);
      const inRange =
        offset > 0
          ? code >= 0x3041 && code <= 0x3096
          : code >= 0x30a1 && code <= 0x30f6;

      return inRange ? String.fromCharCode(code + offset) : char;
    })
    .join('');
}

export function toKatakana(value: string): string {
  return shiftKana(value, 0x60);
}

export function toHiragana(value: string): string {
  return shiftKana(value, -0x60);
}

function hiraganaVariants(unit: string): string[] {
  return ROMAJI[unit] ?? [unit];
}

export function romanizeKana(value: string): string {
  const chars = [...toHiragana(value)];
  let result = '';
  let index = 0;

  while (index < chars.length) {
    const pair = chars[index] + (chars[index + 1] ?? '');

    if (ROMAJI[pair]) {
      result += ROMAJI[pair][0];
      index += 2;
      continue;
    }

    result += ROMAJI[chars[index]]?.[0] ?? chars[index];
    index += 1;
  }

  return result;
}

export const hiraganaPack: ScriptPack = {
  id: 'hiragana',
  label: 'Hiragana',
  nativeLabel: 'ひらがな',
  description: 'Read Japanese hiragana. Type the Hepburn romanization.',
  sample: 'あいう',
  accent: '#f28fbd',
  tiers: [BASIC, DAKUTEN, YOON],
  variants: hiraganaVariants,
};

export const katakanaPack: ScriptPack = {
  id: 'katakana',
  label: 'Katakana',
  nativeLabel: 'カタカナ',
  description: 'Read Japanese katakana. Type the Hepburn romanization.',
  sample: 'アイウ',
  accent: '#f2c14e',
  tiers: [
    BASIC.map(toKatakana),
    DAKUTEN.map(toKatakana),
    YOON.map(toKatakana),
  ],
  variants: (unit) => hiraganaVariants(toHiragana(unit)),
};
