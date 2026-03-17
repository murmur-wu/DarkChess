import type { Board, Piece, Position } from './types'
import { RANK_VALUE } from './types'

export function canCapture(attacker: Piece, target: Piece): boolean {
  if (attacker.side === target.side) return false
  if (!target.faceUp) return false
  if (!attacker.faceUp) return false

  // Cannon uses special capture rules (handled separately)
  if (attacker.rank === 'cannon') return false

  // Soldier special: can capture General
  if (attacker.rank === 'soldier' && target.rank === 'general') return true

  // General cannot capture Soldier
  if (attacker.rank === 'general' && target.rank === 'soldier') return false

  // Horse can capture Cannon (炮/包 has no defensive rank advantage)
  if (attacker.rank === 'horse' && target.rank === 'cannon') return true

  const av = RANK_VALUE[attacker.rank]
  const tv = RANK_VALUE[target.rank]

  return av >= tv
}

export function cannonCanCapture(board: Board, from: Position, to: Position, attacker: Piece): boolean {
  if (!attacker.faceUp || attacker.rank !== 'cannon') return false

  const target = board[to.row][to.col]
  if (!target || !target.faceUp || target.side === attacker.side) return false

  const sameRow = from.row === to.row
  const sameCol = from.col === to.col

  if (!sameRow && !sameCol) return false
  if (from.row === to.row && from.col === to.col) return false

  let between = 0
  if (sameRow) {
    const minCol = Math.min(from.col, to.col)
    const maxCol = Math.max(from.col, to.col)
    for (let c = minCol + 1; c < maxCol; c++) {
      if (board[from.row][c] !== null) between++
    }
  } else {
    const minRow = Math.min(from.row, to.row)
    const maxRow = Math.max(from.row, to.row)
    for (let r = minRow + 1; r < maxRow; r++) {
      if (board[r][from.col] !== null) between++
    }
  }

  return between === 1
}

export function inBounds(pos: Position): boolean {
  return pos.row >= 0 && pos.row < 4 && pos.col >= 0 && pos.col < 8
}

export function adjacentPositions(pos: Position): Position[] {
  const dirs = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ]
  return dirs
    .map((d) => ({ row: pos.row + d.row, col: pos.col + d.col }))
    .filter(inBounds)
}
