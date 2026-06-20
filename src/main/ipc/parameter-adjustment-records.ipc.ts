/** 参数调整记录 IPC 处理器：注册主进程与渲染进程通信接口 */
import { ipcMain } from 'electron'
import { getDatabase } from '../database'
import { ParameterAdjustmentRecordsRepository } from '../database/repositories/parameter-adjustment-records-repository'
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

export function registerParameterAdjustmentRecordsIpc(): void {
  const repository = new ParameterAdjustmentRecordsRepository(getDatabase())

  ipcMain.handle(IPC_CHANNELS.parameterAdjustmentRecords.list, async () => {
    try {
      return ok(repository.findAll())
    } catch (error) {
      return fail(error)
    }
  })

  ipcMain.handle(IPC_CHANNELS.parameterAdjustmentRecords.listByParameterId, async (_, parameterId: number) => {
    try {
      return ok(repository.findByParameterId(parameterId))
    } catch (error) {
      return fail(error)
    }
  })
}
