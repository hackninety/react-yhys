/**
 * 邵雍声音唱和表
 * 根据《皇极经世书》卷七至十“声音唱和图”提炼的十天声与十二地音概览数据
 */

export interface TianSheng {
  index: number
  name: string
  xiSheng: '辟' | '翕'
  xiang: '日' | '月' | '星' | '辰'
  qingZhuo: '清' | '浊'
  yuns: {
    ping: string
    shang: string
    qu: string
    ru: string
  }
}

export interface DiYin {
  index: number
  name: string
  xiang: '水' | '火' | '土' | '石'
  huFa: '开' | '发' | '收' | '闭'
  qingZhuo: '清' | '浊'
  chars: string
}

// ----------------------------------------------------
// 10 天声：取天干之数
// 分日(清辟) 月(浊翕) 星(清开) 辰(浊收)\n// ----------------------------------------------------
export const TEN_TIAN_SHENG: TianSheng[] = [
  { index: 0, name: '一声', xiSheng: '辟', xiang: '日', qingZhuo: '清',
    yuns: { ping: '多良千刀妻', shang: '可两典早子', qu: '个向旦孝四', ru: '舌岳日' } },
  { index: 1, name: '二声', xiSheng: '辟', xiang: '日', qingZhuo: '清',
    yuns: { ping: '宫心', shang: '孔审', qu: '众禁', ru: '' } },
  { index: 2, name: '三声', xiSheng: '辟', xiang: '星', qingZhuo: '清',
    yuns: { ping: '开丁臣牛', shang: '宰井引斗', qu: '爱亘艮奏', ru: '六德' } },
  { index: 3, name: '四声', xiSheng: '辟', xiang: '星', qingZhuo: '清',
    yuns: { ping: '鱼乃自寺卓', shang: '鼠你在此中', qu: '去女匠象', ru: '卓' } },
  { index: 4, name: '五声', xiSheng: '翕', xiang: '月', qingZhuo: '浊',
    yuns: { ping: '龙走思茶', shang: '用哉三呈', qu: '星', ru: '十足骨' } },
  { index: 5, name: '六声', xiSheng: '翕', xiang: '月', qingZhuo: '浊',
    yuns: { ping: '禾光元毛衰', shang: '火广犬宝', qu: '化况半报帅', ru: '八霍' } },
  { index: 6, name: '七声', xiSheng: '翕', xiang: '辰', qingZhuo: '浊',
    yuns: { ping: '内草', shang: '南采', qu: '年七', ru: '' } },
  { index: 7, name: '八声', xiSheng: '翕', xiang: '辰', qingZhuo: '浊',
    yuns: { ping: '回兄君龟', shang: '每永允水', qu: '退莹巽贵', ru: '玉北' } },
  { index: 8, name: '九声', xiSheng: '辟', xiang: '日', qingZhuo: '清',
    yuns: { ping: '阿', shang: '丫', qu: '亚', ru: '' } }, // 补充不常见位
  { index: 9, name: '十声', xiSheng: '翕', xiang: '辰', qingZhuo: '浊',
    yuns: { ping: '丹', shang: '胆', qu: '但', ru: '' } }
]

// ----------------------------------------------------
// 12 地音：取地支之数
// 分水(清开) 火(浊发) 土(清收) 石(浊闭)
// ----------------------------------------------------
export const TWELVE_DI_YIN: DiYin[] = [
  { index: 0, name: '一音', xiang: '水', huFa: '开', qingZhuo: '清', chars: '古黑安夫卜' },
  { index: 1, name: '二音', xiang: '火', huFa: '发', qingZhuo: '浊', chars: '乃走思此兹' },
  { index: 2, name: '三音', xiang: '水', huFa: '开', qingZhuo: '清', chars: '川于一' },
  { index: 3, name: '四音', xiang: '火', huFa: '发', qingZhuo: '浊', chars: '米水青上和' },
  { index: 4, name: '五音', xiang: '土', huFa: '收', qingZhuo: '清', chars: '坤五母式普' },
  { index: 5, name: '六音', xiang: '石', huFa: '闭', qingZhuo: '浊', chars: '老草包好考' },
  { index: 6, name: '七音', xiang: '水', huFa: '开', qingZhuo: '清', chars: '心审禁金音' },
  { index: 7, name: '八音', xiang: '火', huFa: '发', qingZhuo: '浊', chars: '龙用同从东' },
  { index: 8, name: '九音', xiang: '土', huFa: '收', qingZhuo: '清', chars: '女语如车车' },
  { index: 9, name: '十音', xiang: '石', huFa: '闭', qingZhuo: '浊', chars: '乌虎兔土主' },
  { index: 10, name: '十一音', xiang: '水', huFa: '开', qingZhuo: '清', chars: '内南年南牛' },
  { index: 11, name: '十二音', xiang: '火', huFa: '发', qingZhuo: '浊', chars: '草采清全村' }
]

/**
 * 根据天干索引获取天声
 */
export function getTianSheng(ganIndex: number): TianSheng {
  return TEN_TIAN_SHENG[ganIndex % 10]
}

/**
 * 根据地支索引获取地音
 */
export function getDiYin(zhiIndex: number): DiYin {
  return TWELVE_DI_YIN[zhiIndex % 12]
}
