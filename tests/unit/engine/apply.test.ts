import { describe, it, expect } from 'vitest'
import { applyMove } from '../../../src/engine/apply'
import { createInitialState } from '../../../src/engine/init'
import type { Board, GameState, Move, Piece } from '../../../src/engine/types'

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

describe('applyMove - flip', () => {
  it('flipping a piece makes it face-up', () => {
    const board = emptyBoard()
    const piece = makePiece(0, 'red', 'general', false)
    board[0][0] = piece
    const state = makeState({ board, sideDecided: false, playerSide: null, aiSide: null })
    const move: Move = { type: 'flip', from: { row: 0, col: 0 }, to: { row: 0, col: 0 }, piece }
    const newState = applyMove(state, move)
    expect(newState.board[0][0]?.faceUp).toBe(true)
  })

  it('first flip decides sides', () => {
    const state = createInitialState()
    const piece = state.board[0][0]!
    const move: Move = { type: 'flip', from: { row: 0, col: 0 }, to: { row: 0, col: 0 }, piece }
    const newState = applyMove(state, move)
    expect(newState.sideDecided).toBe(true)
    expect(newState.playerSide).toBe(piece.side)
    expect(newState.aiSide).toBe(piece.side === 'red' ? 'black' : 'red')
  })

  it('does not mutate original state', () => {
    const state = createInitialState()
    const piece = state.board[0][0]!
    const move: Move = { type: 'flip', from: { row: 0, col: 0 }, to: { row: 0, col: 0 }, piece }
    applyMove(state, move)
    expect(state.board[0][0]?.faceUp).toBe(false)
    expect(state.sideDecided).toBe(false)
  })

  it('switches turn after flip', () => {
    const board = emptyBoard()
    const piece = makePiece(0, 'red', 'general', false)
    board[0][0] = piece
    const state = makeState({ board })
    const move: Move = { type: 'flip', from: { row: 0, col: 0 }, to: { row: 0, col: 0 }, piece }
    const newState = applyMove(state, move)
    expect(newState.currentTurn).toBe('black')
  })
})

describe('applyMove - move', () => {
  it('moves piece to new position', () => {
    const board = emptyBoard()
    const piece = makePiece(0, 'red', 'general')
    board[0][0] = piece
    const state = makeState({ board })
    const move: Move = { type: 'move', from: { row: 0, col: 0 }, to: { row: 0, col: 1 }, piece }
    const newState = applyMove(state, move)
    expect(newState.board[0][0]).toBeNull()
    expect(newState.board[0][1]?.id).toBe(0)
  })

  it('switches turn after move', () => {
    const board = emptyBoard()
    const piece = makePiece(0, 'red', 'general')
    board[0][0] = piece
    const state = makeState({ board })
    const move: Move = { type: 'move', from: { row: 0, col: 0 }, to: { row: 0, col: 1 }, piece }
    const newState = applyMove(state, move)
    expect(newState.currentTurn).toBe('black')
  })

  it('does not mutate original state on move', () => {
    const board = emptyBoard()
    const piece = makePiece(0, 'red', 'general')
    board[0][0] = piece
    const state = makeState({ board })
    const move: Move = { type: 'move', from: { row: 0, col: 0 }, to: { row: 0, col: 1 }, piece }
    applyMove(state, move)
    expect(state.board[0][0]?.id).toBe(0)
    expect(state.board[0][1]).toBeNull()
  })
})

describe('applyMove - capture', () => {
  it('removes captured piece and moves attacker', () => {
    const board = emptyBoard()
    const attacker = makePiece(0, 'red', 'general')
    const target = makePiece(1, 'black', 'advisor')
    board[0][0] = attacker
    board[0][1] = target
    const state = makeState({ board })
    const move: Move = { type: 'capture', from: { row: 0, col: 0 }, to: { row: 0, col: 1 }, piece: attacker, captured: target }
    const newState = applyMove(state, move)
    expect(newState.board[0][0]).toBeNull()
    expect(newState.board[0][1]?.id).toBe(0)
  })

  it('tracks captured piece in capturedByPlayer when player captures', () => {
    const board = emptyBoard()
    const attacker = makePiece(0, 'red', 'general')
    const target = makePiece(1, 'black', 'advisor')
    board[0][0] = attacker
    board[0][1] = target
    const state = makeState({ board, playerSide: 'red', currentTurn: 'red' })
    const move: Move = { type: 'capture', from: { row: 0, col: 0 }, to: { row: 0, col: 1 }, piece: attacker, captured: target }
    const newState = applyMove(state, move)
    expect(newState.capturedByPlayer).toHaveLength(1)
    expect(newState.capturedByPlayer[0].id).toBe(1)
  })

  it('switches turn after capture', () => {
    const board = emptyBoard()
    const attacker = makePiece(0, 'red', 'general')
    const target = makePiece(1, 'black', 'advisor')
    board[0][0] = attacker
    board[0][1] = target
    const state = makeState({ board })
    const move: Move = { type: 'capture', from: { row: 0, col: 0 }, to: { row: 0, col: 1 }, piece: attacker, captured: target }
    const newState = applyMove(state, move)
    expect(newState.currentTurn).toBe('black')
  })
})

describe('invariants', () => {
  it('total pieces only decreases or stays same after a move', () => {
    const board = emptyBoard()
    const piece = makePiece(0, 'red', 'general')
    board[0][0] = piece
    const state = makeState({ board })
    const move: Move = { type: 'move', from: { row: 0, col: 0 }, to: { row: 0, col: 1 }, piece }
    const newState = applyMove(state, move)
    let oldCount = 0, newCount = 0
    for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) {
      if (state.board[r][c]) oldCount++
      if (newState.board[r][c]) newCount++
    }
    expect(newCount).toBeLessThanOrEqual(oldCount)
  })

  it('board remains 4x8 after moves', () => {
    const state = createInitialState()
    const piece = state.board[0][0]!
    const move: Move = { type: 'flip', from: { row: 0, col: 0 }, to: { row: 0, col: 0 }, piece }
    const newState = applyMove(state, move)
    expect(newState.board.length).toBe(4)
    for (const row of newState.board) {
      expect(row.length).toBe(8)
    }
  })
})
