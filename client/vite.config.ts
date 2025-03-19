import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/', 
  build: {
    outDir: 'dist'
  },
  plugins: [react()],
  server: {
    host: true, // Разрешает доступ к серверу с любого хоста
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Укажите ваш бэкенд
        changeOrigin: true, // Меняет Origin заголовок на целевой сервер
        secure: false, // Установите false, если сервер HTTP
        rewrite: (path) => path.replace(/^\/api/, ''), // Убирает /api из пути (если нужно)
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Access-Control-Allow-Origin', '*'); // Разрешает соединения откуда угодно
          });
        }
      }
    }
  }
})
