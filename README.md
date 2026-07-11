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

The current development build opens directly into the Lantern Room sandbox.
Click either placeholder character to test portrait dialogue, inspect the red
matchbook on the counter, or use the pause and replay controls to exercise the
authored movement timeline.

On landscape mobile, the translucent D-pad moves focus between authored people
and clues. A interacts or continues dialogue; B pauses, resumes, or dismisses
the current dialogue. Direct touch remains available.

## Technology

- Phaser 4 for scenes, rendering, input, animation, and audio
- TypeScript for game-state and content contracts
- Vite for local development and production builds
