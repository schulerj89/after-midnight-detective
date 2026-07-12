import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../constants';
import { AUDIO_ASSETS } from '../systems/audio/AudioManager';

export class PreloadScene extends Phaser.Scene {
  private loadingText!: Phaser.GameObjects.Text;

  constructor() {
    super(SCENE_KEYS.preload);
  }

  preload(): void {
    this.loadingText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'The city is holding its breath... 0%', {
        color: '#b9ad91',
        fontFamily: 'Georgia, serif',
        fontSize: '24px',
      })
      .setOrigin(0.5);
    this.load.on('progress', (progress: number) => {
      this.loadingText.setText(`The city is holding its breath... ${Math.round(progress * 100)}%`);
    });
    AUDIO_ASSETS.forEach((asset) => this.load.audio(asset.key, asset.path));
  }

  create(): void {
    this.loadingText.setText('The city is holding its breath...');
    this.tweens.add({
      targets: this.loadingText,
      alpha: 0,
      duration: 500,
      delay: 250,
      onComplete: () => {
        const scene = new URLSearchParams(window.location.search).get('scene');
        this.scene.start(
          scene === 'blocking'
            ? SCENE_KEYS.sandbox
            : scene === SCENE_KEYS.caseClosed
              ? SCENE_KEYS.caseClosed
              : SCENE_KEYS.exploration,
        );
      },
    });
  }
}
