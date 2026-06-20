/** 数据库实体类型定义：定义所有数据库表对应的 TypeScript 接口 */
export interface TimestampedEntity {
  id: number
  createdAt: string
  updatedAt: string
}

export interface Field extends TimestampedEntity {
  name: string
  area: number
  locationProvince: string | null
  locationCity: string | null
  locationCounty: string | null
  locationDetail: string | null
  coordinates: string | null
  soilType: string | null
  soilPh: number | null
  soilOrganicMatter: number | null
  notes: string | null
}

export interface CropVariety extends TimestampedEntity {
  name: string
  code: string | null
  type: string
  growthPeriod: number | null
  yieldPotential: number | null
  diseaseResistance: string | null
  description: string | null
  isActive: boolean
}

export interface PlantingRecord extends TimestampedEntity {
  fieldId: number
  varietyId: number
  year: number
  season: string
  plantingDate: string
  expectedHarvestDate: string | null
  actualHarvestDate: string | null
  plantingDensity: number | null
  rowSpacing: number | null
  plantSpacing: number | null
  status: string
  notes: string | null
}

export interface GrowthRecord extends TimestampedEntity {
  plantingRecordId: number
  recordDate: string
  growthStage: string
  plantHeight: number | null
  leafCount: number | null
  leafColor: string | null
  diseaseStatus: string | null
  pestStatus: string | null
  soilMoisture: number | null
  weatherTemperatureAvg: number | null
  weatherRainfall: number | null
  photoPaths: string | null
  notes: string | null
}

export interface OperationRecord extends TimestampedEntity {
  plantingRecordId: number
  operationType: string
  operationDate: string
  details: string | null
  cost: number | null
  operator: string | null
  photoPaths: string | null
  notes: string | null
}

export interface KnowledgeItem extends TimestampedEntity {
  category: string
  title: string
  content: string
  tags: string | null
  source: string | null
  isActive: boolean
}

export interface Decision extends TimestampedEntity {
  fieldId: number | null
  plantingRecordId: number | null
  decisionType: string
  decisionCategory: string
  decisionDate: string
  title: string
  content: string
  basisSummary: string | null
  recommendedActions: string | null
  status: string
  userFeedback: string | null
}

export interface Evaluation extends TimestampedEntity {
  plantingRecordId: number
  evaluationDate: string
  evaluationType: string
  actualYield: number | null
  totalCost: number | null
  totalIncome: number | null
  netProfit: number | null
  overallScore: number | null
  improvementSuggestions: string | null
  notes: string | null
}

export interface AppSetting {
  id: number
  configKey: string
  configValue: string
  description: string | null
  updatedAt: string
}

export interface ModelParameter {
  id: number
  parameterGroup: string
  parameterName: string
  parameterKey: string
  defaultValue: number
  currentValue: number
  minValue: number | null
  maxValue: number | null
  unit: string | null
  description: string | null
  updatedAt: string
}

export interface GrowthStageObservation extends TimestampedEntity {
  plantingRecordId: number
  stageCode: string
  stageName: string
  observationDate: string
  daysAfterPlanting: number | null
  accumulatedTemperature: number | null
  plantHeight: number | null
  leafCount: number | null
  stemDiameter: number | null
  notes: string | null
}

export interface ParameterAdjustmentRecord {
  id: number
  parameterId: number
  oldValue: number
  newValue: number
  adjustmentReason: string | null
  adjustedBy: string | null
  adjustedAt: string
}
