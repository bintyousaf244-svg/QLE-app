import type { AyahData, SearchResult, SurahMeta, WordAnalysis } from "@/types";

const QURAN_API = "https://api.alquran.cloud/v1";
const QURANCOM_API = "https://api.quran.com/api/v4";

export const fetchSurahs = async (): Promise<SurahMeta[]> => {
  const res = await fetch(`${QURAN_API}/surah`);
  if (!res.ok) throw new Error("Failed to fetch surahs");
  const data = await res.json();
  return data.data;
};

export const fetchSurah = async (
  number: number
): Promise<{ surahMeta: SurahMeta; ayahs: AyahData[] }> => {
  const res = await fetch(
    `${QURAN_API}/surah/${number}/editions/quran-uthmani,en.asad,ur.jalandhry`
  );
  if (!res.ok) throw new Error(`Failed to fetch surah ${number}`);
  const data = await res.json();

  const arabicData = data.data[0];
  const englishData = data.data[1];
  const urduData = data.data[2];

  const ayahs: AyahData[] = arabicData.ayahs.map((ayah: any, index: number) => ({
    number: ayah.number,
    numberInSurah: ayah.numberInSurah,
    arabic: ayah.text,
    english: englishData?.ayahs[index]?.text ?? "",
    urdu: urduData?.ayahs[index]?.text ?? "",
    juz: ayah.juz,
    page: ayah.page,
    sajda: typeof ayah.sajda === "object" ? (ayah.sajda?.recommended ?? false) : (ayah.sajda ?? false),
  }));

  return { surahMeta: arabicData, ayahs };
};

export const fetchWordAnalysis = async (
  surah: number,
  ayah: number
): Promise<WordAnalysis[]> => {
  const res = await fetch(
    `${QURANCOM_API}/verses/by_key/${surah}:${ayah}?words=true&word_fields=text_uthmani,transliteration,translation&language=en`
  );
  if (!res.ok) throw new Error("Failed to fetch word analysis");
  const data = await res.json();
  return (data.verse?.words ?? []).filter(
    (w: WordAnalysis) => w.char_type_name === "word"
  );
};

export const searchQuran = async (keyword: string): Promise<SearchResult[]> => {
  const encoded = encodeURIComponent(keyword);
  const res = await fetch(`${QURAN_API}/search/${encoded}/all/en`);
  if (!res.ok) return [];
  const data = await res.json();
  const matches = data.data?.matches ?? [];
  return matches.map((m: any) => ({
    surah: m.surah,
    numberInSurah: m.numberInSurah,
    text: m.text,
    number: m.number,
  }));
};

export const fetchTafseer = async (surah: number, ayah: number): Promise<string> => {
  try {
    const res = await fetch(`${QURAN_API}/ayah/${surah}:${ayah}/en.maududi`);
    if (!res.ok) return "";
    const data = await res.json();
    return data.data?.text ?? "";
  } catch {
    return "";
  }
};

export const getAudioUrl = (
  surah: number,
  ayah: number,
  reciter: string = "alafasy"
): string => {
  const s = String(surah).padStart(3, "0");
  const a = String(ayah).padStart(3, "0");
  const reciters: Record<string, string> = {
    alafasy: "Alafasy_128kbps",
    minshawi: "Minshawy_Murattal_128kbps",
    husary: "Husary_128kbps",
    sudais: "Abdul_Basit_Murattal_192kbps",
  };
  const folder = reciters[reciter] ?? reciters.alafasy;
  return `https://everyayah.com/data/${folder}/${s}${a}.mp3`;
};

export const URDU_SURAH_NAMES: Record<number, string> = {
  1: "الفاتحۃ", 2: "البقرۃ", 3: "آل عمران", 4: "النساء", 5: "المائدۃ",
  6: "الانعام", 7: "الاعراف", 8: "الانفال", 9: "التوبۃ", 10: "یونس",
  11: "ہود", 12: "یوسف", 13: "الرعد", 14: "ابراہیم", 15: "الحجر",
  16: "النحل", 17: "الاسراء", 18: "الکہف", 19: "مریم", 20: "طہ",
  21: "الانبیاء", 22: "الحج", 23: "المومنون", 24: "النور", 25: "الفرقان",
  26: "الشعراء", 27: "النمل", 28: "القصص", 29: "العنکبوت", 30: "الروم",
  31: "لقمان", 32: "السجدۃ", 33: "الاحزاب", 34: "سبا", 35: "فاطر",
  36: "یس", 37: "الصافات", 38: "ص", 39: "الزمر", 40: "غافر",
  41: "فصلت", 42: "الشوری", 43: "الزخرف", 44: "الدخان", 45: "الجاثیۃ",
  46: "الاحقاف", 47: "محمد", 48: "الفتح", 49: "الحجرات", 50: "ق",
  51: "الذاریات", 52: "الطور", 53: "النجم", 54: "القمر", 55: "الرحمن",
  56: "الواقعۃ", 57: "الحدید", 58: "المجادلۃ", 59: "الحشر", 60: "الممتحنۃ",
  61: "الصف", 62: "الجمعۃ", 63: "المنافقون", 64: "التغابن", 65: "الطلاق",
  66: "التحریم", 67: "الملک", 68: "القلم", 69: "الحاقۃ", 70: "المعارج",
  71: "نوح", 72: "الجن", 73: "المزمل", 74: "المدثر", 75: "القیامۃ",
  76: "الانسان", 77: "المرسلات", 78: "النبا", 79: "النازعات", 80: "عبس",
  81: "التکویر", 82: "الانفطار", 83: "المطففین", 84: "الانشقاق", 85: "البروج",
  86: "الطارق", 87: "الاعلی", 88: "الغاشیۃ", 89: "الفجر", 90: "البلد",
  91: "الشمس", 92: "اللیل", 93: "الضحی", 94: "الشرح", 95: "التین",
  96: "العلق", 97: "القدر", 98: "البینۃ", 99: "الزلزلۃ", 100: "العادیات",
  101: "القارعۃ", 102: "التکاثر", 103: "العصر", 104: "الہمزۃ", 105: "الفیل",
  106: "قریش", 107: "الماعون", 108: "الکوثر", 109: "الکافرون", 110: "النصر",
  111: "المسد", 112: "الاخلاص", 113: "الفلق", 114: "الناس",
};
