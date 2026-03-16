import type { GameState, Move, Piece, RNG, Side } from '../engine/types'
import { RANK_VALUE } from '../engine/types'
import { getLegalMoves } from '../engine/moves'
import { applyMove } from '../engine/apply'

function pieceValue(piece: Piece): number {
  return RANK_VALUE[piece.rank] * 10
}

function scoreMoveGreedy(state: GameState, move: Move, side: Side): number {
  let score = 0

  if (move.type === 'capture' && move.captured) {
    score += pieceValue(move.captured) * 2
  }

  if (move.type === 'flip') {
    score += 5
  }

  if (move.type === 'move' || move.type === 'capture') {
    const newState = applyMove(state, move)
    const opponent: Side = side === 'red' ? 'black' : 'red'
    const oppMoves = getLegalMoves(newState, opponent)
    for (const oppMove of oppMoves) {
      if (oppMove.type === 'capture' && oppMove.to.row === move.to.row && oppMove.to.col === move.to.col) {
        score -= pieceValue(move.piece)
      }
    }
  }

  return score
}

export function greedyMove(state: GameState, side: Side, rng: RNG = Math.random): Move | null {
  const moves = getLegalMoves(state, side)
  if (moves.length === 0) return null

  let bestScore = -Infinity
  let bestMoves: Move[] = []

  for (const move of moves) {
    const score = scoreMoveGreedy(state, move, side)
    if (score > bestScore) {
      bestScore = score
      bestMoves = [move]
    } else if (score === bestScore) {
      bestMoves.push(move)
    }
  }

  const idx = Math.floor(rng() * bestMoves.length)
  return bestMoves[idx]
}
