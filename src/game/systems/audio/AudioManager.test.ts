import { describe, expect, it, vi } from 'vitest';
import type Phaser from 'phaser';
import { AUDIO_KEYS, AudioManager } from './AudioManager';

vi.mock('phaser', () => ({
  default: {
    Math: {
      Clamp: (value: number, min: number, max: number) => Math.min(max, Math.max(min, value)),
      Linear: (from: number, to: number, progress: number) => from + (to - from) * progress,
    },
    Sound: { Events: { UNLOCKED: 'unlocked' } },
  },
}));

function harness(locked = false, initial: Record<string, string> = {}) {
  const values = new Map<string, string>(Object.entries(initial));
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
  const music = {
    isPlaying: true,
    volume: 0,
    play: vi.fn(() => true),
    stop: vi.fn(() => true),
    destroy: vi.fn(),
    setVolume: vi.fn(function setVolume(this: { volume: number }, volume: number) { this.volume = volume; return this; }),
  };
  const sound = {
    volume: 0,
    locked,
    on: vi.fn(),
    unlock: vi.fn(function unlock(this: { locked: boolean }) { this.locked = false; }),
    add: vi.fn(() => music),
    play: vi.fn(() => true),
  };
  const manager = new AudioManager(
    sound as unknown as Phaser.Sound.BaseSoundManager,
    storage,
  );
  return { manager, music, sound, values };
}

describe('AudioManager', () => {
  it('persists music mute independently of the SFX bus', () => {
    const { manager, values } = harness();
    manager.setMusicMuted(true);
    expect(manager.isMusicMuted()).toBe(true);
    expect(values.get('after-midnight.audio.music-muted.v1')).toBe('true');
    expect(manager.effectiveLevel('sfx')).toBeGreaterThan(0);
  });

  it('persists and restores independent music and SFX levels', () => {
    const { manager, values } = harness();
    manager.setLevel('music', 0.4);
    manager.setLevel('sfx', 0.8);
    expect(values.get('after-midnight.audio.music-level.v1')).toBe('0.4');
    expect(values.get('after-midnight.audio.sfx-level.v1')).toBe('0.8');

    const restored = harness(false, Object.fromEntries(values)).manager;
    expect(restored.getLevel('music')).toBe(0.4);
    expect(restored.getLevel('sfx')).toBe(0.8);
  });

  it('clamps persisted levels', () => {
    const { manager } = harness(false, {
      'after-midnight.audio.music-level.v1': '4',
      'after-midnight.audio.sfx-level.v1': '-2',
    });
    expect(manager.getLevel('music')).toBe(1);
    expect(manager.getLevel('sfx')).toBe(0.82);
  });

  it('defers music until browser audio is unlocked', () => {
    const { manager, sound } = harness(true);
    manager.requestMusic(AUDIO_KEYS.music.levelOne);
    expect(sound.add).not.toHaveBeenCalled();
  });

  it('starts one requested music key and reports it', () => {
    const { manager, sound, music } = harness();
    manager.requestMusic(AUDIO_KEYS.music.reconstruction, { loop: false, volume: 0.7 });
    expect(sound.add).toHaveBeenCalledTimes(1);
    expect(music.play).toHaveBeenCalledTimes(1);
    expect(manager.musicKey()).toBe(AUDIO_KEYS.music.reconstruction);
  });

  it('rate-limits repeated movement sounds', () => {
    const { manager, sound } = harness();
    expect(manager.playSfx(AUDIO_KEYS.sfx.movement, { throttleId: 'movement', throttleMs: 500 })).toBe(true);
    expect(manager.playSfx(AUDIO_KEYS.sfx.movement, { throttleId: 'movement', throttleMs: 500 })).toBe(false);
    expect(sound.play).toHaveBeenCalledTimes(1);
  });
});
