import type { Digit } from './sudoku'

export type NotesGrid = Digit[][][]

export function emptyNotes(): NotesGrid {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => [] as Digit[]),
  )
}

export function cloneNotes(notes: NotesGrid): NotesGrid {
  return notes.map((row) => row.map((cell) => [...cell]))
}

export function toggleNote(
  notes: NotesGrid,
  r: number,
  c: number,
  digit: Digit,
): NotesGrid {
  const next = cloneNotes(notes)
  const cell = next[r][c]
  const index = cell.indexOf(digit)
  if (index >= 0) cell.splice(index, 1)
  else {
    cell.push(digit)
    cell.sort((a, b) => a - b)
  }
  return next
}

export function clearNotesForPlacement(
  notes: NotesGrid,
  r: number,
  c: number,
  digit: Digit,
): NotesGrid {
  const next = cloneNotes(notes)
  next[r][c] = []
  const boxRow = Math.floor(r / 3) * 3
  const boxCol = Math.floor(c / 3) * 3

  for (let i = 0; i < 9; i++) {
    removeDigit(next[r][i], digit)
    removeDigit(next[i][c], digit)
  }
  for (let dr = 0; dr < 3; dr++) {
    for (let dc = 0; dc < 3; dc++) {
      removeDigit(next[boxRow + dr][boxCol + dc], digit)
    }
  }
  return next
}

function removeDigit(cell: Digit[], digit: Digit): void {
  const index = cell.indexOf(digit)
  if (index >= 0) cell.splice(index, 1)
}
