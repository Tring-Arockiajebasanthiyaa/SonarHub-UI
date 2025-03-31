import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'


export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', 
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 5173, 
    },
    allowedHosts: ['reasonable-console-yard-usb.trycloudflare.com'], 
  },
})
