import { describe, expect, it } from 'vitest';
import { resolveCaseClosedLayout } from './CaseClosedLayout';

describe('resolveCaseClosedLayout', () => {
  it('fills and centers the standard desktop stage', () => {
    expect(resolveCaseClosedLayout(1_280)).toEqual({
      stageWidth: 1_280,
      stageCenterX: 640,
      cellWidth: 793.6,
      entranceX: 441.6,
    });
  });

  it('uses the full extra-wide stage and caps the jail width', () => {
    expect(resolveCaseClosedLayout(1_800)).toEqual({
      stageWidth: 1_800,
      stageCenterX: 900,
      cellWidth: 1_080,
      entranceX: 660,
    });
  });

  it('never shrinks below the authored stage width', () => {
    expect(resolveCaseClosedLayout(900).stageWidth).toBe(1_280);
  });
});
