import Phaser from 'phaser';
import levelOneSource from '../../content/levels/level-1.lvl.txt?raw';
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
import type { LevelDefinition, LevelPlacement, LevelRoom } from '../levels/LevelDefinition';
import { buildLevelGeometry, levelPoint, placementRect, type LevelGeometry } from '../levels/LevelGeometry';
import { parseLevel } from '../levels/LevelParser';
import { DialogueBox } from '../ui/DialogueBox';

const FONT = '"Press Start 2P", monospace';

interface Interactable {
  id: string;
  x: number;
  y: number;
  range: number;
  activate: () => void;
}

const DIALOGUE: Record<string, DialogueScript> = {
  'npc.vera': {
    id: 'exploration-vera', speaker: 'VERA VALE', portraitKey: 'portrait-vera',
    pages: ['You found the lounge. Now find out who crossed it after midnight.', 'The wet footprints stop at the piano. Curious, isn\'t it?'],
  },
  'npc.miles': {
    id: 'exploration-miles', speaker: 'MILES PIKE', portraitKey: 'portrait-miles',
    pages: ['Keep your questions quiet. These walls collect secrets.', 'I was by the north windows when the lights failed.'],
  },
  'clue.torn-ledger': {
    id: 'exploration-ledger', speaker: 'DETECTIVE', portraitKey: 'portrait-detective',
    pages: ['A torn hotel ledger. Room 317 was entered twice after midnight.', 'PLACEHOLDER CLUE RECORDED // THE NOTEBOOK WILL REMEMBER THIS.'],
  },
};

export class ExplorationScene extends Phaser.Scene {
  private level!: LevelDefinition;
  private levelGeometry!: LevelGeometry;
  private player!: ExplorationPlayer;
  private dialogue!: DialogueBox;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>;
  private mobileVector: MobileMoveVector = { x: 0, y: 0 };
  private obstacles: Rect[] = [];
  private interactables: Interactable[] = [];
  private promptText!: Phaser.GameObjects.Text;
  private locationText!: Phaser.GameObjects.Text;
  private removeMobileMove?: () => void;
  private removeMobileControl?: () => void;
  private lastInteraction = 'exploration-ready';
  private currentRoomId = 'unknown';

  constructor() {
    super(SCENE_KEYS.exploration);
  }

  create(): void {
    const parsed = parseLevel(levelOneSource);
    if (!parsed.ok) {
      throw new Error(parsed.errors.map((error) => `Line ${error.line}: ${error.message}`).join('\n'));
    }
    this.level = parsed.level;
    this.levelGeometry = buildLevelGeometry(this.level);
    this.obstacles = [...this.levelGeometry.collisions];
    this.cameras.main.setBackgroundColor('#090a0d');
    this.cameras.main.setBounds(0, 0, this.levelGeometry.worldWidth, this.levelGeometry.worldHeight);
    this.createTextures();
    this.createLevelWorld();
    this.createLevelPlacements();
    const startRoom = this.room(this.level.start.roomId);
    const start = levelPoint(this.level, this.levelGeometry, startRoom, this.level.start.x, this.level.start.y);
    this.player = new ExplorationPlayer(this, start.x, start.y, 'exploration-detective');
    this.cameras.main.startFollow(this.player.gameObject(), true, 0.09, 0.09);
    this.dialogue = new DialogueBox(this);
    this.createHud();
    this.createInput();
    this.applyQaPose();
    this.publishDebugSnapshot({ x: 0, y: 0 });
  }

