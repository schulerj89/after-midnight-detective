# Decision: Give Level 1 a restrained noir score and tactile cue set

- Date: 2026-07-11
- Status: Accepted
- Discipline: Direction / Audio
- Owner: Game direction
- Supersedes: none

## Context

Level 1 currently has no audio despite relying on rhythm, atmosphere, object
inspection, room transitions, theatrical movement, and a solved-case curtain
call. The player also needs an immediate, persistent way to silence music.

## Options considered

1. One continuous music track and no authored SFX.
2. Procedural WebAudio tones only.
3. Two ElevenLabs instrumental cues plus a compact ElevenLabs SFX set, managed by
   separate music and SFX buses.

## Decision

Generate and ship:

- `hotel-marlowe-after-midnight.mp3`: 45-second instrumental investigation loop;
  brushed drums, upright bass, sparse piano, muted trumpet, 72 BPM, rain-soaked
  noir restraint, no vocals, no abrupt hits, and room for dialogue.
- `detectives-reconstruction.mp3`: 36-second instrumental solved-case cue; begins
  with the investigation motif, builds through evidence assembly, and resolves
  into a sober arrest cadence without triumphal bombast.
- `inspect-clue.mp3`: restrained paper, pencil, and magnifier handling.
- `hotel-door.mp3`: vintage hotel latch, wooden door movement, soft room reverb.
- `jail-bars.mp3`: heavy iron bars descend and settle with one controlled clang.
- `stage-movement.mp3`: soft leather shoe/scuff cue for the paper-cutout movement
  convention.

Use a long-lived audio manager with master, music, ambience, dialogue, and SFX
levels. Add a small HUD button labeled by text and icon state (`MUSIC ON` / `MUTED`),
persist the choice in local storage, and unlock playback only after user input.
The button mutes music, while SFX remain available; this matches the requested
music mute control without hiding gameplay feedback.

## Rationale

The Level 1 loop needs continuity rather than melodic attention. A separate
reconstruction cue marks the earned change in dramatic state. Short physical
sounds make abstract placeholder interactions feel intentional while remaining
redundant with visible animation and text.

## Tradeoffs

Generated music may reveal a loop seam; the prompt requests matched opening and
ending texture, and runtime fades contain transitions. Movement audio can become
fatiguing, so it is rate-limited and played quietly. Music is not required for
any clue or deduction.

## Browser and mobile behavior

Audio begins only after the first pointer/keyboard/touch gesture. Mute state
survives reloads. The HUD target remains at least 48 CSS pixels on landscape
mobile, respects safe areas, and remains available during exploration. Cinematic
scenes hide ordinary HUD but preserve the stored state.

## Asset budget

- Music: two MP3 files at 128 kbps, target combined size under 1.5 MB.
- SFX: four MP3 files at 128 kbps, target combined size under 300 KB.
- Total shipped audio target: under 2.5 MB.
- Preload Level 1 audio once; reuse keys across rooms and replay.

## Security and provenance

Generation uses the local `agent-secret` broker to inject `ELEVENLABS_API_KEY`
into the generation process. The key is never printed, stored in source, or sent
to browser code. Prompts and generation parameters are committed for provenance.

## Validation plan

- Verify every file is decodable and has the expected duration/channel metadata.
- Inventory compressed bytes and enforce the 2.5 MB budget.
- Verify Level 1 music starts after browser unlock and does not duplicate on room
  changes or scene resume.
- Verify reconstruction music replaces the Level 1 loop and the loop resumes on
  return to the solved board.
- Verify inspection, door, bar, and movement triggers with movement throttling.
- Verify the mute target, label, persistence, and phone-safe placement.
- Complete the case with audio muted to confirm no information dependency.

## Validation results

ElevenLabs generated all six assets through the broker. FFprobe decoded the
expected 45.035-second and 35.971-second scores plus four short SFX. Total shipped
audio is 1,375,348 bytes. The hotel door was normalized +8 dB after loudness review.
Seventy-seven automated tests pass, including mute persistence, deferred unlock,
track selection, and movement throttling. Browser instrumentation confirmed all
six assets loaded and every requested music/SFX route fired. Two 844x390 HUD
manifests pass with 98x48 mute targets and no forbidden overlap. The QA browser's
WebAudioContext remains intentionally suspended, so final audible balance remains
a real-phone listening check rather than a headless assertion.
