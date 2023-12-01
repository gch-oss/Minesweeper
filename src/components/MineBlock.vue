<script setup lang="ts">
import type { BlockState } from '~/types'
import { isDev } from '~/composables'

defineProps<{ block: BlockState }>()

// 每个数字的颜色
const numberColors = [
  'text-transparent',
  'text-blue-500',
  'text-green-500',
  'text-yellow-500',
  'text-orange-500',
  'text-red-500',
  'text-purple-500',
  'text-pink-500',
  'text-teal-500',
]

function getBlockClass(block: BlockState) {
  if (block.flagged)
    return 'bg-gray-500/10'
  if (!block.revealed) // 没有打开的时候不给颜色，设置一个灰色
    return 'bg-gray-500/10  hover:bg-gray/10'

  return block.mine
    ? 'bg-red-500/50'
    : numberColors[block.adjacentMines]
}
</script>

<template>
  <button
    flex="~"

    h-10 min-h-10 min-w-8 w-8 items-center justify-center m="0.2"
    border="1 gray-400/20"
    :class="getBlockClass(block)"
  >
    <template v-if="block.flagged">
      <div i-mdi-flag text-red />
    </template>
    <template v-else-if="block.revealed || isDev">
      <!-- 这里如果被掀开了才会显示每个block里面是炸弹还是数字 -->
      <div v-if="block.mine" i-mdi-mine />
      <div v-else font-600>
        {{ block.adjacentMines }}
      </div>
    </template>
  </button>
</template>
