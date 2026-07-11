import { describe, expect, it } from 'vitest';
import { gateTransitionInput } from './TransitionInputGate';

describe('transition input gate', () => {
  it('keeps the release lock latched throughout a transition', () => {
    expect(gateTransitionInput({ x: 1, y: 0 }, true, false, true)).toEqual({
      vector: { x: 0, y: 0 },
      requiresNeutral: true,
    });
  });

  it('still blocks a held direction after the fade completes', () => {
    expect(gateTransitionInput({ x: 1, y: 0 }, false, false, true).requiresNeutral).toBe(true);
  });

  it('clears the lock only after idle input returns to neutral', () => {
    expect(gateTransitionInput({ x: 0, y: 0 }, false, false, true)).toEqual({
      vector: { x: 0, y: 0 },
      requiresNeutral: false,
    });
  });
});
