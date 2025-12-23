import { getTermStartDate, getSolarTerm } from './solarTerms';

// 不依赖外部导入，避免潜在的循环依赖问题
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 基准日期：2000年1月1日 戊午日 (索引54)
// 注意：月份从0开始，所以2000, 0, 1
const BASE_DATE = new Date(2000, 0, 1);
const BASE_GANZHI_INDEX = 54; // 戊午

// 节气索引对应的月支（以节分月）
// 立春(2)-惊蛰前: 寅月(2)
// 惊蛰(4)-清明前: 卯月(3)
// ...规律：termIndex 2,4,6...22,0 对应月支 2,3,4...11,0,1
const TERM_TO_MONTH_BRANCH: Record<number, number> = {
  2: 2,   // 立春 -> 寅
  4: 3,   // 惊蛰 -> 卯
  6: 4,   // 清明 -> 辰
  8: 5,   // 立夏 -> 巳
  10: 6,  // 芒种 -> 午
  12: 7,  // 小暑 -> 未
  14: 8,  // 立秋 -> 申
  16: 9,  // 白露 -> 酉
  18: 10, // 寒露 -> 戌
  20: 11, // 立冬 -> 亥
  22: 0,  // 大雪 -> 子
  0: 1,   // 小寒 -> 丑
};

/**
 * 计算日期的日干支
 * @param date Date对象
 * @returns 干支字符串 (如 "甲子")
 */
export function getGanZhi(date: Date): string {
  // 确保date是有效的Date对象
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  // 计算与基准日期的天数差
  // 使用 UTC 时间避免时区问题，或者统一设置为中午12点
  // 这里简单处理：忽略时分秒，重置为当日0点
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const base = new Date(BASE_DATE.getFullYear(), BASE_DATE.getMonth(), BASE_DATE.getDate());
  
  const diffTime = d.getTime() - base.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  // 计算偏移后的干支索引
  // JavaScript % 操作符对负数返回负数，需要修正
  let index = (BASE_GANZHI_INDEX + diffDays) % 60;
  if (index < 0) index += 60;
  
  const stemIndex = index % 10;
  const branchIndex = index % 12;
  
  return HEAVENLY_STEMS[stemIndex] + EARTHLY_BRANCHES[branchIndex];
}

/**
 * 计算日期的年干支（八字年柱，以立春分年）
 * @param date Date对象
 * @returns 干支字符串 (如 "乙巳")
 */
export function getYearGanZhi(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  
  // 获取该年立春日期（节气索引2=立春）
  const lichun = getTermStartDate(year, 2);
  
  // 判断是否在立春之前
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const ganzhiYear = d.getTime() < lichun.getTime() ? year - 1 : year;
  
  // 计算年干支
  // 基准：1984年为甲子年（索引0）
  // 公式：(year - 1984) % 60
  let index = (ganzhiYear - 1984) % 60;
  if (index < 0) index += 60;
  
  const stemIndex = index % 10;
  const branchIndex = index % 12;
  
  return HEAVENLY_STEMS[stemIndex] + EARTHLY_BRANCHES[branchIndex];
}

/**
 * 计算日期的月干支（八字月柱，以节分月）
 * @param date Date对象
 * @returns 干支字符串 (如 "丙子")
 */
