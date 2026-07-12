import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const manifest = JSON.parse(await readFile(resolve(root, 'docs/audio/level-one-elevenlabs-manifest.json'), 'utf8'));
const entries = [...manifest.music, ...manifest.sfx];
let totalBytes = 0;

for (const entry of entries) {
  const path = resolve(root, entry.file);
  const info = await stat(path);
  const head = await readFile(path).then((bytes) => bytes.subarray(0, 3).toString('ascii'));
  if (head !== 'ID3' || info.size < 1_000) throw new Error(`${entry.id} is not a valid shipped audio file`);
  totalBytes += info.size;
  console.log(`${entry.id}: ${info.size} bytes`);
}

if (entries.length !== 6) throw new Error(`Expected 6 audio assets, found ${entries.length}`);
if (totalBytes > 2_500_000) throw new Error(`Audio budget exceeded: ${totalBytes} bytes`);
console.log(`AUDIO ASSETS VERIFIED: ${entries.length} files, ${totalBytes} bytes`);
