/**
 * 农历（阴阳历）工具函数
 * 基于 lunisolar 库实现
 * 
 * 用于将公历日期转换为农历日期（几月初几格式）
 */

// @ts-ignore lunisolar 没有类型声明
import lunisolar from 'lunisolar'

// 农历月份中文名
const LUNAR_MONTHS = [
  '正月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '冬月', '腊月'
]

// 农历日期中文名
const LUNAR_DAYS = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
]

/**
 * 获取农历日期信息
 * @param date 公历日期
 * @returns 农历日期对象
 */
export function getLunarDate(date: Date): {
  year: number       // 农历年（数字）
  month: number      // 农历月（1-12）
  day: number        // 农历日（1-30）
  isLeapMonth: boolean  // 是否闰月
  monthName: string  // 月份名称（如"正月"、"闰四月"）
  dayName: string    // 日期名称（如"初一"、"十五"）
  yearName: string   // 年份名称（如"甲子年"）
} {
  const lunar = lunisolar(date)
  const lunarData = lunar.lunar
  
  const monthIndex = lunarData.month - 1  // lunisolar 月份从1开始
  const dayIndex = lunarData.day - 1
  
  const isLeapMonth = lunarData.isLeapMonth
  const monthName = isLeapMonth 
    ? `闰${LUNAR_MONTHS[monthIndex]}` 
    : LUNAR_MONTHS[monthIndex]
  const dayName = LUNAR_DAYS[dayIndex]
  
  // 获取干支年名
  const yearName = lunar.format('cY')
  
  return {
    year: lunarData.year,
    month: lunarData.month,
    day: lunarData.day,
    isLeapMonth,
    monthName,
    dayName,
    yearName,
  }
}

/**
 * 获取格式化的农历日期字符串
 * @param date 公历日期
 * @returns 格式化的农历日期，如"正月初一"、"闰四月十五"
 */
export function getLunarDateString(date: Date): string {
  const lunar = getLunarDate(date)
  return `${lunar.monthName}${lunar.dayName}`
}

/**
 * 获取完整的农历日期字符串（含年份）
 * @param date 公历日期
 * @returns 格式化的农历日期，如"甲子年正月初一"
 */
export function getFullLunarDateString(date: Date): string {
  const lunar = getLunarDate(date)
  return `${lunar.yearName}${lunar.monthName}${lunar.dayName}`
}

/**
 * 八字四柱信息
 */
export interface BaziPillar {
  ganZhi: string      // 干支（如"甲子"）
  gan: string         // 天干（如"甲"）
  zhi: string         // 地支（如"子"）
  wuXing: string      // 五行（如"木水"）
  naYin: string       // 纳音（如"海中金"）
}

/**
 * 完整的日期详情（包含 lunisolar 所有功能）
 */
export interface DateDetail {
  // 公历
  gregorian: {
    year: number
    month: number
    day: number
    hour: number
    minute: number
    weekday: string
    dateStr: string
  }
  // 农历
  lunar: {
    year: number
    month: number
    day: number
    isLeapMonth: boolean
    monthName: string
    dayName: string
    yearGanZhi: string
    dateStr: string
  }
  // 八字四柱（lunisolar 版本）
  bazi: {
    year: BaziPillar
    month: BaziPillar
    day: BaziPillar
    hour: BaziPillar
  }
  // 节气
  solarTerm: string | null
  // 星期
  weekdayIndex: number
}

// 天干五行对照
const GAN_WUXING: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
}

// 地支五行对照
const ZHI_WUXING: Record<string, string> = {
  '子': '水', '丑': '土',
  '寅': '木', '卯': '木',
  '辰': '土', '巳': '火',
  '午': '火', '未': '土',
  '申': '金', '酉': '金',
  '戌': '土', '亥': '水',
}

