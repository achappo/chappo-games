import type { Digit } from '../lib/sudoku'
import './NumberPad.css'

interface NumberPadProps {
  activeDigit: Digit | null
  finishedDigits?: ReadonlySet<Digit>
  onSelect: (digit: Digit) => void
}

const DIGITS: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export function NumberPad({
  activeDigit,
  finishedDigits,
  onSelect,
}: NumberPadProps) {
  return (
    <div className="number-pad" role="toolbar" aria-label="Choose a number">
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
            aria-label={
              finished ? `${digit}, all placed` : undefined
            }
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
  )
}
