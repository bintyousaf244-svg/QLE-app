import { Router } from 'express';
import Groq from 'groq-sdk';

const router = Router();

const GROQ_KEYS = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
].filter(Boolean) as string[];

let currentKeyIndex = 0;
function getGroqClient(): Groq {
  return new Groq({ apiKey: GROQ_KEYS[currentKeyIndex % GROQ_KEYS.length] });
}
function rotateKey(): void {
  currentKeyIndex = (currentKeyIndex + 1) % GROQ_KEYS.length;
}

const MODEL = 'llama-3.1-8b-instant';

interface PromptMessages {
  system: string;
  user: string;
}

function getMessages(type: string, payload: { ayahText?: string; surahName?: string; ayahNumber?: number; word?: string }): PromptMessages {
  const { ayahText, surahName, ayahNumber, word } = payload;

  switch (type) {
    case 'morphology':
      return {
        system: `أنت خبير متخصص في علم الصرف العربي الكلاسيكي، تسير على منهج أئمة هذا العلم كابن جني في "الخصائص" والهملاوي في "شذا العرف في فن الصرف". تُجيد تحليل الأوزان والمشتقات وظواهر الإعلال والإبدال والإدغام تحليلاً دقيقاً معمّقاً.`,
        user: `قم بالتحليل الصرفي الكامل والدقيق للكلمات المحورية في الآية الكريمة التالية من سورة ${surahName}، الآية رقم ${ayahNumber}:

"${ayahText}"

لكل كلمة أساسية في الآية (تجاوز حروف الجر والضمائر البسيطة وركّز على الأسماء والأفعال والمشتقات)، قدّم التحليل التالي بالتفصيل:

**الكلمة: [اكتب الكلمة]**
- **الجذر (الجذر اللغوي):** اذكر حروف الجذر الثلاثية أو الرباعية ومعناه الأصلي.
- **الوزن:** اذكر وزنه الصرفي الدقيق مع ضبط الشكل الكامل.
- **النوع:** (مصدر / اسم فاعل / اسم مفعول / صفة مشبهة / فعل ماضٍ / مضارع ...إلخ).
- **التحليل الصرفي والإعلال:** إذا وقع في الكلمة إعلال أو إبدال أو إدغام، فاشرحه خطوة بخطوة مع ذكر القاعدة الصرفية.
- **الصرف الصغير (للفعل المجرد أو المزيد):** اذكر الفعل الماضي والمضارع والمصدر واسم الفاعل واسم المفعول.

افصل بين كل كلمة بخط فاصل (---).

اختم بـ**خاتمة صرفية** تُبرز أهم الظواهر الصرفية في الآية وبلاغتها اللغوية.

اكتب التحليل كاملاً بالعربية الفصحى على مستوى المتخصصين في علم الصرف.`
      };

    case 'conjugation':
      return {
        system: `أنت متخصص في علم الصرف والتصريف العربي الكلاسيكي. مهمتك توليد جدول تصريف كامل ودقيق لأي فعل عربي.`,
        user: `صرِّف الفعل العربي التالي تصريفاً كاملاً: **"${word}"**

اذكر أولاً:
- الجذر الثلاثي
- الباب الصرفي (الوزن)
- المصدر واسم الفاعل واسم المفعول

ثم قدم جدول التصريف الكامل بالتشكيل التام لجميع الضمائر الثلاثة عشر في الماضي والمضارع والأمر.

اكتب جميع الأفعال بالشكل الكامل (تشكيل تام).`
      };

    case 'word':
      return {
        system: `You are a rigorous Arabic-English lexicographer specializing in Quranic vocabulary.`,
        user: `Provide a detailed dictionary entry for the Arabic word: **"${word}"**

Include root, wazn, meanings, classical definitions, and Quranic usage.`
      };

    default:
      throw new Error(`Unknown analysis type: ${type}`);
  }
}

const VALID_TYPES = new Set(['morphology', 'conjugation', 'word']);

router.post('/analysis/stream', async (req, res) => {
  const { type, ayahText, surahName, ayahNumber, word } = req.body;

  if (!type || !VALID_TYPES.has(type)) {
    res.status(400).json({ error: 'Missing or invalid type. Valid types: morphology, conjugation, word' });
    return;
  }

  if (GROQ_KEYS.length === 0) {
    res.status(503).json({ error: 'AI API key not configured. Please set GROQ_API_KEY in your environment secrets.' });
    return;
  }

  let messages: PromptMessages;
  try {
    messages = getMessages(type, { ayahText, surahName, ayahNumber, word });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const groq = getGroqClient();
  try {
    const stream = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: messages.system },
        { role: 'user', content: messages.user }
      ],
      temperature: 0.05,
      max_tokens: 4096,
      stream: true
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content ?? '';
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    req.log.error({ err }, 'Groq streaming error');
    const is429 = err?.status === 429;
    if (is429 && GROQ_KEYS.length > 1) rotateKey();
    const msg = is429
      ? 'Daily token limit reached. Please try again in a few hours.'
      : 'Analysis failed. Please try again.';
    res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
    res.end();
  }
});

export default router;
