import type { Hexagram64 } from '../data/hexagrams64'

/**
 * 皇极经世不同流派的算法接口。
 * 统一定义在此接口，使得外部组件调用方式一致。
 *
 * 校验状态：黄畿算法已对照《皇极经世书》黄畿注原文校验（84 个文献锚点）；
 * 祝泌算法暂未对照原文，仅经第三方数据交叉验证（详见 zhubi.ts 头注）。
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

  /**
   * 【黄畿专用】计算月经卦（双月经卦）
   * 年卦变爻得经卦，每卦管60天（2个月）
   * @param gregorianYear 公历年份
   * @param dayOfYear 皇极年内的天数（1-360，从冬至算起）
   */
  getYueJingHexagram?(gregorianYear: number, dayOfYear: number): Hexagram64

  /**
   * 【黄畿专用】计算旬纬卦（10天卦）
   * 月经卦变爻得纬卦，每卦管10天（1旬）
   */
  getXunWeiHexagram?(gregorianYear: number, dayOfYear: number): Hexagram64

  /**
   * 【黄畿专用】计算日卦（1天卦）
   * 从月经卦位置起，挨六十卦次，每天1卦
   */
  getRiHexagram?(gregorianYear: number, dayOfYear: number): Hexagram64

  /**
   * 【黄畿专用】计算时经卦（2时辰卦）
   * 日卦变爻，每2时辰一变。
   * 分段以"子半"（0点）为界：原文"自子半至寅半，坤初爻……
   * 每爻次以前后两半并一得二为率"，即 0-4/4-8/8-12/12-16/16-20/20-24 时六段。
   * @param hour 小时（0-23）
   */
  getShiJingHexagram?(gregorianYear: number, dayOfYear: number, hour: number): Hexagram64
}
