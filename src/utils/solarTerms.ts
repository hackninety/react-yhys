/**
 * 二十四节气计算（天文算法，零依赖）
 *
 * 实现：Meeus《Astronomical Algorithms》低精度太阳视黄经公式（精度约 0.01°，
 * 折合时刻误差约十几分钟）+ Espenak & Meeus (2006) ΔT 分段多项式（TT→UT），
 * 节气民用日期统一按中国标准时（东八区）取日。
 *
 * 相比旧版"寿星公式 21 世纪 C 值表"（仅 2001-2100 年有效），本实现对任意年份
 * （含公元前）按真实天文位置计算，与皇极经世"冬至甲子日子半"以实际冬至锚定
 * 年首的原文约定一致——节气计算属于"现实历日 → 皇极模型"的映射层，
 * 不改变皇极/黄畿算法本身。
 *
 * 注意：
 * - 公元前及远未来年份采用外推格里历（proleptic Gregorian）约定；
 * - 远古年份 ΔT 外推不确定度达数小时，个别节气民用日期可能有 ±1 日误差；
 * - 本引擎时刻精度约 ±5 分钟：真实交节时刻恰在午夜前后数分钟内的极端
 *   临界节气（约占 0.3%，如 2014 惊蛰 00:02），民用日期可能相差 1 日，
 *   未来年份的此类临界日还受 ΔT 预测不确定性影响，属固有极限。
 */

export const SOLAR_TERM_NAMES = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
  '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
];

const MS_PER_DAY = 86400000;

/**
 * 构造本地时区的日期对象（0点）。
 * 直接 new Date(year, ...) 会把 0-99 年映射到 1900 年代，此处用 2000 年
 * 作枢轴再 setFullYear 回拨，正确支持任意年份（含公元前负数年）。
 * 月/日溢出的归一化行为与原生 Date 构造函数一致。
 */
export function makeLocalDate(year: number, monthIndex: number, day: number): Date {
  const d = new Date(2000, monthIndex, day);
  d.setFullYear(year + (d.getFullYear() - 2000));
  return d;
}

/** 外推格里历 (y, m∈1-12, d) → 该日 UTC 0点毫秒时间戳（纯儒略日算术，任意整数年） */
function utcMsFromGregorian(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  const jdn = d + Math.floor((153 * mm + 2) / 5) + 365 * yy
    + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  return (jdn - 2440588) * MS_PER_DAY; // JDN 2440588 = 1970-01-01
}

/** UTC 毫秒 → 按东八区取的外推格里历民用日期 */
function cstDateFromUtcMs(ms: number): { y: number; m: number; d: number } {
  const jdn = Math.floor((ms + 8 * 3600000) / MS_PER_DAY) + 2440588;
  let a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const dd = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * dd) / 4);
  const mm = Math.floor((5 * e + 2) / 153);
  return {
    y: 100 * b + dd - 4800 + Math.floor(mm / 10),
    m: mm + 3 - 12 * Math.floor(mm / 10),
    d: e - Math.floor((153 * mm + 2) / 5) + 1,
  };
}

