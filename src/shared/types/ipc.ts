import type { CropVariety, Field, PlantingRecord } from './database'
import type { CreateCropVarietyInput, UpdateCropVarietyInput } from '../../main/database/repositories/crop-varieties-repository'
import type { CreateFieldInput, UpdateFieldInput } from '../../main/database/repositories/fields-repository'
import type {
  CreatePlantingRecordInput,
  UpdatePlantingRecordInput
} from '../../main/database/repositories/planting-records-repository'

export interface IpcSuccessResponse<T> {
  success: true
  data: T
}

export interface IpcErrorResponse {
  success: false
  error: string
}

export type IpcResponse<T> = IpcSuccessResponse<T> | IpcErrorResponse

export interface CropModelingApi {
  version: string
  fields: {
    list: () => Promise<IpcResponse<Field[]>>
    getById: (id: number) => Promise<IpcResponse<Field | null>>
    create: (input: CreateFieldInput) => Promise<IpcResponse<Field>>
    update: (input: UpdateFieldInput) => Promise<IpcResponse<Field>>
    remove: (id: number) => Promise<IpcResponse<void>>
  }
  cropVarieties: {
    list: () => Promise<IpcResponse<CropVariety[]>>
    getById: (id: number) => Promise<IpcResponse<CropVariety | null>>
    create: (input: CreateCropVarietyInput) => Promise<IpcResponse<CropVariety>>
    update: (input: UpdateCropVarietyInput) => Promise<IpcResponse<CropVariety>>
    remove: (id: number) => Promise<IpcResponse<void>>
  }
  plantingRecords: {
    list: () => Promise<IpcResponse<PlantingRecord[]>>
    getById: (id: number) => Promise<IpcResponse<PlantingRecord | null>>
    create: (input: CreatePlantingRecordInput) => Promise<IpcResponse<PlantingRecord>>
    update: (input: UpdatePlantingRecordInput) => Promise<IpcResponse<PlantingRecord>>
    remove: (id: number) => Promise<IpcResponse<void>>
  }
}
