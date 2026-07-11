import { describe, expect, it } from 'vitest';
import { resolveLevelOneInteraction } from '../../../content/cases/levelOneCaseContent';
import { LevelOneCaseState } from './LevelOneCaseState';
import { applyLevelOneInteractionClose } from './LevelOneInteractionController';

describe('LevelOneInteractionController', () => {
  it('does not apply clue effects when dialogue is dismissed', () => {
    const state = new LevelOneCaseState();
    const variant = resolveLevelOneInteraction('clue.torn-ledger', state);
    if (!variant) throw new Error('missing ledger interaction');
    expect(applyLevelOneInteractionClose(state, variant, 'dismissed')).toEqual([]);
    expect(state.snapshot().evidenceCount).toBe(0);
    expect(state.snapshot().completedScripts).toEqual([]);
  });

  it('applies effects once only after dialogue completes', () => {
    const state = new LevelOneCaseState();
    const variant = resolveLevelOneInteraction('clue.torn-ledger', state);
    if (!variant) throw new Error('missing ledger interaction');
    expect(applyLevelOneInteractionClose(state, variant, 'completed')).toHaveLength(3);
    expect(applyLevelOneInteractionClose(state, variant, 'completed')).toEqual([]);
    expect(state.snapshot().evidenceCount).toBe(1);
  });
});
