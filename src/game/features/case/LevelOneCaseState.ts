export interface LevelOneCaseSnapshot {
  flags: readonly string[];
  completedScripts: readonly string[];
  eventLog: readonly string[];
  evidenceCount: number;
  statementCount: number;
  lastUnlock: string | null;
}

export class LevelOneCaseState {
  private readonly flags = new Set<string>();
  private readonly completedScripts = new Set<string>();
  private readonly eventLog: string[] = [];
  private lastUnlock: string | null = null;

  has(flag: string): boolean {
    return this.flags.has(flag);
  }

  hasAll(flags: readonly string[] = []): boolean {
    return flags.every((flag) => this.flags.has(flag));
  }

  hasAny(flags: readonly string[] = []): boolean {
    return flags.some((flag) => this.flags.has(flag));
  }

  completed(scriptId: string): boolean {
    return this.completedScripts.has(scriptId);
  }

  complete(scriptId: string, effects: readonly string[]): readonly string[] {
    if (this.completedScripts.has(scriptId)) return [];
    this.completedScripts.add(scriptId);
    const added = effects.filter((flag) => {
      if (this.flags.has(flag)) return false;
      this.flags.add(flag);
      return true;
    });
    if (added.length > 0) this.lastUnlock = added.at(-1) ?? null;
    this.eventLog.push(`completed:${scriptId}`, ...added.map((flag) => `unlocked:${flag}`));
    return added;
  }

  seed(flags: readonly string[]): void {
    flags.forEach((flag) => this.flags.add(flag));
  }

  snapshot(): LevelOneCaseSnapshot {
    const flags = [...this.flags].sort();
    return {
      flags,
      completedScripts: [...this.completedScripts].sort(),
      eventLog: [...this.eventLog],
      evidenceCount: flags.filter((flag) => flag.startsWith('evidence.')).length,
      statementCount: flags.filter((flag) => flag.startsWith('statement.')).length,
      lastUnlock: this.lastUnlock,
    };
  }
}
