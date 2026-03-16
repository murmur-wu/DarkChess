import type { Board, Cell, GameState, Piece, RNG, Side } from './types'

function createAllPieces(): Piece[] {
  const pieces: Piece[] = []
  let id = 0

  const add = (side: Side, rank: Piece['rank'], count: number) => {
    for (let i = 0; i < count; i++) {
      pieces.push({ id: id++, side, rank, faceUp: false })
    }
  }

  // Red pieces
  add('red', 'general', 1)
  add('red', 'advisor', 2)
  add('red', 'elephant', 2)
  add('red', 'chariot', 2)
  add('red', 'horse', 2)
  add('red', 'cannon', 2)
  add('red', 'soldier', 5)

  // Black pieces
  add('black', 'general', 1)
  add('black', 'advisor', 2)
  add('black', 'elephant', 2)
  add('black', 'chariot', 2)
  add('black', 'horse', 2)
  add('black', 'cannon', 2)
  add('black', 'soldier', 5)

  return pieces
}

function shuffle<T>(arr: T[], rng: RNG): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function emptyBoard(): Board {
  return Array.from({ length: 4 }, () => Array(8).fill(null) as Cell[])
}

export function createInitialState(rng: RNG = Math.random): GameState {
  const pieces = createAllPieces()
  const shuffled = shuffle(pieces, rng)

  const board = emptyBoard()
  let idx = 0
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 8; col++) {
      board[row][col] = shuffled[idx++]
    }
  }

  return {
    board,
    currentTurn: 'red',
    playerSide: null,
    aiSide: null,
    sideDecided: false,
    winner: null,
    gameOver: false,
    capturedByPlayer: [],
    capturedByAi: [],
  }
}
