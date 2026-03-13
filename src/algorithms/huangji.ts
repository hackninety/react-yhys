import {
  type Hexagram64,
  getHexagram64,
  changeYao,
  XIANTIAN_60_SEQUENCE_FOR_YUN,
} from '../data/hexagrams64'
import type { HexagramAlgorithm } from './types'

/** 四正卦二进制值 */
const FOUR_PRINCIPAL = [63, 0, 18, 45] // 乾坤坎离

/**
 * 先天64卦序（含四正卦），用于四正卦 fallback 定位
 * 从 hexagrams64.ts 的 XIANTIAN_64_SEQUENCE_FOR_YUN 复制核心逻辑
 */
const XIANTIAN_64_SEQUENCE = [
  62,30,46,14,54,22,38,6,58,26,42,10,50,18,34,2,
  60,28,44,12,52,20,36,4,56,24,40,8,48,16,32,0,
  1,33,17,49,9,41,25,57,5,37,21,53,13,45,29,61,
  3,35,19,51,11,43,27,59,7,39,23,55,15,47,31
]

/**
 * 在先天60卦序中查找位置，处理四正卦 fallback
 *
 * 当变爻结果为四正卦（乾坤坎离）时，先天60卦序中找不到（indexOf=-1）。
 * 此时回退到先天64卦序定位，然后映射回60序中的等效位置。
 */
function findPosIn60(binary: number): number {
  const pos = XIANTIAN_60_SEQUENCE_FOR_YUN.indexOf(binary)
  if (pos >= 0) return pos

  // 四正卦 fallback：在64序中找位置，然后计算60序中的等效位置
  const pos64 = XIANTIAN_64_SEQUENCE.indexOf(binary)
  if (pos64 < 0) return 0 // 安全兜底

  // 计算64序位置之前有几个四正卦，减去即为60序位置
  let principalsBefore = 0
  for (let i = 0; i < pos64; i++) {
    if (FOUR_PRINCIPAL.includes(XIANTIAN_64_SEQUENCE[i])) {
      principalsBefore++
    }
  }
  return pos64 - principalsBefore
}

