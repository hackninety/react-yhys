import { useMemo, useCallback, useState } from 'react'
import {
  buildYear,
  buildYuan,
  buildYun,
  buildZoomView,
  TOTAL_YEARS,
  TOTAL_YUNS,
  TOTAL_SHIS,
  YUNS_PER_HUI,
  SHIS_PER_YUN,
  YEARS_PER_SHI,
  ZOOM_LEVELS,
  ZOOM_INFO,
  zoomIn,
  zoomOut,
  positionToYearIndex,
  yearIndexToPosition,
  getParentLevel,
  EARTHLY_BRANCHES,
  HEAVENLY_STEMS,
  SOLAR_TERMS,
  SOLAR_TERM_CLASSES,
  KAIWU_INDEX,
  BIWU_INDEX,
  getStem,
  getBranch,
  getYearJiazi,
  getYunTermIndex,
  isYunTermStart,
  formatGregorianYear,
  suiToGregorianYear,
  type ZoomLevel,
  type ZoomPosition,
} from '../utils/calendar'
import {
  findSpecialDateByYun,
  findSpecialDateByShi,
  findSpecialDateBySui,
  getSpecialDateStyle,
  getSpecialDateBadgeStyle,
} from '../data/specialDates'
import { getHexagramByIndex } from '../data/hexagrams'
import {
  getYunHexagramByGlobal,
  getYunHexagramDetailByGlobal,
  getShiHexagramByYear,
  getShiHexagramByGlobal,
  getSuiHexagram,
  getYueHexagramByHuangji,
  getRiHexagramByDate,
  getIntercalaryHexagramByName,
  getHuiHexagram,
} from '../data/hexagrams64'
import { getSolarTerm, getTermStartDate } from '../utils/solarTerms'
import { getGanZhi, getYearGanZhi, getMonthGanZhi, getHourGanZhi, getHuangjiMonthGanZhi, getHuangjiMonthHexagram } from '../utils/ganzhi'
import { getYearLv, getMonthLv, getDayLv, getHourLvByDate } from '../utils/lvlv'
import { getLunarDateString } from '../utils/lunar'
import { DateDetailModal } from './DateDetailModal'
import './Calendar.css'

interface CalendarProps {
  yearIndex: number
  onYearChange: (year: number) => void
  zoomLevel: ZoomLevel
  onZoomChange: (level: ZoomLevel, position: ZoomPosition) => void
  position: ZoomPosition
}

