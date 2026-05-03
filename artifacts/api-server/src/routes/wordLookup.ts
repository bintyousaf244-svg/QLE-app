import { Router } from 'express';
import type { Request, Response } from 'express';
import { normalize, lookupWord, type WordInfo } from '../lib/classicalDict';

const router = Router();

const runtimeCache = new Map<string, WordInfo>();

interface QWord {
  position: number;
  text_uthmani?: string;
  text?: string;
  transliteration?: { text: string };
  translation?: { text: string };
  char_type_name?: string;
}

const ayahWordCache = new Map<string, QWord[]>();

async function fetchQuranComWords(surah: number, ayah: number): Promise<QWord[]> {
  const key = `${surah}:${ayah}`;
  if (ayahWordCache.has(key)) return ayahWordCache.get(key)!;
  const url = `https://api.quran.com/api/v4/verses/by_key/${surah}:${ayah}?words=true&word_fields=text_uthmani,location,char_type_name`;
  const resp = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) });
  if (!resp.ok) throw new Error(`quran.com ${resp.status}`);
  const data = await resp.json() as { verse: { words: QWord[] } };
  const words = (data.verse?.words ?? []).filter((w: QWord) => w.char_type_name === 'word');
  ayahWordCache.set(key, words);
  return words;
}

async function handleWordLookup(req: Request, res: Response): Promise<void> {
  const { word, surah, ayah, wordIndex } = req.body as {
    word?: string; surah?: number; ayah?: number; wordIndex?: number;
  };

  if (!word?.trim()) { res.status(400).json({ error: 'word is required' }); return; }

  const rawWord = word.trim();
  const dictKey = normalize(rawWord);
  const wordPos = wordIndex != null ? wordIndex + 1 : null;
  const posKey = (surah != null && ayah != null && wordPos != null) ? `${surah}:${ayah}:${wordPos}` : null;

  if (posKey && runtimeCache.has(posKey)) { res.json(runtimeCache.get(posKey)); return; }

  const classical = lookupWord(dictKey);
  if (classical) {
    let transliteration: string | undefined;
    if (surah != null && ayah != null) {
      try {
        const words = await fetchQuranComWords(surah, ayah);
        const wEntry = words.find(w => normalize(w.text_uthmani ?? w.text ?? '') === dictKey);
        transliteration = wEntry?.transliteration?.text;
      } catch { /* optional */ }
    }
    const result: WordInfo = { ...classical, source: 'classical', ...(transliteration ? { transliteration } : {}) };
    if (posKey) runtimeCache.set(posKey, result);
    res.json(result);
    return;
  }

  if (surah != null && ayah != null && wordPos != null) {
    try {
      const words = await fetchQuranComWords(surah, ayah);
      const result: WordInfo = { source: 'corpus+quran.com' };
      const wEntry = words.find(w => normalize(w.text_uthmani ?? w.text ?? '') === dictKey)
        ?? words.find(w => w.position === wordPos);
      if (wEntry) {
        result.meaning = wEntry.translation?.text;
        result.transliteration = wEntry.transliteration?.text;
      }
      if (posKey) runtimeCache.set(posKey, result);
      res.json(result);
    } catch {
      res.json({});
    }
    return;
  }

  res.json({});
}

router.post('/word-lookup', (req, res) => { void handleWordLookup(req, res); });

export default router;
