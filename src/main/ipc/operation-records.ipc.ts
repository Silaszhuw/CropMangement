/** 操作记录 IPC 处理器：注册主进程与渲染进程通信接口 */
import { ipcMain } from 'electron'
import { getDatabase } from '../database'
import { OperationRecordsRepository } from '../database/repositories/operation-records-repository'
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

export function registerOperationRecordsIpc(): void {
  const repository = new OperationRecordsRepository(getDatabase())

  ipcMain.handle(IPC_CHANNELS.operationRecords.listByPlantingRecordId, async (_, plantingRecordId: number) => {
    try {
      return ok(repository.findAllByPlantingRecordId(plantingRecordId))
    } catch (error) {
      return fail(error)
    }
  })

  ipcMain.handle(IPC_CHANNELS.operationRecords.getById, async (_, id: number) => {
    try {
      return ok(repository.findById(id))
    } catch (error) {
      return fail(error)
    }
  })

  ipcMain.handle(IPC_CHANNELS.operationRecords.create, async (_, input) => {
    try {
      return ok(repository.create(input))
    } catch (error) {
      return fail(error)
    }
  })

  ipcMain.handle(IPC_CHANNELS.operationRecords.update, async (_, input) => {
    try {
      return ok(repository.update(input))
    } catch (error) {
      return fail(error)
    }
  })

  ipcMain.handle(IPC_CHANNELS.operationRecords.remove, async (_, id: number) => {
    try {
      repository.delete(id)
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  })
}
