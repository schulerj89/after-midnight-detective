export const MOBILE_CONTROL_EVENT = 'amd:mobile-control';
export const MOBILE_MOVE_EVENT = 'amd:mobile-move';

export type MobileControl =
  | 'focus-up'
  | 'focus-down'
  | 'focus-left'
  | 'focus-right'
  | 'action-a'
  | 'action-b';

export type MobileControlHandler = (control: MobileControl) => void;
export interface MobileMoveVector {
  x: number;
  y: number;
}
export type MobileMoveHandler = (vector: MobileMoveVector) => void;

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

  bindAnalogJoystick();
}

function bindAnalogJoystick(): void {
  const pad = document.querySelector<HTMLElement>('.mobile-controls__dpad');
  const knob = document.querySelector<HTMLElement>('.dpad-center');
  if (!pad || !knob || pad.dataset.analogBound === 'true') {
    return;
  }
  pad.dataset.analogBound = 'true';

  let activePointer: number | null = null;
  const knobTravel = 44;

  const emit = (x: number, y: number) => {
    document.dispatchEvent(
      new CustomEvent<MobileMoveVector>(MOBILE_MOVE_EVENT, {
        detail: { x, y },
      }),
    );
  };

  const update = (event: PointerEvent) => {
    const bounds = pad.getBoundingClientRect();
    const radius = bounds.width / 2;
    let x = (event.clientX - (bounds.left + radius)) / radius;
    let y = (event.clientY - (bounds.top + radius)) / radius;
    const magnitude = Math.hypot(x, y);
    if (magnitude > 1) {
      x /= magnitude;
      y /= magnitude;
    }
    knob.style.transform = `translate(${x * knobTravel}px, ${y * knobTravel}px)`;
    emit(x, y);
  };

  const release = (event?: PointerEvent) => {
    if (event && activePointer !== event.pointerId) {
      return;
    }
    activePointer = null;
    knob.style.transform = 'translate(0, 0)';
    emit(0, 0);
  };

  pad.addEventListener('pointerdown', (event) => {
    if (activePointer !== null) {
      return;
    }
    event.preventDefault();
    activePointer = event.pointerId;
    pad.setPointerCapture(event.pointerId);
    update(event);
  });
  pad.addEventListener('pointermove', (event) => {
    if (activePointer === event.pointerId) {
      update(event);
    }
  });
  pad.addEventListener('pointerup', release);
  pad.addEventListener('pointercancel', release);
  pad.addEventListener('lostpointercapture', () => release());
  window.addEventListener('blur', () => release());
}

export function onMobileControl(handler: MobileControlHandler): () => void {
  const listener = (event: Event) => {
    handler((event as CustomEvent<MobileControl>).detail);
  };
  document.addEventListener(MOBILE_CONTROL_EVENT, listener);
  return () => document.removeEventListener(MOBILE_CONTROL_EVENT, listener);
}

export function onMobileMove(handler: MobileMoveHandler): () => void {
  const listener = (event: Event) => {
    handler((event as CustomEvent<MobileMoveVector>).detail);
  };
  document.addEventListener(MOBILE_MOVE_EVENT, listener);
  return () => document.removeEventListener(MOBILE_MOVE_EVENT, listener);
}
