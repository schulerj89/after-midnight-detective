export interface DialogueScript {
  id: string;
  speaker: string;
  portraitKey: string;
  pages: readonly string[];
}

export interface DialogueSnapshot {
  isOpen: boolean;
  scriptId: string | null;
  speaker: string | null;
  portraitKey: string | null;
  pageIndex: number;
  pageCount: number;
  text: string | null;
}

export type DialogueAdvanceResult = 'advanced' | 'closed' | 'idle';

export class DialogueModel {
  private script: DialogueScript | null = null;
  private pageIndex = 0;

  open(script: DialogueScript): void {
    if (script.pages.length === 0) {
      throw new Error(`Dialogue script "${script.id}" must contain at least one page.`);
    }

    this.script = script;
    this.pageIndex = 0;
  }

  advance(): DialogueAdvanceResult {
    if (!this.script) {
      return 'idle';
    }

    if (this.pageIndex < this.script.pages.length - 1) {
      this.pageIndex += 1;
      return 'advanced';
    }

    this.close();
    return 'closed';
  }

  close(): void {
    this.script = null;
    this.pageIndex = 0;
  }

  snapshot(): DialogueSnapshot {
    return {
      isOpen: this.script !== null,
      scriptId: this.script?.id ?? null,
      speaker: this.script?.speaker ?? null,
      portraitKey: this.script?.portraitKey ?? null,
      pageIndex: this.script ? this.pageIndex : 0,
      pageCount: this.script?.pages.length ?? 0,
      text: this.script?.pages[this.pageIndex] ?? null,
    };
  }
}
