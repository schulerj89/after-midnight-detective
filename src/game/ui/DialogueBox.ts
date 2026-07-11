import Phaser from 'phaser';
import {
  DialogueModel,
  type DialogueScript,
} from '../features/dialogue/DialogueModel';

const FONT = '"Press Start 2P", monospace';

export class DialogueBox {
  private readonly model = new DialogueModel();
  private readonly root: Phaser.GameObjects.Container;
  private readonly portrait: Phaser.GameObjects.Image;
  private readonly speaker: Phaser.GameObjects.Text;
  private readonly body: Phaser.GameObjects.Text;
  private readonly prompt: Phaser.GameObjects.Text;
  private onClosed?: () => void;

  constructor(scene: Phaser.Scene) {
    const panel = scene.add.graphics();
    panel.fillStyle(0x090a0d, 0.97);
    panel.fillRoundedRect(0, 0, 1176, 210, 8);
    panel.lineStyle(4, 0xd9cfb6, 1);
    panel.strokeRoundedRect(0, 0, 1176, 210, 8);
    panel.lineStyle(2, 0x8f2432, 1);
    panel.strokeRect(18, 18, 174, 174);
    panel.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, 1176, 210),
      Phaser.Geom.Rectangle.Contains,
    );
    panel.on('pointerdown', () => this.advance());

    this.portrait = scene.add.image(105, 105, '__MISSING').setDisplaySize(158, 158);
    this.speaker = scene.add.text(220, 24, '', {
      color: '#c7a85b',
      fontFamily: FONT,
      fontSize: '16px',
    });
    this.body = scene.add.text(220, 63, '', {
      color: '#d9cfb6',
      fontFamily: FONT,
      fontSize: '18px',
      lineSpacing: 12,
      wordWrap: { width: 910, useAdvancedWrap: true },
    });
    this.prompt = scene.add
      .text(1138, 181, '▼', {
        color: '#8f2432',
        fontFamily: FONT,
        fontSize: '16px',
      })
      .setOrigin(1, 0.5);

    this.root = scene.add
      .container(52, 486, [panel, this.portrait, this.speaker, this.body, this.prompt])
      .setDepth(100)
      .setVisible(false);

    scene.input.keyboard?.on('keydown-SPACE', () => this.advance());
    scene.input.keyboard?.on('keydown-ENTER', () => this.advance());
  }

  open(script: DialogueScript, onClosed?: () => void): void {
    this.model.open(script);
    this.onClosed = onClosed;
    this.root.setVisible(true);
    this.render();
  }

  advance(): void {
    const result = this.model.advance();

    if (result === 'closed') {
      this.root.setVisible(false);
      const onClosed = this.onClosed;
      this.onClosed = undefined;
      onClosed?.();
      return;
    }

    if (result === 'advanced') {
      this.render();
    }
  }

  isOpen(): boolean {
    return this.model.snapshot().isOpen;
  }

  snapshot() {
    return this.model.snapshot();
  }

  private render(): void {
    const snapshot = this.model.snapshot();
    if (!snapshot.isOpen || !snapshot.portraitKey) {
      return;
    }

    this.portrait.setTexture(snapshot.portraitKey).setDisplaySize(158, 158);
    this.speaker.setText(snapshot.speaker ?? '');
    this.body.setText(snapshot.text ?? '');
    this.prompt.setText(snapshot.pageIndex < snapshot.pageCount - 1 ? '▼' : '■');
  }
}
