import type { CellValue, Digit, Grid } from '../lib/sudoku'
import './Board.css'

interface BoardProps {
  grid: Grid
  givens: Grid
  activeDigit: Digit | null
  errorCell: { r: number; c: number } | null
  onCellTap: (r: number, c: number) => void
}

export function Board({
  grid,
  givens,
  activeDigit,
  errorCell,
  onCellTap,
}: BoardProps) {
  return (
    <div className="board-frame">
      <div className="board" role="grid" aria-label="Sudoku board">
        {grid.map((row, r) =>
          row.map((value, c) => {
            const given = givens[r][c] !== 0
            const highlighted =
              activeDigit !== null && value === (activeDigit as CellValue)
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
                  thickRight ? 'thick-right' : '',
                  thickBottom ? 'thick-bottom' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-label={
                  value
                    ? `Row ${r + 1} column ${c + 1}, ${value}${given ? ', given' : ''}. Select ${value}`
                    : `Row ${r + 1} column ${c + 1}, empty`
                }
                onClick={() => onCellTap(r, c)}
              >
                <span
                  className={`cell-value${value === 0 ? ' is-empty' : ''}`}
                  aria-hidden={value === 0}
                >
                  {value === 0 ? '0' : value}
                </span>
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
