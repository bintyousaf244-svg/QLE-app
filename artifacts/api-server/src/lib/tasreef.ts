// ═══════════════════════════════════════════════════════════
// Offline Tasreef (تصريف الأفعال) — Verb Conjugation Engine
// Covers Form I sound verbs algorithmically + key Quranic
// hollow / defective / Form IV verbs hard-coded.
// ═══════════════════════════════════════════════════════════

// ─── Arabic diacritics ────────────────────────────────────
const FA = '\u064E'; // fatḥa   (a)
const KA = '\u0650'; // kasra   (i)
const DA = '\u064F'; // ḍamma   (u)
const SK = '\u0652'; // sukūn

type Vowel = 'a' | 'i' | 'u';
const vc = (v: Vowel) => v === 'a' ? FA : v === 'i' ? KA : DA;

// ─── Public types (mirror apiService / search.tsx) ────────
export interface TasreefForm {
  pronoun: string;
  pronounEn: string;
  maloom?: string;
  majhool?: string;
  marfu?: string;
  mansub?: string;
  majzum?: string;
  form?: string;
}

export interface TasreefEntry {
  root: string;
  verbForm: string;
  chapter: string;
  type: string;
  masdar?: string;
  ismFail?: string;
  ismMaful?: string;
  ismMakan?: string;
  meaning: string;
  madi: TasreefForm[];
  mudari: TasreefForm[];
  amr: TasreefForm[];
}

// ─── Verb form display strings ─────────────────────────────
const VERB_FORMS: Record<string, string> = {
  au: 'فَعَلَ – يَفْعُلُ',
  ai: 'فَعَلَ – يَفْعِلُ',
  aa: 'فَعَلَ – يَفْعَلُ',
  ia: 'فَعِلَ – يَفْعَلُ',
  uu: 'فَعُلَ – يَفْعُلُ',
};

const CHAPTERS: Record<string, string> = {
  au: 'بَابُ نَصَرَ',
  ai: 'بَابُ ضَرَبَ',
  aa: 'بَابُ فَتَحَ',
  ia: 'بَابُ سَمِعَ',
  uu: 'بَابُ كَرُمَ',
};

