import type { GameState, Move, RNG, Side } from '../engine/types'
import { RANK_VALUE } from '../engine/types'
import { getLegalMoves } from '../engine/moves'
import { applyMove } from '../engine/apply'

function evaluateState(state: GameState, side: Side): number {
  if (state.gameOver) {
    if (state.winner === side) return 100000
    if (state.winner !== null) return -100000
    return 0
  }

  let score = 0
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = state.board[row][col]
      if (!piece || !piece.faceUp) continue
      const val = RANK_VALUE[piece.rank] * 10
      if (piece.side === side) score += val
      else score -= val
    }
  }
  return score
}

function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  aiSide: Side,
  startTime: number,
  timeLimitMs: number
): number {
  if (Date.now() - startTime > timeLimitMs) return evaluateState(state, aiSide)
  if (depth === 0 || state.gameOver) return evaluateState(state, aiSide)

  const currentSide = state.currentTurn
  const moves = getLegalMoves(state, currentSide)
  if (moves.length === 0) return evaluateState(state, aiSide)

  if (maximizing) {
    let maxEval = -Infinity
    for (const move of moves) {
      const newState = applyMove(state, move)
      const evalScore = minimax(newState, depth - 1, alpha, beta, false, aiSide, startTime, timeLimitMs)
      maxEval = Math.max(maxEval, evalScore)
      alpha = Math.max(alpha, evalScore)
      if (beta <= alpha) break
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const move of moves) {
      const newState = applyMove(state, move)
      const evalScore = minimax(newState, depth - 1, alpha, beta, true, aiSide, startTime, timeLimitMs)
      minEval = Math.min(minEval, evalScore)
      beta = Math.min(beta, evalScore)
      if (beta <= alpha) break
    }
    return minEval
  }
}

export function minimaxMove(
  state: GameState,
  side: Side,
  maxDepth = 4,
  timeLimitMs = 2000,
  rng: RNG = Math.random
): Move | null {
  const moves = getLegalMoves(state, side)
  if (moves.length === 0) return null

  const startTime = Date.now()
  let bestMove: Move | null = null
  let bestScore = -Infinity

  for (const move of moves) {
    if (Date.now() - startTime > timeLimitMs) break
    const newState = applyMove(state, move)
    const score = minimax(newState, maxDepth - 1, -Infinity, Infinity, false, side, startTime, timeLimitMs)
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }

  return bestMove ?? moves[Math.floor(rng() * moves.length)]
}
