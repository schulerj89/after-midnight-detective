import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../constants';
import { CaseClosedFinale } from '../features/case/CaseClosedFinale';
import { resolveCaseClosedLayout } from '../features/case/CaseClosedLayout';

const FONT = '"Press Start 2P", monospace';

export class CaseClosedScene extends Phaser.Scene {
  private finale = new CaseClosedFinale(true, 0);
  private prisoner!: Phaser.GameObjects.Container;
  private bars!: Phaser.GameObjects.Container;
  private spotlight!: Phaser.GameObjects.Graphics;
  private flash!: Phaser.GameObjects.Rectangle;
  private returnButton!: Phaser.GameObjects.Container;
  private reducedMotion = false;
  private qaPose = 'none';
  private flashCount = 0;
  private stageWidth = GAME_WIDTH;
  private stageCenterX = GAME_WIDTH / 2;
  private cellWidth = 590;

  constructor() {
    super(SCENE_KEYS.caseClosed);
  }

  create(data?: { solved?: boolean; knowledgeCount?: number }): void {
    const query = new URLSearchParams(window.location.search);
    this.qaPose = query.get('qaPose') ?? 'none';
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches || query.get('reducedMotion') === '1';
    const solved = data?.solved ?? (this.qaPose.startsWith('case-closed') || query.get('scene') === SCENE_KEYS.caseClosed);
    this.finale = new CaseClosedFinale(solved, data?.knowledgeCount ?? 0);
    const layout = resolveCaseClosedLayout(this.scale.width);
    this.stageWidth = layout.stageWidth;
    this.stageCenterX = layout.stageCenterX;
    this.cellWidth = layout.cellWidth;

    this.cameras.main.setBackgroundColor('#090a0d');
    this.createStage();
    document.body.classList.add('case-closed-open');
    document.querySelector<HTMLElement>('#mobile-controls')?.setAttribute('aria-hidden', 'true');

    if (this.finale.snapshot().status === 'locked') {
      this.add.text(this.stageCenterX, GAME_HEIGHT / 2, 'CASE OUTCOME REQUIRED', { color: '#8f2432', fontFamily: FONT, fontSize: '18px' }).setOrigin(0.5);
      this.returnButton.setVisible(false);
    } else if (this.qaPose !== 'none' || this.reducedMotion) {
      this.settleTableau(this.qaPose === 'case-closed-flash');
    } else {
      this.playEntrance();
    }

    this.input.keyboard?.on('keydown-ENTER', () => this.returnToCase());
    this.input.keyboard?.on('keydown-ESC', () => this.returnToCase());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      document.body.classList.remove('case-closed-open');
      document.querySelector<HTMLElement>('#mobile-controls')?.removeAttribute('aria-hidden');
    });
    this.publishDebugSnapshot();
  }

  update(): void {
    this.publishDebugSnapshot();
  }

  private createStage(): void {
    this.add.rectangle(0, 0, this.stageWidth, GAME_HEIGHT, 0x090a0d, 1).setOrigin(0).setDepth(-10);
    this.add.rectangle(this.stageCenterX, GAME_HEIGHT / 2, this.stageWidth, GAME_HEIGHT, 0x17191f, 1).setDepth(-8);
    this.add.rectangle(this.stageCenterX, 525, this.stageWidth, 390, 0x111318, 0.78).setDepth(-7.5);
    const entranceX = resolveCaseClosedLayout(this.stageWidth).entranceX;
    this.spotlight = this.createSpotlight(entranceX).setDepth(-7);

    this.add.text(this.stageCenterX, 64, 'CASE CLOSED', {
      color: '#8f2432', fontFamily: FONT, fontSize: '28px', letterSpacing: 6,
    }).setOrigin(0.5).setDepth(60);
    this.add.text(this.stageCenterX, 108, 'MILES PIKE // IN CUSTODY', {
      color: '#c7a85b', fontFamily: FONT, fontSize: '14px', letterSpacing: 2,
    }).setOrigin(0.5).setDepth(60);

    this.prisoner = this.createPrisoner(entranceX, 540).setDepth(20);
    this.bars = this.createBars(this.cellWidth).setPosition(this.stageCenterX, -GAME_HEIGHT).setDepth(40);

    this.add.text(this.stageCenterX, 568, 'THE KEY BROKE THE ALIBI.', {
      color: '#d9cfb6', fontFamily: FONT, fontSize: '13px',
    }).setOrigin(0.5).setDepth(60);
    this.add.text(this.stageCenterX, 598, 'THE BARS CLOSE THE ACT.', {
      color: '#817967', fontFamily: FONT, fontSize: '10px',
    }).setOrigin(0.5).setDepth(60);

    const buttonPlate = this.add.rectangle(0, 0, 340, 92, 0x090a0d, 0.94).setStrokeStyle(3, 0xd9cfb6, 0.62);
    const buttonText = this.add.text(0, 0, 'RETURN TO CASE', { color: '#d9cfb6', fontFamily: FONT, fontSize: '14px' }).setOrigin(0.5);
    this.returnButton = this.add.container(this.stageCenterX, 658, [buttonPlate, buttonText]).setDepth(70).setSize(340, 92).setInteractive({ useHandCursor: true });
    this.returnButton.on('pointerdown', () => this.returnToCase());
    this.returnButton.on('pointerover', () => buttonPlate.setStrokeStyle(2, 0xc7a85b, 1));
    this.returnButton.on('pointerout', () => buttonPlate.setStrokeStyle(2, 0xd9cfb6, 0.62));

    this.flash = this.add.rectangle(0, 0, this.stageWidth, GAME_HEIGHT, 0xfff7df, 1).setOrigin(0).setAlpha(0).setDepth(100);
  }

  private createSpotlight(x: number): Phaser.GameObjects.Graphics {
    const light = this.add.graphics({ x, y: 0 });
    light.fillStyle(0xd9cfb6, 0.09);
    light.fillPoints([
      new Phaser.Math.Vector2(-52, 0),
      new Phaser.Math.Vector2(52, 0),
      new Phaser.Math.Vector2(190, 552),
      new Phaser.Math.Vector2(-190, 552),
    ], true);
    return light;
  }

  private createPrisoner(x: number, y: number): Phaser.GameObjects.Container {
    const shadow = this.add.ellipse(0, 0, 112, 25, 0x000000, 0.72);
    const body = this.add.graphics();
    body.fillStyle(0xd0b69f, 1).fillCircle(0, -224, 32);
    body.fillStyle(0x090a0d, 1).fillRoundedRect(-28, -252, 56, 25, 12);
    body.fillStyle(0x27231f, 1).fillTriangle(-51, -184, 51, -184, 70, -28).fillTriangle(-51, -184, -70, -28, 70, -28);
    body.fillStyle(0xc7a85b, 1).fillTriangle(-7, -181, 8, -181, 1, -103);
    body.fillStyle(0x111318, 1).fillRect(-42, -40, 29, 48).fillRect(13, -40, 29, 48);
    body.lineStyle(3, 0xd9cfb6, 0.48).strokeCircle(0, -224, 32).strokeRoundedRect(-56, -188, 112, 158, 8);
    return this.add.container(x, y, [shadow, body]);
  }

  private createBars(width: number): Phaser.GameObjects.Container {
    const pieces: Phaser.GameObjects.Rectangle[] = [];
    const halfWidth = width / 2;
    const gap = Phaser.Math.Clamp(width / 10, 82, 108);
    for (let x = -halfWidth + 18; x <= halfWidth - 18; x += gap) {
      pieces.push(this.add.rectangle(x, 345, 24, 410, 0x090a0d, 1).setStrokeStyle(2, 0x817967, 0.72));
    }
    pieces.push(this.add.rectangle(0, 140, width, 30, 0x090a0d, 1).setStrokeStyle(3, 0xc7a85b, 0.34));
    pieces.push(this.add.rectangle(0, 550, width, 34, 0x090a0d, 1).setStrokeStyle(3, 0x817967, 0.55));
    return this.add.container(0, 0, pieces);
  }

  private playEntrance(): void {
    this.cameras.main.fadeIn(260, 0, 0, 0);
    this.tweens.add({
      targets: this.prisoner,
      x: this.stageCenterX,
      angle: 2,
      duration: 900,
      ease: 'Sine.easeInOut',
      onUpdate: () => this.spotlight.setX(this.prisoner.x),
      onComplete: () => this.prisoner.setAngle(0),
    });
    this.tweens.add({ targets: this.prisoner, y: 534, duration: 210, yoyo: true, repeat: 1, ease: 'Sine.easeInOut' });
    this.tweens.add({
      targets: this.bars,
      y: 0,
      delay: 620,
      duration: 760,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.cameraFlash();
        this.time.delayedCall(720, () => this.cameraFlash());
        this.time.delayedCall(1_050, () => this.finale.settle());
      },
    });
  }

  private cameraFlash(): void {
    this.flashCount += 1;
    this.flash.setAlpha(0.58);
    this.tweens.add({ targets: this.flash, alpha: 0, duration: 180, ease: 'Cubic.easeOut' });
  }

  private settleTableau(showFlash: boolean): void {
    this.tweens.killAll();
    this.prisoner.setPosition(this.stageCenterX, 540).setAngle(0);
    this.spotlight.setX(this.prisoner.x);
    this.bars.setPosition(this.stageCenterX, 0);
    this.flash.setAlpha(showFlash ? 0.34 : 0);
    this.flashCount = showFlash ? 1 : 0;
    this.finale.settle();
  }

  private returnToCase(): void {
    if (this.finale.snapshot().status === 'locked') return;
    this.finale.returnToCase();
    this.game.events.emit('case-closed:return');
    this.scene.stop();
  }

  private publishDebugSnapshot(): void {
    const canvas = this.game.canvas;
    const snapshot = this.finale.snapshot();
    canvas.dataset.caseClosedStatus = snapshot.status;
    canvas.dataset.caseClosedSolved = snapshot.solved.toString();
    canvas.dataset.caseClosedKnowledgeStart = snapshot.knowledgeCountAtStart.toString();
    canvas.dataset.caseClosedKnowledgeCurrent = snapshot.knowledgeCount.toString();
    canvas.dataset.caseClosedReducedMotion = this.reducedMotion.toString();
    canvas.dataset.caseClosedQaPose = this.qaPose;
    canvas.dataset.caseClosedFlashCount = this.flashCount.toString();
    canvas.dataset.caseClosedBarsSettled = (this.bars?.y === 0).toString();
    canvas.dataset.caseClosedPrisonerX = this.prisoner?.x.toFixed(1) ?? 'none';
    canvas.dataset.caseClosedViewportWidth = this.stageWidth.toFixed(1);
    canvas.dataset.caseClosedStageCenterX = this.stageCenterX.toFixed(1);
    canvas.dataset.caseClosedCellWidth = this.cellWidth.toFixed(1);
    canvas.dataset.caseClosedSpotlightX = this.spotlight?.x.toFixed(1) ?? 'none';
    canvas.dataset.caseClosedSpotlightDelta = this.spotlight && this.prisoner ? Math.abs(this.spotlight.x - this.prisoner.x).toFixed(1) : 'none';
  }
}
