/** IPC 客户端服务：封装渲染进程与主进程的通信接口 */
import type { CropModelingApi } from '../../../shared/types/ipc'

function fallbackApi(): CropModelingApi {
  return {
    version: '0.1.0',
    fields: {
      list: async () => ({ success: false, error: 'Preload API is not available.' }),
      getById: async () => ({ success: false, error: 'Preload API is not available.' }),
      create: async () => ({ success: false, error: 'Preload API is not available.' }),
      update: async () => ({ success: false, error: 'Preload API is not available.' }),
      remove: async () => ({ success: false, error: 'Preload API is not available.' })
    },
    cropVarieties: {
      list: async () => ({ success: false, error: 'Preload API is not available.' }),
      getById: async () => ({ success: false, error: 'Preload API is not available.' }),
      create: async () => ({ success: false, error: 'Preload API is not available.' }),
      update: async () => ({ success: false, error: 'Preload API is not available.' }),
      remove: async () => ({ success: false, error: 'Preload API is not available.' })
    },
    plantingRecords: {
      list: async () => ({ success: false, error: 'Preload API is not available.' }),
      getById: async () => ({ success: false, error: 'Preload API is not available.' }),
      create: async () => ({ success: false, error: 'Preload API is not available.' }),
      update: async () => ({ success: false, error: 'Preload API is not available.' }),
      remove: async () => ({ success: false, error: 'Preload API is not available.' })
    },
    growthRecords: {
      listByPlantingRecordId: async () => ({ success: false, error: 'Preload API is not available.' }),
      getById: async () => ({ success: false, error: 'Preload API is not available.' }),
      create: async () => ({ success: false, error: 'Preload API is not available.' }),
      update: async () => ({ success: false, error: 'Preload API is not available.' }),
      remove: async () => ({ success: false, error: 'Preload API is not available.' })
    },
    operationRecords: {
      listByPlantingRecordId: async () => ({ success: false, error: 'Preload API is not available.' }),
      getById: async () => ({ success: false, error: 'Preload API is not available.' }),
      create: async () => ({ success: false, error: 'Preload API is not available.' }),
      update: async () => ({ success: false, error: 'Preload API is not available.' }),
      remove: async () => ({ success: false, error: 'Preload API is not available.' })
    },
    evaluations: {
      listByPlantingRecordId: async () => ({ success: false, error: 'Preload API is not available.' }),
      getById: async () => ({ success: false, error: 'Preload API is not available.' }),
      create: async () => ({ success: false, error: 'Preload API is not available.' }),
      update: async () => ({ success: false, error: 'Preload API is not available.' }),
      remove: async () => ({ success: false, error: 'Preload API is not available.' })
    },
    knowledgeItems: {
      list: async () => ({ success: false, error: 'Preload API is not available.' }),
      getById: async () => ({ success: false, error: 'Preload API is not available.' }),
      create: async () => ({ success: false, error: 'Preload API is not available.' }),
      update: async () => ({ success: false, error: 'Preload API is not available.' }),
      remove: async () => ({ success: false, error: 'Preload API is not available.' })
    },
    decisions: {
      list: async () => ({ success: false, error: 'Preload API is not available.' }),
      getById: async () => ({ success: false, error: 'Preload API is not available.' }),
      create: async () => ({ success: false, error: 'Preload API is not available.' }),
      update: async () => ({ success: false, error: 'Preload API is not available.' }),
      remove: async () => ({ success: false, error: 'Preload API is not available.' })
    },
    appSettings: {
      list: async () => ({ success: false, error: 'Preload API is not available.' }),
      getById: async () => ({ success: false, error: 'Preload API is not available.' }),
      create: async () => ({ success: false, error: 'Preload API is not available.' }),
      update: async () => ({ success: false, error: 'Preload API is not available.' }),
      remove: async () => ({ success: false, error: 'Preload API is not available.' })
    },
    modelParameters: {
      list: async () => ({ success: false, error: 'Preload API is not available.' }),
      getById: async () => ({ success: false, error: 'Preload API is not available.' }),
      create: async () => ({ success: false, error: 'Preload API is not available.' }),
      update: async () => ({ success: false, error: 'Preload API is not available.' }),
      remove: async () => ({ success: false, error: 'Preload API is not available.' }),
      resetToDefault: async () => ({ success: false, error: 'Preload API is not available.' })
    },
    growthStageObservations: {
      list: async () => ({ success: false, error: 'Preload API is not available.' }),
      listByPlantingRecordId: async () => ({ success: false, error: 'Preload API is not available.' }),
      getById: async () => ({ success: false, error: 'Preload API is not available.' }),
      create: async () => ({ success: false, error: 'Preload API is not available.' }),
      update: async () => ({ success: false, error: 'Preload API is not available.' }),
      remove: async () => ({ success: false, error: 'Preload API is not available.' })
    },
    parameterAdjustmentRecords: {
      list: async () => ({ success: false, error: 'Preload API is not available.' }),
      listByParameterId: async () => ({ success: false, error: 'Preload API is not available.' })
    }
  }
}

function assertApi(): CropModelingApi {
  return window.cropModeling ?? fallbackApi()
}

