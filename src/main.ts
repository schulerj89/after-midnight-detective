import '@fontsource/press-start-2p/400.css';
import './styles/main.css';
import { createGame } from './game/createGame';
import { bindMobileControls } from './game/input/mobileControls';

async function boot(): Promise<void> {
  await document.fonts.load('16px "Press Start 2P"');
  bindMobileControls();
  createGame();
}

void boot();
