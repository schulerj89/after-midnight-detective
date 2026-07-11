export type AlteredLoopPhaseId =
  | 'reset'
  | 'establish'
  | 'anticipate'
  | 'transit-1'
  | 'transit-2'
  | 'arrived'
  | 'recorded'
  | 'released';

export type AlteredLoopActorMark = 'windows' | 'center-aisle' | 'office-door';

export interface AlteredLoopPhase {
  id: AlteredLoopPhaseId;
  durationMs: number;
  time: string;
  heading: string;
  caption: string;
  actorMark: AlteredLoopActorMark;
  recordsObservation?: boolean;
}

export const ALTERED_LOOP_PHASES: readonly AlteredLoopPhase[] = [
  { id: 'reset', durationMs: 220, time: 'ALTERED LOOP', heading: 'RESETTING THE STAGE', caption: 'LIVE OBSERVATION', actorMark: 'windows' },
  { id: 'establish', durationMs: 1_200, time: '12:08', heading: 'MILES — NORTH WINDOWS', caption: 'His claimed post.', actorMark: 'windows' },
  { id: 'anticipate', durationMs: 800, time: '12:11', heading: 'MILES LEAVES HIS CLAIMED POST', caption: 'Watch where he goes.', actorMark: 'windows' },
  { id: 'transit-1', durationMs: 2_600, time: '12:11', heading: 'CENTER AISLE', caption: 'Miles crosses the lounge instead of holding his alibi.', actorMark: 'center-aisle' },
  { id: 'transit-2', durationMs: 2_600, time: '12:12', heading: 'MANAGER OFFICE', caption: 'The office door becomes his destination.', actorMark: 'office-door' },
  { id: 'arrived', durationMs: 1_300, time: '12:13', heading: 'MANAGER OFFICE', caption: 'Not the north windows.', actorMark: 'office-door' },
  { id: 'recorded', durationMs: 2_500, time: 'OBSERVATION RECORDED', heading: 'MILES CHECKED THE OFFICE', caption: 'Added to CASE > TIMELINE.', actorMark: 'office-door', recordsObservation: true },
  { id: 'released', durationMs: 400, time: 'ALTERED LOOP', heading: 'LIVE OBSERVATION COMPLETE', caption: 'Control restored.', actorMark: 'office-door' },
] as const;

export type AlteredLoopRestageStatus = 'idle' | 'playing' | 'completed' | 'ended';

export interface AlteredLoopRestageSnapshot {
  status: AlteredLoopRestageStatus;
  phaseIndex: number;
  phaseId: AlteredLoopPhaseId | null;
  phaseElapsedMs: number;
  actorMark: AlteredLoopActorMark | null;
  replayCount: number;
}

export class AlteredLoopRestage {
  private status: AlteredLoopRestageStatus = 'idle';
  private phaseIndex = -1;
  private phaseElapsedMs = 0;
  private replayCount = 0;

  start(phaseId: AlteredLoopPhaseId = 'reset'): AlteredLoopPhase {
    const index = ALTERED_LOOP_PHASES.findIndex((phase) => phase.id === phaseId);
    if (index < 0) throw new Error(`Unknown altered-loop phase: ${phaseId}`);
    if (this.status === 'completed' || this.status === 'ended') this.replayCount += 1;
    this.status = 'playing';
    this.phaseIndex = index;
    this.phaseElapsedMs = 0;
    return ALTERED_LOOP_PHASES[index];
  }

  update(deltaMs: number): { entered: readonly AlteredLoopPhase[]; finished: boolean } {
    if (this.status !== 'playing' || deltaMs <= 0) return { entered: [], finished: false };
    const entered: AlteredLoopPhase[] = [];
    let remaining = deltaMs;
    while (remaining > 0 && this.status === 'playing') {
      const phase = ALTERED_LOOP_PHASES[this.phaseIndex];
      const step = Math.min(remaining, phase.durationMs - this.phaseElapsedMs);
      this.phaseElapsedMs += step;
      remaining -= step;
      if (this.phaseElapsedMs >= phase.durationMs) {
        this.phaseIndex += 1;
        this.phaseElapsedMs = 0;
        const next = ALTERED_LOOP_PHASES[this.phaseIndex];
        if (next) entered.push(next);
        else this.status = 'completed';
      }
    }
    return { entered, finished: this.status === 'completed' };
  }

  end(): void {
    if (this.status === 'playing') this.status = 'ended';
  }

  snapshot(): AlteredLoopRestageSnapshot {
    const phase = ALTERED_LOOP_PHASES[this.phaseIndex];
    return {
      status: this.status,
      phaseIndex: this.phaseIndex,
      phaseId: phase?.id ?? null,
      phaseElapsedMs: this.phaseElapsedMs,
      actorMark: phase?.actorMark ?? null,
      replayCount: this.replayCount,
    };
  }
}

