import type { HexagramAlgorithm } from './types'
import { huangjiAlgorithm } from './huangji'
import { zhubiAlgorithm } from './zhubi'

type AlgorithmName = '黄畿' | '祝泌'

/**
 * 祝泌算法开关（默认关闭）
 * 祝泌算法暂未对照祝泌《皇极经世书解》/《观物篇解》原文校验：
 * 其岁卦以 1984 甲子所在世卦「鼎」为固定锚点、60 年周期循环平推，
 * 规则来自第三方数据交叉验证，尚未经原文确认。
 * （黄畿算法已对照黄畿注原文 84 个文献锚点校验，故作为默认算法。）
 * 待原文整理校验后，设为 true 可重新启用祝泌算法切换。
 */
export const ENABLE_ZHUBI = false

const ALGORITHM_KEY = 'yhys-algorithm'

// 从 localStorage 获取初始算法
function getInitialAlgorithm(): HexagramAlgorithm {
  if (!ENABLE_ZHUBI) return huangjiAlgorithm
  try {
    const saved = localStorage.getItem(ALGORITHM_KEY)
    if (saved === '祝泌') return zhubiAlgorithm
  } catch (e) {
    // 忽略 localStorage 错误
  }
  return huangjiAlgorithm
}

let currentAlgorithm = getInitialAlgorithm()
const listeners = new Set<() => void>()

export function getCurrentAlgorithm(): HexagramAlgorithm {
  return currentAlgorithm
}

export function getAlgorithmSnapshot(): string {
  return currentAlgorithm.name
}

export function switchAlgorithm(name: AlgorithmName) {
  if (!ENABLE_ZHUBI && name === '祝泌') return
  currentAlgorithm = name === '黄畿' ? huangjiAlgorithm : zhubiAlgorithm
  try {
    localStorage.setItem(ALGORITHM_KEY, name)
  } catch (e) {
    // ignore
  }
  listeners.forEach(fn => fn())
}

export function subscribeAlgorithm(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
