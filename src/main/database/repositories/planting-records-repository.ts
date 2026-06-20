/** 种植记录数据访问层：提供种植记录的 CRUD 操作 */
import Database from 'better-sqlite3'
import type { PlantingRecord } from '../../../shared/types/database'
import { BaseRepository } from './base-repository'

interface PlantingRecordRow {
  id: number
  field_id: number
  variety_id: number
  year: number
  season: string
  planting_date: string
  expected_harvest_date: string | null
  actual_harvest_date: string | null
  planting_density: number | null
  row_spacing: number | null
  plant_spacing: number | null
  status: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CreatePlantingRecordInput {
  fieldId: number
  varietyId: number
  year: number
  season: string
  plantingDate: string
  expectedHarvestDate?: string | null
  actualHarvestDate?: string | null
  plantingDensity?: number | null
  rowSpacing?: number | null
  plantSpacing?: number | null
  status?: string
  notes?: string | null
}

export interface UpdatePlantingRecordInput extends CreatePlantingRecordInput {
  id: number
}

function mapPlantingRecord(row: PlantingRecordRow): PlantingRecord {
  return {
    id: row.id,
    fieldId: row.field_id,
    varietyId: row.variety_id,
    year: row.year,
    season: row.season,
    plantingDate: row.planting_date,
    expectedHarvestDate: row.expected_harvest_date,
    actualHarvestDate: row.actual_harvest_date,
    plantingDensity: row.planting_density,
    rowSpacing: row.row_spacing,
    plantSpacing: row.plant_spacing,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export class PlantingRecordsRepository extends BaseRepository {
  constructor(database: Database.Database) {
    super(database)
  }

  /**
   * 查询所有种植记录
   * @returns 种植记录实体数组，按更新时间和 ID 倒序排列
   */
  findAll(): PlantingRecord[] {
    const rows = this.database
      .prepare<[], PlantingRecordRow>('SELECT * FROM planting_records ORDER BY updated_at DESC, id DESC')
      .all()

    return rows.map(mapPlantingRecord)
  }

  /**
   * 根据 ID 查询种植记录
   * @param id 记录ID
   * @returns 种植记录实体，如果不存在则返回 null
   */
  findById(id: number): PlantingRecord | null {
    const row = this.database
      .prepare<[number], PlantingRecordRow>('SELECT * FROM planting_records WHERE id = ?')
      .get(id)

    return row ? mapPlantingRecord(row) : null
  }

  /**
   * 创建种植记录
   * @param input 创建输入数据，status 默认为 'planning'
   * @returns 新创建的种植记录实体
   * @throws 如果创建失败则抛出错误
   */
  create(input: CreatePlantingRecordInput): PlantingRecord {
    const result = this.database
      .prepare(
        `INSERT INTO planting_records (
          field_id,
          variety_id,
          year,
          season,
          planting_date,
          expected_harvest_date,
          actual_harvest_date,
          planting_density,
          row_spacing,
          plant_spacing,
          status,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        input.fieldId,
        input.varietyId,
        input.year,
        input.season,
        input.plantingDate,
        input.expectedHarvestDate ?? null,
        input.actualHarvestDate ?? null,
        input.plantingDensity ?? null,
        input.rowSpacing ?? null,
        input.plantSpacing ?? null,
        input.status ?? 'planning',
        input.notes ?? null
      )

    const created = this.findById(Number(result.lastInsertRowid))
    if (!created) {
      throw new Error('Failed to create planting record.')
    }

    return created
  }

  /**
   * 更新种植记录
   * @param input 更新输入数据
   * @returns 更新后的种植记录实体
   * @throws 如果更新后未找到记录则抛出错误
   */
  update(input: UpdatePlantingRecordInput): PlantingRecord {
    this.database
      .prepare(
        `UPDATE planting_records SET
          field_id = ?,
          variety_id = ?,
          year = ?,
          season = ?,
          planting_date = ?,
          expected_harvest_date = ?,
          actual_harvest_date = ?,
          planting_density = ?,
          row_spacing = ?,
          plant_spacing = ?,
          status = ?,
          notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`
      )
      .run(
        input.fieldId,
        input.varietyId,
        input.year,
        input.season,
        input.plantingDate,
        input.expectedHarvestDate ?? null,
        input.actualHarvestDate ?? null,
        input.plantingDensity ?? null,
        input.rowSpacing ?? null,
        input.plantSpacing ?? null,
        input.status ?? 'planning',
        input.notes ?? null,
        input.id
      )

    const updated = this.findById(input.id)
    if (!updated) {
      throw new Error(`Planting record ${input.id} not found after update.`)
    }

    return updated
  }

  /**
   * 删除种植记录
   * @param id 记录ID
   */
  delete(id: number): void {
    this.database.prepare('DELETE FROM planting_records WHERE id = ?').run(id)
  }
}
