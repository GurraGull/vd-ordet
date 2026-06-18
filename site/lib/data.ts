import { readFileSync } from 'fs';
import { join } from 'path';
import type { Letter, ActDef } from './types';

const DATA_DIR = join(process.cwd(), '..', 'data');

function readJson<T>(rel: string): T {
  return JSON.parse(readFileSync(join(DATA_DIR, rel), 'utf-8')) as T;
}

export function loadLetters(): Letter[] { return readJson<Letter[]>('letters.json'); }
export function loadActs(): ActDef[] { return readJson<ActDef[]>('vocab/acts.json'); }
export function loadThemeLabels(): Record<string, string> {
  const themes = readJson<{ id: string; label: string }[]>('vocab/themes.json');
  return Object.fromEntries(themes.map((t) => [t.id, t.label]));
}
export function loadAsks(): { id: string; label: string }[] { return readJson<{ id: string; label: string }[]>('vocab/asks.json'); }
export function loadDefinitions(): Record<string, string> { return readJson<Record<string, string>>('vocab/definitions.json'); }
