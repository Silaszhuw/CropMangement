/** 生长模拟服务：提供作物生长模拟和预测计算功能 */
import dayjs from 'dayjs'
import type {
  CropVariety,
  Field,
  GrowthRecord,
  GrowthStageObservation,
  ModelParameter,
  PlantingRecord
} from '../../../shared/types/database'

/** 生育期阶段定义 */
interface StageDefinition {
  /** 生育期代码（如VE、V6、VT等） */
  code: string
  /** 生育期名称（如出苗期、六叶期等） */
  name: string
  /** 对应的积温参数键名，出苗期为null */
  gddKey: string | null
}

/** 生长过程各阶段结果 */
export interface GrowthProcessStageResult {
  /** 生育期代码 */
  code: string
  /** 生育期名称 */
  name: string
  /** 到达该阶段所需累积有效积温（°C·d） */
  requiredGdd: number
  /** 预估所需天数 */
  estimatedDays: number
  /** 该阶段开始日期（YYYY-MM-DD） */
  startDate: string
  /** 该阶段结束日期（YYYY-MM-DD） */
  endDate: string
  /** 从播种到该阶段结束的累积有效积温（°C·d） */
  cumulativeGdd: number
  /** 阶段状态：模拟、观测或预测 */
  status: 'simulated' | 'observed' | 'predicted'
}

/** 生长模拟结果 */
export interface GrowthSimulationResult {
  /** 日均有效积温（°C·d） */
  averageDailyGdd: number
  /** 土壤适宜性评估结果 */
  soilSuitability: '适宜' | '临界' | '偏离'
  /** 模拟结果摘要 */
  summary: string
  /** 注意事项列表 */
  notes: string[]
  /** 各生育期阶段详细结果 */
  stages: GrowthProcessStageResult[]
}

/** 生长预测结果 */
export interface GrowthPredictionResult {
  /** 日均有效积温（°C·d） */
  averageDailyGdd: number
  /** 当前生育期阶段 */
  currentStage: string
  /** 下一个生育期阶段，如已成熟则为null */
  nextStage: string | null
  /** 预测下一阶段到达日期（YYYY-MM-DD），如已成熟则为null */
  predictedNextStageDate: string | null
  /** 预测成熟日期（YYYY-MM-DD） */
  predictedMaturityDate: string | null
  /** 预测可信度，基于观测数据量评估 */
  confidence: '低' | '中' | '较高'
  /** 注意事项列表 */
  notes: string[]
  /** 各生育期阶段详细结果 */
  stages: GrowthProcessStageResult[]
}

/** 玉米生育期阶段定义：从出苗到成熟的完整生育进程 */
const STAGES: StageDefinition[] = [
  { code: 'VE', name: '出苗期', gddKey: null },
  { code: 'V6', name: '六叶期', gddKey: 'variety.ve_v6_gdd' },
  { code: 'VT', name: '抽雄期', gddKey: 'variety.v6_vt_gdd' },
  { code: 'R1', name: '吐丝期', gddKey: 'variety.vt_r1_gdd' },
  { code: 'R3', name: '乳熟期', gddKey: 'variety.r1_r3_gdd' },
  { code: 'R6', name: '成熟期', gddKey: 'variety.r3_r6_gdd' }
]

/**
 * 从参数列表中获取指定键的当前值
 * @param parameters 模型参数列表
 * @param key 参数键名
 * @param fallback 未找到参数时的默认值
 * @returns 参数的当前值，如果未找到则返回默认值
 */
function getParameterValue(parameters: ModelParameter[], key: string, fallback: number): number {
  return parameters.find((item) => item.parameterKey === key)?.currentValue ?? fallback
}

/**
 * 计算日均有效积温（Growing Degree Days）
 * 使用平均温度减去基础温度，结果不低于0.1
 * @param averageTemperature 平均温度（°C）
 * @param parameters 模型参数列表
 * @returns 日均有效积温（°C·d），最小值为0.1
 */
function calculateAverageDailyGdd(averageTemperature: number, parameters: ModelParameter[]): number {
  const baseTemp = getParameterValue(parameters, 'thermal.base_temp', 10)
  return Math.max(averageTemperature - baseTemp, 0.1)
}

/**
 * 根据所需积温和日均有效积温计算预估天数
 * @param requiredGdd 该阶段所需的累计有效积温（°C·d）
 * @param averageDailyGdd 日均有效积温（°C·d）
 * @returns 预估天数。即使积温很小也至少需要1天，因为生育阶段转换不可能在同一天完成
 */
function calculateEstimatedDays(requiredGdd: number, averageDailyGdd: number): number {
  if (requiredGdd <= 0) {
    return 0
  }

  return Math.max(1, Math.ceil(requiredGdd / averageDailyGdd))
}

/**
 * 评估土壤适宜性
 *
 * 评估逻辑：
 * - '适宜'：pH 和有机质均在推荐范围内
 * - '偏离'：pH 和有机质均不在推荐范围内
 * - '临界'：以下任一情况
 *   - 仅一项指标在范围内
 *   - 地块信息缺失
 *   - pH 或有机质数据缺失
 *
 * @param field 地块信息，可能为空
 * @param parameters 模型参数列表，用于获取推荐阈值
 * @returns 适宜性等级
 */
