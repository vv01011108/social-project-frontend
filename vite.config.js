import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     // port: 5173, // Vite 기본 포트 (변경 가능)
//     // host: true, // 로컬 네트워크에서 접속 가능하도록 설정
//     // open: true, // 서버 시작 시 브라우저 자동 열기
//     // hmr: {
//     //   clientPort: 443, // ngrok의 HTTPS 포트
//     // },
//   },
// })

export default {
  server: {
    host: '127.0.0.1',
    port: 3000,
  },
};