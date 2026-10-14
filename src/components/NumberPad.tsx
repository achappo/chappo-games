import type { Digit } from '../lib/sudoku'
import './NumberPad.css'

interface NumberPadProps {
  activeDigit: Digit | null
  finishedDigits?: ReadonlySet<Digit>
  pencilMode: boolean
  onSelect: (digit: Digit) => void
  onTogglePencil: () => void
}

const DIGITS: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export function NumberPad({
  activeDigit,
  finishedDigits,
  pencilMode,
  onSelect,
  onTogglePencil,
}: NumberPadProps) {
  return (
    <div className="pad-dock">
      <button
        type="button"
        className={`pencil-toggle${pencilMode ? ' is-active' : ''}`}
        aria-pressed={pencilMode}
        aria-label={pencilMode ? 'Pencil mode on' : 'Pencil mode off'}
        onClick={onTogglePencil}
      >
        Pencil
      </button>
      <div
        className={`number-pad${pencilMode ? ' is-pencil' : ''}`}
        role="toolbar"
        aria-label="Choose a number"
      >
        {DIGITS.map((digit) => {
          const finished = finishedDigits?.has(digit) ?? false
          const active = !finished && activeDigit === digit
          return (
            <button
              key={digit}
              type="button"
              className={[
                'number-tile',
                active ? 'is-active' : '',
                finished ? 'is-finished' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-pressed={active}
              aria-label={finished ? `${digit}, all placed` : undefined}
              tabIndex={finished ? -1 : 0}
              disabled={finished}
              onClick={() => {
                if (!finished) onSelect(digit)
              }}
            >
              <span className="number-tile-label">{digit}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
