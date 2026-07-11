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

The current development build opens into a larger Hotel Marlowe exploration
sandbox. Move through the 2D venue with WASD, the arrow keys, or the mobile
analog stick. Approach or click placeholder characters to question them and
inspect the red ledger to test clue dialogue. The original authored Lantern
Room blocking sandbox remains available at `/?scene=blocking`.

On landscape mobile, drag the little inner knob anywhere inside the translucent
circular pad for analog movement. A interacts or continues dialogue; B dismisses
dialogue. The pad is one continuous drag surface with no directional buttons;
direct touch remains available for people and clues.

## Technology

- Phaser 4 for scenes, rendering, input, animation, and audio
- TypeScript for game-state and content contracts
- Vite for local development and production builds
