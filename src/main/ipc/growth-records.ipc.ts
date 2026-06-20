/** 生长记录 IPC 处理器：注册主进程与渲染进程通信接口 */
import { ipcMain } from 'electron'
import { getDatabase } from '../database'
import { GrowthRecordsRepository } from '../database/repositories/growth-records-repository'
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

export function registerGrowthRecordsIpc(): void {
  const repository = new GrowthRecordsRepository(getDatabase())

  ipcMain.handle(IPC_CHANNELS.growthRecords.listByPlantingRecordId, async (_, plantingRecordId: number) => {
    try {
      return ok(repository.findAllByPlantingRecordId(plantingRecordId))
    } catch (error) {
      return fail(error)
    }
  })

  ipcMain.handle(IPC_CHANNELS.growthRecords.getById, async (_, id: number) => {
    try {
      return ok(repository.findById(id))
    } catch (error) {
      return fail(error)
    }
  })

  ipcMain.handle(IPC_CHANNELS.growthRecords.create, async (_, input) => {
    try {
      return ok(repository.create(input))
    } catch (error) {
      return fail(error)
    }
  })

  ipcMain.handle(IPC_CHANNELS.growthRecords.update, async (_, input) => {
    try {
      return ok(repository.update(input))
    } catch (error) {
      return fail(error)
    }
  })

  ipcMain.handle(IPC_CHANNELS.growthRecords.remove, async (_, id: number) => {
    try {
      repository.delete(id)
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  })
}