// ─── Generator: Form I sound (سالم) ───────────────────────
//   pv  = past vowel on r2 (فَعَلَ → a, فَعِلَ → i, فَعُلَ → u)
//   prv = present vowel on r2 (يَفْعُلُ → u, يَفْعِلُ → i, يَفْعَلُ → a)
function genFormISalim(
  r1: string, r2: string, r3: string,
  pv: Vowel, prv: Vowel,
  root: string, meaning: string,
  masdar: string, ismFail: string, ismMaful: string | null, ismMakan: string,
  verbType = 'متعدٍّ',
): TasreefEntry {
  const PV = vc(pv);
  const PR = vc(prv);
  const impPfx = prv === 'u' ? 'اُ' : 'اِ';

  // ── Past tense helpers ──────────────────────────────────
  // active:  r1+FA + r2+PV + r3 + <r3vow> + <suffix>
  // passive: r1+DA + r2+KA + r3 + <r3vow> + <suffix>
  const ma = (r3vow: string, suf: string) => r1 + FA + r2 + PV + r3 + r3vow + suf;
  const mp = (r3vow: string, suf: string) => r1 + DA + r2 + KA + r3 + r3vow + suf;

  const madi: TasreefForm[] = [
    { pronoun: 'هُوَ',      pronounEn: 'he',           maloom: ma(FA, ''),      majhool: mp(FA, '') },
    { pronoun: 'هُمَا مذ',  pronounEn: 'they two (m.)', maloom: ma(FA, 'ا'),     majhool: mp(FA, 'ا') },
    { pronoun: 'هُمْ',      pronounEn: 'they (m.)',     maloom: ma(DA, 'وا'),    majhool: mp(DA, 'وا') },
    { pronoun: 'هِيَ',      pronounEn: 'she',           maloom: ma(FA, 'تْ'),    majhool: mp(FA, 'تْ') },
    { pronoun: 'هُمَا مؤ',  pronounEn: 'they two (f.)', maloom: ma(FA, 'تَا'),   majhool: mp(FA, 'تَا') },
    { pronoun: 'هُنَّ',     pronounEn: 'they (f.)',     maloom: ma(SK, 'نَ'),    majhool: mp(SK, 'نَ') },
    { pronoun: 'أَنْتَ',    pronounEn: 'you (m.s.)',    maloom: ma(SK, 'تَ'),    majhool: mp(SK, 'تَ') },
    { pronoun: 'أَنْتِ',    pronounEn: 'you (f.s.)',    maloom: ma(SK, 'تِ'),    majhool: mp(SK, 'تِ') },
    { pronoun: 'أَنْتُمَا', pronounEn: 'you two',       maloom: ma(SK, 'تُمَا'), majhool: mp(SK, 'تُمَا') },
    { pronoun: 'أَنْتُمْ',  pronounEn: 'you (m.pl.)',   maloom: ma(SK, 'تُمْ'),  majhool: mp(SK, 'تُمْ') },
    { pronoun: 'أَنْتُنَّ', pronounEn: 'you (f.pl.)',   maloom: ma(SK, 'تُنَّ'), majhool: mp(SK, 'تُنَّ') },
    { pronoun: 'أَنَا',     pronounEn: 'I',             maloom: ma(SK, 'تُ'),    majhool: mp(SK, 'تُ') },
    { pronoun: 'نَحْنُ',    pronounEn: 'we',            maloom: ma(SK, 'نَا'),   majhool: mp(SK, 'نَا') },
  ];

  // ── Present tense helpers ───────────────────────────────
  // active:  pfx+FA + r1+SK + r2+PR + r3 + <ending>
  // passive: pfx+DA + r1+SK + r2+FA + r3 + <ending>  (passive pres always FA on r2)
  const pasP: Record<string, string> = { 'يَ': 'يُ', 'تَ': 'تُ', 'أَ': 'أُ', 'نَ': 'نُ' };
  const as = (pfx: string, r3vow: string, suf: string) => pfx + r1 + SK + r2 + PR + r3 + r3vow + suf;
  const ps = (pfx: string, r3vow: string, suf: string) => (pasP[pfx] ?? pfx) + r1 + SK + r2 + FA + r3 + r3vow + suf;

  const mudari: TasreefForm[] = [
    { pronoun: 'هُوَ',      pronounEn: 'he',
      marfu: as('يَ', DA, ''),      mansub: as('يَ', FA, ''),     majzum: as('يَ', SK, '') },
    { pronoun: 'هُمَا مذ',  pronounEn: 'they two (m.)',
      marfu: as('يَ', FA, 'انِ'),   mansub: as('يَ', FA, 'ا'),    majzum: as('يَ', FA, 'ا') },
    { pronoun: 'هُمْ',      pronounEn: 'they (m.)',
      marfu: as('يَ', DA, 'ونَ'),   mansub: as('يَ', DA, 'وا'),   majzum: as('يَ', DA, 'وا') },
    { pronoun: 'هِيَ',      pronounEn: 'she',
      marfu: as('تَ', DA, ''),      mansub: as('تَ', FA, ''),     majzum: as('تَ', SK, '') },
    { pronoun: 'هُمَا مؤ',  pronounEn: 'they two (f.)',
      marfu: as('تَ', FA, 'انِ'),   mansub: as('تَ', FA, 'ا'),    majzum: as('تَ', FA, 'ا') },
    { pronoun: 'هُنَّ',     pronounEn: 'they (f.)',
      marfu: as('يَ', SK, 'نَ'),    mansub: as('يَ', SK, 'نَ'),   majzum: as('يَ', SK, 'نَ') },
    { pronoun: 'أَنْتَ',    pronounEn: 'you (m.s.)',
      marfu: as('تَ', DA, ''),      mansub: as('تَ', FA, ''),     majzum: as('تَ', SK, '') },
    { pronoun: 'أَنْتِ',    pronounEn: 'you (f.s.)',
      marfu: as('تَ', KA, 'ينَ'),   mansub: as('تَ', KA, 'ي'),    majzum: as('تَ', KA, 'ي') },
    { pronoun: 'أَنْتُمَا', pronounEn: 'you two',
      marfu: as('تَ', FA, 'انِ'),   mansub: as('تَ', FA, 'ا'),    majzum: as('تَ', FA, 'ا') },
    { pronoun: 'أَنْتُمْ',  pronounEn: 'you (m.pl.)',
      marfu: as('تَ', DA, 'ونَ'),   mansub: as('تَ', DA, 'وا'),   majzum: as('تَ', DA, 'وا') },
    { pronoun: 'أَنْتُنَّ', pronounEn: 'you (f.pl.)',
      marfu: as('تَ', SK, 'نَ'),    mansub: as('تَ', SK, 'نَ'),   majzum: as('تَ', SK, 'نَ') },
    { pronoun: 'أَنَا',     pronounEn: 'I',
      marfu: as('أَ', DA, ''),      mansub: as('أَ', FA, ''),     majzum: as('أَ', SK, '') },
    { pronoun: 'نَحْنُ',    pronounEn: 'we',
      marfu: as('نَ', DA, ''),      mansub: as('نَ', FA, ''),     majzum: as('نَ', SK, '') },
  ];

  const amr: TasreefForm[] = [
    { pronoun: 'أَنْتَ',    pronounEn: 'you (m.s.)', form: impPfx + r1 + SK + r2 + PR + r3 + SK },
    { pronoun: 'أَنْتِ',    pronounEn: 'you (f.s.)', form: impPfx + r1 + SK + r2 + PR + r3 + KA + 'ي' },
    { pronoun: 'أَنْتُمَا', pronounEn: 'you two',    form: impPfx + r1 + SK + r2 + PR + r3 + FA + 'ا' },
    { pronoun: 'أَنْتُمْ',  pronounEn: 'you (m.pl.)',form: impPfx + r1 + SK + r2 + PR + r3 + DA + 'وا' },
    { pronoun: 'أَنْتُنَّ', pronounEn: 'you (f.pl.)',form: impPfx + r1 + SK + r2 + PR + r3 + SK + 'نَ' },
  ];

  return {
    root,
    verbForm: VERB_FORMS[pv + prv] ?? 'فَعَلَ – يَفْعَلُ',
    chapter: CHAPTERS[pv + prv] ?? 'بَابُ فَتَحَ',
    type: verbType,
    masdar,
    ismFail,
    ismMaful: ismMaful ?? undefined,
    ismMakan,
    meaning,
    madi,
    mudari,
    amr,
  };
}

