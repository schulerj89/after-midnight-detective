import type { DialogueScript } from '../../game/features/dialogue/DialogueModel';
import type { LevelOneCaseState } from '../../game/features/case/LevelOneCaseState';

export interface LevelOneInteractionVariant {
  id: string;
  targetId: string;
  prompt: string;
  requiresAll?: readonly string[];
  excludesAny?: readonly string[];
  script: DialogueScript;
  effects: readonly string[];
}

function script(id: string, speaker: string, portraitKey: string, pages: readonly string[]): DialogueScript {
  return { id, speaker, portraitKey, pages };
}

const DETECTIVE = 'portrait-detective';
const VERA = 'portrait-vera';
const MILES = 'portrait-miles';
const OFFICER = 'portrait-officer';

export const LEVEL_ONE_CASE_TRUTH = {
  victim: 'Elias Wren',
  culpritId: 'npc.miles',
  note: 'Canonical truth is not copied into player knowledge flags.',
} as const;

export const LEVEL_ONE_INTERACTIONS: readonly LevelOneInteractionVariant[] = [
  {
    id: 'dlg.officer.first-question', targetId: 'npc.officer', prompt: 'QUESTION OFFICER HALE',
    excludesAny: ['reviewed.officer.first-question'],
    script: script('dlg.officer.first-question', 'OFFICER HALE', OFFICER, [
      'I sealed the hotel exits when the alarm sounded.',
      'Nobody passed me after that. The guests stayed inside.',
      'Move where you need, detective. I will hold the doors.',
    ]),
    effects: ['statement.officer.exits-sealed', 'reviewed.officer.first-question'],
  },
  {
    id: 'dlg.officer.repeat', targetId: 'npc.officer', prompt: 'QUESTION OFFICER HALE AGAIN',
    script: script('dlg.officer.repeat', 'OFFICER HALE', OFFICER, ['The exits are still sealed. Nobody leaves without my seeing them.']), effects: [],
  },
  {
    id: 'dlg.vera.followup.torn-ledger', targetId: 'npc.vera', prompt: 'ASK VERA ABOUT THE TORN LEDGER',
    requiresAll: ['topic.vera.torn-ledger', 'confrontation.miles.torn-ledger'], excludesAny: ['reviewed.vera.torn-ledger'],
    script: script('dlg.vera.followup.torn-ledger', 'VERA VALE', VERA, [
      'I tore it. The guest in 317 paid for quiet.',
      'Miles took the key at 12:08.',
      'It was not on my desk afterward.',
    ]),
    effects: ['statement.vera.tore-ledger', 'statement.vera.protected-guest', 'statement.vera.key-not-returned', 'topic.miles.missing-key', 'reviewed.vera.torn-ledger'],
  },
  {
    id: 'dlg.vera.after-wet-footprints', targetId: 'npc.vera', prompt: 'ASK VERA ABOUT THE WET FOOTPRINTS',
    requiresAll: ['evidence.wet-footprints'], excludesAny: ['reviewed.vera.wet-footprints'],
    script: script('dlg.vera.after-wet-footprints', 'VERA VALE', VERA, [
      'Those prints came through the service door. Mine did not.',
      'That door sticks. Miles carries the square service key.',
    ]),
    effects: ['statement.vera.denies-prints', 'statement.vera.miles-service-key', 'reviewed.vera.wet-footprints'],
  },
  {
    id: 'dlg.vera.first-question', targetId: 'npc.vera', prompt: 'QUESTION VERA',
    excludesAny: ['reviewed.vera.first-question'],
    script: script('dlg.vera.first-question', 'VERA VALE', VERA, [
      'You can ask, detective. Just do not make a show of it.',
      'I stayed beside the desk after midnight.',
      'Miles crossed toward the kitchen before the lights failed.',
    ]),
    effects: ['statement.vera.desk-alibi', 'statement.vera.miles-kitchen', 'reviewed.vera.first-question'],
  },
  {
    id: 'dlg.vera.repeat', targetId: 'npc.vera', prompt: 'QUESTION VERA AGAIN',
    script: script('dlg.vera.repeat', 'VERA VALE', VERA, ['I have told you what I saw. Ask about something specific.']), effects: [],
  },
  {
    id: 'dlg.miles.followup.missing-key', targetId: 'npc.miles', prompt: 'ASK MILES ABOUT THE MISSING KEY',
    requiresAll: ['topic.miles.missing-key', 'statement.vera.key-not-returned'], excludesAny: ['reviewed.miles.missing-key'],
    script: script('dlg.miles.followup.missing-key', 'MILES PIKE', MILES, [
      'Vale says the key never reached her desk.',
      'Then compare her story with the switchboard log.',
    ]),
    effects: ['statement.miles.disputes-key-claim', 'reviewed.miles.missing-key', 'variant.miles.checks-office-next-loop'],
  },
  {
    id: 'confront.miles.torn-ledger', targetId: 'npc.miles', prompt: 'SHOW TORN LEDGER TO MILES',
    requiresAll: ['evidence.torn-ledger', 'statement.miles.denies-317'], excludesAny: ['confrontation.miles.torn-ledger'],
    script: script('confront.miles.torn-ledger', 'MILES PIKE', MILES, [
      'That line records an errand, not a visit.',
      'Vale gave me the key to Room 317.',
      'She told me to leave it on her desk.',
      'Ask why she tore the page.',
    ]),
    effects: ['confrontation.miles.torn-ledger', 'statement.miles.key-was-errand', 'statement.miles.vale-gave-key', 'topic.vera.torn-ledger'],
  },
  {
    id: 'dlg.miles.after-switchboard-log', targetId: 'npc.miles', prompt: 'ASK MILES ABOUT THE SWITCHBOARD LOG',
    requiresAll: ['evidence.switchboard-log'], excludesAny: ['reviewed.miles.switchboard-log'],
    script: script('dlg.miles.after-switchboard-log', 'MILES PIKE', MILES, [
      'Vale keeps the switchboard pencil behind her office desk.',
      'Nobody else should have written in that log.',
    ]),
    effects: ['statement.miles.vale-kept-pencil', 'reviewed.miles.switchboard-log'],
  },
  {
    id: 'dlg.miles.after-damp-matchbook', targetId: 'npc.miles', prompt: 'ASK MILES ABOUT THE DAMP MATCHBOOK',
    requiresAll: ['evidence.damp-matchbook'], excludesAny: ['reviewed.miles.damp-matchbook'],
    script: script('dlg.miles.after-damp-matchbook', 'MILES PIKE', MILES, [
      'Marlowe matchbooks sit at every desk.',
      'Damp proves very little in weather like this.',
    ]),
    effects: ['statement.miles.matchbooks-common', 'reviewed.miles.damp-matchbook'],
  },
  {
    id: 'dlg.miles.first-question', targetId: 'npc.miles', prompt: 'QUESTION MILES',
    excludesAny: ['reviewed.miles.first-question'],
    script: script('dlg.miles.first-question', 'MILES PIKE', MILES, [
      'I was at the north windows when the floor went black.',
      'Vera was near the piano. I did not see her leave.',
      'I did not enter Room 317. Put that in your book.',
    ]),
    effects: ['statement.miles.window-alibi', 'statement.miles.vera-at-piano', 'statement.miles.denies-317', 'reviewed.miles.first-question'],
  },
  {
    id: 'dlg.miles.repeat', targetId: 'npc.miles', prompt: 'QUESTION MILES AGAIN',
    script: script('dlg.miles.repeat', 'MILES PIKE', MILES, ['Bring evidence, detective. I have no use for guesses.']), effects: [],
  },
  {
    id: 'inspect.wet-footprints.first', targetId: 'clue.wet-footprints', prompt: 'INSPECT WET FOOTPRINTS',
    excludesAny: ['evidence.wet-footprints'],
    script: script('inspect.wet-footprints.first', 'DETECTIVE', DETECTIVE, [
      'Wet prints cross the lounge from the kitchen door.',
      'The right heel leaves a narrow break in every print.',
      'The trail fades beside the piano. It reaches no person.',
    ]),
    effects: ['evidence.wet-footprints', 'observation.footprints.service-to-piano'],
  },
  {
    id: 'inspect.torn-ledger.first', targetId: 'clue.torn-ledger', prompt: 'INSPECT TORN LEDGER',
    excludesAny: ['evidence.torn-ledger'],
    script: script('inspect.torn-ledger.first', 'DETECTIVE', DETECTIVE, [
      'A ledger strip was torn away instead of cleanly removed.',
      'The carbon sheet reads: 317 / M. PIKE / 12:08.',
      'It proves a key was logged, not who entered the room.',
    ]),
    effects: ['evidence.torn-ledger', 'observation.ledger-317-key-line', 'topic.miles.torn-ledger'],
  },
  {
    id: 'inspect.damp-matchbook.first', targetId: 'clue.damp-matchbook', prompt: 'INSPECT DAMP MATCHBOOK',
    excludesAny: ['evidence.damp-matchbook'],
    script: script('inspect.damp-matchbook.first', 'DETECTIVE', DETECTIVE, [
      'The Marlowe matchbook is damp with clean rainwater.',
      'One match is missing. Black soot marks the striker.',
      'It lay behind the service counter below a dry shelf.',
    ]),
    effects: ['evidence.damp-matchbook', 'observation.matchbook.damp-and-sooted'],
  },
  {
    id: 'inspect.stopped-watch.first', targetId: 'clue.stopped-watch', prompt: 'INSPECT STOPPED WATCH',
    excludesAny: ['evidence.stopped-watch'],
    script: script('inspect.stopped-watch.first', 'DETECTIVE', DETECTIVE, [
      'The watch stopped at 12:17. Its crystal cracked inward.',
      'A stopped watch marks damage, not necessarily the crime.',
    ]),
    effects: ['evidence.stopped-watch', 'observation.watch.stopped-1217'],
  },
  {
    id: 'inspect.switchboard-log.first', targetId: 'clue.switchboard-log', prompt: 'INSPECT SWITCHBOARD LOG',
    excludesAny: ['evidence.switchboard-log'],
    script: script('inspect.switchboard-log.first', 'DETECTIVE', DETECTIVE, [
      'The switchboard log records a call to 317 at 12:06.',
      'A second note says KITCHEN, 12:14, in other pencil.',
      'It records connections. It does not name the callers.',
    ]),
    effects: ['evidence.switchboard-log', 'observation.log.317-1206', 'observation.log.kitchen-1214'],
  },
];

export function resolveLevelOneInteraction(targetId: string, state: LevelOneCaseState): LevelOneInteractionVariant | undefined {
  const authored = LEVEL_ONE_INTERACTIONS.find((variant) =>
    variant.targetId === targetId &&
    state.hasAll(variant.requiresAll) &&
    !state.hasAny(variant.excludesAny),
  );
  if (authored || !targetId.startsWith('clue.')) return authored;
  const knownClue = LEVEL_ONE_INTERACTIONS.some((variant) => variant.targetId === targetId && targetId.startsWith('clue.'));
  if (!knownClue) return undefined;
  const label = targetId.slice('clue.'.length).replaceAll('-', ' ').toUpperCase();
  return {
    id: `inspect.${targetId}.repeat`,
    targetId,
    prompt: `REVIEW ${label}`,
    script: script(`inspect.${targetId}.repeat`, 'DETECTIVE', DETECTIVE, [`${label}. The detail is already recorded in the case notes.`]),
    effects: [],
  };
}
