/**
 * 日期详情弹出卡片组件
 * 显示 lunisolar 的所有功能：农历、八字四柱、五行、纳音等
 * 同时对比自己算法版和插件版的八字
 */

import { useMemo, useState, useEffect } from 'react'
import { getDateDetail, type BaziPillar } from '../utils/lunar'
import { getYearGanZhi, getMonthGanZhi, getHourGanZhi, getGanZhi, getHuangjiMonthGanZhi } from '../utils/ganzhi'
import { getYearLv, getMonthLv, getDayLv, getHourLvByDate } from '../utils/lvlv'
import { getSolarTerm } from '../utils/solarTerms'
import { getYearJiazi, YEARS_PER_SHI, SHIS_PER_YUN, YUNS_PER_HUI } from '../utils/calendar'
import { playLvlvTone, playFourPillarsLv, stopLvlvAudio } from '../utils/lvlvAudio'
import { getTianSheng, getDiYin, type TianSheng, type DiYin } from '../utils/changhe'
import {
  getHuiHexagram,
  getYunHexagramDetailByGlobal,
  getShiHexagramByYear,
  getSuiHexagram,
  getYueHexagramByHuangji,
  getRiHexagramByDate,
  getHexagram64,
} from '../data/hexagrams64'
import type { LvLv } from '../utils/lvlv'
import './DateDetailModal.css'

// 十二律吕详细说明（含黄畿原文引用）
const LVLV_DESCRIPTIONS: Record<string, { description: string; origin: string; relation: string }> = {
  '黄钟': {
    description: '十二律之首，阳律。为律本，万事万物之始。',
    origin: '黄畿《皇极经世书传》："黄钟，律之始也。声音律吕与象数卦爻互为表里。"',
    relation: '对应地支「子」、冬至、十一月，为一阳初动之时。天干甲己合化，五正声之首。',
  },
  '大吕': {
    description: '十二律第二，阴吕。助阳气萌生，阴中含阳。',
    origin: '黄畿注："大吕者，旅也。言阴大，旅助黄钟宣气而牙物也。"',
    relation: '对应地支「丑」、小寒/大寒、十二月。阴吕之属。',
  },
  '太簇': {
    description: '十二律第三，阳律。万物簇生，阳气盛发。',
    origin: '黄畿注："太簇者，言阳气大簇，达于上也。"',
    relation: '对应地支「寅」、立春/雨水、正月。天干乙庚合化，五正声之二。',
  },
  '夹钟': {
    description: '十二律第四，阴吕。阴夹阳而生，和煦初显。',
    origin: '黄畿注："夹钟者，言阴夹助太簇，宣四方之气而出种物也。"',
    relation: '对应地支「卯」、惊蛰/春分、二月。阴吕之属。',
  },
  '姑洗': {
    description: '十二律第五，阳律。万物洁净，阳气清明。',
    origin: '黄畿注："姑洗者，言万物洗生。"',
    relation: '对应地支「辰」、清明/谷雨、三月。天干丙辛合化，五正声之三。',
  },
  '仲吕': {
    description: '十二律第六，阴吕。阴居中位，助长万物。',
    origin: '黄畿注："仲吕者，言阴气居中，助姑洗宣气，以养物也。"',
    relation: '对应地支「巳」、立夏/小满、四月。阴吕之属。',
  },
  '蕤宾': {
    description: '十二律第七，阳律。阳气极盛，继而宾服于阴。',
    origin: '黄畿注："蕤宾者，言阳始导阴气，使继养物也。"',
    relation: '对应地支「午」、芒种/夏至、五月。天干丁壬合化，五正声之四。',
  },
  '林钟': {
    description: '十二律第八，阴吕。万物茂盛如林，阴气渐长。',
    origin: '黄畿注："林钟者，言万物就死，气林林然。"',
    relation: '对应地支「未」、小暑/大暑、六月。阴吕之属。',
  },
  '夷则': {
    description: '十二律第九，阳律。万物当割，法则明定。',
    origin: '黄畿注："夷则者，言阳气之正法度，而使阴气夷当伤之物也。"',
    relation: '对应地支「申」、立秋/处暑、七月。天干戊癸合化，五正声之五。',
  },
  '南吕': {
    description: '十二律第十，阴吕。阳气向南，阴任其职。',
    origin: '黄畿注："南吕者，言阴气之旅助夷则，任成万物也。"',
    relation: '对应地支「酉」、白露/秋分、八月。阴吕之属。',
  },
  '无射': {
    description: '十二律第十一，阳律。阳气收藏，万物成实。',
    origin: '黄畿注："无射者，阳气上升，阴气收藏，终而复始，无厌已也。" 注：无射不参天干者，五声之正也。',
    relation: '对应地支「戌」、寒露/霜降、九月。六律之末，不入天干五正声对应。',
  },
  '应钟': {
    description: '十二律第十二，阴吕。阴气应阳而终，闭藏万物。',
    origin: '黄畿注："应钟者，言阴气应无射，该藏万物而杂阳阁种也。"',
    relation: '对应地支「亥」、立冬/小雪、十月。阴吕之属。',
  },
}

