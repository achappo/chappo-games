import { useCallback, useEffect, useMemo, useState } from 'react'
import { Board } from './components/Board'
import { Header } from './components/Header'
import { NumberPad } from './components/NumberPad'
import { SettingsPanel } from './components/Settings'
import { useTimer } from './hooks/useTimer'
import {
  clearSavedGame,
  loadSavedGame,
  saveGame,
} from './lib/game'
import { clearNotesForPlacement, emptyNotes, toggleNote } from './lib/notes'
import {
  pickPuzzle,
  type Difficulty,
  type LoadedPuzzle,
} from './lib/puzzles'
import {
  HINTS_PER_GAME,
  liveScore,
  loadScores,
  recordScore,
  saveScores,
  type RecordResult,
} from './lib/scores'
import {
  applyTheme,
  loadSettings,
  saveSettings,
  type Settings,
} from './lib/settings'
import {
  cloneGrid,
  formatTime,
  isComplete,
  type Digit,
  type Grid,
} from './lib/sudoku'

type Status = 'loading' | 'ready' | 'error' | 'won'

function countDigits(grid: Grid): Record<Digit, number> {
  const counts = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
  } as Record<Digit, number>
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = grid[r][c]
      if (v !== 0) counts[v as Digit] += 1
    }
  }
  return counts
}

