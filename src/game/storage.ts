import type { RunRecord } from './types';

const STORAGE_KEY = 'sinosawa-hiro:records:v1';
const LEGACY_STORAGE_KEY = 'glyph-trainer:records:v1';

function isRunRecord(value: unknown): value is RunRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === 'string' &&
    (record.mode === 'hangul' ||
      record.mode === 'hiragana' ||
      record.mode === 'katakana') &&
    typeof record.score === 'number' &&
    typeof record.correct === 'number' &&
    typeof record.answered === 'number' &&
    typeof record.cleanCount === 'number' &&
    typeof record.elapsedMs === 'number' &&
    typeof record.endedAt === 'string' &&
    typeof record.levelReached === 'number'
  );
}

export function loadRecords(): RunRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const current = window.localStorage.getItem(STORAGE_KEY);
    const raw = current ?? window.localStorage.getItem(LEGACY_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    const records = parsed.filter(isRunRecord);

    if (!current) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }

    return records;
  } catch {
    return [];
  }
}

export function sortRecords(records: RunRecord[]): RunRecord[] {
  return [...records].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    if (a.elapsedMs !== b.elapsedMs) {
      return a.elapsedMs - b.elapsedMs;
    }

    return a.endedAt.localeCompare(b.endedAt);
  });
}

export function addRecord(record: RunRecord, limit: number): RunRecord[] {
  const allRecords = [
    ...loadRecords().filter((existing) => existing.id !== record.id),
    record,
  ];
  const modes = new Set(allRecords.map((entry) => entry.mode));
  const trimmed = [...modes].flatMap((mode) =>
    sortRecords(allRecords.filter((entry) => entry.mode === mode)).slice(
      0,
      limit,
    ),
  ).sort((a, b) => a.endedAt.localeCompare(b.endedAt));

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

export function recordsForMode(
  records: RunRecord[],
  mode: RunRecord['mode'],
): RunRecord[] {
  return sortRecords(records.filter((record) => record.mode === mode));
}
