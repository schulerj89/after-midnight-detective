import { describe, expect, it } from 'vitest';
import { FocusNavigator } from './FocusNavigator';

describe('FocusNavigator', () => {
  it('starts on the first authored target', () => {
    const focus = new FocusNavigator(['vera', 'matchbook', 'miles'] as const);
    expect(focus.selected()).toBe('vera');
  });

  it('moves next and wraps to the first target', () => {
    const focus = new FocusNavigator(['vera', 'matchbook', 'miles'] as const);
    expect(focus.next()).toBe('matchbook');
    expect(focus.next()).toBe('miles');
    expect(focus.next()).toBe('vera');
  });

  it('moves previous and wraps to the last target', () => {
    const focus = new FocusNavigator(['vera', 'matchbook', 'miles'] as const);
    expect(focus.previous()).toBe('miles');
    expect(focus.previous()).toBe('matchbook');
  });

  it('selects a known target and rejects an unknown target', () => {
    const focus = new FocusNavigator<string>(['vera', 'matchbook', 'miles']);
    expect(focus.select('matchbook')).toBe('matchbook');
    expect(() => focus.select('door')).toThrow(/Unknown focus target/);
  });
});
