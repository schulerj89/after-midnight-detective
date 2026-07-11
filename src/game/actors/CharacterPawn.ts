import Phaser from 'phaser';

export type CharacterPose = 'neutral' | 'speaking' | 'suspicious' | 'alarmed';

export interface CharacterDebugSnapshot {
  id: string;
  x: number;
  targetX: number;
  moving: boolean;
  pose: CharacterPose;
  rotation: number;
}

export class CharacterPawn {
  private readonly root: Phaser.GameObjects.Container;
  private readonly body: Phaser.GameObjects.Image;
  private readonly textureKeys: Record<CharacterPose, string>;
  private targetX: number;
  private moving = false;
  private pose: CharacterPose = 'neutral';
  private moveTween?: Phaser.Tweens.Tween;
  private bobTween?: Phaser.Tweens.Tween;

  constructor(
    private readonly scene: Phaser.Scene,
    readonly id: string,
    x: number,
    y: number,
    texturePrefix: string,
    onQuestion: () => void,
  ) {
    this.targetX = x;
    this.textureKeys = {
      neutral: `${texturePrefix}-neutral`,
      speaking: `${texturePrefix}-speaking`,
      suspicious: `${texturePrefix}-suspicious`,
      alarmed: `${texturePrefix}-alarmed`,
    };

    const shadow = scene.add.ellipse(0, 2, 104, 24, 0x000000, 0.52);
    this.body = scene.add
      .image(0, 0, this.textureKeys.neutral)
      .setOrigin(0.5, 1)
      .setInteractive({ useHandCursor: true });
    this.body.on('pointerdown', onQuestion);

    this.root = scene.add.container(x, y, [shadow, this.body]).setDepth(5);
  }

  moveTo(x: number, duration = 1800, settlePose: CharacterPose = 'neutral'): void {
    this.moveTween?.stop();
    this.bobTween?.stop();

    this.targetX = x;
    this.moving = true;
    const direction = Math.sign(x - this.root.x) || 1;
    this.body.setRotation(direction * 0.045);

    this.bobTween = this.scene.tweens.add({
      targets: this.body,
      y: -7,
      duration: 230,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    this.moveTween = this.scene.tweens.add({
      targets: this.root,
      x,
      duration,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.bobTween?.stop();
        this.body.setY(0);
        this.scene.tweens.add({
          targets: this.body,
          rotation: 0,
          duration: 180,
          ease: 'Sine.easeOut',
        });
        this.moving = false;
        this.setPose(settlePose);
      },
    });
  }

  setPose(pose: CharacterPose): void {
    this.pose = pose;
    this.body.setTexture(this.textureKeys[pose]);
  }

  setPosition(x: number): void {
    this.moveTween?.stop();
    this.bobTween?.stop();
    this.root.setX(x);
    this.body.setPosition(0, 0).setRotation(0);
    this.targetX = x;
    this.moving = false;
    this.setPose('neutral');
  }

  pauseMovement(): void {
    this.moveTween?.pause();
    this.bobTween?.pause();
  }

  resumeMovement(): void {
    this.moveTween?.resume();
    this.bobTween?.resume();
  }

  snapshot(): CharacterDebugSnapshot {
    return {
      id: this.id,
      x: this.root.x,
      targetX: this.targetX,
      moving: this.moving,
      pose: this.pose,
      rotation: this.body.rotation,
    };
  }
}
