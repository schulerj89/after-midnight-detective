# After Midnight, Detective — Game Bible

Status: Foundation  
Last updated: 2026-07-11

## High concept

*After Midnight, Detective* is a short browser-based mystery-noir game staged
as a living crime-scene diorama. The player watches a repeating slice of one
rain-soaked night, questions its inhabitants, tests statements against physical
evidence, and reconstructs who was where before making a reasoned accusation.

The experience should feel like an interactive noir stage play: deliberate,
legible, atmospheric, and compact enough that every prop and entrance matters.

## Player fantasy

The player is not an action hero. The player is the one person in the room who
notices that the cigarette was already burning, the hallway light flickered at
the wrong moment, and a suspect could not have crossed the lobby unseen.

The primary pleasures are:

- noticing a small inconsistency;
- deciding which question or evidence will expose it;
- watching the social situation change because of that discovery;
- forming a defensible account of the night.

## Design pillars

### Observe a living scene

NPCs follow readable routes between authored positions during a repeating
timeline while the detective may explore the venue directly. Important information is expressed through entrances,
exits, pauses, lines of sight, prop use, lighting, and sound—not through twitch
challenges.

### Interrogate contradictions

Questioning produces statements, not automatic truth. Showing the right piece
of evidence can challenge a statement, unlock a new topic, alter trust, or make
a character behave differently in a later loop.

### Build a case, not a checklist

The notebook records clues, statements, relationships, and confirmed movements.
The player uses these records to construct meaning. Progress should come from
connections and contradictions rather than collecting every hotspot.

### Re-stage the night

Later loops are not simple repeats. Knowledge and confrontations can change
character behavior, opening new observations while preserving a coherent base
timeline.

### Make the accusation explainable

The finale asks for a suspect and a short chain of supporting claims: motive or
opportunity, decisive evidence, and the contradiction that breaks the alibi.
The game evaluates the reasoning, not only the selected name.

## Core loop

1. Enter or resume the current timeline loop.
2. Observe movements, interactions, light changes, and environmental sounds.
3. Pause or leave observation to question a character or inspect an object.
4. Record discovered evidence and statements automatically in the notebook.
5. Review the timeline to compare claimed and observed locations.
6. Present evidence to a suspect to open dialogue or change later behavior.
7. Replay the relevant portion of the night and observe the consequence.
8. Accuse when the player believes the case can be explained.

No step should require fast reflexes. Important events must be replayable and
must have more than one perceivable signal where practical.

Case-board loop controls restage the live, interactive observation timeline;
they are not cinematic playback. Reserve `Detective's Reconstruction` for the
evidence-bounded cutscene that follows a correct accusation, and label both
flows explicitly so the player cannot confuse them.

## Information model

The mystery is built from distinct information types:

- **Observation:** something the detective personally witnessed in a loop.
- **Statement:** what a character claims, with speaker and conversational context.
- **Evidence:** a physical or documentary clue that can be inspected or shown.
- **Inference:** a player-facing connection supported by other information.
- **Timeline fact:** a confirmed person, place, and time relationship.
- **Contradiction:** two claims that cannot both be true under the case rules.

The UI must not visually imply that every statement is true. Unknown, claimed,
observed, and confirmed facts need distinct treatments.

## Timeline rules

- Use a finite loop divided into named or timestamped beats.
- Place characters at authored stage marks rather than continuous simulation.
- Keep the base schedule deterministic so observation is fair.
- Let player-caused variants branch from explicit knowledge or confrontation flags.
- Preserve an event log suitable for debugging and automated tests.
- Allow replaying or scrubbing previously witnessed intervals from the timeline.
- Never make a decisive clue permanently missable because the player looked away.

## Dialogue and evidence

- Clicking a character opens questioning without demanding precision timing.
- Dialogue topics come from the case, current relationship, observations, and
  notebook evidence.
- Showing evidence must produce authored reactions; avoid generic success/failure
  responses for important clues.
- Static poses communicate emotional state: neutral, speaking, suspicious,
  alarmed, and case-specific variants.
- A new dialogue branch should either reveal information, characterize motive,
  alter behavior, or clarify the case. Cut branches that do none of these.

## Notebook

The notebook is the player's external memory, not a solution dispenser. It has:

- Evidence: inspectable clues and relevant details.
- Statements: attributed claims with uncertainty preserved.
- People: portraits, relationships, known motives, and contradictions.
- Timeline: witnessed and claimed locations across the loop.
- Case theory: the accusation-building workspace.

Entries should be concise and cross-linked. The notebook may highlight a new
connection, but it should not silently perform the final deduction.

## Visual direction

### Palette

- Black: `#090A0D`
- Charcoal: `#17191F`
- Cream: `#D9CFB6`
- Muted red: `#8F2432`
- Dim yellow: `#C7A85B`

Supporting grays and desaturated blue-gray rain tones are allowed. Red is a
controlled accent for danger, guilt, or decisive interface emphasis; it is not
a general decoration color.

### Composition

- Build scenes from layered planes: distant exterior, room, actors, foreground
  occluders, weather/effects, and UI.
- Present connected interiors as isolated room stages. A doorway cuts briefly to
  black before revealing the destination; neighboring rooms do not remain visible
  beyond the active set.
- Favor strong silhouettes, pools of light, negative space, and graphic shadow
  shapes over realistic rendering.
- Present characters as full-body transparent cutouts with a consistent camera
  height, light direction, edge treatment, and foot line.
- Use foreground furniture, door frames, curtains, and counters to occasionally
  hide feet and reinforce the miniature-stage illusion.
- Keep interactive objects readable through composition and restrained response,
  not persistent glowing outlines.

