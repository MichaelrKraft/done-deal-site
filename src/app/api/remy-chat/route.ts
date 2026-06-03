import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

const SYSTEM_PROMPT = `You are Remy, the AI Transaction Coordinator for Done Deal AI. Done Deal is a real estate SaaS that automates transaction coordination — handling paperwork, tracking deadlines, drafting emails, and managing documents so agents can close deals faster.

You are embedded on the Done Deal landing page to help visitors explore the product. Guide them warmly and concisely.

Page sections you can direct visitors to:
- Benefits: Key features and time savings
- How It Works: Step-by-step process
- ROI Calculator: Personalized time and money savings estimate
- Pricing: Monthly subscription plans
- Feature Comparison: Done Deal vs traditional TCs and competitors
- FAQ: Common questions answered

Rules:
- Be warm, friendly, and concise
- Keep every response to 1–2 short sentences
- Never make up pricing or specific numbers you're unsure of
- If asked to navigate somewhere, tell them which section to scroll to`;

const GEMINI_CHAT_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GEMINI_TTS_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent';

const MAX_USER_TEXT = 500;
const MAX_HISTORY_ENTRIES = 20;
const MAX_HISTORY_CHARS = 4000;
const GEMINI_TIMEOUT_MS = 20_000;
const TTS_CACHE_MAX = 100;

const ALLOWED_EXACT_ORIGINS = new Set([
  'https://done-deal.co',
  'https://www.done-deal.co',
  'http://localhost:3000',
  'http://localhost:3001',
]);

const ttsCache = new Map<string, Buffer>();
let globalDailyCalls = 0;
let globalDailyResetAt = nextUtcMidnight();

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function nextUtcMidnight(): number {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0);
}

function maybeResetGlobalDaily() {
  if (Date.now() >= globalDailyResetAt) {
    globalDailyCalls = 0;
    globalDailyResetAt = nextUtcMidnight();
  }
}

function getDailyLimit(): number {
  const parsed = Number(process.env.REMY_DAILY_LIMIT);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1000;
}

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true;
  if (ALLOWED_EXACT_ORIGINS.has(origin)) return true;
  try {
    const host = new URL(origin).hostname;
    return host.endsWith('.vercel.app') || host.endsWith('.onrender.com');
  } catch {
    return false;
  }
}

function hashText(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

function getCachedTts(key: string): Buffer | undefined {
  return ttsCache.get(key);
}

function setCachedTts(key: string, wav: Buffer) {
  if (ttsCache.size >= TTS_CACHE_MAX) {
    const oldest = ttsCache.keys().next().value;
    if (oldest !== undefined) ttsCache.delete(oldest);
  }
  ttsCache.set(key, wav);
}

function isAbortLike(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return err.name === 'TimeoutError' || err.name === 'AbortError';
}

function pcmToWav(pcm: Buffer): Buffer {
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcm.length;
  const buf = Buffer.alloc(44 + dataSize);
  let o = 0;
  buf.write('RIFF', o); o += 4;
  buf.writeUInt32LE(36 + dataSize, o); o += 4;
  buf.write('WAVE', o); o += 4;
  buf.write('fmt ', o); o += 4;
  buf.writeUInt32LE(16, o); o += 4;
  buf.writeUInt16LE(1, o); o += 2;
  buf.writeUInt16LE(numChannels, o); o += 2;
  buf.writeUInt32LE(sampleRate, o); o += 4;
  buf.writeUInt32LE(byteRate, o); o += 4;
  buf.writeUInt16LE(blockAlign, o); o += 2;
  buf.writeUInt16LE(bitsPerSample, o); o += 2;
  buf.write('data', o); o += 4;
  buf.writeUInt32LE(dataSize, o); o += 4;
  pcm.copy(buf, o);
  return buf;
}

function validateBody(
  body: unknown,
): { ok: true; userText: string; history: Message[] } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid body' };
  const obj = body as Record<string, unknown>;

  if (typeof obj.userText !== 'string') return { ok: false, error: 'userText must be a string' };
  const userText = obj.userText.trim();
  if (userText.length === 0) return { ok: false, error: 'userText required' };
  if (userText.length > MAX_USER_TEXT) {
    return { ok: false, error: `userText exceeds ${MAX_USER_TEXT} character limit` };
  }

  const rawHistory = obj.history ?? [];
  if (!Array.isArray(rawHistory)) return { ok: false, error: 'history must be an array' };
  if (rawHistory.length > MAX_HISTORY_ENTRIES) {
    return { ok: false, error: `history exceeds ${MAX_HISTORY_ENTRIES} entries` };
  }

  const history: Message[] = [];
  let totalChars = 0;
  for (const entry of rawHistory) {
    if (!entry || typeof entry !== 'object') return { ok: false, error: 'history entry malformed' };
    const e = entry as Record<string, unknown>;
    if (e.role !== 'user' && e.role !== 'assistant') {
      return { ok: false, error: 'history entry malformed' };
    }
    if (typeof e.content !== 'string') return { ok: false, error: 'history entry malformed' };
    totalChars += e.content.length;
    if (totalChars > MAX_HISTORY_CHARS) {
      return { ok: false, error: `history exceeds ${MAX_HISTORY_CHARS} character limit` };
    }
    history.push({ role: e.role, content: e.content });
  }

  return { ok: true, userText, history };
}

