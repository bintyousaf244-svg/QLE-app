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
  const res = await fetch(`${getApiBase()}/grammar?surah=${surah}&ayah=${ayah}`);
  if (!res.ok) throw new Error(`Grammar fetch failed: ${res.status}`);
  const data = await res.json();
  if (data.data) data.data = stripHtml(data.data);
  return data;
}

export async function fetchWordLookup(
  word: string, surah: number, ayah: number, wordIndex: number
): Promise<DictionaryResult> {
  const res = await fetch(`${getApiBase()}/word-lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word, surah, ayah, wordIndex }),
  });
  if (!res.ok) throw new Error(`Dictionary lookup failed: ${res.status}`);
  return res.json();
}

async function parseSSEResponse(res: Response): Promise<string> {
  const text = await res.text();
  let fullText = "";
  for (const line of text.split("\n")) {
    if (line.startsWith("data: ") && !line.includes("[DONE]")) {
      try {
        const data = JSON.parse(line.slice(6));
        if (data.text) fullText += data.text;
      } catch {}
    }
  }
  return fullText || text;
}

export async function fetchMorphology(
  ayahText: string, surahName: string, ayahNumber: number
): Promise<string> {
  const res = await fetch(`${getApiBase()}/analysis/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "morphology", ayahText, surahName, ayahNumber }),
  });
  if (!res.ok) throw new Error(`Morphology failed: ${res.status}`);
  return parseSSEResponse(res);
}

export async function fetchTafseerFromApi(
  surah: number, edition: string
): Promise<TafseerAyah[]> {
  const res = await fetch(`${getApiBase()}/tafseer/${surah}/${edition}`);
  if (!res.ok) throw new Error(`Tafseer fetch failed: ${res.status}`);
  const data = await res.json();
  return data.ayahs ?? [];
}

export async function fetchTasreef(verb: string): Promise<TasreefResult> {
  const res = await fetch(`${getApiBase()}/tasreef`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ verb: verb.trim() }),
  });
  if (!res.ok) throw new Error(`Tasreef failed: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}
