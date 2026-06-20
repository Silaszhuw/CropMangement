/** 作物品种数据访问层：提供作物品种的 CRUD 操作 */
import Database from 'better-sqlite3'
import type { CropVariety } from '../../../shared/types/database'
import { BaseRepository } from './base-repository'

interface CropVarietyRow {
  id: number
  name: string
  code: string | null
  type: string
  growth_period: number | null
  yield_potential: number | null
  disease_resistance: string | null
  description: string | null
  is_active: number
  created_at: string
  updated_at: string
}

export interface CreateCropVarietyInput {
  name: string
  code?: string | null
  type: string
  growthPeriod?: number | null
  yieldPotential?: number | null
  diseaseResistance?: string | null
  description?: string | null
  isActive?: boolean
}

export interface UpdateCropVarietyInput extends CreateCropVarietyInput {
  id: number
}

function mapCropVariety(row: CropVarietyRow): CropVariety {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    type: row.type,
    growthPeriod: row.growth_period,
    yieldPotential: row.yield_potential,
    diseaseResistance: row.disease_resistance,
    description: row.description,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export class CropVarietiesRepository extends BaseRepository {
  constructor(database: Database.Database) {
    super(database)
  }

  /**
   * 查询所有作物品种记录
   * @returns 作物品种实体数组，按更新时间和 ID 倒序排列
   */
  findAll(): CropVariety[] {
    const rows = this.database
      .prepare<[], CropVarietyRow>('SELECT * FROM crop_varieties ORDER BY updated_at DESC, id DESC')
      .all()

    return rows.map(mapCropVariety)
  }

  /**
   * 根据 ID 查询作物品种记录
   * @param id 记录ID
   * @returns 作物品种实体，如果不存在则返回 null
   */
  findById(id: number): CropVariety | null {
    const row = this.database
      .prepare<[number], CropVarietyRow>('SELECT * FROM crop_varieties WHERE id = ?')
      .get(id)

    return row ? mapCropVariety(row) : null
  }

  /**
   * 创建作物品种记录
   * @param input 创建输入数据，isActive 默认为 true
   * @returns 新创建的作物品种实体
   * @throws 如果创建失败则抛出错误
   */
  create(input: CreateCropVarietyInput): CropVariety {
    const result = this.database
      .prepare(
        `INSERT INTO crop_varieties (
          name,
          code,
          type,
          growth_period,
          yield_potential,
          disease_resistance,
          description,
          is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        input.name,
        input.code ?? null,
        input.type,
        input.growthPeriod ?? null,
        input.yieldPotential ?? null,
        input.diseaseResistance ?? null,
        input.description ?? null,
        input.isActive === false ? 0 : 1
      )

    const created = this.findById(Number(result.lastInsertRowid))
    if (!created) {
      throw new Error('Failed to create crop variety.')
    }

    return created
  }

  /**
   * 更新作物品种记录
   * @param input 更新输入数据
   * @returns 更新后的作物品种实体
   * @throws 如果更新后未找到记录则抛出错误
   */
  update(input: UpdateCropVarietyInput): CropVariety {
    this.database
      .prepare(
        `UPDATE crop_varieties SET
          name = ?,
          code = ?,
          type = ?,
          growth_period = ?,
          yield_potential = ?,
          disease_resistance = ?,
          description = ?,
          is_active = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`
      )
      .run(
        input.name,
        input.code ?? null,
        input.type,
        input.growthPeriod ?? null,
        input.yieldPotential ?? null,
        input.diseaseResistance ?? null,
        input.description ?? null,
        input.isActive === false ? 0 : 1,
        input.id
      )

    const updated = this.findById(input.id)
    if (!updated) {
      throw new Error(`Crop variety ${input.id} not found after update.`)
    }

    return updated
  }

  /**
   * 删除作物品种记录
   * @param id 记录ID
   */
  delete(id: number): void {
    this.database.prepare('DELETE FROM crop_varieties WHERE id = ?').run(id)
  }
}
