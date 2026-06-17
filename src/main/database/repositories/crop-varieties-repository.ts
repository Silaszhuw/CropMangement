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

  findAll(): CropVariety[] {
    const rows = this.database
      .prepare<[], CropVarietyRow>('SELECT * FROM crop_varieties ORDER BY updated_at DESC, id DESC')
      .all()

    return rows.map(mapCropVariety)
  }

  findById(id: number): CropVariety | null {
    const row = this.database
      .prepare<[number], CropVarietyRow>('SELECT * FROM crop_varieties WHERE id = ?')
      .get(id)

    return row ? mapCropVariety(row) : null
  }

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

  delete(id: number): void {
    this.database.prepare('DELETE FROM crop_varieties WHERE id = ?').run(id)
  }
}
