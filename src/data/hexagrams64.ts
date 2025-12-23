/**
 * 六十四卦完整数据
 * 用于皇极经世书的运卦（星卦）计算
 * 
 * 卦象用6位二进制表示（从初爻到上爻）：
 * - 阳爻 = 1
 * - 阴爻 = 0
 * 
 * 例如：乾卦 = 111111 = 63, 坤卦 = 000000 = 0
 */

export interface Hexagram64 {
  binary: number      // 6位二进制值 (0-63)
  name: string        // 卦名
  unicode: string     // Unicode符号
  upper: string       // 上卦名
  lower: string       // 下卦名
}

// 八卦数据（三爻，0-7）
const TRIGRAMS = [
  { binary: 0, name: '坤', symbol: '☷' }, // 000
  { binary: 1, name: '震', symbol: '☳' }, // 001
  { binary: 2, name: '坎', symbol: '☵' }, // 010
  { binary: 3, name: '兑', symbol: '☱' }, // 011
  { binary: 4, name: '艮', symbol: '☶' }, // 100
  { binary: 5, name: '离', symbol: '☲' }, // 101
  { binary: 6, name: '巽', symbol: '☴' }, // 110
  { binary: 7, name: '乾', symbol: '☰' }, // 111
]

// 六十四卦数据（按二进制顺序0-63）
// 结构：下卦(0-7) + 上卦(0-7) * 8 = binary值
const HEXAGRAM_NAMES: Record<number, string> = {
  0:  '坤',   1:  '复',   2:  '师',   3:  '临',   4:  '谦',   5:  '明夷', 6:  '升',   7:  '泰',
  8:  '豫',   9:  '震',   10: '解',   11: '归妹', 12: '小过', 13: '丰',   14: '恒',   15: '大壮',
  16: '比',   17: '屯',   18: '坎',   19: '节',   20: '蹇',   21: '既济', 22: '井',   23: '需',
  24: '萃',   25: '随',   26: '困',   27: '兑',   28: '咸',   29: '革',   30: '大过', 31: '夬',
  32: '剥',   33: '颐',   34: '蒙',   35: '损',   36: '艮',   37: '贲',   38: '蛊',   39: '大畜',
  40: '晋',   41: '噬嗑', 42: '未济', 43: '睽',   44: '旅',   45: '离',   46: '鼎',   47: '大有',
  48: '观',   49: '益',   50: '涣',   51: '中孚', 52: '渐',   53: '家人', 54: '巽',   55: '小畜',
  56: '否',   57: '无妄', 58: '讼',   59: '履',   60: '遁',   61: '同人', 62: '姤',   63: '乾',
}

// Unicode卦象符号（U+4DC0 - U+4DFF）
// 按照周易序排列的卦象需要映射到二进制顺序
const BINARY_TO_UNICODE: Record<number, string> = {
  0:  '䷁', 1:  '䷗', 2:  '䷆', 3:  '䷒', 4:  '䷎', 5:  '䷣', 6:  '䷭', 7:  '䷊',
  8:  '䷏', 9:  '䷲', 10: '䷧', 11: '䷵', 12: '䷽', 13: '䷶', 14: '䷟', 15: '䷡',
  16: '䷇', 17: '䷂', 18: '䷜', 19: '䷻', 20: '䷦', 21: '䷾', 22: '䷯', 23: '䷄',
  24: '䷬', 25: '䷐', 26: '䷮', 27: '䷹', 28: '䷞', 29: '䷰', 30: '䷛', 31: '䷪',
  32: '䷖', 33: '䷚', 34: '䷃', 35: '䷨', 36: '䷳', 37: '䷕', 38: '䷑', 39: '䷙',
  40: '䷢', 41: '䷔', 42: '䷿', 43: '䷤', 44: '䷷', 45: '䷝', 46: '䷱', 47: '䷍',
  48: '䷓', 49: '䷩', 50: '䷺', 51: '䷼', 52: '䷴', 53: '䷤', 54: '䷸', 55: '䷈',
  56: '䷋', 57: '䷘', 58: '䷅', 59: '䷉', 60: '䷠', 61: '䷌', 62: '䷫', 63: '䷀',
}

/**
 * 根据二进制值获取卦象信息
 */