/** ΔT = TT - UT（秒），Espenak & Meeus (2006) 分段多项式，适用约 -1999 ~ +3000 及外推 */
function deltaT(y: number): number {
  let u: number, t: number;
  if (y < -500) { u = (y - 1820) / 100; return -20 + 32 * u * u; }
  if (y < 500) {
    u = y / 100;
    return 10583.6 - 1014.41 * u + 33.78311 * u ** 2 - 5.952053 * u ** 3
      - 0.1798452 * u ** 4 + 0.022174192 * u ** 5 + 0.0090316521 * u ** 6;
  }
  if (y < 1600) {
    u = (y - 1000) / 100;
    return 1574.2 - 556.01 * u + 71.23472 * u ** 2 + 0.319781 * u ** 3
      - 0.8503463 * u ** 4 - 0.005050998 * u ** 5 + 0.0083572073 * u ** 6;
  }
  if (y < 1700) { t = y - 1600; return 120 - 0.9808 * t - 0.01532 * t ** 2 + t ** 3 / 7129; }
  if (y < 1800) {
    t = y - 1700;
    return 8.83 + 0.1603 * t - 0.0059285 * t ** 2 + 0.00013336 * t ** 3 - t ** 4 / 1174000;
  }
  if (y < 1860) {
    t = y - 1800;
    return 13.72 - 0.332447 * t + 0.0068612 * t ** 2 + 0.0041116 * t ** 3 - 0.00037436 * t ** 4
      + 0.0000121272 * t ** 5 - 0.0000001699 * t ** 6 + 0.000000000875 * t ** 7;
  }
  if (y < 1900) {
    t = y - 1860;
    return 7.62 + 0.5737 * t - 0.251754 * t ** 2 + 0.01680668 * t ** 3
      - 0.0004473624 * t ** 4 + t ** 5 / 233174;
  }
  if (y < 1920) {
    t = y - 1900;
    return -2.79 + 1.494119 * t - 0.0598939 * t ** 2 + 0.0061966 * t ** 3 - 0.000197 * t ** 4;
  }
  if (y < 1941) { t = y - 1920; return 21.20 + 0.84493 * t - 0.076100 * t ** 2 + 0.0020936 * t ** 3; }
  if (y < 1961) { t = y - 1950; return 29.07 + 0.407 * t - t ** 2 / 233 + t ** 3 / 2547; }
  if (y < 1986) { t = y - 1975; return 45.45 + 1.067 * t - t ** 2 / 260 - t ** 3 / 718; }
  if (y < 2005) {
    t = y - 2000;
    return 63.86 + 0.3345 * t - 0.060374 * t ** 2 + 0.0017275 * t ** 3
      + 0.000651814 * t ** 4 + 0.00002373599 * t ** 5;
  }
  if (y < 2050) { t = y - 2000; return 62.92 + 0.32217 * t + 0.005589 * t ** 2; }
  if (y < 2150) { u = (y - 1820) / 100; return -20 + 32 * u * u - 0.5628 * (2150 - y); }
  u = (y - 1820) / 100;
  return -20 + 32 * u * u;
}

const DEG = Math.PI / 180;
const J2000_MS = 946728000000; // JD 2451545.0 = 2000-01-01 12:00 UTC
const TROPICAL_YEAR_DAYS = 365.2422;
const TERM_ITERATIONS = 6;
const INITIAL_TERM_STEP_DAYS = 15.218;

/** 太阳视黄经（度，0-360）。ttMs 为 TT 时标毫秒（相对 Unix 纪元） */
function solarLongitude(ttMs: number): number {
  const T = (ttMs - J2000_MS) / MS_PER_DAY / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * DEG;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * M)
    + 0.000289 * Math.sin(3 * M);
  const omega = (125.04 - 1934.136 * T) * DEG;
  const lambda = L0 + C - 0.00569 - 0.00478 * Math.sin(omega);
  return ((lambda % 360) + 360) % 360;
}

/**
 * 节气时刻缓存（键 `${year},${termIndex}` → UTC 毫秒）。
 * 日历视图会对同一批节气反复取值，缓存避免重复牛顿迭代。
 */
const termInstantCache = new Map<string, number>();

/**
 * 求节气时刻（UTC 毫秒）。
 * 节气索引 0=小寒 … 23=冬至；year 是迭代初值的名义年。
 * 外推时节气实际民用日期可能跨到相邻年份，不能据名义年筛选所属节气。
 * 目标太阳黄经 = (285 + n×15) mod 360（小寒 285°、春分 0°、夏至 90°、冬至 270°）。
 */
function getTermInstantUtcMs(year: number, n: number): number {
  const key = `${year},${n}`;
  const cached = termInstantCache.get(key);
  if (cached !== undefined) return cached;

  const target = (285 + n * 15) % 360;
  // 初值：小寒约在 1 月 5 日，节气平均间隔 365.2422/24 ≈ 15.22 天
  let tt = utcMsFromGregorian(year, 1, 4) + n * INITIAL_TERM_STEP_DAYS * MS_PER_DAY;
  for (let i = 0; i < TERM_ITERATIONS; i++) {
    let diff = target - solarLongitude(tt);
    diff = ((diff % 360) + 540) % 360 - 180; // 归一到 [-180, 180)
    tt += (diff / (360 / TROPICAL_YEAR_DAYS)) * MS_PER_DAY;
  }
  const ut = tt - deltaT(year) * 1000;
  termInstantCache.set(key, ut);
  return ut;
}

/**
 * 获取指定年份指定节气的开始日期（东八区民用日期，返回本地 0 点 Date）
 * @param year 公历年份（任意整数年，公元前用天文纪年：前N年 = -(N-1)）
 * @param termIndex 节气索引 (0=小寒, 1=大寒, ..., 23=冬至)
 */
