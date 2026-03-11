import { useState, type ReactElement } from 'react'
import { getHexagram64, type Hexagram64 } from '../data/hexagrams64'
import { XIANTIAN_CIRCLE_ORDER } from '../data/xiantianOrder'
import './XiantianCircle.css'

interface XiantianCircleProps {
  highlightBinary?: number | null
  onHexagramClick?: (hex: Hexagram64) => void
}

export function XiantianCircle({ highlightBinary, onHexagramClick }: XiantianCircleProps) {
  const [hoverHexBinary, setHoverHexBinary] = useState<number | null>(null)

  // 圆图尺寸设定
  const SVG_SIZE = 800
  const CENTER_X = SVG_SIZE / 2
  const CENTER_Y = SVG_SIZE / 2
  
  // 卦象线条半径设定
  const RADIUS_INNER = 220    // 初爻起点半径
  const YAO_GAP = 16          // 爻间距 (径向厚度)
  const YAO_LEN = 11          // 短线径向长度
  
  // 极坐标转换 Cartesian 坐标辅助函数
  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const angleRad = (angleDeg - 90) * Math.PI / 180.0
    return {
      x: cx + (r * Math.cos(angleRad)),
      y: cy + (r * Math.sin(angleRad))
    }
  }

  // 每一爻作为 SVG 路径生成的函数
  // 顺时针排列 64 卦，每卦分配 360 / 64 = 5.625 度
  const renderHexagramLines = (binary: number, index: number, isHovered: boolean, isHighlighted: boolean) => {
    // 根据在 XIANTIAN_CIRCLE_ORDER 中的索引推断角度
    // 乾(index=0)在 0 度（正上，配合 polarToCartesian 减了 90 度，那就是午位）
    const angleCenter = index * (360 / 64)
    const angleStart = angleCenter - 1.8 // 留点扇区余量
    const angleEnd = angleCenter + 1.8
    
    // 解析 6 爻阴阳
    const yaos = []
    for (let i = 0; i < 6; i++) {
        // bit i => 从里到外（初爻到上爻）
        yaos.push((binary >> i) & 1)
    }

    const lines: ReactElement[] = []
    
    // 从内（初爻）向外绘制
    yaos.forEach((isYang, yaoIndex) => {
      const r_start = RADIUS_INNER + (yaoIndex * YAO_GAP)
      const r_end = r_start + YAO_LEN
      
      const p1 = polarToCartesian(CENTER_X, CENTER_Y, r_start, angleStart)
      const p2 = polarToCartesian(CENTER_X, CENTER_Y, r_end, angleStart)
      const p3 = polarToCartesian(CENTER_X, CENTER_Y, r_end, angleEnd)
      const p4 = polarToCartesian(CENTER_X, CENTER_Y, r_start, angleEnd)

      // 阴爻中心断开点
      const angleMidGapStart = angleCenter - 0.3
      const angleMidGapEnd = angleCenter + 0.3
      
      const strokeClass = isHighlighted 
         ? 'yao-highlight' 
         : isHovered ? 'yao-hover' : 'yao-normal'
         
      if (isYang === 1) {
        // 阳爻：完整扇形多边形（实心方块）
        lines.push(
           <path 
             key={`yao-${yaoIndex}`}
             d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} A ${r_end} ${r_end} 0 0 1 ${p3.x} ${p3.y} L ${p4.x} ${p4.y} A ${r_start} ${r_start} 0 0 0 ${p1.x} ${p1.y} Z`}
             className={strokeClass}
           />
        )
      } else {
        // 阴爻：分两段画（两边实心，中间空隙）
        const pm1_inner = polarToCartesian(CENTER_X, CENTER_Y, r_start, angleMidGapStart)
        const pm1_outer = polarToCartesian(CENTER_X, CENTER_Y, r_end, angleMidGapStart)
        const pm2_inner = polarToCartesian(CENTER_X, CENTER_Y, r_start, angleMidGapEnd)
        const pm2_outer = polarToCartesian(CENTER_X, CENTER_Y, r_end, angleMidGapEnd)

        // 左半边
        lines.push(
           <path 
             key={`yao-${yaoIndex}-L`}
             d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} A ${r_end} ${r_end} 0 0 1 ${pm1_outer.x} ${pm1_outer.y} L ${pm1_inner.x} ${pm1_inner.y} A ${r_start} ${r_start} 0 0 0 ${p1.x} ${p1.y} Z`}
             className={strokeClass}
           />
        )
        // 右半边
        lines.push(
           <path 
             key={`yao-${yaoIndex}-R`}
             d={`M ${pm2_inner.x} ${pm2_inner.y} L ${pm2_outer.x} ${pm2_outer.y} A ${r_end} ${r_end} 0 0 1 ${p3.x} ${p3.y} L ${p4.x} ${p4.y} A ${r_start} ${r_start} 0 0 0 ${pm2_inner.x} ${pm2_inner.y} Z`}
             className={strokeClass}
           />
        )
      }
    })
    
    // 增加一个透明的扇区接收 hover / click
    const hitboxR1 = RADIUS_INNER - 10
    const hitboxR2 = RADIUS_INNER + 6 * YAO_GAP + 10
    const h1 = polarToCartesian(CENTER_X, CENTER_Y, hitboxR1, angleStart - 1)
    const h2 = polarToCartesian(CENTER_X, CENTER_Y, hitboxR2, angleStart - 1)
    const h3 = polarToCartesian(CENTER_X, CENTER_Y, hitboxR2, angleEnd + 1)
    const h4 = polarToCartesian(CENTER_X, CENTER_Y, hitboxR1, angleEnd + 1)
    
    return (
       <g 
         key={`hex-${binary}`}
         onMouseEnter={() => setHoverHexBinary(binary)}
         onMouseLeave={() => setHoverHexBinary(null)}
         onClick={() => onHexagramClick?.(getHexagram64(binary))}
         className="hexagram-sector"
       >
         {lines}
         <path 
            className="hexagram-hitbox"
            d={`M ${h1.x} ${h1.y} L ${h2.x} ${h2.y} A ${hitboxR2} ${hitboxR2} 0 0 1 ${h3.x} ${h3.y} L ${h4.x} ${h4.y} A ${hitboxR1} ${hitboxR1} 0 0 0 ${h1.x} ${h1.y} Z`}
         />
       </g>
    )
  }

  // 渲染悬停卦名提示或当前高亮的卦名提示
  const renderTip = () => {
     const focusBinary = hoverHexBinary !== null ? hoverHexBinary : highlightBinary
     if (focusBinary === null || focusBinary === undefined) return null
     
     const hex = getHexagram64(focusBinary)
     const idx = XIANTIAN_CIRCLE_ORDER.indexOf(focusBinary)
     if (idx < 0) return null
     
     const angle = idx * (360 / 64)
     // 文字放在最外圈
     const R_TEXT = RADIUS_INNER + 6 * YAO_GAP + 35
     const pos = polarToCartesian(CENTER_X, CENTER_Y, R_TEXT, angle)
     
     // 防止文字颠倒，动态调整角度
     let rotation = angle
     if (rotation > 90 && rotation < 270) {
        rotation += 180
     }
     
     return (
        <text 
          x={pos.x} y={pos.y} 
          className={hoverHexBinary === focusBinary ? "hex-tip-hover" : "hex-tip-highlight"}
          transform={`rotate(${rotation}, ${pos.x}, ${pos.y})`}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {hex.name}
        </text>
     )
  }

  return (
    <div className="xiantian-circle-container">
      <svg 
         viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} 
         className="xiantian-svg"
         xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* 背景辅助环 */}
         <circle cx={CENTER_X} cy={CENTER_Y} r={RADIUS_INNER - 8} className="guide-circle" />
         <circle cx={CENTER_X} cy={CENTER_Y} r={RADIUS_INNER + 6 * YAO_GAP + 8} className="guide-circle" />

        {/* 绘制 64 卦圆阵 */}
        {XIANTIAN_CIRCLE_ORDER.map((binary, index) => {
           const isHovered = hoverHexBinary === binary
           const isHighlighted = highlightBinary === binary
           return renderHexagramLines(binary, index, isHovered, isHighlighted)
        })}
        
        {/* 渲染提示文字 */}
        {renderTip()}
        
        {/* 圆心太极和标题 */}
        <text x={CENTER_X} y={CENTER_Y - 20} className="center-title">先天六十四卦</text>
        <text x={CENTER_X} y={CENTER_Y} className="center-subtitle">圆 图</text>
        <text x={CENTER_X} y={CENTER_Y + 25} className="center-desc">乾南坤北 · 天道往复</text>
      </svg>
    </div>
  )
}
