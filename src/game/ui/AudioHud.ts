import type { AudioManager } from '../systems/audio/AudioManager';

export class AudioHud {
  private readonly button: HTMLButtonElement;
  private readonly icon: HTMLElement;
  private readonly label: HTMLElement;
  private readonly unsubscribe: () => void;
  private readonly handleKey = (event: KeyboardEvent) => {
    if (event.key.toLowerCase() === 'm' && !event.repeat) this.audio.toggleMusicMuted();
  };

  constructor(private readonly audio: AudioManager) {
    this.button = document.createElement('button');
    this.button.id = 'audio-control';
    this.button.type = 'button';
    this.button.dataset.qaId = 'music-mute';
    this.icon = document.createElement('span');
    this.icon.setAttribute('aria-hidden', 'true');
    this.label = document.createElement('strong');
    this.button.append(this.icon, this.label);
    this.button.addEventListener('click', () => this.audio.toggleMusicMuted());
    window.addEventListener('keydown', this.handleKey);
    document.body.append(this.button);
    this.unsubscribe = this.audio.subscribe(() => this.render());
    this.render();
  }

  destroy(): void {
    this.unsubscribe();
    window.removeEventListener('keydown', this.handleKey);
    this.button.remove();
  }

  private render(): void {
    const muted = this.audio.isMusicMuted();
    this.button.classList.toggle('is-muted', muted);
    this.button.setAttribute('aria-pressed', muted.toString());
    this.button.setAttribute('aria-label', muted ? 'Unmute music' : 'Mute music');
    this.button.title = muted ? 'Unmute music' : 'Mute music';
    this.icon.textContent = muted ? '×' : '♪';
    this.label.textContent = muted ? 'MUTED' : 'MUSIC';
    document.documentElement.dataset.musicMuted = muted.toString();
    document.documentElement.dataset.musicTrack = this.audio.musicKey();
  }
}
