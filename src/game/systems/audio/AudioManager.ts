import Phaser from 'phaser';

export type AudioBus = 'master' | 'music' | 'ambience' | 'dialogue' | 'sfx';

interface MusicRequest {
  key: string;
  loop: boolean;
  volume: number;
}

interface SfxOptions {
  volume?: number;
  rate?: number;
  throttleId?: string;
  throttleMs?: number;
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

type AdjustableSound = Phaser.Sound.BaseSound & {
  volume: number;
  setVolume(value: number): AdjustableSound;
};

type UnlockableSoundManager = Phaser.Sound.BaseSoundManager & {
  locked: boolean;
  context?: AudioContext;
  unlock(): void;
};

const DEFAULT_LEVELS: Record<AudioBus, number> = {
  master: 1,
  music: 0.62,
  ambience: 0.8,
  dialogue: 1,
  sfx: 0.82,
};

const MUSIC_MUTED_KEY = 'after-midnight.audio.music-muted.v1';
const managers = new WeakMap<Phaser.Sound.BaseSoundManager, AudioManager>();

export const AUDIO_KEYS = {
  music: {
    levelOne: 'music.level-one',
    reconstruction: 'music.reconstruction',
  },
  sfx: {
    inspect: 'sfx.inspect',
    door: 'sfx.door',
    bars: 'sfx.bars',
    movement: 'sfx.movement',
  },
} as const;

export const AUDIO_ASSETS = [
  { key: AUDIO_KEYS.music.levelOne, path: 'assets/audio/music/hotel-marlowe-after-midnight.mp3' },
  { key: AUDIO_KEYS.music.reconstruction, path: 'assets/audio/music/detectives-reconstruction.mp3' },
  { key: AUDIO_KEYS.sfx.inspect, path: 'assets/audio/sfx/inspect-clue.mp3' },
  { key: AUDIO_KEYS.sfx.door, path: 'assets/audio/sfx/hotel-door.mp3' },
  { key: AUDIO_KEYS.sfx.bars, path: 'assets/audio/sfx/jail-bars.mp3' },
  { key: AUDIO_KEYS.sfx.movement, path: 'assets/audio/sfx/stage-movement.mp3' },
] as const;

/** Central boundary for mixing, persistence, fades, and mobile audio unlock. */
export class AudioManager {
  private readonly levels = { ...DEFAULT_LEVELS };
  private readonly listeners = new Set<() => void>();
  private readonly lastSfxAt = new Map<string, number>();
  private desiredMusic?: MusicRequest;
  private currentMusic?: AdjustableSound;
  private currentMusicKey = 'none';
  private lastSfxRequestedKey = 'none';
  private lastSfxPlayedKey = 'none';
  private musicMuted: boolean;
  private unlockBound = false;

  constructor(
    private readonly sound: Phaser.Sound.BaseSoundManager,
    private readonly storage: StorageLike | undefined = safeStorage(),
  ) {
    this.musicMuted = this.storage?.getItem(MUSIC_MUTED_KEY) === 'true';
    this.sound.volume = this.levels.master;
    this.sound.on(Phaser.Sound.Events.UNLOCKED, () => this.startDesiredMusic());
    this.bindBrowserUnlock();
  }

  setLevel(bus: AudioBus, level: number): void {
    this.levels[bus] = Phaser.Math.Clamp(level, 0, 1);
    if (bus === 'master') this.sound.volume = this.levels.master;
    if (bus === 'music') this.applyMusicVolume();
  }

  getLevel(bus: AudioBus): number {
    return this.levels[bus];
  }

  effectiveLevel(bus: Exclude<AudioBus, 'master'>): number {
    return this.levels.master * this.levels[bus];
  }

  requestMusic(key: string, options: { loop?: boolean; volume?: number } = {}): void {
    this.desiredMusic = {
      key,
      loop: options.loop ?? true,
      volume: Phaser.Math.Clamp(options.volume ?? 1, 0, 1),
    };
    this.startDesiredMusic();
  }

  playSfx(key: string, options: SfxOptions = {}): boolean {
    this.lastSfxRequestedKey = key;
    if (this.sound.locked) return false;
    const throttleId = options.throttleId ?? key;
    const now = performance.now();
    const last = this.lastSfxAt.get(throttleId) ?? -Infinity;
    if (now - last < (options.throttleMs ?? 0)) return false;
    this.lastSfxAt.set(throttleId, now);
    const played = this.sound.play(key, {
      volume: this.effectiveLevel('sfx') * Phaser.Math.Clamp(options.volume ?? 1, 0, 1),
      rate: options.rate ?? 1,
    });
    if (played) this.lastSfxPlayedKey = key;
    return played;
  }

