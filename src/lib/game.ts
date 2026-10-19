import { emptyNotes, type NotesGrid } from './notes'
import type { Difficulty, LoadedPuzzle } from './puzzles'
import { HINTS_PER_GAME } from './scores'
import {
  parsePuzzle,
  stringifyGrid,
  type Digit,
  type Grid,
} from './sudoku'

export interface RestoredGame {
  puzzle: LoadedPuzzle
  grid: Grid
  notes: NotesGrid
  seconds: number
  mistakes: number
  hintsUsed: number
  pencilMode: boolean
  activeDigit: Digit | null
}

interface SavedGame {
  version: 1
  difficulty: Difficulty
  rating: string
  givens: string
  solution: string
  grid: string
  notes: string[]
  seconds: number
  mistakes: number
  hintsUsed: number
  pencilMode: boolean
  activeDigit: Digit | null
}

const STORAGE_KEY = 'sudoku-game'
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

function isDigit(value: unknown): value is Digit {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5 || value === 6 || value === 7 || value === 8 || value === 9
}

function flattenNotes(notes: NotesGrid): string[] {
  const out: string[] = []
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      out.push(notes[r][c].join(''))
    }
  }
  return out
}

function parseNotes(raw: unknown, grid: Grid): NotesGrid | null {
  if (!Array.isArray(raw) || raw.length !== 81) return null
  const notes = emptyNotes()
  for (let i = 0; i < 81; i++) {
    const entry = raw[i]
    if (typeof entry !== 'string' || !/^[1-9]{0,9}$/.test(entry)) return null
    const r = Math.floor(i / 9)
    const c = i % 9
    if (grid[r][c] !== 0) {
      if (entry.length > 0) return null
      continue
    }
    const seen = new Set<Digit>()
    for (const ch of entry) {
      const digit = Number(ch) as Digit
      if (seen.has(digit)) return null
      seen.add(digit)
    }
    notes[r][c] = [...seen].sort((a, b) => a - b)
  }
  return notes
}

function parseSaved(raw: string): RestoredGame | null {
  const parsed = JSON.parse(raw) as Partial<SavedGame>
  if (parsed.version !== 1) return null
  if (!DIFFICULTIES.includes(parsed.difficulty as Difficulty)) return null
  if (typeof parsed.rating !== 'string') return null
  if (typeof parsed.givens !== 'string' || typeof parsed.solution !== 'string') {
    return null
  }
  if (typeof parsed.grid !== 'string') return null
  if (typeof parsed.seconds !== 'number' || typeof parsed.mistakes !== 'number') {
    return null
  }
  if (!Number.isFinite(parsed.seconds) || !Number.isFinite(parsed.mistakes)) {
    return null
  }
  if (parsed.seconds < 0 || parsed.mistakes < 0) return null
  const seconds = parsed.seconds
  const mistakes = parsed.mistakes
  const hintsUsed =
    parsed.hintsUsed === undefined
      ? 0
      : typeof parsed.hintsUsed === 'number' &&
          Number.isFinite(parsed.hintsUsed) &&
          parsed.hintsUsed >= 0
        ? Math.min(HINTS_PER_GAME, Math.floor(parsed.hintsUsed))
        : null
  if (hintsUsed === null) return null

  const givens = parsePuzzle(parsed.givens)
  const solution = parsePuzzle(parsed.solution)
  const grid = parsePuzzle(parsed.grid)

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const given = givens[r][c]
      const value = grid[r][c]
      if (given !== 0 && value !== given) return null
      if (value !== 0 && value !== solution[r][c]) return null
    }
  }

  let empty = 0
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) empty += 1
    }
  }
  if (empty === 0) return null

  const notes = parseNotes(parsed.notes, grid)
  if (!notes) return null

  const activeDigit = parsed.activeDigit
  if (activeDigit !== null && activeDigit !== undefined && !isDigit(activeDigit)) {
    return null
  }

  return {
    puzzle: {
      difficulty: parsed.difficulty as Difficulty,
      rating: parsed.rating,
      givens,
      solution,
    },
    grid,
    notes,
    seconds: Math.floor(seconds),
    mistakes: Math.floor(mistakes),
    hintsUsed,
    pencilMode: Boolean(parsed.pencilMode),
    activeDigit: isDigit(activeDigit) ? activeDigit : null,
  }
}

export function loadSavedGame(): RestoredGame | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return parseSaved(raw)
  } catch {
    return null
  }
}

export function saveGame(game: RestoredGame): void {
  const payload: SavedGame = {
    version: 1,
    difficulty: game.puzzle.difficulty,
    rating: game.puzzle.rating,
    givens: stringifyGrid(game.puzzle.givens),
    solution: stringifyGrid(game.puzzle.solution),
    grid: stringifyGrid(game.grid),
    notes: flattenNotes(game.notes),
    seconds: game.seconds,
    mistakes: game.mistakes,
    hintsUsed: game.hintsUsed,
    pencilMode: game.pencilMode,
    activeDigit: game.activeDigit,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function clearSavedGame(): void {
  localStorage.removeItem(STORAGE_KEY)
}
