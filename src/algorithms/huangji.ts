import {
  type Hexagram64,
  getHexagram64,
  changeYao,
  isFourPrincipalHexagram,
  XIANTIAN_60_SEQUENCE_FOR_YUN,
} from '../data/hexagrams64'
import type { HexagramAlgorithm } from './types'

export const huangjiAlgorithm: HexagramAlgorithm = {
  name: '黄畿',
  description: '黄畿算法，使用单爻变与「气以六变」，并要求四正卦主动退进',

  getYunHexagram(huiIndex: number, yunInHui: number): Hexagram64 {
    const huiStartIndex = ((huiIndex % 12) * 5 + 30) % 60
    const masterHexagramIndexInHui = Math.floor((yunInHui % 30) / 6)
    const globalIndex = (huiStartIndex + masterHexagramIndexInHui) % 60
    
    // 获取主卦的二进制值
    const masterBinary = XIANTIAN_60_SEQUENCE_FOR_YUN[globalIndex]
    
    // 计算该运在主卦组内的位置（0-5，对应变初爻到上爻）
    const yunInGroup = yunInHui % 6
    
    const yaoToChange = yunInGroup + 1 // 1-6
    const yunBinary = changeYao(masterBinary, yaoToChange)
    
    return getHexagram64(yunBinary)
  },

  getShiHexagram(huiIndex: number, yunInHui: number, shiInYun: number): Hexagram64 {
    // 获取该运的运卦
    const yunHexagram = this.getYunHexagram(huiIndex, yunInHui)
    
    // 计算这是该运内的第几个"甲子世"（每2世为一单位，范围0-5）
    const jiaziShiIndex = Math.floor(shiInYun / 2)
    const yaoToChange = jiaziShiIndex + 1
    
    const shiBinary = changeYao(yunHexagram.binary, yaoToChange)
    return getHexagram64(shiBinary)
  },

  getSuiHexagram(gregorianYear: number): Hexagram64 {
    const huangjiSui = gregorianYear + 67017

    // ⚠️ 不能调用 hexagrams64.ts 中的 getShiHexagramByYear()，
    // 因为它已被改造为分发调用 getCurrentAlgorithm().getShiHexagram()，
    // 切换到祝泌时会导致拿到祝泌的世卦而非黄畿的！
    // 因此这里内联计算世卦坐标，直接调用 this.getShiHexagram。
    const globalShiNumber = Math.ceil(huangjiSui / 30)
    const huiIndex = Math.floor((globalShiNumber - 1) / 360) % 12
    const shiInHui = (globalShiNumber - 1) % 360
    const yunInHui = Math.floor(shiInHui / 12)
    const shiInYun = shiInHui % 12
    const shiHexagram = this.getShiHexagram(huiIndex, yunInHui, shiInYun)

    // 六十甲子偏移（0-59），以1984甲子年为锚点
    let ganzhiOffset = (gregorianYear - 1984) % 60
    if (ganzhiOffset < 0) ganzhiOffset += 60

    // 预计算所有有效变爻结果（剔除四正卦）
    const validSuiBinaries: number[] = []
    for (let i = 1; i <= 6; i++) {
      const candidate = changeYao(shiHexagram.binary, i)
      if (!isFourPrincipalHexagram(candidate)) {
        validSuiBinaries.push(candidate)
      }
    }

    // 用取模确保序列平滑流转，连续年份绝不重复
    const suiBinary = validSuiBinaries[ganzhiOffset % validSuiBinaries.length]
    return getHexagram64(suiBinary)
  }
}
