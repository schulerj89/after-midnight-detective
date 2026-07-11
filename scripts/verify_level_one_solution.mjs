import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const test = spawnSync(
  process.execPath,
  [
    resolve(root, 'node_modules/vitest/vitest.mjs'),
    'run',
    'src/game/features/case/LevelOneSolutionPath.test.ts',
    'src/game/features/case/LevelOneAccusation.test.ts',
    'src/game/features/timeline/LevelOneTimeline.test.ts',
    '--reporter=verbose',
  ],
  { cwd: root, encoding: 'utf8' },
);

process.stdout.write(test.stdout ?? '');
process.stderr.write(test.stderr ?? '');
if (test.status !== 0) process.exit(test.status ?? 1);

const proof = JSON.parse(readFileSync(resolve(root, 'docs/qa/2026-07-11-level-one-solution/level-one-solution-proof.json'), 'utf8'));
const expectedSteps = [
  'dlg.miles.first-question',
  'inspect.torn-ledger.first',
  'confront.miles.torn-ledger',
  'dlg.vera.followup.torn-ledger',
  'dlg.miles.followup.missing-key',
  'witness.variant.miles-office-check',
  'accusation.solved',
];
if (proof.status !== 'solved' || JSON.stringify(proof.steps) !== JSON.stringify(expectedSteps)) {
  throw new Error('Browser solve proof does not match the canonical Level 1 path');
}

for (const reportPath of proof.screenshotReports) {
  const report = JSON.parse(readFileSync(resolve(root, reportPath), 'utf8'));
  if (report.status !== 'pass') throw new Error(`Screenshot QA failed: ${reportPath}`);
}

console.log('\nLEVEL 1 SOLUTION VERIFIED');
console.log(`Steps: ${proof.steps.length}`);
console.log(`Outcome: ${proof.status}`);
console.log(`Debug route: ${proof.debugRoute}`);
