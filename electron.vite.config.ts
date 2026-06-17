import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

const rootDirectory = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@main': resolve(rootDirectory, 'src/main'),
        '@shared': resolve(rootDirectory, 'src/shared')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(rootDirectory, 'src/main/preload.ts')
        }
      }
    },
    resolve: {
      alias: {
        '@main': resolve(rootDirectory, 'src/main'),
        '@shared': resolve(rootDirectory, 'src/shared')
      }
    }
  },
  renderer: {
    plugins: [react()],
    resolve: {
      alias: {
        '@renderer': resolve(rootDirectory, 'src/renderer/src'),
        '@shared': resolve(rootDirectory, 'src/shared')
      }
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(rootDirectory, 'src/renderer/index.html')
        }
      }
    }
  }
})
