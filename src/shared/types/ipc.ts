/** IPC 通信类型定义：定义主进程与渲染进程通信的接口和数据结构 */
import type {
  AppSetting,
  CropVariety,
  Decision,
  Evaluation,
  Field,
  GrowthStageObservation,
  GrowthRecord,
  KnowledgeItem,
  ModelParameter,
  OperationRecord,
  ParameterAdjustmentRecord,
  PlantingRecord
} from './database'
import type {
  CreateAppSettingInput,
  UpdateAppSettingInput
} from '../../main/database/repositories/app-settings-repository'
import type {
  CreateCropVarietyInput,
  UpdateCropVarietyInput
} from '../../main/database/repositories/crop-varieties-repository'
import type {
  CreateDecisionInput,
  UpdateDecisionInput
} from '../../main/database/repositories/decisions-repository'
import type {
  CreateEvaluationInput,
  UpdateEvaluationInput
} from '../../main/database/repositories/evaluations-repository'
import type { CreateFieldInput, UpdateFieldInput } from '../../main/database/repositories/fields-repository'
import type {
  CreateGrowthRecordInput,
  UpdateGrowthRecordInput
} from '../../main/database/repositories/growth-records-repository'
import type {
  CreateKnowledgeItemInput,
  UpdateKnowledgeItemInput
} from '../../main/database/repositories/knowledge-items-repository'
import type {
  CreateOperationRecordInput,
  UpdateOperationRecordInput
} from '../../main/database/repositories/operation-records-repository'
import type {
  CreateGrowthStageObservationInput,
  UpdateGrowthStageObservationInput
} from '../../main/database/repositories/growth-stage-observations-repository'
import type {
  CreateModelParameterInput,
  ResetModelParameterInput,
  UpdateModelParameterInput
} from '../../main/database/repositories/model-parameters-repository'
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
  growthRecords: {
    listByPlantingRecordId: (plantingRecordId: number) => Promise<IpcResponse<GrowthRecord[]>>
    getById: (id: number) => Promise<IpcResponse<GrowthRecord | null>>
    create: (input: CreateGrowthRecordInput) => Promise<IpcResponse<GrowthRecord>>
    update: (input: UpdateGrowthRecordInput) => Promise<IpcResponse<GrowthRecord>>
    remove: (id: number) => Promise<IpcResponse<void>>
  }
  operationRecords: {
    listByPlantingRecordId: (plantingRecordId: number) => Promise<IpcResponse<OperationRecord[]>>
    getById: (id: number) => Promise<IpcResponse<OperationRecord | null>>
    create: (input: CreateOperationRecordInput) => Promise<IpcResponse<OperationRecord>>
    update: (input: UpdateOperationRecordInput) => Promise<IpcResponse<OperationRecord>>
    remove: (id: number) => Promise<IpcResponse<void>>
  }
  evaluations: {
    listByPlantingRecordId: (plantingRecordId: number) => Promise<IpcResponse<Evaluation[]>>
    getById: (id: number) => Promise<IpcResponse<Evaluation | null>>
    create: (input: CreateEvaluationInput) => Promise<IpcResponse<Evaluation>>
    update: (input: UpdateEvaluationInput) => Promise<IpcResponse<Evaluation>>
    remove: (id: number) => Promise<IpcResponse<void>>
  }
  knowledgeItems: {
    list: () => Promise<IpcResponse<KnowledgeItem[]>>
    getById: (id: number) => Promise<IpcResponse<KnowledgeItem | null>>
    create: (input: CreateKnowledgeItemInput) => Promise<IpcResponse<KnowledgeItem>>
    update: (input: UpdateKnowledgeItemInput) => Promise<IpcResponse<KnowledgeItem>>
    remove: (id: number) => Promise<IpcResponse<void>>
  }
  decisions: {
    list: () => Promise<IpcResponse<Decision[]>>
    getById: (id: number) => Promise<IpcResponse<Decision | null>>
    create: (input: CreateDecisionInput) => Promise<IpcResponse<Decision>>
    update: (input: UpdateDecisionInput) => Promise<IpcResponse<Decision>>
    remove: (id: number) => Promise<IpcResponse<void>>
  }
  appSettings: {
    list: () => Promise<IpcResponse<AppSetting[]>>
    getById: (id: number) => Promise<IpcResponse<AppSetting | null>>
    create: (input: CreateAppSettingInput) => Promise<IpcResponse<AppSetting>>
    update: (input: UpdateAppSettingInput) => Promise<IpcResponse<AppSetting>>
    remove: (id: number) => Promise<IpcResponse<void>>
  }
  modelParameters: {
    list: () => Promise<IpcResponse<ModelParameter[]>>
    getById: (id: number) => Promise<IpcResponse<ModelParameter | null>>
    create: (input: CreateModelParameterInput) => Promise<IpcResponse<ModelParameter>>
    update: (input: UpdateModelParameterInput) => Promise<IpcResponse<ModelParameter>>
    remove: (id: number) => Promise<IpcResponse<void>>
    resetToDefault: (input: ResetModelParameterInput) => Promise<IpcResponse<ModelParameter>>
  }
  growthStageObservations: {
    list: () => Promise<IpcResponse<GrowthStageObservation[]>>
    listByPlantingRecordId: (plantingRecordId: number) => Promise<IpcResponse<GrowthStageObservation[]>>
    getById: (id: number) => Promise<IpcResponse<GrowthStageObservation | null>>
    create: (input: CreateGrowthStageObservationInput) => Promise<IpcResponse<GrowthStageObservation>>
    update: (input: UpdateGrowthStageObservationInput) => Promise<IpcResponse<GrowthStageObservation>>
    remove: (id: number) => Promise<IpcResponse<void>>
  }
  parameterAdjustmentRecords: {
    list: () => Promise<IpcResponse<ParameterAdjustmentRecord[]>>
    listByParameterId: (parameterId: number) => Promise<IpcResponse<ParameterAdjustmentRecord[]>>
  }
}
