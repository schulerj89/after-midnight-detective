# Decision: Level 1 vertical-slice ending

- Date: 2026-07-11
- Status: Accepted
- Discipline: Direction
- Owner: Noir game direction
- Supersedes: `2026-07-11-game-direction-foundation.md` milestone status

## Context

The current build demonstrates exploration and dialogue progression but has no
payoff. Players need a short dramatic arc that ends by explaining Miles's lie,
not by exhausting every hotspot.

## Options considered

### Expand the cast and motive before adding an ending

This adds texture but delays proof that the central detective loop works.

### End immediately after the final Miles conversation

This lacks player authorship and makes the notebook ornamental.

### Finish the existing chain with one altered loop and accusation tableau

This gives every implemented system a purpose without expanding Level 1's room
or cast scope.

## Decision

Treat the Level 1 slice as three short acts: establish the hotel and testimonies,
break Miles's denial with the ledger, then witness his altered office check and
assemble the accusation. A successful submission presents a clear case-closed
tableau and keeps the board available for review.

## Rationale

The player sees a social action cause a physical behavior change, then uses that
change to complete a defensible explanation. This is the smallest satisfying
version of the game's promised fantasy.

## Tradeoffs

- Motive remains lightly sketched; the ending proves opportunity and deception.
- Placeholder character art limits emotional staging.
- The timeline is functional rather than a cinematic production pass.

## Dependencies

The existing text-authored rooms, case-state resolver, dialogue box, mobile
controls, and screenshot debug hooks remain authoritative.

## Player impact

Players can now start, investigate, change the next loop, review their knowledge,
make a reasoned accusation, receive useful failure feedback, and finish Level 1.

## Scope impact

No new rooms, suspects, clue objects, combat, save system, or art pipeline is
added. Work is limited to completing the current vertical slice.

## Validation plan

Validate the full solution path without reflex input, confirm recoverable weak
and wrong theories, review the board at desktop and mobile sizes, and preserve a
machine-readable solve trace plus screenshots of the altered-loop fact and
case-closed result.

## Validation results

The implemented slice reaches a recoverable accusation board and a clear ending
without adding rooms, suspects, or required clue collection. Desktop and mobile
captures preserve the ending hierarchy, while the altered-loop timeline keeps
the observed contradiction and replay action together. The canonical scripted
path, visible accusation controls, and exported browser state all reach the same
solved result.
