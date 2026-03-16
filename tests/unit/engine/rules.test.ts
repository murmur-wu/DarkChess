import { describe, it, expect } from 'vitest'
import { canCapture, cannonCanCapture, inBounds } from '../../../src/engine/rules'
import type { Board, Piece } from '../../../src/engine/types'

function makePiece(side: Piece['side'], rank: Piece['rank'], faceUp = true): Piece {
  return { id: 0, side, rank, faceUp }
}

function emptyBoard(): Board {
  return Array.from({ length: 4 }, () => Array(8).fill(null))
}

describe('canCapture', () => {
  it('general can capture general', () => {
    expect(canCapture(makePiece('red', 'general'), makePiece('black', 'general'))).toBe(true)
  })

  it('soldier can capture general (special rule)', () => {
    expect(canCapture(makePiece('red', 'soldier'), makePiece('black', 'general'))).toBe(true)
  })

  it('general cannot capture soldier', () => {
    expect(canCapture(makePiece('red', 'general'), makePiece('black', 'soldier'))).toBe(false)
  })

  it('cannot capture own piece', () => {
    expect(canCapture(makePiece('red', 'general'), makePiece('red', 'soldier'))).toBe(false)
  })

  it('cannot capture face-down piece', () => {
    const target = makePiece('black', 'soldier')
    target.faceUp = false
    expect(canCapture(makePiece('red', 'general'), target)).toBe(false)
  })

  it('cannot capture with face-down attacker', () => {
    const attacker = makePiece('red', 'general')
    attacker.faceUp = false
    expect(canCapture(attacker, makePiece('black', 'soldier'))).toBe(false)
  })

  it('cannon cannot use normal capture', () => {
    expect(canCapture(makePiece('red', 'cannon'), makePiece('black', 'soldier'))).toBe(false)
  })
})

describe('cannonCanCapture', () => {
  it('captures over exactly one piece in same row', () => {
    const board = emptyBoard()
    const cannon = makePiece('red', 'cannon')
    const screen = makePiece('black', 'soldier')
    const target = makePiece('black', 'general')
    board[0][0] = cannon
    board[0][3] = screen
    board[0][6] = target
    expect(cannonCanCapture(board, { row: 0, col: 0 }, { row: 0, col: 6 }, cannon)).toBe(true)
  })

  it('cannot capture with zero pieces between', () => {
    const board = emptyBoard()
    const cannon = makePiece('red', 'cannon')
    const target = makePiece('black', 'general')
    board[0][0] = cannon
    board[0][5] = target
    expect(cannonCanCapture(board, { row: 0, col: 0 }, { row: 0, col: 5 }, cannon)).toBe(false)
  })

  it('cannot capture with two pieces between', () => {
    const board = emptyBoard()
    const cannon = makePiece('red', 'cannon')
    board[0][0] = cannon
    board[0][2] = makePiece('black', 'soldier')
    board[0][4] = makePiece('black', 'soldier')
    board[0][6] = makePiece('black', 'general')
    expect(cannonCanCapture(board, { row: 0, col: 0 }, { row: 0, col: 6 }, cannon)).toBe(false)
  })

  it('captures over exactly one piece in same col', () => {
    const board = emptyBoard()
    const cannon = makePiece('red', 'cannon')
    const screen = makePiece('black', 'soldier')
    const target = makePiece('black', 'general')
    board[0][0] = cannon
    board[1][0] = screen
    board[3][0] = target
    expect(cannonCanCapture(board, { row: 0, col: 0 }, { row: 3, col: 0 }, cannon)).toBe(true)
  })

  it('cannot capture own piece', () => {
    const board = emptyBoard()
    const cannon = makePiece('red', 'cannon')
    const screen = makePiece('black', 'soldier')
    const target = makePiece('red', 'soldier')
    board[0][0] = cannon
    board[0][3] = screen
    board[0][6] = target
    expect(cannonCanCapture(board, { row: 0, col: 0 }, { row: 0, col: 6 }, cannon)).toBe(false)
  })

  it('cannot capture face-down piece', () => {
    const board = emptyBoard()
    const cannon = makePiece('red', 'cannon')
    const screen = makePiece('black', 'soldier')
    const target = makePiece('black', 'general')
    target.faceUp = false
    board[0][0] = cannon
    board[0][3] = screen
    board[0][6] = target
    expect(cannonCanCapture(board, { row: 0, col: 0 }, { row: 0, col: 6 }, cannon)).toBe(false)
  })

  it('cannot capture from non-row-or-col position', () => {
    const board = emptyBoard()
    const cannon = makePiece('red', 'cannon')
    const target = makePiece('black', 'general')
    board[0][0] = cannon
    board[2][3] = target
    expect(cannonCanCapture(board, { row: 0, col: 0 }, { row: 2, col: 3 }, cannon)).toBe(false)
  })
})

describe('inBounds', () => {
  it('returns true for valid positions', () => {
    expect(inBounds({ row: 0, col: 0 })).toBe(true)
    expect(inBounds({ row: 3, col: 7 })).toBe(true)
    expect(inBounds({ row: 2, col: 4 })).toBe(true)
  })

  it('returns false for out-of-bounds positions', () => {
    expect(inBounds({ row: -1, col: 0 })).toBe(false)
    expect(inBounds({ row: 4, col: 0 })).toBe(false)
    expect(inBounds({ row: 0, col: -1 })).toBe(false)
    expect(inBounds({ row: 0, col: 8 })).toBe(false)
  })
})
