// 节气计算常量 (21世纪 C值)
const C_21 = [
  5.4055, 20.12, 3.87, 18.73, 5.63, 20.646, // 小寒-春分
  4.81, 20.1, 5.52, 21.04, 5.678, 21.37,    // 清明-夏至
  7.108, 22.83, 7.5, 23.13, 7.646, 23.042,  // 小暑-秋分
  8.318, 23.438, 7.438, 22.36, 7.18, 21.94  // 寒露-冬至
];

export const SOLAR_TERM_NAMES = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
  '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
];

/**
 * 计算指定年份第n个节气的日期 (1-31)
 * @param year 公历年份
 * @param n 节气索引 (0=小寒, 1=大寒, ..., 23=冬至)
 * @returns 日期 (日)
 */
export function getTermDay(year: number, n: number): number {
  const y = year % 100;
  const d = 0.2422;
  const c = C_21[n];
  let l = Math.floor(y / 4);
  
  // 2000年后的修正
  if (year >= 2000) {
    // 特殊修正（简易版，覆盖常见年份）
    if (n === 0 && year === 2019) l -= 1; // 小寒 2019
    if (n === 1 && year === 2082) l += 1; // 大寒 2082
    // ... 更多修正可根据精度需求添加，此处使用通用公式足够日常显示
  }
  
  return Math.floor(y * d + c) - l;
}

/**
 * 获取日期的节气信息
 * @param date Date对象
 */
export function getSolarTerm(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const day = date.getDate();

  // 查找当月及前后的节气
  // 简单策略：遍历当月两个节气，看日期落在哪个区间
  
  // 节气大致分布：每月上旬一个(4-8日)，下旬一个(19-24日)
  // 小寒(0)在1月(0)，大寒(1)在1月
  // 节气索引 = month * 2 + k
  
  const term1Index = month * 2;
  const term1Day = getTermDay(year, term1Index);
  
  const term2Index = month * 2 + 1;
  const term2Day = getTermDay(year, term2Index);

  // 计算下一个月的第一个节气，用于确定当前节气结束
  let nextTermYear = year;
  let nextTermIndex = term2Index + 1;
  if (nextTermIndex >= 24) {
    nextTermIndex = 0;
    nextTermYear++;
  }
  // const nextTermDay = getTermDay(nextTermYear, nextTermIndex);

  // 计算上一个月的第二个节气，用于确定月初属于哪个节气
  let prevTermYear = year;
  let prevTermIndex = term1Index - 1;
  if (prevTermIndex < 0) {
    prevTermIndex = 23;
    prevTermYear--;
  }
  const prevTermDay = getTermDay(prevTermYear, prevTermIndex);
  
  let currentTermIndex = -1;
  let currentTermStartDate: Date;

  const dateTs = new Date(year, month, day).getTime();
  const term1Date = new Date(year, month, term1Day);
  const term2Date = new Date(year, month, term2Day);
  
  if (dateTs < term1Date.getTime()) {
    // 在当月第一个节气之前 -> 属于上个月第二个节气
    currentTermIndex = prevTermIndex;
    currentTermStartDate = new Date(prevTermYear, prevTermIndex < 23 ? month - 1 : 11, prevTermDay);
    if (prevTermIndex === 23 && month === 0) {
       currentTermStartDate = new Date(prevTermYear, 11, prevTermDay); // 去年12月
    } else if (month === 0) { // Should not happen if index!=23? prevIndex is -1 handled above
       // month-1 would be -1, date handles it? JS Date(2025, -1, x) works.
       // let's be explicit
       currentTermStartDate = new Date(year, month - 1, prevTermDay);
    }
  } else if (dateTs >= term1Date.getTime() && dateTs < term2Date.getTime()) {
    // 属于第一个节气
    currentTermIndex = term1Index;
    currentTermStartDate = term1Date;
  } else {
    // 属于第二个节气
    currentTermIndex = term2Index;
    currentTermStartDate = term2Date;
  }

  // 计算在该节气中的第几天（1-based）
  const diffTime = Math.abs(dateTs - currentTermStartDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 因为当天是第1天
  
  // 皇极经世映射：
  // 1. 节气 -> 皇极节气 (0-23)
  // 2. 皇极经世的一年从冬至(23)开始
  // 3. 皇极天数 = 距离冬至的节气数 * 15 + min(当前天数, 15)
  
  // 距离冬至的节气数
  // Dongzhi is 23. 
  // 23 -> 0
  // 0 -> 1
  // ...
  // k = (index - 23 + 24) % 24
  const termsSinceDongzhi = (currentTermIndex - 23 + 24) % 24;
  
  // 映射到皇极经世日期
  // 限制最大为15（每节气15天）
  const huangjiDayInTerm = Math.min(diffDays, 15);
  const huangjiDayOfYear = termsSinceDongzhi * 15 + huangjiDayInTerm;
  
  // 计算月 (0-11, 子月为0)
  const huangjiMonth = Math.floor((huangjiDayOfYear - 1) / 30);
  const huangjiDayOfMonth = (huangjiDayOfYear - 1) % 30 + 1;

  return {
    termIndex: currentTermIndex,
    termName: SOLAR_TERM_NAMES[currentTermIndex],
    termStartDate: currentTermStartDate,
    dayInTerm: diffDays,
    huangji: {
      dayOfYear: huangjiDayOfYear,
      month: huangjiMonth,      // 0=子月, 1=丑月...
      dayOfMonth: huangjiDayOfMonth, // 1-30
      dayInTerm: huangjiDayInTerm    // 1-15
    }
  };
}

/**
 * 获取指定年份指定节气的开始日期
 * @param year 公历年份
 * @param termIndex 节气索引 (0-23)
 */
export function getTermStartDate(year: number, termIndex: number): Date {
  const day = getTermDay(year, termIndex);
  // 节气月份映射:
  // 0(小寒)-1月, 1(大寒)-1月
  // 2(立春)-2月, 3(雨水)-2月
  // ...
  // k -> floor(k/2) + 1
  const month = Math.floor(termIndex / 2); // 0-11
  
  // 注意：Date构造函数中月份是0-11
  return new Date(year, month, day);
}

