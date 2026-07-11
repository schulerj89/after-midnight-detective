import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../constants';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.preload);
  }

  create(): void {
    const loading = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'The city is holding its breath…', {
        color: '#b9ad91',
        fontFamily: 'Georgia, serif',
        fontSize: '24px',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: loading,
      alpha: 0,
      duration: 500,
      delay: 250,
      onComplete: () => this.scene.start(SCENE_KEYS.sandbox),
    });
  }
}
