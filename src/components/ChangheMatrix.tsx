import React, { useState, useEffect } from 'react'
import { CHANGHE_MATRIX } from '../data/changheMatrix'
import './ChangheMatrix.css'

interface ChangheMatrixProps {
  onClose: () => void
  highlightTian?: number // 高亮的当年/日的天干索引 0-9
  highlightDi?: number   // 高亮的当年/日的地支索引 0-11
}

const DI_YIN_ZHI = ['子(水开清)', '丑(火发浊)', '寅(水开清)', '卯(火发浊)', '辰(土收清)', '巳(石闭浊)', '午(水开清)', '未(火发浊)', '申(土收清)', '酉(石闭浊)', '戌(水开清)', '亥(火发浊)']

export const ChangheMatrix: React.FC<ChangheMatrixProps> = ({ onClose, highlightTian, highlightDi }) => {
  const [mounted, setMounted] = useState(false)

  // 动画效果
  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden' // 防止背景滚动
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  return (
    <div className={`changhe-matrix-overlay ${mounted ? 'visible' : ''}`}>
      <div className="changhe-matrix-container">
        
        <header className="matrix-header">
          <div className="matrix-title-group">
            <h2 className="matrix-title">声音唱和图形（112天声 × 152地音）</h2>
            <p className="matrix-subtitle">邵雍《皇极经世书》声音观物全息矩阵</p>
          </div>
          <div className="matrix-actions">
            <div className="legend">
              <span className="legend-item"><span className="legend-box highlight-tian"></span> 今日天干行</span>
              <span className="legend-item"><span className="legend-box highlight-di"></span> 今日地支列</span>
              <span className="legend-item"><span className="legend-box highlight-cross"></span> 交汇发音</span>
            </div>
            <button className="matrix-close-btn" onClick={() => {
              setMounted(false)
              setTimeout(onClose, 300)
            }}>
              返回日历 ✕
            </button>
          </div>
        </header>

        <div className="matrix-scroll-area">
          <div className="matrix-table-wrapper">
            <table className="changhe-table">
              <thead>
                <tr>
                  <th colSpan={3} className="corner-th">
                    <div className="corner-content">
                      <span className="matrix-axis-y">天声 (韵母部)</span>
                      <span className="matrix-axis-x">地音 (声母部)</span>
                    </div>
                  </th>
                  {DI_YIN_ZHI.map((zhi, idx) => (
                    <th key={idx} className={`diyin-th ${highlightDi === idx ? 'th-highlight' : ''}`}>
                      <div className="diyin-header-content">
                        <span className="diyin-index">第{idx + 1}音</span>
                        <span className="diyin-zhi">{zhi.split('(')[0]}</span>
                        <span className="diyin-props">{zhi.split('(')[1].replace(')', '')}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CHANGHE_MATRIX.map((group, groupIdx) => (
                  <React.Fragment key={groupIdx}>
                    {/* 一组天声（包含平上去入四行） */}
                    {group.rows.map((row, rowIdx) => {
                      const isFirstRow = rowIdx === 0
                      const isHighlightTian = highlightTian === groupIdx
                      
                      return (
                        <tr key={`${groupIdx}-${rowIdx}`} className={isHighlightTian ? 'tr-highlight' : ''}>
                          {isFirstRow && (
                            <td rowSpan={4} className={`group-name-td ${isHighlightTian ? 'td-highlight-tian' : ''}`}>
                              <div className="group-name-content">
                                <span className="gn-title">{group.name}</span>
                                <span className="gn-props">{group.xiang}象·{group.qingZhuo}{group.xiSheng}</span>
                              </div>
                            </td>
                          )}
                          {isFirstRow && (
                            <td rowSpan={4} className="group-stem-td">
                              {['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'][groupIdx]}干
                            </td>
                          )}
                          <td className="tone-td">{row.tone}声</td>
                          
                          {/* 渲染12个地音单元格 */}
                          {row.cells.map((cell, cellIdx) => {
                            const isHighlightDi = highlightDi === cellIdx
                            const isCross = isHighlightTian && isHighlightDi
                            const isEmpty = cell.char === '○' || cell.char === '●' || cell.char === ''
                            
                            return (
                              <td 
                                key={cellIdx} 
                                className={`char-td 
                                  ${isEmpty ? 'empty-char' : ''} 
                                  ${isHighlightDi ? 'td-highlight-di' : ''} 
                                  ${isCross ? 'td-highlight-cross' : ''}
                                `}
                              >
                                {cell.char}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                    {/* 组间隔断 */}
                    <tr className="group-spacer"><td colSpan={15}></td></tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