// ─── Hardcoded: قَالَ يَقُولُ ─────────────────────────────
const QALA: TasreefEntry = {
  root: 'ق و ل', verbForm: 'فَعَلَ – يَفْعُلُ (أجوف واوي)',
  chapter: 'بَابُ قَالَ', type: 'متعدٍّ', masdar: 'قَوْلٌ',
  ismFail: 'قَائِلٌ', ismMaful: 'مَقُولٌ', ismMakan: 'مَقَالٌ',
  meaning: 'to say, to speak',
  madi: [
    { pronoun:'هُوَ',      pronounEn:'he',           maloom:'قَالَ',    majhool:'قِيلَ' },
    { pronoun:'هُمَا مذ',  pronounEn:'they two (m.)', maloom:'قَالَا',   majhool:'قِيلَا' },
    { pronoun:'هُمْ',      pronounEn:'they (m.)',     maloom:'قَالُوا',  majhool:'قِيلُوا' },
    { pronoun:'هِيَ',      pronounEn:'she',           maloom:'قَالَتْ',  majhool:'قِيلَتْ' },
    { pronoun:'هُمَا مؤ',  pronounEn:'they two (f.)', maloom:'قَالَتَا', majhool:'قِيلَتَا' },
    { pronoun:'هُنَّ',     pronounEn:'they (f.)',     maloom:'قُلْنَ',   majhool:'قِلْنَ' },
    { pronoun:'أَنْتَ',    pronounEn:'you (m.s.)',    maloom:'قُلْتَ',   majhool:'قِلْتَ' },
    { pronoun:'أَنْتِ',    pronounEn:'you (f.s.)',    maloom:'قُلْتِ',   majhool:'قِلْتِ' },
    { pronoun:'أَنْتُمَا', pronounEn:'you two',       maloom:'قُلْتُمَا',majhool:'قِلْتُمَا' },
    { pronoun:'أَنْتُمْ',  pronounEn:'you (m.pl.)',   maloom:'قُلْتُمْ', majhool:'قِلْتُمْ' },
    { pronoun:'أَنْتُنَّ', pronounEn:'you (f.pl.)',   maloom:'قُلْتُنَّ',majhool:'قِلْتُنَّ' },
    { pronoun:'أَنَا',     pronounEn:'I',             maloom:'قُلْتُ',   majhool:'قِلْتُ' },
    { pronoun:'نَحْنُ',    pronounEn:'we',            maloom:'قُلْنَا',  majhool:'قِلْنَا' },
  ],
  mudari: [
    { pronoun:'هُوَ',      pronounEn:'he',           marfu:'يَقُولُ',    mansub:'يَقُولَ',   majzum:'يَقُلْ' },
    { pronoun:'هُمَا مذ',  pronounEn:'they two (m.)', marfu:'يَقُولَانِ', mansub:'يَقُولَا',  majzum:'يَقُولَا' },
    { pronoun:'هُمْ',      pronounEn:'they (m.)',     marfu:'يَقُولُونَ', mansub:'يَقُولُوا', majzum:'يَقُولُوا' },
    { pronoun:'هِيَ',      pronounEn:'she',           marfu:'تَقُولُ',    mansub:'تَقُولَ',   majzum:'تَقُلْ' },
    { pronoun:'هُمَا مؤ',  pronounEn:'they two (f.)', marfu:'تَقُولَانِ', mansub:'تَقُولَا',  majzum:'تَقُولَا' },
    { pronoun:'هُنَّ',     pronounEn:'they (f.)',     marfu:'يَقُلْنَ',   mansub:'يَقُلْنَ',  majzum:'يَقُلْنَ' },
    { pronoun:'أَنْتَ',    pronounEn:'you (m.s.)',    marfu:'تَقُولُ',    mansub:'تَقُولَ',   majzum:'تَقُلْ' },
    { pronoun:'أَنْتِ',    pronounEn:'you (f.s.)',    marfu:'تَقُولِينَ', mansub:'تَقُولِي',  majzum:'تَقُولِي' },
    { pronoun:'أَنْتُمَا', pronounEn:'you two',       marfu:'تَقُولَانِ', mansub:'تَقُولَا',  majzum:'تَقُولَا' },
    { pronoun:'أَنْتُمْ',  pronounEn:'you (m.pl.)',   marfu:'تَقُولُونَ', mansub:'تَقُولُوا', majzum:'تَقُولُوا' },
    { pronoun:'أَنْتُنَّ', pronounEn:'you (f.pl.)',   marfu:'تَقُلْنَ',   mansub:'تَقُلْنَ',  majzum:'تَقُلْنَ' },
    { pronoun:'أَنَا',     pronounEn:'I',             marfu:'أَقُولُ',    mansub:'أَقُولَ',   majzum:'أَقُلْ' },
    { pronoun:'نَحْنُ',    pronounEn:'we',            marfu:'نَقُولُ',    mansub:'نَقُولَ',   majzum:'نَقُلْ' },
  ],
  amr: [
    { pronoun:'أَنْتَ',    pronounEn:'you (m.s.)', form:'قُلْ' },
    { pronoun:'أَنْتِ',    pronounEn:'you (f.s.)', form:'قُولِي' },
    { pronoun:'أَنْتُمَا', pronounEn:'you two',    form:'قُولَا' },
    { pronoun:'أَنْتُمْ',  pronounEn:'you (m.pl.)',form:'قُولُوا' },
    { pronoun:'أَنْتُنَّ', pronounEn:'you (f.pl.)',form:'قُلْنَ' },
  ],
};

