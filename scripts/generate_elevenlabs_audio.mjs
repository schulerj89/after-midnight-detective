import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const manifestPath = resolve(root, 'docs/audio/level-one-elevenlabs-manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const apiKey = process.env.ELEVENLABS_API_KEY ?? process.env.ELEVEN_LABS_API_KEY;
const force = process.argv.includes('--force');

if (!apiKey) throw new Error('ELEVENLABS_API_KEY was not injected by the secret broker');

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function generate(entry, kind) {
  const outputPath = resolve(root, entry.file);
  if (!force && await exists(outputPath)) {
    console.log(`skip ${entry.id} (already exists)`);
    return;
  }

  const isMusic = kind === 'music';
  const endpoint = isMusic
    ? `https://api.elevenlabs.io/v1/music?output_format=${entry.outputFormat}`
    : `https://api.elevenlabs.io/v1/sound-generation?output_format=${entry.outputFormat}`;
  const body = isMusic
    ? { prompt: entry.prompt, music_length_ms: entry.durationMs, force_instrumental: true, model_id: 'music_v1' }
    : { text: entry.prompt, duration_seconds: entry.durationSeconds, prompt_influence: 0.55, model_id: 'eleven_text_to_sound_v2' };

  console.log(`generate ${entry.id}`);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const message = (await response.text()).slice(0, 500);
    throw new Error(`${entry.id} failed (${response.status}): ${message}`);
  }

  const audio = new Uint8Array(await response.arrayBuffer());
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, audio);
  console.log(`saved ${entry.file} (${audio.byteLength} bytes)`);
}

for (const entry of manifest.music) await generate(entry, 'music');
for (const entry of manifest.sfx) await generate(entry, 'sfx');
console.log('ElevenLabs audio generation complete');
