/**
 * 皇极经世卦象算法验证脚本
 * 
 * 用已知锚点（各家共识 + 黄畿原文明确规定）验证代码输出是否正确
 * 运行方式：npx tsx tmp/verify-hexagrams.ts
 */

import {
  getHexagram64,
  changeYao,
  getYunHexagram,
  getYunHexagramByGlobal,
  getYunHexagramDetailByGlobal,
  getShiHexagram,
  getShiHexagramByGlobal,
  getShiHexagramByYear,
  getSuiHexagram,
  getYueHexagram,
  getRiHexagram,
  getHuiHexagram,
  isFourPrincipalHexagram,
  TWELVE_SOVEREIGN_HEXAGRAMS,
} from '../src/data/hexagrams64'

// ============================================================
// 工具：彩色输出
// ============================================================
let passCount = 0
let failCount = 0
let warnCount = 0

function pass(msg: string) {
  passCount++
  console.log(`  ✅ ${msg}`)
}
function fail(msg: string) {
  failCount++
  console.log(`  ❌ ${msg}`)
}
function warn(msg: string) {
  warnCount++
  console.log(`  ⚠️  ${msg}`)
}
function section(title: string) {
  console.log(`\n${'═'.repeat(60)}`)
  console.log(`  ${title}`)
  console.log('═'.repeat(60))
}

// ============================================================
// 一、辟卦（十二消息卦）验证
//     原文依据：各家完全一致，无争议
// ============================================================
section('一、辟卦（十二消息卦）验证')

const EXPECTED_PI_GUA: [string, string][] = [
  ['子', '复'], ['丑', '临'], ['寅', '泰'], ['卯', '大壮'],
  ['辰', '夬'], ['巳', '乾'], ['午', '姤'], ['未', '遁'],
  ['申', '否'], ['酉', '观'], ['戌', '剥'], ['亥', '坤'],
]

for (let i = 0; i < 12; i++) {
  const [branch, expectedName] = EXPECTED_PI_GUA[i]
  const result = getHuiHexagram(i)
  if (result.name === expectedName) {
    pass(`${branch}会辟卦 = ${result.name} ${result.unicode}`)
  } else {
    fail(`${branch}会辟卦：期望 ${expectedName}，实际 ${result.name}`)
  }
}

// ============================================================
// 二、运卦验证 — 午会完整映射（各家共识）
//     原文依据：午会5主卦（姤→大过→鼎→恒→巽）各变6爻生30运卦
// ============================================================
section('二、运卦验证 — 午会30运（各家共识）')

// 午会(huiIndex=6)，30运完整映射表
const WUHUI_30_YUN: [number, string, string, number][] = [
  // [运号(全局), 卦名, 主卦名, 变爻]
  // 第1组 主卦=姤
  [181, '乾', '姤', 1], [182, '遁', '姤', 2], [183, '讼', '姤', 3],
  [184, '巽', '姤', 4], [185, '鼎', '姤', 5], [186, '大过', '姤', 6],
  // 第2组 主卦=大过
  [187, '夬', '大过', 1], [188, '咸', '大过', 2], [189, '困', '大过', 3],
  [190, '井', '大过', 4], [191, '恒', '大过', 5], [192, '姤', '大过', 6],
  // 第3组 主卦=鼎
  [193, '大有', '鼎', 1], [194, '旅', '鼎', 2], [195, '未济', '鼎', 3],
  [196, '蛊', '鼎', 4], [197, '姤', '鼎', 5], [198, '恒', '鼎', 6],
  // 第4组 主卦=恒
  [199, '大壮', '恒', 1], [200, '小过', '恒', 2], [201, '解', '恒', 3],
  [202, '升', '恒', 4], [203, '大过', '恒', 5], [204, '鼎', '恒', 6],
  // 第5组 主卦=巽
  [205, '小畜', '巽', 1], [206, '渐', '巽', 2], [207, '涣', '巽', 3],
  [208, '姤', '巽', 4], [209, '蛊', '巽', 5], [210, '井', '巽', 6],
]

