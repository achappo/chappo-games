import { useCallback, useEffect, useMemo, useState } from 'react'
import { Board } from './components/Board'
import { Header } from './components/Header'
import { NumberPad } from './components/NumberPad'
import { SettingsPanel } from './components/Settings'
import { useTimer } from './hooks/useTimer'
import {
  pickPuzzle,
  type Difficulty,
  type LoadedPuzzle,
} from './lib/puzzles'
import {
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
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [puzzle, setPuzzle] = useState<LoadedPuzzle | null>(null)
  const [grid, setGrid] = useState<Grid | null>(null)
  const [activeDigit, setActiveDigit] = useState<Digit | null>(null)
  const [errorCell, setErrorCell] = useState<{ r: number; c: number } | null>(
    null,
  )
  const [status, setStatus] = useState<Status>('loading')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState<Settings>(() => loadSettings())
  const [mistakes, setMistakes] = useState(0)
  const [scores, setScores] = useState(() => loadScores())
  const [lastWin, setLastWin] = useState<RecordResult | null>(null)

  useEffect(() => {
    applyTheme(settings.theme)
  }, [settings.theme])

  const playing = status === 'ready'
  const { seconds, reset } = useTimer(playing)

  const finishedDigits = useMemo(() => {
    const hidden = new Set<Digit>()
    if (!grid || !settings.hideFinishedNumbers) return hidden
    const counts = countDigits(grid)
    for (const d of [1, 2, 3, 4, 5, 6, 7, 8, 9] as Digit[]) {
      if (counts[d] >= 9) hidden.add(d)
    }
    return hidden
  }, [grid, settings.hideFinishedNumbers])

  const startPuzzle = useCallback(async (level: Difficulty) => {
    setStatus('loading')
    setLoadError(null)
    setActiveDigit(null)
    setErrorCell(null)
    setMistakes(0)
    setLastWin(null)
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
    void startPuzzle(difficulty)
  }, [difficulty, startPuzzle])

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
    setActiveDigit(digit)
  }

  function handleCellTap(r: number, c: number) {
    if (!puzzle || !grid || (status !== 'ready' && status !== 'won')) return

    const value = grid[r][c]
    if (value !== 0) {
      setActiveDigit(value as Digit)
      return
    }

    if (status !== 'ready' || activeDigit === null) return

    if (puzzle.solution[r][c] !== activeDigit) {
      setErrorCell({ r, c })
      setMistakes((count) => count + 1)
      return
    }

    const next = cloneGrid(grid)
    next[r][c] = activeDigit
    setGrid(next)

    if (settings.hideFinishedNumbers) {
      const counts = countDigits(next)
      if (counts[activeDigit] >= 9) {
        setActiveDigit(null)
      }
    }

    if (isComplete(next)) {
      const result = recordScore(scores, puzzle.difficulty, seconds, mistakes)
      saveScores(result.board)
      setScores(result.board)
      setLastWin(result)
      setStatus('won')
    }
  }

  const score =
    lastWin?.entry.score ??
    (puzzle ? liveScore(puzzle.difficulty, seconds, mistakes) : 0)

  return (
    <div className="app">
      <Header
        timeLabel={formatTime(seconds)}
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
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
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
              activeDigit={activeDigit}
              errorCell={errorCell}
              onCellTap={handleCellTap}
            />
            {status === 'won' && lastWin && (
              <p className="win-banner" role="status">
                Complete — {formatTime(lastWin.entry.seconds)} ·{' '}
                {lastWin.entry.score.toLocaleString()}
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
        hiddenDigits={finishedDigits}
        onSelect={handleSelectDigit}
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
