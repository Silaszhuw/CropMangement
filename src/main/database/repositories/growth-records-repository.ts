/** 生长记录数据访问层：提供生长记录的 CRUD 操作 */
import Database from 'better-sqlite3'
import type { GrowthRecord } from '../../../shared/types/database'
import { BaseRepository } from './base-repository'

interface GrowthRecordRow {
  id: number
  planting_record_id: number
  record_date: string
  growth_stage: string
  plant_height: number | null
  leaf_count: number | null
  leaf_color: string | null
  disease_status: string | null
  pest_status: string | null
  soil_moisture: number | null
  weather_temperature_avg: number | null
  weather_rainfall: number | null
  photo_paths: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CreateGrowthRecordInput {
  plantingRecordId: number
  recordDate: string
  growthStage: string
  plantHeight?: number | null
  leafCount?: number | null
  leafColor?: string | null
  diseaseStatus?: string | null
  pestStatus?: string | null
  soilMoisture?: number | null
  weatherTemperatureAvg?: number | null
  weatherRainfall?: number | null
  photoPaths?: string | null
  notes?: string | null
}

export interface UpdateGrowthRecordInput extends CreateGrowthRecordInput {
  id: number
}

function mapGrowthRecord(row: GrowthRecordRow): GrowthRecord {
  return {
    id: row.id,
    plantingRecordId: row.planting_record_id,
    recordDate: row.record_date,
    growthStage: row.growth_stage,
    plantHeight: row.plant_height,
    leafCount: row.leaf_count,
    leafColor: row.leaf_color,
    diseaseStatus: row.disease_status,
    pestStatus: row.pest_status,
    soilMoisture: row.soil_moisture,
    weatherTemperatureAvg: row.weather_temperature_avg,
    weatherRainfall: row.weather_rainfall,
    photoPaths: row.photo_paths,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export class GrowthRecordsRepository extends BaseRepository {
  constructor(database: Database.Database) {
    super(database)
  }

  /**
   * 根据种植记录 ID 查询生长记录列表
   * @param plantingRecordId 种植记录ID
   * @returns 生长记录列表，按记录日期降序、ID 降序排列
   */
  findAllByPlantingRecordId(plantingRecordId: number): GrowthRecord[] {
    const rows = this.database
      .prepare<[number], GrowthRecordRow>(
        'SELECT * FROM growth_records WHERE planting_record_id = ? ORDER BY record_date DESC, id DESC'
      )
      .all(plantingRecordId)

    return rows.map(mapGrowthRecord)
  }

  /**
   * 根据 ID 查询生长记录
   * @param id 记录ID
   * @returns 生长记录对象，如果不存在则返回 null
   */
  findById(id: number): GrowthRecord | null {
    const row = this.database.prepare<[number], GrowthRecordRow>('SELECT * FROM growth_records WHERE id = ?').get(id)
    return row ? mapGrowthRecord(row) : null
  }

  /**
   * 创建生长记录
   * @param input 创建输入数据
   * @returns 创建的生长记录对象
   * @throws 如果创建失败则抛出错误
   */
  create(input: CreateGrowthRecordInput): GrowthRecord {
    const result = this.database
      .prepare(
        `INSERT INTO growth_records (
          planting_record_id,
          record_date,
          growth_stage,
          plant_height,
          leaf_count,
          leaf_color,
          disease_status,
          pest_status,
          soil_moisture,
          weather_temperature_avg,
          weather_rainfall,
          photo_paths,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        input.plantingRecordId,
        input.recordDate,
        input.growthStage,
        input.plantHeight ?? null,
        input.leafCount ?? null,
        input.leafColor ?? null,
        input.diseaseStatus ?? null,
        input.pestStatus ?? null,
        input.soilMoisture ?? null,
        input.weatherTemperatureAvg ?? null,
        input.weatherRainfall ?? null,
        input.photoPaths ?? null,
        input.notes ?? null
      )

    const created = this.findById(Number(result.lastInsertRowid))
    if (!created) {
      throw new Error('Failed to create growth record.')
    }

    return created
  }

  /**
   * 更新生长记录
   * @param input 更新输入数据
   * @returns 更新后的生长记录对象
   * @throws 如果记录不存在则抛出错误
   */
  update(input: UpdateGrowthRecordInput): GrowthRecord {
    this.database
      .prepare(
        `UPDATE growth_records SET
          planting_record_id = ?,
          record_date = ?,
          growth_stage = ?,
          plant_height = ?,
          leaf_count = ?,
          leaf_color = ?,
          disease_status = ?,
          pest_status = ?,
          soil_moisture = ?,
          weather_temperature_avg = ?,
          weather_rainfall = ?,
          photo_paths = ?,
          notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`
      )
      .run(
        input.plantingRecordId,
        input.recordDate,
        input.growthStage,
        input.plantHeight ?? null,
        input.leafCount ?? null,
        input.leafColor ?? null,
        input.diseaseStatus ?? null,
        input.pestStatus ?? null,
        input.soilMoisture ?? null,
        input.weatherTemperatureAvg ?? null,
        input.weatherRainfall ?? null,
        input.photoPaths ?? null,
        input.notes ?? null,
        input.id
      )

    const updated = this.findById(input.id)
    if (!updated) {
      throw new Error(`Growth record ${input.id} not found after update.`)
    }

    return updated
  }

  /**
   * 删除生长记录
   * @param id 记录ID
   */
  delete(id: number): void {
    this.database.prepare('DELETE FROM growth_records WHERE id = ?').run(id)
  }
}
