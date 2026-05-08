import { NextRequest, NextResponse } from 'next/server';

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

interface Message {
  role: 'user' | 'assistant';
  content: string;
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

export async function POST(request: NextRequest) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

  const { userText, history } = (await request.json()) as {
    userText: string;
    history: Message[];
  };

  if (!userText?.trim()) {
    return NextResponse.json({ error: 'userText required' }, { status: 400 });
  }

  // Build Gemini conversation contents
  const contents = [
    ...history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: userText }] },
  ];

  // 1. Get text response from Gemini Flash
  const chatRes = await fetch(`${GEMINI_CHAT_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
    }),
  });

  if (!chatRes.ok) {
    console.error('[remy-chat] Gemini chat error:', await chatRes.text());
    return NextResponse.json({ error: 'Chat failed' }, { status: 502 });
  }

  const chatJson = (await chatRes.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const replyText = chatJson.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (!replyText) return NextResponse.json({ error: 'Empty response' }, { status: 502 });

  // 2. Convert reply to speech (Aoede voice, same as VoiceDemo)
  const ttsRes = await fetch(`${GEMINI_TTS_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: replyText }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } } },
      },
    }),
  });

  if (!ttsRes.ok) {
    console.error('[remy-chat] TTS error:', await ttsRes.text());
    return NextResponse.json({ error: 'TTS failed' }, { status: 502 });
  }

  const ttsJson = (await ttsRes.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ inlineData?: { data: string } }> };
    }>;
  };
  const audioData = ttsJson.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audioData) return NextResponse.json({ error: 'No audio' }, { status: 502 });

  const wav = pcmToWav(Buffer.from(audioData, 'base64'));

  return new NextResponse(wav.buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'audio/wav',
      'X-Remy-Text': encodeURIComponent(replyText),
    },
  });
}
