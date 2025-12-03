# 皇极经世历 (YHYS Calendar)

基于邵雍《皇极经世》体系构建的 React 日历应用，实现了元、会、运、世、年五级时间单位的可视化展示。

## 📖 项目简介

《皇极经世》是北宋哲学家邵雍所著的一部推演宇宙历史的著作。本项目将其独特的时间体系以现代前端技术进行可视化呈现。

### 时间单位换算

```
1 元（日） = 12 会（月） = 360 运（星） = 4,320 世（辰） = 129,600 年（岁）
1 年 = 12 月 = 24 节气 = 360 天
```

### 核心特性

- 🔍 **五级缩放**：支持元、会、运、世、年五个层级的视图切换
- 🗓️ **天干地支**：完整的干支纪年系统，遵循"冬至起于子"的规则
- 🌸 **二十四节气**：运节气（元级）与天节气（年级）双重节气系统
- 📍 **历史事件**：可配置的历史事件标注（如唐尧虞朝等）
- ☯️ **卦象显示**：十二月对应十二卦象（复、临、泰、大壮、夬、乾等）
- 🎨 **精美 UI**：古典美学风格的现代化界面设计

## 🚀 快速开始

### 方式一：Docker 部署（推荐）

```bash
# 进入项目目录
cd YHYS

# 启动 Docker 容器
docker-compose -f .docker/docker-compose.yml up -d

# 访问应用
open http://localhost:5173
```

### 方式二：本地开发

```bash
# 安装依赖（推荐使用 pnpm）
pnpm install
# 或
npm install

# 启动开发服务器
pnpm dev
# 或
npm run dev

# 访问应用
open http://localhost:5173
```

### 构建生产版本

```bash
# Docker 环境
docker exec -it yhys-app sh -c "npm run build"

# 本地环境
pnpm build
```

## 📁 项目结构

```
YHYS/
├── .cursor/rules/          # Cursor MDC 规则
│   └── huangji-calendar.mdc
├── .docker/                # Docker 配置
│   ├── Dockerfile
│   └── docker-compose.yml
├── src/
│   ├── components/         # React 组件
│   │   ├── Calendar.tsx    # 主日历组件
│   │   └── Calendar.css    # 样式文件
│   ├── data/               # 数据文件
│   │   ├── hexagrams.json  # 十二卦象数据
│   │   ├── special-dates.json  # 特殊日期/历史事件
│   │   └── specialDates.ts # 特殊日期工具函数
│   ├── utils/
│   │   └── calendar.ts     # 日历计算逻辑
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── README.md
```

## 🎯 功能说明

### 五级视图

| 层级 | 别名 | 子单位数 | 显示内容 |
|------|------|---------|---------|
| 元 | 日 | 12 会 | 12个会卡片，每个包含30运网格 |
| 会 | 月 | 30 运 | 30个运卡片，显示世范围和年范围 |
| 运 | 星 | 12 世 | 12个世卡片，每个包含30年网格 |
| 世 | 辰 | 30 年 | 30个年卡片，显示六十甲子 |
| 年 | 岁 | 12 月 | 12个月卡片，每个包含30天网格 |

### 天干地支

- **天干（日/星用）**：甲、乙、丙、丁、戊、己、庚、辛、壬、癸
- **地支（月/辰用）**：子、丑、寅、卯、辰、巳、午、未、申、酉、戌、亥
- **六十甲子（年岁用）**：天干地支组合，60年一循环

### 节气系统

遵循"冬至起于子"的核心规则：
- **开物**：寅月第76运/天 = 惊蛰
- **闭物**：戌月第315运/天 = 立冬

## ⚙️ 配置

### 添加历史事件

编辑 `src/data/special-dates.json`：

```json
{
  "id": "event-id",
  "name": "事件名称",
  "description": "事件描述",
  "color": "#8a2be2",
  "textColor": "#ffffff",
  "yun": 180,      // 运编号（1-360）
  "shi": 2157,     // 世编号（1-4320）
  "sui": 64810,    // 岁编号（1-129600）
  "badge": "标"
}
```

### 修改卦象

编辑 `src/data/hexagrams.json` 可自定义十二月对应的卦象。

## 🛠️ 技术栈

- **React 18** - 用户界面
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Docker** - 容器化部署

## 📚 参考资料

- [皇极经世·卷一上](https://zh.wikisource.org/wiki/皇極經世/卷一上)
- [皇极经世·卷三上](https://zh.wikisource.org/wiki/皇極經世/卷三上)

## 📄 许可证

MIT License

