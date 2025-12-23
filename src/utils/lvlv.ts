/**
 * 律吕计算工具
 * 
 * 皇极经世书中，年月日时对应律吕（声音）
 * 十二律吕：黄钟、大吕、太簇、夹钟、姑洗、仲吕、蕤宾、林钟、夷则、南吕、无射、应钟
 */

export interface LvLv {
  name: string      // 律吕名称
  type: '律' | '吕' // 类型：阳律或阴吕
  pinyin: string    // 拼音
  index: number     // 索引（0-11）
}

/**
 * 十二律吕（按地支顺序：子丑寅卯辰巳午未申酉戌亥）
 */
export const TWELVE_LVLV: LvLv[] = [
  { name: '黄钟', type: '律', pinyin: 'Huáng Zhōng', index: 0 },
  { name: '大吕', type: '吕', pinyin: 'Dà Lǚ', index: 1 },
  { name: '太簇', type: '律', pinyin: 'Tài Cù', index: 2 },
  { name: '夹钟', type: '吕', pinyin: 'Jiā Zhōng', index: 3 },
  { name: '姑洗', type: '律', pinyin: 'Gū Xiǎn', index: 4 },
  { name: '仲吕', type: '吕', pinyin: 'Zhòng Lǚ', index: 5 },
  { name: '蕤宾', type: '律', pinyin: 'Ruí Bīn', index: 6 },
  { name: '林钟', type: '吕', pinyin: 'Lín Zhōng', index: 7 },
  { name: '夷则', type: '律', pinyin: 'Yí Zé', index: 8 },
  { name: '南吕', type: '吕', pinyin: 'Nán Lǚ', index: 9 },
  { name: '无射', type: '律', pinyin: 'Wú Yì', index: 10 },
  { name: '应钟', type: '吕', pinyin: 'Yìng Zhōng', index: 11 },
]

/**
 * 天干对应六律映射
 * 甲己 → 黄钟(0)
 * 乙庚 → 太簇(2)
 * 丙辛 → 姑洗(4)
 * 丁壬 → 蕤宾(6)
 * 戊癸 → 夷则(8)
 * 
 * 注：六律中的"无射"(10)在此映射中未被使用，遵循五合化气与五正声的对应原则。
 */
const STEM_TO_LV_INDEX: number[] = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8]
// 索引：                          甲  乙  丙  丁  戊  己  庚  辛  壬  癸

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

/**
 * 根据天干获取律吕（用于年律、日律）
 * @param stemIndex 天干索引（0-9）或天干字符
 * @returns 律吕信息
 */
export function getLvByTianGan(stemIndex: number | string): LvLv {
  let index: number
  if (typeof stemIndex === 'string') {
    index = HEAVENLY_STEMS.indexOf(stemIndex)
    if (index === -1) index = 0
  } else {
    index = stemIndex
  }
  const lvIndex = STEM_TO_LV_INDEX[index % 10]
  return TWELVE_LVLV[lvIndex]
}

/**
 * 根据地支获取律吕（用于月律、时律）
 * @param branchIndex 地支索引（0-11）
 * @returns 律吕信息
 */
export function getLvByDiZhi(branchIndex: number): LvLv {
  return TWELVE_LVLV[((branchIndex % 12) + 12) % 12]
}

/**
 * 获取年律
 * 规则：按天干对应六律
 * @param yearStem 年干（字符或索引）
 * @returns 律吕信息
 */
export function getYearLv(yearStem: string | number): LvLv {
  return getLvByTianGan(yearStem)
}

/**
 * 获取月律
 * 规则：按月支对应十二律吕
 * @param monthBranchIndex 月支索引（0=子, 1=丑, ...11=亥）
 * @returns 律吕信息
 */
export function getMonthLv(monthBranchIndex: number): LvLv {
  return getLvByDiZhi(monthBranchIndex)
}

/**
 * 获取日律
 * 规则：按日干对应六律
 * @param dayStem 日干（字符或索引）
 * @returns 律吕信息
 */
export function getDayLv(dayStem: string | number): LvLv {
  return getLvByTianGan(dayStem)
}

/**
 * 获取时律
 * 规则：按时支对应十二律吕
 * @param hourBranchIndex 时支索引（0=子, 1=丑, ...11=亥）
 * @returns 律吕信息
 */
export function getHourLv(hourBranchIndex: number): LvLv {
  return getLvByDiZhi(hourBranchIndex)
}

/**
 * 根据日期获取完整的四柱律吕
 * @param date Date对象
 * @param yearStem 年干字符
 * @param monthBranchIndex 月支索引
 * @param dayStem 日干字符
 * @param hourBranchIndex 时支索引
 * @returns 四柱律吕
 */
export function getFourPillarsLv(
  yearStem: string,
  monthBranchIndex: number,
  dayStem: string,
  hourBranchIndex: number
): {
  yearLv: LvLv
  monthLv: LvLv
  dayLv: LvLv
  hourLv: LvLv
} {
  return {
    yearLv: getYearLv(yearStem),
    monthLv: getMonthLv(monthBranchIndex),
    dayLv: getDayLv(dayStem),
    hourLv: getHourLv(hourBranchIndex),
  }
}

/**
 * 获取时辰地支索引
 * @param hour 小时（0-23）
 * @returns 时辰地支索引（0-11）
 */
export function getHourBranchIndex(hour: number): number {
  if (hour >= 23 || hour < 1) return 0  // 子
  if (hour < 3) return 1   // 丑
  if (hour < 5) return 2   // 寅
  if (hour < 7) return 3   // 卯
  if (hour < 9) return 4   // 辰
  if (hour < 11) return 5  // 巳
  if (hour < 13) return 6  // 午
  if (hour < 15) return 7  // 未
  if (hour < 17) return 8  // 申
  if (hour < 19) return 9  // 酉
  if (hour < 21) return 10 // 戌
  return 11 // 亥
}

/**
 * 根据Date对象获取时律
 * @param date Date对象
 * @returns 律吕信息
 */
export function getHourLvByDate(date: Date): LvLv {
  const hour = date.getHours()
  const branchIndex = getHourBranchIndex(hour)
  return getHourLv(branchIndex)
}

