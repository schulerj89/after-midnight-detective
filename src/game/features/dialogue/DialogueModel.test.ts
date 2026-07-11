import { describe, expect, it } from 'vitest';
import { DialogueModel, type DialogueScript } from './DialogueModel';

const script: DialogueScript = {
  id: 'test-dialogue',
  speaker: 'TEST WITNESS',
  portraitKey: 'portrait-test',
  pages: ['First page.', 'Second page.'],
};

describe('DialogueModel', () => {
  it('opens on the first page and exposes source metadata', () => {
    const dialogue = new DialogueModel();
    dialogue.open(script);

    expect(dialogue.snapshot()).toMatchObject({
      isOpen: true,
      scriptId: 'test-dialogue',
      speaker: 'TEST WITNESS',
      pageIndex: 0,
      pageCount: 2,
      text: 'First page.',
    });
  });

  it('advances and closes after the final page', () => {
    const dialogue = new DialogueModel();
    dialogue.open(script);

    expect(dialogue.advance()).toBe('advanced');
    expect(dialogue.snapshot().text).toBe('Second page.');
    expect(dialogue.advance()).toBe('closed');
    expect(dialogue.snapshot()).toMatchObject({ isOpen: false, pageCount: 0 });
    expect(dialogue.advance()).toBe('idle');
  });

  it('rejects an empty dialogue script', () => {
    const dialogue = new DialogueModel();
    expect(() => dialogue.open({ ...script, pages: [] })).toThrow(/at least one page/);
  });
});
