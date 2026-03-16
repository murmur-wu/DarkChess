import { describe, it, expect } from 'vitest'
import { checkWinner, hasPiecesLeft, hasLegalMoves } from '../../../src/engine/win'
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

describe('hasPiecesLeft', () => {
  it('returns true when side has pieces', () => {
    const board = emptyBoard()
    board[0][0] = makePiece(0, 'red', 'general')
    const state = makeState({ board })
    expect(hasPiecesLeft(state, 'red')).toBe(true)
  })

  it('returns false when side has no pieces', () => {
    const board = emptyBoard()
    board[0][0] = makePiece(0, 'black', 'general')
    const state = makeState({ board })
    expect(hasPiecesLeft(state, 'red')).toBe(false)
  })

  it('counts face-down pieces too', () => {
    const board = emptyBoard()
    board[0][0] = makePiece(0, 'red', 'general', false)
    const state = makeState({ board })
    expect(hasPiecesLeft(state, 'red')).toBe(true)
  })
})

describe('checkWinner', () => {
  it('returns null when game has not started (sides not decided)', () => {
    const board = emptyBoard()
    board[0][0] = makePiece(0, 'red', 'general')
    const state = makeState({ board, sideDecided: false, playerSide: null, aiSide: null })
    expect(checkWinner(state)).toBeNull()
  })

  it('returns winning side when opponent has no pieces', () => {
    const board = emptyBoard()
    board[0][0] = makePiece(0, 'red', 'general')
    const state = makeState({ board })
    expect(checkWinner(state)).toBe('red')
  })

  it('returns null when both sides have pieces and have moves', () => {
    const board = emptyBoard()
    board[0][0] = makePiece(0, 'red', 'general')
    board[3][7] = makePiece(1, 'black', 'general')
    const state = makeState({ board })
    expect(checkWinner(state)).toBeNull()
  })

  it('does not declare winner when face-down pieces still exist', () => {
    const board = emptyBoard()
    board[0][0] = makePiece(0, 'red', 'soldier')
    board[0][1] = makePiece(1, 'red', 'advisor')
    board[1][0] = makePiece(2, 'red', 'advisor')
    board[2][2] = makePiece(3, 'black', 'general')
    board[3][7] = makePiece(4, 'red', 'soldier', false)
    const state = makeState({ board, currentTurn: 'red' })
    expect(checkWinner(state)).toBeNull()
  })
})