export default function App() {
  const [restored] = useState(() => loadSavedGame())
  const [difficulty, setDifficulty] = useState<Difficulty>(
    () => restored?.puzzle.difficulty ?? 'medium',
  )
  const [puzzle, setPuzzle] = useState<LoadedPuzzle | null>(
    () => restored?.puzzle ?? null,
  )
  const [grid, setGrid] = useState<Grid | null>(() => restored?.grid ?? null)
  const [notes, setNotes] = useState(() => restored?.notes ?? emptyNotes())
  const [activeDigit, setActiveDigit] = useState<Digit | null>(
    () => restored?.activeDigit ?? null,
  )
  const [pencilMode, setPencilMode] = useState(
    () => restored?.pencilMode ?? false,
  )
  const [errorCell, setErrorCell] = useState<{ r: number; c: number } | null>(
    null,
  )
  const [status, setStatus] = useState<Status>(() =>
    restored ? 'ready' : 'loading',
  )
  const [loadError, setLoadError] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState<Settings>(() => loadSettings())
  const [mistakes, setMistakes] = useState(() => restored?.mistakes ?? 0)
  const [hintsUsed, setHintsUsed] = useState(() => restored?.hintsUsed ?? 0)
  const [selectedCell, setSelectedCell] = useState<{
    r: number
    c: number
  } | null>(null)
  const [scores, setScores] = useState(() => loadScores())
  const [lastWin, setLastWin] = useState<RecordResult | null>(null)

  useEffect(() => {
    applyTheme(settings.theme)
  }, [settings.theme])

  const playing = status === 'ready'
  const { seconds, reset } = useTimer(playing, restored?.seconds ?? 0)

  const finishedDigits = useMemo(() => {
    const finished = new Set<Digit>()
    if (!grid) return finished
    const counts = countDigits(grid)
    for (const d of [1, 2, 3, 4, 5, 6, 7, 8, 9] as Digit[]) {
      if (counts[d] >= 9) finished.add(d)
    }
    return finished
  }, [grid])

  const startPuzzle = useCallback(async (level: Difficulty) => {
    setStatus('loading')
    setLoadError(null)
    setActiveDigit(null)
    setPencilMode(false)
    setErrorCell(null)
    setMistakes(0)
    setHintsUsed(0)
    setSelectedCell(null)
    setLastWin(null)
    setNotes(emptyNotes())
    clearSavedGame()
    reset()
    try {
      const next = await pickPuzzle(level)
      setPuzzle(next)
      setGrid(cloneGrid(next.givens))
      setStatus('ready')
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load puzzle')
      setStatus('error')
    }
  }, [reset])

  useEffect(() => {
    if (restored) return
    void startPuzzle(difficulty)
    // First visit only; later games come from New puzzle / difficulty.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (status !== 'ready' || !puzzle || !grid) return
    saveGame({
      puzzle,
      grid,
      notes,
      seconds,
      mistakes,
      hintsUsed,
      pencilMode,
      activeDigit,
    })
  }, [
    status,
    puzzle,
    grid,
    notes,
    seconds,
    mistakes,
    hintsUsed,
    pencilMode,
    activeDigit,
  ])

  useEffect(() => {
    if (!errorCell) return
    const id = window.setTimeout(() => setErrorCell(null), 550)
    return () => window.clearTimeout(id)
  }, [errorCell])

  function handleSettingsChange(next: Settings) {
    setSettings(next)
    saveSettings(next)
    applyTheme(next.theme)
  }

  function handleSelectDigit(digit: Digit) {
    setActiveDigit((current) => (current === digit ? null : digit))
  }

  function handleDifficultyChange(level: Difficulty) {
    setDifficulty(level)
    void startPuzzle(level)
  }

  function finishIfComplete(
    next: Grid,
    nextMistakes: number,
    nextHintsUsed: number,
  ) {
    if (!puzzle || !isComplete(next)) return false
    const result = recordScore(
      scores,
      puzzle.difficulty,
      seconds,
      nextMistakes,
      nextHintsUsed,
    )
    saveScores(result.board)
    setScores(result.board)
    setLastWin(result)
    setStatus('won')
    clearSavedGame()
    return true
  }

  function placeDigit(r: number, c: number, digit: Digit) {
    if (!grid) return
    const next = cloneGrid(grid)
    next[r][c] = digit
    setGrid(next)
    setNotes((current) => clearNotesForPlacement(current, r, c, digit))
    setSelectedCell(null)
    const counts = countDigits(next)
    if (counts[digit] >= 9) {
      setActiveDigit(null)
    }
    finishIfComplete(next, mistakes, hintsUsed)
  }

  function handleHint() {
    if (!puzzle || !grid || status !== 'ready') return
    if (hintsUsed >= HINTS_PER_GAME || !selectedCell) return
    const { r, c } = selectedCell
    if (grid[r][c] !== 0) return
    const digit = puzzle.solution[r][c] as Digit
    const nextHints = hintsUsed + 1
    setHintsUsed(nextHints)
    const next = cloneGrid(grid)
    next[r][c] = digit
    setGrid(next)
    setNotes((current) => clearNotesForPlacement(current, r, c, digit))
    setSelectedCell(null)
    const counts = countDigits(next)
    if (counts[digit] >= 9) {
      setActiveDigit(null)
    }
    finishIfComplete(next, mistakes, nextHints)
  }

  function handleCellTap(r: number, c: number) {
    if (!puzzle || !grid || (status !== 'ready' && status !== 'won')) return

    const value = grid[r][c]
    if (value !== 0) {
      setActiveDigit(value as Digit)
      setSelectedCell(null)
      return
    }

    if (status !== 'ready') return

    setSelectedCell({ r, c })

    if (activeDigit === null) return

    if (pencilMode) {
      setNotes((current) => toggleNote(current, r, c, activeDigit))
      return
    }

    if (puzzle.solution[r][c] !== activeDigit) {
      setErrorCell({ r, c })
      setMistakes((count) => count + 1)
      return
    }

    placeDigit(r, c, activeDigit)
  }

  const hintsLeft = Math.max(0, HINTS_PER_GAME - hintsUsed)
  const score =
    lastWin?.entry.score ??
    (puzzle ? liveScore(puzzle.difficulty, mistakes, hintsUsed) : 0)

  return (
    <div className="app">
      <Header
        showTimer={settings.showTimer}
        timeLabel={formatTime(seconds)}
        hintsLeft={hintsLeft}
        score={score}
        theme={settings.theme}
        onThemeChange={(theme) =>
          handleSettingsChange({ ...settings, theme })
        }
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="controls">
        <label className="difficulty">
          <span className="difficulty-label">Difficulty</span>
          <select
            value={difficulty}
            onChange={(e) =>
              handleDifficultyChange(e.target.value as Difficulty)
            }
            aria-label="Difficulty"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>
        <button
          type="button"
          className="new-puzzle"
          onClick={() => void startPuzzle(difficulty)}
        >
          New puzzle
        </button>
      </div>

      <main className="main">
        {status === 'loading' && <p className="status-msg">Loading puzzle…</p>}
        {status === 'error' && (
          <p className="status-msg is-error">{loadError}</p>
        )}
        {grid && puzzle && (status === 'ready' || status === 'won') && (
          <>
            <Board
              grid={grid}
              givens={puzzle.givens}
              notes={notes}
              activeDigit={activeDigit}
              selectedCell={selectedCell}
              errorCell={errorCell}
              onCellTap={handleCellTap}
            />
            {status === 'won' && lastWin && (
              <p className="win-banner" role="status">
                Complete
                {settings.showTimer
                  ? ` — ${formatTime(lastWin.entry.seconds)}`
                  : ''}{' '}
                · {lastWin.entry.score.toLocaleString()}
                {lastWin.isNewBest
                  ? ' · New best'
                  : lastWin.rank
                    ? ` · #${lastWin.rank}`
                    : ''}
              </p>
            )}
          </>
        )}
      </main>

      <NumberPad
        activeDigit={activeDigit}
        finishedDigits={finishedDigits}
        pencilMode={pencilMode}
        hintsLeft={hintsLeft}
        hintDisabled={
          status !== 'ready' ||
          hintsLeft === 0 ||
          selectedCell === null ||
          Boolean(grid && selectedCell && grid[selectedCell.r][selectedCell.c] !== 0)
        }
        onSelect={handleSelectDigit}
        onTogglePencil={() => setPencilMode((on) => !on)}
        onHint={handleHint}
      />

      <SettingsPanel
        open={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onChange={handleSettingsChange}
        scores={scores}
      />
    </div>
  )
}
