import '@fontsource/press-start-2p/400.css';
import './styles/main.css';
import { createGame } from './game/createGame';
import { bindMobileControls } from './game/input/mobileControls';
import { getAudioManager } from './game/systems/audio/AudioManager';
import { AudioHud } from './game/ui/AudioHud';

async function boot(): Promise<void> {
  await document.fonts.load('16px "Press Start 2P"');
  bindMobileControls();
  const game = createGame();
  new AudioHud(getAudioManager(game.sound));
}

void boot();
