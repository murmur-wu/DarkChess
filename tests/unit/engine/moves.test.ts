import { describe, it, expect } from 'vitest'
import { getLegalMoves, getLegalMovesForPiece } from '../../../src/engine/moves'
import { createInitialState } from '../../../src/engine/init'
import type { Board, GameState, Piece } from '../../../src/engine/types'

function emptyBoard(): Board {
  return Array.from({ length: 4 }, () => Array(8).fill(null))
}

function makePiece(id: number, side: Piece['side'], rank: Piece['rank'], faceUp = true): Piece {
  return { id, side, rank, faceUp }
}

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    board: emptyBoard(),
    currentTurn: 'red',
    playerSide: 'red',
    aiSide: 'black',
    sideDecided: true,
    winner: null,
    gameOver: false,
    capturedByPlayer: [],
    capturedByAi: [],
    ...overrides,
  }
}

describe('getLegalMoves - initial state', () => {
  it('only flip moves are available before side is decided', () => {
    const state = createInitialState()
    const moves = getLegalMoves(state, 'red')
    expect(moves.every((m) => m.type === 'flip')).toBe(true)
    expect(moves.length).toBe(32)
  })
})

describe('getLegalMoves - face-down pieces', () => {
  it('face-down pieces cannot be moved', () => {
    const board = emptyBoard()
    board[0][0] = makePiece(0, 'red', 'general', false)
    const state = makeState({ board })
    const moves = getLegalMoves(state, 'red')
    const moveMoves = moves.filter(m => m.type === 'move')
    expect(moveMoves.length).toBe(0)
  })
})

describe('getLegalMoves - movement', () => {
  it('piece can move to adjacent empty cells', () => {
    const board = emptyBoard()
    board[1][3] = makePiece(0, 'red', 'general')
    const state = makeState({ board })
    const moves = getLegalMoves(state, 'red').filter(m => m.type === 'move')
    expect(moves.length).toBe(4)
  })

  it('piece at corner can only move in 2 directions', () => {
    const board = emptyBoard()
    board[0][0] = makePiece(0, 'red', 'general')
    const state = makeState({ board })
    const moves = getLegalMoves(state, 'red').filter(m => m.type === 'move')
    expect(moves.length).toBe(2)
  })

  it('cannot move to cell occupied by own piece', () => {
    const board = emptyBoard()
    board[0][0] = makePiece(0, 'red', 'general')
    board[0][1] = makePiece(1, 'red', 'advisor')
    const state = makeState({ board })
    const moves = getLegalMoves(state, 'red')
    const generalMoves = moves.filter(m => m.from.row === 0 && m.from.col === 0)
    expect(generalMoves.every(m => !(m.to.row === 0 && m.to.col === 1))).toBe(true)
  })

  it('cannot move to cell occupied by face-down piece', () => {
    const board = emptyBoard()
    board[0][0] = makePiece(0, 'red', 'general')
    board[0][1] = makePiece(1, 'black', 'soldier', false)
    const state = makeState({ board })
    const moves = getLegalMoves(state, 'red').filter(m => m.from.row === 0 && m.from.col === 0)
    expect(moves.every(m => !(m.to.row === 0 && m.to.col === 1))).toBe(true)
  })
})

describe('getLegalMoves - capture', () => {
  it('general can capture lower-rank enemy', () => {
    const board = emptyBoard()
    board[0][0] = makePiece(0, 'red', 'general')
    board[0][1] = makePiece(1, 'black', 'advisor')
    const state = makeState({ board })
    const moves = getLegalMoves(state, 'red').filter(m => m.type === 'capture')
    expect(moves.length).toBeGreaterThan(0)
  })

  it('general cannot capture soldier', () => {
    const board = emptyBoard()
    board[0][0] = makePiece(0, 'red', 'general')
    board[0][1] = makePiece(1, 'black', 'soldier')
    const state = makeState({ board })
    const captures = getLegalMoves(state, 'red').filter(m => m.type === 'capture')
    const capturesTarget = captures.filter(m => m.to.row === 0 && m.to.col === 1)
    expect(capturesTarget.length).toBe(0)
  })

  it('soldier can capture general', () => {
    const board = emptyBoard()
    board[0][0] = makePiece(0, 'red', 'soldier')
    board[0][1] = makePiece(1, 'black', 'general')
    const state = makeState({ board })
    const captures = getLegalMoves(state, 'red').filter(m => m.type === 'capture')
    expect(captures.some(m => m.to.row === 0 && m.to.col === 1)).toBe(true)
  })

  it('cannot capture face-down enemy', () => {
    const board = emptyBoard()
    board[0][0] = makePiece(0, 'red', 'general')
    board[0][1] = makePiece(1, 'black', 'soldier', false)
    const state = makeState({ board })
    const captures = getLegalMoves(state, 'red').filter(m => m.type === 'capture')
    expect(captures.length).toBe(0)
  })
})

describe('getLegalMoves - cannon', () => {
  it('cannon moves one step to empty cell without capturing', () => {
    const board = emptyBoard()
    board[1][3] = makePiece(0, 'red', 'cannon')
    const state = makeState({ board })
    const moves = getLegalMoves(state, 'red').filter(m => m.type === 'move')
    expect(moves.length).toBe(4)
  })

  it('cannon can capture over exactly one piece', () => {
    const board = emptyBoard()
    board[0][0] = makePiece(0, 'red', 'cannon')
    board[0][3] = makePiece(1, 'black', 'soldier')
    board[0][7] = makePiece(2, 'black', 'general')
    const state = makeState({ board })
    const captures = getLegalMoves(state, 'red').filter(m => m.type === 'capture')
    expect(captures.some(m => m.to.row === 0 && m.to.col === 7)).toBe(true)
  })

  it('cannon cannot capture adjacent piece (no screen)', () => {
    const board = emptyBoard()
    board[0][0] = makePiece(0, 'red', 'cannon')
    board[0][1] = makePiece(1, 'black', 'general')
    const state = makeState({ board })
    const captures = getLegalMoves(state, 'red').filter(m => m.type === 'capture')
    expect(captures.length).toBe(0)
  })
})

describe('no out-of-bounds moves', () => {
  it('all generated moves are within bounds', () => {
    const state = createInitialState()
    const moves = getLegalMoves(state, 'red')
    for (const m of moves) {
      expect(m.from.row).toBeGreaterThanOrEqual(0)
      expect(m.from.row).toBeLessThan(4)
      expect(m.from.col).toBeGreaterThanOrEqual(0)
      expect(m.from.col).toBeLessThan(8)
      expect(m.to.row).toBeGreaterThanOrEqual(0)
      expect(m.to.row).toBeLessThan(4)
      expect(m.to.col).toBeGreaterThanOrEqual(0)
      expect(m.to.col).toBeLessThan(8)
    }
  })
})
