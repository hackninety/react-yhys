# 使用 Node.js 20 LTS 作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 安装 pnpm（更快的包管理器）
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制 package 文件并安装依赖
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

# 复制源代码
COPY . .

# 暴露开发服务器端口
EXPOSE 5173

# 启动脚本：确保 node_modules 存在后再启动
CMD ["sh", "-c", "pnpm install && pnpm dev --host 0.0.0.0"]
