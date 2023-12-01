import type { BlockState } from '~/types'

const directions = [
  [1, 1],
  [1, 0],
  [1, -1],
  [0, 1],
  [0, -1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
]

type GameStatus = 'play' | 'won' | 'lost'

interface status {
  board: BlockState[][]
  mineGenerated: boolean
  status: GameStatus
  startMS: number
  endMS?: number
}

export class GamePlay {
  state = ref() as Ref<status>

  constructor(
    public width: number,
    public height: number,
    public mines: number,
  ) {
    this.reset()
  }

  get board() {
    return this.state.value.board
  }

  get blocks() {
    return this.state.value.board.flat() as BlockState[]
  }

  // 重置游戏
  reset(width = this.width, height = this.height, mines = this.mines) {
    this.width = width
    this.height = height
    this.mines = mines

    this.state.value = {
      startMS: +Date.now(),
      mineGenerated: false,
      status: 'play',
      board: Array.from({ length: this.height }, (_, y) =>
        Array.from({ length: this.width }, (_, x): BlockState => ({
          x,
          y,
          adjacentMines: 0,
          revealed: false,
        }))),

    }
  }

  random(min: number, max: number) {
    return Math.random() * (max - min) + min
  }

  randomInt(min: number, max: number) {
    return Math.round(this.random(min, max))
  }

  // 生成炸弹,传进去的是按钮点击的那个格子block
  generateMines(state: BlockState[][], initial: BlockState) {
    const placeRandom = () => {
      const x = this.randomInt(0, this.width - 1)
      const y = this.randomInt(0, this.height - 1)
      const block = state[y][x]
      if (Math.abs(initial.x - block.x) <= 1 && Math.abs(initial.y - block.y) <= 1)
        return false
      if (block.mine)
        return false

      block.mine = true
      return true
    }

    Array.from({ length: this.mines }, () => null)
      .forEach(() => {
        let placed = false
        while (!placed)
          placed = placeRandom()
      })
    // for (const row of state) {
    //   for (const block of row) {
    //     if (Math.abs(initial.x - block.x) < 1)
    //       continue
    //     if (Math.abs(initial.y - block.y) < 1)
    //       continue
    //     block.mine = Math.random() < 0.2 // 十分之一的概率会有炸弹
    //   }
    // }
    this.updateNumbers() // 调用算炸弹数量函数
  }

  // 算每个格子边上有几个炸弹
  updateNumbers() {
    this.board.forEach((row) => {
      row.forEach((block) => {
        if (block.mine)
          return
        this.getSiblings(block)
          .forEach((b) => {
            if (b.mine)
              block.adjacentMines += 1
          })
      })
    })
  }

  // 在扫雷里面点到0的时候会自动展开周围的格子
  expandZero(block: BlockState) {
    if (block.adjacentMines) // 如果周围有炸弹，或者已经被翻开，不做处理
      return
    // 如果周围没有炸弹，就展开周围的格子
    this.getSiblings(block).forEach((s) => {
      if (!s.revealed) {
        s.revealed = true
        this.expandZero(s)
      }
    })
  }

  onRightClick(block: BlockState) {
    if (this.state.value.status !== 'play')
      return
    if (block.revealed)
      return
    block.flagged = !block.flagged
  }

  onClick(block: BlockState) {
    if (this.state.value.status !== 'play')
      return
    if (!this.state.value.mineGenerated) {
      this.generateMines(this.board, block) // 1.调用生成炸弹函数
      this.state.value.mineGenerated = true
    }
    block.revealed = true // 2.点击后设置翻开的值为true
    if (block.mine) {
      this.onGameOver('lost')
      return
    }
    this.expandZero(block) // 3.调用展开周围格子的函数.如果周围没有炸弹就会翻开
  }

  getSiblings(block: BlockState) {
    return directions.map(([dx, dy]) => {
      const x2 = block.x + dx
      const y2 = block.y + dy
      if (x2 < 0 || x2 >= this.width || y2 < 0 || y2 >= this.height)
        return undefined

      return this.board[y2][x2]
    })
      .filter(Boolean) as BlockState[]
  }

  showAllMines() {
    this.board.flat().forEach((i) => {
      if (i.mine)
        i.revealed = true
    })
  }

  checkstatus() {
    if (!this.state.value.mineGenerated) // 如果没有生成就不判断
      return
    const blocks = this.board.flat()

    if (blocks.every(block => block.revealed || (block.flagged && block.mine))) {
      if (blocks.some(block => block.flagged && !block.mine))
        this.onGameOver('lost')

      else
        this.onGameOver('won')
    }
  }

  autoExpand(block: BlockState) {
    const siblings = this.getSiblings(block)
    const flags = siblings.reduce((a, b) => a + (b.flagged ? 1 : 0), 0)
    const notRevealed = siblings.reduce((a, b) => a + (!b.revealed && !b.flagged ? 1 : 0), 0)
    if (flags === block.adjacentMines) {
      siblings.forEach((i) => {
        i.revealed = true
        if (i.mine)
          this.onGameOver('lost')
      })
    }
    const missingFlags = block.adjacentMines - flags
    if (notRevealed === missingFlags) {
      siblings.forEach((i) => {
        if (!i.revealed && !i.flagged)
          i.flagged = true
      })
    }
  }

  // 游戏失败的判断
  onGameOver(status: GameStatus) {
    this.state.value.status = status
    this.state.value.endMS = +Date.now()
    if (status === 'lost')
      this.showAllMines() // 如果游戏失败，就展示所有的炸弹
  }
}
