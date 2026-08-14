/**
 * Download and sample puzzles from the public-domain
 * Sudoku Exchange Puzzle Bank.
 * https://github.com/grantm/sudoku-exchange-puzzle-bank
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'public', 'puzzles')
const SAMPLE_SIZE = 75
const LEVELS = ['easy', 'medium', 'hard']
const BASE =
  'https://raw.githubusercontent.com/grantm/sudoku-exchange-puzzle-bank/master'

function sampleLines(lines, count) {
  const usable = lines.filter((line) => line.trim().length > 0)
  const picks = []
  const taken = new Set()
  const n = Math.min(count, usable.length)
  while (picks.length < n) {
    const i = Math.floor(Math.random() * usable.length)
    if (taken.has(i)) continue
    taken.add(i)
    picks.push(usable[i])
  }
  return picks
}

function parseLine(line) {
  // hash(12) + space + puzzle(81) + spaces + rating(e.g. 1.2)
  const match = line
    .trim()
    .match(/^([0-9a-f]{12})\s+([0-9]{81})\s+([0-9.]+)$/i)
  if (!match) {
    throw new Error(`Bad puzzle line: ${line}`)
  }
  return { puzzle: match[2], rating: match[3] }
}

async function fetchLevel(level) {
  const url = `${BASE}/${level}.txt`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  const text = await res.text()
  const lines = text.split('\n')
  return sampleLines(lines, SAMPLE_SIZE).map(parseLine)
}

await mkdir(OUT_DIR, { recursive: true })

for (const level of LEVELS) {
  process.stdout.write(`Sampling ${level}... `)
  const puzzles = await fetchLevel(level)
  const outPath = join(OUT_DIR, `${level}.json`)
  await writeFile(outPath, JSON.stringify(puzzles), 'utf8')
  console.log(`wrote ${puzzles.length} → ${outPath}`)
}

console.log('Done.')