export function getTermStartDate(year: number, termIndex: number): Date {
  const { y, m, d } = cstDateFromUtcMs(getTermInstantUtcMs(year, termIndex));
  return makeLocalDate(y, m - 1, d);
}

/**
 * 计算指定年份第n个节气的日期 (1-31)
 * @param year 公历年份
 * @param n 节气索引 (0=小寒, 1=大寒, ..., 23=冬至)
 * @returns 日期 (日)
 */
export function getTermDay(year: number, n: number): number {
  return getTermStartDate(year, n).getDate();
}

export interface SolarTermOccurrence {
  nominalYear: number;
  termIndex: number;
  startDate: Date;
}

/**
 * 按实际民用日期寻找最近的指定节气，供皇极日序、太乙节气/月建/立春共用。
 *
 * 六次迭代每次修正不超过半个回归年；再减去该名义年的 ΔT，可得到所有
 * 24 节气日期的保守包络。向前后扩展名义年份，直到整个包络不可能改善
 * 当前命中才停止。极端年份也不假设节气落在名义年或仅相邻一年。
 */
export function findLatestSolarTerm(date: Date, termIndices: readonly number[] = SOLAR_TERM_NAMES.map((_, i) => i)): SolarTermOccurrence {
  const year = date.getFullYear();
  if (!Number.isFinite(date.getTime()) || !termIndices.length || termIndices.some(n => !Number.isInteger(n) || n < 0 || n > 23)) {
    throw new Error('节气查询须提供有效日期及 0..23 的节气索引');
  }
  const target = utcMsFromGregorian(year, date.getMonth() + 1, date.getDate());
  const maxIterationShift = TERM_ITERATIONS * (TROPICAL_YEAR_DAYS / 2) * MS_PER_DAY;
  const bounds = (nominalYear: number) => {
    const base = utcMsFromGregorian(nominalYear, 1, 4) - deltaT(nominalYear) * 1000 + 8 * 3600000;
    return {
      first: Math.floor((base - maxIterationShift) / MS_PER_DAY) * MS_PER_DAY,
      last: Math.floor((base + 23 * INITIAL_TERM_STEP_DAYS * MS_PER_DAY + maxIterationShift) / MS_PER_DAY) * MS_PER_DAY,
    };
  };
  let best: SolarTermOccurrence | undefined;
  let bestDay = -Infinity;
  const considerYear = (nominalYear: number) => {
    for (const termIndex of termIndices) {
      const startDate = getTermStartDate(nominalYear, termIndex);
      const day = utcMsFromGregorian(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
      if (day <= target && day > bestDay) {
        bestDay = day;
        best = { nominalYear, termIndex, startDate };
      }
    }
  };
  considerYear(year);
  let pastDone = false, futureDone = false;
  // In the supported -67016..62583 range the envelopes are strictly increasing
  // with nominal year. The cap also prevents invalid extrapolations from looping.
  for (let distance = 1; distance <= 64; distance++) {
    if (!pastDone) {
      const candidate = year - distance;
      pastDone = bounds(candidate).last < bestDay;
      if (!pastDone) considerYear(candidate);
    }
    if (!futureDone) {
      const candidate = year + distance;
      futureDone = bounds(candidate).first > target;
      if (!futureDone) considerYear(candidate);
    }
    if (pastDone && futureDone && best) return best;
  }
  throw new Error('节气名义年份搜索未能收敛');
}

/**
 * 获取日期的节气信息
 * @param date Date对象
 */
export function getSolarTerm(date: Date) {
  const year = date.getFullYear();
  const dateTs = utcMsFromGregorian(year, date.getMonth() + 1, date.getDate());

  const { termIndex: currentTermIndex, startDate: currentTermStartDate } = findLatestSolarTerm(date);

  // 比较民用日期序号，不比较宿主时区的实际时长；历史改时区跳过整天
  // （如 Samoa 2011-12-30）也不能减少这份固定节气日表中的日序。
  const termDayTs = utcMsFromGregorian(currentTermStartDate.getFullYear(), currentTermStartDate.getMonth() + 1, currentTermStartDate.getDate());
  const diffDays = (dateTs - termDayTs) / MS_PER_DAY + 1;

  // 皇极经世映射：
  // 1. 节气 -> 皇极节气 (0-23)
  // 2. 皇极经世的一年从冬至(23)开始
  // 3. 皇极天数 = 距离冬至的节气数 * 15 + min(当前天数, 15)
  const termsSinceDongzhi = (currentTermIndex - 23 + 24) % 24;

  // 映射到皇极经世日期（限制最大为15，每节气15天）
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