function dailyCeilingResponse(): Response {
  const retryAfter = Math.max(1, Math.ceil((globalDailyResetAt - Date.now()) / 1000));
  return new Response(
    JSON.stringify({ error: 'Daily Remy quota reached. Reset at midnight UTC.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
      },
    },
  );
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    if (!isOriginAllowed(request.headers.get('origin'))) {
      return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
    }

    maybeResetGlobalDaily();
    if (globalDailyCalls >= getDailyLimit()) return dailyCeilingResponse();

    const ip = getClientIp(request);
    const hourly = checkRateLimit('remy-hour', ip, 10, 60 * 60 * 1000);
    if (!hourly.allowed) return rateLimitResponse(hourly);
    const daily = checkRateLimit('remy-day', ip, 30, 24 * 60 * 60 * 1000);
    if (!daily.allowed) return rateLimitResponse(daily);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const validation = validateBody(body);
    if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
    const { userText, history } = validation;

    const contents = [
      ...history.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      { role: 'user', parts: [{ text: userText }] },
    ];

    let chatRes: Response;
    try {
      chatRes = await fetch(`${GEMINI_CHAT_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
        }),
        signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
      });
    } catch (err) {
      if (isAbortLike(err)) {
        console.error('[remy-chat] Gemini chat timeout');
        return NextResponse.json({ error: 'Upstream timeout' }, { status: 504 });
      }
      throw err;
    }

    if (!chatRes.ok) {
      console.error('[remy-chat] Gemini chat non-OK:', chatRes.status);
      return NextResponse.json({ error: 'Chat failed' }, { status: 502 });
    }

    const chatJson = (await chatRes.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const replyText = chatJson.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    if (!replyText) return NextResponse.json({ error: 'Empty response' }, { status: 502 });

    globalDailyCalls += 1;

    const ttsKey = hashText(replyText);
    let wav = getCachedTts(ttsKey);

    if (!wav) {
      let ttsRes: Response;
      try {
        ttsRes = await fetch(`${GEMINI_TTS_URL}?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: replyText }] }],
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } } },
            },
          }),
          signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
        });
      } catch (err) {
        if (isAbortLike(err)) {
          console.error('[remy-chat] Gemini TTS timeout');
          return NextResponse.json({ error: 'Upstream timeout' }, { status: 504 });
        }
        throw err;
      }

      if (!ttsRes.ok) {
        console.error('[remy-chat] Gemini TTS non-OK:', ttsRes.status);
        return NextResponse.json({ error: 'TTS failed' }, { status: 502 });
      }

      const ttsJson = (await ttsRes.json()) as {
        candidates?: Array<{
          content?: { parts?: Array<{ inlineData?: { data: string } }> };
        }>;
      };
      const audioData = ttsJson.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!audioData) return NextResponse.json({ error: 'No audio' }, { status: 502 });

      wav = pcmToWav(Buffer.from(audioData, 'base64'));
      setCachedTts(ttsKey, wav);
    }

    return new NextResponse(wav.buffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'X-Remy-Text': encodeURIComponent(replyText),
      },
    });
  } catch (err) {
    console.error('[remy-chat] Unexpected error:', err instanceof Error ? err.message : 'unknown');
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
