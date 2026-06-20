/** 作物品种 IPC 处理器：注册主进程与渲染进程通信接口 */
import { ipcMain } from 'electron'
import { getDatabase } from '../database'
import { CropVarietiesRepository } from '../database/repositories/crop-varieties-repository'
import { IPC_CHANNELS } from '../../shared/constants/ipc'
import type { IpcResponse } from '../../shared/types/ipc'

function ok<T>(data: T): IpcResponse<T> {
  return { success: true, data }
}

function fail<T>(error: unknown): IpcResponse<T> {
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown IPC error'
  }
}

export function registerCropVarietiesIpc(): void {
  const repository = new CropVarietiesRepository(getDatabase())

  ipcMain.handle(IPC_CHANNELS.cropVarieties.list, async () => {
    try {
      return ok(repository.findAll())
    } catch (error) {
      return fail(error)
    }
  })

  ipcMain.handle(IPC_CHANNELS.cropVarieties.getById, async (_, id: number) => {
    try {
      return ok(repository.findById(id))
    } catch (error) {
      return fail(error)
    }
  })

  ipcMain.handle(IPC_CHANNELS.cropVarieties.create, async (_, input) => {
    try {
      return ok(repository.create(input))
    } catch (error) {
      return fail(error)
    }
  })

  ipcMain.handle(IPC_CHANNELS.cropVarieties.update, async (_, input) => {
    try {
      return ok(repository.update(input))
    } catch (error) {
      return fail(error)
    }
  })

  ipcMain.handle(IPC_CHANNELS.cropVarieties.remove, async (_, id: number) => {
    try {
      repository.delete(id)
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  })
}