export function getHexagram64(binary: number): Hexagram64 {
  const b = binary & 0x3F // 确保在0-63范围内
  const lower = b & 0x07        // 下卦（初爻到三爻）
  const upper = (b >> 3) & 0x07 // 上卦（四爻到上爻）
  
  return {
    binary: b,
    name: HEXAGRAM_NAMES[b] || '未知',
    unicode: BINARY_TO_UNICODE[b] || '?',
    upper: TRIGRAMS[upper].name,
    lower: TRIGRAMS[lower].name,
  }
}

/**
 * 爻变：将指定爻的阴阳状态翻转
 * @param binary 卦的二进制值
 * @param yao 爻的位置（1-6，从初爻到上爻）
 * @returns 变化后的卦二进制值
 */
export function changeYao(binary: number, yao: number): number {
  if (yao < 1 || yao > 6) return binary
  const mask = 1 << (yao - 1) // 第1爻对应bit0，第6爻对应bit5
  return (binary ^ mask) & 0x3F
}

/**
 * 十二辟卦（消息卦）的二进制值
 * 按子丑寅卯辰巳午未申酉戌亥顺序
 */
export const TWELVE_SOVEREIGN_HEXAGRAMS = [
  1,  // 子：复（地雷复）000001
  3,  // 丑：临（地泽临）000011
  7,  // 寅：泰（地天泰）000111
  15, // 卯：大壮（雷天大壮）001111
  31, // 辰：夬（泽天夬）011111
  63, // 巳：乾（乾为天）111111
  62, // 午：姤（天风姤）111110
  60, // 未：遁（天山遁）111100
  56, // 申：否（天地否）111000
  48, // 酉：观（风地观）110000
  32, // 戌：剥（山地剥）100000
  0,  // 亥：坤（坤为地）000000
]

/**
 * 四正卦（主序列中剔除，另作闰卦）
 * 乾、坤、坎、离
 * 
 * 原文依据（《皇极经世书解》）：
 * "不用者，非不用也，用之以作闰卦"
 */
const FOUR_PRINCIPAL_HEXAGRAMS = [
  63, // 乾 111111
  0,  // 坤 000000
  18, // 坎 010010
  45, // 离 101101
]

/**
 * 四闰卦（四正卦的闰卦用法）
 * 按"始以离，继以乾坎，终以坤"的顺序
 * 用于分主二十四节气
 * 
 * 原文依据（《皇极经世书解》卷十三）：
 * "以四闰卦分主二十四气，始以离，继以乾坎，终以坤"
 */
export const FOUR_INTERCALARY_HEXAGRAMS = [
  { binary: 45, name: '离', unicode: '䷝', terms: ['春分', '清明', '谷雨', '立夏', '小满', '芒种'] },
  { binary: 63, name: '乾', unicode: '䷀', terms: ['夏至', '小暑', '大暑', '立秋', '处暑', '白露'] },
  { binary: 18, name: '坎', unicode: '䷜', terms: ['秋分', '寒露', '霜降', '立冬', '小雪', '大雪'] },
  { binary: 0,  name: '坤', unicode: '䷁', terms: ['冬至', '小寒', '大寒', '立春', '雨水', '惊蛰'] },
]

/**
 * 24节气名称（按节气索引0-23）
 */
const SOLAR_TERM_NAMES = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
  '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
]

/**
 * 根据节气索引获取对应的闰卦
 * @param termIndex 节气索引（0-23，0=小寒）
 * @returns 闰卦信息
 */
export function getIntercalaryHexagram(termIndex: number): typeof FOUR_INTERCALARY_HEXAGRAMS[0] {
  const termName = SOLAR_TERM_NAMES[termIndex % 24]
  
  for (const hexagram of FOUR_INTERCALARY_HEXAGRAMS) {
    if (hexagram.terms.includes(termName)) {
      return hexagram
    }
  }
  
  // 默认返回坤卦（冬至所在）
  return FOUR_INTERCALARY_HEXAGRAMS[3]
}

/**
 * 根据节气名称获取对应的闰卦
 * @param termName 节气名称
 * @returns 闰卦信息
 */
export function getIntercalaryHexagramByName(termName: string): typeof FOUR_INTERCALARY_HEXAGRAMS[0] | null {
  for (const hexagram of FOUR_INTERCALARY_HEXAGRAMS) {
    if (hexagram.terms.includes(termName)) {
      return hexagram
    }
  }
  return null
}

