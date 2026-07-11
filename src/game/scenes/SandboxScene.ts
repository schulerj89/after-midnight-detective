import Phaser from 'phaser';
import { CharacterPawn, type CharacterPose } from '../actors/CharacterPawn';
import { GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../constants';
import type { DialogueScript } from '../features/dialogue/DialogueModel';
import { FocusNavigator } from '../features/interaction/FocusNavigator';
import {
  SandboxTimeline,
  type TimelineEvent,
} from '../features/timeline/SandboxTimeline';
import {
  onMobileControl,
  type MobileControl,
} from '../input/mobileControls';
import { DialogueBox } from '../ui/DialogueBox';

const FONT = '"Press Start 2P", monospace';
const FLOOR_Y = 480;
const STAGE_MARKS = { left: 280, center: 635, right: 970 } as const;
type FocusTarget = 'vera' | 'matchbook' | 'miles';

const TIMELINE_EVENTS: readonly TimelineEvent[] = [
  { id: 'vera-center', atMs: 1_500 },
  { id: 'miles-center', atMs: 5_700 },
  { id: 'headlights', atMs: 9_000 },
  { id: 'vera-left', atMs: 11_500 },
  { id: 'miles-right', atMs: 14_800 },
];

const DIALOGUE: Record<'vera' | 'miles' | 'matchbook', DialogueScript> = {
  vera: {
    id: 'sandbox-vera',
    speaker: 'VERA VALE',
    portraitKey: 'portrait-vera',
    pages: [
      'Detective. If you are here about the lights, they went out at twelve-ten.',
      'At least... that is what somebody needed me to believe.',
    ],
  },
  miles: {
    id: 'sandbox-miles',
    speaker: 'MILES PIKE',
    portraitKey: 'portrait-miles',
    pages: [
      'I never crossed the lobby. Ask anyone who was still awake.',
      'You keep staring at the floor. Is there something down there?',
    ],
  },
  matchbook: {
    id: 'sandbox-matchbook',
    speaker: 'DETECTIVE',
    portraitKey: 'portrait-detective',
    pages: [
      'A damp matchbook from the Red Canary. One match is missing.',
      'PLACEHOLDER CLUE RECORDED // NOTEBOOK SYSTEM COMES NEXT',
    ],
  },
};

export class SandboxScene extends Phaser.Scene {
  private readonly timeline = new SandboxTimeline(18_000, TIMELINE_EVENTS);
  private readonly focus = new FocusNavigator<FocusTarget>(['vera', 'matchbook', 'miles']);
  private dialogue!: DialogueBox;
  private vera!: CharacterPawn;
  private miles!: CharacterPawn;
  private timelineFill!: Phaser.GameObjects.Graphics;
  private statusText!: Phaser.GameObjects.Text;
  private pauseText!: Phaser.GameObjects.Text;
  private headlight!: Phaser.GameObjects.Rectangle;
  private focusReticle!: Phaser.GameObjects.Container;
  private focusVisible = false;
  private removeMobileControls?: () => void;
  private lastInteraction = 'sandbox-ready';
  private lastLoop = 1;

  constructor() {
    super(SCENE_KEYS.sandbox);
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#090a0d');
    this.createPlaceholderTextures();
    this.createRoom();
    this.createTimelineHud();
    this.createActors();
    this.createForegroundAndClue();
    this.dialogue = new DialogueBox(this);
    this.createFocusReticle();
    this.createHelpText();
    this.removeMobileControls = onMobileControl((control) =>
      this.handleMobileControl(control),
    );
    this.setMobileActionLabels('ACT', 'PAUSE');
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () =>
      this.removeMobileControls?.(),
    );
    this.applyQaPose();
    this.publishDebugSnapshot();
  }

  update(_time: number, delta: number): void {
    const events = this.timeline.update(delta);
    const timelineState = this.timeline.snapshot();

    if (timelineState.loop !== this.lastLoop) {
      this.lastLoop = timelineState.loop;
      this.resetActors();
      this.lastInteraction = `loop-${timelineState.loop}-started`;
    }

    events.forEach((event) => this.runTimelineEvent(event));
    this.updateFocusReticle();
    this.renderTimelineHud();
    this.publishDebugSnapshot();
  }

  private createRoom(): void {
    const room = this.add.graphics();
    room.fillStyle(0x17191f, 1);
    room.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    room.fillStyle(0x0d0f14, 1);
    room.fillRect(0, 72, GAME_WIDTH, 408);

    room.fillStyle(0x111a21, 1);
    room.fillRect(58, 112, 368, 248);
    room.lineStyle(8, 0x090a0d, 1);
    room.strokeRect(58, 112, 368, 248);
    room.lineBetween(242, 112, 242, 360);
    room.lineBetween(58, 236, 426, 236);

    room.fillStyle(0xc7a85b, 0.12);
    room.fillTriangle(502, 84, 812, 480, 655, 480);
    room.fillStyle(0x8f2432, 0.13);
    room.fillCircle(1110, 236, 94);

    room.fillStyle(0x0b0c10, 1);
    room.fillRect(0, FLOOR_Y, GAME_WIDTH, GAME_HEIGHT - FLOOR_Y);
    room.lineStyle(2, 0x252832, 0.8);
    for (let y = FLOOR_Y + 32; y < GAME_HEIGHT; y += 34) {
      room.lineBetween(0, y, GAME_WIDTH, y);
    }

    const rain = this.add.graphics().setDepth(2);
    rain.lineStyle(2, 0x718293, 0.28);
    for (let x = 80; x < 420; x += 24) {
      const offset = (x * 7) % 80;
      rain.lineBetween(x, 82 + offset, x - 36, 190 + offset);
      rain.lineBetween(x + 8, 230 + offset / 2, x - 22, 320 + offset / 2);
    }
    this.tweens.add({
      targets: rain,
      y: 18,
      alpha: { from: 0.55, to: 0.9 },
      duration: 900,
      ease: 'Linear',
      yoyo: true,
      repeat: -1,
    });

    this.headlight = this.add
      .rectangle(GAME_WIDTH / 2, 310, GAME_WIDTH, 330, 0xe7d89f, 0)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(4);

    this.add
      .text(34, 26, 'SANDBOX // THE LANTERN ROOM', {
        color: '#d9cfb6',
        fontFamily: FONT,
        fontSize: '14px',
      })
      .setDepth(20);
  }

  private createTimelineHud(): void {
    const track = this.add.graphics().setDepth(20);
    track.fillStyle(0x090a0d, 0.9);
    track.fillRect(350, 28, 420, 14);
    track.lineStyle(2, 0x817967, 1);
    track.strokeRect(350, 28, 420, 14);
    this.timelineFill = this.add.graphics().setDepth(21);

    this.statusText = this.add
      .text(790, 25, '', {
        color: '#c7a85b',
        fontFamily: FONT,
        fontSize: '11px',
      })
      .setDepth(20);

    this.pauseText = this.createButton(1030, 25, '[ PAUSE ]', () => {
      if (this.dialogue?.isOpen()) {
        return;
      }
      this.setTimelineRunning(!this.timeline.snapshot().running);
      this.lastInteraction = this.timeline.snapshot().running ? 'timeline-resumed' : 'timeline-paused';
    });

    this.createButton(1146, 25, '[ REPLAY ]', () => {
      if (this.dialogue?.isOpen()) {
        return;
      }
      this.timeline.reset();
      this.lastLoop = 1;
      this.resetActors();
      this.setTimelineRunning(true);
      this.lastInteraction = 'timeline-replayed';
    });
  }

  private createActors(): void {
    this.vera = new CharacterPawn(
      this,
      'vera',
      STAGE_MARKS.left,
      FLOOR_Y + 8,
      'actor-vera',
      () => this.openCharacterDialogue('vera', this.vera),
    );
    this.miles = new CharacterPawn(
      this,
      'miles',
      STAGE_MARKS.right,
      FLOOR_Y + 8,
      'actor-miles',
      () => this.openCharacterDialogue('miles', this.miles),
    );

    this.addStageLabel(STAGE_MARKS.left, 'A');
    this.addStageLabel(STAGE_MARKS.center, 'B');
    this.addStageLabel(STAGE_MARKS.right, 'C');
  }

  private createForegroundAndClue(): void {
    const counter = this.add.graphics().setDepth(8);
    counter.fillStyle(0x101116, 1);
    counter.fillRoundedRect(754, 398, 470, 138, 5);
    counter.lineStyle(4, 0x39322b, 1);
    counter.strokeRoundedRect(754, 398, 470, 138, 5);
    counter.fillStyle(0x201b19, 1);
    counter.fillRect(738, 388, 500, 24);

    const matchbook = this.add.container(860, 375).setDepth(9);
    const hit = this.add
      .rectangle(0, 0, 82, 58, 0x000000, 0.001)
      .setInteractive({ useHandCursor: true });
    const book = this.add.rectangle(0, 0, 42, 28, 0x8f2432, 1).setRotation(-0.12);
    const stripe = this.add.rectangle(0, 5, 38, 4, 0xd9cfb6, 0.75).setRotation(-0.12);
    matchbook.add([hit, book, stripe]);
    hit.on('pointerdown', () => this.openClueDialogue());
    this.tweens.add({
      targets: [book, stripe],
      alpha: { from: 0.72, to: 1 },
      duration: 850,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    this.add
      .text(824, 338, 'INSPECT', {
        color: '#c7a85b',
        fontFamily: FONT,
        fontSize: '9px',
      })
      .setDepth(9);
  }

  private createHelpText(): void {
    this.add
      .text(
        GAME_WIDTH / 2,
        458,
        'CLICK A CHARACTER TO QUESTION  //  CLICK THE MATCHBOOK TO INSPECT',
        {
          color: '#817967',
          fontFamily: FONT,
          fontSize: '10px',
        },
      )
      .setOrigin(0.5)
      .setDepth(12);
  }

  private applyQaPose(): void {
    const pose = new URLSearchParams(window.location.search).get('qaPose');
    if (pose !== 'mobile-controls' && pose !== 'mobile-dialogue') {
      return;
    }

    this.setTimelineRunning(false);
    this.focus.select('matchbook');
    this.showFocusReticle();
    if (pose === 'mobile-dialogue') {
      this.openClueDialogue();
    }
    this.lastInteraction = `qa-pose-${pose}`;
  }

  private createFocusReticle(): void {
    const halo = this.add
      .ellipse(0, 0, 126, 34, 0xc7a85b, 0.1)
      .setStrokeStyle(3, 0xc7a85b, 0.72);
    const pointer = this.add
      .text(0, -34, '▼', {
        color: '#c7a85b',
        fontFamily: FONT,
        fontSize: '13px',
      })
      .setOrigin(0.5);
    this.focusReticle = this.add
      .container(0, 0, [halo, pointer])
      .setDepth(14)
      .setVisible(false);
    this.tweens.add({
      targets: this.focusReticle,
      alpha: { from: 0.58, to: 1 },
      duration: 650,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  private createButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
  ): Phaser.GameObjects.Text {
    const button = this.add
      .text(x, y, label, {
        color: '#d9cfb6',
        fontFamily: FONT,
        fontSize: '10px',
        backgroundColor: '#17191f',
        padding: { x: 8, y: 5 },
      })
      .setInteractive({ useHandCursor: true })
      .setDepth(22);
    button.on('pointerover', () => button.setColor('#c7a85b'));
    button.on('pointerout', () => button.setColor('#d9cfb6'));
    button.on('pointerdown', onClick);
    return button;
  }

  private openCharacterDialogue(
    id: 'vera' | 'miles',
    pawn: CharacterPawn,
  ): void {
    if (this.dialogue.isOpen()) {
      return;
    }

    this.focus.select(id);
    const wasRunning = this.timeline.snapshot().running;
    this.setTimelineRunning(false);
    this.pauseText.setText('[ TALKING ]');
    pawn.setPose('speaking');
    this.lastInteraction = `questioned-${id}`;
    this.dialogue.open(DIALOGUE[id], () => {
      pawn.setPose(id === 'vera' ? 'suspicious' : 'neutral');
      this.setMobileActionLabels('ACT', wasRunning ? 'PAUSE' : 'PLAY');
      this.setTimelineRunning(wasRunning);
      this.lastInteraction = `dialogue-${id}-closed`;
    });
    this.setMobileActionLabels('NEXT', 'BACK');
  }

  private openClueDialogue(): void {
    if (this.dialogue.isOpen()) {
      return;
    }

    this.focus.select('matchbook');
    const wasRunning = this.timeline.snapshot().running;
    this.setTimelineRunning(false);
    this.pauseText.setText('[ INSPECT ]');
    this.lastInteraction = 'inspected-matchbook';
    this.dialogue.open(DIALOGUE.matchbook, () => {
      this.setMobileActionLabels('ACT', wasRunning ? 'PAUSE' : 'PLAY');
      this.setTimelineRunning(wasRunning);
      this.lastInteraction = 'dialogue-matchbook-closed';
    });
    this.setMobileActionLabels('NEXT', 'BACK');
  }

  private handleMobileControl(control: MobileControl): void {
    switch (control) {
      case 'focus-left':
      case 'focus-up':
        this.focus.previous();
        this.showFocusReticle();
        break;
      case 'focus-right':
      case 'focus-down':
        this.focus.next();
        this.showFocusReticle();
        break;
      case 'action-a':
        if (this.dialogue.isOpen()) {
          this.dialogue.advance();
        } else {
          this.activateFocusedTarget();
        }
        break;
      case 'action-b':
        if (this.dialogue.isOpen()) {
          this.dialogue.dismiss();
        } else {
          this.setTimelineRunning(!this.timeline.snapshot().running);
          this.lastInteraction = this.timeline.snapshot().running
            ? 'mobile-timeline-resumed'
            : 'mobile-timeline-paused';
        }
        break;
    }
  }

  private activateFocusedTarget(): void {
    const target = this.focus.selected();
    if (target === 'vera') {
      this.openCharacterDialogue('vera', this.vera);
    } else if (target === 'miles') {
      this.openCharacterDialogue('miles', this.miles);
    } else {
      this.openClueDialogue();
    }
    this.showFocusReticle();
  }

  private showFocusReticle(): void {
    this.focusVisible = true;
    this.focusReticle.setVisible(true);
    this.lastInteraction = `focused-${this.focus.selected()}`;
    this.updateFocusReticle();
  }

  private updateFocusReticle(): void {
    if (!this.focusVisible) {
      return;
    }

    const selected = this.focus.selected();
    if (selected === 'vera') {
      this.focusReticle.setPosition(this.vera.snapshot().x, FLOOR_Y + 20);
    } else if (selected === 'miles') {
      this.focusReticle.setPosition(this.miles.snapshot().x, FLOOR_Y + 20);
    } else {
      this.focusReticle.setPosition(860, 405);
    }
  }

  private setTimelineRunning(running: boolean): void {
    this.timeline.setRunning(running);
    if (running) {
      this.vera?.resumeMovement();
      this.miles?.resumeMovement();
    } else {
      this.vera?.pauseMovement();
      this.miles?.pauseMovement();
    }
    if (this.pauseText) {
      this.pauseText.setText(running ? '[ PAUSE ]' : '[ RESUME ]');
    }
    if (!this.dialogue?.isOpen()) {
      this.setMobileActionLabels('ACT', running ? 'PAUSE' : 'PLAY');
    }
  }

  private setMobileActionLabels(actionA: string, actionB: string): void {
    const aLabel = document.querySelector<HTMLElement>('.action-a span');
    const bLabel = document.querySelector<HTMLElement>('.action-b span');
    if (aLabel) {
      aLabel.textContent = actionA;
    }
    if (bLabel) {
      bLabel.textContent = actionB;
    }
  }

  private runTimelineEvent(event: TimelineEvent): void {
    switch (event.id) {
      case 'vera-center':
        this.vera.moveTo(STAGE_MARKS.center - 115, 1_900, 'suspicious');
        break;
      case 'miles-center':
        this.miles.moveTo(STAGE_MARKS.center + 130, 2_100, 'neutral');
        break;
      case 'headlights':
        this.tweens.add({
          targets: this.headlight,
          alpha: { from: 0, to: 0.16 },
          duration: 500,
          ease: 'Sine.easeInOut',
          yoyo: true,
        });
        break;
      case 'vera-left':
        this.vera.moveTo(STAGE_MARKS.left, 1_650, 'neutral');
        break;
      case 'miles-right':
        this.miles.moveTo(STAGE_MARKS.right, 1_850, 'alarmed');
        break;
    }
  }

  private resetActors(): void {
    this.vera.setPosition(STAGE_MARKS.left);
    this.miles.setPosition(STAGE_MARKS.right);
  }

  private renderTimelineHud(): void {
    const state = this.timeline.snapshot();
    this.timelineFill.clear();
    this.timelineFill.fillStyle(0x8f2432, 1);
    this.timelineFill.fillRect(352, 30, 416 * state.progress, 10);

    const seconds = Math.floor(state.elapsedMs / 1000)
      .toString()
      .padStart(2, '0');
    this.statusText.setText(`LOOP ${state.loop.toString().padStart(2, '0')} // 00:${seconds}`);
  }

  private addStageLabel(x: number, label: string): void {
    this.add.ellipse(x, FLOOR_Y + 16, 38, 10, 0xc7a85b, 0.18).setDepth(3);
    this.add
      .text(x, FLOOR_Y + 30, `MARK ${label}`, {
        color: '#4f4a40',
        fontFamily: FONT,
        fontSize: '7px',
      })
      .setOrigin(0.5)
      .setDepth(3);
  }

  private createPlaceholderTextures(): void {
    this.createActorTextureSet('actor-vera', 0x20232b, 0x8f2432, true);
    this.createActorTextureSet('actor-miles', 0x27231f, 0xc7a85b, false);
    this.createPortrait('portrait-vera', 0x20232b, 0x8f2432, true);
    this.createPortrait('portrait-miles', 0x27231f, 0xc7a85b, false);
    this.createPortrait('portrait-detective', 0x111318, 0xd9cfb6, true);
  }

  private createActorTextureSet(
    prefix: string,
    coatColor: number,
    accentColor: number,
    hat: boolean,
  ): void {
    const poses: readonly CharacterPose[] = ['neutral', 'speaking', 'suspicious', 'alarmed'];
    poses.forEach((pose) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(0xd0b69f, 1);
      graphics.fillCircle(70, 52, 28);
      graphics.fillStyle(0x17191f, 1);
      graphics.fillRect(45, 44, 50, 12);
      if (hat) {
        graphics.fillStyle(0x090a0d, 1);
        graphics.fillRect(35, 25, 70, 10);
        graphics.fillRect(47, 8, 46, 22);
      } else {
        graphics.fillStyle(0x090a0d, 1);
        graphics.fillRoundedRect(47, 20, 46, 28, 14);
      }

      graphics.fillStyle(coatColor, 1);
      graphics.fillTriangle(38, 92, 102, 92, 116, 238);
      graphics.fillTriangle(38, 92, 24, 238, 116, 238);
      graphics.fillStyle(accentColor, 1);
      graphics.fillTriangle(66, 94, 76, 94, 72, 158);

      graphics.fillStyle(0x121318, 1);
      graphics.fillRect(42, 226, 24, 50);
      graphics.fillRect(76, 226, 24, 50);

      graphics.fillStyle(coatColor, 1);
      if (pose === 'speaking') {
        graphics.fillRect(92, 106, 42, 18);
        graphics.fillCircle(133, 115, 10);
        graphics.fillRect(17, 106, 26, 18);
      } else if (pose === 'suspicious') {
        graphics.fillRect(27, 112, 82, 16);
        graphics.fillRect(35, 132, 70, 14);
      } else if (pose === 'alarmed') {
        graphics.fillRect(17, 72, 18, 66);
        graphics.fillRect(105, 72, 18, 66);
        graphics.fillCircle(26, 70, 10);
        graphics.fillCircle(114, 70, 10);
      } else {
        graphics.fillRect(20, 103, 22, 112);
        graphics.fillRect(98, 103, 22, 112);
      }

      graphics.lineStyle(3, 0xd9cfb6, 0.55);
      graphics.strokeCircle(70, 52, 28);
      graphics.strokeRoundedRect(31, 89, 78, 152, 8);
      graphics.generateTexture(`${prefix}-${pose}`, 140, 280);
      graphics.destroy();
    });
  }

  private createPortrait(
    key: string,
    coatColor: number,
    accentColor: number,
    hat: boolean,
  ): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x121318, 1);
    graphics.fillRect(0, 0, 160, 160);
    graphics.fillStyle(coatColor, 1);
    graphics.fillTriangle(16, 160, 144, 160, 80, 86);
    graphics.fillStyle(0xd0b69f, 1);
    graphics.fillCircle(80, 64, 38);
    graphics.fillStyle(0x090a0d, 1);
    if (hat) {
      graphics.fillRect(30, 31, 100, 12);
      graphics.fillRect(49, 10, 62, 28);
    } else {
      graphics.fillRoundedRect(49, 18, 62, 36, 18);
    }
    graphics.fillStyle(accentColor, 1);
    graphics.fillRect(42, 112, 76, 8);
    graphics.lineStyle(3, 0xd9cfb6, 0.7);
    graphics.strokeCircle(80, 64, 38);
    graphics.generateTexture(key, 160, 160);
    graphics.destroy();
  }

  private publishDebugSnapshot(): void {
    const snapshot = {
      ready: true,
      scene: SCENE_KEYS.sandbox,
      dialogue: this.dialogue?.snapshot() ?? null,
      timeline: this.timeline.snapshot(),
      characters: this.vera && this.miles ? [this.vera.snapshot(), this.miles.snapshot()] : [],
      lastInteraction: this.lastInteraction,
    };
    window.__AMD_SANDBOX__ = snapshot;

    const canvas = this.game.canvas;
    canvas.dataset.sandboxReady = 'true';
    canvas.dataset.sandboxScene = snapshot.scene;
    canvas.dataset.dialogue = snapshot.dialogue?.scriptId ?? 'closed';
    canvas.dataset.timelineRunning = String(snapshot.timeline.running);
    canvas.dataset.lastInteraction = snapshot.lastInteraction;
    canvas.dataset.focusTarget = this.focus.selected();
    canvas.dataset.focusVisible = String(this.focusVisible);
    canvas.dataset.qaPose =
      new URLSearchParams(window.location.search).get('qaPose') ?? 'none';
    canvas.dataset.timelineElapsed = Math.round(snapshot.timeline.elapsedMs).toString();
    snapshot.characters.forEach((character) => {
      const prefix = character.id;
      canvas.dataset[`${prefix}X`] = character.x.toFixed(1);
      canvas.dataset[`${prefix}TargetX`] = character.targetX.toFixed(1);
      canvas.dataset[`${prefix}Moving`] = String(character.moving);
      canvas.dataset[`${prefix}Rotation`] = character.rotation.toFixed(3);
      canvas.dataset[`${prefix}Pose`] = character.pose;
    });
  }
}