export const cropModelingApi = {
  get version() {
    return assertApi().version
  },
  fields: {
    list: () => assertApi().fields.list(),
    getById: (id: number) => assertApi().fields.getById(id),
    create: (input: Parameters<CropModelingApi['fields']['create']>[0]) => assertApi().fields.create(input),
    update: (input: Parameters<CropModelingApi['fields']['update']>[0]) => assertApi().fields.update(input),
    remove: (id: number) => assertApi().fields.remove(id)
  },
  cropVarieties: {
    list: () => assertApi().cropVarieties.list(),
    getById: (id: number) => assertApi().cropVarieties.getById(id),
    create: (input: Parameters<CropModelingApi['cropVarieties']['create']>[0]) =>
      assertApi().cropVarieties.create(input),
    update: (input: Parameters<CropModelingApi['cropVarieties']['update']>[0]) =>
      assertApi().cropVarieties.update(input),
    remove: (id: number) => assertApi().cropVarieties.remove(id)
  },
  plantingRecords: {
    list: () => assertApi().plantingRecords.list(),
    getById: (id: number) => assertApi().plantingRecords.getById(id),
    create: (input: Parameters<CropModelingApi['plantingRecords']['create']>[0]) =>
      assertApi().plantingRecords.create(input),
    update: (input: Parameters<CropModelingApi['plantingRecords']['update']>[0]) =>
      assertApi().plantingRecords.update(input),
    remove: (id: number) => assertApi().plantingRecords.remove(id)
  },
  growthRecords: {
    listByPlantingRecordId: (plantingRecordId: number) => assertApi().growthRecords.listByPlantingRecordId(plantingRecordId),
    getById: (id: number) => assertApi().growthRecords.getById(id),
    create: (input: Parameters<CropModelingApi['growthRecords']['create']>[0]) => assertApi().growthRecords.create(input),
    update: (input: Parameters<CropModelingApi['growthRecords']['update']>[0]) => assertApi().growthRecords.update(input),
    remove: (id: number) => assertApi().growthRecords.remove(id)
  },
  operationRecords: {
    listByPlantingRecordId: (plantingRecordId: number) =>
      assertApi().operationRecords.listByPlantingRecordId(plantingRecordId),
    getById: (id: number) => assertApi().operationRecords.getById(id),
    create: (input: Parameters<CropModelingApi['operationRecords']['create']>[0]) =>
      assertApi().operationRecords.create(input),
    update: (input: Parameters<CropModelingApi['operationRecords']['update']>[0]) =>
      assertApi().operationRecords.update(input),
    remove: (id: number) => assertApi().operationRecords.remove(id)
  },
  evaluations: {
    listByPlantingRecordId: (plantingRecordId: number) => assertApi().evaluations.listByPlantingRecordId(plantingRecordId),
    getById: (id: number) => assertApi().evaluations.getById(id),
    create: (input: Parameters<CropModelingApi['evaluations']['create']>[0]) => assertApi().evaluations.create(input),
    update: (input: Parameters<CropModelingApi['evaluations']['update']>[0]) => assertApi().evaluations.update(input),
    remove: (id: number) => assertApi().evaluations.remove(id)
  },
  knowledgeItems: {
    list: () => assertApi().knowledgeItems.list(),
    getById: (id: number) => assertApi().knowledgeItems.getById(id),
    create: (input: Parameters<CropModelingApi['knowledgeItems']['create']>[0]) => assertApi().knowledgeItems.create(input),
    update: (input: Parameters<CropModelingApi['knowledgeItems']['update']>[0]) => assertApi().knowledgeItems.update(input),
    remove: (id: number) => assertApi().knowledgeItems.remove(id)
  },
  decisions: {
    list: () => assertApi().decisions.list(),
    getById: (id: number) => assertApi().decisions.getById(id),
    create: (input: Parameters<CropModelingApi['decisions']['create']>[0]) => assertApi().decisions.create(input),
    update: (input: Parameters<CropModelingApi['decisions']['update']>[0]) => assertApi().decisions.update(input),
    remove: (id: number) => assertApi().decisions.remove(id)
  },
  appSettings: {
    list: () => assertApi().appSettings.list(),
    getById: (id: number) => assertApi().appSettings.getById(id),
    create: (input: Parameters<CropModelingApi['appSettings']['create']>[0]) => assertApi().appSettings.create(input),
    update: (input: Parameters<CropModelingApi['appSettings']['update']>[0]) => assertApi().appSettings.update(input),
    remove: (id: number) => assertApi().appSettings.remove(id)
  },
  modelParameters: {
    list: () => assertApi().modelParameters.list(),
    getById: (id: number) => assertApi().modelParameters.getById(id),
    create: (input: Parameters<CropModelingApi['modelParameters']['create']>[0]) =>
      assertApi().modelParameters.create(input),
    update: (input: Parameters<CropModelingApi['modelParameters']['update']>[0]) =>
      assertApi().modelParameters.update(input),
    remove: (id: number) => assertApi().modelParameters.remove(id),
    resetToDefault: (input: Parameters<CropModelingApi['modelParameters']['resetToDefault']>[0]) =>
      assertApi().modelParameters.resetToDefault(input)
  },
  growthStageObservations: {
    list: () => assertApi().growthStageObservations.list(),
    listByPlantingRecordId: (plantingRecordId: number) =>
      assertApi().growthStageObservations.listByPlantingRecordId(plantingRecordId),
    getById: (id: number) => assertApi().growthStageObservations.getById(id),
    create: (input: Parameters<CropModelingApi['growthStageObservations']['create']>[0]) =>
      assertApi().growthStageObservations.create(input),
    update: (input: Parameters<CropModelingApi['growthStageObservations']['update']>[0]) =>
      assertApi().growthStageObservations.update(input),
    remove: (id: number) => assertApi().growthStageObservations.remove(id)
  },
  parameterAdjustmentRecords: {
    list: () => assertApi().parameterAdjustmentRecords.list(),
    listByParameterId: (parameterId: number) => assertApi().parameterAdjustmentRecords.listByParameterId(parameterId)
  }
}
