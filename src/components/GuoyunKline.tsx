import { useState, useMemo, useRef, useEffect, useCallback, useSyncExternalStore } from 'react'
import {
  FORTUNE_METRICS,
  buildCandles,
  yearHexagrams,
  hexScore,
  yunStartYear,
  yearGanZhi,
  type FortuneMetric,
  type Candle,
} from '../utils/fortune'
import { subscribeAlgorithm, getAlgorithmSnapshot } from '../algorithms/registry'
import './GuoyunKline.css'

type Gran = 'nian' | 'shi' | 'yun'
const GRAN_UNIT: Record<Gran, number> = { nian: 1, shi: 30, yun: 360 }
const GRAN_LABEL: Record<Gran, string> = { nian: '年（线）', shi: '世（30年/烛）', yun: '运（360年/烛）' }

const fmtYear = (y: number) => (y < 0 ? `前${1 - y}` : `${y}`)

function readTheme() {
  const s = getComputedStyle(document.documentElement)
  const g = (n: string, f: string) => (s.getPropertyValue(n).trim() || f)
  return {
    text: g('--color-text', '#e8e4d9'),
    dim: g('--color-text-dim', '#7a7a8a'),
    border: g('--color-border', '#2d2d3d'),
    gold: g('--color-primary', '#D4AF37'),
    up: g('--wuxing-huo', '#DC143C'), // 阳长·升
    down: '#3aa76d', // 阴消·降
    jie: '#e8a13a', // 赤马红羊
    card: g('--color-bg-card', '#14141f'),
  }
}

