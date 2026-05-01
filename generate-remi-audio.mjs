import { writeFileSync, mkdirSync } from 'fs';
import { readFileSync } from 'fs';
import { existsSync } from 'fs';

const apiKey = readFileSync('/Users/michaelkraft/done-deal-site/.env.local', 'utf8')
  .split('\n')
  .find(l => l.startsWith('GOOGLE_AI_API_KEY='))
  ?.split('=')[1]?.trim();

if (!apiKey) { console.error('No GOOGLE_AI_API_KEY found'); process.exit(1); }

const AUDIO_DIR = '/Users/michaelkraft/done-deal-site/public/remi';
mkdirSync(AUDIO_DIR, { recursive: true });

const SCRIPTS = [
  {
    file: 'remi-intro.wav',
    text: "Hi! I'm Reme, your AI transaction coordinator with Done Deal. I manage your entire workflow from contract acceptance through closing — calculating Colorado deadlines from your MEC date, drafting emails to lenders, inspectors, and title, and keeping every party informed. You review and approve everything before it goes out. When you hand over your transaction to me, it's a done deal.",
  },
  {
    file: 'remi-qa-deadlines.wav',
    text: "I calculate every MEC-based Colorado deadline automatically — inspection objection, appraisal, loan conditions, association documents, title, and your closing date. I track both business day and calendar day deadlines and send you reminders before anything comes due.",
  },
  {
    file: 'remi-qa-emails.wav',
    text: "I draft all transaction emails — congratulations to your clients, status updates to lenders and title, inspection coordination, and closing instructions. Each draft appears in your approval feed. Nothing sends without your sign-off.",
  },
  {
    file: 'remi-qa-hoa.wav',
    text: "When a property has an HOA, I automatically track the CC&Rs, financial statements, board minutes, and rules and regulations. I monitor their status and remind you when the review deadline is approaching — typically within seven business days of MEC.",
  },
];

function pcmToWav(pcmBase64) {
  const pcm = Buffer.from(pcmBase64, 'base64');
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcm.length;
  const headerSize = 44;
  const wav = Buffer.alloc(headerSize + dataSize);
  let o = 0;
  wav.write('RIFF', o); o += 4;
  wav.writeUInt32LE(36 + dataSize, o); o += 4;
  wav.write('WAVE', o); o += 4;
  wav.write('fmt ', o); o += 4;
  wav.writeUInt32LE(16, o); o += 4;
  wav.writeUInt16LE(1, o); o += 2;
  wav.writeUInt16LE(numChannels, o); o += 2;
  wav.writeUInt32LE(sampleRate, o); o += 4;
  wav.writeUInt32LE(byteRate, o); o += 4;
  wav.writeUInt16LE(blockAlign, o); o += 2;
  wav.writeUInt16LE(bitsPerSample, o); o += 2;
  wav.write('data', o); o += 4;
  wav.writeUInt32LE(dataSize, o); o += 4;
  pcm.copy(wav, o);
  return wav;
}

for (const { file, text } of SCRIPTS) {
  const outPath = `${AUDIO_DIR}/${file}`;
  if (existsSync(outPath)) {
    console.log(`Skipping ${file} (already exists)`);
    continue;
  }
  process.stdout.write(`Generating ${file}...`);
  const start = Date.now();
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } } },
        },
      }),
    }
  );
  const json = await res.json();
  if (json.error) { console.log(`\n  ERROR: ${json.error.message}`); continue; }
  const pcmBase64 = json.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!pcmBase64) { console.log('\n  ERROR: no audio data'); continue; }
  const wav = pcmToWav(pcmBase64);
  writeFileSync(outPath, wav);
  console.log(` done (${((Date.now() - start) / 1000).toFixed(1)}s, ${(wav.length / 1024).toFixed(0)}KB)`);
}

console.log('\nAll audio files ready in public/remi/');