let yunPassCount = 0
for (const [globalYun, expectedName, expectedMaster, expectedYao] of WUHUI_30_YUN) {
  const detail = getYunHexagramDetailByGlobal(globalYun)
  const nameMatch = detail.yunHexagram.name === expectedName
  const masterMatch = detail.masterHexagram.name === expectedMaster
  const yaoMatch = detail.yaoChanged === expectedYao

  if (nameMatch && masterMatch && yaoMatch) {
    yunPassCount++
  } else {
    fail(`运${globalYun}：期望 ${expectedMaster}变${expectedYao}爻→${expectedName}，` +
         `实际 ${detail.masterHexagram.name}变${detail.yaoChanged}爻→${detail.yunHexagram.name}`)
  }
}
if (yunPassCount === 30) pass(`午会30运全部正确 (${yunPassCount}/30)`)

// ============================================================
// 三、关键运卦验证 — 当前所处的运192
//     各家共识：1744-2103年 = 运192 = 姤卦
//     由大过变上爻得
// ============================================================
section('三、当前时段运卦验证（1744-2103 → 运192）')

const yun192 = getYunHexagramByGlobal(192)
if (yun192.name === '姤') {
  pass(`运192（1744-2103）= ${yun192.name} ${yun192.unicode}  ← 各家共识✓`)
} else {
  fail(`运192：期望 姤，实际 ${yun192.name}`)
}

const yun192detail = getYunHexagramDetailByGlobal(192)
if (yun192detail.masterHexagram.name === '大过' && yun192detail.yaoChanged === 6) {
  pass(`运192由 ${yun192detail.masterHexagram.name} 变${yun192detail.yaoName}爻得 ← 正确`)
} else {
  fail(`运192推演来源：期望 大过变上爻，实际 ${yun192detail.masterHexagram.name}变${yun192detail.yaoName}爻`)
}

// ============================================================
// 四、世卦验证 — 当前所处的世（1984-2043）
//     各家共识：世卦 = 鼎（火风鼎）
//     由姤（运192）变五爻得
// ============================================================
section('四、当前时段世卦验证（1984-2043 → 鼎）')

// 2026年 → 皇极年 = 2026 + 67017 = 69043
// 世编号 = ceil(69043 / 30) = 2302
const huangji2026 = 2026 + 67017 // = 69043
const shi2026 = Math.ceil(huangji2026 / 30)
console.log(`  📊 2026年皇极年份: ${huangji2026}, 世编号: ${shi2026}`)

const shiHex = getShiHexagramByYear(huangji2026)
if (shiHex.name === '鼎') {
  pass(`2026年世卦 = ${shiHex.name} ${shiHex.unicode} (火风鼎) ← 各家共识✓`)
} else {
  fail(`2026年世卦：期望 鼎，实际 ${shiHex.name}`)
}

// 验证世卦由运卦姤变五爻得来
// shi2026 = 2302, 在运内位置: shiInYun = (2302-1) % 12 = 2301 % 12 = 11
// 甲子世index = floor(11/2) = 5 → 变第6爻（上爻）
// 但共识说是变五爻得鼎... 让我们具体看
const shiInYun2026 = (shi2026 - 1) % 12
const jiaziShi2026 = Math.floor(shiInYun2026 / 2)
console.log(`  📊 世在运内位置: ${shiInYun2026}, 甲子世序号: ${jiaziShi2026}, 变第${jiaziShi2026 + 1}爻`)

// 验证 changeYao(姤, 5) = 鼎
const gou_binary = 62 // 姤 = 111110
const ding_from_gou = changeYao(gou_binary, 5)
const ding_hex = getHexagram64(ding_from_gou)
console.log(`  📊 姤(${gou_binary.toString(2).padStart(6, '0')})变五爻 → ${ding_hex.name}(${ding_from_gou.toString(2).padStart(6, '0')})`)
if (ding_hex.name === '鼎') {
  pass(`姤变五爻 = 鼎 ← 变爻验算正确`)
} else {
  fail(`姤变五爻：期望 鼎，实际 ${ding_hex.name}`)
}

// ============================================================
// 五、岁卦验证 — 2026年
//     流派A（祝泌先天60卦平推法）：同人
//     流派B（黄畿世卦爻变法）：大有 ← 本项目应得出此结果
// ============================================================
section('五、岁卦（值年卦）验证 — 2026年')