export const huangjiAlgorithm: HexagramAlgorithm = {
  name: '黄畿',
  description: '黄畿算法：运卦变爻→经卦（管60年）→挨六十卦次→年卦（每年一卦）',

  getYunHexagram(huiIndex: number, yunInHui: number): Hexagram64 {
    const huiStartIndex = ((huiIndex % 12) * 5 + 30) % 60
    const masterHexagramIndexInHui = Math.floor((yunInHui % 30) / 6)
    const globalIndex = (huiStartIndex + masterHexagramIndexInHui) % 60
    
    const masterBinary = XIANTIAN_60_SEQUENCE_FOR_YUN[globalIndex]
    const yunInGroup = yunInHui % 6
    const yaoToChange = yunInGroup + 1
    const yunBinary = changeYao(masterBinary, yaoToChange)
    
    return getHexagram64(yunBinary)
  },

  getShiHexagram(huiIndex: number, yunInHui: number, shiInYun: number): Hexagram64 {
    const yunHexagram = this.getYunHexagram(huiIndex, yunInHui)
    const jiaziShiIndex = Math.floor(shiInYun / 2)
    const yaoToChange = jiaziShiIndex + 1
    const shiBinary = changeYao(yunHexagram.binary, yaoToChange)
    return getHexagram64(shiBinary)
  },

  /**
   * 黄畿年卦（岁卦）—— 挨六十卦次
   *
   * 原文（L1154-1156）：
   * "从小畜分乾之四，挨六十卦次，求之即得其直年为何卦。
   *  如甲子小畜，乙丑大壮，顺次数去，至甲辰随也。"
   *
   * 算法：运卦→变爻→经卦(管60年) → 经卦位置起，挨60卦次→年卦(1年1卦)
   */
  getSuiHexagram(gregorianYear: number): Hexagram64 {
    const huangjiSui = gregorianYear + 67017

    const globalShiNumber = Math.ceil(huangjiSui / 30)
    const huiIndex = Math.floor((globalShiNumber - 1) / 360) % 12
    const shiInHui = (globalShiNumber - 1) % 360
    const yunInHui = Math.floor(shiInHui / 12)

    const yunHexagram = this.getYunHexagram(huiIndex, yunInHui)

    const yunStartSui = (Math.floor((huangjiSui - 1) / 360) * 360) + 1
    const yearInYun = huangjiSui - yunStartSui  // 0-359

    // 经卦：运卦变爻，每卦管60年
    const jingIndex = Math.floor(yearInYun / 60)
    const jingBinary = changeYao(yunHexagram.binary, jingIndex + 1)

    // 年卦：从经卦位置起，挨六十卦次
    const jingPos = findPosIn60(jingBinary)
    const yearInJing = yearInYun % 60
    const suiIdx = (jingPos + yearInJing) % 60

    return getHexagram64(XIANTIAN_60_SEQUENCE_FOR_YUN[suiIdx])
  },

  /**
   * 月经卦 —— 岁卦变爻，每卦管60天（"一六为经"）
   *
   * 原文 L1144："大要一六为经，六六为纬"
   * L4869："以一日当一年，一时当一月"
   */
  getYueJingHexagram(gregorianYear: number, dayOfYear: number): Hexagram64 {
    const suiHexagram = this.getSuiHexagram(gregorianYear)
    const dayIndex = Math.max(0, Math.min(dayOfYear - 1, 359))

    const jingIndex = Math.floor(dayIndex / 60) // 0-5
    const jingBinary = changeYao(suiHexagram.binary, jingIndex + 1)

    return getHexagram64(jingBinary)
  },

  /**
   * 旬纬卦 —— 月经卦变爻，每卦管10天（"六六为纬"）
   *
   * 与宏观层"经卦→纬卦(管10年)"完全同构
   */
  getXunWeiHexagram(gregorianYear: number, dayOfYear: number): Hexagram64 {
    const suiHexagram = this.getSuiHexagram(gregorianYear)
    const dayIndex = Math.max(0, Math.min(dayOfYear - 1, 359))

    // 月经卦
    const jingIndex = Math.floor(dayIndex / 60)
    const jingBinary = changeYao(suiHexagram.binary, jingIndex + 1)

    // 旬纬卦：月经卦变爻，每10天一变
    const dayInJing = dayIndex % 60
    const weiIndex = Math.floor(dayInJing / 10) // 0-5
    const weiBinary = changeYao(jingBinary, weiIndex + 1)

    return getHexagram64(weiBinary)
  },

  /**
   * 日卦 —— 从月经卦位置起，挨六十卦次（每天1卦）
   *
   * 与宏观层"经卦位置起，挨60卦次→年卦"完全同构
   */
  getRiHexagram(gregorianYear: number, dayOfYear: number): Hexagram64 {
    const suiHexagram = this.getSuiHexagram(gregorianYear)
    const dayIndex = Math.max(0, Math.min(dayOfYear - 1, 359))

    // 月经卦
    const jingIndex = Math.floor(dayIndex / 60)
    const jingBinary = changeYao(suiHexagram.binary, jingIndex + 1)

    // 日卦：从月经卦位置起，挨六十卦次
    const jingPos = findPosIn60(jingBinary)
    const dayInJing = dayIndex % 60
    const riIdx = (jingPos + dayInJing) % 60

    return getHexagram64(XIANTIAN_60_SEQUENCE_FOR_YUN[riIdx])
  },

  /**
   * 时经卦 —— 日卦变爻，每2时辰一变（"一时当一月"）
   *
   * 1日=12时辰=360分(皇极分)，日卦管360分
   * 日卦变6爻 → 6个时经卦，每卦管60分(=2时辰=4小时)
   *
   * @param shichenIndex 时辰索引 0-11（子=0, 丑=1, ..., 亥=11）
   */
  getShiJingHexagram(gregorianYear: number, dayOfYear: number, shichenIndex: number): Hexagram64 {
    const riHexagram = this.getRiHexagram!(gregorianYear, dayOfYear)

    // 每2时辰 = 1个时经卦
    const jingIndex = Math.floor(shichenIndex / 2) // 0-5
    const jingBinary = changeYao(riHexagram.binary, jingIndex + 1)

    return getHexagram64(jingBinary)
  }
}
