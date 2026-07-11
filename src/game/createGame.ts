import Phaser from 'phaser';
import { gameConfig } from './gameConfig';

export function createGame(): Phaser.Game {
  return new Phaser.Game(gameConfig);
}