export function getMonthGanZhi(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const d = new Date(year, month, date.getDate());
  
  // 12个"节"（偶数索引节气）对应12个月
  // 节气索引：0小寒 2立春 4惊蛰 6清明 8立夏 10芒种 12小暑 14立秋 16白露 18寒露 20立冬 22大雪
  // 对应月份：丑月 寅月 卯月 辰月 巳月 午月 未月 申月 酉月 戌月 亥月 子月
  
  // 构建候选节气列表（当年所有节 + 去年大雪），按时间倒序排列后查找
  interface JieCandidate {
    jieIdx: number;
    jieYear: number;
    jieDate: Date;
  }
  
  const candidates: JieCandidate[] = [];
  
  // 添加今年所有的"节"
  const jieIndices = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
  for (const jieIdx of jieIndices) {
    candidates.push({
      jieIdx,
      jieYear: year,
      jieDate: getTermStartDate(year, jieIdx)
    });
  }
  // 添加去年大雪（处理年初1月在小寒前的情况）
  candidates.push({
    jieIdx: 22,
    jieYear: year - 1,
    jieDate: getTermStartDate(year - 1, 22)
  });
  
  // 按日期倒序排列
  candidates.sort((a, b) => b.jieDate.getTime() - a.jieDate.getTime());
  
  // 找到第一个 <= 当前日期的节
  let found = candidates.find(c => d.getTime() >= c.jieDate.getTime());
  
  if (!found) {
    // 如果都没找到，用去年大雪
    found = candidates[candidates.length - 1];
  }
  
  const currentJieIndex = found.jieIdx;
  const jieYear = found.jieYear;
  
  // 获取月支
  const monthBranchIndex = TERM_TO_MONTH_BRANCH[currentJieIndex];
  
  // 计算月干
  // 年上起月法：甲己之年丙作首(寅月起丙)，乙庚之岁戊为头，丙辛必定寻庚起，丁壬壬位顺行流，戊癸之年甲寅始
  
  // 确定该月属于哪个干支年
  // 子月(大雪后)和丑月(小寒后)属于当前干支年（因为还没到立春）
  // 立春之后的月份属于新的干支年
  // 注意：大雪(22)在12月，小寒(0)在1月，它们都在立春前
  let yearForGanzhi: number;
  if (currentJieIndex === 22) {
    // 大雪(12月)，属于当年干支年
    yearForGanzhi = jieYear;
  } else if (currentJieIndex === 0) {
    // 小寒(1月)，还是上一年的干支年
    yearForGanzhi = jieYear - 1;
  } else {
    // 立春及之后的月份，属于当年干支年
    yearForGanzhi = jieYear;
  }
  
  // 年干索引 (1984年为甲子年)
  let yearStemIndex = (yearForGanzhi - 1984) % 10;
  if (yearStemIndex < 0) yearStemIndex += 10;
  
  // 寅月天干起始：甲己丙(2)，乙庚戊(4)，丙辛庚(6)，丁壬壬(8)，戊癸甲(0)
  const yinMonthStemStart = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0][yearStemIndex];
  
  // 当前月相对寅月(2)的偏移
  // 月支: 2寅 3卯 4辰 5巳 6午 7未 8申 9酉 10戌 11亥 0子 1丑
  // 偏移: 0    1   2   3   4   5   6   7   8    9   10  11
  let monthOffset = monthBranchIndex - 2;
  if (monthOffset < 0) monthOffset += 12;
  
  const monthStemIndex = (yinMonthStemStart + monthOffset) % 10;
  
  return HEAVENLY_STEMS[monthStemIndex] + EARTHLY_BRANCHES[monthBranchIndex];
}

/**
 * 计算时辰的干支（日上起时法）
 * @param date Date对象（包含时分秒）
 * @returns 干支字符串 (如 "甲子")
 */
export function getHourGanZhi(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  const hour = date.getHours();
  
  // 确定时辰地支索引
  // 子时(23-01) 丑时(01-03) 寅时(03-05) 卯时(05-07) 辰时(07-09) 巳时(09-11)
  // 午时(11-13) 未时(13-15) 申时(15-17) 酉时(17-19) 戌时(19-21) 亥时(21-23)
  let branchIndex: number;
  if (hour >= 23 || hour < 1) {
    branchIndex = 0; // 子
  } else if (hour < 3) {
    branchIndex = 1; // 丑
  } else if (hour < 5) {
    branchIndex = 2; // 寅
  } else if (hour < 7) {
    branchIndex = 3; // 卯
  } else if (hour < 9) {
    branchIndex = 4; // 辰
  } else if (hour < 11) {
    branchIndex = 5; // 巳
  } else if (hour < 13) {
    branchIndex = 6; // 午
  } else if (hour < 15) {
    branchIndex = 7; // 未
  } else if (hour < 17) {
    branchIndex = 8; // 申
  } else if (hour < 19) {
    branchIndex = 9; // 酉
  } else if (hour < 21) {
    branchIndex = 10; // 戌
  } else {
    branchIndex = 11; // 亥
  }

  // 确定用于计算时干的日期
  // 23:00后属于次日的子时，使用次日的日干
  let dayForGanzhi = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (hour >= 23) {
    dayForGanzhi = new Date(dayForGanzhi.getTime() + 24 * 60 * 60 * 1000);
  }

  // 获取日干
  const dayGanZhi = getGanZhi(dayForGanzhi);
  if (!dayGanZhi) return '';
  
  const dayStemIndex = HEAVENLY_STEMS.indexOf(dayGanZhi[0]);

  // 日上起时法：
  // 甲己日(0,5): 子时起甲(0)
  // 乙庚日(1,6): 子时起丙(2)
  // 丙辛日(2,7): 子时起戊(4)
  // 丁壬日(3,8): 子时起庚(6)
  // 戊癸日(4,9): 子时起壬(8)
  const ziHourStemStart = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8][dayStemIndex];

  // 时辰天干 = 子时天干 + 时辰偏移
  const hourStemIndex = (ziHourStemStart + branchIndex) % 10;

  return HEAVENLY_STEMS[hourStemIndex] + EARTHLY_BRANCHES[branchIndex];
}