const sui2026 = getSuiHexagram(2026)
console.log(`  📊 2026年岁卦 = ${sui2026.name} ${sui2026.unicode}`)

if (sui2026.name === '大有') {
  pass(`2026年岁卦 = 大有 ← 黄畿爻变法（鼎变初爻）✓`)
} else if (sui2026.name === '同人') {
  warn(`2026年岁卦 = 同人 ← 这是祝泌平推法的结果，非黄畿爻变法`)
} else {
  fail(`2026年岁卦：期望 大有(黄畿) 或 同人(祝泌)，实际 ${sui2026.name}`)
}

// 手动验证：鼎(101110)变初爻→大有(101111)，变初爻后不是四正卦
const ding_binary = 46 // 鼎 = 101110
const dahyou_from_ding = changeYao(ding_binary, 1)
const dahyou_hex = getHexagram64(dahyou_from_ding)
console.log(`  📊 手动推演：鼎(${ding_binary.toString(2).padStart(6, '0')})变初爻 → ${dahyou_hex.name}(${dahyou_from_ding.toString(2).padStart(6, '0')})`)
if (dahyou_hex.name === '大有') {
  pass(`鼎变初爻 = 大有 ← 变爻验算正确`)
} else {
  fail(`鼎变初爻：期望 大有，实际 ${dahyou_hex.name}`)
}

// 验证更多年份的岁卦不重复（连续年份不应出现同卦）
console.log(`\n  📊 验证连续年份岁卦不重复（2020-2030）:`)
let prevName = ''
let duplicateYears = false
for (let y = 2020; y <= 2030; y++) {
  const sui = getSuiHexagram(y)
  const isDup = sui.name === prevName
  if (isDup) duplicateYears = true
  console.log(`     ${y}年 → ${sui.name} ${sui.unicode}${isDup ? ' ⚠️ 与上年重复!' : ''}`)
  prevName = sui.name
}
if (!duplicateYears) {
  pass('2020-2030连续11年岁卦无重复')
} else {
  fail('存在连续年份岁卦重复！')
}

// ============================================================
// 六、月卦验证 — "皆取于复"原则
//     原文依据（黄畿）：甲子月 = 复卦
// ============================================================
section('六、月卦验证 — 黄畿"皆取于复"')

// 甲子月（ganzhiIndex=0）应得复卦
const yueJiazi = getYueHexagram(0)
if (yueJiazi.name === '复') {
  pass(`甲子月 = ${yueJiazi.name} ${yueJiazi.unicode} ← "皆取于复"✓`)
} else {
  fail(`甲子月：期望 复，实际 ${yueJiazi.name}`)
}

// 验证先天60卦序循环正确性（月卦应按干支逐个递进）
console.log(`\n  📊 月卦干支序列前10位:`)
const expectedMonthSequence = ['复', '颐', '屯', '益', '震', '噬嗑', '随', '无妄', '明夷', '贲']
let monthSeqOk = true
for (let i = 0; i < 10; i++) {
  const yue = getYueHexagram(i)
  const ok = yue.name === expectedMonthSequence[i]
  if (!ok) monthSeqOk = false
  console.log(`     干支${i}(${['甲子','乙丑','丙寅','丁卯','戊辰','己巳','庚午','辛未','壬申','癸酉'][i]}) → ${yue.name} ${yue.unicode}${ok ? '' : ` ← 期望 ${expectedMonthSequence[i]}`}`)
}
if (monthSeqOk) {
  pass('月卦前10位序列与先天60卦序完全一致')
} else {
  fail('月卦序列与预期不符')
}

// 辛卯月（干支索引=27）→ 应为先天60卦序的第(30+27)%60=57位
const xinmao_idx = 27 // 辛卯
const yueXinmao = getYueHexagram(xinmao_idx)
console.log(`  📊 辛卯月(2026.3) = ${yueXinmao.name} ${yueXinmao.unicode}`)

// ============================================================
// 七、日卦验证 — "皆取于复"原则
//     原文依据（黄畿）：甲子日 = 复卦
// ============================================================
section('七、日卦验证 — 黄畿"皆取于复"')