// ─── Hardcoded: كَانَ يَكُونُ ─────────────────────────────
const KANA: TasreefEntry = {
  root: 'ك و ن', verbForm: 'فَعَلَ – يَفْعُلُ (أجوف واوي)',
  chapter: 'بَابُ كَانَ', type: 'لازم / ناقص', masdar: 'كَوْنٌ',
  ismFail: 'كَائِنٌ', ismMaful: 'مَكُونٌ', ismMakan: 'مَكَانٌ',
  meaning: 'to be, to exist',
  madi: [
    { pronoun:'هُوَ',      pronounEn:'he',           maloom:'كَانَ',    majhool:'كِيلَ' },
    { pronoun:'هُمَا مذ',  pronounEn:'they two (m.)', maloom:'كَانَا',   majhool:'كِينَا' },
    { pronoun:'هُمْ',      pronounEn:'they (m.)',     maloom:'كَانُوا',  majhool:'كِينُوا' },
    { pronoun:'هِيَ',      pronounEn:'she',           maloom:'كَانَتْ',  majhool:'كِينَتْ' },
    { pronoun:'هُمَا مؤ',  pronounEn:'they two (f.)', maloom:'كَانَتَا', majhool:'كِينَتَا' },
    { pronoun:'هُنَّ',     pronounEn:'they (f.)',     maloom:'كُنَّ',    majhool:'كِنَّ' },
    { pronoun:'أَنْتَ',    pronounEn:'you (m.s.)',    maloom:'كُنْتَ',   majhool:'كِنْتَ' },
    { pronoun:'أَنْتِ',    pronounEn:'you (f.s.)',    maloom:'كُنْتِ',   majhool:'كِنْتِ' },
    { pronoun:'أَنْتُمَا', pronounEn:'you two',       maloom:'كُنْتُمَا',majhool:'كِنْتُمَا' },
    { pronoun:'أَنْتُمْ',  pronounEn:'you (m.pl.)',   maloom:'كُنْتُمْ', majhool:'كِنْتُمْ' },
    { pronoun:'أَنْتُنَّ', pronounEn:'you (f.pl.)',   maloom:'كُنْتُنَّ',majhool:'كِنْتُنَّ' },
    { pronoun:'أَنَا',     pronounEn:'I',             maloom:'كُنْتُ',   majhool:'كِنْتُ' },
    { pronoun:'نَحْنُ',    pronounEn:'we',            maloom:'كُنَّا',   majhool:'كِنَّا' },
  ],
  mudari: [
    { pronoun:'هُوَ',      pronounEn:'he',           marfu:'يَكُونُ',    mansub:'يَكُونَ',   majzum:'يَكُنْ' },
    { pronoun:'هُمَا مذ',  pronounEn:'they two (m.)', marfu:'يَكُونَانِ', mansub:'يَكُونَا',  majzum:'يَكُونَا' },
    { pronoun:'هُمْ',      pronounEn:'they (m.)',     marfu:'يَكُونُونَ', mansub:'يَكُونُوا', majzum:'يَكُونُوا' },
    { pronoun:'هِيَ',      pronounEn:'she',           marfu:'تَكُونُ',    mansub:'تَكُونَ',   majzum:'تَكُنْ' },
    { pronoun:'هُمَا مؤ',  pronounEn:'they two (f.)', marfu:'تَكُونَانِ', mansub:'تَكُونَا',  majzum:'تَكُونَا' },
    { pronoun:'هُنَّ',     pronounEn:'they (f.)',     marfu:'يَكُنَّ',    mansub:'يَكُنَّ',   majzum:'يَكُنَّ' },
    { pronoun:'أَنْتَ',    pronounEn:'you (m.s.)',    marfu:'تَكُونُ',    mansub:'تَكُونَ',   majzum:'تَكُنْ' },
    { pronoun:'أَنْتِ',    pronounEn:'you (f.s.)',    marfu:'تَكُونِينَ', mansub:'تَكُونِي',  majzum:'تَكُونِي' },
    { pronoun:'أَنْتُمَا', pronounEn:'you two',       marfu:'تَكُونَانِ', mansub:'تَكُونَا',  majzum:'تَكُونَا' },
    { pronoun:'أَنْتُمْ',  pronounEn:'you (m.pl.)',   marfu:'تَكُونُونَ', mansub:'تَكُونُوا', majzum:'تَكُونُوا' },
    { pronoun:'أَنْتُنَّ', pronounEn:'you (f.pl.)',   marfu:'تَكُنَّ',    mansub:'تَكُنَّ',   majzum:'تَكُنَّ' },
    { pronoun:'أَنَا',     pronounEn:'I',             marfu:'أَكُونُ',    mansub:'أَكُونَ',   majzum:'أَكُنْ' },
    { pronoun:'نَحْنُ',    pronounEn:'we',            marfu:'نَكُونُ',    mansub:'نَكُونَ',   majzum:'نَكُنْ' },
  ],
  amr: [
    { pronoun:'أَنْتَ',    pronounEn:'you (m.s.)', form:'كُنْ' },
    { pronoun:'أَنْتِ',    pronounEn:'you (f.s.)', form:'كُونِي' },
    { pronoun:'أَنْتُمَا', pronounEn:'you two',    form:'كُونَا' },
    { pronoun:'أَنْتُمْ',  pronounEn:'you (m.pl.)',form:'كُونُوا' },
    { pronoun:'أَنْتُنَّ', pronounEn:'you (f.pl.)',form:'كُنَّ' },
  ],
};

