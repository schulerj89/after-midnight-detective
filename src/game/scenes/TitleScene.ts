import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../constants';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.title);
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#090a0d');

    const rain = this.add.graphics();
    rain.lineStyle(1, 0x657083, 0.18);
    for (let x = -GAME_HEIGHT; x < GAME_WIDTH; x += 34) {
      rain.lineBetween(x, 0, x + GAME_HEIGHT, GAME_HEIGHT);
    }

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.42, 'AFTER MIDNIGHT,', {
        color: '#d9cfb6',
        fontFamily: 'Georgia, serif',
        fontSize: '58px',
        fontStyle: 'bold',
        letterSpacing: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.53, 'DETECTIVE', {
        color: '#9f2635',
        fontFamily: 'Georgia, serif',
        fontSize: '78px',
        fontStyle: 'bold',
        letterSpacing: 14,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.72, 'A mystery-noir game', {
        color: '#817967',
        fontFamily: 'Georgia, serif',
        fontSize: '22px',
        fontStyle: 'italic',
      })
      .setOrigin(0.5);
  }
}
