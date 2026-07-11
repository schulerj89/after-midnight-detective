import { describe, expect, it } from 'vitest';
import { ALTERED_LOOP_PHASES, AlteredLoopRestage } from './AlteredLoopRestage';

describe('AlteredLoopRestage', () => {
  it('enters every guided phase in deterministic order', () => {
    const restage = new AlteredLoopRestage();
    expect(restage.start().id).toBe('reset');
    expect(restage.update(20_000).entered.map((phase) => phase.id)).toEqual(
      ALTERED_LOOP_PHASES.slice(1).map((phase) => phase.id),
    );
    expect(restage.snapshot().status).toBe('completed');
  });

  it('does not expose the recording phase during either transit leg', () => {
    const restage = new AlteredLoopRestage();
    restage.start('transit-1');
    expect(restage.snapshot().phaseId).toBe('transit-1');
    expect(ALTERED_LOOP_PHASES[restage.snapshot().phaseIndex].recordsObservation).not.toBe(true);
    restage.update(2_600);
    expect(restage.snapshot().phaseId).toBe('transit-2');
    expect(ALTERED_LOOP_PHASES[restage.snapshot().phaseIndex].recordsObservation).not.toBe(true);
  });

  it('records only after the arrival hold completes', () => {
    const restage = new AlteredLoopRestage();
    restage.start('arrived');
    restage.update(1_299);
    expect(restage.snapshot().phaseId).toBe('arrived');
    const result = restage.update(1);
    expect(result.entered[0]).toMatchObject({ id: 'recorded', recordsObservation: true });
  });

  it('can end early and counts a later replay', () => {
    const restage = new AlteredLoopRestage();
    restage.start();
    restage.end();
    expect(restage.snapshot().status).toBe('ended');
    restage.start();
    expect(restage.snapshot().replayCount).toBe(1);
  });
});
