import type { LevelOneReenactmentBeat } from '../../content/cases/levelOneReenactmentContent';

interface ReenactmentHudOptions {
  onTogglePause: () => boolean;
  onSkip: () => void;
}

export class ReenactmentHud {
  private readonly root: HTMLElement;
  private readonly time: HTMLElement;
  private readonly provenance: HTMLElement;
  private readonly heading: HTMLElement;
  private readonly caption: HTMLElement;
  private readonly pause: HTMLButtonElement;
  private readonly skip: HTMLButtonElement;
  private skipArmed = false;

  constructor(private readonly options: ReenactmentHudOptions) {
    this.root = document.createElement('section');
    this.root.id = 'reenactment-ui';
    this.root.setAttribute('aria-label', "The detective's reconstruction");
    this.root.setAttribute('aria-hidden', 'true');

    const controls = this.element('div', 'reenactment__controls');
    this.pause = this.button('PAUSE', 'reenactment__pause', () => {
      const paused = this.options.onTogglePause();
      this.setPaused(paused);
    });
    this.pause.dataset.reenactmentAction = 'pause';
    this.skip = this.button('SKIP', 'reenactment__skip', () => this.requestSkip());
    this.skip.dataset.reenactmentAction = 'skip';
    controls.append(this.pause, this.skip);

    const card = this.element('div', 'reenactment__card');
    const meta = this.element('div', 'reenactment__meta');
    this.time = this.element('time');
    this.provenance = this.element('strong');
    meta.append(this.time, this.provenance);
    this.heading = this.element('h2');
    this.caption = this.element('p');
    card.append(meta, this.heading, this.caption);
    this.root.append(controls, card);
    document.body.append(this.root);
  }

  show(beat: LevelOneReenactmentBeat, reducedMotion: boolean): void {
    this.skipArmed = false;
    this.skip.textContent = 'SKIP';
    this.root.className = `is-open is-${beat.provenance.toLowerCase()} action-${beat.stageAction}${reducedMotion ? ' is-reduced-motion' : ''}`;
    this.root.setAttribute('aria-hidden', 'false');
    document.body.classList.add('reenactment-open');
    this.time.textContent = beat.time;
    this.provenance.textContent = beat.provenance;
    this.heading.textContent = beat.heading;
    this.caption.textContent = beat.caption;
  }

  setPaused(paused: boolean): void {
    this.pause.textContent = paused ? 'RESUME' : 'PAUSE';
    this.root.classList.toggle('is-paused', paused);
  }

  hide(): void {
    this.root.className = '';
    this.root.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('reenactment-open');
    this.setPaused(false);
  }

  destroy(): void {
    document.body.classList.remove('reenactment-open');
    this.root.remove();
  }

  requestSkip(): void {
    if (!this.skipArmed) {
      this.skipArmed = true;
      this.skip.textContent = 'CONFIRM SKIP';
      return;
    }
    this.options.onSkip();
  }

  private element<K extends keyof HTMLElementTagNameMap>(tag: K, className = ''): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);
    if (className) element.className = className;
    return element;
  }

  private button(text: string, className: string, action: () => void): HTMLButtonElement {
    const button = this.element('button', className);
    button.type = 'button';
    button.textContent = text;
    button.addEventListener('click', action);
    return button;
  }
}
