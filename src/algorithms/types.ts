import type { Hexagram64 } from '../data/hexagrams64'

/**
 * 皇极经世不同流派的算法接口。
 * 注意：根据目前的文献考证，两派在"运卦"和"世卦"层面通常有更复杂的衍生规则
 * 统一定义在此接口，使得外部组件调用方式一致。
 */
export interface HexagramAlgorithm {
  name: '黄畿' | '祝泌'
  description: string

  /**
   * 计算运卦（星卦）
   * @param huiIndex 会的索引（0-11，对应子到亥）
   * @param yunInHui 运在会内的序号（0-29）
   */
  getYunHexagram(huiIndex: number, yunInHui: number): Hexagram64

  /**
   * 计算世卦（辰卦）
   * @param huiIndex 会的索引（0-11）
   * @param yunInHui 运在会内的序号（0-29）
   * @param shiInYun 世在运内的序号（0-11）
   */
  getShiHexagram(huiIndex: number, yunInHui: number, shiInYun: number): Hexagram64

  /**
   * 计算岁卦（年卦/值年卦）
   * @param gregorianYear 公历年份
   */
  getSuiHexagram(gregorianYear: number): Hexagram64
}
