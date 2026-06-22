export interface ThemeWeight { theme: string; weight: number }
export interface Entities { people: string[]; countries: string[]; projects: string[] }
export interface KeyQuote { text: string; label: string }

export interface Letter {
  date: string;
  nr: number;
  title: string;
  series: boolean;
  act: number;
  word_count: number;
  avg_sentence_length: number;
  lix: number;
  loanword_rate: number;
  tone_index: number;
  assertive_count: number;
  hedge_count: number;
  themes: ThemeWeight[];
  entities: Entities;
  signature_phrases: string[];
  asks: string[];
  thesis: string;
  key_quote: KeyQuote;
  source_url: string;
  raw_text: string;
}

export interface ActDef { id: number; name: string; period: string; start: string; end: string; note: string; summary?: string; commentary?: string }
export interface ActStats { count: number; avgWords: number; avgTone: number; avgLix: number }
export interface CoinedTerm { term: string; firstDate: string; count: number }
export interface ArcPoint { date: string; tone: number; x: number; y: number; isPeak: boolean }
export interface ArcGeometry { points: ArcPoint[]; path: string; area: string; baseY: number; dividers: number[]; peak: Letter | null }
