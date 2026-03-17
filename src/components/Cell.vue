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
    <div
      v-if="piece"
      class="piece-flipper"
      :class="{ 'piece-flipper--flipping': isFlipping }"
    >
      <div v-if="!piece.faceUp" class="piece piece--hidden">
        <span class="piece__symbol piece__symbol--hidden"></span>
      </div>
      <div v-else class="piece" :class="`piece--${piece.side}`">
        <span class="piece__symbol">{{ getPieceSymbol(piece) }}</span>
      </div>
    </div>
    <div v-if="isLegal && !piece" class="legal-dot"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Piece } from '../engine/types'

interface Props {
  piece: Piece | null
  selected?: boolean
  isLegal?: boolean
  row: number
  col: number
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  isLegal: false,
})

defineEmits<{ click: [] }>()

const isFlipping = ref(false)
// Must match the `flip-piece` keyframe animation duration (0.5s)
const FLIP_ANIMATION_DURATION_MS = 500

watch(
  () => props.piece?.faceUp,
  (newVal, oldVal) => {
    if (oldVal === false && newVal === true) {
      isFlipping.value = true
      setTimeout(() => {
        isFlipping.value = false
      }, FLIP_ANIMATION_DURATION_MS)
    }
  },
)

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

/* Flip animation container */
.piece-flipper {
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 400px;
}

.piece-flipper--flipping {
  animation: flip-piece 0.5s ease-in-out;
}

@keyframes flip-piece {
  0% {
    transform: rotateY(0deg) scale(1);
  }
  40% {
    transform: rotateY(90deg) scale(0.9);
  }
  60% {
    transform: rotateY(-90deg) scale(0.9);
  }
  100% {
    transform: rotateY(0deg) scale(1);
  }
}

/* Base piece shape — wooden disc */
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
  /* Wooden disc base */
  background:
    radial-gradient(ellipse at 38% 32%, rgba(255, 220, 180, 0.55) 0%, transparent 55%),
    radial-gradient(ellipse at 62% 68%, rgba(80, 30, 0, 0.35) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, #c47a45 0%, #8b4513 55%, #5c2a00 100%);
  box-shadow:
    0 4px 10px rgba(0, 0, 0, 0.45),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 -3px 6px rgba(0, 0, 0, 0.25),
    inset 0 2px 4px rgba(255, 200, 140, 0.3);
  border: 2px solid rgba(100, 40, 0, 0.5);
}

/* Face-down: same wooden disc, no text mark */
.piece--hidden {
  background:
    radial-gradient(ellipse at 38% 32%, rgba(255, 220, 180, 0.55) 0%, transparent 55%),
    radial-gradient(ellipse at 62% 68%, rgba(80, 30, 0, 0.35) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, #c47a45 0%, #8b4513 55%, #5c2a00 100%);
  box-shadow:
    0 4px 10px rgba(0, 0, 0, 0.45),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 -3px 6px rgba(0, 0, 0, 0.25),
    inset 0 2px 4px rgba(255, 200, 140, 0.3);
  border: 2px solid rgba(100, 40, 0, 0.5);
}

/* Red-side pieces: warm red tint over the wood */
.piece--red {
  background:
    radial-gradient(ellipse at 38% 32%, rgba(255, 220, 180, 0.45) 0%, transparent 55%),
    radial-gradient(ellipse at 62% 68%, rgba(120, 0, 0, 0.35) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, #d4603a 0%, #a02020 55%, #6b0000 100%);
  box-shadow:
    0 4px 10px rgba(0, 0, 0, 0.45),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 -3px 6px rgba(0, 0, 0, 0.25),
    inset 0 2px 4px rgba(255, 160, 120, 0.3);
  border: 2px solid rgba(160, 20, 20, 0.6);
  color: #ffe8c0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
}

/* Black-side pieces: dark wood tint */
.piece--black {
  background:
    radial-gradient(ellipse at 38% 32%, rgba(200, 200, 200, 0.25) 0%, transparent 55%),
    radial-gradient(ellipse at 62% 68%, rgba(0, 0, 0, 0.45) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, #555 0%, #2a2a2a 55%, #0d0d0d 100%);
  box-shadow:
    0 4px 10px rgba(0, 0, 0, 0.55),
    0 2px 4px rgba(0, 0, 0, 0.4),
    inset 0 -3px 6px rgba(0, 0, 0, 0.35),
    inset 0 2px 4px rgba(180, 180, 180, 0.15);
  border: 2px solid rgba(60, 60, 60, 0.7);
  color: #e8e8e8;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.piece__symbol {
  font-size: 22px;
  line-height: 1;
}

.piece__symbol--hidden {
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 200, 140, 0.25);
}

.legal-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(0, 200, 0, 0.6);
}
</style>
