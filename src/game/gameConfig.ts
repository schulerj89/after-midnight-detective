import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './constants';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { ExplorationScene } from './scenes/ExplorationScene';
import { SandboxScene } from './scenes/SandboxScene';
import { TitleScene } from './scenes/TitleScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#090a0d',
  scene: [BootScene, PreloadScene, ExplorationScene, SandboxScene, TitleScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    activePointers: 3,
  },
  render: {
    antialias: true,
    roundPixels: false,
  },
  audio: {
    disableWebAudio: false,
  },
};
