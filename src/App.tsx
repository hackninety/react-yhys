import { useState, useCallback } from 'react'
import Calendar from './components/Calendar'
import { type ZoomLevel, type ZoomPosition } from './utils/calendar'
import './App.css'

function App() {
  const [yearIndex, setYearIndex] = useState(0)
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('nian')
  const [position, setPosition] = useState<ZoomPosition>({ yuan: 0, hui: 0, yun: 0, shi: 0, nian: 0 })

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
