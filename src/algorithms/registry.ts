import type { HexagramAlgorithm } from './types'
import { huangjiAlgorithm } from './huangji'
import { zhubiAlgorithm } from './zhubi'

type AlgorithmName = '黄畿' | '祝泌'

const ALGORITHM_KEY = 'yhys-algorithm'

// 从 localStorage 获取初始算法
function getInitialAlgorithm(): HexagramAlgorithm {
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
