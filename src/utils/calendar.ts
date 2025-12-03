/**
 * 皇极经世历法核心计算
 * 基于邵雍《皇极经世》体系
 * 
 * 层级结构（按规则）：
 * | 层级      | 数量     | 别名 | 说明                           |
 * |----------|----------|------|------------------------------|
 * | 日（元）  | 1        | 日   | 起点，1日=1元                  |
 * | 月（会）  | 12       | 月   | 子1...亥12                    |
 * | 星（运）  | 360      | 星   | 每月30运，共360运              |
 * | 辰（世）  | 4320     | 辰   | 每运12世，共4320世             |
 * | 年（岁）  | 129600   | 岁   | 每世30年，共129600年           |
 * 
 * 寅月开物（惊蛰）、戌月闭物（立冬）
 * 
 * 年内结构：
 * 1 年 = 12 月 = 24 节气 = 360 天
 * 1 月 = 30 天
 * 每 15 天 = 1 节气
 */

// 十天干（日、星用）
export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const

// 天干拼音
export const STEM_PINYIN = ['Jiǎ', 'Yǐ', 'Bǐng', 'Dīng', 'Wù', 'Jǐ', 'Gēng', 'Xīn', 'Rén', 'Guǐ'] as const

// 十二地支（月、辰用）
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const

// 地支拼音
export const BRANCH_PINYIN = ['Zǐ', 'Chǒu', 'Yín', 'Mǎo', 'Chén', 'Sì', 'Wǔ', 'Wèi', 'Shēn', 'Yǒu', 'Xū', 'Hài'] as const

// 地支序号（用于显示）
export const BRANCH_NUMBER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const

// 获取天干（按10循环）
export function getStem(index: number): string {
  return HEAVENLY_STEMS[index % 10]
}

// 获取天干拼音
export function getStemPinyin(index: number): string {
  return STEM_PINYIN[index % 10]
}

// 获取地支（按12循环）
export function getBranch(index: number): string {
  return EARTHLY_BRANCHES[index % 12]
}

// 获取地支拼音
export function getBranchPinyin(index: number): string {
  return BRANCH_PINYIN[index % 12]
}

// ============================================
// 六十甲子（年岁用）
// ============================================
// 六十甲子 = 天干(10) × 地支(12) 的最小公倍数 = 60年一循环
// 甲子、乙丑、丙寅、丁卯、戊辰、己巳、庚午、辛未、壬申、癸酉、
// 甲戌、乙亥、丙子、丁丑、戊寅、己卯、庚辰、辛巳、壬午、癸未、
// 甲申、乙酉、丙戌、丁亥、戊子、己丑、庚寅、辛卯、壬辰、癸巳、
// 甲午、乙未、丙申、丁酉、戊戌、己亥、庚子、辛丑、壬寅、癸卯、
// 甲辰、乙巳、丙午、丁未、戊申、己酉、庚戌、辛亥、壬子、癸丑、
// 甲寅、乙卯、丙辰、丁巳、戊午、己未、庚申、辛酉、壬戌、癸亥

// 根据年份索引获取六十甲子（0-based，0=甲子）
export function getJiaziName(yearIndex: number): string {
  const stemIndex = yearIndex % 10
  const branchIndex = yearIndex % 12
  return HEAVENLY_STEMS[stemIndex] + EARTHLY_BRANCHES[branchIndex]
}

// 根据全局年编号获取六十甲子（1-based，1=甲子）
export function getYearJiazi(globalYearNumber: number): string {
  return getJiaziName(globalYearNumber - 1)
}

// 获取六十甲子的天干部分
export function getYearStem(globalYearNumber: number): string {
  return HEAVENLY_STEMS[(globalYearNumber - 1) % 10]
}

// 获取六十甲子的地支部分
export function getYearBranch(globalYearNumber: number): string {
  return EARTHLY_BRANCHES[(globalYearNumber - 1) % 12]
}

// 二十四节气
export const SOLAR_TERMS = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
  '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
] as const

