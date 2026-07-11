export interface LevelOneTimelineBeat {
  id: string;
  atMs: number;
  time: string;
  label: string;
  actorId?: string;
  mark?: 'windows' | 'office-door' | 'piano' | 'desk';
  variant?: boolean;
}

export interface LevelOneTimelineSnapshot {
  loop: number;
  elapsedMs: number;
  durationMs: number;
  running: boolean;
  progress: number;
  emittedBeatIds: readonly string[];
}

const BASE_BEATS: readonly LevelOneTimelineBeat[] = [
  { id: 'baseline.vera-desk', atMs: 1_000, time: '12:06', label: 'Vera remains at the front desk.', actorId: 'npc.vera', mark: 'desk' },
  { id: 'baseline.miles-windows', atMs: 4_000, time: '12:08', label: 'Miles waits at the north windows.', actorId: 'npc.miles', mark: 'windows' },
  { id: 'baseline.miles-piano', atMs: 10_000, time: '12:14', label: 'Miles crosses toward the piano as the lights fail.', actorId: 'npc.miles', mark: 'piano' },
  { id: 'baseline.alarm', atMs: 16_000, time: '12:17', label: 'The alarm sounds; Officer Hale seals the exits.' },
];

const VARIANT_BEATS: readonly LevelOneTimelineBeat[] = [
  { id: 'variant.miles-office-check', atMs: 7_000, time: '12:11', label: 'Miles abandons the windows and checks the manager office.', actorId: 'npc.miles', mark: 'office-door', variant: true },
  { id: 'variant.miles-office-return', atMs: 11_000, time: '12:14', label: 'Miles returns from the office with a wet right heel.', actorId: 'npc.miles', mark: 'piano', variant: true },
];

export const LEVEL_ONE_LOOP_DURATION_MS = 20_000;

export class LevelOneTimeline {
  private loop = 1;
  private elapsedMs = 0;
  private running = true;
  private readonly emitted = new Set<string>();

  update(deltaMs: number, variantArmed: boolean): readonly LevelOneTimelineBeat[] {
    if (!this.running || deltaMs <= 0) return [];
    const events: LevelOneTimelineBeat[] = [];
    let remaining = deltaMs;
    while (remaining > 0) {
      const step = Math.min(remaining, LEVEL_ONE_LOOP_DURATION_MS - this.elapsedMs);
      const previous = this.elapsedMs;
      this.elapsedMs += step;
      events.push(...this.eventsBetween(previous, this.elapsedMs, variantArmed));
      remaining -= step;
      if (this.elapsedMs >= LEVEL_ONE_LOOP_DURATION_MS) this.beginNextLoop();
    }
    return events;
  }

  replay(): void {
    this.beginNextLoop();
  }

  setRunning(running: boolean): void {
    this.running = running;
  }

  snapshot(): LevelOneTimelineSnapshot {
    return {
      loop: this.loop,
      elapsedMs: this.elapsedMs,
      durationMs: LEVEL_ONE_LOOP_DURATION_MS,
      running: this.running,
      progress: this.elapsedMs / LEVEL_ONE_LOOP_DURATION_MS,
      emittedBeatIds: [...this.emitted],
    };
  }

  private eventsBetween(previous: number, current: number, variantArmed: boolean): readonly LevelOneTimelineBeat[] {
    const beats = variantArmed && this.loop >= 2 ? [...BASE_BEATS, ...VARIANT_BEATS] : BASE_BEATS;
    return beats
      .filter((beat) => beat.atMs > previous && beat.atMs <= current && !this.emitted.has(beat.id))
      .sort((a, b) => a.atMs - b.atMs)
      .map((beat) => {
        this.emitted.add(beat.id);
        return beat;
      });
  }

  private beginNextLoop(): void {
    this.loop += 1;
    this.elapsedMs = 0;
    this.emitted.clear();
  }
}
