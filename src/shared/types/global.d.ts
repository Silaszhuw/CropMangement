import type { CropModelingApi } from './ipc'

export {}

declare global {
  interface Window {
    cropModeling?: CropModelingApi
  }
}
