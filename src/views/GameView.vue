<template>
  <div class="game-view">
    <h1 class="title">暗棋 Dark Chess</h1>

    <div v-if="!gameStarted" class="setup-panel">
      <div class="difficulty-selector">
        <label>難度 / Difficulty:</label>
        <div class="difficulty-buttons">
          <button
            v-for="d in difficulties"
            :key="d.value"
            :class="['diff-btn', { 'diff-btn--active': selectedDifficulty === d.value }]"
            @click="selectedDifficulty = d.value"
          >{{ d.label }}</button>
        </div>
      </div>
      <button class="start-btn" @click="startGame">開始遊戲 / Start Game</button>
    </div>

    <template v-if="gameStarted">
      <div class="status-bar">
        <div class="status-item">
          <span class="status-label">難度:</span>
          <span class="status-value">{{ difficultyLabel }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">回合:</span>
          <span class="status-value" :class="turnClass">
            {{ turnDisplay }}
          </span>
        </div>
        <div class="status-item" v-if="!state.sideDecided">
          <span class="status-hint">請翻開一枚棋子以決定陣營</span>
        </div>
      </div>

      <div v-if="state.gameOver" class="game-over">
        <div class="game-over__content">
          <h2>{{ winnerDisplay }}</h2>
          <button class="restart-btn" @click="restart">重新開始 / Restart</button>
        </div>
      </div>

      <Board
        :board="state.board"
        :is-selected="isSelected"
        :is-legal-target="isLegalTarget"
        @cell-click="handleCellClick"
      />

      <div class="piece-counts" v-if="state.sideDecided">
        <div class="piece-count piece-count--player">
          <span class="pc-label">玩家 ({{ state.playerSide === 'red' ? '紅' : '黑' }})</span>
          <div class="pc-captured">
            <span v-for="(p, i) in state.capturedByPlayer" :key="i" :class="`piece-icon piece-icon--${state.playerSide}`">
              {{ getPieceChar(p) }}
            </span>
          </div>
          <span class="pc-remaining">剩餘: {{ playerPiecesLeft }}</span>
        </div>
        <div class="piece-count piece-count--ai">
          <span class="pc-label">AI ({{ state.aiSide === 'red' ? '紅' : '黑' }})</span>
          <div class="pc-captured">
            <span v-for="(p, i) in state.capturedByAi" :key="i" :class="`piece-icon piece-icon--${state.aiSide}`">
              {{ getPieceChar(p) }}
            </span>
          </div>
          <span class="pc-remaining">剩餘: {{ aiPiecesLeft }}</span>
        </div>
      </div>

      <div v-if="aiThinking" class="ai-thinking">AI 思考中...</div>

      <button class="restart-btn-sm" @click="restart">重新開始 / Restart</button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Difficulty, Piece } from '../engine/types'
import Board from '../components/Board.vue'
import { useGameController } from '../composables/useGameController'

const difficulties = [
  { value: 'easy' as Difficulty, label: '簡單 Easy' },
  { value: 'normal' as Difficulty, label: '普通 Normal' },
  { value: 'hard' as Difficulty, label: '困難 Hard' },
]

const selectedDifficulty = ref<Difficulty>('normal')
const gameStarted = ref(false)

const {
  state,
  aiThinking,
  isPlayerTurn,
  currentDifficulty,
  handleCellClick,
  isLegalTarget,
  isSelected,
  resetGame,
} = useGameController(selectedDifficulty.value)

function startGame() {
  gameStarted.value = true
  resetGame(selectedDifficulty.value)
}

function restart() {
  resetGame(selectedDifficulty.value)
}

const difficultyLabel = computed(() => {
  return difficulties.find((d) => d.value === currentDifficulty.value)?.label ?? ''
})

const turnDisplay = computed(() => {
  if (!state.value.sideDecided) return '等待翻棋...'
  const isPlayer = isPlayerTurn.value
  const side = state.value.currentTurn === 'red' ? '紅方' : '黑方'
  return isPlayer ? `你的回合 (${side})` : `AI 回合 (${side})`
})

const turnClass = computed(() => {
  if (!state.value.sideDecided) return ''
  return isPlayerTurn.value ? 'turn--player' : 'turn--ai'
})

const winnerDisplay = computed(() => {
  if (!state.value.winner) return ''
  const isPlayerWin = state.value.winner === state.value.playerSide
  return isPlayerWin ? '🎉 玩家勝利！Player Wins!' : '💻 AI 勝利！AI Wins!'
})

const playerPiecesLeft = computed(() => {
  if (!state.value.sideDecided || !state.value.playerSide) return 16
  let count = 0
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 8; c++) {
      const p = state.value.board[r][c]
      if (p && p.side === state.value.playerSide) count++
    }
  }
  return count
})

const aiPiecesLeft = computed(() => {
  if (!state.value.sideDecided || !state.value.aiSide) return 16
  let count = 0
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 8; c++) {
      const p = state.value.board[r][c]
      if (p && p.side === state.value.aiSide) count++
    }
  }
  return count
})

function getPieceChar(piece: Piece): string {
  const chars: Record<string, Record<string, string>> = {
    red: { general: '帥', advisor: '仕', elephant: '相', chariot: '俥', horse: '傌', cannon: '炮', soldier: '兵' },
    black: { general: '將', advisor: '士', elephant: '象', chariot: '車', horse: '馬', cannon: '包', soldier: '卒' },
  }
  return chars[piece.side]?.[piece.rank] ?? '?'
}
</script>

<style scoped>
.game-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
  min-height: 100vh;
}

.title {
  font-size: 2rem;
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.setup-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 30px;
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.1);
}

.difficulty-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.difficulty-buttons {
  display: flex;
  gap: 10px;
}

.diff-btn {
  padding: 8px 20px;
  border: 2px solid #666;
  border-radius: 8px;
  background: transparent;
  color: #eee;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.diff-btn:hover {
  border-color: #ffd700;
  color: #ffd700;
}

.diff-btn--active {
  border-color: #ffd700;
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
}

.start-btn {
  padding: 12px 32px;
  background: #ffd700;
  color: #1a1a2e;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.start-btn:hover {
  background: #ffec60;
  transform: scale(1.05);
}

.status-bar {
  display: flex;
  gap: 24px;
  align-items: center;
  background: rgba(255,255,255,0.05);
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
}

.status-label {
  color: #999;
  margin-right: 6px;
}

.status-value {
  font-weight: bold;
  color: #fff;
}

.status-hint {
  color: #ffd700;
  font-style: italic;
}

.turn--player { color: #4caf50; }
.turn--ai { color: #f44336; }

.game-over {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.game-over__content {
  background: #1a1a2e;
  border: 3px solid #ffd700;
  border-radius: 16px;
  padding: 40px 60px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.game-over__content h2 {
  font-size: 2rem;
  color: #ffd700;
}

.restart-btn, .restart-btn-sm {
  padding: 10px 24px;
  background: #ffd700;
  color: #1a1a2e;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.restart-btn:hover, .restart-btn-sm:hover {
  background: #ffec60;
}

.piece-counts {
  display: flex;
  gap: 24px;
}

.piece-count {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 16px;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  min-width: 150px;
}

.pc-label {
  font-weight: bold;
  color: #ffd700;
}

.pc-captured {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-height: 24px;
}

.pc-remaining {
  font-size: 12px;
  color: #aaa;
}

.piece-icon {
  font-size: 16px;
}

.piece-icon--red { color: #ff6b6b; }
.piece-icon--black { color: #aaa; }

.ai-thinking {
  color: #ffd700;
  font-style: italic;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
