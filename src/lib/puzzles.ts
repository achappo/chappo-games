import { parsePuzzle, solvePuzzle, type Grid } from './sudoku'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface BankPuzzle {
  puzzle: string
  rating: string
}

export interface LoadedPuzzle {
  difficulty: Difficulty
  rating: string
  givens: Grid
  solution: Grid
}

const cache = new Map<Difficulty, BankPuzzle[]>()

async function loadBank(difficulty: Difficulty): Promise<BankPuzzle[]> {
  const hit = cache.get(difficulty)
  if (hit) return hit
  const res = await fetch(`/puzzles/${difficulty}.json`)
  if (!res.ok) {
    throw new Error(`Could not load ${difficulty} puzzles`)
  }
  const data = (await res.json()) as BankPuzzle[]
  cache.set(difficulty, data)
  return data
}

export async function pickPuzzle(
  difficulty: Difficulty,
): Promise<LoadedPuzzle> {
  const bank = await loadBank(difficulty)
  if (bank.length === 0) throw new Error('Puzzle bank is empty')
  const entry = bank[Math.floor(Math.random() * bank.length)]
  const givens = parsePuzzle(entry.puzzle)
  const solution = solvePuzzle(givens)
  if (!solution) {
    throw new Error('Puzzle has no solution')
  }
  return {
    difficulty,
    rating: entry.rating,
    givens,
    solution,
  }
}
