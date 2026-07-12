export type CaseClosedFinaleStatus = 'locked' | 'playing' | 'settled' | 'returned';

export interface CaseClosedFinaleSnapshot {
  status: CaseClosedFinaleStatus;
  solved: boolean;
  knowledgeCountAtStart: number;
  knowledgeCount: number;
}

export class CaseClosedFinale {
  private status: CaseClosedFinaleStatus;

  constructor(private readonly solved: boolean, private readonly knowledgeCountAtStart: number) {
    this.status = solved ? 'playing' : 'locked';
  }

  settle(): void {
    if (this.status === 'playing') this.status = 'settled';
  }

  returnToCase(): void {
    if (this.status === 'playing' || this.status === 'settled') this.status = 'returned';
  }

  snapshot(knowledgeCount = this.knowledgeCountAtStart): CaseClosedFinaleSnapshot {
    return {
      status: this.status,
      solved: this.solved,
      knowledgeCountAtStart: this.knowledgeCountAtStart,
      knowledgeCount,
    };
  }
}
