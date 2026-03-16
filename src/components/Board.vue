<template>
  <div class="board-container">
    <div class="board-labels-top">
      <div class="label-corner"></div>
      <div v-for="col in 8" :key="col" class="col-label">{{ col }}</div>
    </div>
    <div class="board-with-row-labels">
      <div class="row-labels">
        <div v-for="row in 4" :key="row" class="row-label">{{ 'ABCD'[row - 1] }}</div>
      </div>
      <div class="board">
        <div v-for="(rowCells, rowIdx) in board" :key="rowIdx" class="board-row">
          <Cell
            v-for="(cell, colIdx) in rowCells"
            :key="colIdx"
            :piece="cell"
            :row="rowIdx"
            :col="colIdx"
            :selected="isSelected({ row: rowIdx, col: colIdx })"
            :isLegal="isLegalTarget({ row: rowIdx, col: colIdx })"
            @click="$emit('cell-click', { row: rowIdx, col: colIdx })"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Board, Position } from '../engine/types'
import Cell from './Cell.vue'

interface Props {
  board: Board
  isSelected: (pos: Position) => boolean
  isLegalTarget: (pos: Position) => boolean
}

defineProps<Props>()
defineEmits<{ 'cell-click': [pos: Position] }>()
</script>

<style scoped>
.board-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.board-labels-top {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.label-corner {
  width: 30px;
}

.col-label {
  width: 70px;
  text-align: center;
  font-weight: bold;
  color: #ddd;
  font-size: 14px;
}

.board-with-row-labels {
  display: flex;
  align-items: flex-start;
}

.row-labels {
  display: flex;
  flex-direction: column;
  margin-right: 4px;
}

.row-label {
  height: 70px;
  width: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #ddd;
  font-size: 14px;
}

.board {
  display: flex;
  flex-direction: column;
  border: 3px solid #8b7355;
  border-radius: 4px;
  overflow: hidden;
}

.board-row {
  display: flex;
}
</style>
