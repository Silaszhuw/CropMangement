/** 应用设置数据访问层：提供应用设置的 CRUD 操作 */
import Database from 'better-sqlite3'
import type { AppSetting } from '../../../shared/types/database'
import { BaseRepository } from './base-repository'

interface AppSettingRow {
  id: number
  config_key: string
  config_value: string
  description: string | null
  updated_at: string
}

export interface CreateAppSettingInput {
  configKey: string
  configValue: string
  description?: string | null
}

export interface UpdateAppSettingInput extends CreateAppSettingInput {
  id: number
}

function mapAppSetting(row: AppSettingRow): AppSetting {
  return {
    id: row.id,
    configKey: row.config_key,
    configValue: row.config_value,
    description: row.description,
    updatedAt: row.updated_at
  }
}

export class AppSettingsRepository extends BaseRepository {
  constructor(database: Database.Database) {
    super(database)
  }

  /**
   * 查询所有应用设置
   * @returns 应用设置列表，按更新时间降序、ID 降序排列
   */
  findAll(): AppSetting[] {
    const rows = this.database
      .prepare<[], AppSettingRow>('SELECT * FROM app_settings ORDER BY updated_at DESC, id DESC')
      .all()

    return rows.map(mapAppSetting)
  }

  /**
   * 根据 ID 查询应用设置
   * @param id 记录ID
   * @returns 应用设置对象，如果不存在则返回 null
   */
  findById(id: number): AppSetting | null {
    const row = this.database.prepare<[number], AppSettingRow>('SELECT * FROM app_settings WHERE id = ?').get(id)
    return row ? mapAppSetting(row) : null
  }

  /**
   * 创建应用设置
   * @param input 创建输入数据
   * @returns 创建的应用设置对象
   * @throws 如果创建失败则抛出错误
   */
  create(input: CreateAppSettingInput): AppSetting {
    const result = this.database
      .prepare(
        `INSERT INTO app_settings (
          config_key,
          config_value,
          description
        ) VALUES (?, ?, ?)`
      )
      .run(input.configKey, input.configValue, input.description ?? null)

    const created = this.findById(Number(result.lastInsertRowid))
    if (!created) {
      throw new Error('Failed to create app setting.')
    }

    return created
  }

  /**
   * 更新应用设置
   * @param input 更新输入数据
   * @returns 更新后的应用设置对象
   * @throws 如果记录不存在则抛出错误
   */
  update(input: UpdateAppSettingInput): AppSetting {
    this.database
      .prepare(
        `UPDATE app_settings SET
          config_key = ?,
          config_value = ?,
          description = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`
      )
      .run(input.configKey, input.configValue, input.description ?? null, input.id)

    const updated = this.findById(input.id)
    if (!updated) {
      throw new Error(`App setting ${input.id} not found after update.`)
    }

    return updated
  }

  /**
   * 删除应用设置
   * @param id 记录ID
   */
  delete(id: number): void {
    this.database.prepare('DELETE FROM app_settings WHERE id = ?').run(id)
  }
}
