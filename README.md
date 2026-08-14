# Chappo Games

Mobile-first browser games. First up: an offline-capable Sudoku with a newspaper-puzzle feel.

## Play (Sudoku)

```bash
npm install
npm run dev
```

Then open the local URL on your phone (same Wi‑Fi) or use browser device mode.

## Build

```bash
npm run build
npm run preview
```

## Puzzles

Starter puzzles are sampled from the [Sudoku Exchange Puzzle Bank](https://github.com/grantm/sudoku-exchange-puzzle-bank) (public domain — free to use commercially). Bundled under `public/puzzles/` as Easy / Medium / Hard JSON.

Refresh the samples:

```bash
npm run sample-puzzles
```

Solutions are computed in the browser with a backtracking solver so placements can be checked without shipping solutions in the bank files.

## How to play

1. Pick a number from the row under the board (it stays active).
2. Tap empty cells where that number belongs.
3. Correct cells fill in; wrong taps show a brief **×** and stay empty.
4. While a number is active, matching digits on the board share the same outline.
