import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const cleanNetworkUrlsPlugin = (): Plugin => ({
  name: 'clean-network-urls',
  configureServer(server) {
    const originalPrintUrls = server.printUrls
    server.printUrls = () => {
      if (server.resolvedUrls?.network) {
        // Exclude virtual/Hyper-V/WSL adapters (172.x.x.x) and show only actual physical LAN IP
        server.resolvedUrls.network = server.resolvedUrls.network.filter(
          (url) => !url.includes('172.') && !url.includes('127.')
        )
      }
      originalPrintUrls.call(server)
    }
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cleanNetworkUrlsPlugin()],
  server: {
    host: true, // Listen on 0.0.0.0 for LAN access
    port: Number(process.env.VITE_PORT) || 3001,
  },
  preview: {
    host: true, // Listen on 0.0.0.0 for LAN / Tablet access
    port: Number(process.env.VITE_PORT) || 3001,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'antd', '@ant-design/icons', 'axios', 'dayjs'],
  },
})
