import { describe, expect, it } from 'vitest';
import { solveLevelOneCase } from './LevelOneSolutionPath';

describe('LevelOne canonical solution path', () => {
  it('takes the authored interaction steps and reaches the solved outcome', () => {
    const proof = solveLevelOneCase();
    expect(proof.steps).toEqual([
      'dlg.miles.first-question',
      'inspect.torn-ledger.first',
      'confront.miles.torn-ledger',
      'dlg.vera.followup.torn-ledger',
      'dlg.miles.followup.missing-key',
      'witness.variant.miles-office-check',
      'accusation.solved',
    ]);
    expect(proof.state.has('outcome.level-one-solved')).toBe(true);
    expect(proof.result.status).toBe('solved');
  });
});