// 节气对应的CSS类名
export const SOLAR_TERM_CLASSES: Record<string, string> = {
  '小寒': 'term-xiaohan',
  '大寒': 'term-dahan',
  '立春': 'term-lichun',
  '雨水': 'term-yushui',
  '惊蛰': 'term-jingzhe',
  '春分': 'term-chunfen',
  '清明': 'term-qingming',
  '谷雨': 'term-guyu',
  '立夏': 'term-lixia',
  '小满': 'term-xiaoman',
  '芒种': 'term-mangzhong',
  '夏至': 'term-xiazhi',
  '小暑': 'term-xiaoshu',
  '大暑': 'term-dashu',
  '立秋': 'term-liqiu',
  '处暑': 'term-chushu',
  '白露': 'term-bailu',
  '秋分': 'term-qiufen',
  '寒露': 'term-hanlu',
  '霜降': 'term-shuangjiang',
  '立冬': 'term-lidong',
  '小雪': 'term-xiaoxue',
  '大雪': 'term-daxue',
  '冬至': 'term-dongzhi',
}

// 开物闭物标记
// 原文：「开物于星之七十六，犹岁之惊蛰也；闭物于三百一十五，犹岁之立冬也。」
// 寅月（第3会/月）开物 - 惊蛰
// 戌月（第11会/月）闭物 - 立冬
export const KAIWU_INDEX = 2   // 寅（索引2）
export const BIWU_INDEX = 10   // 戌（索引10）
export const KAIWU_TERM = '惊蛰'
export const BIWU_TERM = '立冬'
export const KAIWU_YUN = 76    // 开物运（惊蛰起始）
export const BIWU_YUN = 315    // 闭物运（立冬起始）

// ============================================
// 运节气（星节气）- 1元360运，每15运一个节气
// ============================================
// 以第76运=惊蛰(索引4)为基准校准所有运节气位置
// 原文：「开物于星之七十六，犹岁之惊蛰也」
export const JINGZHE_YUN = 76       // 惊蛰起始运
export const JINGZHE_INDEX = 4     // 惊蛰在24节气中的索引
export const YUNS_PER_TERM = 15    // 每15运一个运节气

// 运节气名称（与天节气相同，但层级不同）
export const YUN_TERMS = SOLAR_TERMS  // 运节气使用相同的24节气名

// 根据全局运编号计算运节气索引
export function getYunTermIndex(globalYunNumber: number): number {
  return ((Math.floor((globalYunNumber - JINGZHE_YUN) / YUNS_PER_TERM) + JINGZHE_INDEX) % 24 + 24) % 24
}

// 判断是否为运节气起点
export function isYunTermStart(globalYunNumber: number): boolean {
  return (globalYunNumber - JINGZHE_YUN) % YUNS_PER_TERM === 0
}

// 获取运节气名称
export function getYunTermName(globalYunNumber: number): string {
  return YUN_TERMS[getYunTermIndex(globalYunNumber)]
}

// ============================================
// 天节气（日节气）- 1年360天，每15天一个节气
// ============================================
// 天节气与运节气对应：子月第1天=冬至，第16天=小寒，第76天=惊蛰
// 以第76天=惊蛰(索引4)为基准校准
export const DAYS_PER_DAY_TERM = 15  // 每15天一个天节气
export const JINGZHE_DAY = 76        // 惊蛰起始天（寅月第16天）
export const JINGZHE_DAY_INDEX = 4   // 惊蛰在24节气中的索引

// 根据年内天数计算天节气索引（dayOfYear: 1-360）
export function getDayTermIndex(dayOfYear: number): number {
  return ((Math.floor((dayOfYear - JINGZHE_DAY) / DAYS_PER_DAY_TERM) + JINGZHE_DAY_INDEX) % 24 + 24) % 24
}

// 判断是否为天节气起点
export function isDayTermStart(dayOfYear: number): boolean {
  return (dayOfYear - JINGZHE_DAY) % DAYS_PER_DAY_TERM === 0
}

// 获取天节气名称
export function getDayTermName(dayOfYear: number): string {
  return SOLAR_TERMS[getDayTermIndex(dayOfYear)]
}

