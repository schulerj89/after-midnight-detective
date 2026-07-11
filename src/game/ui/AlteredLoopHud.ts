import type { AlteredLoopPhase } from '../features/timeline/AlteredLoopRestage';

interface AlteredLoopHudOptions {
  onExit: (openTimeline: boolean) => void;
}

export class AlteredLoopHud {
  private readonly root: HTMLElement;
  private readonly time: HTMLElement;
  private readonly heading: HTMLElement;
  private readonly caption: HTMLElement;
  private readonly endButton: HTMLButtonElement;
  private recorded = false;
  private endArmed = false;

  constructor(private readonly options: AlteredLoopHudOptions) {
    this.root = document.createElement('section');
    this.root.id = 'altered-loop-ui';
    this.root.setAttribute('aria-label', 'Altered loop live observation');
    this.root.setAttribute('aria-hidden', 'true');

    const label = this.element('strong', 'altered-loop__label', 'ALTERED LOOP // LIVE OBSERVATION');
    this.endButton = this.button('END RESTAGING', 'altered-loop__end', () => this.requestEnd());
    this.endButton.dataset.alteredLoopAction = 'end';
    const card = this.element('div', 'altered-loop__card');
    this.time = this.element('time');
    this.heading = this.element('h2');
    this.caption = this.element('p');
    card.append(this.time, this.heading, this.caption);
    this.root.append(label, this.endButton, card);
    document.body.append(this.root);
  }

  show(phase: AlteredLoopPhase, reducedMotion: boolean): void {
    if (phase.id === 'reset') {
      this.recorded = false;
      this.endArmed = false;
      this.endButton.textContent = 'END RESTAGING';
    }
    this.root.className = `is-open phase-${phase.id}${reducedMotion ? ' is-reduced-motion' : ''}`;
    this.root.setAttribute('aria-hidden', 'false');
    document.body.classList.add('altered-loop-focus');
    this.time.textContent = phase.time;
    this.heading.textContent = phase.heading;
    this.caption.textContent = phase.caption;
    if (phase.recordsObservation) {
      this.recorded = true;
      this.endArmed = false;
      this.endButton.textContent = 'RETURN TO CASE';
    }
  }

  hide(): void {
    this.root.className = '';
    this.root.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('altered-loop-focus');
    this.endArmed = false;
    this.endButton.textContent = 'END RESTAGING';
  }

  destroy(): void {
    document.body.classList.remove('altered-loop-focus');
    this.root.remove();
  }

  requestEnd(): void {
    if (!this.recorded && !this.endArmed) {
      this.endArmed = true;
      this.endButton.textContent = 'CONFIRM END';
      return;
    }
    this.options.onExit(this.recorded);
  }

  private element<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  private button(text: string, className: string, action: () => void): HTMLButtonElement {
    const button = this.element('button', className, text);
    button.type = 'button';
    button.addEventListener('click', action);
    return button;
  }
}
