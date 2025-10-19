import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@mock': resolve(__dirname, 'mock')
    }
  },
  server: {
    host: '0.0.0.0', // 允许外部访问
    port: 3000,
    open: true,
    cors: true, // 启用CORS
    https: {
      key: fs.readFileSync('./certs/localhost-key.pem'),
      cert: fs.readFileSync('./certs/localhost.pem')
    },
    hmr: {
      port: 3001, // HMR端口，避免冲突
      host: 'localhost'
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    },
    proxy: {
      // 配置代理以便在开发环境访问 mock 数据
      '/mock': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mock/, '')
      },
      // 代理高德地图API请求
      '/amap': {
        target: 'https://webapi.amap.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/amap/, ''),
        secure: true
      },
      // 代理高德地图样式文件
      '/vdata': {
        target: 'https://vdata.amap.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/vdata/, ''),
        secure: true
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'static',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
              return 'vendor'
            } else if (id.includes('vant')) {
              return 'vant'
            }
          }
        }
      }
    }
  }
})