// ============================================
// 兼容旧函数名（保持向后兼容）
// ============================================
export const getTermIndexByYun = getYunTermIndex
export const isTermStartYun = isYunTermStart

// 常量
export const TOTAL_YEARS = 129600    // 一元(日)总年数
export const HUIS_PER_YUAN = 12      // 一元12会(月)
export const YUNS_PER_HUI = 30       // 一会30运(星)
export const SHIS_PER_YUN = 12       // 一运12世(辰)
export const YEARS_PER_SHI = 30      // 一世30年
export const YEARS_PER_YUN = 360     // 一运年数 (12世 × 30年)
export const YEARS_PER_HUI = 10800   // 一会年数 (30运 × 360年)
export const MONTHS_PER_YEAR = 12
export const DAYS_PER_MONTH = 30
export const DAYS_PER_YEAR = 360
export const DAYS_PER_TERM = 15

// 总数常量
export const TOTAL_YUNS = 360        // 一元360运(星)
export const TOTAL_SHIS = 4320       // 一元4320世(辰)

// 缩放级别
export type ZoomLevel = 'yuan' | 'hui' | 'yun' | 'shi' | 'nian'

export const ZOOM_LEVELS: ZoomLevel[] = ['yuan', 'hui', 'yun', 'shi', 'nian']

// 层级信息（使用正确的别名）
export const ZOOM_INFO: Record<ZoomLevel, { name: string; alias: string; contains: string; containsAlias: string; count: number }> = {
  yuan: { name: '元', alias: '日', contains: '会', containsAlias: '月', count: 12 },
  hui: { name: '会', alias: '月', contains: '运', containsAlias: '星', count: 30 },
  yun: { name: '运', alias: '星', contains: '世', containsAlias: '辰', count: 12 },
  shi: { name: '世', alias: '辰', contains: '年', containsAlias: '岁', count: 30 },
  nian: { name: '年', alias: '岁', contains: '月', containsAlias: '月', count: 12 },
}

// 时间单位名称（保留兼容）
export const UNIT_NAMES = {
  yuan: { name: '元', alias: '日' },
  hui: { name: '会', alias: '月' },
  yun: { name: '运', alias: '星' },
  shi: { name: '世', alias: '辰' },
  nian: { name: '年', alias: '岁' },
} as const

export interface CalendarState {
  yearIndex: number      // 原始年索引（可超出范围）
  yearInCycle: number    // 循环内年份 0-129599
  yuan: number           // 第几元（从0开始）
  hui: number            // 第几会（0-11）
  yun: number            // 会内第几运（0-29）
  shi: number            // 运内第几世（0-11）
  yearInShi: number      // 世内第几年（0-29）
  // 天干地支信息（按皇极经世原文格式）
  yuanStem: string       // 日（元）的天干：甲、乙、丙...
  huiBranch: string      // 月（会）的地支：子、丑、寅...
  yunStem: string        // 星（运）的天干：甲、乙、丙...
  shiBranch: string      // 辰（世）的地支：子、丑、寅...
  // 全局编号
  globalYun: number      // 全局运编号 1-360
  globalShi: number      // 全局世编号 1-4320
}

export interface MonthData {
  index: number          // 月索引 0-11
  branch: string         // 地支名
  branchPinyin: string   // 地支拼音
  days: DayData[]
}

export interface DayData {
  dayOfMonth: number     // 月内第几天 1-30
  dayOfYear: number      // 年内第几天 1-360
  termIndex: number      // 节气索引 0-23
  termName: string       // 节气名
  isTermStart: boolean   // 是否为节气首日
}

export interface YearData {
  state: CalendarState
  months: MonthData[]
}

// 元级视图的运数据
export interface YunData {
  index: number          // 运索引 0-29
  yunNumber: number      // 运序号 1-30
  yearStart: number      // 起始年份
  yearEnd: number        // 结束年份
}

// 元级视图的会数据
export interface HuiData {
  index: number          // 会索引 0-11
  branch: string         // 地支名
  branchPinyin: string   // 地支拼音
  yuns: YunData[]        // 30运
  termStart: string      // 起始节气
  termEnd: string        // 结束节气
}

