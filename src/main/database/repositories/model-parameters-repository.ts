/** 模型参数数据访问层：提供模型参数的 CRUD 操作 */
import Database from 'better-sqlite3'
import type { ModelParameter } from '../../../shared/types/database'
import { BaseRepository } from './base-repository'
import { ParameterAdjustmentRecordsRepository } from './parameter-adjustment-records-repository'

/** 数据库模型参数原始行结构 */
interface ModelParameterRow {
  id: number
  parameter_group: string
  parameter_name: string
  parameter_key: string
  default_value: number
  current_value: number
  min_value: number | null
  max_value: number | null
  unit: string | null
  description: string | null
  updated_at: string
}

/** 创建模型参数输入参数 */
export interface CreateModelParameterInput {
  /** 参数分组（如thermal、soil、variety等） */
  parameterGroup: string
  /** 参数名称 */
  parameterName: string
  /** 参数键名（用于程序访问） */
  parameterKey: string
  /** 默认值 */
  defaultValue: number
  /** 当前值 */
  currentValue: number
  /** 最小允许值，可选 */
  minValue?: number | null
  /** 最大允许值，可选 */
  maxValue?: number | null
  /** 单位，可选 */
  unit?: string | null
  /** 描述信息，可选 */
  description?: string | null
}

/** 更新模型参数输入参数 */
export interface UpdateModelParameterInput {
  /** 参数ID */
  id: number
  /** 参数分组，可选 */
  parameterGroup?: string
  /** 参数名称，可选 */
  parameterName?: string
  /** 参数键名，可选 */
  parameterKey?: string
  /** 默认值，可选 */
  defaultValue?: number
  /** 当前值，可选 */
  currentValue?: number
  /** 最小允许值，可选 */
  minValue?: number | null
  /** 最大允许值，可选 */
  maxValue?: number | null
  /** 单位，可选 */
  unit?: string | null
  /** 描述信息，可选 */
  description?: string | null
  /** 调整原因（当currentValue变化时记录），可选 */
  adjustmentReason?: string | null
  /** 调整人（当currentValue变化时记录），可选 */
  adjustedBy?: string | null
}

/** 重置模型参数输入参数 */
export interface ResetModelParameterInput {
  /** 参数ID */
  id: number
  /** 重置原因，可选 */
  adjustmentReason?: string | null
  /** 操作人，可选 */
  adjustedBy?: string | null
}

/**
 * 将数据库行映射为模型参数对象
 * 转换数据库下划线命名为驼峰命名
 * @param row 数据库查询返回的原始行
 * @returns 转换后的模型参数对象
 */
function mapModelParameter(row: ModelParameterRow): ModelParameter {
  return {
    id: row.id,
    parameterGroup: row.parameter_group,
    parameterName: row.parameter_name,
    parameterKey: row.parameter_key,
    defaultValue: row.default_value,
    currentValue: row.current_value,
    minValue: row.min_value,
    maxValue: row.max_value,
    unit: row.unit,
    description: row.description,
    updatedAt: row.updated_at
  }
}

/**
 * 模型参数仓储类
 * 负责模型参数的增删改查操作，并在参数调整时自动记录调整历史
 */
export class ModelParametersRepository extends BaseRepository {
  private readonly adjustmentRecordsRepository: ParameterAdjustmentRecordsRepository

  /**
   * 构造函数
   * @param database better-sqlite3数据库实例
   */
  constructor(database: Database.Database) {
    super(database)
    this.adjustmentRecordsRepository = new ParameterAdjustmentRecordsRepository(database)
  }

  /**
   * 查询所有模型参数
   * 按参数分组和名称排序
   * @returns 所有模型参数的数组
   */
  findAll(): ModelParameter[] {
    const rows = this.database
      .prepare<[], ModelParameterRow>('SELECT * FROM model_parameters ORDER BY parameter_group, parameter_name, id')
      .all()

    return rows.map(mapModelParameter)
  }

  /**
   * 根据ID查询单个模型参数
   * @param id 参数ID
   * @returns 模型参数对象，如果不存在则返回null
   */
  findById(id: number): ModelParameter | null {
    const row = this.database
      .prepare<[number], ModelParameterRow>('SELECT * FROM model_parameters WHERE id = ?')
      .get(id)

    return row ? mapModelParameter(row) : null
  }

