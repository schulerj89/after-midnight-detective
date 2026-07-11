import { LEVEL_ONE_REENACTMENT_BEATS, type LevelOneReenactmentBeat } from '../../../content/cases/levelOneReenactmentContent';
import type { LevelOneCaseState } from './LevelOneCaseState';

export type ReenactmentStatus = 'locked' | 'playing' | 'paused' | 'completed' | 'skipped';

export interface LevelOneReenactmentSnapshot {
  status: ReenactmentStatus;
  beatIndex: number;
  beatId: string | null;
  elapsedBeatMs: number;
  replayCount: number;
}

export interface ReenactmentUpdate {
  entered: readonly LevelOneReenactmentBeat[];
  finished: boolean;
}

export class LevelOneReenactment {
  private status: ReenactmentStatus = 'locked';
  private beatIndex = -1;
  private elapsedBeatMs = 0;
  private replayCount = 0;

  constructor(private readonly state: LevelOneCaseState) {}

  start(beatId?: string): LevelOneReenactmentBeat | null {
    if (!this.state.has('outcome.level-one-solved')) return null;
    const requestedIndex = beatId ? LEVEL_ONE_REENACTMENT_BEATS.findIndex((beat) => beat.id === beatId) : 0;
    if (requestedIndex < 0) throw new Error(`Unknown reenactment beat: ${beatId}`);
    if (this.status === 'completed' || this.status === 'skipped') this.replayCount += 1;
    this.status = 'playing';
    this.beatIndex = requestedIndex;
    this.elapsedBeatMs = 0;
    return LEVEL_ONE_REENACTMENT_BEATS[this.beatIndex] ?? null;
  }

  update(deltaMs: number): ReenactmentUpdate {
    if (this.status !== 'playing' || deltaMs <= 0) return { entered: [], finished: false };
    const entered: LevelOneReenactmentBeat[] = [];
    let remaining = deltaMs;
    while (remaining > 0 && this.status === 'playing') {
      const beat = LEVEL_ONE_REENACTMENT_BEATS[this.beatIndex];
      if (!beat) break;
      const step = Math.min(remaining, beat.durationMs - this.elapsedBeatMs);
      this.elapsedBeatMs += step;
      remaining -= step;
      if (this.elapsedBeatMs >= beat.durationMs) {
        this.beatIndex += 1;
        this.elapsedBeatMs = 0;
        const next = LEVEL_ONE_REENACTMENT_BEATS[this.beatIndex];
        if (next) entered.push(next);
        else this.status = 'completed';
      }
    }
    return { entered, finished: this.status === 'completed' };
  }

  togglePause(): ReenactmentStatus {
    if (this.status === 'playing') this.status = 'paused';
    else if (this.status === 'paused') this.status = 'playing';
    return this.status;
  }

  skip(): void {
    if (this.status === 'playing' || this.status === 'paused') this.status = 'skipped';
  }

  snapshot(): LevelOneReenactmentSnapshot {
    return {
      status: this.status,
      beatIndex: this.beatIndex,
      beatId: LEVEL_ONE_REENACTMENT_BEATS[this.beatIndex]?.id ?? null,
      elapsedBeatMs: this.elapsedBeatMs,
      replayCount: this.replayCount,
    };
  }
}

export function validateLevelOneReenactmentBasis(state: LevelOneCaseState): readonly string[] {
  return LEVEL_ONE_REENACTMENT_BEATS.flatMap((beat) =>
    beat.basisIds.filter((basisId) => !state.has(basisId)).map((basisId) => `${beat.id}:${basisId}`),
  );
}

