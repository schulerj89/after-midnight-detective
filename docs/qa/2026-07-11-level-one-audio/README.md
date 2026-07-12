# Level 1 audio QA

## Generated assets

ElevenLabs generated two instrumental music cues and four SFX through the local
`agent-secret` broker. The API key was injected only into the generation process;
it is absent from source, logs, browser code, and committed metadata.

## Metadata and budget

| Asset | Duration | Bytes | Bit rate |
| --- | ---: | ---: | ---: |
| Hotel Marlowe score | 45.035 s | 720,606 | 128 kbps |
| Detective's Reconstruction | 35.971 s | 575,574 | 128 kbps |
| Inspect clue | 1.000 s | 17,180 | 137 kbps |
| Hotel door | 1.280 s | 21,359 | 133 kbps |
| Jail bars | 1.760 s | 29,301 | 133 kbps |
| Stage movement | 0.640 s | 11,328 | 142 kbps |

Total shipped audio is 1,375,348 bytes, below the 2.5 MB budget. FFprobe decoded
all six MP3 files and reported the expected durations.

Loudness review kept the scores restrained (`-21.5 dB` and `-18.7 dB` mean) and
identified the hotel door as too quiet for phone speakers. That cue was normalized
by +8 dB to a `-6.7 dB` peak; the transformation is recorded in the manifest.

## Runtime assertions

- Preload cache reports all six audio keys loaded.
- Exploration requests `music.level-one`.
- Detective's Reconstruction and Case Closed request `music.reconstruction`.
- Clue inspection requests `sfx.inspect`.
- The lounge-to-kitchen doorway requests `sfx.door` and completes the transition.
- A mobile joystick drag requests `sfx.movement`; the manager unit test proves the
  500 ms throttle rejects immediate repeats.
- Settling jail bars requests `sfx.bars` after the descent.
- Music mute state changes button label, `aria-pressed`, runtime state, and survives
  a page reload. SFX bus level remains independent.

The in-app QA browser exposes a WebAudio backend but deliberately keeps its
AudioContext suspended, so it cannot provide an audible assertion. The manager
reports requested and played keys separately; real-device playback begins after
the first trusted gesture, while the suspended QA environment verifies all load,
routing, state, and trigger contracts.

## Visual QA

- `music-control-mobile.png`: the 98x48 target sits between location and case HUD
  panels at 844x390 without overlap.
- `music-control-case-closed-mobile.png`: the mute control moves to the upper-left
  safe area and does not cover the arrest title, bars, or return action.

Both geometry manifests must pass the screenshot analyzer. Audio remains optional
for every clue and the full solution path.
