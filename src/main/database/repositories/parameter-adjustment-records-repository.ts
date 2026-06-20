/** 参数调整记录数据访问层：提供参数调整历史的 CRUD 操作 */
import Database from 'better-sqlite3'
import type { ParameterAdjustmentRecord } from '../../../shared/types/database'
import { BaseRepository } from './base-repository'

interface ParameterAdjustmentRecordRow {
  id: number
  parameter_id: number
  old_value: number
  new_value: number
  adjustment_reason: string | null
  adjusted_by: string | null
  adjusted_at: string
}

export interface CreateParameterAdjustmentRecordInput {
  parameterId: number
  oldValue: number
  newValue: number
  adjustmentReason?: string | null
  adjustedBy?: string | null
}

function mapParameterAdjustmentRecord(row: ParameterAdjustmentRecordRow): ParameterAdjustmentRecord {
  return {
    id: row.id,
    parameterId: row.parameter_id,
    oldValue: row.old_value,
    newValue: row.new_value,
    adjustmentReason: row.adjustment_reason,
    adjustedBy: row.adjusted_by,
    adjustedAt: row.adjusted_at
  }
}

export class ParameterAdjustmentRecordsRepository extends BaseRepository {
  constructor(database: Database.Database) {
    super(database)
  }

  /**
   * 查询所有参数调整记录
   * @returns 参数调整记录列表，按调整时间降序、ID 降序排列
   */
  findAll(): ParameterAdjustmentRecord[] {
    const rows = this.database
      .prepare<[], ParameterAdjustmentRecordRow>(
        'SELECT * FROM parameter_adjustment_records ORDER BY adjusted_at DESC, id DESC'
      )
      .all()

    return rows.map(mapParameterAdjustmentRecord)
  }

  /**
   * 根据参数 ID 查询调整记录
   * @param parameterId 模型参数ID
   * @returns 该参数的所有调整记录，按调整时间降序、ID 降序排列
   */
  findByParameterId(parameterId: number): ParameterAdjustmentRecord[] {
    const rows = this.database
      .prepare<[number], ParameterAdjustmentRecordRow>(
        'SELECT * FROM parameter_adjustment_records WHERE parameter_id = ? ORDER BY adjusted_at DESC, id DESC'
      )
      .all(parameterId)

    return rows.map(mapParameterAdjustmentRecord)
  }

  create(input: CreateParameterAdjustmentRecordInput): ParameterAdjustmentRecord {
    const result = this.database
      .prepare(
        `INSERT INTO parameter_adjustment_records (
          parameter_id,
          old_value,
          new_value,
          adjustment_reason,
          adjusted_by
        ) VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        input.parameterId,
        input.oldValue,
        input.newValue,
        input.adjustmentReason ?? null,
        input.adjustedBy ?? null
      )

    const created = this.database
      .prepare<[number], ParameterAdjustmentRecordRow>('SELECT * FROM parameter_adjustment_records WHERE id = ?')
      .get(Number(result.lastInsertRowid))

    if (!created) {
      throw new Error('Failed to create parameter adjustment record.')
    }

    return mapParameterAdjustmentRecord(created)
  }
}
