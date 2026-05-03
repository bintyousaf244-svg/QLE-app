export interface WordInfo {
  root?: string;
  wazn?: string;
  type?: string;
  meaning?: string;
  ar_meaning?: string;
  transliteration?: string;
  source?: 'classical' | 'corpus+quran.com' | 'ai';
}

export function normalize(word: string): string {
  return word
    .replace(/[\u0610-\u061A\u064B-\u0652\u0653-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0640\u0671]/g, '')
    .replace(/[﴿﴾۝۞۩\u06DD]/g, '')
    .replace(/[\u0622\u0623\u0625]/g, '\u0627')
    .replace(/\u0624/g, '\u0648')
    .replace(/\u0626/g, '\u064A')
    .trim();
}

export const CLASSICAL: Record<string, WordInfo> = {
  'بسم':      { root: 'س م و', wazn: 'فِعْل + بِ',  type: 'Noun',      meaning: "In the name of — preposition بِ + اسم (name). Invoking Allah's name before beginning an act.", ar_meaning: 'باسم: استعانة بذكر اسم الله والتبرك به قبل الشروع في الأمر' },
  'اسم':      { root: 'س م و', wazn: 'فِعْل',       type: 'Noun',      meaning: 'Ism (Name) — a label that identifies and distinguishes a thing.', ar_meaning: 'الاسم: اللفظ الدالّ على مسمّاه، وأصله من السمو' },
  'الله':     { root: 'أ ل ه', wazn: 'عَلَم',       type: 'Noun',      meaning: 'Allah — the proper divine name of the one true God; the deity alone worthy of worship.', ar_meaning: 'الله: علم على ذات الرب تبارك وتعالى، المستحق للعبادة وحده' },
  'لله':      { root: 'أ ل ه', wazn: 'عَلَم',       type: 'Noun',      meaning: 'To/for Allah — lām (لِ) of dedication + the divine name.', ar_meaning: 'لله: اسم الجلالة مجروراً، المعبود بحق' },
  'الرحمن':   { root: 'ر ح م', wazn: 'فَعْلَان',    type: 'Adjective', meaning: 'Al-Rahman (The Most Gracious) — intensive form فَعْلَان; vast all-encompassing mercy.', ar_meaning: 'الرحمن: صيغة مبالغة من الرحمة، ذو الرحمة الواسعة لجميع الخلق' },
  'الرحيم':   { root: 'ر ح م', wazn: 'فَعِيل',      type: 'Adjective', meaning: 'Al-Raheem (The Most Merciful) — intensive form فَعِيل; continuous mercy to the believers.', ar_meaning: 'الرحيم: صيغة مبالغة من الرحمة، كثير الرحمة لعباده المؤمنين' },
  'رحمن':     { root: 'ر ح م', wazn: 'فَعْلَان',    type: 'Adjective', meaning: 'Rahman (Most Gracious) — the all-encompassing mercy of Allah.', ar_meaning: 'الرحمن: صيغة مبالغة، رحمته وسعت كل شيء' },
  'رحيم':     { root: 'ر ح م', wazn: 'فَعِيل',      type: 'Adjective', meaning: 'Raheem (Most Merciful) — specific mercy for the believers.', ar_meaning: 'الرحيم: كثير الرحمة، رحمته خاصة بالمؤمنين' },
  'الحمد':    { root: 'ح م د', wazn: 'فَعْل',        type: 'Noun',      meaning: 'Al-Hamd (All praise) — comprehensive praise for beautiful qualities willingly displayed.', ar_meaning: 'الحمد: الثناء على الجميل الاختياري، أعمّ من الشكر' },
  'حمد':      { root: 'ح م د', wazn: 'فَعْل',        type: 'Noun',      meaning: 'Hamd (Praise) — verbal noun; to praise sincerely for virtue.', ar_meaning: 'الحمد: الثناء الجميل على المحمود' },
  'رب':       { root: 'ر ب ب', wazn: 'فَعْل',        type: 'Noun',      meaning: 'Rabb (Lord/Sustainer) — the one who owns, nurtures, sustains, and governs.', ar_meaning: 'الرب: المالك والسيد والمربّي والمصلح' },
  'ربي':      { root: 'ر ب ب', wazn: 'فَعْل + ي',   type: 'Noun',      meaning: 'Rabbi (My Lord) — Rabb + first person possessive.', ar_meaning: 'ربي: ربّ مضاف إلى ياء المتكلم' },
  'العالمين': { root: 'ع ل م', wazn: 'فَاعَل + ين', type: 'Noun',      meaning: "Al-'Alamin (The worlds) — plural of 'ālam; all of creation.", ar_meaning: 'العالمون: جمع عالَم، كل ما سوى الله تعالى من المخلوقات' },
  'مالك':     { root: 'م ل ك', wazn: 'فَاعِل',       type: 'Noun',      meaning: 'Malik (Master/King) — active participle; one with full possession and sovereignty.', ar_meaning: 'مالك: اسم فاعل من مَلَك، صاحب الملك والسلطان' },
  'ملك':      { root: 'م ل ك', wazn: 'فِعْل',        type: 'Noun',      meaning: 'Malik (King) — ruler, sovereign.', ar_meaning: 'ملك: صاحب الملك، الآمر الناهي في رعيته' },
  'يوم':      { root: 'ي و م', wazn: 'فَعْل',        type: 'Noun',      meaning: 'Yawm (Day) — a period of time; in Quran often the Day of Judgement.', ar_meaning: 'يوم: اسم زمان، ويُراد به يوم القيامة في السياق القرآني' },
  'الدين':    { root: 'د ي ن', wazn: 'فِعْل',        type: 'Noun',      meaning: 'Al-Din (The Recompense/Religion) — the Day of Recompense; also religion.', ar_meaning: 'الدين: الجزاء والحساب' },
  'اياك':     { root: '—',     wazn: 'ضمير',          type: 'Pronoun',   meaning: 'Iyyaka (You alone) — emphatic direct-object pronoun. Exclusive focus.', ar_meaning: 'إياك: ضمير نصب منفصل يُفيد الاختصاص والحصر' },
  'نعبد':     { root: 'ع ب د', wazn: 'نَفْعُل',       type: 'Verb',      meaning: "Na'budu (We worship) — first person plural present from 'abada.", ar_meaning: 'نعبد: فعل مضارع، نتعبد ونتذلل لله وحده' },
  'نستعين':   { root: 'ع و ن', wazn: 'نَسْتَفْعِل',  type: 'Verb',      meaning: "Nasta'een (We seek help) — Form X from 'awana.", ar_meaning: 'نستعين: نطلب العون والمساعدة من الله وحده' },
  'اهدنا':    { root: 'ه د ي', wazn: 'أَفْعِلْنَا',  type: 'Verb',      meaning: 'Ihdina (Guide us) — imperative from hadaya.', ar_meaning: 'اهدنا: دلّنا وأرشدنا وثبّتنا على الطريق المستقيم' },
  'الصراط':   { root: 'ص ر ط', wazn: 'فِعَال',        type: 'Noun',      meaning: 'Al-Sirat (The path) — the straight road; the way of the prophets.', ar_meaning: 'الصراط: الطريق الواضح المستقيم الذي لا اعوجاج فيه' },
  'صراط':     { root: 'ص ر ط', wazn: 'فِعَال',        type: 'Noun',      meaning: 'Sirat (Path/way) — road, route, the correct way.', ar_meaning: 'الصراط: الطريق القويم الواضح' },
  'المستقيم': { root: 'ق و م', wazn: 'مُسْتَفْعِل',  type: 'Adjective', meaning: 'Al-Mustaqeem (The straight) — Form X active participle; perfectly straight.', ar_meaning: 'المستقيم: اسم فاعل، المعتدل الذي لا اعوجاج فيه' },
  'الذين':    { root: '—',     wazn: 'موصول',          type: 'Particle',  meaning: 'Alladheena (Those who) — masculine plural relative pronoun.', ar_meaning: 'الذين: اسم موصول لجمع المذكر' },
  'انعمت':    { root: 'ن ع م', wazn: 'أَفْعَلْتَ',    type: 'Verb',      meaning: "An'amta (You bestowed blessing) — Form IV past, second person.", ar_meaning: 'أنعمت: فعل ماضٍ من باب الإفعال' },
  'عليهم':    { root: 'ع ل و', wazn: 'جار+مجرور',     type: 'Particle',  meaning: "'Alayhim (Upon them) — preposition 'alā + third person plural pronoun.", ar_meaning: 'عليهم: جار ومجرور' },
  'غير':      { root: 'غ ي ر', wazn: 'فَعْل',          type: 'Noun',      meaning: 'Ghayri (Other than) — indicates difference or exclusion.', ar_meaning: 'غير: اسم يدلّ على المغايرة والاختلاف' },
  'المغضوب':  { root: 'غ ض ب', wazn: 'مَفْعُول',       type: 'Adjective', meaning: 'Al-Maghdoob (Those who earned wrath) — passive participle.', ar_meaning: 'المغضوب: اسم مفعول من غضب' },
  'الضالين':  { root: 'ض ل ل', wazn: 'فَاعِلِين',     type: 'Adjective', meaning: 'Al-Dhaalleen (Those who went astray) — active participle plural.', ar_meaning: 'الضالون: جمع ضال، من ضل عن الحق' },
  'قل':       { root: 'ق و ل', wazn: 'فَعْ (أمر)',    type: 'Verb',      meaning: 'Qul (Say) — imperative singular from qāla; divine command.', ar_meaning: 'قل: فعل أمر، أمرٌ بالنطق والإبلاغ' },
  'هو':       { root: '—',     wazn: 'ضمير',           type: 'Pronoun',   meaning: 'Huwa (He) — third person masculine singular pronoun.', ar_meaning: 'هو: ضمير منفصل مرفوع للغائب المذكر' },
  'احد':      { root: 'و ح د', wazn: 'فَعَل',          type: 'Adjective', meaning: 'Ahad (The One/Unique) — absolute oneness excluding all multiplicity.', ar_meaning: 'أحد: الفرد المنفرد الذي لا نظير له ولا مثيل' },
  'الاحد':    { root: 'و ح د', wazn: 'فَعَل',          type: 'Adjective', meaning: "Al-Ahad (The Unique One) — exclusive divine oneness.", ar_meaning: 'الأحد: المتفرد بالوحدانية المطلقة' },
  'الصمد':    { root: 'ص م د', wazn: 'فَعَل',          type: 'Adjective', meaning: 'Al-Samad (The Eternal Refuge) — the self-sufficient one all creation turns to.', ar_meaning: 'الصمد: السيد الكامل الذي يُقصده الخلق في حوائجهم' },
  'في':       { root: '—',     wazn: 'حرف',            type: 'Particle',  meaning: 'Fi (In/within) — preposition indicating location or inclusion.', ar_meaning: 'في: حرف جر يدل على الظرفية' },
  'من':       { root: '—',     wazn: 'حرف',            type: 'Particle',  meaning: 'Min (From/of) — preposition expressing origin or partitiveness.', ar_meaning: 'من: حرف جر يدل على ابتداء الغاية أو التبعيض' },
  'الى':      { root: '—',     wazn: 'حرف',            type: 'Particle',  meaning: 'Ila (To/towards) — preposition of direction and destination.', ar_meaning: 'إلى: حرف جر يدل على انتهاء الغاية' },
  'على':      { root: '—',     wazn: 'حرف',            type: 'Particle',  meaning: 'Ala (Upon/over) — preposition of elevation or contact.', ar_meaning: 'على: حرف جر يدل على الاستعلاء' },
  'لا':       { root: '—',     wazn: 'حرف',            type: 'Particle',  meaning: 'La (No/not) — negation particle; categorical denial.', ar_meaning: 'لا: حرف نفي أو نهي أو تبرئة' },
  'ان':       { root: '—',     wazn: 'حرف',            type: 'Particle',  meaning: 'Anna/In (That/If) — conjunction of certainty (أنَّ) or condition (إن).', ar_meaning: 'أن/إن: حرف توكيد ونصب أو حرف شرط' },
  'ما':       { root: '—',     wazn: 'حرف/اسم',       type: 'Particle',  meaning: 'Ma (What/not) — relative pronoun, negation, or interrogative.', ar_meaning: 'ما: اسم موصول أو حرف نفي أو استفهام حسب السياق' },
  'كان':      { root: 'ك و ن', wazn: 'فَعَل',          type: 'Verb',      meaning: 'Kana (Was/were) — past tense of kāna; to be, to exist.', ar_meaning: 'كان: فعل ماضٍ ناقص يرفع المبتدأ وينصب الخبر' },
  'قال':      { root: 'ق و ل', wazn: 'فَعَل',          type: 'Verb',      meaning: 'Qala (He said) — past tense; to say, to speak.', ar_meaning: 'قال: فعل ماضٍ من القول' },
  'الناس':    { root: 'ن و س', wazn: 'فَعَال',          type: 'Noun',      meaning: 'Al-Nas (Mankind) — humanity as a whole.', ar_meaning: 'الناس: بنو آدم جميعاً' },
  'النبي':    { root: 'ن ب أ', wazn: 'فَعِيل',          type: 'Noun',      meaning: "Al-Nabi (The Prophet) — one who receives and conveys divine revelation.", ar_meaning: 'النبي: المخبر عن الله، المُنبَّأ بالوحي' },
  'رسول':     { root: 'ر س ل', wazn: 'فَعُول',          type: 'Noun',      meaning: 'Rasul (Messenger) — one sent with divine revelation and a new law.', ar_meaning: 'الرسول: المبعوث بشريعة جديدة ليُبلّغها' },
  'كتاب':     { root: 'ك ت ب', wazn: 'فِعَال',          type: 'Noun',      meaning: 'Kitab (Book/Scripture) — from kataba (to write); divine scripture.', ar_meaning: 'الكتاب: المكتوب، ويُطلق على القرآن والكتب السماوية' },
  'صلاة':     { root: 'ص ل و', wazn: 'فَعَال',          type: 'Noun',      meaning: 'Salah (Prayer) — prescribed Islamic prayer five times daily.', ar_meaning: 'الصلاة: العبادة المخصوصة بأركانها، وأصلها الدعاء' },
  'زكاة':     { root: 'ز ك و', wazn: 'فَعَال',          type: 'Noun',      meaning: 'Zakah (Almsgiving) — obligatory charity.', ar_meaning: 'الزكاة: المقدار الواجب من المال للمستحقين' },
  'امن':      { root: 'أ م ن', wazn: 'فَاعَل',          type: 'Verb',      meaning: 'Amana (He believed) — to have faith and sincerely trust.', ar_meaning: 'آمن: صدّق وأيقن واطمأن قلبه' },
  'جنة':      { root: 'ج ن ن', wazn: 'فَعْلَة',          type: 'Noun',      meaning: 'Jannah (Paradise) — the Paradise promised to the believers.', ar_meaning: 'الجنة: دار النعيم الأبدية التي وعد الله بها المؤمنين' },
  'نار':      { root: 'ن و ر', wazn: 'فَعْل',            type: 'Noun',      meaning: 'Nar (Fire/Hellfire) — fire; in Quran often refers to the hellfire.', ar_meaning: 'النار: اللهب والحرارة، وتُطلق على جهنم' },
  'صبر':      { root: 'ص ب ر', wazn: 'فَعْل',            type: 'Noun',      meaning: 'Sabr (Patience) — enduring hardship with resolve and trust in Allah.', ar_meaning: 'الصبر: حبس النفس عن الجزع والتسخط' },
  'شكر':      { root: 'ش ك ر', wazn: 'فَعْل',            type: 'Noun',      meaning: 'Shukr (Gratitude) — expressing gratitude through heart, tongue, and action.', ar_meaning: 'الشكر: الاعتراف بالنعمة والثناء على المنعم' },
  'تقوى':     { root: 'و ق ي', wazn: 'فَعْلَى',          type: 'Noun',      meaning: "Taqwa (God-consciousness/Piety) — guarding oneself from Allah's displeasure.", ar_meaning: 'التقوى: اتقاء غضب الله بفعل أوامره واجتناب نواهيه' },
  'توبة':     { root: 'ت و ب', wazn: 'فَعْلَة',           type: 'Noun',      meaning: 'Tawbah (Repentance) — sincere return from sin to Allah.', ar_meaning: 'التوبة: الرجوع إلى الله والندم على المعصية' },
  'سبحان':    { root: 'س ب ح', wazn: 'فُعْلَان',        type: 'Noun',      meaning: 'Subhana (Glory be to) — verbal noun; to declare Allah far above any defect.', ar_meaning: 'سبحان: مصدر لتنزيه الله عن كل نقص' },
  'ايمان':    { root: 'أ م ن', wazn: 'إِفْعَال',         type: 'Noun',      meaning: 'Iman (Faith) — belief in Allah, His angels, books, messengers, last day.', ar_meaning: 'الإيمان: التصديق القلبي والإقرار اللساني والعمل بالجوارح' },
  'اسلام':    { root: 'س ل م', wazn: 'إِفْعَال',         type: 'Noun',      meaning: 'Islam (Submission) — complete submission and surrender to Allah.', ar_meaning: 'الإسلام: الاستسلام لله والانقياد لأحكامه' },
  'قران':     { root: 'ق ر أ', wazn: 'فُعَال',           type: 'Noun',      meaning: "Quran (The Recitation) — the divine book revealed to Prophet Muhammad ﷺ.", ar_meaning: 'القرآن: كلام الله المنزّل على النبي محمد ﷺ' },
  'محمد':     { root: 'ح م د', wazn: 'مُفَعَّل',        type: 'Noun',      meaning: "Muhammad (The Praised One) — the Prophet ﷺ.", ar_meaning: 'محمد: اسم مفعول، كثير المحامد والصفات الحميدة' },
};

const PREFIXES = ['ال', 'بال', 'وال', 'فال', 'كال', 'لل', 'بل', 'وب', 'فب', 'كب', 'ول', 'فل', 'كل', 'و', 'ف', 'ب', 'ل', 'ك'];

export function lookupWord(key: string): WordInfo | undefined {
  if (CLASSICAL[key]) return CLASSICAL[key];
  for (const p of PREFIXES) {
    if (key.startsWith(p) && key.length > p.length) {
      const stripped = key.slice(p.length);
      if (CLASSICAL[stripped]) return CLASSICAL[stripped];
    }
  }
  return undefined;
}
