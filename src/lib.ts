/**
 * 皇极经世（元会运世）卦算法库 —— 对外入口
 *
 * 外部项目通过 git 依赖引用（无需发布 npm registry）：
 *   npm install github:hackninety/react-yhys
 *   import { huangjiAlgorithm, getSuiHexagram, getHexagram64 } from 'yhys-core'
 *
 * 校验状态：
 * - 黄畿算法：已对照《皇极经世书》黄畿注原文校验（84 个文献锚点，
 *   含尧甲辰=随、孔子庚戌=履、午会第十运大过之井等），为默认算法
 * - 祝泌算法：暂未对照《皇极经世书解》原文，仅经第三方数据交叉验证，
 *   默认关闭（见 algorithms/registry.ts 的 ENABLE_ZHUBI）
 *
 * 注意：本入口只聚合无 React / 无第三方依赖的纯 TS 模块，
 * 新增 re-export 时勿引入 components/ 或 utils/lunar.ts（依赖 lunisolar）。
 */

// 六十四卦数据与各层卦计算（元/会/运/世/十年/岁/月/日/时）
export * from './data/hexagrams64'

// 节气与皇极年内天数
export * from './utils/solarTerms'

// 皇极纪年、六十甲子、干支换算与体系常量
export * from './utils/calendar'
export * from './utils/ganzhi'

// 算法注册表（切换/订阅）与两派算法实现
export * from './algorithms/registry'
export { huangjiAlgorithm } from './algorithms/huangji'
export { zhubiAlgorithm } from './algorithms/zhubi'
export type { HexagramAlgorithm } from './algorithms/types'