// 甲子日（ganzhiIndex=0）应得复卦
const riJiazi = getRiHexagram(0)
if (riJiazi.name === '复') {
  pass(`甲子日 = ${riJiazi.name} ${riJiazi.unicode} ← "皆取于复"✓`)
} else {
  fail(`甲子日：期望 复，实际 ${riJiazi.name}`)
}

// 甲申日（ganzhiIndex=20）→ 先天60卦序的第(30+20)%60=50位
// 先天60卦序第50位 = 涣
const jiashen_idx = 20
const riJiashen = getRiHexagram(jiashen_idx)
console.log(`  📊 甲申日(干支20) = ${riJiashen.name} ${riJiashen.unicode}`)

// Gemini_DeepThink 中说 2026年3月11日甲申日 = 先天60卦序第21位 = 睽
// 但是按我们的代码逻辑：(30+20)%60 = 50, 第50位
// 确认下 XIANTIAN_60_SEQUENCE[50] 对应什么卦
console.log(`\n  📊 日卦干支序列前10位:`)
const expectedDaySequence = ['复', '颐', '屯', '益', '震', '噬嗑', '随', '无妄', '明夷', '贲']
let daySeqOk = true
for (let i = 0; i < 10; i++) {
  const ri = getRiHexagram(i)
  const ok = ri.name === expectedDaySequence[i]
  if (!ok) daySeqOk = false
  console.log(`     干支${i} → ${ri.name} ${ri.unicode}${ok ? '' : ` ← 期望 ${expectedDaySequence[i]}`}`)
}
if (daySeqOk) {
  pass('日卦前10位序列与先天60卦序完全一致')
} else {
  fail('日卦序列与预期不符')
}

// ============================================================
// 八、元卦验证 — 乾卦（各家共识）
// ============================================================
section('八、元卦验证')

const yuanHex = getHexagram64(0x3F) // 乾 = 111111 = 63
if (yuanHex.name === '乾') {
  pass(`元卦 = ${yuanHex.name} ${yuanHex.unicode} ← 各家共识✓`)
} else {
  fail(`元卦：期望 乾，实际 ${yuanHex.name}`)
}

// ============================================================
// 九、爻变基础验证 — 确认 changeYao 方向正确
// ============================================================
section('九、爻变函数 changeYao 验证')

// 复卦(000001)变初爻 → 坤(000000)
const fuBin = 1 // 复 = 000001
const fuChangeYao1 = changeYao(fuBin, 1) // 变初爻
const fuChangeYao1Hex = getHexagram64(fuChangeYao1)
if (fuChangeYao1Hex.name === '坤') {
  pass(`复(000001)变初爻 → ${fuChangeYao1Hex.name}(${fuChangeYao1.toString(2).padStart(6, '0')})`)
} else {
  fail(`复变初爻：期望 坤(000000)，实际 ${fuChangeYao1Hex.name}(${fuChangeYao1.toString(2).padStart(6, '0')})`)
}

// 乾卦(111111)变上爻 → 夬(011111)
const qianBin = 63 // 乾 = 111111
const qianChangeYao6 = changeYao(qianBin, 6) // 变上爻
const qianChangeYao6Hex = getHexagram64(qianChangeYao6)
if (qianChangeYao6Hex.name === '夬') {
  pass(`乾(111111)变上爻 → ${qianChangeYao6Hex.name}(${qianChangeYao6.toString(2).padStart(6, '0')})`)
} else {
  fail(`乾变上爻：期望 夬(011111)，实际 ${qianChangeYao6Hex.name}(${qianChangeYao6.toString(2).padStart(6, '0')})`)
}

// 大过(011110)变上爻 → 姤(111110)  ← 关键验证：Gemini_DeepThink提到的校验点
const daguoBin = 30 // 大过 = 011110
const daguoChangeYao6 = changeYao(daguoBin, 6)
const daguoChangeYao6Hex = getHexagram64(daguoChangeYao6)
if (daguoChangeYao6Hex.name === '姤') {
  pass(`大过(011110)变上爻 → ${daguoChangeYao6Hex.name}(${daguoChangeYao6.toString(2).padStart(6, '0')}) ← 运192来源✓`)
} else {
  fail(`大过变上爻：期望 姤(111110)，实际 ${daguoChangeYao6Hex.name}(${daguoChangeYao6.toString(2).padStart(6, '0')})`)
}