/**
 * 判断是否为四正卦
 */
function isFourPrincipalHexagram(binary: number): boolean {
  return FOUR_PRINCIPAL_HEXAGRAMS.includes(binary)
}

/**
 * 计算运卦（星卦）
 * 皇极经世书中，每会30运，运卦通过对会卦（辟卦）进行爻变得到
 * 
 * 重要规则：需要剔除四正卦（乾、坤、坎、离）
 * 
 * 算法：
 * 1. 从会卦的初爻开始依次爻变
 * 2. 如果爻变后得到四正卦，则跳过，继续下一个爻变
 * 3. 直到得到30个非四正卦为止
 * 
 * @param huiIndex 会的索引（0-11，对应子到亥）
 * @param yunInHui 运在会内的序号（0-29）
 * @returns 运卦信息
 */
export function getYunHexagram(huiIndex: number, yunInHui: number): Hexagram64 {
  // 获取该会的辟卦
  const sovereignBinary = TWELVE_SOVEREIGN_HEXAGRAMS[huiIndex % 12]
  
  // 生成该会的所有运卦序列（剔除四正卦）
  const yunSequence: number[] = []
  let yaoIndex = 0 // 当前爻位（0-5，对应初爻到上爻）
  let round = 0 // 轮数
  
  while (yunSequence.length < 30) {
    // 计算爻位（1-6）
    const yaoPosition = (yaoIndex % 6) + 1
    
    // 进行爻变
    const changedBinary = changeYao(sovereignBinary, yaoPosition)
    
    // 如果不是四正卦，则加入序列
    if (!isFourPrincipalHexagram(changedBinary)) {
      yunSequence.push(changedBinary)
    }
    
    yaoIndex++
    
    // 每6个爻为一轮
    if (yaoIndex % 6 === 0) {
      round++
    }
    
    // 防止无限循环（理论上不应该发生）
    if (yaoIndex > 200) {
      console.error('运卦计算异常：无法生成30个非四正卦')
      break
    }
  }
  
  // 返回指定序号的运卦
  const yunBinary = yunSequence[yunInHui % 30]
  return getHexagram64(yunBinary)
}

/**
 * 根据全局运编号计算运卦
 * @param globalYunNumber 全局运编号（1-360，一元360运）
 * @returns 运卦信息
 */
export function getYunHexagramByGlobal(globalYunNumber: number): Hexagram64 {
  // 计算会索引（每会30运）
  const huiIndex = Math.floor((globalYunNumber - 1) / 30) % 12
  // 计算运在会内的序号
  const yunInHui = (globalYunNumber - 1) % 30
  
  return getYunHexagram(huiIndex, yunInHui)
}

/**
 * 获取会的辟卦（正卦）
 * @param huiIndex 会的索引（0-11）
 * @returns 辟卦信息
 */
export function getHuiHexagram(huiIndex: number): Hexagram64 {
  const binary = TWELVE_SOVEREIGN_HEXAGRAMS[huiIndex % 12]
  return getHexagram64(binary)
}

/**
 * 计算世卦（辰卦）
 * 皇极经世书中，每运12世，世卦通过对**运卦**进行爻变得到
 * 
 * 重要规则：
 * - 遵循"父生子，子生孙"的逻辑
 * - 会（辟卦）→ 运（运卦）→ 世（世卦）
 * - 世卦由**运卦**爻变产生
 * - **剔除四正卦**（与运卦相同）
 * 
 * 算法：
 * - 每运12世，需要12个非四正卦的世卦
 * - 对运卦进行爻变，遇到四正卦则跳过
 * - 每2世共用一个世卦
 * 
 * @param huiIndex 会的索引（0-11，对应子到亥）
 * @param yunInHui 运在会内的序号（0-29）
 * @param shiInYun 世在运内的序号（0-11）
 * @returns 世卦信息
 */
