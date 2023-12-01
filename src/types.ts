export interface BlockState {
  x: number // x 坐标
  y: number // y 坐标
  revealed: boolean // 是否翻开
  mine?: boolean // 是否炸弹
  flagged?: boolean // 是否插旗
  adjacentMines: number // 周围炸弹数量
}
