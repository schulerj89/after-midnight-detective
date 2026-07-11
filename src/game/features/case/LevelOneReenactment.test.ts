import { describe, expect, it } from 'vitest';
import { LEVEL_ONE_REENACTMENT_BEATS } from '../../../content/cases/levelOneReenactmentContent';
import { solveLevelOneCase } from './LevelOneSolutionPath';
import { LevelOneCaseState } from './LevelOneCaseState';
import { LevelOneReenactment, validateLevelOneReenactmentBasis } from './LevelOneReenactment';

describe('LevelOneReenactment', () => {
  it('stays locked before the case is solved', () => {
    expect(new LevelOneReenactment(new LevelOneCaseState()).start()).toBeNull();
  });

  it('plays every authored beat in deterministic order', () => {
    const proof = solveLevelOneCase();
    const reenactment = new LevelOneReenactment(proof.state);
    expect(reenactment.start()?.id).toBe(LEVEL_ONE_REENACTMENT_BEATS[0].id);
    const entered = reenactment.update(30_000).entered.map((beat) => beat.id);
    expect(entered).toEqual(LEVEL_ONE_REENACTMENT_BEATS.slice(1).map((beat) => beat.id));
    expect(reenactment.snapshot().status).toBe('completed');
  });

  it('pauses, resumes, skips, and counts replay', () => {
    const reenactment = new LevelOneReenactment(solveLevelOneCase().state);
    reenactment.start();
    reenactment.update(500);
    expect(reenactment.togglePause()).toBe('paused');
    reenactment.update(5_000);
    expect(reenactment.snapshot().elapsedBeatMs).toBe(500);
    expect(reenactment.togglePause()).toBe('playing');
    reenactment.skip();
    expect(reenactment.snapshot().status).toBe('skipped');
    reenactment.start();
    expect(reenactment.snapshot().replayCount).toBe(1);
  });

  it('maps every beat to knowledge acquired by the canonical solution', () => {
    expect(validateLevelOneReenactmentBasis(solveLevelOneCase().state)).toEqual([]);
  });

  it('uses inferred styling for the Room 317 doorway', () => {
    const door = LEVEL_ONE_REENACTMENT_BEATS.find((beat) => beat.id === 'reconstruction.room-317-door');
    expect(door?.provenance).toBe('INFERRED');
  });
});