export function getShiHexagram(huiIndex: number, yunInHui: number, shiInYun: number): Hexagram64 {
  // 首先获取该运的运卦（父卦）
  const yunHexagram = getYunHexagram(huiIndex, yunInHui)
  
  // 计算需要第几个世卦（每2世共用一个，共6个）
  const shiHexagramIndex = Math.floor((shiInYun % 12) / 2)
  
  // 对运卦进行爻变，生成非四正卦的世卦序列
  const shiSequence: number[] = []
  let yaoIndex = 0
  
  while (shiSequence.length < 6) {
    const yaoPosition = (yaoIndex % 6) + 1
    const changedBinary = changeYao(yunHexagram.binary, yaoPosition)
    
    // 剔除四正卦（乾坤坎离）
    if (!isFourPrincipalHexagram(changedBinary)) {
      shiSequence.push(changedBinary)
    }
    yaoIndex++
    
    // 防止无限循环（理论上最多需要10次爻变）
    if (yaoIndex > 12) break
  }
  
  const shiBinary = shiSequence[shiHexagramIndex % shiSequence.length]
  return getHexagram64(shiBinary)
}

/**
 * 根据全局世编号计算世卦
 * @param globalShiNumber 全局世编号（1-4320，一元4320世）
 * @returns 世卦信息
 */
export function getShiHexagramByGlobal(globalShiNumber: number): Hexagram64 {
  // 计算会索引（每会360世 = 30运 × 12世）
  const huiIndex = Math.floor((globalShiNumber - 1) / 360) % 12
  
  // 计算世在会内的序号（0-359）
  const shiInHui = (globalShiNumber - 1) % 360
  
  // 计算运在会内的序号（每运12世）
  const yunInHui = Math.floor(shiInHui / 12)
  
  // 计算世在运内的序号（0-11）
  const shiInYun = shiInHui % 12
  
  return getShiHexagram(huiIndex, yunInHui, shiInYun)
}

/**
 * 根据年份计算世卦
 * @param huangjiYear 皇极年份（1-129600）
 * @returns 世卦信息
 */
export function getShiHexagramByYear(huangjiYear: number): Hexagram64 {
  // 每世30年
  const globalShiNumber = Math.ceil(huangjiYear / 30)
  return getShiHexagramByGlobal(globalShiNumber)
}

/**
 * 先天六十四卦次序（邵雍方圆图，从乾开始顺时针）
 * 对应的二进制值（0-63）
 */
const XIANTIAN_64_SEQUENCE = [
  63, // 1.乾
  31, // 2.夬
  47, // 3.大有
  15, // 4.大壮
  55, // 5.小畜
  23, // 6.需
  39, // 7.大畜
  7,  // 8.泰
  59, // 9.履
  27, // 10.兑
  43, // 11.睽
  11, // 12.归妹
  51, // 13.中孚
  19, // 14.节
  35, // 15.损
  3,  // 16.临
  61, // 17.同人
  29, // 18.革
  45, // 19.离
  13, // 20.丰
  53, // 21.家人
  21, // 22.既济
  37, // 23.贲
  5,  // 24.明夷
  57, // 25.无妄
  25, // 26.随
  41, // 27.噬嗑
  9,  // 28.震
  49, // 29.益
  17, // 30.屯
  33, // 31.颐
  1,  // 32.复
  62, // 33.姤
  30, // 34.大过
  46, // 35.鼎
  14, // 36.恒
  54, // 37.巽
  22, // 38.井
  38, // 39.蛊
  6,  // 40.升
  58, // 41.讼
  26, // 42.困
  42, // 43.未济
  10, // 44.解
  50, // 45.涣
  18, // 46.坎
  34, // 47.蒙
  2,  // 48.师
  60, // 49.遁
  28, // 50.咸
  44, // 51.旅
  12, // 52.小过
  52, // 53.渐
  20, // 54.蹇
  36, // 55.艮
  4,  // 56.谦
  56, // 57.否
  24, // 58.萃
  40, // 59.晋
  8,  // 60.豫
  48, // 61.观
  16, // 62.比
  32, // 63.剥
  0,  // 64.坤
]

/**
 * 先天六十卦次序（剔除四正卦：乾坤坎离）
 * 用于岁卦计算
 */
const XIANTIAN_60_SEQUENCE = XIANTIAN_64_SEQUENCE.filter(
  binary => !FOUR_PRINCIPAL_HEXAGRAMS.includes(binary)
)

