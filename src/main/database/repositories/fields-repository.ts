import Database from 'better-sqlite3'
import type { Field } from '../../../shared/types/database'
import { BaseRepository } from './base-repository'

interface FieldRow {
  id: number
  name: string
  area: number
  location_province: string | null
  location_city: string | null
  location_county: string | null
  location_detail: string | null
  coordinates: string | null
  soil_type: string | null
  soil_ph: number | null
  soil_organic_matter: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CreateFieldInput {
  name: string
  area: number
  locationProvince?: string | null
  locationCity?: string | null
  locationCounty?: string | null
  locationDetail?: string | null
  coordinates?: string | null
  soilType?: string | null
  soilPh?: number | null
  soilOrganicMatter?: number | null
  notes?: string | null
}

export interface UpdateFieldInput extends CreateFieldInput {
  id: number
}

function mapField(row: FieldRow): Field {
  return {
    id: row.id,
    name: row.name,
    area: row.area,
    locationProvince: row.location_province,
    locationCity: row.location_city,
    locationCounty: row.location_county,
    locationDetail: row.location_detail,
    coordinates: row.coordinates,
    soilType: row.soil_type,
    soilPh: row.soil_ph,
    soilOrganicMatter: row.soil_organic_matter,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export class FieldsRepository extends BaseRepository {
  constructor(database: Database.Database) {
    super(database)
  }

  findAll(): Field[] {
    const rows = this.database
      .prepare<[], FieldRow>('SELECT * FROM fields ORDER BY updated_at DESC, id DESC')
      .all()

    return rows.map(mapField)
  }

  findById(id: number): Field | null {
    const row = this.database.prepare<[number], FieldRow>('SELECT * FROM fields WHERE id = ?').get(id)
    return row ? mapField(row) : null
  }

  create(input: CreateFieldInput): Field {
    const result = this.database
      .prepare(
        `INSERT INTO fields (
          name,
          area,
          location_province,
          location_city,
          location_county,
          location_detail,
          coordinates,
          soil_type,
          soil_ph,
          soil_organic_matter,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        input.name,
        input.area,
        input.locationProvince ?? null,
        input.locationCity ?? null,
        input.locationCounty ?? null,
        input.locationDetail ?? null,
        input.coordinates ?? null,
        input.soilType ?? null,
        input.soilPh ?? null,
        input.soilOrganicMatter ?? null,
        input.notes ?? null
      )

    const created = this.findById(Number(result.lastInsertRowid))
    if (!created) {
      throw new Error('Failed to create field.')
    }

    return created
  }

  update(input: UpdateFieldInput): Field {
    this.database
      .prepare(
        `UPDATE fields SET
          name = ?,
          area = ?,
          location_province = ?,
          location_city = ?,
          location_county = ?,
          location_detail = ?,
          coordinates = ?,
          soil_type = ?,
          soil_ph = ?,
          soil_organic_matter = ?,
          notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`
      )
      .run(
        input.name,
        input.area,
        input.locationProvince ?? null,
        input.locationCity ?? null,
        input.locationCounty ?? null,
        input.locationDetail ?? null,
        input.coordinates ?? null,
        input.soilType ?? null,
        input.soilPh ?? null,
        input.soilOrganicMatter ?? null,
        input.notes ?? null,
        input.id
      )

    const updated = this.findById(input.id)
    if (!updated) {
      throw new Error(`Field ${input.id} not found after update.`)
    }

    return updated
  }

  delete(id: number): void {
    this.database.prepare('DELETE FROM fields WHERE id = ?').run(id)
  }
}
