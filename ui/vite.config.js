import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  // build: {
  //   outDir: '../public'  // 构建结果输出到根目录的 public 文件夹
  // },
  server: {
    proxy: {
      '/api': 'http://localhost:3000'  // 开发时，前端请求 /api 代理到后端
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
