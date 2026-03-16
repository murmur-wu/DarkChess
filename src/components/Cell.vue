<template>
  <div
    class="cell"
    :class="{
      'cell--empty': !piece,
      'cell--facedown': piece && !piece.faceUp,
      'cell--selected': selected,
      'cell--legal': isLegal,
      [`cell--${piece?.side}`]: piece?.faceUp,
    }"
    @click="$emit('click')"
  >
    <div v-if="piece && !piece.faceUp" class="piece piece--hidden">
      <span class="piece__symbol">🀄</span>
    </div>
    <div v-else-if="piece && piece.faceUp" class="piece" :class="`piece--${piece.side}`">
      <span class="piece__symbol">{{ getPieceSymbol(piece) }}</span>
    </div>
    <div v-if="isLegal && !piece" class="legal-dot"></div>
  </div>
</template>

<script setup lang="ts">
import type { Piece } from '../engine/types'

interface Props {
  piece: Piece | null
  selected?: boolean
  isLegal?: boolean
  row: number
  col: number
}

withDefaults(defineProps<Props>(), {
  selected: false,
  isLegal: false,
})

defineEmits<{ click: [] }>()

function getPieceSymbol(piece: Piece): string {
  const symbols: Record<string, Record<string, string>> = {
    red: {
      general: '帥',
      advisor: '仕',
      elephant: '相',
      chariot: '俥',
      horse: '傌',
      cannon: '炮',
      soldier: '兵',
    },
    black: {
      general: '將',
      advisor: '士',
      elephant: '象',
      chariot: '車',
      horse: '馬',
      cannon: '包',
      soldier: '卒',
    },
  }
  return symbols[piece.side]?.[piece.rank] ?? '?'
}
</script>

<style scoped>
.cell {
  width: 70px;
  height: 70px;
  border: 1px solid #8b7355;
  background: #d4a96a;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.15s ease;
  border-radius: 4px;
}

.cell:hover {
  background: #e0b87a;
  box-shadow: 0 0 8px rgba(255, 200, 100, 0.5);
}

.cell--empty {
  background: #c9995a;
}

.cell--selected {
  background: #90ee90 !important;
  box-shadow: 0 0 12px rgba(0, 255, 0, 0.6);
}

.cell--legal {
  background: #b0d0b0;
}

.piece {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  font-weight: bold;
  user-select: none;
}

.piece--hidden {
  background: #2c2c6c;
  border: 3px solid #6666bb;
  font-size: 24px;
}

.piece--red {
  background: radial-gradient(circle at 35% 35%, #ff6b6b, #cc0000);
  border: 3px solid #ff0000;
  color: #fff;
}

.piece--black {
  background: radial-gradient(circle at 35% 35%, #555, #111);
  border: 3px solid #444;
  color: #fff;
}

.piece__symbol {
  font-size: 22px;
  line-height: 1;
}

.legal-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(0, 200, 0, 0.6);
}
</style>
