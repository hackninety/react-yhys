import { useState } from 'react'
import { useSyncExternalStore } from 'react'
import {
  getAlgorithmSnapshot,
  subscribeAlgorithm,
  switchAlgorithm,
} from '../algorithms/registry'
import { AIAnalysisModal } from './AIAnalysisModal'
import './AlgorithmSwitch.css'

export function AlgorithmSwitch() {
  const currentAlgorithmName = useSyncExternalStore(subscribeAlgorithm, getAlgorithmSnapshot)
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)

  const handleToggle = () => {
    switchAlgorithm(currentAlgorithmName === '黄畿' ? '祝泌' : '黄畿')
  }

  return (
    <>
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
        <button className="ai-analysis-btn" onClick={() => setIsAIModalOpen(true)} title="生成用于 AI 分析的 JSON 数据">
          <span className="ai-analysis-icon">✨</span> AI 分析
        </button>
      </div>

      <AIAnalysisModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
        algorithmName={currentAlgorithmName}
      />
    </>
  )
}
