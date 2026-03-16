import type { Difficulty, GameState, Move, RNG, Side } from '../engine/types'
import { randomMove } from './random'
import { greedyMove } from './greedy'
import { minimaxMove } from './minimax'

export function chooseMove(
  state: GameState,
  side: Side,
  difficulty: Difficulty,
  rng: RNG = Math.random
): Move | null {
  switch (difficulty) {
    case 'easy':
      return randomMove(state, side, rng)
    case 'normal':
      return greedyMove(state, side, rng)
    case 'hard':
      return minimaxMove(state, side, 4, 2000, rng)
  }
}
