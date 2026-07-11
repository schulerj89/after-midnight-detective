import { describe, expect, it } from 'vitest';
import { LevelOneCaseState } from './LevelOneCaseState';
import { evaluateLevelOneAccusation, LEVEL_ONE_CORRECT_DRAFT } from './LevelOneAccusation';

function readyState(): LevelOneCaseState {
  const state = new LevelOneCaseState();
  state.record('test', ['evidence.torn-ledger', 'contradiction.miles-denied-317', 'timeline.miles-office-deviation']);
  return state;
}

describe('evaluateLevelOneAccusation', () => {
  it('rejects a theory before the required knowledge is witnessed', () => {
    expect(evaluateLevelOneAccusation(LEVEL_ONE_CORRECT_DRAFT, new LevelOneCaseState()).status).toBe('not-ready');
  });

  it('rejects the wrong suspect with recoverable feedback', () => {
    expect(evaluateLevelOneAccusation({ ...LEVEL_ONE_CORRECT_DRAFT, suspectId: 'npc.vera' }, readyState()).status).toBe('wrong-suspect');
  });

  it('rejects Miles without the correct reasoning links', () => {
    expect(evaluateLevelOneAccusation({ ...LEVEL_ONE_CORRECT_DRAFT, evidenceId: 'evidence.wet-footprints' }, readyState()).status).toBe('unsupported');
  });

  it('solves only the complete explanation', () => {
    expect(evaluateLevelOneAccusation(LEVEL_ONE_CORRECT_DRAFT, readyState()).status).toBe('solved');
  });
});
