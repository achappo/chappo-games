import type { Theme } from '../lib/settings'
import './Header.css'
import { SettingsButton, ThemeToggle } from './Settings'

interface HeaderProps {
  showTimer: boolean
  timeLabel: string
  hintsLeft: number
  score: number
  theme: Theme
  onThemeChange: (theme: Theme) => void
  onOpenSettings: () => void
}

export function Header({
  showTimer,
  timeLabel,
  hintsLeft,
  score,
  theme,
  onThemeChange,
  onOpenSettings,
}: HeaderProps) {
  return (
    <header className="game-header">
      <div
        className="header-side header-timer"
        aria-live={showTimer ? 'polite' : 'off'}
      >
        {showTimer ? (
          <>
            <span className="header-label">Time</span>
            <span className="header-value">{timeLabel}</span>
          </>
        ) : (
          <>
            <span className="header-label">Hints</span>
            <span className="header-value">{hintsLeft}</span>
          </>
        )}
      </div>
      <div className="header-center">
        <ThemeToggle theme={theme} onChange={onThemeChange} />
        <SettingsButton onClick={onOpenSettings} />
      </div>
      <div className="header-side header-score">
        <span className="header-label">Score</span>
        <span className="header-value">{score.toLocaleString()}</span>
      </div>
    </header>
  )
}
