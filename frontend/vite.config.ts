import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@utils': path.resolve(__dirname, './src/utilities'),
      '@api': path.resolve(__dirname, './src/api/index'),
      '@api/*': path.resolve(__dirname, './src/api/*'),
      '@contexts': path.resolve(__dirname, './src/contexts')
    },
  },
  server: {
    host: true, 
    port: 3000,   
  },
})
