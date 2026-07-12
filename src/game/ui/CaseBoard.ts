import {
  evaluateLevelOneAccusation,
  type LevelOneAccusationDraft,
  type LevelOneAccusationResult,
} from '../features/case/LevelOneAccusation';
import type { LevelOneCaseState } from '../features/case/LevelOneCaseState';
import type { LevelOneTimeline } from '../features/timeline/LevelOneTimeline';

type CaseTab = 'notebook' | 'timeline' | 'accuse';

interface CaseBoardOptions {
  state: LevelOneCaseState;
  timeline: LevelOneTimeline;
  onReplay: () => void;
  onSolved: (result: LevelOneAccusationResult) => void;
  onVisibilityChange: (visible: boolean) => void;
  onReplayReenactment?: () => void;
}

const LABELS: Readonly<Record<string, string>> = {
  'evidence.torn-ledger': 'Torn ledger: Room 317 / M. Pike / 12:08',
  'evidence.wet-footprints': 'Wet footprints: broken right heel, service door to piano',
  'evidence.damp-matchbook': 'Damp Marlowe matchbook with soot on the striker',
  'evidence.stopped-watch': 'Stopped watch: cracked inward at 12:17',
  'evidence.switchboard-log': 'Switchboard log: Room 317 at 12:06; kitchen at 12:14',
  'statement.miles.denies-317': 'Miles: “I did not enter Room 317.”',
  'statement.vera.key-not-returned': 'Vera: Miles took the Room 317 key and did not return it.',
  'statement.officer.exits-sealed': 'Officer Hale: nobody passed him after the alarm.',
  'contradiction.miles-denied-317': 'Contradiction: Miles denies 317, but the ledger records him taking its key.',
  'timeline.miles-office-deviation': '12:11, altered loop: Miles abandons the windows and checks the manager office.',
  'observation.miles-office-check': 'Observed: Miles returns from the office with a wet right heel.',
};

export class CaseBoard {
  private readonly root: HTMLElement;
  private readonly options: CaseBoardOptions;
  private tab: CaseTab = 'notebook';
  private visible = false;
  private inputLocked = false;
  private result: LevelOneAccusationResult | null = null;
  private draft: LevelOneAccusationDraft = {
    suspectId: null,
    evidenceId: null,
    contradictionId: null,
    timelineFactId: null,
  };

  constructor(options: CaseBoardOptions) {
    this.options = options;
    this.root = document.createElement('section');
    this.root.id = 'case-board';
    this.root.setAttribute('aria-label', 'Detective case board');
    this.root.setAttribute('aria-hidden', 'true');
    document.body.append(this.root);
    this.render();
  }

  isOpen(): boolean {
    return this.visible;
  }

  open(tab: CaseTab = this.tab): void {
    this.tab = tab;
    this.visible = true;
    this.root.classList.add('is-open');
    this.root.setAttribute('aria-hidden', 'false');
    document.body.classList.add('case-board-open');
    this.options.onVisibilityChange(true);
    this.render();
  }

  close(): void {
    this.visible = false;
    this.root.classList.remove('is-open');
    this.root.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('case-board-open');
    this.options.onVisibilityChange(false);
  }

  toggle(): void {
    this.visible ? this.close() : this.open();
  }

  setInputLocked(locked: boolean): void {
    this.inputLocked = locked;
  }

  showSolved(result: LevelOneAccusationResult): void {
    this.result = result;
    this.tab = 'accuse';
    this.open('accuse');
  }

  destroy(): void {
    document.body.classList.remove('case-board-open');
    this.root.remove();
  }

  private render(): void {
    this.root.replaceChildren();
    const shell = this.element('div', 'case-board__shell');
    const header = this.element('header', 'case-board__header');
    header.append(
      this.element('div', 'case-board__eyebrow', 'HOTEL MARLOWE // LEVEL 1'),
      this.element('h1', '', this.result?.status === 'solved' ? 'CASE CLOSED' : 'DETECTIVE NOTEBOOK'),
    );
    const close = this.button('×', 'case-board__close', () => this.close());
    close.setAttribute('aria-label', 'Close case board');
    header.append(close);
    shell.append(header);

    const tabs = this.element('nav', 'case-board__tabs');
    (['notebook', 'timeline', 'accuse'] as const).forEach((tab) => {
      const button = this.button(tab.toUpperCase(), this.tab === tab ? 'is-selected' : '', () => {
        this.tab = tab;
        this.render();
      });
      button.dataset.caseTab = tab;
      tabs.append(button);
    });
    shell.append(tabs);

    const content = this.element('div', 'case-board__content');
    if (this.tab === 'notebook') this.renderNotebook(content);
    if (this.tab === 'timeline') this.renderTimeline(content);
    if (this.tab === 'accuse') this.renderAccusation(content);
    shell.append(content);
    this.root.append(shell);
  }

  private renderNotebook(content: HTMLElement): void {
    const snapshot = this.options.state.snapshot();
    content.append(this.element('p', 'case-board__lede', 'Evidence is fact. Statements remain attributed claims until the case connects them.'));
    const columns = this.element('div', 'case-board__columns');
    columns.append(
      this.flagSection('EVIDENCE', snapshot.flags.filter((flag) => flag.startsWith('evidence.'))),
      this.flagSection('STATEMENTS & CONTRADICTIONS', snapshot.flags.filter((flag) => flag.startsWith('statement.') || flag.startsWith('contradiction.'))),
    );
    content.append(columns);
  }

