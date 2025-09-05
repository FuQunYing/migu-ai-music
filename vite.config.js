import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
//生产
//前端 https://migu-aimusic.yangshipin.cn/
//后端  https://migu-aimusic.yangshipin.cn/api

//测试
// 前端: https://migu-aimusic.yangshipin.cn/testenvironment
// 后端：https://migu-aimusic.yangshipin.cn/testenvironment/api
const front_end_base_uri = 'https://migu-aimusic.yangshipin.cn/testenvironment';
const back_end_base_uri = 'https://migu-aimusic.yangshipin.cn/testenvironment/api';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@vant/weapp': '@vant/dist', // 部分场景可能需要指向 dist 目录
    },
  },
  headers: {
    'Content-Type': 'application/javascript' // 强制 MIME 类型
  },
  server: {

    proxy: {
      '/api': {
        target: 'https://migu-aimusic.yangshipin.cn/',
        // target: 'http://10.16.7.0:8989/',
        // target: 'http://10.16.7.0:8989/',
        // target: back_end_base_uri,
        // target:'http://10.5.101.152:8787/',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''),
        // 测试环境👇🏻
        rewrite: (path) => {
          console.log('原始路径:', path); // 打印原始路径
          const newPath = path.replace(/^\/api/, '');
          console.log('重写后路径:', newPath); // 打印重写后路径
          return newPath;
        },
        // rewrite: (path) => {
        //   console.log('原始路径:', path); // 打印原始路径
        //   const newPath = path.replace(/^\/+api\/+api/, '/testenvironment/api');
        //   console.log('重写后路径:', newPath); // 打印重写后路径
        //   return path;
        // },
        // 生产环境👇🏻
        // rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  }
})