/**
 * 计算岁卦（年卦/值年卦）
 * 皇极经世书中，岁卦按先天60卦次序循环（剔除四正卦）
 * 每年对应一个卦，按先天卦序逆向循环
 * 
 * 锚点：公历2025年（皇极69043年）= 革卦（先天序第18位，60卦序第17位）
 * 
 * @param gregorianYear 公历年份
 * @returns 岁卦信息
 */
export function getSuiHexagram(gregorianYear: number): Hexagram64 {
  // 锚点：2025年 = 革卦
  // 革卦在先天60卦序中的索引（从0开始）
  // 先天64卦序：革=18位，离=19位被剔除，所以革在60卦序中是第17位（索引16）
  const ANCHOR_YEAR = 2025
  const ANCHOR_INDEX = 16 // 革卦在60卦序中的索引
  
  // 计算年份差（每年-1，即逆向循环）
  const yearDiff = ANCHOR_YEAR - gregorianYear
  
  // 计算在60卦序中的索引（逆向循环）
  let index = (ANCHOR_INDEX + yearDiff) % 60
  if (index < 0) index += 60
  
  const binary = XIANTIAN_60_SEQUENCE[index]
  return getHexagram64(binary)
}

/**
 * 根据皇极年份计算岁卦
 * @param huangjiYear 皇极年份（1-129600）
 * @returns 岁卦信息
 */
export function getSuiHexagramByHuangjiYear(huangjiYear: number): Hexagram64 {
  // 转换为公历年份
  const gregorianYear = huangjiYear - 67017
  return getSuiHexagram(gregorianYear)
}

/**
 * 获取岁卦的详细信息
 * @param gregorianYear 公历年份
 * @returns 岁卦详细信息
 */
export function getSuiHexagramDetail(gregorianYear: number): {
  suiHexagram: Hexagram64
  indexIn60: number
  gregorianYear: number
} {
  const ANCHOR_YEAR = 2025
  const ANCHOR_INDEX = 16
  
  const yearDiff = ANCHOR_YEAR - gregorianYear
  let index = (ANCHOR_INDEX + yearDiff) % 60
  if (index < 0) index += 60
  
  const binary = XIANTIAN_60_SEQUENCE[index]
  const suiHexagram = getHexagram64(binary)
  
  return {
    suiHexagram,
    indexIn60: index + 1, // 1-based
    gregorianYear,
  }
}

/**
 * 计算月卦（值月卦）
 * 皇极经世书中，月卦按先天60卦次序循环（剔除四正卦）
 * 每月对应一个卦，按先天卦序逆向循环
 * 
 * 计算方式：
 * - 基于公历年月计算总月数
 * - 锚点：公历2025年12月（皇极子月）= 同人卦（先天60卦序第16位，索引15）
 * - 每月递减1（逆向循环）
 * 
 * 注：皇极月从冬至开始（约公历12月），子月=12月，丑月=1月...
 * 
 * @param gregorianYear 公历年份
 * @param gregorianMonth 公历月份（1-12）
 * @returns 月卦信息
 */
export function getYueHexagram(gregorianYear: number, gregorianMonth: number): Hexagram64 {
  // 锚点：2025年12月 = 同人卦（革卦之后一个月）
  // 同人卦在先天60卦序中的索引 = 15（革卦是16，同人是15）
  const ANCHOR_YEAR = 2025
  const ANCHOR_MONTH = 12
  const ANCHOR_INDEX = 15 // 同人卦在60卦序中的索引
  
  // 计算从锚点到目标日期的月份差
  const anchorTotalMonths = ANCHOR_YEAR * 12 + ANCHOR_MONTH
  const targetTotalMonths = gregorianYear * 12 + gregorianMonth
  const monthDiff = anchorTotalMonths - targetTotalMonths
  
  // 计算在60卦序中的索引（逆向循环）
  let index = (ANCHOR_INDEX + monthDiff) % 60
  if (index < 0) index += 60
  
  const binary = XIANTIAN_60_SEQUENCE[index]
  return getHexagram64(binary)
}

/**
 * 根据皇极月份计算月卦
 * @param huangjiYear 皇极年份
 * @param huangjiMonth 皇极月份（1-12，1=子月）
 * @returns 月卦信息
 */