// ─── Hardcoded: هَدَى يَهْدِي ────────────────────────────
const HADA: TasreefEntry = {
  root: 'ه د ي', verbForm: 'فَعَلَ – يَفْعِلُ (ناقص يائي)',
  chapter: 'بَابُ هَدَى', type: 'متعدٍّ', masdar: 'هِدَايَةٌ',
  ismFail: 'هَادٍ', ismMaful: 'مَهْدِيٌّ', ismMakan: 'مَهْدًى',
  meaning: 'to guide, to lead to the right path',
  madi: [
    { pronoun:'هُوَ',      pronounEn:'he',           maloom:'هَدَى',    majhool:'هُدِيَ' },
    { pronoun:'هُمَا مذ',  pronounEn:'they two (m.)', maloom:'هَدَيَا',  majhool:'هُدِيَا' },
    { pronoun:'هُمْ',      pronounEn:'they (m.)',     maloom:'هَدَوْا',  majhool:'هُدُوا' },
    { pronoun:'هِيَ',      pronounEn:'she',           maloom:'هَدَتْ',   majhool:'هُدِيَتْ' },
    { pronoun:'هُمَا مؤ',  pronounEn:'they two (f.)', maloom:'هَدَتَا',  majhool:'هُدِيَتَا' },
    { pronoun:'هُنَّ',     pronounEn:'they (f.)',     maloom:'هَدَيْنَ', majhool:'هُدِينَ' },
    { pronoun:'أَنْتَ',    pronounEn:'you (m.s.)',    maloom:'هَدَيْتَ', majhool:'هُدِيتَ' },
    { pronoun:'أَنْتِ',    pronounEn:'you (f.s.)',    maloom:'هَدَيْتِ', majhool:'هُدِيتِ' },
    { pronoun:'أَنْتُمَا', pronounEn:'you two',       maloom:'هَدَيْتُمَا',majhool:'هُدِيتُمَا' },
    { pronoun:'أَنْتُمْ',  pronounEn:'you (m.pl.)',   maloom:'هَدَيْتُمْ',majhool:'هُدِيتُمْ' },
    { pronoun:'أَنْتُنَّ', pronounEn:'you (f.pl.)',   maloom:'هَدَيْتُنَّ',majhool:'هُدِيتُنَّ' },
    { pronoun:'أَنَا',     pronounEn:'I',             maloom:'هَدَيْتُ', majhool:'هُدِيتُ' },
    { pronoun:'نَحْنُ',    pronounEn:'we',            maloom:'هَدَيْنَا',majhool:'هُدِينَا' },
  ],
  mudari: [
    { pronoun:'هُوَ',      pronounEn:'he',           marfu:'يَهْدِي',    mansub:'يَهْدِيَ',  majzum:'يَهْدِ' },
    { pronoun:'هُمَا مذ',  pronounEn:'they two (m.)', marfu:'يَهْدِيَانِ',mansub:'يَهْدِيَا', majzum:'يَهْدِيَا' },
    { pronoun:'هُمْ',      pronounEn:'they (m.)',     marfu:'يَهْدُونَ',  mansub:'يَهْدُوا',  majzum:'يَهْدُوا' },
    { pronoun:'هِيَ',      pronounEn:'she',           marfu:'تَهْدِي',    mansub:'تَهْدِيَ',  majzum:'تَهْدِ' },
    { pronoun:'هُمَا مؤ',  pronounEn:'they two (f.)', marfu:'تَهْدِيَانِ',mansub:'تَهْدِيَا', majzum:'تَهْدِيَا' },
    { pronoun:'هُنَّ',     pronounEn:'they (f.)',     marfu:'يَهْدِينَ',  mansub:'يَهْدِينَ', majzum:'يَهْدِينَ' },
    { pronoun:'أَنْتَ',    pronounEn:'you (m.s.)',    marfu:'تَهْدِي',    mansub:'تَهْدِيَ',  majzum:'تَهْدِ' },
    { pronoun:'أَنْتِ',    pronounEn:'you (f.s.)',    marfu:'تَهْدِينَ',  mansub:'تَهْدِي',   majzum:'تَهْدِي' },
    { pronoun:'أَنْتُمَا', pronounEn:'you two',       marfu:'تَهْدِيَانِ',mansub:'تَهْدِيَا', majzum:'تَهْدِيَا' },
    { pronoun:'أَنْتُمْ',  pronounEn:'you (m.pl.)',   marfu:'تَهْدُونَ',  mansub:'تَهْدُوا',  majzum:'تَهْدُوا' },
    { pronoun:'أَنْتُنَّ', pronounEn:'you (f.pl.)',   marfu:'تَهْدِينَ',  mansub:'تَهْدِينَ', majzum:'تَهْدِينَ' },
    { pronoun:'أَنَا',     pronounEn:'I',             marfu:'أَهْدِي',    mansub:'أَهْدِيَ',  majzum:'أَهْدِ' },
    { pronoun:'نَحْنُ',    pronounEn:'we',            marfu:'نَهْدِي',    mansub:'نَهْدِيَ',  majzum:'نَهْدِ' },
  ],
  amr: [
    { pronoun:'أَنْتَ',    pronounEn:'you (m.s.)', form:'اِهْدِ' },
    { pronoun:'أَنْتِ',    pronounEn:'you (f.s.)', form:'اِهْدِي' },
    { pronoun:'أَنْتُمَا', pronounEn:'you two',    form:'اِهْدِيَا' },
    { pronoun:'أَنْتُمْ',  pronounEn:'you (m.pl.)',form:'اِهْدُوا' },
    { pronoun:'أَنْتُنَّ', pronounEn:'you (f.pl.)',form:'اِهْدِينَ' },
  ],
};