### Atmosphere

Rain, cigarette smoke, flickering practical lights, and passing headlights make
the scene feel alive. Each effect needs a story or rhythm function. Effects must
not obscure faces, clues, subtitles, or interactive silhouettes.

## Character movement language

Do not use traditional frame-by-frame walk cycles. Movement must look like an
intentional theatrical convention:

1. Slide the cutout across authored positions or the exploration floor plane.
2. Ease into and out of the move.
3. Lean slightly toward the destination, returning upright on arrival.
4. Add a restrained vertical bob only while moving.
5. Keep a soft oval contact shadow beneath the character.
6. Swap static poses at motivated beats rather than continuously animating limbs.
7. Use foreground occlusion to sell depth and soften foot sliding.

Player-directed movement may travel on both X and Y while retaining the same
lean, bob, shadow, and pose language. Movement timing should communicate character: hurried, hesitant, controlled,
or furtive. The shadow remains grounded even while the cutout bobs.

## Audio direction

Audio is part of the evidence language as well as the mood. Use separate master,
music, ambience, dialogue, and SFX buses.

- Ambience establishes the repeating rhythm: rain, traffic, neon hum, room tone.
- Spatial or panned cues may indicate offstage movement, but essential clues also
  need a visual or notebook-accessible signal.
- Music should leave room for dialogue and important environmental sounds.
- Duck music and ambience during voiced dialogue when necessary.
- Respect browser audio unlock rules and persist player volume choices.
- Never rely on audio alone for a required deduction.

## Interface and input

- Support mouse, touch, keyboard, and reduced-motion preferences.
- Give hotspots generous touch targets without making the presentation feel like
  a mobile app laid over the scene.
- Use cream text on charcoal/black with restrained red and yellow emphasis.
- Subtitles are on by default and remain readable over all scene lighting.
- Pause the timeline, or clearly define whether it continues, whenever notebook
  or extended dialogue interfaces cover the scene.
- Design gameplay for landscape mobile. Show a styled rotate-device presentation
  in portrait rather than shrinking essential text into illegibility.
- In landscape mobile, expand the scene to the full available viewport and layer
  the translucent joystick and action buttons over the lower corners. Controls
  must not reserve black side gutters or reduce the visible play area.
- Normal play opens on a pixel-noir title card with large `START CASE` and
  `SETTINGS` choices. Settings remains compact and audio-focused: music mute,
  music volume, and SFX volume, with choices persisted between sessions.

## Difficulty and fairness

- Challenge comes from interpretation, not pixel hunting or time pressure.
- Foreshadow decisive deductions with at least two supporting information paths.
- Distinguish optional character texture from required case facts.
- Let the player revisit conversations and witnessed timeline segments.
- When an accusation fails, explain which part of the case is unsupported without
  revealing the entire answer.
- Avoid false choices whose outcomes and information are identical.

## Scope target

The first playable slice should prove one compact multi-room level anchored by a
primary observation room, one short loop, three characters, several inspectable
props, one behavior-changing evidence confrontation, a functional notebook/
timeline, and one explainable accusation.

Keep Level 1 to a small connected room set and do not add another floor or a large
cast until that slice is readable, replayable, and satisfying on desktop and
landscape mobile.

The Level 1 lounge is the 30x30 travel and observation hub. Its kitchen, Room 317
bedroom, and manager office remain compact clue-focused stages connected by quick
black doorway transitions.

Level 1 is solvable when the player connects Miles to the torn Room 317 ledger,
identifies the contradiction in his denial, witnesses his manager-office check
in the altered loop, and submits those links through the case board. Collecting
all five clues is helpful but is not required to finish the case.

After a correct accusation, Level 1 presents a short, skippable detective
reconstruction using the same room stages and cutout movement. It visualizes only
the evidence-supported chain, labels recorded information, testimony,
observation, and inference explicitly, and never invents an unproven murder act.
Ordinary exploration HUD and controls are absent during this presentation. The
reconstruction then cuts to a separate `CASE CLOSED` arrest tableau showing Miles
behind foreground bars with restrained press-camera flashes. This curtain call
adds no new evidence or truth claims; it confirms consequence, supports reduced
motion, and returns to the solved board with its replay control.

## Technical implications

- Author cases and schedules as data rather than embedding them in scene code.
- Author room geometry, door links, placeholder placements, and spawn points in
  validated text level files rather than embedding them in rendering scenes.
- Separate canonical timeline events from player-caused variants.
- Use fixed stage marks with depth, scale, occlusion, and interaction metadata.
- Render Level 1 furniture and clue art from one named transparent prop atlas,
  while keeping placement, interaction points, and collision proxies authored
  exclusively by the text level.
- Give every clue, statement, topic, event, pose, and stage mark a stable ID.
- Keep rendering scenes thin; case state belongs in testable domain systems.
- Treat save data as versioned and support safe migration during development.
- Budget layered effects for mobile and provide reduced-quality/reduced-motion paths.

## Explicit non-goals

- Combat, platforming, chase sequences, or reflex-based quick-time events.
- Large seamless worlds or collision-heavy navigation beyond authored venues.
- Walk-cycle animation or animation added merely to imitate conventional games.
- Procedurally generated mysteries for the initial game.
- Photorealism, large inventories, or exhaustive dialogue trees.
- Unmarked fail states caused by permanently missed timeline events.

## Definition of quality

A scene succeeds when the player can tell where to look without being told,
understands that movement is theatrical by design, remembers characters by
silhouette and behavior, can revisit every important fact, and feels clever for
explaining the solution rather than lucky for selecting it.
