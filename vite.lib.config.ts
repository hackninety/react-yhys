import { defineConfig } from 'vite'

/**
 * 库构建配置：把 src/lib.ts 的算法核心打包为单文件 ESM，
 * 供外部项目以 git 依赖方式引用（npm install github:hackninety/react-yhys）。
 *
 * 打包为单文件的原因：tsc 直接产出的多文件 ESM 相对导入不带扩展名，
 * 只有打包器能解析；单文件产物在 Vite/Webpack 与 Node 下都可直接使用。
 * 类型声明由 tsconfig.lib.json（emitDeclarationOnly）单独产出到 dist-lib/types。
 */
export default defineConfig({
  publicDir: false, // 库构建不携带应用的 public/ 静态资源
  build: {
    lib: {
      entry: 'src/lib.ts',
      formats: ['es'],
      fileName: 'lib',
    },
    outDir: 'dist-lib',
    emptyOutDir: true, // 构建顺序为先 vite 后 tsc，types 目录会在其后重新生成
    sourcemap: true,
  },
})
