export type TitlePanel = 'main' | 'settings';
export type TitleMenuAction =
  | 'start'
  | 'settings'
  | 'music-toggle'
  | 'music-volume'
  | 'sfx-volume'
  | 'back';

const PANEL_ACTIONS: Record<TitlePanel, readonly TitleMenuAction[]> = {
  main: ['start', 'settings'],
  settings: ['music-toggle', 'music-volume', 'sfx-volume', 'back'],
};

export class TitleMenuModel {
  private panel: TitlePanel = 'main';
  private selectedIndex = 0;

  openSettings(): void {
    this.panel = 'settings';
    this.selectedIndex = 0;
  }

  back(): void {
    this.panel = 'main';
    this.selectedIndex = 1;
  }

  select(action: TitleMenuAction): boolean {
    const index = this.actions().indexOf(action);
    if (index < 0) return false;
    this.selectedIndex = index;
    return true;
  }

  move(delta: number): TitleMenuAction {
    const actions = this.actions();
    this.selectedIndex = (this.selectedIndex + delta + actions.length) % actions.length;
    return actions[this.selectedIndex];
  }

  currentPanel(): TitlePanel {
    return this.panel;
  }

  selected(): TitleMenuAction {
    return this.actions()[this.selectedIndex];
  }

  actions(): readonly TitleMenuAction[] {
    return PANEL_ACTIONS[this.panel];
  }
}

