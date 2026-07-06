/**
 * 国运运势标量 —— 把每年的元会运世卦转成可绘 K 线的数值
 *
 * 三种运势标量（可切换），均以「运卦(0.5)＋世卦(0.3)＋岁卦(0.2)」加权：
 * 运/世级定基线（大势），岁卦作烛身细纹（"挨六十卦次"的位置指针）。
 *
 * - yang    阳爻数：卦中阳爻数 0–6。最简单可复现，但混淆"阳的数量"与
 *           "势头"——如姤(5阳)其实是"一阴生·盛极转衰"。
 * - bigua   辟卦位置（消息相位）：初爻为阳＝阳息上升相→+阳爻数(复+1…乾+6)；
 *           初爻为阴＝阴消下降相→阳爻数−6(坤−6…姤−1)。能把姤正确读成刚转衰(−1)。
 *           属一阶消息投影（以初爻定阳长/阴消），非严格卦变。
 * - auspice 卦德吉凶：据卦辞/彖象基调与皇极治乱读法给每卦一个吉凶指数
 *           (−4…+5)。最忠于邵雍用法，但属可调的解读表（见 AUSPICE）。
 *
 * 数据来源为已对照《皇极经世书》黄畿注原文校验的算法，非占位。
 */
import {
  getYunHexagramByGlobal,
  getShiHexagramByYear,
  type Hexagram64,
} from '../data/hexagrams64'
import { getCurrentAlgorithm } from '../algorithms/registry'
import { SUI_TO_GREGORIAN_OFFSET } from './calendar'

export type FortuneMetric = 'yang' | 'bigua' | 'auspice'

export interface MetricMeta {
  key: FortuneMetric
  label: string
  min: number
  max: number
  desc: string
}

export const FORTUNE_METRICS: MetricMeta[] = [
  { key: 'yang', label: '阳爻数', min: 0, max: 6, desc: '卦中阳爻数（0–6）。最直观，但姤(5阳)会误读为近盛。' },
  { key: 'bigua', label: '辟卦位置', min: -6, max: 6, desc: '消息相位：阳息上升相取正、阴消下降相取负。姤=−1（刚转衰）。' },
  { key: 'auspice', label: '卦德吉凶', min: -4, max: 5, desc: '据卦辞与皇极治乱的吉凶指数（−4…+5），最忠于用法，可调。' },
]

/** 卦德吉凶表：按卦名给吉凶指数（−4 大凶 … +5 大吉）。解读性质，可按需调整。 */
const AUSPICE: Record<string, number> = {
  乾: 5, 坤: 0, 屯: -1, 蒙: 0, 需: 2, 讼: -2, 师: 0, 比: 2,
  小畜: 1, 履: 2, 泰: 5, 否: -4, 同人: 3, 大有: 4, 谦: 4, 豫: 2,
  随: 2, 蛊: -1, 临: 3, 观: 1, 噬嗑: 0, 贲: 1, 剥: -4, 复: 3,
  无妄: 1, 大畜: 3, 颐: 1, 大过: -3, 坎: -4, 离: 2, 咸: 3, 恒: 2,
  遁: -2, 大壮: 3, 晋: 3, 明夷: -3, 家人: 2, 睽: -1, 蹇: -3, 解: 1,
  损: 1, 益: 3, 夬: 2, 姤: -1, 萃: 2, 升: 2, 困: -3, 井: 1,
  革: 1, 鼎: 3, 震: 1, 艮: 0, 渐: 2, 归妹: -1, 丰: 2, 旅: -1,
  巽: 1, 兑: 2, 涣: 1, 节: 1, 中孚: 3, 小过: -1, 既济: 1, 未济: 0,
}

function popcount(binary: number): number {
  let c = 0
  for (let i = 0; i < 6; i++) if (binary & (1 << i)) c++
  return c
}

/** 单卦的运势标量 */
export function hexScore(hex: Hexagram64, metric: FortuneMetric): number {
  const b = hex.binary
  switch (metric) {
    case 'yang':
      return popcount(b)
    case 'bigua': {
      const n = popcount(b)
      const yangBottom = (b & 1) === 1 // 初爻为阳＝阳息上升相
      return yangBottom ? n : n - 6
    }
    case 'auspice':
      return AUSPICE[hex.name] ?? 0
  }
}

