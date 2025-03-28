import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', 
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 443, 
    },
    allowedHosts: ['reasonable-console-yard-usb.trycloudflare.com'], // Allow your Cloudflare Tunnel URL
  },
})
