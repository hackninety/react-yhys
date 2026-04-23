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
import { getTermStartDate } from '../utils/solarTerms'
import { getCurrentAlgorithm } from '../algorithms/registry'

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
 * 判断是否为四正卦（乾坤坎离）
 * @param binary 卦的二进制值
 * @returns 是否为四正卦
 */
export function isFourPrincipalHexagram(binary: number): boolean {
  return FOUR_PRINCIPAL_HEXAGRAMS.includes(binary)
}

/**
 * 先天六十四卦次序（邵雍方圆图，从乾开始顺时针）
 * 对应的二进制值（0-63）
 * 
 * 原文依据：
 * "乾之数一，兑之数二，离之数三，震之数四，
 *  巽之数五，坎之数六，艮之数七，坤之数八，
 *  交相重而为六十四焉。"
 * 
 * 先天八卦数与二进制对应：
 * 乾(1)=111=7, 兑(2)=011=3, 离(3)=101=5, 震(4)=001=1
 * 巽(5)=110=6, 坎(6)=010=2, 艮(7)=100=4, 坤(8)=000=0
 * 
 * 圆图顺序规则（从乾顺时针）：
 * 【阳消阴长半圈】乾(1,1) → 姤(1,5) → ... → 剥(7,8) → 坤(8,8)
 * 【阳长阴消半圈】坤(8,8) → 复(8,4) → ... → 夬(2,1) → 回到乾(1,1)
 * 
 * 完整64卦顺序：
 *  1.乾   2.姤   3.大过  4.鼎   5.恒   6.巽   7.井   8.蛊
 *  9.升  10.讼  11.困  12.未济 13.解  14.涣  15.坎  16.蒙
 * 17.师  18.遁  19.咸  20.旅  21.小过 22.渐  23.蹇  24.艮
 * 25.谦  26.否  27.萃  28.晋  29.豫  30.观  31.比  32.剥
 * 33.坤  34.复  35.颐  36.屯  37.益  38.震  39.噬嗑 40.随
 * 41.无妄 42.明夷 43.贲  44.既济 45.家人 46.丰  47.离  48.革
 * 49.同人 50.临  51.损  52.节  53.中孚 54.归妹 55.睽  56.兑
 * 57.履  58.泰  59.大畜 60.需  61.小畜 62.大壮 63.大有 64.夬
 */
const XIANTIAN_64_SEQUENCE_FOR_YUN = [
  63, //  1.乾(1,1)*
  62, //  2.姤(1,5)
  30, //  3.大过(2,5)
  46, //  4.鼎(3,5)
  14, //  5.恒(4,5)
  54, //  6.巽(5,5)
  22, //  7.井(6,5)
  38, //  8.蛊(7,5)
  6,  //  9.升(8,5)
  58, // 10.讼(1,6)
  26, // 11.困(2,6)
  42, // 12.未济(3,6)
  10, // 13.解(4,6)
  50, // 14.涣(5,6)
  18, // 15.坎(6,6)*
  34, // 16.蒙(7,6)
  2,  // 17.师(8,6)
  60, // 18.遁(1,7)
  28, // 19.咸(2,7)
  44, // 20.旅(3,7)
  12, // 21.小过(4,7)
  52, // 22.渐(5,7)
  20, // 23.蹇(6,7)
  36, // 24.艮(7,7)
  4,  // 25.谦(8,7)
  56, // 26.否(1,8)
  24, // 27.萃(2,8)
  40, // 28.晋(3,8)
  8,  // 29.豫(4,8)
  48, // 30.观(5,8)
  16, // 31.比(6,8)
  32, // 32.剥(7,8)
  0,  // 33.坤(8,8)*
  1,  // 34.复(8,4)
  33, // 35.颐(7,4)
  17, // 36.屯(6,4)
  49, // 37.益(5,4)
  9,  // 38.震(4,4)
  41, // 39.噬嗑(3,4)
  25, // 40.随(2,4)
  57, // 41.无妄(1,4)
  5,  // 42.明夷(8,3)
  37, // 43.贲(7,3)
  21, // 44.既济(6,3)
  53, // 45.家人(5,3)
  13, // 46.丰(4,3)
  45, // 47.离(3,3)*
  29, // 48.革(2,3)
  61, // 49.同人(1,3)
  3,  // 50.临(8,2)
  35, // 51.损(7,2)
  19, // 52.节(6,2)
  51, // 53.中孚(5,2)
  11, // 54.归妹(4,2)
  43, // 55.睽(3,2)
  27, // 56.兑(2,2)
  59, // 57.履(1,2)
  7,  // 58.泰(8,1)
  39, // 59.大畜(7,1)
  23, // 60.需(6,1)
  55, // 61.小畜(5,1)
  15, // 62.大壮(4,1)
  47, // 63.大有(3,1)
  31, // 64.夬(2,1)
  // → 回到乾(1,1)
]

