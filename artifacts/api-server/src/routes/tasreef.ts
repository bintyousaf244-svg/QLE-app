import { Router } from 'express';
import { lookupVerb, listVerbs } from '../lib/tasreef';

const router = Router();

// ── GET /api/tasreef/list — list all offline-available verbs ──
router.get('/tasreef/list', (_req, res) => {
  res.json({ verbs: listVerbs() });
});

// ── POST /api/tasreef — conjugate a verb (offline-first, GROQ fallback) ──
router.post('/tasreef', async (req, res) => {
  const { verb } = req.body as { verb?: string };

  if (!verb?.trim()) {
    res.status(400).json({ error: 'verb is required' });
    return;
  }

  const v = verb.trim();

  // ── 1. Try offline static dataset first ──────────────────
  const staticResult = lookupVerb(v);
  if (staticResult) {
    res.json(staticResult);
    return;
  }

  // ── 2. Fall back to GROQ if configured ──────────────────
  const groqKeys = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
  ].filter(Boolean) as string[];

  if (groqKeys.length === 0) {
    // Return helpful response listing available verbs
    const available = listVerbs().map(e => e.root).join(' · ');
    res.status(404).json({
      error: `AI Conjugation is not configured. Available offline verbs: ${available}`,
      offlineOnly: true,
    });
    return;
  }

  // Lazy-import Groq only when needed
  const { default: Groq } = await import('groq-sdk');
  const groq = new Groq({ apiKey: groqKeys[0] });

  const PRONOUNS_MADI = [
    ['هُوَ','he'],['هُمَا مذ','they two (m.)'],['هُمْ','they (m.)'],
    ['هِيَ','she'],['هُمَا مؤ','they two (f.)'],['هُنَّ','they (f.)'],
    ['أَنْتَ','you (m.s.)'],['أَنْتِ','you (f.s.)'],['أَنْتُمَا','you two'],
    ['أَنْتُمْ','you (m.pl.)'],['أَنْتُنَّ','you (f.pl.)'],
    ['أَنَا','I'],['نَحْنُ','we'],
  ];
  const PRONOUNS_AMR = [
    ['أَنْتَ','you (m.s.)'],['أَنْتِ','you (f.s.)'],['أَنْتُمَا','you two'],
    ['أَنْتُمْ','you (m.pl.)'],['أَنْتُنَّ','you (f.pl.)'],
  ];

  const madiTpl = PRONOUNS_MADI.map(([p,e]) =>
    `{"pronoun":"${p}","pronounEn":"${e}","maloom":"?","majhool":"?"}`).join(',\n');
  const mudariTpl = PRONOUNS_MADI.map(([p,e]) =>
    `{"pronoun":"${p}","pronounEn":"${e}","marfu":"?","mansub":"?","majzum":"?"}`).join(',\n');
  const amrTpl = PRONOUNS_AMR.map(([p,e]) =>
    `{"pronoun":"${p}","pronounEn":"${e}","form":"?"}`).join(',\n');

  const userPrompt = `Conjugate the Arabic verb: "${v}"
Return ONLY valid JSON with full tashkeel on every Arabic string:
{
  "root":"Arabic root e.g. ك ت ب",
  "verbForm":"wazn e.g. فَعَلَ – يَفْعُلُ",
  "chapter":"سarf chapter e.g. بَابُ نَصَرَ",
  "type":"لازم or متعدٍّ",
  "masdar":"?",
  "ismFail":"?",
  "ismMaful":"? or null",
  "ismMakan":"?",
  "meaning":"English meaning",
  "madi":[${madiTpl}],
  "mudari":[${mudariTpl}],
  "amr":[${amrTpl}]
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'You are an Arabic morphology expert. Return ONLY valid JSON. All Arabic must have complete tashkeel.' },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.05,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    try {
      res.json(JSON.parse(raw));
    } catch {
      res.status(500).json({ error: 'Failed to parse AI conjugation data' });
    }
  } catch (err: any) {
    req.log.error({ err }, 'Groq tasreef error');
    res.status(err?.status === 429 ? 429 : 500).json({
      error: err?.status === 429
        ? 'Rate limit reached. Please try again later.'
        : 'AI conjugation failed. Try one of the offline verbs.',
    });
  }
});

export default router;
