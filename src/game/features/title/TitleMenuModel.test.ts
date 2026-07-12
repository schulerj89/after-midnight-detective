import { describe, expect, it } from 'vitest';
import { TitleMenuModel } from './TitleMenuModel';

describe('TitleMenuModel', () => {
  it('wraps main-menu selection in both directions', () => {
    const menu = new TitleMenuModel();
    expect(menu.selected()).toBe('start');
    expect(menu.move(-1)).toBe('settings');
    expect(menu.move(1)).toBe('start');
  });

  it('opens settings and returns with settings selected', () => {
    const menu = new TitleMenuModel();
    menu.openSettings();
    expect(menu.currentPanel()).toBe('settings');
    expect(menu.actions()).toEqual(['music-toggle', 'music-volume', 'sfx-volume', 'back']);
    menu.back();
    expect(menu.currentPanel()).toBe('main');
    expect(menu.selected()).toBe('settings');
  });

  it('only selects actions in the active panel', () => {
    const menu = new TitleMenuModel();
    expect(menu.select('sfx-volume')).toBe(false);
    expect(menu.select('settings')).toBe(true);
    expect(menu.selected()).toBe('settings');
  });
});

