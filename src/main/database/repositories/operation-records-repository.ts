/** 操作记录数据访问层：提供田间操作记录的 CRUD 操作 */
import Database from 'better-sqlite3'
import type { OperationRecord } from '../../../shared/types/database'
import { BaseRepository } from './base-repository'

interface OperationRecordRow {
  id: number
  planting_record_id: number
  operation_type: string
  operation_date: string
  details: string | null
  cost: number | null
  operator: string | null
  photo_paths: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CreateOperationRecordInput {
  plantingRecordId: number
  operationType: string
  operationDate: string
  details?: string | null
  cost?: number | null
  operator?: string | null
  photoPaths?: string | null
  notes?: string | null
}

export interface UpdateOperationRecordInput extends CreateOperationRecordInput {
  id: number
}

function mapOperationRecord(row: OperationRecordRow): OperationRecord {
  return {
    id: row.id,
    plantingRecordId: row.planting_record_id,
    operationType: row.operation_type,
    operationDate: row.operation_date,
    details: row.details,
    cost: row.cost,
    operator: row.operator,
    photoPaths: row.photo_paths,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export class OperationRecordsRepository extends BaseRepository {
  constructor(database: Database.Database) {
    super(database)
  }

  /**
   * 根据种植记录 ID 查询操作记录列表
   * @param plantingRecordId 种植记录ID
   * @returns 操作记录列表，按操作日期降序、ID 降序排列
   */
  findAllByPlantingRecordId(plantingRecordId: number): OperationRecord[] {
    const rows = this.database
      .prepare<[number], OperationRecordRow>(
        'SELECT * FROM operation_records WHERE planting_record_id = ? ORDER BY operation_date DESC, id DESC'
      )
      .all(plantingRecordId)

    return rows.map(mapOperationRecord)
  }

  /**
   * 根据 ID 查询操作记录
   * @param id 记录ID
   * @returns 操作记录对象，如果不存在则返回 null
   */
  findById(id: number): OperationRecord | null {
    const row = this.database
      .prepare<[number], OperationRecordRow>('SELECT * FROM operation_records WHERE id = ?')
      .get(id)

    return row ? mapOperationRecord(row) : null
  }

  /**
   * 创建操作记录
   * @param input 创建输入数据
   * @returns 创建的操作记录对象
   * @throws 如果创建失败则抛出错误
   */
  create(input: CreateOperationRecordInput): OperationRecord {
    const result = this.database
      .prepare(
        `INSERT INTO operation_records (
          planting_record_id,
          operation_type,
          operation_date,
          details,
          cost,
          operator,
          photo_paths,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        input.plantingRecordId,
        input.operationType,
        input.operationDate,
        input.details ?? null,
        input.cost ?? null,
        input.operator ?? null,
        input.photoPaths ?? null,
        input.notes ?? null
      )

    const created = this.findById(Number(result.lastInsertRowid))
    if (!created) {
      throw new Error('Failed to create operation record.')
    }

    return created
  }

  /**
   * 更新操作记录
   * @param input 更新输入数据
   * @returns 更新后的操作记录对象
   * @throws 如果记录不存在则抛出错误
   */
  update(input: UpdateOperationRecordInput): OperationRecord {
    this.database
      .prepare(
        `UPDATE operation_records SET
          planting_record_id = ?,
          operation_type = ?,
          operation_date = ?,
          details = ?,
          cost = ?,
          operator = ?,
          photo_paths = ?,
          notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`
      )
      .run(
        input.plantingRecordId,
        input.operationType,
        input.operationDate,
        input.details ?? null,
        input.cost ?? null,
        input.operator ?? null,
        input.photoPaths ?? null,
        input.notes ?? null,
        input.id
      )

    const updated = this.findById(input.id)
    if (!updated) {
      throw new Error(`Operation record ${input.id} not found after update.`)
    }

    return updated
  }

  /**
   * 删除操作记录
   * @param id 记录ID
   */
  delete(id: number): void {
    this.database.prepare('DELETE FROM operation_records WHERE id = ?').run(id)
  }
}
