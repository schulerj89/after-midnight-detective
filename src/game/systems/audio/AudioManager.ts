import Phaser from 'phaser';

export type AudioBus = 'master' | 'music' | 'ambience' | 'dialogue' | 'sfx';

const DEFAULT_LEVELS: Record<AudioBus, number> = {
  master: 1,
  music: 0.7,
  ambience: 0.8,
  dialogue: 1,
  sfx: 0.9,
};

/** Central boundary for mixing, persistence, fades, and mobile audio unlock. */
export class AudioManager {
  private readonly levels = { ...DEFAULT_LEVELS };

  constructor(private readonly sound: Phaser.Sound.BaseSoundManager) {}

  setLevel(bus: AudioBus, level: number): void {
    this.levels[bus] = Phaser.Math.Clamp(level, 0, 1);

    if (bus === 'master') {
      this.sound.volume = this.levels.master;
    }
  }

  getLevel(bus: AudioBus): number {
    return this.levels[bus];
  }

  effectiveLevel(bus: Exclude<AudioBus, 'master'>): number {
    return this.levels.master * this.levels[bus];
  }
}
