export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
}

export interface AyahData {
  number: number;
  numberInSurah: number;
  arabic: string;
  english: string;
  urdu: string;
  juz: number;
  page: number;
  sajda: boolean;
}

export interface WordAnalysis {
  id: number;
  position: number;
  char_type_name: string;
  text_uthmani: string;
  transliteration?: { text: string };
  translation?: { text: string };
}

export interface Bookmark {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  arabic: string;
  english: string;
  createdAt: number;
}

export interface Note {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  arabic: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface SearchResult {
  surah: { number: number; name: string; englishName: string };
  numberInSurah: number;
  text: string;
  number: number;
}

export type Language = "en" | "ur";

export type FontSize = "small" | "medium" | "large";

export interface AppSettings {
  language: Language;
  fontSize: FontSize;
  showTransliteration: boolean;
  reciter: string;
}

export const THEMES = {
  "Madinah & Prayer": ["prayer", "mosque", "worship", "salah", "prostration"],
  "Patience & Gratitude": ["patient", "gratitude", "thankful", "sabr"],
  "Heaven & Hell": ["paradise", "garden", "fire", "hell", "jannah"],
  "Prophets & Messengers": ["prophet", "messenger", "noah", "abraham", "moses", "jesus"],
  "Faith & Belief": ["believe", "faith", "disbelieve", "hypocrite"],
  "Justice & Oppression": ["justice", "oppressor", "wrongdoer", "equitable"],
  "Knowledge & Wisdom": ["knowledge", "wisdom", "learn", "understand"],
  "Charity & Giving": ["charity", "spend", "give", "poor", "needy"],
  "Creation & Universe": ["heaven", "earth", "created", "universe", "signs"],
  "Forgiveness & Mercy": ["forgive", "mercy", "repent", "compassionate"],
};
