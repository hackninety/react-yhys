/**
 * 完整声音唱和 10×12 千字发音矩阵核心数据
 * 资料来源：邵雍《皇极经世书》卷七至十 + 各类通行解读
 * ==========================================================
 * 这是用来说明"天声"(10组)×"地音"(12组)所形成的庞大音位矩阵。
 * 每一个交叉格点代表一个可能的发音字例，
 * 采用 3级嵌套 结构来完全贴合古籍排版原型：
 * 【天声组】→【四声行(平/上/去/入)】→【地音列(1~12)】
 */

// ----------------------------------------------------
// 核心类型定义
// ----------------------------------------------------

export interface ChangheCell {
  char: string    // 交叉点上的汉字例。若有声无字或无词可对，用 '○' 或 '●' 表示空位
}

export interface TianShengRow {
  tone: '平' | '上' | '去' | '入'
  cells: ChangheCell[] // 固定长度 12，对应一音到十二音
}

export interface TianShengGroup {
  index: number    // 0~9
  name: string     // 一声 ~ 十声
  xiSheng: '辟' | '翕'
  xiang: '日' | '月' | '星' | '辰'
  qingZhuo: '清' | '浊'
  rows: TianShengRow[] // 固定长度 4 (平上去入)
}

// ----------------------------------------------------
// 矩阵字例数据（Step 2a: 第一版骨架+已知字例，后续可持续完善填写）
// ----------------------------------------------------

