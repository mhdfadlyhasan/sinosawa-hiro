import type { Question, ScriptPack } from './types';
import { normalizeAnswer } from './types';

const MAX_ACCEPTED_VARIANTS = 256;

function pick<T>(items: T[], random: () => number): T {
  return items[Math.floor(random() * items.length)] ?? items[0];
}

export function buildQuestion(
  pack: ScriptPack,
  level: number,
  previousPrompt = '',
  random: () => number = Math.random,
): Question {
  const tokenCount = Math.max(1, Math.floor(level));
  const tierCount = Math.min(tokenCount, pack.tiers.length);
  const pool = pack.tiers.slice(0, tierCount).flat();

  let units: string[] = [];

  for (let attempt = 0; attempt < 30; attempt += 1) {
    const available = [...pool];
    units = Array.from({ length: tokenCount }, () => {
      const index = Math.floor(random() * available.length);
      const [unit] = available.splice(index, 1);
      return unit ?? pick(pool, random);
    });

    if (units.join('') !== previousPrompt) {
      break;
    }
  }

  const variantLists = units.map((unit) => {
    const variants = pack.variants(unit);
    return variants.length > 0 ? variants : [unit];
  });

  let combinations = [''];

  for (const variants of variantLists) {
    const next: string[] = [];

    for (const prefix of combinations) {
      for (const variant of variants) {
        next.push(prefix + variant);

        if (next.length >= MAX_ACCEPTED_VARIANTS) {
          break;
        }
      }

      if (next.length >= MAX_ACCEPTED_VARIANTS) {
        break;
      }
    }

    combinations = next;
  }

  const answer = variantLists.map((variants) => variants[0]).join('');
  const accepted = new Set<string>(combinations.map(normalizeAnswer));
  accepted.add(normalizeAnswer(answer));

  return {
    prompt: units.join(''),
    answer,
    accepted: [...accepted],
    units,
    mode: pack.id,
  };
}