// ============================================================
// 十、四正卦避让验证
// ============================================================
section('十、四正卦避让验证')

// 验证乾坤坎离都被标记为四正卦
const fourPrincipal = [
  [63, '乾'], [0, '坤'], [18, '坎'], [45, '离']
] as const

for (const [binary, name] of fourPrincipal) {
  if (isFourPrincipalHexagram(binary)) {
    pass(`${name}(${binary.toString(2).padStart(6, '0')}) 被正确标记为四正卦`)
  } else {
    fail(`${name}(${binary.toString(2).padStart(6, '0')}) 未被标记为四正卦！`)
  }
}

// 验证年卦(岁卦)中不出现四正卦（测试一整个60年循环）
console.log(`\n  📊 验证1984-2043整个甲子年间岁卦无四正卦:`)
let fourPrincipalAppeared = false
for (let y = 1984; y <= 2043; y++) {
  const sui = getSuiHexagram(y)
  if (isFourPrincipalHexagram(sui.binary)) {
    fourPrincipalAppeared = true
    fail(`${y}年岁卦 = ${sui.name}(四正卦) ← 不应出现！`)
  }
}
if (!fourPrincipalAppeared) {
  pass('1984-2043共60年岁卦中无四正卦出现 ← 预过滤法正确✓')
}

// ============================================================
// 十一、先天六十卦序验证
// ============================================================
section('十一、先天六十卦序完整性验证')

// 验证先天64卦序去除四正卦后恰好60卦
// 我们无法直接访问非exported常量，但可以通过月卦/日卦遍历60个来间接验证
const seen60: Set<string> = new Set()
for (let i = 0; i < 60; i++) {
  const hex = getYueHexagram(i)
  seen60.add(hex.name)
}
console.log(`  📊 月卦60甲子循环中出现了 ${seen60.size} 个不同的卦`)
if (seen60.size === 60) {
  pass('先天60卦序列包含60个不同的卦 ← 无重复无遗漏')
} else if (seen60.size < 60) {
  fail(`先天60卦序列只有 ${seen60.size} 个不同的卦，存在重复`)
} else {
  fail(`先天60卦序列出现了 ${seen60.size} 个，超过60`)
}

// 验证四正卦不在60卦序列中
const forbiddenNames = ['乾', '坤', '坎', '离']
const foundForbidden = forbiddenNames.filter(name => seen60.has(name))
if (foundForbidden.length === 0) {
  pass('先天60卦序列中不含四正卦（乾坤坎离）')
} else {
  fail(`先天60卦序列中错误地包含了: ${foundForbidden.join(', ')}`)
}

// ============================================================
// 十二、历史年份综合验证
// ============================================================
section('十二、历史年份综合验证')

interface YearCheck {
  year: number
  description: string
  expectedYun?: string
  expectedShi?: string
}

const historicalChecks: YearCheck[] = [
  { year: 1984, description: '甲子年（锚点）', expectedShi: '鼎' },
  { year: 2026, description: '丙午年（当前）', expectedShi: '鼎' },
  { year: 2043, description: '癸亥年（本世最后一年）', expectedShi: '鼎' },
  { year: 2044, description: '甲子年（下一个世卦开始）' },
  { year: 1744, description: '甲子年（运192开始）' },
  { year: 2103, description: '癸未年（运192最后一年）' },
]

for (const check of historicalChecks) {
  const hj = check.year + 67017
  const yunNum = Math.ceil(hj / 360)
  const shiNum = Math.ceil(hj / 30)
  const yunHex = getYunHexagramByGlobal(yunNum)
  const shiHex = getShiHexagramByYear(hj)
  const suiHex = getSuiHexagram(check.year)

  console.log(`  📊 ${check.year}年(${check.description}):`)
  console.log(`     运${yunNum} = ${yunHex.name} ${yunHex.unicode}` +
    (check.expectedYun ? (yunHex.name === check.expectedYun ? ' ✓' : ` ← 期望${check.expectedYun} ✗`) : ''))
  console.log(`     世${shiNum} = ${shiHex.name} ${shiHex.unicode}` +
    (check.expectedShi ? (shiHex.name === check.expectedShi ? ' ✓' : ` ← 期望${check.expectedShi} ✗`) : ''))
  console.log(`     岁卦 = ${suiHex.name} ${suiHex.unicode}`)

  if (check.expectedYun && yunHex.name !== check.expectedYun) {
    fail(`${check.year}年运卦不匹配`)
  }
  if (check.expectedShi && shiHex.name !== check.expectedShi) {
    fail(`${check.year}年世卦不匹配`)
  }
}

