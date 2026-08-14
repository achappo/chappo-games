import type { Digit } from '../lib/sudoku'
import './NumberPad.css'

interface NumberPadProps {
  activeDigit: Digit | null
  hiddenDigits?: ReadonlySet<Digit>
  onSelect: (digit: Digit) => void
}

const DIGITS: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export function NumberPad({
  activeDigit,
  hiddenDigits,
  onSelect,
}: NumberPadProps) {
  return (
    <div className="number-pad" role="toolbar" aria-label="Choose a number">
      {DIGITS.map((digit) => {
        const hidden = hiddenDigits?.has(digit) ?? false
        const active = !hidden && activeDigit === digit
        return (
          <button
            key={digit}
            type="button"
            className={[
              'number-tile',
              active ? 'is-active' : '',
              hidden ? 'is-hidden' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-pressed={active}
            aria-hidden={hidden}
            tabIndex={hidden ? -1 : 0}
            disabled={hidden}
            onClick={() => {
              if (!hidden) onSelect(digit)
            }}
          >
            <span className="number-tile-label">{digit}</span>
          </button>
        )
      })}
    </div>
  )
}
