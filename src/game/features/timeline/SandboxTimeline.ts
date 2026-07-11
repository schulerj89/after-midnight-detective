export interface TimelineEvent {
  id: string;
  atMs: number;
}

export interface TimelineSnapshot {
  durationMs: number;
  elapsedMs: number;
  loop: number;
  running: boolean;
  progress: number;
}

export class SandboxTimeline {
  private elapsedMs = 0;
  private loop = 1;
  private running = true;

  constructor(
    private readonly durationMs: number,
    private readonly events: readonly TimelineEvent[],
  ) {
    if (durationMs <= 0) {
      throw new Error('Timeline duration must be greater than zero.');
    }

    if (events.some((event) => event.atMs <= 0 || event.atMs >= durationMs)) {
      throw new Error('Timeline events must occur inside the loop duration.');
    }
  }

  update(deltaMs: number): TimelineEvent[] {
    if (!this.running || deltaMs <= 0) {
      return [];
    }

    const fired: TimelineEvent[] = [];
    let remaining = deltaMs;

    while (remaining > 0) {
      const untilLoopEnd = this.durationMs - this.elapsedMs;
      const step = Math.min(remaining, untilLoopEnd);
      const nextElapsed = this.elapsedMs + step;

      fired.push(
        ...this.events.filter(
          (event) => event.atMs > this.elapsedMs && event.atMs <= nextElapsed,
        ),
      );

      this.elapsedMs = nextElapsed;
      remaining -= step;

      if (this.elapsedMs >= this.durationMs) {
        this.elapsedMs = 0;
        this.loop += 1;
      }
    }

    return fired;
  }

  setRunning(running: boolean): void {
    this.running = running;
  }

  reset(): void {
    this.elapsedMs = 0;
    this.loop = 1;
    this.running = true;
  }

  snapshot(): TimelineSnapshot {
    return {
      durationMs: this.durationMs,
      elapsedMs: this.elapsedMs,
      loop: this.loop,
      running: this.running,
      progress: this.elapsedMs / this.durationMs,
    };
  }
}