// 六十甲子纳音表
const JIAZI_NAYIN: Record<string, string> = {
  '甲子': '海中金', '乙丑': '海中金',
  '丙寅': '炉中火', '丁卯': '炉中火',
  '戊辰': '大林木', '己巳': '大林木',
  '庚午': '路旁土', '辛未': '路旁土',
  '壬申': '剑锋金', '癸酉': '剑锋金',
  '甲戌': '山头火', '乙亥': '山头火',
  '丙子': '涧下水', '丁丑': '涧下水',
  '戊寅': '城头土', '己卯': '城头土',
  '庚辰': '白蜡金', '辛巳': '白蜡金',
  '壬午': '杨柳木', '癸未': '杨柳木',
  '甲申': '泉中水', '乙酉': '泉中水',
  '丙戌': '屋上土', '丁亥': '屋上土',
  '戊子': '霹雳火', '己丑': '霹雳火',
  '庚寅': '松柏木', '辛卯': '松柏木',
  '壬辰': '长流水', '癸巳': '长流水',
  '甲午': '砂中金', '乙未': '砂中金',
  '丙申': '山下火', '丁酉': '山下火',
  '戊戌': '平地木', '己亥': '平地木',
  '庚子': '壁上土', '辛丑': '壁上土',
  '壬寅': '金箔金', '癸卯': '金箔金',
  '甲辰': '覆灯火', '乙巳': '覆灯火',
  '丙午': '天河水', '丁未': '天河水',
  '戊申': '大驿土', '己酉': '大驿土',
  '庚戌': '钗钏金', '辛亥': '钗钏金',
  '壬子': '桑柘木', '癸丑': '桑柘木',
  '甲寅': '大溪水', '乙卯': '大溪水',
  '丙辰': '沙中土', '丁巳': '沙中土',
  '戊午': '天上火', '己未': '天上火',
  '庚申': '石榴木', '辛酉': '石榴木',
  '壬戌': '大海水', '癸亥': '大海水',
}

// 星期中文名
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

/**
 * 解析干支获取五行和纳音
 */
function parsePillar(ganZhi: string): BaziPillar {
  const gan = ganZhi.charAt(0)
  const zhi = ganZhi.charAt(1)
  const ganWuXing = GAN_WUXING[gan] || ''
  const zhiWuXing = ZHI_WUXING[zhi] || ''
  const naYin = JIAZI_NAYIN[ganZhi] || ''
  
  return {
    ganZhi,
    gan,
    zhi,
    wuXing: ganWuXing + zhiWuXing,
    naYin,
  }
}

/**
 * 获取完整的日期详情（包含 lunisolar 所有功能）
 * @param date 公历日期
 * @returns 完整的日期详情对象
 */
export function getDateDetail(date: Date): DateDetail {
  const ls = lunisolar(date)
  const lunarData = ls.lunar
  
  // 公历信息
  const gregorian = {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    weekday: WEEKDAYS[date.getDay()],
    dateStr: `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`,
  }
  
  // 农历信息
  const monthIndex = lunarData.month - 1
  const dayIndex = lunarData.day - 1
  const isLeapMonth = lunarData.isLeapMonth
  const monthName = isLeapMonth 
    ? `闰${LUNAR_MONTHS[monthIndex]}` 
    : LUNAR_MONTHS[monthIndex]
  const dayName = LUNAR_DAYS[dayIndex]
  const yearGanZhi = ls.format('cY')
  
  const lunar = {
    year: lunarData.year,
    month: lunarData.month,
    day: lunarData.day,
    isLeapMonth,
    monthName,
    dayName,
    yearGanZhi,
    dateStr: `${yearGanZhi}年${monthName}${dayName}`,
  }
  
  // 八字四柱
  const yearBazi = ls.format('cY')
  const monthBazi = ls.format('cM')
  const dayBazi = ls.format('cD')
  const hourBazi = ls.format('cH')
  
  const bazi = {
    year: parsePillar(yearBazi),
    month: parsePillar(monthBazi),
    day: parsePillar(dayBazi),
    hour: parsePillar(hourBazi),
  }
  
  // 节气（lunisolar 的节气信息）
  let solarTerm: string | null = null
  try {
    const term = ls.solarTerm
    if (term) {
      solarTerm = term.toString()
    }
  } catch {
    solarTerm = null
  }
  
  return {
    gregorian,
    lunar,
    bazi,
    solarTerm,
    weekdayIndex: date.getDay(),
  }
}