  private renderTimeline(content: HTMLElement): void {
    const timeline = this.options.timeline.snapshot();
    const flags = this.options.state.snapshot().flags;
    content.append(this.element('p', 'case-board__lede', `LOOP ${timeline.loop} // ${Math.floor(timeline.elapsedMs / 1_000)}s OF ${timeline.durationMs / 1_000}s`));
    content.append(this.element(
      'p',
      'case-board__loop-note',
      this.options.state.has('variant.miles.checks-office-next-loop')
        ? 'LIVE OBSERVATION: return to the lounge and watch Miles at 12:11. The solved cinematic unlocks after a correct accusation.'
        : 'LIVE OBSERVATION: this restages character behavior; it is not the post-solve reconstruction.',
    ));
    const list = this.element('ol', 'case-board__timeline');
    const entries = [
      ['12:06', 'CLAIMED', 'Vera at the desk; Room 317 receives a call.'],
      ['12:08', 'RECORDED', 'Ledger assigns the Room 317 key to M. Pike.'],
      ['12:14', 'CLAIMED', 'Miles says he remained at the north windows.'],
    ];
    if (flags.includes('timeline.miles-office-deviation')) {
      entries.splice(2, 0, ['12:11', 'OBSERVED', 'Miles checks the manager office, breaking his window alibi.']);
    }
    entries.forEach(([time, provenance, copy]) => {
      const item = this.element('li');
      item.append(this.element('time', '', time), this.element('strong', '', provenance), this.element('span', '', copy));
      list.append(item);
    });
    content.append(list);
    const replayLabel = this.options.state.has('variant.miles.checks-office-next-loop')
      ? 'RESTAGE ALTERED LOOP'
      : 'START NEXT OBSERVATION LOOP';
    const replay = this.button(replayLabel, 'case-board__replay', () => {
      this.options.onReplay();
      this.close();
    });
    replay.dataset.caseAction = 'replay';
    content.append(replay);
  }

  private renderAccusation(content: HTMLElement): void {
    if (this.result?.status === 'solved') {
      const ending = this.element('div', 'case-board__ending');
      ending.append(
        this.element('div', 'case-board__stamp', 'SOLVED'),
        this.element('h2', '', 'MILES PIKE BROKE HIS ALIBI'),
        this.element('p', '', this.result.message),
        this.element('p', 'case-board__ending-note', 'Officer Hale takes Miles into the rain. The Marlowe keeps its secrets—except this one.'),
      );
      if (this.options.onReplayReenactment) {
        const replay = this.button('REPLAY RECONSTRUCTION', 'case-board__replay-reconstruction', this.options.onReplayReenactment);
        replay.dataset.caseAction = 'replay-reconstruction';
        ending.append(replay);
      }
      content.append(ending);
      return;
    }

    content.append(this.element('p', 'case-board__lede', 'Name the suspect, then support the accusation with one clue, one contradiction, and one witnessed timeline fact.'));
    const selectedCount = Object.values(this.draft).filter(Boolean).length;
    content.append(this.element('p', 'case-board__theory-progress', `THEORY LINKS SELECTED: ${selectedCount}/4`));
    const theory = this.element('div', 'case-board__theory');
    theory.append(
      this.choiceGroup('SUSPECT', 'suspectId', [['npc.vera', 'VERA VALE'], ['npc.miles', 'MILES PIKE']]),
      this.choiceGroup('DECISIVE EVIDENCE', 'evidenceId', [['evidence.torn-ledger', 'TORN LEDGER'], ['evidence.wet-footprints', 'WET FOOTPRINTS'], ['evidence.damp-matchbook', 'DAMP MATCHBOOK']]),
      this.choiceGroup('BROKEN CLAIM', 'contradictionId', [['contradiction.miles-denied-317', 'MILES DENIED ROOM 317'], ['statement.vera.desk-alibi', 'VERA CLAIMED THE DESK']]),
      this.choiceGroup('TIMELINE FACT', 'timelineFactId', [['timeline.miles-office-deviation', 'MILES CHECKED THE OFFICE'], ['statement.officer.exits-sealed', 'HALE SEALED THE EXITS']]),
    );
    content.append(theory);
    if (this.result) content.append(this.element('p', `case-board__feedback is-${this.result.status}`, this.result.message));
    const submit = this.button('PRESENT ACCUSATION', 'case-board__submit', () => this.submit());
    submit.dataset.caseAction = 'submit-accusation';
    content.append(submit);
  }

  private choiceGroup(
    label: string,
    key: keyof LevelOneAccusationDraft,
    choices: readonly (readonly [string, string])[],
  ): HTMLElement {
    const group = this.element('fieldset', 'case-board__choice-group');
    if (this.result?.missing.includes(key)) group.classList.add('is-missing');
    group.append(this.element('legend', '', label));
    choices.forEach(([id, copy]) => {
      const selected = this.draft[key] === id;
      const button = this.button(copy, selected ? 'is-selected' : '', () => {
        this.draft = { ...this.draft, [key]: id };
        this.result = null;
        this.render();
      });
      button.dataset.caseChoice = key;
      button.dataset.caseValue = id;
      if (key !== 'suspectId' && !this.options.state.has(id)) {
        button.disabled = true;
        button.title = 'Not yet recorded in the notebook';
      }
      group.append(button);
    });
    return group;
  }

  private submit(): void {
    this.result = evaluateLevelOneAccusation(this.draft, this.options.state);
    if (this.result.status === 'solved') this.options.onSolved(this.result);
    this.render();
  }

  private flagSection(title: string, flags: readonly string[]): HTMLElement {
    const section = this.element('section', 'case-board__section');
    section.append(this.element('h2', '', title));
    const list = this.element('ul');
    if (flags.length === 0) list.append(this.element('li', 'is-empty', 'No entries yet.'));
    flags.forEach((flag) => list.append(this.element('li', '', LABELS[flag] ?? flag.replaceAll('.', ' ').toUpperCase())));
    section.append(list);
    return section;
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
    button.disabled = this.inputLocked;
    button.addEventListener('click', action);
    return button;
  }
}
