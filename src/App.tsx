import { useState, useCallback, useMemo } from 'react'
import Calendar from './components/Calendar'
import { GuoyunKline } from './components/GuoyunKline'
import { type ZoomLevel, type ZoomPosition, yearIndexToPosition } from './utils/calendar'
import { getTermStartDate } from './utils/solarTerms'
import './App.css'

// 动态计算当前皇极年的索引（基于冬至换年）
function findCurrentYearIndex(): number {
  const now = new Date()
  const gregorianYear = now.getFullYear()

  // 获取今年冬至日期（节气索引23=冬至）
  const dongzhiThisYear = getTermStartDate(gregorianYear, 23)

  // 判断今天是否在冬至之后
  const todayDate = new Date(gregorianYear, now.getMonth(), now.getDate())
  const isAfterDongzhi = todayDate.getTime() >= dongzhiThisYear.getTime()

  // 皇极年份：如果在冬至之后，皇极年对应下一年
  const huangjiGregorianYear = isAfterDongzhi ? gregorianYear + 1 : gregorianYear
  const huangjiSui = huangjiGregorianYear + 67017 // gregorianYearToSui offset

  return huangjiSui - 1 // sui 是 1-based，yearIndex 是 0-based
}

function App() {
  // 初始化定位到"今年"的岁（年）级别
  const initialYearIndex = useMemo(() => findCurrentYearIndex(), [])
  const initialPosition = useMemo(() => yearIndexToPosition(initialYearIndex, 'nian'), [initialYearIndex])

  const [yearIndex, setYearIndex] = useState(initialYearIndex)
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('nian')
  const [position, setPosition] = useState<ZoomPosition>(initialPosition)
  const [view, setView] = useState<'calendar' | 'kline'>('calendar')

  const handleZoomChange = useCallback((level: ZoomLevel, newPosition: ZoomPosition) => {
    setZoomLevel(level)
    setPosition(newPosition)
  }, [])

  return (
    <div className="app">
      <nav className="app-view-switch">
        <button className={view === 'calendar' ? 'on' : ''} onClick={() => setView('calendar')}>历法</button>
        <button className={view === 'kline' ? 'on' : ''} onClick={() => setView('kline')}>国运K线</button>
      </nav>
      {view === 'calendar' ? (
        <Calendar
          yearIndex={yearIndex}
          onYearChange={setYearIndex}
          zoomLevel={zoomLevel}
          onZoomChange={handleZoomChange}
          position={position}
        />
      ) : (
        <GuoyunKline />
      )}
    </div>
  )
}

export default App