interface DateDetailModalProps {
  date: Date
  huangjiYear: number  // 皇极年（69043等）
  onClose: () => void
}

// 五行颜色
const WUXING_COLORS: Record<string, string> = {
  '木': '#22c55e',  // 绿色
  '火': '#ef4444',  // 红色
  '土': '#eab308',  // 黄色
  '金': '#f8fafc',  // 白色（用浅灰表示）
  '水': '#3b82f6',  // 蓝色
}

// 律吕柱标签对应
const LV_PILLAR_LABELS: Record<string, string> = {
  '年': '年律 · 天干合化五正声',
  '月': '月律 · 地支配十二律吕',
  '日': '日律 · 天干合化五正声',
  '时': '时律 · 地支配十二律吕',
}

// 渲染单个八字柱
function BaziPillarDisplay({ pillar, label }: { pillar: BaziPillar; label: string }) {
  const ganColor = WUXING_COLORS[pillar.wuXing.charAt(0)] || '#888'
  const zhiColor = WUXING_COLORS[pillar.wuXing.charAt(1)] || '#888'
  
  return (
    <div className="bazi-pillar-card">
      <div className="pillar-label">{label}</div>
      <div className="pillar-ganzhi">
        <span className="gan" style={{ color: ganColor }}>{pillar.gan}</span>
        <span className="zhi" style={{ color: zhiColor }}>{pillar.zhi}</span>
      </div>
      <div className="pillar-wuxing">
        <span style={{ color: ganColor }}>{pillar.wuXing.charAt(0)}</span>
        <span style={{ color: zhiColor }}>{pillar.wuXing.charAt(1)}</span>
      </div>
      <div className="pillar-nayin">{pillar.naYin}</div>
    </div>
  )
}