/**
 * 计算皇极经世历的月干支
 * 规则：
 * - 以冬至为子月起始（而非八字的大雪起子月）
 * - 年上起月法基于皇极年干（冬至换年）
 * @param date Date对象
 * @returns 干支字符串 (如 "戊子")
 */
// 十二消息卦（十二辟卦）对应月支
// 反映阴阳消长的变化规律
// 使用64卦Unicode字符 (U+4DC0 - U+4DFF)
const MONTH_HEXAGRAMS: { name: string; symbol: string; description: string }[] = [
  { name: '復', symbol: '䷗', description: '一陽生' },   // 子月 - 冬至 (地雷复)
  { name: '臨', symbol: '䷒', description: '二陽' },     // 丑月 (地泽临)
  { name: '泰', symbol: '䷊', description: '三陽' },     // 寅月 (地天泰)
  { name: '大壯', symbol: '䷡', description: '四陽' },   // 卯月 (雷天大壮)
  { name: '夬', symbol: '䷪', description: '五陽' },     // 辰月 (泽天夬)
  { name: '乾', symbol: '䷀', description: '六陽（純陽）' }, // 巳月 (乾为天)
  { name: '姤', symbol: '䷫', description: '一陰生' },   // 午月 - 夏至 (天风姤)
  { name: '遯', symbol: '䷠', description: '二陰' },     // 未月 (天山遁)
  { name: '否', symbol: '䷋', description: '三陰' },     // 申月 (天地否)
  { name: '觀', symbol: '䷓', description: '四陰' },     // 酉月 (风地观)
  { name: '剝', symbol: '䷖', description: '五陰' },     // 戌月 (山地剥)
  { name: '坤', symbol: '䷁', description: '六陰（純陰）' }, // 亥月 (坤为地)
];

/**
 * 获取月卦（十二消息卦）
 * @param monthBranchIndex 月支索引 (0=子, 1=丑, ...11=亥)
 * @returns 月卦信息 { name, symbol, description }
 */
export function getMonthHexagram(monthBranchIndex: number): { name: string; symbol: string; description: string } {
  const index = ((monthBranchIndex % 12) + 12) % 12;
  return MONTH_HEXAGRAMS[index];
}

/**
 * 根据日期获取皇极经世历的月卦
 * @param date Date对象
 * @returns 月卦信息 { name, symbol, description }
 */
export function getHuangjiMonthHexagram(date: Date): { name: string; symbol: string; description: string } | null {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return null;
  }
  
  const termInfo = getSolarTerm(date);
  return getMonthHexagram(termInfo.huangji.month);
}

export function getHuangjiMonthGanZhi(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  // 获取皇极月支（0=子, 1=丑, ...11=亥）
  const termInfo = getSolarTerm(date);
  const huangjiMonthIndex = termInfo.huangji.month;

  // 确定皇极年份（以冬至换年）
  const gregorianYear = date.getFullYear();
  const dongzhiThisYear = getTermStartDate(gregorianYear, 23); // 冬至
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  // 如果在冬至之后，皇极年对应公历下一年
  const isAfterDongzhi = d.getTime() >= dongzhiThisYear.getTime();
  const huangjiGregorianYear = isAfterDongzhi ? gregorianYear + 1 : gregorianYear;
  
  // 皇极年干支（1984年为甲子年）
  let huangjiYearIndex = (huangjiGregorianYear - 1984) % 60;
  if (huangjiYearIndex < 0) huangjiYearIndex += 60;
  const huangjiYearStemIndex = huangjiYearIndex % 10;

  // 年上起月法（与八字相同）：
  // 甲己之年丙作首(寅月起丙)，乙庚之岁戊为头，丙辛必定寻庚起，丁壬壬位顺行流，戊癸之年甲寅始
  // 寅月天干起始：甲己丙(2)，乙庚戊(4)，丙辛庚(6)，丁壬壬(8)，戊癸甲(0)
  const yinMonthStemStart = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0][huangjiYearStemIndex];

  // 当前皇极月支相对寅月(2)的偏移
  // 月支: 0子 1丑 2寅 3卯 4辰 5巳 6午 7未 8申 9酉 10戌 11亥
  // 偏移: 10  11  0   1   2   3   4   5   6   7   8    9
  let monthOffset = huangjiMonthIndex - 2;
  if (monthOffset < 0) monthOffset += 12;

  const monthStemIndex = (yinMonthStemStart + monthOffset) % 10;

  return HEAVENLY_STEMS[monthStemIndex] + EARTHLY_BRANCHES[huangjiMonthIndex];
}
