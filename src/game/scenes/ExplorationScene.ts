import Phaser from 'phaser';
import { resolveLevelOneInteraction, type LevelOneInteractionVariant } from '../../content/cases/levelOneCaseContent';
import levelOneSource from '../../content/levels/level-1.lvl.txt?raw';
import { EXPLORATION_CHARACTER_SCALE, ExplorationPlayer } from '../actors/ExplorationPlayer';
import { GAME_WIDTH, SCENE_KEYS } from '../constants';
import type { DialogueScript } from '../features/dialogue/DialogueModel';
import { LevelOneCaseState } from '../features/case/LevelOneCaseState';
import { applyLevelOneInteractionClose } from '../features/case/LevelOneInteractionController';
import type { LevelOneAccusationResult } from '../features/case/LevelOneAccusation';
import { solveLevelOneCase } from '../features/case/LevelOneSolutionPath';
import { LevelOneReenactment } from '../features/case/LevelOneReenactment';
import { gateTransitionInput } from '../features/navigation/TransitionInputGate';
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
import { resolveRoomTransition, type RoomTransitionDestination } from '../levels/RoomTransitionModel';
import { LevelOneTimeline, type LevelOneTimelineBeat } from '../features/timeline/LevelOneTimeline';
import {
  AlteredLoopRestage,
  type AlteredLoopActorMark,
  type AlteredLoopPhase,
  type AlteredLoopPhaseId,
} from '../features/timeline/AlteredLoopRestage';
import { CaseBoard } from '../ui/CaseBoard';
import { DialogueBox } from '../ui/DialogueBox';
import { ReenactmentHud } from '../ui/ReenactmentHud';
import { AlteredLoopHud } from '../ui/AlteredLoopHud';
import { LEVEL_ONE_REENACTMENT_BEATS, type LevelOneReenactmentBeat, type ReenactmentStageAction } from '../../content/cases/levelOneReenactmentContent';

const FONT = '"Press Start 2P", monospace';

interface Interactable {
  id: string;
  roomId: string;
  x: number;
  y: number;
  range: number;
  activate: () => void;
}

type RoomTransitionState = 'idle' | 'fading-out' | 'relocating' | 'fading-in';

