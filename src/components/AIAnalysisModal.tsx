import { useState, useEffect } from 'react'
import {
  getShiHexagramByYear,
  getSuiHexagram,
  getYunHexagramByGlobal,
  getHuiHexagram
} from '../data/hexagrams64'
import {
  gregorianYearToSui,
  getYearJiazi
} from '../utils/calendar'
import './AIAnalysisModal.css'

interface AIAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  algorithmName: string
}

export function AIAnalysisModal({ isOpen, onClose, algorithmName }: AIAnalysisModalProps) {
  const [startYearStr, setStartYearStr] = useState('1984')
  const [endYearStr, setEndYearStr] = useState('2043')
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

  const handleGenerate = () => {
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
            hexagram: `${yunHex.unicode}${yunHex.name}` // 此处简化为只展示运卦
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
          {errorMsg && (
            <div className="ai-error-msg">{errorMsg}</div>
          )}

          <div className="ai-modal-form">
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
            <button className="ai-action-btn" onClick={handleGenerate}>
              生成 JSON
            </button>
          </div>

          <div className="ai-result-panel">
            <div className="ai-result-header">
              <span className="ai-result-title">分析数据 ({algorithmName})</span>
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
              placeholder="点击生成 JSON 将在这里显示..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}
