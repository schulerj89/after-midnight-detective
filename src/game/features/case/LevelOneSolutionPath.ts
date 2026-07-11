import { resolveLevelOneInteraction } from '../../../content/cases/levelOneCaseContent';
import { evaluateLevelOneAccusation, LEVEL_ONE_CORRECT_DRAFT, type LevelOneAccusationResult } from './LevelOneAccusation';
import { LevelOneCaseState } from './LevelOneCaseState';

export interface LevelOneSolutionProof {
  state: LevelOneCaseState;
  steps: readonly string[];
  result: LevelOneAccusationResult;
}

export function solveLevelOneCase(): LevelOneSolutionProof {
  const state = new LevelOneCaseState();
  const steps: string[] = [];
  const complete = (targetId: string) => {
    const variant = resolveLevelOneInteraction(targetId, state);
    if (!variant) throw new Error(`Solution path cannot resolve ${targetId}`);
    state.complete(variant.script.id, variant.effects);
    steps.push(variant.script.id);
  };

  complete('npc.miles');
  complete('clue.torn-ledger');
  complete('npc.miles');
  complete('npc.vera');
  complete('npc.miles');
  if (!state.has('variant.miles.checks-office-next-loop')) {
    throw new Error('Solution path failed to arm the altered loop');
  }
  state.record('variant.miles-office-check', [
    'observation.miles-office-check',
    'timeline.miles-office-deviation',
  ]);
  steps.push('witness.variant.miles-office-check');
  const result = evaluateLevelOneAccusation(LEVEL_ONE_CORRECT_DRAFT, state);
  if (result.status === 'solved') state.record('accusation', ['outcome.level-one-solved']);
  steps.push(`accusation.${result.status}`);
  return { state, steps, result };
}
