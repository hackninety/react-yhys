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
 * 运势另归一到 0–100 分（normalizeScore），便于阅读与跨视图比较。
 * 数据来源为已对照《皇极经世书》黄畿注原文校验的算法，非占位。
 */
import {
  getYunHexagramByGlobal,
  getShiHexagramByYear,
  type Hexagram64,
} from '../data/hexagrams64'
import { getCurrentAlgorithm } from '../algorithms/registry'
import { SUI_TO_GREGORIAN_OFFSET } from './calendar'
import { HEXAGRAM_INTERPRETATIONS } from '../data/hexagramInterpretations'

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

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

function popcount(binary: number): number {
  let c = 0
  for (let i = 0; i < 6; i++) if (binary & (1 << i)) c++
  return c
}

/** 单卦的运势标量（原始值，各标量量纲不同） */
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

/** 逐年加权运势（原始量纲）：运级为基线，世级次之，岁卦作细纹 */
export function yearFortune(gregorianYear: number, metric: FortuneMetric): number {
  const { yun, shi, sui } = yearHexagrams(gregorianYear)
  return W_YUN * hexScore(yun, metric) + W_SHI * hexScore(shi, metric) + W_SUI * hexScore(sui, metric)
}

/** 加权后运势的理论上下界（用于归一） */
export function fortuneDomain(metric: FortuneMetric): { min: number; max: number } {
  const m = FORTUNE_METRICS.find(x => x.key === metric)!
  return { min: m.min, max: m.max }
}

/** 归一到 0–100 分（按标量理论域，跨视图可比） */
export function normalizeScore(weighted: number, metric: FortuneMetric): number {
  const { min, max } = fortuneDomain(metric)
  return Math.round(clamp(((weighted - min) / (max - min)) * 100, 3, 97))
}

/** 某年的 0–100 运势分 */
export function yearScore(gregorianYear: number, metric: FortuneMetric): number {
  return normalizeScore(yearFortune(gregorianYear, metric), metric)
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

const HUI_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const YEARS_PER_HUI = 10800 // 30运 × 12世 × 30年

/** 某公历年所在的会索引（0=子…11=亥）与阴阳消长相 */
export function yearHui(gregorianYear: number): { index: number; name: string; phase: '阳长' | '阴消' } {
  const hj = gregorianYear + SUI_TO_GREGORIAN_OFFSET
  const index = Math.floor((hj - 1) / YEARS_PER_HUI) % 12
  return { index, name: HUI_NAMES[index], phase: index <= 5 ? '阳长' : '阴消' }
}

/**
 * 某段时期的解读因素（依《皇极经世书》黄畿注文本），用代表年（区间末）的卦。
 * 供 K 线详情面板展示，使曲线可解释而非仅数值。
 */
export function periodFactors(gregorianYear: number, metric: FortuneMetric, showScore = true): string[] {
  const { yun, shi, sui } = yearHexagrams(gregorianYear)
  const hui = yearHui(gregorianYear)
  const f: string[] = []

  const sc = (h: Hexagram64) => (showScore ? `(${hexScore(h, metric)})` : '')
  const yunNote = HEXAGRAM_INTERPRETATIONS[yun.name]?.huangJiNote
  f.push(`运卦 ${yun.name}${sc(yun)}${yunNote ? ` · ${yunNote}` : ''}`)
  f.push(`世卦 ${shi.name}${sc(shi)} · 管30年`)
  f.push(`岁卦 ${sui.name}${sc(sui)} · 挨六十卦次`)
  f.push(`${hui.name}会 · ${hui.phase === '阳长' ? '前六会·阳长而升' : '后六会·阴消而降'}`)
  // 开物用数：寅会中至戌会中；信史所在的巳/午会均在其内
  if (hui.index >= 2 && hui.index <= 10) f.push('开物用数期 · 万物生养')
  if (isChimaHongyang(gregorianYear)) f.push(`${yearGanZhi(gregorianYear)} · 赤马红羊·丙丁火劫`)
  return f
}

export interface Candle {
  startYear: number
  endYear: number // 含
  label: string
  open: number // 0–100
  close: number // 0–100
  high: number // 0–100
  low: number // 0–100
  mean: number // 0–100
  median: number // 0–100
  delta: number // close − open
  scores: number[] // 逐年 0–100 分
  chimaYears: number[] // 区间内的赤马红羊年
  factors: string[] // 解读因素（代表年）
}

function median(arr: number[]): number {
  const s = [...arr].sort((a, b) => a - b)
  const n = s.length
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}

const fmtYear = (y: number) => (y < 0 ? `前${1 - y}` : `${y}`)

/**
 * 聚合成蜡烛序列（0–100 分）。
 * 蜡烛体＝周期间趋势（开＝上一周期收＝上一周期均分，收＝本周期均分），
 * 影线＝本周期内逐年极值。年级(unitYears=1)时每烛即一年，供折线用。
 *
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
  const a0 = Math.min(startYear, endYear)
  const b0 = Math.max(startYear, endYear)

  // 先算每根蜡烛的周期均分与逐年分
  interface Raw { a: number; b: number; scores: number[]; mean: number; chima: number[] }
  const raws: Raw[] = []
  for (let a = a0; a <= b0; a += unitYears) {
    const b = Math.min(a + unitYears - 1, b0)
    const scores: number[] = []
    const chima: number[] = []
    for (let y = a; y <= b; y++) {
      scores.push(yearScore(y, metric))
      if (isChimaHongyang(y)) chima.push(y)
    }
    raws.push({ a, b, scores, mean: scores.reduce((s, v) => s + v, 0) / scores.length, chima })
  }

  return raws.map((r, i) => {
    const open = i > 0 ? raws[i - 1].mean : r.scores[0]
    const close = r.mean
    const high = Math.max(open, ...r.scores)
    const low = Math.min(open, ...r.scores)
    const label = unitYears === 1 ? fmtYear(r.a) : `${fmtYear(r.a)}–${fmtYear(r.b)}`
    return {
      startYear: r.a,
      endYear: r.b,
      label,
      open: Math.round(open),
      close: Math.round(close),
      high: Math.round(high),
      low: Math.round(low),
      mean: Math.round(close),
      median: Math.round(median(r.scores)),
      delta: Math.round(close - open),
      scores: r.scores,
      chimaYears: r.chima,
      factors: periodFactors(r.b, metric),
    }
  })
}

export interface YunBand {
  startYear: number
  endYear: number
  yunName: string
}

/** 区间内的运级分段（每 360 年一运），附运卦名，用于 K 线背景分段 */
export function yunBands(startYear: number, endYear: number): YunBand[] {
  const bands: YunBand[] = []
  let y = yunStartYear(startYear)
  while (y <= endYear) {
    const s = Math.max(y, startYear)
    const e = Math.min(y + 359, endYear)
    bands.push({ startYear: s, endYear: e, yunName: yearHexagrams(y).yun.name })
    y += 360
  }
  return bands
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
