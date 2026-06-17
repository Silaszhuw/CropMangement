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
  }
}