export function getYueHexagramByHuangji(huangjiYear: number, huangjiMonth: number): Hexagram64 {
  // 皇极月对应的公历月份
  // 子月(1) = 公历12月, 丑月(2) = 公历1月, 寅月(3) = 公历2月...
  // 皇极月 + 10 (mod 12) = 公历月
  const gregorianMonth = ((huangjiMonth - 1 + 11) % 12) + 1
  
  // 皇极年对应的公历年份
  const gregorianYear = huangjiYear - 67017
  
  // 如果是子月（公历12月），属于上一个公历年
  // 如果是丑-亥月（公历1-11月），属于当前公历年
  const adjustedGregorianYear = huangjiMonth === 1 ? gregorianYear - 1 : gregorianYear
  
  return getYueHexagram(adjustedGregorianYear, gregorianMonth)
}

/**
 * 获取月卦的详细信息
 * @param gregorianYear 公历年份
 * @param gregorianMonth 公历月份（1-12）
 * @returns 月卦详细信息
 */
export function getYueHexagramDetail(gregorianYear: number, gregorianMonth: number): {
  yueHexagram: Hexagram64
  indexIn60: number
  gregorianYear: number
  gregorianMonth: number
} {
  const ANCHOR_YEAR = 2025
  const ANCHOR_MONTH = 12
  const ANCHOR_INDEX = 15
  
  const anchorTotalMonths = ANCHOR_YEAR * 12 + ANCHOR_MONTH
  const targetTotalMonths = gregorianYear * 12 + gregorianMonth
  const monthDiff = anchorTotalMonths - targetTotalMonths
  
  let index = (ANCHOR_INDEX + monthDiff) % 60
  if (index < 0) index += 60
  
  const binary = XIANTIAN_60_SEQUENCE[index]
  const yueHexagram = getHexagram64(binary)
  
  return {
    yueHexagram,
    indexIn60: index + 1, // 1-based
    gregorianYear,
    gregorianMonth,
  }
}

/**
 * 计算日卦（值日卦）
 * 皇极经世书中，日卦按先天60卦次序循环（剔除四正卦）
 * 每日对应一个卦，与六十甲子日循环对应
 * 
 * 计算方式：
 * - 基于日干支索引（0-59）映射到先天60卦
 * - 锚点：甲子日 = 夬卦（先天60卦序第1位，索引0）
 *   （夬卦是剔除乾卦后的第一卦）
 * 
 * @param dayGanZhiIndex 日干支索引（0-59，0=甲子）
 * @returns 日卦信息
 */
export function getRiHexagram(dayGanZhiIndex: number): Hexagram64 {
  // 六十甲子与先天60卦一一对应
  // 甲子(0) → 夬卦(索引0)
  // 乙丑(1) → 大有卦(索引1)
  // ...循环
  const index = ((dayGanZhiIndex % 60) + 60) % 60
  const binary = XIANTIAN_60_SEQUENCE[index]
  return getHexagram64(binary)
}

/**
 * 根据日期计算日卦
 * @param date Date对象
 * @returns 日卦信息
 */
export function getRiHexagramByDate(date: Date): Hexagram64 {
  // 基准日：2000年1月1日 = 戊午日（索引54）
  const BASE_DATE = new Date(2000, 0, 1)
  const BASE_INDEX = 54 // 戊午 = 天干戊(4) + 地支午(6)
  
  // 计算与基准日的天数差
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const base = new Date(BASE_DATE.getFullYear(), BASE_DATE.getMonth(), BASE_DATE.getDate())
  const diffTime = d.getTime() - base.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
  
  // 日干支索引（0-59）
  let dayGanZhiIndex = (BASE_INDEX + diffDays) % 60
  if (dayGanZhiIndex < 0) dayGanZhiIndex += 60
  
  return getRiHexagram(dayGanZhiIndex)
}

/**
 * 获取日卦的详细信息
 * @param date Date对象
 * @returns 日卦详细信息
 */
export function getRiHexagramDetail(date: Date): {
  riHexagram: Hexagram64
  indexIn60: number
  dayGanZhiIndex: number
} {
  const BASE_DATE = new Date(2000, 0, 1)
  const BASE_INDEX = 54
  
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const base = new Date(BASE_DATE.getFullYear(), BASE_DATE.getMonth(), BASE_DATE.getDate())
  const diffTime = d.getTime() - base.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
  
  let dayGanZhiIndex = (BASE_INDEX + diffDays) % 60
  if (dayGanZhiIndex < 0) dayGanZhiIndex += 60
  
  const binary = XIANTIAN_60_SEQUENCE[dayGanZhiIndex]
  const riHexagram = getHexagram64(binary)
  
  return {
    riHexagram,
    indexIn60: dayGanZhiIndex + 1, // 1-based
    dayGanZhiIndex,
  }
}

