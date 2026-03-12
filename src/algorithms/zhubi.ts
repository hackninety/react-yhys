import {
  type Hexagram64,
  getHexagram64,
  XIANTIAN_60_SEQUENCE_FOR_YUN,
} from '../data/hexagrams64'
import type { HexagramAlgorithm } from './types'
import { huangjiAlgorithm } from './huangji'

/**
 * 祝泌《观物篇解》算法实现
 *
 * 经考证，祝泌体系与黄畿体系的差异**集中在岁卦层面**：
 *   - 黄畿：世卦逐爻变 + 四正卦避让 + 甲子取模
 *   - 祝泌：先天60卦序列平推法（从世卦位置开始，逐年步进）
 *
 * 运卦和世卦在两派中使用相同的推演规则（层层单爻变）。
 *
 * 验证数据（来自多个独立来源交叉确认）：
 *   1984=鼎, 1985=恒, 1986=巽, 1987=井, 1988=蛊,
 *   1994=涣, 1995=蒙, 1996=师, 1997=遁, 1998=咸,
 *   1999=旅, 2000=小过, 2001=渐, 2002=蹇, 2003=艮,
 *   2025=革, **2026=同人** ← 精确命中
 */
export const zhubiAlgorithm: HexagramAlgorithm = {
  name: '祝泌',
  description: '祝泌《观物篇解》算法（先天60卦序列平推岁卦法）',

  getYunHexagram(huiIndex: number, yunInHui: number): Hexagram64 {
    // 运卦：两派一致，与黄畿相同
    return huangjiAlgorithm.getYunHexagram(huiIndex, yunInHui)
  },

  getShiHexagram(huiIndex: number, yunInHui: number, shiInYun: number): Hexagram64 {
    // 世卦：两派一致，与黄畿相同
    return huangjiAlgorithm.getShiHexagram(huiIndex, yunInHui, shiInYun)
  },

  getSuiHexagram(gregorianYear: number): Hexagram64 {
    /**
     * 祝泌岁卦：先天60卦序列平推法
     *
     * 核心规则（经16+个已知年卦与60年完整验证确认）：
     * 1. 以甲子年（1984）所在世的世卦「鼎」在先天60卦序列中的位置为固定起点
     * 2. 从该位置开始，按公历年份偏移 (year - 1984) 逐年步进
     * 3. 60卦序列循环使用（恰好对应60甲子周期）
     *
     * 注意：平推在整个60年甲子周期内连续，不受30年"世"边界重置影响。
     *
     * 与黄畿爻变法的区别：
     * - 黄畿：世卦→变爻→四正避让→取模（2026=大有）
     * - 祝泌：世卦→定位先天圆图→平推步进（2026=同人）
     */
    // 找到甲子年（1984）所在世的世卦
    const jiaziHuangji = 1984 + 67017 // 69001
    const jiaziShiNum = Math.ceil(jiaziHuangji / 30)
    const jiaziHuiIndex = Math.floor((jiaziShiNum - 1) / 360) % 12
    const jiaziShiInHui = (jiaziShiNum - 1) % 360
    const jiaziYunInHui = Math.floor(jiaziShiInHui / 12)
    const jiaziShiInYun = jiaziShiInHui % 12
    const jiaziShiHex = huangjiAlgorithm.getShiHexagram(jiaziHuiIndex, jiaziYunInHui, jiaziShiInYun)

    // 1. 世卦在先天60卦序列中的起始位置
    let startIndexIn60 = XIANTIAN_60_SEQUENCE_FOR_YUN.indexOf(jiaziShiHex.binary)
    if (startIndexIn60 < 0) {
      startIndexIn60 = 0
    }

    // 2. 计算年份偏移（相对于甲子年 1984），在整个60年周期内连续步进
    let yearOffset = (gregorianYear - 1984) % 60
    if (yearOffset < 0) yearOffset += 60

    // 3. 平推
    const suiIndex = (startIndexIn60 + yearOffset) % 60
    return getHexagram64(XIANTIAN_60_SEQUENCE_FOR_YUN[suiIndex])
  }
}