/**
 * 先天六十卦次序（剔除四正卦：乾坤坎离）
 * 用于运卦计算的主卦序列
 * 
 * 12会 × 5卦/会 = 60卦
 * 每主卦管辖6运，通过爻变产生6个运卦
 * 5主卦 × 6运/主卦 = 30运/会
 * 60主卦 × 6运/主卦 = 360运/元
 * 
 * 方位对应原则：
 * - 先天圆图中乾在午位（正南），坤在子位（正北）
 * - 子会从复卦开始（复在坤之后）
 * - 午会从姤卦开始（姤在乾之后）
 * 
 * 新算法（纵向统御运）：
 * - 每会5个主卦，每主卦管辖6运
 * - 每运的值运卦 = 主卦变动第N爻（N=1~6，对应初爻到上爻）
 * - 同一运内的12世共用该运的值运卦
 * - 四正卦作为变卦结果时直接使用，不跳过
 * 
 * 会卦分配表（按先天圆图方位对应）：
 * 子会(0): 复 → 颐 → 屯 → 益 → 震 （索引30-34，辟卦=复）
 * 丑会(1): 噬嗑 → 随 → 无妄 → 明夷 → 贲 （索引35-39）
 * 寅会(2): 既济 → 家人 → 丰 → 革 → 同人 （索引40-44）
 * 卯会(3): 临 → 损 → 节 → 中孚 → 归妹 （索引45-49）
 * 辰会(4): 睽 → 兑 → 履 → 泰 → 大畜 （索引50-54）
 * 巳会(5): 需 → 小畜 → 大壮 → 大有 → 夬 （索引55-59）
 * 午会(6): 姤 → 大过 → 鼎 → 恒 → 巽 （索引0-4，辟卦=姤）
 * 未会(7): 井 → 蛊 → 升 → 讼 → 困 （索引5-9）
 * 申会(8): 未济 → 解 → 涣 → 蒙 → 师 （索引10-14）
 * 酉会(9): 遁 → 咸 → 旅 → 小过 → 渐 （索引15-19）
 * 戌会(10): 蹇 → 艮 → 谦 → 否 → 萃 （索引20-24）
 * 亥会(11): 晋 → 豫 → 观 → 比 → 剥 （索引25-29）
 */
export const XIANTIAN_60_SEQUENCE_FOR_YUN = XIANTIAN_64_SEQUENCE_FOR_YUN.filter(
  binary => !FOUR_PRINCIPAL_HEXAGRAMS.includes(binary)
)

