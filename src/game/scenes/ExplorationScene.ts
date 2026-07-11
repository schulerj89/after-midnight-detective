import Phaser from 'phaser';
import { ExplorationPlayer } from '../actors/ExplorationPlayer';
import { GAME_WIDTH, SCENE_KEYS } from '../constants';
import type { DialogueScript } from '../features/dialogue/DialogueModel';
import type { Rect } from '../features/movement/CollisionResolver';
import { normalizeMovementVector, type MovementVector } from '../features/movement/MovementVector';
import {
  onMobileControl,
  onMobileMove,
  type MobileControl,
  type MobileMoveVector,
} from '../input/mobileControls';
import { DialogueBox } from '../ui/DialogueBox';

const FONT = '"Press Start 2P", monospace';
const WORLD_WIDTH = 2400;
const WORLD_HEIGHT = 1350;
const PLAYER_BOUNDS: Rect = { x: 90, y: 190, width: 2220, height: 1070 };

interface Interactable {
  id: 'vera' | 'miles' | 'ledger';
  x: number;
  y: number;
  range: number;
  activate: () => void;
}

const DIALOGUE: Record<Interactable['id'], DialogueScript> = {
  vera: {
    id: 'exploration-vera', speaker: 'VERA VALE', portraitKey: 'portrait-vera',
    pages: ['You found the lounge. Now find out who crossed it after midnight.', 'The wet footprints stop at the piano. Curious, isn\'t it?'],
  },
  miles: {
    id: 'exploration-miles', speaker: 'MILES PIKE', portraitKey: 'portrait-miles',
    pages: ['Keep your questions quiet. These walls collect secrets.', 'I was by the north windows when the lights failed.'],
  },
  ledger: {
    id: 'exploration-ledger', speaker: 'DETECTIVE', portraitKey: 'portrait-detective',
    pages: ['A torn hotel ledger. Room 317 was entered twice after midnight.', 'PLACEHOLDER CLUE RECORDED // THE NOTEBOOK WILL REMEMBER THIS.'],
  },
};

export class ExplorationScene extends Phaser.Scene {
  private player!: ExplorationPlayer;
  private dialogue!: DialogueBox;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>;
  private mobileVector: MobileMoveVector = { x: 0, y: 0 };
  private obstacles: Rect[] = [];
  private interactables: Interactable[] = [];
  private promptText!: Phaser.GameObjects.Text;
  private removeMobileMove?: () => void;
  private removeMobileControl?: () => void;
  private lastInteraction = 'exploration-ready';

  constructor() {
    super(SCENE_KEYS.exploration);
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#090a0d');
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.createTextures();
    this.createWorld();
    this.createInteractables();
    this.player = new ExplorationPlayer(this, 1120, 780, 'exploration-detective');
    this.cameras.main.startFollow(this.player.gameObject(), true, 0.09, 0.09);
    this.dialogue = new DialogueBox(this);
    this.createHud();
    this.createInput();
    this.applyQaPose();
    this.publishDebugSnapshot({ x: 0, y: 0 });
  }

  update(_time: number, delta: number): void {
    const vector = this.dialogue.isOpen() ? { x: 0, y: 0 } : this.readMovement();
    this.player.update(vector, delta, PLAYER_BOUNDS, this.obstacles);
    this.updatePrompt();
    this.publishDebugSnapshot(vector);
  }

