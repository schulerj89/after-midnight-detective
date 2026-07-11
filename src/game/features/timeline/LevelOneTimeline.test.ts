import { describe, expect, it } from 'vitest';
import { LevelOneTimeline, LEVEL_ONE_LOOP_DURATION_MS } from './LevelOneTimeline';

describe('LevelOneTimeline', () => {
  it('repeats a deterministic baseline loop', () => {
    const timeline = new LevelOneTimeline();
    expect(timeline.update(4_000, false).map((beat) => beat.id)).toEqual([
      'baseline.vera-desk',
      'baseline.miles-windows',
    ]);
    timeline.update(LEVEL_ONE_LOOP_DURATION_MS, false);
    expect(timeline.snapshot().loop).toBe(2);
  });

  it('emits the office deviation only on a later armed loop', () => {
    const timeline = new LevelOneTimeline();
    expect(timeline.update(8_000, true).some((beat) => beat.variant)).toBe(false);
    timeline.replay();
    expect(timeline.update(12_000, true).map((beat) => beat.id)).toEqual([
      'baseline.vera-desk',
      'baseline.miles-windows',
      'variant.miles-office-check',
      'variant.miles-office-return',
    ]);
  });

  it('can pause without advancing', () => {
    const timeline = new LevelOneTimeline();
    timeline.setRunning(false);
    expect(timeline.update(10_000, true)).toEqual([]);
    expect(timeline.snapshot().elapsedMs).toBe(0);
  });
});