function getSoilSuitability(field: Field | null | undefined, parameters: ModelParameter[]): GrowthSimulationResult['soilSuitability'] {
  if (!field) {
    return '临界'
  }

  const phMin = getParameterValue(parameters, 'soil.ph_min', 6)
  const phMax = getParameterValue(parameters, 'soil.ph_max', 7.5)
  const organicMatter = getParameterValue(parameters, 'soil.organic_matter', 20)

  const ph = field.soilPh
  const om = field.soilOrganicMatter

  if (ph == null || om == null) {
    return '临界'
  }

  const phOkay = ph >= phMin && ph <= phMax
  const omOkay = om >= organicMatter

  if (phOkay && omOkay) {
    return '适宜'
  }

  if (!phOkay && !omOkay) {
    return '偏离'
  }

  return '临界'
}

/**
 * 构建生长模拟结果摘要文本
 * @param variety 品种信息，可能为空
 * @param field 地块信息，可能为空
 * @param maturityDate 预计成熟日期（YYYY-MM-DD格式）
 * @returns 摘要文本，包含地块、品种和预计成熟日期信息
 */
function buildSummary(variety: CropVariety | null | undefined, field: Field | null | undefined, maturityDate: string): string {
  const varietyName = variety?.name ?? '未指定品种'
  const fieldName = field?.name ?? '未指定地块'
  return `${fieldName} 使用 ${varietyName} 的规则化推演结果显示，预计成熟期为 ${maturityDate}。`
}

/**
 * 查找生育期阶段在STAGES数组中的索引
 * 根据生育期代码或名称匹配，代码会转为大写比较
 * @param stageCode 生育期代码（如VE、V6），可选
 * @param stageName 生育期名称（如出苗期、六叶期），可选
 * @returns 生育期在STAGES数组中的索引，未找到返回-1
 */
function findStageIndex(stageCode: string | null | undefined, stageName: string | null | undefined): number {
  const normalizedCode = stageCode?.trim().toUpperCase()
  const normalizedName = stageName?.trim()

  return STAGES.findIndex((stage) => stage.code === normalizedCode || stage.name === normalizedName)
}

/**
 * 构建完整的模拟生育期阶段列表
 * 从播种日期开始，基于日均有效积温计算各阶段的开始和结束日期
 * @param plantingDate 播种日期（YYYY-MM-DD格式）
 * @param averageDailyGdd 日均有效积温（°C·d）
 * @param parameters 模型参数列表，包含各阶段积温需求
 * @returns 各生育期阶段的详细信息数组，状态标记为'simulated'
 */
function buildSimulatedStages(
  plantingDate: string,
  averageDailyGdd: number,
  parameters: ModelParameter[]
): GrowthProcessStageResult[] {
  let cursor = dayjs(plantingDate)
  let cumulativeGdd = 0

  return STAGES.map((stage, index) => {
    // 获取当前阶段所需积温，出苗期（index=0）不需要额外积温
    const requiredGdd = stage.gddKey ? getParameterValue(parameters, stage.gddKey, 0) : 0
    const estimatedDays = index === 0 ? 0 : calculateEstimatedDays(requiredGdd, averageDailyGdd)
    const startDate = cursor.format('YYYY-MM-DD')
    const endDate = index === 0 ? startDate : cursor.add(estimatedDays, 'day').format('YYYY-MM-DD')

    // 累加积温并移动时间游标
    cumulativeGdd += requiredGdd
    cursor = dayjs(endDate)

    return {
      code: stage.code,
      name: stage.name,
      requiredGdd,
      estimatedDays,
      startDate,
      endDate,
      cumulativeGdd,
      status: 'simulated'
    }
  })
}

/**
 * 模拟作物生长过程
 * 基于播种日期、平均温度和模型参数，模拟整个生育期各阶段的开始和结束时间
 * @param input 模拟输入参数
 * @param input.field 地块信息（可选，用于土壤适宜性评估）
 * @param input.variety 品种信息（可选，用于生成摘要）
 * @param input.plantingDate 播种日期（YYYY-MM-DD格式）
 * @param input.averageTemperature 平均温度（°C）
 * @param input.parameters 模型参数列表
 * @returns 生长模拟结果，包含各阶段详情、土壤适宜性和注意事项
 */
