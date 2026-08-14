import type { Theme } from '../lib/settings'
import './Header.css'
import { SettingsButton, ThemeToggle } from './Settings'

interface HeaderProps {
  timeLabel: string
  score: number
  theme: Theme
  onThemeChange: (theme: Theme) => void
  onOpenSettings: () => void
}

export function Header({
  timeLabel,
  score,
  theme,
  onThemeChange,
  onOpenSettings,
}: HeaderProps) {
  return (
    <header className="game-header">
      <div className="header-side header-timer" aria-live="polite">
        <span className="header-label">Time</span>
        <span className="header-value">{timeLabel}</span>
      </div>
      <div className="header-center">
        <ThemeToggle theme={theme} onChange={onThemeChange} />
        <SettingsButton onClick={onOpenSettings} />
      </div>
      <div className="header-side header-score">
        <span className="header-label">Score</span>
        <span className="header-value">{score}</span>
      </div>
    </header>
  )
}
