export class FocusNavigator<T extends string> {
  private selectedIndex = 0;

  constructor(private readonly targetIds: readonly T[]) {
    if (targetIds.length === 0) {
      throw new Error('FocusNavigator requires at least one target.');
    }
  }

  selected(): T {
    return this.targetIds[this.selectedIndex]!;
  }

  next(): T {
    this.selectedIndex = (this.selectedIndex + 1) % this.targetIds.length;
    return this.selected();
  }

  previous(): T {
    this.selectedIndex =
      (this.selectedIndex - 1 + this.targetIds.length) % this.targetIds.length;
    return this.selected();
  }

  select(targetId: T): T {
    const index = this.targetIds.indexOf(targetId);
    if (index === -1) {
      throw new Error(`Unknown focus target "${targetId}".`);
    }
    this.selectedIndex = index;
    return this.selected();
  }
}
