import { useState, useEffect } from 'react'
import {
  getShiHexagramByYear,
  getSuiHexagram,
  getYunHexagramByGlobal,
  getYunHexagramDetailByGlobal,
  getHuiHexagram
} from '../data/hexagrams64'
import {
  gregorianYearToSui,
  getYearJiazi,
  getStem,
  EARTHLY_BRANCHES
} from '../utils/calendar'
import './AIAnalysisModal.css'

interface AIAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  algorithmName: string
}

type AnalysisMode = 'sui' | 'xing'

export function AIAnalysisModal({ isOpen, onClose, algorithmName }: AIAnalysisModalProps) {
  const [mode, setMode] = useState<AnalysisMode>('sui')
  const [startYearStr, setStartYearStr] = useState('1984')
  const [endYearStr, setEndYearStr] = useState('2043')
  const [startStarStr, setStartStarStr] = useState('181')
  const [endStarStr, setEndStarStr] = useState('192')
  const [resultJson, setResultJson] = useState('')
  const [isCopied, setIsCopied] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // 阻止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setIsCopied(false)
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleGenerateSui = () => {
    const startYear = parseInt(startYearStr, 10)
    const endYear = parseInt(endYearStr, 10)

    if (isNaN(startYear) || isNaN(endYear)) {
      setErrorMsg('请输入有效的数字年份')
      return
    }
    if (startYear > endYear) {
      setErrorMsg('起始年份不能大于结束年份')
      return
    }
    if (endYear - startYear > 500) {
      setErrorMsg('年份范围不宜超过500年')
      return
    }
    setErrorMsg('')

    try {
      const yearsData = []
      const shiSet = new Map()
      const currentYunSet = new Map()
      let currentHuiData = null

      for (let y = startYear; y <= endYear; y++) {
        const huangjiSui = gregorianYearToSui(y)
        const ganZhi = getYearJiazi(huangjiSui)

        // 岁卦
        const suiHex = getSuiHexagram(y)

        // 世卦
        const shiHex = getShiHexagramByYear(huangjiSui)
        const globalShiNumber = Math.ceil(huangjiSui / 30)

        // 运卦
        const globalYunNumber = Math.ceil(globalShiNumber / 12)
        const yunHex = getYunHexagramByGlobal(globalYunNumber)

        // 会卦
        const huiIndex = Math.floor((globalYunNumber - 1) / 30) % 12
        const huiHex = getHuiHexagram(huiIndex)

        // 位置
        const pos = {
          yuan: Math.floor((globalYunNumber - 1) / 360) + 1,
          hui: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][huiIndex],
          yun: globalYunNumber,
          shi: globalShiNumber,
          yearInShi: ((huangjiSui - 1) % 30) + 1
        }

        yearsData.push({
          year: y,
          ganZhi,
          suiHexagram: { name: suiHex.name, unicode: suiHex.unicode, binary: suiHex.binary },
          shiHexagram: { name: shiHex.name, unicode: shiHex.unicode, binary: shiHex.binary },
          yunHexagram: { name: yunHex.name, unicode: yunHex.unicode, binary: yunHex.binary },
          position: pos
        })

        // 记录唯一世信息
        if (!shiSet.has(globalShiNumber)) {
          const shiStartYear = y - pos.yearInShi + 1;
          const shiEndYear = shiStartYear + 29;
          shiSet.set(globalShiNumber, {
            globalNumber: globalShiNumber,
            years: `${shiStartYear}-${shiEndYear}`,
            hexagram: `${shiHex.unicode}${shiHex.name}`
          })
        }

        // 记录唯一运信息
        if (!currentYunSet.has(globalYunNumber)) {
          currentYunSet.set(globalYunNumber, {
            index: globalYunNumber - 1,
            name: `第${globalYunNumber}运`,
            hexagram: `${yunHex.unicode}${yunHex.name}`
          })
        }

        if (!currentHuiData) {
          currentHuiData = {
            index: huiIndex,
            name: `${pos.hui}会`,
            hexagram: `${huiHex.unicode}${huiHex.name}`
          }
        }
      }

      // 动态计算 yuan
      const firstYearSui = gregorianYearToSui(startYear)
      const firstGlobalShi = Math.ceil(firstYearSui / 30)
      const firstGlobalYun = Math.ceil(firstGlobalShi / 12)
      const yuanIndex = Math.floor((firstGlobalYun - 1) / 360)

      const result = {
        algorithm: algorithmName,
        range: `${startYear}-${endYear}`,
        context: {
          yuan: { index: yuanIndex, name: `第${yuanIndex + 1}元` },
          hui: currentHuiData,
          yuns: Array.from(currentYunSet.values()),
          shi_list: Array.from(shiSet.values())
        },
        years: yearsData
      }

      setResultJson(JSON.stringify(result, null, 2))
      setIsCopied(false)
    } catch (err: any) {
      setErrorMsg(`生成出错: ${err.message}`)
    }
  }

  const handleGenerateXing = () => {
    const startStar = parseInt(startStarStr, 10)
    const endStar = parseInt(endStarStr, 10)

    if (isNaN(startStar) || isNaN(endStar)) {
      setErrorMsg('请输入有效的星编号')
      return
    }
    if (startStar > endStar) {
      setErrorMsg('起始星号不能大于结束星号')
      return
    }
    if (startStar < 1 || endStar > 4320) {
      setErrorMsg('星编号范围为 1-4320')
      return
    }
    if (endStar - startStar > 360) {
      setErrorMsg('星级范围不宜超过360')
      return
    }
    setErrorMsg('')

    try {
      const starsData = []

      for (let s = startStar; s <= endStar; s++) {
        const detail = getYunHexagramDetailByGlobal(s)
        const stem = getStem(s - 1)

        // 会信息
        const huiIndex = Math.floor((s - 1) / 30) % 12
        const huiBranch = EARTHLY_BRANCHES[huiIndex]
        const huiHex = getHuiHexagram(huiIndex)

        // 元信息
        const yuanIndex = Math.floor((s - 1) / 360)

        starsData.push({
          starNumber: s,
          starName: `星${stem}${s}`,
          masterHexagram: {
            name: detail.masterHexagram.name,
            unicode: detail.masterHexagram.unicode,
            binary: detail.masterHexagram.binary
          },
          yunHexagram: {
            name: detail.yunHexagram.name,
            unicode: detail.yunHexagram.unicode,
            binary: detail.yunHexagram.binary
          },
          yaoChanged: detail.yaoChanged,
          yaoName: `${detail.yaoName}爻变`,
          chain: `${detail.masterHexagram.unicode}${detail.masterHexagram.name}→${detail.yunHexagram.unicode}${detail.yunHexagram.name}`,
          parentHui: {
            index: huiIndex,
            name: `${huiBranch}会`,
            hexagram: `${huiHex.unicode}${huiHex.name}`
          },
          yuan: yuanIndex + 1
        })
      }

      // 提取涉及的独立会信息
      const huiSet = new Map()
      for (const star of starsData) {
        if (!huiSet.has(star.parentHui.index)) {
          huiSet.set(star.parentHui.index, star.parentHui)
        }
      }

      const result = {
        type: '星级卦象',
        range: `星${getStem(startStar - 1)}${startStar} - 星${getStem(endStar - 1)}${endStar}`,
        context: {
          hui_list: Array.from(huiSet.values()),
          description: '每星（运）由主卦变一爻而来，主卦来自其所在会的先天60卦序'
        },
        stars: starsData
      }

      setResultJson(JSON.stringify(result, null, 2))
      setIsCopied(false)
    } catch (err: any) {
      setErrorMsg(`生成出错: ${err.message}`)
    }
  }

  const handleGenerate = () => {
    if (mode === 'sui') {
      handleGenerateSui()
    } else {
      handleGenerateXing()
    }
  }

  const handleCopy = async () => {
    if (!resultJson) return
    try {
      // 复制压缩版 JSON（去除空格和换行，减少 AI Token 消耗）
      const compressed = JSON.stringify(JSON.parse(resultJson))
      await navigator.clipboard.writeText(compressed)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      setErrorMsg('复制失败，请手动选择复制')
    }
  }

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-modal-container" onClick={e => e.stopPropagation()}>
        <div className="ai-modal-header">
          <h2 className="ai-modal-title">✨ AI 分析数据生成</h2>
          <button className="ai-modal-close" onClick={onClose} aria-label="关闭">×</button>
        </div>

        <div className="ai-modal-body">
          {/* 模式切换 */}
          <div className="ai-mode-switch">
            <button 
              className={`ai-mode-btn ${mode === 'sui' ? 'active' : ''}`}
              onClick={() => { setMode('sui'); setResultJson(''); setErrorMsg('') }}
            >
              岁级卦象
            </button>
            <button 
              className={`ai-mode-btn ${mode === 'xing' ? 'active' : ''}`}
              onClick={() => { setMode('xing'); setResultJson(''); setErrorMsg('') }}
            >
              星级卦象
            </button>
          </div>

          {errorMsg && (
            <div className="ai-error-msg">{errorMsg}</div>
          )}

          <div className="ai-modal-form">
            {mode === 'sui' ? (
              <>
                <div className="ai-form-group">
                  <label>起始年份（公历）</label>
                  <input 
                    type="number" 
                    className="ai-form-input" 
                    value={startYearStr}
                    onChange={e => setStartYearStr(e.target.value)}
                  />
                </div>
                <div className="ai-form-group">
                  <label>结束年份（公历）</label>
                  <input 
                    type="number" 
                    className="ai-form-input" 
                    value={endYearStr}
                    onChange={e => setEndYearStr(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="ai-form-group">
                  <label>起始星号</label>
                  <input 
                    type="number" 
                    className="ai-form-input" 
                    value={startStarStr}
                    onChange={e => setStartStarStr(e.target.value)}
                    placeholder="如: 181"
                  />
                </div>
                <div className="ai-form-group">
                  <label>结束星号</label>
                  <input 
                    type="number" 
                    className="ai-form-input" 
                    value={endStarStr}
                    onChange={e => setEndStarStr(e.target.value)}
                    placeholder="如: 192"
                  />
                </div>
              </>
            )}
            <button className="ai-action-btn" onClick={handleGenerate}>
              生成 JSON
            </button>
          </div>

          <div className="ai-result-panel">
            <div className="ai-result-header">
              <span className="ai-result-title">
                {mode === 'sui' ? `分析数据 (${algorithmName})` : '星级卦象数据'}
              </span>
              <button 
                className={`ai-copy-btn ${isCopied ? 'copied' : ''}`} 
                onClick={handleCopy}
                title="一键复制到剪贴板，随后可以发给 ChatGPT / Claude / Kimi 等进行分析"
              >
                {isCopied ? '✓ 已复制' : '⧉ 复制内容'}
              </button>
            </div>
            <textarea 
              className="ai-result-textarea" 
              value={resultJson} 
              readOnly 
              placeholder={mode === 'sui' 
                ? '点击生成 JSON 将在这里显示...' 
                : '输入星编号范围后点击生成，如 181-192...'
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
