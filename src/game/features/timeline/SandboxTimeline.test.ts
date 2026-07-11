import { describe, expect, it } from 'vitest';
import { SandboxTimeline } from './SandboxTimeline';

const events = [
  { id: 'first', atMs: 100 },
  { id: 'second', atMs: 700 },
] as const;

describe('SandboxTimeline', () => {
  it('fires deterministic events as time crosses them', () => {
    const timeline = new SandboxTimeline(1_000, events);

    expect(timeline.update(99)).toEqual([]);
    expect(timeline.update(2)).toEqual([{ id: 'first', atMs: 100 }]);
    expect(timeline.update(600)).toEqual([{ id: 'second', atMs: 700 }]);
  });

  it('does not advance while paused', () => {
    const timeline = new SandboxTimeline(1_000, events);
    timeline.update(50);
    timeline.setRunning(false);

    expect(timeline.update(500)).toEqual([]);
    expect(timeline.snapshot().elapsedMs).toBe(50);
  });

  it('loops, fires events across a boundary, and resets', () => {
    const timeline = new SandboxTimeline(1_000, events);

    expect(timeline.update(1_150).map((event) => event.id)).toEqual([
      'first',
      'second',
      'first',
    ]);
    expect(timeline.snapshot()).toMatchObject({ loop: 2, elapsedMs: 150 });

    timeline.reset();
    expect(timeline.snapshot()).toMatchObject({
      loop: 1,
      elapsedMs: 0,
      running: true,
      progress: 0,
    });
  });

  it('rejects events outside the loop', () => {
    expect(() => new SandboxTimeline(1_000, [{ id: 'bad', atMs: 1_000 }])).toThrow(
      /inside the loop/,
    );
  });
});
