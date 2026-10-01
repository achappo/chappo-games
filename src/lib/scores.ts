import type { Difficulty } from './puzzles'

export interface ScoreEntry {
  score: number
  seconds: number
  mistakes: number
  difficulty: Difficulty
  completedAt: string
}

export interface ScoreBoard {
  version: 1
  easy: ScoreEntry[]
  medium: ScoreEntry[]
  hard: ScoreEntry[]
}

export interface RecordResult {
  board: ScoreBoard
  entry: ScoreEntry
  /** 1-based rank in the top list, or null if the run did not qualify. */
  rank: number | null
  isNewBest: boolean
}

export const MAX_SCORES_PER_DIFFICULTY = 5

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

const STORAGE_KEY = 'sudoku-scores'

const BASE = { easy: 5_000, medium: 8_000, hard: 12_000 } as const
const POINTS_PER_SECOND = 8
const POINTS_PER_MISTAKE = 150
const PERFECT_BONUS = 400

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

export function liveScore(
  difficulty: Difficulty,
  seconds: number,
  mistakes: number,
): number {
  const raw =
    BASE[difficulty] -
    Math.max(0, seconds) * POINTS_PER_SECOND -
    Math.max(0, mistakes) * POINTS_PER_MISTAKE
  return Math.max(0, raw)
}

export function finalScore(
  difficulty: Difficulty,
  seconds: number,
  mistakes: number,
): number {
  const bonus = mistakes === 0 ? PERFECT_BONUS : 0
  return liveScore(difficulty, seconds, mistakes) + bonus
}

function emptyBoard(): ScoreBoard {
  return { version: 1, easy: [], medium: [], hard: [] }
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isScoreEntry(value: unknown): value is ScoreEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as Partial<ScoreEntry>
  return (
    isFiniteNumber(entry.score) &&
    isFiniteNumber(entry.seconds) &&
    isFiniteNumber(entry.mistakes) &&
    typeof entry.completedAt === 'string' &&
    DIFFICULTIES.includes(entry.difficulty as Difficulty)
  )
}

function compareEntries(a: ScoreEntry, b: ScoreEntry): number {
  if (b.score !== a.score) return b.score - a.score
  if (a.seconds !== b.seconds) return a.seconds - b.seconds
  return a.mistakes - b.mistakes
}

function sanitizeList(list: unknown, difficulty: Difficulty): ScoreEntry[] {
  if (!Array.isArray(list)) return []
  return list
    .filter(isScoreEntry)
    .map((entry) => ({
      score: Math.max(0, Math.floor(entry.score)),
      seconds: Math.max(0, Math.floor(entry.seconds)),
      mistakes: Math.max(0, Math.floor(entry.mistakes)),
      difficulty,
      completedAt: entry.completedAt,
    }))
    .sort(compareEntries)
    .slice(0, MAX_SCORES_PER_DIFFICULTY)
}

export function loadScores(): ScoreBoard {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyBoard()
    const parsed = JSON.parse(raw) as Partial<ScoreBoard>
    if (parsed.version !== 1) return emptyBoard()
    return {
      version: 1,
      easy: sanitizeList(parsed.easy, 'easy'),
      medium: sanitizeList(parsed.medium, 'medium'),
      hard: sanitizeList(parsed.hard, 'hard'),
    }
  } catch {
    return emptyBoard()
  }
}

export function saveScores(board: ScoreBoard): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(board))
}

export function recordScore(
  board: ScoreBoard,
  difficulty: Difficulty,
  seconds: number,
  mistakes: number,
): RecordResult {
  const entry: ScoreEntry = {
    score: finalScore(difficulty, seconds, mistakes),
    seconds,
    mistakes,
    difficulty,
    completedAt: new Date().toISOString(),
  }
  const previousBest = board[difficulty][0]?.score
  const nextList = [...board[difficulty], entry]
    .sort(compareEntries)
    .slice(0, MAX_SCORES_PER_DIFFICULTY)
  const rankIndex = nextList.indexOf(entry)

  return {
    board: { ...board, [difficulty]: nextList },
    entry,
    rank: rankIndex >= 0 ? rankIndex + 1 : null,
    isNewBest: rankIndex === 0 && (previousBest === undefined || entry.score >= previousBest),
  }
}