  toggleMusicMuted(): boolean {
    this.setMusicMuted(!this.musicMuted);
    return this.musicMuted;
  }

  setMusicMuted(muted: boolean): void {
    this.musicMuted = muted;
    try { this.storage?.setItem(MUSIC_MUTED_KEY, muted.toString()); } catch { /* storage can be unavailable */ }
    this.applyMusicVolume();
    this.emit();
  }

  isMusicMuted(): boolean {
    return this.musicMuted;
  }

  musicKey(): string {
    return this.currentMusicKey;
  }

  requestedMusicKey(): string {
    return this.desiredMusic?.key ?? 'none';
  }

  lastSfxRequested(): string {
    return this.lastSfxRequestedKey;
  }

  lastSfxPlayed(): string {
    return this.lastSfxPlayedKey;
  }

  musicVolume(): number {
    return this.currentMusic?.volume ?? 0;
  }

  isMusicPlaying(): boolean {
    return this.currentMusic?.isPlaying ?? false;
  }

  isLocked(): boolean {
    return this.sound.locked;
  }

  backendName(): string {
    return this.sound.constructor.name;
  }

  contextState(): string {
    return (this.sound as UnlockableSoundManager).context?.state ?? 'none';
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private startDesiredMusic(): void {
    if (!this.desiredMusic || this.sound.locked) return;
    if (this.currentMusicKey === this.desiredMusic.key && this.currentMusic?.isPlaying) {
      this.applyMusicVolume();
      return;
    }

    const previous = this.currentMusic;
    const request = this.desiredMusic;
    const next = this.sound.add(request.key, { loop: request.loop, volume: 0 }) as AdjustableSound;
    next.play();
    this.currentMusic = next;
    this.currentMusicKey = request.key;
    this.ramp(next, 0, this.musicTargetVolume(), 650);
    if (previous) this.ramp(previous, previous.volume, 0, 420, () => {
      previous.stop();
      previous.destroy();
    });
    this.emit();
  }

  private applyMusicVolume(): void {
    this.currentMusic?.setVolume(this.musicTargetVolume());
  }

  private musicTargetVolume(): number {
    return this.musicMuted || !this.desiredMusic
      ? 0
      : this.effectiveLevel('music') * this.desiredMusic.volume;
  }

  private ramp(sound: AdjustableSound, from: number, to: number, durationMs: number, onComplete?: () => void): void {
    if (durationMs <= 0 || typeof window === 'undefined') {
      sound.setVolume(to);
      onComplete?.();
      return;
    }
    const started = performance.now();
    const step = () => {
      if (!sound.isPlaying && to > 0) return;
      const progress = Math.min(1, (performance.now() - started) / durationMs);
      sound.setVolume(Phaser.Math.Linear(from, to, progress));
      if (progress < 1) window.requestAnimationFrame(step);
      else onComplete?.();
    };
    window.requestAnimationFrame(step);
  }

  private bindBrowserUnlock(): void {
    if (this.unlockBound || typeof document === 'undefined') return;
    this.unlockBound = true;
    const cleanup = () => {
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
      document.removeEventListener('touchstart', unlock);
    };
    const unlock = () => {
      const manager = this.sound as UnlockableSoundManager;
      if (!manager.locked) {
        cleanup();
        this.startDesiredMusic();
        return;
      }
      if (manager.context) {
        void manager.context.resume().then(() => {
          manager.locked = false;
          manager.emit(Phaser.Sound.Events.UNLOCKED, manager);
          cleanup();
          this.startDesiredMusic();
        });
      } else {
        manager.unlock();
      }
    };
    document.addEventListener('pointerdown', unlock, { passive: true });
    document.addEventListener('keydown', unlock);
    document.addEventListener('touchstart', unlock, { passive: true });
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener());
  }
}

export function getAudioManager(sound: Phaser.Sound.BaseSoundManager): AudioManager {
  const existing = managers.get(sound);
  if (existing) return existing;
  const manager = new AudioManager(sound);
  managers.set(sound, manager);
  return manager;
}

function safeStorage(): StorageLike | undefined {
  try { return typeof localStorage === 'undefined' ? undefined : localStorage; } catch { return undefined; }
}