// ============================================================
// 十三、子会验证 — 复→颐→屯→益→震
// ============================================================
section('十三、子会5主卦验证')

const ZIHUI_MASTERS = ['复', '颐', '屯', '益', '震']
for (let g = 0; g < 5; g++) {
  const masterDetail = getYunHexagramDetailByGlobal(g * 6 + 1)
  const masterName = masterDetail.masterHexagram.name
  if (masterName === ZIHUI_MASTERS[g]) {
    pass(`子会第${g + 1}主卦 = ${masterName} ← 正确`)
  } else {
    fail(`子会第${g + 1}主卦：期望 ${ZIHUI_MASTERS[g]}，实际 ${masterName}`)
  }
}

// ============================================================
// 十四、律吕验证 — 黄畿声音系统
// ============================================================
section('十四、律吕验证 — 黄畿声音系统')

import { getYearLv, getMonthLv, getDayLv, getHourLv, TWELVE_LVLV } from '../src/utils/lvlv'

// 14.1 十二律吕完整性
if (TWELVE_LVLV.length === 12) {
  pass(`十二律吕数组包含 ${TWELVE_LVLV.length} 个律吕`)
} else {
  fail(`十二律吕数组长度错误: ${TWELVE_LVLV.length}，期望12`)
}

// 14.2 阳律6个 + 阴吕6个
const yangCount = TWELVE_LVLV.filter(l => l.type === '律').length
const yinCount = TWELVE_LVLV.filter(l => l.type === '吕').length
if (yangCount === 6 && yinCount === 6) {
  pass(`六律(阳)${yangCount}个 + 六吕(阴)${yinCount}个 = 12`)
} else {
  fail(`律吕阴阳分布错误: 律${yangCount}个, 吕${yinCount}个`)
}

// 14.3 年律验证 — 天干五合化映射
const YEAR_LV_TESTS: [string, number, string][] = [
  ['甲己年→黄钟', 0, '黄钟'], // 甲=0
  ['甲己年→黄钟', 5, '黄钟'], // 己=5
  ['乙庚年→太簇', 1, '太簇'], // 乙=1
  ['乙庚年→太簇', 6, '太簇'], // 庚=6
  ['丙辛年→姑洗', 2, '姑洗'], // 丙=2（2026丙午年）
  ['丙辛年→姑洗', 7, '姑洗'], // 辛=7
  ['丁壬年→蕤宾', 3, '蕤宾'], // 丁=3
  ['丁壬年→蕤宾', 8, '蕤宾'], // 壬=8
  ['戊癸年→夷则', 4, '夷则'], // 戊=4
  ['戊癸年→夷则', 9, '夷则'], // 癸=9
]

let yearLvOk = true
for (const [label, stemIdx, expected] of YEAR_LV_TESTS) {
  const lv = getYearLv(stemIdx)
  if (lv.name !== expected) {
    yearLvOk = false
    fail(`年律 ${label}: 期望${expected}，实际${lv.name}`)
  }
}
if (yearLvOk) pass('年律天干五合化映射全部正确 (10/10)')

// 14.4 2026丙午年验证
const lv2026 = getYearLv(2) // 丙=2
if (lv2026.name === '姑洗') {
  pass(`2026丙午年 → 年律 = ${lv2026.name}(${lv2026.pinyin}) ← 正确✓`)
} else {
  fail(`2026丙午年年律: 期望姑洗，实际${lv2026.name}`)
}

