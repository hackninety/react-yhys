import { useState, useMemo, useRef, useEffect, useSyncExternalStore } from 'react'
import {
  FORTUNE_METRICS,
  buildCandles,
  yunBands,
  yunStartYear,
  yearGanZhi,
  periodFactors,
  type FortuneMetric,
} from '../utils/fortune'
import { subscribeAlgorithm, getAlgorithmSnapshot } from '../algorithms/registry'
import { specialDates, type SpecialDate } from '../data/specialDates'
import './GuoyunKline.css'

type Gran = 'nian' | 'shi' | 'yun'
type View = FortuneMetric | 'combo'
const GRAN_UNIT: Record<Gran, number> = { nian: 1, shi: 30, yun: 360 }
const GRAN_LABEL: Record<Gran, string> = { nian: '年', shi: '世·30年', yun: '运·360年' }

const UP = '#dc2626'   // 红涨（阳长·治）
const DOWN = '#16a34a' // 绿跌（阴消·衰）
const GOLD = '#D4AF37'
const JIE = '#e8a13a'  // 赤马红羊
const EVT = '#a78bfa'  // 大事标记
// 三线对比配色（各标量一色）
const LINE_COLOR: Record<FortuneMetric, string> = { yang: '#D4AF37', bigua: '#4ea1ff', auspice: '#e0607a' }

const PAD_L = 36, PAD_R = 14, PAD_T = 24, PAD_B = 34, CHART_H = 210
const fmtY = (y: number) => (y < 0 ? `前${1 - y}` : `${y}`)

// 公历年 → 大事件（special-dates.json，按 sui−67017 映射；无 sui 则用 year）
const SUI_OFFSET = 67017
interface EvtHit { gy: number; e: SpecialDate }
const EVENTS_BY_YEAR: Map<number, SpecialDate[]> = (() => {
  const m = new Map<number, SpecialDate[]>()
  for (const e of specialDates) {
    const gy = e.year ?? (e.sui != null ? e.sui - SUI_OFFSET : null)
    if (gy == null) continue
    const list = m.get(gy)
    if (list) list.push(e); else m.set(gy, [e])
  }
  return m
})()

