import { computed, ref } from 'vue'
import type { Difficulty, GameState, Move, Position } from '../engine/types'
import { createInitialState } from '../engine/init'
import { getLegalMovesForPiece } from '../engine/moves'
import { applyMove } from '../engine/apply'
import { chooseMove } from '../ai/ai'

export function useGameController(difficulty: Difficulty = 'normal') {
  const state = ref<GameState>(createInitialState())
  const selectedPos = ref<Position | null>(null)
  const legalMoves = ref<Move[]>([])
  const aiThinking = ref(false)
  const currentDifficulty = ref<Difficulty>(difficulty)

  const isPlayerTurn = computed(() => {
    if (!state.value.sideDecided) return true
    return state.value.currentTurn === state.value.playerSide
  })

  function resetGame(diff?: Difficulty) {
    if (diff) currentDifficulty.value = diff
    state.value = createInitialState()
    selectedPos.value = null
    legalMoves.value = []
    aiThinking.value = false
  }

  function getLegalMovesAtPos(pos: Position): Move[] {
    return getLegalMovesForPiece(state.value, pos)
  }

  async function handleCellClick(pos: Position) {
    if (state.value.gameOver) return
    if (!isPlayerTurn.value) return

    const cell = state.value.board[pos.row][pos.col]
    const { sideDecided, playerSide } = state.value

    if (!sideDecided) {
      if (cell && !cell.faceUp) {
        const move: Move = { type: 'flip', from: pos, to: pos, piece: cell }
        executePlayerMove(move)
      }
      return
    }

    if (selectedPos.value) {
      const lm = legalMoves.value.find(
        (m) => m.to.row === pos.row && m.to.col === pos.col
      )
      if (lm) {
        selectedPos.value = null
        legalMoves.value = []
        executePlayerMove(lm)
        return
      }

      selectedPos.value = null
      legalMoves.value = []
    }

    if (cell && !cell.faceUp) {
      const move: Move = { type: 'flip', from: pos, to: pos, piece: cell }
      executePlayerMove(move)
      return
    }

    if (cell && cell.faceUp && cell.side === playerSide) {
      selectedPos.value = pos
      legalMoves.value = getLegalMovesAtPos(pos)
      return
    }
  }

  function executePlayerMove(move: Move) {
    state.value = applyMove(state.value, move)
    selectedPos.value = null
    legalMoves.value = []

    if (!state.value.gameOver) {
      triggerAiMove()
    }
  }

  async function triggerAiMove() {
    if (!state.value.sideDecided) return
    if (state.value.currentTurn !== state.value.aiSide) return
    if (state.value.gameOver) return

    aiThinking.value = true

    await new Promise((r) => setTimeout(r, 300))

    const move = chooseMove(state.value, state.value.aiSide!, currentDifficulty.value)
    if (move) {
      state.value = applyMove(state.value, move)
    }

    aiThinking.value = false
  }

  function isLegalTarget(pos: Position): boolean {
    return legalMoves.value.some((m) => m.to.row === pos.row && m.to.col === pos.col)
  }

  function isSelected(pos: Position): boolean {
    return selectedPos.value?.row === pos.row && selectedPos.value?.col === pos.col
  }

  return {
    state,
    selectedPos,
    legalMoves,
    aiThinking,
    isPlayerTurn,
    currentDifficulty,
    handleCellClick,
    isLegalTarget,
    isSelected,
    resetGame,
  }
}
