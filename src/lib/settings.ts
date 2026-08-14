export type Theme = 'light' | 'dark'

export interface Settings {
  /** Hide pad digits once all nine of that number are placed. */
  hideFinishedNumbers: boolean
  theme: Theme
}

export const DEFAULT_SETTINGS: Settings = {
  hideFinishedNumbers: false,
  theme: 'light',
}

const STORAGE_KEY = 'sudoku-settings'

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw) as Partial<Settings>
    return {
      hideFinishedNumbers: Boolean(parsed.hideFinishedNumbers),
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
    }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', theme === 'dark' ? '#1a1814' : '#f3efe6')
  }
}
