import type { HexagramAlgorithm } from './types'
import { huangjiAlgorithm } from './huangji'
import { zhubiAlgorithm } from './zhubi'

type AlgorithmName = '黄畿' | '祝泌'

/**
 * 祝泌算法开关（默认关闭）
 * 当前祝泌算法的岁卦计算使用了1984年甲子世卦作为硬编码锚点，
 * 并非从经卦动态推导，导致与黄畿算法存在2年偏差（仅在1984-2043巻合一致）。
 * 暂时关闭，等原文整理后再重新分析两派差异。
 * 设为 true 可重新启用祝泌算法切换。
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
