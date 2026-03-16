import type { Difficulty, GameState, Move, RNG } from '../engine/types'

export interface AIOptions {
  difficulty: Difficulty
  rng?: RNG
  maxDepth?: number
  timeLimitMs?: number
}

export type AIStrategy = (state: GameState, options: AIOptions) => Move | null
