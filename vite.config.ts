import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 6666,
    // HMR 配置：确保 Docker 环境下 WebSocket 连接正常
    hmr: {
      host: 'localhost',
      port: 6666,
      clientPort: 6666,
    },
    watch: {
      // Docker 环境下需要启用轮询模式以检测文件变化
      usePolling: true,
      // 轮询间隔（毫秒），降低 CPU 占用
      interval: 1000,
    },
  },
})