  /**
   * 创建新的模型参数
   * @param input 创建参数的输入数据
   * @returns 创建成功的模型参数对象
   * @throws 如果创建后查询失败则抛出错误
   */
  create(input: CreateModelParameterInput): ModelParameter {
    const result = this.database
      .prepare(
        `INSERT INTO model_parameters (
          parameter_group,
          parameter_name,
          parameter_key,
          default_value,
          current_value,
          min_value,
          max_value,
          unit,
          description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        input.parameterGroup,
        input.parameterName,
        input.parameterKey,
        input.defaultValue,
        input.currentValue,
        input.minValue ?? null,
        input.maxValue ?? null,
        input.unit ?? null,
        input.description ?? null
      )

    const created = this.findById(Number(result.lastInsertRowid))
    if (!created) {
      throw new Error('Failed to create model parameter.')
    }

    return created
  }

  /**
   * 更新模型参数（会自动记录调整历史）
   *
   * 重要：当 currentValue 发生变化时，会自动创建参数调整记录到 parameter_adjustment_records 表
   *
   * @param input 更新参数的输入数据，只需提供要修改的字段
   * @returns 更新后的模型参数对象
   * @throws 如果参数不存在或更新后查询失败则抛出错误
   */
  update(input: UpdateModelParameterInput): ModelParameter {
    const existing = this.findById(input.id)
    if (!existing) {
      throw new Error(`Model parameter ${input.id} not found.`)
    }

    const nextCurrentValue = input.currentValue ?? existing.currentValue

    this.database
      .prepare(
        `UPDATE model_parameters SET
          parameter_group = ?,
          parameter_name = ?,
          parameter_key = ?,
          default_value = ?,
          current_value = ?,
          min_value = ?,
          max_value = ?,
          unit = ?,
          description = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`
      )
      .run(
        input.parameterGroup ?? existing.parameterGroup,
        input.parameterName ?? existing.parameterName,
        input.parameterKey ?? existing.parameterKey,
        input.defaultValue ?? existing.defaultValue,
        nextCurrentValue,
        input.minValue !== undefined ? input.minValue : existing.minValue,
        input.maxValue !== undefined ? input.maxValue : existing.maxValue,
        input.unit !== undefined ? input.unit : existing.unit,
        input.description !== undefined ? input.description : existing.description,
        input.id
      )

    // 如果当前值发生变化，记录调整历史
    if (nextCurrentValue !== existing.currentValue) {
      this.adjustmentRecordsRepository.create({
        parameterId: input.id,
        oldValue: existing.currentValue,
        newValue: nextCurrentValue,
        adjustmentReason: input.adjustmentReason ?? '手动调整参数',
        adjustedBy: input.adjustedBy ?? 'system'
      })
    }

    const updated = this.findById(input.id)
    if (!updated) {
      throw new Error(`Model parameter ${input.id} not found after update.`)
    }

    return updated
  }

  /**
   * 删除模型参数
   * @param id 要删除的参数ID
   */
  delete(id: number): void {
    this.database.prepare('DELETE FROM model_parameters WHERE id = ?').run(id)
  }

  /**
   * 将模型参数重置为默认值
   * 会自动创建参数调整记录（如果值确实发生了变化）
   * @param input 重置参数的输入数据
   * @returns 重置后的模型参数对象
   * @throws 如果参数不存在或重置后查询失败则抛出错误
   */
  resetToDefault(input: ResetModelParameterInput): ModelParameter {
    const existing = this.findById(input.id)
    if (!existing) {
      throw new Error(`Model parameter ${input.id} not found.`)
    }

    this.database
      .prepare(
        `UPDATE model_parameters
        SET current_value = default_value, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`
      )
      .run(input.id)

    // 如果当前值与默认值不同，记录重置历史
    if (existing.currentValue !== existing.defaultValue) {
      this.adjustmentRecordsRepository.create({
        parameterId: input.id,
        oldValue: existing.currentValue,
        newValue: existing.defaultValue,
        adjustmentReason: input.adjustmentReason ?? '重置为默认值',
        adjustedBy: input.adjustedBy ?? 'system'
      })
    }

    const updated = this.findById(input.id)
    if (!updated) {
      throw new Error(`Model parameter ${input.id} not found after reset.`)
    }

    return updated
  }
}
