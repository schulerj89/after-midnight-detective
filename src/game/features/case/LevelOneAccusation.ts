import type { LevelOneCaseState } from './LevelOneCaseState';

export interface LevelOneAccusationDraft {
  suspectId: string | null;
  evidenceId: string | null;
  contradictionId: string | null;
  timelineFactId: string | null;
}

export type LevelOneAccusationStatus = 'not-ready' | 'wrong-suspect' | 'unsupported' | 'solved';

export interface LevelOneAccusationResult {
  status: LevelOneAccusationStatus;
  message: string;
  missing: readonly string[];
}

export const LEVEL_ONE_CORRECT_DRAFT: LevelOneAccusationDraft = {
  suspectId: 'npc.miles',
  evidenceId: 'evidence.torn-ledger',
  contradictionId: 'contradiction.miles-denied-317',
  timelineFactId: 'timeline.miles-office-deviation',
};

const REQUIRED_KNOWLEDGE = [
  'evidence.torn-ledger',
  'contradiction.miles-denied-317',
  'timeline.miles-office-deviation',
] as const;

export function evaluateLevelOneAccusation(
  draft: LevelOneAccusationDraft,
  state: LevelOneCaseState,
): LevelOneAccusationResult {
  const missingKnowledge = REQUIRED_KNOWLEDGE.filter((flag) => !state.has(flag));
  if (missingKnowledge.length > 0) {
    return {
      status: 'not-ready',
      message: 'The theory outruns the notebook. Witness the altered loop and connect Miles to Room 317.',
      missing: missingKnowledge,
    };
  }
  if (draft.suspectId !== LEVEL_ONE_CORRECT_DRAFT.suspectId) {
    return {
      status: 'wrong-suspect',
      message: 'That suspect does not fit the key record and the altered office route.',
      missing: ['suspect'],
    };
  }
  const weak = (['evidenceId', 'contradictionId', 'timelineFactId'] as const)
    .filter((key) => draft[key] !== LEVEL_ONE_CORRECT_DRAFT[key]);
  if (weak.length > 0) {
    return {
      status: 'unsupported',
      message: `Miles is plausible, but the explanation is unsupported: ${weak.join(', ')}.`,
      missing: weak,
    };
  }
  return {
    status: 'solved',
    message: 'Miles lied about Room 317. The ledger ties him to its key, and his altered office route exposes the missing-key cover-up.',
    missing: [],
  };
}
