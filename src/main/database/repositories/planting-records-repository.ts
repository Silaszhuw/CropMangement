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

  findAll(): PlantingRecord[] {
    const rows = this.database
      .prepare<[], PlantingRecordRow>('SELECT * FROM planting_records ORDER BY updated_at DESC, id DESC')
      .all()

    return rows.map(mapPlantingRecord)
  }

  findById(id: number): PlantingRecord | null {
    const row = this.database
      .prepare<[number], PlantingRecordRow>('SELECT * FROM planting_records WHERE id = ?')
      .get(id)

    return row ? mapPlantingRecord(row) : null
  }

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

  delete(id: number): void {
    this.database.prepare('DELETE FROM planting_records WHERE id = ?').run(id)
  }
}
