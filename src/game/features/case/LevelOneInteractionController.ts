import type { LevelOneInteractionVariant } from '../../../content/cases/levelOneCaseContent';
import type { LevelOneCaseState } from './LevelOneCaseState';

export type InteractionCloseReason = 'completed' | 'dismissed';

export function applyLevelOneInteractionClose(
  state: LevelOneCaseState,
  variant: LevelOneInteractionVariant,
  reason: InteractionCloseReason,
): readonly string[] {
  return reason === 'completed' ? state.complete(variant.script.id, variant.effects) : [];
}
