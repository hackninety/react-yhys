/**
 * 日期详情弹出卡片组件
 * 显示 lunisolar 的所有功能：农历、八字四柱、五行、纳音等
 * 同时对比自己算法版和插件版的八字
 */

import { useMemo } from 'react'
import { getDateDetail, type BaziPillar } from '../utils/lunar'
import { getYearGanZhi, getMonthGanZhi, getHourGanZhi, getGanZhi, getHuangjiMonthGanZhi } from '../utils/ganzhi'
import { getSuiHexagramByHuangjiYear, getYueHexagramDetail, getRiHexagramDetail, getShiChenHexagramDetail, getIntercalaryHexagramByName } from '../data/hexagrams64'
import { getYearLv, getMonthLv, getDayLv, getHourLvByDate } from '../utils/lvlv'
import { getSolarTerm } from '../utils/solarTerms'
import { getYearJiazi } from '../utils/calendar'
import './DateDetailModal.css'

interface DateDetailModalProps {
  date: Date
  huangjiYear: number  // 皇极年（69043等）
  onClose: () => void
}

// 五行颜色
const WUXING_COLORS: Record<string, string> = {
  '木': '#22c55e',  // 绿色
  '火': '#ef4444',  // 红色
  '土': '#eab308',  // 黄色
  '金': '#f8fafc',  // 白色（用浅灰表示）
  '水': '#3b82f6',  // 蓝色
}

// 渲染单个八字柱
function BaziPillarDisplay({ pillar, label }: { pillar: BaziPillar; label: string }) {
  const ganColor = WUXING_COLORS[pillar.wuXing.charAt(0)] || '#888'
  const zhiColor = WUXING_COLORS[pillar.wuXing.charAt(1)] || '#888'
  
  return (
    <div className="bazi-pillar-card">
      <div className="pillar-label">{label}</div>
      <div className="pillar-ganzhi">
        <span className="gan" style={{ color: ganColor }}>{pillar.gan}</span>
        <span className="zhi" style={{ color: zhiColor }}>{pillar.zhi}</span>
      </div>
      <div className="pillar-wuxing">
        <span style={{ color: ganColor }}>{pillar.wuXing.charAt(0)}</span>
        <span style={{ color: zhiColor }}>{pillar.wuXing.charAt(1)}</span>
      </div>
      <div className="pillar-nayin">{pillar.naYin}</div>
    </div>
  )
}

