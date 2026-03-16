import { describe, it, expect } from 'vitest'
import { createInitialState } from '../../../src/engine/init'

describe('init', () => {
  it('creates a 4x8 board with 32 pieces', () => {
    const state = createInitialState()
    let count = 0
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 8; c++) {
        if (state.board[r][c] !== null) count++
      }
    }
    expect(count).toBe(32)
  })

  it('all pieces start face down', () => {
    const state = createInitialState()
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 8; c++) {
        const p = state.board[r][c]
        if (p) expect(p.faceUp).toBe(false)
      }
    }
  })

  it('has 16 red and 16 black pieces', () => {
    const state = createInitialState()
    let red = 0, black = 0
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 8; c++) {
        const p = state.board[r][c]
        if (p?.side === 'red') red++
        if (p?.side === 'black') black++
      }
    }
    expect(red).toBe(16)
    expect(black).toBe(16)
  })

  it('produces deterministic results with fixed RNG', () => {
    const rng = (() => { let s = 42; return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 } })()
    const rng2 = (() => { let s = 42; return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 } })()
    const s1 = createInitialState(rng)
    const s2 = createInitialState(rng2)
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 8; c++) {
        expect(s1.board[r][c]?.id).toBe(s2.board[r][c]?.id)
      }
    }
  })

  it('no pieces are duplicated', () => {
    const state = createInitialState()
    const ids = new Set<number>()
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 8; c++) {
        const p = state.board[r][c]
        if (p) {
          expect(ids.has(p.id)).toBe(false)
          ids.add(p.id)
        }
      }
    }
    expect(ids.size).toBe(32)
  })

  it('initial sideDecided is false', () => {
    const state = createInitialState()
    expect(state.sideDecided).toBe(false)
    expect(state.playerSide).toBeNull()
    expect(state.aiSide).toBeNull()
  })

  it('initial winner is null and gameOver is false', () => {
    const state = createInitialState()
    expect(state.winner).toBeNull()
    expect(state.gameOver).toBe(false)
  })
})
