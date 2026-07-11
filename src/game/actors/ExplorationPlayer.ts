import Phaser from 'phaser';
import {
  resolveMovement,
  type Rect,
} from '../features/movement/CollisionResolver';
import type { MovementVector } from '../features/movement/MovementVector';

export interface ExplorationPlayerSnapshot {
  x: number;
  y: number;
  moving: boolean;
  lean: number;
}

export class ExplorationPlayer {
  private readonly root: Phaser.GameObjects.Container;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly body: Phaser.GameObjects.Image;
  private bobPhase = 0;
  private moving = false;
  private readonly collisionBody = { halfWidth: 30, halfHeight: 20 };

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    textureKey: string,
  ) {
    this.shadow = scene.add.ellipse(0, 0, 108, 25, 0x000000, 0.5);
    this.body = scene.add.image(0, 0, textureKey).setOrigin(0.5, 1);
    this.root = scene.add.container(x, y, [this.shadow, this.body]);
    this.updateDepth();
  }

  update(
    vector: MovementVector,
    deltaMs: number,
    bounds: Rect,
    obstacles: readonly Rect[],
  ): void {
    const speed = 330;
    const deltaSeconds = Math.min(deltaMs, 50) / 1000;
    const previous = { x: this.root.x, y: this.root.y };
    const next = resolveMovement(
      previous,
      {
        x: vector.x * speed * deltaSeconds,
        y: vector.y * speed * deltaSeconds,
      },
      this.collisionBody,
      bounds,
      obstacles,
    );

    this.root.setPosition(next.x, next.y);
    const distance = Phaser.Math.Distance.Between(previous.x, previous.y, next.x, next.y);
    this.moving = distance > 0.05;

    if (this.moving) {
      this.bobPhase += distance * 0.08;
      const bob = Math.abs(Math.sin(this.bobPhase)) * 7;
      this.body.setY(-bob);
      this.body.setRotation(vector.x * 0.055);
      this.shadow.setScale(1 - bob * 0.012, 1 - bob * 0.02);
    } else {
      this.body.setY(0).setRotation(0);
      this.shadow.setScale(1, 1);
    }

    this.updateDepth();
  }

  gameObject(): Phaser.GameObjects.Container {
    return this.root;
  }

  position(): { x: number; y: number } {
    return { x: this.root.x, y: this.root.y };
  }

  setPosition(x: number, y: number): void {
    this.root.setPosition(x, y);
    this.updateDepth();
  }

  snapshot(): ExplorationPlayerSnapshot {
    return {
      x: this.root.x,
      y: this.root.y,
      moving: this.moving,
      lean: this.body.rotation,
    };
  }

  private updateDepth(): void {
    this.root.setDepth(100 + this.root.y);
  }
}
