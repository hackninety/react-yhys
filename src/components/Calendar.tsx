import { useMemo, useCallback } from 'react'
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
  ZOOM_LEVELS,
  ZOOM_INFO,
  zoomIn,
  zoomOut,
  positionToYearIndex,
  yearIndexToPosition,
  getParentLevel,
  getChildLevel,
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
  const childLevel = getChildLevel(zoomLevel)
  const zoomInfo = ZOOM_INFO[zoomLevel]

  // 获取当前视图的标题（按皇极经世原文格式：日甲一月子一星甲一辰子一）
  const getTitle = () => {
    if (zoomLevel === 'yuan' && yuanData) {
      // 日（元）用天干
      const yuanStem = getStem(yuanData.yuanIndex)
      return `日${yuanStem}${yuanData.yuanIndex + 1}（元）`
    }
    if (zoomLevel === 'hui' && viewData) {
      // 月（会）用地支
      const hui = position.hui ?? 0
      const huiBranch = getBranch(hui)
      return `第${position.yuan + 1}元 · 月${huiBranch}${hui + 1}（会）`
    }
    if (zoomLevel === 'yun' && yunData) {
      const hui = position.hui ?? 0
      const yun = position.yun ?? 0
      const globalYun = hui * YUNS_PER_HUI + yun + 1
      const huiBranch = getBranch(hui)
      const yunStem = getStem(globalYun - 1)
      return `月${huiBranch}${hui + 1}（会） · 星${yunStem}${globalYun}（运）`
    }
    if (zoomLevel === 'shi' && viewData) {
      const hui = position.hui ?? 0
      const yun = position.yun ?? 0
      const shi = position.shi ?? 0
      const globalYun = hui * YUNS_PER_HUI + yun + 1
      const globalShi = (globalYun - 1) * SHIS_PER_YUN + shi + 1
      const yunStem = getStem(globalYun - 1)
      const shiBranch = getBranch(globalShi - 1)
      return `星${yunStem}${globalYun}（运） · 辰${shiBranch}${globalShi}（世）`
    }
    if (zoomLevel === 'nian' && yearData) {
      const { state } = yearData
      const jiazi = getYearJiazi(state.yearInCycle + 1)
      return `月${state.huiBranch} · 星${state.yunStem}${state.globalYun} · 辰${state.shiBranch}${state.globalShi} · 岁${jiazi}（第${state.yearInCycle + 1}年）`
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
      return `循环年份：${yearData.state.yearInCycle + 1} / ${TOTAL_YEARS.toLocaleString()}`
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
                    return (
                      <div
                        key={yun.index}
                        className={`day-cell yun-cell ${hasTerm ? 'has-term' : ''} ${specialDate ? 'special-date' : ''}`}
                        style={specialDate ? getSpecialDateStyle(specialDate) : undefined}
                        title={`第${globalYunNumber}星（运） · ${shiStart}-${shiEnd}辰（世） · 年${(yun.yearStart % TOTAL_YEARS) + 1}-${(yun.yearEnd % TOTAL_YEARS) + 1}${specialDate ? ` · 【${specialDate.description}】` : ''}`}
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
                        {specialDate && (
                          <span className="special-date-badge" style={getSpecialDateBadgeStyle(specialDate)}>
                            {specialDate.badge}
                          </span>
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
                      {specialDateForShi && (
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
                        return (
                          <div
                            key={nian.index}
                            className={`day-cell nian-cell ${hasTerm ? 'has-term' : ''} ${specialDateForNian ? 'special-date' : ''}`}
                            style={specialDateForNian ? getSpecialDateStyle(specialDateForNian) : undefined}
                            title={`岁${jiazi} · 第${globalYearNumber}年${specialDateForNian ? ` · 【${specialDateForNian.name}】` : ''}`}
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
                            {specialDateForNian && (
                              <span className="special-date-badge" style={getSpecialDateBadgeStyle(specialDateForNian)}>
                                {specialDateForNian.badge}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    
                    <div className="hui-info">
                      <span className="hui-years">第{globalShiNumber}世</span>
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
          {yearData.months.map((month) => (
            <div 
              key={month.index} 
              className={`month-card ${month.index === KAIWU_INDEX ? 'kaiwu' : ''} ${month.index === BIWU_INDEX ? 'biwu' : ''}`}
            >
              <h3 className="month-title">
                月{EARTHLY_BRANCHES[month.index]}
                {month.index === KAIWU_INDEX && <span className="kaiwu-badge">开物</span>}
                {month.index === BIWU_INDEX && <span className="biwu-badge">闭物</span>}
                <span className="month-pinyin">{month.branchPinyin}</span>
                <span className="month-number">第{month.index + 1}月</span>
              </h3>
              
              <div className="days-grid">
                {month.days.map((day) => {
                  const termClass = day.termName ? SOLAR_TERM_CLASSES[day.termName] || '' : ''
                  return (
                    <div
                      key={day.dayOfMonth}
                      className={`day-cell ${day.isTermStart ? 'has-term' : ''}`}
                      title={`${day.termName} · 年第${day.dayOfYear}天`}
                    >
                      <span className="day-number">{day.dayOfMonth}</span>
                      {day.isTermStart && (
                        <span className={`term-badge ${termClass}`}>{day.termName}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
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
                    className={`zoom-card ${activeSpecialDate ? 'special-yun' : ''}`}
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
                        {activeSpecialDate && (
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
                          {specialDateBySui && (
                            <p className="zoom-card-event" style={{ color: specialDateBySui.color }}>{specialDateBySui.name}</p>
                          )}
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
                    
                    {childLevel && (
                      <div className="zoom-card-hint">
                        点击进入{ZOOM_INFO[childLevel].alias}级 →
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
    </div>
  )
}
