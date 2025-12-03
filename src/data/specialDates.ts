/**
 * 特殊日期数据
 * 用于标记历史事件、重要时期等
 */

import specialDatesData from './special-dates.json'

export interface SpecialDate {
  id: string
  name: string
  description: string
  color: string
  colorEnd?: string
  textColor: string
  yun?: number      // 运编号（1-360）
  shi?: number      // 世编号（1-4320）
  sui?: number      // 岁编号（1-129600），全局年份
  badge: string
  term?: string     // 对应的节气名称（如"惊蛰"、"立冬"）
}

export interface SpecialDatesData {
  specialDates: SpecialDate[]
}

// 加载特殊日期数据
export const specialDates: SpecialDate[] = specialDatesData.specialDates

// 根据运编号查找特殊日期
export function findSpecialDateByYun(yunNumber: number): SpecialDate | undefined {
  return specialDates.find(d => d.yun === yunNumber)
}

// 根据世编号查找特殊日期
export function findSpecialDateByShi(shiNumber: number): SpecialDate | undefined {
  return specialDates.find(d => d.shi === shiNumber)
}

// 根据岁编号查找特殊日期（全局年份，1-129600）
export function findSpecialDateBySui(suiNumber: number): SpecialDate | undefined {
  return specialDates.find(d => d.sui === suiNumber)
}

// 获取特殊日期的样式
export function getSpecialDateStyle(specialDate: SpecialDate): React.CSSProperties {
  return {
    background: specialDate.colorEnd 
      ? `linear-gradient(135deg, ${specialDate.color}40, ${specialDate.colorEnd}60)`
      : `${specialDate.color}40`,
    borderColor: `${specialDate.color}99`,
  }
}

// 获取特殊日期徽章的样式
export function getSpecialDateBadgeStyle(specialDate: SpecialDate): React.CSSProperties {
  return {
    background: specialDate.colorEnd 
      ? `linear-gradient(135deg, ${specialDate.color}, ${specialDate.colorEnd})`
      : specialDate.color,
    color: specialDate.textColor,
  }
}