export function GuoyunKline() {
  const algoName = useSyncExternalStore(subscribeAlgorithm, getAlgorithmSnapshot)

  const [view, setView] = useState<View>('yang')
  const isCombo = view === 'combo'
  const metric: FortuneMetric = isCombo ? 'yang' : view
  const [gran, setGran] = useState<Gran>('shi')
  const [start, setStart] = useState(() => yunStartYear(new Date().getFullYear()))
  const [end, setEnd] = useState(() => yunStartYear(new Date().getFullYear()) + 359)
  const [showMA, setShowMA] = useState(true)
  const [showJie, setShowJie] = useState(true)
  const [showEvt, setShowEvt] = useState(true)
  const [hover, setHover] = useState<number | null>(null)

  const wrapRef = useRef<HTMLDivElement>(null)
  const [availW, setAvailW] = useState(860)

  const metricMeta = FORTUNE_METRICS.find(m => m.key === metric)!
  const unit = GRAN_UNIT[gran]
  const curYear = useMemo(() => new Date().getFullYear(), [])

  const range = useMemo(() => {
    const a = Math.min(start, end)
    let b = Math.max(start, end)
    const maxN = 4600
    if ((b - a) / unit > maxN) b = a + maxN * unit
    return { a, b }
  }, [start, end, unit])

  const candles = useMemo(() => {
    void algoName
    return buildCandles(range.a, range.b, unit, metric)
  }, [range, unit, metric, algoName])

  // 三线对比：三标量各一条归一序列（0–100），共用同一结构
  const comboSeries = useMemo(() => {
    void algoName
    if (!isCombo) return null
    return FORTUNE_METRICS.map(m => ({ meta: m, candles: buildCandles(range.a, range.b, unit, m.key) }))
  }, [isCombo, range, unit, algoName])

  // 每根蜡烛落在其时段内的大事件
  const candleEvents = useMemo<EvtHit[][]>(() => candles.map(c => {
    const hits: EvtHit[] = []
    for (let y = c.startYear; y <= c.endYear; y++) {
      const list = EVENTS_BY_YEAR.get(y)
      if (list) for (const e of list) hits.push({ gy: y, e })
    }
    return hits
  }), [candles])

  const bands = useMemo(() => {
    if (candles.length === 0) return []
    return yunBands(candles[0].startYear, candles[candles.length - 1].endYear)
  }, [candles])

  useEffect(() => {
    if (!wrapRef.current) return
    const ro = new ResizeObserver(es => { for (const e of es) setAvailW(Math.max(300, e.contentRect.width)) })
    ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [])

  const n = candles.length
  const isLine = unit === 1
  const minSlot = isLine ? 2 : 11
  const maxSlot = isLine ? 12 : 46
  const slotW = Math.max(minSlot, Math.min(maxSlot, (availW - PAD_L - PAD_R) / Math.max(n, 1)))
  const svgW = Math.max(availW, PAD_L + PAD_R + n * slotW)
  const svgH = PAD_T + CHART_H + PAD_B
  const xOf = (i: number) => PAD_L + i * slotW + slotW / 2
  const yOf = (v: number) => PAD_T + ((100 - v) / 100) * CHART_H

  // 蜡烛索引 → 段落起止
  const bandSlots = useMemo(() => bands.map(b => {
    const s = candles.findIndex(c => c.endYear >= b.startYear)
    let e = candles.findIndex(c => c.startYear > b.endYear)
    if (e < 0) e = candles.length
    return { start: s < 0 ? 0 : s, end: e - 1, name: b.yunName }
  }), [bands, candles])

  // 5 段均线
  const maPts = useMemo(() => candles.map((_, i) => {
    const seg = candles.slice(Math.max(0, i - 4), i + 1)
    const avg = seg.reduce((a, c) => a + c.close, 0) / seg.length
    return `${xOf(i)},${yOf(avg).toFixed(1)}`
  }).join(' '), [candles, slotW, availW])

  const linePts = useMemo(() => candles.map((c, i) => `${xOf(i)},${yOf(c.close).toFixed(1)}`).join(' '), [candles, slotW, availW])

  const curIdx = candles.findIndex(c => curYear >= c.startYear && curYear <= c.endYear)
  const activeIdx = hover ?? (curIdx >= 0 ? curIdx : n - 1)
  const active = candles[activeIdx]

  const applyPreset = (p: 'yun' | 'recent' | 'all') => {
    const cy = curYear
    if (p === 'yun') { setGran('shi'); const s = yunStartYear(cy); setStart(s); setEnd(s + 359) }
    else if (p === 'recent') { setGran('nian'); setStart(cy - 59); setEnd(cy) }
    else { setGran('yun'); setStart(-2357); setEnd(2100) }
  }

  const labelEvery = Math.max(1, Math.ceil(n / 16))

  return (
    <div className="gy">
      <div className="gy-card">
        <header className="gy-head">
          <div className="gy-head-row">
            <h1 className="gy-title"><span className="gy-title-mark">☯</span> 国运 K 线</h1>
            <div className="gy-seg">
              {FORTUNE_METRICS.map(m => (
                <button key={m.key} className={view === m.key ? 'on' : ''} onClick={() => setView(m.key)} title={m.desc}>{m.label}</button>
              ))}
              <button className={isCombo ? 'on' : ''} onClick={() => setView('combo')} title="三标量归一后同图叠加对比">三线对比</button>
            </div>
          </div>
          {isCombo ? (
            <p className="gy-legend">
              {FORTUNE_METRICS.map(m => (
                <span key={m.key} style={{ color: LINE_COLOR[m.key] }}>— {m.label}</span>
              ))}
              <span style={{ color: JIE }}>▲ 赤马红羊</span>
              <span className="gy-dim">三标量归一 0–100 同图 · 算法：{algoName}</span>
            </p>
          ) : (
            <p className="gy-legend">
              <span style={{ color: UP }}>红涨（阳长·治）</span>
              <span style={{ color: DOWN }}>绿跌（阴消·衰）</span>
              <span style={{ color: GOLD }}>— 金线5段均</span>
              <span style={{ color: JIE }}>▲ 赤马红羊</span>
              <span style={{ color: EVT }}>● 大事</span>
              <span className="gy-dim">悬停查看该段大事 · 算法：{algoName}</span>
            </p>
          )}
        </header>

        <div className="gy-ctrls">
          <div className="gy-grp">
            <span className="gy-grp-label">粒度</span>
            <div className="gy-seg sm">
              {(['nian', 'shi', 'yun'] as Gran[]).map(g => (
                <button key={g} className={gran === g ? 'on' : ''} onClick={() => setGran(g)}>{GRAN_LABEL[g]}</button>
              ))}
            </div>
          </div>
          <div className="gy-grp">
            <span className="gy-grp-label">预设</span>
            <button className="gy-chip" onClick={() => applyPreset('yun')}>本运12世</button>
            <button className="gy-chip" onClick={() => applyPreset('recent')}>近60年</button>
            <button className="gy-chip" onClick={() => applyPreset('all')}>全史</button>
          </div>
          <div className="gy-grp">
            <span className="gy-grp-label">起讫</span>
            <input type="number" value={start} onChange={e => setStart(parseInt(e.target.value) || 0)} />
            <span className="gy-dash">–</span>
            <input type="number" value={end} onChange={e => setEnd(parseInt(e.target.value) || 0)} />
          </div>
          <div className="gy-grp">
            <label className="gy-check"><input type="checkbox" checked={showMA} onChange={e => setShowMA(e.target.checked)} />均线</label>
            <label className="gy-check"><input type="checkbox" checked={showJie} onChange={e => setShowJie(e.target.checked)} />赤马红羊</label>
            <label className="gy-check"><input type="checkbox" checked={showEvt} onChange={e => setShowEvt(e.target.checked)} />大事</label>
          </div>
        </div>

        <div className="gy-chart-scroll" ref={wrapRef}>
          <svg width={svgW} height={svgH} className="gy-svg" onMouseLeave={() => setHover(null)}>
            {/* 运卦分段背景 + 标注 */}
            {bandSlots.map((b, bi) => {
              const x = PAD_L + b.start * slotW
              const w = (b.end - b.start + 1) * slotW
              return (
                <g key={bi}>
                  {bi % 2 === 1 && <rect x={x} y={PAD_T} width={w} height={CHART_H} fill="currentColor" opacity={0.04} />}
                  {w > 26 && <text x={x + 3} y={PAD_T - 9} fontSize={10} fill={GOLD} opacity={0.75}>{b.name}</text>}
                </g>
              )
            })}

            {/* 网格 */}
            {[20, 50, 80].map(v => (
              <g key={v}>
                <line x1={PAD_L} y1={yOf(v)} x2={svgW - PAD_R} y2={yOf(v)} stroke="currentColor" strokeOpacity={v === 50 ? 0.16 : 0.07} strokeDasharray={v === 50 ? '3 3' : '2 5'} />
                <text x={PAD_L - 5} y={yOf(v) + 3} fontSize={9} textAnchor="end" fill="currentColor" opacity={0.42}>{v}</text>
              </g>
            ))}

            {/* 三线对比：三标量各一色折线 */}
            {isCombo && comboSeries && comboSeries.map(s => (
              <polyline key={s.meta.key}
                points={s.candles.map((c, i) => `${xOf(i)},${yOf(c.close).toFixed(1)}`).join(' ')}
                fill="none" stroke={LINE_COLOR[s.meta.key]} strokeWidth={1.6} strokeOpacity={0.92} />
            ))}
            {isCombo && showJie && candles.map((c, i) => c.chimaYears.length > 0 && (
              <path key={`cj${i}`} d={`M${xOf(i)},${PAD_T + 2} l-3.4,-6 h6.8 z`} fill={JIE} />
            ))}

            {/* K 线 / 折线（单标量） */}
            {isCombo ? null : isLine ? (
              <polyline points={linePts} fill="none" stroke={GOLD} strokeWidth={1.4} strokeOpacity={0.9} />
            ) : (
              candles.map((c, i) => {
                const up = c.close >= c.open
                const col = up ? UP : DOWN
                const cx = xOf(i)
                const bw = Math.max(3, slotW * 0.58)
                const top = yOf(Math.max(c.open, c.close))
                const bh = Math.max(1.4, Math.abs(yOf(c.open) - yOf(c.close)))
                const dim = hover !== null && hover !== i
                return (
                  <g key={i} opacity={dim ? 0.45 : 1}>
                    <line x1={cx} y1={yOf(c.high)} x2={cx} y2={yOf(c.low)} stroke={col} strokeWidth={1} />
                    {up
                      ? <rect x={cx - bw / 2} y={top} width={bw} height={bh} fill={col} />
                      : <rect x={cx - bw / 2} y={top} width={bw} height={bh} fill="none" stroke={col} strokeWidth={1.2} />}
                    {showJie && c.chimaYears.length > 0 && (
                      <path d={`M${cx},${yOf(c.high) - 5} l-3.4,-6 h6.8 z`} fill={JIE} />
                    )}
                  </g>
                )
              })
            )}
            {!isCombo && isLine && showJie && candles.map((c, i) => c.chimaYears.length > 0 && (
              <circle key={`j${i}`} cx={xOf(i)} cy={yOf(c.close)} r={2.6} fill={JIE} />
            ))}

            {/* 均线（单标量非折线） */}
            {!isCombo && showMA && !isLine && <polyline points={maPts} fill="none" stroke={GOLD} strokeWidth={1.4} strokeOpacity={0.85} />}

            {/* 选中 / 今 竖线 */}
            {active && (
              <line x1={xOf(activeIdx)} y1={PAD_T - 3} x2={xOf(activeIdx)} y2={PAD_T + CHART_H} stroke={GOLD} strokeWidth={1} strokeDasharray="4 3" strokeOpacity={0.7} />
            )}
            {curIdx >= 0 && <text x={xOf(curIdx)} y={PAD_T + 10} fontSize={10} textAnchor="middle" fill={GOLD} fontWeight="bold">今</text>}

            {/* 大事件标记（时段内含大事的蜡烛下方点标；悬停详情面板列出） */}
            {showEvt && candleEvents.map((evs, i) => evs.length > 0 && (
              <circle key={`e${i}`} cx={xOf(i)} cy={PAD_T + CHART_H + 6}
                r={activeIdx === i ? 3.6 : 2.5} fill={EVT}
                opacity={hover !== null && hover !== i ? 0.45 : 0.95}>
                <title>{evs.slice(0, 6).map(h => `${fmtY(h.gy)} ${h.e.name}`).join('\n')}{evs.length > 6 ? `\n…等${evs.length}项` : ''}</title>
              </circle>
            ))}

            {/* x 轴年标 */}
            {candles.map((c, i) => (i % labelEvery === 0 || n <= 16) && (
              <text key={`x${i}`} x={xOf(i)} y={svgH - 9} fontSize={9} textAnchor="middle" fill="currentColor" opacity={0.5}>{fmtY(c.startYear)}</text>
            ))}

            {/* 悬停感应（含大事标记行） */}
            {candles.map((_c, i) => (
              <rect key={`h${i}`} x={PAD_L + i * slotW} y={PAD_T} width={slotW} height={CHART_H + 14} fill="transparent" onMouseEnter={() => setHover(i)} />
            ))}
          </svg>
        </div>

        {/* 固定详情面板（图下方，不遮挡 K 线） */}
        {active && (
          <div className="gy-detail">
            <div className="gy-detail-head">
              <span className="gy-detail-title">
                {active.label}
                <span className="gy-detail-gz">
                  {active.startYear === active.endYear ? `（${yearGanZhi(active.endYear)}）` : `（末年${fmtY(active.endYear)} ${yearGanZhi(active.endYear)}）`}
                  {hover === null && curIdx === activeIdx ? ' · 今' : ''}
                </span>
              </span>
              {!isCombo && (
                <span className="gy-detail-score" style={{ color: active.delta >= 0 ? UP : DOWN }}>
                  {active.close}<span className="gy-detail-delta">{active.delta >= 0 ? ' ▲' : ' ▼'}{Math.abs(active.delta)}</span>
                </span>
              )}
            </div>
            {isCombo && comboSeries ? (
              <div className="gy-detail-combo">
                {comboSeries.map(s => {
                  const c = s.candles[activeIdx]
                  if (!c) return null
                  return (
                    <span key={s.meta.key} className="gy-combo-item" style={{ borderColor: LINE_COLOR[s.meta.key] }}>
                      <i style={{ background: LINE_COLOR[s.meta.key] }} />{s.meta.label}
                      <b style={{ color: LINE_COLOR[s.meta.key] }}>{c.close}</b>
                      <em style={{ color: c.delta >= 0 ? UP : DOWN }}>{c.delta >= 0 ? '▲' : '▼'}{Math.abs(c.delta)}</em>
                    </span>
                  )
                })}
              </div>
            ) : (
              <div className="gy-detail-ohlc">
                <span>开<b>{active.open}</b></span><span>收<b>{active.close}</b></span>
                <span>高<b>{active.high}</b></span><span>低<b>{active.low}</b></span>
                <span>均<b>{active.mean}</b></span><span>中<b>{active.median}</b></span>
              </div>
            )}
            <div className="gy-detail-factors">
              {(isCombo ? periodFactors(active.endYear, metric, false) : active.factors).map((f, i) => (
                <span key={i} className={f.includes('赤马红羊') ? 'gy-f-jie' : ''}>· {f}</span>
              ))}
            </div>
            {candleEvents[activeIdx] && candleEvents[activeIdx].length > 0 && (
              <div className="gy-detail-events">
                <span className="gy-evt-label">大事 {candleEvents[activeIdx].length}</span>
                {candleEvents[activeIdx].slice(0, 12).map((h, i) => (
                  <span key={i} className="gy-evt" title={h.e.description || h.e.name}>
                    <em>{fmtY(h.gy)}</em>{h.e.name}
                    {h.e.badge && <b style={{ color: h.e.color }}>{h.e.badge}</b>}
                  </span>
                ))}
                {candleEvents[activeIdx].length > 12 && <span className="gy-evt-more">…等{candleEvents[activeIdx].length}项</span>}
              </div>
            )}
          </div>
        )}

        <p className="gy-note">
          {isCombo
            ? <><b>三线对比：</b>阳爻数/辟卦位置/卦德吉凶三标量各自归一 0–100 后同图叠加，可直观看出何时三者共识（同涨同跌）、何时分歧（如姤：阳爻数偏高而辟卦位置偏低）。</>
            : <><b>{metricMeta.label}：</b>{metricMeta.desc}</>}
          {' '}数据由已对照《皇极经世书》黄畿注原文校验的算法实时推演（运卦0.5＋世卦0.3＋岁卦0.2，归一0–100分）。会级是单向大弧，但信史全程处午会内，故起伏来自运/世/年三层循环，非单调下滑；仅供参考。
        </p>
      </div>
    </div>
  )
}