// ─── Hardcoded: دَعَا يَدْعُو ─────────────────────────────
const DAAA: TasreefEntry = {
  root: 'د ع و', verbForm: 'فَعَلَ – يَفْعُلُ (ناقص واوي)',
  chapter: 'بَابُ دَعَا', type: 'متعدٍّ', masdar: 'دُعَاءٌ',
  ismFail: 'دَاعٍ', ismMaful: 'مَدْعُوٌّ', ismMakan: 'مَدْعَى',
  meaning: 'to call, to invite, to supplicate',
  madi: [
    { pronoun:'هُوَ',      pronounEn:'he',           maloom:'دَعَا',    majhool:'دُعِيَ' },
    { pronoun:'هُمَا مذ',  pronounEn:'they two (m.)', maloom:'دَعَوَا',  majhool:'دُعِيَا' },
    { pronoun:'هُمْ',      pronounEn:'they (m.)',     maloom:'دَعَوْا',  majhool:'دُعُوا' },
    { pronoun:'هِيَ',      pronounEn:'she',           maloom:'دَعَتْ',   majhool:'دُعِيَتْ' },
    { pronoun:'هُمَا مؤ',  pronounEn:'they two (f.)', maloom:'دَعَتَا',  majhool:'دُعِيَتَا' },
    { pronoun:'هُنَّ',     pronounEn:'they (f.)',     maloom:'دَعَوْنَ', majhool:'دُعِينَ' },
    { pronoun:'أَنْتَ',    pronounEn:'you (m.s.)',    maloom:'دَعَوْتَ', majhool:'دُعِيتَ' },
    { pronoun:'أَنْتِ',    pronounEn:'you (f.s.)',    maloom:'دَعَوْتِ', majhool:'دُعِيتِ' },
    { pronoun:'أَنْتُمَا', pronounEn:'you two',       maloom:'دَعَوْتُمَا',majhool:'دُعِيتُمَا' },
    { pronoun:'أَنْتُمْ',  pronounEn:'you (m.pl.)',   maloom:'دَعَوْتُمْ',majhool:'دُعِيتُمْ' },
    { pronoun:'أَنْتُنَّ', pronounEn:'you (f.pl.)',   maloom:'دَعَوْتُنَّ',majhool:'دُعِيتُنَّ' },
    { pronoun:'أَنَا',     pronounEn:'I',             maloom:'دَعَوْتُ', majhool:'دُعِيتُ' },
    { pronoun:'نَحْنُ',    pronounEn:'we',            maloom:'دَعَوْنَا',majhool:'دُعِينَا' },
  ],
  mudari: [
    { pronoun:'هُوَ',      pronounEn:'he',           marfu:'يَدْعُو',    mansub:'يَدْعُوَ',  majzum:'يَدْعُ' },
    { pronoun:'هُمَا مذ',  pronounEn:'they two (m.)', marfu:'يَدْعُوَانِ',mansub:'يَدْعُوَا', majzum:'يَدْعُوَا' },
    { pronoun:'هُمْ',      pronounEn:'they (m.)',     marfu:'يَدْعُونَ',  mansub:'يَدْعُوا',  majzum:'يَدْعُوا' },
    { pronoun:'هِيَ',      pronounEn:'she',           marfu:'تَدْعُو',    mansub:'تَدْعُوَ',  majzum:'تَدْعُ' },
    { pronoun:'هُمَا مؤ',  pronounEn:'they two (f.)', marfu:'تَدْعُوَانِ',mansub:'تَدْعُوَا', majzum:'تَدْعُوَا' },
    { pronoun:'هُنَّ',     pronounEn:'they (f.)',     marfu:'يَدْعُونَ',  mansub:'يَدْعُونَ', majzum:'يَدْعُونَ' },
    { pronoun:'أَنْتَ',    pronounEn:'you (m.s.)',    marfu:'تَدْعُو',    mansub:'تَدْعُوَ',  majzum:'تَدْعُ' },
    { pronoun:'أَنْتِ',    pronounEn:'you (f.s.)',    marfu:'تَدْعِينَ',  mansub:'تَدْعِي',   majzum:'تَدْعِي' },
    { pronoun:'أَنْتُمَا', pronounEn:'you two',       marfu:'تَدْعُوَانِ',mansub:'تَدْعُوَا', majzum:'تَدْعُوَا' },
    { pronoun:'أَنْتُمْ',  pronounEn:'you (m.pl.)',   marfu:'تَدْعُونَ',  mansub:'تَدْعُوا',  majzum:'تَدْعُوا' },
    { pronoun:'أَنْتُنَّ', pronounEn:'you (f.pl.)',   marfu:'تَدْعُونَ',  mansub:'تَدْعُونَ', majzum:'تَدْعُونَ' },
    { pronoun:'أَنَا',     pronounEn:'I',             marfu:'أَدْعُو',    mansub:'أَدْعُوَ',  majzum:'أَدْعُ' },
    { pronoun:'نَحْنُ',    pronounEn:'we',            marfu:'نَدْعُو',    mansub:'نَدْعُوَ',  majzum:'نَدْعُ' },
  ],
  amr: [
    { pronoun:'أَنْتَ',    pronounEn:'you (m.s.)', form:'اُدْعُ' },
    { pronoun:'أَنْتِ',    pronounEn:'you (f.s.)', form:'اُدْعِي' },
    { pronoun:'أَنْتُمَا', pronounEn:'you two',    form:'اُدْعُوَا' },
    { pronoun:'أَنْتُمْ',  pronounEn:'you (m.pl.)',form:'اُدْعُوا' },
    { pronoun:'أَنْتُنَّ', pronounEn:'you (f.pl.)',form:'اُدْعُونَ' },
  ],
};

