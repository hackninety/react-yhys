import { useState, useCallback, useMemo } from 'react'
import Calendar from './components/Calendar'
import { type ZoomLevel, type ZoomPosition, yearIndexToPosition } from './utils/calendar'
import { specialDates } from './data/specialDates'
import './App.css'

// 查找"今年"的年份索引
function findCurrentYearIndex(): number {
  const currentYear = specialDates.find(d => d.badge === '今年')
  if (currentYear?.sui) {
    return currentYear.sui - 1 // sui 是 1-based，yearIndex 是 0-based
  }
  return 0
}

function App() {
  // 初始化定位到"今年"
  const initialYearIndex = useMemo(() => findCurrentYearIndex(), [])
  const initialPosition = useMemo(() => yearIndexToPosition(initialYearIndex, 'shi'), [initialYearIndex])
  
  const [yearIndex, setYearIndex] = useState(initialYearIndex)
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('shi')
  const [position, setPosition] = useState<ZoomPosition>(initialPosition)

  const handleZoomChange = useCallback((level: ZoomLevel, newPosition: ZoomPosition) => {
    setZoomLevel(level)
    setPosition(newPosition)
  }, [])

  return (
    <div className="app">
      <Calendar
        yearIndex={yearIndex}
        onYearChange={setYearIndex}
        zoomLevel={zoomLevel}
        onZoomChange={handleZoomChange}
        position={position}
      />
    </div>
  )
}

export default App