export default function Calendar({
  yearIndex,
  onYearChange,
  zoomLevel,
  onZoomChange,
  position,
}: CalendarProps) {
  // 日期详情弹出卡片状态
  const [selectedDateInfo, setSelectedDateInfo] = useState<{
    date: Date
    huangjiYear: number
  } | null>(null)
  
  // 获取今日皇极经世日期信息
  const todayInfo = useMemo(() => {
    const now = new Date()
    const termInfo = getSolarTerm(now)
    const gregorianYear = now.getFullYear()
    
    // 皇极经世历以冬至换年
    // 获取今年冬至日期（节气索引23=冬至）
    const dongzhiThisYear = getTermStartDate(gregorianYear, 23)
    
    // 判断今天是否在冬至之后
    const todayDate = new Date(gregorianYear, now.getMonth(), now.getDate())
    const isAfterDongzhi = todayDate.getTime() >= dongzhiThisYear.getTime()
    
    // 皇极年份：如果在冬至之后，皇极年对应下一年的干支
    // 例如：2025年12月23日（冬至后）-> 皇极年对应2026年 -> 丙午年
    const huangjiGregorianYear = isAfterDongzhi ? gregorianYear + 1 : gregorianYear
    const huangjiSui = huangjiGregorianYear + 67017 // gregorianYearToSui offset
    const huangjiYearJiazi = getYearJiazi(huangjiSui)
    
    // 皇极四柱：年月日时干支
    const yearGanZhi = getYearGanZhi(now) // 夏历年干支（作为参考）
    const huangjiMonthGanZhi = getHuangjiMonthGanZhi(now) // 皇极月干支
    const huangjiMonthHexagramOld = getHuangjiMonthHexagram(now) // 皇极月卦（十二消息卦/会卦）- 保留用于其他地方
    const dayGanZhi = getGanZhi(now)
    const hourGanZhi = getHourGanZhi(now)
    
    // 计算当前世卦（不剔除四正卦）
    const currentShiHexagram = getShiHexagramByYear(huangjiSui)
    
    // 计算当前世序号（每世30年）
    const currentShiNumber = Math.ceil(huangjiSui / 30)
    // 计算当前运序号（每运12世）
    const currentYunNumber = Math.ceil(currentShiNumber / 12)
    
    return {
      date: now,
      termInfo,
      year: gregorianYear,
      month: now.getMonth() + 1,
      day: now.getDate(),
      huangjiSui,
      huangjiYearJiazi,
      // 皇极四柱 + 夏历年干支
      yearGanZhi, // 夏历年干支（参考）
      huangjiMonthGanZhi, // 皇极月干支
      huangjiMonthHexagramOld, // 皇极月卦（十二消息卦/会卦）- 保留用于其他地方
      dayGanZhi,
      hourGanZhi,
      // 世卦信息
      currentShiHexagram, // 当前世卦
      currentShiNumber, // 当前世序号
      currentYunNumber, // 当前运序号
      // 四柱律吕
      yearLv: getYearLv(huangjiYearJiazi[0]), // 年律（按皇极年干）
      monthLv: getMonthLv(termInfo.huangji.month), // 月律（按皇极月支）
      dayLv: getDayLv(dayGanZhi[0]), // 日律（按日干）
      hourLv: getHourLvByDate(now), // 时律（按时支）
    }
  }, [])

  // 构建当前视图数据
  const viewData = useMemo(() => {
    if (zoomLevel === 'nian' || zoomLevel === 'yuan' || zoomLevel === 'yun') {
      return null // 年级、元级、运级使用专门的构建函数
    }
    return buildZoomView(position, zoomLevel)
  }, [position, zoomLevel])

  const yearData = useMemo(() => {
    if (zoomLevel === 'nian') {
      return buildYear(yearIndex)
    }
    return null
  }, [yearIndex, zoomLevel])

  const yuanData = useMemo(() => {
    if (zoomLevel === 'yuan') {
      return buildYuan(position.yuan)
    }
    return null
  }, [position.yuan, zoomLevel])

  const yunData = useMemo(() => {
    if (zoomLevel === 'yun') {
      return buildYun(position)
    }
    return null
  }, [position, zoomLevel])

  // 缩放操作
  const handleZoomOut = useCallback(() => {
    const result = zoomOut(position, zoomLevel)
    if (result) {
      onZoomChange(result.level, result.position)
    }
  }, [position, zoomLevel, onZoomChange])

  const handleZoomIn = useCallback((itemIndex: number) => {
    const result = zoomIn(position, zoomLevel, itemIndex)
    if (result) {
      onZoomChange(result.level, result.position)
      // 如果进入年级，同步年索引
      if (result.level === 'nian') {
        onYearChange(positionToYearIndex(result.position))
      }
    }
  }, [position, zoomLevel, onZoomChange, onYearChange])

  // 翻页操作
  const handlePrev = useCallback(() => {
    if (zoomLevel === 'nian') {
      onYearChange(yearIndex - 1)
    } else {
      // 在当前级别翻页
      const newPos = { ...position }
      switch (zoomLevel) {
        case 'yuan':
          newPos.yuan = position.yuan - 1
          break
        case 'hui':
          if (position.hui !== undefined) {
            if (position.hui > 0) {
              newPos.hui = position.hui - 1
            } else {
              newPos.yuan = position.yuan - 1
              newPos.hui = 11
            }
          }
          break
        case 'yun':
          if (position.yun !== undefined) {
            if (position.yun > 0) {
              newPos.yun = position.yun - 1
            } else if (position.hui !== undefined && position.hui > 0) {
              newPos.hui = position.hui - 1
              newPos.yun = 29
            } else {
              newPos.yuan = position.yuan - 1
              newPos.hui = 11
              newPos.yun = 29
            }
          }
          break
        case 'shi':
          if (position.shi !== undefined) {
            if (position.shi > 0) {
              newPos.shi = position.shi - 1
            } else if (position.yun !== undefined && position.yun > 0) {
              newPos.yun = position.yun - 1
              newPos.shi = 11
            } else if (position.hui !== undefined && position.hui > 0) {
              newPos.hui = position.hui - 1
              newPos.yun = 29
              newPos.shi = 11
            } else {
              newPos.yuan = position.yuan - 1
              newPos.hui = 11
              newPos.yun = 29
              newPos.shi = 11
            }
          }
          break
      }
      onZoomChange(zoomLevel, newPos)
    }
  }, [zoomLevel, position, yearIndex, onYearChange, onZoomChange])

  const handleNext = useCallback(() => {
    if (zoomLevel === 'nian') {
      onYearChange(yearIndex + 1)
    } else {
      const newPos = { ...position }
      switch (zoomLevel) {
        case 'yuan':
          newPos.yuan = position.yuan + 1
          break
        case 'hui':
          if (position.hui !== undefined) {
            if (position.hui < 11) {
              newPos.hui = position.hui + 1
            } else {
              newPos.yuan = position.yuan + 1
              newPos.hui = 0
            }
          }
          break
        case 'yun':
          if (position.yun !== undefined) {
            if (position.yun < 29) {
              newPos.yun = position.yun + 1
            } else if (position.hui !== undefined && position.hui < 11) {
              newPos.hui = position.hui + 1
              newPos.yun = 0
            } else {
              newPos.yuan = position.yuan + 1
              newPos.hui = 0
              newPos.yun = 0
            }
          }
          break
        case 'shi':
          if (position.shi !== undefined) {
            if (position.shi < 11) {
              newPos.shi = position.shi + 1
            } else if (position.yun !== undefined && position.yun < 29) {
              newPos.yun = position.yun + 1
              newPos.shi = 0
            } else if (position.hui !== undefined && position.hui < 11) {
              newPos.hui = position.hui + 1
              newPos.yun = 0
              newPos.shi = 0
            } else {
              newPos.yuan = position.yuan + 1
              newPos.hui = 0
              newPos.yun = 0
              newPos.shi = 0
            }
          }
          break
      }
      onZoomChange(zoomLevel, newPos)
    }
  }, [zoomLevel, position, yearIndex, onYearChange, onZoomChange])

  // 直接切换缩放级别
  const handleLevelChange = useCallback((newLevel: ZoomLevel) => {
    if (newLevel === zoomLevel) return
    
    // 根据当前年份计算新位置
    const currentYearIndex = zoomLevel === 'nian' ? yearIndex : positionToYearIndex(position)
    const newPosition = yearIndexToPosition(currentYearIndex, newLevel)
    onZoomChange(newLevel, newPosition)
    
    if (newLevel === 'nian') {
      onYearChange(currentYearIndex)
    }
  }, [zoomLevel, yearIndex, position, onZoomChange, onYearChange])

  const parentLevel = getParentLevel(zoomLevel)
  const zoomInfo = ZOOM_INFO[zoomLevel]

  // 获取当前视图的标题（按皇极经世原文格式：日甲一月子一星甲一辰子一）
  const getTitle = () => {
    if (zoomLevel === 'yuan' && yuanData) {
      // 日（元）用天干
      const yuanStem = getStem(yuanData.yuanIndex)
      return `日${yuanStem}${yuanData.yuanIndex + 1}（元）`
    }
    if (zoomLevel === 'hui' && viewData) {
      // 月（会）用地支 + 辟卦
      const hui = position.hui ?? 0
      const huiBranch = getBranch(hui)
      const huiHexagram = getHuiHexagram(hui)
      return `日${position.yuan + 1}（元）　·　月${huiBranch}${hui + 1} ${huiHexagram.unicode}${huiHexagram.name}（会）`
    }
    if (zoomLevel === 'yun' && yunData) {
      const hui = position.hui ?? 0
      const yun = position.yun ?? 0
      const globalYun = hui * YUNS_PER_HUI + yun + 1
      const huiBranch = getBranch(hui)
      const yunStem = getStem(globalYun - 1)
      const huiHexagram = getHuiHexagram(hui)
      const yunHexagram = getYunHexagramByGlobal(globalYun)
      return `月${huiBranch}${hui + 1} ${huiHexagram.unicode}${huiHexagram.name}　·　星${yunStem}${globalYun} ${yunHexagram.unicode}${yunHexagram.name}`
    }
    if (zoomLevel === 'shi' && viewData) {
      const hui = position.hui ?? 0
      const yun = position.yun ?? 0
      const shi = position.shi ?? 0
      const globalYun = hui * YUNS_PER_HUI + yun + 1
      const globalShi = (globalYun - 1) * SHIS_PER_YUN + shi + 1
      const yunStem = getStem(globalYun - 1)
      const shiBranch = getBranch(globalShi - 1)
      const yunHexagram = getYunHexagramByGlobal(globalYun)
      const shiHexagram = getShiHexagramByGlobal(globalShi)
      // 岁卦：用今年公历年份计算
      const suiHex = getSuiHexagram(todayInfo.year)
      const suiJiazi = getYearJiazi(todayInfo.huangjiSui)
      return `星${yunStem}${globalYun} ${yunHexagram.unicode}${yunHexagram.name}　·　辰${shiBranch}${globalShi} ${shiHexagram.unicode}${shiHexagram.name}　·　岁${suiJiazi} ${suiHex.unicode}${suiHex.name}`
    }
    if (zoomLevel === 'nian' && yearData) {
      const { state } = yearData
      const jiazi = getYearJiazi(state.yearInCycle + 1)
      const yunHexagram = getYunHexagramByGlobal(state.globalYun)
      const shiHexagram = getShiHexagramByGlobal(state.globalShi)
      // 岁卦：用该世的公历起始年 + yearInCycle 算出对应公历年，再取岁卦
      const suiGregorianYear = (state.globalShi - 1) * 30 - 67017 + state.yearInCycle + 1
      const suiHex = getSuiHexagram(suiGregorianYear)
      return `星${state.yunStem}${state.globalYun} ${yunHexagram.unicode}${yunHexagram.name}　·　辰${state.shiBranch}${state.globalShi} ${shiHexagram.unicode}${shiHexagram.name}　·　岁${jiazi} ${suiHex.unicode}${suiHex.name}`
    }
    return viewData?.title ?? ''
  }

  const getSubtitle = () => {
    if (zoomLevel === 'yuan' && yuanData) {
      return `共12月（会） · ${TOTAL_YUNS}星（运） · ${TOTAL_SHIS.toLocaleString()}辰（世） · ${TOTAL_YEARS.toLocaleString()}年`
    }
    if (zoomLevel === 'hui' && viewData) {
      return `共30星（运） · 10800年`
    }
    if (zoomLevel === 'yun' && yunData) {
      return `共12辰（世） · 360年`
    }
    if (zoomLevel === 'shi' && viewData) {
      return `共30年（岁）`
    }
    if (zoomLevel === 'nian' && yearData) {
      return `循环年份：${yearData.state.yearInCycle + 1} / ${TOTAL_YEARS}`
    }
    return viewData?.subtitle ?? ''
  }

  return (
    <div className="calendar">
      {/* 头部 */}
      <header className="calendar-header">
        <h1 className="calendar-title">皇极经世历</h1>
        <p className="calendar-position">{getTitle()}</p>
        <p className="calendar-cycle">{getSubtitle()}</p>
      </header>

      {/* 今日信息栏 */}
      <div className="current-date-info">
        <span className="today-label">今日</span>
        <span>
          {todayInfo.year}年{String(todayInfo.month).padStart(2, '0')}月{String(todayInfo.day).padStart(2, '0')}日
          {' → '}
          {todayInfo.huangjiSui}年{String(todayInfo.termInfo.huangji.month + 1).padStart(2, '0')}月{String(todayInfo.termInfo.huangji.dayOfMonth).padStart(2, '0')}日
        </span>
        <span className="bazi-pillars">
          <span className="bazi-pillar">{todayInfo.huangjiYearJiazi}年</span>
          <span className="bazi-pillar">{todayInfo.huangjiMonthGanZhi}月</span>
          <span className="bazi-pillar">{todayInfo.dayGanZhi}日</span>
          <span className="bazi-pillar">{todayInfo.hourGanZhi}时</span>
        </span>
        {/* 律吕信息 */}
        <span className="lvlv-pillars">
          <span className="lvlv-label">律吕：</span>
          <span className="lvlv-pillar year-lv" title={`年律：${todayInfo.yearLv.type}·${todayInfo.yearLv.pinyin}`}>
            {todayInfo.yearLv.name}
          </span>
          <span className="lvlv-pillar month-lv" title={`月律：${todayInfo.monthLv.type}·${todayInfo.monthLv.pinyin}`}>
            {todayInfo.monthLv.name}
          </span>
          <span className="lvlv-pillar day-lv" title={`日律：${todayInfo.dayLv.type}·${todayInfo.dayLv.pinyin}`}>
            {todayInfo.dayLv.name}
          </span>
          <span className="lvlv-pillar hour-lv" title={`时律：${todayInfo.hourLv.type}·${todayInfo.hourLv.pinyin}`}>
            {todayInfo.hourLv.name}
          </span>
        </span>
        <span className="xiali-ref">
          <span className="xiali-year">（夏历：{todayInfo.yearGanZhi}年 {getMonthGanZhi(todayInfo.date)}月 {todayInfo.dayGanZhi}日 {todayInfo.hourGanZhi}时）</span>
        </span>
      </div>

      {/* 缩放级别选择器 */}
      <div className="zoom-selector">
        {ZOOM_LEVELS.map((level) => (
          <button
            key={level}
            className={`zoom-btn ${level === zoomLevel ? 'active' : ''}`}
            onClick={() => handleLevelChange(level)}
          >
            {ZOOM_INFO[level].alias}（{ZOOM_INFO[level].name}）
          </button>
        ))}
      </div>

      {/* 导航 */}
      <nav className="calendar-nav">
        <button className="nav-btn" onClick={handlePrev}>
          ← 上一{zoomInfo.alias}
        </button>
        
        {parentLevel && (
          <button className="nav-btn zoom-out-btn" onClick={handleZoomOut}>
            ↑ 缩小到{ZOOM_INFO[parentLevel].alias}级
          </button>
        )}
        
        <button className="nav-btn" onClick={handleNext}>
          下一{zoomInfo.alias} →
        </button>
      </nav>

      {/* 内容区域 */}
      {zoomLevel === 'yuan' && yuanData ? (
        // 元(日)级视图：显示12会(月)，每会30运(星)
        <div className="months-grid">
          {yuanData.huis.map((hui) => {
            const yunStart = hui.index * 30 + 1
            const yunEnd = (hui.index + 1) * 30
            return (
              <div 
                key={hui.index} 
                className={`month-card hui-card ${hui.index === KAIWU_INDEX ? 'kaiwu' : ''} ${hui.index === BIWU_INDEX ? 'biwu' : ''}`}
                onClick={() => handleZoomIn(hui.index)}
              >
                <h3 className="month-title">
                  月{EARTHLY_BRANCHES[hui.index]}
                  <span className="month-pinyin">{hui.branchPinyin}</span>
                  <span className="month-number">第{hui.index + 1}会</span>
                  {hui.index === KAIWU_INDEX && <span className="kaiwu-badge">开物</span>}
                  {hui.index === BIWU_INDEX && <span className="biwu-badge">闭物</span>}
                </h3>
                
                <div className="days-grid yuns-grid" onClick={(e) => e.stopPropagation()}>
                  {hui.yuns.map((yun) => {
                    // 计算全局运编号
                    const globalYunNumber = hui.index * 30 + yun.index + 1
                    // 计算世（辰）范围：每运12世
                    const shiStart = (globalYunNumber - 1) * 12 + 1
                    const shiEnd = globalYunNumber * 12
                    // 查找特殊日期
                    const specialDate = findSpecialDateByYun(globalYunNumber)
                    // 节气：第1格和第16格有节气
                    const hasTerm = yun.index === 0 || yun.index === 15
                    const termName = yun.index === 0 ? hui.termStart : (yun.index === 15 ? hui.termEnd : null)
                    const termClass = termName ? SOLAR_TERM_CLASSES[termName] || '' : ''
                    // 判断是否是当前运（包含今年）
                    const currentYun = Math.ceil(todayInfo.huangjiSui / (SHIS_PER_YUN * YEARS_PER_SHI))
                    const isCurrentYun = globalYunNumber === currentYun
                    return (
                      <div
                        key={yun.index}
                        className={`day-cell yun-cell ${hasTerm ? 'has-term' : ''} ${specialDate ? 'special-date' : ''} ${isCurrentYun ? 'current-yun' : ''}`}
                        style={specialDate ? getSpecialDateStyle(specialDate) : undefined}
                        title={`第${globalYunNumber}星（运） · ${shiStart}-${shiEnd}辰（世） · 年${(yun.yearStart % TOTAL_YEARS) + 1}-${(yun.yearEnd % TOTAL_YEARS) + 1}${specialDate ? ` · 【${specialDate.description}】` : ''}${isCurrentYun ? ' · 【今年所在运 · 火德】' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          // 跳转到对应的运页面
                          const newPosition: ZoomPosition = {
                            yuan: position.yuan,
                            hui: hui.index,
                            yun: yun.index,
                          }
                          onZoomChange('yun', newPosition)
                        }}
                      >
                        <span className="day-number">{yun.yunNumber}</span>
                        {termName && (
                          <span className={`term-badge ${termClass}`}>{termName}</span>
                        )}
                        {specialDate?.badge && (
                          <span className="special-date-badge" style={getSpecialDateBadgeStyle(specialDate)}>
                            {specialDate.badge}
                          </span>
                        )}
                        {isCurrentYun && (
                          <span className="current-yun-badge">今·火</span>
                        )}
                      </div>
                    )
                  })}
                </div>
                
                <div className="hui-info">
                  <span className="hui-years">{yunStart}-{yunEnd}运</span>
                  <span className="hui-terms hui-hexagram">
                    {(() => {
                      const hexagram = getHexagramByIndex(hui.index)
                      return (
                        <>
                          <span className="hexagram-name">{hexagram.name}</span>
                          <span className="hexagram-symbol">{hexagram.unicode}</span>
                        </>
                      )
                    })()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : zoomLevel === 'yun' && yunData ? (
        // 运(星)级视图：显示12世(辰)，每世30年
        // 计算当前运在全局中的位置（每会30运，每运12世）
        (() => {
          const hui = position.hui ?? 0
          const yun = position.yun ?? 0
          // 当前运在全局的索引 = 会数 * 30运/会 + 运数
          const globalYunIndex = hui * 30 + yun
          // 当前运之前的世数 = 运索引 * 12世/运
          const shiOffset = globalYunIndex * 12
          return (
            <div className="months-grid">
              {yunData.shis.map((shi) => {
                // 计算世（辰）的全局编号
                const globalShiNumber = shiOffset + shi.index + 1
                // 查找特殊日期（根据世编号）
                const specialDateForShi = findSpecialDateByShi(globalShiNumber)
                // 特殊世卡片的边框样式
                const shiCardStyle = specialDateForShi ? {
                  borderColor: specialDateForShi.color,
                  boxShadow: `0 0 12px ${specialDateForShi.color}40`,
                } : undefined
                return (
                  <div 
                    key={shi.index} 
                    className={`month-card shi-card ${shi.index === KAIWU_INDEX ? 'kaiwu' : ''} ${shi.index === BIWU_INDEX ? 'biwu' : ''} ${specialDateForShi ? 'special-shi' : ''}`}
                    style={shiCardStyle}
                    onClick={() => handleZoomIn(shi.index)}
                  >
                    <h3 className="month-title">
                      辰{EARTHLY_BRANCHES[shi.index]}
                      <span className="month-pinyin">{shi.branchPinyin}</span>
                      <span className="month-number">第{globalShiNumber}世</span>
                      {shi.index === KAIWU_INDEX && <span className="kaiwu-badge">开物</span>}
                      {shi.index === BIWU_INDEX && <span className="biwu-badge">闭物</span>}
                      {specialDateForShi?.badge && (
                        <span 
                          className="special-shi-badge" 
                          style={getSpecialDateBadgeStyle(specialDateForShi)}
                        >
                          {specialDateForShi.badge}
                        </span>
                      )}
                    </h3>
                    
                    <div className="days-grid nians-grid" onClick={(e) => e.stopPropagation()}>
                      {shi.nians.map((nian) => {
                        const hasTerm = nian.index === 0 || nian.index === 15
                        const termName = nian.index === 0 ? shi.termStart : (nian.index === 15 ? shi.termEnd : null)
                        const termClass = termName ? SOLAR_TERM_CLASSES[termName] || '' : ''
                        // 计算六十甲子：全局年编号
                        const globalYearNumber = (nian.yearIndex % TOTAL_YEARS) + 1
                        const jiazi = getYearJiazi(globalYearNumber)
                        // 根据岁编号查找特殊日期
                        const specialDateForNian = findSpecialDateBySui(globalYearNumber)
                        // 动态判断是否是"今年"（皇极经世历以冬至换年）
                        const isCurrentHuangjiYear = globalYearNumber === todayInfo.huangjiSui
                        return (
                          <div
                            key={nian.index}
                            className={`day-cell nian-cell ${hasTerm ? 'has-term' : ''} ${specialDateForNian ? 'special-date' : ''} ${isCurrentHuangjiYear ? 'current-year' : ''}`}
                            style={specialDateForNian ? getSpecialDateStyle(specialDateForNian) : undefined}
                            title={`岁${jiazi} · 第${globalYearNumber}年 · ${formatGregorianYear(globalYearNumber)}${specialDateForNian ? ` · 【${specialDateForNian.name}】` : ''}${isCurrentHuangjiYear ? ' · 【今年】' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              // 跳转到对应的年页面
                              const newPosition: ZoomPosition = {
                                yuan: position.yuan,
                                hui: hui,
                                yun: yun,
                                shi: shi.index,
                                nian: nian.index,
                              }
                              onZoomChange('nian', newPosition)
                              // 同时更新yearIndex
                              onYearChange(nian.yearIndex)
                            }}
                          >
                            <span className="day-number">{jiazi}</span>
                            {termName && (
                              <span className={`term-badge ${termClass}`}>{termName}</span>
                            )}
                            {specialDateForNian?.badge && (
                              <span className="special-date-badge" style={getSpecialDateBadgeStyle(specialDateForNian)}>
                                {specialDateForNian.badge}
                              </span>
                            )}
                            {isCurrentHuangjiYear && (
                              <span className="today-badge">今年</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    
                    <div className="hui-info">
                      <span className="hui-years">第{globalShiNumber}世</span>
                      <span className="hui-terms hui-hexagram" title="世卦（运卦爻变）">
                        {(() => {
                          // 使用世卦（父生子算法：运卦变爻）
                          const hexagram = getShiHexagramByGlobal(globalShiNumber)
                          return (
                            <>
                              <span className="hexagram-symbol" style={{ fontSize: '1.2em', marginRight: '4px' }}>{hexagram.unicode}</span>
                              <span className="hexagram-name">{hexagram.name}</span>
                            </>
                          )
                        })()}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()
      ) : zoomLevel === 'nian' && yearData ? (
        // 年级视图：显示12月
        <div className="months-grid">
          {yearData.months.map((month) => {
            // 判断是否是当前皇极月
            // 判断是否是当前皇极年的当前月
            // 使用皇极年份比较（基于冬至换年）
            const currentSui = yearData.state.yearInCycle + 1
            const currentGregorianYear = suiToGregorianYear(currentSui)
            const isCurrentMonth = currentSui === todayInfo.huangjiSui && 
                                 month.index === todayInfo.termInfo.huangji.month
            
            // 计算皇极月干支
            const huangjiYearJiazi = getYearJiazi(currentSui)
            const yearStemIndex = HEAVENLY_STEMS.indexOf(huangjiYearJiazi[0] as typeof HEAVENLY_STEMS[number])
            // 年上起月法：寅月天干起始
            const yinMonthStemStart = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0][yearStemIndex]
            // 当前月相对于寅月的偏移
            let monthOffset = month.index - 2
            if (monthOffset < 0) monthOffset += 12
            const monthStemIndex = (yinMonthStemStart + monthOffset) % 10
            const monthGanZhi = HEAVENLY_STEMS[monthStemIndex] + EARTHLY_BRANCHES[month.index]
            
            // 皇极月索引 → 公历月份
            
            // 计算流月卦象：使用皇极参数专用接口
            // currentSui = 皇极岁号, month.index = 皇极月索引(0-11)，函数需要(1-12)
            const yueHexagram = getYueHexagramByHuangji(currentSui, month.index + 1)
            
            return (
              <div 
                key={month.index} 
                className={`month-card ${month.index === KAIWU_INDEX ? 'kaiwu' : ''} ${month.index === BIWU_INDEX ? 'biwu' : ''} ${isCurrentMonth ? 'current-month' : ''}`}
              >
                <h3 className="month-title">
                  {monthGanZhi}月
                  <span className="month-pinyin">{month.branchPinyin}</span>
                  <span className="month-number">第{month.index + 1}月</span>
                  {month.index === KAIWU_INDEX && <span className="kaiwu-badge">开物</span>}
                  {month.index === BIWU_INDEX && <span className="biwu-badge">闭物</span>}
                  {isCurrentMonth && <span className="today-badge-small">今月</span>}
                </h3>
                
                <div className="days-grid">
                  {month.days.map((day) => {
                    const termClass = day.termName ? SOLAR_TERM_CLASSES[day.termName] || '' : ''
                    const isToday = isCurrentMonth && day.dayOfMonth === todayInfo.termInfo.huangji.dayOfMonth
                    
                    // 计算该日的干支
                    // 1. 确定年份
                    // month.index 0 (子月) 的前15天属于前一年 (冬至)
                    // 其他属于当年
                    // 注意：皇极经世的一年从冬至开始。如果 currentGregorianYear 是 2025
                    // 子月第1天 (冬至) 是 2024-12-21
                    // 丑月 (大寒/立春) 是 2025-01/02
                    // ...
                    // 所以：Month 0, Days 1-15 -> Year - 1
                    // 其他 -> Year
                    const targetYear = (month.index === 0 && day.dayOfMonth <= 15) 
                      ? currentGregorianYear - 1 
                      : currentGregorianYear

                    // 2. 确定节气索引
                    // 皇极月m: 前半(1-15) -> Term 2m + 23 % 24
                    //          后半(16-30) -> Term 2m + 24 % 24
                    // 简化：皇极日d (1-360) -> d-1 / 15 -> termSequence (0-23, 但起点是冬至)
                    // 实际节气索引 = (termSequence + 23) % 24
                    const huangjiTermSequence = Math.floor((day.dayOfYear - 1) / 15)
                    const termIndex = (huangjiTermSequence + 23) % 24
                    
                    // 3. 确定节气内天数 (0-based offset)
                    const dayInTermOffset = (day.dayOfYear - 1) % 15
                    
                    // 4. 获取节气开始日期
                    const termStartDate = getTermStartDate(targetYear, termIndex)
                    
                    // 5. 计算目标日期
                    const targetDate = new Date(termStartDate)
                    targetDate.setDate(termStartDate.getDate() + dayInTermOffset)
                    
                    // 6. 获取干支
                    const dayGanZhi = getGanZhi(targetDate)
                    
                    // 7. 构建详细tooltip
                    // 皇极年份需要根据该日期动态计算（冬至换年）
                    const targetDongzhi = getTermStartDate(targetDate.getFullYear(), 23)
                    const isAfterTargetDongzhi = targetDate.getTime() >= targetDongzhi.getTime()
                    const huangjiGregorianYearForDay = isAfterTargetDongzhi 
                      ? targetDate.getFullYear() + 1 
                      : targetDate.getFullYear()
                    const huangjiYearForDay = huangjiGregorianYearForDay + 67017
                    const huangjiYearJiaziForDay = getYearJiazi(huangjiYearForDay)
                    
                    const gregorianDateStr = `${targetDate.getFullYear()}年${targetDate.getMonth() + 1}月${targetDate.getDate()}日`
                    
                    // 皇极月干支（冬至换年、冬至起子月）
                    const huangjiMonthGanZhiForDay = getHuangjiMonthGanZhi(targetDate)
                    
                    // 计算该日的律吕
                    const yearLvForDay = getYearLv(huangjiYearJiaziForDay[0])
                    // 计算皇极月支索引：子月=0, 丑月=1, ...
                    const huangjiMonthBranchForDay = huangjiMonthGanZhiForDay[1]
                    const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
                    const monthBranchIndexForDay = BRANCHES.indexOf(huangjiMonthBranchForDay)
                    const monthLvForDay = getMonthLv(monthBranchIndexForDay >= 0 ? monthBranchIndexForDay : 0)
                    const dayLvForDay = getDayLv(dayGanZhi[0])
                    
                    // 夏历（八字）年柱和月柱（以立春分年、以节分月）
                    const baziYearGanZhi = getYearGanZhi(targetDate)
                    const baziMonthGanZhi = getMonthGanZhi(targetDate)
                    
                    // 获取农历日期
                    const lunarDateStr = getLunarDateString(targetDate)
                    
                    // 计算该日的日卦（利用已知的天干地支索引或直接用 Date 计算）
                    const riHexagram = getRiHexagramByDate(targetDate)

                    const tooltipParts = [
                      `皇历：${huangjiYearJiaziForDay}年 ${huangjiMonthGanZhiForDay}月 ${dayGanZhi}日`,
                      `律吕：${yearLvForDay.name} ${monthLvForDay.name} ${dayLvForDay.name}`,
                      `流日卦：${riHexagram.unicode} ${riHexagram.name}`,
                      `公历：${gregorianDateStr}`,
                      `农历：${lunarDateStr}`,
                      `夏历：${baziYearGanZhi}年 ${baziMonthGanZhi}月 ${dayGanZhi}日`,
                    ]
                    if (day.isTermStart && day.termName) {
                      // 获取该节气对应的闰卦
                      const intercalaryHexagram = getIntercalaryHexagramByName(day.termName)
                      const intercalaryInfo = intercalaryHexagram 
                        ? ` → 闰卦：${intercalaryHexagram.unicode}${intercalaryHexagram.name}`
                        : ''
                      tooltipParts.push(`节气：${day.termName}${intercalaryInfo}`)
                    }
                    if (isToday) {
                      tooltipParts.push('【今天】')
                    }
                    const tooltip = tooltipParts.join('\n')

                    return (
                      <div
                        key={day.dayOfMonth}
                        className={`day-cell ${day.isTermStart ? 'has-term' : ''} ${isToday ? 'today' : ''}`}
                        title={tooltip}
                        onClick={() => setSelectedDateInfo({
                          date: targetDate,
                          huangjiYear: huangjiYearForDay
                        })}
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="day-number">{dayGanZhi}</span>
                        {day.isTermStart && (
                          <span className={`term-badge ${termClass}`}>
                            {day.termName}
                          </span>
                        )}
                        {isToday && <div className="today-dot"></div>}
                      </div>
                    )
                  })}
                </div>
                
                <div className="hui-info">
                  <span className="hui-years">第{month.index + 1}月</span>
                  <span className="hui-terms hui-hexagram" title={`月卦：${yueHexagram.name}`}>
                    <span className="hexagram-symbol" style={{ fontSize: '1.2em', marginRight: '4px' }}>{yueHexagram.unicode}</span>
                    <span className="hexagram-name">{yueHexagram.name}</span>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : viewData ? (
        // 其他级别视图
        (() => {
          // 计算会级视图中运的全局偏移量
          const hui = position.hui ?? 0
          const yunOffset = zoomLevel === 'hui' ? hui * 30 : 0
          return (
            <div className={`zoom-grid zoom-grid-${zoomLevel}`}>
              {viewData.items.map((item) => {
                // 计算全局运编号（仅在会级视图中使用）
                const globalYunNumber = zoomLevel === 'hui' ? yunOffset + item.index + 1 : 0
                // 查找特殊日期（开物/闭物等）
                const specialDate = zoomLevel === 'hui' ? findSpecialDateByYun(globalYunNumber) : undefined
                // 世级视图：根据sui查找特殊日期
                const globalYear = (item.yearStart % TOTAL_YEARS) + 1
                const specialDateBySui = zoomLevel === 'shi' ? findSpecialDateBySui(globalYear) : undefined
                // 动态判断是否是"今年"（皇极经世历以冬至换年）
                const isCurrentHuangjiYearInShi = zoomLevel === 'shi' && globalYear === todayInfo.huangjiSui
                // 会级视图：判断当前运是否包含今年
                const currentYun = Math.ceil(todayInfo.huangjiSui / (SHIS_PER_YUN * YEARS_PER_SHI))
                const isCurrentYunInHui = zoomLevel === 'hui' && globalYunNumber === currentYun
                // 计算运节气（星节气）：1元360运，每15运一个运节气
                const yunTermIndex = zoomLevel === 'hui' ? getYunTermIndex(globalYunNumber) : -1
                const yunTermName = yunTermIndex >= 0 ? SOLAR_TERMS[yunTermIndex] : ''
                const yunTermClass = yunTermName ? SOLAR_TERM_CLASSES[yunTermName] || '' : ''
                // 是否是运节气起点
                const isYunTermStartFlag = zoomLevel === 'hui' && isYunTermStart(globalYunNumber)
                // 计算天干（星用天干）
                const yunStem = zoomLevel === 'hui' ? getStem(globalYunNumber - 1) : ''
                // 合并特殊日期（会级用specialDate，世级用specialDateBySui）
                const activeSpecialDate = specialDate || specialDateBySui
                return (
                  <div
                    key={item.index}
                    className={`zoom-card ${activeSpecialDate ? 'special-yun' : ''} ${isCurrentHuangjiYearInShi || isCurrentYunInHui ? 'current-year' : ''}`}
                    style={activeSpecialDate ? { borderColor: activeSpecialDate.color, boxShadow: `0 0 12px ${activeSpecialDate.color}40` } : undefined}
                    onClick={() => handleZoomIn(item.index)}
                  >
                    <div className="zoom-card-header">
                      <h3 className="zoom-card-title">
                        {zoomLevel === 'hui' ? (
                          <>星{yunStem}{globalYunNumber}</>
                        ) : zoomLevel === 'shi' ? (
                          // 世级视图：显示六十甲子
                          (() => {
                            const jiazi = getYearJiazi(globalYear)
                            return <>岁{jiazi}</>
                          })()
                        ) : (
                          <>{item.name}</>
                        )}
                        {item.pinyin && <span className="zoom-card-pinyin">{item.pinyin}</span>}
                        {(isCurrentHuangjiYearInShi || isCurrentYunInHui) && (
                          <span className="today-badge">今年</span>
                        )}
                        {activeSpecialDate?.badge && (
                          <span 
                            className="special-yun-badge" 
                            style={getSpecialDateBadgeStyle(activeSpecialDate)}
                          >
                            {activeSpecialDate.badge}
                          </span>
                        )}
                      </h3>
                    </div>
                    
                    <div className="zoom-card-info">
                      {zoomLevel === 'hui' ? (
                        // 会级视图：显示世（辰）范围
                        (() => {
                          const shiStart = (globalYunNumber - 1) * SHIS_PER_YUN + 1
                          const shiEnd = globalYunNumber * SHIS_PER_YUN
                          return (
                            <>
                              <p className="zoom-card-years">{shiStart} - {shiEnd}世</p>
                              <p className="zoom-card-range">
                                {(item.yearStart % TOTAL_YEARS) + 1} - {(item.yearEnd % TOTAL_YEARS) + 1}年
                              </p>
                            </>
                          )
                        })()
                      ) : zoomLevel === 'shi' ? (
                        // 世级视图：显示全局年份编号和特殊事件名称
                        <>
                          <p className="zoom-card-years">第{globalYear}年</p>
                          <p className="zoom-card-gregorian">
                            {(() => {
                              const gYear = suiToGregorianYear(globalYear)
                              // 公元纪年没有0年，公元1年之前是公元前1年
                              if (gYear > 0) {
                                return `公元${gYear}年`
                              } else {
                                return `公元前${1 - gYear}年`
                              }
                            })()}
                          </p>
                          {specialDateBySui && (
                            <p className="zoom-card-event" style={{ color: specialDateBySui.color }}>{specialDateBySui.name}</p>
                          )}
                          
                          {/* 岁级(年)卦象显示 */}
                          <div className="zoom-card-hexagram">
                            {(() => {
                              const suiHex = getSuiHexagram(suiToGregorianYear(globalYear))
                              return (
                                <span title={`年卦（岁卦）：${suiHex.name}`}>
                                  <span style={{ fontSize: '1.2em', marginRight: '4px' }}>{suiHex.unicode}</span>
                                  {suiHex.name}
                                </span>
                              )
                            })()}
                          </div>
                        </>
                      ) : (
                        // 其他级别视图
                        <>
                          <p className="zoom-card-years">
                            {item.yearCount > 1 
                              ? `${item.yearCount.toLocaleString()}年`
                              : `${(item.yearStart % TOTAL_YEARS) + 1}年`
                            }
                          </p>
                          {item.yearCount > 1 && (
                            <p className="zoom-card-range">
                              年{(item.yearStart % TOTAL_YEARS) + 1} - {(item.yearEnd % TOTAL_YEARS) + 1}
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    {/* 运节气显示（会级视图）- 星节气 */}
                    {zoomLevel === 'hui' && isYunTermStartFlag && (
                      <div className="zoom-card-term">
                        <span className={`zoom-term-name ${yunTermClass}`}>{yunTermName}</span>
                        <span className="zoom-term-start">星节气</span>
                        {specialDate?.term && (
                          <span className="zoom-term-special">{specialDate.name}</span>
                        )}
                      </div>
                    )}

                    {/* 地支标记 */}
                    {item.branchIndex !== undefined && (
                      <div className="zoom-card-branch">
                        <span className="branch-symbol">{EARTHLY_BRANCHES[item.branchIndex]}</span>
                      </div>
                    )}

                    {/* 节气摘要 */}
                    {item.termSummary && item.termSummary.length <= 4 && (
                      <div className="zoom-card-terms">
                        {item.termSummary.map((term, i) => (
                          <span key={i} className="term-tag">{term}</span>
                        ))}
                      </div>
                    )}
                    
                    {/* 卦象显示（仅会级）- 显示变卦来源 */}
                    {zoomLevel === 'hui' && (
                      <div className="zoom-card-hexagram">
                        {(() => {
                          // 会级视图：使用运卦详情（包含主卦来源）
                          const detail = getYunHexagramDetailByGlobal(globalYunNumber)
                          return (
                            <>
                              <div className="hexagram-source">
                                <span className="master-hexagram" title={`主卦：${detail.masterHexagram.name}`}>
                                  {detail.masterHexagram.unicode}{detail.masterHexagram.name}
                                </span>
                                <span className="hexagram-arrow">→</span>
                                <span className="yun-hexagram" title={`运卦：${detail.yunHexagram.name}（${detail.yaoName}爻变）`}>
                                  {detail.yunHexagram.unicode}{detail.yunHexagram.name}
                                </span>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })()
      ) : null}

      {/* 节气图例 */}
      <footer className="calendar-footer">
        <div className="kaiwu-biwu-legend">
          <p className="legend-title">开物 / 闭物</p>
          <div className="kaiwu-biwu-info">
            <span className="kaiwu-legend">月寅开物（惊蛰）</span>
            <span className="biwu-legend">月戌闭物（立冬）</span>
          </div>
        </div>
        <div className="stems-legend">
          <p className="legend-title">十天干（日/星）</p>
          <div className="branches-grid">
            {HEAVENLY_STEMS.map((stem, i) => (
              <span key={i} className="branch-legend-item">
                {stem}
              </span>
            ))}
          </div>
        </div>
        <div className="branches-legend">
          <p className="legend-title">十二地支（月/辰）</p>
          <div className="branches-grid">
            {EARTHLY_BRANCHES.map((branch, i) => (
              <span key={i} className={`branch-legend-item ${i === KAIWU_INDEX ? 'kaiwu-branch' : ''} ${i === BIWU_INDEX ? 'biwu-branch' : ''}`}>
                {branch}
              </span>
            ))}
          </div>
        </div>
        <div className="terms-legend">
          <p className="legend-title">二十四节气</p>
          <div className="terms-grid">
            {SOLAR_TERMS.map((term, i) => (
              <span key={i} className={`term-legend-item ${term === '惊蛰' ? 'kaiwu-term' : ''} ${term === '立冬' ? 'biwu-term' : ''}`}>{term}</span>
            ))}
          </div>
        </div>
        <p className="footer-note">
          日甲（元）= 12月（会）= 360星（运）= 4320辰（世）= 129600年
        </p>
      </footer>
      
      {/* 日期详情弹出卡片 */}
      {selectedDateInfo && (
        <DateDetailModal
          date={selectedDateInfo.date}
          huangjiYear={selectedDateInfo.huangjiYear}
          onClose={() => setSelectedDateInfo(null)}
        />
      )}
    </div>
  )
}
