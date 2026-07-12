export type ReenactmentProvenance = 'RECORDED' | 'TESTIMONY' | 'OBSERVED' | 'INFERRED';

export type ReenactmentStageAction =
  | 'title'
  | 'miles-window-alibi'
  | 'key-ledger'
  | 'room-317-door'
  | 'office-deviation'
  | 'finale';

export interface LevelOneReenactmentBeat {
  id: string;
  durationMs: number;
  roomId: 'lounge' | 'bedroom' | 'office';
  time: string;
  heading: string;
  caption: string;
  provenance: ReenactmentProvenance;
  basisIds: readonly string[];
  stageAction: ReenactmentStageAction;
}

export const LEVEL_ONE_REENACTMENT_BEATS: readonly LevelOneReenactmentBeat[] = [
  {
    id: 'reconstruction.title',
    durationMs: 2_800,
    roomId: 'lounge',
    time: 'AFTER MIDNIGHT',
    heading: "THE DETECTIVE'S RECONSTRUCTION",
    caption: 'Not omniscient truth—the night as the evidence permits it.',
    provenance: 'INFERRED',
    basisIds: ['outcome.level-one-solved'],
    stageAction: 'title',
  },
  {
    id: 'reconstruction.window-alibi',
    durationMs: 5_000,
    roomId: 'lounge',
    time: '12:08',
    heading: 'THE ALIBI',
    caption: 'Miles said he remained at the north windows and never entered Room 317.',
    provenance: 'TESTIMONY',
    basisIds: ['statement.miles.window-alibi', 'statement.miles.denies-317'],
    stageAction: 'miles-window-alibi',
  },
  {
    id: 'reconstruction.key-ledger',
    durationMs: 6_000,
    roomId: 'lounge',
    time: '12:08',
    heading: 'KEY 317 // M. PIKE',
    caption: 'The torn carbon records the Room 317 key in Miles Pike’s name.',
    provenance: 'RECORDED',
    basisIds: ['evidence.torn-ledger', 'observation.ledger-317-key-line'],
    stageAction: 'key-ledger',
  },
  {
    id: 'reconstruction.room-317-door',
    durationMs: 6_000,
    roomId: 'bedroom',
    time: '12:09',
    heading: 'THE DOOR TO 317',
    caption: 'The key places the route within reach. What happened beyond the door remains unproven.',
    provenance: 'INFERRED',
    basisIds: ['evidence.torn-ledger', 'statement.miles.key-was-errand', 'contradiction.miles-denied-317'],
    stageAction: 'room-317-door',
  },
  {
    id: 'reconstruction.office-deviation',
    durationMs: 8_500,
    roomId: 'lounge',
    time: 'LATER LOOP // 12:11',
    heading: 'WHAT GAVE HIM AWAY',
    caption: 'After the confrontation, Miles abandoned the windows and checked the manager office.',
    provenance: 'OBSERVED',
    basisIds: ['observation.miles-office-check', 'timeline.miles-office-deviation'],
    stageAction: 'office-deviation',
  },
  {
    id: 'reconstruction.finale',
    durationMs: 7_000,
    roomId: 'lounge',
    time: 'CASE CLOSED',
    heading: 'THE KEY MADE HIM LOOK',
    caption: 'Ledger. Denial. Office route. Together they break Miles Pike’s alibi.',
    provenance: 'INFERRED',
    basisIds: ['evidence.torn-ledger', 'contradiction.miles-denied-317', 'timeline.miles-office-deviation'],
    stageAction: 'finale',
  },
] as const;

export const LEVEL_ONE_REENACTMENT_TOTAL_DURATION_MS = LEVEL_ONE_REENACTMENT_BEATS.reduce(
  (total, beat) => total + beat.durationMs,
  0,
);
