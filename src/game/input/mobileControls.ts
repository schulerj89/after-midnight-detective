export const MOBILE_CONTROL_EVENT = 'amd:mobile-control';

export type MobileControl =
  | 'focus-up'
  | 'focus-down'
  | 'focus-left'
  | 'focus-right'
  | 'action-a'
  | 'action-b';

export type MobileControlHandler = (control: MobileControl) => void;

export function bindMobileControls(): void {
  document.querySelectorAll<HTMLElement>('[data-game-control]').forEach((control) => {
    if (control.dataset.mobileControlBound === 'true') {
      return;
    }
    control.dataset.mobileControlBound = 'true';
    control.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      const value = control.dataset.gameControl as MobileControl | undefined;
      if (!value) {
        return;
      }

      document.dispatchEvent(
        new CustomEvent<MobileControl>(MOBILE_CONTROL_EVENT, { detail: value }),
      );
    });
  });
}

export function onMobileControl(handler: MobileControlHandler): () => void {
  const listener = (event: Event) => {
    handler((event as CustomEvent<MobileControl>).detail);
  };
  document.addEventListener(MOBILE_CONTROL_EVENT, listener);
  return () => document.removeEventListener(MOBILE_CONTROL_EVENT, listener);
}
