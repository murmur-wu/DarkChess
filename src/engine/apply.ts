import type { GameState, Move, Side } from './types'
import { checkWinner } from './win'

function cloneBoard(board: GameState['board']): GameState['board'] {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)))
}

export function applyMove(state: GameState, move: Move): GameState {
  const board = cloneBoard(state.board)
  let { playerSide, aiSide, sideDecided, currentTurn, capturedByPlayer, capturedByAi } = state

  if (move.type === 'flip') {
    const piece = board[move.from.row][move.from.col]!
    board[move.from.row][move.from.col] = { ...piece, faceUp: true }

    if (!sideDecided) {
      playerSide = piece.side
      aiSide = piece.side === 'red' ? 'black' : 'red'
      sideDecided = true
    }
  } else if (move.type === 'move') {
    const piece = board[move.from.row][move.from.col]!
    board[move.from.row][move.from.col] = null
    board[move.to.row][move.to.col] = piece
  } else if (move.type === 'capture') {
    const piece = board[move.from.row][move.from.col]!
    const captured = move.captured!
    board[move.from.row][move.from.col] = null
    board[move.to.row][move.to.col] = piece

    if (sideDecided) {
      if (currentTurn === playerSide) {
        capturedByPlayer = [...capturedByPlayer, captured]
      } else {
        capturedByAi = [...capturedByAi, captured]
      }
    }
  }

  const nextTurn: Side = currentTurn === 'red' ? 'black' : 'red'

  const newState: GameState = {
    board,
    currentTurn: nextTurn,
    playerSide,
    aiSide,
    sideDecided,
    winner: null,
    gameOver: false,
    capturedByPlayer,
    capturedByAi,
  }

  const winner = checkWinner(newState)
  if (winner !== null) {
    newState.winner = winner
    newState.gameOver = true
  }

  return newState
}
