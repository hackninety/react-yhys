/**
 * 日期详情弹出卡片组件
 * 显示 lunisolar 的所有功能：农历、八字四柱、五行、纳音等
 * 同时对比自己算法版和插件版的八字
 */

import { useMemo } from 'react'
import { getDateDetail, type BaziPillar } from '../utils/lunar'
import { getYearGanZhi, getMonthGanZhi, getHourGanZhi, getGanZhi, getHuangjiMonthGanZhi } from '../utils/ganzhi'
import { getYearLv, getMonthLv, getDayLv, getHourLvByDate } from '../utils/lvlv'
import { getSolarTerm } from '../utils/solarTerms'
import { getYearJiazi, YEARS_PER_SHI, SHIS_PER_YUN, YUNS_PER_HUI } from '../utils/calendar'
import {
  getHuiHexagram,
  getYunHexagramDetailByGlobal,
  getShiHexagramByYear,
  getSuiHexagram,
  getYueHexagramByHuangji,
  getRiHexagramByDate,
  getHexagram64,
} from '../data/hexagrams64'
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

  // 计算卦象链：元 → 会 → 运 → 世 → 岁 → 月 → 日
  const hexagramChain = useMemo(() => {
    const gregorianYear = huangjiYear - 67017

    // 元卦：乾（一元统领，固定）— binary 63 = 0b111111
    const yuanHex = getHexagram64(63)

    // 会卦（辟卦）：根据皇极年所在的会
    const huiIndex = Math.floor((huangjiYear - 1) / (YUNS_PER_HUI * SHIS_PER_YUN * YEARS_PER_SHI)) % 12
    const huiHex = getHuiHexagram(huiIndex)

    // 运卦：根据全局运编号
    const globalShiNumber = Math.ceil(huangjiYear / YEARS_PER_SHI)
    const globalYunNumber = Math.ceil(globalShiNumber / SHIS_PER_YUN)
    const yunDetail = getYunHexagramDetailByGlobal(globalYunNumber)

    // 世卦
    const shiHex = getShiHexagramByYear(huangjiYear)

    // 岁卦
    const suiHex = getSuiHexagram(gregorianYear)

    // 月卦：使用节气信息获取皇极月
    const termInfo = getSolarTerm(date)
    const huangjiMonth = termInfo.huangji.month  // 0-11
    const yueHex = getYueHexagramByHuangji(huangjiYear, huangjiMonth + 1)

    // 日卦
    const riHex = getRiHexagramByDate(date)

    return [
      { level: '元（日）', name: '乾', hex: yuanHex, note: '一元统领' },
      { level: '会（月）', name: `第${huiIndex + 1}会`, hex: huiHex, note: '辟卦（消息卦）' },
      { level: '运（星）', name: `第${globalYunNumber}运`, hex: yunDetail.yunHexagram, note: `${yunDetail.masterHexagram.name}→${yunDetail.yaoName}爻变` },
      { level: '世（辰）', name: `第${globalShiNumber}世`, hex: shiHex, note: '运卦爻变' },
      { level: '岁（年）', name: `第${huangjiYear}年`, hex: suiHex, note: '世卦爻变' },
      { level: '月', name: `第${huangjiMonth + 1}月`, hex: yueHex, note: '先天60卦序' },
      { level: '日', name: '', hex: riHex, note: '先天60卦序' },
    ]
  }, [date, huangjiYear])
  
  
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
          
          {/* 卦象链：元 → 会 → 运 → 世 → 岁 → 月 → 日 */}
          <section className="section hexagram-chain-section">
            <h3>卦象链</h3>
            <div className="hexagram-chain">
              {hexagramChain.map((item, i) => (
                <div className="hexagram-chain-node" key={i}>
                  <div className="chain-level">{item.level}</div>
                  <div className="chain-symbol">{item.hex.unicode}</div>
                  <div className="chain-name">{item.hex.name}</div>
                  <div className="chain-note">{item.note}</div>
                  {i < hexagramChain.length - 1 && (
                    <div className="chain-arrow">↓</div>
                  )}
                </div>
              ))}
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