/**
 * 计算运卦（星卦）- 新算法：纵向统御运
 * 皇极经世书中，每会30运，由5个主卦各管辖6运
 * 
 * 核心规则（新算法）：
 * - 60主卦（64卦剔除四正卦）按先天序分配到12会
 * - 每会5个主卦，每主卦管辖6运
 * - 每运的值运卦 = 主卦变动第N爻（N=1~6，对应初爻到上爻）
 * - 同一运内的12世共用该运的值运卦
 * - 四正卦作为变卦结果时直接使用，不跳过
 * 
 * 方位对应原则：
 * - 先天圆图中，乾在午位（正南），坤在子位（正北）
 * - 子会应从复卦开始（复在坤之后，对应子位）
 * - 午会应从姤卦开始（姤在乾之后，对应午位）
 * - 复卦在60卦序中索引=30，姤卦索引=0
 * 
 * 原文依据：
 * "64卦×6爻=384爻，减去四正卦24爻=360用数"
 * 360用数对应360运，每爻对应1运
 * 
 * 午会完整映射表（运181-210）：
 * 
 * 第1组（运181-186）主卦【姤】(111110=62):
 *   运181 = 姤变初爻 → 乾(111111=63)
 *   运182 = 姤变二爻 → 遁(111100=60)
 *   运183 = 姤变三爻 → 讼(111010=58)
 *   运184 = 姤变四爻 → 巽(110110=54)
 *   运185 = 姤变五爻 → 鼎(101110=46)
 *   运186 = 姤变上爻 → 大过(011110=30)
 * 
 * 第2组（运187-192）主卦【大过】(011110=30):
 *   运187 = 大过变初爻 → 夬(011111=31)
 *   运188 = 大过变二爻 → 咸(011100=28)
 *   运189 = 大过变三爻 → 困(011010=26)
 *   运190 = 大过变四爻 → 井(010110=22)
 *   运191 = 大过变五爻 → 恒(001110=14)
 *   运192 = 大过变上爻 → 姤(111110=62) ← 验证点
 * 
 * 第3组（运193-198）主卦【鼎】(101110=46):
 *   运193 = 鼎变初爻 → 大有(101111=47)
 *   运194 = 鼎变二爻 → 旅(101100=44)
 *   运195 = 鼎变三爻 → 未济(101010=42)
 *   运196 = 鼎变四爻 → 蛊(100110=38)
 *   运197 = 鼎变五爻 → 姤(111110=62)
 *   运198 = 鼎变上爻 → 恒(001110=14)
 * 
 * 第4组（运199-204）主卦【恒】(001110=14):
 *   运199 = 恒变初爻 → 大壮(001111=15)
 *   运200 = 恒变二爻 → 小过(001100=12)
 *   运201 = 恒变三爻 → 解(001010=10)
 *   运202 = 恒变四爻 → 升(000110=6)
 *   运203 = 恒变五爻 → 大过(011110=30)
 *   运204 = 恒变上爻 → 鼎(101110=46)
 * 
 * 第5组（运205-210）主卦【巽】(110110=54):
 *   运205 = 巽变初爻 → 小畜(110111=55)
 *   运206 = 巽变二爻 → 渐(110100=52)
 *   运207 = 巽变三爻 → 涣(110010=50)
 *   运208 = 巽变四爻 → 姤(111110=62)
 *   运209 = 巽变五爻 → 蛊(100110=38)
 *   运210 = 巽变上爻 → 井(010110=22)
 * 
 * @param huiIndex 会的索引（0-11，对应子到亥）
 * @param yunInHui 运在会内的序号（0-29）
 * @returns 运卦信息
 */
