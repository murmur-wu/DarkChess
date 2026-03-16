import type { Board, GameState, Move, Piece, Position } from './types'
import { adjacentPositions, canCapture, cannonCanCapture } from './rules'

function pos(row: number, col: number): Position {
  return { row, col }
}

export function getLegalMoves(state: GameState, side: 'red' | 'black'): Move[] {
  const moves: Move[] = []
  const { board, sideDecided } = state

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (!piece) continue

      const from = pos(row, col)

      // Flip moves: any face-down piece
      if (!piece.faceUp) {
        moves.push({
          type: 'flip',
          from,
          to: from,
          piece,
        })
        continue
      }

      // If side not decided, only flip is allowed
      if (!sideDecided) continue

      // Only move own pieces
      if (piece.side !== side) continue

      getPieceMoves(board, from, piece, moves)
    }
  }

  return moves
}

export function getPieceMoves(board: Board, from: Position, piece: Piece, moves: Move[]): void {
  if (!piece.faceUp) return

  if (piece.rank === 'cannon') {
    getCannonMoves(board, from, piece, moves)
  } else {
    getNormalMoves(board, from, piece, moves)
  }
}

function getNormalMoves(board: Board, from: Position, piece: Piece, moves: Move[]): void {
  for (const to of adjacentPositions(from)) {
    const target = board[to.row][to.col]
    if (target === null) {
      moves.push({ type: 'move', from, to, piece })
    } else if (!target.faceUp) {
      continue
    } else if (canCapture(piece, target)) {
      moves.push({ type: 'capture', from, to, piece, captured: target })
    }
  }
}

function getCannonMoves(board: Board, from: Position, piece: Piece, moves: Move[]): void {
  // Cannon normal move: one step to empty cell
  for (const to of adjacentPositions(from)) {
    const target = board[to.row][to.col]
    if (target === null) {
      moves.push({ type: 'move', from, to, piece })
    }
  }

  // Cannon capture: same row or col, exactly one piece between
  for (let c = 0; c < 8; c++) {
    if (c === from.col) continue
    const to = pos(from.row, c)
    if (cannonCanCapture(board, from, to, piece)) {
      const target = board[to.row][to.col]!
      moves.push({ type: 'capture', from, to, piece, captured: target })
    }
  }
  for (let r = 0; r < 4; r++) {
    if (r === from.row) continue
    const to = pos(r, from.col)
    if (cannonCanCapture(board, from, to, piece)) {
      const target = board[to.row][to.col]!
      moves.push({ type: 'capture', from, to, piece, captured: target })
    }
  }
}

export function getLegalMovesForPiece(state: GameState, from: Position): Move[] {
  const piece = state.board[from.row][from.col]
  if (!piece) return []

  if (!piece.faceUp) {
    return [{ type: 'flip', from, to: from, piece }]
  }

  if (!state.sideDecided) return []
  if (piece.side !== state.currentTurn) return []

  const moves: Move[] = []
  getPieceMoves(state.board, from, piece, moves)
  return moves
}