export function GuoyunKline() {
  // 订阅算法切换（岁卦随之变化）
  const algoName = useSyncExternalStore(subscribeAlgorithm, getAlgorithmSnapshot)

  const [metric, setMetric] = useState<FortuneMetric>('yang')
  const [gran, setGran] = useState<Gran>('shi')
  const [start, setStart] = useState(() => yunStartYear(new Date().getFullYear()))
  const [end, setEnd] = useState(() => yunStartYear(new Date().getFullYear()) + 359)
  const [showMM, setShowMM] = useState(true)
  const [showJie, setShowJie] = useState(true)
  const [hover, setHover] = useState<number | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(720)

  const theme = useMemo(readTheme, [])
  const metricMeta = FORTUNE_METRICS.find(m => m.key === metric)!
  const unit = GRAN_UNIT[gran]

  // 蜡烛数据（依赖 algoName 以在切换算法时重算）
  const candles = useMemo(() => {
    void algoName
    let a = Math.min(start, end)
    let b = Math.max(start, end)
    // 上限保护：控制蜡烛数量
    const maxCandles = 600
    if ((b - a) / unit > maxCandles) b = a + maxCandles * unit
    return buildCandles(a, b, unit, metric)
  }, [start, end, unit, metric, algoName])

  // 响应式宽度
  useEffect(() => {
    if (!wrapRef.current) return
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setWidth(Math.max(320, e.contentRect.width))
    })
    ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [])

  const H = 420
  const layout = useMemo(() => ({ padL: 52, padR: 18, padT: 18, padB: 52 }), [])

  // y 轴域
  const domain = useMemo(() => {
    if (candles.length === 0) return { lo: 0, hi: 1 }
    let lo = Infinity, hi = -Infinity
    for (const c of candles) { lo = Math.min(lo, c.low); hi = Math.max(hi, c.high) }
    const signed = metric !== 'yang'
    if (signed) { lo = Math.min(lo, 0); hi = Math.max(hi, 0) }
    const pad = Math.max((hi - lo) * 0.12, 0.3)
    lo -= pad; hi += pad
    if (metric === 'yang') lo = Math.max(0, lo)
    return { lo, hi }
  }, [candles, metric])

  const draw = useCallback(() => {
    const cv = canvasRef.current
    if (!cv) return
    const dpr = window.devicePixelRatio || 1
    const W = width
    cv.width = W * dpr; cv.height = H * dpr
    cv.style.width = W + 'px'; cv.style.height = H + 'px'
    const ctx = cv.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)

    const { padL, padR, padT, padB } = layout
    const iw = W - padL - padR, ih = H - padT - padB
    const n = candles.length
    const { lo, hi } = domain
    const yr = hi - lo || 1
    const X = (i: number) => padL + iw * (i + 0.5) / Math.max(n, 1)
    const Y = (v: number) => padT + ih * (1 - (v - lo) / yr)

    // 网格 + y 轴刻度
    ctx.font = '11px ' + '"Noto Serif SC",serif'
    ctx.textAlign = 'right'
    const gridN = 5
    for (let g = 0; g <= gridN; g++) {
      const v = lo + yr * g / gridN, y = Y(v)
      ctx.strokeStyle = theme.border; ctx.globalAlpha = 0.5
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke()
      ctx.globalAlpha = 1; ctx.fillStyle = theme.dim
      ctx.fillText(v.toFixed(1), padL - 6, y + 3)
    }
    // 零基线（有符号标量）
    if (metric !== 'yang' && lo < 0 && hi > 0) {
      ctx.strokeStyle = theme.dim; ctx.globalAlpha = 0.9; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(padL, Y(0)); ctx.lineTo(W - padR, Y(0)); ctx.stroke()
      ctx.globalAlpha = 1
    }
    // y 轴标题
    ctx.save(); ctx.translate(14, padT + ih / 2); ctx.rotate(-Math.PI / 2)
    ctx.textAlign = 'center'; ctx.fillStyle = theme.dim
    ctx.fillText(metricMeta.label, 0, 0); ctx.restore()

    // 均线 / 中位线（跨全段）
    if (showMM && n > 0) {
      const allMean = candles.map(c => c.mean)
      const mean = allMean.reduce((a, b) => a + b, 0) / allMean.length
      const sorted = [...allMean].sort((a, b) => a - b)
      const med = sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      ctx.strokeStyle = theme.gold; ctx.lineWidth = 1; ctx.globalAlpha = 0.85
      ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(padL, Y(mean)); ctx.lineTo(W - padR, Y(mean)); ctx.stroke()
      ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(padL, Y(med)); ctx.lineTo(W - padR, Y(med)); ctx.stroke()
      ctx.setLineDash([]); ctx.globalAlpha = 1
      ctx.textAlign = 'left'; ctx.fillStyle = theme.gold; ctx.font = '10px "Noto Serif SC",serif'
      ctx.fillText('均 ' + mean.toFixed(2), W - padR - 66, Y(mean) - 4)
      ctx.fillText('中 ' + med.toFixed(2), W - padR - 66, Y(med) + 12)
    }

    if (n === 0) return

    if (unit === 1) {
      // 年级：折线
      ctx.strokeStyle = theme.gold; ctx.lineWidth = 1.4; ctx.beginPath()
      candles.forEach((c, i) => { const x = X(i), y = Y(c.close); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y) })
      ctx.stroke()
      // 赤马红羊点
      if (showJie) candles.forEach((c, i) => {
        if (c.chimaYears.length) {
          ctx.fillStyle = theme.jie
          ctx.beginPath(); ctx.arc(X(i), Y(c.close), 3, 0, Math.PI * 2); ctx.fill()
        }
      })
    } else {
      // 世/运级：蜡烛
      const cw = Math.max(3, Math.min(28, iw / n * 0.62))
      candles.forEach((c, i) => {
        const x = X(i), up = c.close >= c.open
        const col = up ? theme.up : theme.down
        ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.2
        // 影线
        ctx.beginPath(); ctx.moveTo(x, Y(c.high)); ctx.lineTo(x, Y(c.low)); ctx.stroke()
        // 实体
        const yo = Y(c.open), yc = Y(c.close), top = Math.min(yo, yc), hgt = Math.max(2, Math.abs(yo - yc))
        if (up) ctx.fillRect(x - cw / 2, top, cw, hgt)
        else { ctx.lineWidth = 1.4; ctx.strokeRect(x - cw / 2, top, cw, hgt) }
        // 赤马红羊旗标
        if (showJie && c.chimaYears.length) {
          ctx.fillStyle = theme.jie
          ctx.beginPath(); ctx.moveTo(x, Y(c.high) - 6); ctx.lineTo(x - 4, Y(c.high) - 13); ctx.lineTo(x + 4, Y(c.high) - 13); ctx.closePath(); ctx.fill()
        }
        // 悬停高亮
        if (hover === i) {
          ctx.strokeStyle = theme.gold; ctx.globalAlpha = 0.5; ctx.lineWidth = 1
          ctx.strokeRect(x - cw / 2 - 3, padT, cw + 6, ih); ctx.globalAlpha = 1
        }
      })
    }

    // x 轴标签
    ctx.fillStyle = theme.dim; ctx.font = '10px "Noto Serif SC",serif'; ctx.textAlign = 'center'
    const every = Math.max(1, Math.ceil(n / 14))
    candles.forEach((c, i) => {
      if (i % every === 0 || n <= 14) ctx.fillText(fmtYear(c.startYear), X(i), H - padB + 16)
    })
  }, [candles, width, domain, layout, metric, metricMeta, showMM, showJie, hover, theme, unit])

  useEffect(() => { draw() }, [draw])

  // 悬停命中测试
  const onMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const cv = canvasRef.current; if (!cv || candles.length === 0) return
    const rect = cv.getBoundingClientRect()
    const x = e.clientX - rect.left
    const { padL, padR } = layout
    const iw = width - padL - padR
    const i = Math.floor((x - padL) / (iw / candles.length))
    setHover(i >= 0 && i < candles.length ? i : null)
  }, [candles.length, layout, width])

  const hoverCandle: Candle | null = hover != null ? candles[hover] : null

  // 悬停详情：取代表年（收盘年）的卦
  const hoverDetail = useMemo(() => {
    if (!hoverCandle) return null
    const y = hoverCandle.endYear
    const h = yearHexagrams(y)
    return {
      gz: yearGanZhi(y),
      yun: h.yun.name, shi: h.shi.name, sui: h.sui.name,
      yunV: hexScore(h.yun, metric), shiV: hexScore(h.shi, metric), suiV: hexScore(h.sui, metric),
    }
  }, [hoverCandle, metric])

  // 预设
  const applyPreset = (p: 'yun' | 'recent' | 'all') => {
    const cy = new Date().getFullYear()
    if (p === 'yun') { setGran('shi'); const s = yunStartYear(cy); setStart(s); setEnd(s + 359) }
    else if (p === 'recent') { setGran('nian'); setStart(cy - 59); setEnd(cy) }
    else { setGran('yun'); setStart(-2357); setEnd(2100) }
  }

  return (
    <div className="kline">
      <header className="kline-header">
        <h1 className="kline-title">皇极经世 · 国运 K 线</h1>
        <p className="kline-sub">
          烛身方向＝<b style={{ color: theme.up }}>阳长而升</b> / <b style={{ color: theme.down }}>阴消而降</b>；
          上下影线＝该段运势振幅（高/低）；<b style={{ color: theme.gold }}>—</b>均线 <b style={{ color: theme.gold }}>┄</b>中位；
          <b style={{ color: theme.jie }}>▲</b>赤马红羊（丙午/丁未）。当前算法：{algoName}。
        </p>
      </header>

      <div className="kline-controls">
        <div className="ctrl-group">
          <span className="ctrl-label">运势标量</span>
          {FORTUNE_METRICS.map(m => (
            <button key={m.key} className={metric === m.key ? 'on' : ''} onClick={() => setMetric(m.key)} title={m.desc}>{m.label}</button>
          ))}
        </div>
        <div className="ctrl-group">
          <span className="ctrl-label">粒度</span>
          {(['nian', 'shi', 'yun'] as Gran[]).map(g => (
            <button key={g} className={gran === g ? 'on' : ''} onClick={() => setGran(g)}>{GRAN_LABEL[g]}</button>
          ))}
        </div>
        <div className="ctrl-group">
          <span className="ctrl-label">预设</span>
          <button onClick={() => applyPreset('yun')}>本运12世</button>
          <button onClick={() => applyPreset('recent')}>近60年</button>
          <button onClick={() => applyPreset('all')}>全史</button>
        </div>
        <div className="ctrl-group">
          <span className="ctrl-label">起讫</span>
          <input type="number" value={start} onChange={e => setStart(parseInt(e.target.value) || 0)} />
          <span className="ctrl-dash">–</span>
          <input type="number" value={end} onChange={e => setEnd(parseInt(e.target.value) || 0)} />
        </div>
        <div className="ctrl-group">
          <label className="ctrl-check"><input type="checkbox" checked={showMM} onChange={e => setShowMM(e.target.checked)} />均/中位</label>
          <label className="ctrl-check"><input type="checkbox" checked={showJie} onChange={e => setShowJie(e.target.checked)} />赤马红羊</label>
        </div>
      </div>

      <div className="kline-canvas-wrap" ref={wrapRef} style={{ position: 'relative' }}>
        <canvas ref={canvasRef} onMouseMove={onMove} onMouseLeave={() => setHover(null)} />
        {hoverCandle && hoverDetail && (
          <div className="kline-tooltip">
            <div className="tt-title">{hoverCandle.label}{hoverCandle.startYear !== hoverCandle.endYear ? `（${hoverCandle.endYear < 0 ? '前' + (1 - hoverCandle.endYear) : hoverCandle.endYear}年 ${hoverDetail.gz}）` : `（${hoverDetail.gz}）`}</div>
            <div className="tt-row"><span>开/收</span><span>{hoverCandle.open.toFixed(2)} → {hoverCandle.close.toFixed(2)}</span></div>
            <div className="tt-row"><span>高/低</span><span>{hoverCandle.high.toFixed(2)} / {hoverCandle.low.toFixed(2)}</span></div>
            <div className="tt-row"><span>均/中位</span><span>{hoverCandle.mean.toFixed(2)} / {hoverCandle.median.toFixed(2)}</span></div>
            <div className="tt-hex">运{hoverDetail.yun}({hoverDetail.yunV}) 世{hoverDetail.shi}({hoverDetail.shiV}) 岁{hoverDetail.sui}({hoverDetail.suiV})</div>
            {hoverCandle.chimaYears.length > 0 && <div className="tt-jie">赤马红羊：{hoverCandle.chimaYears.map(fmtYear).join('、')}</div>}
          </div>
        )}
      </div>

      <p className="kline-note">
        <b>标量说明：</b>{metricMeta.desc} 数据由已对照《皇极经世书》黄畿注原文校验的算法实时推演（运卦0.5＋世卦0.3＋岁卦0.2）。
        会级（12.96万年）是单向大弧，但信史全程处午会内，故历史起伏来自运/世/年三层循环，非单调下滑。
      </p>
    </div>
  )
}
