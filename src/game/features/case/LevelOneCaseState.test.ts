import { describe, expect, it } from 'vitest';
import { resolveLevelOneInteraction } from '../../../content/cases/levelOneCaseContent';
import { LevelOneCaseState } from './LevelOneCaseState';

function completeTarget(state: LevelOneCaseState, targetId: string): string {
  const variant = resolveLevelOneInteraction(targetId, state);
  if (!variant) throw new Error(`No variant for ${targetId}`);
  state.complete(variant.script.id, variant.effects);
  return variant.script.id;
}

describe('LevelOneCaseState', () => {
  it('keeps effects idempotent', () => {
    const state = new LevelOneCaseState();
    const variant = resolveLevelOneInteraction('clue.torn-ledger', state);
    if (!variant) throw new Error('missing ledger interaction');
    expect(state.complete(variant.script.id, variant.effects)).toHaveLength(3);
    expect(state.complete(variant.script.id, variant.effects)).toEqual([]);
    expect(state.snapshot().evidenceCount).toBe(1);
  });

  it('requires Miles to deny Room 317 before the ledger confrontation', () => {
    const state = new LevelOneCaseState();
    completeTarget(state, 'clue.torn-ledger');
    expect(resolveLevelOneInteraction('npc.miles', state)?.id).toBe('dlg.miles.first-question');
    completeTarget(state, 'npc.miles');
    expect(resolveLevelOneInteraction('npc.miles', state)?.id).toBe('confront.miles.torn-ledger');
  });

  it('unlocks Vera and then the missing-key response from Miles', () => {
    const state = new LevelOneCaseState();
    completeTarget(state, 'clue.torn-ledger');
    completeTarget(state, 'npc.miles');
    completeTarget(state, 'npc.miles');
    expect(resolveLevelOneInteraction('npc.vera', state)?.id).toBe('dlg.vera.followup.torn-ledger');
    completeTarget(state, 'npc.vera');
    expect(resolveLevelOneInteraction('npc.miles', state)?.id).toBe('dlg.miles.followup.missing-key');
    completeTarget(state, 'npc.miles');
    expect(state.has('variant.miles.checks-office-next-loop')).toBe(true);
  });

  it('allows physical clues in any order', () => {
    const state = new LevelOneCaseState();
    ['clue.stopped-watch', 'clue.switchboard-log', 'clue.wet-footprints', 'clue.damp-matchbook'].forEach((id) => completeTarget(state, id));
    expect(state.snapshot().evidenceCount).toBe(4);
  });

  it('selects repeat text after a clue is complete', () => {
    const state = new LevelOneCaseState();
    completeTarget(state, 'clue.stopped-watch');
    expect(resolveLevelOneInteraction('clue.stopped-watch', state)?.id).toBe('inspect.clue.stopped-watch.repeat');
  });

  it('preserves the last unlock after completing effect-free repeat text', () => {
    const state = new LevelOneCaseState();
    completeTarget(state, 'clue.stopped-watch');
    const lastUnlock = state.snapshot().lastUnlock;
    completeTarget(state, 'clue.stopped-watch');
    expect(state.snapshot().lastUnlock).toBe(lastUnlock);
  });

  it('does not manufacture repeat text for unknown clues', () => {
    expect(resolveLevelOneInteraction('clue.unknown-placeholder', new LevelOneCaseState())).toBeUndefined();
  });

  it('records Officer Hale testimony and then serves repeat text', () => {
    const state = new LevelOneCaseState();
    expect(resolveLevelOneInteraction('npc.officer', state)?.id).toBe('dlg.officer.first-question');
    completeTarget(state, 'npc.officer');
    expect(state.has('statement.officer.exits-sealed')).toBe(true);
    expect(resolveLevelOneInteraction('npc.officer', state)?.id).toBe('dlg.officer.repeat');
  });
});
