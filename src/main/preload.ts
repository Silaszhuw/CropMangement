/**
 * Preload 脚本：通过 contextBridge 向渲染进程安全暴露所有业务实体的 IPC 调用接口
 */

import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/constants/ipc'
import type { CropModelingApi } from '../shared/types/ipc'

const cropModelingApi: CropModelingApi = {
  version: '0.1.0',
  fields: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.fields.list),
    getById: (id) => ipcRenderer.invoke(IPC_CHANNELS.fields.getById, id),
    create: (input) => ipcRenderer.invoke(IPC_CHANNELS.fields.create, input),
    update: (input) => ipcRenderer.invoke(IPC_CHANNELS.fields.update, input),
    remove: (id) => ipcRenderer.invoke(IPC_CHANNELS.fields.remove, id)
  },
  cropVarieties: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.cropVarieties.list),
    getById: (id) => ipcRenderer.invoke(IPC_CHANNELS.cropVarieties.getById, id),
    create: (input) => ipcRenderer.invoke(IPC_CHANNELS.cropVarieties.create, input),
    update: (input) => ipcRenderer.invoke(IPC_CHANNELS.cropVarieties.update, input),
    remove: (id) => ipcRenderer.invoke(IPC_CHANNELS.cropVarieties.remove, id)
  },
  plantingRecords: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.plantingRecords.list),
    getById: (id) => ipcRenderer.invoke(IPC_CHANNELS.plantingRecords.getById, id),
    create: (input) => ipcRenderer.invoke(IPC_CHANNELS.plantingRecords.create, input),
    update: (input) => ipcRenderer.invoke(IPC_CHANNELS.plantingRecords.update, input),
    remove: (id) => ipcRenderer.invoke(IPC_CHANNELS.plantingRecords.remove, id)
  },
  growthRecords: {
    listByPlantingRecordId: (plantingRecordId) =>
      ipcRenderer.invoke(IPC_CHANNELS.growthRecords.listByPlantingRecordId, plantingRecordId),
    getById: (id) => ipcRenderer.invoke(IPC_CHANNELS.growthRecords.getById, id),
    create: (input) => ipcRenderer.invoke(IPC_CHANNELS.growthRecords.create, input),
    update: (input) => ipcRenderer.invoke(IPC_CHANNELS.growthRecords.update, input),
    remove: (id) => ipcRenderer.invoke(IPC_CHANNELS.growthRecords.remove, id)
  },
  operationRecords: {
    listByPlantingRecordId: (plantingRecordId) =>
      ipcRenderer.invoke(IPC_CHANNELS.operationRecords.listByPlantingRecordId, plantingRecordId),
    getById: (id) => ipcRenderer.invoke(IPC_CHANNELS.operationRecords.getById, id),
    create: (input) => ipcRenderer.invoke(IPC_CHANNELS.operationRecords.create, input),
    update: (input) => ipcRenderer.invoke(IPC_CHANNELS.operationRecords.update, input),
    remove: (id) => ipcRenderer.invoke(IPC_CHANNELS.operationRecords.remove, id)
  },
  evaluations: {
    listByPlantingRecordId: (plantingRecordId) =>
      ipcRenderer.invoke(IPC_CHANNELS.evaluations.listByPlantingRecordId, plantingRecordId),
    getById: (id) => ipcRenderer.invoke(IPC_CHANNELS.evaluations.getById, id),
    create: (input) => ipcRenderer.invoke(IPC_CHANNELS.evaluations.create, input),
    update: (input) => ipcRenderer.invoke(IPC_CHANNELS.evaluations.update, input),
    remove: (id) => ipcRenderer.invoke(IPC_CHANNELS.evaluations.remove, id)
  },
  knowledgeItems: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.knowledgeItems.list),
    getById: (id) => ipcRenderer.invoke(IPC_CHANNELS.knowledgeItems.getById, id),
    create: (input) => ipcRenderer.invoke(IPC_CHANNELS.knowledgeItems.create, input),
    update: (input) => ipcRenderer.invoke(IPC_CHANNELS.knowledgeItems.update, input),
    remove: (id) => ipcRenderer.invoke(IPC_CHANNELS.knowledgeItems.remove, id)
  },
  decisions: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.decisions.list),
    getById: (id) => ipcRenderer.invoke(IPC_CHANNELS.decisions.getById, id),
    create: (input) => ipcRenderer.invoke(IPC_CHANNELS.decisions.create, input),
    update: (input) => ipcRenderer.invoke(IPC_CHANNELS.decisions.update, input),
    remove: (id) => ipcRenderer.invoke(IPC_CHANNELS.decisions.remove, id)
  },
  appSettings: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.appSettings.list),
    getById: (id) => ipcRenderer.invoke(IPC_CHANNELS.appSettings.getById, id),
    create: (input) => ipcRenderer.invoke(IPC_CHANNELS.appSettings.create, input),
    update: (input) => ipcRenderer.invoke(IPC_CHANNELS.appSettings.update, input),
    remove: (id) => ipcRenderer.invoke(IPC_CHANNELS.appSettings.remove, id)
  },
  modelParameters: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.modelParameters.list),
    getById: (id) => ipcRenderer.invoke(IPC_CHANNELS.modelParameters.getById, id),
    create: (input) => ipcRenderer.invoke(IPC_CHANNELS.modelParameters.create, input),
    update: (input) => ipcRenderer.invoke(IPC_CHANNELS.modelParameters.update, input),
    remove: (id) => ipcRenderer.invoke(IPC_CHANNELS.modelParameters.remove, id),
    resetToDefault: (input) => ipcRenderer.invoke(IPC_CHANNELS.modelParameters.resetToDefault, input)
  },
  growthStageObservations: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.growthStageObservations.list),
    listByPlantingRecordId: (plantingRecordId) =>
      ipcRenderer.invoke(IPC_CHANNELS.growthStageObservations.listByPlantingRecordId, plantingRecordId),
    getById: (id) => ipcRenderer.invoke(IPC_CHANNELS.growthStageObservations.getById, id),
    create: (input) => ipcRenderer.invoke(IPC_CHANNELS.growthStageObservations.create, input),
    update: (input) => ipcRenderer.invoke(IPC_CHANNELS.growthStageObservations.update, input),
    remove: (id) => ipcRenderer.invoke(IPC_CHANNELS.growthStageObservations.remove, id)
  },
  parameterAdjustmentRecords: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.parameterAdjustmentRecords.list),
    listByParameterId: (parameterId) =>
      ipcRenderer.invoke(IPC_CHANNELS.parameterAdjustmentRecords.listByParameterId, parameterId)
  }
}

contextBridge.exposeInMainWorld('cropModeling', cropModelingApi)
