import { describe, expect, it } from 'vitest';
import { CaseClosedFinale } from './CaseClosedFinale';

describe('CaseClosedFinale', () => {
  it('is locked when the case is not solved', () => {
    expect(new CaseClosedFinale(false, 17).snapshot().status).toBe('locked');
  });

  it('settles and returns without changing case knowledge', () => {
    const finale = new CaseClosedFinale(true, 23);
    expect(finale.snapshot().status).toBe('playing');
    finale.settle();
    expect(finale.snapshot(23)).toMatchObject({ status: 'settled', knowledgeCountAtStart: 23, knowledgeCount: 23 });
    finale.returnToCase();
    expect(finale.snapshot(23).status).toBe('returned');
  });
});