// 元级视图数据
export interface YuanData {
  yuanIndex: number      // 元索引
  huis: HuiData[]        // 12会
}

// 运级视图的年数据
export interface NianData {
  index: number          // 年索引 0-29
  nianNumber: number     // 年序号 1-30
  yearIndex: number      // 绝对年索引
}

// 运级视图的世数据
export interface ShiData {
  index: number          // 世索引 0-11
  branch: string         // 地支名
  branchPinyin: string   // 地支拼音
  nians: NianData[]      // 30年
  termStart: string      // 起始节气
  termEnd: string        // 结束节气
}

// 运级视图数据
export interface YunViewData {
  position: ZoomPosition
  shis: ShiData[]        // 12世
}

// 缩放视图的子项数据
export interface ZoomItemData {
  index: number          // 子项索引
  name: string           // 名称（带地支）
  pinyin?: string        // 拼音（若使用地支）
  yearStart: number      // 起始年份（绝对索引）
  yearEnd: number        // 结束年份
  yearCount: number      // 包含年数
  branchIndex?: number   // 地支索引（若适用）
  termSummary?: string[] // 节气摘要（若适用）
}

export interface ZoomViewData {
  level: ZoomLevel
  position: ZoomPosition
  items: ZoomItemData[]
  title: string
  subtitle: string
}

// 缩放位置
export interface ZoomPosition {
  yuan: number           // 当前元索引
  hui?: number           // 当前会索引（会级及以下）
  yun?: number           // 当前运索引（运级及以下）
  shi?: number           // 当前世索引（世级及以下）
  nian?: number          // 当前年索引（年级）
}

/**
 * 计算日历状态
 */
export function calcState(yearIndex: number): CalendarState {
  // 处理负数和循环
  const yearInCycle = ((yearIndex % TOTAL_YEARS) + TOTAL_YEARS) % TOTAL_YEARS
  
  const yuan = Math.floor(yearIndex / TOTAL_YEARS)
  const hui = Math.floor(yearInCycle / YEARS_PER_HUI)
  const yunInHui = Math.floor((yearInCycle % YEARS_PER_HUI) / YEARS_PER_YUN)
  const shi = Math.floor((yearInCycle % YEARS_PER_YUN) / YEARS_PER_SHI)
  const yearInShi = yearInCycle % YEARS_PER_SHI

  // 计算全局运和世编号
  const globalYun = hui * YUNS_PER_HUI + yunInHui + 1  // 1-360
  const globalShi = (globalYun - 1) * SHIS_PER_YUN + shi + 1  // 1-4320

  // 天干地支（按皇极经世原文）
  // 日（元）用天干：元从0开始，对应甲
  const yuanStem = getStem(yuan)
  // 月（会）用地支：会从0开始，对应子
  const huiBranch = getBranch(hui)
  // 星（运）用天干：全局运编号-1，对应甲乙丙...（每10循环）
  const yunStem = getStem(globalYun - 1)
  // 辰（世）用地支：全局世编号-1，对应子丑寅...（每12循环）
  const shiBranch = getBranch(globalShi - 1)

  return {
    yearIndex,
    yearInCycle,
    yuan,
    hui,
    yun: yunInHui,
    shi,
    yearInShi,
    yuanStem,
    huiBranch,
    yunStem,
    shiBranch,
    globalYun,
    globalShi,
  }
}

/**
 * 从位置计算绝对年索引
 */
export function positionToYearIndex(pos: ZoomPosition): number {
  let yearIndex = pos.yuan * TOTAL_YEARS
  if (pos.hui !== undefined) yearIndex += pos.hui * YEARS_PER_HUI
  if (pos.yun !== undefined) yearIndex += pos.yun * YEARS_PER_YUN
  if (pos.shi !== undefined) yearIndex += pos.shi * YEARS_PER_SHI
  if (pos.nian !== undefined) yearIndex += pos.nian
  return yearIndex
}

/**
 * 从年索引计算位置
 */
