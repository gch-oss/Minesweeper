<script setup lang="ts">
import { isDev, toggleDev } from '~/composables'
import { GamePlay } from '~/composables/logic'

const play = new GamePlay(6, 6, 3)

const now = $(useNow()) // 查一下这是$的作用 transform
const timeMS = $computed(() => Math.round(((play.state.value.endMS || +now) - play.state.value.startMS) / 1000)) // Y因为now是一个ref,所以要用+号转换成数字

useStorage('vuesweeper-state', play.state) // 可持续化
const state = $computed(() => play.board)

const mineRest = $computed(() => {
  if (!play.state.value.mineGenerated)
    return play.mines
  return play.blocks.reduce((a, b) => a + (b.mine ? 1 : 0) - (b.flagged ? 1 : 0), 0)
})

function newGame(difficulty: 'easy' | 'medium' | 'hard') {
  switch (difficulty) {
    case 'easy':
      play.reset(9, 9, 10)
      break
    case 'medium':
      play.reset(16, 16, 40)
      break
    case 'hard':
      play.reset(16, 30, 99)
      break
  }
}

watchEffect(() => {
  play.checkstatus()
})
</script>

<template>
  <div>
    Minesweeper

    <div flex="~ gap1 justify-center p4">
      <button btn @click="play.reset()">
        New Game
      </button>
      <button btn @click="newGame('easy')">
        Easy
      </button>
      <button btn @click="newGame('medium')">
        Medium
      </button>
      <button btn @click="newGame('hard')">
        Hard
      </button>
    </div>

    <div mt-3 flex justify-center gap-10>
      <div flex="~ gap-1" items-center justify-center text-xl font-mono>
        <div i-carbon-timer />
        {{ timeMS }}
      </div>
      <div flex="~ gap-1" items-center justify-center text-xl font-mono>
        <div i-mdi-mine />
        {{ mineRest }}
      </div>
    </div>

    <div w-full overflow-auto p5>
      <div
        v-for="row, y in state"
        :key="y"
        flex="~"
        ma w-max items-center justify-center
      >
        <MineBlock
          v-for="block, x in row" :key="x"
          :block="block"
          @click="play.onClick(block)"
          @dblclick="play.autoExpand(block)"
          @contextmenu.prevent="play.onRightClick(block)"
        />
      </div>
    </div>

    <div flex="~ gap-1" justify-center>
      <button btn @click="isDev = !isDev">
        {{ isDev ? 'DEV' : 'NORMAL' }}
      </button>
    </div>
    <Confetti :passed="play.state.value.status === 'won'" />
  </div>
</template>
