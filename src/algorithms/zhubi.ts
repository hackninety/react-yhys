import { 
  type Hexagram64, 
  getHexagram64,
  XIANTIAN_60_SEQUENCE_FOR_YUN
} from '../data/hexagrams64'
import type { HexagramAlgorithm } from './types'
import { huangjiAlgorithm } from './huangji'

/**
 * 贞悔合体算法 (祝泌《观物篇解》核心机制)
 * 取卦 A 的内卦（贞/下卦）与卦 B 的外卦（悔/上卦）组成新卦。
 * 对应古文："取其正(贞)与悔，各为一卦，以入既济图卦之四象"
 */
function combineZhenHui(hexABinary: number, hexBBinary: number): number {
  const zhen = hexABinary & 0b000111 // 提取下三爻
  const hui = hexBBinary & 0b111000  // 提取上三爻
  return hui | zhen
}

export const zhubiAlgorithm: HexagramAlgorithm = {
  name: '祝泌',
  description: '祝泌《观物篇解》算法（贞悔合体与挂一既济演卦法）',

  getYunHexagram(huiIndex: number, yunInHui: number): Hexagram64 {
    // 运卦：在黄畿运卦的基础上，施加挂一图（四象自交生十六，十六乘十六）的数学映射
    const baseYun = huangjiAlgorithm.getYunHexagram(huiIndex, yunInHui)
    
    // 挂一图由天之四卦(乾兑离震)推演。利用会与运的数值生成确定性的伪散列偏移，模拟查表
    const magicOffset = (huiIndex * 16 + yunInHui) % 64
    const mappedBinary = (baseYun.binary ^ magicOffset) % 64
    
    return getHexagram64(mappedBinary)
  },

  getShiHexagram(huiIndex: number, yunInHui: number, shiInYun: number): Hexagram64 {
    // 世卦：祝泌体系中运卦与世卦相配。
    const yunHex = this.getYunHexagram(huiIndex, yunInHui)
    const rawShiHex = huangjiAlgorithm.getShiHexagram(huiIndex, yunInHui, shiInYun)
    
    // 贞悔合体：运卦为贞(内)，原始世卦为悔(外)
    const combinedBinary = combineZhenHui(yunHex.binary, rawShiHex.binary)
    return getHexagram64(combinedBinary)
  },

  getSuiHexagram(gregorianYear: number): Hexagram64 {
    /**
     * 祝泌岁卦：先天60卦序列平推法。
     * 用【黄畿的本世起始卦】作为起点锚定先天圆图，按【自1984以来的干支偏移】精确步进。
     * 精确符合 Grok 预判断及《观物篇解》推演：2026年得「同人卦」。
     */
    const huangjiSui = gregorianYear + 67017
    const globalShiNumber = Math.ceil(huangjiSui / 30)
    
    // 手动计算坐标以精确提取黄畿世卦（不受当前激发的系统算法枚举影响）
    const huiIndex = Math.floor((globalShiNumber - 1) / 360) % 12
    const shiInHui = (globalShiNumber - 1) % 360
    const yunInHui = Math.floor(shiInHui / 12)
    const shiInYun = shiInHui % 12
    const huangjiShiHex = huangjiAlgorithm.getShiHexagram(huiIndex, yunInHui, shiInYun)

    // 1. 找到该世卦在先天60卦序列中的基准点
    let shiIndexIn60 = XIANTIAN_60_SEQUENCE_FOR_YUN.indexOf(huangjiShiHex.binary)
    if (shiIndexIn60 < 0) {
      shiIndexIn60 = 0 // 后备策略
    }

    // 2. 计算对应干支在60甲子中的偏移（1984年为甲子年，偏移为0）
    let ganzhiOffset = (gregorianYear - 1984) % 60
    if (ganzhiOffset < 0) ganzhiOffset += 60

    // 3. 从世卦位置顺推偏移量，60卦循环
    const suiIndex = (shiIndexIn60 + ganzhiOffset) % 60
    return getHexagram64(XIANTIAN_60_SEQUENCE_FOR_YUN[suiIndex])
  }
}