export function DateDetailModal({ date, huangjiYear, onClose }: DateDetailModalProps) {
  // 律吕详情弹窗状态
  const [selectedLvlv, setSelectedLvlv] = useState<LvLv | null>(null)
  const [selectedLvlvPillar, setSelectedLvlvPillar] = useState<string | null>(null)
  
  // 声音唱和弹窗状态
  const [selectedChanghe, setSelectedChanghe] = useState<{type: 'tian'|'di', data: TianSheng|DiYin} | null>(null)

  // 播放状态
  const [playingPillar, setPlayingPillar] = useState<string | null>(null)
  const [isPlayingAll, setIsPlayingAll] = useState(false)
  
  // 停止播放并清理状态
  const stopAllAudio = () => {
    stopLvlvAudio()
    setPlayingPillar(null)
    setIsPlayingAll(false)
  }

  // 组件卸载时释放音频资源
  useEffect(() => {
    return () => stopAllAudio()
  }, [])

  // 获取 lunisolar 的完整日期详情
  const detail = useMemo(() => getDateDetail(date), [date])
  
  // 获取自己算法版的八字
  const customBazi = useMemo(() => {
    const yearGanZhi = getYearGanZhi(date)
    const monthGanZhi = getMonthGanZhi(date)
    const dayGanZhi = getGanZhi(date)
    const hourGanZhi = getHourGanZhi(date)
    return { yearGanZhi, monthGanZhi, dayGanZhi, hourGanZhi }
  }, [date])
  
  // 获取皇极经世的干支
  const huangjiBazi = useMemo(() => {
    // 皇极年干支（使用 getYearJiazi 根据皇极年计算六十甲子）
    const yearGanZhi = getYearJiazi(huangjiYear)
    // 皇极月干支（使用日期来获取）
    const monthGanZhi = getHuangjiMonthGanZhi(date)
    // 日干支（与夏历相同）
    const dayGanZhi = getGanZhi(date)
    // 时干支（与夏历相同）
    const hourGanZhi = getHourGanZhi(date)
    
    return { yearGanZhi, monthGanZhi, dayGanZhi, hourGanZhi }
  }, [date, huangjiYear])
  
  
  // 获取律吕
  const lvlv = useMemo(() => {
    // 获取干支信息
    const yearGanZhi = getYearGanZhi(date)
    const dayGanZhi = getGanZhi(date)
    const huangjiMonthGanZhi = getHuangjiMonthGanZhi(date)
    
    // 地支列表
    const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
    
    // 获取月支索引
    const monthBranch = huangjiMonthGanZhi[1]
    const monthBranchIndex = BRANCHES.indexOf(monthBranch)
    
    const yearLv = getYearLv(yearGanZhi[0])  // 年律按年干
    const monthLv = getMonthLv(monthBranchIndex >= 0 ? monthBranchIndex : 0)  // 月律按月支
    const dayLv = getDayLv(dayGanZhi[0])  // 日律按日干
    const hourLv = getHourLvByDate(date)  // 时律按时支
    return { yearLv, monthLv, dayLv, hourLv }
  }, [date])

  // 获取声音唱和 (仅以当日的干支做示例概览映射)
  const changhe = useMemo(() => {
    const dayGanZhi = getGanZhi(date)
    const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
    const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
    const stemIndex = STEMS.indexOf(dayGanZhi[0])
    const branchIndex = BRANCHES.indexOf(dayGanZhi[1])
    
    return {
      tianSheng: getTianSheng(stemIndex >= 0 ? stemIndex : 0),
      diYin: getDiYin(branchIndex >= 0 ? branchIndex : 0)
    }
  }, [date])
  
  // 获取节气
  const solarTermInfo = useMemo(() => {
    return getSolarTerm(date)
  }, [date])

  // 计算卦象链：元 → 会 → 运 → 世 → 岁 → 月 → 日
  const hexagramChain = useMemo(() => {
    const gregorianYear = huangjiYear - 67017

    // 元卦：乾（一元统领，固定）— binary 63 = 0b111111
    const yuanHex = getHexagram64(63)

    // 会卦（辟卦）：根据皇极年所在的会
    const huiIndex = Math.floor((huangjiYear - 1) / (YUNS_PER_HUI * SHIS_PER_YUN * YEARS_PER_SHI)) % 12
    const huiHex = getHuiHexagram(huiIndex)

    // 运卦：根据全局运编号
    const globalShiNumber = Math.ceil(huangjiYear / YEARS_PER_SHI)
    const globalYunNumber = Math.ceil(globalShiNumber / SHIS_PER_YUN)
    const yunDetail = getYunHexagramDetailByGlobal(globalYunNumber)

    // 世卦
    const shiHex = getShiHexagramByYear(huangjiYear)

    // 岁卦
    const suiHex = getSuiHexagram(gregorianYear)

    // 月卦：使用节气信息获取皇极月
    const termInfo = getSolarTerm(date)
    const huangjiMonth = termInfo.huangji.month  // 0-11
    const yueHex = getYueHexagramByHuangji(huangjiYear, huangjiMonth + 1)

    // 日卦
    const riHex = getRiHexagramByDate(date)

    return [
      { level: '元（日）', name: '乾', hex: yuanHex, note: '一元统领' },
      { level: '会（月）', name: `第${huiIndex + 1}会`, hex: huiHex, note: '辟卦（消息卦）' },
      { level: '运（星）', name: `第${globalYunNumber}运`, hex: yunDetail.yunHexagram, note: `${yunDetail.masterHexagram.name}→${yunDetail.yaoName}爻变` },
      { level: '世（辰）', name: `第${globalShiNumber}世`, hex: shiHex, note: '运卦爻变' },
      { level: '岁（年）', name: `第${huangjiYear}年`, hex: suiHex, note: '世卦爻变' },
      { level: '月', name: `第${huangjiMonth + 1}月`, hex: yueHex, note: '先天60卦序' },
      { level: '日', name: '', hex: riHex, note: '先天60卦序' },
    ]
  }, [date, huangjiYear])
  
  
  return (
    <div className="date-detail-overlay" onClick={onClose}>
      <div className="date-detail-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>日期详情</h2>
          <div className="date-summary">
            <span className="gregorian">{detail.gregorian.dateStr} 星期{detail.gregorian.weekday}</span>
            {detail.lunar && <span className="lunar">{detail.lunar.dateStr}</span>}
          </div>
        </div>
        
        <div className="modal-content">
          {/* 八字四柱对比 */}
          <section className="section bazi-section">
            <h3>八字四柱</h3>
            
            <div className="bazi-comparison">
              {/* Lunisolar 版本 */}
              {detail.bazi ? (
                <div className="bazi-version">
                  <h4>📚 Lunisolar 插件版</h4>
                  <div className="bazi-pillars">
                    <BaziPillarDisplay pillar={detail.bazi.year} label="年柱" />
                    <BaziPillarDisplay pillar={detail.bazi.month} label="月柱" />
                    <BaziPillarDisplay pillar={detail.bazi.day} label="日柱" />
                    <BaziPillarDisplay pillar={detail.bazi.hour} label="时柱" />
                  </div>
                </div>
              ) : (
                <div className="bazi-version">
                  <h4>📚 Lunisolar 插件版</h4>
                  <p className="unsupported-notice">此日期超出 Lunisolar 支持范围（公元前722年～公元2200年）</p>
                </div>
              )}
              
              {/* 自己算法版本（夏历） */}
              <div className="bazi-version">
                <h4>🔧 自定义算法版（夏历）</h4>
                <div className="bazi-simple">
                  <span className={detail.bazi && customBazi.yearGanZhi === detail.bazi.year.ganZhi ? 'match' : ''}>
                    年：{customBazi.yearGanZhi}
                  </span>
                  <span className={detail.bazi && customBazi.monthGanZhi === detail.bazi.month.ganZhi ? 'match' : ''}>
                    月：{customBazi.monthGanZhi}
                  </span>
                  <span className={detail.bazi && customBazi.dayGanZhi === detail.bazi.day.ganZhi ? 'match' : ''}>
                    日：{customBazi.dayGanZhi}
                  </span>
                  <span className={detail.bazi && customBazi.hourGanZhi === detail.bazi.hour.ganZhi ? 'match' : ''}>
                    时：{customBazi.hourGanZhi}
                  </span>
                </div>
              </div>
              
              {/* 皇极经世版本 */}
              <div className="bazi-version huangji-version">
                <h4>📜 皇极经世版（冬至换年）</h4>
                <div className="bazi-simple">
                  <span>年：{huangjiBazi.yearGanZhi}</span>
                  <span>月：{huangjiBazi.monthGanZhi}</span>
                  <span>日：{huangjiBazi.dayGanZhi}</span>
                  <span>时：{huangjiBazi.hourGanZhi}</span>
                </div>
              </div>
            </div>
          </section>
          
          {/* 卦象链：元 → 会 → 运 → 世 → 岁 → 月 → 日 */}
          <section className="section hexagram-chain-section">
            <h3>卦象链</h3>
            <div className="hexagram-chain">
              {hexagramChain.map((item, i) => (
                <div className="hexagram-chain-node" key={i}>
                  <div className="chain-level">{item.level}</div>
                  <div className="chain-symbol">{item.hex.unicode}</div>
                  <div className="chain-name">{item.hex.name}</div>
                  <div className="chain-note">{item.note}</div>
                  {(item.level === '月' || item.level === '日') && (
                    <div className="chain-note chain-footnote">干支索引→60卦序·"皆取于复"</div>
                  )}
                  {i < hexagramChain.length - 1 && (
                    <div className="chain-arrow">↓</div>
                  )}
                </div>
              ))}
            </div>
          </section>
          
          
          {/* 律吕 */}
          <section className="section lvlv-section">
            <div className="lvlv-header-row">
              <h3>声音律吕<span className="section-subtitle">黄畿声音系统</span></h3>
              <button 
                className={`lvlv-play-all-btn ${isPlayingAll ? 'playing' : ''}`}
                onClick={async () => {
                  if (isPlayingAll) {
                    stopAllAudio()
                  } else {
                    setIsPlayingAll(true)
                    try {
                      await playFourPillarsLv([lvlv.yearLv.index, lvlv.monthLv.index, lvlv.dayLv.index, lvlv.hourLv.index])
                    } finally {
                      setIsPlayingAll(false)
                    }
                  }
                }}
                title="按年-月-日-时顺序演奏"
              >
                {isPlayingAll ? '⏹ 停止' : '▶ 演奏四柱'}
              </button>
            </div>
            
            <div className="lvlv-grid">
              {(['年', '月', '日', '时'] as const).map((pillar) => {
                const lv = pillar === '年' ? lvlv.yearLv : pillar === '月' ? lvlv.monthLv : pillar === '日' ? lvlv.dayLv : lvlv.hourLv
                const isSelected = selectedLvlv?.name === lv.name && selectedLvlvPillar === pillar
                const isPlaying = playingPillar === pillar
                return (
                  <div
                    key={pillar}
                    className={`lvlv-item lvlv-clickable ${lv.type === '律' ? 'lv-yang' : 'lv-yin'} ${isSelected ? 'lv-active' : ''} ${isPlaying ? 'is-playing' : ''}`}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedLvlv(null)
                        setSelectedLvlvPillar(null)
                      } else {
                        setSelectedLvlv(lv)
                        setSelectedLvlvPillar(pillar)
                      }
                    }}
                  >
                    <div className="lvlv-item-header">
                      <span className="lvlv-label">{pillar}律</span>
                      <button 
                        className="lvlv-play-single"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (isPlaying) {
                            stopAllAudio()
                          } else {
                            stopAllAudio() // 停掉其他
                            setPlayingPillar(pillar)
                            playLvlvTone(lv.index).finally(() => {
                              setPlayingPillar(current => current === pillar ? null : current)
                            })
                          }
                        }}
                        title={`聆听${lv.name}音高`}
                      >
                        {isPlaying ? '■' : '♪'}
                      </button>
                    </div>
                    <span className="lvlv-name">{lv.name}</span>
                    <span className="lvlv-pinyin">{lv.pinyin}</span>
                    <span className={`lvlv-type-badge ${lv.type === '律' ? 'yang' : 'yin'}`}>{lv.type}</span>
                  </div>
                )
              })}
            </div>
            {/* 律吕详情弹窗 */}
            {selectedLvlv && selectedLvlvPillar && LVLV_DESCRIPTIONS[selectedLvlv.name] && (
              <div className="lvlv-detail-popup">
                <div className="lvlv-detail-header">
                  <span className={`lvlv-detail-badge ${selectedLvlv.type === '律' ? 'yang' : 'yin'}`}>
                    {selectedLvlv.type === '律' ? '阳律' : '阴吕'}
                  </span>
                  <span className="lvlv-detail-title">{selectedLvlv.name}</span>
                  <span className="lvlv-detail-pinyin">{selectedLvlv.pinyin}</span>
                  <span className="lvlv-detail-pillar">{LV_PILLAR_LABELS[selectedLvlvPillar]}</span>
                  <button className="lvlv-detail-close" onClick={() => { setSelectedLvlv(null); setSelectedLvlvPillar(null) }}>✕</button>
                </div>
                <p className="lvlv-detail-desc">{LVLV_DESCRIPTIONS[selectedLvlv.name].description}</p>
                <blockquote className="lvlv-detail-origin">{LVLV_DESCRIPTIONS[selectedLvlv.name].origin}</blockquote>
                <p className="lvlv-detail-relation">{LVLV_DESCRIPTIONS[selectedLvlv.name].relation}</p>
              </div>
            )}
            <p className="lvlv-footer-note">黄畿《皇极经世书传》：&ldquo;声音律吕与象数卦爻互为表里&rdquo;</p>
          </section>

          {/* 声音唱和（邵雍原理） */}
          <section className="section changhe-section">
            <div className="lvlv-header-row">
              <h3>声音唱和<span className="section-subtitle">邵雍《皇极经世书》声音唱和图概览</span></h3>
            </div>
            
            <div className="changhe-grid">
              {/* 天声 */}
              <div 
                className={`changhe-item tian-sheng ${selectedChanghe?.type === 'tian' ? 'changhe-active' : ''}`}
                onClick={() => setSelectedChanghe(selectedChanghe?.type === 'tian' ? null : { type: 'tian', data: changhe.tianSheng })}
              >
                <div className="changhe-header">
                  <span className="changhe-label">今日天干对应</span>
                </div>
                <div className="changhe-main">
                  <span className="changhe-name">天声{changhe.tianSheng.name}</span>
                  <span className="changhe-props">{changhe.tianSheng.xiang}象 · {changhe.tianSheng.qingZhuo}{changhe.tianSheng.xiSheng}</span>
                </div>
                <div className="changhe-chars">
                  <span className="char-tag">平: {changhe.tianSheng.yuns.ping || '无'}</span>
                  <span className="char-tag">上: {changhe.tianSheng.yuns.shang || '无'}</span>
                  <span className="char-tag">去: {changhe.tianSheng.yuns.qu || '无'}</span>
                </div>
              </div>

              {/* 地音 */}
              <div 
                className={`changhe-item di-yin ${selectedChanghe?.type === 'di' ? 'changhe-active' : ''}`}
                onClick={() => setSelectedChanghe(selectedChanghe?.type === 'di' ? null : { type: 'di', data: changhe.diYin })}
              >
                <div className="changhe-header">
                  <span className="changhe-label">今日地支对应</span>
                </div>
                <div className="changhe-main">
                  <span className="changhe-name">地音{changhe.diYin.name}</span>
                  <span className="changhe-props">{changhe.diYin.xiang}象 · {changhe.diYin.qingZhuo}{changhe.diYin.huFa}</span>
                </div>
                <div className="changhe-chars">
                  <span className="char-example">组字例：{changhe.diYin.chars}</span>
                </div>
              </div>
            </div>

            {/* 唱和详情弹窗 */}
            {selectedChanghe && (
              <div className="lvlv-detail-popup changhe-detail">
                <div className="lvlv-detail-header">
                  <span className="lvlv-detail-badge yin">
                    {selectedChanghe.type === 'tian' ? '天之用声 (112)' : '地之用音 (152)'}
                  </span>
                  <span className="lvlv-detail-title">{selectedChanghe.data.name}</span>
                  <button className="lvlv-detail-close" onClick={() => setSelectedChanghe(null)}>✕</button>
                </div>
                <p className="lvlv-detail-desc">
                  {selectedChanghe.type === 'tian' 
                    ? `天声取天干之数（共十组）。今日天干对应第${(selectedChanghe.data as TianSheng).index + 1}组韵母（${(selectedChanghe.data as TianSheng).xiang}象${(selectedChanghe.data as TianSheng).qingZhuo}${(selectedChanghe.data as TianSheng).xiSheng}）。`
                    : `地音取地支之数（共十二组）。今日地支对应第${(selectedChanghe.data as DiYin).index + 1}组声母（${(selectedChanghe.data as DiYin).xiang}象${(selectedChanghe.data as DiYin).qingZhuo}${(selectedChanghe.data as DiYin).huFa}）。`
                  }
                </p>
                <blockquote className="lvlv-detail-origin">
                  黄畿《皇极经世书传》："声音律吕，圆唱方和，而后乾坤坎离用焉，天地万物之理贯于一矣。天声一百一十二，地音一百五十二。"
                </blockquote>
                <p className="lvlv-detail-relation">注：完整的10×12唱和千字发音矩阵图正在开发中。</p>
              </div>
            )}
          </section>
          
          {/* 节气信息 */}
          {solarTermInfo && solarTermInfo.termName && (
            <section className="section term-section">
              <h3>节气</h3>
              <div className="term-info">
                <span className="term-name">{solarTermInfo.termName}</span>
                <span className="term-day">（{solarTermInfo.dayInTerm === 0 ? '当日' : `第${solarTermInfo.dayInTerm + 1}天`}）</span>
              </div>
            </section>
          )}
          
          {/* 农历详情 */}
          {detail.lunar ? (
            <section className="section lunar-section">
              <h3>农历</h3>
              <div className="lunar-info">
                <div className="lunar-item">
                  <span className="label">农历年</span>
                  <span className="value">{detail.lunar.yearGanZhi}年（{detail.lunar.year}）</span>
                </div>
                <div className="lunar-item">
                  <span className="label">农历月</span>
                  <span className="value">{detail.lunar.monthName}{detail.lunar.isLeapMonth ? '（闰月）' : ''}</span>
                </div>
                <div className="lunar-item">
                  <span className="label">农历日</span>
                  <span className="value">{detail.lunar.dayName}</span>
                </div>
              </div>
            </section>
          ) : (
            <section className="section lunar-section">
              <h3>农历</h3>
              <p className="unsupported-notice">此日期超出 Lunisolar 支持范围（公元前722年～公元2200年）</p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

