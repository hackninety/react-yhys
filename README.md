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
- ☯️ **卦象显示**：十二月对应十二卦象
- 🎨 **精美 UI**：古典美学风格的现代化界面设计

---

## 🚀 生产环境部署（宝塔面板）

### 1. 环境要求

| 组件 | 版本 |
|------|------|
| Node.js | 22.21.1 (LTS) |
| pnpm | 10+ |
| Nginx | 1.18+ |

### 2. 首次部署

```bash
# 1. 克隆代码到服务器
cd /opt/git
git clone https://github.com/your-repo/yhys.git
cd yhys

# 2. 安装依赖
pnpm install

# 3. 构建生产版本
pnpm build

# 4. 同步到网站目录
rsync -avz --delete dist/ /www/wwwroot/yhys.0x7c.cc/
```

### 3. 宝塔面板配置

#### 3.1 创建网站

1. 登录宝塔面板
2. 网站 → 添加站点
3. 配置：
   - 域名：`yhys.0x7c.cc`
   - 根目录：`/www/wwwroot/yhys.0x7c.cc`
   - PHP版本：纯静态
   - 勾选：创建FTP、创建数据库 都不需要

#### 3.2 配置 Nginx

点击网站 → 设置 → 配置文件，添加以下配置：

```nginx
server {
    listen 80;
    server_name yhys.0x7c.cc;
    
    root /www/wwwroot/yhys.0x7c.cc;
    index index.html;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # 静态资源缓存（Vite 构建带 hash，可长期缓存）
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # SPA 路由支持（所有路径都返回 index.html）
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 健康检查
    location /health {
        access_log off;
        return 200 "OK\n";
    }
    
    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
    }
    
    access_log /www/wwwlogs/yhys.0x7c.cc.log;
    error_log /www/wwwlogs/yhys.0x7c.cc.error.log;
}
```

#### 3.3 配置 SSL（可选）

1. 网站 → 设置 → SSL
2. 选择 Let's Encrypt 或上传证书
3. 开启强制 HTTPS

### 4. 代码更新

```bash
# 进入代码目录
cd /opt/git/yhys

# 拉取最新代码
git pull

# 安装依赖（如有更新）
pnpm install

# 重新构建
pnpm build

# 同步到网站目录
rsync -avz --delete dist/ /www/wwwroot/yhys.0x7c.cc/
```

> 💡 **提示**：纯静态网站无需重启任何服务，同步完成即生效。

#### 一键更新脚本（可选）

创建 `/opt/git/yhys/deploy.sh`：

```bash
#!/bin/bash
set -e

cd /opt/git/yhys
echo "📥 拉取最新代码..."
git pull

echo "📦 安装依赖..."
pnpm install

echo "🔨 构建生产版本..."
pnpm build

echo "🚀 同步到网站目录..."
rsync -avz --delete dist/ /www/wwwroot/yhys.0x7c.cc/

echo "✅ 部署完成！"
```

使用：`bash /opt/git/yhys/deploy.sh`

---

## 💻 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 访问 http://localhost:5173
```

---

## 📁 项目结构

```
yhys.0x7c.cc/
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
├── dist/                   # 构建产物（上传此目录）
├── package.json
└── README.md
```

---

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

---

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
  "yun": 180,
  "shi": 2157,
  "sui": 64810,
  "badge": "标"
}
```

### 颜色参考

#### 五行颜色

| 五行 | 主色 | 文字色 |
|------|------|--------|
| 金 | `#D4AF37` | `#ffffff` |
| 木 | `#228B22` | `#ffffff` |
| 水 | `#1E3A5F` | `#ffffff` |
| 火 | `#DC143C` | `#ffffff` |
| 土 | `#CD853F` | `#ffffff` |

---

## 🛠️ 技术栈

- **React 18** - 用户界面
- **TypeScript** - 类型安全
- **Vite** - 构建工具

## 📚 参考资料

- [皇极经世·卷一上](https://zh.wikisource.org/wiki/皇極經世/卷一上)
- [皇极经世·卷三上](https://zh.wikisource.org/wiki/皇極經世/卷三上)

## 📄 许可证

MIT License