// ─── Hardcoded: آمَنَ يُؤْمِنُ (Form IV) ─────────────────
const AAMANA: TasreefEntry = {
  root: 'أ م ن', verbForm: 'أَفْعَلَ – يُفْعِلُ (باب الإفعال)',
  chapter: 'بَابُ آمَنَ', type: 'لازم', masdar: 'إِيمَانٌ',
  ismFail: 'مُؤْمِنٌ', ismMaful: 'مُؤْمَنٌ', ismMakan: 'مُؤْمَنٌ',
  meaning: 'to believe, to have faith',
  madi: [
    { pronoun:'هُوَ',      pronounEn:'he',           maloom:'آمَنَ',    majhool:'أُومِنَ' },
    { pronoun:'هُمَا مذ',  pronounEn:'they two (m.)', maloom:'آمَنَا',   majhool:'أُومِنَا' },
    { pronoun:'هُمْ',      pronounEn:'they (m.)',     maloom:'آمَنُوا',  majhool:'أُومِنُوا' },
    { pronoun:'هِيَ',      pronounEn:'she',           maloom:'آمَنَتْ',  majhool:'أُومِنَتْ' },
    { pronoun:'هُمَا مؤ',  pronounEn:'they two (f.)', maloom:'آمَنَتَا', majhool:'أُومِنَتَا' },
    { pronoun:'هُنَّ',     pronounEn:'they (f.)',     maloom:'آمَنَّ',   majhool:'أُومِنَّ' },
    { pronoun:'أَنْتَ',    pronounEn:'you (m.s.)',    maloom:'آمَنْتَ',  majhool:'أُومِنْتَ' },
    { pronoun:'أَنْتِ',    pronounEn:'you (f.s.)',    maloom:'آمَنْتِ',  majhool:'أُومِنْتِ' },
    { pronoun:'أَنْتُمَا', pronounEn:'you two',       maloom:'آمَنْتُمَا',majhool:'أُومِنْتُمَا' },
    { pronoun:'أَنْتُمْ',  pronounEn:'you (m.pl.)',   maloom:'آمَنْتُمْ',majhool:'أُومِنْتُمْ' },
    { pronoun:'أَنْتُنَّ', pronounEn:'you (f.pl.)',   maloom:'آمَنْتُنَّ',majhool:'أُومِنْتُنَّ' },
    { pronoun:'أَنَا',     pronounEn:'I',             maloom:'آمَنْتُ',  majhool:'أُومِنْتُ' },
    { pronoun:'نَحْنُ',    pronounEn:'we',            maloom:'آمَنَّا',  majhool:'أُومِنَّا' },
  ],
  mudari: [
    { pronoun:'هُوَ',      pronounEn:'he',           marfu:'يُؤْمِنُ',    mansub:'يُؤْمِنَ',   majzum:'يُؤْمِنْ' },
    { pronoun:'هُمَا مذ',  pronounEn:'they two (m.)', marfu:'يُؤْمِنَانِ', mansub:'يُؤْمِنَا',  majzum:'يُؤْمِنَا' },
    { pronoun:'هُمْ',      pronounEn:'they (m.)',     marfu:'يُؤْمِنُونَ', mansub:'يُؤْمِنُوا', majzum:'يُؤْمِنُوا' },
    { pronoun:'هِيَ',      pronounEn:'she',           marfu:'تُؤْمِنُ',    mansub:'تُؤْمِنَ',   majzum:'تُؤْمِنْ' },
    { pronoun:'هُمَا مؤ',  pronounEn:'they two (f.)', marfu:'تُؤْمِنَانِ', mansub:'تُؤْمِنَا',  majzum:'تُؤْمِنَا' },
    { pronoun:'هُنَّ',     pronounEn:'they (f.)',     marfu:'يُؤْمِنَّ',   mansub:'يُؤْمِنَّ',  majzum:'يُؤْمِنَّ' },
    { pronoun:'أَنْتَ',    pronounEn:'you (m.s.)',    marfu:'تُؤْمِنُ',    mansub:'تُؤْمِنَ',   majzum:'تُؤْمِنْ' },
    { pronoun:'أَنْتِ',    pronounEn:'you (f.s.)',    marfu:'تُؤْمِنِينَ', mansub:'تُؤْمِنِي',  majzum:'تُؤْمِنِي' },
    { pronoun:'أَنْتُمَا', pronounEn:'you two',       marfu:'تُؤْمِنَانِ', mansub:'تُؤْمِنَا',  majzum:'تُؤْمِنَا' },
    { pronoun:'أَنْتُمْ',  pronounEn:'you (m.pl.)',   marfu:'تُؤْمِنُونَ', mansub:'تُؤْمِنُوا', majzum:'تُؤْمِنُوا' },
    { pronoun:'أَنْتُنَّ', pronounEn:'you (f.pl.)',   marfu:'تُؤْمِنَّ',   mansub:'تُؤْمِنَّ',  majzum:'تُؤْمِنَّ' },
    { pronoun:'أَنَا',     pronounEn:'I',             marfu:'أُؤْمِنُ',    mansub:'أُؤْمِنَ',   majzum:'أُؤْمِنْ' },
    { pronoun:'نَحْنُ',    pronounEn:'we',            marfu:'نُؤْمِنُ',    mansub:'نُؤْمِنَ',   majzum:'نُؤْمِنْ' },
  ],
  amr: [
    { pronoun:'أَنْتَ',    pronounEn:'you (m.s.)', form:'آمِنْ' },
    { pronoun:'أَنْتِ',    pronounEn:'you (f.s.)', form:'آمِنِي' },
    { pronoun:'أَنْتُمَا', pronounEn:'you two',    form:'آمِنَا' },
    { pronoun:'أَنْتُمْ',  pronounEn:'you (m.pl.)',form:'آمِنُوا' },
    { pronoun:'أَنْتُنَّ', pronounEn:'you (f.pl.)',form:'آمِنَّ' },
  ],
};

