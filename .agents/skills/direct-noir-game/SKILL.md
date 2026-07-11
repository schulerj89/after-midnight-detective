---
name: direct-noir-game
description: Direct holistic design for After Midnight, Detective. Use for story, pacing, scope, progression, scene sequencing, accessibility, mobile play, audio-visual coherence, vertical slices, or any change that materially affects the player's experience.
---

# Direct the Game

Protect a focused player fantasy: the player is a patient noir detective who learns a living crime scene, tests testimony against observation, and earns an accusation through reasoning.

## Apply these principles

- Make observation, conversation, evidence handling, and deduction the verbs that move the game forward.
- Never require fast reflexes. Allow pauses, repeatable loops, readable timing, forgiving targets, and recovery from missed information.
- Treat each loop as a dramatic act: establish normal behavior, expose a contradiction, let the player intervene, then show a meaningful consequence.
- Keep story, mechanics, visuals, and audio legible as one idea. Every effect must clarify mood, attention, character intent, time, or state.
- Preserve the living-diorama language: fixed stage positions, theatrical slide movement, pose changes, silhouettes, foreground masking, and motivated lighting.
- Scope for a short polished mystery. Prefer fewer suspects, rooms, clues, and branches with stronger interdependence and payoff.
- Make evidence actionable. A clue should alter dialogue, interpretation, behavior, timeline knowledge, or accusation logic.
- Make the notebook and timeline reduce memory burden without solving the case for the player.
- Design mobile-first interactions: large targets, safe-area-aware UI, short readable text, no hover dependency, and one-thumb-compatible navigation where practical.
- Support accessibility with text alternatives for audio cues, redundant color/shape/state communication, scalable text, reduced-motion behavior, and independent audio controls.
- Use silence, ambience, music, dialogue, and effects as separate dramatic layers; never let mood obscure speech or critical cues.

## Use decision gates

Before approving a feature, answer:

1. What player inference or emotion does it create?
2. How does the player perceive, understand, and act on it?
3. What changes in a later loop because of it?
4. Can it be understood without reflexes, audio alone, color alone, or hover?
5. Does it deepen the central mystery enough to justify its production and testing cost?
6. What existing element should be cut or simplified to keep the experience short and polished?

Reject or revise work that cannot pass these gates.

## Sequence the vertical slice

Build one complete playable chain before expanding breadth:

1. One staged room with readable positions and atmosphere.
2. One short repeating timeline with two characters and one observable contradiction.
3. One inspectable object that becomes notebook evidence.
4. One questioning exchange and one evidence presentation.
5. One changed behavior in the next loop.
6. One timeline deduction and a provisional accusation.
7. Mobile, accessibility, audio-mix, and comprehension validation.

Expand suspects, rooms, clues, and endings only after this chain is coherent and testable.

## Record material decisions first

Before making a material game-design change, create `docs/decisions/YYYY-MM-DD-direction-<topic>.md`. Include these headings:

- Context
- Options considered
- Decision
- Rationale
- Tradeoffs
- Dependencies
- Player impact
- Scope impact
- Validation plan

Treat changes to the player fantasy, core loop, pacing, progression, story structure, scene count, clue logic, endings, platform targets, accessibility policy, or audio-visual direction as material. Keep implementation aligned with the accepted record; create a new record when the premise changes.