export function DateDetailModal({ date, huangjiYear, onClose }: DateDetailModalProps) {
  // 获取 lunisolar 的完整日期详情
  const detail = useMemo(() => getDateDetail(date), [date])
  
  // 获取自己算法版的八字
  const customBazi = useMemo(() => {
    const yearGanZhi = getYearGanZhi(date)
    const monthGanZhi = getMonthGanZhi(date)
    const dayGanZhi = getGanZhi(date)
    const hourGanZhi = getHourGanZhi(date)
    return { yearGanZhi, monthGanZhi, dayGanZhi, hourGanZhi }
  }, [date])
  
  // 获取皇极经世的干支
  const huangjiBazi = useMemo(() => {
    // 皇极年干支（使用 getYearJiazi 根据皇极年计算六十甲子）
    const yearGanZhi = getYearJiazi(huangjiYear)
    // 皇极月干支（使用日期来获取）
    const monthGanZhi = getHuangjiMonthGanZhi(date)
    // 日干支（与夏历相同）
    const dayGanZhi = getGanZhi(date)
    // 时干支（与夏历相同）
    const hourGanZhi = getHourGanZhi(date)
    
    return { yearGanZhi, monthGanZhi, dayGanZhi, hourGanZhi }
  }, [date, huangjiYear])
  
  // 获取皇极卦象
  const hexagrams = useMemo(() => {
    const suiHexagram = getSuiHexagramByHuangjiYear(huangjiYear)
    // getYueHexagramDetail 需要公历年和公历月
    const gregorianYear = date.getFullYear()
    const gregorianMonth = date.getMonth() + 1
    const yueHexagram = getYueHexagramDetail(gregorianYear, gregorianMonth)
    const riHexagram = getRiHexagramDetail(date)
    const shiChenHexagram = getShiChenHexagramDetail(date)
    return { suiHexagram, yueHexagram, riHexagram, shiChenHexagram }
  }, [date, huangjiYear])
  
  // 获取律吕
  const lvlv = useMemo(() => {
    // 获取干支信息
    const yearGanZhi = getYearGanZhi(date)
    const dayGanZhi = getGanZhi(date)
    const huangjiMonthGanZhi = getHuangjiMonthGanZhi(date)
    
    // 地支列表
    const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
    
    // 获取月支索引
    const monthBranch = huangjiMonthGanZhi[1]
    const monthBranchIndex = BRANCHES.indexOf(monthBranch)
    
    const yearLv = getYearLv(yearGanZhi[0])  // 年律按年干
    const monthLv = getMonthLv(monthBranchIndex >= 0 ? monthBranchIndex : 0)  // 月律按月支
    const dayLv = getDayLv(dayGanZhi[0])  // 日律按日干
    const hourLv = getHourLvByDate(date)  // 时律按时支
    return { yearLv, monthLv, dayLv, hourLv }
  }, [date])
  
  // 获取节气
  const solarTermInfo = useMemo(() => {
    return getSolarTerm(date)
  }, [date])
  
  // 获取闰卦（如果是节气日）
  const intercalaryHexagram = useMemo(() => {
    if (solarTermInfo && solarTermInfo.termName) {
      return getIntercalaryHexagramByName(solarTermInfo.termName)
    }
    return null
  }, [solarTermInfo])
  
  return (
    <div className="date-detail-overlay" onClick={onClose}>
      <div className="date-detail-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>日期详情</h2>
          <div className="date-summary">
            <span className="gregorian">{detail.gregorian.dateStr} 星期{detail.gregorian.weekday}</span>
            {detail.lunar && <span className="lunar">{detail.lunar.dateStr}</span>}
          </div>
        </div>
        
        <div className="modal-content">
          {/* 八字四柱对比 */}
          <section className="section bazi-section">
            <h3>八字四柱</h3>
            
            <div className="bazi-comparison">
              {/* Lunisolar 版本 */}
              {detail.bazi ? (
                <div className="bazi-version">
                  <h4>📚 Lunisolar 插件版</h4>
                  <div className="bazi-pillars">
                    <BaziPillarDisplay pillar={detail.bazi.year} label="年柱" />
                    <BaziPillarDisplay pillar={detail.bazi.month} label="月柱" />
                    <BaziPillarDisplay pillar={detail.bazi.day} label="日柱" />
                    <BaziPillarDisplay pillar={detail.bazi.hour} label="时柱" />
                  </div>
                </div>
              ) : (
                <div className="bazi-version">
                  <h4>📚 Lunisolar 插件版</h4>
                  <p className="unsupported-notice">此日期超出 Lunisolar 支持范围（公元前722年～公元2200年）</p>
                </div>
              )}
              
              {/* 自己算法版本（夏历） */}
              <div className="bazi-version">
                <h4>🔧 自定义算法版（夏历）</h4>
                <div className="bazi-simple">
                  <span className={detail.bazi && customBazi.yearGanZhi === detail.bazi.year.ganZhi ? 'match' : ''}>
                    年：{customBazi.yearGanZhi}
                  </span>
                  <span className={detail.bazi && customBazi.monthGanZhi === detail.bazi.month.ganZhi ? 'match' : ''}>
                    月：{customBazi.monthGanZhi}
                  </span>
                  <span className={detail.bazi && customBazi.dayGanZhi === detail.bazi.day.ganZhi ? 'match' : ''}>
                    日：{customBazi.dayGanZhi}
                  </span>
                  <span className={detail.bazi && customBazi.hourGanZhi === detail.bazi.hour.ganZhi ? 'match' : ''}>
                    时：{customBazi.hourGanZhi}
                  </span>
                </div>
              </div>
              
              {/* 皇极经世版本 */}
              <div className="bazi-version huangji-version">
                <h4>📜 皇极经世版（冬至换年）</h4>
                <div className="bazi-simple">
                  <span>年：{huangjiBazi.yearGanZhi}</span>
                  <span>月：{huangjiBazi.monthGanZhi}</span>
                  <span>日：{huangjiBazi.dayGanZhi}</span>
                  <span>时：{huangjiBazi.hourGanZhi}</span>
                </div>
              </div>
            </div>
          </section>
          
          {/* 皇极经世卦象 */}
          <section className="section hexagram-section">
            <h3>皇极经世卦象</h3>
            <div className="hexagram-grid">
              <div className="hexagram-item">
                <span className="hexagram-label">岁卦</span>
                <span className="hexagram-symbol">{hexagrams.suiHexagram.unicode}</span>
                <span className="hexagram-name">{hexagrams.suiHexagram.name}</span>
              </div>
              <div className="hexagram-item">
                <span className="hexagram-label">月卦</span>
                <span className="hexagram-symbol">{hexagrams.yueHexagram.yueHexagram.unicode}</span>
                <span className="hexagram-name">{hexagrams.yueHexagram.yueHexagram.name}</span>
              </div>
              <div className="hexagram-item">
                <span className="hexagram-label">日卦</span>
                <span className="hexagram-symbol">{hexagrams.riHexagram.riHexagram.unicode}</span>
                <span className="hexagram-name">{hexagrams.riHexagram.riHexagram.name}</span>
              </div>
              <div className="hexagram-item">
                <span className="hexagram-label">时卦</span>
                <span className="hexagram-symbol">{hexagrams.shiChenHexagram.shiChenHexagram.unicode}</span>
                <span className="hexagram-name">{hexagrams.shiChenHexagram.shiChenHexagram.name}</span>
              </div>
            </div>
          </section>
          
          {/* 律吕 */}
          <section className="section lvlv-section">
            <h3>律吕</h3>
            <div className="lvlv-grid">
              <div className="lvlv-item">
                <span className="lvlv-label">年律</span>
                <span className="lvlv-name">{lvlv.yearLv.name}</span>
                <span className="lvlv-type">{lvlv.yearLv.type}</span>
              </div>
              <div className="lvlv-item">
                <span className="lvlv-label">月律</span>
                <span className="lvlv-name">{lvlv.monthLv.name}</span>
                <span className="lvlv-type">{lvlv.monthLv.type}</span>
              </div>
              <div className="lvlv-item">
                <span className="lvlv-label">日律</span>
                <span className="lvlv-name">{lvlv.dayLv.name}</span>
                <span className="lvlv-type">{lvlv.dayLv.type}</span>
              </div>
              <div className="lvlv-item">
                <span className="lvlv-label">时律</span>
                <span className="lvlv-name">{lvlv.hourLv.name}</span>
                <span className="lvlv-type">{lvlv.hourLv.type}</span>
              </div>
            </div>
          </section>
          
          {/* 节气信息 */}
          {solarTermInfo && solarTermInfo.termName && (
            <section className="section term-section">
              <h3>节气</h3>
              <div className="term-info">
                <span className="term-name">{solarTermInfo.termName}</span>
                <span className="term-day">（{solarTermInfo.dayInTerm === 0 ? '当日' : `第${solarTermInfo.dayInTerm + 1}天`}）</span>
                {intercalaryHexagram && (
                  <span className="intercalary-hexagram">
                    闰卦：{intercalaryHexagram.unicode}{intercalaryHexagram.name}
                  </span>
                )}
              </div>
            </section>
          )}
          
          {/* 农历详情 */}
          {detail.lunar ? (
            <section className="section lunar-section">
              <h3>农历</h3>
              <div className="lunar-info">
                <div className="lunar-item">
                  <span className="label">农历年</span>
                  <span className="value">{detail.lunar.yearGanZhi}年（{detail.lunar.year}）</span>
                </div>
                <div className="lunar-item">
                  <span className="label">农历月</span>
                  <span className="value">{detail.lunar.monthName}{detail.lunar.isLeapMonth ? '（闰月）' : ''}</span>
                </div>
                <div className="lunar-item">
                  <span className="label">农历日</span>
                  <span className="value">{detail.lunar.dayName}</span>
                </div>
              </div>
            </section>
          ) : (
            <section className="section lunar-section">
              <h3>农历</h3>
              <p className="unsupported-notice">此日期超出 Lunisolar 支持范围（公元前722年～公元2200年）</p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

