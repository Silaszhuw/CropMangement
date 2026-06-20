/** 生长阶段观测数据访问层：提供生长阶段观测的 CRUD 操作 */
import Database from 'better-sqlite3'
import type { GrowthStageObservation } from '../../../shared/types/database'
import { BaseRepository } from './base-repository'

interface GrowthStageObservationRow {
  id: number
  planting_record_id: number
  stage_code: string
  stage_name: string
  observation_date: string
  days_after_planting: number | null
  accumulated_temperature: number | null
  plant_height: number | null
  leaf_count: number | null
  stem_diameter: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CreateGrowthStageObservationInput {
  plantingRecordId: number
  stageCode: string
  stageName: string
  observationDate: string
  daysAfterPlanting?: number | null
  accumulatedTemperature?: number | null
  plantHeight?: number | null
  leafCount?: number | null
  stemDiameter?: number | null
  notes?: string | null
}

export interface UpdateGrowthStageObservationInput extends CreateGrowthStageObservationInput {
  id: number
}

function mapGrowthStageObservation(row: GrowthStageObservationRow): GrowthStageObservation {
  return {
    id: row.id,
    plantingRecordId: row.planting_record_id,
    stageCode: row.stage_code,
    stageName: row.stage_name,
    observationDate: row.observation_date,
    daysAfterPlanting: row.days_after_planting,
    accumulatedTemperature: row.accumulated_temperature,
    plantHeight: row.plant_height,
    leafCount: row.leaf_count,
    stemDiameter: row.stem_diameter,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export class GrowthStageObservationsRepository extends BaseRepository {
  constructor(database: Database.Database) {
    super(database)
  }

  /**
   * 查询所有生长阶段观测记录
   * @returns 生长阶段观测实体数组，按观测日期和 ID 倒序排列
   */
  findAll(): GrowthStageObservation[] {
    const rows = this.database
      .prepare<[], GrowthStageObservationRow>(
        'SELECT * FROM growth_stage_observations ORDER BY observation_date DESC, id DESC'
      )
      .all()

    return rows.map(mapGrowthStageObservation)
  }

  /**
   * 根据种植记录 ID 查询生长阶段观测记录
   * @param plantingRecordId 种植记录ID
   * @returns 该种植记录关联的所有生长阶段观测实体数组，按观测日期和 ID 倒序排列
   */
  findByPlantingRecordId(plantingRecordId: number): GrowthStageObservation[] {
    const rows = this.database
      .prepare<[number], GrowthStageObservationRow>(
        `SELECT * FROM growth_stage_observations
        WHERE planting_record_id = ?
        ORDER BY observation_date DESC, id DESC`
      )
      .all(plantingRecordId)

    return rows.map(mapGrowthStageObservation)
  }

  /**
   * 根据 ID 查询生长阶段观测记录
   * @param id 记录ID
   * @returns 生长阶段观测实体，如果不存在则返回 null
   */
  findById(id: number): GrowthStageObservation | null {
    const row = this.database
      .prepare<[number], GrowthStageObservationRow>('SELECT * FROM growth_stage_observations WHERE id = ?')
      .get(id)

    return row ? mapGrowthStageObservation(row) : null
  }

  /**
   * 创建生长阶段观测记录
   * @param input 创建输入数据
   * @returns 新创建的生长阶段观测实体
   * @throws 如果创建失败则抛出错误
   */
  create(input: CreateGrowthStageObservationInput): GrowthStageObservation {
    const result = this.database
      .prepare(
        `INSERT INTO growth_stage_observations (
          planting_record_id,
          stage_code,
          stage_name,
          observation_date,
          days_after_planting,
          accumulated_temperature,
          plant_height,
          leaf_count,
          stem_diameter,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        input.plantingRecordId,
        input.stageCode,
        input.stageName,
        input.observationDate,
        input.daysAfterPlanting ?? null,
        input.accumulatedTemperature ?? null,
        input.plantHeight ?? null,
        input.leafCount ?? null,
        input.stemDiameter ?? null,
        input.notes ?? null
      )

    const created = this.findById(Number(result.lastInsertRowid))
    if (!created) {
      throw new Error('Failed to create growth stage observation.')
    }

    return created
  }

  /**
   * 更新生长阶段观测记录
   * @param input 更新输入数据
   * @returns 更新后的生长阶段观测实体
   * @throws 如果更新后未找到记录则抛出错误
   */
  update(input: UpdateGrowthStageObservationInput): GrowthStageObservation {
    this.database
      .prepare(
        `UPDATE growth_stage_observations SET
          planting_record_id = ?,
          stage_code = ?,
          stage_name = ?,
          observation_date = ?,
          days_after_planting = ?,
          accumulated_temperature = ?,
          plant_height = ?,
          leaf_count = ?,
          stem_diameter = ?,
          notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`
      )
      .run(
        input.plantingRecordId,
        input.stageCode,
        input.stageName,
        input.observationDate,
        input.daysAfterPlanting ?? null,
        input.accumulatedTemperature ?? null,
        input.plantHeight ?? null,
        input.leafCount ?? null,
        input.stemDiameter ?? null,
        input.notes ?? null,
        input.id
      )

    const updated = this.findById(input.id)
    if (!updated) {
      throw new Error(`Growth stage observation ${input.id} not found after update.`)
    }

    return updated
  }

  /**
   * 删除生长阶段观测记录
   * @param id 记录ID
   */
  delete(id: number): void {
    this.database.prepare('DELETE FROM growth_stage_observations WHERE id = ?').run(id)
  }
}
