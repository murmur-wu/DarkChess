// Side: which team
export type Side = 'red' | 'black'

export type Rank = 'general' | 'advisor' | 'elephant' | 'chariot' | 'horse' | 'soldier' | 'cannon'

// Rank values (higher = stronger), used for comparison
export const RANK_VALUE: Record<Rank, number> = {
  general: 6,  // 帥/將
  advisor: 5,  // 仕/士
  elephant: 4, // 相/象
  chariot: 3,  // 俥/車
  horse: 2,    // 傌/馬
  soldier: 1,  // 兵/卒
  cannon: 3,   // 炮/包 (same value as chariot for capture purposes)
}

// Piece on the board
export interface Piece {
  id: number       // unique 0-31
  side: Side
  rank: Rank
  faceUp: boolean
}

// Position on 4x8 board
export interface Position {
  row: number  // 0-3
  col: number  // 0-7
}

export type MoveType = 'flip' | 'move' | 'capture'

export interface Move {
  type: MoveType
  from: Position
  to: Position
  piece: Piece
  captured?: Piece  // for capture moves
}

// Cell in the board: null = empty
export type Cell = Piece | null

// Board: 4 rows x 8 cols
export type Board = Cell[][]

export interface GameState {
  board: Board
  currentTurn: Side
  playerSide: Side | null   // null = not yet decided
  aiSide: Side | null
  sideDecided: boolean
  winner: Side | null       // null = game ongoing
  gameOver: boolean
  capturedByPlayer: Piece[]
  capturedByAi: Piece[]
}

export type Difficulty = 'easy' | 'normal' | 'hard'

export type Winner = Side | 'draw' | null

// RNG type for deterministic testing
export type RNG = () => number
