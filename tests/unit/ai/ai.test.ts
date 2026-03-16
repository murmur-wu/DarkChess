import { describe, it, expect } from 'vitest'
import { chooseMove } from '../../../src/ai/ai'
import { createInitialState } from '../../../src/engine/init'
import { getLegalMoves } from '../../../src/engine/moves'
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

describe('AI - easy', () => {
  it('returns a legal move', () => {
    const state = createInitialState()
    const move = chooseMove(state, 'red', 'easy')
    expect(move).not.toBeNull()
    const legalMoves = getLegalMoves(state, 'red')
    expect(legalMoves.some(m => m.from.row === move!.from.row && m.from.col === move!.from.col && m.type === move!.type)).toBe(true)
  })

  it('returns null when no moves available', () => {
    const state = makeState({ board: emptyBoard(), sideDecided: true })
    const move = chooseMove(state, 'red', 'easy')
    expect(move).toBeNull()
  })

  it('is deterministic with fixed RNG', () => {
    const state = createInitialState()
    const rng = (() => { let s = 123; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xFFFFFFFF } })()
    const rng2 = (() => { let s = 123; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xFFFFFFFF } })()
    const m1 = chooseMove(state, 'red', 'easy', rng)
    const m2 = chooseMove(state, 'red', 'easy', rng2)
    expect(m1?.from).toEqual(m2?.from)
    expect(m1?.type).toEqual(m2?.type)
  })

  it('does not mutate input state', () => {
    const state = createInitialState()
    const boardBefore = JSON.stringify(state.board)
    chooseMove(state, 'red', 'easy')
    expect(JSON.stringify(state.board)).toBe(boardBefore)
  })
})

describe('AI - normal', () => {
  it('returns a legal move', () => {
    const state = createInitialState()
    const move = chooseMove(state, 'red', 'normal')
    expect(move).not.toBeNull()
    const legalMoves = getLegalMoves(state, 'red')
    expect(legalMoves.some(m => m.from.row === move!.from.row && m.from.col === move!.from.col)).toBe(true)
  })

  it('prefers capturing high-value piece', () => {
    const board = emptyBoard()
    board[0][0] = makePiece(0, 'red', 'chariot')
    board[0][1] = makePiece(1, 'black', 'chariot')  // equal rank, can capture (score 60)
    board[1][0] = makePiece(2, 'black', 'soldier')   // lower rank, can capture (score 20)
    board[3][7] = makePiece(3, 'black', 'soldier')
    const state = makeState({ board, currentTurn: 'red' })
    const move = chooseMove(state, 'red', 'normal')
    expect(move?.type).toBe('capture')
    expect(move?.captured?.rank).toBe('chariot')
  })

  it('does not mutate input state', () => {
    const state = createInitialState()
    const boardBefore = JSON.stringify(state.board)
    chooseMove(state, 'red', 'normal')
    expect(JSON.stringify(state.board)).toBe(boardBefore)
  })
})

describe('AI - hard', () => {
  it('returns a legal move', () => {
    const state = createInitialState()
    const move = chooseMove(state, 'red', 'hard')
    expect(move).not.toBeNull()
    const legalMoves = getLegalMoves(state, 'red')
    expect(legalMoves.some(m => m.from.row === move!.from.row && m.from.col === move!.from.col)).toBe(true)
  })

  it('completes within time limit', () => {
    const board = emptyBoard()
    board[0][0] = makePiece(0, 'red', 'general')
    board[0][1] = makePiece(1, 'black', 'advisor')
    board[1][0] = makePiece(2, 'black', 'chariot')
    board[3][7] = makePiece(3, 'black', 'soldier')
    const state = makeState({ board })
    const start = Date.now()
    chooseMove(state, 'red', 'hard')
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(5000)
  })

  it('does not mutate input state', () => {
    const board = emptyBoard()
    board[0][0] = makePiece(0, 'red', 'general')
    board[0][1] = makePiece(1, 'black', 'advisor')
    const state = makeState({ board })
    const boardBefore = JSON.stringify(state.board)
    chooseMove(state, 'red', 'hard')
    expect(JSON.stringify(state.board)).toBe(boardBefore)
  })
})
