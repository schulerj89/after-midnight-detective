import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const test = spawnSync(
  process.execPath,
  [
    resolve(root, 'node_modules/vitest/vitest.mjs'),
    'run',
    'src/game/features/case/LevelOneReenactment.test.ts',
    'src/game/features/case/LevelOneSolutionPath.test.ts',
    '--reporter=verbose',
  ],
  { cwd: root, encoding: 'utf8' },
);

process.stdout.write(test.stdout ?? '');
process.stderr.write(test.stderr ?? '');
if (test.status !== 0) process.exit(test.status ?? 1);

const proof = JSON.parse(readFileSync(resolve(root, 'docs/qa/2026-07-11-level-one-reenactment/reenactment-proof.json'), 'utf8'));
const expected = [
  'reconstruction.title',
  'reconstruction.window-alibi',
  'reconstruction.key-ledger',
  'reconstruction.room-317-door',
  'reconstruction.office-deviation',
  'reconstruction.finale',
];
if (proof.status !== 'completed' || JSON.stringify(proof.beats.map((beat) => beat.id)) !== JSON.stringify(expected)) {
  throw new Error('Reenactment proof does not match the canonical six-beat sequence');
}
if (proof.beats.some((beat) => !beat.provenance || beat.basisIds.length === 0)) {
  throw new Error('Every reenactment beat must declare provenance and evidence basis');
}
for (const reportPath of proof.screenshotReports) {
  const report = JSON.parse(readFileSync(resolve(root, reportPath), 'utf8'));
  if (report.status !== 'pass') throw new Error(`Screenshot QA failed: ${reportPath}`);
}

console.log('\nLEVEL 1 RECONSTRUCTION VERIFIED');
console.log(`Beats: ${proof.beats.length}`);
console.log(`Duration: ${proof.durationMs}ms`);
console.log(`Debug route: ${proof.debugRoute}`);
