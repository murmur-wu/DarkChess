import type { GameState, Move, RNG, Side } from '../engine/types'
import { getLegalMoves } from '../engine/moves'

export function randomMove(state: GameState, side: Side, rng: RNG = Math.random): Move | null {
  const moves = getLegalMoves(state, side)
  if (moves.length === 0) return null
  const idx = Math.floor(rng() * moves.length)
  return moves[idx]
}