export function getYunHexagram(huiIndex: number, yunInHui: number): Hexagram64 {
  return getCurrentAlgorithm().getYunHexagram(huiIndex, yunInHui)
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
 * 运卦详细信息（包含主卦来源）
 */
export interface YunHexagramDetail {
  yunHexagram: Hexagram64      // 运卦（值运卦）
  masterHexagram: Hexagram64   // 主卦（变卦来源）
  yaoChanged: number           // 变动的爻位（1-6）
  yaoName: string              // 爻位名称（初、二、三、四、五、上）
}

/**
 * 根据全局运编号获取运卦详细信息（包含主卦来源）
 * @param globalYunNumber 全局运编号（1-360，一元360运）
 * @returns 运卦详细信息
 */
export function getYunHexagramDetailByGlobal(globalYunNumber: number): YunHexagramDetail {
  // 计算会索引（每会30运）
  const huiIndex = Math.floor((globalYunNumber - 1) / 30) % 12
  // 计算运在会内的序号
  const yunInHui = (globalYunNumber - 1) % 30
  
  // 计算该会在60卦序中的起始位置（主卦/变爻是先天图结构元数据，与算法无关）
  const huiStartIndex = ((huiIndex % 12) * 5 + 30) % 60
  
  // 每主卦管辖6运，计算该运对应的主卦在会内的位置（0-4）
  const masterHexagramIndexInHui = Math.floor((yunInHui % 30) / 6)
  
  // 计算在60卦序中的全局索引
  const globalIndex = (huiStartIndex + masterHexagramIndexInHui) % 60
  
  // 获取主卦
  const masterBinary = XIANTIAN_60_SEQUENCE_FOR_YUN[globalIndex]
  const masterHexagram = getHexagram64(masterBinary)
  
  // 计算变动的爻位
  const yunInGroup = yunInHui % 6
  const yaoChanged = yunInGroup + 1 // 1-6
  const yaoNames = ['初', '二', '三', '四', '五', '上']
  const yaoName = yaoNames[yunInGroup]
  
  // 运卦通过分发获取（确保切换算法时运卦结果正确）
  const yunHexagram = getYunHexagram(huiIndex, yunInHui)
  
  return {
    yunHexagram,
    masterHexagram,
    yaoChanged,
    yaoName,
  }
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
 * 计算世卦（辰卦）- 正统皇极算法：运统世
 * 皇极经世书中，每运12世，同一运内的12世由该运的值运卦衍生
 * 
 * 正统算法规则：
 * - 每一运（星）由一个确定的值运卦统领
 * - 每2世为一甲子（60年），一运12世共分为6个“甲子世”
 * - 第 N 个“甲子世”（N=1至6）的世卦 = 运卦变动第 N 爻（从初爻至上爻）
 * 
 * @param huiIndex 会的索引（0-11，对应子到亥）
 * @param yunInHui 运在会内的序号（0-29）
 * @param shiInYun 世在运内的序号（0-11）
 * @returns 世卦信息
 */
export function getShiHexagram(huiIndex: number, yunInHui: number, shiInYun: number): Hexagram64 {
  return getCurrentAlgorithm().getShiHexagram(huiIndex, yunInHui, shiInYun)
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
 * 计算十年卦（律卦）
 * 原文依据（黄畿注·观物篇二十五）：
 * "以乾一卦六爻，变成六卦，为经。即以六爻所变之六卦，
 *  各得六变，所直之三十六卦为律。"
 * "一卦管十年，三十年为一世，三而两之，则六十年为世者二。
 *  前三者，内三爻直卦之各十年；后三者，外三爻直卦之各十年"
 *
 * 算法：世卦变爻 → 十年卦
 * - 前世（偶数世，0,2,4...）：世卦变初爻/二爻/三爻（内三爻）
 * - 后世（奇数世，1,3,5...）：世卦变四爻/五爻/上爻（外三爻）
 * - 每10年共享同一个十年卦
 *
 * @param huangjiYear 皇极年份（1-129600）
 * @returns { hex: 十年卦, shiHex: 世卦, yaoIndex: 变爻位置(1-6), yaoName: 变爻名 }
 */
export function getTenYearHexagram(huangjiYear: number): {
  hex: Hexagram64
  shiHex: Hexagram64
  yaoIndex: number
  yaoName: string
} {
  const YAO_NAMES = ['初', '二', '三', '四', '五', '上']

  // 年在世内的位置(0-29)
  const yearInShi = ((huangjiYear - 1) % 30)
  // 世在运内的位置(0-11)
  const shiInYun = Math.floor(((huangjiYear - 1) / 30)) % 12
  // 前世(偶数)用内三爻(1,2,3)，后世(奇数)用外三爻(4,5,6)
  const shiParity = shiInYun % 2
  // 每10年一个十年卦
  const decadeInShi = Math.floor(yearInShi / 10) // 0,1,2
  const yaoIndex = shiParity * 3 + decadeInShi + 1 // 1-6

  const shiHex = getShiHexagramByYear(huangjiYear)
  const decadeBinary = changeYao(shiHex.binary, yaoIndex)
  const hex = getHexagram64(decadeBinary)

  return {
    hex,
    shiHex,
    yaoIndex,
    yaoName: YAO_NAMES[yaoIndex - 1],
  }
}

/**
 * 先天六十卦次序（剔除四正卦：乾坤坎离）
 * 用于岁卦、月卦、日卦计算
 * 
 * 使用与运卦相同的先天圆图序列，确保一致性
 */
const XIANTIAN_60_SEQUENCE = XIANTIAN_60_SEQUENCE_FOR_YUN

/**
 * 计算岁卦（年卦/值年卦）- 正统皇极算法：世统年
 * 年卦由该年所属的世卦派生：以六十甲子偏移决定变爻位。
 * 若变出四正卦（乾坤坎离，作闰卦不用），则跳过该爻，"以次变之"。
 *
 * 使用预过滤法：先收集所有有效变爻结果（剔除四正卦），
 * 再按 ganzhiOffset 取模选取，保证连续年份绝不产出同一卦。
 *
 * @param gregorianYear 公历年份
 * @returns 岁卦信息
 */
export function getSuiHexagram(gregorianYear: number): Hexagram64 {
  return getCurrentAlgorithm().getSuiHexagram(gregorianYear)
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
  const suiHexagram = getSuiHexagram(gregorianYear)
  
  // 查找它在60卦序列中的索引位置
  const index = XIANTIAN_60_SEQUENCE.indexOf(suiHexagram.binary)
  
  return {
    suiHexagram,
    indexIn60: index >= 0 ? index + 1 : 0, // 1-based
    gregorianYear,
  }
}

/**
 * 计算月卦（值月卦）— 干支索引映射法
 * 与日卦 getRiHexagram 完全一致的查表逻辑：
 * "日甲月子，合乎为复" → 甲子月 = 复卦
 * 
 * @param monthGanZhiIndex 月建干支的六十甲子索引（0-59，0=甲子）
 * @returns 月卦信息
 */
export function getYueHexagram(monthGanZhiIndex: number): Hexagram64 {
  // 锚点：甲子月 = 复卦（与日卦相同）
  const JIAZI_INDEX = 30 // 复卦在60卦序中的索引
  
  let ganzhiIndex = ((monthGanZhiIndex % 60) + 60) % 60
  const index = (JIAZI_INDEX + ganzhiIndex) % 60
  
  const binary = XIANTIAN_60_SEQUENCE[index]
  return getHexagram64(binary)
}

// 天干地支表（用于干支字符串→索引转换）
const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']

/**
 * 将干支字符串转换为六十甲子索引（0-59）
 * @param ganZhi 干支字符串，如 "辛卯"
 * @returns 六十甲子索引（0=甲子, 1=乙丑, ...）
 */
function ganZhiToIndex(ganZhi: string): number {
  if (ganZhi.length < 2) return 0
  const stem = STEMS.indexOf(ganZhi[0])
  const branch = BRANCHES.indexOf(ganZhi[1])
  if (stem < 0 || branch < 0) return 0
  // 天干和地支同奇同偶才合法
  // 六十甲子索引 = 找到同时满足 index%10==stem 且 index%12==branch 的最小非负整数
  for (let i = 0; i < 60; i++) {
    if (i % 10 === stem && i % 12 === branch) return i
  }
  return 0
}

/**
 * 根据日期计算月卦（自动获取月建干支）
 * 使用夏历月建（以节分月、五虎遁月干支）
 * @param date Date对象
 * @returns 月卦信息
 */
export function getYueHexagramByDate(date: Date): Hexagram64 {
  // 动态 import 会产生循环依赖，这里直接内联计算月建干支索引
  // 与 ganzhi.ts 中 getMonthGanZhi 相同的逻辑
  const year = date.getFullYear()
  const d = new Date(year, date.getMonth(), date.getDate())
  
  // 12个"节"的索引
  const jieIndices = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]
  // 节 → 月支对照（与 ganzhi.ts 中 TERM_TO_MONTH_BRANCH 一致）
  const termToMonthBranch: Record<number, number> = {
    0: 1, 2: 2, 4: 3, 6: 4, 8: 5, 10: 6,
    12: 7, 14: 8, 16: 9, 18: 10, 20: 11, 22: 0,
  }
  
  // 构建候选节气列表
  interface JieCandidate { jieIdx: number; jieYear: number; jieDate: Date }
  const candidates: JieCandidate[] = []
  for (const jieIdx of jieIndices) {
    candidates.push({ jieIdx, jieYear: year, jieDate: getTermStartDate(year, jieIdx) })
  }
  candidates.push({ jieIdx: 22, jieYear: year - 1, jieDate: getTermStartDate(year - 1, 22) })
  candidates.sort((a, b) => b.jieDate.getTime() - a.jieDate.getTime())
  
  let found = candidates.find(c => d.getTime() >= c.jieDate.getTime())
  if (!found) found = candidates[candidates.length - 1]
  
  const monthBranchIndex = termToMonthBranch[found.jieIdx]
  
  // 确定干支年份（以立春分年）
  let yearForGanzhi: number
  if (found.jieIdx === 22) {
    yearForGanzhi = found.jieYear
  } else if (found.jieIdx === 0) {
    yearForGanzhi = found.jieYear - 1
  } else {
    yearForGanzhi = found.jieYear
  }
  
  // 年干索引
  let yearStemIndex = (yearForGanzhi - 1984) % 10
  if (yearStemIndex < 0) yearStemIndex += 10
  
  // 寅月天干起始（五虎遁）
  const yinMonthStemStart = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0][yearStemIndex]
  
  // 月干
  let monthOffset = monthBranchIndex - 2
  if (monthOffset < 0) monthOffset += 12
  const monthStemIndex = (yinMonthStemStart + monthOffset) % 10
  
  // 计算六十甲子索引
  const ganZhiStr = STEMS[monthStemIndex] + BRANCHES[monthBranchIndex]
  const monthGanZhiIndex = ganZhiToIndex(ganZhiStr)
  
  return getYueHexagram(monthGanZhiIndex)
}

/**
 * 根据皇极月份计算月卦
 * 内部将皇极年月转换为公历日期，再获取月建干支
 * @param huangjiYear 皇极年份
 * @param huangjiMonth 皇极月份（1-12，1=子月）
 * @returns 月卦信息
 */
export function getYueHexagramByHuangji(huangjiYear: number, huangjiMonth: number): Hexagram64 {
  // 皇极月转公历月：子月(1)=12月, 丑月(2)=1月, 寅月(3)=2月...
  const gregorianMonth = ((huangjiMonth - 1 + 11) % 12) + 1
  const gregorianYear = huangjiYear - 67017
  const adjustedGregorianYear = huangjiMonth === 1 ? gregorianYear - 1 : gregorianYear
  
  // 用该月中间日期(第15日)来确保节气判断正确
  const date = new Date(adjustedGregorianYear, gregorianMonth - 1, 15)
  return getYueHexagramByDate(date)
}

/**
 * 获取月卦的详细信息
 * @param date Date对象
 * @returns 月卦详细信息
 */
export function getYueHexagramDetail(date: Date): {
  yueHexagram: Hexagram64
  monthGanZhiIndex: number
} {
  const yueHexagram = getYueHexagramByDate(date)

  // 反查索引（简化：直接在60卦序中找）
  const idx = XIANTIAN_60_SEQUENCE.indexOf(yueHexagram.binary)
  
  return {
    yueHexagram,
    monthGanZhiIndex: idx >= 0 ? idx + 1 : 0,
  }
}

/**
 * 计算日卦（值日卦）
 * 皇极经世书中，日卦按先天60卦次序循环（剔除四正卦）
 * 每日对应一个卦，与六十甲子日循环对应
 * 
 * 锚点规则："日甲月子，合乎为复"
 * - 甲子日 = 复卦（与甲子年相同）
 * - 复卦在先天60卦序中索引29
 * - 正向循环：甲子(0)→复卦，乙丑(1)→姤卦...
 * 
 * @param dayGanZhiIndex 日干支索引（0-59，0=甲子）
 * @returns 日卦信息
 */
export function getRiHexagram(dayGanZhiIndex: number): Hexagram64 {
  // 锚点：甲子日 = 复卦（索引30，第31位）
  const JIAZI_INDEX = 30 // 复卦在60卦序中的索引
  
  // 六十甲子与先天60卦一一对应
  // 甲子(0) → 复卦(索引30)
  // 乙丑(1) → 颐卦(索引31)
  // ...循环
  let ganzhiIndex = ((dayGanZhiIndex % 60) + 60) % 60
  const index = (JIAZI_INDEX + ganzhiIndex) % 60
  
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
  const BASE_INDEX = 54 // 戊午日
  const JIAZI_INDEX = 30 // 复卦在60卦序中的索引（第31位）
  
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const base = new Date(BASE_DATE.getFullYear(), BASE_DATE.getMonth(), BASE_DATE.getDate())
  const diffTime = d.getTime() - base.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
  
  let dayGanZhiIndex = (BASE_INDEX + diffDays) % 60
  if (dayGanZhiIndex < 0) dayGanZhiIndex += 60
  
  // 计算在60卦序中的索引（甲子=复卦）
  const hexagramIndex = (JIAZI_INDEX + dayGanZhiIndex) % 60
  
  const binary = XIANTIAN_60_SEQUENCE[hexagramIndex]
  const riHexagram = getHexagram64(binary)
  
  return {
    riHexagram,
    indexIn60: hexagramIndex + 1, // 1-based
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

