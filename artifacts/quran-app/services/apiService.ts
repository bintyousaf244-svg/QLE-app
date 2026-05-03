import { getCache, setCache, TTL } from "./offlineCache";
import { markNetworkError, markNetworkSuccess } from "@/hooks/useNetworkStatus";

const getApiBase = (): string => {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  return domain ? `https://${domain}/api` : "http://localhost:80/api";
};

export interface GrammarResult {
  data: string | null;
  sourceLabel?: string;
  ayahsStart?: number;
  count?: number;
}

export interface DictionaryResult {
  root?: string;
  wazn?: string;
  type?: string;
  meaning?: string;
  ar_meaning?: string;
  transliteration?: string;
  source?: "classical" | "corpus+quran.com" | "ai";
}

export interface TafseerAyah {
  numberInSurah: number;
  text: string;
}

export interface TasreefForm {
  pronoun: string;
  pronounEn: string;
  maloom?: string;
  maloomTranslit?: string;
  majhool?: string;
  majhoolTranslit?: string;
  marfu?: string;
  marfuTranslit?: string;
  mansub?: string;
  mansubTranslit?: string;
  majzum?: string;
  majzumTranslit?: string;
  muakkad?: string;
  muakkadTranslit?: string;
  maloomMajhool?: string;
  maloomMajhoolTranslit?: string;
  form?: string;
  translit?: string;
}

export interface TasreefResult {
  root?: string;
  verbForm?: string;
  chapter?: string;
  type?: string;
  masdar?: string;
  ismFail?: string;
  ismMaful?: string;
  ismMakan?: string;
  meaning?: string;
  madi?: TasreefForm[];
  mudari?: TasreefForm[];
  amr?: TasreefForm[];
  ism?: {
    fail?: string; failTranslit?: string;
    maful?: string; mafulTranslit?: string;
    makan?: string; makanTranslit?: string;
    masdar?: string; masdarTranslit?: string;
  };
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function fetchGrammar(surah: number, ayah: number): Promise<GrammarResult> {
  const cacheKey = `grammar/${surah}/${ayah}`;
  try {
    const res = await fetch(`${getApiBase()}/grammar?surah=${surah}&ayah=${ayah}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`Grammar fetch failed: ${res.status}`);
    const data: GrammarResult = await res.json();
    if (data.data) data.data = stripHtml(data.data);
    markNetworkSuccess();
    if (data.data) void setCache(cacheKey, data, TTL.grammar);
    return data;
  } catch (err) {
    markNetworkError();
    const cached = await getCache<GrammarResult>(cacheKey);
    if (cached) return cached;
    throw err;
  }
}

export async function fetchWordLookup(
  word: string, surah: number, ayah: number, wordIndex: number
): Promise<DictionaryResult> {
  const cacheKey = `word/${surah}/${ayah}/${wordIndex}`;
  try {
    const res = await fetch(`${getApiBase()}/word-lookup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, surah, ayah, wordIndex }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`Dictionary lookup failed: ${res.status}`);
    const data: DictionaryResult = await res.json();
    markNetworkSuccess();
    if (data.root || data.meaning) void setCache(cacheKey, data, TTL.wordLookup);
    return data;
  } catch (err) {
    markNetworkError();
    const cached = await getCache<DictionaryResult>(cacheKey);
    if (cached) return cached;
    throw err;
  }
}

async function parseSSEResponse(res: Response): Promise<string> {
  const text = await res.text();
  let fullText = "";
  for (const line of text.split("\n")) {
    if (line.startsWith("data: ") && !line.includes("[DONE]")) {
      try {
        const data = JSON.parse(line.slice(6));
        if (data.text) fullText += data.text;
        if (data.error) throw new Error(data.error);
      } catch (e: any) {
        if (e.message && !e.message.startsWith("JSON")) throw e;
      }
    }
  }
  return fullText || text;
}

export interface MorphWord {
  arabic: string;
  transliteration: string;
  definition: string;
  root: string;
  wazn: string;
  type: string;
}

export async function fetchMorphology(
  surah: number, ayah: number
): Promise<MorphWord[]> {
  const cacheKey = `morphology/${surah}/${ayah}`;
  try {
    const res = await fetch(`${getApiBase()}/morphology?surah=${surah}&ayah=${ayah}`, {
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error(`Morphology fetch failed: ${res.status}`);
    const data = await res.json();
    const words: MorphWord[] = data.words ?? [];
    markNetworkSuccess();
    if (words.length > 0) void setCache(cacheKey, words, TTL.wordAnalysis);
    return words;
  } catch (err) {
    markNetworkError();
    const cached = await getCache<MorphWord[]>(cacheKey);
    if (cached) return cached;
    throw err;
  }
}

export async function fetchTafseerFromApi(
  surah: number, edition: string
): Promise<TafseerAyah[]> {
  const cacheKey = `tafseer/${surah}/${edition}`;
  try {
    const res = await fetch(`${getApiBase()}/tafseer/${surah}/${edition}`, {
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error(`Tafseer fetch failed: ${res.status}`);
    const data = await res.json();
    const ayahs: TafseerAyah[] = data.ayahs ?? [];
    markNetworkSuccess();
    if (ayahs.length > 0) void setCache(cacheKey, ayahs, TTL.tafseer);
    return ayahs;
  } catch (err) {
    markNetworkError();
    const cached = await getCache<TafseerAyah[]>(cacheKey);
    if (cached) return cached;
    throw err;
  }
}

export async function fetchTasreef(verb: string): Promise<TasreefResult> {
  const cacheKey = `tasreef/${verb.trim().replace(/[\u064B-\u065F\u0670\u0640]/g, '')}`;
  try {
    const res = await fetch(`${getApiBase()}/tasreef`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verb: verb.trim() }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(err.error ?? `Tasreef failed: ${res.status}`);
    }
    const data: TasreefResult = await res.json();
    if ((data as any).error) throw new Error((data as any).error);
    markNetworkSuccess();
    void setCache(cacheKey, data, TTL.wordLookup);
    return data;
  } catch (err) {
    markNetworkError();
    const cached = await getCache<TasreefResult>(cacheKey);
    if (cached) return cached;
    throw err;
  }
}
