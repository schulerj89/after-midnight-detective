# After Midnight, Detective

A short browser-based 2D mystery-noir game presented as an interactive stage
play and living crime-scene diorama.

The shared creative and gameplay source of truth is the
[game bible](docs/game-bible.md). Material design choices are recorded in
[`docs/decisions/`](docs/decisions/).

## Development

Requires a current Node.js release.

```bash
npm install
npm run dev
```

Create a production build with `npm run build`.

Run the complete regression check with:

```bash
npm run validate
```

Run the geometry-backed screenshot regression checks with Python and Pillow:

```bash
npm run validate:visual
```

Validate generated music/SFX assets, payload budget, and audio-manager behavior:

```bash
npm run validate:audio
```

The current development build opens into a larger Hotel Marlowe exploration
sandbox constructed from [`level-1.lvl.txt`](src/content/levels/level-1.lvl.txt).
Move through its 20x20 lounge, 12x10 kitchen, 8x8 bedroom, and 10x8 manager
office with WASD, the arrow keys, or the mobile analog stick. Approach or click
placeholder characters and red clue markers to test dialogue. The original
authored Lantern Room blocking sandbox remains available at `/?scene=blocking`.

The text-level grammar and placement legend are documented in
[`src/content/levels/README.md`](src/content/levels/README.md).

On landscape mobile, drag the little inner knob anywhere inside the translucent
circular pad for analog movement. A interacts or continues dialogue; B dismisses
dialogue. The pad is one continuous drag surface with no directional buttons;
direct touch remains available for people and clues.

The small music control toggles and persists music mute state; keyboard players
can also press M. Sound effects remain enabled so inspection, doors, movement,
and the solved-case jail tableau retain tactile feedback.

## Technology

- Phaser 4 for scenes, rendering, input, animation, and audio
- TypeScript for game-state and content contracts
- Vite for local development and production builds
