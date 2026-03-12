import { useSyncExternalStore } from 'react'
import {
  getAlgorithmSnapshot,
  subscribeAlgorithm,
  switchAlgorithm,
} from '../algorithms/registry'
import './AlgorithmSwitch.css'

export function AlgorithmSwitch() {
  const currentAlgorithmName = useSyncExternalStore(subscribeAlgorithm, getAlgorithmSnapshot)

  const handleToggle = () => {
    switchAlgorithm(currentAlgorithmName === '黄畿' ? '祝泌' : '黄畿')
  }

  return (
    <div className="algorithm-switch-container">
      <span className="algorithm-label">算法：</span>
      <button 
        className="algorithm-toggle-btn" 
        onClick={handleToggle}
        title={`当前算法：${currentAlgorithmName}。点击切换。`}
      >
        <div className={`algorithm-toggle-slider ${currentAlgorithmName === '祝泌' ? 'switched' : ''}`}>
          <span className="algorithm-text huangji">黄畿</span>
          <span className="algorithm-text zhubi">祝泌</span>
        </div>
      </button>
    </div>
  )
}