  private createInput(): void {
    if (!this.input.keyboard) return;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = { up: this.input.keyboard.addKey('W'), down: this.input.keyboard.addKey('S'), left: this.input.keyboard.addKey('A'), right: this.input.keyboard.addKey('D') };
    this.input.keyboard.on('keydown-E', () => this.activateNearest());
    this.removeMobileMove = onMobileMove((vector) => { this.mobileVector = vector; });
    this.removeMobileControl = onMobileControl((control) => this.handleMobileControl(control));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.removeMobileMove?.();
      this.removeMobileControl?.();
    });
  }

  private readMovement(): MovementVector {
    const x = Number(this.cursors.right.isDown || this.wasd.right.isDown) - Number(this.cursors.left.isDown || this.wasd.left.isDown) + this.mobileVector.x;
    const y = Number(this.cursors.down.isDown || this.wasd.down.isDown) - Number(this.cursors.up.isDown || this.wasd.up.isDown) + this.mobileVector.y;
    return normalizeMovementVector(x, y);
  }

  private handleMobileControl(control: MobileControl): void {
    if (control === 'action-a') {
      this.dialogue.isOpen() ? this.dialogue.advance() : this.activateNearest();
    } else if (control === 'action-b' && this.dialogue.isOpen()) {
      this.dialogue.dismiss();
    }
  }

  private createWorld(): void {
    const floor = this.add.graphics().setDepth(0);
    floor.fillStyle(0x12141a, 1).fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    floor.fillStyle(0x17191f, 1).fillRect(90, 190, 2220, 1070);
    floor.lineStyle(2, 0x242731, 0.72);
    for (let x = 90; x <= 2310; x += 90) floor.lineBetween(x, 190, x, 1260);
    for (let y = 190; y <= 1260; y += 90) floor.lineBetween(90, y, 2310, y);
    floor.lineStyle(8, 0x090a0d, 1).strokeRect(82, 182, 2236, 1086);

    this.addZoneLabel(300, 245, 'WEST LOUNGE');
    this.addZoneLabel(1130, 245, 'THE LANTERN ROOM');
    this.addZoneLabel(1920, 245, 'NORTH WINDOWS');
    this.addWindows();

    this.addObstacle(720, 560, 380, 120, 0x201b19, 'SOFA');
    this.addObstacle(1300, 410, 340, 120, 0x211c19, 'PIANO');
    this.addObstacle(1710, 780, 440, 150, 0x181319, 'BAR');
    this.addObstacle(310, 380, 220, 110, 0x25201c, 'DESK');
    this.addObstacle(1080, 920, 230, 130, 0x201b19, 'TABLE');
    this.addObstacle(2020, 430, 190, 100, 0x20231f, 'PLANTER');

    const carpets = this.add.graphics().setDepth(1);
    carpets.fillStyle(0x5b1722, 0.38).fillRoundedRect(320, 760, 650, 360, 20);
    carpets.lineStyle(5, 0x8f2432, 0.35).strokeRoundedRect(320, 760, 650, 360, 20);
    carpets.fillStyle(0x735e32, 0.16).fillRoundedRect(1370, 280, 700, 370, 20);

    this.add.rectangle(1200, 1230, 600, 50, 0x08090c, 1).setDepth(1400);
    this.add.text(1200, 1228, 'SERVICE CORRIDOR // LOCKED FOR THIS SANDBOX', { color: '#4f4a40', fontFamily: FONT, fontSize: '10px' }).setOrigin(0.5).setDepth(1401);
  }

  private addWindows(): void {
    const windows = this.add.graphics().setDepth(2);
    for (let x = 160; x < 2240; x += 300) {
      windows.fillStyle(0x0a1219, 1).fillRect(x, 105, 220, 100);
      windows.lineStyle(6, 0x090a0d, 1).strokeRect(x, 105, 220, 100);
      windows.lineStyle(2, 0x718293, 0.4);
      for (let rain = x + 18; rain < x + 210; rain += 24) windows.lineBetween(rain, 118, rain - 22, 188);
    }
  }

  private addObstacle(x: number, y: number, width: number, height: number, color: number, label: string): void {
    this.obstacles.push({ x, y, width, height });
    const prop = this.add.container(x, y + height).setDepth(100 + y + height);
    const shadow = this.add.ellipse(width / 2, 2, width + 40, 32, 0x000000, 0.42);
    const body = this.add.rectangle(width / 2, -height / 2, width, height, color, 1).setStrokeStyle(4, 0x39322b, 1);
    const name = this.add.text(width / 2, -height / 2, label, { color: '#817967', fontFamily: FONT, fontSize: '10px' }).setOrigin(0.5);
    prop.add([shadow, body, name]);
  }

  private createInteractables(): void {
    this.addNpc('vera', 620, 690, 'exploration-vera');
    this.addNpc('miles', 1480, 1120, 'exploration-miles');
    const ledger = this.add.container(1240, 875).setDepth(975);
    const halo = this.add.ellipse(0, 0, 80, 30, 0xc7a85b, 0.16);
    const book = this.add.rectangle(0, -9, 58, 38, 0x8f2432, 1).setRotation(-0.18).setStrokeStyle(3, 0xd9cfb6, 0.7).setInteractive({ useHandCursor: true });
    ledger.add([halo, book]);
    book.on('pointerdown', () => this.openDialogue('ledger'));
    this.interactables.push({ id: 'ledger', x: 1240, y: 875, range: 175, activate: () => this.openDialogue('ledger') });
  }

  private addNpc(id: 'vera' | 'miles', x: number, y: number, texture: string): void {
    const root = this.add.container(x, y).setDepth(100 + y);
    const shadow = this.add.ellipse(0, 0, 112, 26, 0x000000, 0.5);
    const body = this.add.image(0, 0, texture).setOrigin(0.5, 1).setInteractive({ useHandCursor: true });
    root.add([shadow, body]);
    body.on('pointerdown', () => this.openDialogue(id));
    this.interactables.push({ id, x, y, range: 175, activate: () => this.openDialogue(id) });
  }

  private createHud(): void {
    const hud = this.add.graphics().setScrollFactor(0).setDepth(9000);
    hud.fillStyle(0x090a0d, 0.86).fillRoundedRect(22, 20, 430, 70, 5);
    hud.lineStyle(2, 0x817967, 0.8).strokeRoundedRect(22, 20, 430, 70, 5);
    this.add.text(42, 36, 'AFTER MIDNIGHT // HOTEL MARLOWE', { color: '#d9cfb6', fontFamily: FONT, fontSize: '12px' }).setScrollFactor(0).setDepth(9001);
    this.add.text(42, 61, 'MOVE: WASD / ARROWS / JOYSTICK', { color: '#817967', fontFamily: FONT, fontSize: '9px' }).setScrollFactor(0).setDepth(9001);
    this.promptText = this.add.text(GAME_WIDTH / 2, 452, '', { color: '#c7a85b', backgroundColor: '#090a0ddd', fontFamily: FONT, fontSize: '12px', padding: { x: 14, y: 9 } }).setOrigin(0.5).setScrollFactor(0).setDepth(9001);
    this.setMobileLabels('ACT', 'BACK');
  }

  private updatePrompt(): void {
    if (this.dialogue.isOpen()) {
      this.promptText.setText('A: NEXT  //  B: CLOSE').setVisible(true);
      this.setMobileLabels('NEXT', 'BACK');
      return;
    }
    const nearest = this.nearestInteractable();
    this.promptText
      .setText(nearest ? `A / E: ${nearest.id === 'ledger' ? 'INSPECT LEDGER' : `QUESTION ${nearest.id.toUpperCase()}`}` : '')
      .setVisible(Boolean(nearest));
    this.setMobileLabels('ACT', 'BACK');
  }

  private nearestInteractable(): Interactable | undefined {
    const position = this.player.position();
    return this.interactables
      .map((target) => ({ target, distance: Phaser.Math.Distance.Between(position.x, position.y, target.x, target.y) }))
      .filter(({ target, distance }) => distance <= target.range)
      .sort((a, b) => a.distance - b.distance)[0]?.target;
  }

  private activateNearest(): void {
    const nearest = this.nearestInteractable();
    if (nearest) nearest.activate();
    else this.lastInteraction = 'nothing-in-range';
  }

  private openDialogue(id: Interactable['id']): void {
    if (this.dialogue?.isOpen()) return;
    this.lastInteraction = `opened-${id}`;
    this.dialogue.open(DIALOGUE[id], () => { this.lastInteraction = `closed-${id}`; });
  }

  private setMobileLabels(a: string, b: string): void {
    const aLabel = document.querySelector<HTMLElement>('.action-a span');
    const bLabel = document.querySelector<HTMLElement>('.action-b span');
    if (aLabel) aLabel.textContent = a;
    if (bLabel) bLabel.textContent = b;
  }

  private addZoneLabel(x: number, y: number, text: string): void {
    this.add.text(x, y, text, { color: '#4f4a40', fontFamily: FONT, fontSize: '13px' }).setOrigin(0.5).setDepth(2);
  }

  private applyQaPose(): void {
    const pose = new URLSearchParams(window.location.search).get('qaPose');
    if (pose === 'exploration-joystick') {
      const knob = document.querySelector<HTMLElement>('.dpad-center');
      if (knob) {
        knob.style.transform = 'translate(29px, -20px)';
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
          knob.style.transform = 'translate(0, 0)';
        });
      }
      this.lastInteraction = 'qa-pose-exploration-joystick';
    }
    if (pose === 'exploration-dialogue') this.openDialogue('vera');
  }

  private createTextures(): void {
    this.createPersonTexture('exploration-detective', 0x111318, 0xd9cfb6, true);
    this.createPersonTexture('exploration-vera', 0x20232b, 0x8f2432, true);
    this.createPersonTexture('exploration-miles', 0x27231f, 0xc7a85b, false);
    this.createPortrait('portrait-vera', 0x20232b, 0x8f2432, true);
    this.createPortrait('portrait-miles', 0x27231f, 0xc7a85b, false);
    this.createPortrait('portrait-detective', 0x111318, 0xd9cfb6, true);
  }

  private createPersonTexture(key: string, coat: number, accent: number, hat: boolean): void {
    if (this.textures.exists(key)) return;
    const g = this.add.graphics();
    g.fillStyle(0xd0b69f, 1).fillCircle(70, 52, 28);
    g.fillStyle(0x090a0d, 1);
    if (hat) { g.fillRect(35, 25, 70, 10); g.fillRect(47, 8, 46, 22); } else g.fillRoundedRect(47, 20, 46, 28, 14);
    g.fillStyle(coat, 1).fillTriangle(38, 92, 102, 92, 116, 238).fillTriangle(38, 92, 24, 238, 116, 238);
    g.fillStyle(accent, 1).fillTriangle(66, 94, 76, 94, 72, 158);
    g.fillStyle(0x121318, 1).fillRect(42, 226, 24, 50).fillRect(76, 226, 24, 50);
    g.fillStyle(coat, 1).fillRect(20, 103, 22, 112).fillRect(98, 103, 22, 112);
    g.lineStyle(3, 0xd9cfb6, 0.55).strokeCircle(70, 52, 28).strokeRoundedRect(31, 89, 78, 152, 8);
    g.generateTexture(key, 140, 280); g.destroy();
  }

  private createPortrait(key: string, coat: number, accent: number, hat: boolean): void {
    if (this.textures.exists(key)) return;
    const g = this.add.graphics();
    g.fillStyle(0x121318, 1).fillRect(0, 0, 160, 160);
    g.fillStyle(coat, 1).fillTriangle(16, 160, 144, 160, 80, 86);
    g.fillStyle(0xd0b69f, 1).fillCircle(80, 64, 38);
    g.fillStyle(0x090a0d, 1);
    if (hat) { g.fillRect(30, 31, 100, 12); g.fillRect(49, 10, 62, 28); } else g.fillRoundedRect(49, 18, 62, 36, 18);
    g.fillStyle(accent, 1).fillRect(42, 112, 76, 8);
    g.lineStyle(3, 0xd9cfb6, 0.7).strokeCircle(80, 64, 38);
    g.generateTexture(key, 160, 160); g.destroy();
  }

  private publishDebugSnapshot(vector: MovementVector): void {
    const position = this.player.position();
    const camera = this.cameras.main.worldView;
    const canvas = this.game.canvas;
    canvas.dataset.explorationReady = 'true';
    canvas.dataset.sandboxScene = SCENE_KEYS.exploration;
    canvas.dataset.playerX = position.x.toFixed(1);
    canvas.dataset.playerY = position.y.toFixed(1);
    canvas.dataset.inputX = vector.x.toFixed(2);
    canvas.dataset.inputY = vector.y.toFixed(2);
    canvas.dataset.cameraX = camera.x.toFixed(1);
    canvas.dataset.cameraY = camera.y.toFixed(1);
    canvas.dataset.nearestTarget = this.nearestInteractable()?.id ?? 'none';
    canvas.dataset.dialogue = this.dialogue.snapshot().scriptId ?? 'closed';
    canvas.dataset.lastInteraction = this.lastInteraction;
  }
}