/** 某公历年的运/世/岁卦（运/世级算法无关，岁卦走当前算法） */
export function yearHexagrams(gregorianYear: number): {
  yun: Hexagram64
  shi: Hexagram64
  sui: Hexagram64
} {
  const hj = gregorianYear + SUI_TO_GREGORIAN_OFFSET
  const globalShi = Math.ceil(hj / 30)
  const globalYun = Math.ceil(globalShi / 12)
  return {
    yun: getYunHexagramByGlobal(globalYun),
    shi: getShiHexagramByYear(hj),
    sui: getCurrentAlgorithm().getSuiHexagram(gregorianYear),
  }
}

const W_YUN = 0.5
const W_SHI = 0.3
const W_SUI = 0.2

/** 逐年加权运势：运级为基线，世级次之，岁卦作细纹 */
export function yearFortune(gregorianYear: number, metric: FortuneMetric): number {
  const { yun, shi, sui } = yearHexagrams(gregorianYear)
  return W_YUN * hexScore(yun, metric) + W_SHI * hexScore(shi, metric) + W_SUI * hexScore(sui, metric)
}

/** 加权后运势的理论上下界（用于绘图 y 轴域） */
export function fortuneDomain(metric: FortuneMetric): { min: number; max: number } {
  const m = FORTUNE_METRICS.find(x => x.key === metric)!
  return { min: m.min, max: m.max }
}

// 天干地支（赤马红羊判定；甲子＝公元4年）
const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

export function yearGanZhi(gregorianYear: number): string {
  const g = ((gregorianYear - 4) % 10 + 10) % 10
  const z = ((gregorianYear - 4) % 12 + 12) % 12
  return GAN[g] + ZHI[z]
}

/** 赤马红羊劫：丙午 / 丁未年 */
export function isChimaHongyang(gregorianYear: number): boolean {
  const gz = yearGanZhi(gregorianYear)
  return gz === '丙午' || gz === '丁未'
}

export interface Candle {
  startYear: number
  endYear: number // 含
  label: string
  open: number
  close: number
  high: number
  low: number
  mean: number
  median: number
  values: number[] // 逐年运势
  chimaYears: number[] // 区间内的赤马红羊年
}

function median(arr: number[]): number {
  const s = [...arr].sort((a, b) => a - b)
  const n = s.length
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}

/**
 * 聚合成蜡烛序列。
 * @param startYear 起始公历年（含）
 * @param endYear   结束公历年（含）
 * @param unitYears 每根蜡烛跨年数：1＝年(线)，30＝世，360＝运
 * @param metric    运势标量
 */
export function buildCandles(
  startYear: number,
  endYear: number,
  unitYears: number,
  metric: FortuneMetric,
): Candle[] {
  const candles: Candle[] = []
  for (let a = startYear; a <= endYear; a += unitYears) {
    const b = Math.min(a + unitYears - 1, endYear)
    const values: number[] = []
    const chimaYears: number[] = []
    for (let y = a; y <= b; y++) {
      values.push(yearFortune(y, metric))
      if (isChimaHongyang(y)) chimaYears.push(y)
    }
    const fmt = (y: number) => (y < 0 ? `前${1 - y}` : `${y}`)
    const label = unitYears === 1 ? fmt(a) : `${fmt(a)}–${fmt(b)}`
    candles.push({
      startYear: a,
      endYear: b,
      label,
      open: values[0],
      close: values[values.length - 1],
      high: Math.max(...values),
      low: Math.min(...values),
      mean: values.reduce((s, v) => s + v, 0) / values.length,
      median: median(values),
      values,
      chimaYears,
    })
  }
  return candles
}

/** 便于按"运/世"整段对齐：给定公历年，返回其所在运的首年（公历） */
export function yunStartYear(gregorianYear: number): number {
  const hj = gregorianYear + SUI_TO_GREGORIAN_OFFSET
  const globalYun = Math.ceil(Math.ceil(hj / 30) / 12)
  const startHj = (globalYun - 1) * 360 + 1
  return startHj - SUI_TO_GREGORIAN_OFFSET
}

/** 给定公历年，返回其所在世的首年（公历） */
export function shiStartYear(gregorianYear: number): number {
  const hj = gregorianYear + SUI_TO_GREGORIAN_OFFSET
  const globalShi = Math.ceil(hj / 30)
  const startHj = (globalShi - 1) * 30 + 1
  return startHj - SUI_TO_GREGORIAN_OFFSET
}

/** 便捷标签：该卦名 + 标量值 */
export function describeHex(hex: Hexagram64, metric: FortuneMetric): string {
  return `${hex.name}(${hexScore(hex, metric)})`
}
