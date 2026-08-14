export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
export type CellValue = 0 | Digit
export type Grid = CellValue[][]

export function parsePuzzle(digits: string): Grid {
  if (!/^[0-9]{81}$/.test(digits)) {
    throw new Error('Puzzle must be 81 digits')
  }
  const grid: Grid = []
  for (let r = 0; r < 9; r++) {
    const row: CellValue[] = []
    for (let c = 0; c < 9; c++) {
      row.push(Number(digits[r * 9 + c]) as CellValue)
    }
    grid.push(row)
  }
  return grid
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => [...row])
}

function bit(d: number): number {
  return 1 << d
}

function boxIndex(r: number, c: number): number {
  return Math.floor(r / 3) * 3 + Math.floor(c / 3)
}

/** Solve a puzzle in place; returns true if a solution was found. */
export function solve(grid: Grid): boolean {
  const rows = new Array<number>(9).fill(0)
  const cols = new Array<number>(9).fill(0)
  const boxes = new Array<number>(9).fill(0)
  const empties: Array<[number, number]> = []

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = grid[r][c]
      if (v === 0) {
        empties.push([r, c])
        continue
      }
      const mask = bit(v)
      if (rows[r] & mask || cols[c] & mask || boxes[boxIndex(r, c)] & mask) {
        return false
      }
      rows[r] |= mask
      cols[c] |= mask
      boxes[boxIndex(r, c)] |= mask
    }
  }

  function dfs(i: number): boolean {
    if (i === empties.length) return true
    const [r, c] = empties[i]
    const used = rows[r] | cols[c] | boxes[boxIndex(r, c)]
    for (let d = 1; d <= 9; d++) {
      const mask = bit(d)
      if (used & mask) continue
      grid[r][c] = d as CellValue
      rows[r] |= mask
      cols[c] |= mask
      boxes[boxIndex(r, c)] |= mask
      if (dfs(i + 1)) return true
      grid[r][c] = 0
      rows[r] &= ~mask
      cols[c] &= ~mask
      boxes[boxIndex(r, c)] &= ~mask
    }
    return false
  }

  return dfs(0)
}

export function solvePuzzle(puzzle: Grid): Grid | null {
  const working = cloneGrid(puzzle)
  return solve(working) ? working : null
}

export function isComplete(grid: Grid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) return false
    }
  }
  return true
}

export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
