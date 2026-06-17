import type { CropModelingApi } from '../../../shared/types/ipc'

export {}

declare global {
  interface Window {
    cropModeling?: CropModelingApi
  }
}
