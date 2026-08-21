import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { checkVoiceDemoDailyCap } from '@/lib/voiceDemoUsage';

const GEMINI_TTS_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent';

// Server-side cap on demo input length. Output audio duration (the real TTS
// cost driver, per CLAUDE.md's 2026-08-18 cost audit — $0.00025/sec) roughly
// tracks input length for a read-back demo, so bounding the text also bounds
// worst-case cost per request. 500 chars is generous for a short demo phrase
// while ruling out someone pasting a very long document.
const MAX_TEXT_LENGTH = 500;

// PCM L16 @ 24kHz mono → WAV buffer
function pcmToWav(pcm: Buffer): Buffer {
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcm.length;
  const headerSize = 44;

  const wav = Buffer.alloc(headerSize + dataSize);
  let offset = 0;

  wav.write('RIFF', offset); offset += 4;
  wav.writeUInt32LE(36 + dataSize, offset); offset += 4;
  wav.write('WAVE', offset); offset += 4;
  wav.write('fmt ', offset); offset += 4;
  wav.writeUInt32LE(16, offset); offset += 4;          // PCM chunk size
  wav.writeUInt16LE(1, offset); offset += 2;           // PCM format
  wav.writeUInt16LE(numChannels, offset); offset += 2;
  wav.writeUInt32LE(sampleRate, offset); offset += 4;
  wav.writeUInt32LE(byteRate, offset); offset += 4;
  wav.writeUInt16LE(blockAlign, offset); offset += 2;
  wav.writeUInt16LE(bitsPerSample, offset); offset += 2;
  wav.write('data', offset); offset += 4;
  wav.writeUInt32LE(dataSize, offset); offset += 4;
  pcm.copy(wav, offset);

  return wav;
}

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, 'voice-demo');
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'TTS not configured' }, { status: 503 });
  }

  // Persistent backstop against the in-memory rate limiter resetting on
  // redeploy/restart: a Supabase-backed daily cap per IP. This calls the
  // paid Gemini TTS API below, so it fails closed if usage can't be verified.
  const usage = await checkVoiceDemoDailyCap(getClientIp(request));
  if (!usage.allowed) {
    return NextResponse.json(
      { error: 'Daily usage limit reached. Please try again tomorrow.' },
      { status: 429 }
    );
  }

  try {
    const { text } = await request.json() as { text: string };
    if (!text?.trim()) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }
    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Text is too long (max ${MAX_TEXT_LENGTH} characters).` },
        { status: 400 }
      );
    }

    const res = await fetch(`${GEMINI_TTS_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Aoede' },
            },
          },
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[voice-demo] Gemini TTS error:', err);
      return NextResponse.json({ error: 'TTS generation failed' }, { status: 502 });
    }

    const json = await res.json() as {
      candidates?: Array<{
        content?: { parts?: Array<{ inlineData?: { data: string; mimeType: string } }> };
      }>;
    };

    const inlineData = json.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (!inlineData?.data) {
      return NextResponse.json({ error: 'No audio in response' }, { status: 502 });
    }

    const pcm = Buffer.from(inlineData.data, 'base64');
    const wav = pcmToWav(pcm);

    return new NextResponse(wav.buffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('[voice-demo] Unexpected error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
