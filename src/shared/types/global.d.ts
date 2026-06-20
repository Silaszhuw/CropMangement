/** 全局类型声明：为 Electron 环境提供全局 API 类型定义 */
import type { CropModelingApi } from './ipc'

export {}

declare global {
  interface Window {
    cropModeling?: CropModelingApi
  }
}
