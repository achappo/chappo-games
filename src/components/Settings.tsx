import type { Difficulty } from '../lib/puzzles'
import {
  DIFFICULTY_LABELS,
  type ScoreBoard,
  type ScoreEntry,
} from '../lib/scores'
import type { Settings, Theme } from '../lib/settings'
import { formatTime } from '../lib/sudoku'
import './Settings.css'

interface SettingsPanelProps {
  open: boolean
  settings: Settings
  scores: ScoreBoard
  onClose: () => void
  onChange: (next: Settings) => void
}

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard']

function mistakesLabel(count: number): string {
  return count === 1 ? '1 mistake' : `${count} mistakes`
}

function ScoreList({ entries }: { entries: ScoreEntry[] }) {
  if (entries.length === 0) {
    return <p className="scores-empty">No scores yet</p>
  }

  return (
    <ol className="scores-list">
      {entries.map((entry, index) => (
        <li key={`${entry.completedAt}-${index}`} className="scores-row">
          <span className="scores-rank">{index + 1}</span>
          <span className="scores-points">{entry.score.toLocaleString()}</span>
          <span className="scores-meta">
            {formatTime(entry.seconds)} · {mistakesLabel(entry.mistakes)}
          </span>
        </li>
      ))}
    </ol>
  )
}

export function SettingsPanel({
  open,
  settings,
  scores,
  onClose,
  onChange,
}: SettingsPanelProps) {
  if (!open) return null

  return (
    <div className="settings-overlay" role="presentation" onClick={onClose}>
      <div
        className="settings-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-sheet-header">
          <h2 id="settings-title">Options</h2>
          <button
            type="button"
            className="settings-close"
            aria-label="Close options"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <label className="settings-row">
          <div className="settings-copy">
            <span className="settings-name">Hide finished numbers</span>
            <span className="settings-desc">
              Drop a pad digit once all nine of that number are on the board
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.hideFinishedNumbers}
            onChange={(e) =>
              onChange({
                ...settings,
                hideFinishedNumbers: e.target.checked,
              })
            }
          />
        </label>

        <section className="scores-section" aria-labelledby="high-scores-title">
          <h3 id="high-scores-title" className="scores-heading">
            High scores
          </h3>
          <p className="scores-desc">Top five on this device, by difficulty.</p>
          {DIFFICULTY_ORDER.map((level) => (
            <div key={level} className="scores-group">
              <h4 className="scores-difficulty">{DIFFICULTY_LABELS[level]}</h4>
              <ScoreList entries={scores[level]} />
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}

interface ThemeToggleProps {
  theme: Theme
  onChange: (theme: Theme) => void
}

export function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      onClick={() => onChange(isDark ? 'light' : 'dark')}
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <path
            fill="currentColor"
            d="M12 3.2a.9.9 0 0 1 .9.9v1.2a.9.9 0 1 1-1.8 0V4.1a.9.9 0 0 1 .9-.9zm0 14.6a.9.9 0 0 1 .9.9v1.2a.9.9 0 1 1-1.8 0v-1.2a.9.9 0 0 1 .9-.9zM4.1 11.1a.9.9 0 1 0 0 1.8h1.2a.9.9 0 1 0 0-1.8H4.1zm14.6 0a.9.9 0 1 0 0 1.8h1.2a.9.9 0 1 0 0-1.8h-1.2zM6.4 5.8a.9.9 0 0 0 0 1.27l.85.85a.9.9 0 1 0 1.27-1.27l-.85-.85a.9.9 0 0 0-1.27 0zm9.08 9.08a.9.9 0 0 0 0 1.27l.85.85a.9.9 0 1 0 1.27-1.27l-.85-.85a.9.9 0 0 0-1.27 0zM17.6 5.8a.9.9 0 0 0-1.27 0l-.85.85a.9.9 0 1 0 1.27 1.27l.85-.85a.9.9 0 0 0 0-1.27zM8.52 14.88a.9.9 0 0 0-1.27 0l-.85.85a.9.9 0 1 0 1.27 1.27l.85-.85a.9.9 0 0 0 0-1.27z"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path
            fill="currentColor"
            d="M16.4 13.2A6.4 6.4 0 0 1 10.8 4a.7.7 0 0 0-.9-.7A8.2 8.2 0 1 0 20.7 14.1a.7.7 0 0 0-.7-.9 6.35 6.35 0 0 1-3.6 0z"
          />
        </svg>
      )}
    </button>
  )
}

interface SettingsButtonProps {
  onClick: () => void
}

export function SettingsButton({ onClick }: SettingsButtonProps) {
  return (
    <button
      type="button"
      className="settings-cog"
      aria-label="Options"
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path
          fill="currentColor"
          d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.07 7.07 0 0 0-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.55-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.86 14.5a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.3.59.22l2.39-.96c.5.39 1.04.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.55 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"
        />
      </svg>
    </button>
  )
}
