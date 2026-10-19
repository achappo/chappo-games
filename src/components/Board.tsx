import type { NotesGrid } from '../lib/notes'
import type { CellValue, Digit, Grid } from '../lib/sudoku'
import './Board.css'

const NOTE_DIGITS: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

interface BoardProps {
  grid: Grid
  givens: Grid
  notes: NotesGrid
  activeDigit: Digit | null
  selectedCell: { r: number; c: number } | null
  errorCell: { r: number; c: number } | null
  onCellTap: (r: number, c: number) => void
}

function notesLabel(marks: Digit[]): string {
  return marks.length === 0 ? 'empty' : `notes ${marks.join(' ')}`
}

export function Board({
  grid,
  givens,
  notes,
  activeDigit,
  selectedCell,
  errorCell,
  onCellTap,
}: BoardProps) {
  return (
    <div className="board-frame">
      <div className="board" role="grid" aria-label="Sudoku board">
        {grid.map((row, r) =>
          row.map((value, c) => {
            const given = givens[r][c] !== 0
            const marks = notes[r][c]
            const highlighted =
              activeDigit !== null && value === (activeDigit as CellValue)
            const selected =
              value === 0 && selectedCell?.r === r && selectedCell?.c === c
            const showError = errorCell?.r === r && errorCell?.c === c
            const thickRight = c === 2 || c === 5
            const thickBottom = r === 2 || r === 5

            return (
              <button
                key={`${r}-${c}`}
                type="button"
                role="gridcell"
                className={[
                  'cell',
                  given ? 'is-given' : '',
                  highlighted ? 'is-digit-match' : '',
                  selected ? 'is-selected' : '',
                  value === 0 && marks.length > 0 ? 'has-notes' : '',
                  thickRight ? 'thick-right' : '',
                  thickBottom ? 'thick-bottom' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-label={
                  value
                    ? `Row ${r + 1} column ${c + 1}, ${value}${given ? ', given' : ''}. Select ${value}`
                    : `Row ${r + 1} column ${c + 1}, ${notesLabel(marks)}`
                }
                onClick={() => onCellTap(r, c)}
              >
                <span
                  className={`cell-value${value === 0 ? ' is-empty' : ''}`}
                  aria-hidden={value === 0}
                >
                  {value === 0 ? '0' : value}
                </span>
                {value === 0 && marks.length > 0 ? (
                  <span className="cell-notes" aria-hidden="true">
                    {NOTE_DIGITS.map((digit) => {
                      const on = marks.includes(digit)
                      return (
                        <span
                          key={digit}
                          className={[
                            'cell-note',
                            on ? 'is-on' : '',
                            on && activeDigit === digit ? 'is-match' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {on ? digit : ''}
                        </span>
                      )
                    })}
                  </span>
                ) : null}
                {showError ? (
                  <span className="cell-error" aria-hidden="true">
                    ×
                  </span>
                ) : null}
              </button>
            )
          }),
        )}
      </div>
    </div>
  )
}