export function yearIndexToPosition(yearIndex: number, level: ZoomLevel): ZoomPosition {
  const state = calcState(yearIndex)
  const pos: ZoomPosition = { yuan: state.yuan }
  
  if (level === 'yuan') return pos
  pos.hui = state.hui
  
  if (level === 'hui') return pos
  pos.yun = state.yun
  
  if (level === 'yun') return pos
  pos.shi = state.shi
  
  if (level === 'shi') return pos
  pos.nian = state.yearInShi
  
  return pos
}

/**
 * 构建元级数据（类似年级的 buildYear）
 * 元级：12会，每会30运
 */
export function buildYuan(yuanIndex: number): YuanData {
  const baseYear = yuanIndex * TOTAL_YEARS
  
  const huis: HuiData[] = Array.from({ length: HUIS_PER_YUAN }, (_, h) => {
    const huiBaseYear = baseYear + h * YEARS_PER_HUI
    // 计算该会第1运和第16运的全局运编号
    const firstYunGlobal = h * YUNS_PER_HUI + 1  // 会的第1运
    const midYunGlobal = h * YUNS_PER_HUI + 16   // 会的第16运
    
    const yuns: YunData[] = Array.from({ length: YUNS_PER_HUI }, (_, y) => {
      const yunStart = huiBaseYear + y * YEARS_PER_YUN
      return {
        index: y,
        yunNumber: y + 1,
        yearStart: yunStart,
        yearEnd: yunStart + YEARS_PER_YUN - 1,
      }
    })

    return {
      index: h,
      branch: EARTHLY_BRANCHES[h],
      branchPinyin: BRANCH_PINYIN[h],
      yuns,
      // 使用运节气函数计算：第1运和第16运的运节气
      termStart: SOLAR_TERMS[getYunTermIndex(firstYunGlobal)],
      termEnd: SOLAR_TERMS[getYunTermIndex(midYunGlobal)],
    }
  })

  return { yuanIndex, huis }
}

/**
 * 构建运级数据（类似年级的 buildYear）
 * 运级：12世，每世30年
 * 节气遵循"冬至起于子"：子辰=冬至/小寒，丑辰=大寒/立春...
 */
export function buildYun(position: ZoomPosition): YunViewData {
  const hui = position.hui ?? 0
  const yun = position.yun ?? 0
  const baseYear = position.yuan * TOTAL_YEARS + hui * YEARS_PER_HUI + yun * YEARS_PER_YUN
  
  const shis: ShiData[] = Array.from({ length: SHIS_PER_YUN }, (_, s) => {
    const shiBaseYear = baseYear + s * YEARS_PER_SHI
    
    const nians: NianData[] = Array.from({ length: YEARS_PER_SHI }, (_, n) => {
      return {
        index: n,
        nianNumber: n + 1,
        yearIndex: shiBaseYear + n,
      }
    })

    // 冬至起于子：冬至在SOLAR_TERMS中索引为23
    // 子辰(s=0): 冬至(23)、小寒(0)
    // 丑辰(s=1): 大寒(1)、立春(2)
    const termStartIndex = (s * 2 + 23) % 24
    const termEndIndex = (s * 2 + 24) % 24

    return {
      index: s,
      branch: EARTHLY_BRANCHES[s],
      branchPinyin: BRANCH_PINYIN[s],
      nians,
      termStart: SOLAR_TERMS[termStartIndex],
      termEnd: SOLAR_TERMS[termEndIndex],
    }
  })

  return { position, shis }
}

/**
 * 构建年度数据
 */
export function buildYear(yearIndex: number): YearData {
  const state = calcState(yearIndex)
  
  const months: MonthData[] = Array.from({ length: MONTHS_PER_YEAR }, (_, m) => {
    const days: DayData[] = Array.from({ length: DAYS_PER_MONTH }, (_, d) => {
      const dayOfYear = m * DAYS_PER_MONTH + d + 1
      // 使用校准后的天节气计算函数
      const termIndex = getDayTermIndex(dayOfYear)
      const isTermStart = isDayTermStart(dayOfYear)
      
      return {
        dayOfMonth: d + 1,
        dayOfYear,
        termIndex,
        termName: SOLAR_TERMS[termIndex],
        isTermStart,
      }
    })

    return {
      index: m,
      branch: EARTHLY_BRANCHES[m],
      branchPinyin: BRANCH_PINYIN[m],
      days,
    }
  })

  return { state, months }
}

