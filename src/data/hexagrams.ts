/**
 * 十二月卦象数据
 * 基于皇极经世的十二消息卦
 */

import hexagramsData from './hexagrams.json'

export interface MonthHexagram {
  month: number
  branch: string
  name: string
  symbol: string
  unicode: string
  description: string
}

// 加载卦象数据
export const monthHexagrams: MonthHexagram[] = hexagramsData.monthHexagrams

// 根据月份索引获取卦象（索引从0开始）
export function getHexagramByIndex(index: number): MonthHexagram {
  return monthHexagrams[index % 12]
}

// 根据月份序号获取卦象（序号从1开始）
export function getHexagramByMonth(month: number): MonthHexagram {
  return monthHexagrams[(month - 1) % 12]
}

// 根据地支获取卦象
export function getHexagramByBranch(branch: string): MonthHexagram | undefined {
  return monthHexagrams.find(h => h.branch === branch)
}

// 格式化卦象显示（名称 + Unicode符号）
export function formatHexagram(hexagram: MonthHexagram): string {
  return `${hexagram.name}${hexagram.unicode}`
}

// 格式化卦象显示（带八卦符号）
export function formatHexagramWithSymbol(hexagram: MonthHexagram): string {
  return `${hexagram.name} ${hexagram.symbol}`
}

