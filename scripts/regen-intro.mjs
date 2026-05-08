// Regenerates /public/remi/remi-intro.wav with correct "Remy" pronunciation
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.GOOGLE_AI_API_KEY;

if (!API_KEY) {
  console.error('Set GOOGLE_AI_API_KEY before running this script');
  process.exit(1);
}

const TEXT = "Hi, I'm Remy — Done Deal's AI transaction coordinator. I handle deadlines, paperwork, and emails so agents can focus on their clients. Click a question below to hear how I can help.";

const TTS_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent';

function pcmToWav(pcm) {
  const sampleRate = 24000, numChannels = 1, bitsPerSample = 16;
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

const res = await fetch(`${TTS_URL}?key=${API_KEY}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: TEXT }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } } },
    },
  }),
});

if (!res.ok) {
  console.error('TTS failed:', res.status, await res.text());
  process.exit(1);
}

const json = await res.json();
const part = json.candidates?.[0]?.content?.parts?.[0]?.inlineData;
if (!part?.data) {
  console.error('No audio in response');
  process.exit(1);
}

const mimeType = part.mimeType ?? 'audio/pcm';
const isWav = mimeType.includes('wav');
const audio = Buffer.from(part.data, 'base64');
const output = isWav ? audio : pcmToWav(audio);

const outPath = join(__dirname, '../public/remi/remi-intro.wav');
writeFileSync(outPath, output);
console.log(`Written ${output.length} bytes to ${outPath}`);
console.log('Text used:', TEXT);