/**
 * 构建缩放视图数据
 */
export function buildZoomView(position: ZoomPosition, level: ZoomLevel): ZoomViewData {
  let items: ZoomItemData[] = []
  let title = ''
  let subtitle = ''

  switch (level) {
    case 'yuan': {
      // 元级：显示12会
      title = `第${position.yuan + 1}元`
      subtitle = `共12会 · 129600年`
      const baseYear = position.yuan * TOTAL_YEARS
      items = Array.from({ length: 12 }, (_, i) => {
        const yearStart = baseYear + i * YEARS_PER_HUI
        return {
          index: i,
          name: `${EARTHLY_BRANCHES[i]}会`,
          pinyin: BRANCH_PINYIN[i],
          yearStart,
          yearEnd: yearStart + YEARS_PER_HUI - 1,
          yearCount: YEARS_PER_HUI,
          branchIndex: i,
          termSummary: getTermSummaryForRange(i * 2, 2), // 每会2个节气周期
        }
      })
      break
    }
    case 'hui': {
      // 会级：显示30运
      const hui = position.hui ?? 0
      title = `第${position.yuan + 1}元 · ${EARTHLY_BRANCHES[hui]}会`
      subtitle = `共30运 · 10800年`
      const baseYear = position.yuan * TOTAL_YEARS + hui * YEARS_PER_HUI
      items = Array.from({ length: 30 }, (_, i) => {
        const yearStart = baseYear + i * YEARS_PER_YUN
        return {
          index: i,
          name: `第${i + 1}运`,
          yearStart,
          yearEnd: yearStart + YEARS_PER_YUN - 1,
          yearCount: YEARS_PER_YUN,
          termSummary: SOLAR_TERMS.slice(0, 24) as unknown as string[], // 每运包含完整24节气循环
        }
      })
      break
    }
    case 'yun': {
      // 运级：显示12世
      const hui = position.hui ?? 0
      const yun = position.yun ?? 0
      title = `第${position.yuan + 1}元 · ${EARTHLY_BRANCHES[hui]}会 · 第${yun + 1}运`
      subtitle = `共12世 · 360年`
      const baseYear = position.yuan * TOTAL_YEARS + hui * YEARS_PER_HUI + yun * YEARS_PER_YUN
      items = Array.from({ length: 12 }, (_, i) => {
        const yearStart = baseYear + i * YEARS_PER_SHI
        return {
          index: i,
          name: `${EARTHLY_BRANCHES[i]}世`,
          pinyin: BRANCH_PINYIN[i],
          yearStart,
          yearEnd: yearStart + YEARS_PER_SHI - 1,
          yearCount: YEARS_PER_SHI,
          branchIndex: i,
          termSummary: getTermSummaryForRange(i * 2, 2),
        }
      })
      break
    }
    case 'shi': {
      // 世级：显示30年
      const hui = position.hui ?? 0
      const yun = position.yun ?? 0
      const shi = position.shi ?? 0
      title = `第${position.yuan + 1}元 · ${EARTHLY_BRANCHES[hui]}会 · 第${yun + 1}运 · ${EARTHLY_BRANCHES[shi]}世`
      subtitle = `共30年`
      const baseYear = position.yuan * TOTAL_YEARS + hui * YEARS_PER_HUI + yun * YEARS_PER_YUN + shi * YEARS_PER_SHI
      items = Array.from({ length: 30 }, (_, i) => {
        const yearStart = baseYear + i
        return {
          index: i,
          name: `第${i + 1}年`,
          yearStart,
          yearEnd: yearStart,
          yearCount: 1,
          termSummary: SOLAR_TERMS.slice(0, 24) as unknown as string[],
        }
      })
      break
    }
    case 'nian': {
      // 年级：显示12月（由 Calendar 组件处理）
      const hui = position.hui ?? 0
      const yun = position.yun ?? 0
      const shi = position.shi ?? 0
      const nian = position.nian ?? 0
      const yearIndex = position.yuan * TOTAL_YEARS + hui * YEARS_PER_HUI + yun * YEARS_PER_YUN + shi * YEARS_PER_SHI + nian
      title = formatPositionFull(position)
      subtitle = `共12月 · 360天 · 24节气`
      items = Array.from({ length: 12 }, (_, i) => ({
        index: i,
        name: `${EARTHLY_BRANCHES[i]}月`,
        pinyin: BRANCH_PINYIN[i],
        yearStart: yearIndex,
        yearEnd: yearIndex,
        yearCount: 1,
        branchIndex: i,
        termSummary: [SOLAR_TERMS[i * 2], SOLAR_TERMS[i * 2 + 1]],
      }))
      break
    }
  }

  return { level, position, items, title, subtitle }
}