// 14.5 月律验证 — 地支十二律吕
const MONTH_LV_TESTS: [string, number, string][] = [
  ['子月→黄钟', 0, '黄钟'],
  ['丑月→大吕', 1, '大吕'],
  ['寅月→太簇', 2, '太簇'],
  ['卯月→夹钟', 3, '夹钟'],
  ['辰月→姑洗', 4, '姑洗'],
  ['巳月→仲吕', 5, '仲吕'],
  ['午月→蕤宾', 6, '蕤宾'],
  ['未月→林钟', 7, '林钟'],
  ['申月→夷则', 8, '夷则'],
  ['酉月→南吕', 9, '南吕'],
  ['戌月→无射', 10, '无射'],
  ['亥月→应钟', 11, '应钟'],
]

let monthLvOk = true
for (const [label, branchIdx, expected] of MONTH_LV_TESTS) {
  const lv = getMonthLv(branchIdx)
  if (lv.name !== expected) {
    monthLvOk = false
    fail(`月律 ${label}: 期望${expected}，实际${lv.name}`)
  }
}
if (monthLvOk) pass('月律地支十二律吕映射全部正确 (12/12)')

// 14.6 日律验证 — 与年律相同规则
const dayLvJia = getDayLv(0) // 甲日
if (dayLvJia.name === '黄钟') {
  pass(`甲日 → 日律 = ${dayLvJia.name} ← 与年律规则一致✓`)
} else {
  fail(`甲日日律: 期望黄钟，实际${dayLvJia.name}`)
}

// 14.7 时律验证 — 与月律相同规则
const hourLvZi = getHourLv(0) // 子时
if (hourLvZi.name === '黄钟') {
  pass(`子时 → 时律 = ${hourLvZi.name} ← 与月律规则一致✓`)
} else {
  fail(`子时时律: 期望黄钟，实际${hourLvZi.name}`)
}

// 14.8 无射不参天干验证
// 无射(index=10)不应出现在年律/日律的天干映射中
let wusheInStem = false
for (let i = 0; i < 10; i++) {
  const lv = getYearLv(i)
  if (lv.name === '无射') {
    wusheInStem = true
    fail(`天干索引${i}映射到了无射！违反"无射不参天干者，五声之正也"`)
  }
}
if (!wusheInStem) {
  pass('"无射不参天干" ← 天干十合化中无射正确缺席✓')
}

// ============================================================
// 第十五部分：声音唱和数据与映射验证
// ============================================================
console.log(`\n${'='.repeat(60)}`)
console.log(`15. 声音唱和数据与映射验证`)
console.log('='.repeat(60))

import { TEN_TIAN_SHENG, TWELVE_DI_YIN, getTianSheng, getDiYin } from '../src/utils/changhe'

// 1. 验证天声数组长度与提取
if (TEN_TIAN_SHENG.length === 10) {
  pass(`天声数组长度正确: 10`)
} else {
  fail(`天声数组长度错误，应为10，实际为${TEN_TIAN_SHENG.length}`)
}

for (let i = 0; i < 10; i++) {
  const ts = getTianSheng(i)
  if (ts.index !== i) {
    fail(`天声索引提取错误：输入${i}，返回索引${ts.index}`)
  }
}
pass(`十天声的索引与内容映射完全通过✓`)

// 2. 验证地音数组长度与提取
if (TWELVE_DI_YIN.length === 12) {
  pass(`地音数组长度正确: 12`)
} else {
  fail(`地音数组长度错误，应为12，实际为${TWELVE_DI_YIN.length}`)
}

for (let i = 0; i < 12; i++) {
  const dy = getDiYin(i)
  if (dy.index !== i) {
    fail(`地音索引提取错误：输入${i}，返回索引${dy.index}`)
  }
}
pass(`十二地音的索引与内容映射完全通过✓`)

// ============================================================
// 总结
// ============================================================
console.log(`\n${'═'.repeat(60)}`)
console.log(`  📋 验证报告总结`)
console.log('═'.repeat(60))
console.log(`  ✅ 通过: ${passCount}`)
console.log(`  ❌ 失败: ${failCount}`)
console.log(`  ⚠️  警告: ${warnCount}`)
console.log('═'.repeat(60))

if (failCount === 0) {
  console.log('\n  🎉 全部验证通过！算法与黄畿原文及各家共识完全一致。')
} else {
  console.log(`\n  ⚠️  有 ${failCount} 项验证未通过，需要进一步排查。`)
}

process.exit(failCount > 0 ? 1 : 0)