export class ExplorationScene extends Phaser.Scene {
  private readonly caseState = new LevelOneCaseState();
  private readonly timeline = new LevelOneTimeline();
  private readonly alteredLoopRestage = new AlteredLoopRestage();
  private readonly reenactment = new LevelOneReenactment(this.caseState);
  private level!: LevelDefinition;
  private levelGeometry!: LevelGeometry;
  private player!: ExplorationPlayer;
  private dialogue!: DialogueBox;
  private caseBoard!: CaseBoard;
  private reenactmentHud!: ReenactmentHud;
  private alteredLoopHud!: AlteredLoopHud;
  private alteredLoopRoute!: Phaser.GameObjects.Graphics;
  private alteredLoopDoorLabel!: Phaser.GameObjects.Text;
  private reenactmentActor!: Phaser.GameObjects.Container;
  private reenactmentActorBody!: Phaser.GameObjects.Image;
  private reenactmentOfficer!: Phaser.GameObjects.Container;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>;
  private mobileVector: MobileMoveVector = { x: 0, y: 0 };
  private obstacles: Rect[] = [];
  private readonly roomObjects = new Map<string, Phaser.GameObjects.GameObject[]>();
  private readonly roomObstacles = new Map<string, Rect[]>();
  private readonly npcRoots = new Map<string, Phaser.GameObjects.Container>();
  private readonly npcBodies = new Map<string, Phaser.GameObjects.Image>();
  private interactables: Interactable[] = [];
  private promptText!: Phaser.GameObjects.Text;
  private locationText!: Phaser.GameObjects.Text;
  private caseText!: Phaser.GameObjects.Text;
  private readonly explorationHudObjects: Array<Phaser.GameObjects.GameObject & { setVisible(visible: boolean): unknown }> = [];
  private removeMobileMove?: () => void;
  private removeMobileControl?: () => void;
  private lastInteraction = 'exploration-ready';
  private currentRoomId = 'unknown';
  private transitionState: RoomTransitionState = 'idle';
  private transition?: RoomTransitionDestination;
  private lastTransition?: RoomTransitionDestination;
  private requiresNeutralInput = false;
  private lastTimelineBeat = 'none';
  private lastHudSecond = -1;
  private debugSolveSteps: readonly string[] = [];
  private lastReenactmentBeat = 'none';
  private lastAlteredLoopPhase = 'none';
  private alteredLoopQaFrozen = false;
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(window.location.search).get('reducedMotion') === '1';

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
    this.cameras.main.setBackgroundColor('#090a0d');
    this.cameras.main.setBounds(0, 0, this.levelGeometry.worldWidth, this.levelGeometry.worldHeight);
    this.createTextures();
    this.createLevelWorld();
    this.createLevelPlacements();
    const startRoom = this.room(this.level.start.roomId);
    this.currentRoomId = startRoom.id;
    this.activateRoom(startRoom.id);
    const start = levelPoint(this.level, this.levelGeometry, startRoom, this.level.start.x, this.level.start.y);
    this.player = new ExplorationPlayer(this, start.x, start.y, 'exploration-detective');
    this.createReenactmentActors();
    this.setCameraForRoom(startRoom);
    this.dialogue = new DialogueBox(this);
    this.createHud();
    this.createCaseBoard();
    this.createReenactmentHud();
    this.createAlteredLoopPresentation();
    this.createInput();
    this.game.events.on('case-closed:return', this.returnFromCaseClosed, this);
    this.applyQaPose();
    this.publishDebugSnapshot({ x: 0, y: 0 });
  }

  update(_time: number, delta: number): void {
    this.updateReenactment(delta);
    this.updateAlteredLoopRestage(delta);
    const physicalVector = this.readMovement();
    const interfaceOpen = this.dialogue.isOpen() || this.caseBoard.isOpen() || this.isReenactmentActive() || this.isAlteredLoopRestageActive();
    const gated = gateTransitionInput(physicalVector, this.transitionState !== 'idle', interfaceOpen, this.requiresNeutralInput);
    this.requiresNeutralInput = gated.requiresNeutral;
    const vector = gated.vector;
    this.player.update(vector, delta, this.roomBounds(this.room(this.currentRoomId)), this.obstacles);
    this.checkDoorTransition();
    this.updateTimeline(delta);
    this.updatePrompt();
    this.publishDebugSnapshot(vector);
  }

  private createInput(): void {
    if (!this.input.keyboard) return;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = { up: this.input.keyboard.addKey('W'), down: this.input.keyboard.addKey('S'), left: this.input.keyboard.addKey('A'), right: this.input.keyboard.addKey('D') };
    this.input.keyboard.on('keydown-E', () => {
      if (this.isAlteredLoopRestageActive() || this.isReenactmentActive()) return;
      if (this.transitionState === 'idle') this.activateNearest();
    });
    this.input.keyboard.on('keydown-N', () => {
      if (this.isAlteredLoopRestageActive() || this.isReenactmentActive()) return;
      if (!this.dialogue.isOpen() && this.transitionState === 'idle') this.caseBoard.toggle();
    });
    this.input.keyboard.on('keydown-T', () => {
      if (this.isAlteredLoopRestageActive() || this.isReenactmentActive()) return;
      if (!this.dialogue.isOpen() && this.transitionState === 'idle') this.caseBoard.open('timeline');
    });
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.isReenactmentActive()) this.toggleReenactmentPause();
    });
    this.input.keyboard.on('keydown-ESC', () => {
      if (this.isAlteredLoopRestageActive()) {
        this.alteredLoopHud.requestEnd();
        return;
      }
      if (this.isReenactmentActive()) this.reenactmentHud.requestSkip();
    });
    this.removeMobileMove = onMobileMove((vector) => { this.mobileVector = vector; });
    this.removeMobileControl = onMobileControl((control) => this.handleMobileControl(control));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.removeMobileMove?.();
      this.removeMobileControl?.();
      this.cameras.main.removeAllListeners(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE);
      this.cameras.main.removeAllListeners(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE);
      this.cameras.main.resetFX();
      document.querySelector<HTMLElement>('#mobile-controls')?.classList.remove('is-room-transitioning');
      this.caseBoard.destroy();
      this.reenactmentHud.destroy();
      this.alteredLoopHud.destroy();
      this.game.events.off('case-closed:return', this.returnFromCaseClosed, this);
      document.querySelector<HTMLElement>('#mobile-controls')?.removeAttribute('aria-hidden');
    });
  }

  private readMovement(): MovementVector {
    const x = Number(this.cursors.right.isDown || this.wasd.right.isDown) - Number(this.cursors.left.isDown || this.wasd.left.isDown) + this.mobileVector.x;
    const y = Number(this.cursors.down.isDown || this.wasd.down.isDown) - Number(this.cursors.up.isDown || this.wasd.up.isDown) + this.mobileVector.y;
    return normalizeMovementVector(x, y);
  }

  private handleMobileControl(control: MobileControl): void {
    if (this.transitionState !== 'idle') return;
    if (this.isAlteredLoopRestageActive()) return;
    if (this.isReenactmentActive()) return;
    if (this.caseBoard.isOpen()) {
      if (control === 'action-b') this.caseBoard.close();
      return;
    }
    if (control === 'action-a') {
      this.dialogue.isOpen() ? this.dialogue.advance() : this.activateNearest();
    } else if (control === 'action-b' && this.dialogue.isOpen()) {
      this.dialogue.dismiss();
    } else if (control === 'action-b') {
      this.caseBoard.open();
    }
  }

  private createLevelWorld(): void {
    this.add.rectangle(0, 0, this.levelGeometry.worldWidth * 2, this.levelGeometry.worldHeight * 2, 0x090a0d, 1).setOrigin(0).setDepth(-10);

    this.level.rooms.forEach((room, roomIndex) => {
      const floor = this.trackRoomObject(room.id, this.add.graphics().setDepth(0));
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
          const wall = this.add
            .rectangle(x, y, this.level.tileSize, this.level.tileSize, 0x0c0e13, 1)
            .setOrigin(0)
            .setStrokeStyle(2, 0x2b2d35, 0.8)
            .setDepth(100 + y + this.level.tileSize);
          this.trackRoomObject(room.id, wall);
        }
      }));

      const center = levelPoint(this.level, this.levelGeometry, room, room.width / 2 - 0.5, 1);
      const label = this.add
        .text(center.x, center.y, `${room.name.toUpperCase()} // ${room.width}x${room.height}`, {
          color: '#4f4a40', fontFamily: FONT, fontSize: '11px',
        })
        .setOrigin(0.5)
        .setDepth(80);
      this.trackRoomObject(room.id, label);
      this.roomObstacles.set(room.id, this.collisionsForRoom(room));
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
    const style = this.propStyle(placement.archetype);
    const prop = this.add.container(rect.x, rect.y + rect.height).setDepth(100 + rect.y + rect.height);
    const shadow = this.add.ellipse(rect.width / 2, 2, rect.width + 24, 28, 0x000000, 0.42);
    const body = this.add.rectangle(rect.width / 2, -rect.height / 2, rect.width, rect.height, style.body, 1).setStrokeStyle(4, 0x39322b, 1);
    const accent = this.add.rectangle(rect.width / 2, -rect.height + 9, Math.max(12, rect.width - 12), 8, style.accent, 0.58);
    const name = this.add.text(rect.width / 2, -rect.height / 2, placement.archetype.toUpperCase().replaceAll('-', ' '), { color: '#817967', fontFamily: FONT, fontSize: '9px' }).setOrigin(0.5);
    prop.add([shadow, body, accent, name]);
    this.trackRoomObject(room.id, prop);
  }

  private propStyle(archetype: string): { body: number; accent: number } {
    if (archetype.includes('bed')) return { body: 0x321b22, accent: 0x8f2432 };
    if (archetype.includes('piano')) return { body: 0x101218, accent: 0xd9cfb6 };
    if (archetype.includes('sofa') || archetype.includes('chair')) return { body: 0x24212a, accent: 0x8f2432 };
    if (archetype.includes('counter') || archetype.includes('desk')) return { body: 0x26211d, accent: 0xc7a85b };
    if (archetype.includes('clock') || archetype.includes('switchboard')) return { body: 0x20231f, accent: 0xc7a85b };
    return { body: 0x201b19, accent: 0x817967 };
  }

  private addNpc(room: LevelRoom, placement: LevelPlacement): void {
    const point = levelPoint(this.level, this.levelGeometry, room, placement.x, placement.y);
    const texture = `exploration-${placement.archetype}`;
    const root = this.add.container(point.x, point.y).setDepth(100 + point.y);
    const shadow = this.add.ellipse(0, 0, 80, 19, 0x000000, 0.5);
    const body = this.add.image(0, 0, texture).setOrigin(0.5, 1).setScale(EXPLORATION_CHARACTER_SCALE);
    const hitTarget = this.add.rectangle(0, -100, 96, 210, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
    root.add([shadow, body, hitTarget]);
    this.npcRoots.set(placement.id, root);
    this.npcBodies.set(placement.id, body);
    hitTarget.on('pointerdown', () => {
      if (!this.isAlteredLoopRestageActive() && !this.isReenactmentActive() && this.currentRoomId === room.id && this.transitionState === 'idle') this.openDialogue(placement.id);
    });
    this.trackRoomObject(room.id, root);
    this.interactables.push({ id: placement.id, roomId: room.id, x: point.x, y: point.y, range: 175, activate: () => this.openDialogue(placement.id) });
  }

  private addClue(room: LevelRoom, placement: LevelPlacement): void {
    const point = levelPoint(this.level, this.levelGeometry, room, placement.x, placement.y);
    const clue = this.add.container(point.x, point.y).setDepth(100 + point.y);
    const halo = this.add.ellipse(0, 0, 62, 24, 0xc7a85b, 0.13);
    const clueColor = placement.archetype === 'wet-footprints' ? 0x718293 : placement.archetype === 'stopped-watch' ? 0xc7a85b : 0x8f2432;
    const marker = this.add.rectangle(0, -7, 42, 30, clueColor, 1).setRotation(-0.14).setStrokeStyle(2, 0xd9cfb6, 0.62).setInteractive({ useHandCursor: true });
    clue.add([halo, marker]);
    marker.on('pointerdown', () => {
      if (!this.isAlteredLoopRestageActive() && !this.isReenactmentActive() && this.currentRoomId === room.id && this.transitionState === 'idle') this.openDialogue(placement.id);
    });
    this.trackRoomObject(room.id, clue);
    this.interactables.push({ id: placement.id, roomId: room.id, x: point.x, y: point.y, range: 145, activate: () => this.openDialogue(placement.id) });
  }

  private createHud(): void {
    const hud = this.add.graphics().setScrollFactor(0).setDepth(9000);
    hud.fillStyle(0x090a0d, 0.86).fillRoundedRect(22, 20, 430, 70, 5);
    hud.lineStyle(2, 0x817967, 0.8).strokeRoundedRect(22, 20, 430, 70, 5);
    hud.fillStyle(0x090a0d, 0.86).fillRoundedRect(844, 20, 414, 70, 5);
    hud.lineStyle(2, 0x817967, 0.8).strokeRoundedRect(844, 20, 414, 70, 5);
    this.locationText = this.add.text(42, 36, 'AFTER MIDNIGHT // HOTEL MARLOWE', { color: '#d9cfb6', fontFamily: FONT, fontSize: '12px' }).setScrollFactor(0).setDepth(9001);
    const helpText = this.add.text(42, 61, 'MOVE: WASD / ARROWS  //  CASE: N / B', { color: '#817967', fontFamily: FONT, fontSize: '9px' }).setScrollFactor(0).setDepth(9001);
    this.caseText = this.add.text(864, 34, '', { color: '#c7a85b', fontFamily: FONT, fontSize: '9px', lineSpacing: 8 }).setScrollFactor(0).setDepth(9001);
    this.promptText = this.add.text(GAME_WIDTH / 2, 452, '', { color: '#c7a85b', backgroundColor: '#090a0ddd', fontFamily: FONT, fontSize: '12px', padding: { x: 14, y: 9 } }).setOrigin(0.5).setScrollFactor(0).setDepth(9001);
    this.explorationHudObjects.push(hud, this.locationText, helpText, this.caseText, this.promptText);
    this.updateCaseHud();
    this.setMobileLabels('ACT', 'BACK');
  }

  private createCaseBoard(): void {
    this.caseBoard = new CaseBoard({
      state: this.caseState,
      timeline: this.timeline,
      onReplay: () => this.replayNight(),
      onSolved: (result) => this.completeLevelOne(result),
      onReplayReenactment: () => this.startReenactment(),
      onVisibilityChange: () => {
        this.mobileVector = { x: 0, y: 0 };
        this.updateCaseHud();
      },
    });
  }

  private createReenactmentActors(): void {
    const actor = (texture: string) => {
      const shadow = this.add.ellipse(0, 0, 80, 19, 0x000000, 0.58);
      const body = this.add.image(0, 0, texture).setOrigin(0.5, 1).setScale(EXPLORATION_CHARACTER_SCALE);
      const root = this.add.container(0, 0, [shadow, body]).setVisible(false);
      return { root, body };
    };
    const miles = actor('exploration-miles');
    this.reenactmentActor = miles.root;
    this.reenactmentActorBody = miles.body;
    this.reenactmentOfficer = actor('exploration-officer').root;
  }

  private createReenactmentHud(): void {
    this.reenactmentHud = new ReenactmentHud({
      onTogglePause: () => this.toggleReenactmentPause(),
      onSkip: () => this.finishReenactment('skipped'),
    });
  }

  private createAlteredLoopPresentation(): void {
    this.alteredLoopHud = new AlteredLoopHud({
      onExit: (openTimeline) => {
        this.finishAlteredLoopRestage('ended');
        if (openTimeline) this.caseBoard.open('timeline');
      },
    });
    this.alteredLoopRoute = this.add.graphics().setDepth(8_500).setVisible(false);
    this.alteredLoopDoorLabel = this.add
      .text(0, 0, 'MANAGER OFFICE\nDESTINATION', {
        color: '#d9cfb6',
        backgroundColor: '#090a0ddd',
        fontFamily: FONT,
        fontSize: '9px',
        align: 'center',
        padding: { x: 10, y: 7 },
      })
      .setOrigin(0.5, 1)
      .setDepth(8_501)
      .setVisible(false);
  }

  private isAlteredLoopRestageActive(): boolean {
    return this.alteredLoopRestage.snapshot().status === 'playing';
  }

  private startAlteredLoopRestage(phaseId: AlteredLoopPhaseId = 'reset', freeze = false): void {
    this.caseBoard.close();
    this.dialogue.dismiss();
    this.timeline.replay();
    this.mobileVector = { x: 0, y: 0 };
    this.alteredLoopQaFrozen = freeze;
    this.prepareAlteredLoopStage();
    const phase = this.alteredLoopRestage.start(phaseId);
    this.stageAlteredLoopPhase(phase, freeze);
    if (freeze) this.settleAlteredLoopQaPose(phase);
    this.lastInteraction = `altered-loop-started-${phase.id}`;
  }

  private prepareAlteredLoopStage(): void {
    const lounge = this.room('lounge');
    this.activateRoom(lounge.id);
    const playerMark = levelPoint(this.level, this.levelGeometry, lounge, 15, 14);
    this.player.setPosition(playerMark.x, playerMark.y);
    this.player.gameObject().setVisible(false);
    document.querySelector<HTMLElement>('#mobile-controls')?.setAttribute('aria-hidden', 'true');
    this.setNpcAtAlteredLoopMark('npc.miles', 'windows');
    this.moveNpcToMark('npc.vera', 'desk');
    this.drawAlteredLoopRoute();
    this.alteredLoopRoute.setVisible(false);
    this.alteredLoopDoorLabel.setVisible(false);
    this.cameras.main.stopFollow();
    this.setReenactmentCamera(lounge, 23, 6, 0.78);
  }

  private updateAlteredLoopRestage(delta: number): void {
    if (this.alteredLoopQaFrozen) return;
    const update = this.alteredLoopRestage.update(delta);
    update.entered.forEach((phase) => this.stageAlteredLoopPhase(phase));
    if (update.finished) this.finishAlteredLoopRestage('completed');
  }

  private stageAlteredLoopPhase(phase: AlteredLoopPhase, qaPose = false): void {
    this.lastAlteredLoopPhase = phase.id;
    this.alteredLoopHud.show(phase, this.reducedMotion);
    const miles = this.npcRoots.get('npc.miles');
    if (!miles) return;

    if (phase.id === 'reset') {
      this.setNpcAtAlteredLoopMark('npc.miles', 'windows');
      if (!qaPose) this.cameras.main.fadeOut(180, 0, 0, 0);
    } else if (phase.id === 'establish') {
      if (!qaPose) this.cameras.main.fadeIn(220, 0, 0, 0);
      this.setReenactmentCamera(this.room('lounge'), 23, 6, 0.78);
    } else if (phase.id === 'anticipate') {
      this.alteredLoopRoute.setVisible(true);
      this.alteredLoopDoorLabel.setVisible(true);
      miles.setAngle(-2);
    } else if (phase.id === 'transit-1') {
      this.alteredLoopRoute.setVisible(true);
      this.alteredLoopDoorLabel.setVisible(true);
      this.cameras.main.startFollow(miles, true, 0.045, 0.045);
      this.slideNpcForAlteredLoop('npc.miles', 'center-aisle', 2_600);
    } else if (phase.id === 'transit-2') {
      this.slideNpcForAlteredLoop('npc.miles', 'office-door', 2_600);
    } else if (phase.id === 'arrived') {
      this.setNpcAtAlteredLoopMark('npc.miles', 'office-door');
      this.alteredLoopRoute.setVisible(false);
      this.alteredLoopDoorLabel.setVisible(true);
    } else if (phase.recordsObservation) {
      this.caseState.record('guided-altered-loop', [
        'observation.miles-office-check',
        'timeline.miles-office-deviation',
      ]);
      this.lastTimelineBeat = 'variant.miles-office-check';
      this.updateCaseHud();
    }
    this.lastInteraction = `altered-loop-phase-${phase.id}`;
  }

  private alteredLoopPoint(mark: AlteredLoopActorMark): Phaser.Math.Vector2 {
    const local = {
      windows: { x: 23, y: 4 },
      'center-aisle': { x: 14, y: 11 },
      'office-door': { x: 2, y: 15 },
    }[mark];
    const point = levelPoint(this.level, this.levelGeometry, this.room('lounge'), local.x, local.y);
    return new Phaser.Math.Vector2(point.x, point.y);
  }

  private setNpcAtAlteredLoopMark(actorId: string, mark: AlteredLoopActorMark): void {
    const root = this.npcRoots.get(actorId);
    const body = this.npcBodies.get(actorId);
    if (!root) return;
    const point = this.alteredLoopPoint(mark);
    this.tweens.killTweensOf(root);
    if (body) this.tweens.killTweensOf(body);
    root.setPosition(point.x, point.y).setAngle(0).setDepth(100 + point.y).setVisible(true);
    body?.setY(0);
    const interactable = this.interactables.find((target) => target.id === actorId);
    if (interactable) {
      interactable.x = point.x;
      interactable.y = point.y;
    }
  }

  private slideNpcForAlteredLoop(actorId: string, mark: AlteredLoopActorMark, duration: number): void {
    const root = this.npcRoots.get(actorId);
    const body = this.npcBodies.get(actorId);
    if (!root) return;
    const destination = this.alteredLoopPoint(mark);
    if (this.reducedMotion) {
      this.setNpcAtAlteredLoopMark(actorId, mark);
      return;
    }
    this.tweens.killTweensOf(root);
    if (body) {
      this.tweens.killTweensOf(body);
      body.setY(0);
      this.tweens.add({ targets: body, y: -4, duration: 220, ease: 'Sine.easeInOut', yoyo: true, repeat: 5 });
    }
    const direction = Math.sign(destination.x - root.x) || 1;
    const interactable = this.interactables.find((target) => target.id === actorId);
    this.tweens.add({
      targets: root,
      x: destination.x,
      y: destination.y,
      angle: direction * 3,
      duration,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        root.setDepth(100 + root.y);
        if (interactable) {
          interactable.x = root.x;
          interactable.y = root.y;
        }
      },
      onComplete: () => {
        root.setAngle(0);
        body?.setY(0);
      },
    });
  }

  private drawAlteredLoopRoute(): void {
    const start = this.alteredLoopPoint('windows');
    const middle = this.alteredLoopPoint('center-aisle');
    const end = this.alteredLoopPoint('office-door');
    this.alteredLoopRoute.clear();
    this.alteredLoopRoute.lineStyle(5, 0xc7a85b, 0.34).beginPath().moveTo(start.x, start.y).lineTo(middle.x, middle.y).lineTo(end.x, end.y).strokePath();
    this.alteredLoopRoute.fillStyle(0xc7a85b, 0.72).fillCircle(middle.x, middle.y, 7).fillCircle(end.x, end.y, 9);
    this.alteredLoopDoorLabel.setPosition(end.x, end.y - 32);
  }

  private settleAlteredLoopQaPose(phase: AlteredLoopPhase): void {
    this.cameras.main.resetFX();
    this.setNpcAtAlteredLoopMark('npc.miles', phase.actorMark);
    if (phase.id === 'anticipate' || phase.id.startsWith('transit')) this.alteredLoopRoute.setVisible(true);
    if (phase.id !== 'reset' && phase.id !== 'establish') this.alteredLoopDoorLabel.setVisible(true);
    const miles = this.npcRoots.get('npc.miles');
    if (miles && (phase.id.startsWith('transit') || phase.id === 'arrived' || phase.id === 'recorded')) {
      this.cameras.main.stopFollow();
      this.cameras.main.centerOn(miles.x, miles.y);
    }
  }

  private finishAlteredLoopRestage(reason: 'completed' | 'ended'): void {
    if (reason === 'ended') this.alteredLoopRestage.end();
    this.alteredLoopQaFrozen = false;
    this.cameras.main.resetFX();
    const miles = this.npcRoots.get('npc.miles');
    const body = this.npcBodies.get('npc.miles');
    if (miles) this.tweens.killTweensOf(miles);
    if (body) this.tweens.killTweensOf(body);
    this.alteredLoopRoute.setVisible(false);
    this.alteredLoopDoorLabel.setVisible(false);
    this.alteredLoopHud.hide();
    document.querySelector<HTMLElement>('#mobile-controls')?.removeAttribute('aria-hidden');
    this.player.gameObject().setVisible(true);
    this.activateRoom('lounge');
    this.setCameraForRoom(this.room('lounge'));
    this.lastInteraction = `altered-loop-${reason}`;
    this.updateCaseHud();
  }

  private isReenactmentActive(): boolean {
    const status = this.reenactment.snapshot().status;
    return status === 'playing' || status === 'paused';
  }

  private startReenactment(beatId?: string, freeze = false): void {
    const beat = this.reenactment.start(beatId);
    if (!beat) return;
    this.caseBoard.close();
    this.setExplorationHudVisible(false);
    document.querySelector<HTMLElement>('#mobile-controls')?.setAttribute('aria-hidden', 'true');
    this.player.gameObject().setVisible(false);
    this.reenactmentActor.setVisible(true);
    this.reenactmentOfficer.setVisible(false);
    this.mobileVector = { x: 0, y: 0 };
    this.stageReenactmentBeat(beat);
    if (freeze) {
      this.settleReenactmentPose(beat);
      this.toggleReenactmentPause();
    }
    this.lastInteraction = `reenactment-started-${beat.id}`;
  }

  private updateReenactment(delta: number): void {
    const update = this.reenactment.update(delta);
    update.entered.forEach((beat) => this.stageReenactmentBeat(beat));
    if (update.finished) this.finishReenactment('completed');
  }

  private toggleReenactmentPause(): boolean {
    const status = this.reenactment.togglePause();
    const paused = status === 'paused';
    if (paused) this.tweens.pauseAll();
    else if (status === 'playing') this.tweens.resumeAll();
    this.reenactmentHud.setPaused(paused);
    this.lastInteraction = paused ? 'reenactment-paused' : 'reenactment-resumed';
    return paused;
  }

  private finishReenactment(reason: 'completed' | 'skipped'): void {
    if (reason === 'skipped') this.reenactment.skip();
    this.tweens.resumeAll();
    this.tweens.killTweensOf(this.reenactmentActor);
    this.tweens.killTweensOf(this.reenactmentActorBody);
    this.reenactmentActor.setVisible(false);
    this.reenactmentOfficer.setVisible(false);
    this.reenactmentHud.hide();
    this.lastInteraction = `reenactment-${reason}`;
    this.scene.launch(SCENE_KEYS.caseClosed, {
      solved: this.caseState.has('outcome.level-one-solved'),
      knowledgeCount: this.caseState.snapshot().flags.length,
    });
    this.scene.pause(SCENE_KEYS.exploration);
  }

  private returnFromCaseClosed(): void {
    this.scene.resume(SCENE_KEYS.exploration);
    document.querySelector<HTMLElement>('#mobile-controls')?.removeAttribute('aria-hidden');
    this.player.gameObject().setVisible(true);
    this.setExplorationHudVisible(true);
    this.activateRoom('lounge');
    this.setCameraForRoom(this.room('lounge'));
    this.caseBoard.open('accuse');
    this.lastInteraction = 'case-closed-returned';
    this.updateCaseHud();
  }

  private setExplorationHudVisible(visible: boolean): void {
    this.explorationHudObjects.forEach((object) => object.setVisible(visible));
  }

  private stageReenactmentBeat(beat: LevelOneReenactmentBeat): void {
    this.lastReenactmentBeat = beat.id;
    this.reenactmentHud.show(beat, this.reducedMotion);
    this.reenactmentActor.setAlpha(beat.provenance === 'INFERRED' ? 0.56 : 1).setAngle(0);
    this.reenactmentOfficer.setVisible(false);
    this.tweens.killTweensOf(this.reenactmentActor);
    this.tweens.killTweensOf(this.reenactmentActorBody);
    this.reenactmentActorBody.setY(0);
    this.stageReenactmentAction(beat.stageAction, beat.roomId);
    this.npcRoots.forEach((root) => root.setVisible(false));
    this.lastInteraction = `reenactment-beat-${beat.id}`;
  }

  private stageReenactmentAction(action: ReenactmentStageAction, roomId: LevelOneReenactmentBeat['roomId']): void {
    const room = this.room(roomId);
    this.activateRoom(room.id);
    const place = (target: Phaser.GameObjects.Container, x: number, y: number) => {
      const point = levelPoint(this.level, this.levelGeometry, room, x, y);
      target.setPosition(point.x, point.y).setDepth(100 + point.y);
      return point;
    };
    if (action === 'title') {
      this.reenactmentActor.setVisible(false);
      this.setReenactmentCamera(room, 15, 14, 0.58);
      return;
    }
    this.reenactmentActor.setVisible(true);
    if (action === 'miles-window-alibi') {
      place(this.reenactmentActor, 23, 4);
      this.setReenactmentCamera(room, 23, 6, 0.8);
      return;
    }
    if (action === 'key-ledger') {
      place(this.reenactmentActor, 18, 6);
      this.setReenactmentCamera(room, 12, 6, 0.72);
      this.slideReenactmentActor(levelPoint(this.level, this.levelGeometry, room, 11, 6), 3_100);
      return;
    }
    if (action === 'room-317-door') {
      place(this.reenactmentActor, 3, 5);
      this.setReenactmentCamera(room, 3, 4, 0.9);
      return;
    }
    if (action === 'office-deviation') {
      place(this.reenactmentActor, 23, 4);
      this.setReenactmentCamera(room, 23, 6, 0.72);
      this.cameras.main.startFollow(this.reenactmentActor, true, 0.045, 0.045);
      this.slideReenactmentActor(levelPoint(this.level, this.levelGeometry, room, 2, 15), 4_800);
      return;
    }
    place(this.reenactmentActor, 14, 14);
    place(this.reenactmentOfficer, 17, 14);
    this.reenactmentOfficer.setVisible(true).setAlpha(0.84);
    this.reenactmentActor.setAlpha(1);
    this.setReenactmentCamera(room, 15, 14, 0.72);
  }

  private settleReenactmentPose(beat: LevelOneReenactmentBeat): void {
    this.tweens.killTweensOf(this.reenactmentActor);
    this.tweens.killTweensOf(this.reenactmentActorBody);
    this.reenactmentActor.setAngle(0);
    this.reenactmentActorBody.setY(0);
    const room = this.room(beat.roomId);
    const destination = beat.stageAction === 'key-ledger'
      ? { x: 11, y: 6 }
      : beat.stageAction === 'office-deviation'
        ? { x: 2, y: 15 }
        : null;
    if (!destination) return;
    const point = levelPoint(this.level, this.levelGeometry, room, destination.x, destination.y);
    this.reenactmentActor.setPosition(point.x, point.y).setDepth(100 + point.y);
    if (beat.stageAction === 'office-deviation') {
      this.cameras.main.stopFollow();
      this.cameras.main.centerOn(point.x, point.y);
    }
  }

  private slideReenactmentActor(destination: { x: number; y: number }, duration: number): void {
    if (this.reducedMotion) {
      this.reenactmentActor.setPosition(destination.x, destination.y).setDepth(100 + destination.y);
      return;
    }
    const direction = Math.sign(destination.x - this.reenactmentActor.x) || 1;
    this.tweens.add({ targets: this.reenactmentActorBody, y: -4, duration: 220, ease: 'Sine.easeInOut', yoyo: true, repeat: 8 });
    this.tweens.add({
      targets: this.reenactmentActor,
      x: destination.x,
      y: destination.y,
      angle: direction * 3,
      duration,
      ease: 'Sine.easeInOut',
      onUpdate: () => this.reenactmentActor.setDepth(100 + this.reenactmentActor.y),
      onComplete: () => {
        this.reenactmentActor.setAngle(0);
        this.reenactmentActorBody.setY(0);
      },
    });
  }

  private setReenactmentCamera(room: LevelRoom, localX: number, localY: number, zoom: number): void {
    const bounds = this.roomBounds(room);
    const point = levelPoint(this.level, this.levelGeometry, room, localX, localY);
    this.cameras.main.stopFollow();
    this.cameras.main.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
    this.cameras.main.setZoom(zoom);
    this.cameras.main.centerOn(point.x, point.y);
  }

  private updateTimeline(delta: number): void {
    const paused = this.transitionState !== 'idle' || this.dialogue.isOpen() || this.caseBoard.isOpen() || this.isReenactmentActive() || this.isAlteredLoopRestageActive();
    this.timeline.setRunning(!paused);
    // The altered event is deduction-critical, so it only plays through the guided restaging.
    const events = this.timeline.update(delta, false);
    events.forEach((beat) => this.applyTimelineBeat(beat));
    const second = Math.floor(this.timeline.snapshot().elapsedMs / 1_000);
    if (second !== this.lastHudSecond) {
      this.lastHudSecond = second;
      this.updateCaseHud();
    }
  }

  private applyTimelineBeat(beat: LevelOneTimelineBeat): void {
    this.lastTimelineBeat = beat.id;
    this.lastInteraction = `timeline-${beat.id}`;
    if (beat.actorId && beat.mark) this.moveNpcToMark(beat.actorId, beat.mark);
    this.updateCaseHud();
  }

  private moveNpcToMark(actorId: string, mark: NonNullable<LevelOneTimelineBeat['mark']>): void {
    const root = this.npcRoots.get(actorId);
    const body = this.npcBodies.get(actorId);
    const lounge = this.room('lounge');
    if (!root) return;
    const local = {
      windows: { x: 23, y: 4 },
      'office-door': { x: 2, y: 15 },
      piano: { x: 20, y: 6 },
      desk: { x: 8, y: 4 },
    }[mark];
    const point = levelPoint(this.level, this.levelGeometry, lounge, local.x, local.y);
    const interactable = this.interactables.find((target) => target.id === actorId);
    const travelDistance = Phaser.Math.Distance.Between(root.x, root.y, point.x, point.y);
    const travelDuration = Phaser.Math.Clamp((travelDistance / 480) * 1_000, 700, 3_400);
    this.tweens.killTweensOf(root);
    if (body) {
      this.tweens.killTweensOf(body);
      body.setY(0);
      this.tweens.add({
        targets: body,
        y: -4,
        duration: 210,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: Math.max(1, Math.floor(travelDuration / 420) - 1),
      });
    }
    const direction = Math.sign(point.x - root.x) || 1;
    this.tweens.add({
      targets: root,
      x: point.x,
      y: point.y,
      angle: direction * 3,
      duration: travelDuration,
      ease: 'Sine.easeInOut',
      yoyo: false,
      onUpdate: () => {
        root.setDepth(100 + root.y);
        if (interactable) {
          interactable.x = root.x;
          interactable.y = root.y;
        }
      },
      onComplete: () => {
        root.setAngle(0);
        body?.setY(0);
      },
    });
  }

  private replayNight(): void {
    if (this.caseState.has('variant.miles.checks-office-next-loop')) {
      this.startAlteredLoopRestage();
      return;
    }
    const lounge = this.room('lounge');
    this.activateRoom(lounge.id);
    const observationMark = levelPoint(this.level, this.levelGeometry, lounge, 15, 14);
    this.player.setPosition(observationMark.x, observationMark.y);
    this.setCameraForRoom(lounge);
    this.cameras.main.centerOn(observationMark.x, observationMark.y);
    this.timeline.replay();
    this.lastTimelineBeat = 'loop-replayed';
    this.lastInteraction = `replayed-loop-${this.timeline.snapshot().loop}`;
    this.moveNpcToMark('npc.miles', 'windows');
    this.moveNpcToMark('npc.vera', 'desk');
    this.updateCaseHud();
  }

  private completeLevelOne(result: LevelOneAccusationResult): void {
    if (result.status !== 'solved') return;
    this.caseState.record('accusation', ['outcome.level-one-solved']);
    this.lastInteraction = 'level-one-solved';
    this.updateCaseHud();
    this.time.delayedCall(1_100, () => this.startReenactment());
  }

  private updatePrompt(): void {
    if (this.isAlteredLoopRestageActive()) {
      this.promptText.setText('').setVisible(false);
      this.setMobileLabels('WATCH', 'WATCH');
      return;
    }
    if (this.isReenactmentActive()) {
      this.promptText.setText('').setVisible(false);
      this.setMobileLabels('PAUSE', 'SKIP');
      return;
    }
    if (this.transitionState !== 'idle') {
      this.promptText.setText('').setVisible(false);
      this.setMobileLabels('WAIT', 'WAIT');
      return;
    }
    if (this.dialogue.isOpen()) {
      this.promptText.setText('A: NEXT  //  B: CLOSE').setVisible(true);
      this.setMobileLabels('NEXT', 'CLOSE');
      return;
    }
    if (this.caseBoard.isOpen()) {
      this.promptText.setText('').setVisible(false);
      this.setMobileLabels('SELECT', 'CLOSE');
      return;
    }
    const nearest = this.nearestInteractable();
    const variant = nearest ? this.interactionFor(nearest.id) : undefined;
    this.promptText
      .setText(variant ? `A / E: ${variant.prompt}` : '')
      .setVisible(Boolean(variant));
    this.setMobileLabels('ACT', 'CASE');
  }

  private nearestInteractable(): Interactable | undefined {
    const position = this.player.position();
    return this.interactables
      .filter((target) => target.roomId === this.currentRoomId)
      .map((target) => ({ target, distance: Phaser.Math.Distance.Between(position.x, position.y, target.x, target.y) }))
      .filter(({ target, distance }) => distance <= target.range)
      .sort((a, b) => a.distance - b.distance)[0]?.target;
  }

  private activateNearest(): void {
    if (this.transitionState !== 'idle' || this.isAlteredLoopRestageActive() || this.isReenactmentActive()) return;
    const nearest = this.nearestInteractable();
    if (nearest) nearest.activate();
    else this.lastInteraction = 'nothing-in-range';
  }

  private openDialogue(id: Interactable['id']): void {
    if (this.dialogue?.isOpen()) return;
    const variant = this.interactionFor(id);
    if (!variant) return;
    this.lastInteraction = `opened-${id}`;
    this.dialogue.open(variant.script, (reason) => {
      if (reason === 'completed') {
        const added = applyLevelOneInteractionClose(this.caseState, variant, reason);
        this.lastInteraction = added.length ? `unlocked-${added.at(-1)}` : `completed-${variant.script.id}`;
        this.updateCaseHud();
      } else {
        this.lastInteraction = `dismissed-${variant.script.id}`;
      }
    });
  }

  private interactionFor(id: string): LevelOneInteractionVariant | undefined {
    return resolveLevelOneInteraction(id, this.caseState) ?? {
      id: `placeholder-${id}`,
      targetId: id,
      prompt: id.startsWith('npc.') ? `QUESTION ${id.slice(4).toUpperCase()}` : `INSPECT ${id.toUpperCase()}`,
      script: this.placeholderDialogue(id),
      effects: [],
    };
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

  private updateCaseHud(): void {
    if (!this.caseText) return;
    const snapshot = this.caseState.snapshot();
    const last = snapshot.lastUnlock === 'variant.miles.checks-office-next-loop'
      ? 'MILES CHECKS OFFICE NEXT LOOP'
      : snapshot.lastUnlock?.replaceAll('.', ' ').toUpperCase() ?? 'NONE';
    const loop = this.timeline.snapshot();
    const outcome = snapshot.flags.includes('outcome.level-one-solved') ? ' // CASE CLOSED' : '';
    this.caseText.setText(`CASE NOTES // EVIDENCE ${snapshot.evidenceCount}/5${outcome}\nLOOP ${loop.loop} // ${Math.floor(loop.elapsedMs / 1_000)}S  LAST: ${last.slice(0, 22)}`);
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

  private trackRoomObject<T extends Phaser.GameObjects.GameObject>(roomId: string, object: T): T {
    const objects = this.roomObjects.get(roomId) ?? [];
    objects.push(object);
    this.roomObjects.set(roomId, objects);
    return object;
  }

  private collisionsForRoom(room: LevelRoom): Rect[] {
    const collisions: Rect[] = [];
    room.map.forEach((row, localY) => row.forEach((tile, localX) => {
      if (tile !== '#') return;
      collisions.push({
        x: this.levelGeometry.offsetX + (room.originX + localX) * this.level.tileSize,
        y: this.levelGeometry.offsetY + (room.originY + localY) * this.level.tileSize,
        width: this.level.tileSize,
        height: this.level.tileSize,
      });
    }));
    room.placements
      .filter((placement) => placement.solid)
      .forEach((placement) => collisions.push(placementRect(this.level, this.levelGeometry, room, placement)));
    return collisions;
  }

  private roomBounds(room: LevelRoom): Rect {
    return {
      x: this.levelGeometry.offsetX + room.originX * this.level.tileSize,
      y: this.levelGeometry.offsetY + room.originY * this.level.tileSize,
      width: room.width * this.level.tileSize,
      height: room.height * this.level.tileSize,
    };
  }

  private activateRoom(roomId: string): void {
    this.roomObjects.forEach((objects, candidateRoomId) => {
      const active = candidateRoomId === roomId;
      objects.forEach((object) => {
        (object as Phaser.GameObjects.GameObject & { setVisible(visible: boolean): unknown }).setVisible(active);
        object.setActive(active);
      });
    });
    this.currentRoomId = roomId;
    this.obstacles = this.roomObstacles.get(roomId) ?? [];
    const room = this.room(roomId);
    if (this.locationText) this.locationText.setText(`LEVEL 1 // ${room.name.toUpperCase()}`);
  }

  private setCameraForRoom(room: LevelRoom): void {
    const bounds = this.roomBounds(room);
    const verticalStagePadding = room.id === 'lounge' ? 220 : 0;
    this.cameras.main.stopFollow();
    this.cameras.main.setZoom(1);
    this.cameras.main.setBounds(
      bounds.x,
      bounds.y - verticalStagePadding,
      bounds.width,
      bounds.height + verticalStagePadding * 2,
    );
    if (this.player) {
      this.cameras.main.centerOn(this.player.position().x, this.player.position().y);
      this.cameras.main.startFollow(this.player.gameObject(), true, 0.09, 0.09);
    }
  }

  private checkDoorTransition(): void {
    if (this.transitionState !== 'idle' || this.dialogue.isOpen() || this.caseBoard.isOpen() || this.isReenactmentActive() || this.isAlteredLoopRestageActive()) return;
    const room = this.room(this.currentRoomId);
    const position = this.player.position();
    const localX = Math.floor((position.x - this.levelGeometry.offsetX) / this.level.tileSize) - room.originX;
    const localY = Math.floor((position.y - this.levelGeometry.offsetY) / this.level.tileSize) - room.originY;
    if (room.map[localY]?.[localX] !== '+') return;
    const destination = resolveRoomTransition(this.level, room.id, localX, localY);
    if (destination) this.beginRoomTransition(destination);
  }

  private beginRoomTransition(destination: RoomTransitionDestination): void {
    if (this.transitionState !== 'idle') return;
    this.transition = destination;
    this.lastTransition = destination;
    this.transitionState = 'fading-out';
    document.querySelector<HTMLElement>('#mobile-controls')?.classList.add('is-room-transitioning');
    this.requiresNeutralInput = true;
    const knob = document.querySelector<HTMLElement>('.dpad-center');
    if (knob) knob.style.transform = 'translate(0, 0)';
    this.lastInteraction = `door-exit-${destination.linkId}`;
    const camera = this.cameras.main;
    camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.transitionState = 'relocating';
      const destinationRoom = this.room(destination.toRoomId);
      this.activateRoom(destinationRoom.id);
      const arrival = levelPoint(this.level, this.levelGeometry, destinationRoom, destination.enterX, destination.enterY);
      this.player.setPosition(arrival.x, arrival.y);
      this.setCameraForRoom(destinationRoom);
      this.lastInteraction = `door-enter-${destination.linkId}-${destination.toRoomId}`;
      this.transitionState = 'fading-in';
      camera.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
        this.transitionState = 'idle';
        this.transition = undefined;
        document.querySelector<HTMLElement>('#mobile-controls')?.classList.remove('is-room-transitioning');
      });
      camera.fadeIn(160, 0, 0, 0);
    });
    camera.fadeOut(140, 0, 0, 0);
  }

  private applyQaPose(): void {
    const query = new URLSearchParams(window.location.search);
    const pose = query.get('qaPose');
    const debugSolve = query.get('debugSolve');
    const debugReenactment = query.get('debugReenactment');
    const reenactmentPose = {
      'reenactment-key': 'reconstruction.key-ledger',
      'reenactment-door': 'reconstruction.room-317-door',
      'reenactment-office-tell': 'reconstruction.office-deviation',
      'reenactment-finale': 'reconstruction.finale',
    }[pose ?? ''];
    const alteredLoopPose = {
      'altered-loop-anticipate': 'anticipate',
      'altered-loop-route': 'transit-1',
      'altered-loop-arrived': 'arrived',
      'altered-loop-recorded': 'recorded',
    }[pose ?? ''] as AlteredLoopPhaseId | undefined;
    if (alteredLoopPose) {
      const proof = solveLevelOneCase();
      this.caseState.seed(proof.state.snapshot().flags.filter((flag) =>
        !flag.startsWith('outcome.')
        && flag !== 'observation.miles-office-check'
        && flag !== 'timeline.miles-office-deviation'));
      this.startAlteredLoopRestage(alteredLoopPose, true);
      this.lastInteraction = `qa-pose-${pose}`;
      this.updateCaseHud();
    }
    if (reenactmentPose || debugReenactment === 'level-one') {
      const proof = solveLevelOneCase();
      this.caseState.seed(proof.state.snapshot().flags);
      this.debugSolveSteps = proof.steps;
      this.caseBoard.showSolved(proof.result);
      this.startReenactment(reenactmentPose, Boolean(reenactmentPose));
      this.lastInteraction = reenactmentPose ? `qa-pose-${pose}` : 'debug-reenactment-level-one';
      this.updateCaseHud();
    }
    if (pose === 'case-altered-timeline') {
      const proof = solveLevelOneCase();
      this.caseState.seed(proof.state.snapshot().flags.filter((flag) => !flag.startsWith('outcome.')));
      this.debugSolveSteps = proof.steps.slice(0, -1);
      this.timeline.replay();
      this.lastTimelineBeat = 'variant.miles-office-check';
      this.lastInteraction = 'qa-pose-case-altered-timeline';
      this.caseBoard.open('timeline');
      this.updateCaseHud();
    }
    if (pose === 'case-accusation-ready') {
      const proof = solveLevelOneCase();
      this.caseState.seed(proof.state.snapshot().flags.filter((flag) => !flag.startsWith('outcome.')));
      this.debugSolveSteps = proof.steps.slice(0, -1);
      this.caseBoard.open('accuse');
      this.lastInteraction = 'qa-pose-case-accusation-ready';
      this.updateCaseHud();
    }
    if (pose === 'case-solved' || debugSolve === 'level-one') {
      const proof = solveLevelOneCase();
      this.caseState.seed(proof.state.snapshot().flags);
      this.debugSolveSteps = proof.steps;
      this.lastTimelineBeat = 'variant.miles-office-check';
      this.lastInteraction = 'debug-solve-level-one-complete';
      this.caseBoard.showSolved(proof.result);
      this.updateCaseHud();
    }
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
    if (pose === 'level-room-lounge-officer') {
      this.centerQaCameraOnPlacement('npc.officer');
      this.openDialogue('npc.officer');
    }
    if (pose === 'case-ledger-inspection') {
      this.centerQaCameraOnPlacement('clue.torn-ledger');
      this.openDialogue('clue.torn-ledger');
    }
    if (pose === 'case-miles-ledger') {
      this.caseState.seed(['evidence.torn-ledger', 'statement.miles.denies-317']);
      this.updateCaseHud();
      this.centerQaCameraOnPlacement('npc.miles');
      this.openDialogue('npc.miles');
    }
    if (pose === 'case-vera-ledger-followup') {
      this.caseState.seed(['evidence.torn-ledger', 'topic.vera.torn-ledger', 'confrontation.miles.torn-ledger']);
      this.updateCaseHud();
      this.centerQaCameraOnPlacement('npc.vera');
      this.openDialogue('npc.vera');
    }
    if (pose === 'case-miles-missing-key') {
      this.caseState.seed(['evidence.torn-ledger', 'topic.miles.missing-key', 'statement.vera.key-not-returned', 'reviewed.miles.first-question']);
      this.updateCaseHud();
      this.centerQaCameraOnPlacement('npc.miles');
      this.openDialogue('npc.miles');
    }
    if (pose === 'case-miles-unlocked') {
      this.caseState.seed(['evidence.torn-ledger', 'topic.miles.missing-key', 'statement.vera.key-not-returned', 'reviewed.miles.first-question']);
      const variant = resolveLevelOneInteraction('npc.miles', this.caseState);
      if (variant) applyLevelOneInteractionClose(this.caseState, variant, 'completed');
      this.updateCaseHud();
      this.centerQaCameraOnPlacement('npc.miles');
      this.openDialogue('npc.miles');
    }
    if (pose === 'level-room-lounge-overview') {
      const room = this.level.rooms.find((candidate) => candidate.id === 'lounge');
      if (room) {
        this.activateRoom(room.id);
        const point = levelPoint(this.level, this.levelGeometry, room, room.width / 2 - 0.5, room.height / 2 - 0.5);
        this.cameras.main.stopFollow();
        this.cameras.main.setBounds(0, 0, this.levelGeometry.worldWidth, this.levelGeometry.worldHeight);
        this.cameras.main.setZoom(0.3);
        this.cameras.main.centerOn(point.x, point.y);
        this.lastInteraction = 'qa-pose-level-room-lounge-overview';
      }
    }
    const roomPose = pose?.startsWith('level-room-') ? pose.slice('level-room-'.length) : undefined;
    if (roomPose) {
      const room = this.level.rooms.find((candidate) => candidate.id === roomPose);
      if (room) {
        this.activateRoom(room.id);
        const poseX = room.id === 'office' ? 6 : room.id === 'kitchen' ? 4 : Math.floor(room.width / 2);
        const poseY = room.id === 'lounge' ? 14 : Math.floor(room.height / 2);
        const point = levelPoint(this.level, this.levelGeometry, room, poseX, poseY);
        this.player.setPosition(point.x, point.y);
        this.setCameraForRoom(room);
        this.cameras.main.centerOn(point.x, point.y);
        this.lastInteraction = `qa-pose-${pose}`;
      }
    }
    if (pose === 'transition-lounge-kitchen-source') this.applyTransitionQaPose('lounge', 27, 14, 'source');
    if (pose === 'transition-auto-lounge-kitchen') this.applyTransitionQaPose('lounge', 29, 14, 'auto');
    if (pose === 'transition-lounge-bedroom-source') this.applyTransitionQaPose('lounge', 14, 1, 'source');
    if (pose === 'transition-auto-lounge-bedroom') this.applyTransitionQaPose('lounge', 14, 0, 'auto');
    if (pose === 'transition-lounge-office-source') this.applyTransitionQaPose('lounge', 2, 15, 'source');
    if (pose === 'transition-auto-lounge-office') this.applyTransitionQaPose('lounge', 0, 15, 'auto');
    if (pose === 'transition-lounge-kitchen-black') {
      this.applyTransitionQaPose('lounge', 28, 14, 'black');
      this.cameras.main.fadeOut(1, 0, 0, 0);
      this.transitionState = 'fading-out';
      document.querySelector<HTMLElement>('#mobile-controls')?.classList.add('is-room-transitioning');
    }
    if (pose === 'transition-lounge-kitchen-destination') this.applyTransitionQaPose('kitchen', 1, 4, 'destination');
  }

  private applyTransitionQaPose(roomId: string, x: number, y: number, state: string): void {
    const room = this.room(roomId);
    this.activateRoom(room.id);
    const point = levelPoint(this.level, this.levelGeometry, room, x, y);
    this.player.setPosition(point.x, point.y);
    this.setCameraForRoom(room);
    this.lastInteraction = `qa-transition-${state}-${roomId}`;
  }

  private centerQaCameraOnPlacement(id: string): void {
    for (const room of this.level.rooms) {
      const placement = room.placements.find((candidate) => candidate.id === id);
      if (!placement) continue;
      this.activateRoom(room.id);
      const point = levelPoint(this.level, this.levelGeometry, room, placement.x, placement.y);
      this.cameras.main.stopFollow();
      this.cameras.main.centerOn(point.x, point.y);
      return;
    }
  }

  private createTextures(): void {
    this.createPersonTexture('exploration-detective', 0x111318, 0xd9cfb6, true);
    this.createPersonTexture('exploration-vera', 0x20232b, 0x8f2432, true);
    this.createPersonTexture('exploration-miles', 0x27231f, 0xc7a85b, false);
    this.createPersonTexture('exploration-officer', 0x17212a, 0x718293, true);
    this.createPortrait('portrait-vera', 0x20232b, 0x8f2432, true);
    this.createPortrait('portrait-miles', 0x27231f, 0xc7a85b, false);
    this.createPortrait('portrait-detective', 0x111318, 0xd9cfb6, true);
    this.createPortrait('portrait-officer', 0x17212a, 0x718293, true);
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
    canvas.dataset.activeRoomCount = [...this.roomObjects.values()].filter((objects) => objects.some((object) => object.active)).length.toString();
    canvas.dataset.transitionState = this.transitionState;
    canvas.dataset.transitionLinkId = this.transition?.linkId ?? 'none';
    canvas.dataset.transitionFromRoom = this.transition?.fromRoomId ?? 'none';
    canvas.dataset.transitionToRoom = this.transition?.toRoomId ?? 'none';
    canvas.dataset.lastTransitionLinkId = this.lastTransition?.linkId ?? 'none';
    canvas.dataset.lastTransitionFromRoom = this.lastTransition?.fromRoomId ?? 'none';
    canvas.dataset.lastTransitionToRoom = this.lastTransition?.toRoomId ?? 'none';
    const activeRoom = this.room(this.currentRoomId);
    canvas.dataset.playerLocalX = (Math.floor((position.x - this.levelGeometry.offsetX) / this.level.tileSize) - activeRoom.originX).toString();
    canvas.dataset.playerLocalY = (Math.floor((position.y - this.levelGeometry.offsetY) / this.level.tileSize) - activeRoom.originY).toString();
    canvas.dataset.inputLocked = (this.transitionState !== 'idle' || this.requiresNeutralInput || this.isReenactmentActive() || this.isAlteredLoopRestageActive()).toString();
    canvas.dataset.timelinePaused = (this.transitionState !== 'idle' || this.dialogue.isOpen() || this.caseBoard.isOpen() || this.isReenactmentActive() || this.isAlteredLoopRestageActive()).toString();
    canvas.dataset.doorReentryLocked = this.requiresNeutralInput.toString();
    canvas.dataset.characterScale = EXPLORATION_CHARACTER_SCALE.toFixed(2);
    canvas.dataset.playerX = position.x.toFixed(1);
    canvas.dataset.playerY = position.y.toFixed(1);
    canvas.dataset.inputX = vector.x.toFixed(2);
    canvas.dataset.inputY = vector.y.toFixed(2);
    canvas.dataset.cameraX = camera.x.toFixed(1);
    canvas.dataset.cameraY = camera.y.toFixed(1);
    canvas.dataset.nearestTarget = this.nearestInteractable()?.id ?? 'none';
    canvas.dataset.dialogue = this.dialogue.snapshot().scriptId ?? 'closed';
    canvas.dataset.lastInteraction = this.lastInteraction;
    const caseSnapshot = this.caseState.snapshot();
    canvas.dataset.caseFlags = caseSnapshot.flags.join('|');
    canvas.dataset.caseEvidenceCount = caseSnapshot.evidenceCount.toString();
    canvas.dataset.caseStatementCount = caseSnapshot.statementCount.toString();
    canvas.dataset.caseLastUnlock = caseSnapshot.lastUnlock ?? 'none';
    canvas.dataset.caseCompletedScripts = caseSnapshot.completedScripts.join('|');
    const timeline = this.timeline.snapshot();
    canvas.dataset.timelineLoop = timeline.loop.toString();
    canvas.dataset.timelineElapsedMs = Math.round(timeline.elapsedMs).toString();
    canvas.dataset.timelineRunning = timeline.running.toString();
    canvas.dataset.timelineLastBeat = this.lastTimelineBeat;
    canvas.dataset.caseBoardOpen = this.caseBoard.isOpen().toString();
    canvas.dataset.caseOutcome = this.caseState.has('outcome.level-one-solved') ? 'solved' : 'investigating';
    canvas.dataset.debugSolveStatus = this.debugSolveSteps.at(-1) === 'accusation.solved' ? 'solved' : this.debugSolveSteps.length ? 'running' : 'idle';
    canvas.dataset.debugSolveSteps = this.debugSolveSteps.join('|');
    const reenactment = this.reenactment.snapshot();
    const reenactmentBeat = LEVEL_ONE_REENACTMENT_BEATS[reenactment.beatIndex];
    canvas.dataset.reenactmentStatus = reenactment.status;
    canvas.dataset.reenactmentBeat = reenactment.beatId ?? 'none';
    canvas.dataset.reenactmentProvenance = reenactmentBeat?.provenance ?? 'none';
    canvas.dataset.reenactmentBasis = reenactmentBeat?.basisIds.join('|') ?? 'none';
    canvas.dataset.reenactmentReplayCount = reenactment.replayCount.toString();
    canvas.dataset.reenactmentReducedMotion = this.reducedMotion.toString();
    canvas.dataset.reenactmentLastBeat = this.lastReenactmentBeat;
    const alteredLoop = this.alteredLoopRestage.snapshot();
    canvas.dataset.alteredLoopStatus = alteredLoop.status;
    canvas.dataset.alteredLoopPhase = alteredLoop.phaseId ?? 'none';
    canvas.dataset.alteredLoopPhaseElapsedMs = Math.round(alteredLoop.phaseElapsedMs).toString();
    canvas.dataset.alteredLoopActorMark = alteredLoop.actorMark ?? 'none';
    canvas.dataset.alteredLoopInputLocked = this.isAlteredLoopRestageActive().toString();
    canvas.dataset.alteredLoopObservationRecorded = this.caseState.has('timeline.miles-office-deviation').toString();
    canvas.dataset.alteredLoopReducedMotion = this.reducedMotion.toString();
    canvas.dataset.alteredLoopLastPhase = this.lastAlteredLoopPhase;
  }
}
