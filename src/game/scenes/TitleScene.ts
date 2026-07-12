import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../constants';
import { TitleMenuModel, type TitleMenuAction } from '../features/title/TitleMenuModel';
import { AUDIO_KEYS, getAudioManager, type AudioManager } from '../systems/audio/AudioManager';

const FONT = '"Press Start 2P", monospace';
const VOLUME_STEPS = [0.4, 0.6, 0.8, 1] as const;

interface MenuControl {
  action: TitleMenuAction;
  root: Phaser.GameObjects.Container;
  plate: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  logicalBounds: { x: number; y: number; width: number; height: number };
}

export class TitleScene extends Phaser.Scene {
  private readonly menu = new TitleMenuModel();
  private controls: MenuControl[] = [];
  private mainPanel!: Phaser.GameObjects.Container;
  private settingsPanel!: Phaser.GameObjects.Container;
  private brandPanel!: Phaser.GameObjects.Container;
  private titleLines: Phaser.GameObjects.Text[] = [];
  private audio!: AudioManager;
  private stageWidth = GAME_WIDTH;
  private starting = false;

  constructor() {
    super(SCENE_KEYS.title);
  }

  create(): void {
    this.stageWidth = Math.max(GAME_WIDTH, this.scale.width);
    this.cameras.main.setBackgroundColor('#090a0d');
    document.body.classList.add('title-screen-open');
    document.querySelector<HTMLElement>('#mobile-controls')?.setAttribute('aria-hidden', 'true');

    this.audio = getAudioManager(this.sound);
    this.audio.requestMusic(AUDIO_KEYS.music.levelOne, { loop: true, volume: 0.52 });
    this.drawBackdrop();
    this.createMainPanel();
    this.createSettingsPanel();
    this.bindInput();

    const pose = new URLSearchParams(window.location.search).get('qaPose');
    if (pose === 'title-settings') this.openSettings();
    else this.showPanel('main');

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());
    this.publishDebugState();
  }

  private drawBackdrop(): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x090a0d, 1).fillRect(0, 0, this.stageWidth, GAME_HEIGHT);
    graphics.fillStyle(0x111319, 1).fillRect(0, 78, this.stageWidth, 564);
    graphics.fillStyle(0x17191f, 0.9).fillTriangle(0, 0, this.stageWidth * 0.28, 0, 0, GAME_HEIGHT);
    graphics.fillStyle(0x050609, 0.94).fillTriangle(this.stageWidth, 0, this.stageWidth * 0.74, GAME_HEIGHT, this.stageWidth, GAME_HEIGHT);
    graphics.lineStyle(1, 0x657083, 0.16);
    for (let x = -GAME_HEIGHT; x < this.stageWidth; x += 38) {
      graphics.lineBetween(x, 0, x + GAME_HEIGHT, GAME_HEIGHT);
    }
    graphics.lineStyle(2, 0xc7a85b, 0.2).lineBetween(0, 642, this.stageWidth, 642);

    this.brandPanel = this.add.container(0, 0);
    this.brandPanel.add(this.add.text(this.stageWidth / 2, 241.25, 'HOTEL MARLOWE // 12:08 A.M.', {
      color: '#817967', fontFamily: FONT, fontSize: '11px', letterSpacing: 3,
    }).setOrigin(0.5));
    const firstLine = this.add.text(this.stageWidth / 2, 316.25, 'AFTER MIDNIGHT,', {
      color: '#d9cfb6', fontFamily: FONT, fontSize: '48px', letterSpacing: 5,
    }).setOrigin(0.5);
    const secondLine = this.add.text(this.stageWidth / 2, 396.25, 'DETECTIVE', {
      color: '#8f2432', fontFamily: FONT, fontSize: '62px', letterSpacing: 7,
    }).setOrigin(0.5);
    this.titleLines = [firstLine, secondLine];
    this.brandPanel.add(this.titleLines);
    this.brandPanel.add(this.add.text(this.stageWidth / 2, 456.25, 'THE NIGHT REMEMBERS WHERE EVERYONE STOOD.', {
      color: '#b9ad91', fontFamily: FONT, fontSize: '10px', letterSpacing: 1,
    }).setOrigin(0.5));
  }

  private createMainPanel(): void {
    this.mainPanel = this.add.container(0, 0);
    this.createControl(this.mainPanel, 'start', 535, 'START CASE');
    this.createControl(this.mainPanel, 'settings', 650, 'SETTINGS');
  }

  private createSettingsPanel(): void {
    this.settingsPanel = this.add.container(0, 0).setVisible(false);
    this.settingsPanel.add(this.add.text(this.stageWidth / 2, 94, 'SETTINGS', {
      color: '#d9cfb6', fontFamily: FONT, fontSize: '34px', letterSpacing: 4,
    }).setOrigin(0.5));
    this.settingsPanel.add(this.add.text(this.stageWidth / 2, 150, 'TAP A VOLUME TO CYCLE IT', {
      color: '#817967', fontFamily: FONT, fontSize: '9px', letterSpacing: 1,
    }).setOrigin(0.5));
    this.createControl(this.settingsPanel, 'music-toggle', 246, '');
    this.createControl(this.settingsPanel, 'music-volume', 356, '');
    this.createControl(this.settingsPanel, 'sfx-volume', 466, '');
    this.createControl(this.settingsPanel, 'back', 586, 'BACK');
    this.refreshSettingsLabels();
  }

  private createControl(
    panel: Phaser.GameObjects.Container,
    action: TitleMenuAction,
    y: number,
    text: string,
  ): void {
    const width = 500;
    const height = 96;
    const plate = this.add.rectangle(0, 0, width, height, 0x111319, 0.94)
      .setStrokeStyle(3, 0x57564f, 1);
    const label = this.add.text(0, 0, text, {
      color: '#d9cfb6', fontFamily: FONT, fontSize: '16px', align: 'center', letterSpacing: 1,
    }).setOrigin(0.5);
    const root = this.add.container(this.stageWidth / 2, y, [plate, label])
      .setSize(width, height)
      .setInteractive();
    root.on('pointerover', () => {
      if (this.menu.currentPanel() !== (panel === this.mainPanel ? 'main' : 'settings')) return;
      this.menu.select(action);
      this.refreshSelection();
    });
    root.on('pointerdown', () => this.activate(action));
    panel.add(root);
    this.controls.push({
      action,
      root,
      plate,
      label,
      logicalBounds: { x: this.stageWidth / 2 - width / 2, y: y - height / 2, width, height },
    });
  }

  private bindInput(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) return;
    keyboard.on('keydown-UP', () => this.moveSelection(-1));
    keyboard.on('keydown-W', () => this.moveSelection(-1));
    keyboard.on('keydown-DOWN', () => this.moveSelection(1));
    keyboard.on('keydown-S', () => this.moveSelection(1));
    keyboard.on('keydown-ENTER', () => this.activate(this.menu.selected()));
    keyboard.on('keydown-SPACE', () => this.activate(this.menu.selected()));
    keyboard.on('keydown-ESC', () => {
      if (this.menu.currentPanel() === 'settings') this.closeSettings();
    });
  }

  private moveSelection(delta: number): void {
    this.menu.move(delta);
    this.refreshSelection();
  }

  private activate(action: TitleMenuAction): void {
    if (!this.menu.select(action)) return;
    if (action === 'start') this.startCase();
    else if (action === 'settings') this.openSettings();
    else if (action === 'music-toggle') {
      this.audio.toggleMusicMuted();
      this.refreshSettingsLabels();
    } else if (action === 'music-volume') {
      this.audio.setLevel('music', this.nextVolume(this.audio.getLevel('music')));
      this.refreshSettingsLabels();
    } else if (action === 'sfx-volume') {
      this.audio.setLevel('sfx', this.nextVolume(this.audio.getLevel('sfx')));
      this.refreshSettingsLabels();
    } else if (action === 'back') this.closeSettings();
    this.refreshSelection();
  }

  private startCase(): void {
    if (this.starting) return;
    this.starting = true;
    this.controls.forEach((control) => control.root.disableInteractive());
    this.cameras.main.fadeOut(420, 0, 0, 0, (_camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
      if (progress === 1) this.scene.start(SCENE_KEYS.exploration);
    });
  }

  private openSettings(): void {
    this.menu.openSettings();
    this.showPanel('settings');
  }

  private closeSettings(): void {
    this.menu.back();
    this.showPanel('main');
  }

  private showPanel(panel: 'main' | 'settings'): void {
    this.brandPanel.setVisible(panel === 'main');
    this.mainPanel.setVisible(panel === 'main');
    this.settingsPanel.setVisible(panel === 'settings');
    this.refreshSelection();
  }

  private refreshSelection(): void {
    const active = new Set(this.menu.actions());
    const selected = this.menu.selected();
    this.controls.forEach((control) => {
      const isActive = active.has(control.action);
      control.root.input && (control.root.input.enabled = isActive);
      control.plate.setStrokeStyle(3, control.action === selected ? 0xc7a85b : 0x57564f, 1);
      control.plate.setFillStyle(control.action === selected ? 0x29251d : 0x111319, 0.96);
      control.label.setColor(control.action === selected ? '#fff4d8' : '#d9cfb6');
    });
    this.publishDebugState();
  }

  private refreshSettingsLabels(): void {
    const labels: Partial<Record<TitleMenuAction, string>> = {
      'music-toggle': `MUSIC // ${this.audio.isMusicMuted() ? 'OFF' : 'ON'}`,
      'music-volume': `MUSIC VOLUME // ${Math.round(this.audio.getLevel('music') * 100)}%`,
      'sfx-volume': `SFX VOLUME // ${Math.round(this.audio.getLevel('sfx') * 100)}%`,
    };
    this.controls.forEach((control) => {
      const label = labels[control.action];
      if (label) control.label.setText(label);
    });
    this.publishDebugState();
  }

  private nextVolume(current: number): number {
    return VOLUME_STEPS.find((step) => step > current + 0.01) ?? VOLUME_STEPS[0];
  }

  private publishDebugState(): void {
    const canvas = this.game.canvas;
    if (!canvas || !this.audio) return;
    const active = new Set(this.menu.actions());
    canvas.dataset.titleReady = 'true';
    canvas.dataset.titlePanel = this.menu.currentPanel();
    canvas.dataset.titleSelected = this.menu.selected();
    canvas.dataset.titleMusicMuted = String(this.audio.isMusicMuted());
    canvas.dataset.titleMusicLevel = this.audio.getLevel('music').toFixed(2);
    canvas.dataset.titleSfxLevel = this.audio.getLevel('sfx').toFixed(2);
    canvas.dataset.titleStageWidth = String(this.stageWidth);
    if (this.titleLines.length === 2) {
      const [first, second] = this.titleLines.map((line) => line.getBounds());
      const left = Math.min(first.left, second.left);
      const top = Math.min(first.top, second.top);
      const right = Math.max(first.right, second.right);
      const bottom = Math.max(first.bottom, second.bottom);
      const titleBlock = { x: left, y: top, width: right - left, height: bottom - top };
      canvas.dataset.titleBlock = JSON.stringify(titleBlock);
      canvas.dataset.titleCenterDeltaX = (left + titleBlock.width / 2 - this.stageWidth / 2).toFixed(2);
      canvas.dataset.titleCenterDeltaY = (top + titleBlock.height / 2 - GAME_HEIGHT / 2).toFixed(2);
    }
    canvas.dataset.titleLayout = JSON.stringify(this.controls
      .filter((control) => active.has(control.action))
      .map((control) => ({ id: control.action, role: 'touch-control', ...control.logicalBounds })));
  }

  private cleanup(): void {
    document.body.classList.remove('title-screen-open');
    document.querySelector<HTMLElement>('#mobile-controls')?.removeAttribute('aria-hidden');
    this.input.keyboard?.removeAllListeners();
    const canvas = this.game.canvas;
    delete canvas.dataset.titleReady;
    delete canvas.dataset.titleLayout;
  }
}
