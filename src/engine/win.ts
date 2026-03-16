import type { GameState, Side } from './types'
import { getLegalMoves } from './moves'

export function hasPiecesLeft(state: GameState, side: Side): boolean {
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = state.board[row][col]
      if (piece && piece.side === side) return true
    }
  }
  return false
}

export function hasLegalMoves(state: GameState, side: Side): boolean {
  const moves = getLegalMoves(state, side)
  return moves.length > 0
}

export function checkWinner(state: GameState): Side | null {
  if (!state.sideDecided) return null

  const sides: Side[] = ['red', 'black']

  for (const side of sides) {
    const otherSide: Side = side === 'red' ? 'black' : 'red'
    if (!hasPiecesLeft(state, side)) {
      return otherSide
    }
  }

  // Check if current side has no legal moves
  const currentSide = state.currentTurn
  if (!hasLegalMoves(state, currentSide)) {
    return currentSide === 'red' ? 'black' : 'red'
  }

  return null
}
