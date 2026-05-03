import { Router } from 'express';
import { normalize, lookupWord } from '../lib/classicalDict';

const router = Router();

interface QWord {
  position: number;
  text_uthmani?: string;
  text?: string;
  transliteration?: { text: string };
  translation?: { text: string };
  char_type_name?: string;
}

export interface MorphWord {
  arabic: string;
  transliteration: string;
  definition: string;
  root: string;
  wazn: string;
  type: string;
}

const cache = new Map<string, MorphWord[]>();

router.get('/morphology', async (req, res) => {
  const surah = Number(req.query.surah);
  const ayah = Number(req.query.ayah);

  if (!surah || !ayah || surah < 1 || surah > 114 || ayah < 1) {
    res.status(400).json({ error: 'Invalid surah or ayah' });
    return;
  }

  const key = `${surah}:${ayah}`;
  if (cache.has(key)) {
    res.json({ words: cache.get(key) });
    return;
  }

  try {
    const url = `https://api.quran.com/api/v4/verses/by_key/${surah}:${ayah}?words=true&word_fields=text_uthmani,transliteration,translation,char_type_name,location`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`quran.com returned ${response.status}`);

    const json = await response.json() as { verse: { words: QWord[] } };
    const rawWords: QWord[] = (json.verse?.words ?? []).filter((w) => w.char_type_name === 'word');

    const words: MorphWord[] = rawWords.map((w) => {
      const arabic = w.text_uthmani ?? w.text ?? '';
      const dictKey = normalize(arabic);
      const entry = lookupWord(dictKey);
      return {
        arabic,
        transliteration: w.transliteration?.text ?? '',
        definition: entry?.meaning ?? w.translation?.text ?? '',
        root: entry?.root ?? '',
        wazn: entry?.wazn ?? '',
        type: entry?.type ?? (w.char_type_name === 'word' ? 'Word' : ''),
      };
    }).filter((w) => w.arabic);

    cache.set(key, words);
    res.json({ words });
  } catch (err) {
    req.log.error({ err }, 'Morphology fetch error');
    res.status(502).json({ error: 'Failed to fetch morphological data' });
  }
});

export default router;