export const CHANGHE_MATRIX: TianShengGroup[] = [
  // ----------------【一声：日象·辟·清】----------------
  {
    index: 0, name: '一声', xiSheng: '辟', xiang: '日', qingZhuo: '清',
    rows: [
      { tone: '平', cells: [
        {char:'多'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},
        {char:'良'},{char:'○'},{char:'○'},{char:'千'},{char:'刀'},{char:'妻'}
      ]},
      { tone: '上', cells: [
        {char:'可'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'两'},
        {char:'典'},{char:'○'},{char:'○'},{char:'早'},{char:'子'},{char:'○'}
      ]},
      { tone: '去', cells: [
        {char:'个'},{char:'向'},{char:'段'},{char:'○'},{char:'○'},{char:'旦'},
        {char:'○'},{char:'○'},{char:'孝'},{char:'四'},{char:'○'},{char:'○'}
      ]},
      { tone: '入', cells: [
        {char:'舌'},{char:'○'},{char:'○'},{char:'岳'},{char:'日'},{char:'各'},
        {char:'一'},{char:'月'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}
      ]}
    ]
  },
  // ----------------【二声：月象·辟·浊】----------------
  {
    index: 1, name: '二声', xiSheng: '辟', xiang: '月', qingZhuo: '浊',
    rows: [
      { tone: '平', cells: [{char:'禾'},{char:'光'},{char:'元'},{char:'○'},{char:'○'},{char:'毛'},{char:'○'},{char:'○'},{char:'○'},{char:'衰'},{char:'○'},{char:'○'}] },
      { tone: '上', cells: [{char:'火'},{char:'广'},{char:'犬'},{char:'○'},{char:'○'},{char:'宝'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] },
      { tone: '去', cells: [{char:'化'},{char:'况'},{char:'半'},{char:'○'},{char:'○'},{char:'报'},{char:'帅'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] },
      { tone: '入', cells: [{char:'八'},{char:'霍'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] }
    ]
  },
  // ----------------【三声：星象·辟·清】----------------
  {
    index: 2, name: '三声', xiSheng: '辟', xiang: '星', qingZhuo: '清',
    rows: [
      { tone: '平', cells: [{char:'开'},{char:'丁'},{char:'臣'},{char:'○'},{char:'牛'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] },
      { tone: '上', cells: [{char:'宰'},{char:'井'},{char:'引'},{char:'斗'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] },
      { tone: '去', cells: [{char:'爱'},{char:'亘'},{char:'艮'},{char:'奏'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] },
      { tone: '入', cells: [{char:'六'},{char:'德'},{char:'黑'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] }
    ]
  },
  // ----------------【四声：辰象·辟·浊】----------------
  {
    index: 3, name: '四声', xiSheng: '辟', xiang: '辰', qingZhuo: '浊',
    rows: [
      { tone: '平', cells: [{char:'回'},{char:'兄'},{char:'君'},{char:'○'},{char:'龟'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] },
      { tone: '上', cells: [{char:'每'},{char:'永'},{char:'允'},{char:'水'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] },
      { tone: '去', cells: [{char:'退'},{char:'莹'},{char:'巽'},{char:'贵'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] },
      { tone: '入', cells: [{char:'玉'},{char:'北'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] }
    ]
  },
  // ----------------【五声：日象·翕·清】----------------
  {
    index: 4, name: '五声', xiSheng: '翕', xiang: '日', qingZhuo: '清',
    rows: [
      { tone: '平', cells: [{char:'妻'},{char:'宫'},{char:'心'},{char:'鱼'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] },
      { tone: '上', cells: [{char:'子'},{char:'孔'},{char:'审'},{char:'鼠'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] },
      { tone: '去', cells: [{char:'四'},{char:'众'},{char:'禁'},{char:'去'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] },
      { tone: '入', cells: [{char:'日'},{char:'足'},{char:'德'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] }
    ]
  },
  // ----------------【六声：月象·翕·浊】----------------
  {
    index: 5, name: '六声', xiSheng: '翕', xiang: '月', qingZhuo: '浊',
    rows: [
      { tone: '平', cells: [{char:'龙'},{char:'走'},{char:'思'},{char:'茶'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] },
      { tone: '上', cells: [{char:'用'},{char:'哉'},{char:'三'},{char:'呈'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] },
      { tone: '去', cells: [{char:'○'},{char:'○'},{char:'星'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] },
      { tone: '入', cells: [{char:'十'},{char:'骨'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] }
    ]
  },
  // ----------------【七声：星象·翕·清】----------------
  {
    index: 6, name: '七声', xiSheng: '翕', xiang: '星', qingZhuo: '清',
    rows: [
      { tone: '平', cells: [{char:'鱼'},{char:'乃'},{char:'自'},{char:'寺'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] },
      { tone: '上', cells: [{char:'鼠'},{char:'你'},{char:'在'},{char:'此'},{char:'中'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] },
      { tone: '去', cells: [{char:'去'},{char:'女'},{char:'匠'},{char:'象'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] },
      { tone: '入', cells: [{char:'卓'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] }
    ]
  },
  // ----------------【八声：辰象·翕·浊】----------------
  {
    index: 7, name: '八声', xiSheng: '翕', xiang: '辰', qingZhuo: '浊',
    rows: [
      { tone: '平', cells: [{char:'内'},{char:'草'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] },
      { tone: '上', cells: [{char:'南'},{char:'采'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] },
      { tone: '去', cells: [{char:'年'},{char:'七'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] },
      { tone: '入', cells: [{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] }
    ]
  },
  // ----------------【九声：日象·辟·清 (补充)】----------------
  {
    index: 8, name: '九声', xiSheng: '辟', xiang: '日', qingZhuo: '清',
    rows: [
      { tone: '平', cells: [{char:'阿'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] },
      { tone: '上', cells: [{char:'丫'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] },
      { tone: '去', cells: [{char:'亚'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] },
      { tone: '入', cells: [{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] }
    ]
  },
  // ----------------【十声：月象·翕·浊 (补充)】----------------
  {
    index: 9, name: '十声', xiSheng: '翕', xiang: '月', qingZhuo: '浊',
    rows: [
      { tone: '平', cells: [{char:'丹'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] },
      { tone: '上', cells: [{char:'胆'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] },
      { tone: '去', cells: [{char:'但'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] },
      { tone: '入', cells: [{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'},{char:'○'}] }
    ]
  }
]