/**
 * 计算时卦（值时卦）
 * 皇极经世书中，时卦使用十二消息卦
 * 每个时辰对应一个消息卦，与月卦规则相同
 * 
 * 对应关系（与十二消息卦一致）：
 * - 子时(0) → 復卦
 * - 丑时(1) → 臨卦
 * - 寅时(2) → 泰卦
 * - 卯时(3) → 大壯卦
 * - 辰时(4) → 夬卦
 * - 巳时(5) → 乾卦
 * - 午时(6) → 姤卦
 * - 未时(7) → 遯卦
 * - 申时(8) → 否卦
 * - 酉时(9) → 觀卦
 * - 戌时(10) → 剝卦
 * - 亥时(11) → 坤卦
 * 
 * @param hourBranchIndex 时辰地支索引（0-11，0=子时）
 * @returns 时卦信息
 */
export function getShiChenHexagram(hourBranchIndex: number): Hexagram64 {
  // 十二消息卦的二进制值（与月卦相同）
  const index = ((hourBranchIndex % 12) + 12) % 12
  const binary = TWELVE_SOVEREIGN_HEXAGRAMS[index]
  return getHexagram64(binary)
}

/**
 * 根据时间计算时卦
 * @param date Date对象（包含时分）
 * @returns 时卦信息
 */
export function getShiChenHexagramByDate(date: Date): Hexagram64 {
  const hour = date.getHours()
  
  // 确定时辰地支索引
  // 子时(23-01) 丑时(01-03) 寅时(03-05) 卯时(05-07) 辰时(07-09) 巳时(09-11)
  // 午时(11-13) 未时(13-15) 申时(15-17) 酉时(17-19) 戌时(19-21) 亥时(21-23)
  let branchIndex: number
  if (hour >= 23 || hour < 1) {
    branchIndex = 0 // 子
  } else if (hour < 3) {
    branchIndex = 1 // 丑
  } else if (hour < 5) {
    branchIndex = 2 // 寅
  } else if (hour < 7) {
    branchIndex = 3 // 卯
  } else if (hour < 9) {
    branchIndex = 4 // 辰
  } else if (hour < 11) {
    branchIndex = 5 // 巳
  } else if (hour < 13) {
    branchIndex = 6 // 午
  } else if (hour < 15) {
    branchIndex = 7 // 未
  } else if (hour < 17) {
    branchIndex = 8 // 申
  } else if (hour < 19) {
    branchIndex = 9 // 酉
  } else if (hour < 21) {
    branchIndex = 10 // 戌
  } else {
    branchIndex = 11 // 亥
  }
  
  return getShiChenHexagram(branchIndex)
}

/**
 * 获取时卦的详细信息
 * @param date Date对象
 * @returns 时卦详细信息
 */
export function getShiChenHexagramDetail(date: Date): {
  shiChenHexagram: Hexagram64
  branchIndex: number
  branchName: string
} {
  const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  const hour = date.getHours()
  
  let branchIndex: number
  if (hour >= 23 || hour < 1) {
    branchIndex = 0
  } else if (hour < 3) {
    branchIndex = 1
  } else if (hour < 5) {
    branchIndex = 2
  } else if (hour < 7) {
    branchIndex = 3
  } else if (hour < 9) {
    branchIndex = 4
  } else if (hour < 11) {
    branchIndex = 5
  } else if (hour < 13) {
    branchIndex = 6
  } else if (hour < 15) {
    branchIndex = 7
  } else if (hour < 17) {
    branchIndex = 8
  } else if (hour < 19) {
    branchIndex = 9
  } else if (hour < 21) {
    branchIndex = 10
  } else {
    branchIndex = 11
  }
  
  const binary = TWELVE_SOVEREIGN_HEXAGRAMS[branchIndex]
  const shiChenHexagram = getHexagram64(binary)
  
  return {
    shiChenHexagram,
    branchIndex,
    branchName: BRANCHES[branchIndex],
  }
}