export function simulateGrowthProcess(input: {
  field?: Field | null
  variety?: CropVariety | null
  plantingDate: string
  averageTemperature: number
  parameters: ModelParameter[]
}): GrowthSimulationResult {
  const averageDailyGdd = calculateAverageDailyGdd(input.averageTemperature, input.parameters)
  const stages = buildSimulatedStages(input.plantingDate, averageDailyGdd, input.parameters)
  const soilSuitability = getSoilSuitability(input.field, input.parameters)
  const notes = [
    `规则化 v1 采用平均温度 ${input.averageTemperature.toFixed(1)}°C 估算，日均有效积温为 ${averageDailyGdd.toFixed(1)}°C·d。`,
    soilSuitability === '适宜'
      ? '地块土壤指标处于模型适宜区间。'
      : soilSuitability === '临界'
        ? '土壤数据不完整或部分指标处于临界区间，结果应结合人工判断。'
        : '土壤指标偏离推荐区间，建议优先修正土壤管理方案。'
  ]

  return {
    averageDailyGdd,
    soilSuitability,
    summary: buildSummary(input.variety, input.field, stages[stages.length - 1]?.endDate ?? input.plantingDate),
    notes,
    stages
  }
}

/**
 * 预测作物生长过程
 * 结合实际观测数据和生长记录，预测当前生育期状态和未来各阶段到达时间
 * @param input 预测输入参数
 * @param input.plantingRecord 种植记录
 * @param input.field 地块信息（可选）
 * @param input.variety 品种信息（可选）
 * @param input.averageTemperature 平均温度（°C）
 * @param input.parameters 模型参数列表
 * @param input.observations 生育期观测记录列表
 * @param input.growthRecords 生长记录列表
 * @param input.currentDate 当前日期（YYYY-MM-DD格式）
 * @returns 生长预测结果，包含当前阶段、下一阶段预测日期、预测可信度等信息
 */
export function predictGrowthProcess(input: {
  plantingRecord: PlantingRecord
  field?: Field | null
  variety?: CropVariety | null
  averageTemperature: number
  parameters: ModelParameter[]
  observations: GrowthStageObservation[]
  growthRecords: GrowthRecord[]
  currentDate: string
}): GrowthPredictionResult {
  const averageDailyGdd = calculateAverageDailyGdd(input.averageTemperature, input.parameters)
  const baseline = buildSimulatedStages(input.plantingRecord.plantingDate, averageDailyGdd, input.parameters)

  // 找到最新的生育期观测记录和生长记录
  const latestObservation = [...input.observations].sort((a, b) => b.observationDate.localeCompare(a.observationDate))[0] ?? null
  const latestGrowthRecord = [...input.growthRecords].sort((a, b) => b.recordDate.localeCompare(a.recordDate))[0] ?? null

  // 确定当前所处的生育期阶段索引
  const currentStageIndex = latestObservation
    ? findStageIndex(latestObservation.stageCode, latestObservation.stageName)
    : latestGrowthRecord
      ? findStageIndex(null, latestGrowthRecord.growthStage)
      : 0

  const normalizedCurrentStageIndex = currentStageIndex >= 0 ? currentStageIndex : 0
  const currentStage = STAGES[normalizedCurrentStageIndex]?.name ?? '出苗期'
  const nextStageDefinition = STAGES[normalizedCurrentStageIndex + 1] ?? null

  // 更新各阶段状态：已观测、当前观测或待预测
  const stages = baseline.map((stage, index) => {
    if (index < normalizedCurrentStageIndex) {
      // 已经过的阶段标记为已观测
      return {
        ...stage,
        status: 'observed' as const
      }
    }

    if (index === normalizedCurrentStageIndex && latestObservation) {
      // 当前阶段且有观测数据，更新实际结束日期
      return {
        ...stage,
        endDate: latestObservation.observationDate,
        estimatedDays: dayjs(latestObservation.observationDate).diff(dayjs(stage.startDate), 'day'),
        status: 'observed' as const
      }
    }

    // 未来阶段标记为待预测
    return {
      ...stage,
      status: 'predicted' as const
    }
  })

  // 查找下一阶段的预测到达日期
  let predictedNextStageDate: string | null = null
  if (nextStageDefinition) {
    predictedNextStageDate = stages.find((stage) => stage.code === nextStageDefinition.code)?.endDate ?? null
  }

  // 生成预测注意事项
  const notes = [
    latestObservation
      ? `最近一次生育期观测为 ${latestObservation.observationDate} 的 ${latestObservation.stageName}。`
      : '当前缺少生育期观测数据，预测结果主要基于播种日期和默认参数估算。',
    `预测基准日期为 ${input.currentDate}，估算平均温度为 ${input.averageTemperature.toFixed(1)}°C。`
  ]

  // 根据数据量评估预测置信度：
  // - 较高：3个及以上生育期观测记录
  // - 中：至少1个观测记录，或2个及以上生长记录
  // - 低：缺少观测数据，仅基于模型参数估算
  let confidence: GrowthPredictionResult['confidence'] = '低'
  if (input.observations.length >= 3) {
    confidence = '较高'
  } else if (input.observations.length >= 1 || input.growthRecords.length >= 2) {
    confidence = '中'
  }

  return {
    averageDailyGdd,
    currentStage,
    nextStage: nextStageDefinition?.name ?? null,
    predictedNextStageDate,
    predictedMaturityDate: stages[stages.length - 1]?.endDate ?? null,
    confidence,
    notes,
    stages
  }
}