// ─── Build the verb registry using the generator ──────────
// genFormISalim(r1, r2, r3, pastV, presV, root, meaning, masdar, ismFail, ismMaful, ismMakan, type?)
const GENERATED: TasreefEntry[] = [
  // ── باب نَصَرَ (a/u) ──────────────────────────────────
  genFormISalim('ن','ص','ر','a','u','ن ص ر','to help, to give victory',
    'نَصْرٌ','نَاصِرٌ','مَنْصُورٌ','مَنْصَرٌ'),
  genFormISalim('ك','ت','ب','a','u','ك ت ب','to write',
    'كِتَابَةٌ / كَتْبٌ','كَاتِبٌ','مَكْتُوبٌ','مَكْتَبٌ'),
  genFormISalim('خ','ر','ج','a','u','خ ر ج','to go out, to exit',
    'خُرُوجٌ','خَارِجٌ','مَخْرُوجٌ','مَخْرَجٌ'),
  genFormISalim('د','خ','ل','a','u','د خ ل','to enter, to go in',
    'دُخُولٌ','دَاخِلٌ','مَدْخُولٌ','مَدْخَلٌ'),
  genFormISalim('ر','ز','ق','a','u','ر ز ق','to provide sustenance, to bless with',
    'رِزْقٌ','رَازِقٌ','مَرْزُوقٌ','مَرْزَقٌ'),
  genFormISalim('ق','ت','ل','a','u','ق ت ل','to kill, to slay',
    'قَتْلٌ','قَاتِلٌ','مَقْتُولٌ','مَقْتَلٌ'),
  genFormISalim('ع','ب','د','a','u','ع ب د','to worship, to serve',
    'عِبَادَةٌ','عَابِدٌ','مَعْبُودٌ','مَعْبَدٌ'),
  // ── باب ضَرَبَ (a/i) ──────────────────────────────────
  genFormISalim('ض','ر','ب','a','i','ض ر ب','to strike, to hit',
    'ضَرْبٌ','ضَارِبٌ','مَضْرُوبٌ','مَضْرِبٌ'),
  genFormISalim('ص','ب','ر','a','i','ص ب ر','to be patient, to endure',
    'صَبْرٌ','صَابِرٌ','مَصْبُورٌ عَلَيْهِ','مَصْبَرٌ','لازم'),
  genFormISalim('ج','ل','س','a','i','ج ل س','to sit',
    'جُلُوسٌ','جَالِسٌ',null,'مَجْلِسٌ','لازم'),
  genFormISalim('س','ج','د','a','u','س ج د','to prostrate, to bow down in worship',
    'سُجُودٌ','سَاجِدٌ','مَسْجُودٌ لَهُ','مَسْجِدٌ','لازم'),
  genFormISalim('ر','ك','ع','a','u','ر ك ع','to bow down (in prayer)',
    'رُكُوعٌ','رَاكِعٌ',null,'مَرْكَعٌ','لازم'),
  // ── باب فَتَحَ (a/a) ──────────────────────────────────
  genFormISalim('ف','ت','ح','a','a','ف ت ح','to open, to conquer',
    'فَتْحٌ','فَاتِحٌ','مَفْتُوحٌ','مَفْتَحٌ'),
  genFormISalim('ذ','ه','ب','a','a','ذ ه ب','to go, to depart',
    'ذَهَابٌ','ذَاهِبٌ',null,'مَذْهَبٌ','لازم'),
  genFormISalim('ف','ع','ل','a','a','ف ع ل','to do, to act, to perform',
    'فِعْلٌ','فَاعِلٌ','مَفْعُولٌ','مَفْعَلٌ'),
  genFormISalim('ق','ر','أ','a','a','ق ر أ','to read, to recite',
    'قِرَاءَةٌ','قَارِئٌ','مَقْرُوءٌ','مَقْرَأٌ'),
  // ── باب سَمِعَ (i/a) ──────────────────────────────────
  genFormISalim('ع','ل','م','i','a','ع ل م','to know, to have knowledge',
    'عِلْمٌ','عَالِمٌ','مَعْلُومٌ','مَعْلَمٌ'),
  genFormISalim('س','م','ع','i','a','س م ع','to hear, to listen',
    'سَمَاعٌ','سَامِعٌ','مَسْمُوعٌ','مَسْمَعٌ'),
  genFormISalim('ش','ه','د','i','a','ش ه د','to witness, to testify',
    'شَهَادَةٌ','شَاهِدٌ','مَشْهُودٌ','مَشْهَدٌ'),
];

// ─── Full database ─────────────────────────────────────────
const DATABASE: TasreefEntry[] = [
  ...GENERATED,
  QALA, KANA, HADA, DAAA, AAMANA,
];

// ─── Lookup helpers ────────────────────────────────────────
// Strip diacritics, alif variants, spaces → raw consonants
function normAr(s: string): string {
  return s
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[\u0622\u0623\u0625\u0671\u0627]/g, 'ا')
    .replace(/\s+/g, '')
    .trim();
}

// Build per-entry search keys: root consonants + common verb forms
function keysFor(e: TasreefEntry): string[] {
  const base = normAr(e.root); // e.g. "ك ت ب" → "كتب" (spaces stripped above)
  const keys = new Set<string>([base]);
  // Also index by first maloom (هُوَ form of past)
  const h = e.madi[0]?.maloom;
  if (h) keys.add(normAr(h));
  // And the marfu present
  const pr = e.mudari[0]?.marfu;
  if (pr) keys.add(normAr(pr));
  // And masdar if present
  if (e.masdar) keys.add(normAr(e.masdar));
  return [...keys];
}

const INDEX = new Map<string, TasreefEntry>();
for (const entry of DATABASE) {
  for (const k of keysFor(entry)) {
    if (!INDEX.has(k)) INDEX.set(k, entry);
  }
}

export function lookupVerb(query: string): TasreefEntry | undefined {
  const q = normAr(query.replace(/\s+/g, ''));
  return INDEX.get(q);
}

export function listVerbs(): { root: string; meaning: string; verbForm: string }[] {
  return DATABASE.map(e => ({ root: e.root, meaning: e.meaning, verbForm: e.verbForm }));
}