/**
 * 获取节气摘要
 */
function getTermSummaryForRange(startIndex: number, count: number): string[] {
  const terms: string[] = []
  for (let i = 0; i < count; i++) {
    terms.push(SOLAR_TERMS[(startIndex + i) % 24])
  }
  return terms
}

/**
 * 获取会名称
 */
export function getHuiName(huiIndex: number): string {
  return `${EARTHLY_BRANCHES[huiIndex % 12]}会`
}

/**
 * 获取月名称
 */
export function getMonthName(monthIndex: number): string {
  return `${EARTHLY_BRANCHES[monthIndex % 12]}月`
}

/**
 * 格式化完整时间位置
 */
export function formatPosition(state: CalendarState): string {
  const huiName = getHuiName(state.hui)
  return `第${state.yuan + 1}元 · ${huiName} · 第${state.yun + 1}运 · ${EARTHLY_BRANCHES[state.shi]}世 · 第${state.yearInShi + 1}年`
}

/**
 * 格式化位置对象
 */
export function formatPositionFull(pos: ZoomPosition): string {
  let result = `第${pos.yuan + 1}元`
  if (pos.hui !== undefined) result += ` · ${EARTHLY_BRANCHES[pos.hui]}会`
  if (pos.yun !== undefined) result += ` · 第${pos.yun + 1}运`
  if (pos.shi !== undefined) result += ` · ${EARTHLY_BRANCHES[pos.shi]}世`
  if (pos.nian !== undefined) result += ` · 第${pos.nian + 1}年`
  return result
}

/**
 * 获取上一级缩放
 */
export function getParentLevel(level: ZoomLevel): ZoomLevel | null {
  const idx = ZOOM_LEVELS.indexOf(level)
  return idx > 0 ? ZOOM_LEVELS[idx - 1] : null
}

/**
 * 获取下一级缩放
 */
export function getChildLevel(level: ZoomLevel): ZoomLevel | null {
  const idx = ZOOM_LEVELS.indexOf(level)
  return idx < ZOOM_LEVELS.length - 1 ? ZOOM_LEVELS[idx + 1] : null
}

/**
 * 缩放到父级
 */
export function zoomOut(position: ZoomPosition, level: ZoomLevel): { position: ZoomPosition; level: ZoomLevel } | null {
  const parentLevel = getParentLevel(level)
  if (!parentLevel) return null
  
  const newPos = { ...position }
  // 移除当前级别的位置信息
  switch (level) {
    case 'hui': delete newPos.hui; break
    case 'yun': delete newPos.yun; break
    case 'shi': delete newPos.shi; break
    case 'nian': delete newPos.nian; break
  }
  
  return { position: newPos, level: parentLevel }
}

/**
 * 缩放到子级
 */
export function zoomIn(position: ZoomPosition, level: ZoomLevel, itemIndex: number): { position: ZoomPosition; level: ZoomLevel } | null {
  const childLevel = getChildLevel(level)
  if (!childLevel) return null
  
  const newPos = { ...position }
  switch (level) {
    case 'yuan': newPos.hui = itemIndex; break
    case 'hui': newPos.yun = itemIndex; break
    case 'yun': newPos.shi = itemIndex; break
    case 'shi': newPos.nian = itemIndex; break
  }
  
  return { position: newPos, level: childLevel }
}