  update(_time: number, delta: number): void {
    const vector = this.dialogue.isOpen() ? { x: 0, y: 0 } : this.readMovement();
    this.player.update(vector, delta, this.levelGeometry.playerBounds, this.obstacles);
    this.updateCurrentRoom();
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

  private createLevelWorld(): void {
    this.add.rectangle(0, 0, this.levelGeometry.worldWidth * 2, this.levelGeometry.worldHeight * 2, 0x090a0d, 1).setOrigin(0).setDepth(-10);
    const floor = this.add.graphics().setDepth(0);

    this.level.rooms.forEach((room, roomIndex) => {
      room.map.forEach((row, localY) => row.forEach((tile, localX) => {
        const x = this.levelGeometry.offsetX + (room.originX + localX) * this.level.tileSize;
        const y = this.levelGeometry.offsetY + (room.originY + localY) * this.level.tileSize;
        if (tile !== '#') {
          const shade = roomIndex % 2 === 0 ? 0x17191f : 0x151820;
          floor.fillStyle(shade, 1).fillRect(x, y, this.level.tileSize, this.level.tileSize);
          floor.lineStyle(1, 0x252832, 0.58).strokeRect(x, y, this.level.tileSize, this.level.tileSize);
          if (tile === '+') {
            floor.fillStyle(0xc7a85b, 0.24).fillRect(x, y, this.level.tileSize, this.level.tileSize);
          }
        } else {
          this.add
            .rectangle(x, y, this.level.tileSize, this.level.tileSize, 0x0c0e13, 1)
            .setOrigin(0)
            .setStrokeStyle(2, 0x2b2d35, 0.8)
            .setDepth(100 + y + this.level.tileSize);
        }
      }));

      const center = levelPoint(this.level, this.levelGeometry, room, room.width / 2 - 0.5, 1);
      this.add
        .text(center.x, center.y, `${room.name.toUpperCase()} // ${room.width}x${room.height}`, {
          color: '#4f4a40', fontFamily: FONT, fontSize: '11px',
        })
        .setOrigin(0.5)
        .setDepth(80);
    });
  }

  private createLevelPlacements(): void {
    this.level.rooms.forEach((room) => room.placements.forEach((placement) => {
      if (placement.kind === 'prop') this.addProp(room, placement);
      else if (placement.kind === 'actor') this.addNpc(room, placement);
      else this.addClue(room, placement);
    }));
  }

  private addProp(room: LevelRoom, placement: LevelPlacement): void {
    const rect = placementRect(this.level, this.levelGeometry, room, placement);
    const prop = this.add.container(rect.x, rect.y + rect.height).setDepth(100 + rect.y + rect.height);
    const shadow = this.add.ellipse(rect.width / 2, 2, rect.width + 24, 28, 0x000000, 0.42);
    const body = this.add.rectangle(rect.width / 2, -rect.height / 2, rect.width, rect.height, 0x201b19, 1).setStrokeStyle(4, 0x39322b, 1);
    const name = this.add.text(rect.width / 2, -rect.height / 2, placement.archetype.toUpperCase().replaceAll('-', ' '), { color: '#817967', fontFamily: FONT, fontSize: '9px' }).setOrigin(0.5);
    prop.add([shadow, body, name]);
  }

  private addNpc(room: LevelRoom, placement: LevelPlacement): void {
    const point = levelPoint(this.level, this.levelGeometry, room, placement.x, placement.y);
    const texture = placement.archetype === 'vera' ? 'exploration-vera' : 'exploration-miles';
    const root = this.add.container(point.x, point.y).setDepth(100 + point.y);
    const shadow = this.add.ellipse(0, 0, 112, 26, 0x000000, 0.5);
    const body = this.add.image(0, 0, texture).setOrigin(0.5, 1).setInteractive({ useHandCursor: true });
    root.add([shadow, body]);
    body.on('pointerdown', () => this.openDialogue(placement.id));
    this.interactables.push({ id: placement.id, x: point.x, y: point.y, range: 175, activate: () => this.openDialogue(placement.id) });
  }

  private addClue(room: LevelRoom, placement: LevelPlacement): void {
    const point = levelPoint(this.level, this.levelGeometry, room, placement.x, placement.y);
    const clue = this.add.container(point.x, point.y).setDepth(100 + point.y);
    const halo = this.add.ellipse(0, 0, 62, 24, 0xc7a85b, 0.13);
    const marker = this.add.rectangle(0, -7, 42, 30, 0x8f2432, 1).setRotation(-0.14).setStrokeStyle(2, 0xd9cfb6, 0.62).setInteractive({ useHandCursor: true });
    clue.add([halo, marker]);
    marker.on('pointerdown', () => this.openDialogue(placement.id));
    this.interactables.push({ id: placement.id, x: point.x, y: point.y, range: 145, activate: () => this.openDialogue(placement.id) });
  }

  private createHud(): void {
    const hud = this.add.graphics().setScrollFactor(0).setDepth(9000);
    hud.fillStyle(0x090a0d, 0.86).fillRoundedRect(22, 20, 430, 70, 5);
    hud.lineStyle(2, 0x817967, 0.8).strokeRoundedRect(22, 20, 430, 70, 5);
    this.locationText = this.add.text(42, 36, 'AFTER MIDNIGHT // HOTEL MARLOWE', { color: '#d9cfb6', fontFamily: FONT, fontSize: '12px' }).setScrollFactor(0).setDepth(9001);
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
      .setText(nearest ? `A / E: ${nearest.id.startsWith('clue.') ? `INSPECT ${nearest.id.slice(5).replaceAll('-', ' ').toUpperCase()}` : `QUESTION ${nearest.id.slice(4).toUpperCase()}`}` : '')
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
    const script = DIALOGUE[id] ?? this.placeholderDialogue(id);
    this.dialogue.open(script, () => { this.lastInteraction = `closed-${id}`; });
  }

  private placeholderDialogue(id: string): DialogueScript {
    const label = id.split('.').at(-1)?.replaceAll('-', ' ').toUpperCase() ?? 'PLACEHOLDER';
    return {
      id: `level-placeholder-${id}`,
      speaker: 'DETECTIVE',
      portraitKey: 'portrait-detective',
      pages: [`${label}. A placeholder clue positioned by the Level 1 text file.`, `ROOM: ${this.currentRoomId.toUpperCase()} // STABLE ID: ${id}`],
    };
  }

  private setMobileLabels(a: string, b: string): void {
    const aLabel = document.querySelector<HTMLElement>('.action-a span');
    const bLabel = document.querySelector<HTMLElement>('.action-b span');
    if (aLabel) aLabel.textContent = a;
    if (bLabel) bLabel.textContent = b;
    document
      .querySelector<HTMLElement>('#mobile-controls')
      ?.classList.toggle('is-dialogue-open', this.dialogue?.isOpen() ?? false);
  }

  private room(id: string): LevelRoom {
    const room = this.level.rooms.find((candidate) => candidate.id === id);
    if (!room) throw new Error(`Unknown room: ${id}`);
    return room;
  }

  private updateCurrentRoom(): void {
    const position = this.player.position();
    const worldTileX = Math.floor((position.x - this.levelGeometry.offsetX) / this.level.tileSize);
    const worldTileY = Math.floor((position.y - this.levelGeometry.offsetY) / this.level.tileSize);
    const room = this.level.rooms.find((candidate) =>
      worldTileX >= candidate.originX && worldTileX < candidate.originX + candidate.width &&
      worldTileY >= candidate.originY && worldTileY < candidate.originY + candidate.height,
    );
    if (room && room.id !== this.currentRoomId) {
      this.currentRoomId = room.id;
      this.locationText.setText(`LEVEL 1 // ${room.name.toUpperCase()}`);
      this.lastInteraction = `entered-room-${room.id}`;
    }
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
    if (pose === 'exploration-dialogue') this.openDialogue('npc.vera');
    const roomPose = pose?.startsWith('level-room-') ? pose.slice('level-room-'.length) : undefined;
    if (roomPose) {
      const room = this.level.rooms.find((candidate) => candidate.id === roomPose);
      if (room) {
        const poseX = room.id === 'office' ? 6 : Math.floor(room.width / 2);
        const point = levelPoint(this.level, this.levelGeometry, room, poseX, Math.floor(room.height / 2));
        this.player.setPosition(point.x, point.y);
        this.cameras.main.centerOn(point.x, point.y);
        this.lastInteraction = `qa-pose-${pose}`;
      }
    }
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
    canvas.dataset.levelId = this.level.id;
    canvas.dataset.roomId = this.currentRoomId;
    canvas.dataset.roomCount = this.level.rooms.length.toString();
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
